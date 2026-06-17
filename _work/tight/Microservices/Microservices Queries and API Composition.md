# Microservices Queries and API Composition

## Questions Covered

1. How do you query across microservices that own separate databases?
2. How does the CQRS (Command Query Responsibility Segregation) pattern work?
3. What is API composition, and how does it aggregate data across microservices?

## How do you query across microservices that own separate databases?

Each microservice owns its database, so cross-service queries require architectural patterns:

| Approach | How It Works | Trade-offs |
|----------|--------------|------------|
| **API Composition** | A gateway/composition service calls multiple microservices and merges responses | Straightforward; latency from multiple sequential/parallel calls |
| **BFF** | Dedicated backend per client type aggregates data tailored to that client | Reduces over/under-fetching; one BFF per client surface |
| **Event-Driven Architecture** | Services publish change events; consumers maintain local read models/caches | Eventual consistency; avoids synchronous cross-service calls |
| **Database Federation** | Query layer spans multiple databases as if one | Simplifies querying; adds consistency and management complexity |
| **Data Replication** | Replicate relevant data into another service's DB for local queries | Faster reads; sync complexity and staleness risk |
| **GraphQL** | GraphQL server federates multiple microservices as data sources | Clients request exactly what they need in one query |
| **CQRS** | Dedicated read models aggregate data from multiple services, optimized for queries | Separates read/write concerns; pairs well with event sourcing |

## How does the CQRS (Command Query Responsibility Segregation) pattern work?

CQRS **separates write operations (commands) from read operations (queries)** into distinct models, each optimized independently.

**Command side (writes):**

- **Commands** — requests to change state (create, update, delete).
- **Command handlers** — validate and execute business logic.
- **Write model** — persists state (SQL, NoSQL, event store); enforces invariants.

**Query side (reads):**

- **Queries** — requests to retrieve data without modifying state.
- **Query handlers** — serve from the read model.
- **Read model** — denormalized and optimized for fast reads (may use a different DB technology than the write side).

**Event Sourcing (optional):** the command side stores a sequence of events instead of current state; state is rebuilt by replay. Provides a full audit trail.

**Benefits:** independent scaling of reads and writes, tailored performance per side, flexible storage choices, and reduced complexity by separating concerns in large applications.

## What is API composition, and how does it aggregate data across microservices?

**API composition** aggregates data from multiple microservices into a single client response via one entry point (API Gateway or dedicated composition service).

**How it works:**

1. **Single entry point** — clients call one endpoint instead of orchestrating multiple services.
2. **Service orchestration** — the composition layer identifies required microservices and calls them concurrently or sequentially.
3. **Data transformation** — merge, map, and filter responses into a unified structure tailored to the client.
4. **Return cohesive response** — one aggregated payload back to the client.

**Benefits:**

- **Simplified client logic** — no multi-service orchestration on the client.
- **Flexibility** — underlying service changes absorbed in the composition layer.
- **Reduced over-fetching** — response includes only what the client needs.

**Challenges:**

- **Latency** — multiple service calls add round-trip time; mitigate with caching and parallel calls.
- **Error handling** — partial failures must be handled gracefully so one down service doesn't break the entire response.
