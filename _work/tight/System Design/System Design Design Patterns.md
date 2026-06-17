# System Design Design Patterns

## Questions Covered

1. How would you apply the CQRS (Command Query Responsibility Segregation) pattern in system design?
2. What is the Event Sourcing pattern, and how can it be used?
3. How does the Circuit Breaker pattern improve system resilience?

## How would you apply the CQRS (Command Query Responsibility Segregation) pattern in system design?

**Overview:** CQRS separates read and write operations using distinct models tailored for each — improving performance, scalability, and security.

**Steps to apply:**

1. **Identify commands and queries** — commands change state (create/update/delete); queries read state without changing it.

2. **Design separate models** — command model for validation/state changes; query model optimized for reads.

3. **Use different data stores (optional)** — write-optimized store (relational) for commands; read-optimized store (NoSQL) for queries.

4. **Implement event handling** — commands generate events capturing changes; events asynchronously update the query model.

5. **Handle consistency** — separate stores require eventual consistency via domain events or message queues.

6. **Security and access control** — restrict write operations by role; independent security per side.

## What is the Event Sourcing pattern, and how can it be used?

**Overview:** State changes are captured as a sequence of events (not just current state). Reconstruct state by replaying events in order.

**Steps to use:**

1. **Model events** — meaningful state changes (OrderPlaced, PaymentProcessed, ItemShipped).

2. **Store events** — append-only event log instead of overwriting current state.

3. **Rebuild state** — retrieve and replay an entity's events to get current state.

4. **Implement event handlers** — react to events (e.g., OrderPlaced triggers payment processing).

5. **Support eventual consistency** — read models built/updated asynchronously from events.

**Benefits:**

| Benefit | Description |
|---------|-------------|
| Audit trail | Full history of every state change |
| Flexibility | Modify read models without affecting command side |
| Temporal queries | Replay events to any point in time |

## How does the Circuit Breaker pattern improve system resilience?

**Overview:** Prevents repeated calls to failing operations; acts as a protective layer against cascading failures.

**How it works:**

1. **Monitor failures** — track request failures; "trip" when threshold exceeded.

2. **Circuit states:**

| State | Behavior |
|-------|----------|
| **Closed** | Normal — requests pass; failures monitored |
| **Open** | Threshold reached — requests fail immediately |
| **Half-Open** | After timeout — limited test requests; success → Closed, failure → Open |

3. **Fallback mechanism** — when open, return cached data or default response (graceful degradation).

4. **Reduced load** — stops traffic to failing service, giving it time to recover.

5. **Improved UX** — fast failures instead of long timeouts on doomed requests.
