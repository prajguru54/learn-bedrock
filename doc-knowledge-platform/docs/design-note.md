# Design note: doc-knowledge-platform

Status: M1. Numbers below are targets. M2 records the first baseline, and later milestones are judged against it.

## What the system does

Employees upload policy documents, scanned forms, CSV tables and text files into S3. The system makes each file searchable. Employees ask questions through an API and receive an answer with citations (document and page, row range or section). A caller sees only documents from their own department plus `company-wide`.

## Targets

| Measure | Target | How it is measured |
|---|---|---|
| Retrieval recall@5 (baseline, vector only) | at least 0.80 | `scripts/eval_retrieval.py` on the 35 answerable golden questions |
| Retrieval recall@5 (after M7 upgrades) | at least 0.90 | same script |
| Access leaks | 0 of 5 negative questions return the forbidden document, on every store and every retrieval mode | same script |
| Citation validity | every citation in an answer points to a chunk that was actually retrieved | answer validator in `answer.py` |
| Query latency, p95 (retrieve + generate) | under 5 s baseline, under 8 s with rewrite and rerank | timing in the eval script |
| Cost per question | under USD 0.003 including rewrite and rerank | token counts from Converse `usage` |
| Time to searchable after upload, p95 | under 5 min | S3 event time to manifest `status=indexed` |
| Bad files | 4 of 4 `_bad/` files quarantined with a reason, none indexed | S3 listing and quarantine reason JSON |

## Corpus

30 documents plus 4 bad files, all synthetic, produced by `scripts/generate_corpus.py`.

| Form | Count | Notes |
|---|---|---|
| Text PDF | 17 | One section per page, so expected page numbers are exact |
| Scanned PDF | 5 | Image only, no text layer. Needs Textract |
| CSV | 4 | Row-based citations |
| Markdown / text | 4 (3 `.md`, 1 `.txt`) | Section-based citations |
| `_bad/` | 4 | Zero bytes, corrupt PDF, executable with a `.pdf` name, blank scan |

Departments: `hr`, `finance`, `sales`, `legal`, `company-wide`.

Version 1 of `hr/leave-policy.pdf` is in the corpus. Version 2 is in `eval/corpus_updates/` and is uploaded to the same key in the M6 freshness test. Only the parental-leave page differs (12 weeks becomes 16 weeks).

## Golden set

`eval/golden_questions.json` holds 40 questions: 26 on text PDFs, 6 on scans, 4 on CSV, 4 on text files. Five of them are access-negative (asker's department cannot see the document that holds the answer). The self-check in `generate_corpus.py` confirms every expected answer string exists at the stated page, row or section.

Hit at 5: one of the top 5 chunks has the expected `doc_id` and a matching page (PDF, scan), a row range containing `expected_row` (CSV) or the expected section (text). A negative question passes when no top-5 chunk comes from `forbidden_doc`. CSV row numbers count data rows from 1, with the header excluded.

## Metadata schema

| Field | Filterable | Used for |
|---|---|---|
| `department` | yes | Access filter: `hr`, `finance`, `sales`, `legal`, `company-wide` |
| `doc_id` | yes | Delete by document and citations. SHA-256 of the S3 key, truncated |
| `version` | yes | Only the current version is searchable |
| `modality` | yes | `pdf`, `scan`, `csv`, `text` |
| `effective_date` | yes | Freshness rules and date filters. Taken from the S3 object's `LastModified` date |
| `page` | no | Citation for PDFs and scans |
| `locator` | no | Citation for CSV (`rows 12-14`) and text (`§ Hotel limits`) |
| `s3_uri` | no | Link back to the source |
| `chunk_text` | no | Text sent to the model |

Chunk id: `{doc_id}#v{version}#{n}`. It is deterministic, so deleting a document never needs a search.

Confirm the current S3 Vectors limits on filterable metadata size and key count before M2.

## Decisions

**Vector store: S3 Vectors first, Aurora pgvector second.** S3 Vectors has no idle cost and needs no VPC, so M2 to M6 stay cheap. It has no keyword search. Hybrid search in M7 needs Aurora PostgreSQL with pgvector and a `tsvector` index. Both sit behind a `VectorStore` protocol so the golden set runs unchanged on either.

**Access control comes from caller identity.** The API reads `X-User-Id`, `access.py` maps it to departments, and the department filter is applied in the store query. The department is never taken from the request body or from the model. This differs from the study guide's `search_documents(query, department)` signature, where the model could ask for any department.

**Region: `ap-southeast-2` for the project, `us-west-2` for rerank only.** Bedrock Rerank is not available in `ap-southeast-2`, so only the rerank call goes to `RERANK_REGION`. The corpus is synthetic, so cross-Region data movement is harmless here. With real data it is a data-residency trade-off.

**Blocker faced:** `bedrock:Rerank` was denied by an organization SCP (`p-f1is11b5`). Fixed by updating the SCP in the management account. See `docs/concepts/aws_organizations_and_scps.md`.

**Models** (settings, not constants): Titan Text Embeddings V2 at 1024 dimensions, normalized. Generation and rewrite use `apac.amazon.nova-lite-v1:0`, an APAC inference profile.

**Comprehend works** in this account (PII detection passed preflight), so M5 can use it and keeps the regex + Bedrock fallback as an option.

## Preflight results (M1)

| Check | Result |
|---|---|
| Titan Text Embeddings V2 | pass, 1024 dimensions |
| Nova Lite (APAC profile), Converse | pass |
| Textract on a generated scan | pass, mileage rate `0.96` read correctly |
| S3 Vectors API | pass |
| Comprehend PII | pass |
| Bedrock Rerank (`us-west-2`) | pass, after the SCP fix |

## Out of scope

Audio and video, real company data, per-user (not per-department) permissions, multi-language content.
