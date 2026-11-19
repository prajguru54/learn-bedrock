# Plan: Project 1 — genai-model-gateway

**Status:** M1–M6 complete  
**Study guide source:** `docs/aip-c01-domain1-study-guide.html` → "Project 1: A resilient model gateway"  
**Build after:** Chapters 1 and 2 (Tasks 1.1 and 1.2)

---

## Problem statement

Three internal tools (ticket summarizer, email drafter, FAQ bot) each call Bedrock directly with hard-coded model IDs. This causes three recurring problems:

- Monday morning throttling causes errors in the ticket summarizer
- Switching to a cheaper model requires code changes and deployments across three repositories
- Finance sees one Bedrock bill and cannot attribute cost per tool or feature

**Goal:** Build one internal HTTP service all three tools call. The gateway decides which model serves each task, retries or falls back on failure, and records usage per tool.

---

## Exam skills practiced

| Skill | Description |
|---|---|
| 1.1.1 | Architecture from requirements |
| 1.1.2 | Proof of concept |
| 1.1.3 | Standardized components |
| 1.2.1 | Model selection with evidence |
| 1.2.2 | Switch models without code changes |
| 1.2.3 | Resilience: retries, fallback, circuit breaker |

---

## Architecture

### Request path (online)

```
Client apps (summarizer, drafter, FAQ bot)
    │
    ▼
Application Load Balancer
    │
    ▼
FastAPI gateway on ECS Fargate
    ├─── AWS AppConfig              ← routing profile (task → model list + settings)
    ├─── DynamoDB                   ← circuit breaker state (shared across containers)
    ├─── Bedrock Runtime            ← Converse API
    │       ├─ Primary model
    │       └─ Fallback model(s)
    ├─── Application inference profiles ← per-tool cost tags
    └─── CloudWatch                 ← structured logs, custom metrics, dashboard, alarms
```

### Eval path (offline, one-time per model selection decision)

```
Golden dataset in S3 (50–100 cases per task)
    │
    ▼
eval_runner.py script
    ├─ Candidate model 1
    ├─ Candidate model 2
    └─ Candidate model 3
         │
         ▼
    Judge model (scores answers)
         │
         ▼
    Report: quality score, p50/p95 latency, cost/request
         │
         ▼
    Update AppConfig routing profile  ← this closes the loop for skill 1.2.2
```

---

## Repo layout (follows AGENTS.md conventions)

```
genai-model-gateway/
├── pyproject.toml          ← uv-managed, isolated from other projects
├── uv.lock
├── .python-version
├── .venv/
├── src/
│   └── genai_model_gateway/
│       ├── __init__.py
│       ├── main.py         ← FastAPI app entry point
│       ├── router.py       ← task routing logic
│       ├── bedrock.py      ← Converse API wrapper
│       ├── config.py       ← AppConfig client + cache
│       ├── breaker.py      ← circuit breaker (DynamoDB-backed)
│       ├── metrics.py      ← CloudWatch custom metrics
│       └── models.py       ← Pydantic request/response schemas
├── tests/
│   ├── test_router.py
│   ├── test_breaker.py
│   └── test_bedrock.py     ← tests with faked throttled model
├── scripts/
│   └── eval_runner.py      ← offline model comparison script
├── infra/
│   └── (Terraform or CDK)  ← ECS service, ALB, AppConfig, DynamoDB, alarms
├── Dockerfile
└── README.md
```

---

## Tech stack

| Piece | Choice | Why |
|---|---|---|
| API layer | FastAPI + ECS Fargate + ALB | Developer's existing stack; exam equivalent is Lambda + API Gateway |
| Model calls | Boto3 `bedrock-runtime`, `converse` / `converse_stream` | One request shape for all models — switching needs no code change |
| Routing config | AWS AppConfig, JSON profile + JSON Schema validator | Versioned, validated, gradual rollout, automatic rollback on alarm |
| Resilience | Boto3 retry config, fallback list, DynamoDB circuit breaker | Shared breaker state keeps multiple container copies consistent |
| Cost attribution | Application inference profiles with tags + `requestMetadata` | Splits spend by tool in Cost Explorer and logs |
| Observability | CloudWatch Logs, custom metrics, one dashboard, two alarms | Latency, error rate, fallback rate, token usage |
| Infra | Terraform or CDK in `infra/` | Repeatable; practices the standardized-components idea from skill 1.1.3 |

---

## Milestones

### Milestone 1 — Requirements and design note
**Exam skill:** 1.1.1  
**AWS cost:** $0  

Write a one-page design note covering:
- Measurable targets: p95 latency, max cost per request, availability goal
- The three tasks the gateway serves (summarize, draft, answer)
- Integration pattern chosen and justification
- Decision: why a gateway service rather than each tool calling Bedrock directly

Deliverable: `genai-model-gateway/docs/design-note.md`

---

### Milestone 2 — Direct proof of concept
**Exam skill:** 1.1.2  
**AWS cost:** cents (token charges only)

Build a minimal working service:
- `POST /v1/generate` accepts `{ task, messages, max_tokens }`
- Calls one hard-coded model via Boto3 `converse`
- Logs token usage (input, output) and end-to-end latency on every call
- `maxTokens` is a required field — refuse requests that omit it

Goal: prove the basic flow works end-to-end before adding complexity.

---

### Milestone 3 — Golden dataset and model comparison
**Exam skill:** 1.2.1  
**AWS cost:** low (3 models × 50+ cases per task)

- Create 50+ realistic cases per task (ticket summarize, email draft, FAQ answer)
- Write `scripts/eval_runner.py`:
  - Sends each case to three candidate models
  - Uses a judge model to score quality (1–5)
  - Records p50 and p95 latency, cost per request
- Produce a comparison table (save as `scripts/eval_results.md`)

The table is exam evidence for skill 1.2.1: model choice justified by data, not opinion.

---

### Milestone 4 — Config-driven routing
**Exam skill:** 1.2.2  
**AWS cost:** AppConfig is free for the first 10,000 configuration retrievals/month

Move the task-to-model mapping out of code:
- Create an AppConfig application, environment, and configuration profile
- Profile is a JSON document mapping each task to: primary model ID, fallback model IDs, `maxTokens`, `temperature`
- Add a JSON Schema validator to the profile
- Gateway fetches the profile with the AppConfig data client and caches it (TTL ~30 seconds)
- Verification test: change the primary model for one task in AppConfig, observe new requests use the new model with no container rebuild

AppConfig profile shape (example):
```json
{
  "tasks": {
    "summarize": {
      "models": ["anthropic.claude-3-haiku-20240307-v1:0"],
      "fallbacks": ["amazon.nova-lite-v1:0"],
      "maxTokens": 512,
      "temperature": 0.0
    }
  }
}
```

---

### Milestone 5 — Failure handling
**Exam skill:** 1.2.3  
**AWS cost:** DynamoDB on-demand pricing (negligible for dev traffic)

#### Why this matters — a concrete scenario

It's Monday 9 AM. All three internal tools hit Bedrock at once. Amazon throttles your primary model (`nova-micro`). Without M5, every request returns a 500. With M5, requests silently succeed using a fallback model — and once the primary is throttled enough times, the gateway stops wasting time even trying it.

#### Five layers, one story

Imagine a request comes in for `summarize`:

**1. Retry** *(already wired — Boto3 adaptive)*  
Your call gets a `ThrottlingException`. Boto3 waits 0.5s, tries again. Waits 1s, tries again. Gives up after 3 attempts.

**2. Timeout**  
Instead of waiting 30 seconds for Bedrock to respond (or never respond), you impose a hard 10-second cap per attempt. The retry still happens, but each attempt is bounded.

**3. Ordered fallback**  
AppConfig says: `"models": ["nova-micro", "nova-lite"]`. If nova-micro fails even after retries, the gateway tries nova-lite. The caller gets a successful response — they never knew the primary failed.

**4. Circuit breaker** *(the new DynamoDB piece)*  
After nova-micro fails 5 times in a row, the breaker **opens**. For the next 60 seconds, the gateway *skips* nova-micro entirely and goes straight to nova-lite. After 60 seconds, it sends **one probe** to nova-micro. If it succeeds, the breaker **closes** again.

```
Closed → (5 failures) → Open → (60s cool-down) → Half-open → (1 probe)
   ↑                                                               |
   └──────────── success ─────────────────────────────────────────┘
                         or ← failure → back to Open
```

Why DynamoDB and not in-memory? Because you'll eventually run multiple containers. A breaker stored in memory is per-process. DynamoDB makes it **shared state** — if container A sees nova-micro fail 5 times, container B also stops trying it.

**5. Degraded response**  
If nova-micro is open AND nova-lite also fails, instead of a 500 you return:
```json
{ "degraded": true, "error": "all models exhausted", "content": "" }
```
The caller can handle this gracefully (show "try again later") rather than crashing on an unexpected 500.

#### What changes

| File | What changes |
|---|---|
| `bedrock.py` | Add timeout + fallback loop |
| `breaker.py` | New — DynamoDB-backed circuit breaker |
| `main.py` | Return degraded response shape on total failure |
| `models.py` | Add `degraded: bool` to `GenerateResponse` |
| AWS | Create a DynamoDB table for breaker state |

#### Implementation checklist

1. **Retries with exponential backoff** — Boto3 `Config(retries={"max_attempts": 3, "mode": "adaptive"})` for `ThrottlingException`
2. **Timeout** — per-request hard timeout before retries exhaust
3. **Ordered fallback** — on non-retryable failure or exhausted retries, try next model in the list
4. **Circuit breaker** — per model, state stored in DynamoDB:
   - Closed → open after N consecutive failures
   - Open → skip model, try fallback
   - Half-open → allow one probe after cool-down
5. **Degraded response** — when every model in the list fails, return a structured error with `degraded: true` rather than a 500

Write tests in `tests/test_breaker.py`:
- Fake a throttled primary model (mock `ThrottlingException`)
- Assert the fallback model serves the request
- Assert the breaker opens after the configured threshold

---

### Milestone 6 — Cost attribution and dashboard
**Exam skills:** 1.2.1 (evidence), 1.2.3 (operational visibility)  
**AWS cost:** CloudWatch custom metrics ~$0.30/metric/month

> **Concept reference:** New to CloudWatch metrics, dimensions, alarms, or SNS topics/subscriptions?
> Read [`docs/concepts/metrics_and_alarms.md`](../../docs/concepts/metrics_and_alarms.md)
> before starting this milestone — it explains how all these terms fit together using this gateway as the example.

#### Why this matters — a concrete scenario

Finance asks: "Which tool spent the most on Bedrock last week?" Right now, every call goes
through the same model ID. Cost Explorer shows one Bedrock line item with no breakdown.
You cannot answer the question without reading logs and writing a script.

After M6, Cost Explorer shows spend split by `tool` tag (summarizer / drafter / faq-bot),
and your CloudWatch dashboard shows token usage, fallback rate, and latency — all updated
in real time, no log parsing needed.

#### How it works

**Application inference profiles** are AWS-managed wrappers around a foundation model.
You create one per tool (e.g. `gateway-summarizer`), attach resource tags, and use the
profile's ARN in `converse` calls instead of the raw model ID. Bedrock forwards the call
to the same model but records the spend against the profile's tags.

```
Before:
  converse(modelId="amazon.nova-micro-v1:0")
         ↓
  Cost Explorer: $X on "amazon.nova-micro-v1:0"  ← no tool breakdown

After:
  converse(modelId="arn:aws:bedrock:...:application-inference-profile/gateway-summarizer")
         ↓
  Cost Explorer: $X tagged tool=summarizer, env=dev  ← per-tool breakdown
```

**Custom CloudWatch metrics** are numbers you push from code on every request. Unlike logs
(which are free-text), metrics are queryable and alarmable. You emit them with a single
`put_metric_data` call and they appear on a dashboard within seconds.

```
Request completes
    │
    ├─ emit InputTokens (dimension: task=summarize, model=nova-micro)
    ├─ emit OutputTokens
    ├─ emit RequestLatencyMs
    └─ emit FallbackInvoked=1 (only when fallback was used)
```

**Alarms** watch a metric and fire an SNS notification when a threshold is crossed.
Two alarms cover the most important failure signals:

```
Error rate > 5% over 5 min  →  SNS → email/Slack  (service is degraded)
BreakerOpen > 10 min        →  SNS → email/Slack  (a model has been down for a while)
```

#### What changes

| File | What changes |
|---|---|
| `bedrock.py` | Use inference profile ARN instead of raw model ID |
| `metrics.py` | New — CloudWatch `put_metric_data` helper |
| `main.py` | Call `metrics.py` after every request |
| AWS | Create 3 inference profiles, 1 dashboard, 2 alarms, 1 SNS topic |

#### Implementation checklist

1. **Application inference profiles** — create one per tool (summarizer, drafter, faq-bot), tag each with `tool` and `env`
2. **Route calls through profiles** — use the profile ARN instead of the raw model ID in `converse` calls
3. **Custom metrics** — emit to CloudWatch on every call:
   - `InputTokens`, `OutputTokens` (by task, by model)
   - `FallbackInvoked` (count)
   - `BreakerOpen` (gauge per model)
   - `RequestLatencyMs` (p50, p95)
4. **Dashboard** — one CloudWatch dashboard with: token usage by tool, error rate, fallback rate, latency percentiles
5. **Alarms** — two alarms:
   - Error rate > 5% over 5 minutes → SNS topic
   - Any circuit breaker open > 10 minutes → SNS topic

---

### Milestone 7 — Container and infrastructure
**Exam skill:** 1.1.3 (standardized, repeatable components)  
**AWS cost:** ECS Fargate task + ALB are the ongoing costs — stop when not testing

> **Concept reference:** New to ECS task roles, how boto3 picks up credentials on Fargate,
> or why `bedrock:InvokeModel` is the invoke action (not a read)?
> Read [`docs/concepts/ecs_credentials.md`](../../docs/concepts/ecs_credentials.md)
> before starting this milestone — it explains the credential injection mechanism,
> the boto3 provider chain, and the two-role model (task role vs execution role).

#### Why this matters — a concrete scenario

Right now the gateway runs only on your laptop with `uvicorn`. If your machine sleeps, the
service goes down. If a second developer joins, they can't run the same environment. If you
need two copies for load balancing, there's no way to do it.

After M7, the service lives in AWS. Any developer can deploy it from scratch with one
command. ECS handles restarts, ALB handles traffic distribution, and the task role ensures
the container can only call the specific Bedrock models it's supposed to — nothing else.

#### How it works

**Dockerfile** packages the app into an image. The key production practices:

```
FROM python:3.12-slim          ← small base, fewer CVEs
RUN useradd -m appuser         ← non-root user (security baseline)
COPY --chown=appuser . .
RUN uv sync --frozen           ← exact versions from uv.lock
USER appuser
CMD ["uvicorn", "genai_model_gateway.main:app", "--host", "0.0.0.0"]
```

**ECS Fargate** runs the container without you managing servers. You say "I want 1 copy of
this container running, with 0.5 vCPU and 1 GB RAM" and AWS handles the rest.

```
ALB (public endpoint: api.internal/v1/generate)
  │
  └─► Target Group
          │
          ├─► ECS Task (container 1)  ← Fargate manages the host
          └─► ECS Task (container 2)  ← auto-scaled when request count rises
```

**Task role** is an IAM role attached to the container. It replaces hardcoded credentials.
The container calls `boto3.client("bedrock-runtime")` and boto3 automatically picks up the
role's temporary credentials from the ECS metadata endpoint.

The role policy is scoped tightly — it lists only the approved model ARNs:

```json
{
  "Effect": "Allow",
  "Action": "bedrock:InvokeModel",
  "Resource": [
    "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-micro-v1:0",
    "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0"
  ]
}
```

A wildcard (`"Resource": "*"`) would let the container call any model on your account —
including expensive ones. The narrow policy is both safer and cheaper.

**Infrastructure as Code (IaC)** writes all of the above as code (Terraform or CDK).
Every resource — the ECS cluster, the ALB, the DynamoDB table, the IAM role — is declared
in files, committed to git, and reproducible. "It works on my account" becomes "it works
on any account with one deploy command."

#### What changes

| File | What changes |
|---|---|
| `Dockerfile` | New — production image with non-root user, health check |
| `src/.../main.py` | Add `GET /health` endpoint |
| `infra/` | New — Terraform/CDK for all AWS resources |
| AWS | ECS cluster + Fargate service, ALB, task role, DynamoDB, CloudWatch, SNS |

#### Implementation checklist

---

##### Step 1 — Dockerfile + health endpoint

- Add `GET /health` to `main.py` (ALB and ECS health checks both hit this route)
- Write `Dockerfile`:
  - Base: `python:3.12-slim`
  - Create non-root user `appuser`
  - Use `uv export --no-emit-project` → `requirements.txt` → `uv pip install --system`
    (avoids a `.venv` inside the container — the container is already isolated)
  - `HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3`
  - `CMD ["python", "-m", "uvicorn", "genai_model_gateway.main:app", "--host", "0.0.0.0", "--port", "8000"]`
- Build and test locally:
  ```bash
  sudo docker build -t genai-model-gateway:local .
  sudo docker run -d --name gw-test -p 8002:8000 -e AWS_DEFAULT_REGION=ap-southeast-2 genai-model-gateway:local
  curl -s http://localhost:8002/health   # expect {"status":"ok"}
  sudo docker rm -f gw-test
  ```

---

##### Step 2 — Push image to ECR

```bash
export AWS_REGION=ap-southeast-2
export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_URI=$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/genai-model-gateway

# Create the repository
aws ecr create-repository \
  --repository-name genai-model-gateway \
  --image-tag-mutability IMMUTABLE \
  --image-scanning-configuration scanOnPush=true \
  --region $AWS_REGION

# Authenticate, tag, push
aws ecr get-login-password --region $AWS_REGION | \
  sudo docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
sudo docker tag genai-model-gateway:local $ECR_URI:v1
sudo docker push $ECR_URI:v1
```

---

##### Step 3 — IAM roles

Two roles are required. See [`docs/concepts/ecs_credentials.md`](../../docs/concepts/ecs_credentials.md)
for a full explanation of why both exist and how boto3 picks up credentials automatically.

**Task execution role** (ECS agent — pulls image, writes logs):
```bash
aws iam create-role --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
aws iam attach-role-policy --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

**Task role** (application code — Bedrock, DynamoDB, AppConfig, CloudWatch):
- Policy: `GenAIGatewayTaskPolicy` — scoped to the 3 inference profile ARNs + Mistral fallback,
  the `model-gateway-breaker` DynamoDB table, the `routing-profile` AppConfig profile,
  and `cloudwatch:PutMetricData` with a namespace condition (`GenAIGateway` only).
- Role: `genai-gateway-task-role` with `ecs-tasks.amazonaws.com` trust + `aws:SourceAccount` condition.

---

##### Step 4 — ECS cluster, task definition, and Fargate service

**CloudWatch log group** (container stdout goes here):
```bash
aws logs create-log-group --log-group-name /ecs/genai-model-gateway --region $AWS_REGION
```

**ECS cluster:**
```bash
aws ecs create-cluster --cluster-name genai-gateway --region $AWS_REGION
```

**Task definition** — key fields:
- Network mode: `awsvpc` (required for Fargate)
- CPU: `256` (0.25 vCPU) / Memory: `512` MB
- Task role: `genai-gateway-task-role`
- Execution role: `ecsTaskExecutionRole`
- Container image: `$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/genai-model-gateway:v1`
- Port: `8000`
- Environment: `AWS_DEFAULT_REGION=ap-southeast-2`
- Log driver: `awslogs` → group `/ecs/genai-model-gateway`, prefix `gateway`

**Fargate service:**
```bash
# Get default VPC and two subnets
VPC_ID=$(aws ec2 describe-vpcs --filters Name=isDefault,Values=true \
  --query "Vpcs[0].VpcId" --output text --region $AWS_REGION)
SUBNET_IDS=$(aws ec2 describe-subnets --filters Name=vpc-id,Values=$VPC_ID \
  --query "Subnets[:2].SubnetId" --output text --region $AWS_REGION | tr '\t' ',')

# Task security group — port 8000 (later tightened to ALB SG only)
SG_ID=$(aws ec2 create-security-group --group-name genai-gateway-task-sg \
  --description "ECS task SG" --vpc-id $VPC_ID --region $AWS_REGION --query GroupId --output text)
aws ec2 authorize-security-group-ingress --group-id $SG_ID \
  --protocol tcp --port 8000 --cidr 0.0.0.0/0 --region $AWS_REGION

aws ecs create-service \
  --cluster genai-gateway \
  --service-name genai-model-gateway \
  --task-definition genai-model-gateway \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_IDS],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
  --region $AWS_REGION
```

Verify the task is running:
```bash
aws ecs describe-services --cluster genai-gateway --services genai-model-gateway \
  --region $AWS_REGION \
  --query "services[0].{status:status,running:runningCount,desired:desiredCount}"
```

---

##### Step 5 — ALB, target group, and listener

This step wires public traffic to the running ECS task. Five sub-steps, all in the console.
Every sub-step matters — skipping one breaks the chain.

```
Internet → ALB SG (port 80) → ALB → Target Group (port 8000, type=ip) → Task IP:8000
                                                                              ↑
                                                        Task SG: allow 8000 from ALB SG only
```

**Why target type `ip` and not `instance`:** Fargate tasks use `awsvpc` networking — each
task gets its own private IP attached directly to the VPC. There is no EC2 instance behind
it. The ALB registers the task's IP in the target group directly.

**Sub-step 1 — ALB security group**
EC2 → Security Groups → Create security group
- Name: `genai-gateway-alb-sg`
- VPC: your default VPC
- Inbound: Type **HTTP**, Port **80**, Source **0.0.0.0/0**

**Sub-step 2 — Target group**
EC2 → Target Groups → Create target group
- Target type: **IP addresses** (not Instance)
- Name: `genai-gateway-tg`
- Protocol: **HTTP**, Port: **8000**
- VPC: your default VPC
- Health check path: `/health`
- Healthy threshold: **2**, Interval: **30s**
- Next → skip manual registration → Create

**Sub-step 3 — Application Load Balancer**
EC2 → Load Balancers → Create load balancer → Application Load Balancer
- Name: `genai-gateway-alb`
- Scheme: **Internet-facing**, IP type: **IPv4**
- VPC: your default VPC, tick **both subnets**
- Security groups: remove default, add **`genai-gateway-alb-sg`**
- Listener: HTTP port **80**, forward to **`genai-gateway-tg`**
- Create

**Sub-step 4 — Tighten the task security group**
EC2 → Security Groups → `genai-gateway-task-sg` → Edit inbound rules
- Delete the existing rule (port 8000 from 0.0.0.0/0)
- Add: Type **Custom TCP**, Port **8000**, Source → **`genai-gateway-alb-sg`**
- Save

This ensures the container is unreachable from the internet directly — only the ALB can
talk to it on port 8000.

**Sub-step 5 — Attach the target group to the ECS service**
ECS → Clusters → `genai-gateway` → Services → `genai-model-gateway` → Update
- Load balancing → Add load balancer:
  - Type: **Application Load Balancer**
  - Load balancer: **`genai-gateway-alb`**
  - Container: **`gateway 8000`**
  - Target group: **`genai-gateway-tg`**
- Update

ECS deregisters the old task and registers the replacement with the ALB automatically.
Wait ~60 seconds for `running: 1` to return, then proceed to the smoke test.

---

##### Step 6 — Smoke test

```bash
# Get the ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --names genai-gateway-alb --region $AWS_REGION \
  --query "LoadBalancers[0].DNSName" --output text)

curl -s http://$ALB_DNS/health
# expect: {"status":"ok"}

curl -s -X POST http://$ALB_DNS/v1/generate \
  -H "Content-Type: application/json" \
  -d '{"task":"summarize","messages":[{"role":"user","content":"Summarise: AWS ECS runs containers."}]}'
```

---

### Milestone 8 — Well-Architected review
**AWS cost:** Well-Architected Tool is free

#### Why this matters — a concrete scenario

You've built and deployed the gateway. It works. But "it works" is not the same as
"it's production-ready." Security gaps, missing backup strategies, and unmonitored cost
spikes are invisible until they cause an incident.

The AWS Well-Architected Tool gives you a structured checklist — written by AWS solutions
architects — that surfaces exactly these gaps. For the AIP-C01 exam, the Generative AI Lens
questions map directly to what you've built: model selection evidence, fallback strategy,
guardrails, cost attribution. Answering them honestly is a forcing function to fix the
worst gaps before shipping.

#### How it works

The Well-Architected Tool is a questionnaire inside the AWS console. You create a
**workload** (a named snapshot of your system), answer questions across five pillars
(Operational Excellence, Security, Reliability, Performance, Cost), and the tool produces
a prioritised list of findings — high/medium/low risk — with AWS-recommended remediation
steps for each.

The **Generative AI Lens** adds GenAI-specific questions on top of the base framework:

```
Base framework questions (all workloads):
  Security:      Is the task role least-privilege?
  Reliability:   Is there a fallback when the primary model is unavailable?
  Cost:          Can you attribute spend per feature?

Generative AI Lens additions:
  Model selection: Is model choice backed by evaluation data?
  Safety:          Are guardrails applied before model output reaches users?
  Data privacy:    Is user data logged in a way that complies with your data policy?
```

The **milestone** feature takes a snapshot of your answers at a point in time. You save
`pre-review` before fixing anything, then `post-review` after. The tool diffs them and
shows what improved — this is the evidence you present in a real-world architecture review.

```
Create workload
    │
    ├─ Answer all questions → save milestone "pre-review"
    │
    ├─ Review findings list (sorted by risk)
    │
    ├─ Fix the two highest-risk items
    │
    └─ Re-answer affected questions → save milestone "post-review"
                                          │
                                          └─ Tool shows: N risks resolved ✓
```

#### What changes

| File | What changes |
|---|---|
| AWS | Well-Architected workload created, Generative AI Lens applied |
| Code/infra | Fixes for the two highest-risk findings (discovered during review) |
| Docs | `docs/well-architected-review.md` — findings summary and what was fixed |

#### Implementation checklist

1. Create a workload in the AWS Well-Architected Tool
2. Apply the **Generative AI Lens**
3. Answer all questions honestly for the current state of the service
4. Save a milestone named `pre-review`
5. Identify and fix the two highest-risk findings
6. Save a second milestone named `post-review`
7. Write `docs/well-architected-review.md` — what the top findings were and how they were addressed

---

## Definition of done

- [ ] Changing a task's model is an AppConfig deployment — no container rebuild, no code change
- [ ] With the primary model blocked (deny policy or test double), requests are still served by the fallback and the fallback metric rises
- [ ] After the configured number of consecutive failures the circuit breaker opens; the failing model stops receiving traffic; it is tried again after cool-down
- [ ] "Which tool cost the most last week, and on which model?" is answerable from the AWS console without reading code
- [ ] The evaluation table (not opinion) explains why each task uses the model it uses

---

## Stretch ideas (after definition of done)

- **Step Functions circuit breaker** — a state-machine version for batch jobs (the form the exam names)
- **Response caching** — cache completions keyed on prompt hash; measure cost saving (leads into Domain 4)
- **Bedrock guardrail** — apply one guardrail to every call so safety is enforced in one place (leads into Domain 3)

---

## Cost and account notes

- All resources must be in the single assigned Region
- ECS Fargate task + ALB incur hourly cost even when idle — stop the service when not testing
- Model charges on the golden dataset are cents if output tokens are capped
- If ECS/ALB is not on the account plan's supported-services list, run the same FastAPI app on Lambda with a Mangum adapter and a function URL — the rest of the design is unchanged
- Task role must be scoped to approved model ARNs only — a wildcard `bedrock:InvokeModel` defeats the cost attribution purpose
