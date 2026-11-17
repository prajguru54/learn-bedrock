"""
Offline model comparison script — Milestone 3 (exam skill 1.2.1).

Runs every case in dataset.json against each candidate model, scores each
response with a judge model, then writes eval_results.md.

Usage:
    cd genai-model-gateway
    uv run python scripts/eval_runner.py
"""

import json
import statistics
import time
from dataclasses import asdict, dataclass
from pathlib import Path

import boto3
from botocore.config import Config

SCRIPT_DIR = Path(__file__).parent

CANDIDATE_MODELS = [
    "mistral.ministral-3-14b-instruct",
    "amazon.nova-micro-v1:0",
]

JUDGE_MODEL = "mistral.ministral-3-14b-instruct"

MAX_TOKENS = 512

# Approximate on-demand pricing (USD per 1M tokens).
# Verify current rates at: https://aws.amazon.com/bedrock/pricing/
_PRICE_PER_1M: dict[str, dict[str, float]] = {
    "mistral.ministral-3-3b-instruct": {"input": 0.04, "output": 0.04},
    "amazon.nova-micro-v1:0":          {"input": 0.035, "output": 0.14},
}

_client = boto3.client(
    "bedrock-runtime",
    config=Config(retries={"max_attempts": 3, "mode": "adaptive"}),
)


@dataclass
class RunResult:
    case_id: str
    task: str
    model: str
    latency_ms: float
    input_tokens: int
    output_tokens: int
    cost_usd: float
    quality_score: int
    response_preview: str


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

def _call_model(model_id: str, messages: list[dict], max_tokens: int) -> dict:
    converse_messages = [
        {"role": m["role"], "content": [{"text": m["content"]}]}
        for m in messages
    ]
    t0 = time.monotonic()
    response = _client.converse(
        modelId=model_id,
        messages=converse_messages,
        inferenceConfig={"maxTokens": max_tokens},
    )
    latency_ms = (time.monotonic() - t0) * 1000
    usage = response["usage"]
    return {
        "content": response["output"]["message"]["content"][0]["text"],
        "latency_ms": round(latency_ms, 1),
        "input_tokens": usage["inputTokens"],
        "output_tokens": usage["outputTokens"],
    }


def _judge_quality(task: str, user_input: str, model_response: str) -> int:
    prompt = (
        f"You are evaluating an AI response for quality.\n\n"
        f"Task type: {task}\n"
        f"User input (first 300 chars): {user_input[:300]}\n"
        f"Model response: {model_response[:500]}\n\n"
        f"Score the response 1–5 on accuracy, relevance, and conciseness:\n"
        f"1=Poor  2=Below average  3=Average  4=Good  5=Excellent\n\n"
        f"Reply with ONLY a single digit (1, 2, 3, 4, or 5)."
    )
    response = _client.converse(
        modelId=JUDGE_MODEL,
        messages=[{"role": "user", "content": [{"text": prompt}]}],
        inferenceConfig={"maxTokens": 10},
    )
    text = response["output"]["message"]["content"][0]["text"].strip()
    for char in text:
        if char in "12345":
            return int(char)
    return 3  # fallback if judge returns unexpected text


def _cost(model_id: str, in_tokens: int, out_tokens: int) -> float:
    prices = _PRICE_PER_1M.get(model_id, {"input": 0.1, "output": 0.1})
    return round(
        (in_tokens / 1_000_000) * prices["input"]
        + (out_tokens / 1_000_000) * prices["output"],
        6,
    )


def _percentile(values: list[float], p: int) -> float:
    if not values:
        return 0.0
    s = sorted(values)
    idx = max(0, int(len(s) * p / 100) - 1)
    return round(s[idx], 1)


# ---------------------------------------------------------------------------
# Main evaluation loop
# ---------------------------------------------------------------------------

def run_eval() -> None:
    dataset: list[dict] = json.loads((SCRIPT_DIR / "dataset.json").read_text())
    results: list[RunResult] = []

    total = len(dataset) * len(CANDIDATE_MODELS)
    done = 0

    for case in dataset:
        messages = case["messages"]
        user_text = messages[0]["content"]

        for model_id in CANDIDATE_MODELS:
            done += 1
            print(f"[{done}/{total}] {case['id']} × {model_id} ...", end=" ", flush=True)

            call = _call_model(model_id, messages, MAX_TOKENS)
            score = _judge_quality(case["task"], user_text, call["content"])
            cost = _cost(model_id, call["input_tokens"], call["output_tokens"])

            results.append(
                RunResult(
                    case_id=case["id"],
                    task=case["task"],
                    model=model_id,
                    latency_ms=call["latency_ms"],
                    input_tokens=call["input_tokens"],
                    output_tokens=call["output_tokens"],
                    cost_usd=cost,
                    quality_score=score,
                    response_preview=call["content"][:120].replace("\n", " "),
                )
            )
            print(f"score={score}  latency={call['latency_ms']}ms")

    raw_path = SCRIPT_DIR / "eval_results_raw.json"
    raw_path.write_text(json.dumps([asdict(r) for r in results], indent=2))
    print(f"\nRaw results → {raw_path}")

    _write_report(results)


def _write_report(results: list[RunResult]) -> None:
    tasks = ["summarize", "draft", "answer"]

    lines = [
        "# Eval Results — Model Comparison",
        "",
        f"Dataset: 5 cases × 3 tasks = 15 cases | "
        f"Candidates: {len(CANDIDATE_MODELS)} | Max tokens: {MAX_TOKENS}",
        f"Judge: `{JUDGE_MODEL}`",
        "",
    ]

    for task in tasks:
        lines += [f"## Task: `{task}`", ""]
        lines += [
            "| Model | Avg Quality (1–5) | p50 Latency (ms) | p95 Latency (ms) | Avg Cost/req ($) |",
            "|---|---|---|---|---|",
        ]

        for model_id in CANDIDATE_MODELS:
            subset = [r for r in results if r.task == task and r.model == model_id]
            if not subset:
                continue
            latencies = [r.latency_ms for r in subset]
            lines.append(
                f"| `{model_id}` "
                f"| {statistics.mean(r.quality_score for r in subset):.1f} "
                f"| {_percentile(latencies, 50)} "
                f"| {_percentile(latencies, 95)} "
                f"| {statistics.mean(r.cost_usd for r in subset):.6f} |"
            )
        lines.append("")

    lines += [
        "## Recommendation",
        "",
        "<!-- Fill in after reviewing the table above. Example: -->",
        "<!-- `summarize` → model X (best quality/cost balance) -->",
        "<!-- `draft` → model Y (acceptable quality, lowest cost) -->",
        "<!-- `answer` → model Z (highest quality, latency within target) -->",
        "",
        "## Notes",
        "",
        "- Quality scored 1–5 by judge model (higher is better)",
        "- p95 from 5 samples is indicative only; run 50+ cases for a production-grade p95",
        f"- Cost is approximate — verify at https://aws.amazon.com/bedrock/pricing/",
        "- Raw per-case results are in `eval_results_raw.json`",
        "",
    ]

    report_path = SCRIPT_DIR / "eval_results.md"
    report_path.write_text("\n".join(lines))
    print(f"Report → {report_path}")


if __name__ == "__main__":
    run_eval()
