window.QB = window.QB || [];
window.QB.push(
  {
    id: "d5-5.1-12",
    domain: 5, task: "5.1", skills: ["5.1.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A media company is evaluating two Bedrock models that summarise news articles. The team has a dataset of articles paired with human-written reference summaries and wants automatic scores for summary quality against those references. Which metrics are appropriate for this task? (Select TWO)",
    choices: [
      { id: "A", text: "ROUGE, which measures n-gram and sequence overlap between each generated summary and its reference summary." },
      { id: "B", text: "Classification accuracy, which counts how often the generated label equals the expected label in the dataset." },
      { id: "C", text: "BERTScore, which compares contextual embeddings of the generated and reference summaries to capture semantic similarity." },
      { id: "D", text: "Exact match, which counts a summary as correct only when it is character-for-character identical to the reference." },
      { id: "E", text: "Time to first token, which measures how quickly each model begins streaming the summary to the client." }
    ],
    answer: ["A", "C"],
    explanation: "Summarisation has no single correct string, so quality is scored by similarity to reference summaries. ROUGE captures lexical overlap and BERTScore captures semantic similarity, and together they cover paraphrased summaries that overlap poorly in wording. Label-based and exact-match metrics suit classification and short factual answers.",
    whyWrong: {
      B: "Classification accuracy applies to tasks that output a label from a fixed set, which a free-text summary is not.",
      D: "Exact match would mark almost every valid summary wrong because two good summaries rarely match character for character.",
      E: "Time to first token is a latency measurement and says nothing about whether the summary is faithful or complete."
    },
    services: ["Amazon Bedrock Evaluations"],
    tags: ["rouge", "bertscore", "summarization-metrics", "metric-selection"]
  },
  {
    id: "d5-5.1-13",
    domain: 5, task: "5.1", skills: ["5.1.1"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "A law firm uses a Bedrock model to draft client-facing explanations of contract clauses. Partners say the tone and the sense of 'would I send this to a client' cannot be reduced to a numeric score by an algorithm. The firm wants a repeatable way to collect partner judgments on a fixed set of prompts for two candidate models. Which approach BEST meets this need?",
    choices: [
      { id: "A", text: "Create a Bedrock human-based evaluation job that routes the prompt dataset and model responses to the firm's own work team for rating." },
      { id: "B", text: "Create an automatic evaluation job with the built-in text generation task type and read the robustness metric for each model." },
      { id: "C", text: "Create an automatic evaluation job that reports BERTScore against a single reference explanation written by one associate." },
      { id: "D", text: "Create a Lambda function that sends a thumbs-up survey email to partners after each production invocation of either model." }
    ],
    answer: ["A"],
    explanation: "A human-based Bedrock evaluation job lets you bring your own work team to rate responses on criteria such as helpfulness, tone or custom rating methods. This suits subjective quality that automatic metrics cannot judge. The dataset and results are managed in the job, so the review is repeatable for each candidate.",
    whyWrong: {
      B: "Robustness measures sensitivity to small input perturbations, not whether a partner would approve the tone of an explanation.",
      C: "BERTScore against one reference rewards similarity to one associate's wording and does not capture partner judgment of tone.",
      D: "A production survey is unstructured, unrepeatable on a fixed dataset and exposes clients to unreviewed output from both models."
    },
    services: ["Amazon Bedrock Evaluations"],
    tags: ["human-evaluation", "work-team", "subjective-quality"]
  },
  {
    id: "d5-5.1-14",
    domain: 5, task: "5.1", skills: ["5.1.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Your team hosts a fine-tuned open-weight model on a SageMaker endpoint and also uses Bedrock models for other features. You want to score the SageMaker model's answers with the same Bedrock evaluation job type and metrics that you use for the Bedrock models, so the results are directly comparable. What should you do?",
    choices: [
      { id: "A", text: "Register the SageMaker endpoint as a custom model in Bedrock Model access and select it as the model under evaluation." },
      { id: "B", text: "Copy the SageMaker model weights into S3 and ask Bedrock to load them for the evaluation job with the same dataset." },
      { id: "C", text: "Generate the SageMaker responses yourself, add them to the JSONL prompt dataset as inference responses, and run an evaluation job with the bring-your-own-responses option." },
      { id: "D", text: "Export the endpoint's CloudWatch invocation metrics and compare them with the Bedrock job results in a dashboard." }
    ],
    answer: ["C"],
    explanation: "Bedrock evaluation jobs can score responses that were produced outside Bedrock. You run your model on the prompt dataset, include the generated responses and a source identifier in the JSONL records, and the job applies the same metrics or judge to them. That keeps the scoring method identical across hosting platforms.",
    whyWrong: {
      A: "Model access enables Bedrock-hosted foundation models; a SageMaker endpoint cannot be registered there as the model under evaluation.",
      B: "Bedrock evaluation jobs do not load arbitrary weights from S3 for inference, so the job could not generate responses this way.",
      D: "Endpoint metrics describe latency and invocation counts, which are operational and not quality scores comparable with evaluation metrics."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon SageMaker AI", "Amazon S3"],
    tags: ["bring-your-own-inference", "sagemaker", "model-comparison"]
  },
  {
    id: "d5-5.1-15",
    domain: 5, task: "5.1", skills: ["5.1.3"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "An HR assistant built on Bedrock Knowledge Bases (RetrieveAndGenerate) shows a thumbs-up or thumbs-down control on each answer. Thumbs-down rates are rising, but the team cannot tell whether the cause is the model or particular outdated policy documents. Which combination of changes lets the team find the problem source documents? (Select TWO)",
    choices: [
      { id: "A", text: "Store the answer's citations, including each retrieved reference's S3 URI, with the feedback record and the session identifier." },
      { id: "B", text: "Store only the user's question text with the feedback and re-run it each week to check whether the answer changed." },
      { id: "C", text: "Aggregate thumbs-down counts by cited source document and review or update the documents with the highest negative-feedback share." },
      { id: "D", text: "Raise the model temperature so that answers vary between attempts and users give the feedback more than once." },
      { id: "E", text: "Aggregate thumbs-down counts by user department and ask each department head to review the policy text." }
    ],
    answer: ["A", "C"],
    explanation: "Feedback only becomes actionable at the document level when each rating is joined to the sources behind that answer. Keeping the citation S3 URIs with each rating and grouping negative feedback by source reveals which documents repeatedly appear in bad answers. Those can then be corrected, retired or re-chunked.",
    whyWrong: {
      B: "The question text alone does not record which passages were retrieved, so a later re-run may use different sources than the rated answer.",
      D: "Higher temperature adds randomness and noise to the feedback signal without telling you which source caused the problem.",
      E: "Grouping by department identifies who is unhappy, not which documents are wrong, and the same document can serve many departments."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon S3", "Amazon DynamoDB"],
    tags: ["user-feedback", "citations", "source-quality", "feedback-loop"]
  },
  {
    id: "d5-5.1-16",
    domain: 5, task: "5.1", skills: ["5.1.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A retail platform serves about 2 million Bedrock requests per day and has model invocation logging enabled to Amazon S3. The team wants continuous quality monitoring of live traffic using a judge model, but must not add latency to user requests and does not want to pay to judge every request. Which design meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Call the judge model inside the request handler for every response, and return the answer to the user after the score is saved." },
      { id: "B", text: "Run a scheduled job that samples around 1 percent of the logged invocations from S3 and sends the prompt and response pairs to a judge model." },
      { id: "C", text: "Create a new Bedrock model evaluation job for each individual production request so that every answer receives a managed score." },
      { id: "D", text: "Write each judge score to CloudWatch as a custom metric and alarm when the rolling average falls below an agreed threshold." },
      { id: "E", text: "Sample 1 percent of requests in the handler and call the judge inline, but only for requests whose response is longer than 500 tokens." }
    ],
    answer: ["B", "D"],
    explanation: "Online evaluation should be decoupled from the request path: sample logged prompt and response pairs, score them asynchronously with a judge, and publish the scores. A sampled batch controls judge cost, and a CloudWatch metric with an alarm turns the scores into an actionable quality signal.",
    whyWrong: {
      A: "Judging every response inline adds a second model call to user latency and pays for a judge call on all 2 million requests.",
      C: "Evaluation jobs are batch jobs over a dataset, not a per-request mechanism, and creating one per request would be slow and costly.",
      E: "Sampling is correct, but calling the judge inline still adds latency to those requests and the length filter biases the sample towards long answers."
    },
    services: ["Amazon Bedrock", "Amazon S3", "Amazon CloudWatch", "Amazon EventBridge"],
    tags: ["online-evaluation", "sampling", "asynchronous-scoring", "invocation-logs"]
  },
  {
    id: "d5-5.1-17",
    domain: 5, task: "5.1", skills: ["5.1.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A team uses the same Bedrock model to generate customer-support replies and to judge them. Judge scores are consistently high, longer replies score higher than shorter ones with the same facts, and agents report that low-scored replies are often the better ones. Which actions reduce judge bias and make the scores trustworthy? (Select TWO)",
    choices: [
      { id: "A", text: "Switch to a different or stronger judge model, and include in the rubric an instruction that length must not influence the score." },
      { id: "B", text: "Keep the same model as the judge because it understands its own output style best and so gives the fairest scores." },
      { id: "C", text: "Have agents label a sample of replies, compare the judge scores against those labels and refine the rubric until agreement is acceptable." },
      { id: "D", text: "Increase the judge's temperature so that repeated scoring of the same reply averages out any systematic preference." },
      { id: "E", text: "Raise the maximum output tokens for the judge so that it writes longer reasoning before producing the numeric score." }
    ],
    answer: ["A", "C"],
    explanation: "Judges tend to favour their own style (self-preference) and longer answers (verbosity bias). Using a different or stronger judge and an explicit rubric reduces both. Calibrating the judge against human labels on a sample then verifies that the scores track what people consider good.",
    whyWrong: {
      B: "A model judging its own output is exactly the self-preference setup that inflates scores, so it makes the bias worse.",
      D: "Temperature adds variance but does not remove a systematic bias, and averaging many biased scores still gives a biased result.",
      E: "Longer reasoning does not correct a self-preference or length bias and increases judge cost and latency."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon Bedrock"],
    tags: ["judge-bias", "self-preference", "verbosity-bias", "human-calibration"]
  },
  {
    id: "d5-5.1-18",
    domain: 5, task: "5.1", skills: ["5.1.5"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A RAG evaluation job on a Bedrock Knowledge Base returned these aggregate results:\n\nMetric                 Score\nCorrectness            0.86\nCompleteness           0.83\nCitation coverage      0.94\nCitation precision     0.41\n\nReviewers say answers are accurate and well cited, but many cited passages do not actually support the sentence they are attached to. Which interpretation and next step is correct?",
    choices: [
      { id: "A", text: "Citation coverage is too low; add more documents to the knowledge base so that each statement receives a citation." },
      { id: "B", text: "Correctness is the weak metric; switch to a larger generation model so that the answers become more accurate." },
      { id: "C", text: "Completeness is the weak metric; increase the maximum output tokens so that answers include more of the retrieved facts." },
      { id: "D", text: "Citation precision is the weak metric; improve retrieval relevance, for example with reranking or fewer retrieved chunks, so cited passages truly support each statement." }
    ],
    answer: ["D"],
    explanation: "Citation coverage measures how much of the response is backed by citations, and citation precision measures whether the cited passages are actually the right support. High coverage with low precision means citations are attached but are often irrelevant, which points to retrieval quality. Reranking, a smaller number of results or better chunking address that, while the other metrics are already healthy.",
    whyWrong: {
      A: "Coverage is already 0.94, so statements are cited; the problem is the relevance of the cited passages, not their presence.",
      B: "Correctness is 0.86 and the reviewers say the answers are accurate, so a larger generator does not address the citation problem.",
      C: "Completeness is 0.83 and more output tokens would not change which passages are cited for each statement."
    },
    services: ["Amazon Bedrock Evaluations", "Amazon Bedrock Knowledge Bases"],
    tags: ["rag-evaluation", "citation-precision", "citation-coverage", "metric-interpretation"]
  },
  {
    id: "d5-5.1-19",
    domain: 5, task: "5.1", skills: ["5.1.7"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A Bedrock agent books travel using three action-group tools. During testing, the final answers look correct in 92 percent of conversations, but support finds that the agent sometimes calls the wrong tool first, passes a wrong date format and retries. The team wants an evaluation that would have caught these problems. Which approach is BEST?",
    choices: [
      { id: "A", text: "Score only the final answer text against reference answers, since a correct final answer proves the intermediate steps were fine." },
      { id: "B", text: "Evaluate the agent's trajectory from traces by checking tool selection and parameter accuracy at each step, alongside goal success of the whole task." },
      { id: "C", text: "Measure only the action-group Lambda functions' error rate and duration in CloudWatch and treat a low error rate as agent correctness." },
      { id: "D", text: "Replace the agent with a single prompt that has the tool descriptions inline, so the intermediate steps no longer need to be evaluated." }
    ],
    answer: ["B"],
    explanation: "Agent quality has two layers: whether the task was achieved and whether the path was correct. Trace-based trajectory evaluation checks whether the right tool was chosen with valid parameters at each step, which exposes the wrong-first-tool and bad-date-format problems. Final-answer scoring hides them whenever retries eventually recover.",
    whyWrong: {
      A: "Final-answer scoring is exactly what reported 92 percent; retries and wrong first calls still end in correct answers and stay invisible.",
      C: "A Lambda can run successfully with a wrong-but-valid call, so low error rates do not show the agent chose the right tool or argument.",
      D: "Removing the agent does not evaluate anything and gives up its orchestration, while the same tool-selection quality question remains."
    },
    services: ["Agents for Amazon Bedrock", "Amazon Bedrock Evaluations"],
    tags: ["agent-evaluation", "trajectory", "tool-selection", "goal-success"]
  },
  {
    id: "d5-5.1-20",
    domain: 5, task: "5.1", skills: ["5.1.7"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A team has an agent that already achieves its target goal-success rate. Before launch, the team wants to measure how efficiently the agent reaches the goal so that cost and latency stay predictable. Select THREE metrics that directly describe agent efficiency.",
    choices: [
      { id: "A", text: "Average number of reasoning steps the agent takes per completed task." },
      { id: "B", text: "BERTScore of the final answer against the reference answer." },
      { id: "C", text: "Number of tool calls per task, including repeated or redundant calls." },
      { id: "D", text: "Toxicity rate of the final answers across the test set." },
      { id: "E", text: "Total input and output tokens consumed per task." },
      { id: "F", text: "Thumbs-up percentage reported by users in the pilot." }
    ],
    answer: ["A", "C", "E"],
    explanation: "Efficiency describes how much work the agent does to reach a goal: how many steps, how many tool calls (especially redundant ones) and how many tokens. These drive both cost and latency. Answer similarity, toxicity and user ratings describe quality or safety, not effort.",
    whyWrong: {
      B: "BERTScore measures similarity of the final answer to a reference, which is a quality metric and not an effort metric.",
      D: "Toxicity is a safety measurement of the output and does not show how many steps or tokens were needed.",
      F: "User satisfaction reflects perceived quality and cannot reveal how many steps, tool calls or tokens each task used."
    },
    services: ["Agents for Amazon Bedrock", "Amazon CloudWatch"],
    tags: ["agent-efficiency", "step-count", "tool-calls", "token-usage"]
  },
  {
    id: "d5-5.1-21",
    domain: 5, task: "5.1", skills: ["5.1.8"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Finance asks why Model B, which costs 40 percent less per request than Model A, is not automatically the better choice for a claims-triage assistant. Evaluation data shows Model A resolves 90 percent of cases correctly in one attempt, and Model B resolves 60 percent and often needs a retry or human escalation. Which metric should the team report to stakeholders to make the comparison fair?",
    choices: [
      { id: "A", text: "Cost per request, because it is the unit that Bedrock bills and so is the most reliable comparison." },
      { id: "B", text: "Average tokens per request, because fewer tokens always correspond to a lower overall operating cost." },
      { id: "C", text: "Cost per successful task, including retries and escalation costs divided by the number of correctly resolved cases." },
      { id: "D", text: "Latency at the 50th percentile, because faster responses are directly proportional to lower unit cost." }
    ],
    answer: ["C"],
    explanation: "Cost per request ignores that failed attempts still cost money and trigger retries or human handling. Dividing total cost, including retries and escalations, by the number of successfully completed tasks shows the real unit economics. A cheaper but less accurate model can end up more expensive per resolved case.",
    whyWrong: {
      A: "Per-request cost is exactly the figure that favours Model B while hiding retries and escalations that it causes.",
      B: "Tokens per request ignores price differences between models and does not account for failed or repeated attempts.",
      D: "Median latency describes speed, not cost, and does not reflect how many tasks were successfully resolved."
    },
    services: ["Amazon Bedrock", "Amazon CloudWatch", "AWS Cost Explorer"],
    tags: ["cost-per-successful-task", "model-comparison", "stakeholder-reporting"]
  },
  {
    id: "d5-5.1-22",
    domain: 5, task: "5.1", skills: ["5.1.9"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "A fintech team wants to know how a newer foundation model would answer real production questions before replacing the current model. Users must never see output from the new model, and the current user experience and latency must not change. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Route 10 percent of users to the new model and compare the thumbs-up rate between the two groups for a week." },
      { id: "B", text: "Switch all traffic to the new model and keep the old model's ID in configuration so that a rollback is quick." },
      { id: "C", text: "Replay a small fixed test dataset on the new model each night and assume that it represents real production questions." },
      { id: "D", text: "Mirror production requests to the new model asynchronously, log its responses and compare them offline with the current model's answers." }
    ],
    answer: ["D"],
    explanation: "Shadow deployment copies live requests to the candidate model, stores its responses and never returns them to users. The comparison happens offline, with real traffic and no user impact. A canary or full cutover exposes users to the new model's output.",
    whyWrong: {
      A: "A 10 percent rollout is a canary release, which exposes real users to the new model's answers and violates the requirement.",
      B: "A full switch exposes every user to the new model first and relies on rollback after problems are already visible.",
      C: "A fixed nightly dataset is useful for regression tests but does not reflect the real distribution of production questions."
    },
    services: ["Amazon Bedrock", "Amazon API Gateway", "Amazon S3"],
    tags: ["shadow-deployment", "offline-comparison", "safe-rollout"]
  },
  {
    id: "d5-5.2-10",
    domain: 5, task: "5.2", skills: ["5.2.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A developer notices that incident summaries from a Converse call end mid-sentence. The call used inferenceConfig maxTokens=512, and the response contains:\n\n\"content\": [{\"text\": \"...The remediation steps are: 1. Rotate the credentials 2. Update the\"}]\n\"stopReason\": \"max_tokens\"\n\"usage\": {\"inputTokens\": 1850, \"outputTokens\": 512, \"totalTokens\": 2362}\n\nWhich change fixes the problem?",
    choices: [
      { id: "A", text: "Raise maxTokens to cover the expected summary length, and in code check stopReason so a max_tokens result triggers a continuation request." },
      { id: "B", text: "Lower the temperature to 0 so that the model produces a shorter, more deterministic summary that fits in 512 tokens." },
      { id: "C", text: "Add a stop sequence in inferenceConfig so that the model knows where each summary is supposed to finish." },
      { id: "D", text: "Increase the client read timeout in the botocore Config so that the response is no longer cut short by the connection." }
    ],
    answer: ["A"],
    explanation: "stopReason max_tokens with outputTokens equal to the configured limit means the model was stopped by the cap, not because it finished. Raise maxTokens (within the model's maximum) and have the client treat max_tokens as an incomplete result, either by retrying with a larger limit or by continuing from the partial output.",
    whyWrong: {
      B: "Temperature changes sampling randomness and does not reliably shorten output below a hard token cap that was already reached.",
      C: "A stop sequence ends generation earlier on a matching string; it cannot lengthen a response that was cut off by the token limit.",
      D: "The response arrived complete from the service with a clear stopReason, so a client timeout was not the cause of the truncation."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Runtime"],
    tags: ["max-tokens", "truncation", "stop-reason", "converse-api"]
  },
  {
    id: "d5-5.2-11",
    domain: 5, task: "5.2", skills: ["5.2.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "An insurance claims app sends high-resolution phone photos and scanned multi-page PDFs to a multimodal Bedrock model through Converse. Some requests are rejected for size, and accepted ones consume far more input tokens than expected, raising cost and latency. Which actions address the problem? (Select TWO)",
    choices: [
      { id: "A", text: "Resize and compress images to the model's recommended dimensions before sending, because the model downscales them anyway." },
      { id: "B", text: "Increase maxTokens in inferenceConfig so that the larger inputs can be processed without rejection." },
      { id: "C", text: "For PDFs that contain mostly text, extract the text first (for example with Amazon Textract) and send the text to the model." },
      { id: "D", text: "Upload each file to S3 and pass its S3 URI, which removes the file content from the token count." },
      { id: "E", text: "Convert every scan to a higher-DPI image before sending, which makes the model's reading of the page more efficient." }
    ],
    answer: ["A", "C"],
    explanation: "Image and document tokens grow with their size and number of pages, and oversize files are rejected. Downscaling images to the supported dimensions keeps useful detail while cutting size, and extracting text from text-heavy PDFs sends cheaper text tokens instead of page images.",
    whyWrong: {
      B: "maxTokens limits output length and has no influence on input size limits or the number of input tokens for an image.",
      D: "Passing an S3 location changes how the bytes are delivered, but the model still processes the same content and bills the same tokens.",
      E: "Higher DPI increases pixel count and file size, which makes size rejections and token usage worse."
    },
    services: ["Amazon Bedrock", "Amazon Textract", "Amazon S3"],
    tags: ["multimodal-inputs", "image-size", "pdf-extraction", "input-tokens"]
  },
  {
    id: "d5-5.2-12",
    domain: 5, task: "5.2", skills: ["5.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A nightly job sends 60,000-token contract bundles to a Bedrock model through Converse with maxTokens=4096. About one in five calls fails after roughly a minute. The log shows:\n\nbotocore.exceptions.ReadTimeoutError: Read timeout on endpoint URL: \"https://bedrock-runtime.us-east-1.amazonaws.com/model/.../converse\"\n\nThe CloudWatch InvocationThrottles metric is 0 for the period. What is the MOST likely fix?",
    choices: [
      { id: "A", text: "Request a service quota increase for tokens per minute, because the account is exceeding its quota during the nightly run." },
      { id: "B", text: "Create the client with a larger read_timeout in botocore Config (or use ConverseStream) so long generations are not abandoned by the client." },
      { id: "C", text: "Configure adaptive retry mode on the client so that throttled requests back off and succeed on the next attempt." },
      { id: "D", text: "Move the job to a cross-Region inference profile so that requests are distributed to Regions with more available capacity." }
    ],
    answer: ["B"],
    explanation: "A ReadTimeoutError is raised by the client when the response does not arrive within its read timeout, which defaults to about 60 seconds. Long-input, long-output calls can exceed that. Raising read_timeout, or streaming with ConverseStream so data arrives incrementally, fixes it. Zero throttles show that quota and capacity are not the problem.",
    whyWrong: {
      A: "A quota problem would appear as ThrottlingException and a non-zero InvocationThrottles count, and neither is present.",
      C: "Retry modes help with throttling and transient errors; a longer generation would simply hit the same short read timeout again.",
      D: "Cross-Region profiles help with capacity and throttling, which are not the symptom here because the client gave up on its own."
    },
    services: ["Amazon Bedrock Runtime", "Amazon CloudWatch", "AWS SDK for Python (Boto3)"],
    tags: ["read-timeout", "botocore-config", "error-diagnosis", "streaming"]
  },
  {
    id: "d5-5.2-13",
    domain: 5, task: "5.2", skills: ["5.2.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Your team hosts a document-analysis model on a SageMaker real-time endpoint. Requests for large documents fail when inference takes longer than 60 seconds, and the application gets an error from InvokeEndpoint even though the container is healthy. Which change fixes this class of failure for large, long-running requests?",
    choices: [
      { id: "A", text: "Move the model to an asynchronous inference endpoint that reads the payload from S3 and returns the result to S3 with an SNS notification." },
      { id: "B", text: "Set the boto3 client read_timeout to 600 seconds so the application waits long enough for the real-time endpoint to respond." },
      { id: "C", text: "Move the model to a larger instance type so that every large document is always processed in under 60 seconds." },
      { id: "D", text: "Replace the endpoint with a SageMaker batch transform job that the web application starts on every user request." }
    ],
    answer: ["A"],
    explanation: "A real-time endpoint enforces its own invocation timeout, so a longer client timeout cannot extend it. Asynchronous inference queues requests, accepts large payloads from S3, allows much longer processing, and delivers results to S3 with notifications. Response streaming is the alternative when output can be returned incrementally.",
    whyWrong: {
      B: "The 60-second limit is enforced by the service, so a longer client-side timeout does not change when InvokeEndpoint gives up.",
      C: "A larger instance may help speed but cannot guarantee every document finishes in 60 seconds, and the limit would remain the failure point.",
      D: "Batch transform is for offline processing of datasets and has startup overhead that does not suit per-request interactive use."
    },
    services: ["Amazon SageMaker AI", "Amazon S3", "Amazon SNS"],
    tags: ["sagemaker-endpoint", "async-inference", "invoke-timeout", "large-payload"]
  },
  {
    id: "d5-5.2-14",
    domain: 5, task: "5.2", skills: ["5.2.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A Bedrock agent's action group calls a Lambda function. Agent invocations fail with a DependencyFailedException, and the Lambda logs show the function ran successfully. The handler ends with:\n\nreturn {\"statusCode\": 200, \"body\": json.dumps({\"orderStatus\": \"SHIPPED\"})}\n\nWhat is the cause and the fix?",
    choices: [
      { id: "A", text: "The function lacks a resource-based policy; add lambda:InvokeFunction permission for the bedrock.amazonaws.com principal on the function." },
      { id: "B", text: "The function timed out; raise the Lambda timeout so that the agent can wait for the order lookup to finish." },
      { id: "C", text: "The agent's service role lacks bedrock:InvokeModel; add that permission to the role that the agent uses for orchestration." },
      { id: "D", text: "The response is in API Gateway format; return the agent format with messageVersion and a response object containing actionGroup, apiPath, httpMethod and responseBody." }
    ],
    answer: ["D"],
    explanation: "The function ran, so permissions and timeouts are not the issue. Agents expect the action-group Lambda to return a specific structure, including messageVersion and a response with the action group, path, method, HTTP status code and body. An API Gateway proxy shape is not that structure, so the agent reports a failed dependency.",
    whyWrong: {
      A: "A missing invoke permission would stop the function from running at all, and here the logs show it executed.",
      B: "A timeout would be visible as a Task timed out entry in the Lambda logs, and the function finished successfully.",
      C: "InvokeModel permission affects the agent's calls to the model, not the way it parses the Lambda's returned payload."
    },
    services: ["Agents for Amazon Bedrock", "AWS Lambda"],
    tags: ["action-group", "dependency-failed", "response-schema", "agent-troubleshooting"]
  },
  {
    id: "d5-5.2-15",
    domain: 5, task: "5.2", skills: ["5.2.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A team migrates a support assistant from a Claude model to an Amazon Nova model to cut cost. The code calls InvokeModel with a Claude-specific request body, and after changing only the modelId, answers become worse and some calls fail validation. Which actions best handle the migration? (Select TWO)",
    choices: [
      { id: "A", text: "Move to the Converse API so the system prompt and inference settings use the common structure, leaving the model ID as the main change." },
      { id: "B", text: "Keep the existing prompt unchanged, because a prompt written for one model family behaves the same on any other family." },
      { id: "C", text: "Keep the Claude request body and add the new model's token limit to it, since all models accept the same native JSON schema." },
      { id: "D", text: "Re-run the golden dataset on the new model, then adapt the prompt format and wording to its prompting guidance until the results meet the bar." },
      { id: "E", text: "Set temperature to 1.0 on the new model so that its answers match the creative style that the previous model used." }
    ],
    answer: ["A", "D"],
    explanation: "Native InvokeModel bodies differ by model family, which explains the validation failures. Converse gives a consistent request shape for system prompts, messages and inference parameters. Even then, models respond differently to the same wording and structure, so the prompt must be re-evaluated and tuned against a regression dataset.",
    whyWrong: {
      B: "Prompts are not portable across families; formatting conventions and instruction following differ, as the worse answers already show.",
      C: "Each model family defines its own native request schema, and the validation errors prove that the Claude body is not accepted.",
      E: "Temperature controls randomness and does not recreate another model's style, and a high value can reduce factual reliability."
    },
    services: ["Amazon Bedrock Runtime", "Amazon Nova", "Anthropic Claude on Bedrock"],
    tags: ["prompt-portability", "model-migration", "converse-api", "regression-testing"]
  },
  {
    id: "d5-5.2-16",
    domain: 5, task: "5.2", skills: ["5.2.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An HR chatbot with a Bedrock guardrail attached returns \"I can't help with that request.\" to the question 'How do I request parental leave?'. The Converse response shows:\n\n\"stopReason\": \"end_turn\"\n\"usage\": {\"inputTokens\": 412, \"outputTokens\": 9}\n\nGuardrail trace was enabled and reports no assessment with an intervening action. What is the cause and the correct fix?",
    choices: [
      { id: "A", text: "The model itself declined the request; revise the system prompt to define the HR scope and permitted topics, then re-test." },
      { id: "B", text: "A denied-topic policy blocked the input; loosen the topic definition in the guardrail and remove sample phrases." },
      { id: "C", text: "The word filter matched the prompt; remove the word from the guardrail's managed word list and create a new version." },
      { id: "D", text: "The output was cut by the token limit; raise maxTokens in inferenceConfig so that the model can produce a complete reply." }
    ],
    answer: ["A"],
    explanation: "When a guardrail blocks content, the response reports a stopReason of guardrail_intervened and the trace lists the policy that matched. Here the stop reason is end_turn and the trace shows no intervention, so the model produced the refusal. The fix belongs at the prompt layer, with clearer scope and context, rather than in guardrail policies.",
    whyWrong: {
      B: "A denied-topic block would show a guardrail intervention in the trace and the stop reason, neither of which appears here.",
      C: "A word-filter match is also a guardrail intervention that would be listed in the trace; none was reported.",
      D: "A token cap would give stopReason max_tokens, and nine output tokens is far below any realistic limit."
    },
    services: ["Guardrails for Amazon Bedrock", "Amazon Bedrock Runtime"],
    tags: ["model-refusal", "guardrail-intervention", "stop-reason", "guardrail-trace"]
  },
  {
    id: "d5-5.2-17",
    domain: 5, task: "5.2", skills: ["5.2.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A Knowledge Base was re-ingested with new policy documents. Each document has a .metadata.json file containing {\"metadataAttributes\": {\"year\": 2024, \"region\": \"EMEA\"}}. The Retrieve call below returns zero results, while the same query without a filter returns relevant chunks:\n\n\"filter\": {\"andAll\": [{\"equals\": {\"key\": \"year\", \"value\": \"2024\"}}, {\"equals\": {\"key\": \"region\", \"value\": \"emea\"}}]}\n\nWhich change fixes the filter?",
    choices: [
      { id: "A", text: "Replace andAll with orAll, so that a document matching either condition is returned from the vector store." },
      { id: "B", text: "Pass year as the number 2024 and region as \"EMEA\", matching the stored metadata value types and exact case." },
      { id: "C", text: "Raise numberOfResults so that more chunks are scanned before the filter is applied to the retrieved set." },
      { id: "D", text: "Switch the search type to HYBRID so that keyword matching makes the string values case-insensitive." }
    ],
    answer: ["B"],
    explanation: "Metadata filters compare against stored attribute values. The year was stored as a number, so the string \"2024\" does not equal it, and string comparison is case-sensitive, so \"emea\" does not match \"EMEA\". Using matching types and exact case makes both conditions true, whereas the unfiltered query works because no condition is evaluated.",
    whyWrong: {
      A: "orAll would change the logic, but each condition is individually false, so it would not return the intended documents and would loosen the filter.",
      C: "The filter restricts the candidates by metadata, and requesting more results cannot make a mismatched condition match.",
      D: "Hybrid search affects how relevance is scored and does not change how metadata filter values are compared."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon S3"],
    tags: ["metadata-filter", "type-mismatch", "case-sensitivity", "empty-retrieval"]
  },
  {
    id: "d5-5.2-18",
    domain: 5, task: "5.2", skills: ["5.2.5"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "Over several months, engineers added a new line to a support assistant's system prompt for every complaint. It now has 90 instructions, including both 'Always answer in one sentence.' and 'Give a detailed step-by-step breakdown for every policy question.' Answers are inconsistent and token cost per call has doubled. Which actions fix this? (Select TWO)",
    choices: [
      { id: "A", text: "Rewrite the prompt into a short structured version, removing duplicates and resolving contradictions with an explicit priority." },
      { id: "B", text: "Add an instruction in capital letters at the end of the prompt, saying that all earlier instructions must be followed exactly." },
      { id: "C", text: "Raise the temperature so the model has more freedom to pick between the contradictory instructions each time." },
      { id: "D", text: "Compare the pruned prompt with the old one on a regression dataset and keep it only if quality is at least as good." },
      { id: "E", text: "Switch to a larger model so that it can attempt to satisfy all 90 instructions, including the contradictory ones." }
    ],
    answer: ["A", "D"],
    explanation: "Accumulated patches cause contradictions and cost. The fix is to consolidate the prompt into a coherent, minimal set of instructions with clear priorities, then verify with a before-and-after run on a regression dataset so that pruning does not remove a needed behaviour.",
    whyWrong: {
      B: "Another emphatic line adds to the prompt bloat and does not resolve which of two contradictory instructions should win.",
      C: "Higher temperature increases variability, which makes the already inconsistent answers less predictable.",
      E: "A larger model cannot satisfy contradictory instructions at once and it raises the per-token cost even further."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Prompt Management"],
    tags: ["prompt-bloat", "contradictory-instructions", "prompt-pruning", "regression-testing"]
  }
);
