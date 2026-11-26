window.QB = window.QB || [];
window.QB.push(
  {
    id: "d5-5.1-09",
    domain: 5, task: "5.1", skills: ["5.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A bank uses a Bedrock model to draft customer emails. Brand guidelines require every draft to follow a specific tone, formality level and terminology list. The team wants to score a fixed prompt dataset in Amazon S3 on this brand-voice consistency for each model or prompt change, without recruiting human reviewers. The built-in evaluation metrics do not cover brand voice. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Run an automatic model evaluation job with the built-in text generation task type and use the toxicity metric." },
      { id: "B", text: "Create a Bedrock model evaluation job that uses an evaluator model (LLM-as-a-judge) with a custom metric whose judge prompt describes the brand-voice rubric and a rating scale." },
      { id: "C", text: "Create a human-based evaluation job and ask a private work team to rate every draft for each change." },
      { id: "D", text: "Write a Lambda function that counts the words in each draft and compares the count with the average length of approved emails." }
    ],
    answer: ["B"],
    explanation: "Beyond built-in metrics, LLM-as-a-judge evaluation lets you define a custom metric with your own judge instructions and rating scale. The evaluator model then scores each response on the brand-voice rubric automatically, and the dataset and results stay in S3, so the same check can be rerun for every candidate.",
    whyWrong: {
      A: "Toxicity measures harmful content, not adherence to a brand's tone and terminology, so the score would not answer the question.",
      C: "A human evaluation job could assess tone, but the requirement is to avoid human reviewers, and it adds work-team coordination to every change.",
      D: "Word count is a crude proxy for length, not for tone, formality or terminology, and it needs custom code to maintain."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon S3"],
    tags: ["llm-as-judge", "custom-metrics", "output-quality", "consistency"]
  },
  {
    id: "d5-5.1-10",
    domain: 5, task: "5.1", skills: ["5.1.2"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A product team must pick one of four Bedrock foundation models for a high-volume FAQ assistant. Any model that meets the quality bar is acceptable, and the team wants the lowest cost per acceptable answer at an acceptable response time. Which combination of steps provides the data needed to choose? (Select TWO)",
    choices: [
      { id: "A", text: "Pick the model with the lowest published price per 1,000 input tokens, because cost is the main selection criterion." },
      { id: "B", text: "Run the same versioned prompt dataset against all four models with evaluation jobs and compare quality metrics against the defined quality bar." },
      { id: "C", text: "Pick the model with the largest context window and parameter count, because it will give the best quality-to-cost ratio." },
      { id: "D", text: "Record input and output token counts and latency for every evaluation request, convert them into cost per request, and compare cost and latency among the models that pass the quality bar." },
      { id: "E", text: "Compare the models only on a public leaderboard score for general knowledge benchmarks." }
    ],
    answer: ["B", "D"],
    explanation: "Multi-model evaluation needs the same inputs for every candidate so quality scores are comparable. Pairing those scores with measured token usage and latency lets the team compute cost per request and latency, then choose the cheapest model that still passes the quality bar. Prices alone ignore that models produce different amounts of output and quality.",
    whyWrong: {
      A: "Input token price ignores output token price, how many tokens each model actually produces, and whether answers meet the quality bar.",
      C: "A larger model usually costs more and responds more slowly. Nothing guarantees it is needed for simple FAQ answers.",
      E: "A general benchmark does not reflect the team's own FAQ content, and it gives no cost or latency measurements."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon Bedrock", "Amazon CloudWatch"],
    tags: ["multi-model-evaluation", "cost-performance", "token-efficiency", "latency"]
  },
  {
    id: "d5-5.1-11",
    domain: 5, task: "5.1", skills: ["5.1.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A team runs semantic search over an internal wiki using the Amazon Bedrock Retrieve API against a knowledge base. Before enabling a new reranking and metadata-filter configuration, they must prove that it returns the right passages in the top results and does not push retrieval latency beyond the application's budget. Which test approach is MOST appropriate?",
    choices: [
      { id: "A", text: "Ask a few engineers to try the new configuration for a day and report if the answers seem better." },
      { id: "B", text: "Compare the average length of the final answers generated before and after the change." },
      { id: "C", text: "Build a labeled query set that maps each query to its known relevant documents, run it against both configurations, calculate recall@k or precision@k (or MRR) for each, and publish the Retrieve call latency percentiles as CloudWatch metrics." },
      { id: "D", text: "Treat the relevance score returned for each result by the Retrieve API as ground truth and compare only the highest score in each configuration." }
    ],
    answer: ["C"],
    explanation: "Retrieval quality testing needs ground truth: queries with known relevant documents let you compute ranking metrics such as recall@k, precision@k or MRR for each configuration. Latency must be measured separately, preferably as percentiles (for example p95), because a better ranking that breaks the latency budget is not an improvement.",
    whyWrong: {
      A: "Informal impressions are not repeatable or quantitative, and they give no latency data.",
      B: "Answer length is a generation property and says nothing about whether the correct passages were retrieved.",
      D: "The returned score is the system's own estimate. Without labeled relevant documents, a high score does not prove a result is correct, and scores are not necessarily comparable between configurations."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon CloudWatch"],
    tags: ["retrieval-testing", "recall-at-k", "retrieval-latency", "ground-truth"]
  },
  {
    id: "d5-5.2-07",
    domain: 5, task: "5.2", skills: ["5.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer switches an application to a newly released Anthropic Claude model by changing the modelId in the Bedrock Converse call to the base model ID shown in the console. The model works in the console playground, but the API call fails every time with a ValidationException whose message says that invocation with on-demand throughput is not supported and to retry with the ID or ARN of an inference profile. IAM permissions and quotas are fine. What should the developer do?",
    choices: [
      { id: "A", text: "Wrap the call in exponential backoff with jitter, because ValidationException errors are transient." },
      { id: "B", text: "Add bedrock:InvokeModel permission for the base model to the application's IAM role." },
      { id: "C", text: "Request a quota increase for on-demand requests per minute for the model." },
      { id: "D", text: "Call the model with the ID or ARN of a system-defined inference profile that covers the model, and grant the role permission for that profile and the underlying models." }
    ],
    answer: ["D"],
    explanation: "Some models cannot be invoked on demand with the base model ID and must be invoked through an inference profile. The ValidationException message points to that request-shape problem. The fix is to pass the inference profile ID or ARN as modelId, and because the profile routes to models in one or more Regions, the IAM policy must allow the profile and the foundation models behind it.",
    whyWrong: {
      A: "ValidationException means the request is invalid and fails identically on every retry. Backoff is for transient errors such as ThrottlingException.",
      B: "A missing permission would produce an AccessDeniedException, not a ValidationException about throughput. The error message already identifies the cause.",
      C: "Nothing in the error indicates a quota problem. Quota exhaustion shows up as ThrottlingException, and a quota increase cannot change the required invocation mode."
    },
    services: ["Amazon Bedrock", "Converse API", "AWS IAM"],
    tags: ["validation-exception", "inference-profiles", "api-troubleshooting", "error-handling"]
  },
  {
    id: "d5-5.2-08",
    domain: 5, task: "5.2", skills: ["5.2.4", "5.1.6"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A support assistant uses a Bedrock knowledge base. Over six months the company launched products with new terminology, and users now report that relevant articles are increasingly missing from answers. Ingestion jobs succeed and no errors are logged. The team wants to detect this kind of retrieval degradation before users do and to remediate it when it happens. Which combination of actions meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Increase the temperature of the generation model so it can infer the missing article content." },
      { id: "B", text: "Run a retrieve-only evaluation on a schedule using a fixed, labeled query set that is refreshed with new terminology, publish context relevance as a CloudWatch metric, and alarm when it drops below a threshold." },
      { id: "C", text: "Stop all ingestion syncs so that the index stays unchanged." },
      { id: "D", text: "Increase maxTokens on the generation call so answers can include more articles." },
      { id: "E", text: "When the alarm fires, test alternative chunking or embedding model settings on a sample of the new content, then re-embed and re-sync the corpus using the best-performing configuration." }
    ],
    answer: ["B", "E"],
    explanation: "Silent retrieval drift will not show up as errors, so it must be monitored with a stable labeled query set and a retrieval-only metric on a schedule, with an alarm for regressions. Remediation means diagnosing whether chunking or the embedding model handles the new vocabulary poorly, then re-embedding and re-indexing the corpus consistently with the best configuration.",
    whyWrong: {
      A: "Temperature adds randomness to generation and cannot supply articles that retrieval never returned.",
      C: "Freezing the index makes the coverage problem worse, because new and updated content would never be searchable.",
      D: "maxTokens only limits the length of generated output. It does not change which passages are retrieved."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Bedrock Evaluations", "Amazon CloudWatch"],
    tags: ["retrieval-drift", "retrieve-only", "re-indexing", "embedding-quality", "monitoring"]
  },
  {
    id: "d5-5.2-09",
    domain: 5, task: "5.2", skills: ["5.2.5"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "After a prompt template refactor, a few customers receive replies such as \"Hello {{customer_name}}, your order {{order_id}}...\" and others receive answers that ignore the supplied order data. The team suspects that the rendered prompts sent to the model are sometimes missing variable values, but they cannot see what was actually sent. They want to confirm this and measure how often it happens. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Enable Amazon Bedrock model invocation logging with delivery to Amazon CloudWatch Logs, then use CloudWatch Logs Insights to find invocations whose input still contains unreplaced placeholder patterns and count them over time." },
      { id: "B", text: "Enable AWS CloudTrail data events and search them for the prompt text." },
      { id: "C", text: "Lower the temperature of the model so that it handles placeholders more consistently." },
      { id: "D", text: "Increase the Lambda function timeout so template rendering has more time to finish." }
    ],
    answer: ["A"],
    explanation: "Model invocation logging is disabled by default and, when enabled, records the request and response data for Bedrock invocations to CloudWatch Logs or S3. That shows the exact rendered prompt that reached the model. Logs Insights can then query for leftover placeholder patterns and chart how often it occurs, confirming a template-rendering defect.",
    whyWrong: {
      B: "CloudTrail records API activity metadata, not the prompt or response content, so the rendered prompts cannot be inspected there.",
      C: "Temperature affects sampling randomness. It does not fix a template that sends unrendered variables, and it hides the diagnosis.",
      D: "Rendering placeholders is not a timeout problem. Longer timeouts would not change the content of the prompt."
    },
    services: ["Amazon Bedrock", "Amazon CloudWatch Logs", "Amazon CloudWatch Logs Insights"],
    tags: ["invocation-logging", "prompt-templates", "logs-insights", "prompt-troubleshooting"]
  }
);
