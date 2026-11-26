"""Check that every AWS capability the project depends on works in this account.

Run from the project folder:  python scripts/preflight.py

Each check prints PASS or FAIL with the error, so a missing model grant or account
restriction shows up now and not in the middle of M5.
"""

import json
import sys
from collections.abc import Callable
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError

from doc_knowledge_platform.config import get_settings

ROOT = Path(__file__).resolve().parent.parent
SCAN = ROOT / "eval" / "corpus" / "finance" / "expense-form-scan.pdf"

settings = get_settings()
REGION = settings.aws_default_region


def check_embeddings() -> str:
    """Embed a sentence with Titan Text Embeddings V2 and verify the dimension."""
    client = boto3.client("bedrock-runtime", region_name=REGION)
    response = client.invoke_model(
        modelId=settings.embedding_model_id,
        body=json.dumps(
            {"inputText": "parental leave", "dimensions": settings.embedding_dimensions, "normalize": True}
        ),
    )
    vector = json.loads(response["body"].read())["embedding"]
    assert len(vector) == settings.embedding_dimensions, f"got {len(vector)} dimensions"
    return f"{len(vector)} dimensions"


def check_generation(model_id: str) -> str:
    """Call a generation model through the Converse API."""
    client = boto3.client("bedrock-runtime", region_name=REGION)
    response = client.converse(
        modelId=model_id,
        messages=[{"role": "user", "content": [{"text": "Reply with the single word: ready"}]}],
        inferenceConfig={"maxTokens": 20, "temperature": 0},
    )
    usage = response["usage"]
    return f"in={usage['inputTokens']} out={usage['outputTokens']} tokens"


def check_textract() -> str:
    """Run Textract on the generated scan and confirm it reads the mileage rate."""
    client = boto3.client("textract", region_name=REGION)
    response = client.detect_document_text(Document={"Bytes": SCAN.read_bytes()})
    lines = [b["Text"] for b in response["Blocks"] if b["BlockType"] == "LINE"]
    assert any("0.96" in line for line in lines), f"mileage rate not found in {lines[:5]}"
    return f"{len(lines)} lines read, mileage rate found"


def check_comprehend() -> str:
    """Detect PII in a sample sentence. Failure means M5 uses the regex + Bedrock fallback."""
    client = boto3.client("comprehend", region_name=REGION)
    response = client.detect_pii_entities(
        Text="Contact Jane Doe on 0412 345 678 or jane@example.com.", LanguageCode="en"
    )
    return f"{len(response['Entities'])} entities found"


def check_rerank() -> str:
    """Rerank two passages in RERANK_REGION. The Region differs from the rest of the project."""
    client = boto3.client("bedrock-agent-runtime", region_name=settings.rerank_region)
    model_arn = f"arn:aws:bedrock:{settings.rerank_region}::foundation-model/{settings.rerank_model_id}"
    passages = ["Employees get 16 weeks of parental leave.", "The cafeteria opens at 8am."]
    response = client.rerank(
        queries=[{"type": "TEXT", "textQuery": {"text": "parental leave"}}],
        sources=[
            {"type": "INLINE", "inlineDocumentSource": {"type": "TEXT", "textDocument": {"text": p}}}
            for p in passages
        ],
        rerankingConfiguration={
            "type": "BEDROCK_RERANKING_MODEL",
            "bedrockRerankingConfiguration": {
                "modelConfiguration": {"modelArn": model_arn},
                "numberOfResults": 2,
            },
        },
    )
    best = response["results"][0]["index"]
    assert best == 0, f"expected passage 0 first, got {best}"
    return f"{settings.rerank_region}: relevant passage ranked first"


def check_s3vectors() -> str:
    """List vector buckets to confirm the S3 Vectors API is reachable."""
    client = boto3.client("s3vectors", region_name=REGION)
    buckets = client.list_vector_buckets().get("vectorBuckets", [])
    return f"{len(buckets)} vector buckets"


CHECKS: list[tuple[str, Callable[[], str], bool]] = [
    # (name, function, required). Comprehend is optional because M5 has a regex + Bedrock fallback.
    (f"Embeddings ({settings.embedding_model_id})", check_embeddings, True),
    (f"Generation ({settings.generation_model_id})", lambda: check_generation(settings.generation_model_id), True),
    (f"Rewrite ({settings.rewrite_model_id})", lambda: check_generation(settings.rewrite_model_id), True),
    ("Textract on a scan", check_textract, True),
    ("S3 Vectors API", check_s3vectors, True),
    (f"Rerank ({settings.rerank_region})", check_rerank, True),
    ("Comprehend PII", check_comprehend, False),
]


def main() -> None:
    """Run all checks and exit non-zero if a required one fails."""
    failed_required = False
    for name, func, required in CHECKS:
        try:
            print(f"PASS  {name}: {func()}")
        except (ClientError, BotoCoreError, AssertionError) as error:
            label = "FAIL" if required else "WARN"
            print(f"{label}  {name}: {error}")
            failed_required |= required
    sys.exit(1 if failed_required else 0)


if __name__ == "__main__":
    main()
