# Plan: AIP-C01 Domain 2 Study Guide

**Status:** Draft, awaiting approval. No guide content has been written yet.
**Output:** `docs/domain/aip-c01-domain2-study-guide.html` (single self-contained HTML file)
**Model to copy:** `docs/domain/aip-c01-domain1-study-guide.html` (4,753 lines, about 555 KB)
**Exam source:** `aip_01_exam_guide.md`, Domain 2: Implementation and Integration (26% of scored questions, 5 tasks, 25 skills)
**Latest-docs source:** `.claude/skills/amazon-bedrock/` (SKILL.md and `references/`), plus the AWS documentation tools for services the skill does not cover.

---

## Decisions already agreed

| Question | Decision |
|---|---|
| Format | Match Domain 1: one HTML file, same CSS, callouts, sidebar table of contents, checkpoints, recaps, Mermaid diagrams. |
| Chapters | One per task (2.1 to 2.5). Task 2.1 is the longest because it has 7 skills. |
| Orientation chapter | Skipped. The guide opens with a short "What you need from Domain 1" box. |
| Projects | Three workshops, each with problem, architecture, stack, build path, definition of done, notes. |
| Project 2 stack | Uses API Gateway and Lambda together. |
| Labs | Each lab shows the Console path and the CLI/Boto3 path, one after the other (rule from `AGENTS.md`). |
| Accuracy | Fetch current docs for fast-moving services before writing about them. |
| Process | Plan first, then build only after approval. |

---

## Why this guide exists, and how it differs from Domain 1

Domain 1 teaches you to choose and prepare things: a model, data, a vector store, a prompt.
Domain 2 teaches you to wire those things into running systems: an agent that calls tools, a model that
serves traffic, an integration that survives a legacy ERP, an API that streams tokens.

A concrete Monday-morning scenario that Domain 2 questions are built around: the support-triage agent works
in a notebook. In production it loops forever on a bad tool result and burns tokens, a legacy CRM times out and
the whole request dies, users stare at a blank screen for 25 seconds because nothing streams, and security asks
which IAM role the agent uses to reach the customer database. Each of those is a Domain 2 skill.

Differences from Domain 1:

- Less "which option?" and more "how do the parts connect and fail?". Failure modes get more space.
- Domain 1's Chapter 0 vocabulary is assumed. A short box lists what to know and links to the Domain 1 sections.
- Two services are new and fast-moving: Strands Agents and Amazon Bedrock AgentCore. Both get verified against current docs.

---

## Document structure

```
Cover (title, chapter table, callout legend)
"What you need from Domain 1" box
Chapter 1   Task 2.1  Agentic AI solutions and tool integrations      (7 skills)
Project 1   Build after Chapter 1   A governed support-triage agent with MCP tools and human approval
Chapter 2   Task 2.2  Model deployment strategies                      (3 skills)
Chapter 3   Task 2.3  Enterprise integration architectures             (5 skills)
Chapter 4   Task 2.4  FM API integrations                              (4 skills)
Project 2   Build after Chapters 2 to 4   A streaming, resilient, routed GenAI API on API Gateway and Lambda
Chapter 5   Task 2.5  Application integration patterns and dev tools  (6 skills)
Project 3   Build after Chapter 5   An enterprise GenAI integration: events, CI/CD, and a gateway
Project map (skill coverage, gaps, suggested order, optional capstone)
```

Per chapter, the same frame as Domain 1: eyebrow, h2, lede, "Exam skills covered" box, h3 sections,
callouts (Exam tip, Backend analogy, Watch out, Note), at least one lab, a checkpoint (3 to 5 questions with
collapsed answers), and a recap.

Skill IDs in headings, as in Domain 1 Chapter 5 (for example "Choosing a store (1.4.x)"), so the guide can be searched by skill.

---

## Writing standards for this guide

- Reader is an experienced Python/FastAPI/LangChain developer who is new to AWS (`my_background.md`). Do not explain Python, REST, Docker, or LLM basics. Explain every AWS term the first time it appears.
- Compare against what the reader already knows: LangChain/LangGraph agents versus Strands, FastMCP versus Lambda/ECS MCP servers, FastAPI middleware versus API Gateway.
- Boto3 before abstractions. Show a short Boto3 or Strands sketch wherever an API is involved.
- Every lab has: time, cost, prerequisites, Console path, CLI/Boto3 path, cleanup. Labs use the project's assigned Region only.
- Every mechanism gets a walkthrough: what triggers it, what the system does step by step, what the caller sees.
- Exam tips name the distractor pattern, not just the right answer.
- Do not hard-code model IDs, console labels, or limits that change. Say "check the current value" and give the command or page. Domain 1 already uses this convention.
- Style: plain, direct sentences. No filler, no staged reveals.

---

## Milestones

Each milestone is one writing pass. Content goes into HTML part files under
`docs/domain/.domain2-parts/` so work can resume across sessions. A small assembly script joins the parts with the
Domain 1 head, CSS, table-of-contents script, and Mermaid loader. After the final check, the parts folder is removed with your confirmation.

### Milestone 0: Scaffold and research notes

#### Why this matters
A 4,000-line file cannot be written in one call. Without a scaffold, a failed or interrupted write loses work and
the chapters drift in style. Research notes also stop claims from Domain 2's fast-moving services from coming from stale memory.

#### How it works
```
Domain 1 HTML ──extract──> head + CSS + TOC script + mermaid loader (copied unchanged except localStorage key and <title>)
                                   │
 parts/00-cover.html ... parts/09-map.html ──cat in order──> aip-c01-domain2-study-guide.html
```
The TOC script builds the sidebar from `main .chapter` sections, so no manual TOC is needed. The storage key changes
from `aip-c01-d1-toc-open` to `aip-c01-d2-toc-open` so the two guides do not share state.

#### What changes
| File | What changes |
|---|---|
| `docs/domain/.domain2-parts/` | New folder with one HTML fragment per section, plus `assemble.sh` |
| `docs/domain/.domain2-parts/research-notes.md` | Verified facts per chapter, each with a source |
| `docs/domain/aip-c01-domain2-study-guide.html` | Created by assembly (built incrementally) |

#### Implementation checklist
1. Extract head, CSS, TOC script, and Mermaid loader from Domain 1 into `head.html` and `tail.html`.
2. Write `assemble.sh`.
3. Research pass 1 (see "Research list" below). Record findings with source links.
4. Build a stub guide with the cover and one empty chapter and open it to confirm the sidebar and Mermaid render.

### Milestone 1: Cover and "What you need from Domain 1"

#### Why this matters
Skipping the orientation chapter is only safe if the reader can tell, in a minute, whether they have the prerequisites.
Without it, someone who skipped Domain 1 hits "inference profile" or "Converse" in Chapter 4 and has no anchor.

#### How it works
A `.callout.note` box lists eight items, each as "if you cannot explain this, read X in Domain 1":
Converse vs InvokeModel, model IDs and inference profiles, the four Boto3 clients, the on-demand / Provisioned / batch billing modes,
IAM identity vs resource policies and service roles, tokens/quotas/throttling, Guardrails basics, Prompt Management basics.
Each item links to the Domain 1 anchor (`aip-c01-domain1-study-guide.html#t0-invoke-vs-converse`, and so on).

#### What changes
| File | What changes |
|---|---|
| `parts/00-cover.html` | Title, lede, chapter table, legend, prerequisites box, how-to-use paragraphs |

#### Implementation checklist
1. Write the chapter table with the 5 chapters, 3 projects, and project map.
2. Write the prerequisites box with links verified against Domain 1 ids.
3. Write the "how labs work" paragraph, including the Console + CLI/Boto3 rule.

### Milestone 2: Chapter 1, Task 2.1 Agentic AI and tool integrations

#### Why this matters
The support-triage agent from the scenario above can fail four ways: it loops, it calls a tool with bad arguments,
it has more permissions than it needs, and nobody reviews risky actions. Task 2.1 is where all four are handled.
It is also the largest block of new services (Strands, Agent Squad, AgentCore, MCP), so it needs the most room.

#### How it works
The chapter follows the build order of an agent, one skill per section:

```
2.1.1  Agent + memory + state     Strands agent, session/conversation state, AgentCore Memory, Agent Squad for multi-agent routing
2.1.7  Tools through MCP          MCP server on Lambda (stateless, light) vs ECS (stateful, complex), MCP client libraries, AgentCore Gateway
2.1.6  Tool reliability           function schemas, Lambda parameter validation and error shapes, Strands custom behavior
2.1.2  Reasoning loop             ReAct and chain-of-thought as a Step Functions state machine (Reason, Act, Observe, loop)
2.1.3  Safeguards                 stopping conditions, timeouts, IAM boundaries, circuit breakers
2.1.4  Multiple models            specialist FMs, ensemble aggregation, model selection framework
2.1.5  Humans in the loop         Step Functions wait-for-callback, API Gateway feedback endpoint, review patterns
```

Walkthrough to include (ReAct on Step Functions): the state machine invokes the model with the tool list. A Choice
state checks whether the response is a tool call or a final answer. A tool call goes to a Lambda task, the result is appended
to the message list, and the loop returns to the model. A counter in the state and a Choice rule enforce a maximum number of
iterations. The caller sees either the final answer or a structured "stopped: iteration limit" result.

Must contrast the options the exam contrasts: Bedrock Agents (managed, console-configured action groups) vs Strands (code-first) vs AgentCore
(managed runtime for any framework) vs Step Functions (explicit, auditable control flow).

#### What changes
| File | What changes |
|---|---|
| `parts/10-ch1-task-2-1.html` | Chapter 1, about 700 to 900 lines |

#### Implementation checklist
1. Lede and skills box (7 skills).
2. Sections 2.1.1 through 2.1.7 as above, each with a Boto3 or Strands sketch.
3. Diagram: agent loop on Step Functions (Mermaid). Diagram: MCP on Lambda vs ECS.
4. Comparison table: Bedrock Agents vs Strands vs AgentCore vs Step Functions.
5. Labs: (a) Strands agent with one tool, local; (b) Lambda MCP server behind AgentCore Gateway or a direct client; (c) Step Functions wait-for-callback approval. Console + CLI each.
6. Checkpoint (5 questions) and recap.

### Milestone 3: Project 1, governed support-triage agent

#### Why this matters
Chapter 1 has many parts; building one agent that uses them together is what makes them stick.

#### How it works
Scenario: support tickets arrive, an agent looks up the customer (MCP tool on Lambda), searches order history (second tool),
drafts a reply, and for refunds above a threshold pauses for human approval. IAM limits the agent to read-only database access.
Iteration cap and timeout bound cost.

```
Ticket ─> Step Functions ─> Agent (Strands on Lambda/AgentCore) ─> MCP tools (Lambda)
                              │                                     
                              └─ refund > threshold ─> wait for callback ─> API Gateway approve/reject ─> resume
```

#### What changes
| File | What changes |
|---|---|
| `parts/11-project1.html` | Problem, architecture, stack, 6 to 8 build milestones, definition of done, cost/Region notes |

#### Implementation checklist
1. Skills practiced: 2.1.1, 2.1.3, 2.1.5, 2.1.6, 2.1.7.
2. Write the brief, Mermaid architecture, services table, build path, done list, cost notes.

### Milestone 4: Chapter 2, Task 2.2 Model deployment

#### Why this matters
A team deploys a large model on a GPU endpoint, it takes 12 minutes to load, scale-out lags behind the traffic spike,
and the bill shows an idle GPU all weekend. The exam tests whether you pick the right deployment mode before that happens.

#### How it works
Decision flow the chapter builds toward:

```
Spiky/low volume, Bedrock model fits      ──> on-demand (serverless) via Lambda or any compute
Steady high volume, need guaranteed rate  ──> Bedrock Provisioned Throughput (commitment trade-off)
Custom/open model, own container          ──> SageMaker AI endpoint (real-time, async, serverless, inference components)
Mix                                       ──> hybrid: Bedrock for most traffic, SageMaker for the custom model
Routine queries cheap, hard ones costly   ──> model cascading (small model first, escalate on low confidence)
```

Skill 2.2.2 section: what is different for LLMs (weights in GBs, GPU memory, KV cache, tokens/sec instead of requests/sec, long
load times, streaming), container patterns (LMI/DJL, vLLM, TGI as options to verify), model loading strategies (S3 load vs baked image, fast model loader),
scaling signals. Verify current SageMaker container and scaling features before writing.

#### What changes
| File | What changes |
|---|---|
| `parts/20-ch2-task-2-2.html` | Chapter 2, about 450 to 600 lines |

#### Implementation checklist
1. Skills 2.2.1, 2.2.2, 2.2.3 sections.
2. Decision table and cascading walkthrough with a Boto3 sketch.
3. Labs: (a) Provisioned Throughput pricing and commitment exploration (read-only, no purchase); (b) deploy a small model to a SageMaker endpoint with the SDK, then delete it. Console + CLI each.
4. Checkpoint and recap.

### Milestone 5: Chapter 3, Task 2.3 Enterprise integration

#### Why this matters
GenAI rarely starts on a clean slate. The model has to talk to a 15-year-old SOAP service, respect the company's SSO,
and keep EU customer data in the EU. These are the architecture questions that decide whether a pilot reaches production.

#### How it works
Sections follow the five skills: connectivity (API integrations with legacy systems, event-driven loose coupling, data sync),
integrated AI capabilities (API Gateway microservice integration, Lambda webhooks, EventBridge), secure access (identity federation,
RBAC for model and data access, least privilege), cross-environment (Outposts, Wavelength, secure routing, residency),
CI/CD and GenAI gateway (CodePipeline, CodeBuild, security scans, rollback, centralized gateway with observability).

Walkthrough to include: an EventBridge rule routes a "ticket created" event to a Lambda that calls the model and writes the result
back through an adapter. Show what happens when the legacy system is down (dead-letter queue, retry, the caller sees an accepted response).

#### What changes
| File | What changes |
|---|---|
| `parts/30-ch3-task-2-3.html` | Chapter 3, about 600 to 800 lines |

#### Implementation checklist
1. Five skill sections, each with a diagram or table.
2. Gateway architecture diagram and a "gateway responsibilities" table (auth, quotas, routing, logging, guardrails).
3. Labs: (a) EventBridge to Lambda to Bedrock with a DLQ; (b) a least-privilege IAM policy tested with the policy simulator. Console + CLI each.
4. Checkpoint and recap.

### Milestone 6: Chapter 4, Task 2.4 FM API integrations

#### Why this matters
A model call takes 5 to 30 seconds. Users see a blank page, the API gateway times out at its limit, a retry storm during
throttling makes the outage worse, and every request goes to the most expensive model. Task 2.4 covers all four.

#### How it works
Skills in order: flexible interaction (sync from Lambda/ECS/EC2, async with SQS, API Gateway request validation),
real-time (Converse/InvokeModel streaming APIs, WebSockets, server-sent events, API Gateway response streaming and chunked transfer), resilience
(SDK retry modes, exponential backoff with jitter, rate limiting and usage plans, fallbacks, X-Ray tracing), routing (static in code,
content-based with Step Functions, metric-based, API Gateway request transformation).

Retry walkthrough: call returns ThrottlingException, SDK waits base * 2^n with jitter, retries up to the configured maximum, then the
application falls back to a second model and the response carries a "degraded" flag.

Streaming walkthrough: a client opens a request, Lambda calls `converse_stream`, forwards `contentBlockDelta` events as they arrive,
and the client renders tokens incrementally. Must verify current API Gateway REST response streaming, Lambda response streaming, and
timeout limits before writing numbers.

#### What changes
| File | What changes |
|---|---|
| `parts/40-ch4-task-2-4.html` | Chapter 4, about 600 to 800 lines |

#### Implementation checklist
1. Four skill sections with Boto3 sketches (streaming loop, botocore `Config(retries=...)`, SQS worker).
2. Comparison table: WebSocket vs SSE vs response streaming.
3. Labs: (a) stream a response from Python; (b) SQS-backed async request with a worker Lambda; (c) a usage plan with a rate limit. Console + CLI each.
4. Checkpoint and recap.

### Milestone 7: Project 2, streaming, resilient, routed GenAI API

#### Why this matters
Chapters 2 to 4 share one failure story: a production API under load. Building it once ties deployment, streaming, resilience, and routing together.

#### How it works
```
Client ─> API Gateway (validation, usage plan, request transform) ─> Lambda (streams tokens)
                                                                      │
                          router: simple ─> small model, complex ─> larger model, error ─> fallback model
                                                                      │
                                         X-Ray traces, CloudWatch metrics, SQS for long jobs
```

#### What changes
| File | What changes |
|---|---|
| `parts/41-project2.html` | Problem, architecture, stack, build path, done list, notes |

#### Implementation checklist
1. Skills practiced: 2.2.1, 2.2.3, 2.4.1 to 2.4.4.
2. Write brief, diagram, services table, 6 to 8 build milestones, definition of done, cost notes.

### Milestone 8: Chapter 5, Task 2.5 Application integration and dev tools

#### Why this matters
The last mile: a front end for the model, a no-code flow business teams can edit, document processing that feeds a CRM,
and a way to debug "the model said something strange" from logs instead of guesswork.

#### How it works
Six skills: FM API interfaces for GenAI workloads (token limit management, streaming through API Gateway, retries for timeouts),
accessible interfaces (Amplify UI components, OpenAPI-first design, Prompt Flows as no-code builder), business system enhancement
(Lambda CRM enhancements, Step Functions document processing, Bedrock Data Automation), developer productivity (Amazon Q Developer; verify the current product name and scope, which may have changed), advanced applications
(Strands and Agent Squad orchestration, Step Functions agent patterns, prompt chaining), troubleshooting (CloudWatch Logs Insights on invocation logs, X-Ray traces, Q Developer error-pattern help).

Include a ready-to-run Logs Insights query set for invocation logs (latency by model, token usage per caller, error counts by type).

#### What changes
| File | What changes |
|---|---|
| `parts/50-ch5-task-2-5.html` | Chapter 5, about 600 to 800 lines |

#### Implementation checklist
1. Six skill sections with examples.
2. OpenAPI snippet for a GenAI endpoint with token-limit fields.
3. Labs: (a) Bedrock Data Automation on a sample document; (b) Logs Insights queries over invocation logs; (c) a Prompt Flow wired to a Lambda. Console + CLI each.
4. Checkpoint and recap.

### Milestone 9: Project 3, enterprise GenAI integration with CI/CD and a gateway

#### Why this matters
The final workshop covers what turns a pilot into a platform: events, a pipeline that tests prompts and scans code before deploy, and one gateway all teams use.

#### How it works
```
Legacy CRM ─> EventBridge ─> Lambda adapter ─> Step Functions (document processing) ─> Bedrock / Data Automation
Git push ─> CodePipeline ─> CodeBuild (tests, security scan, prompt regression) ─> deploy ─> rollback on alarm
All callers ─> GenAI gateway (auth, quota, logging, routing) ─> models
```

#### What changes
| File | What changes |
|---|---|
| `parts/51-project3.html` | Problem, architecture, stack, build path, done list, notes |

#### Implementation checklist
1. Skills practiced: 2.3.1, 2.3.2, 2.3.3, 2.3.5, 2.5.3, 2.5.5, 2.5.6.
2. Brief, diagram, services table, build path, done list, cost notes.

### Milestone 10: Project map

#### Why this matters
After three projects the reader should know which of the 25 skills they have exercised and which they have only read about.

#### How it works
A table of all 25 skills with the chapter that teaches each and the project that practices it. A "what the projects leave out" list
(likely: 2.3.4 Outposts and Wavelength, 2.5.2 Amplify, 2.5.4 Amazon Q Developer, 2.2.2 large-model containers). A suggested order and effort estimate. An optional capstone.

#### What changes
| File | What changes |
|---|---|
| `parts/90-map.html` | Coverage table, gaps, order, optional capstone |

#### Implementation checklist
1. Build the 25-row coverage table from `aip_01_exam_guide.md`.
2. Write gaps, order, and capstone sections.

### Milestone 11: Assembly and verification

#### Why this matters
A guide with broken links, wrong skill coverage, or invented API names is worse than none.

#### How it works
Checks run before the guide is declared done:

1. All 25 skills (2.1.1 to 2.5.6) appear in a chapter heading or skills box. A grep script reports any missing id.
2. Internal links and Domain 1 cross-links resolve to existing ids.
3. HTML is well formed and the page opens with the sidebar, Mermaid diagrams, and collapsible answers working. Check in a headless browser if available; otherwise check structure with an HTML parser and tell you what was not visually verified.
4. Every lab has a Console path and a CLI/Boto3 path (grep for both markers).
5. Every code sketch is syntax-checked (Python with `ast.parse`, JSON with `json.loads`) where it is complete enough to parse.
6. Facts from research notes are cross-checked against sources recorded in the notes.

#### What changes
| File | What changes |
|---|---|
| `docs/domain/aip-c01-domain2-study-guide.html` | Final assembled guide |
| `docs/domain/.domain2-parts/` | Removed after you confirm, or kept if you prefer |

#### Implementation checklist
1. Run `assemble.sh`.
2. Run the verification checks above and fix failures.
3. Report results, with anything not verified stated plainly.

---

## Research list (done before writing each chapter)

Sources: local `amazon-bedrock` skill references first, then AWS documentation search/read tools.

| Chapter | Topics to verify |
|---|---|
| 1 | Strands Agents current API (agent, tools, session managers, multi-agent patterns); AWS Agent Squad status; AgentCore Runtime, Memory, Gateway, Identity, Observability (`references/agentcore-*.md`); MCP server on Lambda patterns; Step Functions wait-for-callback and Bedrock integrations; how Bedrock Agents relate to AgentCore today |
| 2 | Provisioned Throughput terms and commitment options; SageMaker inference options and LLM containers; model loading and scaling features; Bedrock custom model import and imported-model deployment; cross-Region inference interplay |
| 3 | API Gateway integration types; EventBridge to Lambda and DLQ behavior; IAM Identity Center and federation with Bedrock; Outposts and Wavelength current status for GenAI; CodePipeline/CodeBuild patterns; reference gateway solutions (verify names before citing) |
| 4 | Converse streaming event shapes; API Gateway REST response streaming and limits; Lambda response streaming; SDK retry modes; usage plans and throttling; X-Ray with Bedrock; Bedrock intelligent prompt routing and its status |
| 5 | Amplify AI kit; Bedrock Data Automation APIs and pricing model; Prompt Flows current status; Amazon Q Developer current name and scope; invocation logging schema for Logs Insights queries |

Any item that cannot be verified is written without a specific number or name, and marked in the guide as "check the current docs".

---

## Effort and size

| Item | Estimate |
|---|---|
| Final size | about 4,000 to 5,000 lines of HTML, similar to Domain 1 |
| Writing passes | 12 (milestones 0 to 11), each saved to disk before the next starts |
| Labs | about 14 to 18, each with Console and CLI/Boto3 paths |
| Diagrams | about 12 to 16 Mermaid diagrams |
| Checkpoints | 5, each with 3 to 5 questions |

## Constraints

- No `git add`, commit, or amend. All files stay modified or untracked for you to review.
- No AWS resources are created while writing the guide. Labs in the guide are for you to run.
- Unit tests are not applicable (this is documentation). The verification checks in Milestone 11 take their place.

## Open items for your review

1. Is the part-file approach (a temporary `.domain2-parts/` folder) acceptable, or should the final HTML be written directly?
2. Should I pause for your review after Chapter 1 and Project 1, to confirm tone and depth before writing the rest? This is my recommendation, because those two make up about a quarter of the guide.
