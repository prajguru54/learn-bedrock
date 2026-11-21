# Design Note: GenAI Model Gateway

**Date:** 2026-11-16  
**Status:** Draft  
**Exam skill:** 1.1.1 — Architecture from requirements

---

## 1. Problem Statement

Three internal tools — a **ticket summarizer**, an **email drafter**, and a **FAQ bot** — each call Amazon Bedrock directly with hard-coded model IDs. This creates three recurring problems:

| Problem | Impact |
|---|---|
| Monday morning throttling causes 503s in the ticket summarizer | Users see errors; retries are uncoordinated across tools |
| Switching to a cheaper or better model requires code changes in three repositories | High deployment cost for every model refresh |
| Finance sees one Bedrock bill with no attribution | Cannot answer "which tool cost the most last week?" |

**Goal:** One internal HTTP service all three tools call. The gateway owns model selection, retries, fallback, and usage attribution — no tool needs to know what model is in use.

---

## 2. Tasks the Gateway Serves

| Task key | Caller | Description | Latency sensitivity | Token budget |
|---|---|---|---|---|
| `summarize` | Ticket summarizer | Compress a support ticket (≤ 2 000 tokens) into a 3-sentence summary | High — inline in a UI | ≤ 512 output tokens |
| `draft` | Email drafter | Write a reply email from a brief instruction | Medium — triggered async | ≤ 1 024 output tokens |
| `answer` | FAQ bot | Answer a user question from a retrieved context chunk | High — inline in a chat widget | ≤ 512 output tokens |

Each task has different latency and cost profiles, which justifies independent routing config rather than one global model setting.

---

## 3. Measurable Targets

| Target | Value | Rationale |
|---|---|---|
| **p95 end-to-end latency** (gateway → Bedrock → caller) | ≤ 2 000 ms for `summarize` and `answer`; ≤ 5 000 ms for `draft` | Inline tasks must feel instant; async draft has more slack |
| **Max cost per request** | ≤ $0.002 for summarize/answer; ≤ $0.005 for draft | Derived from token budgets and Haiku/Nova pricing at current rates |
| **Availability** | ≥ 99.5 % measured over a rolling 7-day window | Covers planned maintenance; fallback models contribute to this |
| **Fallback rate** | ≤ 10 % of requests over any 5-minute window | A higher rate signals a primary-model problem worth alerting on |
| **Degraded (all models failed) rate** | ≤ 0.5 % | The floor below which callers receive a structured error |

Targets are measured by the gateway itself via CloudWatch custom metrics and confirmed by monthly review against Cost Explorer.

---

## 4. Integration Pattern: Synchronous HTTP Gateway

**Pattern chosen:** A single FastAPI service on ECS Fargate sitting in front of Bedrock. All three callers send `POST /v1/generate` with a `task` field; the gateway resolves the right model and returns the completion.

**Why synchronous HTTP and not:**

| Alternative | Why rejected |
|---|---|
| Each tool calls Bedrock directly | Cannot enforce a single retry strategy; no central fallback; attribution requires tagging every caller separately |
| Event-driven (SQS + Lambda) | Adds queue depth to every inline request; `summarize` and `answer` need a reply in < 2 s, not minutes |
| AWS Step Functions circuit breaker (batch pattern) | Appropriate for batch workflows; the exam names this for async jobs, not interactive latency budgets |
| API Gateway + Lambda (serverless) | Valid alternative and exam-equivalent — preferred when ECS/ALB is not available on the account plan. The gateway code is unchanged; Mangum wraps the FastAPI app |

**Integration pattern diagram:**

```
Caller (summarizer / drafter / FAQ bot)
    │  POST /v1/generate  { task, messages, max_tokens }
    ▼
Application Load Balancer
    ▼
FastAPI gateway  (ECS Fargate, 1+ tasks)
    ├── AppConfig           ← routing profile: task → { primary_model, fallbacks, maxTokens, temperature }
    ├── DynamoDB            ← circuit breaker state shared across all gateway containers
    ├── Bedrock Runtime     ← converse() call to primary model, then fallback(s) if needed
    └── CloudWatch          ← structured logs + custom metrics on every request
```

---

## 5. Decision: Gateway Service vs Direct Bedrock Calls

A gateway service is the right choice for this problem for three reasons:

**Single point of control**  
Retries, timeouts, fallback order, and circuit breaker logic are written once. If `ThrottlingException` handling needs to change, one deploy fixes all three tools — not three.

**Config-driven model switching**  
The task-to-model mapping lives in AWS AppConfig, not in application code. Swapping the primary model for `summarize` is an AppConfig deployment that takes effect within 30 seconds across all running containers, with no container rebuild and no coordination across repositories.

**Central cost attribution**  
Every Bedrock call goes through one place that knows the calling tool. The gateway passes the tool identity as `requestMetadata` and routes calls through per-tool application inference profiles tagged in Cost Explorer. Without the gateway, each tool team would need to tag its own calls consistently — an enforcement problem, not a convention.

---

## 6. What This Design Does Not Cover (yet)

- Response caching (leads into Domain 4 — identical prompts are not deduplicated today)
- Guardrails (leads into Domain 3 — safety is left to the individual models for now)
- Authentication of callers (the gateway trusts the internal network; mTLS or API key auth is a stretch goal)

These are intentionally deferred to keep Milestone 1 scope-tight. Each item maps to a later exam domain and will be introduced as a separate milestone.
