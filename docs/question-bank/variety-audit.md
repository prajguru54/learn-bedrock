# AIP-C01 Question Bank - Variety Audit

Scope: 180 questions in `data/d1..d5.js` and `d1b..d5b.js` (128 single, 52 "Select TWO"). Read stem-by-stem and answer-by-answer, plus programmatic tag, service and skill counts. IDs are shortened: `1.2-03` means `d1-1.2-03` or the `d1b` file, whichever holds that ID. The "b" files continue the numbering, e.g. `1.2-05` to `1.2-09`.

Rule applied: the same tested decision, service-vs-service choice or concept must appear at most 3 times.

---

## 0. Headline findings

1. The bank is saturated on a small set of decisions. About 18 clusters exceed the cap (section 1). Several pairs are the same question reskinned (section 1.3).
2. Coverage is broad but shallow. Every one of the 98 skills has at least 1 question, but 25 skills have exactly 1 (section 2). Most of them are in D5 (5.1.x) and the 4.3.x and 2.1.x areas.
3. Large parts of the in-scope service list never appear: Kinesis/MSK, AppFlow, AppSync, Amplify, Kiro, Lex, Q Business, ECR, Neptune, Systems Manager, Global Accelerator, ELB, EFS/EBS, Encryption SDK, Access Analyzer, and more (section 3).
4. Every question has the same shape (section 4): "A company...", scenario, "Which solution meets...". There is no ordering, matching, code or log reading, or "which is NOT" item. The correct answer is on average 2x longer than a distractor (180 vs 90 characters), which is a test-taking tell.
5. The gap plan (section 5) lists 180 distinct topics. None repeats an existing 3+ cluster, and each topic is used once.

---

## 1. Redundancy clusters

### 1.1 Clusters above the cap (more than 3 questions on the same decision)

| # | Cluster (underlying decision) | Question IDs | Count |
|---|---|---|---|
| A | Fix Bedrock throttling / capacity: CRIS vs Provisioned Throughput vs retry vs fallback vs per-tenant limits | 1.2-01, 1.2-03, 1.2-07, 2.2-02, 2.2-06, 2.4-02, 2.4-06, 2.4-07, 2.5-10, 4.1-05, 4.2-04 | 11 |
| A1 | Subset: use a cross-Region inference profile (geo-scoped) | 1.2-01, 1.2-07, 2.2-06, 4.2-04, 5.2-07 (inference-profile requirement) | 5 |
| B | Stream tokens with ConverseStream so users see text sooner | 1.1-06, 2.4-01, 2.4-05, 2.5-06, 4.2-02 (+5.2-02 partial) | 5-6 |
| C | Golden dataset or regression suite as a quality gate or drift monitor | 1.6-04, 5.1-03, 2.3-08, 3.3-09, 3.4-06, 4.3-06, 5.2-08 | 7 |
| D | Enable invocation logging and read it with CloudWatch Logs Insights | 2.5-03, 2.5-09, 3.3-03, 4.3-02, 5.2-09, (5.2-06, 1.6-01) | 5-7 |
| E | Send simple prompts to a cheaper model (cascade, prompt router, classifier plus Choice) | 2.2-04, 2.4-04, 2.4-08, 4.1-04 | 4 |
| F | Choose or fix a chunking strategy (hierarchical, semantic, custom, size) | 1.5-01, 1.5-05, 1.5-06, 5.1-02, 5.2-04 | 5 |
| G | Detect or redact PII (Comprehend, Transcribe redaction, Guardrail PII, CWL data protection, Macie) | 1.3-02, 3.1-04, 3.1-07, 3.2-01, 3.2-06, 3.2-08, 3.3-03 | 7 (Comprehend-specific: 4) |
| H | Reduce hallucination (grounding check, KB citations, SQL validation, Automated Reasoning, ID verification, confidence threshold) | 3.1-02, 3.1-03, 3.1-11, 3.4-03, 3.4-04, 3.4-05, 5.1-01 | 6-7 |
| I | Make the model return valid JSON (schema in prompt, tool schema, validate, temp 0) | 1.6-04, 1.6-09, 2.1-10, 3.1-08, 4.2-05, 5.2-06 | 6 |
| J | Deny model invocation by IAM/SCP/endpoint policy except approved models or guardrail | 2.3-06, 2.3-09, 3.3-04, 3.3-08 | 4 |
| K | CloudTrail as audit evidence | 1.6-08, 3.2-09, 3.3-06, 3.3-07 | 4 |
| M | Bedrock Prompt Management (versions, variants, audit, rollback) | 1.6-01, 1.6-03, 1.6-05, 1.6-08, 3.4-02, 5.2-05 | 6 |
| N | Model evaluation job (LLM-as-judge or automatic) to pick or compare models | 1.1-01, 1.2-05, 5.1-10, 1.1-08, 3.4-02, 3.4-07, 5.1-01, 5.1-09 | 5-8 (judge-with-custom-metric: 3.4-07 and 5.1-09 are near twins) |
| O | Use Converse for a model-agnostic interface, or fix a request-format mismatch | 1.2-02, 1.2-06, 1.3-03, 1.3-07 | 4 |
| P | Federated or workforce identity to temporary credentials or per-role Bedrock access | 2.3-01, 2.3-06, 2.1-09, 1.4-08 | 4 |
| R | Multi-tenant isolation or noisy neighbor | 1.2-08, 1.4-08, 2.4-07, 4.3-04 | 4 |
| Q | Scheduled eval, then metric, then alarm for silent quality drift | 3.3-09, 4.3-06, 5.1-07, 5.2-08 | 4 |

### 1.2 Clusters at exactly 3 (at the cap: do not add more)

| Cluster | IDs |
|---|---|
| Batch inference vs on-demand for non-urgent bulk work | 1.1-04, 4.1-02, 4.2-07 |
| Provisioned Throughput as the answer | 2.2-02, 4.1-05, 1.1-01 (as distractor) |
| VPC interface endpoint / PrivateLink for Bedrock | 2.3-03, 2.3-09, 3.2-02 |
| Metadata filtering in Knowledge Bases | 1.3-04, 1.4-02, 1.4-08 |
| Keep the vector index fresh (S3 events, DynamoDB Streams, connector sync) | 1.4-03, 1.4-07, 1.4-10 |
| Agent tool reliability (validation, circuit breaker, stopping condition) | 2.1-03, 2.1-10, 2.1-11 |
| X-Ray or tracing to find the slow stage | 2.5-03, 4.3-03, 5.2-06 |
| Embedding model or dimension mismatch, then re-embed | 1.5-04, 5.2-03, 1.4-04 |
| Caching (prompt cache, semantic cache, hash cache) | 4.1-01, 4.1-03, 4.1-08 |
| Inference parameters (stop sequence, temperature, maxTokens) | 4.2-01, 4.2-05, 2.5-07 |
| Retrieve-only evaluation of retrieval quality | 5.1-02, 5.1-11, 5.2-08 |
| Multimodal or document extraction (Textract vs Data Automation vs multimodal model) | 1.3-05, 1.3-06, 2.5-01 |
| Prompt Flows build (classify, route, format) | 1.6-02, 2.5-02, 1.6-10 |
| Prompt attack / injection defence | 3.1-01, 3.1-06, 3.1-09 |
| Fine-tune vs RAG vs prompt engineering | 1.1-02, 1.1-07, 1.2-04/1.2-08 (adjacent) |

### 1.3 Near-duplicate pairs (the same question in different words; merge or replace first)

- 1.1-04 and 4.1-02: classify or summarize millions of archived items with a batch inference job.
- 2.4-08 and 4.1-04: use a Bedrock prompt router to avoid building a classifier.
- 1.5-01 and 5.2-04: hierarchical chunking for context-poor small chunks.
- 3.2-02 and 2.3-09: a VPC endpoint plus endpoint policy restricted to approved models.
- 1.2-07 and 2.2-06: a geography CRIS profile that respects residency.
- 1.2-03 and 2.1-11: a circuit breaker with state in DynamoDB.
- 1.6-02 and 2.5-02: Prompt Flow that classifies, routes and formats.
- 3.4-07 and 5.1-09: LLM-as-judge with a custom metric.
- 3.3-09 and 4.3-06: golden dataset run on a schedule, with metrics and alarms.
- 2.3-02 and 2.4-03: SQS decoupling with a job ID for slow Bedrock work.
- 5.2-03 and 1.5-04: re-embed after the embedding model changed.
- 1.6-04 and 5.1-03: a golden-dataset release gate.

### 1.4 Service monotony

Service mentions per question (services[] field): Bedrock 84, Lambda 43, KB 28, S3 28, CloudWatch 20, Guardrails 13, Step Functions 13, SageMaker AI 11, IAM 11, API Gateway 11. The four 2.x/3.x topics that rely on Lambda plus Step Functions for glue are over-represented.

---

## 2. Coverage by skill

Questions per skill (from the `skills[]` field; a question can carry two skills). No skill has 0.

- Skills with exactly 1 question (25): 1.3.1, 1.4.4, 1.5.3, 1.6.2, 2.1.2, 2.1.4, 2.1.5, 2.5.4, 2.5.5, 3.1.4, 3.2.3, 3.3.1, 4.2.2, 4.2.3, 4.3.4, 4.3.5, 4.3.6, 5.1.1, 5.1.3, 5.1.4, 5.1.5, 5.1.7, 5.1.8, 5.1.9, 5.2.3.
- Over-served skills (4 or more): 3.2.1 (5), 3.3.4 (5), 1.1.1 (4), 2.1.1 (4), 2.2.1 (4), 3.1.1 (4), 3.2.2 (4), 3.3.4 (5), 4.3.2 (4).

Full table (skill=count):

```
1.1.1=4 1.1.2=2 1.1.3=2 | 1.2.1=2 1.2.2=2 1.2.3=3 1.2.4=2 | 1.3.1=1 1.3.2=3 1.3.3=2 1.3.4=2
1.4.1=3 1.4.2=2 1.4.3=3 1.4.4=1 1.4.5=2 | 1.5.1=3 1.5.2=2 1.5.3=1 1.5.4=2 1.5.5=2 1.5.6=3
1.6.1=2 1.6.2=1 1.6.3=3 1.6.4=2 1.6.5=3 1.6.6=2
2.1.1=4 2.1.2=1 2.1.3=3 2.1.4=1 2.1.5=1 2.1.6=3 2.1.7=2 | 2.2.1=4 2.2.2=2 2.2.3=2
2.3.1=2 2.3.2=2 2.3.3=3 2.3.4=3 2.3.5=2 | 2.4.1=2 2.4.2=2 2.4.3=3 2.4.4=2
2.5.1=2 2.5.2=2 2.5.3=2 2.5.4=1 2.5.5=1 2.5.6=2
3.1.1=4 3.1.2=3 3.1.3=3 3.1.4=1 3.1.5=2 | 3.2.1=5 3.2.2=4 3.2.3=1 | 3.3.1=1 3.3.2=2 3.3.3=2 3.3.4=5
3.4.1=3 3.4.2=2 3.4.3=3
4.1.1=2 4.1.2=3 4.1.3=3 4.1.4=3 | 4.2.1=3 4.2.2=1 4.2.3=1 4.2.4=2 4.2.5=2 4.2.6=2
4.3.1=2 4.3.2=4 4.3.3=2 4.3.4=1 4.3.5=1 4.3.6=1
5.1.1=1 5.1.2=3 5.1.3=1 5.1.4=1 5.1.5=1 5.1.6=3 5.1.7=1 5.1.8=1 5.1.9=1 | 5.2.1=2 5.2.2=2 5.2.3=1 5.2.4=3 5.2.5=2
```

Questions per task: 1.1=8, 1.2=9, 1.3=8 (+1b), 1.4=10, 1.5=11, 1.6=10, 2.1=12, 2.2=8, 2.3=9, 2.4=9, 2.5=9, 3.1=11, 3.2=9, 3.3=9, 3.4=7, 4.1=8, 4.2=7, 4.3=6, 5.1=11, 5.2=9.

D5 holds 11% of the exam but is the thinnest by skill: 5.1.x has 9 skills across 11 questions, and 6 of those skills have 1 question each.

Tag-level observation: 330+ tags are used, and most are used once. Tags such as `cost-optimization` (9), `guardrails` (7), `chunking` (6), `least-privilege` (6), `streaming` (6) and `throttling` (5) dominate.

---

## 3. Under-used or missing services and concepts

Count = questions mentioning the service in a stem or choice (exam guide "In-Scope AWS Services" list).

### 3.1 Never appear (0)

- Analytics: Amazon Kinesis, Amazon MSK, Amazon EMR (1 passing mention only).
- Application Integration: Amazon AppFlow.
- Compute/Containers: AWS App Runner, Lambda@Edge, Amazon ECR, EKS (1).
- Customer engagement: Amazon Connect, Amazon Lex.
- Database: Amazon Neptune (and GraphRAG), RDS (1), DocumentDB (1).
- Developer tools: AWS Amplify, Kiro, AWS CLI-based tasks.
- ML: Amazon Augmented AI (A2I), Amazon Q Business and Q Apps, SageMaker Data Wrangler, JumpStart, Neo, Processing, Unified Studio, Ground Truth (1).
- Management: AWS Chatbot, Amazon Managed Grafana, AWS Systems Manager.
- Migration/transfer: AWS DataSync, AWS Transfer Family.
- Networking: AWS AppSync, Elastic Load Balancing, AWS Global Accelerator.
- Security: AWS Encryption SDK, IAM Access Analyzer.
- Storage: Amazon EBS, Amazon EFS, S3 Cross-Region Replication.

### 3.2 Appear once or twice (thin)

Q Developer (1), Kendra (1), Cost Anomaly Detection (1), Cost Explorer (3), Secrets Manager (1), IAM Identity Center (1), CodeArtifact (1), CDK (1), CloudFormation (2), Fargate (2), WAF (2), Cognito (2), Outposts (2), Wavelength (1), AppConfig (2), CodeBuild/CodeDeploy (1 each), QuickSight (1), Service Catalog (1), Well-Architected (1-2), Rekognition (2), Clarify (2), CloudFront (4 mentions, none as a decision), Route 53 (5 mentions, none as a decision).

### 3.3 Bedrock-specific concepts with 0 questions

- Bedrock Agents multi-agent collaboration (supervisor/collaborator), agent aliases and versions, agent user confirmation, advanced prompt-template overrides.
- Custom Model Import, Bedrock Marketplace models, Prompt Optimization, Bedrock API keys, `CountTokens`, async invoke (video/image models), service tiers (Priority/Standard/Flex).
- Guardrails: image content filter, standard vs classic tier, custom regex entities, guardrail versions, async stream-processing mode.
- KB: advanced (FM) parsing, no-chunking, S3 Vectors, Neptune Analytics GraphRAG, structured-data retrieval, custom data source with direct document ingestion, web crawler and SharePoint connectors, `RetrieveAndGenerate` prompt template/session.
- AgentCore: Runtime session isolation, Browser and Code Interpreter tools, Observability, Evaluations.
- Strands: MCP client, graph/swarm multi-agent patterns, conversation manager.
- OpenSearch: filtered k-NN, hybrid search pipelines, ML connector (neural search), OpenSearch Ingestion, Serverless capacity (OCU).
- SageMaker: inference components, Inferentia/Neuron, `InvokeEndpointWithResponseStream`, ML Lineage.
- Evaluation: human-based evaluation jobs, bring-your-own inference responses, judge-model bias, agent trajectory metrics.

---

## 4. Question-shape variety

| Dimension | Finding |
|---|---|
| Form | 128 single-answer plus 52 Select TWO (29%). There is no ordering, matching, case-study set, "which is NOT/EXCEPT" or "which statement is true" item. The real exam has ordering and matching. |
| Task shape | Nearly all questions are "pick the solution that meets requirements". Very few are troubleshoot-from-symptom (about 20), identify-the-cause (about 6) or pick-the-config-value (about 4). No code snippet, JSON policy, log excerpt, error output or metric screenshot to read (2 stems contain code-like text). |
| Openers | 167/180 start with "A/An". 52 start with "A company"; the next most common are "A team" (11), "A legal-tech" (5), "A telecom" (5), "A bank" (5), "A healthcare" (5). |
| Qualifiers | 72 stems use a capitalised qualifier. LEAST operational overhead 13-15, LEAST (effort/code/cost) about 25, MOST cost-effective 7, MOST appropriate 10, MOST improve/effective 8, lowest cost 4. The other 108 stems carry no qualifier. Missing: "FASTEST", "MOST secure", "BEST meets compliance", "MOST scalable", "MOST resilient", "which will NOT". |
| Length bias | The correct choice averages 180 characters; each distractor averages 90. Correct answers are about 2x longer, which is a test-taking tell. |
| Answer position | Single-answer keys: A 32, B 36, C 33, D 27. This is balanced enough. |
| Difficulty | easy 4, medium 89, hard 87. No real easy tier; no true multi-service trade-off tables. |
| Multi-select | All multi-select items are exactly TWO. The exam also uses 3-of-5 style items. |
| Official samples | 7 of 180 are official-style (`source` field not "generated"); the other 173 are generated. |

### Recommended shape mix for the 180 new questions

- Forms: 100 single best answer, 40 Select TWO, 10 Select THREE (3 of 5-6 choices), 12 ordering (put 4-6 steps in order), 8 matching (match 3-4 requirements to services or settings), 10 read-the-artifact (IAM policy JSON, Converse request, CloudWatch Logs Insights query, error output, EventBridge pattern, `Config` snippet).
- Qualifier targets: no more than 25 "LEAST operational overhead/effort" stems. At least 20 with no qualifier (plain "which will fix", "what is the cause"). At least 15 "MOST secure / MOST resilient / MOST scalable / compliance".
- Openers: no more than 15 starting with "A company". Use first-person role stems ("You are...", "A developer notices...", "After deploying...", "An error log shows...").
- Distractors: equalise length (correct within +/-20% of the distractor mean). Make 1-2 distractors partially correct (right service, wrong setting).
- Difficulty: 20 easy, 90 medium, 70 hard.
- Add 3 scenario sets of 3 questions each on a shared architecture (case-study style), using task numbers from the plan.

---

## 5. Gap plan for 180 new questions

Allocation follows the exam weights: D1 56, D2 47, D3 36, D4 21, D5 20. Every topic below is used exactly once. None repeats an existing cluster with 3 or more questions, except the flagged near-cap items. The question writer can take each line as one stem brief. `[x.y.z]` is the skill to tag.

Constraint rules for the writer: do not use CRIS, ConverseStream-as-latency-fix, PII redaction with Comprehend, golden-dataset gates, invocation-log plus Logs Insights, hierarchical/semantic chunking, JSON-output reliability, model cascade/router, VPC endpoint policy or Provisioned Throughput as an answer in any new question. These are saturated.

### Domain 1 - Foundation Model Integration, Data Management, Compliance (56)

**Task 1.1 - Analyze requirements and design GenAI solutions (8)**
1. [1.1.1] Pick the orchestration style by determinism needs: Bedrock Agents vs Step Functions vs Prompt Flows for a multi-step claims process.
2. [1.1.1] Buy vs build: Amazon Q Business (with SaaS connectors) vs a custom Bedrock KB RAG for an employee assistant.
3. [1.1.1] Match four workloads to the right invocation pattern (sync, streaming, async queue, batch), as a matching item.
4. [1.1.1] Multi-tenant SaaS design: pooled vs per-tenant KB, guardrail and inference profile isolation (silo vs pool trade-offs).
5. [1.1.2] Voice assistant proof of concept: decompose the latency budget across Transcribe streaming, Bedrock and Polly.
6. [1.1.2] No real data yet: generate a synthetic test set with a Bedrock model for the proof of concept.
7. [1.1.3] Standard reusable components: a CDK L3 construct (guardrail, logging, role) published through AWS CodeArtifact.
8. [1.1.3] Policy-as-code: a CloudFormation Hook or cfn-guard rule that rejects a Bedrock agent resource lacking a guardrail.

**Task 1.2 - Select and configure FMs (9)**
9. [1.2.1] Long-context (200K+ tokens) analysis vs RAG: read context window and output limits.
10. [1.2.1] Reasoning (extended-thinking) model vs a non-reasoning model for multi-step planning: latency and cost trade-off.
11. [1.2.1] Modality fit: choose the image-generation model (Nova Canvas, Titan Image or Stable Diffusion) and its limits.
12. [1.2.1] Access a niche open-weight model: Bedrock Marketplace vs SageMaker JumpStart vs Custom Model Import decision table.
13. [1.2.2] Converse `additionalModelRequestFields` for model-unique parameters (for example Claude `top_k`) without breaking portability.
14. [1.2.2] Lambda alias weighted routing (10% canary) to move to a new model ID with alarm-based rollback.
15. [1.2.3] Multi-Region active-passive stack with Route 53 failover health checks (KB and data replicated), distinct from CRIS.
16. [1.2.3] Model deprecation (end-of-life) notice: migrate by pinning versions and evaluating a successor before cutoff.
17. [1.2.4] Bedrock Custom Model Import of fine-tuned open weights vs a SageMaker endpoint: ops burden, scaling and cold start.

**Task 1.3 - Data validation and processing pipelines (9)**
18. [1.3.1] Validate a text corpus before embedding: language detection, minimum length and toxicity check (Lambda plus Comprehend), with quarantine to S3.
19. [1.3.1] Fine-tuning dataset JSONL validation errors in a Bedrock customization job: fix the record schema and limits.
20. [1.3.1] Label and validate a preference dataset with SageMaker Ground Truth plus inter-annotator agreement.
21. [1.3.2] Tabular data to an FM: serialise rows as text vs text-to-SQL on Athena for aggregate questions.
22. [1.3.2] Video input: Nova video content block from S3 vs Rekognition plus Transcribe pipeline.
23. [1.3.2] Converse `document` content block for PDFs: size limits, naming and when to switch to Textract.
24. [1.3.3] Embedding request bodies: Titan V2 (`inputText`, `dimensions`, `normalize`) vs Cohere Embed (`texts`, `input_type`); identify the broken request.
25. [1.3.3] Multimodal request format: base64 vs S3 URI image block, and an `anthropic_version` error in `InvokeModel`.
26. [1.3.4] Multilingual input: Comprehend `DetectDominantLanguage` plus Translate before retrieval vs a multilingual embedding.

**Task 1.4 - Vector stores and retrieval infrastructure (10)**
27. [1.4.1] Vector store selection matrix: OpenSearch Serverless vs Aurora pgvector vs S3 Vectors vs Neptune Analytics, for a huge, rarely queried archive (S3 Vectors).
28. [1.4.1] GraphRAG with Neptune Analytics for multi-hop relationship questions (supply chain).
29. [1.4.1] KB for structured data stores (natural language to SQL over Redshift/Glue) vs a vector index.
30. [1.4.2] Metadata filter operators and composition (`andAll`, `orAll`, `stringContains`, numeric `lessThan`) to exclude superseded versions.
31. [1.4.3] OpenSearch Serverless capacity: indexing vs search OCUs and minimum-OCU cost for a spiky workload vs a managed domain.
32. [1.4.3] DR for the vector store: Aurora Global Database for pgvector vs OpenSearch cross-cluster replication.
33. [1.4.4] Web crawler / SharePoint / Salesforce KB connectors: scope, inclusion filters, ACL handling.
34. [1.4.4] Amazon Kendra GenAI index with connectors and document-level ACL filtering as the retriever for Bedrock.
35. [1.4.5] KB custom data source with the direct document ingestion API (no S3), including deletes.
36. [1.4.5] Amazon OpenSearch Ingestion pipeline (S3/DynamoDB source) with a Bedrock embedding processor.

**Task 1.5 - Retrieval mechanisms for FM augmentation (10)**
37. [1.5.1] Advanced (FM-based) parsing for PDFs with tables and images vs the default parser.
38. [1.5.2] Multimodal embeddings (Titan Multimodal or Nova) to search images with text queries.
39. [1.5.2] Similarity metric and `input_type`: cosine vs dot product vs L2 matched to normalised embeddings.
40. [1.5.3] OpenSearch ML Commons connector to Bedrock for query-time embedding (neural search).
41. [1.5.3] Aurora pgvector index choice: HNSW vs IVFFlat (recall, build time, memory).
42. [1.5.3] OpenSearch Serverless collection type `VECTORSEARCH`, plus the data access and network policies a KB needs.
43. [1.5.4] OpenSearch hybrid search with a search pipeline: score normalisation (min-max) and weights.
44. [1.5.4] Federated search over several KBs merged with reciprocal rank fusion.
45. [1.5.5] Conversational query rewriting: turn "what about its price?" into a standalone query from chat history.
46. [1.5.6] `RetrieveAndGenerate` with a custom `promptTemplate` (`$search_results$`) and `sessionId` for follow-ups.

**Task 1.6 - Prompt engineering and governance (10)**
47. [1.6.1] Instruction hierarchy: XML tags to separate trusted instructions from untrusted data in a template.
48. [1.6.1] Persona and tone control: system prompt vs fine-tune vs guardrail.
49. [1.6.2] Lex slot elicitation with a Bedrock fallback for a booking assistant.
50. [1.6.2] Bedrock Agents `sessionAttributes` / `promptSessionAttributes` to carry user context across turns.
51. [1.6.3] Prompt governance as code: `AWS::Bedrock::Prompt` in CloudFormation and IAM separation of duties (author vs publisher). This is the one allowed extra Prompt Management item.
52. [1.6.4] Pick the assertion type per property: regex/schema/length checks in Lambda vs an LLM judge for tone.
53. [1.6.5] Dynamic few-shot selection: retrieve the most similar examples from a vector store per request.
54. [1.6.5] Assistant prefill (for example `{`) plus stop sequence vs tool-use structured output.
55. [1.6.5] Bedrock Prompt Optimization to rewrite a prompt for a target model.
56. [1.6.6] Prompt Flows iterator and collector nodes to process a list of items.

### Domain 2 - Implementation and Integration (47)

**Task 2.1 - Agentic AI (11)**
57. [2.1.1] AgentCore Runtime session isolation: per-session microVM, `runtimeSessionId` reuse, idle timeout.
58. [2.1.2] Bedrock Agents advanced prompt-template overrides (pre-processing and orchestration) to change the reasoning format.
59. [2.1.2] Plan-and-execute: a planner agent emits sub-tasks and a Step Functions Map state runs them in parallel.
60. [2.1.2] Reflection loop: generator plus critic with a bounded number of revisions.
61. [2.1.3] Least privilege for action-group Lambda: scoped role plus resource policy with `aws:SourceArn` (confused deputy).
62. [2.1.4] Bedrock multi-agent collaboration: supervisor vs routing mode with collaborator agents.
63. [2.1.4] Specialist model per modality (Nova Canvas for images, Claude for text, Transcribe) in one Step Functions pipeline.
64. [2.1.5] Amazon Augmented AI (A2I) human review with a confidence threshold for extraction.
65. [2.1.5] Bedrock Agents `requireConfirmation` for destructive action-group functions.
66. [2.1.6] Strands agent with an MCP client to a remote MCP server (streamable HTTP, tool discovery).
67. [2.1.7] MCP server on ECS Fargate (long-lived, stateful sessions) vs Lambda (stateless); MCP tools vs resources vs prompts.

**Task 2.2 - Deploy FM solutions (7)**
68. [2.2.1] Host a custom LangGraph agent: AgentCore Runtime vs ECS Fargate vs Bedrock Agents.
69. [2.2.1] ECS Fargate service for a FastAPI Bedrock proxy: task role vs execution role, awsvpc, ALB idle timeout for streaming, autoscaling on request count.
70. [2.2.2] SageMaker inference components: several model copies per endpoint with managed scaling.
71. [2.2.2] Instance selection (g5 vs p4d vs Inferentia2/Neuron) with quantization (AWQ/FP8) to fit a model.
72. [2.2.2] `InvokeEndpointWithResponseStream` to stream tokens from a SageMaker LLM endpoint.
73. [2.2.3] Latency tuning on a SageMaker endpoint: speculative decoding or Neo compilation vs a bigger instance.
74. [2.2.3] Lambda provisioned concurrency vs SnapStart for a latency-sensitive Bedrock proxy.

**Task 2.3 - Enterprise integration (9)**
75. [2.3.1] Amazon AppFlow to land Salesforce/ServiceNow data in S3 for KB ingestion vs custom Lambda polling.
76. [2.3.1] Amazon Connect plus Lex fallback intent calling Bedrock via Lambda for a contact center.
77. [2.3.1] On-premises SOAP/mainframe integration: API Gateway private integration with VPC link and NLB over Direct Connect.
78. [2.3.2] AppSync GraphQL resolver calling Bedrock (Lambda data source) with subscriptions for results.
79. [2.3.3] Cross-account Bedrock access: central account role assumed through STS with ExternalId and session tags.
80. [2.3.3] Pick the API Gateway authorizer for machine-to-machine access (IAM SigV4 vs Cognito client_credentials vs Lambda authorizer).
81. [2.3.4] Jurisdiction routing: Route 53 geolocation routing to Region-specific GenAI stacks.
82. [2.3.5] Private GenAI gateway: internal ALB plus ECS gateway shared to other VPCs through a PrivateLink endpoint service.
83. [2.3.5] CodeDeploy blue/green for an ECS GenAI service (test listener, `appspec`, automatic rollback).

**Task 2.4 - Model access and resilient invocation (9)**
84. [2.4.1] Bedrock API keys (short-term vs long-term) vs SigV4 for developer prototyping and CI.
85. [2.4.1] `StartAsyncInvoke` for video/image generation writing to S3, with completion through EventBridge.
86. [2.4.1] SQS FIFO with DLQ and redrive: visibility timeout must exceed Lambda timeout for slow Bedrock calls.
87. [2.4.2] Read ConverseStream code: `contentBlockDelta`, `metadata.usage`, `messageStop` `stopReason`; find the bug.
88. [2.4.2] `ModelStreamErrorException` mid-stream: partial output handling and safe resume.
89. [2.4.3] Full-jitter backoff and SQS event-source `maximumConcurrency` to avoid a thundering herd.
90. [2.4.3] Idempotent batch job creation with `clientRequestToken` on retry.
91. [2.4.4] Latency- or error-based dynamic routing among models from CloudWatch metrics.
92. [2.4.4] Deterministic metadata routing (tenant tier, language) before any LLM classifier.

**Task 2.5 - Application integration patterns and developer tooling (11)**
93. [2.5.1] 20 MB PDF upload exceeds the API Gateway payload limit: S3 presigned URL plus event.
94. [2.5.1] Idempotency key on POST (Powertools idempotency with DynamoDB) for retried summarisation requests.
95. [2.5.2] Amplify AI Kit / UI conversation component for an accessible chat front end.
96. [2.5.3] EventBridge API destinations to push AI summaries into a SaaS CRM with connection auth.
97. [2.5.3] Step Functions Express vs Standard for short, chatty GenAI workflows (duration and cost).
98. [2.5.4] Kiro steering files, specs and hooks to enforce standards for a GenAI repo.
99. [2.5.4] Unit-test Bedrock calls with the botocore Stubber / mocked responses, no live calls.
100. [2.5.5] Strands multi-agent patterns (agents-as-tools vs graph vs swarm) vs AWS Agent Squad.
101. [2.5.5] AgentCore Browser tool or Code Interpreter for an agent that must navigate a web UI or compute.
102. [2.5.6] AgentCore Observability with OpenTelemetry (ADOT) spans to troubleshoot an agent run.
103. [2.5.6] Read a Bedrock agent trace excerpt (pre-processing, orchestration, KB lookup) and locate the failing step.

### Domain 3 - AI Safety, Security, Governance (36)

**Task 3.1 - Content safety, hallucination, threats (12)**
104. [3.1.1] Guardrail image content filter for multimodal input.
105. [3.1.1] Guardrail versions: DRAFT vs numbered version pinned in production, with a custom blocked-message response.
106. [3.1.1] Guardrail sensitive-information custom regex entities (employee ID pattern).
107. [3.1.1] Guardrail Standard vs Classic tier: language coverage and cross-Region guardrail inference.
108. [3.1.2] Guardrails on streaming: `streamProcessingMode` synchronous vs asynchronous (latency vs risk of leaking a chunk).
109. [3.1.2] A secondary FM as output moderator (Lambda) for brand-specific policy that managed filters cannot express.
110. [3.1.2] Rekognition image moderation on images generated by Nova Canvas.
111. [3.1.3] Abstention: "answer not found" instruction, `numberOfResults`, temperature 0 for a grounded KB assistant.
112. [3.1.4] Identify the missing defence layer in a layered architecture (WAF, authz, guardrail, scoped tools, output check).
113. [3.1.4] AWS WAF managed rule group plus rate-based rule against scraping and denial-of-wallet on the GenAI API.
114. [3.1.5] Excessive agency: scoped tools and human approval for destructive actions (OWASP LLM top 10 mapping).
115. [3.1.5] System prompt leakage: keep secrets out of prompts (Secrets Manager) and detect extraction attempts.

**Task 3.2 - Data security and privacy (9)**
116. [3.2.1] Secrets Manager for a third-party API key used by an agent tool (rotation, Lambda extension cache).
117. [3.2.1] KB service role least privilege and OpenSearch Serverless data-access vs network policies.
118. [3.2.1] AccessDenied when subscribing to a Marketplace-based model: the required `aws-marketplace` permissions and `iam:PassRole`.
119. [3.2.1] IAM Access Analyzer: find external access to KB buckets and generate a policy from CloudTrail activity.
120. [3.2.1] SageMaker endpoint network isolation (`EnableNetworkIsolation`, VPC config) for a self-hosted LLM.
121. [3.2.2] Right-to-erasure workflow across DynamoDB history, S3 transcripts, and the vector store.
122. [3.2.2] AWS Encryption SDK client-side envelope encryption of sensitive fields before storage.
123. [3.2.3] Synthetic data generation with an FM to build privacy-safe test or fine-tuning data.
124. [3.2.3] Role-based guardrail selection: a stricter guardrail for external users, a lighter one for the compliance team.

**Task 3.3 - Governance and compliance (8)**
125. [3.3.1] Pick the evidence source for an ISO 42001 / EU AI Act audit: AWS Artifact vs Audit Manager framework vs Config.
126. [3.3.1] Approval gates: CodePipeline manual approval with SNS before a prompt or model reaches production.
127. [3.3.2] Reproduce an answer "as of" a date: S3 versioning, ingestion job ID and object version in metadata.
128. [3.3.2] Model and dataset lineage with SageMaker ML Lineage Tracking and Model Registry metadata.
129. [3.3.3] ABAC with tags: `aws:ResourceTag` / `aws:PrincipalTag` for team access to application inference profiles.
130. [3.3.3] AWS AI Service Cards and model provider cards: what each document evidences for a risk review.
131. [3.3.3] AWS Config conformance pack or custom rule to detect Bedrock guardrail or logging drift (detective control, not an SCP; cluster J is already over cap).
132. [3.3.4] Detect shadow GenAI usage: CloudTrail Lake query plus Cost Explorer usage-type breakdown.

**Task 3.4 - Responsible AI (7)**
133. [3.4.1] Reasoning display: show a summary of the reasoning vs exposing raw chain of thought.
134. [3.4.1] Disclose AI-generated images: watermarking and Bedrock watermark detection.
135. [3.4.2] SageMaker Clarify pre-training bias metrics on a fine-tuning dataset.
136. [3.4.2] Retrieval corpus bias: rebalance sources when a KB over-represents one group.
137. [3.4.3] Per-audience guardrails (for example age-appropriate for a student product) bound to separate application profiles.
138. [3.4.3] Robustness evaluation with perturbed prompts (typos) plus toxicity metrics before release.
139. [3.4.3] Third-party model transparency: read provider model cards and IP indemnification terms when selecting a model.

### Domain 4 - Operational Efficiency and Optimization (21)

**Task 4.1 - Cost optimization (7)**
140. [4.1.1] `CountTokens` / tokenizer pre-check and cost estimate before the call (token counts differ by model).
141. [4.1.1] Reduce RAG input tokens: lower top-k and smaller context vs compressing the prompt.
142. [4.1.1] Output tokens cost more than input tokens: terse structured output and ID-only responses.
143. [4.1.2] Service tiers (Priority vs Standard vs Flex) by urgency of the workload.
144. [4.1.3] Batch inference job quotas and concurrency: split the input JSONL and track job status through EventBridge.
145. [4.1.1] Embedding cost: re-embed only changed chunks, choose a smaller dimension and batch the embedding calls.
146. [4.1.2] Cost visibility: Cost Explorer by usage type (input vs output tokens, model) plus Cost Anomaly Detection monitor.

**Task 4.2 - Performance (7)**
147. [4.2.1] Run the input guardrail and retrieval in parallel with generation start to reduce perceived latency.
148. [4.2.2] OpenSearch filtered k-NN: efficient (pre-)filtering with Lucene/Faiss vs post-filter recall loss.
149. [4.2.2] Reuse the boto3 client outside the Lambda handler and co-locate the vector store and compute in one Region.
150. [4.2.3] Tokens-per-minute quota and burn-down: lower `max_tokens` to raise effective throughput.
151. [4.2.4] Extended-thinking budget and `top_k` (model-specific parameters): the effect on latency and quality.
152. [4.2.5] Service Quotas utilisation alarms for Bedrock request and token quotas, with a quota-increase runbook.
153. [4.2.6] `TimeToFirstToken` vs `InvocationLatency` profiling: decide whether input size or output length is the cause.

**Task 4.3 - Monitoring and observability (7)**
154. [4.3.1] Match Bedrock runtime metrics to symptoms (`InvocationThrottles`, `InvocationServerErrors`, `InvocationLatency`).
155. [4.3.1] Composite alarm plus SNS and AWS Chatbot to cut alert noise.
156. [4.3.3] Amazon Managed Grafana across CloudWatch, X-Ray and OpenSearch vs CloudWatch cross-account observability.
157. [4.3.3] Converse `requestMetadata` for per-user token attribution and abuse detection.
158. [4.3.4] Agent tool latency and error-rate metrics (EMF from the action-group Lambda) with an alarm on tool failure rate.
159. [4.3.5] KB ingestion job state-change events (EventBridge) and failure statistics for vector store health.
160. [4.3.6] Silent truncation and refusals: metric filter on `stopReason` (for example `max_tokens`) in invocation logs.

### Domain 5 - Testing, Validation, Troubleshooting (20)

**Task 5.1 - Evaluation (11)**
161. [5.1.1] Pick evaluation metrics by task type (ROUGE/BERTScore for summarisation, accuracy for classification, robustness and toxicity).
162. [5.1.1] Human-based Bedrock evaluation job with your own work team for subjective quality.
163. [5.1.1] Bring-your-own inference responses to evaluate a non-Bedrock (SageMaker-hosted) model.
164. [5.1.3] Link thumbs-down feedback to KB citations to find bad source documents.
165. [5.1.4] Online evaluation by sampling 1% of production invocation logs and scoring asynchronously with a judge.
166. [5.1.5] Judge-model bias: use a different or stronger judge, and calibrate against human labels.
167. [5.1.5] RAG metrics: citation precision and citation coverage; which metric matches which symptom.
168. [5.1.7] Agent trajectory evaluation (tool selection and parameter accuracy, goal success) vs final-answer-only scoring.
169. [5.1.7] Agent efficiency: step count, tool calls and tokens per task.
170. [5.1.8] Report cost per successful task instead of cost per request, for stakeholders.
171. [5.1.9] Shadow deployment: mirror traffic to the new model and compare offline with no user impact.

**Task 5.2 - Troubleshooting (9)**
172. [5.2.1] Truncated output with `stopReason: max_tokens`: raise the limit or add a continuation strategy.
173. [5.2.1] Large image or PDF rejected or token-heavy: downscale, or extract text first.
174. [5.2.2] Diagnose by error code: ServiceQuotaExceeded vs Throttling vs ModelTimeout vs content-filtered `ModelErrorException`.
175. [5.2.2] SageMaker endpoint errors: 6 MB payload limit and 60 s invoke timeout, fixed by async or streaming.
176. [5.2.2] Agent action-group Lambda returns the wrong response schema, causing `DependencyFailedException`.
177. [5.2.3] Prompt portability after changing model family (Claude to Nova): system prompt and format differences.
178. [5.2.3] Model refusal vs guardrail intervention: distinguish by `stopReason` and trace, and fix the right layer.
179. [5.2.4] KB returns nothing for new docs: metadata filter type mismatch (string vs number) or case sensitivity.
180. [5.2.5] Prompt bloat from accumulated patch instructions and contradictions: prune and re-evaluate.

### Allocation check

| Domain | Target | Plan |
|---|---|---|
| D1 | 56 | 1.1=8, 1.2=9, 1.3=9, 1.4=10, 1.5=10, 1.6=10 = 56 |
| D2 | 47 | 2.1=11, 2.2=7, 2.3=9, 2.4=9, 2.5=11 = 47 |
| D3 | 36 | 3.1=12, 3.2=9, 3.3=8, 3.4=7 = 36 |
| D4 | 21 | 4.1=7, 4.2=7, 4.3=7 = 21 |
| D5 | 20 | 5.1=11, 5.2=9 = 20 |
| Total | 180 | 180 |

Skills with 1 existing question that now get at least 1 new question: 1.3.1, 1.4.4, 1.5.3, 1.6.2, 2.1.2, 2.1.4, 2.1.5, 2.5.4, 2.5.5, 3.1.4, 3.2.3, 3.3.1, 4.2.2, 4.2.3, 4.3.4, 4.3.5, 4.3.6, 5.1.1, 5.1.3, 5.1.4, 5.1.5, 5.1.7, 5.1.8, 5.1.9, 5.2.3.

Services newly introduced: AppFlow, AppSync, Amplify, Kiro, Lex, Connect, Q Business, A2I, Neptune, Managed Grafana, AWS Chatbot, Access Analyzer, Encryption SDK, Secrets Manager (decision), ECR/ECS Fargate (decision), App Runner (reserve), WAF (decision), Route 53 (decision), CodeArtifact, Service Quotas.

### Reserve topics (use if any item above is rejected)

- Obfuscated or multilingual jailbreaks: normalise input before the guardrail.
- Lost-in-the-middle ordering of retrieved chunks.
- Bedrock Agents alias/version rollback.
- Kinesis Data Streams plus Lambda for real-time moderation of chat events.
- MSK or Kinesis as the source for streaming ingestion into the vector store.
- App Runner as a hosting option for a Bedrock API.
- Lambda@Edge/CloudFront for edge auth in front of a GenAI API.
- EFS-backed model artifacts for SageMaker.
- DataSync or Transfer Family to move on-premises documents into S3 for KB ingestion.

### Open point for the owner

Section 4 recommends ordering, matching, Select THREE and read-the-artifact items. The current app's `type` field supports only `single` and `multi`. Adding those formats needs an app change, or the writer should limit the new set to single, multi (TWO) and read-the-artifact stems.
