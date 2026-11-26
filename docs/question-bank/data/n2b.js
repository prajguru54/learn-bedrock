window.QB = window.QB || [];
window.QB.push(
  // ================= Task 2.3 =================
  {
    id: "d2-2.3-10",
    domain: 2, task: "2.3", skills: ["2.3.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "Your team is building a support assistant that must answer from Salesforce case records. The records change hourly, and the team wants fresh data in an Amazon Bedrock knowledge base with the LEAST custom integration code. Which approach meets these requirements?",
    choices: [
      { id: "A", text: "Write a Lambda function that pages through the Salesforce REST API every hour, handles OAuth token refresh, and writes each case to S3 as a JSON object." },
      { id: "B", text: "Create an Amazon AppFlow flow with Salesforce as the source and S3 as the destination on an hourly schedule, then sync the knowledge base data source after each run." },
      { id: "C", text: "Create an Amazon AppFlow flow with S3 as the source and Salesforce as the destination, and let the knowledge base read directly from Salesforce." },
      { id: "D", text: "Ask a Salesforce administrator to export all cases to CSV each week with Data Loader and upload the file to the knowledge base S3 bucket." }
    ],
    answer: ["B"],
    explanation: "Amazon AppFlow is a managed integration service with a native Salesforce connector, scheduled and incremental transfers, and S3 as a destination. Landing the data in S3 gives the knowledge base a supported data source, and an ingestion sync after each run keeps the index current without any API-polling code.",
    whyWrong: {
      "A": "This works but reimplements pagination, token refresh and error handling that AppFlow already provides, so it is the opposite of least custom code.",
      "C": "The flow direction is reversed: this would push S3 data into Salesforce. A knowledge base also cannot read from Salesforce through an AppFlow destination.",
      "D": "A weekly manual export cannot meet an hourly freshness requirement and adds a human step."
    },
    services: ["Amazon AppFlow", "Amazon S3", "Amazon Bedrock Knowledge Bases"],
    tags: ["appflow-salesforce", "saas-ingestion", "knowledge-base-sync"]
  },
  {
    id: "d2-2.3-11",
    domain: 2, task: "2.3", skills: ["2.3.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A telecom contact center uses Amazon Connect with an Amazon Lex bot that handles five known intents. Callers often say things the bot cannot match, and the team wants those utterances answered by an Amazon Bedrock model instead of the generic \"I did not understand\" reply. Which TWO actions should the team take? (Select TWO.)",
    choices: [
      { id: "A", text: "Enable fulfillment through a Lambda function on the built-in AMAZON.FallbackIntent, so unmatched utterances reach code that can call the Bedrock Converse API." },
      { id: "B", text: "Add a Lambda block at the start of every contact flow that sends all caller speech to Bedrock first and only calls Lex if the model returns an error." },
      { id: "C", text: "Have the Lambda function pass the transcript and session attributes to Bedrock, then return the model text to Lex in a valid Lex response message structure." },
      { id: "D", text: "Delete the existing intents and send raw audio from Amazon Connect directly to the InvokeModel API for every caller turn." },
      { id: "E", text: "Raise the Lex confidence threshold to 1.0 so that every utterance falls to the fallback intent and the model handles all of them." }
    ],
    answer: ["A", "C"],
    explanation: "The fallback intent is Lex's hook for utterances that match no intent, so attaching Lambda fulfillment there routes only unmatched speech to Bedrock. The function must call the model with the transcript and return a response in the shape Lex expects so Connect can speak it to the caller. Known intents keep their cheap, deterministic handling.",
    whyWrong: {
      "B": "Sending every utterance to the model first bypasses Lex for the five known intents, raising cost and latency and discarding the deterministic handling the bot already provides.",
      "D": "Bedrock model APIs do not take raw telephony audio as a Connect integration, and removing the intents throws away working functionality.",
      "E": "A threshold of 1.0 would make even clear intents fail to match, which degrades the bot instead of adding a fallback path."
    },
    services: ["Amazon Connect", "Amazon Lex", "AWS Lambda", "Amazon Bedrock"],
    tags: ["lex-fallback-intent", "contact-center", "connect-bedrock-integration"]
  },
  {
    id: "d2-2.3-12",
    domain: 2, task: "2.3", skills: ["2.3.1"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A bank's GenAI orchestration service exposes a JSON API through Amazon API Gateway. One step must call a legacy SOAP service in the bank's data center, reachable from the VPC over AWS Direct Connect at private IP addresses. The SOAP endpoint must never be exposed to the internet. Which design meets these requirements?",
    choices: [
      { id: "A", text: "Configure a public HTTP integration to the data center's NAT address and restrict the SOAP firewall to the API Gateway service IP ranges." },
      { id: "B", text: "Put the integration Lambda function in a public subnet and send the SOAP request to the data center over an internet gateway with TLS." },
      { id: "C", text: "Create an API Gateway VPC link to a Network Load Balancer whose target group uses IP targets for the on-premises servers, and use a mapping template to convert JSON into the SOAP envelope." },
      { id: "D", text: "Create a gateway VPC endpoint for API Gateway, add the on-premises addresses to its route table, and forward the JSON body unchanged." }
    ],
    answer: ["C"],
    explanation: "A VPC link lets API Gateway reach private resources through a Network Load Balancer. An NLB target group with IP targets can include on-premises addresses reachable over Direct Connect, so traffic stays on private paths. A request mapping template can transform the JSON payload into the XML SOAP envelope, so no extra service is needed.",
    whyWrong: {
      "A": "A public integration sends traffic over the internet and relies on IP allow-listing, which contradicts the never-exposed requirement.",
      "B": "Using an internet gateway exposes the path to the internet and ignores the available Direct Connect link.",
      "D": "Gateway VPC endpoints exist only for S3 and DynamoDB, and they do not forward traffic to on-premises hosts. The JSON also still needs conversion to SOAP."
    },
    services: ["Amazon API Gateway", "Network Load Balancer", "AWS Direct Connect"],
    tags: ["api-gateway-vpc-link", "legacy-soap-integration", "hybrid-connectivity"]
  },
  {
    id: "d2-2.3-13",
    domain: 2, task: "2.3", skills: ["2.3.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A logistics firm's web client talks to AWS AppSync over GraphQL. A `generateReport` mutation calls Amazon Bedrock and often runs longer than the AppSync resolver timeout, so users see timeouts. The client must receive the finished report without polling. Which design meets these requirements?",
    choices: [
      { id: "A", text: "Have the mutation resolver invoke a Lambda function asynchronously and return a job ID, then have that function call Bedrock and publish the result with a second mutation that a client subscription listens to." },
      { id: "B", text: "Increase the resolver timeout to 15 minutes in the AppSync API settings so the Lambda data source can wait for the Bedrock response." },
      { id: "C", text: "Return a job ID from the mutation and have the client run a `getReport` query once per second until the report appears in DynamoDB." },
      { id: "D", text: "Replace the mutation with a subscription whose resolver streams the Bedrock response directly to the client in a single long-running request." }
    ],
    answer: ["A"],
    explanation: "Asynchronous Lambda invocation decouples the long Bedrock call from the resolver, so the mutation returns immediately. When the function finishes, it calls another mutation whose result is tied to a subscription, and AppSync pushes the report over WebSockets to subscribed clients. This removes both the timeout and the polling.",
    whyWrong: {
      "B": "AppSync resolver execution has a fixed maximum timeout that cannot be raised to 15 minutes, so this setting is not available.",
      "C": "Polling once per second is exactly the behavior the requirement rules out, and it adds query load and cost.",
      "D": "Subscriptions are triggered by mutations; a subscription resolver cannot itself run and stream a long model call."
    },
    services: ["AWS AppSync", "AWS Lambda", "Amazon Bedrock"],
    tags: ["appsync-subscriptions", "async-lambda-invoke", "graphql-genai"]
  },
  {
    id: "d2-2.3-14",
    domain: 2, task: "2.3", skills: ["2.3.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A central platform account (111122223333) hosts a role, `BedrockTenantAccess`, that tenant accounts assume to call Amazon Bedrock. Tenant workloads pass the session tag `tenant=acme` and an external ID. Callers receive AccessDenied on AssumeRole. The role's trust policy is:\n\n```\n{\n  \"Effect\": \"Allow\",\n  \"Principal\": { \"AWS\": \"arn:aws:iam::444455556666:role/acme-app\" },\n  \"Action\": \"sts:AssumeRole\"\n}\n```\n\nWhich updated trust statement is the MOST secure fix?",
    choices: [
      { id: "A", text: "Add \"sts:TagSession\" to the action list only, because session tags need that permission and the principal ARN already identifies the caller." },
      { id: "B", text: "Change the principal to \"*\" and add a condition on aws:RequestTag/tenant, so any account can assume the role if it sets the tenant tag." },
      { id: "C", text: "Keep sts:AssumeRole, and add a StringEquals condition on aws:SourceAccount with the tenant account ID to cover tag and external ID checks." },
      { id: "D", text: "Allow both sts:AssumeRole and sts:TagSession for the acme-app role principal, with a StringEquals condition on sts:ExternalId set to the agreed external ID." }
    ],
    answer: ["D"],
    explanation: "Passing session tags during AssumeRole requires sts:TagSession in the trust policy alongside sts:AssumeRole. Keeping the specific role ARN as the principal limits who can assume it, and an sts:ExternalId condition protects the central role from being used by another party that learns the role ARN. Together they fix the denial without widening access.",
    whyWrong: {
      "A": "Adding sts:TagSession fixes the tag denial, but without an ExternalId condition the role still lacks the confused-deputy protection the tenants are expected to use.",
      "B": "A wildcard principal opens the role to any AWS account, and a self-asserted request tag is not an authorization boundary.",
      "C": "aws:SourceAccount is a condition for AWS service principals, not for IAM role principals, and it does not grant the missing sts:TagSession permission."
    },
    services: ["AWS IAM", "AWS STS", "Amazon Bedrock"],
    tags: ["cross-account-assume-role", "sts-external-id", "session-tags", "trust-policy"]
  },
  {
    id: "d2-2.3-15",
    domain: 2, task: "2.3", skills: ["2.3.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A SaaS vendor's backend servers, which run outside AWS and have no AWS credentials, must call your GenAI API on Amazon API Gateway. Each partner needs its own client identity, scoped permissions (read versus generate), and tokens that expire automatically. Which authorization setup is MOST secure with the least custom code?",
    choices: [
      { id: "A", text: "Create an IAM user per partner with long-lived access keys and require SigV4-signed requests on every API method." },
      { id: "B", text: "Create a Cognito user pool with a resource server and custom scopes, issue each partner an app client for the client_credentials grant, and attach a Cognito authorizer that requires the scope." },
      { id: "C", text: "Write a Lambda authorizer that compares an X-Partner-Key header with a shared secret stored in an environment variable." },
      { id: "D", text: "Issue each partner an API key with a usage plan and treat the key as the sole proof of identity and authorization." }
    ],
    answer: ["B"],
    explanation: "The OAuth 2.0 client_credentials grant is designed for machine-to-machine access. Cognito issues short-lived access tokens per app client, resource-server scopes express read versus generate permissions, and the built-in authorizer validates the token and scope without custom code.",
    whyWrong: {
      "A": "SigV4 with IAM users makes partners hold permanent AWS access keys, which do not expire and are harder to scope and rotate.",
      "C": "A shared static secret in an environment variable has no expiry, no per-partner scoping, and needs hand-written validation code.",
      "D": "API keys identify a caller for throttling and metering but are not an authorization mechanism and do not expire on their own."
    },
    services: ["Amazon API Gateway", "Amazon Cognito"],
    tags: ["client-credentials-grant", "api-gateway-authorizer", "machine-to-machine-auth"]
  },
  {
    id: "d2-2.3-16",
    domain: 2, task: "2.3", skills: ["2.3.4"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A European insurer must make sure prompts from users located in the EU are processed only by a GenAI stack in eu-central-1, while all other users are served from us-east-1. Both stacks are behind regional API Gateway endpoints under one domain name. Which TWO Route 53 configurations BEST meet the compliance requirement? (Select TWO.)",
    choices: [
      { id: "A", text: "Create a latency-based record for each Region so Route 53 sends each user to whichever stack answers fastest." },
      { id: "B", text: "Create a geolocation record for the continent Europe that points to the eu-central-1 endpoint." },
      { id: "C", text: "Create two weighted records at 50 each so that traffic is distributed evenly across both Regional stacks." },
      { id: "D", text: "Create a geolocation record with the Default location that points to the us-east-1 endpoint, so unmatched users still resolve." },
      { id: "E", text: "Create a geoproximity record for each Region with a bias of 50 so that EU users prefer the eu-central-1 endpoint." }
    ],
    answer: ["B", "D"],
    explanation: "Geolocation routing answers based on the user's location, so a Europe record deterministically sends EU users to the EU stack. Locations without a matching record, or whose location cannot be determined, get no answer unless a Default geolocation record exists, so the default record is needed for everyone else.",
    whyWrong: {
      "A": "Latency routing optimizes for network speed, not jurisdiction, and could send EU users to us-east-1.",
      "C": "Weighted routing splits traffic regardless of where the user is, which guarantees some EU prompts leave the EU.",
      "E": "Geoproximity routes by distance with an adjustable bias; it does not guarantee that a legal region maps to a specific endpoint, and a bias can pull users across borders."
    },
    services: ["Amazon Route 53", "Amazon API Gateway"],
    tags: ["route53-geolocation", "data-residency", "regional-stacks"]
  },
  {
    id: "d2-2.3-17",
    domain: 2, task: "2.3", skills: ["2.3.5"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A platform team runs a shared GenAI gateway on Amazon ECS behind an internal Application Load Balancer. About 40 consumer VPCs in other AWS accounts, several with overlapping CIDR ranges, must reach it privately without internet exposure. Which THREE steps give the MOST scalable design? (Select THREE.)",
    choices: [
      { id: "A", text: "Create a Network Load Balancer in the gateway VPC and register the internal ALB as its target by using an ALB-type target group." },
      { id: "B", text: "Create a VPC peering connection between the gateway VPC and each of the 40 consumer VPCs and update all route tables." },
      { id: "C", text: "Create a VPC endpoint service backed by the Network Load Balancer, and add the consumer accounts as allowed principals." },
      { id: "D", text: "Create an endpoint service directly from the internal ALB so that consumers connect without an NLB in between." },
      { id: "E", text: "In each consumer VPC, create an interface VPC endpoint that targets the endpoint service name and use its private DNS name or endpoint DNS." },
      { id: "F", text: "Attach every VPC to one Transit Gateway and add routes to the gateway CIDR in all consumer VPC route tables." }
    ],
    answer: ["A", "C", "E"],
    explanation: "AWS PrivateLink endpoint services must be backed by a Network Load Balancer or Gateway Load Balancer, so an NLB is placed in front of the ALB using an ALB-type target. The provider allows consumer principals, and each consumer creates an interface endpoint. PrivateLink works with overlapping CIDRs and exposes only the one service rather than whole networks.",
    whyWrong: {
      "B": "Peering needs non-overlapping CIDRs, creates 40 connections to manage, and exposes whole VPC networks instead of one service.",
      "D": "An endpoint service cannot be created directly from an Application Load Balancer; it requires an NLB or Gateway Load Balancer.",
      "F": "Transit Gateway routing also fails with overlapping CIDRs and connects whole networks, which is broader than the single-service access that is needed."
    },
    services: ["AWS PrivateLink", "Elastic Load Balancing", "Amazon ECS"],
    tags: ["privatelink-endpoint-service", "nlb-in-front-of-alb", "overlapping-cidr"]
  },
  {
    id: "d2-2.3-18",
    domain: 2, task: "2.3", skills: ["2.3.5"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A team deploys a GenAI API on Amazon ECS with AWS CodeDeploy blue/green. Before any production traffic shifts to the new task set, a smoke-test prompt must run against the test listener, and a failed test must roll the deployment back. The current AppSpec has no hooks:\n\n```\nversion: 0.0\nResources:\n  - TargetService:\n      Type: AWS::ECS::Service\n      Properties:\n        TaskDefinition: \"arn:aws:ecs:us-east-1:111122223333:task-definition/genai-api:42\"\n        LoadBalancerInfo:\n          ContainerName: \"genai-api\"\n          ContainerPort: 8080\n```\n\nWhat should the team add?",
    choices: [
      { id: "A", text: "Add a Hooks section with BeforeInstall pointing to a Lambda function that sends the smoke-test prompt and reports Succeeded or Failed to CodeDeploy." },
      { id: "B", text: "Add a Hooks section with AfterAllowTraffic pointing to a Lambda function that sends the smoke-test prompt and reports Succeeded or Failed to CodeDeploy." },
      { id: "C", text: "Add a Hooks section with AfterAllowTestTraffic pointing to a Lambda function that sends the smoke-test prompt to the test listener and reports Succeeded or Failed to CodeDeploy." },
      { id: "D", text: "Add a CloudWatch alarm on the production target group's 5xx count and attach it to the deployment group without adding any hook." }
    ],
    answer: ["C"],
    explanation: "AfterAllowTestTraffic runs after the replacement task set is reachable through the test listener but before production traffic moves. A Lambda validation function reports status to CodeDeploy, and a Failed result stops the deployment and triggers rollback. The service also needs the CODE_DEPLOY deployment controller and a test listener, which the hook relies on.",
    whyWrong: {
      "A": "BeforeInstall runs before the replacement task set exists, so there is nothing to test yet.",
      "B": "AfterAllowTraffic runs after production traffic has already shifted, so users would be exposed to a bad release before the test fails.",
      "D": "An alarm on production 5xx counts reacts after real traffic arrives and does not test prompt quality, since a bad answer can still return HTTP 200."
    },
    services: ["AWS CodeDeploy", "Amazon ECS", "AWS Lambda"],
    tags: ["codedeploy-blue-green", "appspec-hooks", "test-listener-validation"]
  },

  // ================= Task 2.4 =================
  {
    id: "d2-2.4-10",
    domain: 2, task: "2.4", skills: ["2.4.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "Developers want to prototype against Amazon Bedrock quickly with curl and a bearer token, and a CI pipeline on an external CI provider must also run integration tests that call Bedrock. Security wants to avoid long-lived static secrets. Which TWO choices are the MOST secure? (Select TWO.)",
    choices: [
      { id: "A", text: "Have developers generate short-term Bedrock API keys from their own authenticated IAM session for prototyping, so each key expires with that session." },
      { id: "B", text: "Create one long-term Bedrock API key with no expiration and store it in the CI provider's secret store for all pipelines." },
      { id: "C", text: "Let the pipeline assume an IAM role through OIDC federation and sign Bedrock requests with SigV4 by using the temporary credentials." },
      { id: "D", text: "Post a shared long-term API key on the team wiki so every developer can paste it into curl commands without any IAM setup." },
      { id: "E", text: "Create an IAM user for the pipeline and commit its access key ID and secret key into the repository's CI configuration file." }
    ],
    answer: ["A", "C"],
    explanation: "Short-term Bedrock API keys inherit the permissions and lifetime of the session that created them, which suits quick experiments. For automation, federating the CI job into a role gives temporary SigV4 credentials with no stored secret. Both avoid long-lived credentials.",
    whyWrong: {
      "B": "A non-expiring key in a secret store is a long-lived credential that, if leaked, stays valid until someone revokes it.",
      "D": "A shared long-term key on a wiki is broadly exposed, has no individual accountability, and does not expire.",
      "E": "Static IAM user keys committed to a repository are the classic leaked-credential pattern."
    },
    services: ["Amazon Bedrock", "AWS IAM", "AWS STS"],
    tags: ["bedrock-api-keys", "short-term-credentials", "oidc-federation", "sigv4"]
  },
  {
    id: "d2-2.4-11",
    domain: 2, task: "2.4", skills: ["2.4.1"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "A media team uses Amazon Nova Reel to generate two-minute product videos that take several minutes to finish. A synchronous call through API Gateway times out. The team wants finished videos in S3 without holding a connection open. Which approach should it use?",
    choices: [
      { id: "A", text: "Call StartAsyncInvoke with an S3 output location, return the invocation ARN to the caller, and detect completion by checking GetAsyncInvoke or an S3 object-created event." },
      { id: "B", text: "Call InvokeModel in a Lambda function with its timeout raised to 15 minutes and stream the finished video bytes back through API Gateway." },
      { id: "C", text: "Call ConverseStream with the video prompt and assemble the returned chunks into an MP4 file inside the Lambda function." },
      { id: "D", text: "Raise the API Gateway integration timeout to 15 minutes and keep the client connection open until the model returns the finished video." }
    ],
    answer: ["A"],
    explanation: "Long-running generation such as video uses asynchronous invocation: StartAsyncInvoke returns an invocation ARN immediately and the service writes the result to the S3 location you provide. The caller can check status with GetAsyncInvoke or react to the new object, so no connection stays open.",
    whyWrong: {
      "B": "Video generation with this model is not a synchronous InvokeModel workload, and a 15-minute Lambda behind API Gateway still hits the gateway's integration limits.",
      "C": "ConverseStream streams text or message content from conversational models, not an MP4 file for a video model.",
      "D": "Holding a connection open for minutes is fragile, and API Gateway integration timeouts are not designed for waits this long."
    },
    services: ["Amazon Bedrock", "Amazon Nova Reel", "Amazon S3"],
    tags: ["start-async-invoke", "video-generation", "async-model-invocation"]
  },
  {
    id: "d2-2.4-12",
    domain: 2, task: "2.4", skills: ["2.4.1"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A Lambda function consumes prompts from an SQS FIFO queue and calls Bedrock, and it usually takes about 100 seconds. Operators see that many prompts are processed twice and some reach the dead-letter queue even though the function logged success. The configuration is:\n\n```\nQueue:    VisibilityTimeout = 30, RedrivePolicy.maxReceiveCount = 3\nFunction: Timeout = 120, BatchSize = 1\n```\n\nWhat is the correct fix?",
    choices: [
      { id: "A", text: "Increase maxReceiveCount to 100 so that messages are not moved to the dead-letter queue while they are being reprocessed." },
      { id: "B", text: "Convert the queue to a standard queue so duplicate deliveries no longer happen when processing is slow." },
      { id: "C", text: "Lower the function timeout to 20 seconds so every invocation completes inside the 30-second visibility timeout." },
      { id: "D", text: "Raise the queue visibility timeout above the function timeout, for example six times 120 seconds, so messages stay hidden while Lambda is working." }
    ],
    answer: ["D"],
    explanation: "When the visibility timeout expires before the function finishes, SQS makes the message visible again and delivers it a second time, and each redelivery counts toward maxReceiveCount. The queue's visibility timeout must exceed the function timeout; AWS recommends about six times the timeout plus any batching window.",
    whyWrong: {
      "A": "A higher receive count only hides the symptom; messages would still be processed repeatedly, and real failures would take much longer to reach the DLQ.",
      "B": "Standard queues deliver at least once and do not remove the visibility timeout problem, and FIFO ordering may still be needed.",
      "C": "A 20-second timeout would cut off Bedrock calls that normally take 100 seconds, so they would fail instead of completing."
    },
    services: ["Amazon SQS", "AWS Lambda", "Amazon Bedrock"],
    tags: ["sqs-visibility-timeout", "fifo-dlq", "lambda-event-source-mapping"]
  },
  {
    id: "d2-2.4-13",
    domain: 2, task: "2.4", skills: ["2.4.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A developer streams a response with ConverseStream and wants to log token usage. The code sometimes ends with `NameError: name 'usage' is not defined`:\n\n```\nresp = client.converse_stream(modelId=MODEL, messages=msgs)\ntext = \"\"\nfor event in resp[\"stream\"]:\n    if \"contentBlockDelta\" in event:\n        text += event[\"contentBlockDelta\"][\"delta\"][\"text\"]\n    if \"metadata\" in event:\n        usage = event[\"metadata\"][\"usage\"]\n    if \"messageStop\" in event:\n        break\nprint(usage)\n```\n\nWhat is the cause and the fix?",
    choices: [
      { id: "A", text: "Token usage is delivered inside the messageStop event, so the code should read event[\"messageStop\"][\"usage\"] before it breaks." },
      { id: "B", text: "The metadata event arrives after messageStop, so breaking at messageStop skips it; remove the break and read the stream until it ends." },
      { id: "C", text: "The usage field exists only in non-streaming responses, so the developer must switch to the Converse operation to see token counts." },
      { id: "D", text: "The stream emits metadata first, so usage must be read on the first iteration and the loop should not process contentBlockDelta events." }
    ],
    answer: ["B"],
    explanation: "A ConverseStream response emits messageStart, content block events, then messageStop with the stopReason, and finally a metadata event that carries usage and latency. Breaking out of the loop at messageStop means the final metadata event is never read, so usage is never assigned. Iterating until the stream closes captures both.",
    whyWrong: {
      "A": "messageStop carries the stop reason, not token usage; usage is in the metadata event that follows it.",
      "C": "ConverseStream also reports usage, in its trailing metadata event, so switching operations is unnecessary.",
      "D": "The metadata event comes last, not first, so reading it on the first iteration would never find it."
    },
    services: ["Amazon Bedrock", "Boto3"],
    tags: ["converse-stream-events", "token-usage-metadata", "stream-parsing-bug"]
  },
  {
    id: "d2-2.4-14",
    domain: 2, task: "2.4", skills: ["2.4.2"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "An error log shows users receiving half-finished answers followed by an HTTP 500:\n\n```\nbotocore.errorfactory.ModelStreamErrorException: An error occurred (modelStreamErrorException)\nwhen calling the ConverseStream operation: ...\n  File \"app.py\", line 41, in generate\n    for event in resp[\"stream\"]:\n```\n\nThe code wraps only the `client.converse_stream(...)` call in a try/except that retries three times. What is the best change?",
    choices: [
      { id: "A", text: "Increase the retry count on the existing try/except to ten, because the stream error is thrown by the converse_stream call." },
      { id: "B", text: "Catch the exception during iteration and return the partial text as the final answer so users always receive something." },
      { id: "C", text: "Wrap the iteration over the stream in error handling, buffer the chunks, mark the partial output as incomplete, tell the client to reset, and retry the whole request with backoff." },
      { id: "D", text: "Replace streaming with a non-streaming call permanently so that mid-response failures can no longer happen in the service." }
    ],
    answer: ["C"],
    explanation: "The error is raised while reading the event stream, after the initial call succeeded, so the existing handler never sees it. The handler must wrap the loop. Because the client may already have shown partial text, the service should flag the output as incomplete, have the UI discard it, and retry the full request instead of splicing partial output into a new one.",
    whyWrong: {
      "A": "The exception comes from the stream iteration at line 41, not from the call being retried, so more retries on that call do nothing.",
      "B": "Returning a truncated answer as final presents incomplete content as if it were complete, which is worse than a clear retry.",
      "D": "Non-streaming calls can fail too and would add the full generation time to perceived latency, so this removes a feature without fixing the handling gap."
    },
    services: ["Amazon Bedrock", "Boto3"],
    tags: ["model-stream-error-exception", "partial-output-handling", "stream-retry"]
  },
  {
    id: "d2-2.4-15",
    domain: 2, task: "2.4", skills: ["2.4.3"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "After a short Bedrock slowdown, 400 Lambda workers retry at the same moment every two seconds, and the burst of retries slows recovery. The workers read from an SQS queue. Which TWO changes make the design MOST resilient? (Select TWO.)",
    choices: [
      { id: "A", text: "Replace the fixed two-second sleep with exponential backoff and full jitter, sleeping a random time between zero and the capped exponential delay." },
      { id: "B", text: "Increase the retry limit to fifty attempts with a fixed two-second delay so every request eventually completes." },
      { id: "C", text: "Set the event source mapping's maximum concurrency to a value sized to the Bedrock quota, so the queue absorbs bursts instead of Lambda scaling out." },
      { id: "D", text: "Raise the SQS batch size to the maximum so each worker sends more prompts at once and the number of invocations drops." },
      { id: "E", text: "Set function reserved concurrency to 1,000 so Lambda can always scale far above Bedrock's throughput limit." }
    ],
    answer: ["A", "C"],
    explanation: "Full jitter spreads retries across time so workers stop re-colliding, which breaks the synchronized herd. The SQS event source mapping's maximum concurrency caps how many function instances poll the queue, letting messages wait in SQS rather than flooding Bedrock. Together they smooth demand during recovery.",
    whyWrong: {
      "B": "Fixed delays keep every worker synchronized, and more attempts only add pressure during the incident.",
      "D": "Larger batches increase the number of concurrent model calls per worker and do not fix the synchronized retry timing.",
      "E": "A higher concurrency ceiling does the opposite of limiting load and lets more workers pile onto an already struggling service."
    },
    services: ["Amazon SQS", "AWS Lambda", "Amazon Bedrock"],
    tags: ["full-jitter-backoff", "thundering-herd", "event-source-max-concurrency"]
  },
  {
    id: "d2-2.4-16",
    domain: 2, task: "2.4", skills: ["2.4.3"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A nightly job creates a Bedrock batch inference job, retrying on network timeouts. Finance sees the same 50,000 records processed and billed two or three times on some nights. The code is:\n\n```\nfor attempt in range(3):\n    try:\n        job = bedrock.create_model_invocation_job(\n            jobName=f\"nightly-{uuid.uuid4()}\", modelId=MODEL,\n            roleArn=ROLE, inputDataConfig=IN, outputDataConfig=OUT)\n        break\n    except ReadTimeoutError:\n        continue\n```\n\nWhat is the correct fix?",
    choices: [
      { id: "A", text: "Generate one clientRequestToken before the loop and pass the same value on every attempt, so a retried request returns the existing job." },
      { id: "B", text: "Generate a new clientRequestToken inside the loop on every attempt so that each retry is treated as a separate valid request." },
      { id: "C", text: "Use the same jobName on every attempt and remove the clientRequestToken, because a duplicate name always returns the earlier job." },
      { id: "D", text: "Reduce the retry count from three to two, because the duplicate jobs only appear once the third attempt is made." }
    ],
    answer: ["A"],
    explanation: "A read timeout does not tell the caller whether the service already created the job, so each blind retry can create another billed job. CreateModelInvocationJob accepts a clientRequestToken for idempotency: repeated requests with the same token do not create duplicates. The token must be generated once, outside the retry loop.",
    whyWrong: {
      "B": "A fresh token per attempt tells the service each call is a new request, which reproduces the duplicate-job problem.",
      "C": "Job names are for identification; relying on a repeated name is not the idempotency mechanism and the service can reject the duplicate rather than return the first job.",
      "D": "Fewer retries still allows a duplicate on the second attempt and also makes the job less likely to start at all."
    },
    services: ["Amazon Bedrock", "Boto3"],
    tags: ["client-request-token", "idempotent-batch-job", "retry-safety"]
  },
  {
    id: "d2-2.4-17",
    domain: 2, task: "2.4", skills: ["2.4.4"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "A GenAI gateway can route a request to a primary model or a secondary model with similar quality. The team wants routing that adapts when the primary becomes slow or error-prone and recovers automatically. Which THREE elements belong in the MOST resilient design? (Select THREE.)",
    choices: [
      { id: "A", text: "Read InvocationLatency percentiles and InvocationServerErrors for each model ID from the AWS/Bedrock CloudWatch namespace to decide whether a model is healthy." },
      { id: "B", text: "Use Route 53 latency-based routing between the two models, because it measures how fast each model produces tokens." },
      { id: "C", text: "Store the routing state in DynamoDB or AppConfig with a cooldown, so all gateway instances share one decision and routing does not flip on every metric blip." },
      { id: "D", text: "Compare only the average latency over the past 24 hours and update the routing weights by hand each morning." },
      { id: "E", text: "Keep sending a small share of canary requests to the degraded model so that the gateway notices when it recovers and restores traffic." },
      { id: "F", text: "Hardcode the secondary model as a permanent failover target in an environment variable and redeploy the gateway to change it." }
    ],
    answer: ["A", "C", "E"],
    explanation: "Bedrock publishes per-model latency and error metrics to CloudWatch, which give a measurable health signal. Shared state with a cooldown avoids inconsistent decisions and flapping, and a small canary share lets the router detect recovery, like a half-open circuit. Together these give automatic degrade-and-recover routing.",
    whyWrong: {
      "B": "Route 53 latency routing measures network latency between users and Regions, not model inference time, and it cannot choose between models in one Region.",
      "D": "A 24-hour average and manual edits cannot react to a slowdown that starts mid-day.",
      "F": "A static failover needs a redeploy to change and never adapts to health signals or recovers by itself."
    },
    services: ["Amazon CloudWatch", "Amazon Bedrock", "Amazon DynamoDB", "AWS AppConfig"],
    tags: ["dynamic-model-routing", "cloudwatch-bedrock-metrics", "half-open-canary"]
  },
  {
    id: "d2-2.4-18",
    domain: 2, task: "2.4", skills: ["2.4.4"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "A multilingual helpdesk app always knows the caller's subscription tier and language from the JWT claims on each request. Premium customers must use the larger model, and Japanese requests must use a model tuned for Japanese. The team wants routing that adds no model cost or latency. Which approach should it use?",
    choices: [
      { id: "A", text: "Send every request to a small classifier model first and let it predict the tier and language from the user's message text." },
      { id: "B", text: "Ask the large model to decide which model should answer and execute the choice it returns in a second call." },
      { id: "C", text: "Route every request to the largest model and trim the prompt for non-premium users to reduce cost on the same model." },
      { id: "D", text: "Use a lookup table keyed by tier and language in AppConfig or DynamoDB to pick the model ID before any model call, using an LLM classifier only for unclear cases." }
    ],
    answer: ["D"],
    explanation: "When routing facts are already known as request metadata, a deterministic lookup is free, instant and predictable. A model-based classifier is only worth its cost and latency for questions the metadata cannot answer, such as intent.",
    whyWrong: {
      "A": "A classifier predicts something the app already knows for certain, adding cost, latency and error risk.",
      "B": "Using the largest model as a router adds a full extra call for every request, which is the most expensive way to make this choice.",
      "C": "This ignores the Japanese-model requirement and the tier-based model choice, and it spends the largest-model price on every request."
    },
    services: ["AWS AppConfig", "Amazon DynamoDB", "Amazon Bedrock"],
    tags: ["deterministic-routing", "metadata-based-routing", "model-selection-table"]
  },

  // ================= Task 2.5 =================
  {
    id: "d2-2.5-11",
    domain: 2, task: "2.5", skills: ["2.5.1"],
    type: "single",
    difficulty: "easy",
    source: "generated",
    stem: "Users upload 20 MB PDF contracts to a document-summarization app. The upload fails with a 413 error at the API Gateway endpoint before the Lambda function runs. The team wants a fix that works for large files without custom chunking code. What should it do?",
    choices: [
      { id: "A", text: "Request a service quota increase so the API Gateway payload limit is raised above 20 MB for the REST API." },
      { id: "B", text: "Return an S3 presigned URL from a small API call, let the client upload the PDF straight to S3, and start summarization from the S3 object-created event." },
      { id: "C", text: "Switch the integration to a Lambda function URL so that the 20 MB request body can be passed to the function directly." },
      { id: "D", text: "Base64-encode the PDF in the browser and send it in a JSON body so that the payload fits inside the allowed request size." }
    ],
    answer: ["B"],
    explanation: "API Gateway has a fixed payload limit of 10 MB, and Lambda invocation payloads are also capped. The standard pattern is to have the client upload directly to S3 with a presigned URL and trigger processing from the S3 event, so the large body never passes through the API or function.",
    whyWrong: {
      "A": "The API Gateway payload limit is a hard limit and cannot be increased through a quota request.",
      "C": "Lambda request payloads are limited to a few megabytes for synchronous calls, so a 20 MB body would still be rejected.",
      "D": "Base64 encoding makes the payload roughly a third larger, so it would exceed the limit by even more."
    },
    services: ["Amazon API Gateway", "Amazon S3", "AWS Lambda"],
    tags: ["presigned-url-upload", "api-gateway-payload-limit", "s3-event-trigger"]
  },
  {
    id: "d2-2.5-12",
    domain: 2, task: "2.5", skills: ["2.5.1"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A mobile app calls POST /summarize behind API Gateway and Lambda. On weak networks the app times out and resends the same request, so Bedrock is billed twice and users see two different summaries. Which TWO changes fix this? (Select TWO.)",
    choices: [
      { id: "A", text: "Enable API Gateway stage caching on the POST method so that repeated requests are answered from the cache." },
      { id: "B", text: "Have the app send a stable Idempotency-Key header, generated once per user action and reused on every retry of that action." },
      { id: "C", text: "Use the Powertools idempotency utility with a DynamoDB table, which records the key, marks it in progress, and returns the stored result on a retry." },
      { id: "D", text: "Shorten the app's request timeout to two seconds so that failures are noticed earlier and fewer requests are running." },
      { id: "E", text: "Send each request to a standard SQS queue, which deduplicates identical message bodies sent within a short window." }
    ],
    answer: ["B", "C"],
    explanation: "Idempotency needs a key that stays the same across retries of one user action, and server-side storage that remembers the outcome. Powertools persists the key in DynamoDB with an in-progress marker and an expiry, so a retry gets the first result instead of another Bedrock call.",
    whyWrong: {
      "A": "API Gateway caching applies to GET by default and is not designed to deduplicate POST calls that have side effects.",
      "D": "A shorter timeout creates more retries, not fewer, so duplicates would increase.",
      "E": "Standard queues do not deduplicate messages; content-based deduplication is a FIFO queue feature."
    },
    services: ["AWS Lambda", "Amazon DynamoDB", "Amazon API Gateway", "Powertools for AWS Lambda"],
    tags: ["idempotency-key", "powertools-idempotency", "duplicate-bedrock-calls"]
  },
  {
    id: "d2-2.5-13",
    domain: 2, task: "2.5", skills: ["2.5.2"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A front-end team building a React app on AWS Amplify Gen 2 needs a chat interface with streaming replies, saved conversation history per signed-in user, and accessible UI. The team wants the LEAST backend and UI code. Which approach should it use?",
    choices: [
      { id: "A", text: "Build a WebSocket API on API Gateway with Lambda handlers, store messages in DynamoDB, and write custom React components." },
      { id: "B", text: "Embed the Amazon Bedrock Agents test window in an iframe and give users access to the agent through the console." },
      { id: "C", text: "Define a conversation route backed by a Bedrock model in the Amplify data schema and render it with the Amplify UI AIConversation component." },
      { id: "D", text: "Deploy an Amazon Lex web UI and map each chat turn to an intent that calls a Lambda function to invoke Bedrock." }
    ],
    answer: ["C"],
    explanation: "The Amplify AI Kit lets you declare an AI conversation route in the Gen 2 data schema, with a Bedrock model, owner-scoped message storage and authorization handled by Amplify. The AIConversation UI component renders the chat with streaming and accessible markup, which replaces both custom backend and custom front-end code.",
    whyWrong: {
      "A": "This can work, but it means building the transport, storage, authorization and chat UI by hand, which is the most code of the four options.",
      "B": "The agent test window is a console feature for builders, not a component for end users of an application.",
      "D": "Lex intent mapping is meant for structured dialogs, and it does not give streaming replies or per-user conversation storage out of the box."
    },
    services: ["AWS Amplify", "Amazon Bedrock", "Amazon Cognito"],
    tags: ["amplify-ai-kit", "aiconversation-component", "chat-ui"]
  },
  {
    id: "d2-2.5-14",
    domain: 2, task: "2.5", skills: ["2.5.3"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "When an AI-generated account summary is ready, the platform emits an EventBridge event. The summary must be posted to a SaaS CRM's REST endpoint that requires an API token and allows only about 10 requests per second. Which TWO configurations meet these requirements? (Select TWO.)",
    choices: [
      { id: "A", text: "Create an EventBridge connection that stores the CRM credentials, and an API destination that uses it, so the token is not placed in code or the rule." },
      { id: "B", text: "Set the API destination's invocation rate limit to 10 per second, and give the rule target a dead-letter queue for events that cannot be delivered." },
      { id: "C", text: "Create a Lambda function with the CRM token in an environment variable, invoke it for each event, and let it call the CRM with no throttling." },
      { id: "D", text: "Subscribe the CRM URL to an SNS topic over HTTPS and add the token to the query string of the subscription endpoint." },
      { id: "E", text: "Increase the rule's maximum event age to 24 hours so that delivery attempts keep running until the CRM accepts the call." }
    ],
    answer: ["A", "B"],
    explanation: "EventBridge API destinations call external HTTPS endpoints directly. A connection holds the authorization type and credentials securely (backed by Secrets Manager), and the destination's invocation rate limit protects the CRM from bursts. A dead-letter queue captures events that still fail after retries.",
    whyWrong: {
      "C": "A plain environment variable for the token is weaker secret handling, and without throttling a burst of events would exceed the CRM limit.",
      "D": "Secrets in a query string leak into logs, and SNS HTTPS delivery has no rate limit control matched to the CRM's quota.",
      "E": "A longer retry window does not slow the request rate or secure the token, and failing events would pile up during that time."
    },
    services: ["Amazon EventBridge", "AWS Secrets Manager", "Amazon SQS"],
    tags: ["eventbridge-api-destinations", "saas-integration", "rate-limited-delivery"]
  },
  {
    id: "d2-2.5-15",
    domain: 2, task: "2.5", skills: ["2.5.3"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A chat-moderation workflow has four short steps: a Lambda pre-check, two Bedrock calls, and a result write. It completes in under 20 seconds, runs about 2 million times per day, is called synchronously by an API, and is safe to run more than once. Which Step Functions choice is MOST cost-effective?",
    choices: [
      { id: "A", text: "Use an Express workflow started synchronously, which is billed on requests and duration and sends execution logs to CloudWatch Logs." },
      { id: "B", text: "Use a Standard workflow, because it is billed per state transition and gives the lowest price for high-volume short executions." },
      { id: "C", text: "Use an Express workflow started asynchronously, because it provides exactly-once execution for each of the 2 million runs." },
      { id: "D", text: "Use a Standard workflow with a waitForTaskToken pattern, because short executions cost less when they are paused between steps." }
    ],
    answer: ["A"],
    explanation: "Express workflows suit high-volume, short (up to five minutes), idempotent work. They are priced by number of executions and duration rather than per state transition, and synchronous Express returns the result to the caller. Standard workflows bill per transition, which becomes expensive at this volume.",
    whyWrong: {
      "B": "Per-transition pricing makes Standard the costlier option for millions of short, chatty executions.",
      "C": "Asynchronous Express workflows give at-least-once execution, not exactly-once, and an asynchronous start does not return the result to the API caller.",
      "D": "waitForTaskToken adds pause and callback complexity the workflow does not need and does not reduce cost."
    },
    services: ["AWS Step Functions", "Amazon CloudWatch Logs"],
    tags: ["step-functions-express", "workflow-cost", "synchronous-workflow"]
  },
  {
    id: "d2-2.5-16",
    domain: 2, task: "2.5", skills: ["2.5.4"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "A GenAI team wants every developer using Kiro in the same repository to follow shared standards: always call Bedrock through the Converse API, never hardcode model IDs, and update tests whenever a handler changes. Which THREE Kiro capabilities support this? (Select THREE.)",
    choices: [
      { id: "A", text: "Steering files in the repository's .kiro/steering folder that state the coding conventions and are included in the agent's context." },
      { id: "B", text: "An IAM permission boundary attached to the developer's role that blocks any code containing a model ID string." },
      { id: "C", text: "An agent hook that runs when a handler file is saved and prompts the agent to check or update the matching tests." },
      { id: "D", text: "A wiki page of standards that developers paste into each chat session at the start of their work." },
      { id: "E", text: "Specs that capture requirements, design and a task list for each feature, so the agent implements against agreed acceptance criteria." },
      { id: "F", text: "A Bedrock guardrail attached to the Kiro editor so that disallowed coding patterns are blocked from the generated code." }
    ],
    answer: ["A", "C", "E"],
    explanation: "Steering files give persistent, repository-level context for conventions. Hooks trigger agent actions on events such as saving a file, which enforces the test-update habit. Specs turn a feature into requirements, design and tasks so implementation follows agreed criteria.",
    whyWrong: {
      "B": "IAM permission boundaries control AWS API actions and cannot inspect source code for strings.",
      "D": "Manually pasted standards depend on each developer remembering, which is the inconsistency steering files remove.",
      "F": "Bedrock Guardrails apply to model inputs and outputs in applications that call them, not to the Kiro editor's code generation."
    },
    services: ["Kiro"],
    tags: ["kiro-steering-files", "kiro-hooks", "kiro-specs", "developer-standards"]
  },
  {
    id: "d2-2.5-17",
    domain: 2, task: "2.5", skills: ["2.5.4"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A developer writes a unit test for a function that summarizes text with Bedrock. In CI the test fails with `NoCredentialsError` instead of passing:\n\n```\nclient = boto3.client(\"bedrock-runtime\", region_name=\"us-east-1\")\nstubber = Stubber(client)\nstubber.add_response(\"converse\", CANNED_RESPONSE)\nresult = summarize(client, \"long text\")\nassert result == \"ok\"\n```\n\nWhat is missing?",
    choices: [
      { id: "A", text: "Set AWS_DEFAULT_REGION in the CI job, because the client cannot find a Region when running without a configured profile." },
      { id: "B", text: "Replace the Stubber with live calls to a small model at temperature 0, since stubbed responses cannot verify the function's behavior." },
      { id: "C", text: "Pass the expected_params argument to add_response, because the stubber only intercepts requests that match registered parameters." },
      { id: "D", text: "Activate the stubber, with `with stubber:` or `stubber.activate()`, before calling summarize so that the client returns the canned response instead of sending a real request." }
    ],
    answer: ["D"],
    explanation: "Registering responses on a Stubber does nothing until it is activated. Without activation the client sends a real signed request, which fails in CI because no credentials exist. Activating it routes calls to the queued responses with no network or cost.",
    whyWrong: {
      "A": "The Region is already given in the client constructor, and the error is about credentials from sending a real request.",
      "B": "Live calls make the test slow, costly and nondeterministic, which is what stubbing is meant to avoid.",
      "C": "expected_params only validates the request the code sends; it is optional and does not activate interception."
    },
    services: ["Boto3", "Amazon Bedrock"],
    tags: ["botocore-stubber", "unit-testing-bedrock", "no-live-calls"]
  },
  {
    id: "d2-2.5-18",
    domain: 2, task: "2.5", skills: ["2.5.5"],
    type: "single",
    difficulty: "hard",
    source: "generated",
    stem: "A team builds a report pipeline with Strands Agents. A researcher agent must run first, then a writer, then a reviewer. If the reviewer rejects the draft, control must return to the writer, and the order of agents must be predictable and auditable. Which multi-agent pattern fits best?",
    choices: [
      { id: "A", text: "An orchestrator agent that has the three specialists as tools and decides each run which ones to call and in what order." },
      { id: "B", text: "A graph with the three agents as nodes and edges, including a conditional edge from the reviewer back to the writer." },
      { id: "C", text: "A swarm in which the agents hand off to one another autonomously based on what each agent judges to be the next best expert." },
      { id: "D", text: "AWS Agent Squad, which classifies each user message and routes it to one agent for that turn." }
    ],
    answer: ["B"],
    explanation: "A Strands graph defines nodes, edges and conditional edges explicitly, so execution order is deterministic and a rejection can loop back to the writer. Agents-as-tools and swarms leave sequencing to model judgment, and Agent Squad is a router for conversational turns rather than a pipeline engine.",
    whyWrong: {
      "A": "The orchestrator chooses the order at run time, so sequencing may vary between runs and is harder to audit.",
      "C": "Swarm handoffs are autonomous and emergent, which conflicts with a required fixed order.",
      "D": "Agent Squad picks one agent per message from the user's intent; it does not run an ordered multi-step pipeline with a review loop."
    },
    services: ["Strands Agents", "Amazon Bedrock"],
    tags: ["strands-graph-pattern", "multi-agent-orchestration", "deterministic-workflow"]
  },
  {
    id: "d2-2.5-19",
    domain: 2, task: "2.5", skills: ["2.5.5"],
    type: "multi",
    difficulty: "medium",
    source: "generated",
    stem: "An agent hosted on Amazon Bedrock AgentCore must log in to a vendor's web portal that has no API and download a monthly statement, and then compute totals from the downloaded CSV by running model-written Python. Which TWO AgentCore capabilities should the team use? (Select TWO.)",
    choices: [
      { id: "A", text: "AgentCore Browser, which provides managed, isolated browser sessions that the agent can drive to navigate pages and fill forms." },
      { id: "B", text: "A Bedrock knowledge base with the portal's public web pages crawled, so that the agent can read the monthly statement from the index." },
      { id: "C", text: "AgentCore Code Interpreter, which runs the model-written Python in a sandboxed environment separate from the agent's own runtime." },
      { id: "D", text: "Run the model-written Python with exec() inside the agent's runtime so that it uses the agent's own IAM role and network access." },
      { id: "E", text: "Amazon Textract, which can log in to the portal and analyze the statement as a form after the download." }
    ],
    answer: ["A", "C"],
    explanation: "AgentCore Browser gives an agent a managed, sandboxed browser for sites that lack APIs, and AgentCore Code Interpreter executes generated code in an isolated sandbox. Both keep untrusted actions away from the agent's own credentials and runtime.",
    whyWrong: {
      "B": "A crawl of public pages cannot reach a logged-in, per-customer statement, and the data would not be current.",
      "D": "Executing model-written code in the agent's own runtime exposes its IAM role and network, which is the risk a sandbox exists to avoid.",
      "E": "Textract analyzes documents and images; it does not navigate websites or authenticate to portals."
    },
    services: ["Amazon Bedrock AgentCore"],
    tags: ["agentcore-browser", "agentcore-code-interpreter", "sandboxed-execution"]
  },
  {
    id: "d2-2.5-20",
    domain: 2, task: "2.5", skills: ["2.5.6"],
    type: "multi",
    difficulty: "hard",
    source: "generated",
    stem: "An agent running on AgentCore Runtime sometimes takes 40 seconds, and the team cannot tell whether the time goes to model calls, tool calls or retrieval. They want span-level traces for each agent run in CloudWatch. Which TWO actions should they take? (Select TWO.)",
    choices: [
      { id: "A", text: "Add the AWS Distro for OpenTelemetry package to the agent and start the app through opentelemetry-instrument, so model and tool calls emit spans." },
      { id: "B", text: "Enable CloudTrail data events for bedrock-agentcore so that every tool call appears as a timed trace span." },
      { id: "C", text: "Turn on CloudWatch Transaction Search in the account, so that the spans are ingested and can be viewed in the GenAI observability dashboard." },
      { id: "D", text: "Add print statements with timestamps around each call and search the plain log group for gaps between the lines." },
      { id: "E", text: "Turn on Bedrock model invocation logging with text delivery to S3, which records the duration of tool calls." }
    ],
    answer: ["A", "C"],
    explanation: "AgentCore Observability is built on OpenTelemetry: instrumenting the agent with the ADOT distribution produces spans for model, tool and framework calls. Transaction Search must be enabled so CloudWatch can ingest those spans for the trace and GenAI observability views.",
    whyWrong: {
      "B": "CloudTrail records API activity for auditing, not hierarchical timing spans of agent steps.",
      "D": "Timestamped prints give coarse, manual evidence and no span hierarchy or correlation across components.",
      "E": "Model invocation logging records model requests and responses only, so it does not time tool calls or retrieval."
    },
    services: ["Amazon Bedrock AgentCore", "AWS Distro for OpenTelemetry", "Amazon CloudWatch"],
    tags: ["agentcore-observability", "opentelemetry-adot", "transaction-search"]
  },
  {
    id: "d2-2.5-21",
    domain: 2, task: "2.5", skills: ["2.5.6"],
    type: "single",
    difficulty: "medium",
    source: "generated",
    stem: "A Bedrock Agent answers \"I could not find information about that\" to a question the documentation clearly covers. The trace excerpt is:\n\n```\npreProcessingTrace: parsedResponse.isValid = true\norchestrationTrace: rationale.text = \"EU return window question; query the knowledge base.\"\norchestrationTrace: invocationInput.knowledgeBaseLookupInput.text = \"EU return window\"\norchestrationTrace: observation.knowledgeBaseLookupOutput.retrievedReferences = []\norchestrationTrace: observation.finalResponse.text = \"I could not find information about that.\"\n```\n\nWhere is the failure, and what should the team check?",
    choices: [
      { id: "A", text: "The pre-processing step rejected the input, so the team should loosen the pre-processing prompt to classify more questions as valid." },
      { id: "B", text: "The orchestration model chose the wrong action, so the team should rewrite the agent instructions to select a different tool." },
      { id: "C", text: "The knowledge base lookup returned no passages, so the team should check ingestion sync status, the data source contents and any metadata filter." },
      { id: "D", text: "The final response prompt was too strict, so the team should raise the model temperature to make the answer more likely to appear." }
    ],
    answer: ["C"],
    explanation: "The trace shows valid pre-processing, a sensible rationale and a correct knowledge base query, but the lookup output has no retrieved references. The final answer is the model correctly reporting that nothing was found. The cause is upstream in retrieval, such as a failed ingestion job, missing documents or an over-restrictive filter.",
    whyWrong: {
      "A": "The pre-processing result is valid, so that step accepted the question.",
      "B": "The rationale shows the right action was selected and the lookup query is reasonable, so tool choice is not the problem.",
      "D": "The final response is faithful to an empty retrieval result; temperature would not create missing source passages and might invite fabricated answers."
    },
    services: ["Amazon Bedrock Agents", "Amazon Bedrock Knowledge Bases"],
    tags: ["agent-trace-analysis", "empty-retrieval", "knowledge-base-troubleshooting"]
  }
);
