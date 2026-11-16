# Create a domain study guide

Use this prompt to build a book-style study guide for one domain of the AWS Certified Generative AI Developer - Professional (AIP-C01) exam, in the same format as the Domain 1 guide.

**How to run it.** Start a Claude Code session at the repository root and say:

> Follow `prompts/create_domain_study_plan.md` for **Domain N**.

Replace `N` with the domain number (2 to 5). No other input is needed. Work from the defaults below and do not ask clarifying questions unless the exam guide itself is missing or ambiguous.

---

## 0. What you are producing

One standalone HTML file, `docs/aip-c01-domain{N}-study-guide.html`, that the reader can open locally and read like a book. It must contain:

1. A cover with a chapter table and a legend for the callouts.
2. One **chapter per exam task** in the domain (for example Domain 1 had Tasks 1.1 to 1.6). Add an **Orientation** chapter only if the domain needs prerequisite knowledge that the Domain 1 guide did not already cover. If it does not, link to the Domain 1 guide in the cover paragraph and skip it.
3. **Project workshops** placed between chapters at natural break points, and a closing **project map** (see section 6).
4. A sidebar table of contents with per-chapter expand and collapse, expand-all and collapse-all buttons, and a button that hides the whole sidebar. All of this is already built into the template shell. Do not rewrite it.

The reader is described in `my_background.md`: a senior Python backend and GenAI developer (FastAPI, LangChain, RAG, agents, MCP, Docker) who is new to AWS. The guide explains the AWS-specific layer in depth, gives only brief refreshers on concepts they already know, and defines every AWS term on first use. The official exam guide is only a syllabus, and this document exists because the syllabus does not teach the concepts.

## 1. Fixed defaults (already agreed with the reader)

- One chapter per exam task.
- Brief refreshers on known concepts. Depth on the AWS-specific layer.
- Short Boto3 snippets (10 to 30 lines), Python only. Boto3 and native AWS APIs before any framework.
- Exam-tip callouts, and "Backend analogy" callouts that map AWS ideas to things the reader knows.
- Hands-on **console labs** wherever a console exercise genuinely exists, so the reader can try the concept quickly.
- Project workshops with a problem statement, architecture, services and tech, a build path, and a definition of done.
- All tasks in a single document.

## 2. Read these first

1. `AGENTS.md` and `my_background.md` at the repository root (repo rules, reader profile, teaching style).
2. `aip_01_exam_guide.md`. Locate Domain N, list every task and every numbered skill, and note the domain's percentage weight.
3. `docs/aip-c01-domain1-study-guide.html` as the **style reference**. Skim the cover, one full chapter, one project workshop, and the project map so that tone, structure, and component use match. Do not copy its content.
4. Any `CLAUDE.md` in the working directory that describes AWS account restrictions (for example a single assigned Region, services unavailable on the plan). Labs and projects must respect these. If none exists, assume a normal account and still flag cost traps.
5. The `.claude/skills` AWS skills that match the domain (for example `amazon-bedrock`, `aws-sdk-python-usage`, `aws-iam`, `aws-observability`, `aws-security`, `aws-serverless`, `aws-ai-ml`). Load the relevant ones **before** writing, and use them as the source of truth for current service behavior. The `ToolSearch` tool can load `WebSearch` and `WebFetch` for the AWS documentation when a skill is silent.

## 3. Set up the scratch directory

```bash
N=2                                   # the domain number
PARTS=/tmp/aip-d$N
mkdir -p $PARTS
T=prompts/study-guide-template
cp $T/shell-head.html $PARTS/00-head.html
cp $T/shell-foot.html $PARTS/zz-foot.html
```

Fill every `{{PLACEHOLDER}}` in `00-head.html` and `zz-foot.html`:

| Placeholder | Value |
|---|---|
| `{{DOC_TITLE}}` | Short document title, two to four words, for example `AIP-C01 Domain 2 Guide` |
| `{{EYEBROW}}` | `AWS Certified Generative AI Developer – Professional (AIP-C01)` |
| `{{H1}}` | The domain's full official title |
| `{{LEDE}}` | Two sentences: the domain's weight and what the guide does (see the Domain 1 cover) |
| `{{COVER_ROWS}}` | One `<tr>` per chapter and per project workshop, in reading order, three cells each: chapter link, exam task, "What you will be able to do". Link targets are the chapter `id` values you will use (`task-N-M`, `project-1`, `project-map`) |
| `{{STORAGE_PREFIX}}` | A short unique key such as `aip-c01-d2`, used for the saved sidebar state |

Do not edit the CSS or the script in the shell. If you need a new visual component, add a few lines of CSS to `00-head.html` before the `/* Cover */` comment and use only the existing color tokens so that light and dark themes keep working.

## 4. The authoring contract for chapter fragments

Write this section to `$PARTS/CONTRACT.md` (copy it verbatim) and give the path to every writing agent.

````markdown
# Authoring contract for chapter fragments

Each chapter is one or more HTML FRAGMENT files in the parts directory (no doctype, html, head, or body, no <style>, no <script>).
Do NOT edit 00-head.html or zz-foot.html.

## File naming
Write each chapter as several fragments so no single Write is huge: `chN-a.html`, `chN-b.html`, `chN-c.html` ...
(N = the task number within the domain, or 0 for Orientation). The FIRST fragment opens `<section class="chapter" id="...">`
and the LAST closes `</section>`. Split fragments only between h3 blocks, where the HTML is balanced.
Project workshops are single files: `p1-project.html`, `p2-project.html`, ..., and `pZ-map.html` for the closing map.

## Chapter skeleton (first fragment)
<section class="chapter" id="task-D-M">   (orientation uses id="orientation")
  <header class="chapter-head">
    <p class="eyebrow">Chapter M · Task D.M</p>
    <h2>Chapter title</h2>
    <p class="lede">2-3 sentences: why this matters and what the chapter builds.</p>
    <div class="skills"><p>Exam skills covered</p><ul><li><strong>D.M.1</strong> short paraphrase</li>...</ul></div>
  </header>
Every h3 needs a unique id with a task prefix, for example id="t21-model-calls". Ids must be unique across the whole document.
Use h3 for sections, h4 for subsections, h5 for small labels. No h1. The chapter title is the only h2.

## Components
- Callouts (use all kinds, with judgment, not on every paragraph):
  <aside class="callout exam"><p class="callout-title">Exam tip</p><p>...</p></aside>
  <aside class="callout analogy"><p class="callout-title">Backend analogy</p><p>...</p></aside>
  <aside class="callout warn"><p class="callout-title">Watch out</p><p>...</p></aside>
  <aside class="callout note"><p class="callout-title">Note</p><p>...</p></aside>
- Console lab (only where a console exercise genuinely exists):
  <section class="lab"><p class="callout-title">Hands-on lab</p><h4>Lab title</h4>
    <p class="lab-meta">About 20 minutes · Cost: ... · Needs: ...</p>
    <ol class="steps"><li>Open <strong>Amazon Bedrock</strong> console → <strong>Section</strong> ...</li></ol>
    <p class="cleanup"><strong>Cleanup.</strong> ...</p></section>
  State cost honestly. Remind the reader to use their selected Region. Always include cleanup.
- Tables: <div class="table-wrap"><table><thead><tr><th>..</th></tr></thead><tbody>...</tbody></table></div>
- Code: <pre><code>...</code></pre>. Escape &lt; &gt; &amp;. Python and Boto3 only.
- Diagrams: <pre class="mermaid">flowchart LR ...</pre>. The page loads Mermaid itself. Keep diagrams simple and valid.
  QUOTE EVERY node label that contains spaces or punctuation: A["label (with parens)"]. Quote edge labels: -->|"yes"|.
  Aim for 2-4 diagrams per chapter where a picture beats prose.
- Chapter end (last fragment, before </section>):
  <div class="recap"><h3>Chapter recap</h3><ul><li>...</li></ul></div>
  <div class="checkpoint"><h3>Knowledge check</h3><ol><li><p>Scenario question.</p>
    <details><summary>Answer</summary><p>Answer, and why each distractor is wrong.</p></details></li>...</ol></div>
  Give 5 to 6 exam-style scenario questions per chapter that pick the BEST service or pattern under constraints.

## Voice and level
- Write like a book chapter: connected prose, explain WHY, trade-offs, and how components fit. Bullets only for true lists.
- Do not explain basic Python, REST, Docker, or what an embedding, RAG, or prompt is at length. Give a short refresher, then spend the words on the AWS layer.
- Define every AWS term, service, and acronym on first use, in plain words. Do not assume IAM, VPC, or S3 knowledge.
- Frame "when to choose X over Y" explicitly. The exam asks for the BEST option under cost, latency, operations, and compliance constraints.
- Prefer concrete numbers, named features, and API or parameter names. If you are not sure a detail is current, say so briefly or describe it generally. Never invent a quota, price, model ID, or console label.
- Style: plain, direct sentences. No emoji. No em dashes. Avoid "not X but Y" framing and filler such as "it's worth noting".
- Length: roughly 5,000 to 7,000 words of prose per chapter, excluding code.

## Accuracy
Load the matching AWS skills before writing and use them as the source of truth. Use the AWS documentation when a skill is silent.
Boto3 clients: bedrock (control plane), bedrock-runtime (invoke and converse), bedrock-agent (knowledge base, agent, and prompt control plane),
bedrock-agent-runtime (retrieve, retrieve_and_generate, invoke_agent, rerank, flows). Check names for other services.
````

## 5. Write the chapters

1. Plan the chapter list from the exam guide: one chapter per task, with its skills in the `skills` box. Decide the reading order and where each project workshop goes (section 6).
2. Launch **one writing agent per chapter, in parallel in a single message** (the `Agent` tool; use a fork if available so the agent inherits this context). Give each agent: the parts directory, `CONTRACT.md`, the task's skills copied from the exam guide, the chapter id and file prefix, the Domain 1 guide path for style, the list of earlier-domain chapters it should link to by name and not re-teach, and which skills to load. Tell each agent to write several fragment files and not one huge file.
3. Chapters in a domain build on each other. Tell each agent which neighbouring chapters exist so it can cross-link with `<a href="#t..">` to real ids only.

## 6. Project workshops

Place **two or three** workshops between chapters, grouping related tasks so each project exercises a connected set of skills. After the last chapter add one closing **project map** chapter. Each workshop is a single fragment, written as `<section class="chapter project" id="project-K">` with this structure:

- Header: eyebrow `Project workshop K · Build after Chapters ...`, title `Project K: ...`, a two-to-three sentence lede, and a `skills` box listing the exam skills practiced.
- `h3` **Problem statement**: a `<div class="brief">` with a concrete scenario, specific requirements, and a short paragraph connecting it to how the exam phrases the same situation.
- `h3` **Solution architecture**: one or two Mermaid diagrams plus prose that walks the data path and names the key decisions and trade-offs.
- `h3` **Technology and services**: a table with columns Piece, What you use, Why this choice, Read first (links to chapter sections).
- `h3` **Build path**: a suggested folder name and an `<ol class="milestones">` of 7 to 10 milestones. Each milestone has a bold name, then one or two sentences. Order them so that something works after every step. Include at least one milestone that measures quality, cost, or latency, and one that tests failure.
- `h3` **Definition of done**: 4 to 6 testable statements.
- `h3` **Cost, Region, and account notes**: a `warn` callout with the real cost traps, account limits from section 2, and fallbacks, then a short paragraph on expected spend.
- A closing `note` callout of **stretch ideas** that point toward later domains.

Rules for projects:

- Each project is independent with its own folder, as in `AGENTS.md`. When a project builds on a Domain 1 project, say to **copy** the needed modules into the new folder and not import across folders.
- Use Python, FastAPI, Boto3, Docker, and ECS Fargate where a deployment is part of the project, with infrastructure as code in the project's `infra/` folder. Use Boto3 before frameworks.
- Do not depend on services that are closed to new customers or deprecated. Verify availability in the skills.
- Be honest about effort. Give a rough range and label it as an estimate.

The **project map** chapter (`id="project-map"`) contains: a table mapping every exam skill in the domain to the project and milestone that practices it, a section on the skills the projects leave out and how to cover them instead (reading, a comparison table, a short lab), a suggested order with effort estimates, an optional capstone that combines the projects (with a Mermaid diagram), and one exam-tip callout about recording design decisions.

## 7. Verify the facts

After all chapters and projects exist, run a verification pass. Launch parallel agents, each owning a few chapters, and tell each one to:

- Re-check every service name, API and Boto3 call, parameter, quota, price, model ID, Region statement, and console label against the loaded `.claude/skills` and, where needed, the AWS documentation.
- Edit the fragments in place to correct wrong details. Replace anything unverifiable with a general description and a "check the console or documentation" note.
- Check that each lab fits the account restrictions from section 2, and add a short note where a service may be unavailable.
- Return a list of what it changed and a list of what it could not verify.

Keep the second list. It goes to the reader in the final message.

## 8. Assemble and validate

Create `$PARTS/order.txt`: the fragment file names, one per line, in reading order. Build the list explicitly. Do not rely on a single `ls` with several patterns, because `ls` sorts all its arguments together and scrambles the order of chapters and projects.

```bash
cd $PARTS
{ ls ch0-*.html 2>/dev/null; ls ch1-*.html; echo p1-project.html; ls ch2-*.html; ... echo pZ-map.html; } > order.txt
cd - >/dev/null
python3 prompts/study-guide-template/build_guide.py --parts $PARTS --out docs/aip-c01-domain$N-study-guide.html
```

The script concatenates head, fragments, and foot, wraps the result in a standalone page with the Mermaid loader, and checks tag balance, duplicate ids, broken in-page links, unfilled placeholders, `/tmp` references, em dashes, unquoted Mermaid labels, and the sidebar script syntax. Fix every reported problem in the fragments and rebuild until it exits cleanly.

The output needs an internet connection to load the fonts and Mermaid from their CDNs. It does not depend on the scratch directory.

## 9. Delivering the result

- If the `Artifact` tool is available, you may try to publish the file once. If it is refused (for example because the session authenticates with `ANTHROPIC_AUTH_TOKEN` and not a claude.ai login), do not retry. Deliver the local file.
- Do not claim the page was tested in a browser unless you actually opened it. Say that structure and syntax were validated and the diagrams were not visually checked.
- Finish with a short message: the output path, what the document contains (chapters and projects), what the verification pass corrected, the list of items that remain unverified, and any account restrictions that may affect specific labs. Offer follow-ups (publishing, aligning labs to the account) and do not start them unprompted.
- Keep the scratch directory. Mention that it is the source for regeneration and that `/tmp` is cleared on reboot.

## 10. Quality bar

- A reader with the Domain 1 guide in hand should find this one familiar: same components, same tone, same depth.
- Every exam skill listed in the exam guide for the domain is taught somewhere, and every skill appears in the project map.
- Every lab has cost, time, prerequisites, and cleanup. Every cost trap is called out.
- No invented specifics. When in doubt, hedge or leave it out.
