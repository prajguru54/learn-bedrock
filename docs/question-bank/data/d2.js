window.QB = window.QB || [];
window.QB.push(
  {
    id: "d2-2.1-01",
    domain: 2, task: "2.1", skills: ["2.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A telecom company is building a customer assistant on AWS. Billing questions, technical-support questions, and plan-upgrade questions each need a different specialist agent with its own instructions and tools. Incoming user messages must be classified and routed to the right specialist, and the conversation history must be preserved across turns even when different specialists handle consecutive messages. The team wants an AWS-native open-source framework that provides this routing with the LEAST custom code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Write a Lambda function that uses regular expressions to detect keywords and calls a different Amazon Bedrock model for each topic." },
      { id: "B", text: "Use AWS Agent Squad with a classifier that routes each message to a specialist agent and a conversation storage component that keeps history per user and session." },
      { id: "C", text: "Create one Amazon Bedrock Knowledge Base per topic and attach all of them to a single RetrieveAndGenerate call." },
      { id: "D", text: "Fine-tune a single foundation model on all three topics and use a very long system prompt to describe each role." }
    ],
    answer: ["B"],
    explanation: "AWS Agent Squad (formerly Multi-Agent Orchestrator) is an open-source framework in which a classifier selects the best agent for each user message and a storage component keeps conversation history per user and session, so context follows the user across specialists. This directly provides routing plus shared memory with minimal custom code.",
    whyWrong: {
      "A": "Keyword regexes are brittle, do not understand intent, and you would have to build the history sharing yourself.",
      "C": "Knowledge Bases provide retrieval over documents. They do not give you specialist agents with their own tools, nor intent-based routing between them.",
      "D": "Fine-tuning plus one giant prompt gives no separate tools or instructions per specialist and is far more effort than a routing framework."
    },
    services: ["AWS Agent Squad", "Amazon Bedrock"],
    tags: ["agent-squad", "multi-agent", "routing", "memory"]
  },
  {
    id: "d2-2.1-02",
    domain: 2, task: "2.1", skills: ["2.1.7"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A retailer wants its agents to look up order status and product stock through the Model Context Protocol (MCP). Each tool call is a short, stateless query against an existing REST API. Traffic is low and unpredictable, with long idle periods, and the team wants the LEAST operational overhead and no cost while idle. Where should the MCP server be hosted?",
    choices: [
      { id: "A", text: "On an Amazon ECS service on Amazon EC2 with a minimum of three tasks behind a Network Load Balancer." },
      { id: "B", text: "On an Amazon EKS cluster with a dedicated node group for the MCP server." },
      { id: "C", text: "On an AWS Lambda function that implements a stateless MCP server and is invoked only when an agent calls a tool." },
      { id: "D", text: "On an Amazon EC2 Auto Scaling group that keeps one instance running at all times." }
    ],
    answer: ["C"],
    explanation: "Lightweight, stateless tools with spiky or low traffic are the textbook fit for a Lambda-hosted MCP server: no servers to manage, scale to zero, and pay per invocation. ECS is better for complex tools that need long-running processes, persistent connections, or larger runtimes.",
    whyWrong: {
      "A": "A fixed minimum of three always-on tasks plus a load balancer costs money while idle and adds operational work for a trivial stateless tool.",
      "B": "An EKS cluster has the highest operational burden and is unjustified for simple stateless lookups.",
      "D": "An always-on instance costs money while idle and you must patch and scale it yourself."
    },
    services: ["AWS Lambda", "Amazon ECS", "Model Context Protocol"],
    tags: ["mcp", "lambda", "tool-integration"]
  },
  {
    id: "d2-2.1-03",
    domain: 2, task: "2.1", skills: ["2.1.2", "2.1.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A company implements a ReAct-style research agent as an AWS Step Functions state machine. Each loop iteration invokes Amazon Bedrock to reason, then invokes a Lambda tool, then loops back. During testing, one run kept calling tools for hours because the model never reached a final answer, generating a large bill. The company must put guardrails around the loop and limit what the tools can touch. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Maintain an iteration counter in the state input and add a Choice state that exits the loop to a fallback or Fail state when the counter reaches a maximum or when the model returns a final answer." },
      { id: "B", text: "Add an instruction to the system prompt asking the model to stop after five steps and rely on it to comply." },
      { id: "C", text: "Give the tool Lambda functions execution roles that grant only the specific resources and actions each tool needs, so a misbehaving loop cannot reach anything else." },
      { id: "D", text: "Increase the model temperature so that the agent is more likely to produce a different, terminating answer." },
      { id: "E", text: "Create an Amazon CloudWatch alarm on Bedrock spend and review the alarm the next business day." }
    ],
    answer: ["A", "C"],
    explanation: "A deterministic stopping condition lives outside the model: a counter plus a Choice state guarantees the loop terminates regardless of model behavior. Least-privilege IAM execution roles for tools enforce a resource boundary, so even a runaway or manipulated agent cannot act beyond its allowed scope.",
    whyWrong: {
      "B": "Prompt instructions are probabilistic. The model can ignore them, so they cannot be the only safeguard.",
      "D": "Temperature changes randomness, not whether the loop terminates, and it makes behavior less predictable.",
      "E": "An after-the-fact alarm reviewed the next day detects the problem too late and does not stop or contain the loop."
    },
    services: ["AWS Step Functions", "AWS Lambda", "AWS IAM", "Amazon Bedrock"],
    tags: ["react", "stopping-conditions", "least-privilege", "safeguards"]
  },
  {
    id: "d2-2.1-04",
    domain: 2, task: "2.1", skills: ["2.1.5"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A bank uses a Step Functions workflow in which a foundation model drafts customer-facing loan decision letters. Any letter above a risk threshold must be approved by a human reviewer before it is sent. The workflow must pause without consuming compute while waiting, which can take days, and then resume with the reviewer's decision. Which design meets these requirements with the LEAST custom orchestration code?",
    choices: [
      { id: "A", text: "Use a Task state with the waitForTaskToken integration pattern. Send the task token to the reviewer in an Amazon SNS notification, and have an Amazon API Gateway endpoint call SendTaskSuccess or SendTaskFailure with the token when the reviewer decides." },
      { id: "B", text: "Use a Wait state of 24 hours followed by a Lambda function that polls a DynamoDB table for the decision, looping until a decision exists." },
      { id: "C", text: "Run a Lambda function that sleeps until the reviewer responds, with the function timeout extended." },
      { id: "D", text: "Send every letter automatically and ask reviewers to recall letters that were wrong." }
    ],
    answer: ["A"],
    explanation: "The callback (waitForTaskToken) pattern pauses the execution until an external system returns the token with SendTaskSuccess or SendTaskFailure. Standard workflows can wait up to a year at no compute cost, and API Gateway gives the reviewer a feedback endpoint. This is the canonical human-in-the-loop approval pattern.",
    whyWrong: {
      "B": "Polling loops add state transitions, cost, and custom code, and the fixed wait wastes time or checks too often.",
      "C": "A Lambda function has a hard maximum timeout of 15 minutes and would be paid for while idle, so it cannot wait days.",
      "D": "This removes the approval control entirely. Sending first and recalling later violates the requirement."
    },
    services: ["AWS Step Functions", "Amazon API Gateway", "Amazon SNS"],
    tags: ["human-in-the-loop", "callback-pattern", "task-token"]
  },
  {
    id: "d2-2.2-01",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "multi",
    difficulty: "medium",
    source: "official",
    stem: "A financial services company is developing a research agent that processes complex financial data queries. The company must deploy existing Python agent code to Amazon Bedrock AgentCore Runtime. The company wants to reduce infrastructure management overhead and operational complexity.\n\nThe agent must be able to handle quick data lookups that require sub-second responses. The agent must be able to handle comprehensive research report generation. For example, streaming responses over several minutes. The solution must automatically manage HTTP server configuration, endpoint routing, and health monitoring.\n\nWhich deployment approaches will meet these requirements with MINIMAL operational overhead? (Select TWO)",
    choices: [
      { id: "A", text: "Implement the AgentCore SDK with the @app.entrypoint decorator to automatically handle server setup and endpoint management." },
      { id: "B", text: "Implement a FastAPI server with a configuration of /invocations and /ping endpoints and container orchestration." },
      { id: "C", text: "Deploy the agent on Amazon SageMaker AI real-time endpoints by using a custom inference container." },
      { id: "D", text: "Deploy the agent by using the AgentCore starter toolkit for automated packaging, containerization, and deployment workflows." },
      { id: "E", text: "Deploy the agent on Amazon ECS on AWS Fargate by using a custom container image that runs the AgentCore SDK application." }
    ],
    answer: ["A", "D"],
    explanation: "[Answer inferred - not from an official key.] The AgentCore SDK's @app.entrypoint decorator wraps existing Python agent code and automatically provides the HTTP server, the /invocations and /ping endpoints, and health handling. The AgentCore starter toolkit then automates packaging, containerization, and deployment to AgentCore Runtime. Together they minimize operational work.",
    whyWrong: {
      "B": "Hand-building a FastAPI server with /invocations and /ping and orchestrating containers is a valid contract but is exactly the server and endpoint management the company wants to avoid.",
      "C": "SageMaker AI real-time endpoints are not an AgentCore Runtime deployment and add endpoint and container management.",
      "E": "ECS on Fargate does not deploy to AgentCore Runtime and requires managing images, services, and load balancing yourself."
    },
    services: ["Amazon Bedrock AgentCore", "AgentCore Runtime"],
    tags: ["agentcore", "runtime", "deployment", "starter-toolkit"]
  },
  {
    id: "d2-2.2-02",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A contact-center company runs an Amazon Bedrock based summarization feature that receives steady, high request volume during business hours every day. During peaks the application receives ThrottlingException errors from on-demand inference, which delays agents. The company needs guaranteed model throughput and consistent performance for a committed period and accepts a commitment for a predictable cost. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Purchase Amazon Bedrock Provisioned Throughput (model units) for the model used by the application." },
      { id: "B", text: "Set reserved concurrency on the Lambda function that calls Amazon Bedrock." },
      { id: "C", text: "Add a client-side retry loop with a fixed one-second delay." },
      { id: "D", text: "Move the feature to a cheaper foundation model and keep on-demand inference." }
    ],
    answer: ["A"],
    explanation: "Provisioned Throughput reserves dedicated model capacity measured in model units for a commitment term (or no-commitment hourly), giving predictable throughput and cost for steady heavy workloads. On-demand inference shares capacity and is subject to account quotas and throttling during bursts.",
    whyWrong: {
      "B": "Lambda reserved concurrency limits the function's concurrency. It does not increase Bedrock model capacity and could throttle your own callers further.",
      "C": "Fixed-delay retries cause synchronized retry storms and do not add capacity. It also is not guaranteed throughput.",
      "D": "A different model still runs on shared on-demand capacity and may be throttled, and it may reduce quality."
    },
    services: ["Amazon Bedrock", "Bedrock Provisioned Throughput"],
    tags: ["provisioned-throughput", "throttling", "deployment"]
  },
  {
    id: "d2-2.2-03",
    domain: 2, task: "2.2", skills: ["2.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company must self-host a 70-billion-parameter open-weight LLM because of licensing and data-handling rules. The model's weights are too large for the memory of a single GPU. The team wants an Amazon SageMaker AI deployment that handles model sharding across GPUs, optimized batching, and token-streaming support without writing a custom serving stack. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Deploy to a SageMaker AI real-time endpoint on a multi-GPU instance by using a large model inference (LMI) container configured with tensor parallelism across the GPUs." },
      { id: "B", text: "Deploy to a CPU-based instance with a large amount of memory and rely on the model being loaded in 8-bit mode." },
      { id: "C", text: "Package the model weights in an AWS Lambda container image with 10 GB of memory." },
      { id: "D", text: "Deploy the model on a single-GPU instance and use a batch transform job for all requests." }
    ],
    answer: ["A"],
    explanation: "LLMs differ from traditional ML models because weights exceed single-GPU memory and token generation needs continuous batching and streaming. SageMaker AI large model inference containers support sharding the model with tensor parallelism over multiple GPUs on an instance, optimized batching, and response streaming without a custom serving stack.",
    whyWrong: {
      "B": "CPU inference of a 70B model has unacceptable latency and throughput, and quantization alone does not solve serving needs.",
      "C": "Lambda has no GPU and its memory limit is far too small for the weights.",
      "D": "A single GPU cannot hold the model, and batch transform is offline and not interactive or streaming."
    },
    services: ["Amazon SageMaker AI"],
    tags: ["sagemaker", "lmi", "tensor-parallelism", "llm-deployment"]
  },
  {
    id: "d2-2.2-04",
    domain: 2, task: "2.2", skills: ["2.2.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A SaaS company uses a large premium foundation model for every request to its help-desk assistant. Analysis shows that most queries are simple FAQ-style questions and about 15 percent are complex multi-step troubleshooting requests. The company wants to reduce inference cost without making complex answers worse. Which approach is MOST cost-effective?",
    choices: [
      { id: "A", text: "Send every request to the premium model and lower maxTokens for all requests." },
      { id: "B", text: "Implement API-based model cascading: send each request to a smaller, cheaper model first, and escalate to the premium model only when a complexity check or confidence signal indicates the request needs it." },
      { id: "C", text: "Buy Provisioned Throughput for the premium model so that each token costs less." },
      { id: "D", text: "Fine-tune the premium model on the FAQ data and keep routing all traffic to it." }
    ],
    answer: ["B"],
    explanation: "Cascading handles routine queries with a small model and reserves the expensive model for the minority of hard queries, cutting average cost per request while preserving quality where it matters. The routing can be a simple classifier prompt, heuristic, or a managed routing capability.",
    whyWrong: {
      "A": "Lowering maxTokens truncates answers for complex questions, hurting quality, and still pays premium pricing for easy ones.",
      "C": "Provisioned Throughput is for guaranteed capacity and is a commitment cost. It is not a way to make a large model cheaper for a mixed workload.",
      "D": "Fine-tuning does not change which model serves each request, and it adds training and hosting cost."
    },
    services: ["Amazon Bedrock"],
    tags: ["model-cascading", "cost-optimization", "model-selection"]
  },
  {
    id: "d2-2.3-01",
    domain: 2, task: "2.3", skills: ["2.3.3"],
    type: "multi",
    difficulty: "medium",
    source: "official",
    stem: "A company needs secure authentication for a third-party application that uses Amazon Bedrock. The solution must integrate with the company's existing identity provider (IdP). The solution must maintain comprehensive audit logs of authentication and API calls. The solution must eliminate long-lived credentials and provide temporary access to Amazon Bedrock.\n\nWhich solutions will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Deploy AWS IAM Identity Center with SAML federation to the IdP. Configure custom permission sets that grant access to Amazon Bedrock." },
      { id: "B", text: "Create an IAM role and configure federation by using AWS STS AssumeRole API calls. Store the application's IAM user credentials in the application configuration." },
      { id: "C", text: "Implement an OpenID Connect (OIDC) integration with Amazon Cognito. Configure the integration to authenticate users through the IdP and exchange tokens for temporary AWS credentials. Configure the integration to allow the application to access Amazon Bedrock." },
      { id: "D", text: "Configure an Amazon API Gateway Lambda authorizer. Configure the authorizer to validate credentials against the company's LDAP server and then issue signed JSON Web Tokens (JWTs) for Amazon Bedrock access." },
      { id: "E", text: "Create IAM users for each employee that needs access to the application. Assign permissions through IAM policies. Implement credential rotation by using AWS Secrets Manager." }
    ],
    answer: ["A", "C"],
    explanation: "[Answer inferred - not from an official key.] IAM Identity Center with SAML federation and permission sets, and Amazon Cognito (identity pool) with OIDC federation exchanging IdP tokens for temporary STS credentials, both integrate with the existing IdP, issue only short-lived credentials, and are logged in AWS CloudTrail.",
    whyWrong: {
      "B": "Storing IAM user credentials in application configuration is a long-lived credential, which is what the company must eliminate.",
      "D": "Bedrock does not accept custom JWTs issued by a Lambda authorizer. Calls must be signed with AWS credentials, so this does not grant Bedrock access.",
      "E": "IAM users with access keys are long-lived credentials. Rotating them is not the same as temporary credentials, and it bypasses the existing IdP."
    },
    services: ["AWS IAM Identity Center", "Amazon Cognito", "AWS STS", "Amazon Bedrock"],
    tags: ["identity-federation", "temporary-credentials", "oidc", "saml"]
  },
  {
    id: "d2-2.3-02",
    domain: 2, task: "2.3", skills: ["2.3.1", "2.3.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company's third-party ticketing system sends a webhook whenever a support ticket is created, and it times out and retries if it does not receive an HTTP response within a few seconds. The company wants to add an AI-generated ticket summary that uses Amazon Bedrock, which can take 15 to 30 seconds for long tickets. Duplicate processing and lost tickets are not acceptable during traffic bursts. Which architecture meets these requirements?",
    choices: [
      { id: "A", text: "Configure the webhook to call an API Gateway endpoint that invokes a Lambda function, which calls Bedrock synchronously and returns the summary in the response." },
      { id: "B", text: "Configure the webhook to call an API Gateway endpoint integrated directly with an Amazon SQS queue so that it returns immediately after enqueueing. A Lambda function consumes the queue, invokes Bedrock, and writes the summary back through the ticketing system's API. Use a dead-letter queue for failures." },
      { id: "C", text: "Configure the webhook to write to an Amazon S3 bucket every minute and run a nightly Amazon EMR job that calls Bedrock." },
      { id: "D", text: "Run a long-polling process on an EC2 instance that repeatedly calls the ticketing system's API and invokes Bedrock for each new ticket." }
    ],
    answer: ["B"],
    explanation: "The webhook needs a fast acknowledgment, so the AI work must be decoupled. API Gateway to SQS returns quickly, the queue absorbs bursts and prevents loss, a Lambda consumer processes at a controlled rate with retries, and a DLQ captures poison messages. This is a loosely coupled event-driven integration.",
    whyWrong: {
      "A": "Holding the webhook open for up to 30 seconds will exceed the sender's timeout, triggering retries and duplicates.",
      "C": "A nightly batch is far too slow for ticket summaries and adds an unnecessary EMR cluster.",
      "D": "A self-managed polling instance adds operational overhead, no buffering or scaling, and ignores the webhook the system already provides."
    },
    services: ["Amazon API Gateway", "Amazon SQS", "AWS Lambda", "Amazon Bedrock"],
    tags: ["webhook", "event-driven", "sqs", "loose-coupling"]
  },
  {
    id: "d2-2.3-03",
    domain: 2, task: "2.3", skills: ["2.3.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A European insurer has on-premises claims systems connected to AWS with an existing AWS Direct Connect link. Regulations require that inference requests are processed only in EU Regions and that traffic from on-premises to Amazon Bedrock must not traverse the public internet. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Call the public Bedrock endpoint from on-premises through a NAT gateway and select a global cross-Region inference profile." },
      { id: "B", text: "Deploy AWS Outposts in the data center and run Amazon Bedrock models locally on the Outposts rack." },
      { id: "C", text: "Create an interface VPC endpoint for Bedrock Runtime in an EU VPC reachable over the Direct Connect private connection, and use an EU geographic cross-Region inference profile." },
      { id: "D", text: "Use Amazon CloudFront in front of the Bedrock endpoint and enable geo-restriction for EU viewers." }
    ],
    answer: ["C"],
    explanation: "An interface VPC endpoint (AWS PrivateLink) for bedrock-runtime lets on-premises clients reach Bedrock privately over Direct Connect (with DNS resolution to the endpoint). A geographic EU inference profile keeps cross-Region inference within EU Regions, satisfying the jurisdiction requirement.",
    whyWrong: {
      "A": "A NAT gateway sends traffic to the public endpoint over the internet, and a global profile can route to Regions outside the EU.",
      "B": "Outposts does not run Amazon Bedrock foundation models locally, so this does not provide Bedrock inference.",
      "D": "CloudFront geo-restriction controls who can view content. It does not provide private connectivity or constrain where inference is processed."
    },
    services: ["AWS Direct Connect", "AWS PrivateLink", "Amazon Bedrock"],
    tags: ["privatelink", "data-residency", "inference-profiles", "hybrid"]
  },
  {
    id: "d2-2.3-04",
    domain: 2, task: "2.3", skills: ["2.3.5"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A large enterprise has 12 business units that each call Amazon Bedrock directly from their own applications. The platform team needs centralized control over which models each unit can use, per-unit usage quotas, uniform logging, and the ability to change models without application releases. Which architecture meets these requirements?",
    choices: [
      { id: "A", text: "Give each business unit an IAM user with AmazonBedrockFullAccess and ask them to track their own usage." },
      { id: "B", text: "Build a GenAI gateway with Amazon API Gateway and Lambda in front of Bedrock. Use usage plans and API keys or authorizers per business unit, a mapping of logical model names to model IDs held in configuration, and centralized logging." },
      { id: "C", text: "Create a separate AWS account for each unit and share model access through email requests to the platform team." },
      { id: "D", text: "Use Amazon Route 53 weighted routing to distribute requests across the business units' applications." }
    ],
    answer: ["B"],
    explanation: "A GenAI gateway is a centralized abstraction layer that provides authentication, per-consumer throttling and quotas, logging and observability, and a logical-to-physical model mapping, so models can change without application changes. API Gateway usage plans and Lambda are natural building blocks.",
    whyWrong: {
      "A": "Full access for everyone defeats model-level control, and long-lived IAM users violate security best practices.",
      "C": "Separate accounts do not by themselves give uniform control, and the manual email process is not an enforcement mechanism.",
      "D": "Route 53 routes DNS queries. It does not enforce quotas, model access, or logging for Bedrock calls."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["genai-gateway", "governance", "usage-plans", "abstraction-layer"]
  },
  {
    id: "d2-2.4-01",
    domain: 2, task: "2.4", skills: ["2.4.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company is adding a chat assistant to its web portal. Users complain that they must wait for the full answer before seeing any text. The backend is a Lambda function that calls Amazon Bedrock. The company wants tokens to appear in the browser as they are generated, with the LEAST operational overhead. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Call the Bedrock Converse streaming API (ConverseStream) from the Lambda function and return the chunks to the browser by using Lambda response streaming through a function URL." },
      { id: "B", text: "Call InvokeModel in the Lambda function, split the completed text into chunks, and send chunks to the browser every 200 ms." },
      { id: "C", text: "Submit each prompt to an Amazon SQS queue and have the browser poll a DynamoDB table every second for the answer." },
      { id: "D", text: "Use Amazon Bedrock batch inference and display results when the job completes." }
    ],
    answer: ["A"],
    explanation: "ConverseStream (or InvokeModelWithResponseStream) returns tokens incrementally. Lambda response streaming via a function URL lets the function forward those chunks to the client as they arrive, so time to first token drops with no servers to manage.",
    whyWrong: {
      "B": "InvokeModel returns only after the full answer is generated, so the chunking is fake streaming and gives no latency benefit.",
      "C": "Queue plus polling adds latency and moving parts and is meant for asynchronous jobs, not live typing.",
      "D": "Batch inference is an offline, high-latency mode and cannot support interactive chat."
    },
    services: ["Amazon Bedrock", "AWS Lambda"],
    tags: ["streaming", "converse-stream", "lambda-response-streaming"]
  },
  {
    id: "d2-2.4-02",
    domain: 2, task: "2.4", skills: ["2.4.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A document-processing application uses boto3 to call Amazon Bedrock for thousands of documents in parallel. Intermittent ThrottlingException errors occur when parallelism spikes, and the current code fails the document on the first error. The team wants to handle transient throttling with the LEAST code change. Which solution meets this requirement?",
    choices: [
      { id: "A", text: "Wrap each call in a while True loop with a fixed time.sleep(1) between attempts." },
      { id: "B", text: "Configure the boto3 client with a botocore Config that sets the retry mode to standard or adaptive and increases max_attempts, so the SDK retries with exponential backoff and jitter." },
      { id: "C", text: "Disable retries and surface the error to users so they can resubmit manually." },
      { id: "D", text: "Replace Amazon Bedrock with a self-hosted model on a single EC2 instance." }
    ],
    answer: ["B"],
    explanation: "AWS SDKs include built-in retry handling with exponential backoff and jitter, configurable through retry mode and max attempts. The adaptive mode also applies client-side rate limiting in response to throttling errors. This addresses transient throttling with a configuration change.",
    whyWrong: {
      "A": "A fixed delay causes all workers to retry in lockstep, prolonging throttling, and an unbounded loop can retry forever.",
      "C": "This pushes recoverable errors onto users and gives poor reliability.",
      "D": "Replacing the platform is a drastic rewrite that does not address the transient throttling pattern and adds operational burden."
    },
    services: ["Amazon Bedrock", "AWS SDK for Python (Boto3)"],
    tags: ["retries", "exponential-backoff", "throttling", "boto3"]
  },
  {
    id: "d2-2.4-03",
    domain: 2, task: "2.4", skills: ["2.4.1"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A legal-tech company lets users upload contracts for AI summarization with Amazon Bedrock. Summaries of large contracts take several minutes and upload volume is bursty. Users must not have to keep a connection open, and no request may be lost when volume exceeds the model's request rate. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Have the API return a job ID after placing a message on an Amazon SQS queue, and let a consumer (Lambda or ECS) pull messages at a rate the model quota allows." },
      { id: "B", text: "Have the API invoke Bedrock synchronously and hold the HTTP connection open until the summary is ready." },
      { id: "C", text: "Have the consumer write the finished summary and status keyed by job ID to Amazon DynamoDB, and let the client poll a status endpoint or be notified when complete." },
      { id: "D", text: "Increase the Lambda function memory so that the model call completes faster than the burst." },
      { id: "E", text: "Write each document's text to Amazon CloudWatch Logs and have users search the log group for their summary." }
    ],
    answer: ["A", "C"],
    explanation: "Asynchronous processing decouples the user from model latency. SQS buffers bursts durably and lets consumers control the rate against Bedrock quotas, and storing status and results by job ID lets the client poll or be notified, so nothing requires an open connection.",
    whyWrong: {
      "B": "Holding a synchronous connection for minutes ties up clients and runs into integration timeouts and quota bursts, so requests can fail.",
      "D": "Lambda memory affects local compute, not model generation time or Bedrock quotas, so it will not absorb bursts.",
      "E": "Logs are not a result store or delivery mechanism and expose document content in an inappropriate place."
    },
    services: ["Amazon SQS", "AWS Lambda", "Amazon DynamoDB", "Amazon Bedrock"],
    tags: ["async-processing", "sqs", "job-status", "burst-buffering"]
  },
  {
    id: "d2-2.4-04",
    domain: 2, task: "2.4", skills: ["2.4.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company's text-processing API receives requests that are either code-generation tasks, long-document summaries, or short classification tasks. Each type performs best, and is cheapest, on a different foundation model, and the company expects to add new task types and swap models frequently. The company wants routing based on the content of each request, using managed orchestration with a visual definition. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Hardcode an if/else chain in the application on the request's path and redeploy the application whenever a model changes." },
      { id: "B", text: "Use an AWS Step Functions state machine that first calls a small model to classify the request, then uses a Choice state to route to a Task state that invokes the appropriate Bedrock model." },
      { id: "C", text: "Create an Amazon Route 53 weighted record per model and distribute requests randomly." },
      { id: "D", text: "Always send requests to the largest model and filter unwanted output with Bedrock Guardrails." }
    ],
    answer: ["B"],
    explanation: "Content-based dynamic routing fits Step Functions: a classification step determines the task type, a Choice state selects the branch, and each branch invokes a specific model through the Bedrock service integration. Adding a new task type or swapping a model is a change to the state machine definition, which is also visualized in Workflow Studio.",
    whyWrong: {
      "A": "Static routing in code works but requires a redeploy for each change, which conflicts with the frequent-change requirement and has no managed orchestration.",
      "C": "Route 53 weights are random and know nothing about request content.",
      "D": "Using the largest model for everything is expensive and Guardrails filter content for safety, not for model selection."
    },
    services: ["AWS Step Functions", "Amazon Bedrock"],
    tags: ["model-routing", "choice-state", "content-based-routing"]
  },
  {
    id: "d2-2.5-01",
    domain: 2, task: "2.5", skills: ["2.5.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An insurance company receives claim packages that contain scanned forms, photos of damage, and recorded customer phone calls. It wants consistent, structured JSON output (fields such as claimant, date, damage description, and call summary) from all of these modalities, with the LEAST custom integration code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Use Amazon Bedrock Data Automation to process the documents, images, and audio and return structured output based on blueprints, and orchestrate the intake with Step Functions or Lambda." },
      { id: "B", text: "Build separate pipelines that use Amazon Textract, Amazon Rekognition, and Amazon Transcribe, then write custom code to merge and normalize the outputs." },
      { id: "C", text: "Store all files in Amazon S3 and ask users to type the fields into a form." },
      { id: "D", text: "Use Amazon Comprehend to analyze the raw image and audio files directly." }
    ],
    answer: ["A"],
    explanation: "Bedrock Data Automation is a managed capability that extracts insights from unstructured multimodal content (documents, images, audio, video) into standardized structured output, with blueprints to define the fields to extract. It replaces stitching several services together.",
    whyWrong: {
      "B": "This can work, but it requires multiple services plus custom merge and normalization code, which is the overhead the company wants to avoid.",
      "C": "Manual entry defeats automation and does not scale.",
      "D": "Comprehend analyzes text. It cannot read raw image or audio files."
    },
    services: ["Amazon Bedrock Data Automation", "AWS Step Functions", "AWS Lambda"],
    tags: ["bedrock-data-automation", "multimodal", "document-processing"]
  },
  {
    id: "d2-2.5-02",
    domain: 2, task: "2.5", skills: ["2.5.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Product managers at a company want to prototype and iterate on a workflow that takes a customer review, runs a prompt to classify sentiment, branches on the result, and runs a different prompt to draft a reply. They do not write code, and developers want to call the finished workflow from applications through an API. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Build the workflow visually in Amazon Bedrock Prompt Flows by connecting prompt nodes and a condition node, then invoke the published flow alias from applications." },
      { id: "B", text: "Ask the product managers to write a Python script that uses boto3 and deploy it to an EC2 instance." },
      { id: "C", text: "Create a single very long prompt in a text file stored in Amazon S3 and ask the model to branch internally." },
      { id: "D", text: "Train a custom classifier in Amazon SageMaker AI and have a separate model generate the reply." }
    ],
    answer: ["A"],
    explanation: "Prompt Flows provides a visual, no-code builder to chain prompts, conditions, and other nodes. A flow can be versioned, given an alias, and invoked through the Bedrock API, which satisfies both the no-code authoring and the API consumption requirements.",
    whyWrong: {
      "B": "The users do not write code, and managing an EC2 instance adds overhead.",
      "C": "A single prompt gives no explicit, auditable branching or reusable nodes, and it cannot be versioned as a workflow.",
      "D": "Training a classifier is unnecessary for a simple prompt-based sentiment branch and is not no-code."
    },
    services: ["Amazon Bedrock Prompt Flows"],
    tags: ["prompt-flows", "no-code", "workflow-builder"]
  },
  {
    id: "d2-2.5-03",
    domain: 2, task: "2.5", skills: ["2.5.6"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A GenAI support application consists of API Gateway, a Lambda function, a vector store query, and an Amazon Bedrock call. Users report occasional bad answers and slow responses, and the team cannot tell which step is responsible or which prompts caused the problems. Which combination of actions will provide the data needed to troubleshoot with the LEAST effort? (Select TWO)",
    choices: [
      { id: "A", text: "Enable Amazon Bedrock model invocation logging to Amazon CloudWatch Logs and query prompts, responses, and token counts with CloudWatch Logs Insights." },
      { id: "B", text: "Enable AWS X-Ray tracing for API Gateway and Lambda so that each request shows per-segment latency across the retrieval and the Bedrock call." },
      { id: "C", text: "Review AWS CloudTrail management events to read the text of each prompt and response." },
      { id: "D", text: "Use AWS Cost Explorer to find which responses were incorrect." },
      { id: "E", text: "Use AWS Config rules to evaluate the quality of each model response." }
    ],
    answer: ["A", "B"],
    explanation: "Invocation logging captures the prompts, completions, and token usage, which Logs Insights can filter and aggregate to find bad-answer patterns. X-Ray traces requests across service boundaries so you can see whether time is spent in retrieval, Lambda, or the model call.",
    whyWrong: {
      "C": "CloudTrail records API calls as audit metadata. It does not contain the prompt and response text.",
      "D": "Cost Explorer shows spend, not the quality or content of answers.",
      "E": "AWS Config evaluates resource configuration compliance, not model output quality."
    },
    services: ["Amazon CloudWatch Logs", "AWS X-Ray", "Amazon Bedrock"],
    tags: ["troubleshooting", "invocation-logging", "xray", "logs-insights"]
  },
  {
    id: "d2-2.5-04",
    domain: 2, task: "2.5", skills: ["2.5.4"],
    type: "multi",
    difficulty: "medium",
    source: "official",
    stem: "A cross-functional team is developing a generative AI (GenAI) application by using AWS services. The team needs to optimize developer productivity and enforce consistent integration patterns. The team needs to automate performance tuning and accelerate AI testing across multiple business units.\n\nThe team wants to use Amazon Q Developer. The team must accelerate development workflows and maintain application quality.\n\nWhich combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Integrate the Amazon Q Developer automated unit and integration test generation features into the team's CI/CD pipelines." },
      { id: "B", text: "Use Amazon Q Developer to retrospectively analyze and document common integration patterns that are found across different business units' code bases." },
      { id: "C", text: "Use Amazon Q Developer to analyze code for security best practices and suggest compliance improvements. Implement a mandatory review process where all code changes must be manually approved by security teams before integration." },
      { id: "D", text: "Incorporate Amazon Q Developer to resolve coding issues that are identified during merge requests. Reserve most refactoring and optimization tasks for periodic manual review cycles." },
      { id: "E", text: "Configure Amazon Q Developer to automatically generate and refactor integration code snippets, provide targeted API usage guidance, and suggest performance optimizations for AI components. Apply the changes across the modular code base." }
    ],
    answer: ["A", "E"],
    explanation: "[Answer inferred - not from an official key.] Option E uses Q Developer for code generation and refactoring, API guidance, and performance suggestions, and option A uses its test generation to accelerate AI testing within CI/CD. Both directly automate the stated goals of speeding development, tuning performance, and testing at scale.",
    whyWrong: {
      "B": "A retrospective documentation exercise does not accelerate current development, automate tuning, or enforce patterns going forward.",
      "C": "A mandatory manual approval gate for all changes adds a bottleneck and works against accelerating workflows.",
      "D": "Deferring refactoring and optimization to periodic manual cycles contradicts the requirement to automate performance tuning."
    },
    services: ["Amazon Q Developer"],
    tags: ["q-developer", "developer-productivity", "test-generation"]
  }
);
