window.QB = window.QB || [];
window.QB.push(
  {
    id: "d2-2.1-05",
    domain: 2, task: "2.1", skills: ["2.1.1", "2.1.6"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A team wants an agent that runs inside its own container, uses an Amazon Bedrock model to decide which tools to call, and exposes three existing Python business functions as tools. The team wants an open-source SDK where the model drives the loop, with the LEAST boilerplate and no hand-written tool-call parsing. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Build a Step Functions state machine with a Choice state per business function and hardcode the order in which they are called." },
      { id: "B", text: "Call InvokeModel in a custom loop, ask the model to print the tool name and arguments as free text, and parse that text with regular expressions." },
      { id: "C", text: "Create one Lambda function and one Amazon Bedrock Agent action group per business function, and call the agent through the API." },
      { id: "D", text: "Use the Strands Agents SDK: decorate each function with @tool, create an Agent with a Bedrock model and the tool list, and let the SDK run the model-driven tool loop." }
    ],
    answer: ["D"],
    explanation: "Strands Agents is an open-source SDK in which the model plans and chooses tools in a loop. The @tool decorator turns a plain Python function (using its signature and docstring) into a tool specification, so no manual parsing or workflow graph is needed, and Bedrock is a supported model provider.",
    whyWrong: {
      "A": "A fixed Choice-state workflow is developer-driven, not model-driven, and needs far more orchestration work than the requirement allows.",
      "B": "Free-text tool calls parsed with regexes are brittle and exactly the boilerplate the team wants to avoid.",
      "C": "Bedrock Agents can do this, but it needs a managed agent plus Lambda and action group configuration for each function, which is more infrastructure than an in-process SDK and does not meet the 'own container, open-source SDK' requirement."
    },
    services: ["Strands Agents", "Amazon Bedrock"],
    tags: ["strands-agents", "tool-integration", "agent-loop"]
  },
  {
    id: "d2-2.1-06",
    domain: 2, task: "2.1", skills: ["2.1.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An Amazon Bedrock Agent must create records in an internal system. That system is reachable only from the client application's own network, and the call must run with the end user's session credentials. The company does not want to expose the system to Lambda or the internet. Which agent configuration meets these requirements?",
    choices: [
      { id: "A", text: "Create an action group whose executor is a Lambda function placed in a public subnet with a security group open to the internal system." },
      { id: "B", text: "Attach a knowledge base that contains the API documentation so the agent can call the system itself." },
      { id: "C", text: "Define the action group with return of control (RETURN_CONTROL) so the agent returns the chosen action and parameters to the application, which makes the call itself and sends the result back to the agent." },
      { id: "D", text: "Store the end user's credentials in the agent's instruction prompt so the model can pass them to a Lambda function." }
    ],
    answer: ["C"],
    explanation: "With return of control, the agent does not invoke a Lambda executor. It returns the action group, function, and parameters in the InvokeAgent response, the calling application performs the action in its own network and security context, and then supplies the result through returnControlInvocationResults so the agent can continue.",
    whyWrong: {
      "A": "This exposes the internal system to a Lambda function in a public subnet and runs with the function's role, not the user's session.",
      "B": "A knowledge base retrieves documentation text. It cannot execute actions against a system.",
      "D": "Putting credentials into a prompt leaks secrets to the model and its logs, and is never an acceptable pattern."
    },
    services: ["Amazon Bedrock Agents"],
    tags: ["bedrock-agents", "action-groups", "return-of-control", "security"]
  },
  {
    id: "d2-2.1-07",
    domain: 2, task: "2.1", skills: ["2.1.7"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company has 40 existing AWS Lambda functions and several REST APIs that are described by OpenAPI specifications. Teams build agents with different frameworks and want to discover and call these capabilities as Model Context Protocol (MCP) tools, with centralized inbound authentication. The company does not want to write and operate an MCP server for each API. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Write one MCP server per API and run each as an Amazon ECS service behind its own load balancer." },
      { id: "B", text: "Use Amazon Bedrock AgentCore Gateway to expose the Lambda functions and OpenAPI-described APIs as MCP-compatible tools behind a single authenticated endpoint." },
      { id: "C", text: "Ingest the OpenAPI specifications into an Amazon Bedrock Knowledge Base and let agents read them." },
      { id: "D", text: "Use Amazon Bedrock AgentCore Memory to store the API definitions for each agent." }
    ],
    answer: ["B"],
    explanation: "AgentCore Gateway is a managed service that converts existing APIs (OpenAPI), Lambda functions, and other services into MCP-compatible tools, provides tool discovery, and handles inbound authorization. Agents built with any framework that speaks MCP can then use one endpoint.",
    whyWrong: {
      "A": "This works but requires building, deploying, scaling, and securing many MCP servers, which is the overhead the company wants to avoid.",
      "C": "A knowledge base returns documentation passages for retrieval. It does not make the APIs callable tools.",
      "D": "AgentCore Memory stores conversation context and learned information, not tool definitions or API connectivity."
    },
    services: ["Amazon Bedrock AgentCore", "AgentCore Gateway", "Model Context Protocol"],
    tags: ["agentcore-gateway", "mcp", "tool-integration"]
  },
  {
    id: "d2-2.1-08",
    domain: 2, task: "2.1", skills: ["2.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A customer-service agent hosted on Amazon Bedrock AgentCore must remember what was said earlier in the current conversation, and must also recall a customer's stated preferences and prior issue summaries in future conversations days later. The company wants a managed solution with the LEAST custom code for storing and extracting this information. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Replay the entire raw history of every past conversation in the prompt on each turn." },
      { id: "B", text: "Create an Amazon DynamoDB table and write custom code that stores transcripts, extracts preferences with a separate model call, and retrieves them each turn." },
      { id: "C", text: "Use AgentCore Memory: store conversation events for short-term memory, and configure long-term memory strategies so that preferences and summaries are extracted and retrieved across sessions." },
      { id: "D", text: "Ingest all conversation transcripts into a Bedrock Knowledge Base nightly and rely on retrieval to find them." }
    ],
    answer: ["C"],
    explanation: "AgentCore Memory is a managed memory service with short-term memory (events within a session) and long-term memory (insights such as user preferences and summaries that are extracted by configurable strategies and retrieved by namespace). It removes the extraction and storage plumbing you would otherwise build.",
    whyWrong: {
      "A": "Replaying all history quickly exceeds the context window, inflates token cost, and adds latency.",
      "B": "This is feasible, but it is the custom storage, extraction, and retrieval code the company wants to avoid.",
      "D": "A nightly batch ingestion cannot serve the current conversation and is not designed for per-user session memory."
    },
    services: ["Amazon Bedrock AgentCore", "AgentCore Memory"],
    tags: ["agentcore-memory", "short-term-memory", "long-term-memory", "state-management"]
  },
  {
    id: "d2-2.1-09",
    domain: 2, task: "2.1", skills: ["2.1.1", "2.1.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "An agent hosted on Amazon Bedrock AgentCore Runtime has two requirements. First, only authenticated employees from the corporate OpenID Connect (OIDC) identity provider may invoke the agent. Second, the agent must call a third-party SaaS API on behalf of the signed-in user by using OAuth 2.0, without storing client secrets or user tokens in the agent code. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Configure the runtime's inbound authorization with a JWT authorizer that points to the identity provider's OIDC discovery URL and allowed audiences or clients." },
      { id: "B", text: "Store the SaaS client secret in an environment variable of the agent container." },
      { id: "C", text: "Use AgentCore Identity with an OAuth credential provider so that the agent obtains the user's access token at runtime from the managed token vault." },
      { id: "D", text: "Create an IAM user for each employee and distribute the access keys to the front end." },
      { id: "E", text: "Leave the runtime endpoint unauthenticated and instruct the model in the system prompt to refuse unknown users." }
    ],
    answer: ["A", "C"],
    explanation: "Inbound authentication for AgentCore Runtime can use a JWT authorizer so that only tokens issued by the corporate OIDC provider are accepted. For outbound access to third-party APIs, AgentCore Identity manages OAuth credential providers and a token vault so the agent retrieves tokens at runtime instead of holding secrets.",
    whyWrong: {
      "B": "A secret in an environment variable is exactly the embedded long-lived secret the requirement forbids and cannot represent individual users.",
      "D": "Long-lived IAM user keys in a front end are insecure, bypass the corporate IdP, and do not provide OAuth access to the SaaS API.",
      "E": "A prompt is not an access control. Unauthenticated endpoints can be invoked by anyone regardless of model instructions."
    },
    services: ["Amazon Bedrock AgentCore", "AgentCore Runtime", "AgentCore Identity"],
    tags: ["agentcore-identity", "agentcore-runtime", "oauth", "jwt-authorizer"]
  },
  {
    id: "d2-2.1-10",
    domain: 2, task: "2.1", skills: ["2.1.6"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A Lambda function implements a 'refund_order' tool for an agent. In testing, the model sometimes passes a negative amount, or a malformed order ID, and the function throws an unhandled exception that ends the agent run with a generic error. The team wants the tool to be reliable and the agent to recover on its own. Which combination of changes will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Validate the arguments against a schema (types, formats, allowed ranges) before performing any side effect, and reject invalid input." },
      { id: "B", text: "Let exceptions propagate with the full stack trace so the model can read the internals and fix its call." },
      { id: "C", text: "Catch errors and return a structured, descriptive error result to the model (for example, which parameter was invalid and what is expected) so that it can correct and retry." },
      { id: "D", text: "Automatically retry the same failing call in the function in an unbounded loop until it succeeds." },
      { id: "E", text: "Remove validation because the tool's JSON schema guarantees that the model always sends valid values." }
    ],
    answer: ["A", "C"],
    explanation: "Model-generated arguments are untrusted input, so the tool must validate before acting, especially for side-effecting operations like refunds. Returning a clear, structured error as a tool result lets the model self-correct within the loop instead of crashing the run.",
    whyWrong: {
      "B": "Raw stack traces leak internals and are poor feedback for the model. The run also still fails if the exception is unhandled.",
      "D": "Retrying identical invalid input cannot succeed and an unbounded loop wastes cost and may repeat side effects.",
      "E": "A tool schema guides the model but does not guarantee valid values or business-rule compliance, so server-side validation is still required."
    },
    services: ["AWS Lambda", "Amazon Bedrock"],
    tags: ["tool-error-handling", "parameter-validation", "agent-reliability"]
  },
  {
    id: "d2-2.1-11",
    domain: 2, task: "2.1", skills: ["2.1.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An agent's tool Lambda function calls a partner inventory API that is down for 20 to 30 minutes several times a month. During these periods every agent run retries the tool, waits for timeouts, and burns model tokens before failing. The company wants the agent to fail fast and degrade gracefully, and to resume normal calls automatically when the partner recovers. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Increase the Step Functions Retry MaxAttempts for the tool task so that more attempts are made." },
      { id: "B", text: "Raise the Lambda timeout to 15 minutes so the partner call has more time to succeed." },
      { id: "C", text: "Add a sentence to the system prompt telling the model not to call the inventory tool when the partner seems slow." },
      { id: "D", text: "Implement a circuit breaker: track consecutive failures in Amazon DynamoDB, and after a threshold return a fallback result immediately without calling the API until a cool-down passes, then probe with a single trial call." }
    ],
    answer: ["D"],
    explanation: "A circuit breaker stops calls to a failing dependency (open state), returns a fallback quickly so the agent can degrade gracefully, and after a cool-down lets a trial call through (half-open) to detect recovery. Shared state such as a DynamoDB item makes the breaker consistent across concurrent Lambda executions.",
    whyWrong: {
      "A": "More retries against a dependency that is down for 30 minutes just add waiting time and token spend.",
      "B": "A longer timeout makes each failure slower and more expensive, the opposite of failing fast.",
      "C": "The model cannot observe partner health, and prompt text is not a deterministic safeguard."
    },
    services: ["AWS Lambda", "Amazon DynamoDB", "AWS Step Functions"],
    tags: ["circuit-breaker", "fail-fast", "graceful-degradation", "safeguards"]
  },
  {
    id: "d2-2.1-12",
    domain: 2, task: "2.1", skills: ["2.1.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A risk team wants three different foundation models on Amazon Bedrock to assess each contract independently. A custom rule then combines the three assessments (for example, majority vote with confidence weighting) into one result. The team wants the lowest latency and managed orchestration. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Use an AWS Step Functions Parallel state with one branch per model that calls Amazon Bedrock, followed by a Lambda function that implements the aggregation logic." },
      { id: "B", text: "Chain the models sequentially so each model receives the previous model's answer as context." },
      { id: "C", text: "Ask one model to role-play three experts in a single prompt and trust its combined answer." },
      { id: "D", text: "Attach an Amazon Bedrock Guardrail to each model and let the guardrail pick the best answer." }
    ],
    answer: ["A"],
    explanation: "A model ensemble requires independent assessments, which run concurrently in a Parallel state, so total latency is roughly that of the slowest model. A downstream Lambda function can apply custom aggregation logic such as voting or weighting.",
    whyWrong: {
      "B": "Sequential chaining biases later models with earlier answers, so the assessments are not independent, and total latency is the sum of all calls.",
      "C": "A single model role-playing experts is not a true ensemble of different models and gives no aggregation control.",
      "D": "Guardrails filter content for safety and policy. They do not compare model outputs or select the best one."
    },
    services: ["AWS Step Functions", "AWS Lambda", "Amazon Bedrock"],
    tags: ["model-ensemble", "parallel-state", "aggregation", "model-coordination"]
  },
  {
    id: "d2-2.2-05",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company hosts a fine-tuned open-weight model on Amazon SageMaker AI because the model is not offered in Amazon Bedrock. The model is used a few times per day to process 100 MB documents, each taking two to five minutes. Nobody needs an immediate response, and the company wants to avoid paying for idle GPU instances. Which deployment meets these requirements MOST cost-effectively?",
    choices: [
      { id: "A", text: "A real-time endpoint with one GPU instance running 24 hours a day." },
      { id: "B", text: "A SageMaker Serverless Inference endpoint with the maximum memory setting." },
      { id: "C", text: "An asynchronous inference endpoint that reads requests and payloads from Amazon S3, with auto scaling configured to scale to zero instances when the queue is empty." },
      { id: "D", text: "An AWS Lambda function that loads the model weights on each invocation." }
    ],
    answer: ["C"],
    explanation: "Asynchronous inference queues requests, supports large payloads and long processing times, returns results to S3, and can scale the instance count to zero when idle. That matches infrequent, large, latency-tolerant jobs on GPU hardware.",
    whyWrong: {
      "A": "An always-on GPU instance is paid for around the clock while being used only a few times per day.",
      "B": "Serverless Inference does not support GPUs and has small payload and timeout limits, so it cannot serve this model or these documents.",
      "D": "Lambda has no GPU, a 15-minute limit, and limited memory, so it cannot host a large LLM."
    },
    services: ["Amazon SageMaker AI"],
    tags: ["sagemaker", "async-inference", "scale-to-zero", "cost-optimization"]
  },
  {
    id: "d2-2.2-06",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An internal application normally sends a low volume of requests to a model on Amazon Bedrock but has unpredictable bursts that cause ThrottlingException errors on on-demand inference. Average usage is far too low to justify a Provisioned Throughput commitment. Policy requires that prompts are processed only in United States Regions. Which solution meets these requirements MOST cost-effectively?",
    choices: [
      { id: "A", text: "Purchase Provisioned Throughput with a six-month commitment sized for the peak." },
      { id: "B", text: "Create several IAM roles and spread the calls across them to multiply the quota." },
      { id: "C", text: "Move all requests to Amazon Bedrock batch inference." },
      { id: "D", text: "Invoke the model through a United States geographic cross-Region inference profile so that requests can be served from multiple US Regions during bursts." }
    ],
    answer: ["D"],
    explanation: "Cross-Region inference profiles route on-demand requests across Regions within a defined geography, which absorbs traffic bursts without a commitment while keeping processing inside the chosen geography. Using the profile ID in place of the model ID is the only change in the application.",
    whyWrong: {
      "A": "A long commitment sized for peak is expensive for a workload with low average use.",
      "B": "Quotas are applied to the account and Region, not per IAM role, so additional roles do not add capacity.",
      "C": "Batch inference is asynchronous and offline, so it cannot serve interactive requests."
    },
    services: ["Amazon Bedrock"],
    tags: ["cross-region-inference", "throttling", "burst-handling", "data-residency"]
  },
  {
    id: "d2-2.2-07",
    domain: 2, task: "2.2", skills: ["2.2.2"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A team deploys a 70-billion-parameter model on a SageMaker AI endpoint using a large model inference (LMI) container. The endpoint creation fails. The logs show that downloading and loading the weights takes about 25 minutes, and the platform health check times out before the model is ready. Which combination of actions will resolve this issue? (Select TWO)",
    choices: [
      { id: "A", text: "Increase the production variant's ModelDataDownloadTimeoutInSeconds and ContainerStartupHealthCheckTimeoutInSeconds to cover the model load time." },
      { id: "B", text: "Choose an instance type with a single smaller GPU to reduce the amount of data to load." },
      { id: "C", text: "Use a multi-GPU instance whose combined GPU memory fits the weights and set the container's tensor parallel degree to the number of GPUs." },
      { id: "D", text: "Switch to a CPU instance so that no GPU memory is needed." },
      { id: "E", text: "Enable data capture on the endpoint to speed up loading." }
    ],
    answer: ["A", "C"],
    explanation: "Large LLMs need long download and load times, so the production variant's download and startup health-check timeouts must be raised. The model also has to be sharded across the GPUs of a multi-GPU instance by setting tensor parallelism to match, so that the weights fit in GPU memory.",
    whyWrong: {
      "B": "A smaller single GPU cannot hold the weights, and the amount of data to load does not change.",
      "D": "CPU serving of a 70B model gives unusable latency and does not fix the load-time issue.",
      "E": "Data capture records requests and responses for monitoring. It has no effect on model load time."
    },
    services: ["Amazon SageMaker AI"],
    tags: ["sagemaker", "lmi", "model-loading", "tensor-parallelism", "timeouts"]
  },
  {
    id: "d2-2.2-08",
    domain: 2, task: "2.2", skills: ["2.2.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company extracts product attributes from listings by using a large foundation model, at about 50 million calls per month. It has the prompts but no labeled answers. The company wants a smaller, cheaper model that approximates the large model's quality on this narrow task, using a managed approach with the LEAST ML engineering effort. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Move the workload to Amazon Bedrock batch inference and keep the large model." },
      { id: "B", text: "Use Amazon Bedrock Model Distillation, with the large model as the teacher that generates responses to the company's prompts to fine-tune a smaller student model." },
      { id: "C", text: "Purchase Provisioned Throughput for the large model." },
      { id: "D", text: "Pre-train a new model from scratch on Amazon SageMaker AI by using the company's prompts." }
    ],
    answer: ["B"],
    explanation: "Model distillation transfers a task-specific capability from a large teacher to a smaller student: the teacher generates responses for your prompts and the student is fine-tuned on them, in a managed Bedrock workflow. The result is a smaller model with lower per-call cost and latency for the narrow task.",
    whyWrong: {
      "A": "Batch inference changes the delivery mode and only suits non-interactive work. It does not reduce the size of the model being used.",
      "C": "Provisioned Throughput guarantees capacity and is a commitment cost. It does not make the model smaller or cheaper per call.",
      "D": "Pre-training from scratch is enormously expensive and requires far more data and engineering than a narrow extraction task needs."
    },
    services: ["Amazon Bedrock"],
    tags: ["model-distillation", "smaller-models", "cost-optimization", "model-selection"]
  },
  {
    id: "d2-2.3-05",
    domain: 2, task: "2.3", skills: ["2.3.1", "2.3.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Several systems (an order platform, an ERP, and a mobile backend) already publish business events to Amazon EventBridge. A new requirement says that when a ReturnRequested event occurs, the company must classify the return reason with Amazon Bedrock and notify the warehouse. More consumers are expected later, and the event producers must not be changed. Which solution meets these requirements with loose coupling?",
    choices: [
      { id: "A", text: "Modify each producer to call a new Lambda function directly after it publishes the event." },
      { id: "B", text: "Schedule a Lambda function every five minutes to scan each system's database for new returns." },
      { id: "C", text: "Create an EventBridge rule that matches the ReturnRequested detail type and targets a Step Functions workflow or Lambda function that calls Bedrock, and add further rules for later consumers." },
      { id: "D", text: "Replace EventBridge with a point-to-point integration between the order platform and the warehouse system." }
    ],
    answer: ["C"],
    explanation: "EventBridge rules let new consumers subscribe to existing events by pattern without touching the producers, which is loose coupling. The rule target can start the Bedrock classification and notification workflow, and more rules can be added later.",
    whyWrong: {
      "A": "Changing every producer couples them to the new consumer and violates the requirement not to modify producers.",
      "B": "Polling several databases adds delay and load, and couples the solution to each system's schema.",
      "D": "Point-to-point links are tightly coupled and make adding future consumers harder."
    },
    services: ["Amazon EventBridge", "AWS Lambda", "AWS Step Functions", "Amazon Bedrock"],
    tags: ["eventbridge", "event-driven", "loose-coupling"]
  },
  {
    id: "d2-2.3-06",
    domain: 2, task: "2.3", skills: ["2.3.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An internal GenAI portal authenticates employees with an Amazon Cognito user pool. Users in the 'analysts' group may invoke only two low-cost approved models. Users in the 'data-scientists' group may invoke any approved model. The company wants least-privilege access enforced by AWS rather than by application code alone. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Use a single IAM role with bedrock:InvokeModel on all models, and have the application check the user's group before calling." },
      { id: "B", text: "Share one IAM user's access keys with both groups and track usage in application logs." },
      { id: "C", text: "Create a Bedrock Guardrail for each group and attach it to the user pool." },
      { id: "D", text: "Use a Cognito identity pool that maps each user pool group to a separate IAM role, and scope each role's policy to bedrock:InvokeModel actions on only the allowed model ARNs." }
    ],
    answer: ["D"],
    explanation: "An identity pool exchanges user pool tokens for temporary credentials and can map groups to IAM roles. Each role's policy limits bedrock:InvokeModel (and ConverseStream) to specific model ARNs, so authorization is enforced by IAM and logged in CloudTrail, not merely by application code.",
    whyWrong: {
      "A": "Access is controlled only by application code. A compromised or buggy client with the shared role could call any model.",
      "B": "Shared long-lived keys violate least privilege and make per-user auditing impossible.",
      "C": "Guardrails filter content and are not an authorization mechanism and cannot be attached to a user pool."
    },
    services: ["Amazon Cognito", "AWS IAM", "Amazon Bedrock"],
    tags: ["rbac", "least-privilege", "cognito-identity-pool", "model-access"]
  },
  {
    id: "d2-2.3-07",
    domain: 2, task: "2.3", skills: ["2.3.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A telecom partner's mobile augmented-reality application on a 5G network needs ultra-low-latency pre-processing of video frames close to the device, followed by an AI-generated scene description from Amazon Bedrock. Which architecture meets these requirements?",
    choices: [
      { id: "A", text: "Run the Amazon Bedrock foundation models inside the AWS Wavelength Zone." },
      { id: "B", text: "Deploy the frame pre-processing service in an AWS Wavelength Zone and call Amazon Bedrock in the parent AWS Region over the AWS network for the description." },
      { id: "C", text: "Place an AWS Outposts rack at each user's location." },
      { id: "D", text: "Serve the pre-processing from Amazon CloudFront and call Bedrock from the browser by using long-lived access keys." }
    ],
    answer: ["B"],
    explanation: "Wavelength Zones embed AWS compute at the edge of 5G networks so latency-critical processing runs near devices. Bedrock is a Regional service, so the edge component calls it in the parent Region, keeping only the latency-sensitive work at the edge.",
    whyWrong: {
      "A": "Foundation models in Bedrock are not hosted in Wavelength Zones. Wavelength offers a limited set of compute and storage services.",
      "C": "Outposts racks are for customer data centers, not for each mobile user's location.",
      "D": "CloudFront caches and delivers content and does not run frame pre-processing, and long-lived keys in a client are insecure."
    },
    services: ["AWS Wavelength", "Amazon Bedrock"],
    tags: ["wavelength", "edge", "low-latency", "cross-environment"]
  },
  {
    id: "d2-2.3-08",
    domain: 2, task: "2.3", skills: ["2.3.5"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A platform team ships a GenAI gateway implemented as a Lambda function plus versioned prompt configurations. The team needs a pipeline that runs unit tests and a model-evaluation check against a golden dataset, performs a security scan, and then releases gradually to production with automatic rollback if error-rate or latency alarms fire. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Run a script that calls update-function-code on the production function and redeploys the previous package if someone reports problems." },
      { id: "B", text: "Have developers zip the code and upload it through the Lambda console after a manual checklist." },
      { id: "C", text: "Point Amazon Route 53 weighted records to two copies of the function and adjust weights manually." },
      { id: "D", text: "Use AWS CodePipeline with an AWS CodeBuild stage for tests, evaluation, and scans, then AWS CodeDeploy to shift traffic with a canary or linear configuration on a Lambda alias, with CloudWatch alarms that trigger automatic rollback." }
    ],
    answer: ["D"],
    explanation: "CodePipeline orchestrates the stages, CodeBuild runs automated tests, golden-dataset evaluation, and security scans as quality gates, and CodeDeploy shifts Lambda alias traffic gradually and rolls back automatically when configured CloudWatch alarms go into alarm.",
    whyWrong: {
      "A": "Direct updates expose all traffic at once, and rollback depends on a human noticing a problem.",
      "B": "A manual console upload has no automated testing, scanning, gradual release, or rollback.",
      "C": "Route 53 weights are a DNS mechanism with caching delays, are manual, and are not integrated with test gates or alarms."
    },
    services: ["AWS CodePipeline", "AWS CodeBuild", "AWS CodeDeploy", "AWS Lambda", "Amazon CloudWatch"],
    tags: ["ci-cd", "genai-gateway", "canary-deployment", "automatic-rollback"]
  },
  {
    id: "d2-2.3-09",
    domain: 2, task: "2.3", skills: ["2.3.3", "2.3.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A regulated company requires that Amazon Bedrock be invoked only from workloads inside its VPC, and only for a list of approved models, even if an application's IAM role is over-permissioned by mistake. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Attach a VPC endpoint policy to the Bedrock runtime interface endpoint that allows invocation actions only for the approved model ARNs." },
      { id: "B", text: "Attach the AmazonBedrockFullAccess managed policy to application roles so that they can use any needed model." },
      { id: "C", text: "Add an IAM or service control policy statement that denies Bedrock invocation actions when the request does not come through the approved VPC endpoint (aws:SourceVpce condition)." },
      { id: "D", text: "Rely on the application code to pass only approved model IDs." },
      { id: "E", text: "Turn on model invocation logging and review the logs monthly." }
    ],
    answer: ["A", "C"],
    explanation: "A VPC endpoint policy restricts what can be done through the endpoint, including which model ARNs, and a deny statement with an aws:SourceVpce condition prevents the same calls from being made any other way. Together they provide network-path and model-level guardrails that hold even when a role is too permissive.",
    whyWrong: {
      "B": "Full access grants the opposite of least privilege and defeats the model restriction.",
      "D": "Application code is not an enforcement boundary. A bug or compromise can bypass it.",
      "E": "Logging is detective, not preventive, and a monthly review does not stop non-compliant calls."
    },
    services: ["AWS PrivateLink", "AWS IAM", "Amazon Bedrock"],
    tags: ["vpc-endpoint-policy", "least-privilege", "data-perimeter", "sourcevpce"]
  },
  {
    id: "d2-2.4-05",
    domain: 2, task: "2.4", skills: ["2.4.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A chat application uses an Amazon API Gateway WebSocket API with a Lambda function integration. The company wants generated text to appear in each user's browser token by token while the model is still generating. Which implementation meets this requirement?",
    choices: [
      { id: "A", text: "Call InvokeModel in the Lambda function and return the full text in the integration response." },
      { id: "B", text: "Have the browser poll an HTTP API every 500 milliseconds for the latest partial answer." },
      { id: "C", text: "In the Lambda function call ConverseStream, and for each chunk send the text to the user's connection ID by using the API Gateway Management API PostToConnection operation." },
      { id: "D", text: "Publish each prompt to an Amazon SNS topic and have the browser subscribe to it." }
    ],
    answer: ["C"],
    explanation: "A WebSocket API keeps a persistent two-way connection. The Lambda function reads the model's streamed events from ConverseStream and pushes each piece to the client by calling PostToConnection with the connection ID, so users see text as it is produced.",
    whyWrong: {
      "A": "InvokeModel returns only after the whole answer is generated, so nothing is delivered incrementally.",
      "B": "Polling adds latency and load and is not true push streaming.",
      "D": "SNS is a pub/sub notification service that does not stream model output to a browser session."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["websocket", "converse-stream", "postconnection", "streaming"]
  },
  {
    id: "d2-2.4-06",
    domain: 2, task: "2.4", skills: ["2.4.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A customer-facing assistant calls a primary foundation model on Amazon Bedrock. During regional service events the primary model returns throttling or service-unavailable errors even after SDK retries. The company wants users to still get an answer rather than an error page. Which design meets this requirement?",
    choices: [
      { id: "A", text: "Increase the SDK max_attempts to 100 so that retries continue until the primary model recovers." },
      { id: "B", text: "Return an HTTP 500 and ask users to try again later." },
      { id: "C", text: "Disable the SDK retry logic so that errors are surfaced immediately." },
      { id: "D", text: "Catch the error after retries are exhausted, then call a fallback model (for example, a different model or inference profile), and if that also fails return a cached or static response." }
    ],
    answer: ["D"],
    explanation: "Graceful degradation uses a layered fallback: retry transient errors, then switch to an alternate model or Region, and finally a cached or canned response. Users get a useful answer even when the primary path is unavailable.",
    whyWrong: {
      "A": "Very long retry sequences keep users waiting and increase load on a struggling service without guaranteeing a result.",
      "B": "An error response is the failure behavior the company wants to avoid.",
      "C": "Disabling retries turns recoverable transient errors into user-visible failures."
    },
    services: ["Amazon Bedrock", "AWS SDK"],
    tags: ["fallback", "graceful-degradation", "resilience"]
  },
  {
    id: "d2-2.4-07",
    domain: 2, task: "2.4", skills: ["2.4.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A multi-tenant GenAI API is built with Amazon API Gateway and Lambda in front of Amazon Bedrock. One tenant sends large bursts of requests and consumes most of the Bedrock request quota, causing throttling for all other tenants. Which combination of actions will protect the other tenants? (Select TWO)",
    choices: [
      { id: "A", text: "Create API Gateway usage plans with per-API-key rate and burst limits (and quotas) for each tenant." },
      { id: "B", text: "Increase the Lambda function timeout so that requests wait longer for capacity." },
      { id: "C", text: "Set reserved concurrency on the Lambda function to cap the number of concurrent Bedrock callers below what the account quota supports." },
      { id: "D", text: "Disable retries in the SDK so that throttled requests are dropped." },
      { id: "E", text: "Add a longer system prompt so that the model returns shorter answers to the heavy tenant." }
    ],
    answer: ["A", "C"],
    explanation: "Usage plans enforce per-tenant rate, burst, and quota limits at the API edge, so one tenant cannot take all capacity. Reserved concurrency caps total concurrent model callers, which keeps overall demand within the Bedrock quota instead of hitting it unpredictably.",
    whyWrong: {
      "B": "A longer timeout leaves requests waiting and does nothing to limit the heavy tenant's share.",
      "D": "Dropping throttled requests worsens reliability for everyone and does not control the noisy tenant.",
      "E": "Shorter answers may cut output tokens but do not limit the request rate that causes throttling."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["rate-limiting", "usage-plans", "noisy-neighbor", "reserved-concurrency"]
  },
  {
    id: "d2-2.4-08",
    domain: 2, task: "2.4", skills: ["2.4.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company wants to automatically send simple prompts to a smaller, cheaper model and complex prompts to a larger model from the same model family, based on predicted response quality. The company does not want to build or operate its own classifier. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Use an Amazon Bedrock prompt router and pass the router's ARN as the model ID in the Converse API call." },
      { id: "B", text: "Build a Step Functions workflow with a classifier Lambda function and a Choice state that routes to each model." },
      { id: "C", text: "Create Amazon Route 53 weighted records and split traffic 80/20 between the two models." },
      { id: "D", text: "Fine-tune the larger model so that it answers simple prompts faster." }
    ],
    answer: ["A"],
    explanation: "Amazon Bedrock Intelligent Prompt Routing provides default prompt routers per model family that predict which model will give the best response for each request and route accordingly to balance quality and cost. You call the router by its ARN in place of a model ID, so no classifier needs to be built.",
    whyWrong: {
      "B": "This works but requires you to build and maintain the classifier and routing logic, which the company wants to avoid.",
      "C": "Random weights ignore prompt complexity, so simple prompts may hit the large model and hard prompts the small one.",
      "D": "Fine-tuning does not change which model serves a request and adds training cost."
    },
    services: ["Amazon Bedrock Intelligent Prompt Routing"],
    tags: ["prompt-router", "intelligent-routing", "cost-optimization"]
  },
  {
    id: "d2-2.4-09",
    domain: 2, task: "2.4", skills: ["2.4.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A public REST API fronts a Lambda function that calls Amazon Bedrock. Clients often send malformed bodies or enormous prompts, and each invalid request still invokes Lambda and sometimes Bedrock, which wastes money. The company wants to reject invalid requests before they reach compute, with the LEAST code. Which solution meets this requirement?",
    choices: [
      { id: "A", text: "Validate the request inside the Lambda function after it starts, and call Bedrock Guardrails to detect bad input." },
      { id: "B", text: "Put Amazon CloudFront in front of the API to cache the invalid responses." },
      { id: "C", text: "Enable request validation on the API Gateway REST API with a JSON Schema model that requires the prompt field and sets a maximum length, so non-conforming requests receive a 400 response." },
      { id: "D", text: "Increase the Lambda memory so that invalid requests are rejected faster." }
    ],
    answer: ["C"],
    explanation: "API Gateway request validators check the body, headers, and parameters against a model before the integration is invoked. Invalid requests are rejected with a 400 error at no Lambda or Bedrock cost.",
    whyWrong: {
      "A": "Lambda is already invoked and billed, so the waste is incurred. Guardrails also are not a schema validator.",
      "B": "Caching error responses does not prevent distinct malformed requests from reaching Lambda.",
      "D": "More memory raises cost and does not prevent invocation of the function."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["request-validation", "api-gateway", "cost-control"]
  },
  {
    id: "d2-2.5-06",
    domain: 2, task: "2.5", skills: ["2.5.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company exposes a Lambda function that calls InvokeModel through an Amazon API Gateway REST API. Long answers take 45 to 60 seconds. Clients receive HTTP 504 errors after about 29 seconds, although the Lambda function (timeout set to 5 minutes) completes successfully. Users also want to see text appear while it is being generated. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Switch the function to ConverseStream and deliver the chunks to clients incrementally, for example through an API Gateway WebSocket API or Lambda response streaming, so that the first tokens arrive within seconds." },
      { id: "B", text: "Increase the Lambda timeout to 15 minutes." },
      { id: "C", text: "Ask clients to resend the request whenever they receive a 504." },
      { id: "D", text: "Convert the REST API to an HTTP API, which has no integration timeout." }
    ],
    answer: ["A"],
    explanation: "The 504 comes from the API Gateway integration timeout (a default of 29 seconds for REST APIs), not from Lambda. Streaming the model output sends data to the client as it is generated, so time to first token is short and the user sees progress, avoiding a single long blocking response.",
    whyWrong: {
      "B": "Lambda already completes. The limit that is hit is the API Gateway integration timeout, which a longer function timeout does not change.",
      "C": "Resending repeats the work and cost, and the next request will hit the same limit.",
      "D": "HTTP APIs also have a maximum integration timeout (30 seconds), so this does not solve the problem."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["api-gateway-timeout", "streaming", "converse-stream", "504"]
  },
  {
    id: "d2-2.5-07",
    domain: 2, task: "2.5", skills: ["2.5.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A GenAI API sometimes receives huge prompts, and the model occasionally returns very long answers, which causes unpredictable cost and latency. The company wants to enforce token limits in the API layer. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Set the maxTokens value in the Converse API inferenceConfig to cap the length of every generated response." },
      { id: "B", text: "Increase the temperature so that the model finishes answers sooner." },
      { id: "C", text: "Enforce a maximum input size at the edge (for example, a maxLength in the API Gateway request validation model, or a token-estimate check in Lambda) and reject oversized prompts with a client error." },
      { id: "D", text: "Raise the API Gateway payload limit so that larger prompts can be accepted." },
      { id: "E", text: "Add a request to the system prompt asking the model to keep answers short, and treat that as the only control." }
    ],
    answer: ["A", "C"],
    explanation: "maxTokens is a hard cap enforced by the service on output length. Input size must be bounded before the call, because input tokens cost money and consume context, and rejecting oversized prompts at the edge is cheap and immediate.",
    whyWrong: {
      "B": "Temperature controls randomness and does not set response length.",
      "D": "Raising limits admits larger prompts, which is the opposite of the intended control.",
      "E": "Prompt wording is a soft request that the model can exceed, so it cannot be the only control."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Bedrock"],
    tags: ["token-limits", "max-tokens", "input-validation", "cost-control"]
  },
  {
    id: "d2-2.5-08",
    domain: 2, task: "2.5", skills: ["2.5.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Web and mobile teams must start building clients for a new GenAI summarization API before the backend exists. The company wants an API-first approach with a single source of truth for the contract, mock responses for early testing, and generated client SDKs. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Build the Lambda backend first and write documentation after the API stabilizes." },
      { id: "B", text: "Define the contract in an OpenAPI specification, import it into an Amazon API Gateway REST API using mock integrations, generate client SDKs from it, and later replace the mocks with Lambda integrations." },
      { id: "C", text: "Share a word-processor document that describes the endpoints and let each team interpret it." },
      { id: "D", text: "Have each client team write its own stub server on its own laptop." }
    ],
    answer: ["B"],
    explanation: "An OpenAPI specification is the shared contract. API Gateway can import it and return mock responses so clients can develop in parallel, SDKs can be generated for consumers, and mock integrations are later swapped for real backends without changing the contract.",
    whyWrong: {
      "A": "Documenting after building is code-first and blocks client teams until the backend exists.",
      "C": "A prose document is ambiguous, cannot be validated or used to generate SDKs, and drifts from the implementation.",
      "D": "Independent stubs diverge from each other and from the real contract."
    },
    services: ["Amazon API Gateway", "OpenAPI"],
    tags: ["openapi", "api-first", "mock-integration", "sdk-generation"]
  },
  {
    id: "d2-2.5-09",
    domain: 2, task: "2.5", skills: ["2.5.6"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Amazon Bedrock model invocation logging is delivered to Amazon CloudWatch Logs. Finance asks which IAM identities consumed the most input tokens in the last 24 hours. Which solution provides the answer with the LEAST effort?",
    choices: [
      { id: "A", text: "Run a CloudWatch Logs Insights query on the invocation log group that sums the input token count field and groups by the identity ARN, sorted descending." },
      { id: "B", text: "Export all logs to a spreadsheet and count tokens manually." },
      { id: "C", text: "Use AWS X-Ray analytics to read the tokens from trace segments." },
      { id: "D", text: "Use AWS Config to list which roles invoked Bedrock models." }
    ],
    answer: ["A"],
    explanation: "Invocation logs include the caller identity and token counts for each request, and Logs Insights can filter by time range, aggregate with stats, and sort the results in one query. This gives the per-identity breakdown without building any pipeline.",
    whyWrong: {
      "B": "Manual spreadsheet work is slow, error-prone, and does not scale.",
      "C": "X-Ray traces show latency and call paths and do not contain Bedrock token usage per identity.",
      "D": "AWS Config records resource configuration changes, not API usage or token consumption."
    },
    services: ["Amazon CloudWatch Logs", "Amazon Bedrock"],
    tags: ["logs-insights", "invocation-logging", "token-usage", "troubleshooting"]
  },
  {
    id: "d2-2.5-10",
    domain: 2, task: "2.5", skills: ["2.5.3", "2.5.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A company must summarize 200,000 documents stored in Amazon S3 by using Amazon Bedrock. The model has a limited request quota, and some calls fail with throttling errors. The company wants managed orchestration that processes documents in parallel without overrunning the quota and that does not lose failed documents. Which combination of steps will meet these requirements? (Select TWO)", 
    choices: [
      { id: "A", text: "Use a Step Functions Distributed Map state that reads the S3 objects and set MaxConcurrency to a level the Bedrock quota supports." },
      { id: "B", text: "Use an Inline Map state and pass all 200,000 document keys in the execution input." },
      { id: "C", text: "Configure Retry with exponential backoff and jitter for throttling errors on the Bedrock task, and a Catch that records failed documents for later reprocessing." },
      { id: "D", text: "Run a single Lambda function that loops through all documents until its 15-minute timeout." },
      { id: "E", text: "Ignore errors so that throttled documents are silently skipped." }
    ],
    answer: ["A", "C"],
    explanation: "Distributed Map is designed to fan out over large S3 datasets, and MaxConcurrency lets you match the model quota. Retry with backoff and jitter handles transient throttling, and Catch routes persistent failures to a store or queue so no document is lost.",
    whyWrong: {
      "B": "Inline Map is bounded by the execution payload size limit and by limited concurrency, so it cannot handle 200,000 items.",
      "D": "One function cannot finish this volume within 15 minutes and has no per-item retry or tracking.",
      "E": "Silently skipping failures loses documents, which violates the requirement."
    },
    services: ["AWS Step Functions", "Amazon S3", "Amazon Bedrock"],
    tags: ["distributed-map", "document-processing", "retry-backoff", "orchestration"]
  }
);
