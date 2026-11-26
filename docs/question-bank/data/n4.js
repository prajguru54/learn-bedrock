window.QB = window.QB || [];
window.QB.push(
  {
    id: "d4-4.1-09",
    domain: 4, task: "4.1", skills: ["4.1.1"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "Your team plans to move a summarization workload from one Amazon Bedrock model family to another and must forecast the monthly input-token bill before sending any traffic. An engineer proposes estimating tokens as characters divided by four. Which approach gives the most accurate token count for the new model without running inference?",
    choices: [
      { id: "A", text: "Count tokens locally with a general-purpose open-source tokenizer, then apply the new model's published input price per 1,000 tokens to the totals." },
      { id: "B", text: "Send each sample prompt to the new model with a maxTokens of 1 and read inputTokens from the usage block of the response." },
      { id: "C", text: "Call the Bedrock CountTokens API with the new model ID and a representative request body, then multiply the returned count by the model's input price." },
      { id: "D", text: "Reuse the inputTokens values already logged for the old model, because the same text always yields the same token count on every model." }
    ],
    answer: ["C"],
    explanation: "Tokenizers differ between model families, so the same text produces different counts on different models. The CountTokens API returns the token count for the model you name, without running inference and without generating output charges. Multiplying that count by the published input price gives a reliable forecast.",
    whyWrong: {
      A: "A generic tokenizer is not the tokenizer of the target model, so counts can drift by a noticeable margin.",
      B: "This works technically, but it runs real inference on every sample and bills tokens, which a pre-check is meant to avoid.",
      D: "Token counts are model-specific. Numbers logged for the old model do not carry over to the new one."
    },
    services: ["Amazon Bedrock"],
    tags: ["count-tokens-api", "token-estimation", "cost-forecast"]
  },
  {
    id: "d4-4.1-10",
    domain: 4, task: "4.1", skills: ["4.1.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer reviews the cost of an HR policy assistant built on a Bedrock Knowledge Base. Each request uses this retrieval setup and averages these sizes:\n`retrievalConfiguration.vectorSearchConfiguration.numberOfResults = 25`\n`average chunk size = 600 tokens, system prompt = 350 tokens, question = 40 tokens`\nAn offline test shows the correct source passage is within the top 5 results for 96% of questions. Which change will MOST cost-effectively reduce input spend while keeping answer quality?",
    choices: [
      { id: "A", text: "Cut the system prompt from 350 tokens to about 175 tokens by removing examples and formatting rules." },
      { id: "B", text: "Lower numberOfResults to about 5 and add a reranking step so the most relevant chunks stay in the prompt, then re-run the offline test." },
      { id: "C", text: "Raise the chunk size to 1,500 tokens so each retrieved result carries more context and fewer results are needed overall." },
      { id: "D", text: "Lower maxTokens on the generation call so that the model stops earlier and uses fewer tokens per request." }
    ],
    answer: ["B"],
    explanation: "Retrieved context is about 25 x 600 = 15,000 tokens, which dwarfs the 350-token system prompt and the 40-token question. Reducing the retrieved count to about 5 cuts roughly 12,000 input tokens per request, and a reranker keeps the best chunks in the smaller set. The offline test confirms quality before rollout.",
    whyWrong: {
      A: "This saves about 175 tokens out of roughly 15,400, a saving of about 1%, so it barely moves the bill.",
      C: "Larger chunks increase the tokens per result and push the total prompt size up rather than down.",
      D: "maxTokens bounds output only. The cost problem here is the 15,000 tokens of retrieved input."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Knowledge Bases"],
    tags: ["rag-top-k", "context-size", "reranking", "input-token-cost"]
  },
  {
    id: "d4-4.1-11",
    domain: 4, task: "4.1", skills: ["4.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "After deploying a support-ticket classifier, a FinOps analyst inspects one typical Converse response and the model pricing of $3 per 1M input tokens and $15 per 1M output tokens:\n`\"usage\": {\"inputTokens\": 1200, \"outputTokens\": 900, \"totalTokens\": 2100}`\nThe prompt asks the model to explain its reasoning and then state one of 12 category names. Which statement about this request is correct, and what is the best fix?",
    choices: [
      { id: "A", text: "Input dominates cost because 1,200 is more than 900 tokens, so compress the prompt and keep the output format as it is." },
      { id: "B", text: "Output is about 79% of the $0.0171 request cost, so require a structured reply that contains only the category ID and no explanation." },
      { id: "C", text: "Input and output cost about the same per request because the token counts are close, so the current design needs no change." },
      { id: "D", text: "Output is about 79% of the cost, so set maxTokens to 50 and leave the prompt as it is so the model reasons first and ends early." }
    ],
    answer: ["B"],
    explanation: "Input costs 1,200 x $3 / 1M = $0.0036 and output costs 900 x $15 / 1M = $0.0135, for $0.0171 in total, so output is about 79%. Output tokens are billed at a higher rate, and a classifier needs only a short label. Returning just the category ID cuts output to roughly a dozen tokens.",
    whyWrong: {
      A: "Token counts alone mislead because output tokens are priced 5x higher. Compressing input would save far less.",
      C: "Similar token counts do not mean similar cost. Output at $15 per 1M outweighs input at $3 per 1M.",
      D: "A hard cap while the prompt still demands reasoning first truncates the response before the category appears, which breaks the result."
    },
    services: ["Amazon Bedrock"],
    tags: ["output-token-cost", "structured-output", "cost-arithmetic", "converse-usage"]
  },
  {
    id: "d4-4.1-12",
    domain: 4, task: "4.1", skills: ["4.1.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A bank runs two Bedrock workloads. The first is a live assistant used by trading-desk staff, where slow responses at market open directly cost money. The second is a nightly job that re-summarises 40,000 research notes and can finish any time before 6 AM. Which choice of Bedrock service tier is the MOST cost-effective for the two workloads?",
    choices: [
      { id: "A", text: "Use the Standard tier for both workloads, since a single tier keeps pricing and quota management simple." },
      { id: "B", text: "Use the Priority tier for both workloads so that the nightly job also finishes quickly and early." },
      { id: "C", text: "Use the Flex tier for the live assistant and the Priority tier for the nightly job, matching tiers to data volume." },
      { id: "D", text: "Use the Priority tier for the live assistant and the Flex tier for the nightly job that tolerates slower processing." }
    ],
    answer: ["D"],
    explanation: "Service tiers trade price against responsiveness. Priority pays a premium for faster, preferential processing, which fits the latency-sensitive desk assistant. Flex gives a lower price in exchange for slower or lower-priority processing, which suits an overnight job with a deadline hours away.",
    whyWrong: {
      A: "Standard works but pays a premium on the desk assistant's latency or overpays on the batch-style job; matching each workload to a tier is cheaper.",
      B: "Paying the Priority premium for a job with a 6 AM deadline wastes money, because speed has no business value there.",
      C: "This is reversed: the interactive workload would get the slow, low-priority tier and the tolerant job would pay the premium."
    },
    services: ["Amazon Bedrock"],
    tags: ["service-tiers", "priority-tier", "flex-tier", "workload-latency-tolerance"]
  },
  {
    id: "d4-4.1-13",
    domain: 4, task: "4.1", skills: ["4.1.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "An insurance firm must classify 3 million claim records with Bedrock batch inference. The team's first attempt put every record in one JSONL file, and the job was rejected for exceeding the per-job limits for records and file size. Operations also wants the pipeline to react when a job finishes or fails without custom polling. Which combination of steps is the MOST scalable fix? (Select TWO.)",
    choices: [
      { id: "A", text: "Split the input into multiple JSONL files that each stay under the per-job record and size quotas, and submit one batch job per file within the concurrent job quota." },
      { id: "B", text: "Create an Amazon EventBridge rule on Bedrock batch inference job state-change events that targets Step Functions or SNS to start post-processing or retry failed jobs." },
      { id: "C", text: "Gzip the single large JSONL file so that it falls under the file size quota, then resubmit it to Bedrock as one large batch job." },
      { id: "D", text: "Run a long-lived Lambda loop that calls GetModelInvocationJob every second for each submitted job and waits until all report completion." },
      { id: "E", text: "Replace batch inference with a Lambda that calls InvokeModel once for every record, because batch jobs cannot run in parallel at all." }
    ],
    answer: ["A", "B"],
    explanation: "Per-job quotas are enforced on the input, so the data must be sharded into several files, each submitted as its own job while staying below the concurrent-jobs quota. Job status changes are published as events, so an EventBridge rule can drive downstream steps and retries with no polling code. Together these scale to any dataset size.",
    whyWrong: {
      C: "The quota applies to the file as submitted, and compression does not help with the record-count limit or with the data Bedrock reads.",
      D: "A one-second polling loop is brittle and costly, and Lambda has a maximum runtime. State-change events remove the need for it.",
      E: "Per-record InvokeModel loses the batch discount and runs into on-demand throttling. Several batch jobs can run at the same time."
    },
    services: ["Amazon Bedrock", "Amazon EventBridge", "Amazon S3", "AWS Step Functions"],
    tags: ["batch-inference", "job-quotas", "jsonl-sharding", "eventbridge-state-change"]
  },
  {
    id: "d4-4.1-14",
    domain: 4, task: "4.1", skills: ["4.1.1"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A knowledge-base team re-embeds its entire 6-million-chunk corpus with Amazon Titan Text Embeddings V2 every night, although fewer than 2% of documents change daily. Many chunks are duplicated boilerplate such as legal footers, and vectors are stored at the default 1,024 dimensions. Which actions will reduce embedding and storage cost the MOST cost-effectively without a material quality drop? (Select THREE.)",
    choices: [
      { id: "A", text: "Store a content hash for each chunk and send only new or changed chunks to the embedding model on each run." },
      { id: "B", text: "Increase chunk overlap to 50% so that each fact appears in two chunks and retrieval can be matched more easily." },
      { id: "C", text: "Deduplicate identical boilerplate chunks before embedding so that each unique text is embedded and stored once." },
      { id: "D", text: "Keep the nightly full re-embed so the index can never contain stale vectors, and compensate by lowering the schedule to every other night." },
      { id: "E", text: "Choose a smaller output dimension such as 512 after testing retrieval recall, which shrinks vector storage and search cost." },
      { id: "F", text: "Switch to 1,024 dimensions for every index and add a second index at 256 dimensions as a fallback for rare queries." }
    ],
    answer: ["A", "C", "E"],
    explanation: "Hash-based change detection stops paying to re-embed the roughly 98% of chunks that did not change. Deduplicating boilerplate removes entire classes of repeated embedding calls. Titan V2 supports smaller output dimensions, which cut index storage and query compute, provided recall is validated first.",
    whyWrong: {
      B: "More overlap creates more chunks, which means more embedding calls and more vectors to store.",
      D: "Re-embedding everything every other night still pays for unchanged chunks. Change detection removes the waste instead of just spacing it out.",
      F: "Maintaining two indexes at different sizes increases storage and embedding cost instead of lowering it."
    },
    services: ["Amazon Bedrock", "Amazon Titan Text Embeddings V2", "Amazon OpenSearch Service"],
    tags: ["embedding-cost", "incremental-reembedding", "embedding-dimensions", "chunk-deduplication"]
  },
  {
    id: "d4-4.1-15",
    domain: 4, task: "4.1", skills: ["4.1.2"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "The finance team at a retail group sees the Bedrock line on the AWS bill double in a week and cannot tell whether the cause is a new model, longer outputs or a runaway job. They want to find the driver and be warned automatically next time, with LEAST operational overhead. Which actions should they take? (Select TWO.)",
    choices: [
      { id: "A", text: "In Cost Explorer, group Bedrock spend by Usage Type, which separates input-token and output-token charges for each model, and compare week over week." },
      { id: "B", text: "Create an AWS Cost Anomaly Detection monitor that covers Amazon Bedrock and subscribe an SNS topic or email list to anomaly alerts." },
      { id: "C", text: "Set one AWS Budgets monthly fixed-amount budget for Bedrock and review it when the invoice arrives at the end of the month." },
      { id: "D", text: "Enable Trusted Advisor cost checks, which list Bedrock model usage by team and also flag oversized prompts for each application." },
      { id: "E", text: "Write a Lambda that parses invocation logs every hour, multiplies tokens by hard-coded model prices and posts the totals to a Slack channel." }
    ],
    answer: ["A", "B"],
    explanation: "Cost Explorer's Usage Type dimension shows which model and which token direction rose, which answers the diagnostic question from billing data. Cost Anomaly Detection learns normal spend and sends an alert when a service's spend deviates, so the next spike is flagged within a day or so without custom code.",
    whyWrong: {
      C: "A fixed monthly budget only trips after much of the overspend has happened and does not say which model or token type drove it.",
      D: "Trusted Advisor does not break down Bedrock usage by team or analyse prompt size.",
      E: "This reinvents billing with hard-coded prices that drift, and it needs code to maintain. Native cost tools are authoritative and require no code."
    },
    services: ["AWS Cost Explorer", "AWS Cost Anomaly Detection", "Amazon Bedrock", "Amazon SNS"],
    tags: ["cost-explorer-usage-type", "cost-anomaly-detection", "token-cost-attribution"]
  },
  {
    id: "d4-4.2-08",
    domain: 4, task: "4.2", skills: ["4.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "You are tuning a RAG chat endpoint. For each question it runs sequentially: an input safety check with the ApplyGuardrail API (about 250 ms), a Knowledge Base Retrieve call (about 400 ms), then streaming generation whose first token arrives about 700 ms after the call starts. Users see nothing for roughly 1,350 ms. Unsafe input must never reach the model. Which change gives the FASTEST first-token time while keeping that guarantee?",
    choices: [
      { id: "A", text: "Run ApplyGuardrail and Retrieve concurrently, and call the model only after the guardrail passes, discarding the retrieved chunks if it blocks." },
      { id: "B", text: "Start generation immediately with the raw question while the guardrail and retrieval run, and stop the stream if the guardrail later blocks." },
      { id: "C", text: "Run only Retrieve and generation concurrently, and apply the guardrail to the finished answer instead of the input." },
      { id: "D", text: "Cache every guardrail verdict by question text for 24 hours so that the safety call is skipped for all repeat visitors." }
    ],
    answer: ["A"],
    explanation: "Retrieval does not depend on the guardrail result, so the two calls can overlap and the wait becomes max(250, 400) = 400 ms instead of 650 ms, giving a first token at about 400 + 700 = 1,100 ms. Generation still starts only after the input is approved, so unsafe text never reaches the model.",
    whyWrong: {
      B: "Sending the question to the model before the check completes breaks the rule that unsafe input must never reach it.",
      C: "Output-only checking leaves the input unchecked, so unsafe prompts still reach the model, and it adds work after generation.",
      D: "Caching helps only for repeats and long-lived verdicts can go stale after policy changes. It does not speed up first-time questions."
    },
    services: ["Amazon Bedrock Guardrails", "Amazon Bedrock Knowledge Bases", "Amazon Bedrock"],
    tags: ["parallel-calls", "apply-guardrail", "time-to-first-token", "perceived-latency"]
  },
  {
    id: "d4-4.2-09",
    domain: 4, task: "4.2", skills: ["4.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A multi-tenant SaaS product stores embeddings for 800 tenants in one Amazon OpenSearch Service index. A k-NN query asks for k=10 with a post_filter on `tenant_id`. Small tenants often receive 0 to 3 results even though they have hundreds of documents, and the answers they do get are poor. Which change fixes recall and keeps latency low?",
    choices: [
      { id: "A", text: "Raise k to 500 and keep the post_filter on tenant_id, so that more candidates for each small tenant survive the filter step." },
      { id: "B", text: "Move the index to the nmslib engine, which is optimised for fast approximate search, and keep the post_filter on tenant_id as it is." },
      { id: "C", text: "Apply the tenant_id condition as an efficient filter inside the k-NN query, using the Lucene or Faiss engine, so the search is restricted to that tenant's vectors." },
      { id: "D", text: "Create a separate OpenSearch domain for every tenant and route each query to its own domain, so that no filter is needed on queries." }
    ],
    answer: ["C"],
    explanation: "With post-filtering, the engine first finds the k nearest neighbours across all tenants and only then removes other tenants' documents, so a small tenant is left with few or no hits. Efficient (pre-)filtering applies the condition during the approximate search so the k results come from the matching subset. Lucene and Faiss support this.",
    whyWrong: {
      A: "A very large k may rescue some results but costs latency and memory, and it still fails for tenants whose documents are far from the other tenants' vectors.",
      B: "nmslib does not support efficient filtering, so it keeps the post-filter problem.",
      D: "800 domains is expensive and heavy to operate, and it is far beyond what a metadata filter fixes."
    },
    services: ["Amazon OpenSearch Service"],
    tags: ["filtered-knn", "efficient-filtering", "post-filter-recall", "multi-tenant-vector-search"]
  },
  {
    id: "d4-4.2-10",
    domain: 4, task: "4.2", skills: ["4.2.2"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A Lambda function in us-east-1 answers questions by querying an Amazon OpenSearch Serverless collection in us-west-2 and then calling Bedrock. Traces show each warm invocation spends about 180 ms creating a new `boto3.client('bedrock-runtime')` and about 70 ms on each cross-Region round trip to the collection. Which changes will lower latency with LEAST operational overhead? (Select TWO.)",
    choices: [
      { id: "A", text: "Create the Bedrock Runtime and OpenSearch clients at module scope, outside the handler, so warm invocations reuse their connections and credentials." },
      { id: "B", text: "Replicate the collection to us-east-1, or deploy the function in the same Region as the collection, so that the two are co-located." },
      { id: "C", text: "Raise the function memory to the 10,240 MB maximum so that it gets more CPU, and keep creating the clients inside the handler." },
      { id: "D", text: "Enable provisioned concurrency to avoid cold starts, and keep the client construction code inside the handler as it is today." },
      { id: "E", text: "Set `retries={'max_attempts': 10}` in the botocore client configuration for both clients so that slow calls are retried sooner." }
    ],
    answer: ["A", "B"],
    explanation: "Clients created in the handler repeat the setup cost on every invocation, while module-scope clients are built once per execution environment and reused, including their pooled HTTPS connections. Placing compute and the vector store in the same Region removes the cross-Region round trip from every retrieval.",
    whyWrong: {
      C: "More memory adds CPU, but the per-invocation client setup remains and the network distance is unchanged.",
      D: "Provisioned concurrency avoids cold starts but does not stop a client from being built on every call when it sits inside the handler.",
      E: "Retries address errors, not slow successful calls, and extra attempts add more latency and load."
    },
    services: ["AWS Lambda", "Amazon OpenSearch Serverless", "Amazon Bedrock"],
    tags: ["client-reuse", "lambda-init-scope", "regional-colocation", "cross-region-latency"]
  },
  {
    id: "d4-4.2-11",
    domain: 4, task: "4.2", skills: ["4.2.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A document-extraction service is throttled at about 65 requests per minute against a model with a quota of 400,000 tokens per minute (TPM). Each request has:\n`inputTokens ~ 2,000, maxTokens (configured) = 4,096, observed outputTokens ~ 300 (max seen 410)`\nBedrock reserves input tokens plus maxTokens against the quota when a request starts, then reconciles to actual usage after it finishes. Which change will raise sustainable throughput the MOST?",
    choices: [
      { id: "A", text: "Retry with exponential backoff and jitter on every ThrottlingException so that throttled calls are resubmitted automatically after a short wait." },
      { id: "B", text: "Shorten the prompt by 10% through trimming instructions, which saves about 200 input tokens on every request and lowers the reservation." },
      { id: "C", text: "Raise maxTokens to 8,192 so that long responses are never cut off, which removes the need for any retries on truncated output." },
      { id: "D", text: "Lower maxTokens to about 512, above the largest output seen, so the reservation falls to about 2,512 tokens and about 159 requests fit per minute." }
    ],
    answer: ["D"],
    explanation: "The reservation is 2,000 + 4,096 = 6,096 tokens per request, and 400,000 / 6,096 is about 65 requests per minute, which matches the throttling even though real usage is only about 2,300 tokens. With maxTokens at 512, covering the largest observed output of 410, the reservation falls to 2,512 and 400,000 / 2,512 is about 159 per minute.",
    whyWrong: {
      A: "Backoff smooths bursts but does not increase the quota, so steady load above 65 per minute still throttles.",
      B: "Saving 200 tokens trims the reservation from 6,096 to 5,896, a gain of about 3% in requests per minute.",
      C: "A higher maxTokens raises the reservation to 10,096 and cuts throughput to about 40 requests per minute."
    },
    services: ["Amazon Bedrock", "Service Quotas"],
    tags: ["tpm-quota", "max-tokens-reservation", "throughput-arithmetic", "throttling"]
  },
  {
    id: "d4-4.2-12",
    domain: 4, task: "4.2", skills: ["4.2.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer calls a Claude model through the Converse API for both quick FAQ lookups and hard multi-step analysis. Extended thinking is enabled for every call with `additionalModelRequestFields = {\"thinking\": {\"type\": \"enabled\", \"budget_tokens\": 16000}}`, and FAQ answers now take 20 seconds or more. Quality on analysis requests is good. Which change cuts FAQ latency while preserving analysis quality?",
    choices: [
      { id: "A", text: "Send FAQ requests without the thinking field, or with a small budget, and keep the large budget only for analysis requests." },
      { id: "B", text: "Lower temperature to 0 on every request so that the model reaches its answer in fewer steps." },
      { id: "C", text: "Set maxTokens to 8,000 on every request so it is lower than the thinking budget and caps the length of thinking." },
      { id: "D", text: "Set top_k to 1 in additionalModelRequestFields on every request so that the thinking stage becomes faster." }
    ],
    answer: ["A"],
    explanation: "Thinking tokens are generated before the visible answer, so a 16,000-token budget adds seconds of latency on requests that do not need deep reasoning. Model-specific controls such as the thinking block travel in additionalModelRequestFields, so the application can choose per request type: no thinking or a small budget for FAQs, and a large budget for analysis.",
    whyWrong: {
      B: "Temperature affects randomness, not how many reasoning tokens the model spends, so it does not shorten the thinking stage.",
      C: "The thinking budget must stay below maxTokens, so this setting would be rejected or break analysis requests, and it does not target FAQs.",
      D: "top_k limits sampling candidates and is not a latency lever for thinking length. It also reduces output variety."
    },
    services: ["Amazon Bedrock", "Converse API"],
    tags: ["extended-thinking", "thinking-budget", "additional-model-request-fields", "per-request-tuning"]
  },
  {
    id: "d4-4.2-13",
    domain: 4, task: "4.2", skills: ["4.2.5"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A ticketing platform will launch an AI summarizer to 50,000 users next month. Past launches hit Bedrock on-demand quota limits, and a quota increase request took several days. The team wants the MOST resilient approach to quota exhaustion. Which actions should they take? (Select TWO.)",
    choices: [
      { id: "A", text: "Create a CloudWatch alarm on the AWS/Bedrock InvocationThrottles metric with an SNS action to the on-call channel, and review it as part of launch readiness." },
      { id: "B", text: "Wait for the first ThrottlingException in production and then file the quota increase request through Service Quotas." },
      { id: "C", text: "Write a runbook and file the Service Quotas increase request for the projected peak requests per minute and tokens per minute well before launch." },
      { id: "D", text: "Create an AWS Budgets alert on monthly spend, because rising spend will reveal that the request quota has been reached." },
      { id: "E", text: "Turn on Auto Scaling for the on-demand model quota so that Bedrock raises the limit automatically as traffic grows." }
    ],
    answer: ["A", "C"],
    explanation: "Alarming on InvocationThrottles gives early, direct evidence that requests are being rejected, and a runbook says who acts and how. Because increases are not instant, requesting the projected peak request and token quotas ahead of the launch avoids user-visible throttling in the first place.",
    whyWrong: {
      B: "Quota increases can take days, so waiting for production errors guarantees an outage window.",
      D: "Spend can stay flat or even fall while throttling occurs, since rejected calls are not billed. Budgets cannot signal quota exhaustion.",
      E: "Bedrock on-demand quotas are not auto-scaled. Increases are requested through Service Quotas or AWS Support."
    },
    services: ["Service Quotas", "Amazon CloudWatch", "Amazon SNS", "Amazon Bedrock"],
    tags: ["quota-increase", "throttle-alarm", "launch-readiness", "runbook"]
  },
  {
    id: "d4-4.2-14",
    domain: 4, task: "4.2", skills: ["4.2.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A dashboard shows these averages from the AWS/Bedrock namespace for two streaming workloads that use the same model:\n`Summarize: InputTokenCount 18000, OutputTokenCount 300, TimeToFirstToken 5900 ms, InvocationLatency 6800 ms`\n`Draft:     InputTokenCount 600,   OutputTokenCount 1500, TimeToFirstToken 700 ms,  InvocationLatency 21000 ms`\nBoth workloads are reported as slow. Which interpretation and remedy are correct?",
    choices: [
      { id: "A", text: "Both are output-bound, so lowering the temperature and top_p for each workload will shorten the long generation phase and fix latency." },
      { id: "B", text: "Summarize is input-bound (87% of its latency precedes the first token), so trim the input. Draft is output-bound (about 20.3 s spent streaming 1,500 tokens), so shorten or split the output." },
      { id: "C", text: "Both are throttled, because latency above 5 seconds in either workload is the usual sign of a quota problem on the account." },
      { id: "D", text: "Summarize is output-bound and Draft is input-bound, because the larger token count in each row always dominates the latency." }
    ],
    answer: ["B"],
    explanation: "TimeToFirstToken captures the prefill phase, which grows with input size, while the time between first token and completion reflects generation of the output. Summarize spends 5,900 of 6,800 ms (about 87%) before the first token. Draft spends 21,000 - 700 = 20,300 ms generating 1,500 tokens, about 74 tokens per second. The remedies therefore differ.",
    whyWrong: {
      A: "Summarize has only 300 output tokens, and sampling parameters do not change input processing time or token counts.",
      C: "Throttling shows up in InvocationThrottles and error responses, not as latency alone, and the TTFT split already explains both rows.",
      D: "This reverses the roles. The input-heavy workload is prefill-bound, and the output-heavy workload is generation-bound."
    },
    services: ["Amazon CloudWatch", "Amazon Bedrock"],
    tags: ["time-to-first-token", "invocation-latency", "latency-profiling", "prefill-vs-generation"]
  },
  {
    id: "d4-4.3-07",
    domain: 4, task: "4.3", skills: ["4.3.1"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "After a marketing email drove a traffic spike, some users of a Bedrock-backed assistant receive ThrottlingException errors. The team's dashboard shows normal InvocationLatency and zero InvocationServerErrors. Which metric confirms the cause, and what does it point to?",
    choices: [
      { id: "A", text: "InvocationServerErrors rising, which points to an outage inside the Bedrock service that the team can only wait out." },
      { id: "B", text: "InvocationLatency p99 rising, which points to an undersized model that needs larger instances." },
      { id: "C", text: "InvocationThrottles rising, which points to exceeding a request or token quota, so add backoff and retries and raise the quota." },
      { id: "D", text: "OutputTokenCount rising, which points to prompts that are too long and must be shortened before any quota change." }
    ],
    answer: ["C"],
    explanation: "InvocationThrottles counts requests rejected for rate or quota reasons, so a spike matching the user-visible ThrottlingException confirms a capacity-limit cause. The response is client-side exponential backoff with jitter for bursts, plus a quota increase or additional capacity for sustained demand.",
    whyWrong: {
      A: "The stem says InvocationServerErrors is zero, and server errors are 5xx failures, not throttling rejections.",
      B: "Latency is normal, and on-demand Bedrock models do not use customer-sized instances.",
      D: "Output volume is a cost signal and does not explain rejections. Throttles come from quota limits."
    },
    services: ["Amazon CloudWatch", "Amazon Bedrock"],
    tags: ["invocation-throttles", "bedrock-runtime-metrics", "symptom-to-metric"]
  },
  {
    id: "d4-4.3-08",
    domain: 4, task: "4.3", skills: ["4.3.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "The on-call engineer for a Bedrock chatbot is paged three times in one incident. The team built this composite alarm rule:\n`ALARM(\"throttles-high\") AND (ALARM(\"latency-p99-high\") OR ALARM(\"server-errors-high\"))`\nThe composite alarm has an SNS action, but the three child alarms also each have the same SNS action, so the engineer still gets four notifications. Which change fixes the noise?",
    choices: [
      { id: "A", text: "Remove the SNS actions from the child alarms so that only the composite alarm notifies, and keep the rule as it is." },
      { id: "B", text: "Change AND to OR in the rule so the composite alarm fires on any child alarm and merges the notifications." },
      { id: "C", text: "Increase the evaluation periods on the composite alarm so that it needs a longer period of data before it sends its notification." },
      { id: "D", text: "Subscribe an AWS Chatbot channel to the child alarms' topic so that Slack groups the four messages into one thread." }
    ],
    answer: ["A"],
    explanation: "A composite alarm combines the states of child alarms into one state, and it only reduces noise if the children do not notify on their own. Child alarms should exist only to feed the rule, while the composite carries the single SNS action. The rule itself already expresses the intended combination of throttling plus latency or errors.",
    whyWrong: {
      B: "OR makes the composite fire on any single symptom, which increases pages and removes the correlation the rule provides.",
      C: "Composite alarms do not have their own evaluation periods. They evaluate the states of their children, and the children still notify anyway.",
      D: "Threading in Slack tidies the display, but the engineer is still notified four times for one incident."
    },
    services: ["Amazon CloudWatch", "Amazon SNS"],
    tags: ["composite-alarm", "alert-noise", "alarm-rule-expression", "child-alarm-actions"]
  },
  {
    id: "d4-4.3-09",
    domain: 4, task: "4.3", skills: ["4.3.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A platform team runs a Bedrock application in three AWS accounts. They want one dashboard that shows CloudWatch metrics, X-Ray traces and query results from an Amazon OpenSearch Service domain that stores application logs, with LEAST operational overhead. Which solution meets the need?",
    choices: [
      { id: "A", text: "Use Amazon Managed Grafana and add CloudWatch, X-Ray and OpenSearch Service as data sources to build combined dashboards." },
      { id: "B", text: "Use CloudWatch cross-account observability with a monitoring account, and add OpenSearch Service as a linked source." },
      { id: "C", text: "Build a dashboard in each account's CloudWatch console and have operators switch between them during incidents." },
      { id: "D", text: "Export all metrics and traces to Amazon S3 and build the combined dashboard in Amazon QuickSight with scheduled refresh." }
    ],
    answer: ["A"],
    explanation: "Managed Grafana is a managed service with data-source plugins for CloudWatch, X-Ray and OpenSearch, so panels from different backends sit on one dashboard. CloudWatch cross-account observability is excellent for sharing CloudWatch metrics, logs and traces between accounts, but it only handles CloudWatch-native signals.",
    whyWrong: {
      B: "Cross-account observability links accounts for CloudWatch data. An OpenSearch Service domain is not a linkable source type.",
      C: "This leaves no unified view and relies on operators switching consoles during an incident.",
      D: "Exports and scheduled refresh add pipelines to build and maintain, and the data is not near-real-time for operations."
    },
    services: ["Amazon Managed Grafana", "Amazon CloudWatch", "AWS X-Ray", "Amazon OpenSearch Service"],
    tags: ["managed-grafana", "unified-dashboard", "cross-account-observability", "multi-source-observability"]
  },
  {
    id: "d4-4.3-10",
    domain: 4, task: "4.3", skills: ["4.3.3"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A SaaS provider serves 3,000 end users through one Bedrock-backed API and must attribute token usage to individual users, then detect accounts that send abnormal volumes. The IAM role is shared by all users. Which approaches meet the need? (Select TWO.)",
    choices: [
      { id: "A", text: "Pass an opaque user ID in the Converse `requestMetadata` field on every call, with model invocation logging enabled so it is recorded." },
      { id: "B", text: "Aggregate token counts by the requestMetadata user key from the logs, and review users whose totals exceed a baseline." },
      { id: "C", text: "Embed the user ID in the prompt text and ask the model to report it back in every reply so that usage can be counted from outputs." },
      { id: "D", text: "Filter the AWS/Bedrock CloudWatch metrics by a UserId dimension, which Bedrock adds automatically when requestMetadata is supplied." },
      { id: "E", text: "Query AWS CloudTrail for InvokeModel events, because each event record contains the user and the token counts for the call." }
    ],
    answer: ["A", "B"],
    explanation: "requestMetadata attaches your own key-value pairs to a request, and they appear in the invocation logs next to the token usage of that call. Aggregating usage by the metadata key then yields per-user consumption and a baseline for spotting outliers. An opaque ID avoids placing personal data in logs.",
    whyWrong: {
      C: "Putting identifiers in the prompt wastes tokens, risks leaking them, and depends on the model echoing them correctly.",
      D: "The AWS/Bedrock metrics use dimensions such as model ID and do not turn requestMetadata into a per-user dimension.",
      E: "CloudTrail records that an API was called, but it does not include request or response token counts."
    },
    services: ["Amazon Bedrock", "Converse API", "Amazon CloudWatch Logs"],
    tags: ["request-metadata", "per-user-attribution", "abuse-detection", "invocation-logging"]
  },
  {
    id: "d4-4.3-11",
    domain: 4, task: "4.3", skills: ["4.3.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A Bedrock Agent calls three tools through an action-group Lambda function: `lookup_order`, `refund_payment` and `check_stock`. Some tool calls fail inside the function, which catches the exception and returns an error message to the agent, so the Lambda `Errors` metric stays at zero. The team wants per-tool latency and a failure-rate alarm. Which actions should they take? (Select TWO.)",
    choices: [
      { id: "A", text: "Emit EMF custom metrics ToolLatency, ToolCalls and ToolFailures from the function, with a ToolName dimension." },
      { id: "B", text: "Alarm on metric math 100 * ToolFailures / ToolCalls per ToolName, firing when the rate stays above a threshold." },
      { id: "C", text: "Alarm on the built-in Lambda `Errors` metric, because every failed tool call is counted as a function error by Lambda." },
      { id: "D", text: "Call PutMetricData synchronously before returning from each tool call, so that every metric is published right away." },
      { id: "E", text: "Alarm on the count of agent sessions, because a drop in sessions means that tools are failing." }
    ],
    answer: ["A", "B"],
    explanation: "Caught exceptions never reach the Lambda Errors metric, so the function must report its own outcome. Embedded metric format turns structured log lines into custom metrics without extra API calls in the request path, and a per-tool dimension separates the tools. A metric math rate alarm then catches elevated failure rates rather than raw counts.",
    whyWrong: {
      C: "Failures that the code catches and returns as a payload are invisible to this metric, which is the stated situation.",
      D: "This adds an API call and its latency to every tool invocation and can be throttled, whereas EMF writes metrics through the log stream.",
      E: "Session counts depend on user traffic and say nothing about which tool is failing or how often."
    },
    services: ["AWS Lambda", "Amazon CloudWatch", "Amazon Bedrock Agents"],
    tags: ["embedded-metric-format", "agent-tool-metrics", "metric-math-alarm", "action-group-lambda"]
  },
  {
    id: "d4-4.3-12",
    domain: 4, task: "4.3", skills: ["4.3.5"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A nightly Knowledge Base data source sync shows status COMPLETE, but users report that recent policy documents are missing from answers. An investigation finds that about 8% of the documents in the last runs failed to index. Which monitoring design would detect this next time?",
    choices: [
      { id: "A", text: "Alarm on ingestion jobs with status FAILED only, since a job that did not fail has indexed every document in the data source." },
      { id: "B", text: "Send S3 event notifications for each uploaded object to SNS, since a completed upload means that the document is now searchable." },
      { id: "C", text: "Alarm only on the health status of the OpenSearch Serverless collection, because document-level indexing failures always change that status." },
      { id: "D", text: "Trigger a check from an EventBridge rule on ingestion job state changes, reading job statistics and alerting when failed documents exceed zero." }
    ],
    answer: ["D"],
    explanation: "An ingestion job can finish as COMPLETE while individual documents fail, so the status alone hides partial failure. The job statistics returned for an ingestion job include counts of failed documents, and an event on each state change gives a hook to read them and notify the team.",
    whyWrong: {
      A: "Partial failures occur in jobs that end COMPLETE, which is exactly the situation described.",
      B: "An upload only proves that the file reached S3. It says nothing about whether ingestion chunked, embedded and indexed it.",
      C: "A healthy collection can still reject documents that fail parsing or embedding, so collection health misses these errors."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon EventBridge", "Amazon SNS"],
    tags: ["kb-ingestion-monitoring", "partial-ingestion-failure", "job-statistics", "eventbridge-rule"]
  },
  {
    id: "d4-4.3-13",
    domain: 4, task: "4.3", skills: ["4.3.6"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Users say a Bedrock-backed assistant sometimes stops in the middle of an answer. An engineer runs a Logs Insights query over the invocation logs to count the stop reasons and gets:\n`stopReason          count`\n`end_turn            9420`\n`max_tokens          1310`\n`guardrail_intervened  12`\nWhat does this show, and which response is best?",
    choices: [
      { id: "A", text: "About 12% of responses hit maxTokens and are cut off, so raise the limit or shorten answers, and alarm on this stop reason." },
      { id: "B", text: "About 12% of requests were throttled before completing, so request a higher quota and add retries with exponential backoff." },
      { id: "C", text: "About 12% of responses were blocked by a guardrail, so loosen the guardrail's topic policies to let more of them through." },
      { id: "D", text: "Most responses ended normally, so the count of 1,310 is an acceptable rate and needs no action or alerting." }
    ],
    answer: ["A"],
    explanation: "The counts total 10,742 and 1,310 of them (about 12.2%) ended with max_tokens, which means the model was cut off at the configured output limit. That matches the mid-sentence complaints. A CloudWatch Logs metric filter on this stop reason, with an alarm, makes silent truncation visible going forward.",
    whyWrong: {
      B: "Throttled calls are rejected before generation and do not appear as a stop reason on a completed response.",
      C: "Guardrail interventions are the 12 rows with guardrail_intervened, about 0.1%, and they are not the cause here.",
      D: "A 12% truncation rate is a user-visible quality defect, and without an alarm it stays silent."
    },
    services: ["Amazon CloudWatch Logs", "Amazon Bedrock"],
    tags: ["stop-reason", "max-tokens-truncation", "metric-filter", "response-quality-monitoring"]
  }
);
