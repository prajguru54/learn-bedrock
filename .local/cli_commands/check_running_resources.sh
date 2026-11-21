REGION=ap-southeast-2

echo "=== EC2 Instances (running) ===" && \
aws ec2 describe-instances --region $REGION \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[*].Instances[*].{ID:InstanceId,Type:InstanceType}" \
  --output table

echo "=== RDS Instances ===" && \
aws rds describe-db-instances --region $REGION \
  --query "DBInstances[*].{ID:DBInstanceIdentifier,Class:DBInstanceClass,Status:DBInstanceStatus}" \
  --output table

echo "=== ECS Tasks (running) ===" && \
for cluster in $(aws ecs list-clusters --region $REGION --query "clusterArns[]" --output text); do
  aws ecs list-tasks --region $REGION --cluster $cluster --query "taskArns" --output text
done

echo "=== Load Balancers ===" && \
aws elbv2 describe-load-balancers --region $REGION \
  --query "LoadBalancers[*].{Name:LoadBalancerName,State:State.Code,Type:Type}" \
  --output table

echo "=== NAT Gateways ===" && \
aws ec2 describe-nat-gateways --region $REGION \
  --filter "Name=state,Values=available" \
  --query "NatGateways[*].{ID:NatGatewayId,VPC:VpcId}" \
  --output table

echo "=== Elastic IPs (unattached) ===" && \
aws ec2 describe-addresses --region $REGION \
  --query "Addresses[?AssociationId==null].{IP:PublicIp,AllocationId:AllocationId}" \
  --output table

echo "=== OpenSearch Domains ===" && \
aws opensearch list-domain-names --region $REGION \
  --query "DomainNames[*].DomainName" --output table