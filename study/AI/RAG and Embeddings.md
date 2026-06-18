# RAG and Embeddings

## Questions Covered

1. What is RAG (Retrieval-Augmented Generation), and why use it?
2. How does a RAG pipeline work end-to-end?
3. What are embeddings, and how do you choose an embedding model?
4. What chunking strategies work best for documents?
5. What vector databases and search services are available?
6. What is hybrid search, and why combine keyword + vector?
7. What is re-ranking, and when do you need it?
8. How do you handle metadata filtering in retrieval?
9. What are common RAG failure modes and fixes?
10. How do you evaluate RAG quality?
11. How do you implement RAG in .NET with Azure AI Search?
12. What is the difference between RAG and fine-tuning?

## What is RAG (Retrieval-Augmented Generation), and why use it?

**RAG** augments an LLM prompt with **retrieved documents** relevant to the user query — so answers are grounded in your private, up-to-date data without retraining the model.

**Why RAG:**

| Problem with LLM alone | RAG solution |
|------------------------|--------------|
| Knowledge cutoff | Inject current docs at query time |
| No access to private data | Retrieve from your vector index |
| Hallucinations on company facts | Answer from retrieved chunks + "cite sources" |
| Expensive to retrain | Update index when docs change |

```text
User: "What is our PTO policy for contractors?"
  → Embed query
  → Search vector DB for HR handbook chunks
  → Build prompt: system + chunks + question
  → LLM generates answer citing retrieved text
```

## How does a RAG pipeline work end-to-end?

**Ingestion (offline):**

```text
Documents (PDF, HTML, Markdown)
  → Extract text (Azure Document Intelligence, PyPDF)
  → Chunk into passages (500–1000 tokens, overlap 10–20%)
  → Embed each chunk
  → Store { id, text, embedding, metadata } in vector index
```

**Query (online):**

```text
User question
  → Embed query (same model as ingestion!)
  → Retrieve top-K similar chunks (K = 3–10)
  → Optional: re-rank, metadata filter
  → Assemble prompt with chunks
  → LLM generates answer
  → Return answer + source citations
```

```python
def rag_answer(question: str, index, llm) -> str:
    query_vec = embed(question)
    chunks = index.similarity_search(query_vec, top_k=5)
    context = "\n\n---\n\n".join(c.page_content for c in chunks)
    prompt = f"""Answer using ONLY the context below. Cite chunk IDs.
If unknown, say "I don't have that information."

Context:
{context}

Question: {question}"""
    return llm.chat(prompt)
```

## What are embeddings, and how do you choose an embedding model?

**Embedding models** map text → fixed-size float vectors. Similar meaning → small cosine distance.

| Model | Dimensions | Notes |
|-------|------------|-------|
| `text-embedding-3-small` | 1536 (configurable) | Cost-effective, good quality |
| `text-embedding-3-large` | 3072 | Higher accuracy, more cost |
| `text-embedding-ada-002` | 1536 | Legacy; migrate to v3 |
| Open-source (e.g. `bge-large`) | 1024 | Self-hosted option |

**Selection criteria:**

- **Same model** for ingest and query (critical — different models = incompatible vectors)
- **Language support** — multilingual docs need multilingual embeddings
- **Dimension vs speed** — higher dims = better recall but slower search
- **Cost at scale** — embed once at ingest; query embed is cheap

```csharp
var embeddingClient = azureClient.GetEmbeddingClient("text-embedding-3-small");
var response = await embeddingClient.GenerateEmbeddingAsync("Azure AI Search supports hybrid queries.");
ReadOnlyMemory<float> vector = response.Value.ToFloats();
```

## What chunking strategies work best for documents?

Chunk quality often matters **more than embedding model choice**.

| Strategy | Description | Best for |
|----------|-------------|----------|
| **Fixed-size** | N tokens + overlap | General docs |
| **Recursive** | Split by `\n\n`, then `.`, then words | Markdown, mixed content |
| **Semantic** | Split when embedding similarity drops | Long narrative |
| **Document-structure** | By heading, section, page | Manuals, policies |
| **Parent-child** | Small chunks for search; return parent for context | Precise retrieval + full section |

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,       # ~600 words
    chunk_overlap=120,    # 15% overlap preserves sentence boundaries
    separators=["\n\n", "\n", ". ", " ", ""],
)
chunks = splitter.split_text(document_text)
```

**Rules of thumb:**

- **800–1200 characters** or **400–800 tokens** per chunk
- **10–20% overlap** to avoid cutting mid-fact
- Attach **metadata**: `source`, `page`, `section`, `last_modified`, `acl`
- Don't chunk **tables/code** the same way as prose — preserve structure

## What vector databases and search services are available?

| Service | Type | Highlights |
|---------|------|------------|
| **Azure AI Search** | Managed search + vectors | Hybrid search, enterprise, .NET SDK |
| **Azure Cosmos DB (vector)** | NoSQL + vector | Unified app data + embeddings |
| **pgvector (PostgreSQL)** | Extension | SQL teams, joins with relational data |
| **Pinecone** | Managed vector DB | Simple API, serverless |
| **Qdrant / Weaviate / Milvus** | Self-hosted or cloud | Open source, high performance |
| **Redis Stack** | In-memory | Low-latency, smaller corpora |

```csharp
// Azure AI Search — vector query (simplified)
var searchOptions = new SearchOptions
{
    VectorSearch = new VectorSearchOptions
    {
        Queries = { new VectorizedQuery(queryEmbedding) { KNearestNeighborsCount = 5, Fields = { "contentVector" } } }
    },
    Select = { "content", "source", "page" }
};
var results = await searchClient.SearchAsync<SearchDocument>("", searchOptions);
```

**Interview pick for .NET/Azure shops:** Azure AI Search — hybrid search, security filters, integrated with Blob indexing.

## What is hybrid search, and why combine keyword + vector?

**Vector search** finds semantically similar text. **Keyword search (BM25)** finds exact terms (SKUs, error codes, names).

| Query type | Vector alone | Keyword alone | Hybrid |
|------------|--------------|---------------|--------|
| "How do I reset password?" | Good | OK | Best |
| "Error 0x80070005" | Poor | Excellent | Best |
| "Refund policy contractors" | Good | Good | Best |

```text
Hybrid score = α × vector_score + (1-α) × BM25_score
Typical α = 0.5–0.7 (tune on golden set)
```

Azure AI Search supports **Reciprocal Rank Fusion (RRF)** to merge ranked lists without manual weight tuning.

## What is re-ranking, and when do you need it?

**Re-ranking** takes top-K retrieved chunks (K=20–50) and scores them with a **cross-encoder** model that jointly reads query + document — more accurate than bi-encoder embeddings alone.

```text
Retrieve 20 chunks (fast bi-encoder)
  → Re-rank to top 5 (slow cross-encoder)
  → Send top 5 to LLM
```

| Stage | Model type | Speed | Accuracy |
|-------|-----------|-------|----------|
| Retrieval | Bi-encoder embedding | Fast | Good |
| Re-rank | Cross-encoder (e.g. Cohere Rerank) | Slower | Better |

Use re-ranking when: large corpus, ambiguous queries, or retrieval recall is good but precision is poor.

## How do you handle metadata filtering in retrieval?

**Metadata filters** restrict search to authorized, relevant subsets before vector similarity.

```python
# Pseudocode — filter then vector search
results = index.query(
    vector=query_embedding,
    top_k=5,
    filter={
        "department": "HR",
        "doc_type": "policy",
        "acl_group": {"$in": user.groups},
    },
)
```

| Metadata field | Purpose |
|----------------|---------|
| `tenant_id` | Multi-tenant isolation |
| `source` | Citation in answers |
| `last_modified` | Prefer recent docs |
| `language` | Match user locale |
| `security_clearance` | Row-level security |

**Critical for enterprise:** enforce ACL at retrieval time — not just at UI.

## What are common RAG failure modes and fixes?

| Failure | Symptom | Fix |
|---------|---------|-----|
| **Bad chunks** | Right doc, wrong passage | Smaller chunks, structure-aware splitting |
| **Missing retrieval** | "I don't know" for known facts | Lower similarity threshold, hybrid search, query expansion |
| **Wrong retrieval** | Confident wrong answer | Re-ranking, metadata filters, ask model to cite + refuse |
| **Context overflow** | Truncated chunks | Reduce K, summarize chunks, parent-child retrieval |
| **Stale index** | Outdated policy answers | Incremental re-index on doc change |
| **Duplicate chunks** | Repetitive answers | Deduplicate at ingest |
| **No citation** | Unverifiable claims | Require chunk IDs in prompt; post-validate |

```python
# Query expansion — improve recall
expanded = llm.chat(f"Generate 3 search queries for: {user_question}")
all_chunks = []
for q in expanded:
    all_chunks.extend(retrieve(q))
chunks = dedupe_and_rerank(all_chunks)[:5]
```

## How do you evaluate RAG quality?

| Metric | Measures |
|--------|----------|
| **Context precision** | Retrieved chunks relevant to question? |
| **Context recall** | All needed info retrieved? |
| **Faithfulness** | Answer supported by retrieved context? |
| **Answer relevance** | Response addresses the question? |
| **Latency P95** | End-to-end under SLA? |

**Tools:** RAGAS, Azure AI Evaluation SDK, custom golden sets.

```python
# Golden set example
eval_cases = [
    {
        "question": "Contractor PTO days?",
        "expected_answer_contains": "10 days",
        "expected_source": "hr-handbook-2024.pdf",
    },
]

for case in eval_cases:
    answer, sources = rag_pipeline(case["question"])
    assert case["expected_answer_contains"] in answer
    assert case["expected_source"] in sources
```

Run eval on **every index or prompt change** in CI.

## How do you implement RAG in .NET with Azure AI Search?

```csharp
// 1. Register services
builder.Services.AddAzureClients(clientBuilder =>
{
    clientBuilder.AddSearchClient(new Uri(searchEndpoint), "docs-index", new AzureKeyCredential(searchKey));
    clientBuilder.AddClient((_, cred) => new AzureOpenAIClient(openAiEndpoint, cred))
        .WithName("AzureOpenAI");
});

// 2. Retrieve + generate (Semantic Kernel pattern)
var kernel = Kernel.CreateBuilder()
    .AddAzureOpenAIChatCompletion("gpt-4o", openAiEndpoint, apiKey)
    .Build();

kernel.ImportPluginFromObject(new SearchPlugin(searchClient, embeddingClient));

// 3. Prompt with retrieved context plugin
var result = await kernel.InvokePromptAsync(
    "{{SearchPlugin.Search $query}} \n\n Answer: {{$query}}",
    new KernelArguments { ["query"] = userQuestion });
```

**Azure-native pipeline:**

```text
Blob Storage → Azure AI Search indexer → vector + text index
ASP.NET Core API → embed query → hybrid search → Azure OpenAI chat
```

## What is the difference between RAG and fine-tuning?

| | RAG | Fine-tuning |
|---|-----|-------------|
| **Updates knowledge** | Yes (re-index docs) | No (weights frozen after FT) |
| **Cost to update** | Re-embed changed docs | Re-run training job |
| **Private data exposure** | Data in your index only | Data in training pipeline |
| **Latency** | Retrieval + generation | Generation only |
| **Best for** | Q&A over docs, policies | Style, format, domain language |

Use **both** when needed: fine-tune for tone/format, RAG for factual grounding.

## Related Topics

- **AI Basics.md** — embeddings overview, pre-training vs RAG
- **Prompt Engineering.md** — grounding prompts, citation instructions
- **Building AI Applications.md** — full-stack RAG implementation patterns
- **Fine-tuning Evaluation and MLOps.md** — when RAG is not enough
