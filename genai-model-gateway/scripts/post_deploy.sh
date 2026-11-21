#!/usr/bin/env bash
# Builds and pushes the Docker image to ECR, then starts the ECS service.
# Run this once after every `cdk deploy`.
# Usage: bash scripts/post_deploy.sh

if [ -z "${BASH_VERSION:-}" ]; then
  echo "ERROR: Run with bash, not sh:  bash $0" >&2
  exit 1
fi

set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-ap-southeast-2}"
STACK_NAME="GenAIGatewayStack"
START_SECONDS=$SECONDS

# ── output helpers ────────────────────────────────────────────────────────────

if [ -t 1 ]; then
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; RESET=''
fi

DONE=()
FAILED=()

step() { echo -e "\n${BOLD}${CYAN}── $* ──${RESET}"; }
info() { echo -e "   $*"; }
ok()   { echo -e "   ${GREEN}✓${RESET} $*"; DONE+=("$1"); }
fail() { echo -e "   ${RED}✗${RESET} $*"; FAILED+=("$1"); }

# ── Resolve outputs from the deployed stack ───────────────────────────────────

step "Step 1 / 5 — Read CDK stack outputs"

cfn_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text 2>/dev/null || true
}

ECR_URI=$(cfn_output "EcrImageUri")
ALB_ENDPOINT=$(cfn_output "AlbEndpoint")

if [[ -z "$ECR_URI" || "$ECR_URI" == "None" ]]; then
  echo -e "${RED}ERROR: Stack '$STACK_NAME' not found or has no EcrImageUri output.${RESET}"
  echo       "       Run 'cdk deploy' first."
  exit 1
fi

# Strip the :v1 tag — we'll add it explicitly
ECR_REPO="${ECR_URI%:*}"
ACCOUNT_ID="${ECR_REPO%%.*}"
IMAGE_TAG="latest"

info "ECR repository : $ECR_REPO"
info "Image tag      : $IMAGE_TAG"
info "ALB endpoint   : $ALB_ENDPOINT"
ok "Stack outputs resolved"

# ── Locate the Dockerfile ─────────────────────────────────────────────────────

step "Step 2 / 5 — Build Docker image"

# Script lives in scripts/ — Dockerfile is one level up
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if [ ! -f "$PROJECT_DIR/Dockerfile" ]; then
  echo -e "${RED}ERROR: Dockerfile not found at $PROJECT_DIR/Dockerfile${RESET}"
  exit 1
fi

info "Building from $PROJECT_DIR..."
docker build -t genai-model-gateway:latest "$PROJECT_DIR"
ok "Docker image built (genai-model-gateway:latest)"

# ── Authenticate and push to ECR ──────────────────────────────────────────────

step "Step 3 / 5 — Push image to ECR"

info "Authenticating Docker with ECR..."
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin \
  "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com" 2>&1 | \
  grep -v "WARNING" || true

info "Tagging as $ECR_REPO:$IMAGE_TAG..."
docker tag genai-model-gateway:latest "$ECR_REPO:$IMAGE_TAG"

info "Pushing — this may take a minute..."
docker push "$ECR_REPO:$IMAGE_TAG"
ok "Image pushed to ECR ($ECR_REPO:$IMAGE_TAG)"

# ── Scale ECS service to 1 ────────────────────────────────────────────────────

step "Step 4 / 5 — Start ECS service"

CURRENT=$(aws ecs describe-services \
  --cluster genai-gateway --services genai-model-gateway \
  --region "$REGION" \
  --query "services[0].desiredCount" --output text 2>/dev/null || echo "0")

info "Current desired count: $CURRENT"

if [ "${CURRENT}" -eq 1 ]; then
  info "Service already running — forcing a new deployment to pick up the latest image..."
  aws ecs update-service \
    --cluster genai-gateway --service genai-model-gateway \
    --force-new-deployment --region "$REGION" > /dev/null
else
  info "Scaling desired count from 0 → 1..."
  aws ecs update-service \
    --cluster genai-gateway --service genai-model-gateway \
    --desired-count 1 --region "$REGION" > /dev/null
fi

info "Waiting for task to reach RUNNING state (may take ~60s)..."
aws ecs wait services-stable \
  --cluster genai-gateway --services genai-model-gateway \
  --region "$REGION"
ok "ECS service running (desired=1)"

# ── Smoke test ────────────────────────────────────────────────────────────────

step "Step 5 / 5 — Smoke test"

info "GET $ALB_ENDPOINT/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 10 --retry 3 --retry-delay 5 \
  "$ALB_ENDPOINT/health" 2>/dev/null || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
  BODY=$(curl -s --max-time 10 "$ALB_ENDPOINT/health" 2>/dev/null || echo "")
  info "Response: $BODY"
  ok "Health check passed (HTTP $HTTP_STATUS)"
else
  fail "Health check returned HTTP $HTTP_STATUS — task may still be starting up"
  info "Retry manually: curl $ALB_ENDPOINT/health"
fi

# ── Summary ───────────────────────────────────────────────────────────────────

ELAPSED=$((SECONDS - START_SECONDS))
D_COUNT=${#DONE[@]}
F_COUNT=${#FAILED[@]}

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║           POST-DEPLOY SUMMARY                       ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
printf "${BOLD}║${RESET}  %-52s${BOLD}║${RESET}\n" "Elapsed: ${ELAPSED}s"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"

for item in "${DONE[@]}"; do
  printf "${BOLD}║${RESET}  ${GREEN}✓${RESET} %-50s${BOLD}║${RESET}\n" "$item"
done

if [ "$F_COUNT" -gt 0 ]; then
  echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
  for item in "${FAILED[@]}"; do
    printf "${BOLD}║${RESET}  ${RED}✗${RESET} %-50s${BOLD}║${RESET}\n" "$item"
  done
fi

echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
printf "${BOLD}║${RESET}  %-52s${BOLD}║${RESET}\n" "Endpoint: $ALB_ENDPOINT"
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"

echo ""
echo -e "${BOLD}Test command:${RESET}"
echo "curl -s -X POST $ALB_ENDPOINT/v1/generate \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"task\":\"answer\",\"messages\":[{\"role\":\"user\",\"content\":\"What is Bedrock?\"}]}' \\"
echo "  | python3 -m json.tool"
