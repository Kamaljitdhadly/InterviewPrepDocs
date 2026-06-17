# Messaging & Monitoring (Service Bus, Event Hub, App Insights)

## Concept Explanation

**Messaging** decouples components for reliability and scale. Azure's main options:

| Service | Model | Best for |
|---|---|---|
| **Storage Queue** | simple queue | basic, cheap, large-scale decoupling |
| **Service Bus** | enterprise message broker (queues + topics/subscriptions) | reliable commands, ordering, transactions, pub/sub |
| **Event Hubs** | high-throughput event streaming | telemetry/log ingestion, millions of events/sec |
| **Event Grid** | event routing (pub/sub for discrete events) | reactive event-driven architectures |

**Monitoring (Azure Monitor):**
- **Application Insights** — APM: request rates, dependencies, exceptions, distributed tracing.
- **Log Analytics** — query logs/metrics with **KQL (Kusto Query Language)**.
- **Alerts & Dashboards** — notify on thresholds/conditions.

## Code Example(s)

```csharp
// Service Bus: send & receive a message
var client = new ServiceBusClient(connectionString);
var sender = client.CreateSender("orders");
await sender.SendMessageAsync(new ServiceBusMessage("Order#123"));

var processor = client.CreateProcessor("orders");
processor.ProcessMessageAsync += async args =>
{
    Console.WriteLine(args.Message.Body.ToString());
    await args.CompleteMessageAsync(args.Message); // remove from queue
};
```

```kql
// Application Insights KQL: failed requests in the last hour, by operation
requests
| where timestamp > ago(1h) and success == false
| summarize failures = count() by name
| order by failures desc
```

## Interview Q&A

**🟢 Why use a message queue?**
To decouple producers from consumers, smooth out load spikes (buffering), improve reliability (retries, no lost work if a consumer is down), and enable async/scalable processing.

**🟡 What's the difference between Service Bus and Event Hubs?**
Service Bus is an enterprise message broker for reliable, ordered, transactional messaging and commands (queues + pub/sub topics). Event Hubs is a high-throughput event *streaming* ingestion service for massive telemetry/log pipelines (partitioned, consumer groups). Different purposes.

**🟡 What's the difference between a Service Bus queue and a topic?**
A queue is point-to-point (one message → one consumer). A topic supports publish/subscribe: each subscription gets its own copy of matching messages, so multiple consumers can react independently.

**🟡 What is Application Insights?**
An APM service that automatically collects telemetry — request/response times, dependency calls, exceptions, traces — and enables distributed tracing and querying via KQL to diagnose performance and failures.

**🔴 What is a dead-letter queue and when do messages land there?**
A sub-queue holding messages that can't be processed — after exceeding max delivery attempts, expiring (TTL), or failing validation. It prevents poison messages from blocking the queue and lets you inspect/reprocess failures.

## ⚠️ Tricky / Gotchas

- **Service Bus vs Event Hubs mix-up** is a top interview trap: messaging/commands (Service Bus) vs high-volume event streaming (Event Hubs). Picking Event Hubs for transactional commands (or vice versa) is wrong.
- **At-least-once delivery → design idempotent consumers.** Messages can be delivered more than once (after a crash before completion); your handler must tolerate duplicates.
- **Forgetting to `Complete` a message** means it reappears after the lock expires (redelivery) and can eventually dead-letter — a common "why is this processed repeatedly?" bug.
- **Event Hubs ordering is per-partition only** — global ordering isn't guaranteed; choose partition keys accordingly.
- **App Insights sampling** can drop telemetry under high load — don't assume every request is recorded when debugging.

## 📌 Quick Recap

- Decouple with messaging: Storage Queue (simple), Service Bus (reliable broker, queues + topics/pub-sub), Event Hubs (high-volume streaming), Event Grid (event routing).
- Service Bus ≠ Event Hubs: commands/ordering/transactions vs telemetry streaming.
- Queue = point-to-point; Topic = pub/sub (per-subscription copies).
- Design idempotent consumers (at-least-once delivery); always `Complete` messages; dead-letter holds poison/expired messages.
- Monitor with App Insights (APM/tracing) + Log Analytics (KQL) + alerts; mind sampling and per-partition ordering.
