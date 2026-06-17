# Communication: Sync vs Async

## Concept Explanation

Services communicate two broad ways:

- **Synchronous** — caller waits for a response. **REST/HTTP** (simple, ubiquitous) or **gRPC** (binary, fast, strongly-typed via Protobuf, great for internal service-to-service). Creates **temporal coupling**: the callee must be up *now*.
- **Asynchronous** — caller sends a message/event and doesn't wait. Via a **message broker** (RabbitMQ, Kafka, Azure Service Bus). Decouples services in time, improves resilience and scalability, but adds eventual consistency and complexity.

Two async styles:
- **Commands/messages** — "do this" sent to a specific consumer (point-to-point).
- **Events** — "this happened" published to whoever's interested (pub/sub), enabling **event-driven architecture**.

## Code Example(s)

```text
SYNCHRONOUS (REST/gRPC): Order ──HTTP request──▶ Payment
                               ◀──response────  (Order waits; Payment must be up)

ASYNCHRONOUS (events):    Order ──"OrderPlaced"──▶ [Message Broker] ──▶ Payment
                                                                   └──▶ Inventory
                          (Order doesn't wait; consumers process when ready)
```

```csharp
// Synchronous gRPC call (strongly typed)
var reply = await paymentClient.ChargeAsync(new ChargeRequest { OrderId = id, Amount = 50 });

// Asynchronous event publish (fire-and-forget, decoupled)
await bus.PublishAsync(new OrderPlaced { OrderId = id, Total = 50 });
// Payment & Inventory services subscribe and react independently.
```

## Interview Q&A

**🟢 What are the ways microservices communicate?**
Synchronously (REST/HTTP or gRPC, request-response) or asynchronously via a message broker (commands or publish/subscribe events).

**🟢 What's the difference between REST and gRPC?**
REST is text-based (JSON) over HTTP, human-readable and universal. gRPC uses binary Protobuf over HTTP/2 — faster, smaller, strongly-typed, supports streaming — ideal for internal service-to-service calls but less browser/human friendly.

**🟡 When would you choose async messaging over synchronous calls?**
When you want loose coupling, resilience (the consumer can be down and catch up later), load leveling (buffering spikes), or to fan out an event to multiple consumers. Use sync when you need an immediate response or strong request/response semantics.

**🟡 What's the difference between a command and an event?**
A command is an instruction to do something, sent to one specific handler ("ChargePayment"). An event is a notification that something happened ("OrderPlaced"), published to any interested subscribers. Commands have one logical handler; events can have many.

**🔴 What are the downsides of synchronous communication between services?**
Temporal coupling (callee must be available), cascading failures and latency accumulation in call chains, reduced availability (product of each service's uptime), and tighter coupling. Async messaging mitigates these but introduces eventual consistency.

## ⚠️ Tricky / Gotchas

- **Synchronous chains reduce availability multiplicatively** — if A→B→C each have 99.9% uptime, the chain is ~99.7%. Long sync chains are fragile.
- **Async ≠ free** — you trade immediate consistency for eventual consistency, and must handle ordering, duplicates, and failures (dead-letter queues).
- **At-least-once delivery → idempotency required.** Consumers must handle duplicate messages safely (e.g. dedupe by message id).
- **gRPC isn't browser-native** — needs gRPC-Web/a proxy for browsers; people propose it for public web APIs incorrectly.
- **Chatty communication** (many fine-grained calls) kills performance — design coarser-grained APIs / aggregate data.

## 📌 Quick Recap

- Sync: REST (universal, JSON) or gRPC (fast, binary, typed, internal) — request/response, temporal coupling.
- Async: message broker; commands (point-to-point) or events (pub/sub) — decoupled, resilient, eventual consistency.
- Choose async for loose coupling/resilience/fan-out; sync for immediate responses.
- Sync chains accumulate latency and reduce availability multiplicatively.
- Async requires idempotent consumers (at-least-once delivery) and failure handling.
- Avoid chatty fine-grained calls; gRPC needs a proxy for browsers.
