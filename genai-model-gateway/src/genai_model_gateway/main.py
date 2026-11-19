import json
import logging

from fastapi import BackgroundTasks, FastAPI, Response

from . import metrics
from .bedrock import invoke
from .models import GenerateRequest, GenerateResponse

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="GenAI Model Gateway", version="0.1.0")


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/v1/generate", response_model=GenerateResponse)
def generate(
    request: GenerateRequest, response: Response, background_tasks: BackgroundTasks
) -> GenerateResponse:
    result = invoke(request)
    if result.degraded:
        response.status_code = 503
    logger.info(
        json.dumps({
            "event": "generate",
            "task": request.task,
            "model": result.model,
            "input_tokens": result.input_tokens,
            "output_tokens": result.output_tokens,
            "latency_ms": result.latency_ms,
            "fallback_used": result.fallback_used,
            "degraded": result.degraded,
        })
    )
    background_tasks.add_task(
        metrics.emit,
        task=request.task,
        model=result.model,
        input_tokens=result.input_tokens,
        output_tokens=result.output_tokens,
        latency_ms=result.latency_ms,
        fallback_used=result.fallback_used,
        degraded=result.degraded,
    )
    return result
