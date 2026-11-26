window.QB = window.QB || [];
window.QB.push(
  {
    id: "d5-5.1-01",
    domain: 5, task: "5.1", skills: ["5.1.5"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A legal-tech company runs a RAG assistant on an Amazon Bedrock knowledge base. Reviewers report that some answers contain claims that do not appear in the retrieved contract excerpts. The team wants a repeatable, automated way to score every release candidate on how well answers are supported by the retrieved context, using a prompt dataset stored in Amazon S3. They want to avoid building custom scoring infrastructure. Which solution meets these requirements with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Run an automatic model evaluation job with the built-in summarization task type and use the ROUGE score as the quality metric." },
      { id: "B", text: "Create a human-based evaluation job and have a private work team rate each answer against the source documents for every release." },
      { id: "C", text: "Create a Bedrock RAG evaluation job (retrieve and generate) against the knowledge base that uses an evaluator model (LLM-as-a-judge) and the faithfulness metric." },
      { id: "D", text: "Add a Bedrock Guardrails contextual grounding check in front of the application and use the count of blocked responses as the release quality score." }
    ],
    answer: ["C"],
    explanation: "A RAG evaluation job of the retrieve-and-generate type runs the prompts through the knowledge base, then an evaluator model scores the outputs. The faithfulness metric measures whether the response is supported by the retrieved passages, which is exactly the hallucination concern. The dataset lives in S3 and results are written back to S3, so there is no custom infrastructure to run.",
    whyWrong: {
      A: "ROUGE measures n-gram overlap with a reference text. It does not check whether claims are supported by retrieved context, and it needs reference answers.",
      B: "Human evaluation can work but needs a work team, rating instructions and per-release turnaround time, which is much more operational overhead than an automated judge.",
      D: "A contextual grounding check is a runtime filter, not a release-scoring framework. Blocked-response counts do not give a repeatable score on a fixed dataset."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon Bedrock Knowledge Bases", "Amazon S3"],
    tags: ["rag-evaluation", "llm-as-judge", "faithfulness"]
  },
  {
    id: "d5-5.1-02",
    domain: 5, task: "5.1", skills: ["5.1.6"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A team is deciding between two chunking configurations for a Bedrock knowledge base (fixed-size 300 tokens versus hierarchical chunking). Final answer quality is similar in spot checks, but the team suspects one configuration retrieves noticeably better passages. They want to isolate retrieval quality from the influence of the generator model, using the same labeled question set and scoring context relevance and context coverage. Which approach should they use?",
    choices: [
      { id: "A", text: "Run a retrieve-and-generate RAG evaluation job for each knowledge base and compare the correctness scores." },
      { id: "B", text: "Run a retrieve-only RAG evaluation job against each knowledge base using the same dataset, and compare context relevance and context coverage." },
      { id: "C", text: "Compare the average Retrieve API latency in Amazon CloudWatch for the two knowledge bases." },
      { id: "D", text: "Run an automatic model evaluation job that uses the accuracy metric on a question-answering task for each configuration." }
    ],
    answer: ["B"],
    explanation: "A retrieve-only RAG evaluation job evaluates just the retrieval component, so the generator cannot hide or compensate for poor passages. Context relevance and context coverage (the latter requires ground-truth answers in the dataset) score the retrieved chunks directly, giving a clean A/B comparison of the two chunking strategies.",
    whyWrong: {
      A: "Correctness is an end-to-end generation metric. A strong generator can mask weak retrieval, which is exactly what the team is trying to avoid.",
      C: "Latency tells you about speed, not whether the retrieved passages are relevant or complete.",
      D: "Automatic model evaluation scores a model on a dataset, not a knowledge base retrieval component."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon Bedrock Knowledge Bases"],
    tags: ["retrieve-only", "context-relevance", "context-coverage", "chunking"]
  },
  {
    id: "d5-5.1-03",
    domain: 5, task: "5.1", skills: ["5.1.4", "5.1.2"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A company deploys prompt and model changes for a customer-support assistant through AWS CodePipeline. Two recent changes silently reduced answer quality and were found only after customer complaints. The team wants an automated quality gate that blocks a deployment when quality regresses. Which combination of actions will meet this requirement? (Select TWO)",
    choices: [
      { id: "A", text: "Maintain a versioned golden dataset of representative prompts with reference answers in Amazon S3, and use the same dataset for every candidate." },
      { id: "B", text: "Add a manual approval stage in which an engineer reads a few random chat transcripts before each release." },
      { id: "C", text: "Replace the evaluation dataset with a fresh random sample of production prompts for every run so the test data stays current." },
      { id: "D", text: "Add a pipeline stage that starts a Bedrock evaluation job on the candidate, compares the resulting metrics with the stored baseline thresholds, and fails the stage if they fall below them." },
      { id: "E", text: "Gate deployments only on average invocation latency and error rate from Amazon CloudWatch." }
    ],
    answer: ["A", "D"],
    explanation: "Regression testing requires a stable, versioned golden dataset so that scores from different candidates are comparable, plus an automated step that runs an evaluation and enforces thresholds. Together they turn quality into a pass/fail gate in the pipeline.",
    whyWrong: {
      B: "A few random transcripts is a small, subjective sample and not an automated or repeatable gate.",
      C: "A different dataset each run makes scores incomparable, so you cannot tell whether a change in score is a regression or a data difference.",
      E: "Latency and error rate say nothing about answer quality, which is where the regressions occurred."
    },
    services: ["AWS CodePipeline", "Amazon Bedrock Evaluations", "Amazon S3"],
    tags: ["regression-testing", "quality-gate", "golden-dataset", "ci-cd"]
  },
  {
    id: "d5-5.1-04",
    domain: 5, task: "5.1", skills: ["5.1.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A retailer wants to validate a newer foundation model for its production shopping assistant. Offline tests pass, but the team wants to measure real-user outcomes such as thumbs-up rate, latency and cost per conversation before full rollout. They need to send about 5% of live traffic to the new model, adjust the percentage without redeploying, and instantly revert if metrics degrade. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Create a Route 53 weighted routing policy with two records that point to the Amazon Bedrock runtime endpoints for each model." },
      { id: "B", text: "Replace the model ID in the application, deploy to all users, and monitor complaints for a week." },
      { id: "C", text: "Use an AWS AppConfig feature flag that holds the traffic percentage and model ID, have the application choose the model per request based on it, and publish per-variant metrics to Amazon CloudWatch." },
      { id: "D", text: "Enable a cross-Region inference profile so Amazon Bedrock automatically splits traffic between the two models." }
    ],
    answer: ["C"],
    explanation: "A/B or canary testing of models is done in the application layer: a dynamically configurable flag (AWS AppConfig) controls the split and can be changed or rolled back without a deployment, and tagging metrics by variant lets you compare user feedback, latency and token cost in CloudWatch.",
    whyWrong: {
      A: "DNS weighting does not apply here: the application calls the Bedrock API by model ID, and the model is chosen in the request, not by hostname.",
      B: "This is a full rollout with no controlled comparison and no fast, metric-driven rollback.",
      D: "Cross-Region inference profiles route a single model's requests across Regions for capacity. They do not split traffic between different models."
    },
    services: ["AWS AppConfig", "Amazon CloudWatch", "Amazon Bedrock"],
    tags: ["canary-testing", "ab-testing", "feature-flags", "model-rollout"]
  },
  {
    id: "d5-5.1-05",
    domain: 5, task: "5.1", skills: ["5.1.3"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A bank has launched a customer-facing GenAI assistant and wants a continuous improvement loop driven by user experience. The team needs to know which prompt version and model produced each poorly rated response, and it wants experts to review a sample of those responses to build better evaluation data. Which combination of steps meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Show thumbs-up/down controls in the UI and store each rating with the request ID, model ID and prompt version in Amazon DynamoDB." },
      { id: "B", text: "Collect ratings as anonymous free text in a shared spreadsheet and review it quarterly." },
      { id: "C", text: "Automatically fine-tune the model nightly on every response that received a thumbs-up." },
      { id: "D", text: "Route a sample of low-rated responses to an annotation or human-review workflow, such as a Bedrock human-based evaluation job with a private work team, to label quality." },
      { id: "E", text: "Disable user feedback and rely on offline ROUGE scores to measure user satisfaction." }
    ],
    answer: ["A", "D"],
    explanation: "Linking each rating to the request, model and prompt version makes feedback actionable and lets you slice quality by configuration. Sending a sample of poor responses to human reviewers produces trustworthy labels that can seed golden datasets and evaluation rubrics.",
    whyWrong: {
      B: "Unlinked free text cannot be traced back to a prompt version or model, and a quarterly review is too slow for continuous improvement.",
      C: "Auto-training on unreviewed positives risks reinforcing bias and errors and has no quality gate. It also is costly and not what the requirement asked for.",
      E: "ROUGE measures text overlap with references, not user satisfaction, and removing feedback eliminates the signal the team wants."
    },
    services: ["Amazon DynamoDB", "Amazon Bedrock Evaluations"],
    tags: ["user-feedback", "human-evaluation", "annotation", "continuous-improvement"]
  },
  {
    id: "d5-5.1-06",
    domain: 5, task: "5.1", skills: ["5.1.7"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An insurer built an Amazon Bedrock agent that calls three action group Lambda functions to look up policies, check claims and open tickets. Users report that the agent sometimes finishes without opening a ticket or calls the wrong function first. The team wants to measure task completion rate and tool-selection correctness across a set of scripted scenarios. Which approach provides the needed data?",
    choices: [
      { id: "A", text: "Invoke the agent with a test scenario set and enableTrace turned on, then analyze the trace events to compare the tools actually invoked and their order with the expected tool calls for each scenario." },
      { id: "B", text: "Compare only the final text answer of each scenario with a reference answer by using the ROUGE metric." },
      { id: "C", text: "Review the CPU utilization and duration metrics of the three Lambda functions in Amazon CloudWatch." },
      { id: "D", text: "Attach a Bedrock guardrail to the agent and count how many responses are blocked." }
    ],
    answer: ["A"],
    explanation: "The agent trace exposes the orchestration steps, including the rationale and each action group invocation with its parameters. Comparing these against the expected tool sequence for each scripted scenario lets you compute task completion rate and tool-usage effectiveness, and also assess reasoning quality in multi-step flows.",
    whyWrong: {
      B: "The final text can look fine even when the wrong tool was called or a required step was skipped, so it cannot measure tool selection.",
      C: "Lambda resource metrics show infrastructure health, not whether the agent chose the right function or completed the task.",
      D: "Guardrails filter content. A blocked-response count says nothing about task completion or tool correctness."
    },
    services: ["Agents for Amazon Bedrock", "AWS Lambda"],
    tags: ["agent-evaluation", "agent-trace", "tool-usage", "task-completion"]
  },
  {
    id: "d5-5.1-07",
    domain: 5, task: "5.1", skills: ["5.1.9"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company plans to move a production summarization API to a newer model version. HTTP health checks have always passed in past upgrades, yet users noticed changes in tone and occasional missing fields in the JSON output. The team wants continuous validation after each deployment that checks response consistency and flags semantic drift against a known-good baseline, with alarms, without waiting for user complaints. Which solution is MOST suitable?",
    choices: [
      { id: "A", text: "Rely on the load balancer health check and alarm on 5xx error counts." },
      { id: "B", text: "Run Amazon CloudWatch Synthetics canaries that call the API on a schedule with fixed prompts, validate the JSON schema, score similarity with stored baseline responses, and publish the results as metrics with alarms." },
      { id: "C", text: "Enable AWS CloudTrail on the account and review Bedrock InvokeModel events weekly." },
      { id: "D", text: "Increase the model temperature to zero and assume outputs will be identical across versions." }
    ],
    answer: ["B"],
    explanation: "Synthetic workflows with fixed prompts act as a continuous post-deployment test. Validating schema catches structural regressions, and comparing against baseline outputs (for example embedding similarity or a judge score) detects semantic drift. Emitting metrics lets CloudWatch alarms notify the team quickly.",
    whyWrong: {
      A: "Health checks and 5xx counts only prove the service responds. The issues here are valid-looking HTTP 200 responses with degraded content.",
      C: "CloudTrail records API calls, not prompt or response content, and a weekly manual review is neither automated nor timely.",
      D: "Temperature zero reduces randomness within one model but does not make different model versions produce the same output, and it validates nothing."
    },
    services: ["Amazon CloudWatch Synthetics", "Amazon CloudWatch", "Amazon Bedrock"],
    tags: ["deployment-validation", "synthetic-monitoring", "semantic-drift", "schema-validation"]
  },
  {
    id: "d5-5.1-08",
    domain: 5, task: "5.1", skills: ["5.1.8"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A GenAI platform team runs weekly Bedrock evaluation jobs for three candidate models. Executives want a self-service dashboard that shows quality scores, cost per request and trends over time, with no one assembling reports by hand. Evaluation results are written to Amazon S3. Which solution provides this with the LEAST manual effort?",
    choices: [
      { id: "A", text: "Download the result files each week and copy the scores into a shared spreadsheet." },
      { id: "B", text: "Send the raw result JSON files by email to stakeholders through Amazon SES." },
      { id: "C", text: "Catalog the result data in AWS Glue, query it with Amazon Athena, and publish an Amazon QuickSight dashboard that refreshes on a schedule." },
      { id: "D", text: "Store the results in Amazon RDS and have each stakeholder run SQL queries in a client tool." }
    ],
    answer: ["C"],
    explanation: "Evaluation outputs in S3 can be cataloged and queried in place with Athena, and QuickSight turns them into scheduled, shareable visualizations such as model comparison charts and trend lines. This is automated and serverless, which fits stakeholder reporting.",
    whyWrong: {
      A: "Manual copying is exactly the hand-assembled reporting the team wants to eliminate.",
      B: "Raw JSON is not an understandable report for executives and offers no trends or comparison visuals.",
      D: "This adds a database to manage and expects non-technical stakeholders to write SQL."
    },
    services: ["Amazon S3", "AWS Glue", "Amazon Athena", "Amazon QuickSight"],
    tags: ["reporting", "dashboards", "model-comparison", "stakeholder-reporting"]
  },
  {
    id: "d5-5.2-01",
    domain: 5, task: "5.2", skills: ["5.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A document-analysis service calls the Amazon Bedrock Converse API with full contracts. Short contracts work, but requests for very long ones consistently fail with a ValidationException stating that the input is too long. Retrying does not help, and the application already sets a large maxTokens value. The team needs a fix that lets the service process contracts of any length. What should they do?",
    choices: [
      { id: "A", text: "Add exponential backoff with jitter and retry the same request." },
      { id: "B", text: "Increase the maxTokens inference parameter so the model can accept more input." },
      { id: "C", text: "Request a service quota increase for the model's context window." },
      { id: "D", text: "Count tokens before the call and, when the document exceeds the model's context window, split it into chunks, process each chunk, and combine the partial results in a final summarization step." }
    ],
    answer: ["D"],
    explanation: "The model's context window is a fixed per-model limit covering input plus output. A consistent ValidationException for oversized input is a deterministic error, so the application must reduce what it sends, for example with token pre-checks and map-reduce style chunking.",
    whyWrong: {
      A: "Backoff and retry address transient errors such as throttling. An oversized input fails identically every time.",
      B: "maxTokens limits the length of the generated output. It does not raise the amount of input the model accepts and a large value consumes more of the window.",
      C: "The context window is a property of the model, not a quota you can raise through Service Quotas."
    },
    services: ["Amazon Bedrock", "Converse API"],
    tags: ["context-window", "validation-exception", "chunking", "map-reduce"]
  },
  {
    id: "d5-5.2-02",
    domain: 5, task: "5.2", skills: ["5.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A Python service uses boto3 with default client settings to call a Bedrock model through InvokeModel to generate long reports. Generations that take more than about a minute fail on the client side with a ReadTimeoutError, while the same prompts succeed in the Bedrock console. Bedrock service metrics show no throttling. What is the MOST appropriate fix?",
    choices: [
      { id: "A", text: "Configure the bedrock-runtime client with a larger read_timeout in botocore Config and, where possible, use response streaming so output starts arriving immediately." },
      { id: "B", text: "Switch the retry mode to adaptive so throttled requests are retried more efficiently." },
      { id: "C", text: "Lower the model temperature so the model generates faster." },
      { id: "D", text: "Move the service to another AWS Region that has more capacity." }
    ],
    answer: ["A"],
    explanation: "boto3's default read timeout is 60 seconds, so a long non-streaming generation can exceed it even though the model is still working. Raising read_timeout in the client Config, and using streaming (InvokeModelWithResponseStream or ConverseStream) so data flows as it is produced, resolves the client-side timeout.",
    whyWrong: {
      B: "Adaptive retries target throttling. The metrics show no throttling, and retrying a request that times out at the same limit will fail again.",
      C: "Temperature changes sampling randomness, not generation speed, and would not fix a client timeout.",
      D: "The failure is a client-side socket timeout, not a capacity problem in the Region."
    },
    services: ["Amazon Bedrock", "AWS SDK for Python (boto3)"],
    tags: ["timeout", "boto3", "streaming", "api-troubleshooting"]
  },
  {
    id: "d5-5.2-03",
    domain: 5, task: "5.2", skills: ["5.2.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A team migrated query-time embedding in their semantic search service to a different embedding model that also produces 1024-dimension vectors. They did not re-index the existing documents, which were embedded with the previous model. No errors are logged, but search results are now mostly irrelevant. Which combination of actions will fix the problem and prevent it from recurring? (Select TWO)",
    choices: [
      { id: "A", text: "Re-embed the whole corpus with the new model and rebuild the vector index." },
      { id: "B", text: "Increase the number of results returned per query from 5 to 50." },
      { id: "C", text: "Store the embedding model ID in a single shared configuration used by both the ingestion pipeline and the query path, and record it with the index." },
      { id: "D", text: "Change the vector index distance metric from cosine to Euclidean." },
      { id: "E", text: "Add a larger foundation model to the generation step." }
    ],
    answer: ["A", "C"],
    explanation: "Vectors from different embedding models live in different spaces, even when their dimensions match, so similarity scores between them are meaningless and no dimension-mismatch error is raised. The corpus must be re-embedded with the same model as queries, and a single source of truth for the model ID prevents ingestion and query from diverging again.",
    whyWrong: {
      B: "Returning more results from a mismatched vector space only returns more irrelevant items.",
      D: "The distance metric is not the cause. Changing it cannot make vectors from two different models comparable.",
      E: "A stronger generator cannot recover documents that retrieval never found. The defect is in retrieval."
    },
    services: ["Amazon Bedrock", "Amazon OpenSearch Service", "Amazon Titan Text Embeddings"],
    tags: ["embedding-mismatch", "re-indexing", "vector-search", "retrieval-troubleshooting"]
  },
  {
    id: "d5-5.2-04",
    domain: 5, task: "5.2", skills: ["5.2.4", "5.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A Bedrock knowledge base indexes long technical manuals using fixed-size chunks of 100 tokens. Retrieval finds the right sections, but answers are often incomplete because the retrieved chunks contain sentence fragments without the surrounding explanation. The team wants precise matching and also enough surrounding context for the model, with minimal custom code. What should they do?",
    choices: [
      { id: "A", text: "Reconfigure the data source to use hierarchical chunking with small child chunks for matching and larger parent chunks returned as context, then re-sync." },
      { id: "B", text: "Increase the temperature of the generation model so it fills in missing details." },
      { id: "C", text: "Switch to a larger embedding vector dimension while keeping the 100-token chunks." },
      { id: "D", text: "Disable chunking so each manual is embedded as a single vector." }
    ],
    answer: ["A"],
    explanation: "Hierarchical chunking embeds small child chunks for precise retrieval but returns their larger parent chunk, which supplies surrounding context to the model. It is a built-in knowledge base chunking option, so it fixes fragmentary context without custom code.",
    whyWrong: {
      B: "Higher temperature increases randomness and hallucination risk. It does not supply the missing source text.",
      C: "A bigger vector dimension does not change what text a chunk contains, so fragments stay fragments.",
      D: "Whole-manual embeddings dilute meaning, can exceed the embedding model's input limit, and would flood the generator's context window."
    },
    services: ["Amazon Bedrock Knowledge Bases"],
    tags: ["chunking", "hierarchical-chunking", "retrieval-troubleshooting"]
  },
  {
    id: "d5-5.2-05",
    domain: 5, task: "5.2", skills: ["5.2.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Several engineers edit the system prompt of a production assistant. After a recent edit, answer quality dropped, but nobody can say what the prompt looked like before, and the prompt text is embedded in application code. The team wants to compare prompt revisions against the same test inputs and be able to roll back immediately. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Keep a comment in the code that notes the date of each prompt change." },
      { id: "B", text: "Store the prompt in Amazon Bedrock Prompt Management, create a new immutable version for each approved change, test versions on the same inputs, and have the application reference a specific version." },
      { id: "C", text: "Always edit the working draft of the prompt in place and ask engineers to remember the previous wording." },
      { id: "D", text: "Lower the temperature so that prompt edits have less effect on output." }
    ],
    answer: ["B"],
    explanation: "Prompt Management supports creating versions, which are fixed snapshots of a prompt. Referencing a specific version in the application means a regression can be rolled back by pointing back to the earlier version, and versions can be compared side by side on identical test inputs.",
    whyWrong: {
      A: "Comments record dates but not the prompt text, and code-embedded prompts still require a redeploy to roll back.",
      C: "Editing the draft in place destroys the history that the team needs for comparison and rollback.",
      D: "Temperature does not provide versioning or comparison, and it would only mask differences."
    },
    services: ["Amazon Bedrock Prompt Management"],
    tags: ["prompt-versioning", "rollback", "prompt-testing"]
  },
  {
    id: "d5-5.2-06",
    domain: 5, task: "5.2", skills: ["5.2.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A Lambda-based GenAI workflow retrieves documents, builds a prompt from templates and invokes a Bedrock model that must return JSON. About 3% of responses are malformed and break a downstream parser. The team needs to find out how often it happens per prompt template version and which step in the workflow is responsible. Which combination of actions will provide this visibility? (Select TWO)",
    choices: [
      { id: "A", text: "Validate every model response against a JSON Schema in the application, and write a structured log entry with the prompt version and validation result that can be analyzed with CloudWatch Logs Insights." },
      { id: "B", text: "Turn on AWS CloudTrail management events and read the prompt text from the InvokeModel records." },
      { id: "C", text: "Instrument the workflow with AWS X-Ray, using subsegments for retrieval, prompt construction and model invocation, and annotate traces with the prompt version." },
      { id: "D", text: "Increase the Lambda function memory so the model produces better JSON." },
      { id: "E", text: "Raise the model temperature to improve output variety." }
    ],
    answer: ["A", "C"],
    explanation: "Schema validation detects format inconsistencies, and structured logs let Logs Insights group failure rates by prompt version. X-Ray traces with subsegments and annotations show latency and errors per step and let you filter traces by prompt version, making the prompt pipeline observable.",
    whyWrong: {
      B: "CloudTrail records API activity metadata and does not capture prompt or response content, so it cannot show why output was malformed.",
      D: "Lambda memory affects compute resources, not the structure of model output.",
      E: "Higher temperature increases variability and typically makes format errors more likely."
    },
    services: ["Amazon CloudWatch Logs Insights", "AWS X-Ray", "AWS Lambda", "Amazon Bedrock"],
    tags: ["schema-validation", "prompt-observability", "logs-insights", "x-ray"]
  }
);
