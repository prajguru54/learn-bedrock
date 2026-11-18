import logging
import time

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, ReadTimeoutError

from . import breaker
from .config import get_task_config
from .models import GenerateRequest, GenerateResponse

logger = logging.getLogger(__name__)

_client = boto3.client(
    "bedrock-runtime",
    config=Config(
        retries={"max_attempts": 3, "mode": "adaptive"},
        read_timeout=10,
        connect_timeout=5,
    ),
)


def _call_model(
    model_id: str, messages: list, max_tokens: int, temperature: float
) -> dict:
    return _client.converse(
        modelId=model_id,
        messages=messages,
        inferenceConfig={"maxTokens": max_tokens, "temperature": temperature},
    )


def invoke(request: GenerateRequest) -> GenerateResponse:
    cfg = get_task_config(request.task)
    max_tokens = request.max_tokens if request.max_tokens is not None else cfg.max_tokens
    messages = [
        {"role": m.role, "content": [{"text": m.content}]} for m in request.messages
    ]

    for idx, model_id in enumerate([cfg.model] + cfg.fallbacks):
        # Fail-open: if DynamoDB is down, allow the call rather than blocking everything.
        try:
            if not breaker.is_allowed(model_id):
                continue
        except Exception:
            logger.warning("breaker.is_allowed failed for %s — allowing call", model_id)

        t0 = time.monotonic()
        try:
            response = _call_model(model_id, messages, max_tokens, cfg.temperature)
            latency_ms = (time.monotonic() - t0) * 1000
        except (ClientError, ReadTimeoutError):
            # Bedrock call failed — record and try next model.
            try:
                breaker.record_failure(model_id)
            except Exception:
                logger.warning("breaker.record_failure failed for %s", model_id)
            continue

        # Only reached when Bedrock call succeeded — outside the except scope.
        try:
            breaker.record_success(model_id)
        except Exception:
            logger.warning("breaker.record_success failed for %s", model_id)

        content = response["output"]["message"]["content"][0]["text"]
        usage = response["usage"]
        return GenerateResponse(
            model=model_id,
            content=content,
            input_tokens=usage["inputTokens"],
            output_tokens=usage["outputTokens"],
            latency_ms=round(latency_ms, 1),
            fallback_used=(idx > 0),
            degraded=False,
        )

    return GenerateResponse(
        model="none",
        content="",
        input_tokens=0,
        output_tokens=0,
        latency_ms=0.0,
        degraded=True,
    )
