# CQRS & Event Sourcing

## Concept Explanation

**CQRS (Command Query Responsibility Segregation)** separates the **write model** (commands that change state) from the **read model** (queries that return data). They can use different models, and even different databases — letting you optimize reads and writes independently (e.g. a normalized write store + denormalized read store for fast queries).

**Event Sourcing** stores state as an **append-only log of events** ("OrderCreated", "ItemAdded", "OrderShipped") instead of just the current state. The current state is derived by replaying events. It gives a full audit trail and time-travel, and pairs naturally with CQRS (events update read models).

These are **powerful but advanced** — they add complexity and are justified only for specific needs (audit, complex domains, independent read/write scaling).

## Code Example(s)

```text
CQRS:
  Command side:  PlaceOrder ─▶ Write model (validate, store) ─▶ emits events
                                          │
  (events project to)                     ▼
  Query side:    GET /orders ◀── Read model (denormalized, fast, possibly eventual)

EVENT SOURCING (state = replay of events):
  [OrderCreated] → [ItemAdded x2] → [DiscountApplied] → [OrderShipped]
  Current state = fold(events). Nothing is overwritten; everything is appended.
```

```csharp
// Command vs Query separation (CQRS)
public record PlaceOrderCommand(Guid CustomerId, List<Item> Items);   // changes state
public record GetOrderQuery(Guid OrderId);                            // reads state

// Event sourcing: rebuild state by applying events
Order order = events.Aggregate(new Order(), (state, e) => state.Apply(e));
```

## Interview Q&A

**🟢 What is CQRS?**
A pattern that separates write operations (commands) from read operations (queries), allowing each side to use a model and even a data store optimized for its purpose.

**🟢 What is event sourcing?**
Persisting state as an append-only sequence of events rather than the current state. Current state is reconstructed by replaying events, giving a complete history/audit trail.

**🟡 What are the benefits of CQRS?**
Independent optimization and scaling of reads vs writes, simpler and faster query models (denormalized), clear separation of concerns, and a natural fit with event-driven systems and multiple read models.

**🟡 Do CQRS and event sourcing have to be used together?**
No. CQRS can be used without event sourcing (separate read/write models over the same or different stores), and you can event-source without full CQRS. They complement each other but are independent patterns.

**🔴 What are the main challenges of event sourcing?**
Eventual consistency between write and read models, handling **event schema evolution/versioning**, replaying large event streams (mitigated by **snapshots**), increased complexity, and the fact that you can't simply "edit" data — corrections require new compensating events. It's overkill for simple CRUD.

## ⚠️ Tricky / Gotchas

- **CQRS doesn't require two databases** — it's about separating models. People over-engineer with separate stores when separate read/write *models* over one DB suffice.
- **Read models are eventually consistent** when projected asynchronously — UIs must handle read-after-write delays.
- **Event schema versioning is hard** — old events live forever; you must keep deserializing/upcasting them as schemas change.
- **Snapshots are needed** for long event streams, or rebuilding state by replaying thousands of events becomes slow.
- **Don't use these for simple CRUD** — they add significant complexity; reserve for audit-heavy, complex, or high-scale domains. A frequent over-engineering trap in interviews.

## 📌 Quick Recap

- CQRS = separate write (commands) and read (queries) models; optimize/scale each independently.
- Event Sourcing = store state as an append-only event log; rebuild state by replaying events (full audit/history).
- They complement but don't require each other.
- Benefits: optimized reads/writes, audit trail, fits event-driven systems.
- Challenges: eventual consistency, event versioning, snapshots, added complexity.
- Avoid for simple CRUD — use only when audit/complexity/scale justify it.
