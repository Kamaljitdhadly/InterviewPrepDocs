# Message Queues & Async Processing

## Concept Explanation

A **message queue** lets components communicate **asynchronously** — a producer puts a message on the queue, a consumer processes it later. This **decouples** producers from consumers and provides:

- **Load leveling / buffering** — absorb traffic spikes; consumers process at their own pace.
- **Resilience** — if the consumer is down, messages wait (no lost work).
- **Scalability** — add more consumers to process in parallel.
- **Async workflows** — offload slow work (emails, image processing, reports) from the request path.

**Queue (point-to-point)** vs **pub/sub (topic)**: a queue delivers each message to one consumer; pub/sub broadcasts to all subscribers. **Streaming platforms (Kafka)** retain an ordered log consumers read at their own offset.

## Code Example(s)

```text
SYNCHRONOUS (slow request):
  Client ─▶ API ─▶ resize image (3s) ─▶ send email (1s) ─▶ respond   (4s wait 😞)

ASYNCHRONOUS (fast request + background work):
  Client ─▶ API ─▶ enqueue "ProcessUpload" ─▶ respond 202 Accepted   (50ms 🙂)
                          │
                          ▼
                   [Queue] ─▶ Worker(s) resize image + send email later
```

```text
Queue (point-to-point):   Producer ─▶ [Q] ─▶ one of [W1 | W2 | W3]
Pub/Sub (topic):          Publisher ─▶ [Topic] ─▶ Sub A  &  Sub B  &  Sub C (all get it)
Log/stream (Kafka):       Producer ─▶ [partitioned, retained log] ◀─ consumers track offsets
```

## Interview Q&A

**🟢 Why use a message queue?**
To decouple producers and consumers, buffer load spikes, improve resilience (work isn't lost if a consumer is down), enable parallel scaling, and move slow work out of the request path for faster responses.

**🟢 What's the difference between a queue and pub/sub?**
A queue delivers each message to a single consumer (point-to-point, work distribution). Pub/sub publishes each message to all subscribers (broadcast/fan-out), so multiple services can react independently.

**🟡 What delivery guarantees exist?**
At-most-once (may lose messages, no dupes), at-least-once (no loss, possible duplicates — most common), and exactly-once (hard/expensive, often emulated via idempotency + dedup). Most systems give at-least-once, so consumers must be idempotent.

**🟡 What is a dead-letter queue?**
A separate queue where messages that repeatedly fail processing (or expire) are sent, so they don't block the main queue. You inspect/fix/replay them later.

**🔴 What's the difference between a traditional message queue and Kafka?**
Traditional queues (RabbitMQ, SQS) typically remove a message once consumed and focus on per-message delivery/routing. Kafka is a distributed, partitioned, **retained log** — messages persist and multiple consumer groups read independently at their own offsets, enabling replay and very high throughput streaming. Different model for different needs.

## ⚠️ Tricky / Gotchas

- **At-least-once → design idempotent consumers.** Duplicates *will* happen (e.g. consumer crashes after processing, before ack). Dedupe by message id or make operations idempotent.
- **Ordering is not guaranteed** across a queue / across partitions — Kafka guarantees order only *within a partition*. Don't assume global ordering.
- **Unbounded queue growth** if consumers can't keep up → memory/lag blowups and stale data; monitor queue depth and scale consumers / shed load.
- **"Exactly-once" is largely a myth** end-to-end — it's usually at-least-once + idempotency. Claiming naive exactly-once is a red flag.
- **Poison messages** (always fail) block progress without a dead-letter queue + max-retry policy.

## 📌 Quick Recap

- Message queue = async decoupling: buffering, resilience, parallel scaling, faster responses.
- Queue (one consumer) vs pub/sub (all subscribers) vs Kafka (retained, partitioned log with offsets/replay).
- Guarantees: usually at-least-once → make consumers idempotent (dedupe).
- Ordering only within a partition; no global order.
- Use dead-letter queues + max retries for poison messages; monitor queue depth/lag.
- "Exactly-once" ≈ at-least-once + idempotency.
