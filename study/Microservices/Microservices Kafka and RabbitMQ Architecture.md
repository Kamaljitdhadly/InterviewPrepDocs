# Microservices Kafka and RabbitMQ Architecture

## Questions Covered

1. What are the key differences between Kafka and RabbitMQ?
2. How does Kafka handle message persistence and ordering?
3. How do RabbitMQ exchanges and queues work, and what are their types?
4. When would you prefer Kafka over RabbitMQ, and vice versa?

## What are the key differences between Kafka and RabbitMQ?

| **Feature** | **Kafka** | **RabbitMQ** |
|----|----|----|
| **Architecture** | Distributed, partitioned, and replicated log. | Broker-based architecture with queues. |
| **Messaging Model** | Publish-subscribe with topic partitions. | Point-to-point and publish-subscribe. |
| **Message Delivery** | At-least-once (with optional exactly-once). | At-most-once, at-least-once, or exactly-once. |
| **Performance** | High throughput, optimized for handling large volumes of data. | Lower throughput compared to Kafka, optimized for low-latency messaging. |
| **Persistence** | Messages are written to disk and retained for a configurable duration. | Messages can be durable (stored on disk) or transient (in memory). |
| **Ordering** | Guarantees order within a partition but not across multiple partitions. | Guarantees order within a queue. |
| **Scalability** | Highly scalable, easily handles data partitioning and replication across multiple nodes. | Limited scalability compared to Kafka; adding nodes may require complex configuration. |
| **Consumer Groups** | Supports multiple consumer groups for load balancing and fault tolerance. | Supports multiple consumers, but consumers share the same queue unless configured otherwise. |
| **Use Cases** | Stream processing, event sourcing, and log aggregation. | Task queues, request-reply scenarios, and messaging between services. |
| **Protocol** | Uses a binary protocol over TCP for communication. | Uses AMQP (Advanced Message Queuing Protocol) as well as STOMP, MQTT, etc. |

## How does Kafka handle message persistence and ordering?

### Message Persistence

- **Log segments** — messages stored in immutable log segments for efficient disk I/O and high throughput.
- **Retention policy** — configurable by time (e.g., 7 days) or size; older messages deleted when limits are reached.
- **Replication** — partitions replicated across brokers for durability and fault tolerance.

### Message Ordering

- **Partitioning** — order guaranteed **within a single partition**. A partition key routes all messages with the same key to the same partition, preserving their order.
- **Consumer groups** — each partition is consumed by one consumer in the group at a time, maintaining per-partition order. **No ordering guarantee across partitions.**

## How do RabbitMQ exchanges and queues work, and what are their types?

**Exchanges** receive messages from producers and route them to queues based on binding rules (producers send to exchanges, not directly to queues).

| Exchange Type | Routing Behavior | Use Case |
|---------------|------------------|----------|
| **Direct** | Routes by exact routing key match | Point-to-point messaging |
| **Fanout** | Routes to all bound queues, ignoring routing key | Broadcasting to multiple consumers |
| **Topic** | Routes by routing key pattern with wildcards | Flexible pub/sub with selective routing |
| **Headers** | Routes by message header attributes | Complex routing by metadata (less common) |

**Queues** store messages until consumed. Multiple consumers can attach to a queue; messages are processed FIFO unless priority queues are configured.

## When would you prefer Kafka over RabbitMQ, and vice versa?

### Prefer Kafka

1. **High throughput & scalability** — large message volumes, stream processing, big data pipelines.
2. **Event sourcing & log aggregation** — state derived from event sequences; real-time analytics.
3. **Ordering guarantees** — per-partition ordering for event streams and time-series data.
4. **Retention & replayability** — consumers can re-read historical messages within the retention window.

### Prefer RabbitMQ

1. **Complex routing** — exchange types enable flexible delivery patterns (direct, fanout, topic, headers).
2. **Low latency** — optimized for immediate delivery (task queues, request-reply).
3. **Traditional messaging** — simpler point-to-point or pub/sub where Kafka's log model is overkill.
4. **Protocol variety** — AMQP, MQTT, STOMP support for diverse client environments.
