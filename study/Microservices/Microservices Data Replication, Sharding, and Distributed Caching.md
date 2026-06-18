# Microservices Data Replication, Sharding, and Distributed Caching

## Questions Covered

1. How do you handle data replication and partitioning in microservices?
2. How do you implement distributed caching in a microservices environment (e.g., Redis)?
3. What are the differences between local caching and distributed caching?

## How do you handle data replication and partitioning in microservices?

Replication and partitioning ensure availability, scalability, and performance.

**Data Replication** — copy data across instances/locations:

| Strategy | Description |
|----------|-------------|
| **Database replication** | Built-in DB features: **master-slave** (single writer, read replicas) or **multi-master** (multiple writers; needs conflict resolution) |
| **Event sourcing** | Store all changes as events; services replay to rebuild state — aids recovery and consistency |
| **Change Data Capture (CDC)** | Track DB changes and publish to message brokers (e.g., Debezium) so services stay updated |
| **Data warehousing** | ETL processes replicate operational data to a centralized warehouse for analytics |

**Data Partitioning** — split data into manageable pieces:

| Strategy | Description |
|----------|-------------|
| **Horizontal (sharding)** | Split rows across DBs/tables by key (user ID, region); each service manages a shard |
| **Vertical** | Group related columns into separate tables; services access only what they need |
| **Functional** | Partition by business domain — each service owns its data (users, catalog, orders) |
| **Composite** | Combine strategies (e.g., horizontal sharding + vertical splits within each shard) |

## How do you implement distributed caching in a microservices environment (e.g., Redis)?

Distributed caching stores frequently accessed data close to services, reducing latency and DB load.

**1. Choose a caching strategy**

- **In-memory caching** — Redis stores hot data (sessions, config) for fast access
- **Cache-aside** — check cache first; on miss, query DB, return result, and populate cache

**2. Set up Redis**

- Deploy standalone or managed (AWS ElastiCache, Azure Cache for Redis)
- Configure memory limits, eviction policies, and persistence (RDB, AOF)

**3. Integrate with microservices**

- Use language-specific clients (StackExchange.Redis, redis-py)
- Connection pooling to reuse connections efficiently

**4. Caching logic**

| Operation | Flow |
|-----------|------|
| **Read** | Check cache → return if hit → else query DB, return, and cache |
| **Write** | Update DB → invalidate or update cache entry; set TTL to limit staleness |

**5. Cache invalidation patterns**

- **Write-through** — update cache on every DB write
- **Write-behind** — write to cache first, async DB write
- **TTL** — expire entries to remove outdated data

**6. Monitor and scale**

- Track hit/miss ratios, memory, and performance (Prometheus, Redis Monitoring)
- Scale horizontally (Redis Cluster) or vertically as load grows

**7. Data consistency**

- Invalidate cache on underlying data changes
- Use write-through, cache-aside, or event-driven updates to keep cache and DB aligned

## What are the differences between local caching and distributed caching?

| Aspect | Local Caching | Distributed Caching |
|--------|---------------|---------------------|
| **Scope** | Single application instance | Shared across all instances |
| **Data accessibility** | Only the local instance | All instances in the cluster |
| **Latency** | Lower (in-memory, no network) | Higher (network calls; optimizable) |
| **Consistency** | Stale data if not invalidated | More complex cross-instance consistency |
| **Scalability** | Limited; per-instance cache | Highly scalable across nodes |
| **Complexity** | Simple; no extra infrastructure | Requires cache cluster management |
| **Use cases** | Small apps, session-specific data | Large apps needing shared data |
| **Statefulness** | Stateful; data lives in one instance | Stateless; cache replicated/shared |
