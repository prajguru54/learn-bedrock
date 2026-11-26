window.QB = window.QB || [];
window.QB.push(
  {
    id: "d1-1.1-09", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "An insurance carrier is automating first-notice-of-loss claims. The process has fixed steps: validate the policy, extract fields from the claim form, compute a fraud score, route claims above $10,000 to a human adjuster for approval, and then write the decision to a ledger. Auditors require the same step order and a recorded history for every claim, and the model may be used only for field extraction and summary text. Which orchestration approach BEST fits?",
    choices: [
      { id: "A", text: "Create a Bedrock Agent with one action group per step and let the agent's instructions decide the order of calls at runtime." },
      { id: "B", text: "Build an Amazon Bedrock Flow with prompt nodes for each step and rely on the flow to pause for adjuster approval and keep a per-claim audit history." },
      { id: "C", text: "Use an AWS Step Functions state machine that calls Bedrock only in the extraction and summary states, with a task-token wait for adjuster approval." },
      { id: "D", text: "Write one Lambda function that sends the whole claim to a large model and parses the next action from each reply until the model says it is done." }
    ],
    answer: ["C"],
    explanation: "The steps and their order are fixed, so a deterministic workflow engine is the right tool and the model is just one task inside it. Step Functions gives a fixed order, a per-execution history for auditors, and a native wait-for-callback pattern (task token) for human approval. Agents are best when the path through tools is not known in advance.",
    whyWrong: {
      A: "An agent lets the model choose which tool to call and when, so the step order is not guaranteed and can differ per claim, which fails the audit requirement.",
      B: "Flows give a deterministic path, but they have no built-in wait-for-callback for a human approver and no execution history comparable to Step Functions, so the approval and audit needs are not met.",
      D: "A model-driven loop in one function has the same non-determinism as an agent and also leaves no structured per-step history."
    },
    services: ["AWS Step Functions", "Amazon Bedrock", "Amazon Bedrock Agents", "Amazon Bedrock Flows"], tags: ["orchestration-choice", "step-functions-vs-agents", "deterministic-workflow", "human-approval"]
  },
  {
    id: "d1-1.1-10", domain: 1, task: "1.1", skills: ["1.1.1"], type: "multi", difficulty: "medium", source: "generated",
    stem: "Your team must give 3,000 employees a conversational assistant over content in Confluence, SharePoint Online, and Slack. Answers must respect each user's existing document permissions, and the team has two weeks and no dedicated search engineers. Select TWO reasons that make Amazon Q Business a better fit than a custom Bedrock Knowledge Base RAG application.",
    choices: [
      { id: "A", text: "It provides managed connectors for these SaaS sources and honors document-level access control lists, so retrieval is filtered by the signed-in user." },
      { id: "B", text: "It lets the team pick the vector store, chunking algorithm, and embedding model, which gives the finest control over retrieval tuning." },
      { id: "C", text: "It is a managed application with a built-in web experience and identity-aware retrieval, so no ingestion, retrieval, or UI code has to be written." },
      { id: "D", text: "It is billed at one flat price regardless of how many users or queries it serves, which makes it cheaper than any custom pipeline." },
      { id: "E", text: "It infers each user's permissions from the content of the documents, so no identity provider has to be connected to the application." }
    ],
    answer: ["A", "C"],
    explanation: "Q Business is a managed, buy-style option: it brings SaaS connectors, ACL-aware retrieval, and a ready chat experience, which fits a short timeline and a small team. A custom Knowledge Base gives more control but requires you to build and operate the ingestion, permission filtering, and front end yourself.",
    whyWrong: {
      B: "Choosing the vector store, chunking, and embedding model is a reason to build with Knowledge Bases or a custom pipeline, not a benefit of Q Business.",
      D: "Q Business is priced per user subscription plus index capacity, so cost does vary with the number of users and is not a flat price.",
      E: "Permissions come from the source system ACLs combined with the identity provider (such as IAM Identity Center). They are not inferred from document text."
    },
    services: ["Amazon Q Business", "Amazon Bedrock Knowledge Bases", "IAM Identity Center"], tags: ["buy-vs-build", "amazon-q-business", "saas-connectors", "acl-aware-retrieval"]
  },
  {
    id: "d1-1.1-11", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A GenAI developer is mapping four workloads to Amazon Bedrock invocation patterns: (1) a chat widget where users read text as it is produced, (2) classification of 2 million archived tickets overnight with no latency requirement, (3) a web upload that triggers a three-minute multi-step video analysis and an email when it finishes, and (4) a form field that must be auto-completed in under two seconds. Which mapping is correct?",
    choices: [
      { id: "A", text: "(1) batch inference, (2) ConverseStream, (3) synchronous Converse call behind API Gateway, (4) SQS queue with background workers" },
      { id: "B", text: "(1) ConverseStream, (2) batch inference job, (3) asynchronous queue or Step Functions workflow with a notification, (4) synchronous Converse call" },
      { id: "C", text: "(1) synchronous Converse, (2) SQS workers calling on-demand, (3) batch inference job, (4) ConverseStream with a long timeout" },
      { id: "D", text: "(1) ConverseStream, (2) synchronous Converse in a loop, (3) batch inference job, (4) asynchronous queue with a polling client" }
    ],
    answer: ["B"],
    explanation: "Interactive reading maps to streaming, large offline volumes with no deadline map to batch inference, long multi-step work that outlives an HTTP request maps to an asynchronous workflow with a completion notification, and a short single-field lookup maps to a plain synchronous call.",
    whyWrong: {
      A: "Batch inference cannot serve an interactive chat widget, and a three-minute job cannot be held on a synchronous API Gateway request.",
      C: "A synchronous call for chat loses incremental display, and batch inference is not suited to a job that must finish and notify within minutes of an upload.",
      D: "Looping synchronous calls over 2 million items is slow and costly compared with a batch job, and a queue with polling would break the two-second form requirement."
    },
    services: ["Amazon Bedrock", "AWS Step Functions", "Amazon SQS", "Amazon API Gateway"], tags: ["invocation-patterns", "sync-vs-async", "batch-inference", "workload-mapping"]
  },
  {
    id: "d1-1.1-12", domain: 1, task: "1.1", skills: ["1.1.1"], type: "multi", difficulty: "hard", source: "generated",
    stem: "You are designing a multi-tenant SaaS product on Bedrock with a premium tier (3 regulated tenants with contractual data isolation) and a standard tier (about 400 small tenants). Finance also needs model spend attributed per tenant. Select TWO design decisions that meet these requirements.",
    choices: [
      { id: "A", text: "Give each premium tenant its own Knowledge Base and vector collection, and scope the application role for that tenant to that Knowledge Base's ARN only." },
      { id: "B", text: "Create one application inference profile per tenant, tagged with the tenant ID, and invoke models through it so spend can be grouped by tag." },
      { id: "C", text: "Use one shared Knowledge Base for every tenant and instruct the model in the system prompt to answer only from the current tenant's documents." },
      { id: "D", text: "Create a separate guardrail per tenant, because each guardrail keeps the tenant's prompts and documents isolated from other tenants." },
      { id: "E", text: "Let the web client pass its own tenant ID as a retrieval filter on the shared index, since the client already knows which tenant it belongs to." }
    ],
    answer: ["A", "B"],
    explanation: "Regulated tenants warrant a silo model: separate retrieval stores and IAM scoping that does not depend on model behavior. Application inference profiles can be tagged, which lets cost allocation tools attribute usage per tenant. The small tenants can stay pooled, but only with a filter derived server-side from the authenticated identity.",
    whyWrong: {
      C: "Prompt instructions are not an isolation boundary; a shared index with only a prompt rule can leak another tenant's passages.",
      D: "Guardrails filter content and do not isolate data. A guardrail per tenant adds management work without separating anyone's documents.",
      E: "A client-supplied filter can be tampered with. The tenant ID must be taken from the verified identity on the server side."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Bedrock Application Inference Profiles", "AWS IAM", "AWS Cost Explorer"], tags: ["multi-tenancy", "silo-vs-pool", "application-inference-profile", "cost-allocation-tags"]
  },
  {
    id: "d1-1.1-13", domain: 1, task: "1.1", skills: ["1.1.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "Your team is prototyping a phone-based voice assistant that must start speaking within about 1.5 seconds after the caller stops talking. The pipeline uses Amazon Transcribe, a Bedrock model, and Amazon Polly, and the first prototype takes 5 seconds end to end. Which approach BEST decomposes and meets the latency budget?",
    choices: [
      { id: "A", text: "Use Transcribe batch jobs on the saved call audio, send the full transcript to the largest model, and have Polly produce a single MP3 for the whole answer." },
      { id: "B", text: "Keep the sequential stages, but raise the Lambda memory size so that each service call finishes faster and the total fits under 1.5 seconds." },
      { id: "C", text: "Cache the previous answer for each caller so that the pipeline can replay it, and skip Transcribe whenever the caller repeats a question." },
      { id: "D", text: "Set a time budget per stage, use streaming transcription with end-of-speech detection, and start Polly on the first complete sentence of the model output." }
    ],
    answer: ["D"],
    explanation: "A voice experience is judged by time to first audio. Allocate a budget per stage (end-pointing, time to first token, time to first synthesized audio), measure each in the prototype, and overlap stages so Polly starts on the first sentence instead of waiting for the full response. Model choice then follows from the measured time-to-first-token.",
    whyWrong: {
      A: "Batch transcription and whole-answer synthesis are sequential and offline, so each stage waits for the previous one to finish completely.",
      B: "Lambda memory does not speed up remote service calls, and sequential stages still add their full durations.",
      C: "Callers rarely repeat questions verbatim, and skipping Transcribe would not help the typical first-time question."
    },
    services: ["Amazon Transcribe", "Amazon Bedrock", "Amazon Polly"], tags: ["latency-budget", "voice-assistant", "proof-of-concept", "pipelining"]
  },
  {
    id: "d1-1.1-14", domain: 1, task: "1.1", skills: ["1.1.2"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A regulated lender is prototyping a loan-policy question answering assistant, but legal has not yet released any real customer questions. The team wants a representative test set for the proof of concept. Select TWO practices that produce a usable synthetic evaluation set.",
    choices: [
      { id: "A", text: "Prompt a Bedrock model with policy excerpts, personas, and difficulty levels to generate varied question and reference-answer pairs." },
      { id: "B", text: "Use the same model that the assistant will run on to generate the questions, then use it to grade its own answers on them." },
      { id: "C", text: "Have domain experts review a sample of the generated pairs and remove or correct unrealistic or wrong ones before using the set." },
      { id: "D", text: "Generate one question per policy paragraph at temperature 0 so that the set is fully deterministic and contains no variety." },
      { id: "E", text: "Skip review and treat the synthetic results as final proof of production quality since the volume of questions is large." }
    ],
    answer: ["A", "C"],
    explanation: "Synthetic data lets a proof of concept move before real traffic exists. Seeding generation with source passages, personas, and difficulty tiers creates variety, and a human review of a sample catches wrong reference answers. The set is a starting point and should be replaced or extended with real questions once they are available.",
    whyWrong: {
      B: "A model grading its own generated data is biased toward its own style, so a different or stronger model should generate or judge.",
      D: "Temperature 0 with one question per paragraph yields narrow, repetitive coverage that misses paraphrases and multi-passage questions.",
      E: "Volume does not replace validation; unreviewed synthetic data can contain errors and cannot prove production quality."
    },
    services: ["Amazon Bedrock"], tags: ["synthetic-data", "proof-of-concept", "test-set-generation", "human-review"]
  },
  {
    id: "d1-1.1-15", domain: 1, task: "1.1", skills: ["1.1.3"], type: "single", difficulty: "easy", source: "generated",
    stem: "Five product teams each deploy Bedrock-based services and keep rebuilding the same baseline of a guardrail, invocation logging, and a least-privilege invoke role. The platform team wants every team to consume one tested, versioned definition. What should the platform team do?",
    choices: [
      { id: "A", text: "Package the baseline as a CDK L3 construct library, publish it to an AWS CodeArtifact repository, and have teams install it as a versioned dependency." },
      { id: "B", text: "Paste the baseline template into the team wiki and ask each team to copy the latest version into its own repository." },
      { id: "C", text: "Publish the baseline as a Lambda layer so that each team's functions inherit the guardrail and logging at runtime." },
      { id: "D", text: "Email each team a CloudFormation snippet each quarter and ask them to merge the changes into their stacks by hand." }
    ],
    answer: ["A"],
    explanation: "An L3 construct encapsulates several resources and secure defaults behind one interface. Publishing it to CodeArtifact as a versioned package gives teams semantic versioning, controlled upgrades, and a single place to fix defects.",
    whyWrong: {
      B: "Copying from a wiki leads to drift and has no versioning or upgrade path.",
      C: "A Lambda layer shares code inside functions and cannot create infrastructure such as guardrails, roles, or log configuration.",
      D: "Manual quarterly merges are slow and error-prone, and teams will diverge from the baseline."
    },
    services: ["AWS CDK", "AWS CodeArtifact", "Amazon Bedrock Guardrails"], tags: ["reusable-components", "cdk-l3-construct", "codeartifact", "platform-engineering"]
  },
  {
    id: "d1-1.1-16", domain: 1, task: "1.1", skills: ["1.1.3"], type: "single", difficulty: "hard", source: "generated",
    stem: "A security team wrote this AWS CloudFormation Guard rule:\n\nrule agent_requires_guardrail {\n  Resources.*[ Type == 'AWS::Bedrock::Agent' ].Properties.GuardrailConfiguration exists\n}\n\nThey need any stack that creates a Bedrock agent without a guardrail to be rejected at provisioning time, whether it is deployed from a pipeline or by hand. Which mechanism enforces this?",
    choices: [
      { id: "A", text: "Run the rule with cfn-guard in the CI pipeline only, and trust that all stacks are deployed through that pipeline." },
      { id: "B", text: "Register a CloudFormation Guard Hook that uses the rule, with its failure mode set to FAIL and targeting the agent resource type." },
      { id: "C", text: "Register a CloudFormation Guard Hook that uses the rule, with its failure mode set to WARN so that deployments continue and log findings." },
      { id: "D", text: "Create an AWS Config rule with the same logic, which evaluates agents after they exist and flags the ones without a guardrail." }
    ],
    answer: ["B"],
    explanation: "A CloudFormation Hook runs proactively during stack operations, before the resource is provisioned. A Guard Hook evaluates Guard rules, and a failure mode of FAIL stops the operation for non-compliant resources, regardless of how the stack was launched.",
    whyWrong: {
      A: "A CI check is bypassed by anyone who deploys outside the pipeline, so it is not enforced at provisioning time.",
      C: "WARN lets the non-compliant resource be created and only reports a message, which does not reject the stack.",
      D: "AWS Config is detective: it evaluates after the agent exists, so the non-compliant resource is already provisioned."
    },
    services: ["AWS CloudFormation", "AWS CloudFormation Guard", "Amazon Bedrock Agents"], tags: ["policy-as-code", "cloudformation-hooks", "cfn-guard", "guardrail-enforcement"]
  },
  {
    id: "d1-1.2-10", domain: 1, task: "1.2", skills: ["1.2.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "A legal team must summarize a single 150,000-token contract bundle in one request and receive a detailed summary of up to 12,000 tokens. The developer compares these specifications (hypothetical values):\n\nModel P: context window 128,000 tokens, max output 8,192 tokens\nModel Q: context window 200,000 tokens, max output 8,192 tokens\nModel R: context window 200,000 tokens, max output 64,000 tokens\nModel S: context window 160,000 tokens, max output 4,096 tokens\n\nWhich model satisfies the requirement in a single request?",
    choices: [
      { id: "A", text: "Model P, because its context window is closest to the document size and leaves little unused space." },
      { id: "B", text: "Model Q, because its 200,000-token window easily holds the 150,000-token bundle and the summary." },
      { id: "C", text: "Model R, because it fits the 150,000-token input plus 12,000 output tokens, and can emit them." },
      { id: "D", text: "Model S, because its 160,000-token window covers the bundle and the summary together." }
    ],
    answer: ["C"],
    explanation: "Two limits must both hold: input plus output must fit inside the context window (150,000 + 12,000 = 162,000), and the requested output must not exceed the model's maximum output tokens (12,000). Only Model R satisfies both limits. Model Q fits the window but cannot produce a 12,000-token reply.",
    whyWrong: {
      A: "128,000 tokens is smaller than the 150,000-token input, so the bundle does not fit at all.",
      B: "The window is large enough, but the 8,192-token output cap is below the 12,000 tokens requested, so the summary would be cut off.",
      D: "160,000 tokens cannot hold 150,000 input plus 12,000 output (162,000), and the 4,096 output cap is also too low."
    },
    services: ["Amazon Bedrock"], tags: ["context-window", "max-output-tokens", "model-specs", "long-context"]
  },
  {
    id: "d1-1.2-11", domain: 1, task: "1.2", skills: ["1.2.1"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A developer enables extended thinking on a Claude model through the Converse API for a nightly route-planning job by passing additionalModelRequestFields={\"thinking\": {\"type\": \"enabled\", \"budget_tokens\": 4000}}. Select TWO statements that are accurate about this configuration.",
    choices: [
      { id: "A", text: "Thinking tokens are billed as output tokens, so enabling extended thinking raises cost and generally adds latency before the final answer." },
      { id: "B", text: "Thinking tokens are hidden from the response, so they do not count toward output charges, but they still extend latency." },
      { id: "C", text: "The maxTokens value in inferenceConfig has to be larger than the thinking budget, because thinking and the final answer share it." },
      { id: "D", text: "Extended thinking lowers latency, because the model plans internally and therefore writes a shorter final answer faster." },
      { id: "E", text: "Extended thinking is only available through InvokeModel, so the same request would fail when sent through the Converse API." }
    ],
    answer: ["A", "C"],
    explanation: "Reasoning improves multi-step planning quality, but the thinking tokens are generated and billed as output, and they add time before the final text. For Claude the thinking budget has to fit inside the maximum output tokens, so maxTokens must exceed budget_tokens.",
    whyWrong: {
      B: "Thinking tokens are billed as output tokens even when the reasoning text is summarized or not shown to the caller.",
      D: "The model generates additional tokens before answering, so latency goes up rather than down.",
      E: "Converse accepts the thinking configuration through additionalModelRequestFields, so it is not limited to InvokeModel."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Converse API"], tags: ["extended-thinking", "reasoning-models", "cost-latency-tradeoff", "budget-tokens"]
  },
  {
    id: "d1-1.2-12", domain: 1, task: "1.2", skills: ["1.2.1"], type: "single", difficulty: "easy", source: "generated",
    stem: "A marketing team wants to generate new product images from text prompts using a model hosted in Amazon Bedrock. A developer is checking which candidate models can produce images as output. Which model fits?",
    choices: [
      { id: "A", text: "Anthropic Claude Sonnet, which accepts images as input but returns only text output." },
      { id: "B", text: "Amazon Nova Pro, which understands image and video input but returns only text output." },
      { id: "C", text: "Amazon Titan Multimodal Embeddings G1, which converts images and text into vectors for search." },
      { id: "D", text: "Amazon Nova Canvas, which generates images from text prompts and supports editing such as inpainting." }
    ],
    answer: ["D"],
    explanation: "Modality fit is the first model-selection filter. Nova Canvas (like Titan Image Generator and Stability models) outputs images, while the other choices either only consume images (understanding models) or output embedding vectors.",
    whyWrong: {
      A: "Claude can analyze images that you send it, but its output is text, so it cannot generate a new picture.",
      B: "Nova Pro is a multimodal understanding model with text output; image generation is handled by Nova Canvas.",
      C: "An embeddings model returns vectors used for similarity search, not images."
    },
    services: ["Amazon Bedrock", "Amazon Nova Canvas"], tags: ["modality-fit", "image-generation", "model-selection", "nova-canvas"]
  },
  {
    id: "d1-1.2-13", domain: 1, task: "1.2", skills: ["1.2.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A research team needs a niche open-weight biomedical language model that Bedrock does not offer as a serverless model. They want to size the instances themselves but still call the model through Bedrock APIs such as Converse, with Bedrock Guardrails attached. Which option fits?",
    choices: [
      { id: "A", text: "Subscribe to the model in Amazon Bedrock Marketplace, deploy it to a managed endpoint on instances they choose, and invoke it through Bedrock APIs." },
      { id: "B", text: "Use Custom Model Import, which hosts any open-weight model serverlessly regardless of its architecture, and invoke it through Bedrock." },
      { id: "C", text: "Deploy the model from SageMaker JumpStart and call it through the SageMaker runtime API, which is how Bedrock Converse reaches JumpStart endpoints." },
      { id: "D", text: "Open a request to have the model added as an on-demand Bedrock model, because Bedrock will host any open-weight model on request." }
    ],
    answer: ["A"],
    explanation: "Bedrock Marketplace offers a catalog of specialized models that run on managed endpoints with instance types you select, while you still use Bedrock APIs and features like Guardrails. Custom Model Import is for weights you already have in a supported architecture, and JumpStart endpoints are reached through SageMaker APIs.",
    whyWrong: {
      B: "Custom Model Import supports specific architectures and needs you to supply the weights, so it does not accept any model.",
      C: "JumpStart endpoints are invoked through SageMaker APIs; the Bedrock Converse API does not route to them.",
      D: "There is no on-request hosting for arbitrary open-weight models, and serverless availability is chosen by AWS."
    },
    services: ["Amazon Bedrock Marketplace", "Amazon SageMaker JumpStart", "Amazon Bedrock Custom Model Import"], tags: ["bedrock-marketplace", "open-weight-models", "model-access-options", "deployment-choice"]
  },
  {
    id: "d1-1.2-14", domain: 1, task: "1.2", skills: ["1.2.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A developer sends this request and receives the error below.\n\nresponse = bedrock.converse(\n    modelId=MODEL_ID,\n    messages=messages,\n    inferenceConfig={\"maxTokens\": 512, \"temperature\": 0.2, \"topK\": 40},\n)\n\nParamValidationError: Unknown parameter in inferenceConfig: \"topK\", must be one of: maxTokens, temperature, topP, stopSequences\n\nThe model is a Claude model and the team wants the code to stay portable across model families. Which change fixes the request?",
    choices: [
      { id: "A", text: "Rename the field to top_k inside inferenceConfig, because Converse expects snake_case names for sampling parameters." },
      { id: "B", text: "Switch to InvokeModel with a model-native body, because Converse cannot pass any model-specific sampling parameter." },
      { id: "C", text: "Move the value to additionalModelRequestFields={\"top_k\": 40}, which carries model-specific parameters alongside the common ones." },
      { id: "D", text: "Wrap the value in a performanceConfig block, which accepts sampling parameters that are not covered by inferenceConfig." }
    ],
    answer: ["C"],
    explanation: "inferenceConfig holds only the parameters common to all models. Parameters unique to a model, such as Claude's top_k, go in additionalModelRequestFields using the model's own field names. The rest of the request stays model-agnostic.",
    whyWrong: {
      A: "The set of fields in inferenceConfig is fixed, so renaming does not make top_k a valid member.",
      B: "Converse supports model-specific parameters through additionalModelRequestFields, so dropping to InvokeModel is unnecessary and loses portability.",
      D: "performanceConfig controls latency optimization settings, not sampling parameters."
    },
    services: ["Amazon Bedrock Converse API"], tags: ["converse-api", "additional-model-request-fields", "top-k", "portability"]
  },
  {
    id: "d1-1.2-15", domain: 1, task: "1.2", skills: ["1.2.2"], type: "single", difficulty: "hard", source: "generated",
    stem: "Your team calls a Claude model from a Lambda function that reads the model ID from an environment variable. They want to send 10% of traffic to a newer model, watch error and latency alarms, and have the shift rolled back automatically if the alarms fire. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Change the environment variable on the $LATEST version to the new model ID and watch the alarms to decide when to revert it." },
      { id: "B", text: "Publish a new function version with the new model ID and use a CodeDeploy canary on the alias, with the CloudWatch alarms configured to trigger rollback." },
      { id: "C", text: "Create a second API Gateway stage that uses the new model and ask a subset of users to call that stage manually." },
      { id: "D", text: "Add two weighted Route 53 records for the same endpoint, with the new model behind the 10% record and health checks on it." }
    ],
    answer: ["B"],
    explanation: "Environment variables belong to a function version, so a safe shift needs a published version per model. An alias can split traffic by weight between two versions, and CodeDeploy automates a canary shift with alarm-based rollback to the previous version.",
    whyWrong: {
      A: "Editing $LATEST changes the model for all traffic at once and relies on a person to notice and revert.",
      C: "Asking users to switch stages is not a controlled percentage split and has no automatic rollback.",
      D: "Weighted DNS can split traffic between two deployments, but it needs a duplicate endpoint, caches at resolvers, and does not roll back on application alarms."
    },
    services: ["AWS Lambda", "AWS CodeDeploy", "Amazon CloudWatch", "Amazon Bedrock"], tags: ["canary-deployment", "lambda-alias-routing", "model-migration", "alarm-rollback"]
  },
  {
    id: "d1-1.2-16", domain: 1, task: "1.2", skills: ["1.2.3"], type: "multi", difficulty: "hard", source: "generated",
    stem: "An insurance chatbot runs in us-east-1 with Amazon API Gateway, Lambda, and a Bedrock Knowledge Base. The business wants an active-passive disaster recovery design in us-west-2 for a full regional outage, and this is a separate need from spreading inference across Regions. Select TWO measures that deliver this.",
    choices: [
      { id: "A", text: "Create Route 53 failover records (primary and secondary) with a health check on a primary endpoint that exercises the Bedrock call path." },
      { id: "B", text: "Replicate the source documents to a bucket in us-west-2 and keep a Knowledge Base in that Region synced from the replica." },
      { id: "C", text: "Turn on a cross-Region inference profile, which also moves the API, the Lambda function, and the knowledge base to the second Region when needed." },
      { id: "D", text: "Create one simple-routing Route 53 record that lists both Regional endpoints, so clients are directed to the healthy Region by DNS." },
      { id: "E", text: "Ask Bedrock to mirror the Knowledge Base automatically into the secondary Region, which the service does for every Knowledge Base by default." }
    ],
    answer: ["A", "B"],
    explanation: "A regional failover design needs both traffic redirection and data availability in the passive Region. Route 53 failover routing with a meaningful health check shifts clients, and a Knowledge Base populated from replicated source data means retrieval works there. The cross-Region inference profile only routes model requests.",
    whyWrong: {
      C: "An inference profile only distributes model invocations; it does not move or replicate the application or the knowledge base, and the application is still in the failed Region.",
      D: "Simple routing returns all values without health evaluation, so clients can be sent to the failed Region.",
      E: "Knowledge Bases are Regional and are not mirrored automatically; you create and sync one in the second Region."
    },
    services: ["Amazon Route 53", "Amazon S3", "Amazon Bedrock Knowledge Bases", "Amazon API Gateway"], tags: ["multi-region-dr", "route53-failover", "active-passive", "knowledge-base-replication"]
  },
  {
    id: "d1-1.2-17", domain: 1, task: "1.2", skills: ["1.2.3"], type: "multi", difficulty: "medium", source: "generated",
    stem: "Your team receives notice that the model behind a production summarization service has moved to Legacy status, with an end-of-life date in six months. Select TWO actions that BEST prevent an outage.",
    choices: [
      { id: "A", text: "Read the model ID from configuration rather than code, and validate a successor model with the application's own prompts well before the end-of-life date." },
      { id: "B", text: "Wait for the end-of-life date and then switch, since Bedrock redirects calls for the retired model ID to the successor model automatically." },
      { id: "C", text: "Buy Provisioned Throughput for the legacy model, because a commitment keeps the model available beyond its published end-of-life date." },
      { id: "D", text: "Run a scheduled check that reads the modelLifecycle status from the foundation model details and alerts when a model in use is Legacy." },
      { id: "E", text: "Pin the application to the model ID without a version suffix, so that Bedrock selects a compatible newer release by itself." }
    ],
    answer: ["A", "D"],
    explanation: "Deprecation is managed by lead time. Externalizing the model ID keeps the cutover cheap, and testing the successor with real prompts catches behavior changes (prompts often need retuning). Foundation model details include a lifecycle status, so a scheduled check can alert before a model reaches end of life.",
    whyWrong: {
      B: "Bedrock does not redirect retired model IDs; calls to a model after its end of life fail.",
      C: "A Provisioned Throughput commitment does not extend a model past its end-of-life date.",
      E: "Model IDs identify specific model versions, and Bedrock does not silently swap in newer ones."
    },
    services: ["Amazon Bedrock", "AWS Systems Manager Parameter Store", "Amazon EventBridge"], tags: ["model-deprecation", "model-lifecycle", "end-of-life", "config-driven-model-id"]
  },
  {
    id: "d1-1.2-18", domain: 1, task: "1.2", skills: ["1.2.4"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A team fine-tuned a Llama model themselves and keeps the weights in Amazon S3. Traffic is low and bursty, with a few busy hours per day, and the team wants the lowest operational burden. Select TWO statements that support choosing Bedrock Custom Model Import over a SageMaker real-time endpoint.",
    choices: [
      { id: "A", text: "The imported model is served through Bedrock invocation APIs, so no instances have to be provisioned, patched, or scaled by the team." },
      { id: "B", text: "Model copies scale down when idle, so charges stop between busy periods, though the first request after idle can see a cold start." },
      { id: "C", text: "Custom Model Import guarantees there are no cold starts, because the weights are always kept loaded on dedicated hosts." },
      { id: "D", text: "Custom Model Import accepts any model architecture and a custom inference container, which makes it more flexible than SageMaker." },
      { id: "E", text: "A SageMaker real-time endpoint stops billing for instances while idle by default, so it cannot be more expensive for bursty traffic." }
    ],
    answer: ["A", "B"],
    explanation: "Custom Model Import is a serverless-style path: you bring weights in a supported architecture, Bedrock hosts them, and you pay for active model copies. The trade-off is a cold start when a copy has to be loaded after idleness. A SageMaker endpoint gives more control but keeps instances running and billed until you scale or stop them.",
    whyWrong: {
      C: "Idle model copies are released, so the first call after a quiet period can wait while a copy loads; there is no no-cold-start guarantee.",
      D: "Custom Model Import supports a defined set of architectures and does not take custom containers; SageMaker is the flexible option.",
      E: "A real-time endpoint bills for its running instances around the clock unless you delete it or configure scale-to-zero yourself."
    },
    services: ["Amazon Bedrock Custom Model Import", "Amazon SageMaker AI", "Amazon S3"], tags: ["custom-model-import", "sagemaker-endpoint-tradeoff", "cold-start", "operational-burden"]
  },
  {
    id: "d1-1.3-09", domain: 1, task: "1.3", skills: ["1.3.1"], type: "multi", difficulty: "hard", source: "generated",
    stem: "Before text documents are embedded into a knowledge base, a pipeline must make sure that only English, non-trivial, non-toxic documents are indexed, and that rejected documents can be reviewed later. Select THREE steps that belong in the validation stage (a Lambda function triggered when a document lands in S3).",
    choices: [
      { id: "A", text: "Call Amazon Comprehend DetectDominantLanguage on the text and reject documents whose dominant language is not English." },
      { id: "B", text: "Reject documents that are empty or shorter than a minimum character count, and skip exact duplicates by comparing content hashes." },
      { id: "C", text: "Call Comprehend toxicity detection on the text and divert documents above a threshold." },
      { id: "D", text: "Embed every document first and rely on the guardrail at answer time to hide any bad content from users." },
      { id: "E", text: "Delete failing documents from the source bucket immediately so that nothing about them remains for review." },
      { id: "F", text: "Run Amazon Rekognition content moderation on the text of every document to detect inappropriate language." }
    ],
    answer: ["A", "B", "C"],
    explanation: "Validation before embedding is cheaper than cleaning a vector index later. Language detection, basic content checks such as length and duplicates, and toxicity detection all run on the text, and the failing documents are written to a quarantine prefix with a reason, rather than discarded.",
    whyWrong: {
      D: "Embedding bad documents pollutes the index and a guardrail at answer time does not remove irrelevant or duplicate content from retrieval.",
      E: "Deleting failures removes the evidence needed to diagnose upstream problems; they should be quarantined with a reason.",
      F: "Rekognition moderation analyzes images and video, not text documents."
    },
    services: ["AWS Lambda", "Amazon Comprehend", "Amazon S3"], tags: ["data-validation", "language-detection", "toxicity-detection", "quarantine-pattern"]
  },
  {
    id: "d1-1.3-10", domain: 1, task: "1.3", skills: ["1.3.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A Bedrock model customization job for an Amazon Titan Text model fails validation on the training file. The first lines of train.jsonl are:\n\n{\"question\": \"What is our refund window?\", \"answer\": \"30 days from delivery.\"}\n{\"question\": \"Do you ship abroad?\", \"answer\": \"Yes, to 40 countries.\"}\n\nWhich change fixes the dataset format?",
    choices: [
      { id: "A", text: "Rename the keys to prompt and completion in every record, keeping exactly one JSON object per line." },
      { id: "B", text: "Wrap every record in a single JSON array and save the result as a train.json file for the job." },
      { id: "C", text: "Convert the records to a CSV file with question and answer columns and a header row." },
      { id: "D", text: "Convert each record to a messages array of role and content objects, which all customization models require." }
    ],
    answer: ["A"],
    explanation: "Bedrock fine-tuning data is JSON Lines, one record per line, with the field names the base model expects. Titan Text models expect prompt and completion fields, so custom key names such as question and answer fail validation. A messages-style schema applies only to models that define it.",
    whyWrong: {
      B: "The format is JSON Lines, not a single JSON array, so a wrapped array would still fail validation.",
      C: "CSV is not an accepted training data format for Bedrock customization jobs.",
      D: "The messages schema is used by conversational models such as Claude, and it is not required for every model."
    },
    services: ["Amazon Bedrock", "Amazon S3"], tags: ["fine-tuning-dataset", "jsonl-format", "prompt-completion-schema", "validation-error"]
  },
  {
    id: "d1-1.3-11", domain: 1, task: "1.3", skills: ["1.3.1"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A team is building a preference dataset (pairs of model answers labeled with the better one) in Amazon SageMaker Ground Truth to tune a support model. Label quality has been uneven in an earlier pilot. Select TWO practices that improve and verify label quality.",
    choices: [
      { id: "A", text: "Send each answer pair to several annotators and consolidate their labels, so that a single annotator's mistake does not decide the label." },
      { id: "B", text: "Give each pair to exactly one annotator to maximize throughput, and treat every returned label as correct." },
      { id: "C", text: "Measure inter-annotator agreement, and route items with low agreement to expert review or revised annotation guidelines." },
      { id: "D", text: "Have a Bedrock model label every pair, then use those labels for training without a second check." },
      { id: "E", text: "Use the training loss of the tuned model as the only measure of whether the human labels were consistent." }
    ],
    answer: ["A", "C"],
    explanation: "Preference labels are subjective, so quality comes from redundancy and measurement. Multiple annotators per item with consolidation reduce individual error, and agreement metrics expose ambiguous items or unclear guidelines that should be fixed or escalated.",
    whyWrong: {
      B: "A single unverified label per item gives no way to detect errors or bias from one annotator.",
      D: "Unchecked model-generated labels inherit that model's biases and do not provide independent human validation.",
      E: "Training loss reflects how well the model fits the data, not whether the labels are consistent, so it cannot validate annotation quality."
    },
    services: ["Amazon SageMaker Ground Truth"], tags: ["ground-truth", "preference-data", "inter-annotator-agreement", "label-quality"]
  },
  {
    id: "d1-1.3-12", domain: 1, task: "1.3", skills: ["1.3.2"], type: "multi", difficulty: "easy", source: "generated",
    stem: "Analysts want to ask questions such as 'What was total revenue by region last quarter?' over a 40-million-row sales table stored in S3 and cataloged in AWS Glue. Select THREE steps that make a safe text-to-SQL design with Amazon Athena.",
    choices: [
      { id: "A", text: "Include the table schema and column descriptions from the Glue Data Catalog in the prompt so the model can write Athena SQL." },
      { id: "B", text: "Run the generated SQL with a read-only role in an Athena workgroup that limits the amount of data scanned per query." },
      { id: "C", text: "Pass the query result rows back to the model so that it phrases the answer, with the numbers coming from the query." },
      { id: "D", text: "Serialize all 40 million rows as CSV text and send them to the model in chunks so that it can add up the totals itself." },
      { id: "E", text: "Embed each row into a vector index and retrieve the top 10 rows, then ask the model to estimate the totals from them." },
      { id: "F", text: "Fine-tune the model on the table contents so that it memorizes revenue totals for every region and quarter." }
    ],
    answer: ["A", "B", "C"],
    explanation: "Aggregate questions over large tables are computations, so the database should do the math. The model translates the question to SQL using the schema, the query runs with least privilege and scan limits, and the model only explains the verified results.",
    whyWrong: {
      D: "Millions of rows cannot fit in a context window, and a model summing text is unreliable.",
      E: "Top-k retrieval returns a handful of rows, so sums and counts computed from them would be wrong.",
      F: "Fine-tuning does not reliably memorize numbers and goes stale as soon as the table changes."
    },
    services: ["Amazon Athena", "AWS Glue", "Amazon Bedrock", "Amazon S3"], tags: ["text-to-sql", "tabular-data", "athena", "read-only-execution"]
  },
  {
    id: "d1-1.3-13", domain: 1, task: "1.3", skills: ["1.3.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A media team wants analysts to ask free-form questions about visual events in 5-minute video clips stored in S3, such as 'When does the presenter hold up the product?'. Which approach BEST meets this requirement?",
    choices: [
      { id: "A", text: "Run Amazon Rekognition label detection on each clip and ask a text model questions about the list of detected labels." },
      { id: "B", text: "Transcribe the audio track with Amazon Transcribe and send the transcript to a text model for question answering." },
      { id: "C", text: "Extract one frame every second as images and attach all of them to a single Converse request for a text-only model." },
      { id: "D", text: "Send the clip to a video-capable Nova model with a video content block that references its S3 location in the Converse API." }
    ],
    answer: ["D"],
    explanation: "Nova understanding models accept video in the Converse API, including by S3 location, so the model can reason over what is visible and when. Label lists and transcripts lose most of the visual detail and timing needed for open-ended questions.",
    whyWrong: {
      A: "Rekognition labels are a coarse summary of objects and scenes, so detailed events like holding up a product are not captured.",
      B: "A transcript only captures speech and says nothing about what appears on screen.",
      C: "A text-only model cannot take images, and hundreds of frames would also exceed practical request limits."
    },
    services: ["Amazon Bedrock Converse API", "Amazon Nova", "Amazon S3"], tags: ["video-input", "multimodal", "nova-video", "converse-content-blocks"]
  },
  {
    id: "d1-1.3-14", domain: 1, task: "1.3", skills: ["1.3.2"], type: "single", difficulty: "hard", source: "generated",
    stem: "A developer sends a PDF to a model with the Converse API and gets a ValidationException that mentions the document name.\n\ndoc = open(\"Q3-report.pdf\", \"rb\").read()\nbedrock.converse(modelId=MODEL_ID, messages=[{\"role\": \"user\", \"content\": [\n  {\"text\": \"Summarize the risks.\"},\n  {\"document\": {\"format\": \"pdf\", \"name\": \"Q3 report (final).pdf\", \"source\": {\"bytes\": doc}}}\n]}])\n\nWhat is the cause?",
    choices: [
      { id: "A", text: "The format field must be uppercase PDF, since document formats are case-sensitive enum values in Converse." },
      { id: "B", text: "The name contains a period; names allow only letters, digits, single spaces, hyphens, parentheses, and square brackets." },
      { id: "C", text: "The bytes must be base64-encoded text before they are placed in the source field of the document block." },
      { id: "D", text: "Document blocks accept only an S3 location, and raw bytes are rejected for PDF files in Converse requests." }
    ],
    answer: ["B"],
    explanation: "The Converse document block restricts the name field to a limited character set, and the file extension belongs in format, not in name. The fix is name \"Q3 report (final)\". For scanned PDFs or very large files, or when you need exact table and form structure, a Textract-based extraction step before the model is the better design.",
    whyWrong: {
      A: "The format value is the lowercase string pdf, which is a valid value in this request.",
      C: "With the AWS SDK, source bytes are passed as raw bytes and the SDK handles the encoding on the wire.",
      D: "Converse accepts documents as bytes, and an S3 location is an additional option for supported models, not a requirement."
    },
    services: ["Amazon Bedrock Converse API", "Amazon Textract"], tags: ["converse-document-block", "pdf-input", "validation-error", "textract-fallback"]
  },
  {
    id: "d1-1.3-15", domain: 1, task: "1.3", skills: ["1.3.3"], type: "single", difficulty: "medium", source: "generated",
    stem: "A team must keep using a Cohere Embed model and runs this code. The call fails with a ValidationException about the request body.\n\nbody = {\"inputText\": \"refund policy\", \"dimensions\": 512, \"normalize\": True}\nbedrock.invoke_model(modelId=\"cohere.embed-english-v3\", body=json.dumps(body))\n\nWhich change makes the request valid for this model?",
    choices: [
      { id: "A", text: "Add an anthropic_version field to the body, because every InvokeModel body requires a version string." },
      { id: "B", text: "Replace inputText with prompt and add a max_tokens field, since embedding calls need generation settings." },
      { id: "C", text: "Send the same body through the Converse API, because Converse is the common way to request embeddings." },
      { id: "D", text: "Use the Cohere body shape, with a texts array and an input_type such as search_query, instead of the Titan-style fields." }
    ],
    answer: ["D"],
    explanation: "InvokeModel bodies are model-specific. The body shown is the Titan Text Embeddings V2 shape (inputText, dimensions, normalize), while Cohere Embed expects a texts list plus input_type (for example search_document at indexing time and search_query at query time).",
    whyWrong: {
      A: "anthropic_version belongs to Anthropic Claude message bodies, and Cohere Embed does not use it.",
      B: "Embedding models do not take prompt or max_tokens; they take the texts to embed.",
      C: "Converse is for conversational generation and does not request embeddings."
    },
    services: ["Amazon Bedrock", "Cohere Embed", "Amazon Titan Text Embeddings"], tags: ["embedding-request-format", "invoke-model", "cohere-embed", "titan-embeddings-v2"]
  },
  {
    id: "d1-1.3-16", domain: 1, task: "1.3", skills: ["1.3.3"], type: "single", difficulty: "hard", source: "generated",
    stem: "An image-description feature calls Claude with InvokeModel and fails with this error:\n\nValidationException: ... required key [anthropic_version] not found\n\nThe request body is:\n\n{\"max_tokens\": 1024, \"messages\": [{\"role\": \"user\", \"content\": [\n  {\"type\": \"image\", \"source\": {\"type\": \"base64\", \"media_type\": \"image/png\", \"data\": \"<b64>\"}},\n  {\"type\": \"text\", \"text\": \"Describe this chart.\"}\n]}]}\n\nWhich change fixes the request?",
    choices: [
      { id: "A", text: "Replace the base64 source with an s3:// URI, because InvokeModel image blocks must reference S3 objects." },
      { id: "B", text: "Move the image into a top-level images array, because message content may contain text blocks only." },
      { id: "C", text: "Add \"anthropic_version\": \"bedrock-2023-05-31\" to the body, keeping the base64 image block as it is." },
      { id: "D", text: "Set the contentType parameter of the call to image/png so that the service reads the payload as an image." }
    ],
    answer: ["C"],
    explanation: "Claude message bodies on Bedrock InvokeModel must include anthropic_version, as the error says. The base64 image block with a media_type is already the correct native format for images, so the only change is adding the version key. Converse would avoid this model-specific detail altogether.",
    whyWrong: {
      A: "The native Claude image block uses base64 data with a media type; it is not an S3 URI reference.",
      B: "Images are content blocks inside the message content array, so a separate images array is not part of the format.",
      D: "contentType describes the request body, which is JSON, not the image inside it."
    },
    services: ["Amazon Bedrock", "Anthropic Claude"], tags: ["invoke-model", "anthropic-version", "multimodal-request", "base64-image"]
  },
  {
    id: "d1-1.3-17", domain: 1, task: "1.3", skills: ["1.3.4"], type: "single", difficulty: "medium", source: "generated",
    stem: "A global retailer's knowledge base holds product documentation in English, German, and Japanese, and users ask questions in about a dozen languages. The team needs retrieval that stays accurate as languages are added. Which design is MOST scalable?",
    choices: [
      { id: "A", text: "Use a multilingual embedding model for both documents and queries, so that text in different languages maps into one shared vector space." },
      { id: "B", text: "Detect each query's language with Comprehend and translate it to English with Amazon Translate before it is embedded by an English-only model." },
      { id: "C", text: "Create a separate knowledge base per language and route every query to a base chosen by the language it is detected in." },
      { id: "D", text: "Fine-tune an English-only embedding model on a few thousand translated query pairs for every new language that is introduced." }
    ],
    answer: ["A"],
    explanation: "A multilingual embedding model places semantically similar text from different languages near each other, so one index and one query path work for all supported languages and adding users in a new supported language needs no new component. Translate-first designs work but add latency, cost, and translation errors.",
    whyWrong: {
      B: "This works but adds two service calls per query and loses nuance in translation, and non-English documents would still need handling.",
      C: "A knowledge base per language multiplies indexes to maintain and cannot answer cross-language questions.",
      D: "Fine-tuning an embedding model per language is heavy effort and is not offered as a simple managed step."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Titan Text Embeddings", "Amazon Comprehend", "Amazon Translate"], tags: ["multilingual-retrieval", "multilingual-embeddings", "language-detection", "translate-vs-embedding"]
  }
);
