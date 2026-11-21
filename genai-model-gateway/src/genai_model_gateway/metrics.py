import logging

import boto3

logger = logging.getLogger(__name__)

_cloudwatch = boto3.client("cloudwatch")
_NAMESPACE = "GenAIGateway"


def emit(
    task: str,
    model: str,
    input_tokens: int,
    output_tokens: int,
    latency_ms: float,
    fallback_used: bool,
    degraded: bool,
) -> None:
    """Push per-request metrics to CloudWatch. Failures are logged and swallowed
    so a CloudWatch outage never takes down the gateway."""
    task_dim = [{"Name": "Task", "Value": task}]
    task_model_dim = [{"Name": "Task", "Value": task}, {"Name": "Model", "Value": model}]

    metric_data = [
        {"MetricName": "InputTokens",       "Dimensions": task_model_dim, "Value": input_tokens,  "Unit": "Count"},
        {"MetricName": "OutputTokens",      "Dimensions": task_model_dim, "Value": output_tokens, "Unit": "Count"},
        {"MetricName": "RequestLatencyMs",  "Dimensions": task_model_dim, "Value": latency_ms,    "Unit": "Milliseconds"},
        {"MetricName": "RequestCount",      "Dimensions": task_dim,       "Value": 1,             "Unit": "Count"},
    ]

    if fallback_used:
        metric_data.append({"MetricName": "FallbackInvoked",  "Dimensions": task_dim, "Value": 1, "Unit": "Count"})

    if degraded:
        metric_data.append({"MetricName": "DegradedResponse", "Dimensions": task_dim, "Value": 1, "Unit": "Count"})

    try:
        _cloudwatch.put_metric_data(Namespace=_NAMESPACE, MetricData=metric_data)
    except Exception:
        logger.warning("Failed to emit CloudWatch metrics", exc_info=True)
