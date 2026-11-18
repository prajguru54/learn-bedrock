from typing import Literal
from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class GenerateRequest(BaseModel):
    task: Literal["summarize", "draft", "answer"]
    messages: list[Message]
    max_tokens: int | None = None  # optional — config provides per-task default


class GenerateResponse(BaseModel):
    model: str  # which model actually served the request
    content: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    degraded: bool = False  # True when every model in the list failed
