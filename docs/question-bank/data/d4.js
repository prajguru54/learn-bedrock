window.QB = window.QB || [];
window.QB.push(
  {
    id: "d4-4.1-01",
    domain: 4, task: "4.1", skills: ["4.1.4", "4.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A legal-tech company runs a contract Q&A assistant on Amazon Bedrock. Every request sends the same 30,000-token set of policy documents as the system prompt, followed by a short user question of about 100 tokens. Users often ask several questions in a row within a few minutes. Input token charges and time to first token are both too high. Which solution will reduce cost and latency with the LEAST code change?",
    choices: [
      { id: "A", text: "Summarize the policy documents with a smaller model on every request before sending them to the primary model." },
      { id: "B", text: "Place a cache checkpoint after the static policy content in the prompt by using Amazon Bedrock prompt caching, and keep the user question after the checkpoint." },
      { id: "C", text: "Purchase Provisioned Throughput for the model so that repeated input tokens are billed at a flat hourly rate." },
      { id: "D", text: "Store the full model response for each question in Amazon DynamoDB and return the stored item when the same user asks again." }
    ],
    answer: ["B"],
    explanation: "Amazon Bedrock prompt caching lets you mark a cache checkpoint after a large, static prompt prefix. Subsequent requests that reuse the identical prefix within the cache TTL read it from the cache at a reduced input-token price and with lower latency. Only the short, changing user question is processed fresh. The change is small: add a cache point to the request and keep static content first.",
    whyWrong: {
      A: "Summarizing on every request adds an extra model call, cost, and latency, and it can lose clauses the answers depend on.",
      C: "Provisioned Throughput reserves capacity for a commitment; it does not reduce the processing of repeated input tokens and may cost more at low volume.",
      D: "Caching responses by user only helps for identical repeat questions. Users ask different questions each time, so the large prefix is still reprocessed."
    },
    services: ["Amazon Bedrock"],
    tags: ["prompt-caching", "token-cost", "latency"]
  },
  {
    id: "d4-4.1-02",
    domain: 4, task: "4.1", skills: ["4.1.3", "4.1.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A media company must generate summaries for 2 million archived articles. The job runs once per quarter, results are needed within 24 hours, and no user is waiting on any individual response. The team wants the MOST cost-effective approach on Amazon Bedrock with the least operational effort. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Create an Amazon Bedrock batch inference job that reads JSONL input records from Amazon S3 and writes outputs to S3." },
      { id: "B", text: "Purchase a 6-month Provisioned Throughput commitment and loop over the articles with InvokeModel." },
      { id: "C", text: "Use a Step Functions Map state to call on-demand InvokeModel with a maximum concurrency of 1,000." },
      { id: "D", text: "Stream each article through InvokeModelWithResponseStream from an AWS Fargate task to reduce latency." }
    ],
    answer: ["A"],
    explanation: "Batch inference is built for large, non-interactive, latency-tolerant workloads. You supply a JSONL file in S3, Bedrock processes it asynchronously, and writes results back to S3, typically at a lower price than on-demand for supported models. There is no need to manage concurrency or retries yourself.",
    whyWrong: {
      B: "A multi-month commitment is wasteful for a job that runs once per quarter, and you still have to build the request loop.",
      C: "On-demand at high concurrency invites throttling, needs retry logic, and does not get the batch pricing benefit.",
      D: "Streaming improves perceived latency for interactive users. Nobody is waiting here, so it adds complexity with no cost benefit."
    },
    services: ["Amazon Bedrock", "Amazon S3"],
    tags: ["batch-inference", "cost-optimization"]
  },
  {
    id: "d4-4.1-03",
    domain: 4, task: "4.1", skills: ["4.1.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A telecom support chatbot receives many questions that are worded differently but ask the same thing (for example, \"how do I reset my router\" and \"router reset steps\"). The company wants to avoid repeated foundation model invocations for such questions while keeping answers relevant. Which combination of steps will implement an effective semantic cache? (Select TWO)",
    choices: [
      { id: "A", text: "Generate an embedding of each incoming question with an Amazon Bedrock embedding model and run a vector similarity search against previously cached question embeddings in a vector-capable store such as Amazon ElastiCache or Amazon OpenSearch Service." },
      { id: "B", text: "Hash the raw question text with SHA-256 and use the hash as the cache key in Amazon ElastiCache." },
      { id: "C", text: "Return the cached answer only when the similarity score exceeds a tuned threshold; otherwise invoke the model and store the new question embedding and answer with a TTL." },
      { id: "D", text: "Cache the answers in Amazon CloudFront keyed on the full request URL and body." },
      { id: "E", text: "Enable Bedrock prompt caching so that semantically similar questions automatically share the same cached response." }
    ],
    answer: ["A", "C"],
    explanation: "A semantic cache compares meaning, not exact text. Embedding the query and doing nearest-neighbor search against cached query embeddings finds paraphrases. A tuned similarity threshold prevents wrong answers from near-misses, and a TTL keeps entries fresh. A miss falls through to the model and populates the cache.",
    whyWrong: {
      B: "An exact hash only matches byte-identical text, so paraphrases would all miss. That is deterministic request hashing, not semantic caching.",
      D: "CloudFront keyed on URL and body is also an exact-match edge cache, and POST bodies with unique wording would rarely hit.",
      E: "Prompt caching caches processed prompt prefixes to cut input cost and latency; it still invokes the model and does not return stored responses for similar questions."
    },
    services: ["Amazon Bedrock", "Amazon ElastiCache", "Amazon OpenSearch Service"],
    tags: ["semantic-cache", "embeddings", "caching"]
  },
  {
    id: "d4-4.1-04",
    domain: 4, task: "4.1", skills: ["4.1.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An e-commerce company uses one large, expensive model from a single Amazon Bedrock model family for every customer message. Analysis shows that about 70% of messages are simple (order status, store hours) and do not need the large model. The team wants to cut cost without building and maintaining its own classifier. Which solution is MOST operationally efficient?",
    choices: [
      { id: "A", text: "Fine-tune the large model on simple messages so that it responds faster." },
      { id: "B", text: "Reduce maxTokens on all requests to 50 tokens." },
      { id: "C", text: "Train a custom classifier on Amazon SageMaker AI to label message complexity and route requests with an AWS Lambda function." },
      { id: "D", text: "Use Amazon Bedrock Intelligent Prompt Routing with a default prompt router for the model family, so each request is routed to a smaller or larger model based on predicted response quality." }
    ],
    answer: ["D"],
    explanation: "Intelligent Prompt Routing is a managed Bedrock capability that predicts which model in a family will give the best response for each prompt and routes simple prompts to a cheaper model. It implements tiered model usage with no custom classifier to build, host, or retrain.",
    whyWrong: {
      A: "Fine-tuning does not change which model size is billed and adds training cost and customization overhead.",
      B: "Truncating output to 50 tokens would cut off legitimate complex answers and does not address model selection.",
      C: "This works but requires building, hosting, and maintaining a custom classifier and router, which is more overhead than the managed router."
    },
    services: ["Amazon Bedrock"],
    tags: ["intelligent-prompt-routing", "model-selection", "cost-optimization"]
  },
  {
    id: "d4-4.1-05",
    domain: 4, task: "4.1", skills: ["4.1.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A bank runs an internal assistant that sends a steady 24x7 load of roughly 400 requests per minute to a single Amazon Bedrock model. The p95 on-demand latency is acceptable, but monthly token spend is large and predictable. The team wants predictable cost and guaranteed capacity, and has confirmed the load will persist for at least a year. Which approach is the MOST appropriate?",
    choices: [
      { id: "A", text: "Stay on on-demand inference and add exponential backoff for throttling." },
      { id: "B", text: "Buy Provisioned Throughput model units with a commitment term for the model and invoke the provisioned model ARN, sizing units from measured tokens per minute." },
      { id: "C", text: "Switch to batch inference for all requests to get the lower per-token price." },
      { id: "D", text: "Create an AWS Budgets action that stops invocations when spend reaches the monthly limit." }
    ],
    answer: ["B"],
    explanation: "Provisioned Throughput reserves model units for a fixed hourly price (lower per-unit with longer commitment), giving guaranteed throughput and predictable cost. It pays off for sustained, high, predictable traffic, and you size it from observed input and output tokens per minute. On-demand is better for spiky or low volume.",
    whyWrong: {
      A: "Backoff handles throttling but gives no capacity guarantee or cost predictability.",
      C: "Batch inference is asynchronous and unsuitable for an interactive assistant.",
      D: "A budget action caps spend but would cause outages once reached; it does not optimize cost or guarantee capacity."
    },
    services: ["Amazon Bedrock", "AWS Budgets"],
    tags: ["provisioned-throughput", "capacity-planning", "cost-optimization"]
  },
  {
    id: "d4-4.2-01",
    domain: 4, task: "4.2", skills: ["4.2.4"],
    type: "single",
    difficulty: "easy",
    source: "official",
    stem: "A GenAI developer is building a virtual assistant application by using an Anthropic Claude model on Amazon Bedrock. The application sends user queries and expects conversational responses. The GenAI developer wants to configure the application to stop generating output after a specific phrase is generated in the response.\n\nWhich solution will meet these requirements?",
    choices: [
      { id: "A", text: "Use the top-k parameter to control the diversity of tokens in the model's output." },
      { id: "B", text: "Use the stop sequences parameter in the inference call to specify a trigger phrase." },
      { id: "C", text: "Add the trigger phrase \"stop at this phrase\" in the user prompt." },
      { id: "D", text: "Use the temperature parameter in the inference call to control the likelihood of the phrase appearing." }
    ],
    answer: ["B"],
    explanation: "[Answer inferred - not from an official key.] Stop sequences are an inference parameter: when the model generates one of the specified strings, generation halts deterministically and the sequence is not returned as part of the output. Prompt instructions are probabilistic, and sampling parameters only shape token diversity.",
    whyWrong: {
      A: "Top-k limits the candidate tokens considered at each step; it has no effect on when generation stops.",
      C: "Asking the model in the prompt to stop is not enforced; the model may ignore it.",
      D: "Temperature changes randomness of sampling and cannot force generation to end at a given phrase."
    },
    services: ["Amazon Bedrock"],
    tags: ["stop-sequences", "inference-parameters"]
  },
  {
    id: "d4-4.2-02",
    domain: 4, task: "4.2", skills: ["4.2.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A customer-facing chat application on Amazon Bedrock waits for the full response before displaying it. Users complain that the first words take 6 to 8 seconds to appear. The team uses a model that supports Amazon Bedrock latency-optimized inference. Which combination of actions will MOST improve responsiveness? (Select TWO)",
    choices: [
      { id: "A", text: "Switch from Converse to ConverseStream and render tokens to the UI as they arrive." },
      { id: "B", text: "Purchase Provisioned Throughput to lower per-token generation time." },
      { id: "C", text: "Set the performance configuration latency to optimized in the inference request for the supported model." },
      { id: "D", text: "Raise maxTokens to the model maximum so that the model finishes in fewer calls." },
      { id: "E", text: "Move the workload to batch inference so that requests are processed in parallel." }
    ],
    answer: ["A", "C"],
    explanation: "Streaming returns tokens as they are produced, which sharply reduces perceived time to first token. Latency-optimized inference (performance configuration set to optimized) reduces inference latency for supported models and Regions. Together they address both perceived and actual latency.",
    whyWrong: {
      B: "Provisioned Throughput guarantees capacity and avoids throttling, but it is not a latency-reduction feature.",
      D: "A higher maxTokens only permits longer outputs, which can increase total time.",
      E: "Batch inference is asynchronous and offline, so it would make interactive latency far worse."
    },
    services: ["Amazon Bedrock"],
    tags: ["streaming", "latency-optimized-inference", "time-to-first-token"]
  },
  {
    id: "d4-4.2-03",
    domain: 4, task: "4.2", skills: ["4.2.2", "4.2.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A RAG application stores 40 million document chunk embeddings in an Amazon OpenSearch Service domain. The index was created with the default settings, and the team runs exact k-NN (brute-force script scoring) on every query. Query latency exceeds 5 seconds. The team accepts a small, measured loss in recall in exchange for much lower latency. What should the developer do?",
    choices: [
      { id: "A", text: "Increase the number of retrieved chunks (top-k) from 5 to 50 to improve the chance of a match." },
      { id: "B", text: "Add a second Amazon Bedrock embedding call per query so the query vector is averaged before search." },
      { id: "C", text: "Recreate the index with an approximate nearest neighbor method such as HNSW (k-NN enabled), tune ef_search and m, and measure recall against the exact baseline." },
      { id: "D", text: "Move the embeddings to Amazon DynamoDB and compute cosine similarity in AWS Lambda." }
    ],
    answer: ["C"],
    explanation: "Exact k-NN scans every vector, so latency scales with corpus size. Approximate nearest neighbor search with an HNSW graph trades a little recall for large latency gains, and parameters like ef_search (query-time) and m / ef_construction (index-time) tune that trade-off. Validate against exact results as the recall baseline.",
    whyWrong: {
      A: "Retrieving more chunks makes the search and prompt larger and does not fix the full-scan cost.",
      B: "Extra embedding calls add latency and cost and do not change the search algorithm.",
      D: "DynamoDB has no native vector search; computing similarity in Lambda over 40 million vectors would be far slower."
    },
    services: ["Amazon OpenSearch Service", "Amazon Bedrock"],
    tags: ["vector-search", "hnsw", "retrieval-latency"]
  },
  {
    id: "d4-4.2-04",
    domain: 4, task: "4.2", skills: ["4.2.3", "4.2.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "During a daily marketing peak, a document-processing service receives ThrottlingException errors from on-demand Amazon Bedrock requests in a single Region. The company has no budget for Provisioned Throughput, and the workload is interactive and bursty. Which combination of actions will reduce throttling with the LEAST architectural change? (Select TWO)",
    choices: [
      { id: "A", text: "Switch the model ID to a cross-Region inference profile so that Bedrock can route requests to other Regions during peaks." },
      { id: "B", text: "Add retries with exponential backoff and jitter in the client, and cap in-flight concurrent requests." },
      { id: "C", text: "Increase the temperature so that responses are generated faster." },
      { id: "D", text: "Disable model invocation logging, because logging consumes the model's token quota." },
      { id: "E", text: "Deploy the application to a larger Amazon ECS task size to increase Bedrock quota." }
    ],
    answer: ["A", "B"],
    explanation: "Cross-Region inference profiles let Bedrock distribute on-demand traffic across Regions in a geography, increasing effective throughput during bursts. Client-side exponential backoff with jitter and bounded concurrency smooths retries for the remaining throttles. Both are low-effort and require no committed capacity.",
    whyWrong: {
      C: "Temperature controls sampling randomness, not generation speed or quota.",
      D: "Invocation logging does not consume the model's token quota.",
      E: "Bedrock quotas are per account and Region, not tied to client compute size."
    },
    services: ["Amazon Bedrock", "Amazon ECS"],
    tags: ["cross-region-inference", "throttling", "retry-backoff"]
  },
  {
    id: "d4-4.2-05",
    domain: 4, task: "4.2", skills: ["4.2.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An insurance company uses a foundation model on Amazon Bedrock to extract policy numbers and dates from claim emails into a fixed JSON schema. Testing shows that the same email occasionally produces different field values across runs. The team needs the most repeatable output without changing the model. Which inference configuration should the developer use?",
    choices: [
      { id: "A", text: "Set temperature to a high value and top-p to 1.0 to encourage varied phrasing." },
      { id: "B", text: "Increase maxTokens so that the model has room to reconsider its answer." },
      { id: "C", text: "Add a stop sequence containing the word \"JSON\"." },
      { id: "D", text: "Set temperature to 0 (or a very low value) and, if needed, lower top-p." }
    ],
    answer: ["D"],
    explanation: "Low temperature makes the token distribution sharper, so the model picks the most likely tokens, which makes output more repeatable and suited to extraction. Lowering top-p further narrows the sampling pool. Exact determinism is still not guaranteed by every model, so also validate output against the schema.",
    whyWrong: {
      A: "High temperature increases randomness, the opposite of what is needed.",
      B: "maxTokens only caps the length of output; it does not influence sampling consistency.",
      C: "A stop sequence on \"JSON\" could truncate the output early and has no effect on repeatability."
    },
    services: ["Amazon Bedrock"],
    tags: ["temperature", "top-p", "inference-parameters"]
  },
  {
    id: "d4-4.3-01",
    domain: 4, task: "4.3", skills: ["4.3.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A retail company's generative AI application normally consumes a predictable number of tokens that varies by time of day and weekday. A buggy retry loop recently caused a 10x token burst overnight that went unnoticed until the bill arrived. The team wants automated detection of unusual token usage that adapts to the daily and weekly pattern, with the LEAST operational overhead. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Create an Amazon CloudWatch alarm that uses anomaly detection on the Amazon Bedrock InputTokenCount and OutputTokenCount metrics, and notify an Amazon SNS topic." },
      { id: "B", text: "Create a static threshold alarm on InvocationLatency at 10 seconds." },
      { id: "C", text: "Export model invocation logs to Amazon S3 and review them manually each Monday." },
      { id: "D", text: "Run a nightly AWS Lambda function that scans AWS CloudTrail for InvokeModel events and counts them against a fixed number." }
    ],
    answer: ["A"],
    explanation: "CloudWatch anomaly detection builds a model of expected metric values, including hourly and weekly seasonality, and alarms when values leave the expected band. Applied to the Bedrock token-count metrics, it flags token bursts without manually maintained thresholds.",
    whyWrong: {
      B: "Latency does not measure token volume, and a static threshold would not reflect time-of-day patterns.",
      C: "Manual weekly review is reactive and has high operational effort.",
      D: "Counting events against a fixed number does not adapt to seasonality, does not measure tokens, and requires custom code."
    },
    services: ["Amazon CloudWatch", "Amazon Bedrock", "Amazon SNS"],
    tags: ["anomaly-detection", "token-usage", "cloudwatch-alarms"]
  },
  {
    id: "d4-4.3-02",
    domain: 4, task: "4.3", skills: ["4.3.2", "4.3.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A healthcare company must keep a searchable record of the full prompts and model responses of its Amazon Bedrock application for 90 days to investigate complaints about incorrect answers. The data must be encrypted with a customer managed key. Currently no prompt or response content is recorded anywhere. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Enable AWS CloudTrail data events for Bedrock, which capture prompt and response text." },
      { id: "B", text: "Enable Amazon Bedrock model invocation logging and deliver logs to Amazon CloudWatch Logs and/or Amazon S3, with the destination encrypted by an AWS KMS customer managed key." },
      { id: "C", text: "Use Amazon CloudWatch Logs Insights to query the invocation log group, and set a 90-day retention period on the log group." },
      { id: "D", text: "Use the default Bedrock runtime metrics in CloudWatch, which already store prompt text as metric dimensions." },
      { id: "E", text: "Enable AWS X-Ray on the Bedrock service so that it records prompt payloads." }
    ],
    answer: ["B", "C"],
    explanation: "Model invocation logging is disabled by default and must be enabled; it can capture full request and response data and deliver it to CloudWatch Logs and/or S3, where it can be encrypted with KMS. Logs Insights lets investigators query the log group, and a retention policy enforces the 90-day requirement.",
    whyWrong: {
      A: "CloudTrail records API activity metadata (who called what), not prompt and response content.",
      D: "CloudWatch metrics are numeric aggregates such as token counts and latency; they do not contain prompt text.",
      E: "X-Ray traces your application's calls and timings; it does not record Bedrock prompt payloads by itself."
    },
    services: ["Amazon Bedrock", "Amazon CloudWatch Logs", "Amazon S3", "AWS KMS"],
    tags: ["model-invocation-logging", "audit", "logs-insights"]
  },
  {
    id: "d4-4.3-03",
    domain: 4, task: "4.3", skills: ["4.3.1", "4.3.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A RAG API built on Amazon API Gateway and AWS Lambda performs query rewriting with a model, a vector search in Amazon OpenSearch Service, a reranking step, and a final Amazon Bedrock generation call. Overall p95 latency doubled this week, and the team cannot tell which stage is responsible. Which solution gives the needed visibility with the LEAST effort?",
    choices: [
      { id: "A", text: "Increase the Lambda memory size and re-run load tests." },
      { id: "B", text: "Enable AWS X-Ray active tracing on API Gateway and Lambda, and add custom subsegments around the rewrite, search, rerank, and generation calls to compare per-stage durations." },
      { id: "C", text: "Create a CloudWatch alarm on Bedrock InvocationClientErrors." },
      { id: "D", text: "Enable AWS Config rules on the OpenSearch domain to detect configuration drift." }
    ],
    answer: ["B"],
    explanation: "Distributed tracing shows where time goes within a request. X-Ray active tracing creates a service map and trace timeline, and custom subsegments let you attribute latency to individual stages of the GenAI pipeline, such as retrieval versus generation.",
    whyWrong: {
      A: "More memory may speed up Lambda CPU but does not identify which stage regressed and may not help at all.",
      C: "Client errors are failure counts and do not explain a latency increase.",
      D: "Config detects resource configuration changes, not per-request stage latency."
    },
    services: ["AWS X-Ray", "AWS Lambda", "Amazon API Gateway", "Amazon Bedrock"],
    tags: ["tracing", "x-ray", "latency-troubleshooting"]
  },
  {
    id: "d4-4.3-04",
    domain: 4, task: "4.3", skills: ["4.3.2", "4.3.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company shares one AWS account among three product teams that all call Amazon Bedrock. Finance needs monthly Bedrock cost broken down by team and by application, and wants to see each team's invocation metrics separately in Amazon CloudWatch. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Create a separate AWS account for each team and consolidate manually with spreadsheets." },
      { id: "B", text: "Parse model invocation logs with a custom AWS Glue job to estimate each team's cost from token counts and prices." },
      { id: "C", text: "Create an application inference profile per team or application with cost allocation tags, activate the tags in AWS Billing, and have each application invoke its profile ARN." },
      { id: "D", text: "Tag the IAM role used by each team and rely on Cost Explorer to split Bedrock charges by role." }
    ],
    answer: ["C"],
    explanation: "Application inference profiles are user-defined profiles that wrap a model and can carry tags. Activated as cost allocation tags, they let Cost Explorer and cost reports break Bedrock spend down by team or application, and invoking through the profile also lets you view usage metrics per profile in CloudWatch.",
    whyWrong: {
      A: "Separate accounts can work but add heavy account-management overhead and manual consolidation.",
      B: "Custom log parsing duplicates pricing logic and produces estimates rather than billed cost.",
      D: "Tagging an IAM role does not attribute Bedrock charges, because on-demand model usage is not tagged by caller role."
    },
    services: ["Amazon Bedrock", "AWS Cost Explorer", "Amazon CloudWatch"],
    tags: ["application-inference-profiles", "cost-allocation-tags", "chargeback"]
  }
);
