# GenAI Model Gateway

A FastAPI service that routes generative AI tasks (`summarize`, `draft`, `answer`) to Amazon
Bedrock models via AppConfig-driven routing, with a DynamoDB-backed circuit breaker, automatic
fallback, and CloudWatch observability.

**Region:** `ap-southeast-2` · **Account:** `415744340135`

---

## Architecture

```
Client
  │
  ▼
ALB :80  (genai-gateway-alb)
  │
  ▼  HTTP  port 8000
ECS Fargate task  (genai-model-gateway)
  │
  ├─► AppConfig      routing-profile  (which model to call per task)
  ├─► Bedrock        Converse API     (inference profiles + Mistral fallback)
  ├─► DynamoDB       model-gateway-breaker  (circuit breaker state)
  └─► CloudWatch     GenAIGateway namespace (metrics → alarms → SNS)
```

---

## Scripts

Three scripts cover the full lifecycle. All must be run with `bash`, not `sh`.

| Script | When to run | What it does |
|---|---|---|
| `scripts/cleanup.sh` | Before first `cdk deploy` (manual resources exist) | Deletes manually created resources by name, idempotent |
| `scripts/post_deploy.sh` | After every `cdk deploy` | Builds + pushes Docker image, starts ECS service, smoke tests |
| `cdk destroy` (CDK built-in) | Full teardown of CDK-managed stack | Deletes all CloudFormation-managed resources |

---

## Full lifecycle

```
1. bash scripts/cleanup.sh        # only needed if manual resources exist
2. cd infra && cdk deploy         # provisions all 23 AWS resources
3. cd .. && bash scripts/post_deploy.sh   # pushes image, starts service, smoke tests

── making code changes ──
4. bash scripts/post_deploy.sh    # rebuilds, pushes, force-redeploys

── tearing down ──
5. cd infra && cdk destroy        # deletes all resources + CloudFormation stack
```

---

## Run locally

The app reads AWS credentials from `~/.aws/credentials` automatically via boto3.
AppConfig, DynamoDB, and Bedrock must exist in the account (deploy via CDK first).

```bash
cd genai-model-gateway
cp .env.example .env
# Edit .env — see note below about AppConfig IDs
uv sync
uv run uvicorn genai_model_gateway.main:app --reload --port 8000
```

`.env` is git-ignored. The app loads it on startup via `python-dotenv`.

**AppConfig IDs after CDK deploy:** CDK generates new IDs each time it creates the AppConfig
resources. Get the current values from CloudFormation:

```bash
aws cloudformation describe-stack-resources \
  --stack-name GenAIGatewayStack --region ap-southeast-2 \
  --query "StackResources[?ResourceType=='AWS::AppConfig::Application' || ResourceType=='AWS::AppConfig::Environment' || ResourceType=='AWS::AppConfig::ConfigurationProfile'].{Type:ResourceType,Id:PhysicalResourceId}" \
  --output table
```

Update `.env` with the printed IDs:

```
APPCONFIG_APP_ID=<Application PhysicalId>
APPCONFIG_ENV_ID=<Environment PhysicalId>
APPCONFIG_PROFILE_ID=<ConfigurationProfile PhysicalId>
```

Health check:
```bash
curl http://localhost:8000/health
# {"status": "ok"}
```

Test a request:
```bash
curl -s -X POST http://localhost:8000/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "summarize",
    "messages": [{"role": "user", "content": "Summarise the concept of a circuit breaker in one sentence."}]
  }' | python3 -m json.tool
```

---

## Run from deployed version

Get the endpoint from the CDK stack outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name GenAIGatewayStack --region ap-southeast-2 \
  --query "Stacks[0].Outputs[?OutputKey=='AlbEndpoint'].OutputValue" \
  --output text
```

```bash
ALB=http://genai-gateway-alb-<id>.ap-southeast-2.elb.amazonaws.com

curl $ALB/health

curl -s -X POST $ALB/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "task": "answer",
    "messages": [{"role": "user", "content": "What is Amazon Bedrock in one sentence?"}]
  }' | python3 -m json.tool
```

Response fields:

| Field | Meaning |
|---|---|
| `model` | Actual model used (inference profile ARN or fallback ID) |
| `fallback_used` | `true` if the primary model failed and a fallback was used |
| `degraded` | `true` if all models failed — response content will be empty |
| `latency_ms` | End-to-end Bedrock call time in milliseconds |

---

## Deploy all resources via CDK

All 27 AWS resources are defined in `infra/` as a single CDK stack (`GenAIGatewayStack`).

### Prerequisites

- Node.js: `node --version` → v18+
- AWS CLI configured: `aws sts get-caller-identity`

### Step 1 — Install CDK CLI (once per machine)

```bash
npm install -g aws-cdk
cdk --version  # expect 2.x
```

### Step 2 — Install Python CDK packages

```bash
cd genai-model-gateway/infra
uv sync
```

### Step 3 — Bootstrap CDK (once per account / region)

```bash
cdk bootstrap aws://415744340135/ap-southeast-2
```

### Step 4 — Deploy

```bash
cdk deploy
# Outputs: AlbEndpoint, EcrImageUri, AlertTopicArn
# Takes ~3 minutes on first run
```

### Step 5 — Start the service

The ECS service deploys with `desired_count=0` because ECR is empty at first deploy — ECS
would crash-loop trying to pull an image that doesn't exist yet. The post-deploy script
handles everything after `cdk deploy` completes:

```bash
cd genai-model-gateway
bash scripts/post_deploy.sh
```

It builds the Docker image, pushes it to ECR, scales the service to 1, waits for RUNNING,
and runs a smoke test. Re-run it after any code change to redeploy.

### Step 6 — Subscribe to alerts (optional)

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-southeast-2:415744340135:gateway-alerts \
  --protocol email \
  --notification-endpoint your@email.com \
  --region ap-southeast-2
# Confirm the subscription from your inbox.
```

---

## Clean up all resources

### For CDK-managed resources — use `cdk destroy`

```bash
cd genai-model-gateway/infra
cdk destroy
```

Deletes all resources **and** removes the CloudFormation stack. The ECR repository is retained
(it has `removal_policy=RETAIN` to protect pushed images). Delete it manually if needed:

```bash
aws ecr delete-repository --repository-name genai-model-gateway --force --region ap-southeast-2
```

### For manually created resources — use the cleanup script

Needed only if resources were created via the console or CLI before CDK was set up.
Looks up every resource by name, skips anything already gone, safe to re-run:

```bash
bash scripts/cleanup.sh
```

The script prints verbose logs per step and an executive summary at the end.
When it shows `Ready for: cd infra && cdk deploy`, all conflicts are cleared.

> **Do not use the cleanup script on CDK-managed resources.** It deletes the AWS resources
> but leaves the CloudFormation stack intact (drift), causing the next `cdk deploy` to fail.

#### Recovery — if you used the script on CDK resources by mistake

```bash
aws cloudformation delete-stack --stack-name GenAIGatewayStack --region ap-southeast-2
aws cloudformation wait stack-delete-complete --stack-name GenAIGatewayStack --region ap-southeast-2
cd genai-model-gateway/infra && cdk deploy
```

---

## Resources currently costing money

The two main cost drivers are **ECS Fargate tasks** and the **ALB** — both charge by the hour.

| Resource | Charge model | How to stop |
|---|---|---|
| ECS Fargate task | Per vCPU-hour + memory-hour | `update-service --desired-count 0` |
| ALB | Per ALB-hour + LCU | `cdk destroy` or `delete-load-balancer` |
| DynamoDB | Per request (on-demand) | No action — free when idle |
| ECR | Per GB stored | Negligible for one image |
| AppConfig, CloudWatch, SNS | Minimal / free tier | No action needed |

Check current state:

```bash
# ECS — is anything running?
aws ecs describe-services \
  --cluster genai-gateway --services genai-model-gateway \
  --region ap-southeast-2 \
  --query "services[0].{desired:desiredCount,running:runningCount,status:status}"

# ALB — does it exist?
aws elbv2 describe-load-balancers \
  --names genai-gateway-alb --region ap-southeast-2 \
  --query "LoadBalancers[0].{name:LoadBalancerName,state:State.Code}" \
  --output table 2>/dev/null || echo "ALB not found"
```

Stop ECS tasks without destroying everything:

```bash
aws ecs update-service \
  --cluster genai-gateway --service genai-model-gateway \
  --desired-count 0 --region ap-southeast-2
```

---

## IDE setup (Pylance / VS Code)

The CDK packages live in `infra/.venv`, not the project root `.venv`.
If you see `Import "aws_cdk" could not be resolved`:

**VS Code:** `Ctrl+Shift+P` → `Python: Select Interpreter` →
`genai-model-gateway/infra/.venv/bin/python`

Or add to `infra/.vscode/settings.json`:

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python"
}
```
