#!/usr/bin/env bash
# Deletes all AWS resources for genai-model-gateway.
# Every resource is looked up by name — no hardcoded IDs.
# Usage: bash scripts/cleanup.sh

# Require bash — [[, arrays, and $SECONDS are bash-only.
if [ -z "${BASH_VERSION:-}" ]; then
  echo "ERROR: Run with bash, not sh:  bash $0" >&2
  exit 1
fi

set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-ap-southeast-2}"
START_SECONDS=$SECONDS

# ── output helpers ────────────────────────────────────────────────────────────

if [ -t 1 ]; then          # colour only when writing to a terminal
  RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
  CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
else
  RED=''; GREEN=''; YELLOW=''; CYAN=''; BOLD=''; RESET=''
fi

DELETED=()
SKIPPED=()
FAILED=()

step()   { echo -e "\n${BOLD}${CYAN}── $* ──${RESET}"; }
info()   { echo -e "   ${RESET}$*"; }
ok()     { echo -e "   ${GREEN}✓${RESET} $*"; DELETED+=("$1"); }
skip()   { echo -e "   ${YELLOW}–${RESET} $* (not found, skipping)"; SKIPPED+=("$1"); }
fail()   { echo -e "   ${RED}✗${RESET} $* (failed — check manually)"; FAILED+=("$1"); }

# ── AWS lookup helpers ────────────────────────────────────────────────────────

ecs_service_exists() {
  aws ecs describe-services \
    --cluster genai-gateway --services genai-model-gateway \
    --region "$REGION" \
    --query "services[?status=='ACTIVE'].serviceName" \
    --output text 2>/dev/null | grep -q "genai-model-gateway"
}

ecs_cluster_exists() {
  aws ecs describe-clusters --clusters genai-gateway --region "$REGION" \
    --query "clusters[?status=='ACTIVE'].clusterName" \
    --output text 2>/dev/null | grep -q "genai-gateway"
}

alb_arn() {
  aws elbv2 describe-load-balancers \
    --names genai-gateway-alb --region "$REGION" \
    --query "LoadBalancers[0].LoadBalancerArn" \
    --output text 2>/dev/null || true
}

tg_arn() {
  aws elbv2 describe-target-groups \
    --names genai-gateway-tg --region "$REGION" \
    --query "TargetGroups[0].TargetGroupArn" \
    --output text 2>/dev/null || true
}

sg_id() {
  aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=$1" \
    --region "$REGION" \
    --query "SecurityGroups[0].GroupId" \
    --output text 2>/dev/null || true
}

iam_role_exists() {
  aws iam get-role --role-name "$1" &>/dev/null
}

appconfig_app_id() {
  aws appconfig list-applications --region "$REGION" \
    --query "Items[?Name=='genai-model-gateway'].Id" \
    --output text 2>/dev/null
}

is_valid() {
  [[ -n "$1" && "$1" != "None" && "$1" != "null" ]]
}

# ── Step 1: ECS service ───────────────────────────────────────────────────────

step "Step 1 / 12 — ECS Service"

if ecs_service_exists; then
  RUNNING=$(aws ecs describe-services \
    --cluster genai-gateway --services genai-model-gateway --region "$REGION" \
    --query "services[0].runningCount" --output text 2>/dev/null)
  DESIRED=$(aws ecs describe-services \
    --cluster genai-gateway --services genai-model-gateway --region "$REGION" \
    --query "services[0].desiredCount" --output text 2>/dev/null)
  info "Found: running=$RUNNING, desired=$DESIRED"

  if [ "${DESIRED:-0}" -gt 0 ]; then
    info "Setting desired count to 0..."
    aws ecs update-service \
      --cluster genai-gateway --service genai-model-gateway \
      --desired-count 0 --region "$REGION" > /dev/null
    info "Waiting for running tasks to drain to 0..."
    aws ecs wait services-stable \
      --cluster genai-gateway --services genai-model-gateway --region "$REGION"
    info "Tasks drained."
  else
    info "Desired count already 0 — no drain needed."
  fi

  info "Deleting service..."
  aws ecs delete-service \
    --cluster genai-gateway --service genai-model-gateway \
    --region "$REGION" > /dev/null
  ok "ECS service genai-model-gateway"
else
  skip "ECS service genai-model-gateway"
fi

# ── Step 2: Task definitions ──────────────────────────────────────────────────

step "Step 2 / 12 — ECS Task Definitions"

TASK_DEFS=$(aws ecs list-task-definitions \
  --family-prefix genai-model-gateway --region "$REGION" \
  --query "taskDefinitionArns[]" --output text 2>/dev/null)

if [[ -n "$TASK_DEFS" ]]; then
  COUNT=0
  for td in $TASK_DEFS; do
    info "Deregistering $td..."
    aws ecs deregister-task-definition --task-definition "$td" --region "$REGION" > /dev/null
    COUNT=$((COUNT + 1))
  done
  ok "ECS task definitions ($COUNT revision(s) deregistered)"
else
  skip "ECS task definitions (family genai-model-gateway)"
fi

# ── Step 3: ECS cluster ───────────────────────────────────────────────────────

step "Step 3 / 12 — ECS Cluster"

if ecs_cluster_exists; then
  TASK_COUNT=$(aws ecs describe-clusters --clusters genai-gateway --region "$REGION" \
    --query "clusters[0].{active:activeServicesCount,pending:pendingTasksCount,running:runningTasksCount}" \
    --output text 2>/dev/null | tr '\t' '/')
  info "Cluster state: active-services/pending-tasks/running-tasks = $TASK_COUNT"
  info "Deleting cluster..."
  aws ecs delete-cluster --cluster genai-gateway --region "$REGION" > /dev/null
  ok "ECS cluster genai-gateway"
else
  skip "ECS cluster genai-gateway"
fi

# ── Step 4: ALB ───────────────────────────────────────────────────────────────

step "Step 4 / 12 — Application Load Balancer"

ARN=$(alb_arn)
if is_valid "$ARN"; then
  info "Found ALB: $ARN"
  info "Deleting ALB (this also deletes all listeners)..."
  aws elbv2 delete-load-balancer --load-balancer-arn "$ARN" --region "$REGION" > /dev/null
  info "Waiting for ALB to finish deleting..."
  aws elbv2 wait load-balancers-deleted --load-balancer-arns "$ARN" --region "$REGION"
  ok "ALB genai-gateway-alb"
else
  skip "ALB genai-gateway-alb"
fi

# ── Step 5: Target group ──────────────────────────────────────────────────────

step "Step 5 / 12 — Target Group"

TG=$(tg_arn)
if is_valid "$TG"; then
  info "Found target group: $TG"
  aws elbv2 delete-target-group --target-group-arn "$TG" --region "$REGION" > /dev/null
  ok "Target group genai-gateway-tg"
else
  skip "Target group genai-gateway-tg"
fi

# ── Step 6: Security groups ───────────────────────────────────────────────────

step "Step 6 / 12 — Security Groups"

ALB_SG=$(sg_id "genai-gateway-alb-sg")
TASK_SG=$(sg_id "genai-gateway-task-sg")

if is_valid "$ALB_SG" && is_valid "$TASK_SG"; then
  info "Found ALB SG:  $ALB_SG"
  info "Found Task SG: $TASK_SG"
  info "Revoking cross-SG rules before deletion..."

  aws ec2 revoke-security-group-egress \
    --group-id "$ALB_SG" --region "$REGION" \
    --ip-permissions "[{\"IpProtocol\":\"tcp\",\"FromPort\":8000,\"ToPort\":8000,\"UserIdGroupPairs\":[{\"GroupId\":\"$TASK_SG\"}]}]" \
    2>/dev/null && info "  Revoked: ALB SG egress → Task SG :8000" || info "  Egress rule already absent"

  aws ec2 revoke-security-group-ingress \
    --group-id "$TASK_SG" --region "$REGION" \
    --ip-permissions "[{\"IpProtocol\":\"tcp\",\"FromPort\":8000,\"ToPort\":8000,\"UserIdGroupPairs\":[{\"GroupId\":\"$ALB_SG\"}]}]" \
    2>/dev/null && info "  Revoked: Task SG ingress ← ALB SG :8000" || info "  Ingress rule already absent"
fi

if is_valid "$ALB_SG"; then
  info "Deleting genai-gateway-alb-sg ($ALB_SG)..."
  aws ec2 delete-security-group --group-id "$ALB_SG" --region "$REGION"
  ok "Security group genai-gateway-alb-sg"
else
  skip "Security group genai-gateway-alb-sg"
fi

if is_valid "$TASK_SG"; then
  info "Deleting genai-gateway-task-sg ($TASK_SG)..."
  aws ec2 delete-security-group --group-id "$TASK_SG" --region "$REGION"
  ok "Security group genai-gateway-task-sg"
else
  skip "Security group genai-gateway-task-sg"
fi

# ── Step 7: IAM roles ─────────────────────────────────────────────────────────

step "Step 7 / 12 — IAM Roles"

for ROLE in genai-gateway-task-role ecsTaskExecutionRole; do
  if iam_role_exists "$ROLE"; then
    info "Found role: $ROLE"

    MANAGED=$(aws iam list-attached-role-policies \
      --role-name "$ROLE" --query "AttachedPolicies[].PolicyArn" --output text 2>/dev/null)
    for policy_arn in $MANAGED; do
      info "  Detaching managed policy: $policy_arn"
      aws iam detach-role-policy --role-name "$ROLE" --policy-arn "$policy_arn"
    done

    INLINE=$(aws iam list-role-policies \
      --role-name "$ROLE" --query "PolicyNames[]" --output text 2>/dev/null)
    for policy_name in $INLINE; do
      info "  Deleting inline policy: $policy_name"
      aws iam delete-role-policy --role-name "$ROLE" --policy-name "$policy_name"
    done

    aws iam delete-role --role-name "$ROLE"
    ok "IAM role $ROLE"
  else
    skip "IAM role $ROLE"
  fi
done

# ── Step 8: DynamoDB ──────────────────────────────────────────────────────────

step "Step 8 / 12 — DynamoDB Table"

if aws dynamodb describe-table --table-name model-gateway-breaker \
    --region "$REGION" &>/dev/null; then
  TABLE_STATUS=$(aws dynamodb describe-table --table-name model-gateway-breaker \
    --region "$REGION" --query "Table.TableStatus" --output text 2>/dev/null)
  ITEM_COUNT=$(aws dynamodb describe-table --table-name model-gateway-breaker \
    --region "$REGION" --query "Table.ItemCount" --output text 2>/dev/null)
  info "Found: status=$TABLE_STATUS, approx items=$ITEM_COUNT"
  aws dynamodb delete-table --table-name model-gateway-breaker --region "$REGION" > /dev/null
  ok "DynamoDB table model-gateway-breaker"
else
  skip "DynamoDB table model-gateway-breaker"
fi

# ── Step 9: AppConfig ─────────────────────────────────────────────────────────

step "Step 9 / 12 — AppConfig"

APP_ID=$(appconfig_app_id)
if is_valid "$APP_ID"; then
  info "Found application genai-model-gateway (ID: $APP_ID)"

  PROFILE_ID=$(aws appconfig list-configuration-profiles \
    --application-id "$APP_ID" --region "$REGION" \
    --query "Items[?Name=='routing-profile'].Id" --output text 2>/dev/null)

  VERSION_COUNT=0
  if is_valid "$PROFILE_ID"; then
    info "Found profile routing-profile (ID: $PROFILE_ID)"
    VERSIONS=$(aws appconfig list-hosted-configuration-versions \
      --application-id "$APP_ID" \
      --configuration-profile-id "$PROFILE_ID" \
      --region "$REGION" \
      --query "Items[].VersionNumber" --output text 2>/dev/null)
    VERSION_COUNT=0
    for v in $VERSIONS; do
      info "  Deleting hosted config version $v..."
      aws appconfig delete-hosted-configuration-version \
        --application-id "$APP_ID" \
        --configuration-profile-id "$PROFILE_ID" \
        --version-number "$v" --region "$REGION"
      VERSION_COUNT=$((VERSION_COUNT + 1))
    done
    info "  Deleted $VERSION_COUNT hosted config version(s)"
    info "  Deleting profile routing-profile..."
    aws appconfig delete-configuration-profile \
      --application-id "$APP_ID" --configuration-profile-id "$PROFILE_ID" \
      --deletion-protection-check BYPASS --region "$REGION"
  else
    info "No routing-profile found under this application"
  fi

  ENV_ID=$(aws appconfig list-environments \
    --application-id "$APP_ID" --region "$REGION" \
    --query "Items[?Name=='dev'].Id" --output text 2>/dev/null)
  if is_valid "$ENV_ID"; then
    info "  Deleting environment dev (ID: $ENV_ID)..."
    aws appconfig delete-environment \
      --application-id "$APP_ID" --environment-id "$ENV_ID" \
      --deletion-protection-check BYPASS --region "$REGION"
  fi

  info "  Deleting application genai-model-gateway..."
  aws appconfig delete-application \
    --application-id "$APP_ID" --region "$REGION"
  ok "AppConfig (application + environment + profile + $VERSION_COUNT versions)"
else
  skip "AppConfig application genai-model-gateway"
fi

# ── Step 10: ECR ──────────────────────────────────────────────────────────────

step "Step 10 / 12 — ECR Repository"

if aws ecr describe-repositories --repository-names genai-model-gateway \
    --region "$REGION" &>/dev/null; then
  IMAGE_COUNT=$(aws ecr list-images --repository-name genai-model-gateway --region "$REGION" \
    --query "length(imageIds)" --output text 2>/dev/null)
  info "Found repository with $IMAGE_COUNT image(s)"
  info "Deleting repository (--force removes all images)..."
  aws ecr delete-repository \
    --repository-name genai-model-gateway --force --region "$REGION" > /dev/null
  ok "ECR repository genai-model-gateway ($IMAGE_COUNT image(s) removed)"
else
  skip "ECR repository genai-model-gateway"
fi

# ── Step 11: CloudWatch alarms + SNS ─────────────────────────────────────────

step "Step 11 / 12 — CloudWatch Alarms & SNS Topic"

EXISTING_ALARMS=$(aws cloudwatch describe-alarms \
  --alarm-names gateway-degraded-responses gateway-fallback-rate \
  --region "$REGION" \
  --query "MetricAlarms[].AlarmName" --output text 2>/dev/null)

if [[ -n "$EXISTING_ALARMS" ]]; then
  for alarm in $EXISTING_ALARMS; do
    info "Found alarm: $alarm"
  done
  aws cloudwatch delete-alarms \
    --alarm-names gateway-degraded-responses gateway-fallback-rate --region "$REGION"
  ok "CloudWatch alarms (gateway-degraded-responses, gateway-fallback-rate)"
else
  skip "CloudWatch alarms"
fi

TOPIC_ARN=$(aws sns list-topics --region "$REGION" \
  --query "Topics[?contains(TopicArn,'gateway-alerts')].TopicArn" \
  --output text 2>/dev/null)

if is_valid "$TOPIC_ARN"; then
  SUB_COUNT=$(aws sns list-subscriptions-by-topic --topic-arn "$TOPIC_ARN" --region "$REGION" \
    --query "length(Subscriptions)" --output text 2>/dev/null)
  info "Found SNS topic: $TOPIC_ARN ($SUB_COUNT subscription(s))"
  aws sns delete-topic --topic-arn "$TOPIC_ARN" --region "$REGION"
  ok "SNS topic gateway-alerts"
else
  skip "SNS topic gateway-alerts"
fi

# ── Step 12: CloudWatch log group ─────────────────────────────────────────────

step "Step 12 / 12 — CloudWatch Log Group"

if aws logs describe-log-groups \
    --log-group-name-prefix /ecs/genai-model-gateway \
    --region "$REGION" \
    --query "logGroups[0].logGroupName" --output text 2>/dev/null | \
    grep -q "/ecs/genai-model-gateway"; then
  STORED_BYTES=$(aws logs describe-log-groups \
    --log-group-name-prefix /ecs/genai-model-gateway --region "$REGION" \
    --query "logGroups[0].storedBytes" --output text 2>/dev/null)
  info "Found log group: /ecs/genai-model-gateway (stored bytes: $STORED_BYTES)"
  aws logs delete-log-group \
    --log-group-name /ecs/genai-model-gateway --region "$REGION"
  ok "CloudWatch log group /ecs/genai-model-gateway"
else
  skip "CloudWatch log group /ecs/genai-model-gateway"
fi

# ── Executive Summary ─────────────────────────────────────────────────────────

ELAPSED=$((SECONDS - START_SECONDS))
D_COUNT=${#DELETED[@]}
S_COUNT=${#SKIPPED[@]}
F_COUNT=${#FAILED[@]}

echo ""
echo -e "${BOLD}╔══════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}║            CLEANUP EXECUTIVE SUMMARY                ║${RESET}"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
printf "${BOLD}║${RESET}  %-52s${BOLD}║${RESET}\n" "Region:  $REGION"
printf "${BOLD}║${RESET}  %-52s${BOLD}║${RESET}\n" "Elapsed: ${ELAPSED}s"
echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"

printf "${BOLD}║${RESET}  ${GREEN}✓ Deleted  (%2d)${RESET}%-38s${BOLD}║${RESET}\n" "$D_COUNT" ""
for item in "${DELETED[@]}"; do
  printf "${BOLD}║${RESET}    ${GREEN}·${RESET} %-50s${BOLD}║${RESET}\n" "$item"
done

echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
printf "${BOLD}║${RESET}  ${YELLOW}– Skipped  (%2d)${RESET}%-38s${BOLD}║${RESET}\n" "$S_COUNT" ""
for item in "${SKIPPED[@]}"; do
  printf "${BOLD}║${RESET}    ${YELLOW}·${RESET} %-50s${BOLD}║${RESET}\n" "$item"
done

if [ "$F_COUNT" -gt 0 ]; then
  echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
  printf "${BOLD}║${RESET}  ${RED}✗ Failed   (%2d)${RESET}%-38s${BOLD}║${RESET}\n" "$F_COUNT" ""
  for item in "${FAILED[@]}"; do
    printf "${BOLD}║${RESET}    ${RED}·${RESET} %-50s${BOLD}║${RESET}\n" "$item"
  done
fi

echo -e "${BOLD}╠══════════════════════════════════════════════════════╣${RESET}"
if [ "$F_COUNT" -eq 0 ]; then
  echo -e "${BOLD}║${RESET}  ${GREEN}Ready for: cd infra && cdk deploy${RESET}               ${BOLD}║${RESET}"
else
  echo -e "${BOLD}║${RESET}  ${RED}Fix failed items above before cdk deploy${RESET}        ${BOLD}║${RESET}"
fi
echo -e "${BOLD}╚══════════════════════════════════════════════════════╝${RESET}"
