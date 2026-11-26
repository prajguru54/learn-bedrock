# Amazon Bedrock Learning Repository

A hands-on learning repository for building production-oriented generative AI applications with Amazon Bedrock using Python, Boto3, FastAPI, Docker, CDK, and AWS-managed services.

The repository also tracks preparation for the **AWS Certified Generative AI Developer - Professional (AIP-C01)** certification.

## Repository Goals

- Learn Bedrock APIs and AWS service integration through small, runnable applications.
- Progress from first model calls to RAG, agents, Guardrails, resilience, observability, and deployment.
- Practice architecture and operational patterns covered by the AIP-C01 exam.
- Keep deployable projects independent with their own Python environments and infrastructure.

## Projects

| Project | Purpose | Main AWS and application technologies |
|---|---|---|
| [GenAI Model Gateway](./genai-model-gateway/) | FastAPI gateway for Bedrock tasks with dynamic routing, fallback, a DynamoDB-backed circuit breaker, and CloudWatch metrics | Bedrock, AppConfig, DynamoDB, ECS Fargate, ALB, ECR, CloudWatch, CDK |

Additional directories:

- [`docs/`](./docs/) contains certification study material and domain documentation.
- [`prompts/`](./prompts/) contains reusable study-plan and documentation prompts.
- [AIP-C01 Exam Guide](./aip_01_exam_guide.md) provides the certification domain and task reference.
- [Developer Background](./my_background.md) describes the learning approach and prior experience.

## Recommended Learning Path

1. Review the **AIP-C01 exam guide** and the topic-specific material in [`docs/`](./docs/).
2. Build and study the **GenAI Model Gateway**:
   - Route tasks by configuration.
   - Add fallback and circuit-breaker behavior.
   - Package the service in Docker.
   - Deploy it with AWS CDK to ECS Fargate.
   - Evaluate latency and publish operational metrics.
3. Add new deployable projects incrementally so each project remains independently runnable and deployable.

Each project should be developed and run independently. This repository does not use a root-level Python workspace.

## Prerequisites

Common prerequisites for AWS-backed examples:

- Python 3.12 or later
- [uv](https://docs.astral.sh/uv/) package manager
- AWS CLI v2
- AWS account credentials configured locally
- Bedrock model access enabled in the AWS region used by the project
- Node.js and AWS CDK for CDK projects

Verify the local setup:

```bash
python --version
uv --version
aws --version
aws sts get-caller-identity
```

For the model gateway:

```bash
cd genai-model-gateway
uv sync
cp .env.example .env
```

Follow the project README for required environment variables, AWS resources, deployment steps, and cleanup instructions.

## AWS Security and Cost

- Use IAM roles and least-privilege policies for AWS workloads.
- Prefer temporary AWS credentials or AWS IAM Identity Center over long-lived access keys.
- Do not commit `.env` files, AWS credentials, secrets, or private resource identifiers.
- Bedrock usage, ECS tasks, load balancers, databases, vector storage, and supporting resources may incur AWS charges.
- Run teardown steps after demonstrations to avoid unnecessary recurring costs.

For detailed setup or operational instructions, always use the README inside the relevant project because resource names and deployment configurations are project-specific.
