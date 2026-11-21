import os

import aws_cdk as cdk
from aws_cdk import (
    aws_appconfig as appconfig,
    aws_cloudwatch as cloudwatch,
    aws_cloudwatch_actions as cw_actions,
    aws_dynamodb as dynamodb,
    aws_ec2 as ec2,
    aws_ecr as ecr,
    aws_ecs as ecs,
    aws_elasticloadbalancingv2 as elbv2,
    aws_iam as iam,
    aws_logs as logs,
    aws_sns as sns,
)
from constructs import Construct

REGION = "ap-southeast-2"
ACCOUNT_ID = "415744340135"

# All models this service is allowed to call.
INFERENCE_PROFILE_ARNS = [
    f"arn:aws:bedrock:{REGION}:{ACCOUNT_ID}:application-inference-profile/pj4kpzyk2sjx",
    f"arn:aws:bedrock:{REGION}:{ACCOUNT_ID}:application-inference-profile/o25xwte95y5w",
    f"arn:aws:bedrock:{REGION}:{ACCOUNT_ID}:application-inference-profile/we7dyxlwu9zk",
]
MISTRAL_ARN = f"arn:aws:bedrock:{REGION}::foundation-model/mistral.ministral-3-3b-instruct"
# Application inference profiles resolve to this underlying model at call time —
# AWS checks InvokeModel permission on both the profile ARN and the foundation model ARN.
NOVA_MICRO_ARN = f"arn:aws:bedrock:{REGION}::foundation-model/amazon.nova-micro-v1:0"


class GenAIGatewayStack(cdk.Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ── Storage ────────────────────────────────────────────────────────────

        breaker_table = dynamodb.Table(
            self, "BreakerTable",
            table_name="model-gateway-breaker",
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            partition_key=dynamodb.Attribute(
                name="model_id",
                type=dynamodb.AttributeType.STRING,
            ),
            time_to_live_attribute="expires_at",
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        # ── AppConfig ──────────────────────────────────────────────────────────

        appconfig_app = appconfig.CfnApplication(
            self, "AppConfigApp",
            name="genai-model-gateway",
        )

        appconfig_env = appconfig.CfnEnvironment(
            self, "AppConfigEnv",
            application_id=appconfig_app.ref,
            name="dev",
            deletion_protection_check="BYPASS",
        )

        appconfig_profile = appconfig.CfnConfigurationProfile(
            self, "AppConfigProfile",
            application_id=appconfig_app.ref,
            name="routing-profile",
            location_uri="hosted",
            deletion_protection_check="BYPASS",
        )

        config_path = os.path.join(os.path.dirname(__file__), "..", "config", "routing_profile.json")
        with open(config_path) as f:
            routing_config_content = f.read()

        appconfig_version = appconfig.CfnHostedConfigurationVersion(
            self, "AppConfigVersion",
            application_id=appconfig_app.ref,
            configuration_profile_id=appconfig_profile.ref,
            content=routing_config_content,
            content_type="application/json",
        )

        # Instant rollout: 0 minutes bake time, 100% growth, no replication.
        appconfig_strategy = appconfig.CfnDeploymentStrategy(
            self, "AppConfigStrategy",
            name="genai-gateway-instant",
            deployment_duration_in_minutes=0,
            growth_factor=100,
            replicate_to="NONE",
            final_bake_time_in_minutes=0,
            growth_type="LINEAR",
        )

        appconfig.CfnDeployment(
            self, "AppConfigDeployment",
            application_id=appconfig_app.ref,
            environment_id=appconfig_env.ref,
            configuration_profile_id=appconfig_profile.ref,
            configuration_version=cdk.Token.as_string(appconfig_version.attr_version_number),
            deployment_strategy_id=appconfig_strategy.ref,
        )

        # ── Container Registry ─────────────────────────────────────────────────

        ecr_repo = ecr.Repository(
            self, "EcrRepo",
            repository_name="genai-model-gateway",
            image_tag_mutability=ecr.TagMutability.MUTABLE,
            image_scan_on_push=True,
            removal_policy=cdk.RemovalPolicy.RETAIN,
        )

        # ── IAM ────────────────────────────────────────────────────────────────

        exec_role = iam.Role(
            self, "EcsExecRole",
            role_name="ecsTaskExecutionRole",
            assumed_by=iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
            managed_policies=[
                iam.ManagedPolicy.from_aws_managed_policy_name(
                    "service-role/AmazonECSTaskExecutionRolePolicy"
                )
            ],
        )

        # genai-gateway-task-role is the role the application code assumes at
        # runtime — Bedrock calls, DynamoDB reads/writes, AppConfig polls, CloudWatch metrics.
        task_role = iam.Role(
            self, "TaskRole",
            role_name="genai-gateway-task-role",
            assumed_by=iam.ServicePrincipal(
                "ecs-tasks.amazonaws.com",
                conditions={
                    "StringEquals": {"aws:SourceAccount": self.account},
                },
            ),
        )

        task_role.add_to_policy(iam.PolicyStatement(
            sid="BedrockInvoke",
            actions=["bedrock:InvokeModel"],
            resources=INFERENCE_PROFILE_ARNS + [MISTRAL_ARN, NOVA_MICRO_ARN],
        ))

        task_role.add_to_policy(iam.PolicyStatement(
            sid="DynamoDBBreaker",
            actions=["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"],
            resources=[breaker_table.table_arn],
        ))

        task_role.add_to_policy(iam.PolicyStatement(
            sid="AppConfigRead",
            actions=[
                "appconfig:StartConfigurationSession",
                "appconfig:GetLatestConfiguration",
            ],
            resources=[
                f"arn:aws:appconfig:{self.region}:{self.account}"
                f":application/{appconfig_app.ref}"
                f"/environment/{appconfig_env.ref}"
                f"/configuration/{appconfig_profile.ref}"
            ],
        ))

        task_role.add_to_policy(iam.PolicyStatement(
            sid="CloudWatchMetrics",
            actions=["cloudwatch:PutMetricData"],
            resources=["*"],
            conditions={"StringEquals": {"cloudwatch:namespace": "GenAIGateway"}},
        ))

        # ── Networking ─────────────────────────────────────────────────────────

        # from_lookup resolves the default VPC at synth time (requires AWS creds).
        # CDK caches the result in cdk.context.json after the first `cdk synth`.
        vpc = ec2.Vpc.from_lookup(self, "DefaultVpc", is_default=True)

        # ALB SG: internet → port 80 → ALB.
        # allow_all_outbound=False so we control exactly what the ALB forwards to.
        alb_sg = ec2.SecurityGroup(
            self, "AlbSg",
            vpc=vpc,
            security_group_name="genai-gateway-alb-sg",
            description="Allows HTTP inbound from internet; forwards to task SG on 8000",
            allow_all_outbound=False,
        )
        alb_sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(80))

        # Task SG: only the ALB SG may reach port 8000.
        task_sg = ec2.SecurityGroup(
            self, "TaskSg",
            vpc=vpc,
            security_group_name="genai-gateway-task-sg",
            description="Allows port 8000 from ALB SG only",
            allow_all_outbound=True,
        )
        task_sg.add_ingress_rule(alb_sg, ec2.Port.tcp(8000))

        # Complete the ALB → task path.
        alb_sg.add_egress_rule(task_sg, ec2.Port.tcp(8000))

        # ── Load Balancer ──────────────────────────────────────────────────────

        alb = elbv2.ApplicationLoadBalancer(
            self, "Alb",
            vpc=vpc,
            internet_facing=True,
            security_group=alb_sg,
            load_balancer_name="genai-gateway-alb",
        )

        target_group = elbv2.ApplicationTargetGroup(
            self, "TargetGroup",
            vpc=vpc,
            target_group_name="genai-gateway-tg",
            # Must be IP (not Instance) because Fargate tasks have no EC2 instance behind them.
            target_type=elbv2.TargetType.IP,
            port=8000,
            protocol=elbv2.ApplicationProtocol.HTTP,
            health_check=elbv2.HealthCheck(
                path="/health",
                healthy_threshold_count=2,
                unhealthy_threshold_count=3,
                interval=cdk.Duration.seconds(30),
                timeout=cdk.Duration.seconds(5),
            ),
        )

        alb.add_listener(
            "HttpListener",
            port=80,
            default_target_groups=[target_group],
        )

        # ── ECS ────────────────────────────────────────────────────────────────

        log_group = logs.LogGroup(
            self, "LogGroup",
            log_group_name="/ecs/genai-model-gateway",
            retention=logs.RetentionDays.ONE_MONTH,
            removal_policy=cdk.RemovalPolicy.DESTROY,
        )

        cluster = ecs.Cluster(
            self, "Cluster",
            vpc=vpc,
            cluster_name="genai-gateway",
        )

        task_def = ecs.FargateTaskDefinition(
            self, "TaskDef",
            family="genai-model-gateway",
            cpu=256,
            memory_limit_mib=512,
            task_role=task_role,
            execution_role=exec_role,
        )

        task_def.add_container(
            "GatewayContainer",
            image=ecs.ContainerImage.from_ecr_repository(ecr_repo, "latest"),
            container_name="genai-model-gateway",
            port_mappings=[ecs.PortMapping(container_port=8000)],
            environment={
                "AWS_DEFAULT_REGION": REGION,
                # Pass the CDK-managed IDs at deploy time so config.py never needs updating.
                "APPCONFIG_APP_ID": appconfig_app.ref,
                "APPCONFIG_ENV_ID": appconfig_env.ref,
                "APPCONFIG_PROFILE_ID": appconfig_profile.ref,
                "BREAKER_TABLE": "model-gateway-breaker",
            },
            logging=ecs.LogDrivers.aws_logs(
                stream_prefix="gateway",
                log_group=log_group,
            ),
            health_check=ecs.HealthCheck(
                command=["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"],
                interval=cdk.Duration.seconds(30),
                timeout=cdk.Duration.seconds(5),
                start_period=cdk.Duration.seconds(15),
                retries=3,
            ),
        )

        service = ecs.FargateService(
            self, "Service",
            cluster=cluster,
            task_definition=task_def,
            service_name="genai-model-gateway",
            # Stopped by default to avoid AWS costs; set to 1 before testing.
            desired_count=0,
            security_groups=[task_sg],
            assign_public_ip=True,
            vpc_subnets=ec2.SubnetSelection(subnet_type=ec2.SubnetType.PUBLIC),
            # Roll back automatically if new tasks fail to reach RUNNING state.
            circuit_breaker=ecs.DeploymentCircuitBreaker(rollback=True),
            # 100% ensures no task is stopped before a replacement is healthy.
            min_healthy_percent=100,
        )

        service.attach_to_application_target_group(target_group)

        # ── Observability ──────────────────────────────────────────────────────

        alert_topic = sns.Topic(
            self, "AlertTopic",
            topic_name="gateway-alerts",
            display_name="GenAI Gateway Alerts",
        )

        degraded_alarm = cloudwatch.Alarm(
            self, "DegradedAlarm",
            alarm_name="gateway-degraded-responses",
            alarm_description="Fires when any request returns a degraded (empty) response — all models failed",
            metric=cloudwatch.Metric(
                namespace="GenAIGateway",
                metric_name="DegradedResponse",
                statistic="Sum",
                period=cdk.Duration.minutes(1),
            ),
            threshold=0,
            comparison_operator=cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            evaluation_periods=1,
            treat_missing_data=cloudwatch.TreatMissingData.NOT_BREACHING,
        )
        degraded_alarm.add_alarm_action(cw_actions.SnsAction(alert_topic))

        fallback_alarm = cloudwatch.Alarm(
            self, "FallbackAlarm",
            alarm_name="gateway-fallback-rate",
            alarm_description="Fires when fallback invocations exceed 10 in a 5-minute window",
            metric=cloudwatch.Metric(
                namespace="GenAIGateway",
                metric_name="FallbackInvoked",
                statistic="Sum",
                period=cdk.Duration.minutes(5),
            ),
            threshold=10,
            comparison_operator=cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
            evaluation_periods=1,
            treat_missing_data=cloudwatch.TreatMissingData.NOT_BREACHING,
        )
        fallback_alarm.add_alarm_action(cw_actions.SnsAction(alert_topic))

        # ── Outputs ────────────────────────────────────────────────────────────

        cdk.CfnOutput(self, "AlbEndpoint",
            value=f"http://{alb.load_balancer_dns_name}",
            description="Public endpoint — POST /v1/generate, GET /health",
        )
        cdk.CfnOutput(self, "EcrImageUri",
            value=f"{ecr_repo.repository_uri}:latest",
            description="ECR image URI to push to",
        )
        cdk.CfnOutput(self, "AlertTopicArn",
            value=alert_topic.topic_arn,
            description="Subscribe your email here to receive alarm notifications",
        )
