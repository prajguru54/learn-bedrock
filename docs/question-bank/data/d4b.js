window.QB = window.QB || [];
window.QB.push(
  {
    id: "d4-4.1-06",
    domain: 4, task: "4.1", skills: ["4.1.1", "4.1.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A customer-support chatbot on Amazon Bedrock resends the entire conversation history with every turn. Long conversations of 40 or more turns now exceed 25,000 input tokens per request, and cost per conversation is growing quadratically. Answers to recent turns must remain accurate, and older context only needs to preserve key facts such as order numbers and stated preferences. Which solution will reduce input token cost MOST effectively while preserving answer quality?",
    choices: [
      { id: "A", text: "Send only the latest user message on every turn and drop all earlier history." },
      { id: "B", text: "Switch to a model with a larger context window so that the full history always fits." },
      { id: "C", text: "Keep the most recent turns verbatim, and periodically summarize older turns into a compact running summary with a smaller, cheaper model that is sent in place of the old turns." },
      { id: "D", text: "Lower maxTokens on every request so that the model produces shorter replies." }
    ],
    answer: ["C"],
    explanation: "Context pruning with a rolling summary bounds the prompt size: recent turns stay exact while older turns are compressed into the key facts. Using a smaller model for summarization applies tiered model usage to the cheap task. Input tokens per request then plateau instead of growing with each turn.",
    whyWrong: {
      A: "Dropping all history loses the order numbers and preferences the assistant needs, which hurts answer quality.",
      B: "A larger window lets the history fit but does not reduce the tokens billed; cost keeps growing with every turn.",
      D: "maxTokens limits output length only. The cost problem is in the input tokens, which this setting does not change."
    },
    services: ["Amazon Bedrock"],
    tags: ["context-pruning", "conversation-summarization", "token-cost"]
  },
  {
    id: "d4-4.1-07",
    domain: 4, task: "4.1", skills: ["4.1.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company hosts a fine-tuned open-source LLM on an Amazon SageMaker AI real-time endpoint. Traffic is heavy from 8 AM to 6 PM on weekdays and nearly idle otherwise. The endpoint is currently provisioned with enough instances for peak load around the clock. The team wants to reduce GPU instance cost without manual intervention and while still serving the daily peak. Which solution is MOST cost-effective?",
    choices: [
      { id: "A", text: "Replace the real-time endpoint with Amazon Bedrock Provisioned Throughput for the fine-tuned model." },
      { id: "B", text: "Register the endpoint variant with Application Auto Scaling and attach a target tracking scaling policy on a metric such as invocations per instance, with a sensible minimum and maximum instance count." },
      { id: "C", text: "Keep peak capacity and purchase a longer-term commitment so the idle hours are billed at a lower rate." },
      { id: "D", text: "Use CloudWatch to alarm on endpoint CPU utilization and have an engineer resize the instance count by hand each morning and evening." }
    ],
    answer: ["B"],
    explanation: "SageMaker AI endpoint variants can scale the instance count automatically through Application Auto Scaling. A target tracking policy adds instances as load per instance rises and removes them when it falls, so off-peak hours run on fewer GPUs. Min and max capacity bound cost and protect the peak.",
    whyWrong: {
      A: "Provisioned Throughput is a Bedrock capacity commitment billed hourly; it does not remove idle cost and is a different hosting model than the SageMaker endpoint.",
      C: "A commitment lowers the unit price, but you still pay for peak-sized capacity during idle hours.",
      D: "Manual resizing is error-prone, adds operational overhead, and cannot react to unexpected traffic changes."
    },
    services: ["Amazon SageMaker AI", "Application Auto Scaling", "Amazon CloudWatch"],
    tags: ["auto-scaling", "sagemaker-endpoints", "capacity-planning"]
  },
  {
    id: "d4-4.1-08",
    domain: 4, task: "4.1", skills: ["4.1.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "Several upstream systems submit product records to an enrichment service that calls an Amazon Bedrock model to classify each record. The same record is often submitted many times, but different systems serialize the JSON with different key ordering and whitespace. Prompt templates are updated occasionally, and the team must never serve a result generated with an older template. The team wants to eliminate duplicate model invocations. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Canonicalize the record (sorted keys, trimmed whitespace), then build the cache key as a hash of the canonical record plus the model ID, the prompt template version, and the inference parameters." },
      { id: "B", text: "Build the cache key from a hash of the raw request body and the request timestamp." },
      { id: "C", text: "Use only the product ID as the cache key and never expire entries, because product IDs are unique." },
      { id: "D", text: "Check an Amazon DynamoDB table or Amazon ElastiCache cluster for the key before invoking the model, and on a miss store the result with a TTL." },
      { id: "E", text: "Enable invocation logging on Amazon Bedrock so that duplicate requests are automatically detected and rejected." }
    ],
    answer: ["A", "D"],
    explanation: "Deterministic request hashing works only if equivalent inputs produce the same key, so the payload must be canonicalized first. Including the model ID, template version, and parameters in the key means a template change produces new keys and old results are never served. A lookup before invocation, with a TTL on stored results, is what actually avoids the duplicate model calls.",
    whyWrong: {
      B: "Raw bytes differ with key order and whitespace, and a timestamp makes every key unique, so nothing would ever hit the cache.",
      C: "A product-ID-only key ignores template and model changes, so stale results would be served, and non-expiring entries never refresh.",
      E: "Invocation logging records requests for analysis and audit; it does not deduplicate or reject calls."
    },
    services: ["Amazon Bedrock", "Amazon DynamoDB", "Amazon ElastiCache"],
    tags: ["deterministic-hashing", "result-caching", "cache-invalidation"]
  },
  {
    id: "d4-4.2-06",
    domain: 4, task: "4.2", skills: ["4.2.1", "4.2.6"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A research tool generates a report by making five independent Amazon Bedrock calls, one for each report section, and runs them one after another. Each call takes about 8 seconds, so users wait about 40 seconds. The sections do not depend on each other's output, and the account has sufficient on-demand quota. Which change will MOST reduce end-to-end latency?",
    choices: [
      { id: "A", text: "Move the five calls to Amazon Bedrock batch inference." },
      { id: "B", text: "Combine all five sections into one prompt and raise maxTokens to the model maximum." },
      { id: "C", text: "Enable response streaming on each of the sequential calls." },
      { id: "D", text: "Issue the five independent calls concurrently (for example with asyncio, or a Step Functions Parallel state), then assemble the sections when all calls return." }
    ],
    answer: ["D"],
    explanation: "When subtasks are independent, running them in parallel makes total time close to the slowest single call (about 8 seconds) instead of the sum. Parallel fan-out and join is a standard pattern for complex GenAI workflows. Keep concurrency within your quota and add retries for throttling.",
    whyWrong: {
      A: "Batch inference is asynchronous and offline, which would make the interactive wait longer.",
      B: "One large generation is produced sequentially token by token, so the total time is about the same or longer.",
      C: "Streaming helps perceived time to first token, but the sequential calls still add up to the same total time."
    },
    services: ["Amazon Bedrock", "AWS Step Functions"],
    tags: ["parallel-requests", "fan-out", "latency"]
  },
  {
    id: "d4-4.2-07",
    domain: 4, task: "4.2", skills: ["4.2.1", "4.2.5"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Every weekday, 8,000 sales reps open a \"daily account briefing\" in a mobile app between 8:45 and 9:00 AM. Each briefing is generated on demand by Amazon Bedrock from CRM data that is finalized at 6 AM, and users see 15-second waits and occasional throttling at the peak. The briefing content for a given rep does not change during the day. Which solution will MOST improve responsiveness and avoid peak throttling?",
    choices: [
      { id: "A", text: "Pre-compute the briefings after the 6 AM data load with a scheduled job (for example Amazon EventBridge Scheduler and Bedrock batch inference), store them in Amazon DynamoDB or Amazon S3, and serve them directly." },
      { id: "B", text: "Keep generating on demand but increase the maxTokens value so that briefings finish in fewer calls." },
      { id: "C", text: "Generate each briefing on demand with a higher temperature to make the model respond faster." },
      { id: "D", text: "Add a retry loop that waits 30 seconds after any throttling error." }
    ],
    answer: ["A"],
    explanation: "Because the input data is fixed at 6 AM and the output is predictable, the work can be done ahead of time during off-peak hours. Serving a stored result removes model latency from the user path and removes the peak burst of model calls, which eliminates the throttling. This is the pre-computation pattern for predictable queries.",
    whyWrong: {
      B: "maxTokens only sets a limit on output length and does not speed up generation or reduce the number of calls.",
      C: "Temperature affects sampling randomness, not generation speed.",
      D: "Longer retries make users wait even longer and do not reduce the peak load on the model."
    },
    services: ["Amazon Bedrock", "Amazon EventBridge", "Amazon DynamoDB", "Amazon S3"],
    tags: ["pre-computation", "batch-inference", "latency"]
  },
  {
    id: "d4-4.3-05",
    domain: 4, task: "4.3", skills: ["4.3.5", "4.3.1"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A RAG application stores embeddings in an Amazon OpenSearch Service domain that uses k-NN vector search. Over several weeks, retrieval quality has dropped without any alarms firing, and an investigation found that a faulty ingestion job once wrote documents with missing vectors. The team wants proactive operational management of the vector store. Which combination of actions will meet this goal? (Select TWO)",
    choices: [
      { id: "A", text: "Create an alarm on Amazon Bedrock InvocationLatency for the generation model." },
      { id: "B", text: "Create Amazon CloudWatch alarms on the domain's OpenSearch metrics, such as search latency, JVM memory pressure, and the k-NN graph memory metrics." },
      { id: "C", text: "Enable AWS CloudTrail data events on the domain to measure search relevance." },
      { id: "D", text: "Rebuild the whole index with a larger instance type every week." },
      { id: "E", text: "Run a scheduled validation job (for example an EventBridge-triggered AWS Lambda function) that samples documents, checks that vectors are present and have the expected dimension, and publishes the failure rate as a custom CloudWatch metric with an alarm." }
    ],
    answer: ["B", "E"],
    explanation: "Vector store operations need two layers. Infrastructure and k-NN performance metrics in CloudWatch warn about latency and memory pressure before queries degrade. Data quality validation catches problems such as missing or wrong-dimension vectors that no infrastructure metric can see, and a custom metric makes it alarmable.",
    whyWrong: {
      A: "Generation latency is a symptom of a different component and says nothing about vector store health or vector quality.",
      C: "CloudTrail records API activity; it does not measure relevance or detect bad vectors.",
      D: "Weekly rebuilds on bigger hardware are costly and do not detect or prevent bad data; they just hide the issue until it recurs."
    },
    services: ["Amazon OpenSearch Service", "Amazon CloudWatch", "AWS Lambda", "Amazon EventBridge"],
    tags: ["vector-store-monitoring", "data-quality-validation", "opensearch-metrics"]
  },
  {
    id: "d4-4.3-06",
    domain: 4, task: "4.3", skills: ["4.3.6", "4.3.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A financial-services company runs a RAG assistant on Amazon Bedrock. Prompt templates and the knowledge base content change often, and the team wants to detect increases in hallucination rate and response drift soon after a change, with trends visible on a dashboard and alarms on regressions. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Create a CloudWatch alarm on OutputTokenCount, because hallucinated answers are always longer." },
      { id: "B", text: "Maintain a golden dataset of representative questions with verified reference answers and source passages, run it through the application on a schedule and after each change, score the responses (for example with an LLM-as-a-judge evaluation for correctness and groundedness), publish the scores as custom CloudWatch metrics, and alarm on drops." },
      { id: "C", text: "Set temperature to 0 so the model can no longer hallucinate." },
      { id: "D", text: "Have analysts read a random sample of invocation logs once per quarter." }
    ],
    answer: ["B"],
    explanation: "Hallucinations are a GenAI-specific failure mode that infrastructure metrics do not show. A golden dataset gives a fixed, known-good baseline, so repeated runs make scores comparable over time and show regressions after prompt or content changes. Publishing the scores as CloudWatch metrics enables dashboards and alarms.",
    whyWrong: {
      A: "Output length is not a reliable signal of factual accuracy; a hallucinated answer can be short and a correct one long.",
      C: "Lower temperature reduces randomness but does not prevent the model from producing ungrounded or incorrect statements.",
      D: "Quarterly manual sampling is too slow and too small to catch regressions soon after a change, and gives no alarms."
    },
    services: ["Amazon Bedrock", "Amazon CloudWatch", "Amazon EventBridge"],
    tags: ["golden-dataset", "hallucination-detection", "response-drift"]
  }
);
