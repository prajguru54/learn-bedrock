window.QB = window.QB || [];
window.QB.push(
  {
    id: "d1-1.1-05", domain: 1, task: "1.1", skills: ["1.1.3"], type: "single", difficulty: "medium", source: "generated",
    stem: "A platform team is about to take a customer-facing generative AI assistant to production. Before launch, the architecture review board wants a structured assessment of the workload against AWS best practices specific to generative AI (for example model selection, prompt and data governance, and responsible AI), with a prioritized list of improvement items. Which approach meets this requirement with the LEAST effort?",
    choices: [
      { id: "A", text: "Define the workload in the AWS Well-Architected Tool, apply the Generative AI Lens, answer its questions, and use the resulting improvement plan." },
      { id: "B", text: "Run AWS Trusted Advisor checks on the account and treat the findings as the architecture review." },
      { id: "C", text: "Run an Amazon Bedrock model evaluation job and use the quality scores as the architecture review." },
      { id: "D", text: "Enable Amazon Inspector on the application's compute resources and review the vulnerability findings." }
    ],
    answer: ["A"],
    explanation: "The AWS Well-Architected Framework has a Generative AI Lens that is available in the Well-Architected Tool. It provides a question-based review of a GenAI workload and produces prioritized improvement items, which also helps standardize design decisions across teams.",
    whyWrong: {
      B: "Trusted Advisor checks account-level categories such as cost, security, and service limits; it does not review the architecture of a GenAI workload against a lens.",
      C: "A model evaluation job measures output quality for a model or prompt set. It does not assess architecture, governance, or operations.",
      D: "Inspector finds software vulnerabilities and network exposure. It is not an architecture review and has no generative AI guidance."
    },
    services: ["AWS Well-Architected Tool", "Generative AI Lens"], tags: ["well-architected", "generative-ai-lens", "architecture-review"]
  },
  {
    id: "d1-1.1-06", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A company is designing a chat assistant embedded in a web application. The model generates answers of 400 to 800 tokens, and users complain that the screen stays blank for several seconds before the full answer appears. The team wants to improve perceived responsiveness without changing the model or buying extra capacity. Which design change should the GenAI developer make?",
    choices: [
      { id: "A", text: "Submit the prompts through Amazon Bedrock batch inference so that responses are processed in bulk." },
      { id: "B", text: "Call the Amazon Bedrock ConverseStream API and push tokens to the browser as they arrive, for example over WebSockets or server-sent events." },
      { id: "C", text: "Purchase Provisioned Throughput so that generation of the full answer completes faster." },
      { id: "D", text: "Lower maxTokens to 50 so that the response always finishes quickly." }
    ],
    answer: ["B"],
    explanation: "Streaming returns tokens incrementally, so the user starts reading after the first tokens instead of waiting for the whole completion. Total generation time stays the same, but time to first token is what drives perceived latency in interactive chat.",
    whyWrong: {
      A: "Batch inference is asynchronous and built for offline jobs. It would make an interactive experience slower, not faster.",
      C: "Provisioned Throughput guarantees capacity, but the answer still arrives only when the whole response is complete. It also adds committed cost.",
      D: "Truncating output to 50 tokens would cut the answers that users need and does not address the delivery pattern."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Converse API"], tags: ["streaming", "latency", "converse-stream", "architecture"]
  },
  {
    id: "d1-1.1-07", domain: 1, task: "1.1", skills: ["1.1.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "A marketing agency has 15,000 approved prompt and ideal-response pairs that capture its exact brand voice and a fixed output template. The product facts it writes about rarely change and are supplied in each prompt. Prompt engineering and few-shot examples have not produced consistent tone and format, and each prompt is now very long. The agency wants more consistent style while shortening prompts. Which approach is MOST appropriate?",
    choices: [
      { id: "A", text: "Build a Knowledge Base over the 15,000 pairs and retrieve examples to include in each request." },
      { id: "B", text: "Run continued pre-training on the pairs, using them as unlabeled text." },
      { id: "C", text: "Fine-tune a supported foundation model in Amazon Bedrock with the prompt and completion pairs, then evaluate it against the base model." },
      { id: "D", text: "Train a new foundation model from scratch on the agency's content." }
    ],
    answer: ["C"],
    explanation: "Consistent style and output format, backed by labeled prompt and completion pairs, is the case for supervised fine-tuning. It moves the behavior into the model weights so prompts can be shorter. The facts are static and supplied in the prompt, so retrieval is not the missing piece.",
    whyWrong: {
      A: "Retrieval supplies knowledge at query time but still leaves long prompts and does not reliably change style. Knowledge is not the problem here.",
      B: "Continued pre-training adapts a model to a domain by using unlabeled data. It does not teach the model to follow an instruction-to-response style the way labeled pairs do.",
      D: "Training from scratch is far beyond the cost and data volume this need justifies."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Model Customization"], tags: ["fine-tuning", "rag-vs-fine-tuning", "model-customization"]
  },
  {
    id: "d1-1.1-08", domain: 1, task: "1.1", skills: ["1.1.2"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A healthcare payer wants to prove that a RAG assistant over its benefits documents is accurate enough before funding a full build. The team has two weeks. Which combination of steps validates feasibility and answer quality with the LEAST cost and effort? (Select TWO)",
    choices: [
      { id: "A", text: "Create a Bedrock Knowledge Base over a representative subset of the documents in Amazon S3, using a quick-create vector store." },
      { id: "B", text: "Ingest the full corpus into a production-sized Amazon OpenSearch Service cluster across three Availability Zones." },
      { id: "C", text: "Fine-tune a foundation model on the full document set and use it without retrieval." },
      { id: "D", text: "Skip measurement and have executives try the assistant for a week and give a verdict." },
      { id: "E", text: "Prepare a golden set of questions with reference answers and run a Bedrock RAG evaluation job that scores retrieval and generation quality." }
    ],
    answer: ["A", "E"],
    explanation: "A proof of concept should use a small representative data subset and a managed, low-setup store so the team learns quickly at low cost. A golden question set evaluated with a Bedrock RAG evaluation job turns accuracy into measurable retrieval and generation scores that leadership can use.",
    whyWrong: {
      B: "A multi-AZ production-sized cluster over the full corpus is a large cost and setup effort for a feasibility question.",
      C: "Fine-tuning is the wrong tool for large, changing document knowledge and is expensive for a proof of concept.",
      D: "Informal impressions are not repeatable and will not produce evidence of accuracy."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Bedrock Model Evaluation", "Amazon S3"], tags: ["proof-of-concept", "rag-evaluation", "golden-dataset"]
  },
  {
    id: "d1-1.2-05", domain: 1, task: "1.2", skills: ["1.2.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A company must route about 8 million short support tickets per month into 12 categories. Response time and cost per request matter much more than nuanced writing, and the team has 2,000 labeled tickets. The developers are unsure whether a small model will be accurate enough. What is the MOST cost-effective way to choose the model?",
    choices: [
      { id: "A", text: "Use the largest, most capable model available, because accuracy cannot be compromised." },
      { id: "B", text: "Choose the model with the longest context window, since longer context improves classification." },
      { id: "C", text: "Choose the model with the best public leaderboard score on general knowledge." },
      { id: "D", text: "Run an automatic model evaluation job on the labeled tickets across a small and a larger model, and choose the smallest model that meets the accuracy target." }
    ],
    answer: ["D"],
    explanation: "Model choice should be driven by measured performance on representative data against explicit requirements for accuracy, latency, and cost. Short classification tasks often work well with smaller, cheaper, faster models, and a labeled set makes the comparison objective.",
    whyWrong: {
      A: "The largest model is usually slower and more expensive per token, which is wasteful at 8 million requests per month if a smaller model is accurate enough.",
      B: "Tickets are short, so context length is irrelevant. Long context is not a measure of classification accuracy.",
      C: "General benchmarks do not measure your categories. Task-specific evaluation on your own data is what matters."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Model Evaluation"], tags: ["model-selection", "model-evaluation", "cost-optimization"]
  },
  {
    id: "d1-1.2-06", domain: 1, task: "1.2", skills: ["1.2.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "An application calls Anthropic Claude through InvokeModel by building the provider-specific JSON request body in code. Management wants the freedom to switch to Amazon Nova or another provider later by changing only a configuration value, with no changes to request-building or response-parsing code. Which solution meets this requirement?",
    choices: [
      { id: "A", text: "Use the Amazon Bedrock Converse API, which has a uniform message format across supported models, and read the model ID from configuration." },
      { id: "B", text: "Keep InvokeModel and add a separate request-building branch in the code for each provider." },
      { id: "C", text: "Use Amazon Bedrock prompt routing to decide the provider at random for each request." },
      { id: "D", text: "Create a custom model through fine-tuning, because it can accept any provider's request format." }
    ],
    answer: ["A"],
    explanation: "InvokeModel request and response bodies differ per provider, so code is coupled to one model family. The Converse API gives a consistent request and response structure for supported models, so changing the model ID, ideally from AWS AppConfig or similar, becomes a configuration change.",
    whyWrong: {
      B: "Adding a branch for every provider means code changes whenever a provider is added, which is the thing the team wants to avoid.",
      C: "Prompt routing selects between models in the same family based on prompt complexity. It is not a way to switch providers through configuration.",
      D: "A custom model is derived from one base model and keeps that base model's interface. It does not unify request formats."
    },
    services: ["Amazon Bedrock Converse API", "AWS AppConfig"], tags: ["converse-api", "provider-switching", "abstraction-layer"]
  },
  {
    id: "d1-1.2-07", domain: 1, task: "1.2", skills: ["1.2.3"], type: "single", difficulty: "hard", source: "generated",
    stem: "A European insurer's contractual terms require that prompts and responses are processed only in AWS Regions in the EU. Its single-Region application is throttled at peak. The team wants to raise availability through Amazon Bedrock cross-Region inference while respecting the data residency terms. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Use a global cross-Region inference profile so Bedrock can use any Region with spare capacity." },
      { id: "B", text: "Use an EU geography cross-Region inference profile as the model ID, and allow the profile and the underlying model in the EU Regions in the IAM policy." },
      { id: "C", text: "Use a US geography inference profile because it has the most capacity, and encrypt the prompts with AWS KMS." },
      { id: "D", text: "Disable cross-Region inference and send requests to Provisioned Throughput in a Region outside the EU." }
    ],
    answer: ["B"],
    explanation: "Geography-scoped inference profiles route requests only among the Regions in that geography, so an EU profile keeps processing inside the EU while still pooling capacity. The caller's IAM permissions must allow the inference profile and the foundation model in the destination Regions.",
    whyWrong: {
      A: "A global profile can route to Regions across the world, which can conflict with an EU-only residency requirement.",
      C: "A US profile processes data in US Regions, and KMS encryption does not change where inference runs.",
      D: "Provisioned Throughput in a non-EU Region violates the residency terms, and turning off cross-Region inference removes the capacity benefit."
    },
    services: ["Amazon Bedrock Cross-Region Inference", "AWS IAM"], tags: ["cross-region-inference", "data-residency", "inference-profiles"]
  },
  {
    id: "d1-1.2-08", domain: 1, task: "1.2", skills: ["1.2.4"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A SaaS provider serves 40 enterprise tenants. Each tenant needs a model adapted to its own terminology. The provider wants to minimize GPU cost and training time on Amazon SageMaker AI, and every tenant model must still be deployed and updated independently. Which combination of steps meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Fine-tune the base model with LoRA so that each tenant produces a small adapter instead of a full copy of the model." },
      { id: "B", text: "Fully fine-tune the base model once per tenant and deploy each copy on its own dedicated endpoint." },
      { id: "C", text: "Host the base model once on a SageMaker AI endpoint and attach each tenant's adapter as its own inference component that shares the base model's accelerators." },
      { id: "D", text: "Merge all 40 tenants' data into one dataset and train a single model for every tenant." },
      { id: "E", text: "Use Amazon Bedrock prompt routing to select the right tenant adapter." }
    ],
    answer: ["A", "C"],
    explanation: "Low-rank adaptation (LoRA) trains only small adapter weights, which cuts training cost and storage. Hosting the shared base model once and attaching adapters as inference components lets tenants share expensive accelerators while each adapter is still versioned and updated independently.",
    whyWrong: {
      B: "Full fine-tuning and 40 dedicated endpoints multiplies training and hosting cost, which is what the provider wants to avoid.",
      D: "A single merged model gives up tenant isolation, and an update for one tenant would affect all of them.",
      E: "Prompt routing chooses between models in a Bedrock family by prompt complexity. It does not select SageMaker adapters."
    },
    services: ["Amazon SageMaker AI", "SageMaker Inference Components"], tags: ["lora", "adapters", "multi-tenant", "sagemaker"]
  },
  {
    id: "d1-1.2-09", domain: 1, task: "1.2", skills: ["1.2.1"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A Japanese manufacturer needs an assistant that reads uploaded inspection reports containing photographs and charts, and answers in Japanese. A developer is shortlisting foundation models in Amazon Bedrock. Which TWO actions will best ensure that the chosen model fits the use case? (Select TWO)",
    choices: [
      { id: "A", text: "Confirm that the candidate models accept image input in the Converse API." },
      { id: "B", text: "Choose the model with the highest parameter count, since size guarantees multimodal quality." },
      { id: "C", text: "Choose the model released most recently, because newer models always support more languages." },
      { id: "D", text: "Evaluate the candidates on a sample of real Japanese reports and compare answer quality, latency, and price per request." },
      { id: "E", text: "Choose the same model that another team uses, so that the company has only one model in production." }
    ],
    answer: ["A", "D"],
    explanation: "Model selection starts with hard capability constraints, such as image input support, and then validates the remaining candidates with representative data for language quality, latency, and cost. Both steps use evidence rather than assumptions.",
    whyWrong: {
      B: "Parameter count is not a guarantee of multimodal or Japanese quality, and larger models cost more and respond more slowly.",
      C: "Release date does not guarantee language coverage or modality support. Each model's documented capabilities must be checked.",
      E: "Another team's model may not support images or Japanese well, and sharing a model is not a requirement here."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Converse API"], tags: ["model-selection", "multimodal", "capability-analysis"]
  },
  {
    id: "d1-1.3-05", domain: 1, task: "1.3", skills: ["1.3.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "An online marketplace wants to automatically generate accessible, natural-language alt text for 500,000 product photos stored in Amazon S3. The team wants the LEAST custom machine learning work. Which solution meets this requirement?",
    choices: [
      { id: "A", text: "Send the images to Amazon Titan Text Embeddings V2 and generate text from the vectors." },
      { id: "B", text: "Run Amazon Comprehend on the image files to detect entities and sentiment." },
      { id: "C", text: "Invoke a multimodal Amazon Bedrock model through the Converse API with the image as an image content block and a prompt requesting a concise description." },
      { id: "D", text: "Run Amazon Transcribe on the image files and use the transcript as alt text." }
    ],
    answer: ["C"],
    explanation: "Multimodal foundation models in Amazon Bedrock accept images alongside a text instruction, so one API call can return a description in the required tone and length. A Lambda or Step Functions loop, or batch inference, can scale this over the S3 images.",
    whyWrong: {
      A: "Titan Text Embeddings V2 is a text embedding model. It does not accept images as input and does not generate text.",
      B: "Comprehend analyzes text, not image pixels.",
      D: "Transcribe converts speech in audio or video into text. It does not describe images."
    },
    services: ["Amazon Bedrock", "Amazon Bedrock Converse API", "Amazon S3"], tags: ["multimodal", "image-processing", "converse-api"]
  },
  {
    id: "d1-1.3-06", domain: 1, task: "1.3", skills: ["1.3.2"], type: "single", difficulty: "medium", source: "generated",
    stem: "A finance team receives scanned supplier invoices as PDFs and images. It wants vendor name, invoice date, line items, and totals as structured JSON for a foundation model to reconcile against purchase orders. The team wants reliable extraction with the LEAST development effort. Which first step should the pipeline use?",
    choices: [
      { id: "A", text: "Send the raw scanned images to Amazon Titan Text Embeddings V2 to create fields." },
      { id: "B", text: "Train a custom object-detection model on Amazon SageMaker AI to find the invoice fields." },
      { id: "C", text: "Use Amazon Comprehend to detect the fields directly from the scanned image bytes." },
      { id: "D", text: "Use Amazon Textract (for example, its expense analysis capability) to extract text, key-value pairs, and line items, then pass the structured result to the foundation model." }
    ],
    answer: ["D"],
    explanation: "Textract is the managed document-extraction service. Its expense analysis returns structured vendor, date, line-item, and total data from invoices, so the model receives clean JSON rather than raw pixels, and no custom model is needed.",
    whyWrong: {
      A: "An embedding model produces vectors for search. It does not extract fields and does not accept scanned images.",
      B: "Training and hosting a custom detector is much more work than the managed capability that already exists.",
      C: "Comprehend works on text and cannot read scanned images. It needs text input from an OCR step such as Textract."
    },
    services: ["Amazon Textract", "Amazon Bedrock", "Amazon S3"], tags: ["document-processing", "ocr", "textract", "data-preprocessing"]
  },
  {
    id: "d1-1.3-07", domain: 1, task: "1.3", skills: ["1.3.3"], type: "single", difficulty: "medium", source: "generated",
    stem: "A team deployed an open-weight text-generation model to an Amazon SageMaker AI real-time endpoint. Their existing code was written for Bedrock and sends a Converse-style body with a messages array. Calls to the SageMaker endpoint now fail with validation errors. What is the correct fix?",
    choices: [
      { id: "A", text: "Call the SageMaker endpoint with invoke_endpoint, using the JSON request schema that the endpoint's serving container expects (for example, an inputs field and a parameters object), and parse the container's response format." },
      { id: "B", text: "Change the ContentType header to text/plain so that SageMaker converts the message into the right schema." },
      { id: "C", text: "Send the request to the bedrock-runtime client by using the SageMaker endpoint name as the modelId." },
      { id: "D", text: "Increase the endpoint instance size so that it can parse the larger Converse body." }
    ],
    answer: ["A"],
    explanation: "SageMaker AI endpoints expose the inference container's own contract, and SageMaker does not translate between schemas. The application must format the payload according to the container's documented input format and parse its output format. Request formatting differs by model and serving stack.",
    whyWrong: {
      B: "Changing the content type does not change the schema. The container still receives a payload that it cannot interpret.",
      C: "The bedrock-runtime client invokes Bedrock models and inference profiles, not SageMaker endpoint names.",
      D: "The errors are caused by an input schema mismatch, not by capacity."
    },
    services: ["Amazon SageMaker AI", "Amazon Bedrock Converse API"], tags: ["request-formatting", "sagemaker-endpoint", "payload-schema"]
  },
  {
    id: "d1-1.3-08", domain: 1, task: "1.3", skills: ["1.3.4"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A company scrapes thousands of web pages into Amazon S3 before embedding them for retrieval. The pages contain HTML tags, navigation boilerplate, inconsistent whitespace and Unicode, and many near-identical duplicates. Retrieval returns repetitive, noisy chunks. Which combination of steps will MOST improve the quality of the data before embedding? (Select TWO)",
    choices: [
      { id: "A", text: "Add an AWS Lambda preprocessing step that strips HTML and boilerplate and normalizes whitespace and Unicode." },
      { id: "B", text: "Embed the raw HTML as it is, because the embedding model can ignore markup." },
      { id: "C", text: "Compute content hashes (or similarity checks) to remove exact and near-duplicate pages before embedding." },
      { id: "D", text: "Increase the number of retrieved results so that duplicates are diluted." },
      { id: "E", text: "Run every page through Amazon Transcribe to standardize the text." }
    ],
    answer: ["A", "C"],
    explanation: "Cleaning and normalizing text removes tokens that carry no meaning, and deduplicating prevents the same content from filling the top-k results. Both improve the embedding vectors and retrieval quality before any model sees the data.",
    whyWrong: {
      B: "Markup and boilerplate dilute the chunk's meaning and waste embedding tokens. Models do not reliably ignore them.",
      D: "Retrieving more results adds more duplicate noise and token cost instead of fixing the cause.",
      E: "Transcribe converts speech to text and has no role in cleaning web text."
    },
    services: ["AWS Lambda", "Amazon S3", "Amazon Bedrock"], tags: ["data-normalization", "deduplication", "text-cleaning"]
  },
  {
    id: "d1-1.4-05", domain: 1, task: "1.4", skills: ["1.4.3"], type: "single", difficulty: "hard", source: "generated",
    stem: "A semantic-search index on an Amazon OpenSearch Service domain was created with a single primary shard and now holds roughly 400 GB of vector data. Query latency has grown and the data nodes are uneven, because one node holds the whole shard. The team needs to distribute the index evenly across the data nodes. What should they do?",
    choices: [
      { id: "A", text: "Increase the number of replica shards, because replicas split the primary shard's data." },
      { id: "B", text: "Create a new index with more primary shards, sized so that each shard stays within the recommended size range of tens of gigabytes, and reindex the data into it." },
      { id: "C", text: "Raise the HNSW ef_construction value to rebuild the graph with better balance." },
      { id: "D", text: "Change the refresh interval to a higher value." }
    ],
    answer: ["B"],
    explanation: "The number of primary shards is fixed when an index is created, and a shard cannot span nodes. To spread data and query work, create an index with more primary shards, sized according to OpenSearch guidance of roughly tens of GB per shard, and reindex.",
    whyWrong: {
      A: "Replicas are copies of the primary shards and help with availability and read throughput, but they do not divide a primary shard's data.",
      C: "ef_construction affects graph quality and build time, not how data is distributed across nodes.",
      D: "The refresh interval affects how quickly documents become searchable and has nothing to do with shard size."
    },
    services: ["Amazon OpenSearch Service"], tags: ["sharding", "opensearch", "vector-performance", "reindex"]
  },
  {
    id: "d1-1.4-06", domain: 1, task: "1.4", skills: ["1.4.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "An ecommerce company keeps product embeddings in Amazon OpenSearch Service. Price, stock level, and per-region availability change thousands of times per hour, but the product descriptions that were embedded rarely change. Re-writing documents in the vector index for each attribute change is driving up indexing load. Which architecture reduces this load while keeping answers current?",
    choices: [
      { id: "A", text: "Re-embed and re-index every product each time any attribute changes." },
      { id: "B", text: "Store the volatile attributes as extra fields in the same vector document and update them with the embedding every time." },
      { id: "C", text: "Keep only the embedding and a product ID in the vector index, store the frequently changing attributes in Amazon DynamoDB, and join them by product ID after retrieval." },
      { id: "D", text: "Move the whole catalog into Amazon S3 and rely on S3 object metadata to answer attribute queries." }
    ],
    answer: ["C"],
    explanation: "Separating stable, expensive-to-regenerate vectors from fast-changing attributes avoids reindexing. DynamoDB handles high-rate key-based updates cheaply, and the application enriches retrieved product IDs with current values before passing context to the model.",
    whyWrong: {
      A: "Re-embedding on every attribute change wastes embedding spend and indexing capacity, since the description text has not changed.",
      B: "Updating the vector document for every attribute change keeps the same indexing load that the team wants to reduce.",
      D: "S3 object metadata is not a low-latency, high-update-rate attribute store and cannot be queried like a database."
    },
    services: ["Amazon DynamoDB", "Amazon OpenSearch Service"], tags: ["vector-store", "metadata-store", "dynamodb", "architecture"]
  },
  {
    id: "d1-1.4-07", domain: 1, task: "1.4", skills: ["1.4.4"], type: "single", difficulty: "medium", source: "generated",
    stem: "A company's internal knowledge lives in Atlassian Confluence spaces. It wants a RAG assistant over these pages that stays in sync as pages are edited, using the LEAST custom integration code. Which solution meets these requirements?",
    choices: [
      { id: "A", text: "Write a nightly script on Amazon EC2 that exports all Confluence pages to Amazon S3, and then re-embeds all content." },
      { id: "B", text: "Copy the pages by hand into a document and upload it to Amazon S3 once per quarter." },
      { id: "C", text: "Ask the foundation model to answer from its training data, because it was trained on public Confluence content." },
      { id: "D", text: "Create an Amazon Bedrock Knowledge Base with the Confluence data source connector, and sync the data source on a schedule or on demand." }
    ],
    answer: ["D"],
    explanation: "Bedrock Knowledge Bases provides managed data source connectors, including Confluence, that crawl the content, chunk and embed it, and sync only changed content. This is the least-code way to connect an internal wiki to a RAG application.",
    whyWrong: {
      A: "A custom exporter and full re-embedding adds code, a server to operate, and unnecessary embedding cost on every run.",
      B: "Quarterly manual copies leave the index stale and rely on manual effort.",
      C: "A foundation model has no knowledge of private internal pages and would hallucinate."
    },
    services: ["Amazon Bedrock Knowledge Bases"], tags: ["data-source-connector", "confluence", "integration", "knowledge-base"]
  },
  {
    id: "d1-1.4-08", domain: 1, task: "1.4", skills: ["1.4.2"], type: "single", difficulty: "hard", source: "generated",
    stem: "A multi-tenant SaaS product uses one Amazon Bedrock Knowledge Base for all customers. Each document is ingested with a tenantId metadata attribute. A security review found that the browser sends the tenantId that the backend uses in the retrieval filter. A malicious user could change it and read another tenant's content. How should the developer fix this?",
    choices: [
      { id: "A", text: "Tell the model in the system prompt never to reveal other tenants' data." },
      { id: "B", text: "Hash the tenantId in the browser before sending it to the backend." },
      { id: "C", text: "Hide the tenantId in the browser by obfuscating the JavaScript." },
      { id: "D", text: "Derive the tenantId on the server from the authenticated identity (for example, a verified claim in the user's JWT) and always add it as a metadata filter in the Retrieve or RetrieveAndGenerate call." }
    ],
    answer: ["D"],
    explanation: "Metadata filters applied inside the retrieval call restrict which chunks can be returned, but the filter value must come from a trusted source. Deriving it server-side from verified identity claims means that the client cannot choose which tenant to query.",
    whyWrong: {
      A: "Prompt instructions are not an access control. The other tenant's chunks would already be in the model's context.",
      B: "Hashing client-supplied input does not prove who the caller is, and a user could still send another tenant's value.",
      C: "Obfuscation does not stop a user from changing requests, so it is not a security control."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Cognito"], tags: ["metadata-filtering", "multi-tenancy", "access-control", "knowledge-base"]
  },
  {
    id: "d1-1.4-09", domain: 1, task: "1.4", skills: ["1.4.3", "1.4.1"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A company builds one semantic-search service over three specialized domains: legal contracts, engineering drawings' text, and HR policies. Each domain has a different best-fit embedding model and different access rules. A single index with one vector dimension cannot serve all three well. Which combination of steps best meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Create a separate OpenSearch index (or collection) per domain, each with the vector dimension and embedding model suited to that domain and its own access policy." },
      { id: "B", text: "Put all domains in one index and pad shorter vectors with zeros so that all vectors have the same length." },
      { id: "C", text: "Add a query router, for example a small Lambda function that uses a Bedrock model to classify the question, which queries the matching index or indexes." },
      { id: "D", text: "Embed all queries with whichever model is cheapest, regardless of which index they will search." },
      { id: "E", text: "Store all vectors in a single index without any domain field and use the prompt to ask the model to ignore other domains." }
    ],
    answer: ["A", "C"],
    explanation: "A multi-index approach lets each domain use its own embedding model, vector dimension, tuning, and permissions. A router then sends each question to the right index, and each query must be embedded with the same model that built the target index.",
    whyWrong: {
      B: "Zero-padding vectors from different embedding models does not make them comparable. Vectors from different models are not in the same space.",
      D: "A query vector must come from the same model and dimension as the index being searched, or similarity scores are meaningless.",
      E: "Prompt instructions cannot enforce domain separation or access rules, and unrelated chunks would still be retrieved."
    },
    services: ["Amazon OpenSearch Service", "Amazon Bedrock", "AWS Lambda"], tags: ["multi-index", "query-routing", "embedding-models", "domain-separation"]
  },
  {
    id: "d1-1.4-10", domain: 1, task: "1.4", skills: ["1.4.5"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A custom RAG pipeline indexes support articles stored as items in an Amazon DynamoDB table into Amazon OpenSearch Service. Articles are edited and deleted continuously. The index is showing stale text and answers that cite deleted articles, and the team wants near-real-time freshness without rebuilding the index. Which combination of steps will meet these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "Enable DynamoDB Streams and trigger an AWS Lambda function that re-embeds only the changed item and upserts it, and removes the vector document on a REMOVE event." },
      { id: "B", text: "Drop and rebuild the whole index every night from a full table scan." },
      { id: "C", text: "Use the article's primary key as the vector document ID so each update overwrites the previous version instead of creating a duplicate." },
      { id: "D", text: "Append every new version with a random document ID and ask the model to prefer the newest by timestamp." },
      { id: "E", text: "Set an Amazon CloudWatch alarm that notifies the team when the index becomes stale." }
    ],
    answer: ["A", "C"],
    explanation: "A change stream gives real-time change detection, so only affected items are re-embedded, and deletes are propagated. A deterministic document ID makes updates idempotent, so retries do not create duplicates and stale versions are replaced.",
    whyWrong: {
      B: "A nightly full rebuild is slow and costly, and the index is stale for up to a day in between.",
      D: "Random IDs leave old versions and deleted content in the index, where they can still be retrieved.",
      E: "An alarm only reports the problem. It does not update the index."
    },
    services: ["Amazon DynamoDB Streams", "AWS Lambda", "Amazon OpenSearch Service"], tags: ["change-detection", "incremental-update", "idempotency", "data-maintenance"]
  },
  {
    id: "d1-1.5-05", domain: 1, task: "1.5", skills: ["1.5.1"], type: "single", difficulty: "medium", source: "generated",
    stem: "A publisher's knowledge base holds long essays where topics shift at irregular points. Fixed-size chunks often split an idea in half or merge two unrelated topics, which hurts retrieval. The team accepts additional ingestion cost in exchange for chunks that follow meaning. Which Bedrock Knowledge Bases chunking strategy should they choose?",
    choices: [
      { id: "A", text: "Fixed-size chunking with a larger chunk size." },
      { id: "B", text: "Semantic chunking, which uses an embedding model to place boundaries where the meaning changes." },
      { id: "C", text: "No chunking, so each essay is one chunk." },
      { id: "D", text: "Fixed-size chunking with zero overlap and a very small chunk size." }
    ],
    answer: ["B"],
    explanation: "Semantic chunking places boundaries based on meaning rather than a fixed token count, so a chunk tends to contain one coherent idea. It calls a foundation model during ingestion, so it adds cost relative to fixed-size chunking.",
    whyWrong: {
      A: "Bigger fixed chunks still cut at arbitrary points and combine even more unrelated topics.",
      C: "Embedding a whole essay as one vector blurs several topics and may exceed the embedding model's input limit.",
      D: "Smaller chunks with no overlap fragment ideas even more."
    },
    services: ["Amazon Bedrock Knowledge Bases"], tags: ["chunking", "semantic-chunking", "ingestion-cost"]
  },
  {
    id: "d1-1.5-06", domain: 1, task: "1.5", skills: ["1.5.1"], type: "single", difficulty: "hard", source: "generated",
    stem: "A law firm indexes contracts whose structure is numbered clauses such as 4.2.1. Built-in chunking strategies split clauses mid-sentence and separate defined terms from the clauses that use them. The firm wants chunk boundaries that follow the clause numbering, while keeping the Bedrock Knowledge Base as the managed ingestion and storage layer. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Bypass the Knowledge Base and ask the foundation model to read every contract on each question." },
      { id: "B", text: "Increase the fixed chunk size to 8,000 tokens so that clauses are less likely to be split." },
      { id: "C", text: "Convert the contracts to images so that chunking follows page layout." },
      { id: "D", text: "Configure a custom transformation in the Knowledge Base that runs an AWS Lambda function to apply clause-aware chunking, and let the Knowledge Base embed and store the resulting chunks." }
    ],
    answer: ["D"],
    explanation: "Bedrock Knowledge Bases supports custom transformation logic with an AWS Lambda function during ingestion. A function can implement domain-specific chunking, such as splitting on clause numbers, while the service still handles embedding and storing the chunks.",
    whyWrong: {
      A: "Reading every contract on every question exceeds context limits and is slow and costly.",
      B: "Larger chunks may still cut clauses at arbitrary positions and dilute retrieval precision.",
      C: "Images do not create clause-aware text boundaries and add an unnecessary OCR step."
    },
    services: ["Amazon Bedrock Knowledge Bases", "AWS Lambda"], tags: ["chunking", "custom-chunking", "lambda-transformation"]
  },
  {
    id: "d1-1.5-07", domain: 1, task: "1.5", skills: ["1.5.5"], type: "single", difficulty: "medium", source: "generated",
    stem: "Users of an HR assistant type very short, vague queries such as \"PTO carryover?\" while the policy text uses formal language such as \"unused annual leave balance rollover\". Retrieval misses the right policy chunks. The team wants to improve recall without re-indexing the documents. Which solution is MOST appropriate?",
    choices: [
      { id: "A", text: "Rewrite the embedding model's dimension to a larger value and re-embed all documents." },
      { id: "B", text: "Disable the system prompt so that the model does not constrain the query." },
      { id: "C", text: "Add a query expansion step that uses a Bedrock model to rewrite the query into fuller phrasing with synonyms and related terms before retrieval." },
      { id: "D", text: "Limit retrieval to the top 1 result so that only the best chunk is returned." }
    ],
    answer: ["C"],
    explanation: "Query expansion or rewriting bridges the vocabulary gap between terse user phrasing and formal documents. Because it changes only the query that is sent to the retriever, no re-indexing is required.",
    whyWrong: {
      A: "Changing dimensions needs a new index and a full re-embed, and does not fix the vocabulary mismatch by itself.",
      B: "The system prompt governs generation, not which chunks are retrieved.",
      D: "Returning one result lowers recall, so the correct chunk is even less likely to be included."
    },
    services: ["Amazon Bedrock", "AWS Lambda", "Amazon Bedrock Knowledge Bases"], tags: ["query-expansion", "query-rewriting", "retrieval-recall"]
  },
  {
    id: "d1-1.5-08", domain: 1, task: "1.5", skills: ["1.5.6"], type: "single", difficulty: "hard", source: "generated",
    stem: "A support assistant should search the knowledge base only when a question needs company-specific facts, and should answer greetings and general questions directly without paying for a retrieval call. The team uses the Amazon Bedrock Converse API from AWS Lambda. Which design meets this requirement?",
    choices: [
      { id: "A", text: "Define a search_knowledge_base tool in the Converse toolConfig. When the model returns a toolUse request, call the Knowledge Base Retrieve API and return the chunks to the model as a toolResult." },
      { id: "B", text: "Retrieve for every message and ask the model in the prompt to ignore irrelevant results." },
      { id: "C", text: "Use a hard-coded list of keywords in Lambda to decide whether to retrieve." },
      { id: "D", text: "Fine-tune the model so that it memorizes all company documents." }
    ],
    answer: ["A"],
    explanation: "Function calling (tool use) lets the model decide when external retrieval is needed. The application executes the tool, here a vector search, and returns the result in a toolResult message, so retrieval is paid for only when the model asks for it.",
    whyWrong: {
      B: "Always retrieving pays for unneeded searches and adds irrelevant context to simple queries.",
      C: "A keyword list is brittle and cannot understand intent the way the model can.",
      D: "Memorizing documents in weights makes answers stale and prevents citations, and it is not a retrieval mechanism."
    },
    services: ["Amazon Bedrock Converse API", "Amazon Bedrock Knowledge Bases", "AWS Lambda"], tags: ["function-calling", "tool-use", "retrieval-tool"]
  },
  {
    id: "d1-1.5-09", domain: 1, task: "1.5", skills: ["1.5.3", "1.5.6"], type: "single", difficulty: "medium", source: "generated",
    stem: "A team wants to use its own carefully tuned prompt template, include extra context from a second system, and call a foundation model of its choice, while still using an Amazon Bedrock Knowledge Base for vector search. Which API usage pattern fits?",
    choices: [
      { id: "A", text: "Call RetrieveAndGenerate and accept the default prompt and the model selection options it provides." },
      { id: "B", text: "Call the Retrieve API, assemble the prompt in application code with the returned chunks and the extra context, and then call the Converse API with the chosen model." },
      { id: "C", text: "Call the InvokeModel API with the Knowledge Base ID as the model ID." },
      { id: "D", text: "Export the vectors from the Knowledge Base and build a custom search service." }
    ],
    answer: ["B"],
    explanation: "Retrieve returns the matching chunks with their scores and sources and leaves prompt assembly and model invocation to the application. That is the pattern when you need full control over the prompt, extra context, or the model that is used for generation.",
    whyWrong: {
      A: "RetrieveAndGenerate is the convenient managed path, but it limits how much control you have over the final prompt and the extra context.",
      C: "A Knowledge Base ID is not a model ID, and InvokeModel does not perform retrieval.",
      D: "Exporting vectors and rebuilding search is a large amount of work that the Retrieve API already avoids."
    },
    services: ["Amazon Bedrock Knowledge Bases", "Amazon Bedrock Converse API"], tags: ["retrieve-api", "prompt-assembly", "rag-patterns"]
  },
  {
    id: "d1-1.5-10", domain: 1, task: "1.5", skills: ["1.5.6"], type: "multi", difficulty: "hard", source: "generated",
    stem: "Five teams each build their own agent and each wrote its own boto3 code to search the same company knowledge base, with differing result formats and error handling. Platform engineering wants one consistent, discoverable access mechanism for all current and future FM clients. Which combination of steps meets this requirement? (Select TWO)",
    choices: [
      { id: "A", text: "Implement a Model Context Protocol (MCP) server, for example on AWS Lambda or Amazon ECS, that exposes a search tool and calls the Knowledge Base Retrieve API." },
      { id: "B", text: "Have each team continue to copy the boto3 retrieval snippet into its own codebase." },
      { id: "C", text: "Have the agents connect to the MCP server using MCP client libraries and discover its tools, so every client sees the same tool definition and result format." },
      { id: "D", text: "Put the vector database credentials in each agent's system prompt so that models can query it directly." },
      { id: "E", text: "Create a separate custom REST API for each team with its own response schema." }
    ],
    answer: ["A", "C"],
    explanation: "MCP standardizes how models and agents discover and call tools. One server exposing a retrieval tool, plus MCP clients in each agent, gives a single, versioned access pattern and consistent result format for every FM-based client.",
    whyWrong: {
      B: "Copying snippets keeps the inconsistency and multiplies maintenance.",
      D: "Placing credentials in prompts is a serious security risk, and models cannot query a database directly without a tool layer.",
      E: "Per-team APIs with different schemas recreate the inconsistency the platform team wants to remove."
    },
    services: ["Model Context Protocol", "AWS Lambda", "Amazon ECS", "Amazon Bedrock Knowledge Bases"], tags: ["mcp", "tool-standardization", "retrieval-access"]
  },
  {
    id: "d1-1.5-11", domain: 1, task: "1.5", skills: ["1.5.2"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A global support organization has documents in English, German, and Japanese, and users ask questions in any of these languages. The team is selecting an embedding solution on Amazon Bedrock for the RAG index. Which combination of steps will lead to the best choice? (Select TWO)",
    choices: [
      { id: "A", text: "Shortlist embedding models that explicitly support multiple languages, such as Titan Text Embeddings V2 or Cohere Embed Multilingual." },
      { id: "B", text: "Pick the embedding model with the largest vector dimension, because it will be best in every language." },
      { id: "C", text: "Pick an English-only embedding model and trust that other languages will be matched by character overlap." },
      { id: "D", text: "Build a labeled set of queries and expected documents in all three languages, and compare candidates with retrieval metrics such as recall at k." },
      { id: "E", text: "Choose the embedding model by the name of its provider, since the same provider's text model will be used for generation." }
    ],
    answer: ["A", "D"],
    explanation: "Language coverage is a hard requirement for an embedding model, so the shortlist must include multilingual models. Domain and language fit is then validated empirically with retrieval metrics on representative labeled queries, together with dimension, cost, and latency trade-offs.",
    whyWrong: {
      B: "A larger dimension raises storage cost and does not guarantee better multilingual quality.",
      C: "English-only models do not reliably align meaning across other languages, and character overlap is not semantic similarity.",
      E: "The generation model and the embedding model are independent choices. Provider name does not determine retrieval quality."
    },
    services: ["Amazon Titan Text Embeddings V2", "Amazon Bedrock", "Cohere Embed"], tags: ["embeddings", "multilingual", "retrieval-metrics", "model-selection"]
  },
  {
    id: "d1-1.6-05", domain: 1, task: "1.6", skills: ["1.6.1", "1.6.5"], type: "single", difficulty: "medium", source: "generated",
    stem: "A prompt engineer needs to compare three wordings of a customer-reply prompt, each run against two different foundation models, and keep the best one as a managed, reusable artifact. The engineer wants to compare outputs side by side in one place before choosing. Which feature should the engineer use?",
    choices: [
      { id: "A", text: "Save each wording in a separate Amazon S3 object and compare them manually." },
      { id: "B", text: "Create a CloudWatch dashboard that shows invocation counts for each prompt." },
      { id: "C", text: "Use Amazon Bedrock Prompt Management and create prompt variants, then compare the variants' outputs side by side in the prompt builder." },
      { id: "D", text: "Fine-tune a different model for each wording." }
    ],
    answer: ["C"],
    explanation: "Prompt Management supports creating variants of a prompt, with different text, model, or inference settings, and comparing their results side by side. The chosen variant can then be saved as an immutable version for use in applications.",
    whyWrong: {
      A: "S3 objects have no variant comparison tooling, and it does not run the prompts for you.",
      B: "Invocation counts tell you about usage, not about response quality.",
      D: "Fine-tuning is a heavy, expensive process and is not how prompt wordings are compared."
    },
    services: ["Amazon Bedrock Prompt Management"], tags: ["prompt-variants", "prompt-management", "prompt-iteration"]
  },
  {
    id: "d1-1.6-06", domain: 1, task: "1.6", skills: ["1.6.5"], type: "single", difficulty: "hard", source: "generated",
    stem: "An insurer uses a foundation model to determine whether a claim is covered by checking several policy conditions. The model often gives a confident final verdict that ignores one of the conditions. The application parses only the verdict. Which prompt change is MOST likely to improve accuracy while still producing output the application can parse?",
    choices: [
      { id: "A", text: "Raise the temperature to 1.0 so that the model explores more possibilities." },
      { id: "B", text: "Ask for the verdict only and set maxTokens to a very small number." },
      { id: "C", text: "Remove the policy conditions from the prompt to reduce confusion." },
      { id: "D", text: "Instruct the model to reason step by step through each condition inside a thinking section and then give the final verdict in a separate, clearly delimited answer tag that the application extracts." }
    ],
    answer: ["D"],
    explanation: "Chain-of-thought style instructions make the model work through each condition before it commits to a verdict, which improves multi-step reasoning. Putting the final output in a delimited tag keeps the parsing reliable, at the cost of extra output tokens.",
    whyWrong: {
      A: "A higher temperature increases variability and makes consistent condition-checking less likely.",
      B: "Forcing a verdict with no room for reasoning is the behavior that causes the skipped condition.",
      C: "Removing the conditions removes the information the model needs to decide."
    },
    services: ["Amazon Bedrock"], tags: ["chain-of-thought", "prompt-engineering", "structured-output"]
  },
  {
    id: "d1-1.6-07", domain: 1, task: "1.6", skills: ["1.6.2"], type: "single", difficulty: "hard", source: "generated",
    stem: "A travel assistant sometimes receives requests such as \"Change my booking\" without the booking reference or the new date. Currently the model guesses and produces wrong actions. The team wants the system to detect missing information, ask the user a targeted question, remember the partial request across turns, and discard stale sessions automatically. Which design meets these requirements?",
    choices: [
      { id: "A", text: "Increase the temperature so that the model produces more creative answers to vague requests." },
      { id: "B", text: "Reject every incomplete request with a generic error message." },
      { id: "C", text: "Store each user's whole conversation history in the browser's local storage and trust the client to send it back." },
      { id: "D", text: "Use an AWS Step Functions workflow with a Choice state that checks required fields extracted by the model, asks a clarifying question when something is missing, and keeps session state in Amazon DynamoDB with a TTL attribute." }
    ],
    answer: ["D"],
    explanation: "A clarification workflow models the required slots explicitly, so the system asks for what is missing instead of guessing. DynamoDB stores the partial state between turns, and its TTL feature expires abandoned sessions without any cleanup code.",
    whyWrong: {
      A: "Creativity makes guessing worse, and the problem is missing facts rather than style.",
      B: "A generic rejection gives a poor experience and discards what the user already provided.",
      C: "Client-held history can be tampered with or lost, and it is not a governed, server-side state store."
    },
    services: ["AWS Step Functions", "Amazon DynamoDB", "Amazon Bedrock"], tags: ["clarification-workflow", "conversation-state", "dynamodb-ttl", "interactive-ai"]
  },
  {
    id: "d1-1.6-08", domain: 1, task: "1.6", skills: ["1.6.3"], type: "single", difficulty: "medium", source: "generated",
    stem: "An auditor asks the company to show who created, modified, or published each version of its prompt templates in Amazon Bedrock Prompt Management and when it happened. The company wants this evidence with the LEAST effort and without changing application code. Which solution meets this requirement?",
    choices: [
      { id: "A", text: "Enable model invocation logging, because it records every prompt edit." },
      { id: "B", text: "Ask developers to record each edit in a shared spreadsheet." },
      { id: "C", text: "Use AWS CloudTrail management events for the Bedrock prompt APIs (for example, create, update, and create-version calls), delivered to Amazon S3 or CloudWatch Logs for retention and search." },
      { id: "D", text: "Enable Amazon Inspector on the Lambda functions that call the prompts." }
    ],
    answer: ["C"],
    explanation: "CloudTrail records API activity, including the identity, time, and parameters of control-plane calls that create or update prompts and versions. Delivering the trail to S3 or CloudWatch Logs provides durable, searchable audit evidence without touching application code.",
    whyWrong: {
      A: "Invocation logging records model requests and responses at runtime. It does not record edits made to a prompt in Prompt Management.",
      B: "A spreadsheet is manual and unreliable, and it is not tamper-evident audit evidence.",
      D: "Inspector reports on vulnerabilities, not on who changed a prompt."
    },
    services: ["AWS CloudTrail", "Amazon Bedrock Prompt Management", "Amazon S3"], tags: ["prompt-governance", "cloudtrail", "audit"]
  },
  {
    id: "d1-1.6-09", domain: 1, task: "1.6", skills: ["1.6.5", "1.6.4"], type: "multi", difficulty: "medium", source: "generated",
    stem: "A downstream billing service requires the foundation model to return a JSON object with exact field names. Roughly 4 percent of responses currently contain extra prose or a missing field and cause failures. Which combination of steps will MOST improve reliability? (Select TWO)",
    choices: [
      { id: "A", text: "Specify the exact output schema in the prompt, and include one or two example outputs (few-shot examples) that show the required format." },
      { id: "B", text: "Set the temperature to 1.0 so that the model can find more valid formats." },
      { id: "C", text: "Validate every response in a Lambda function against the schema, and retry with the validation error included in the prompt when it fails." },
      { id: "D", text: "Reduce maxTokens to 20 so that the model has no room to add prose." },
      { id: "E", text: "Ask the model politely, in lowercase, to avoid extra text and make no other change." }
    ],
    answer: ["A", "C"],
    explanation: "Clear format specifications and examples raise the share of well-formed outputs, and programmatic validation with a bounded retry catches the remainder before it reaches the billing service. Together they form a prompt-plus-verification quality loop.",
    whyWrong: {
      B: "A higher temperature increases output variability, which makes format errors more likely.",
      D: "A very low token limit truncates valid JSON mid-object and causes more failures.",
      E: "A vague request with no schema or examples adds little, and nothing verifies the result."
    },
    services: ["Amazon Bedrock", "AWS Lambda"], tags: ["structured-output", "output-validation", "few-shot", "retry"]
  },
  {
    id: "d1-1.6-10", domain: 1, task: "1.6", skills: ["1.6.6"], type: "multi", difficulty: "hard", source: "generated",
    stem: "A team builds an Amazon Bedrock Prompt Flow for a policy question assistant. The flow must first retrieve relevant passages from an Amazon Bedrock Knowledge Base, then generate an answer with a prompt, and finally run custom code that masks internal ticket numbers in the answer before output. Which combination of flow nodes meets these requirements? (Select TWO)",
    choices: [
      { id: "A", text: "A Knowledge Base node to retrieve the passages (or retrieve and generate) from the Knowledge Base." },
      { id: "B", text: "A dedicated Amazon Athena node to run the ticket-number masking logic." },
      { id: "C", text: "A Lambda function node to run the custom masking logic as a post-processing step." },
      { id: "D", text: "An AWS Glue node that rewrites the answer text before output." },
      { id: "E", text: "A CloudFormation node that deploys a masking stack at runtime." }
    ],
    answer: ["A", "C"],
    explanation: "Prompt Flows provides node types for retrieval from a Knowledge Base and for invoking an AWS Lambda function, alongside prompt, condition, and input/output nodes. Combining them gives a visual chain that retrieves, generates, and post-processes without a separate orchestrator.",
    whyWrong: {
      B: "There is no Athena node in Prompt Flows, and Athena is a query engine, not a text-masking step.",
      D: "Glue is an ETL service and is not a flow node type for rewriting a single answer.",
      E: "CloudFormation is an infrastructure deployment tool and is not a flow node or a runtime text-processing tool."
    },
    services: ["Amazon Bedrock Prompt Flows", "Amazon Bedrock Knowledge Bases", "AWS Lambda"], tags: ["prompt-flows", "lambda-node", "knowledge-base-node", "post-processing"]
  }
);
