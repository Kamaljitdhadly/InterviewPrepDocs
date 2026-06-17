# Data Management: DB-per-Service, Saga & Consistency

## Concept Explanation

A core microservices principle is **database-per-service**: each service **owns its data** and exposes it only via its API — no other service touches its database directly. This enables independent schema evolution and loose coupling, but means you **can't use a single ACID transaction across services**.

To maintain consistency across services, you use:
- **Saga pattern** — a sequence of local transactions; each step publishes an event triggering the next. If a step fails, **compensating transactions** undo prior steps. Two styles: **choreography** (services react to events) and **orchestration** (a central coordinator drives steps).
- **Eventual consistency** — data becomes consistent across services over time, not instantly.
- **Outbox pattern** — atomically save business data + an outgoing message in the same DB transaction, then relay the message, to avoid the "dual write" problem.

## Code Example(s)

```text
SAGA (Orchestration) — Create Order:
  1. Order Service:    create order (PENDING)
  2. Payment Service:  charge card        ──fail──▶ compensate: cancel order
  3. Inventory Service: reserve stock      ──fail──▶ compensate: refund + cancel
  4. Order Service:    mark order CONFIRMED

Each step = local ACID transaction; failures trigger compensations backward.
```

```csharp
// Outbox pattern: business write + message in ONE transaction (no dual-write bug)
using var tx = db.BeginTransaction();
db.Orders.Add(order);
db.OutboxMessages.Add(new OutboxMessage("OrderPlaced", Serialize(order)));
db.SaveChanges();           // both committed atomically
tx.Commit();
// A separate relay process publishes OutboxMessages to the broker and marks them sent.
```

## Interview Q&A

**🟢 What is the database-per-service pattern?**
Each microservice owns and manages its own database; other services access that data only through the owning service's API, never directly — ensuring loose coupling and independent evolution.

**🟡 Why can't you just use a distributed transaction (2PC) across services?**
Two-phase commit couples services, holds locks across the network, hurts availability/scalability, and isn't supported by many modern data stores/brokers. Microservices favor sagas + eventual consistency instead.

**🟡 What is the Saga pattern?**
A way to manage a business transaction spanning multiple services as a series of local transactions, each triggering the next via events. On failure, compensating transactions roll back the completed steps. Styles: choreography (event-driven) vs orchestration (central coordinator).

**🟡 What is eventual consistency?**
A model where, after an update, the system becomes consistent across services after some delay (not immediately). It's the trade-off for availability and loose coupling in distributed systems.

**🔴 What is the dual-write problem and how does the Outbox pattern solve it?**
Dual write = writing to the database and publishing a message as two separate operations; if one succeeds and the other fails, state and messages diverge. The Outbox pattern writes the message into an outbox table in the *same* DB transaction as the business change, then a relay reliably publishes it — guaranteeing atomicity.

## ⚠️ Tricky / Gotchas

- **Choreography vs orchestration trade-off:** choreography (events) is decentralized and loosely coupled but hard to follow/debug across many services; orchestration centralizes logic (easier to reason about) but the orchestrator can become a bottleneck/coupling point.
- **Compensating transactions aren't true rollbacks** — they're new actions that *semantically* undo (e.g. refund), and may themselves fail; design them carefully and idempotently.
- **Shared database "just for reporting"** quietly recouples services — use data replication/events or a dedicated read store instead.
- **Eventual consistency surprises users/devs** — UIs must handle "not yet updated" states; don't assume read-after-write.
- **Distributed transactions across services** is a red-flag answer — interviewers expect sagas/outbox, not 2PC.

## 📌 Quick Recap

- Database-per-service: each service owns its data; access only via its API.
- No cross-service ACID transactions → use Saga (local txns + compensations) + eventual consistency.
- Saga styles: choreography (events, decentralized) vs orchestration (central coordinator).
- Compensating transactions semantically undo; make them idempotent.
- Outbox pattern solves the dual-write problem (atomic data + message).
- Avoid shared DBs and 2PC; expect read-after-write delays with eventual consistency.
