# Database Scaling: Replication, Sharding, SQL vs NoSQL

## Concept Explanation

The database is often the first bottleneck. Ways to scale it:

- **Replication** — copy data to multiple nodes. **Primary-replica (master-slave):** writes go to the primary, reads fan out to replicas (scales **reads**, adds redundancy). Replicas lag slightly (eventual consistency for reads).
- **Sharding (horizontal partitioning)** — split data across multiple databases by a **shard key** (e.g. user_id). Scales **writes** and storage, but adds complexity (cross-shard queries, rebalancing).
- **Vertical partitioning** — split columns/tables by feature into separate DBs.
- **SQL vs NoSQL** — relational (ACID, joins, structured) vs NoSQL (flexible schema, horizontal scale; document/key-value/column/graph).
- **Indexing & read replicas & caching** often solve scaling before sharding.

## Code Example(s)

```text
REPLICATION (scale reads):
   writes ─▶ [Primary] ──replicate──▶ [Replica 1] ◀─ reads
                       └─────────────▶ [Replica 2] ◀─ reads

SHARDING (scale writes/storage) by shard key = user_id % N:
   user 1001 ─▶ Shard A     user 1002 ─▶ Shard B     user 1003 ─▶ Shard C
   (each shard is an independent DB holding a subset of data)
```

```text
Choosing a shard key:
  ✓ high cardinality + even distribution (user_id)   → balanced shards
  ✗ low cardinality / skewed (country, status)       → hot shards
  ✗ monotonic (timestamp, auto-increment id)         → all writes hit one shard
```

## Interview Q&A

**🟢 What is database replication?**
Maintaining copies of data on multiple nodes. In primary-replica setups, writes go to the primary and reads can be served by replicas — scaling read capacity and adding redundancy/failover.

**🟢 What is sharding?**
Horizontally partitioning data across multiple databases by a shard key, so each shard holds a subset. It scales writes and storage beyond a single machine.

**🟡 When would you choose NoSQL over SQL?**
NoSQL when you need flexible/evolving schemas, massive horizontal scale, very high write throughput, or specific access patterns (key-value, document, wide-column, graph). SQL when you need strong consistency, complex queries/joins, and transactional integrity.

**🟡 What's the difference between replication and sharding?**
Replication copies the *same* data to multiple nodes (scales reads, redundancy). Sharding splits *different* data across nodes (scales writes/storage). They're often combined — each shard is replicated.

**🔴 How do you choose a shard key, and what goes wrong with a bad one?**
Pick a high-cardinality, evenly-accessed key to distribute load. A bad key causes **hot shards** (skewed load), expensive **cross-shard queries/joins**, and hard **rebalancing**. Monotonic keys (timestamps) funnel all new writes to one shard. Resharding later is painful, so choose carefully.

## ⚠️ Tricky / Gotchas

- **Replication lag** means reads from replicas can be stale — "read-your-own-writes" issues (user updates profile, then sees old data). Route critical reads to the primary or use session consistency.
- **Sharding is a last resort** — exhaust indexing, caching, and read replicas first; sharding adds major complexity (cross-shard joins, transactions, rebalancing).
- **Cross-shard transactions/joins are hard/expensive** — design so most queries hit a single shard (align shard key with access pattern).
- **"NoSQL scales, SQL doesn't" is a myth** — modern SQL (and managed services) scale well; NoSQL trades away joins/consistency. Choose by data model and access patterns, not hype.
- **Auto-increment IDs break across shards** — use UUIDs/snowflake IDs for globally unique keys.

## 📌 Quick Recap

- Scale reads with replication (primary-replica; replicas lag → eventual consistency).
- Scale writes/storage with sharding by a shard key; replication copies same data, sharding splits different data (often combined).
- Choose a high-cardinality, evenly-distributed shard key; avoid hot/monotonic keys.
- Try indexing + caching + read replicas before sharding.
- SQL = consistency/joins/transactions; NoSQL = flexible schema/horizontal scale — pick by access patterns.
- Beware replication lag (stale reads) and cross-shard query cost; use UUIDs across shards.
