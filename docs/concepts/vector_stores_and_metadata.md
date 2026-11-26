# Vector Stores and Metadata — How Retrieval Finds the Right Chunk

> Running example: the doc-knowledge-platform (Project 2). Every term is tied to a file,
> an index, or a golden question you already have.
> Exam skills: 1.4.1 (vector store design), 1.4.2 (metadata framework), 1.5.3 (vector search).
> S3 Vectors limits were checked against the AWS docs on 2026-11-21. Re-check before relying on a number.

---

## The problem these pieces solve

Monday morning. A sales rep asks the assistant, "How many weeks of parental leave does a
primary caregiver get?" The HR policy that answers it is in the system. The rep is not in HR.

Three things must be right for this to go well:

1. **Find** the page that answers the question, out of thousands of chunks.
2. **Not show** that page to someone who may not see it.
3. **Say where** the answer came from (document and page).

A vector store handles (1). Metadata handles (2) and (3). If the metadata is designed badly,
you cannot fix it by tuning the model. You re-index everything.

```
chunk text ──embed──► vector (1024 numbers)  ─┐
                                              ├─► stored together under one key
metadata {department, doc_id, page, ...}   ───┘

question ──embed──► vector ──► "closest vectors, but only where department is allowed"
```

---

## Vectors in one paragraph

An embedding model (Titan Text Embeddings V2) turns text into a list of numbers. Texts with
similar meaning end up close together. "Parental leave for new parents" and "weeks off after a
birth" land near each other even though they share no words. A vector store keeps these lists
and answers "which stored vectors are closest to this one?". That is **nearest-neighbour search**.

Two settings are fixed when you create an index and cannot change later:

| Setting | Our value | Why it is fixed |
|---|---|---|
| Dimension | 1024 | Every stored vector and every query vector must have the same length. A different embedding model usually produces a different length, or the same length with a different meaning. |
| Distance metric | cosine | Compares direction, not length. Titan V2 with `normalize: true` is built for it. |

Switching embedding models means creating a **new index** and re-embedding every chunk. This is
why the plan names the index `chunks-v1`.

---

## The four options and when each fits

| | **S3 Vectors** | **Aurora PostgreSQL + pgvector** | **OpenSearch** (Serverless or managed) | **Bedrock Knowledge Base** |
|---|---|---|---|---|
| What it is | Vector storage built into S3 | Vectors as a column in a SQL table | Search engine with a k-NN engine | A managed pipeline (parse, chunk, embed, store, retrieve) on top of one of the stores |
| Idle cost | Almost none. Pay for storage and requests | Pay while the cluster runs (Serverless v2 can scale down) | A compute floor while it exists | Whatever store you choose, plus model calls |
| Keyword search | No | Yes (`tsvector`) | Yes (BM25) | Depends on the store |
| Hybrid (keyword + vector) in one query | No | Yes, SQL | Yes, query DSL / search pipelines | Depends on the store |
| Metadata filtering | Filterable and non-filterable keys, `$eq`, `$in`, `$and`, ... | Any SQL `WHERE` | Full query DSL | Metadata filters on the retrieve call |
| You operate | Nothing | A database | A search cluster or collection | Almost nothing, and you get less control |
| Fits | Cheap, large, mostly-idle corpora. Semantic-only search | When vectors sit next to relational data, or you need hybrid | Heavy search workloads: hybrid, aggregations, fine-grained ranking | When you want it running with the least code |

How this project uses them:

- **M2 to M6: S3 Vectors.** No idle cost, no VPC, no database to patch.
- **M7: Aurora pgvector.** S3 Vectors has no keyword search, and M7 needs it for hybrid.
  Both stores sit behind the `VectorStore` protocol, so the golden set runs unchanged on either.
- **M9: Knowledge Base on its own S3 Vectors index.** It is a build-versus-buy comparison.
- **OpenSearch is not built here.** Know why you would pick it (exam skills 1.4.1, 1.4.3, 1.5.4):
  the k-NN engine, the Neural plugin that calls Bedrock for embeddings, sharding, and
  hybrid search through search pipelines. The cost is the standing compute and the operations.

---

## S3 Vectors: the object model

```
Vector bucket  dkp-vectors-<account>          (a container, like an S3 bucket)
  └─ Index     chunks-v1                      (dimension 1024, cosine, metadata config)
       └─ Vector
            key       "a1b2c3#v1#0"           (your id; same key = overwrite)
            data      [0.012, -0.044, ...]    (float32 x 1024)
            metadata  {department, doc_id, version, modality, effective_date,
                       page, locator, s3_uri, chunk_text}
```

Limits that shape the design (from the AWS limits page):

| Limit | Value | What it means for us |
|---|---|---|
| Vectors per `PutVectors` / `DeleteVectors` call | 500 | The store wrapper must batch |
| Vectors per `GetVectors` call | 100 | Same, for reads |
| `QueryVectors` top-K | up to 10,000 | We ask for 5 now and 30 in M7 |
| Metadata keys per vector | 50 | We use 9 |
| Non-filterable keys per index | 10 | We use 4 |
| Filterable metadata per vector | 40 KB on `ENHANCED` indexes, 2 KB on `CLASSIC` | Decides how much you may keep filterable |
| One filterable string value | 2 KB | Never make `chunk_text` filterable |
| Total metadata per vector | 100 KB `ENHANCED`, 40 KB `CLASSIC` | A 300-token chunk is about 1.5 KB, so we are far below |
| Filter constraints per query (`ENHANCED`) | 100 | An `$in` over 5 departments counts as 5 |

### Index mode: `ENHANCED` vs `CLASSIC`

This changes how a filtered query behaves, so it matters for access control.

| | `ENHANCED` | `CLASSIC` |
|---|---|---|
| Filter is applied | **Before** the vector search (pre-filter) | **During** the search, alongside it |
| Selective filter | Still finds the true nearest matches | Can return **fewer than K** results |
| Filterable metadata | up to 40 KB | up to 2 KB |
| Which buckets | Created on or after 30 Sep 2026 | Created before that date |

Today's date on this machine is after 30 Sep 2026, so a new vector bucket should create
`ENHANCED` indexes. Do not assume. After creating the index in M2, confirm it:

- **Console:** **S3 → Vector buckets →** your bucket **→** the index. The detail page shows the index mode.
- **CLI:**
  ```bash
  aws s3vectors get-index --vector-bucket-name dkp-vectors-$ACCOUNT_ID \
    --index-name chunks-v1 --region ap-southeast-2
  ```

If it says `CLASSIC`, switch it (no re-ingestion, no extra charge):

- **Console:** open the index, choose **Enable enhanced index mode**, tick the acknowledgement, choose **Enable**.
- **CLI:**
  ```bash
  aws s3vectors update-index-mode --vector-bucket-name dkp-vectors-$ACCOUNT_ID \
    --index-name chunks-v1 --index-mode ENHANCED --region ap-southeast-2
  ```

The AWS CLI (2.39.6) and boto3 (1.44.9) installed here both support `update-index-mode`. You can also set the bucket default for future indexes with `aws s3vectors put-vector-bucket-default-index-mode --default-index-mode ENHANCED`.

---

## Filtering: inside the query, never after

Take 1,000 chunks: 800 from HR, 200 from Finance. A Finance user asks about expense limits.
Suppose the top 5 nearest chunks overall happen to be HR chunks about "reimbursement of leave
costs".

```
Filter after the search (wrong)             Filter inside the query (right)
────────────────────────────────            ────────────────────────────────
nearest 5 of all 1,000 chunks               restrict to finance + company-wide
   → 5 HR chunks                               → nearest 5 of those 200 chunks
remove what the user may not see               → 5 allowed chunks
   → 0 chunks                               user sees the expense policy
user sees "no result"
```

The second form is also the security boundary. The department list comes from the caller's
identity (`X-User-Id` → `access.py`), is applied as a filter in `query_vectors`, and is never
read from the request body or chosen by the model.

```python
filter = {"department": {"$in": allowed_departments}}   # e.g. ["finance", "company-wide"]
```

On a `CLASSIC` index a selective filter can still come back short of K. That is one more reason
to check the index mode. The golden set has five access-negative questions. They must return no
chunk from the forbidden document, whatever the mode.

---

## Metadata design

Metadata answers two questions: *which chunks may this search consider?* and *what do I show
the user?* Different fields serve different purposes, so they are stored differently.

| Field | Filterable | Why |
|---|---|---|
| `department` | yes | The access filter |
| `doc_id` | yes | Delete or replace every chunk of one document. Also the citation target |
| `version` | yes | Only the current version is searchable (M6) |
| `modality` | yes | `pdf`, `scan`, `csv`, `text`. Lets you filter or measure by type |
| `effective_date` | yes | Date filters and freshness rules |
| `page` | **no** | Only displayed in the citation |
| `locator` | **no** | `rows 12-14`, `§ Hotel limits`. Only displayed |
| `s3_uri` | **no** | Link back to the source. Only displayed |
| `chunk_text` | **no** | The text sent to the model. Large, and never a filter |

Rule of thumb: **filterable if a query has to select on it, non-filterable if you only read it back.**

### What goes wrong when metadata is designed badly

| Mistake | What happens |
|---|---|
| `chunk_text` left filterable | Counts against the filterable size limit. A long chunk makes `PutVectors` return `400 Bad Request` (2 KB on `CLASSIC`) |
| A key you later want to filter on was marked non-filterable | Non-filterable keys are fixed at index creation and cannot become filterable. You create a new index and re-ingest |
| Filter on a key that was never written | Vectors without the key do not match an equality filter, so they silently drop out of results. Write every key on every vector, or use `$exists` deliberately |
| `department` taken from the client | Any user can ask for any department. Derive it from identity |
| No `doc_id` or `version` | You cannot delete or replace a document without searching for its chunks (M6) |
| No `page` or `locator` | Answers have no verifiable citation. This was the failure in the "last chatbot" scenario in the plan |

### Chunk keys

Format: `{doc_id}#v{version}#{n}`. The key is deterministic, so removing a document means
deleting a list of keys you can compute (500 per `DeleteVectors` call), not running a search
first. Writing the same key again overwrites the vector, which makes re-ingestion safe to repeat.

### Where each field comes from

| Field | Source |
|---|---|
| `department` | First path segment of the S3 key (`hr/leave-policy.pdf` → `hr`) |
| `doc_id` | SHA-256 of the S3 key, truncated |
| `version` | Manifest in DynamoDB, bumped on each re-ingest (M6) |
| `modality` | Decided by the extractor (M2: `pdf`; M5 adds `scan`, `csv`, `text`) |
| `effective_date` | `LastModified` of the S3 object |
| `page` / `locator` | Chunker output |
| `s3_uri` | Built from bucket and key |

This is exam skill 1.4.2 in practice: S3 object attributes (timestamps, key prefix) feed the
vector metadata, so retrieval can filter on them.

---

## The same idea in pgvector (M7)

The same fields become columns. The filter becomes a `WHERE` clause. The metadata design does not change.

```sql
SELECT chunk_id, page, locator, chunk_text,
       embedding <=> :query_vec AS distance      -- <=> is cosine distance
FROM   chunks
WHERE  department = ANY(:allowed_departments)    -- the same access filter
ORDER  BY embedding <=> :query_vec
LIMIT  30;
```

Two things differ from S3 Vectors:

- With an approximate index (HNSW), a `WHERE` filter can be applied after the index scan and leave
  fewer rows than `LIMIT`. pgvector 0.8 added iterative index scans for this. Check the version on
  your cluster: `SELECT extversion FROM pg_extension WHERE extname = 'vector';`
- A keyword column (`tsvector`) sits in the same table, so one query can combine both rankings.

---

## Score or distance?

`query_vectors` returns a **distance**: smaller means closer. The M2 rule "refuse to answer when no
chunk is close enough" needs a distance cutoff. Do not pick it by feel. Run the golden set, look at
the distances of the correct chunks and of the wrong ones, and set the cutoff between them.

---

## Checks to run in M2

1. After creating the index, run `get-index` and record the index mode.
2. Write one vector with every metadata key. Query it with a `department` filter that matches, then one that does not.
3. Query with a filter on a key you did not write. Note what comes back.
4. Try filtering on `chunk_text` (non-filterable). Note the exact error.
5. Run the five access-negative golden questions against the finished pipeline.

## Checkpoint questions

1. Why is `department` filterable but `chunk_text` not?
2. What happens to a filter on a metadata key that was never written?
3. Why is the embedding dimension fixed when the index is created? What do you have to do to switch embedding models?
4. Why must the access filter run inside the query? What can happen if it runs after?
5. Which index mode can return fewer than K results for a selective filter, and why does that matter for access control?
6. Why does M7 add Aurora instead of replacing S3 Vectors?

---

## Sources

- [S3 Vectors limitations](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-limitations.html)
- [S3 Vectors metadata filtering](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-metadata-filtering.html)
- [Changing a vector index's mode](https://docs.aws.amazon.com/AmazonS3/latest/userguide/s3-vectors-index-mode.html)
