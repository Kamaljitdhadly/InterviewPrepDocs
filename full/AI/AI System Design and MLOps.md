# AI System Design and MLOps

## Questions Covered

1. How do you design a production RAG system at scale?
2. What is the reference architecture for an enterprise AI copilot?
3. How do you handle multi-tenancy in AI applications?
4. What are batch vs real-time inference patterns?
5. How do you optimize LLM cost in production?
6. What is model routing and cascading?
7. How do you design for high availability and disaster recovery?
8. What is Provisioned Throughput Units (PTU) vs pay-as-you-go?
9. How do you design document ingestion pipelines?
10. How do you compare building vs buying AI capabilities?
11. What are common AI system design interview scenarios?
12. How do you scale vector search for millions of documents?

## How do you design a production RAG system at scale?

```text
                    ┌─────────────────────────────────┐
                    │         Ingestion Pipeline       │
                    │  Blob → Event Grid → Function    │
                    │  → chunk → embed → index upsert  │
                    └─────────────────────────────────┘
                                      ↓
┌──────────┐    ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
│  Client  │───→│  API Gateway │───→│  Orchestrator   │───→│ Azure OpenAI │
│  (SPA)   │    │  (APIM)      │    │  (ASP.NET Core) │    │  (chat+embed)│
└──────────┘    └──────────────┘    └────────┬────────┘    └──────────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              ↓               ↓               ↓
                      Azure AI Search   Redis cache    SQL (sessions)
                      (hybrid index)    (semantic)     (audit, feedback)
```

**Design decisions:**

| Decision | Recommendation |
|----------|----------------|
| **Chunking** | Async at ingest; version chunks with doc hash |
| **Index** | Azure AI Search with hybrid + semantic ranker |
| **Query path** | Embed query → filter by tenant → retrieve → re-rank → generate |
| **Async ingest** | Event-driven; don't block upload on embedding |
| **Idempotency** | Doc ID + chunk index as key; skip unchanged chunks |

**SLA targets:** P95 query < 5s (retrieve + generate); ingest lag < 5 min for updated docs.

## What is the reference architecture for an enterprise AI copilot?

```text
Identity: Microsoft Entra ID → JWT → API auth
Data: SharePoint / Blob / SQL → unified index
AI: Azure OpenAI (private endpoint) + content filters
Orchestration: Semantic Kernel plugins wrapping existing microservices
UI: Teams bot + web copilot (streaming SSE)
Governance: Purview classification, audit logs, DLP on uploads
```

| Layer | Azure services |
|-------|----------------|
| **Frontend** | Static Web Apps, Teams SDK |
| **API** | App Service or AKS, APIM |
| **AI** | Azure OpenAI, AI Search, Document Intelligence |
| **Data** | Blob, Cosmos DB, existing SQL |
| **Security** | Key Vault, Private Link, Defender |
| **Ops** | App Insights, Log Analytics, Azure Monitor alerts |

**Key principle:** Copilot **calls existing APIs** via function calling — don't duplicate business logic inside prompts.

## How do you handle multi-tenancy in AI applications?

| Strategy | Isolation | Cost | Complexity |
|----------|-----------|------|------------|
| **Shared index + tenant filter** | Metadata ACL | Lowest | Medium |
| **Index per tenant** | Strong | Higher | High ops |
| **Deployment per tenant** | Strongest | Highest | Enterprise/regulated |

```csharp
// Shared index pattern — mandatory filter
public async Task<SearchResults> SearchAsync(string query, TenantContext tenant)
{
    var options = new SearchOptions
    {
        Filter = SearchFilter.Create($"tenant_id eq '{tenant.Id}'"),
    };
    // NEVER omit tenant filter
    return await _search.SearchAsync<DocChunk>(query, options);
}
```

Also isolate: **rate limits per tenant**, **token budgets**, **separate Azure OpenAI deployments** for largest enterprise customers if required.

## What are batch vs real-time inference patterns?

| Pattern | Use case | Azure option |
|---------|----------|--------------|
| **Real-time sync** | Chat, copilot | Chat Completions API |
| **Real-time stream** | Long answers, UX | SSE streaming |
| **Async queue** | Bulk doc summarization | Service Bus + Function worker |
| **Batch API** | Nightly jobs, 50% discount | OpenAI Batch API (24h SLA) |

```text
Real-time:  User waits → sync API → stream tokens

Async:      Upload 10K docs → queue messages → workers process → notify when done

Batch:      Submit JSONL job at midnight → results next morning → 50% cheaper
```

Choose batch/async when latency tolerance > minutes and volume is high.

## How do you optimize LLM cost in production?

| Technique | Savings |
|-----------|---------|
| **Smaller model routing** | GPT-4o-mini for easy tasks — 10–20× cheaper |
| **Prompt compression** | Shorter system prompts; summarize history |
| **Semantic caching** | 30–60% on repetitive support queries |
| **RAG precision** | Fewer, better chunks = fewer input tokens |
| **Batch API** | 50% off non-urgent workloads |
| **Fine-tuned small model** | Replace GPT-4 calls on narrow high-volume task |
| **Output token cap** | `max_tokens` prevents runaway generation |

```python
# Cost estimate per request
input_cost = input_tokens * price_per_1m_input / 1_000_000
output_cost = output_tokens * price_per_1m_output / 1_000_000
# Track per feature, per tenant — chargeback dashboards
```

Set **per-user daily token budgets** for public-facing features.

## What is model routing and cascading?

**Routing:** classify query complexity → send to appropriate model.

```text
Router (cheap classifier or rules)
  ├── Simple FAQ      → gpt-4o-mini + RAG
  ├── Code generation → gpt-4o
  └── Image analysis  → gpt-4o vision
```

**Cascading:** try cheap model first; escalate if confidence low.

```python
answer, confidence = cheap_model.ask(question)
if confidence < 0.7 or user_flagged_incorrect(answer):
    answer = gpt4o.ask(question)
```

Reduces average cost while preserving quality on hard queries.

## How do you design for high availability and disaster recovery?

| Component | HA strategy |
|-----------|-------------|
| **Azure OpenAI** | Multi-region deployments; fallback model |
| **AI Search** | Geo-redundant storage; replica partitions |
| **API layer** | App Service multi-instance; AKS pod replicas |
| **Vector index** | Export snapshots; rebuild pipeline documented |

```csharp
async Task<string> ChatWithFallbackAsync(IEnumerable<ChatMessage> messages)
{
    foreach (var deployment in new[] { "gpt-4o-primary", "gpt-4o-secondary", "gpt-4o-mini-fallback" })
    {
        try { return await CompleteAsync(deployment, messages); }
        catch (RequestFailedException ex) when (ex.Status is 429 or 503) { /* try next */ }
    }
    throw new ServiceUnavailableException("All LLM deployments unavailable");
}
```

**Graceful degradation:** RAG search only (no generation) when LLM down; cached answers; "try again later" with incident banner.

## What is Provisioned Throughput Units (PTU) vs pay-as-you-go?

| Model | Billing | Best for |
|-------|---------|----------|
| **Pay-as-you-go (PTU)** | Per 1K tokens | Variable traffic, prototyping |
| **Provisioned (PTU)** | Reserved capacity units/hour | Steady high volume, predictable latency |

PTU guarantees throughput — no 429 throttling under normal load. Break-even typically at **sustained high TPM** (tokens per minute). Use Azure pricing calculator.

For most apps: start **pay-as-you-go** → monitor TPM → move hot deployments to PTU.

## How do you design document ingestion pipelines?

```text
Upload (Portal / API / SharePoint sync)
  → Blob Storage (raw)
  → Event Grid trigger
  → Azure Function / Durable Function:
      1. Document Intelligence OCR (PDF/scanned)
      2. Extract metadata (title, author, ACL)
      3. Chunk with structure awareness
      4. Batch embed (rate-limited)
      5. Upsert to AI Search index
      6. Mark doc status: indexed / failed
  → Dead-letter queue for failures + alert
```

| Concern | Pattern |
|---------|---------|
| **Large files** | Split processing; durable orchestration |
| **Updates** | Hash doc content; skip if unchanged |
| **Deletes** | Tombstone event removes index entries |
| **ACL sync** | Re-index when permissions change |
| **Backfill** | Batch job with checkpointing |

## How do you compare building vs buying AI capabilities?

| Build (custom RAG + API) | Buy (SaaS copilot, Copilot Studio) |
|--------------------------|-------------------------------------|
| Full control, custom UX | Faster time to market |
| Integrates with your APIs | Limited customization |
| You own security model | Vendor data policies |
| Engineering investment | Per-seat licensing |

**Build when:** deep integration with proprietary systems, strict compliance, custom agent workflows. **Buy when:** standard knowledge worker scenarios, Microsoft 365 ecosystem, limited eng bandwidth.

Hybrid: **Copilot Studio** + custom **Semantic Kernel** API plugins for backend actions.

## What are common AI system design interview scenarios?

**Scenario 1: Design a customer support copilot**

- RAG over KB + tickets; function calling for order lookup; escalate to human; multi-tenant; cite sources; feedback loop for eval.

**Scenario 2: Design a code review assistant**

- Chunk PR diffs; static analysis tools as plugins; no training on proprietary code sent externally (Azure private); structured JSON findings.

**Scenario 3: Design document Q&A for 10M pages**

- Sharded index; hierarchical retrieval (doc → section → chunk); async ingest; hybrid search; re-ranking; cache frequent queries.

**Answer framework:** Requirements → scale → data flow → components → security → eval → cost → failure modes.

## How do you scale vector search for millions of documents?

| Technique | Purpose |
|-----------|---------|
| **Partition by tenant/category** | Reduce search space |
| **HNSW index tuning** | Balance recall vs speed (efConstruction, m) |
| **Sharding** | Azure AI Search partitions |
| **Two-stage retrieval** | Cheap bi-encoder top-100 → cross-encoder top-5 |
| **Quantized vectors** | Scalar quantization — smaller index, faster search |
| **Tiered storage** | Hot index (recent) + cold archive re-index on demand |

```text
10M chunks × 1536 dims × 4 bytes ≈ 60 GB vectors alone
+ metadata + inverted index → plan partition count and replica SKUs
```

Load test retrieval separately from generation — retrieval should be < 200ms P95.

## Related Topics

- **RAG and Embeddings.md** — chunking, hybrid search, eval
- **Building AI Applications.md** — .NET integration, deployment
- **Fine-tuning Evaluation and MLOps.md** — monitoring, versioning
- **System Design/System Design Basics.md** — general system design patterns
- **Microservices/Microservices Basics.md** — service boundaries for AI features
