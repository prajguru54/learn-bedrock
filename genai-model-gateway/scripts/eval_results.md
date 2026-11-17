# Eval Results — Model Comparison

Dataset: 5 cases × 3 tasks = 15 cases | Candidates: 2 | Max tokens: 512
Judge: `mistral.ministral-3-14b-instruct`

## Task: `summarize`

| Model | Avg Quality (1–5) | p50 Latency (ms) | p95 Latency (ms) | Avg Cost/req ($) |
|---|---|---|---|---|
| `mistral.ministral-3-14b-instruct` | 5.0 | 950.3 | 1049.0 | 0.000025 |
| `amazon.nova-micro-v1:0` | 4.7 | 673.0 | 710.1 | 0.000015 |

## Task: `draft`

| Model | Avg Quality (1–5) | p50 Latency (ms) | p95 Latency (ms) | Avg Cost/req ($) |
|---|---|---|---|---|
| `mistral.ministral-3-14b-instruct` | 4.0 | 2052.6 | 2643.1 | 0.000043 |
| `amazon.nova-micro-v1:0` | 3.7 | 864.0 | 1185.9 | 0.000039 |

## Task: `answer`

| Model | Avg Quality (1–5) | p50 Latency (ms) | p95 Latency (ms) | Avg Cost/req ($) |
|---|---|---|---|---|
| `mistral.ministral-3-14b-instruct` | 4.0 | 1244.0 | 1254.0 | 0.000025 |
| `amazon.nova-micro-v1:0` | 4.3 | 716.2 | 767.6 | 0.000022 |

## Recommendation

<!-- Fill in after reviewing the table above. Example: -->
<!-- `summarize` → model X (best quality/cost balance) -->
<!-- `draft` → model Y (acceptable quality, lowest cost) -->
<!-- `answer` → model Z (highest quality, latency within target) -->

## Notes

- Quality scored 1–5 by judge model (higher is better)
- p95 from 5 samples is indicative only; run 50+ cases for a production-grade p95
- Cost is approximate — verify at https://aws.amazon.com/bedrock/pricing/
- Raw per-case results are in `eval_results_raw.json`
