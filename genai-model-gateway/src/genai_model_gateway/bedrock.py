import time
import boto3
from botocore.config import Config

from .config import get_task_config
from .models import GenerateRequest, GenerateResponse

_client = boto3.client(
    "bedrock-runtime",
    config=Config(retries={"max_attempts": 3, "mode": "adaptive"}),
)


def invoke(request: GenerateRequest) -> GenerateResponse:
    cfg = get_task_config(request.task)
    max_tokens = request.max_tokens if request.max_tokens is not None else cfg.max_tokens

    messages = [
        {"role": m.role, "content": [{"text": m.content}]} for m in request.messages
    ]

    t0 = time.monotonic()
    response = _client.converse(
        modelId=cfg.model,
        messages=messages,
        inferenceConfig={
            "maxTokens": max_tokens,
            "temperature": cfg.temperature,
        },
    )
    latency_ms = (time.monotonic() - t0) * 1000

    content = response["output"]["message"]["content"][0]["text"]
    usage = response["usage"]

    return GenerateResponse(
        model=cfg.model,
        content=content,
        input_tokens=usage["inputTokens"],
        output_tokens=usage["outputTokens"],
        latency_ms=round(latency_ms, 1),
    )
