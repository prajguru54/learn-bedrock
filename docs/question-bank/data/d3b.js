window.QB = window.QB || [];
window.QB.push(
  {
    id: "d3-3.1-07",
    domain: 3, task: "3.1", skills: ["3.1.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A travel company exposes a public chat API (Amazon API Gateway) that calls an Amazon Bedrock model. Security review requires defense in depth: customer PII in prompts must not reach the model, harmful content must be filtered by managed policies, and the final answer must be checked so that it contains only a booking reference that exists in the company's system before it is returned. Which architecture meets these requirements?",
    choices: [
      { id: "A", text: "API Gateway invokes an AWS Lambda function that first calls Amazon Comprehend DetectPiiEntities and redacts PII from the prompt. The function then invokes the model with a Bedrock guardrail attached, and finally validates the output (for example, checks the booking reference against the booking database) before returning it." },
      { id: "B", text: "Attach a guardrail to the model and rely on it alone, because guardrails verify business data such as booking references." },
      { id: "C", text: "Add an AWS WAF rate-based rule to API Gateway and trust the model's system prompt for all other controls." },
      { id: "D", text: "Fine-tune the model on redacted conversations so that it never produces PII or invalid booking references." }
    ],
    answer: ["A"],
    explanation: "Defense in depth layers independent controls: a pre-processing filter (Comprehend PII detection), model-based managed guardrails on the invocation, and deterministic post-processing validation in Lambda against the system of record. If one layer fails, another still stops the problem.",
    whyWrong: {
      B: "Guardrails cover content, PII, topics, and grounding policies. They cannot look up whether a booking reference exists in a private database.",
      C: "WAF rate limiting protects against volumetric abuse and does not inspect LLM prompt or response semantics. A system prompt is advisory, not an enforceable control.",
      D: "Fine-tuning is not a deterministic control, cannot guarantee that references are valid, and does not stop PII that users type into the prompt."
    },
    services: ["Amazon API Gateway", "AWS Lambda", "Amazon Comprehend", "Amazon Bedrock Guardrails"],
    tags: ["defense-in-depth", "pre-processing", "post-processing-validation", "comprehend", "guardrails"]
  },
  {
    id: "d3-3.1-08",
    domain: 3, task: "3.1", skills: ["3.1.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A claims-processing system uses an Amazon Bedrock model to extract fields from free-text adjuster notes. A downstream billing service accepts only JSON with a claimType field limited to three allowed values and a numeric amount field. Occasionally the model returns extra prose around the JSON or an unexpected claimType, which breaks the billing service. Which solution provides the MOST reliable structured output?",
    choices: [
      { id: "A", text: "Add the sentence \"Respond only with valid JSON\" to the prompt and increase the temperature." },
      { id: "B", text: "Use Amazon Comprehend entity recognition on the model output to locate the JSON." },
      { id: "C", text: "Use the Converse API with a tool definition whose input schema is a JSON Schema (with an enum for claimType and a number type for amount), and force the model to call that tool. Validate the result against the schema in AWS Lambda and retry or reject on failure." },
      { id: "D", text: "Add a guardrail word filter containing every character that is not part of JSON syntax." }
    ],
    answer: ["C"],
    explanation: "Defining a JSON Schema as a tool input schema steers the model to produce arguments that conform to the schema, and validating the output with a schema validator gives a deterministic gate before the data reaches downstream systems. Combining generation-time constraints with validation and retry is the reliable pattern.",
    whyWrong: {
      A: "A prompt instruction alone is not enforced, and a higher temperature makes format deviations more likely.",
      B: "Comprehend entity recognition finds entities such as people and places in text. It is not a JSON parser or validator.",
      D: "Word filters match words and phrases and cannot enforce a document structure or enumerated values."
    },
    services: ["Amazon Bedrock Converse API", "AWS Lambda"],
    tags: ["json-schema", "structured-output", "tool-use", "output-validation"]
  },
  {
    id: "d3-3.1-09",
    domain: 3, task: "3.1", skills: ["3.1.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A software company wants an automated adversarial-testing workflow for its Amazon Bedrock guardrail. Each time the guardrail configuration changes, a curated library of jailbreak and prompt-injection test prompts must be replayed against it, and the security team must be alerted if the share of blocked attack prompts falls below an agreed threshold. Which combination of steps meets these requirements with managed services and minimal custom infrastructure? (Select TWO)",
    choices: [
      { id: "A", text: "Run the attack-prompt library from an AWS Step Functions workflow or CI job that calls the ApplyGuardrail API for each prompt and records whether the guardrail intervened." },
      { id: "B", text: "Store the attack prompts in Amazon S3 Glacier Deep Archive for long-term retention." },
      { id: "C", text: "Publish the block rate as an Amazon CloudWatch custom metric and create an alarm that notifies the security team through Amazon SNS when it drops below the threshold." },
      { id: "D", text: "Increase the guardrail's blocked-message text length so attackers receive more information." },
      { id: "E", text: "Ask a developer to try a few attacks manually before each release." }
    ],
    answer: ["A", "C"],
    explanation: "ApplyGuardrail can evaluate arbitrary text against a guardrail without invoking a model, which makes it suitable for repeatable test runs from a workflow or pipeline. Emitting the intervention rate as a CloudWatch metric with an alarm turns the result into automated, threshold-based alerting.",
    whyWrong: {
      B: "Archiving the prompts does not execute any test, and Deep Archive retrieval takes hours.",
      D: "A longer blocked message does nothing for detection and could leak useful information to attackers.",
      E: "Manual spot checks are not repeatable or automated and do not scale across configuration changes."
    },
    services: ["Amazon Bedrock Guardrails", "AWS Step Functions", "Amazon CloudWatch", "Amazon SNS"],
    tags: ["adversarial-testing", "red-team", "apply-guardrail", "cloudwatch-alarm", "jailbreak"]
  },
  {
    id: "d3-3.1-10",
    domain: 3, task: "3.1", skills: ["3.1.1", "3.1.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A media company plans to add a new guardrail with strict content filters and several denied topics to a live Amazon Bedrock application that serves millions of requests a day. The product team fears the new policies might block legitimate traffic and wants to measure what the guardrail WOULD have blocked on real traffic before it starts affecting users. Which approach meets this requirement?",
    choices: [
      { id: "A", text: "Deploy the guardrail with all filters at the highest strength and watch support tickets for complaints." },
      { id: "B", text: "Delete the denied topics, since they are the most likely cause of false positives." },
      { id: "C", text: "Use Amazon Macie to scan the application's S3 bucket and estimate how many requests would be blocked." },
      { id: "D", text: "Configure the guardrail policies in detect mode so they evaluate and report findings without blocking, review the guardrail trace output, tune the policies, and then switch the actions to block." }
    ],
    answer: ["D"],
    explanation: "Guardrail detect mode evaluates content against the configured policies and returns trace information about what was found without taking the blocking action. This lets the team tune thresholds and definitions against real traffic and then enforce them, avoiding user impact from false positives.",
    whyWrong: {
      A: "Enforcing at maximum strength first causes the exact user impact the team wants to avoid, and tickets are a slow, lossy signal.",
      B: "Removing policies weakens safety and does not measure anything about the real traffic.",
      C: "Macie finds sensitive data in S3 objects and does not simulate guardrail policy decisions."
    },
    services: ["Amazon Bedrock Guardrails"],
    tags: ["guardrails", "detect-mode", "tuning", "false-positives"]
  },
  {
    id: "d3-3.1-11",
    domain: 3, task: "3.1", skills: ["3.1.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An e-commerce company uses an Amazon Bedrock model to recommend products and mention product IDs in its replies. Customers occasionally receive replies that cite product IDs that do not exist in the catalog. The company wants to eliminate invented IDs from customer-visible answers at the LOWEST risk of regressions. Which solution should the company implement?",
    choices: [
      { id: "A", text: "Raise the guardrail content filter strength for the misconduct category." },
      { id: "B", text: "Add an AWS Lambda post-processing step that extracts every product ID from the response, verifies each one against the catalog in Amazon DynamoDB, and then regenerates the answer with only validated products or returns a safe fallback if verification fails." },
      { id: "C", text: "Ask the model in the system prompt to double-check its answer and only mention real products." },
      { id: "D", text: "Switch to a higher temperature so the model explores more catalog items." }
    ],
    answer: ["B"],
    explanation: "Deterministic post-generation verification against the system of record is the dependable way to stop fabricated identifiers. The check does not depend on model behavior, so it is robust to model or prompt changes, and a fallback keeps the customer experience safe.",
    whyWrong: {
      A: "Content filters detect harmful content categories, not whether an identifier exists in a catalog.",
      C: "Self-verification instructions can reduce but not eliminate invented values, and nothing enforces the result.",
      D: "Higher temperature increases randomness and the chance of fabricated values."
    },
    services: ["AWS Lambda", "Amazon DynamoDB", "Amazon Bedrock"],
    tags: ["hallucination", "output-validation", "post-processing", "fact-checking"]
  },
  {
    id: "d3-3.2-05",
    domain: 3, task: "3.2", skills: ["3.2.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A telecom company stores chat transcripts and model invocation logs in an Amazon S3 bucket (versioning enabled) under the prefixes transcripts/ and logs/. A privacy policy requires that transcripts be permanently deleted 90 days after creation, while logs must be retained for 400 days. The company wants the deletion to happen automatically with the LEAST operational overhead. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Run a nightly AWS Lambda function that lists all objects in the bucket and deletes those older than 90 days." },
      { id: "B", text: "Create S3 Lifecycle rules scoped by prefix: expire current versions under transcripts/ after 90 days and also expire noncurrent versions, and expire objects under logs/ after 400 days." },
      { id: "C", text: "Enable S3 Intelligent-Tiering on the bucket and set the archive tiers to delete data after 90 days." },
      { id: "D", text: "Apply S3 Object Lock in compliance mode with a 90-day retention period to the transcripts/ prefix." }
    ],
    answer: ["B"],
    explanation: "S3 Lifecycle configurations enforce retention declaratively and per prefix. With versioning enabled, expiring the current version only adds a delete marker, so noncurrent versions must also be expired for data to be permanently removed.",
    whyWrong: {
      A: "A custom Lambda works but adds code, scheduling, error handling, and cost for something S3 does natively.",
      C: "Intelligent-Tiering moves objects between access tiers to optimize cost. It does not delete data.",
      D: "Object Lock prevents deletion until the retention period ends. It is a protection mechanism and does not delete objects automatically."
    },
    services: ["Amazon S3"],
    tags: ["s3-lifecycle", "data-retention", "privacy", "versioning"]
  },
  {
    id: "d3-3.2-06",
    domain: 3, task: "3.2", skills: ["3.2.2"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A company is preparing to ingest documents from more than 150 Amazon S3 buckets into an Amazon Bedrock knowledge base. Nobody knows which buckets contain personally identifiable information (PII). The company must first discover which buckets hold PII and then remove the PII from the text files that are approved for ingestion. Which combination of services should the company use? (Select TWO)",
    choices: [
      { id: "A", text: "Amazon Macie sensitive data discovery to identify the buckets and objects that contain PII." },
      { id: "B", text: "Amazon Inspector to scan the buckets for sensitive data." },
      { id: "C", text: "An Amazon Comprehend PII detection job with redaction configured to write redacted copies of the text files to a new S3 location used as the knowledge base data source." },
      { id: "D", text: "AWS Config conformance packs to remove PII from objects." },
      { id: "E", text: "Amazon GuardDuty to redact the PII in the objects." }
    ],
    answer: ["A", "C"],
    explanation: "Macie is the AWS service for discovering sensitive data across S3 at scale and reports where PII lives. Comprehend can run asynchronous PII detection jobs over text in S3 and produce redacted output, so the knowledge base ingests the sanitized copies.",
    whyWrong: {
      B: "Inspector assesses software vulnerabilities and unintended network exposure of compute and container workloads, not sensitive data in S3 objects.",
      D: "AWS Config evaluates resource configuration compliance and does not modify object contents.",
      E: "GuardDuty detects threats and anomalous activity. It does not classify or redact data."
    },
    services: ["Amazon Macie", "Amazon Comprehend", "Amazon S3", "Amazon Bedrock Knowledge Bases"],
    tags: ["macie", "comprehend", "pii-detection", "redaction", "knowledge-base"]
  },
  {
    id: "d3-3.2-07",
    domain: 3, task: "3.2", skills: ["3.2.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company encrypts the Amazon S3 bucket that holds its knowledge base documents with a customer managed AWS KMS key (SSE-KMS). The ingestion job for a new Amazon Bedrock knowledge base fails with an access denied error when reading the objects, although the knowledge base service role has s3:GetObject and s3:ListBucket permissions on the bucket. What should the company do to fix the issue while following least privilege?",
    choices: [
      { id: "A", text: "Make the S3 bucket public so that the ingestion job can read the objects." },
      { id: "B", text: "Add the AdministratorAccess managed policy to the knowledge base service role." },
      { id: "C", text: "Allow the knowledge base service role to use the specific KMS key, for example with kms:Decrypt and kms:GenerateDataKey in the role policy, and make sure that the key policy permits the role (or delegates to IAM policies)." },
      { id: "D", text: "Switch the bucket to SSE-S3 and delete the customer managed key." }
    ],
    answer: ["C"],
    explanation: "Reading objects encrypted with SSE-KMS requires permission on the KMS key as well as on the S3 objects. Granting the service role only the needed KMS actions on that single key, and ensuring the key policy allows it, fixes the failure while preserving the customer-controlled encryption.",
    whyWrong: {
      A: "A public bucket exposes proprietary data and does not remove the need for KMS permissions.",
      B: "AdministratorAccess violates least privilege and is unnecessary for the problem.",
      D: "Dropping the customer managed key removes the customer's ability to control and revoke the encryption key, which is likely why it was chosen."
    },
    services: ["AWS KMS", "Amazon S3", "Amazon Bedrock Knowledge Bases", "AWS IAM"],
    tags: ["kms", "key-policy", "least-privilege", "knowledge-base", "troubleshooting"]
  },
  {
    id: "d3-3.2-08",
    domain: 3, task: "3.2", skills: ["3.2.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A bank's support assistant uses an Amazon Bedrock model to draft replies to customer emails. The model must never see real customer names or account numbers, but the final reply that the customer receives must still address the customer by name and refer to the correct account. Which combination of steps preserves privacy and usefulness? (Select TWO)",
    choices: [
      { id: "A", text: "Before invocation, detect PII in the email with Amazon Comprehend and replace each value with a placeholder token such as [NAME_1] or [ACCT_1]." },
      { id: "B", text: "Keep the token-to-value mapping in the application tier (for example, in an encrypted store with a short TTL) and substitute the real values back into the model's reply before sending it to the customer." },
      { id: "C", text: "Encrypt the email text with AWS KMS before sending it to the model so that the model can read it only when needed." },
      { id: "D", text: "Remove all names and numbers from the reply template permanently so that replies are generic." },
      { id: "E", text: "Send the original email to the model and rely on the model provider's promise to ignore PII." }
    ],
    answer: ["A", "B"],
    explanation: "Tokenization (pseudonymization) replaces sensitive values with placeholders before the model sees them, and re-hydrating the placeholders in the application layer after generation restores personalization. The mapping stays inside the trusted application boundary, so the model keeps the context it needs without the raw PII.",
    whyWrong: {
      C: "A model cannot read KMS-encrypted ciphertext, so the text would be unusable by the model and the request would give meaningless output.",
      D: "Generic replies sacrifice the utility requirement of addressing the customer correctly.",
      E: "Sending raw PII to the model contradicts the requirement that the model never sees it."
    },
    services: ["Amazon Comprehend", "Amazon Bedrock", "AWS KMS"],
    tags: ["data-masking", "tokenization", "pseudonymization", "pii", "privacy-utility"]
  },
  {
    id: "d3-3.2-09",
    domain: 3, task: "3.2", skills: ["3.2.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A research company keeps proprietary training datasets in an Amazon S3 bucket. Only the role used by the fine-tuning pipeline should read the objects. The security team wants a near-real-time alert whenever any other principal reads an object in the bucket, with the LEAST custom infrastructure. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Enable S3 Transfer Acceleration and review the transfer metrics daily." },
      { id: "B", text: "Enable AWS Cost Anomaly Detection on the S3 service." },
      { id: "C", text: "Turn on S3 server access logs and have an analyst grep the logs weekly." },
      { id: "D", text: "Enable AWS CloudTrail data events for the bucket, deliver them to Amazon CloudWatch Logs, and create a metric filter for GetObject events whose principal is not the pipeline role, with a CloudWatch alarm that notifies an Amazon SNS topic." }
    ],
    answer: ["D"],
    explanation: "CloudTrail S3 data events record object-level API calls with the calling principal. Delivered to CloudWatch Logs, a metric filter and alarm provide near-real-time alerting on unexpected readers, using only managed services and configuration.",
    whyWrong: {
      A: "Transfer Acceleration is a performance feature and gives no information about who accessed objects.",
      B: "Cost anomaly detection tracks spend patterns, not individual object reads by unauthorized principals.",
      C: "Weekly manual review is neither near-real-time nor automated."
    },
    services: ["AWS CloudTrail", "Amazon CloudWatch", "Amazon S3", "Amazon SNS"],
    tags: ["cloudtrail-data-events", "cloudwatch-alarm", "data-access-monitoring", "metric-filter"]
  },
  {
    id: "d3-3.3-05",
    domain: 3, task: "3.3", skills: ["3.3.4"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A lender hosts a loan-approval classifier on an Amazon SageMaker AI real-time endpoint. Regulators require evidence that the approval rates across demographic groups do not drift unfavorably after deployment. The company wants scheduled production monitoring with alerts and the LEAST custom code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Enable data capture on the endpoint and schedule a SageMaker Model Monitor bias drift monitoring job (built on SageMaker Clarify) that compares live predictions with a baseline, and alarm on the emitted CloudWatch metrics." },
      { id: "B", text: "Enable AWS CloudTrail on the endpoint and read the invocation events for demographic information." },
      { id: "C", text: "Retrain the model every night regardless of measurements." },
      { id: "D", text: "Monitor the endpoint's CPU utilization in Amazon CloudWatch." }
    ],
    answer: ["A"],
    explanation: "SageMaker Model Monitor supports scheduled monitoring of captured inference data, including bias drift monitoring that uses SageMaker Clarify against a baseline. Results and violations can be surfaced as CloudWatch metrics, giving automated evidence and alerting for regulators.",
    whyWrong: {
      B: "CloudTrail records API calls, not request payload features or fairness statistics.",
      C: "Blind retraining does not measure or document bias and can introduce new problems.",
      D: "CPU utilization is an infrastructure metric and says nothing about fairness."
    },
    services: ["Amazon SageMaker AI", "Amazon CloudWatch"],
    tags: ["bias-drift", "model-monitor", "clarify", "continuous-monitoring"]
  },
  {
    id: "d3-3.3-06",
    domain: 3, task: "3.3", skills: ["3.3.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A healthcare company must always keep Amazon Bedrock model invocation logging enabled for audits. Last month an administrator accidentally deleted the logging configuration, and no prompts were logged for two days. The company wants an automated remediation that restores the configuration quickly and notifies the security team. Which combination of steps meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Create an Amazon EventBridge rule that matches the AWS CloudTrail management event for DeleteModelInvocationLoggingConfiguration." },
      { id: "B", text: "Create an AWS Budgets alert for Bedrock spend." },
      { id: "C", text: "Set the rule target to an AWS Lambda function that calls PutModelInvocationLoggingConfiguration with the approved settings and publishes a notification to an Amazon SNS topic." },
      { id: "D", text: "Enable Amazon Macie on the logging bucket." },
      { id: "E", text: "Ask administrators to check the Bedrock settings page every morning." }
    ],
    answer: ["A", "C"],
    explanation: "Bedrock management API calls are recorded by CloudTrail and can be matched by EventBridge rules. A Lambda target can re-apply the approved logging configuration and send a notification, giving event-driven detection and remediation within seconds.",
    whyWrong: {
      B: "Budgets track cost thresholds and would not reliably indicate that logging configuration changed.",
      D: "Macie scans stored objects for sensitive data and does not monitor or restore Bedrock configuration.",
      E: "Manual daily checks leave up to a day of unlogged activity and rely on human diligence."
    },
    services: ["Amazon EventBridge", "AWS CloudTrail", "AWS Lambda", "Amazon Bedrock", "Amazon SNS"],
    tags: ["automated-remediation", "eventbridge", "invocation-logging", "audit", "governance"]
  },
  {
    id: "d3-3.3-07",
    domain: 3, task: "3.3", skills: ["3.3.2", "3.3.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "An auditor of a financial company asks for tamper-evident records of who created, updated, or deleted Amazon Bedrock guardrails over the last seven years. The company must be able to prove that the records were not altered or deleted during that period. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Export the guardrail configuration to a text file in the application's Git repository each month." },
      { id: "B", text: "Use an AWS CloudTrail trail that delivers to an Amazon S3 bucket with log file integrity validation enabled and S3 Object Lock in compliance mode with a seven-year retention period." },
      { id: "C", text: "Rely on the 90-day Event history in the CloudTrail console." },
      { id: "D", text: "Store a screenshot of the guardrail console page each quarter." }
    ],
    answer: ["B"],
    explanation: "CloudTrail records management API calls such as CreateGuardrail and UpdateGuardrail with the calling identity and time. Log file integrity validation lets auditors verify that logs were not modified, and Object Lock in compliance mode prevents deletion or overwrite until retention ends.",
    whyWrong: {
      A: "Monthly snapshots miss intermediate changes and do not record who made them.",
      C: "Event history covers only the most recent 90 days of management events and is not a long-term, tamper-evident store.",
      D: "Screenshots are manual, incomplete, and easy to alter."
    },
    services: ["AWS CloudTrail", "Amazon S3", "Amazon Bedrock Guardrails"],
    tags: ["cloudtrail", "audit-logging", "object-lock", "log-integrity", "retention"]
  },
  {
    id: "d3-3.3-08",
    domain: 3, task: "3.3", skills: ["3.3.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A company's AI governance policy states that every Amazon Bedrock model invocation in its production accounts must be evaluated by the approved guardrail. Developers keep forgetting to attach the guardrail in their code. The company wants to enforce the policy centrally, so that requests without the approved guardrail are rejected. Which solution meets this requirement with the LEAST operational overhead?",
    choices: [
      { id: "A", text: "Send a reminder email to developers each quarter and review code manually." },
      { id: "B", text: "Add an Amazon CloudWatch dashboard that shows the share of invocations that used a guardrail." },
      { id: "C", text: "Attach an IAM policy (or service control policy) that denies bedrock:InvokeModel and bedrock:InvokeModelWithResponseStream unless the bedrock:GuardrailIdentifier condition key matches the approved guardrail." },
      { id: "D", text: "Enable AWS Trusted Advisor and wait for it to flag non-compliant calls." }
    ],
    answer: ["C"],
    explanation: "Bedrock supports the bedrock:GuardrailIdentifier IAM condition key, so a policy can deny model invocation requests that do not specify the approved guardrail. Applying it through IAM or an SCP enforces the control preventively and centrally, without relying on developer discipline.",
    whyWrong: {
      A: "Reminders and manual reviews are not enforcement and do not scale.",
      B: "A dashboard is detective and shows violations only after the unprotected invocations happened.",
      D: "Trusted Advisor does not evaluate individual Bedrock invocations for guardrail use."
    },
    services: ["AWS IAM", "AWS Organizations", "Amazon Bedrock Guardrails"],
    tags: ["guardrail-identifier", "iam-condition-keys", "scp", "policy-enforcement", "governance"]
  },
  {
    id: "d3-3.3-09",
    domain: 3, task: "3.3", skills: ["3.3.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A company runs a ticket-summarization application on Amazon Bedrock. Its compliance team worries that output quality could degrade silently, for example when the underlying model version or the input mix changes, and wants early, automated warning together with an auditable history of quality scores. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Wait for customers to report poor summaries and track the complaints in a spreadsheet." },
      { id: "B", text: "Disable the application's logs to reduce noise." },
      { id: "C", text: "Increase the Bedrock provisioned throughput so that quality improves." },
      { id: "D", text: "Schedule Amazon Bedrock model evaluation jobs that run a fixed golden dataset on a regular cadence, publish the scores as Amazon CloudWatch metrics, and alarm when a score drops below an agreed threshold." }
    ],
    answer: ["D"],
    explanation: "Re-running the same representative dataset on a schedule gives comparable measurements over time, so degradation shows up as a drop in score. Publishing scores to CloudWatch provides alarms for early warning and a retained history for audits.",
    whyWrong: {
      A: "Customer complaints are a late, incomplete, and manual signal.",
      B: "Disabling logs removes evidence and visibility, the opposite of continuous monitoring.",
      C: "Throughput capacity affects speed and availability, not the quality of generated text."
    },
    services: ["Amazon Bedrock Model Evaluation", "Amazon CloudWatch", "Amazon EventBridge"],
    tags: ["drift-detection", "model-evaluation", "continuous-monitoring", "cloudwatch-alarm"]
  },
  {
    id: "d3-3.4-05",
    domain: 3, task: "3.4", skills: ["3.4.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A utility company provides a RAG assistant that answers billing questions by using an Amazon Bedrock knowledge base. The responsible-AI board wants the assistant to be honest about uncertainty: when retrieval finds only weakly relevant passages, the assistant should say it is not sure and offer a human agent, and the team wants to track how often this happens. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Use the relevance scores that the Retrieve API returns for the chunks. If the top score is below a tuned threshold, return a hedged answer with a human-handoff option, and publish the low-confidence rate as an Amazon CloudWatch custom metric." },
      { id: "B", text: "Always return the model's answer with a fixed disclaimer, regardless of retrieval quality." },
      { id: "C", text: "Lower the maximum number of retrieved chunks to one so the answer sounds more confident." },
      { id: "D", text: "Block all questions about billing with a guardrail denied topic." }
    ],
    answer: ["A"],
    explanation: "Retrieval relevance scores are a practical proxy for confidence in a RAG system. Thresholding them lets the application communicate uncertainty and escalate, and emitting a custom CloudWatch metric quantifies how often uncertainty occurs over time.",
    whyWrong: {
      B: "A constant disclaimer carries no information about the specific answer's reliability and is not measured.",
      C: "Retrieving fewer chunks reduces evidence and hides uncertainty rather than communicating it.",
      D: "Blocking the whole topic defeats the purpose of the assistant."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon CloudWatch"],
    tags: ["uncertainty", "confidence-scoring", "transparency", "human-handoff", "custom-metrics"]
  },
  {
    id: "d3-3.4-06",
    domain: 3, task: "3.4", skills: ["3.4.3"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A company releases new prompt versions for its Amazon Bedrock assistant through a CI/CD pipeline. The responsible-AI policy says that no prompt version may reach production unless it passes automated policy checks, and the limitations of each approved model must be documented for internal reviewers. Which combination of actions satisfies the policy? (Select TWO)",
    choices: [
      { id: "A", text: "Add a pipeline stage that invokes an AWS Lambda function to run a policy test set against the candidate prompt version, for example by calling ApplyGuardrail on the outputs, and fail the stage if any case violates policy." },
      { id: "B", text: "Increase the number of pipeline stages so that releases take longer." },
      { id: "C", text: "Maintain an Amazon SageMaker Model Card for each approved model that records its intended use, risk rating, evaluation results, and known limitations, and update it as part of each release." },
      { id: "D", text: "Disable Amazon CloudWatch Logs for the pipeline to protect developer privacy." },
      { id: "E", text: "Publish the system prompt text in the public user interface as the only form of documentation." }
    ],
    answer: ["A", "C"],
    explanation: "Automated compliance gates in the release pipeline enforce policy before deployment, and model cards provide the standardized documentation of intended use and limitations for reviewers. Together they implement preventive control and transparency.",
    whyWrong: {
      B: "More stages do not add any policy checks, and delay is not a control.",
      D: "Disabling logs reduces auditability and does not help with compliance.",
      E: "A system prompt is not a documented assessment of model limitations and exposing it could create security problems."
    },
    services: ["AWS Lambda", "Amazon Bedrock Guardrails", "Amazon SageMaker AI", "AWS CodePipeline"],
    tags: ["compliance-checks", "model-cards", "ci-cd", "policy-compliance", "responsible-ai"]
  },
  {
    id: "d3-3.4-07",
    domain: 3, task: "3.4", skills: ["3.4.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A public-sector agency uses an Amazon Bedrock model to draft replies to citizen inquiries. The agency defines its own fairness criterion: replies must be equally polite and equally detailed regardless of the dialect or name used in the inquiry. The built-in evaluation metrics do not capture this criterion. Which approach lets the agency measure it automatically at scale?",
    choices: [
      { id: "A", text: "Run an Amazon Bedrock model evaluation job that uses LLM-as-a-judge with a custom metric whose judge prompt describes politeness and level of detail, on a dataset of paired inquiries that differ only in dialect or name, and compare scores between the groups." },
      { id: "B", text: "Use a guardrail word filter containing the names of all demographic groups." },
      { id: "C", text: "Check only the average response latency for each demographic group." },
      { id: "D", text: "Fine-tune the model with a single dialect to remove variation." }
    ],
    answer: ["A"],
    explanation: "LLM-as-a-judge evaluations let a judge model score responses against criteria, and a custom metric with its own judge prompt can express organization-specific fairness criteria. Matched-pair data isolates the effect of the attribute, and comparing group scores quantifies disparities automatically.",
    whyWrong: {
      B: "Filtering group names does not measure or correct differences in tone or detail.",
      C: "Latency is unrelated to politeness or detail of the content.",
      D: "Training on a single dialect would likely worsen fairness for others and measures nothing."
    },
    services: ["Amazon Bedrock Model Evaluation"],
    tags: ["fairness", "llm-as-a-judge", "custom-metrics", "bias-evaluation"]
  }
);
