# Microservices RabbitMQ Architecture

RabbitMQ is a message broker enabling decoupled service communication via **Producer → Exchange → Queue → Consumer**, linked by **Bindings**.

## Key Components

| Component | Role |
|-----------|------|
| **Producer** | Sends message chunks to an exchange |
| **Exchange** | Routes messages to queues by routing key, pattern, or headers |
| **Queue** | Buffers messages until consumed |
| **Binding** | Links exchange to queue with routing rules |
| **Consumer** | Receives and processes messages from a queue |

**Exchange types:** **Direct** (exact routing-key match), **Topic** (pattern match), **Fanout** (broadcast to all bound queues), **Headers** (match on message headers).

## Messaging Models

## Point-to-Point (P2P)

One producer, one consumer per message — consumed messages are removed from the queue.

**Example — Task Queue:** A web app uploads trigger image-processing tasks. Workers pull from a **task queue**; only one worker processes each task.

**Flow:** Upload → message to **Task Queue** → one worker consumes → task removed.

```json
[Producer: Task Generator] ---> [Task Queue] ---> [Consumer: Worker 1]
```

---> [Consumer: Worker 2]

---> [Consumer: Worker 3]

Only one worker picks up each task, ensuring exactly-once processing.

## Publish-Subscribe (Pub-Sub)

Producer publishes to an exchange; message is delivered to all bound queues, each with its own consumer.

**Example — Notification System:** Product service announces a launch via a **fanout exchange** to **Email**, **SMS**, and **Push Notification** queues; each channel service consumes independently.

**Flow:** Announce → fanout exchange → all bound queues → each service sends notifications.

```json
[Producer: Product Service] ---> [Fanout Exchange] ---> [Email Queue] ---> [Email Service]
```

---> [SMS Queue] ---> [SMS Service]

---> [Push Notification Queue] ---> [Push Notification Service]

```json
These examples illustrate how RabbitMQ’s messaging models can be applied to different scenarios, ensuring efficient communication between services in a decoupled manner
```

## Direct Exchange

Routes messages by exact routing-key match.

**Example — Order Processing:** Order service (producer) sends to a **direct exchange**. Two queues bound with keys `order.process` and `order.inventory`; Order Processing and Inventory services consume respectively.

**Flow:** Order placed → messages with routing keys → exchange routes to matching queues → consumers process.

Order Service (Producer) ---> [Exchange] ---> [Order Processing Queue] ---> Order Processing Service (Consumer)

|

+---> [Inventory Queue] ---> Inventory Service (Consumer)

Enables scalable, decoupled order and inventory processing.

## Topic Exchange

Routes by pattern matching between routing key and binding key — flexible multi-queue routing.

**Example — Logging System:** Services publish with keys like `service1.info`, `service2.error`. **Info Queue** bound `*.info`, **Error Queue** `*.error`, **Service1 Queue** `service1.*`. A `service1.info` message routes to both Info and Service1 queues.

## Fanout Exchange

Broadcasts to all bound queues, ignoring routing keys.

**Example — News Distribution:** News service publishes to fanout exchange → **Email**, **SMS**, and **Push Notification** queues each deliver via their channel.

## Headers Exchange

Routes on message headers, not routing keys.

**Example — Document Processing:** Documents sent with headers like `content-type:pdf`, `priority:high`. **PDF High Priority Queue** bound `{content-type:pdf, priority:high}`; **Image Queue** bound `{content-type:image}`.

## Dead-Letter Exchange (DLX)

Routes messages that cannot be delivered — rejected, expired (TTL), or queue-full.

**Example — Order Retry:** Failed order messages from **Order Processing Queue** route to **Dead-Letter Exchange** → **Dead-Letter Queue** for later retry.

| Exchange | Routing | Use Case |
|----------|---------|----------|
| Direct | Exact key match | Order status routing |
| Topic | Pattern match | Multi-service logging |
| Fanout | All bound queues | News/notifications broadcast |
| Headers | Header values | Content-type/priority routing |
| DLX | Failed/expired messages | Retry and error handling |

## Message Acknowledgments

Consumers must **ack** after processing; unacked messages (crash/error) are **requeued** for another consumer — ensures reliable, at-most-once delivery per successful ack.

**Example — Reliable Task Processing:** Worker processes task → sends ack. Crash before ack → RabbitMQ requeues for another worker.

## Message Persistence

By default messages live in memory. Mark queues **durable** and messages **persistent** to survive broker restarts — critical for financial transactions.

**Flow:** Persistent message → stored on disk → survives restart → consumer processes when available.

## Queues and Queue Types

| Type | Characteristics |
|------|-----------------|
| **Classic** | Default; single-node or mirrored (legacy HA) |
| **Quorum** | Replicated across cluster nodes; strong consistency and fault tolerance |

**Example — HA:** Quorum queue replicated across nodes; if one node fails, another serves the queue.

## Priority Queues

Messages carry priority values; consumers process highest priority first — e.g., urgent support tickets before regular ones.

## Delayed Messages

Delay delivery for a specified period — e.g., 24-hour signup reminders via delayed exchange or delay plugin.

**Flow:** Message sent with delay → held by RabbitMQ → delivered after period → reminder service processes.

## Clustered RabbitMQ Setup

Deploy across multiple nodes for scalability, reliability, and fault tolerance. Producers/consumers connect to any node; queues replicate across nodes.

| Feature | Benefit |
|---------|---------|
| Acknowledgments | Reliable processing; failed consumers requeue |
| Persistence | Survives broker crashes |
| Quorum Queues | HA replication |
| Priority Queues | Urgent messages first |
| Delayed Messages | Scheduled delivery |
| Clustering | Scale and fault tolerance |
