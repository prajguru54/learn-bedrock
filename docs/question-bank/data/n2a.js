window.QB = window.QB || [];
window.QB.push(
  {
    id: "d2-2.1-13",
    domain: 2, task: "2.1", skills: ["2.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "You are deploying a customer-support agent on Amazon Bedrock AgentCore Runtime. Each end user holds a multi-turn conversation, and the security team requires that no user's in-memory state can ever be visible to another user. Which approach to session handling meets these requirements?",
    choices: [
      { id: "A", text: "Use one fixed runtimeSessionId for all users so every request reaches an already-warm microVM, and key the in-process state by user ID in a dictionary." },
      { id: "B", text: "Generate a unique runtimeSessionId per conversation and send the same ID on each follow-up call, so the conversation stays in its own dedicated microVM." },
      { id: "C", text: "Generate a new runtimeSessionId for every request so each turn gets a fresh microVM, and keep the conversation history in a module-level variable." },
      { id: "D", text: "Keep one runtimeSessionId per user for weeks, because the session microVM stays alive indefinitely and retains the in-memory state between visits." }
    ],
    answer: ["B"],
    explanation: "AgentCore Runtime runs each session in its own microVM, and requests that carry the same runtimeSessionId are routed to that microVM. A unique ID per conversation therefore gives hardware-level isolation between users while preserving state across turns. Sessions end after an idle timeout or maximum lifetime and the microVM memory is sanitized, so durable context belongs in AgentCore Memory or an external store.",
    whyWrong: {
      "A": "Sharing one session ID puts every user in the same microVM, so isolation depends only on application code and a dictionary lookup.",
      "C": "A new ID per request lands each turn in a different microVM, so the module-level history from the previous turn is not there.",
      "D": "Sessions are terminated after an idle timeout or lifetime limit and their memory is cleared, so in-memory state cannot be relied on across days or weeks."
    },
    services: ["Amazon Bedrock AgentCore"],
    tags: ["agentcore-runtime", "session-isolation", "microvm"]
  },
  {
    id: "d2-2.1-14",
    domain: 2, task: "2.1", skills: ["2.1.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer overrides the orchestration prompt of an Amazon Bedrock Agent so that the model replies in a custom <plan> XML format. After the agent is prepared, every invocation fails because the agent cannot interpret the model's output. The relevant configuration is:\n\npromptOverrideConfiguration:\n  promptConfigurations:\n    - promptType: ORCHESTRATION\n      promptCreationMode: OVERRIDDEN\n      promptState: ENABLED\n      parserMode: DEFAULT\n      basePromptTemplate: \"...respond with <plan>...</plan>...\"\n\nWhich change fixes the problem?",
    choices: [
      { id: "A", text: "Set promptState to DISABLED so the agent falls back to its built-in orchestration behavior and still returns the custom <plan> format." },
      { id: "B", text: "Change promptType to PRE_PROCESSING so the custom template runs before orchestration and the agent can read the <plan> output." },
      { id: "C", text: "Set parserMode to OVERRIDDEN and supply an overrideLambda that parses the model's <plan> output into the structure the agent expects." },
      { id: "D", text: "Set promptCreationMode to DEFAULT so that the agent generates a parser matching the custom basePromptTemplate automatically." }
    ],
    answer: ["C"],
    explanation: "The default parser understands only the output format of the default orchestration template. When the template changes the response format, parserMode must be OVERRIDDEN and a parser Lambda (overrideLambda) must convert the raw model text into the structure the agent runtime expects. Without it, the agent cannot read the model's decision.",
    whyWrong: {
      "A": "Disabling the step removes the custom template, so the model would no longer be asked for the <plan> format at all.",
      "B": "PRE_PROCESSING is a different step that classifies the user input. It does not parse orchestration output.",
      "D": "DEFAULT creation mode ignores the custom basePromptTemplate and uses the standard one. Agents never auto-generate parsers for custom formats."
    },
    services: ["Amazon Bedrock Agents", "AWS Lambda"],
    tags: ["advanced-prompts", "orchestration-template", "parser-lambda"]
  },
  {
    id: "d2-2.1-15",
    domain: 2, task: "2.1", skills: ["2.1.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A research firm builds a plan-and-execute agent. A planner model returns a JSON array of independent sub-tasks (between 3 and 40 per request), and each sub-task needs one Amazon Bedrock call. A final model call merges the results. Which AWS Step Functions design is the MOST scalable for this workload?",
    choices: [
      { id: "A", text: "Run a Map state over the planner's array with MaxConcurrency set below the model quota, call Bedrock through the service integration in each iteration, then add a synthesis state." },
      { id: "B", text: "Use a Parallel state with 40 hardcoded branches, and make each branch skip itself when the planner produced fewer than 40 sub-tasks for the request." },
      { id: "C", text: "Use a Choice-and-loop pattern that processes one sub-task at a time and increments a counter until the array is exhausted, then call the synthesis model." },
      { id: "D", text: "Pass the whole array to one Lambda function that calls Bedrock for each sub-task in a sequential for loop and returns the merged text to the workflow." }
    ],
    answer: ["A"],
    explanation: "A Map state iterates over a runtime-sized array and runs iterations concurrently, with MaxConcurrency protecting the Bedrock quota. The sub-tasks are independent, so parallelism cuts total latency, and the service integration removes the need for glue code. A final state then performs the synthesis step.",
    whyWrong: {
      "B": "A Parallel state has a fixed set of branches defined at design time. It cannot adapt to a variable-length array without wasted, hand-maintained branches.",
      "C": "A sequential loop is correct but slow, because independent sub-tasks wait on one another and latency grows with the plan size.",
      "D": "A sequential loop inside one Lambda function risks the 15-minute timeout, loses per-step retries and visibility, and gives up parallelism."
    },
    services: ["AWS Step Functions", "Amazon Bedrock"],
    tags: ["plan-and-execute", "step-functions-map", "parallel-subtasks"]
  },
  {
    id: "d2-2.1-16",
    domain: 2, task: "2.1", skills: ["2.1.2"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "Your team is building a reflection loop. A generator model drafts a customer-facing answer, a critic model reviews it, and the generator revises the draft. Which TWO design choices keep the loop reliable and its cost bounded? (Select TWO.)",
    choices: [
      { id: "A", text: "Track a revision counter in the workflow state and exit the loop when it reaches a fixed maximum, such as three, even if the critic still reports issues." },
      { id: "B", text: "Have the critic return a structured verdict (pass or fail plus a list of issues) so a Choice state can exit on pass and feed only the issues into the revision prompt." },
      { id: "C", text: "Loop until the critic reports no issues, and rely on the state machine's overall execution timeout to stop any runaway cycle." },
      { id: "D", text: "Use the same prompt for the generator and the critic so the critic applies exactly the conventions the generator used when writing the draft." },
      { id: "E", text: "Append every earlier draft and critique to the prompt on each pass so the model sees the full history, with no limit on the accumulated size." }
    ],
    answer: ["A", "B"],
    explanation: "A hard cap on revisions bounds cost and latency no matter how the critic behaves. A structured verdict gives the workflow a deterministic exit condition and keeps revision prompts short, because only the actionable issues are passed back. Together they turn an open-ended chat into a controlled loop.",
    whyWrong: {
      "C": "A timeout is a blunt backstop. The loop could burn tokens for the entire period, and a critic that never passes would end in failure rather than a usable draft.",
      "D": "Using the same prompt for both roles removes the independent review that makes reflection useful, and the critic tends to approve its own style.",
      "E": "Unbounded accumulation grows token cost on every pass and eventually exceeds the context window."
    },
    services: ["AWS Step Functions", "Amazon Bedrock"],
    tags: ["reflection-loop", "bounded-iterations", "critic-verdict"]
  },
  {
    id: "d2-2.1-17",
    domain: 2, task: "2.1", skills: ["2.1.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "After creating an action-group Lambda function, a team attaches this resource-based policy so a Bedrock agent can invoke it:\n\n{\n  \"Effect\": \"Allow\",\n  \"Principal\": { \"Service\": \"bedrock.amazonaws.com\" },\n  \"Action\": \"lambda:InvokeFunction\",\n  \"Resource\": \"arn:aws:lambda:us-east-1:111122223333:function:order-actions\"\n}\n\nA security reviewer flags a confused-deputy risk: any Bedrock agent in any account could be configured to call this function. Which change is MOST secure while keeping the agent working?",
    choices: [
      { id: "A", text: "Replace the service principal with the agent's service role ARN as an AWS principal, so that only that role is allowed to invoke the function." },
      { id: "B", text: "Add a condition with StringEquals on aws:SourceAccount set to 111122223333, so every Bedrock agent in the account is allowed to invoke the function." },
      { id: "C", text: "Place the function in a VPC without an internet route, so that only resources inside the VPC can reach the function's invoke endpoint." },
      { id: "D", text: "Add a condition with ArnLike on aws:SourceArn set to the specific agent's ARN, so that only invocations made on behalf of that agent are allowed." }
    ],
    answer: ["D"],
    explanation: "When an AWS service principal is allowed in a resource policy, aws:SourceArn (and optionally aws:SourceAccount) scopes the grant to the specific resource that acts on your behalf. Pinning it to the agent ARN means a different agent, even in your own account, cannot invoke the function. The service principal itself stays, because Bedrock invokes the function as a service.",
    whyWrong: {
      "A": "The agent does not call Lambda by assuming its service role as the caller in the resource policy. Bedrock invokes the function as the service principal, so this would break the action group.",
      "B": "The account condition blocks other accounts but still lets any agent in this account call the function. It is weaker than pinning one agent.",
      "C": "VPC placement controls the function's outbound network access. It does not change who is authorized to invoke it."
    },
    services: ["AWS Lambda", "Amazon Bedrock Agents", "AWS IAM"],
    tags: ["confused-deputy", "resource-policy", "source-arn-condition"]
  },
  {
    id: "d2-2.1-18",
    domain: 2, task: "2.1", skills: ["2.1.4"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "A retail assistant uses Amazon Bedrock multi-agent collaboration with billing, shipping and returns collaborator agents. About 80 percent of requests concern exactly one domain, but some need two collaborators. The team wants the lowest latency for single-domain requests without losing support for the complex ones. Which configuration is most appropriate?",
    choices: [
      { id: "A", text: "Use supervisor mode only, so that the supervisor reasons about every request and splits it into sub-tasks before delegating to collaborators." },
      { id: "B", text: "Turn collaboration off and attach all three collaborators' action groups directly to a single agent that handles every request itself." },
      { id: "C", text: "Use supervisor with routing mode, so a clear single-domain request goes straight to one collaborator and other requests fall back to full orchestration." },
      { id: "D", text: "Create one supervisor per domain and expose each behind its own API route, so the client application decides which supervisor to call." }
    ],
    answer: ["C"],
    explanation: "Supervisor with routing mode classifies each request first. If it clearly maps to one collaborator, it is routed directly and skips the supervisor's planning step, which reduces latency and token use. Requests that span domains or are ambiguous fall back to normal supervisor orchestration, so complex cases still work.",
    whyWrong: {
      "A": "Plain supervisor mode runs the full planning step for every request, including the simple ones that dominate traffic.",
      "B": "Merging every action group into one agent bloats the prompt, hurts tool selection accuracy, and removes the specialist separation.",
      "D": "Pushing routing into the client loses the cross-domain orchestration that some requests need, and duplicates logic."
    },
    services: ["Amazon Bedrock Agents"],
    tags: ["multi-agent-collaboration", "supervisor-routing-mode", "latency"]
  },
  {
    id: "d2-2.1-19",
    domain: 2, task: "2.1", skills: ["2.1.4"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A marketing team uploads a voice memo about a new product. An AWS Step Functions workflow must produce a transcript, a written product summary and a promotional image from it. Using service integrations, which THREE state assignments use the right specialist service for each modality? (Select THREE.)",
    choices: [
      { id: "A", text: "Call Amazon Transcribe with StartTranscriptionJob to convert the audio file in Amazon S3 into text." },
      { id: "B", text: "Call a Bedrock text model such as Claude through the bedrock:invokeModel integration to write the summary from the transcript." },
      { id: "C", text: "Call Amazon Nova Canvas through the bedrock:invokeModel integration to generate the promotional image from a text prompt." },
      { id: "D", text: "Send the audio file to Amazon Nova Canvas with the invokeModel integration so it converts the speech into text before summarizing." },
      { id: "E", text: "Call Amazon Titan Text Embeddings V2 through the invokeModel integration to write the product summary from the transcript." },
      { id: "F", text: "Call Amazon Rekognition DetectLabels on the summary text to generate the promotional image for the campaign." }
    ],
    answer: ["A", "B", "C"],
    explanation: "Each modality goes to the model built for it: Transcribe for speech to text, a text-generation foundation model for the summary, and Nova Canvas for image generation. Step Functions can call all three through service integrations, so the pipeline needs little glue code and each step can have its own retry policy.",
    whyWrong: {
      "D": "Nova Canvas generates and edits images. It does not accept audio or transcribe speech.",
      "E": "Titan Text Embeddings V2 returns vectors and does not generate text, so it cannot write a summary.",
      "F": "Rekognition analyzes existing images and video. It does not create images from text."
    },
    services: ["AWS Step Functions", "Amazon Transcribe", "Amazon Bedrock", "Amazon Nova Canvas"],
    tags: ["specialist-models", "multimodal-pipeline", "step-functions-integrations"]
  },
  {
    id: "d2-2.1-20",
    domain: 2, task: "2.1", skills: ["2.1.5"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "You manage an invoice-extraction workflow in AWS Step Functions in which a Bedrock model returns each extracted field with a confidence score. Fields below 0.85 must be reviewed by internal accountants in a web UI before posting, with the LEAST operational overhead. Which TWO actions meet these requirements? (Select TWO.)",
    choices: [
      { id: "A", text: "Create an Amazon A2I flow definition with a private workforce and a worker task template, and call StartHumanLoop from the workflow only when a field's confidence is below 0.85." },
      { id: "B", text: "Use the waitForTaskToken pattern so the state machine pauses until the human loop finishes, and resume it when the A2I completion event arrives." },
      { id: "C", text: "Create a SageMaker Ground Truth labeling job for every invoice, because it supplies the reviewer interface and writes the labeled results to S3." },
      { id: "D", text: "Publish each low-confidence field to an SNS topic and have accountants reply by email with the corrected value, then parse the replies with Lambda." },
      { id: "E", text: "Build a custom review portal on ECS Fargate backed by DynamoDB, and notify accountants of pending reviews through an SQS queue." }
    ],
    answer: ["A", "B"],
    explanation: "Amazon Augmented AI provides managed human-review loops: a flow definition ties a worker UI template to a workforce, and StartHumanLoop is called only for items that fail a threshold. Pausing the workflow with a task token and resuming on the completion event ties the human decision back into the pipeline without polling.",
    whyWrong: {
      "C": "Ground Truth is built for labeling datasets in bulk for model training, not for in-line review of production predictions.",
      "D": "Email replies need parsing and have no review UI, audit trail or workforce management, which adds custom work.",
      "E": "A custom portal reproduces what A2I provides and adds infrastructure to build and secure."
    },
    services: ["Amazon Augmented AI", "AWS Step Functions", "Amazon Bedrock"],
    tags: ["human-in-the-loop", "a2i-flow-definition", "confidence-threshold"]
  },
  {
    id: "d2-2.1-21",
    domain: 2, task: "2.1", skills: ["2.1.5"],
    type: "multi",
    difficulty: "easy",
    source: "generated",
    stem: "An Amazon Bedrock Agent has the action-group functions getOrderStatus, updateShippingAddress and cancelOrder. The company needs explicit user approval before any order is cancelled, enforced by the platform rather than by the model's behavior. Which TWO steps meet the requirement? (Select TWO.)",
    choices: [
      { id: "A", text: "Enable requireConfirmation on the cancelOrder function so the agent pauses and returns the pending action to the application before running it." },
      { id: "B", text: "In the application, show the pending action to the user and send the user's CONFIRM or DENY decision back to the agent in the next InvokeAgent call." },
      { id: "C", text: "Add the sentence 'always ask the user for approval before cancelling an order' to the agent instructions and rely on the model to follow it." },
      { id: "D", text: "Enable requireConfirmation on all three functions so that the user must approve every action, including read-only status lookups." },
      { id: "E", text: "Attach a guardrail with a denied topic for order cancellation, so the agent can never perform the action even when the user approves it." }
    ],
    answer: ["A", "B"],
    explanation: "requireConfirmation is a per-function setting that makes the agent stop and hand the pending call to the application instead of executing it. The application must then ask the user and return a CONFIRM or DENY decision. Because it is configuration rather than prompting, it is deterministic.",
    whyWrong: {
      "C": "Instructions are advisory. The model can skip them, so they do not provide an enforced approval step.",
      "D": "This works but is over-scoped. Confirming read-only lookups adds friction without reducing risk.",
      "E": "A denied topic blocks the behavior completely, so the approved cancellation the business wants could never happen."
    },
    services: ["Amazon Bedrock Agents"],
    tags: ["require-confirmation", "human-approval", "action-groups"]
  },
  {
    id: "d2-2.1-22",
    domain: 2, task: "2.1", skills: ["2.1.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer connects a Strands agent to a remote MCP server over streamable HTTP. The code below raises an error saying the MCP client session is not running when the tools are listed:\n\nfrom strands import Agent\nfrom strands.tools.mcp import MCPClient\nfrom mcp.client.streamable_http import streamablehttp_client\n\nmcp_client = MCPClient(lambda: streamablehttp_client(\"https://tools.example.com/mcp\"))\ntools = mcp_client.list_tools_sync()\nagent = Agent(tools=tools)\nagent(\"Look up order 1042\")\n\nWhich change fixes the problem?",
    choices: [
      { id: "A", text: "Replace list_tools_sync() with a hardcoded list of @tool functions that call the server's REST endpoints directly with the requests library." },
      { id: "B", text: "Wrap the work in a `with mcp_client:` block and list the tools and invoke the agent inside it, so the session stays open while tools run." },
      { id: "C", text: "Pass the server URL straight into Agent(tools=[...]) so that the agent discovers the remote tools itself during construction." },
      { id: "D", text: "Switch to the stdio transport and start the remote server as a local subprocess, because HTTP transports cannot list tools." }
    ],
    answer: ["B"],
    explanation: "The Strands MCP client manages a live session to the server. That session exists only while the client's context is open, so tool discovery and every tool call made by the agent must happen inside the `with` block. Listing tools outside it fails, and tool calls after the block closes would fail too.",
    whyWrong: {
      "A": "This abandons MCP discovery and hand-codes what the server already advertises, which is the opposite of the goal.",
      "C": "Agent does not accept a bare URL as a tool. A client has to connect and supply the tools.",
      "D": "Streamable HTTP supports tool listing. Stdio is for local subprocess servers and cannot reach a remote server."
    },
    services: ["Strands Agents", "Model Context Protocol"],
    tags: ["strands-mcp-client", "streamable-http", "tool-discovery"]
  },
  {
    id: "d2-2.1-23",
    domain: 2, task: "2.1", skills: ["2.1.7"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "Your team is building an MCP server for an internal product catalog. Clients need server-initiated progress notifications over long-lived sessions, and the catalog schema should be available to client applications as read-only context. Which TWO statements describe a correct design? (Select TWO.)",
    choices: [
      { id: "A", text: "Host the server on ECS Fargate behind an Application Load Balancer using streamable HTTP, because a long-running container can hold session state and stream notifications." },
      { id: "B", text: "Expose the catalog schema as an MCP resource, and expose operations with side effects, such as reserveStock, as MCP tools." },
      { id: "C", text: "Host the server on Lambda behind a function URL, because the execution environment's memory reliably holds each session open between separate requests." },
      { id: "D", text: "Expose the catalog schema as an MCP tool so the model fetches it automatically, and expose reserveStock as a resource that the client reads." },
      { id: "E", text: "Expose the schema as an MCP prompt, because prompts are the primitive the server pushes to every client on connect as read-only data." }
    ],
    answer: ["A", "B"],
    explanation: "Stateful, long-lived sessions with server-to-client streaming fit a continuously running container such as Fargate, while Lambda suits stateless request-response servers. MCP separates primitives by who controls them: resources are read-only data the application attaches as context, and tools are actions the model decides to invoke, so side-effecting operations belong in tools.",
    whyWrong: {
      "C": "Lambda environments are short-lived and can be recycled or scaled out between requests, so in-memory session state is not reliable.",
      "D": "This swaps the primitives. Side-effecting actions are tools, and read-only data is a resource.",
      "E": "Prompts are reusable templates that users or applications select. They are not a channel for pushing data to clients."
    },
    services: ["Model Context Protocol", "AWS Fargate", "AWS Lambda"],
    tags: ["mcp-server-hosting", "mcp-primitives", "stateful-sessions"]
  },
  {
    id: "d2-2.2-09",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A startup has a custom LangGraph agent written in Python, with its own graph, checkpointing logic and tool nodes. It needs per-session isolation, inbound authentication and no cluster to manage, and the team wants to pay only while sessions are active. Which hosting option BEST meets these requirements?",
    choices: [
      { id: "A", text: "Import the graph into an Amazon Bedrock Agent by copying its node logic into the agent's instructions, action groups and knowledge bases." },
      { id: "B", text: "Run the code in a Lambda function behind API Gateway, and rely on the function's maximum timeout to cover long-running agent sessions." },
      { id: "C", text: "Deploy the container to ECS Fargate behind an Application Load Balancer, and implement session isolation and authentication in application code." },
      { id: "D", text: "Package the agent as a container and deploy it to Amazon Bedrock AgentCore Runtime, which hosts any framework with microVM session isolation and consumption billing." }
    ],
    answer: ["D"],
    explanation: "AgentCore Runtime is framework-agnostic hosting for agent code, including LangGraph. It provides per-session microVM isolation, inbound authentication through IAM or OAuth, and consumption-based pricing, with no cluster to operate. Fargate can host the same container but leaves isolation, auth and scaling to the team.",
    whyWrong: {
      "A": "Bedrock Agents is a managed orchestration service with its own reasoning loop. It cannot run a custom LangGraph graph or its checkpointing logic.",
      "B": "Lambda has a hard time limit, and long-running or streaming agent sessions do not fit. It also provides no session-level isolation model for agents.",
      "C": "This works technically, but the team would build session isolation and authentication and pay for always-on tasks, so it does not meet the requirements as well."
    },
    services: ["Amazon Bedrock AgentCore", "Amazon ECS", "Amazon Bedrock Agents"],
    tags: ["agentcore-runtime", "langgraph-hosting", "hosting-choice"]
  },
  {
    id: "d2-2.2-10",
    domain: 2, task: "2.2", skills: ["2.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "After deploying a FastAPI Bedrock proxy to ECS Fargate, the application logs show:\n\nbotocore.exceptions.NoCredentialsError: Unable to locate credentials\n\nThe task definition contains:\n\n\"executionRoleArn\": \"arn:aws:iam::111122223333:role/proxy-exec-role\",\n\"networkMode\": \"awsvpc\"\n\nAn engineer already attached a policy allowing bedrock:InvokeModel to proxy-exec-role, and nothing changed. Which change is MOST secure and fixes the problem?",
    choices: [
      { id: "A", text: "Create a role trusted by ecs-tasks.amazonaws.com with a policy limited to the required Bedrock actions and model ARNs, and set it as taskRoleArn." },
      { id: "B", text: "Add AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY for a dedicated IAM user as environment variables in the task definition." },
      { id: "C", text: "Attach the Bedrock policy to the container instance profile of the underlying host, since Fargate tasks inherit the host's instance profile." },
      { id: "D", text: "Open outbound HTTPS in the task's security group so the SDK can reach the credentials endpoint and fetch the execution role's credentials." }
    ],
    answer: ["A"],
    explanation: "The task execution role is used by the ECS agent to pull images and write logs. Application code gets its credentials from the task role (taskRoleArn). With no task role set, the container has no credentials, so the SDK cannot find any. A dedicated task role scoped to the needed actions is the least-privilege fix.",
    whyWrong: {
      "B": "Long-lived keys in plain-text environment variables are a security anti-pattern and are not needed when a task role exists.",
      "C": "Fargate has no host instance profile that tasks can use, so this does nothing.",
      "D": "The problem is a missing role, not a network block. The execution role's credentials are not provided to application code anyway."
    },
    services: ["Amazon ECS", "AWS Fargate", "AWS IAM", "Amazon Bedrock"],
    tags: ["task-role-vs-execution-role", "fargate-credentials", "least-privilege"]
  },
  {
    id: "d2-2.2-11",
    domain: 2, task: "2.2", skills: ["2.2.2"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A team hosts three fine-tuned LLMs of different sizes on Amazon SageMaker. Traffic to each model is uneven, and one endpoint per model leaves GPUs idle. They want the MOST cost-effective design in which each model reserves its own accelerators and memory and scales independently. Which TWO actions should they take? (Select TWO.)",
    choices: [
      { id: "A", text: "Create one endpoint on a GPU instance fleet and deploy each model as an inference component with its own ComputeResourceRequirements and an initial copy count." },
      { id: "B", text: "Register each inference component's copy count as a scalable target in Application Auto Scaling, and scale copies of busy models on invocations per copy." },
      { id: "C", text: "Deploy all three as a multi-model endpoint that loads containers on demand from S3, which reserves dedicated accelerators for each model." },
      { id: "D", text: "Create three production variants on one endpoint with equal weights, and let the traffic distribution decide which model answers each request." },
      { id: "E", text: "Create one SageMaker Serverless Inference endpoint per model, so that every model scales to zero when it is idle." }
    ],
    answer: ["A", "B"],
    explanation: "Inference components let several models share one endpoint's instances while each declares its own accelerator and memory needs and number of copies. Copy counts can then be scaled per component with Application Auto Scaling, so a busy model gets more copies without touching the quiet ones.",
    whyWrong: {
      "C": "Multi-model endpoints share resources and load models on demand, with no per-model reservation, which is a poor fit for large LLMs with steady traffic.",
      "D": "Production variants route traffic by weight for A/B testing. They do not let a request choose between different models.",
      "E": "Serverless Inference does not support GPUs, so it cannot host these LLMs."
    },
    services: ["Amazon SageMaker", "Application Auto Scaling"],
    tags: ["inference-components", "sagemaker-autoscaling", "multi-model-hosting"]
  },
  {
    id: "d2-2.2-12",
    domain: 2, task: "2.2", skills: ["2.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A team must serve a 70-billion-parameter LLM whose FP16 weights need about 140 GB. They want the MOST cost-effective SageMaker option that still leaves headroom for the KV cache. An ml.g5.12xlarge has four 24 GB A10G GPUs (96 GB in total). Which option meets the requirement?",
    choices: [
      { id: "A", text: "Keep the FP16 weights, deploy on ml.g5.12xlarge, and set the tensor parallel degree to 4 so the model is sharded across its four GPUs." },
      { id: "B", text: "Quantize to 4-bit AWQ, which needs roughly 35 to 40 GB of weights, and deploy on a single-GPU ml.g5.2xlarge to keep the instance cost low." },
      { id: "C", text: "Quantize to 4-bit AWQ and deploy on ml.g5.12xlarge with tensor parallel degree 4, which leaves most of the 96 GB for the KV cache." },
      { id: "D", text: "Keep the FP16 weights and deploy on ml.p4d.24xlarge, which has 320 GB of GPU memory and therefore holds the unquantized model easily." }
    ],
    answer: ["C"],
    explanation: "FP16 weights of about 140 GB exceed the 96 GB on a g5.12xlarge, so sharding alone does not help. 4-bit AWQ shrinks the weights to roughly a quarter, so they fit across four GPUs with tensor parallelism and leave memory for the KV cache. This avoids paying for a far larger P4d instance.",
    whyWrong: {
      "A": "Tensor parallelism splits weights across GPUs but does not reduce their total size, and 140 GB cannot fit in 96 GB.",
      "B": "A single g5.2xlarge GPU has 24 GB, which is less than the 35 to 40 GB of quantized weights.",
      "D": "This fits and works, but a p4d.24xlarge costs much more than a quantized deployment on a g5.12xlarge, so it is not the most cost-effective."
    },
    services: ["Amazon SageMaker"],
    tags: ["instance-selection", "awq-quantization", "tensor-parallelism"]
  },
  {
    id: "d2-2.2-13",
    domain: 2, task: "2.2", skills: ["2.2.2"],
    type: "multi",
    difficulty: "easy",
    source: "generated",
    stem: "A FastAPI service must forward tokens to a browser as an LLM hosted on a SageMaker real-time endpoint generates them. Which TWO actions are required? (Select TWO.)",
    choices: [
      { id: "A", text: "Call the SageMaker Runtime InvokeEndpointWithResponseStream API and iterate over the response's event stream, reading each PayloadPart chunk." },
      { id: "B", text: "Make sure the serving container is configured to stream, so that it emits partial output as it generates rather than one complete final body." },
      { id: "C", text: "Call the Amazon Bedrock ConverseStream API and pass the SageMaker endpoint name as the modelId so Bedrock relays the tokens." },
      { id: "D", text: "Call InvokeEndpoint with a stream parameter in the payload, which makes the response body arrive incrementally on a normal blocking read." },
      { id: "E", text: "Switch to an asynchronous inference endpoint, which writes partial results to the S3 output location as the model generates them." }
    ],
    answer: ["A", "B"],
    explanation: "Streaming needs both ends. The client must use InvokeEndpointWithResponseStream and consume the event stream, and the container must actually produce incremental output. The FastAPI service can relay the chunks with a streaming response.",
    whyWrong: {
      "C": "ConverseStream is a Bedrock runtime API that accepts Bedrock model IDs. It cannot be pointed at a SageMaker endpoint.",
      "D": "InvokeEndpoint returns the complete response after the model finishes, whatever the payload says.",
      "E": "Asynchronous inference returns one result to S3 after processing and is not a token streaming mechanism."
    },
    services: ["Amazon SageMaker", "Amazon API Gateway"],
    tags: ["invoke-endpoint-with-response-stream", "token-streaming", "sagemaker-runtime"]
  },
  {
    id: "d2-2.2-14",
    domain: 2, task: "2.2", skills: ["2.2.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An ml.g5.12xlarge real-time endpoint serving a 13B-parameter LLM at low concurrency shows poor per-token latency. GPU utilization is low and the model fits comfortably in memory. Users want faster responses without any change to the model's output quality. Which action is the MOST effective?",
    choices: [
      { id: "A", text: "Move to a larger instance such as ml.g5.48xlarge, which gives the model more GPU memory and more compute for each generated token." },
      { id: "B", text: "Enable speculative decoding with a small draft model through the SageMaker inference optimization capability, so several tokens are verified per forward pass." },
      { id: "C", text: "Compile the model with SageMaker Neo, which rewrites the autoregressive decoding loop so that several tokens are generated per step." },
      { id: "D", text: "Increase the instance count and enable auto scaling, so that multiple instances share the work of generating each request's tokens." }
    ],
    answer: ["B"],
    explanation: "At low concurrency, decoding is bound by the number of sequential forward passes rather than by memory or compute. Speculative decoding lets a small draft model propose several tokens that the large model verifies in one pass, which cuts latency while keeping the output distribution of the large model.",
    whyWrong: {
      "A": "The model already fits and the GPUs are underused, so extra memory or compute does not shorten the sequential decode steps.",
      "C": "Neo compiles models for target hardware and does not change the token-by-token decoding algorithm of an LLM.",
      "D": "More instances add throughput for concurrent requests, but a single request is still generated on one instance, so its latency does not drop."
    },
    services: ["Amazon SageMaker"],
    tags: ["speculative-decoding", "inference-optimization", "token-latency"]
  },
  {
    id: "d2-2.2-15",
    domain: 2, task: "2.2", skills: ["2.2.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A Python Lambda function proxies requests to Amazon Bedrock for a trading desk. Traffic is predictably heavy at 08:00 each weekday, and the cold-start p99 spikes on the first requests each morning must be eliminated. Which approach is MOST resilient against those spikes?",
    choices: [
      { id: "A", text: "Publish a version behind an alias, configure provisioned concurrency on the alias, and use scheduled Application Auto Scaling actions to raise it shortly before 08:00." },
      { id: "B", text: "Enable SnapStart on the function so it restores from a cached snapshot, which removes initialization and restore latency from every invocation entirely." },
      { id: "C", text: "Set reserved concurrency equal to the expected peak, so that enough execution environments are always kept initialized and ready to serve." },
      { id: "D", text: "Raise the function's memory to the maximum, so cold starts initialize faster, and leave scaling entirely on demand throughout the day." }
    ],
    answer: ["A"],
    explanation: "Provisioned concurrency keeps execution environments initialized before requests arrive, and scheduling it ahead of a known peak means the capacity is ready when the traffic is. SnapStart shortens cold starts but still pays a restore step, and reserved concurrency only caps or guarantees capacity without pre-warming it.",
    whyWrong: {
      "B": "SnapStart reduces cold-start time but does not eliminate it, because environments must still be restored from the snapshot.",
      "C": "Reserved concurrency guarantees and limits the maximum concurrency. It does not initialize environments in advance.",
      "D": "More memory shortens initialization somewhat but cold starts still happen when scaling out, so the spikes remain."
    },
    services: ["AWS Lambda", "Application Auto Scaling", "Amazon Bedrock"],
    tags: ["provisioned-concurrency", "snapstart-comparison", "scheduled-scaling"]
  }
);
