window.QB = window.QB || [];
window.QB.push(
  {
    id: "d1-1.1-01", domain: 1, task: "1.1", skills: ["1.1.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A legal-tech company wants to add document summarization to its product. Leadership will approve budget only if the team shows that a foundation model meets quality and latency targets on real contracts. The team has two weeks and no committed spend approved. Which approach validates feasibility with the LEAST cost and effort?",
    choices: [
      { id: "A", text: "Purchase one-month Provisioned Throughput for each candidate model so latency measurements are not affected by other customers." },
      { id: "B", text: "Call candidate models on demand through the Amazon Bedrock Converse API with a script that runs a sample of representative contracts, and score the outputs with an Amazon Bedrock model evaluation job." },
      { id: "C", text: "Fine-tune a base model in Amazon SageMaker AI on the company's contracts, then deploy it to a real-time endpoint for testing." },
      { id: "D", text: "Build the full production stack on Amazon ECS with an Amazon Bedrock Knowledge Base, then measure latency from the live service." }
    ],
    answer: ["B"],
    explanation: "A proof of concept should use pay-per-token on-demand inference and a small representative sample. The Converse API gives a uniform interface to swap candidate models, and Bedrock model evaluation provides repeatable quality scoring without building infrastructure.",
    whyWrong: {
      A: "Provisioned Throughput is a committed-cost purchase meant for steady production load; it is the opposite of a low-cost feasibility test.",
      C: "Fine-tuning plus hosting is expensive and slow, and it assumes the base model is not good enough before that has been tested.",
      D: "A full production stack is far more effort than needed to answer a feasibility question, and summarization does not require a Knowledge Base."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Model Evaluation"], tags: ["proof-of-concept", "model-evaluation", "converse-api"]
  },
  {
    id: "d1-1.1-02", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "An insurer wants an assistant that answers adjusters' questions about internal claims policies. Roughly 5% of the 40,000 policy documents change every week, and auditors require every answer to cite the source document. The team wants the approach that keeps answers current and traceable with the LEAST ongoing retraining effort. Which architecture should the GenAI developer propose?",
    choices: [
      { id: "A", text: "Continue pre-training a foundation model on the policy corpus every week and serve it with Provisioned Throughput." },
      { id: "B", text: "Fine-tune a model monthly on question-answer pairs written by the claims team and instruct it to cite policy names from memory." },
      { id: "C", text: "Place all 40,000 documents in the system prompt of a long-context model on every request." },
      { id: "D", text: "Use Retrieval Augmented Generation with an Amazon Bedrock Knowledge Base over the documents in Amazon S3, re-syncing the data source as documents change and returning source citations." }
    ],
    answer: ["D"],
    explanation: "Frequently changing knowledge and a citation requirement are the classic signals for RAG. A Knowledge Base ingests only changed documents on sync and returns citations with each response, so no model retraining is needed.",
    whyWrong: {
      A: "Continued pre-training bakes knowledge into weights, goes stale between runs, cannot produce reliable citations, and is costly to repeat weekly.",
      B: "Fine-tuned models can hallucinate citations from memory and are stale between monthly runs.",
      C: "40,000 documents will not fit in any model context window, and even a subset would be extremely costly per request."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon S3"], tags: ["rag-vs-fine-tuning", "architecture", "citations"]
  },
  {
    id: "d1-1.1-03", domain: 1, task: "1.1", skills: ["1.1.3"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A company has 12 product teams that are each building features on Amazon Bedrock. Security wants every team to use the same guardrail configuration, invocation logging, and least-privilege IAM role pattern, and wants new teams to start quickly without reinventing these controls. Which combination of steps will standardize the implementation with the LEAST friction for teams? (Select TWO)",
    choices: [
      { id: "A", text: "Publish AWS Service Catalog products (CloudFormation or CDK based) that provision a pre-approved Bedrock access role, Guardrail, and logging configuration." },
      { id: "B", text: "Document the required settings in a wiki page and ask each team lead to confirm compliance during quarterly reviews." },
      { id: "C", text: "Distribute a versioned internal Python library (for example through AWS CodeArtifact) that wraps the Bedrock Converse API with default guardrail, retry, and structured logging settings." },
      { id: "D", text: "Let each team design its own controls and require them to export their configurations to a central spreadsheet." },
      { id: "E", text: "Create one shared Amazon Bedrock Agent that all 12 teams must call for every model request." }
    ],
    answer: ["A", "C"],
    explanation: "Standardized, reusable components (infrastructure templates and a shared client library) make the compliant path the easy path. Service Catalog standardizes the provisioned resources, and the wrapper library standardizes runtime behavior, which is the intent of building consistent components aligned to the Well-Architected Generative AI Lens.",
    whyWrong: {
      B: "A wiki and periodic review is manual and detective only; it does not make teams consistent at build time.",
      D: "Independent designs guarantee drift, and a spreadsheet does not enforce anything.",
      E: "A single shared agent couples all teams, is a single point of failure, and does not fit teams' different use cases."
    },
    services: ["AWS Service Catalog", "AWS CloudFormation", "AWS CodeArtifact", "Amazon Bedrock Guardrails"], tags: ["standardization", "well-architected", "reusable-components"]
  },
  {
    id: "d1-1.1-04", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "A retailer must classify 3 million archived customer emails into topic categories using a foundation model. Results are needed within a few days, nobody is waiting on any individual response, and the team wants the lowest cost with minimal custom orchestration code. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Write the emails as JSONL to Amazon S3 and submit an Amazon Bedrock batch inference job that writes results back to S3." },
      { id: "B", text: "Purchase Provisioned Throughput and run a multi-threaded script on Amazon EC2 that calls InvokeModel for each email." },
      { id: "C", text: "Create an AWS Step Functions Map state that invokes an AWS Lambda function with on-demand Converse calls for each email." },
      { id: "D", text: "Deploy the model on a SageMaker AI real-time endpoint with auto scaling and send each email as a request." }
    ],
    answer: ["A"],
    explanation: "Non-interactive, high-volume workloads are the use case for Bedrock batch inference. It takes S3 input and output, handles scheduling and throttling for you, and is priced below on-demand for supported models, so it is both cheapest and least code.",
    whyWrong: {
      B: "Provisioned Throughput is billed hourly with a commitment and would sit idle outside the run; a hand-written thread pool also adds operational burden.",
      C: "This works, but it is on-demand pricing and you must build retry and throttling handling around millions of invocations.",
      D: "An always-on real-time endpoint is built for low-latency interactive traffic and costs more for an offline job."
    },
    services: ["Amazon Bedrock", "Amazon S3"], tags: ["batch-inference", "cost-optimization", "architecture"]
  },
  {
    id: "d1-1.2-01", domain: 1, task: "1.2", skills: ["1.2.3"], type: "single", difficulty: "medium", source: "official",
    stem: "An ecommerce company has an application that uses Amazon Bedrock to generate product descriptions and recommendations. Currently, the application resides in a single AWS Region. When invoking a model in Amazon Bedrock during peak periods, the application receives an error. The error message says, \"Too many requests, please wait before trying again.\"\n\nThe company must increase the throughput for invocations during peak periods without introducing additional operational overhead. The company must maintain compatibility with the existing Amazon Bedrock API. The company must use the same FM.\n\nWhich solution will meet these requirements in the MOST cost-effective way?",
    choices: [
      { id: "A", text: "Use prompt routing to distribute traffic across multiple FMs from the same family." },
      { id: "B", text: "Use provisioned throughput to provision a higher level of throughput for the FM." },
      { id: "C", text: "Use cross-Region inference to distribute traffic across multiple Regions within a geographic area." },
      { id: "D", text: "Create an AWS Lambda function to invoke the model in Amazon Bedrock with the original Region as the default. Configure the Lambda function to fall back to Amazon Bedrock in a secondary Region." }
    ],
    answer: ["C"],
    explanation: "[Answer inferred - not from an official key.] The error is a throttling (ThrottlingException) error. A cross-Region inference profile is used as the modelId in the same InvokeModel/Converse APIs, automatically routes requests across Regions in the geography when the source Region is busy, requires no custom code, and has no extra routing charge, so it is the most cost-effective option that keeps the same FM.",
    whyWrong: {
      A: "Prompt routing selects between different models in a family, which violates the requirement to use the same FM.",
      B: "Provisioned throughput adds a committed hourly cost, which is not the most cost-effective option for peak-only bursts.",
      D: "A custom Lambda fallback adds code and operational overhead and does not by itself give more throughput in a cost-efficient managed way."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Cross-Region Inference"], tags: ["throttling", "cross-region-inference", "official-sample"]
  },
  {
    id: "d1-1.2-02", domain: 1, task: "1.2", skills: ["1.2.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A SaaS company runs an AWS Lambda-based summarization API. Product managers want to switch the active foundation model and adjust inference parameters such as temperature in production in minutes, to roll the change out gradually, and to automatically revert if error alarms fire, all without redeploying code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Store the model ID and parameters in Lambda environment variables and redeploy the function through the CI/CD pipeline for each change." },
      { id: "B", text: "Store the model ID and parameters as an AWS AppConfig configuration profile, read it in Lambda with the AppConfig Lambda extension, and deploy changes with a gradual deployment strategy tied to CloudWatch alarms." },
      { id: "C", text: "Enable Amazon Bedrock prompt routing so that the service chooses the model automatically per request." },
      { id: "D", text: "Use API Gateway stage variables to hold the model ID and create a new stage for every change." }
    ],
    answer: ["B"],
    explanation: "AWS AppConfig decouples runtime configuration from code. It provides validated config, gradual rollout strategies, and automatic rollback when a linked CloudWatch alarm triggers, which is exactly dynamic model selection without redeploys.",
    whyWrong: {
      A: "Changing environment variables requires updating the function and redeploys, with no built-in gradual rollout or alarm-based rollback.",
      C: "Prompt routing lets the service pick among models by prompt complexity; it does not give operators controlled, reversible switching or provider changes.",
      D: "Stage variables are not designed for gradual config rollout with rollback, and creating a stage per change adds management overhead."
    },
    services: ["AWS AppConfig", "AWS Lambda", "Amazon CloudWatch"], tags: ["dynamic-model-selection", "appconfig", "config-rollout"]
  },
  {
    id: "d1-1.2-03", domain: 1, task: "1.2", skills: ["1.2.3"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A bank's customer-chat feature calls a single foundation model in us-east-1. During an incident, the model's error rate rose and every request kept retrying, which delayed responses for minutes. The bank needs the application to fail fast, automatically use an alternative when the primary path is unhealthy, and also reduce capacity-related throttling for the primary model. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Raise the SDK maximum retry attempts to 50 so that transient failures are eventually absorbed." },
      { id: "B", text: "Orchestrate calls with AWS Step Functions, using Retry and Catch states plus a circuit breaker whose open/closed state is kept in Amazon DynamoDB, and route to a fallback model or a cached response when the circuit is open." },
      { id: "C", text: "Purchase Provisioned Throughput for the primary model in us-east-1 only and remove the fallback logic." },
      { id: "D", text: "Invoke the model through a geography-scoped cross-Region inference profile so Bedrock can route to other Regions when us-east-1 is constrained." },
      { id: "E", text: "Deploy a copy of the application to a second Region and have the operations team manually change DNS after the on-call engineer is paged." }
    ],
    answer: ["B", "D"],
    explanation: "A circuit breaker stops hammering a failing dependency and lets the workflow degrade gracefully to a fallback, which addresses fail-fast and availability. A cross-Region inference profile adds managed capacity across Regions and cuts throttling for the same model.",
    whyWrong: {
      A: "More retries amplify load on an unhealthy service and lengthen the delay; this is the retry-storm anti-pattern.",
      C: "Provisioned Throughput only buys capacity in one Region and does not provide a fallback when the model or Region is unhealthy.",
      E: "Manual DNS cut-over is slow and not automatic, which fails the fail-fast and automatic-alternative requirements."
    },
    services: ["AWS Step Functions", "Amazon DynamoDB", "Amazon Bedrock Cross-Region Inference"], tags: ["circuit-breaker", "graceful-degradation", "cross-region-inference", "resilience"]
  },
  {
    id: "d1-1.2-04", domain: 1, task: "1.2", skills: ["1.2.4"], type: "single", difficulty: "hard", source: "generated",
    stem: "A team fine-tunes a foundation model with LoRA adapters in Amazon SageMaker AI and serves it from a real-time endpoint. Each retrain produces a new model that must be versioned, approved by an ML lead before release, deployed with no downtime, and automatically rolled back if the endpoint's error alarm fires after release. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Overwrite the model artifact in the existing Amazon S3 prefix and restart the endpoint after every training run." },
      { id: "B", text: "Have the training job invoke an AWS Lambda function that updates the endpoint configuration in place immediately after training completes." },
      { id: "C", text: "Register each trained model as a version in the SageMaker Model Registry with an approval status, trigger an automated pipeline on approval that updates the endpoint with a blue/green deployment, and attach CloudWatch alarms for automatic rollback." },
      { id: "D", text: "Create a separate endpoint for every model version and ask client teams to change the endpoint name manually when they are ready." }
    ],
    answer: ["C"],
    explanation: "The Model Registry provides versioning and an approval gate for customized models. Updating the endpoint with a blue/green deployment keeps serving traffic during the shift, and linked CloudWatch alarms let SageMaker roll back to the previous fleet automatically.",
    whyWrong: {
      A: "Overwriting artifacts destroys version history, bypasses approval, and a restart causes downtime.",
      B: "In-place updates immediately after training skip the approval step and provide no rollback strategy.",
      D: "One endpoint per version multiplies cost, and manual client changes are error-prone and provide no automated rollback."
    },
    services: ["Amazon SageMaker AI", "SageMaker Model Registry", "Amazon CloudWatch"], tags: ["model-registry", "blue-green", "lora", "rollback"]
  },
  {
    id: "d1-1.3-01", domain: 1, task: "1.3", skills: ["1.3.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A nightly AWS Glue ETL job loads a product catalog from Amazon S3 into a pipeline that generates embeddings. Recently, rows with null descriptions and malformed price fields polluted the vector index. The team wants declarative quality rules, a pass/fail gate before embeddings are generated, and quality scores published as metrics, with MINIMAL custom code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Write a Lambda function with regular expressions to check each row and log failures to CloudWatch Logs." },
      { id: "B", text: "Send every row to a Bedrock model with a prompt that asks whether the row is valid." },
      { id: "C", text: "Run Amazon Comprehend entity detection over the catalog and drop rows with no entities." },
      { id: "D", text: "Add an AWS Glue Data Quality ruleset (DQDL rules such as completeness and column-value checks) to the Glue job, fail or branch the job on the result, and publish the scores to Amazon CloudWatch." }
    ],
    answer: ["D"],
    explanation: "AWS Glue Data Quality lets you define rules in Data Quality Definition Language (DQDL) directly in the ETL job, evaluate datasets, and emit quality scores and results that can feed alarms. It meets the declarative, gating, and metrics needs without custom validation code.",
    whyWrong: {
      A: "Custom regex code must be written, scaled, and maintained, and does not give managed rule evaluation or scores.",
      B: "Calling an LLM per row is slow, costly, and non-deterministic for simple null and format checks.",
      C: "Entity detection does not check completeness or numeric format rules and would drop valid rows without entities."
    },
    services: ["AWS Glue Data Quality", "Amazon CloudWatch", "Amazon S3"], tags: ["data-quality", "dqdl", "validation-pipeline"]
  },
  {
    id: "d1-1.3-02", domain: 1, task: "1.3", skills: ["1.3.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A contact center stores thousands of call recordings (MP3) in Amazon S3. The company wants a foundation model to summarize each call, but customer account numbers and card numbers must not reach the model, and the summary should attribute statements to the agent or the customer. Which pipeline meets these requirements with the LEAST custom development?",
    choices: [
      { id: "A", text: "Run an Amazon Transcribe batch job with speaker identification and content redaction enabled, then invoke a Bedrock model on the redacted transcript from an AWS Lambda function." },
      { id: "B", text: "Send the MP3 files directly to Amazon Titan Text Embeddings and summarize the resulting vectors." },
      { id: "C", text: "Run Amazon Comprehend on the MP3 files to detect PII and speakers, then send the result to a Bedrock model." },
      { id: "D", text: "Use Amazon Rekognition to analyze the audio and produce a transcript for the model." }
    ],
    answer: ["A"],
    explanation: "Foundation models consume text, so audio must be transcribed first. Amazon Transcribe provides speaker partitioning and content redaction of sensitive data in the transcript, so the downstream model call sees only redacted, speaker-labeled text.",
    whyWrong: {
      B: "Embeddings models create vectors for search and do not summarize; they also do not take raw audio.",
      C: "Comprehend analyzes text, not audio files, and does not identify speakers.",
      D: "Rekognition analyzes images and video, not speech transcription."
    },
    services: ["Amazon Transcribe", "AWS Lambda", "Amazon Bedrock", "Amazon S3"], tags: ["audio-processing", "pii-redaction", "multimodal-pipeline"]
  },
  {
    id: "d1-1.3-03", domain: 1, task: "1.3", skills: ["1.3.3"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A developer is building a multi-turn support chatbot that calls the Amazon Bedrock Converse API from AWS Lambda. Users report that the bot forgets earlier turns and ignores its persona instructions. Which changes will fix the problem? (Select TWO)",
    choices: [
      { id: "A", text: "Rely on Bedrock to keep a server-side session so only the newest user message needs to be sent." },
      { id: "B", text: "Persist the conversation (for example in Amazon DynamoDB) and send the prior turns in the messages array as alternating user and assistant messages on every call." },
      { id: "C", text: "Put the persona instructions in the first user message and remove them on later turns to save tokens." },
      { id: "D", text: "Concatenate the whole history into a single string and send it in inferenceConfig." },
      { id: "E", text: "Pass the persona and behavior rules in the system parameter of each Converse request." }
    ],
    answer: ["B", "E"],
    explanation: "The Converse API is stateless, so the application must resend prior turns as alternating user/assistant messages on every request. System prompts belong in the dedicated system field so that role and rules apply consistently on each call.",
    whyWrong: {
      A: "Converse does not store sessions; the model only sees what is in the request.",
      C: "Dropping instructions on later turns removes them from the model's context, so the persona is lost.",
      D: "inferenceConfig holds parameters like temperature and maxTokens; conversation content goes in messages."
    },
    services: ["Amazon Bedrock Converse API", "Amazon DynamoDB", "AWS Lambda"], tags: ["converse-api", "conversation-history", "system-prompt"]
  },
  {
    id: "d1-1.3-04", domain: 1, task: "1.3", skills: ["1.3.4"], type: "single", difficulty: "medium", source: "generated",
    stem: "A news analytics company wants to enrich 2 million archived articles with the people, organizations, locations, and dates they mention. These values will be stored as metadata so retrieval can filter on them before the FM sees any text. The team has no labeled data and wants to avoid training or hosting any model. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Train a custom named-entity model on Amazon SageMaker AI and host it on a real-time endpoint." },
      { id: "B", text: "Write regular expressions in AWS Lambda for each entity type." },
      { id: "C", text: "Run an Amazon Comprehend batch entity detection job on the articles in Amazon S3 and store the detected entities as metadata." },
      { id: "D", text: "Generate Titan embeddings for every article and cluster them to infer entities." }
    ],
    answer: ["C"],
    explanation: "Amazon Comprehend provides pretrained entity recognition for people, organizations, locations, and dates through a fully managed API, including asynchronous batch jobs over S3. This extracts structured metadata with no training or infrastructure.",
    whyWrong: {
      A: "Training and hosting a custom model requires labeled data and ongoing operations that are not necessary for standard entity types.",
      B: "Regex cannot reliably extract names and organizations and becomes unmaintainable.",
      D: "Clustering embeddings groups similar documents but does not extract named entities."
    },
    services: ["Amazon Comprehend", "Amazon S3"], tags: ["entity-extraction", "metadata-enrichment", "data-preprocessing"]
  },
  {
    id: "d1-1.4-01", domain: 1, task: "1.4", skills: ["1.4.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A company stores customer and order data in Amazon Aurora PostgreSQL. It wants a RAG assistant that retrieves support articles by semantic similarity and also joins the results to customer records with SQL in the same query. The article set is around 2 million chunks, and the team wants to avoid operating a separate search system. Which vector store is the BEST fit?",
    choices: [
      { id: "A", text: "Amazon OpenSearch Serverless collection populated by a nightly export from Aurora." },
      { id: "B", text: "Amazon DynamoDB with the embedding stored as a binary attribute and similarity computed in Lambda." },
      { id: "C", text: "The same Aurora PostgreSQL cluster using the pgvector extension, optionally connected to an Amazon Bedrock Knowledge Base." },
      { id: "D", text: "Amazon ElastiCache with embeddings serialized into string keys." }
    ],
    answer: ["C"],
    explanation: "Aurora PostgreSQL with pgvector keeps vectors next to relational data, allowing SQL joins and filters in one query without a second system, and Bedrock Knowledge Bases supports Aurora as a vector store. At 2 million chunks this is well within pgvector's practical range.",
    whyWrong: {
      A: "It introduces another system, an export pipeline, and data-freshness lag, and joins with relational data would have to be done in application code.",
      B: "DynamoDB has no native vector similarity search; computing it in Lambda does not scale.",
      D: "Serializing embeddings into string keys does not provide approximate nearest neighbor search."
    },
    services: ["Amazon Aurora PostgreSQL", "pgvector", "Amazon Bedrock Knowledge Bases"], tags: ["vector-store", "pgvector", "aurora"]
  },
  {
    id: "d1-1.4-02", domain: 1, task: "1.4", skills: ["1.4.2"], type: "single", difficulty: "hard", source: "generated",
    stem: "A law firm uses an Amazon Bedrock Knowledge Base over PDFs in Amazon S3. Attorneys need retrieval limited to documents where jurisdiction equals \"EU\" and the year is 2023 or later, applied before results reach the model. The team wants the filter to be enforced inside the retrieval call. Which approach should the developer use?",
    choices: [
      { id: "A", text: "Retrieve the top 5 results and let the foundation model ignore any irrelevant jurisdictions through the prompt." },
      { id: "B", text: "Create a separate Knowledge Base for every jurisdiction and year combination." },
      { id: "C", text: "Retrieve the top 100 results and filter them in AWS Lambda after the call." },
      { id: "D", text: "Add a .metadata.json file next to each source document with jurisdiction and year attributes, re-sync the data source, and pass a metadata filter in the Retrieve or RetrieveAndGenerate request." }
    ],
    answer: ["D"],
    explanation: "Knowledge Bases read a companion metadata file (documentname.metadata.json with metadataAttributes) during ingestion and support filters on those attributes at query time. The filter is applied during the vector search, so only matching chunks are returned.",
    whyWrong: {
      A: "Prompt-level instructions do not remove irrelevant documents; they may already have consumed the top-k slots and leaked into context.",
      B: "A knowledge base per combination multiplies cost and administration and still cannot express a range like year >= 2023.",
      C: "Post-filtering after retrieval may leave too few relevant chunks (low recall) and wastes work."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon S3"], tags: ["metadata-filtering", "knowledge-base", "retrieval-precision"]
  },
  {
    id: "d1-1.4-03", domain: 1, task: "1.4", skills: ["1.4.5"], type: "single", difficulty: "medium", source: "generated",
    stem: "Product documentation in an Amazon S3 bucket is edited many times each day. A Bedrock Knowledge Base built on this bucket is returning outdated answers because the team syncs it manually. They want the index to reflect changes within minutes, without re-embedding the entire corpus, and with minimal operational overhead. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Delete and recreate the Knowledge Base every night with a full re-ingestion." },
      { id: "B", text: "Send S3 object-change events through Amazon EventBridge to an AWS Lambda function that calls StartIngestionJob for the data source, which processes only new, changed, or deleted documents." },
      { id: "C", text: "Run an Amazon EC2 cron job that re-embeds every document each hour and overwrites the vector index." },
      { id: "D", text: "Increase the chunk size so that fewer re-syncs are needed." }
    ],
    answer: ["B"],
    explanation: "A Knowledge Base sync is incremental: it ingests only added, modified, or deleted documents. Triggering StartIngestionJob from S3 events through EventBridge and Lambda automates change detection with little infrastructure.",
    whyWrong: {
      A: "A full rebuild is slow and costly, and the index is stale or unavailable in between.",
      C: "Re-embedding everything hourly wastes embedding spend and requires you to manage an EC2 host.",
      D: "Chunk size does not control freshness; changed content still would not be picked up until a sync runs."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon EventBridge", "AWS Lambda", "Amazon S3"], tags: ["incremental-sync", "data-freshness", "ingestion-job"]
  },
  {
    id: "d1-1.4-04", domain: 1, task: "1.4", skills: ["1.4.3"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A company runs a managed Amazon OpenSearch Service domain with 150 million 1,024-dimension vectors for semantic search. Memory cost is high, and the team wants to substantially reduce the memory footprint while keeping high recall, without changing the architecture. Which combination of actions will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Move the vector field to the largest available data-node type and keep full-precision float vectors." },
      { id: "B", text: "Regenerate embeddings with a lower output dimension (for example, Titan Text Embeddings V2 at 512 dimensions) when a small recall trade-off is acceptable." },
      { id: "C", text: "Set the HNSW ef_search parameter to its maximum value on every query." },
      { id: "D", text: "Enable k-NN vector quantization (for example, scalar or binary quantization) on the index to compress stored vectors." },
      { id: "E", text: "Move the vectors to Amazon DynamoDB and query them by partition key." }
    ],
    answer: ["B", "D"],
    explanation: "Vector memory use scales with dimension count and bytes per dimension. Lowering the embedding dimension and quantizing vectors both directly reduce the in-memory footprint, typically with a modest recall cost that can be measured and tuned.",
    whyWrong: {
      A: "This raises cost rather than reducing the memory needed per vector.",
      C: "A higher ef_search increases query-time work and latency; it does not shrink memory.",
      E: "DynamoDB cannot do approximate nearest neighbor search, so this removes semantic search capability."
    },
    services: ["Amazon OpenSearch Service", "Amazon Titan Text Embeddings V2"], tags: ["opensearch", "quantization", "embedding-dimensions", "cost-performance"]
  },
  {
    id: "d1-1.5-01", domain: 1, task: "1.5", skills: ["1.5.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A manufacturer ingests 400-page equipment manuals organized into chapters, sections, and sub-sections. Users ask narrow questions, but answers are often wrong because a small matching passage lacks the surrounding context of its section. The team uses an Amazon Bedrock Knowledge Base and wants precise matching while still giving the model enough context. Which chunking strategy should they choose?",
    choices: [
      { id: "A", text: "Hierarchical chunking, which searches small child chunks and returns the larger parent chunk to the model." },
      { id: "B", text: "Fixed-size chunking with a very small token size and no overlap." },
      { id: "C", text: "No chunking, so each manual is embedded as a single vector." },
      { id: "D", text: "Fixed-size chunking with the maximum overlap percentage." }
    ],
    answer: ["A"],
    explanation: "Hierarchical chunking creates parent and child chunks: retrieval matches against the small, precise child chunks, then substitutes the broader parent chunk so the model gets surrounding context. It fits structured documents like manuals.",
    whyWrong: {
      B: "Smaller chunks sharpen matching but make the context problem worse.",
      C: "A single vector for 400 pages dilutes meaning, and embedding models have input limits.",
      D: "Overlap duplicates text at chunk boundaries but does not return the whole section as context."
    },
    services: ["Amazon Bedrock Knowledge Bases"], tags: ["chunking", "hierarchical-chunking", "parent-child"]
  },
  {
    id: "d1-1.5-02", domain: 1, task: "1.5", skills: ["1.5.4"], type: "single", difficulty: "hard", source: "generated",
    stem: "An electronics distributor's RAG assistant answers conceptual questions well, but queries that contain exact part numbers such as \"TX-4471-B\" frequently return semantically similar but wrong parts. The vector store is Amazon OpenSearch Serverless behind a Bedrock Knowledge Base. The team wants to fix exact-identifier queries without changing the embedding model or re-ingesting data. What should they do?",
    choices: [
      { id: "A", text: "Switch to an embedding model with more dimensions and re-embed all documents." },
      { id: "B", text: "Increase numberOfResults to 100 and send everything to the model." },
      { id: "C", text: "Set the retrieval search type to HYBRID so that keyword matching is combined with semantic search." },
      { id: "D", text: "Fine-tune the generation model on the part catalog." }
    ],
    answer: ["C"],
    explanation: "Pure semantic search can miss exact tokens such as SKUs. Hybrid search combines keyword (lexical) and vector scores, so exact identifiers match strongly while semantic similarity still handles conceptual questions. It is a query-time setting, so no re-embedding is needed.",
    whyWrong: {
      A: "A bigger embedding does not guarantee exact-token matching and requires full re-ingestion, which the team wants to avoid.",
      B: "Stuffing 100 chunks adds noise and cost, and the right part may still not be retrieved.",
      D: "Fine-tuning the generator does not change which chunks are retrieved."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon OpenSearch Serverless"], tags: ["hybrid-search", "keyword-search", "retrieval-relevance"]
  },
  {
    id: "d1-1.5-03", domain: 1, task: "1.5", skills: ["1.5.4", "1.5.5"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A RAG assistant for a bank handles compound questions such as \"Compare the fees and eligibility for the Gold and Platinum cards.\" Retrieval returns 25 chunks, many only loosely related, and answers are diluted or incomplete. Which combination of changes will most improve answer quality? (Select TWO)",
    choices: [
      { id: "A", text: "Raise the model temperature so it can better infer the missing facts." },
      { id: "B", text: "Reduce the chunk size to a single sentence so more chunks fit in the prompt." },
      { id: "C", text: "Apply an Amazon Bedrock reranker model to the retrieved candidates and pass only the top few passages to the foundation model." },
      { id: "D", text: "Replace the generation model with a larger model while keeping the same retrieval." },
      { id: "E", text: "Decompose the compound question into sub-queries (for example with a Bedrock model or the Knowledge Base query decomposition option), retrieve for each, and combine the results." }
    ],
    answer: ["C", "E"],
    explanation: "Reranking reorders retrieved candidates by relevance so the model sees only the best passages, and query decomposition ensures each part of a multi-part question retrieves its own evidence. Both improve what is retrieved rather than only how it is generated.",
    whyWrong: {
      A: "A higher temperature increases randomness and hallucination risk; it does not supply missing evidence.",
      B: "Sentence-level chunks lose context and fragment the answers further.",
      D: "A larger generator cannot answer correctly from poor or missing context and increases cost."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Bedrock reranker models", "Amazon Bedrock"], tags: ["reranking", "query-decomposition", "retrieval-quality"]
  },
  {
    id: "d1-1.5-04", domain: 1, task: "1.5", skills: ["1.5.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A team indexed its knowledge base with 1,536-dimension vectors generated by one embedding model. To reduce storage costs, a developer switches the query path to Titan Text Embeddings V2 configured for 1,024 dimensions, leaving the existing index in place. Queries now fail or return meaningless results. What is the correct fix?",
    choices: [
      { id: "A", text: "Pad the 1,024-dimension query vectors with zeros up to 1,536 dimensions." },
      { id: "B", text: "Truncate the stored 1,536-dimension vectors to 1,024 dimensions in place." },
      { id: "C", text: "Switch the index similarity metric from cosine to Euclidean distance." },
      { id: "D", text: "Create a new index (or Knowledge Base) whose vector dimension is 1,024 and re-embed and re-ingest all documents with the same model used for queries." }
    ],
    answer: ["D"],
    explanation: "Documents and queries must be embedded with the same model and the same dimension, because the vector index field has a fixed dimension and different models produce incompatible vector spaces. Changing the embedding model always means a new index and a full re-embed.",
    whyWrong: {
      A: "Padding does not make vectors from different models comparable.",
      B: "Truncating vectors from a different model destroys their meaning.",
      C: "The distance metric does not fix a dimension mismatch or a different embedding space."
    },
    services: ["Amazon Titan Text Embeddings V2", "Amazon Bedrock Knowledge Bases"], tags: ["embeddings", "dimension-mismatch", "re-indexing"]
  },
  {
    id: "d1-1.6-01", domain: 1, task: "1.6", skills: ["1.6.3"], type: "multi", difficulty: "hard", source: "official",
    stem: "A financial services company needs to use Amazon Bedrock to create an AI assistant that will help customer support representatives across multiple business units. A GenAI developer must ensure that prompt templates are properly governed through approval workflows. Additionally, the company requires comprehensive logging of all model invocations with a 7-year retention period for regulatory compliance.\n\nWhich combination of steps will meet these requirements with MINIMAL operational overhead?\n(Select TWO)",
    choices: [
      { id: "A", text: "Enable Amazon Bedrock model invocation logging with Amazon S3 as the destination. Enable S3 Object Lock with compliance retention mode set to 7 years. Create separate prefixes for each business unit." },
      { id: "B", text: "Store prompt templates in Amazon DynamoDB tables with composite keys partitioned by business units. Implement IAM policies that grant role-based access to business units for template approval. Use DynamoDB item-level permissions to control prompt template modifications and approvals." },
      { id: "C", text: "Use Amazon Bedrock Prompt Management with multi-stage approval workflows. Use IAM policies that require multi-party authorization." },
      { id: "D", text: "Enable AWS CloudTrail data events for all Amazon Bedrock APIs. Deliver the logs to CloudTrail Lake with a 7-year retention setting. Tag each event with the business unit ID. Run CloudTrail Lake queries to monitor prompt activity." },
      { id: "E", text: "Set up Amazon EventBridge rules to capture Amazon Bedrock model invocation events. Route events to Amazon CloudWatch Logs groups that are organized by business unit. Export the logs to Amazon S3. Enable S3 Object Lock with compliance retention mode set to 7 years." }
    ],
    answer: ["A", "C"],
    explanation: "[Answer inferred - not from an official key.] Bedrock Prompt Management is the managed place for versioned prompt templates and approval-style governance, so no custom store is required. Native model invocation logging to S3 captures full invocation records, and S3 Object Lock in compliance mode enforces the 7-year retention with the least moving parts.",
    whyWrong: {
      B: "A DynamoDB-based template store with custom approval logic is a hand-built system with high overhead when Prompt Management exists.",
      D: "CloudTrail records API-call metadata and does not capture the prompt and response content that model invocation logging provides; tagging events by business unit is not a native capability.",
      E: "Bedrock does not emit invocation events to EventBridge for this purpose, and the chain of EventBridge, CloudWatch Logs, and export is needlessly complex compared with direct logging to S3."
    },
    services: ["Amazon Bedrock Prompt Management", "Amazon Bedrock Model Invocation Logging", "Amazon S3 Object Lock"], tags: ["prompt-governance", "invocation-logging", "retention", "official-sample"]
  },
  {
    id: "d1-1.6-02", domain: 1, task: "1.6", skills: ["1.6.6"], type: "single", difficulty: "hard", source: "generated",
    stem: "A telecom company wants a workflow that first classifies an incoming customer message as billing, technical, or cancellation, then routes to a different prompt template for each category, and finally formats the reply into a fixed JSON structure. The team prefers a visual builder, wants to reuse versioned prompts, and wants the LEAST operational overhead. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Build an AWS Step Functions state machine with three Lambda functions that each hold hard-coded prompts." },
      { id: "B", text: "Create an Amazon Bedrock Prompt Flow with a prompt node for classification, a condition node for routing, and prompt nodes that reference managed prompts for each branch and for formatting." },
      { id: "C", text: "Create a Bedrock Agent with one action group per category and let the agent decide the order of steps." },
      { id: "D", text: "Write a single large prompt that asks the model to classify, answer, and format in one pass, with all three templates embedded." }
    ],
    answer: ["B"],
    explanation: "Bedrock Prompt Flows provides a visual way to chain prompt nodes with condition nodes for branching and can reference prompts from Prompt Management. It directly models classify, branch, and post-process steps with no code to host.",
    whyWrong: {
      A: "Step Functions can orchestrate this, but hard-coded prompts in Lambda give up versioned prompt reuse and add code to maintain.",
      C: "An agent chooses its steps dynamically, which is nondeterministic for a fixed routing pattern and heavier than needed.",
      D: "One monolithic prompt cannot guarantee routing logic, is harder to test, and loses reusable components."
    },
    services: ["Amazon Bedrock Prompt Flows", "Amazon Bedrock Prompt Management"], tags: ["prompt-flows", "conditional-branching", "prompt-chaining"]
  },
  {
    id: "d1-1.6-03", domain: 1, task: "1.6", skills: ["1.6.1", "1.6.3"], type: "single", difficulty: "medium", source: "generated",
    stem: "Developers iterate on a customer-service prompt template in Amazon Bedrock Prompt Management. The production Lambda function must always run a specific reviewed revision and must not pick up in-progress edits, while developers keep editing the working draft. How should the production code reference the prompt?",
    choices: [
      { id: "A", text: "Reference the prompt's working draft so production always uses the newest wording." },
      { id: "B", text: "Copy the prompt text into an Amazon S3 object each time it is approved and read it at startup." },
      { id: "C", text: "Create a prompt version (an immutable snapshot) when the revision is approved, and have the application reference that version's ARN, passing values through prompt variables." },
      { id: "D", text: "Tag the draft with an approved tag and let the application resolve the tag at request time." }
    ],
    answer: ["C"],
    explanation: "Prompt versions are immutable snapshots, so pinning production to a version ARN guarantees the reviewed text runs while the draft changes independently. Prompt variables supply the dynamic values at invocation.",
    whyWrong: {
      A: "The working draft changes as developers edit, so unreviewed text could reach production.",
      B: "Copying templates to S3 creates a second source of truth and discards the managed versioning and variable support.",
      D: "Tags are metadata, not an immutable snapshot, and do not freeze the prompt content."
    },
    services: ["Amazon Bedrock Prompt Management", "AWS Lambda"], tags: ["prompt-versioning", "prompt-management", "prompt-variables"]
  },
  {
    id: "d1-1.6-04", domain: 1, task: "1.6", skills: ["1.6.4"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A team edits prompts frequently, and a recent change silently broke the JSON output that a downstream service parses. The team wants an automated gate so that no new prompt version is released unless it keeps producing valid output on a library of edge-case inputs. Which combination of steps will implement this prompt regression testing? (Select TWO)",
    choices: [
      { id: "A", text: "Ask developers to try five or six prompts manually in the Bedrock console before each release." },
      { id: "B", text: "Run a Step Functions workflow in the release pipeline that sends each golden test case to the candidate prompt version and uses a Lambda function to verify the response schema and expected fields." },
      { id: "C", text: "Increase the model temperature during testing so that more varied outputs are observed." },
      { id: "D", text: "Publish pass rates as Amazon CloudWatch metrics and configure an alarm that blocks promotion when the pass rate drops below a threshold." },
      { id: "E", text: "Enable Bedrock Guardrails and treat its absence of blocks as proof that the output format is valid." }
    ],
    answer: ["B", "D"],
    explanation: "A regression harness replays a fixed set of edge cases against each candidate prompt and programmatically verifies output structure (Lambda inside Step Functions). Emitting the pass rate to CloudWatch and alarming on it makes the check an enforceable release gate and gives a trend over time.",
    whyWrong: {
      A: "Manual spot checks are not repeatable or comprehensive and do not scale as prompts change.",
      C: "Higher temperature adds randomness and makes a regression test less deterministic; it does not verify correctness.",
      E: "Guardrails filter harmful or denied content and do not validate JSON schema or business-format correctness."
    },
    services: ["AWS Step Functions", "AWS Lambda", "Amazon CloudWatch", "Amazon Bedrock Prompt Management"], tags: ["prompt-regression", "quality-assurance", "release-gating"]
  }
);
