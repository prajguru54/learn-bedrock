import os
import time

import boto3
from botocore.exceptions import ClientError

_TABLE_NAME = os.environ.get("BREAKER_TABLE", "model-gateway-breaker")
_FAILURE_THRESHOLD = int(os.environ.get("BREAKER_THRESHOLD", "2"))
_COOLDOWN_SECONDS = float(os.environ.get("BREAKER_COOLDOWN", "30"))
_TTL_SECONDS = 86400  # 24h — DynamoDB auto-deletes stale rows

_table = boto3.resource("dynamodb").Table(_TABLE_NAME)


def _get(model_id: str) -> dict:
    return _table.get_item(Key={"model_id": model_id}).get("Item", {})


def is_allowed(model_id: str) -> bool:
    """Return True if the breaker is closed (safe to call this model)."""
    item = _get(model_id)
    state = item.get("state", "closed")

    if state == "closed":
        return True

    if state == "open":
        opened_at = float(item.get("opened_at", 0))
        if time.time() - opened_at < _COOLDOWN_SECONDS:
            return False  # still cooling down
        # Cooldown elapsed — atomically claim the probe slot.
        # ConditionalCheckFailedException means another container already claimed it.
        try:
            _table.update_item(
                Key={"model_id": model_id},
                UpdateExpression="SET #s = :half, expires_at = :ttl",
                ConditionExpression="#s = :open",
                ExpressionAttributeNames={"#s": "state"},
                ExpressionAttributeValues={
                    ":half": "half_open",
                    ":open": "open",
                    ":ttl": int(time.time()) + _TTL_SECONDS,
                },
            )
            return True  # we own the probe
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
                return False  # another container claimed the probe
            raise

    # half_open: probe already in flight from another container
    return False


def record_success(model_id: str) -> None:
    """Reset to closed state after a successful call."""
    _table.put_item(Item={
        "model_id": model_id,
        "state": "closed",
        "failure_count": 0,
        "expires_at": int(time.time()) + _TTL_SECONDS,
    })


def record_failure(model_id: str) -> None:
    """Increment failure count; open the breaker if threshold is reached."""
    now = int(time.time())
    item = _get(model_id)
    state = item.get("state", "closed")

    if state == "open":
        # Bug 4 fix: already open — don't reset the cooldown clock.
        return

    if state == "half_open":
        # Probe failed — reopen with a fresh cool-down timer.
        _table.put_item(Item={
            "model_id": model_id,
            "state": "open",
            "failure_count": int(item.get("failure_count", 0)) + 1,
            "opened_at": now,
            "expires_at": now + _TTL_SECONDS,
        })
        return

    # Bug 3 fix: atomic increment so concurrent containers don't lose counts.
    response = _table.update_item(
        Key={"model_id": model_id},
        UpdateExpression="ADD failure_count :inc SET expires_at = :ttl",
        ExpressionAttributeValues={
            ":inc": 1,
            ":ttl": now + _TTL_SECONDS,
        },
        ReturnValues="ALL_NEW",
    )
    new_count = int(response["Attributes"].get("failure_count", 1))

    if new_count >= _FAILURE_THRESHOLD:
        # Conditionally open — only if still closed (another container may have beaten us).
        try:
            _table.update_item(
                Key={"model_id": model_id},
                UpdateExpression="SET #s = :open, opened_at = :now",
                ConditionExpression="attribute_not_exists(#s) OR #s = :closed",
                ExpressionAttributeNames={"#s": "state"},
                ExpressionAttributeValues={
                    ":open": "open",
                    ":closed": "closed",
                    ":now": now,
                },
            )
        except ClientError as exc:
            if exc.response["Error"]["Code"] != "ConditionalCheckFailedException":
                raise
