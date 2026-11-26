# doc-knowledge-platform

Multimodal document knowledge platform on AWS (Project 2 of the AIP-C01 learning repo). Files land in S3, get validated, extracted, chunked, embedded and indexed. A FastAPI service answers questions with citations and enforces department-level access.

Plan: [`../.claude/plans/project2-doc-knowledge-platform.md`](../.claude/plans/project2-doc-knowledge-platform.md)
Design note: [`docs/design-note.md`](docs/design-note.md)

Status: **M1 done** (corpus, golden set, design note, preflight). Next: M2.

## Setup

```bash
cd doc-knowledge-platform
uv sync
source .venv/bin/activate
cp .env.example .env      # then adjust model IDs if needed
```

Needs AWS credentials for `ap-southeast-2` (the same account used for Project 1).

## M1 commands

```bash
# 1. Build the synthetic corpus and the golden question set (same content every run; the scan PDFs differ byte-wise only by a creation timestamp)
python scripts/generate_corpus.py

# 2. Check Bedrock, Textract, S3 Vectors, Comprehend and Rerank access
python scripts/preflight.py
```

Outputs:

| Path | Content |
|---|---|
| `eval/corpus/` | 30 documents plus `_bad/` (git-ignored, regenerate any time) |
| `eval/corpus_updates/hr/leave-policy.pdf` | Version 2 for the M6 freshness test (git-ignored) |
| `eval/golden_questions.json` | 40 questions with expected document and page, row or section |
| `eval/freshness_check.json` | Before/after answers for the leave-policy replacement |

## Layout

See the plan for the full layout. Currently present: `src/doc_knowledge_platform/config.py`, `scripts/`, `eval/`, `docs/`.
