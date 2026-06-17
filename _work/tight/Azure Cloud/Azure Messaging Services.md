# Azure Messaging Services

Comparison of **Azure Storage Queue**, **Service Bus**, **Event Grid**, and **Event Hubs** — when to use each.

## Azure Storage Queue

Simple, cost-effective async messaging in **Azure Storage** — decouple app components, manage workloads.

**Key concepts:**

| Concept | Description |
|---------|-------------|
| **Queue** | Holds messages |
| **Messages** | Short text payloads for consumers |
| **Visibility Timeout** | Message hidden after read — single consumer processes it |
| **Message TTL** | Auto-delete if not processed in time |
| **Poison Messages** | Failed after retries → separate queue for investigation |

**Model:** **FIFO** — producers enqueue, consumers dequeue asynchronously (loose coupling).

**Example — Order Processing:**

| Role | Component |
|------|-----------|
| Producer | Web app (order placed) |
| Queue | `orders-queue` |
| Consumer | Backend (inventory, payment, shipment) |

**Flow:**

1. **Enqueue** — order details → queue
2. **Dequeue** — consumer polls; message invisible during **visibility timeout**
3. **Process** — success → delete message
4. **Failure** — message reappears after timeout; retries; repeated failure → **poison message**
5. **Expiry** — unprocessed past **TTL** → auto-deleted

## Azure Service Bus

Reliable cloud messaging when apps aren't simultaneously online. Supports **queues**, **topics**, **subscriptions**, **message sessions**, **dead-lettering**.

## 1. **Queues**

**One-to-one** (Point-to-Point, like RabbitMQ queues).

- Producer → queue → single consumer processes → ack removes message
- *Example:* e-commerce order → `order-processing` queue → backend

## 2. **Topics and Subscriptions**

**One-to-many** (Pub-Sub, like RabbitMQ topic exchange).

- Message → **topic** → multiple **subscriptions** with filter rules
- *Example:* notifications topic — Sports / Technology / Entertainment subscriptions filter by label

## 3. **Message Sessions**

Group related messages for **ordered** processing by **session ID** (e.g., `order-id`).

- Same session → processed in send order
- *Example:* shipment tracking updates per order

## 4. **Dead-Letter Queue (DLQ)**

Messages that can't be delivered/processed — explicit dead-letter, TTL exceeded, or max delivery count reached.

- *Example:* payment fails after max retries → DLQ for admin review

## 5. **Scheduled Messages**

Deliver at a future time.

- *Example:* marketing schedules email campaign for specific date/time

**Service Bus summary:**

| Pattern | Use |
|---------|-----|
| **Queues** | One consumer per message |
| **Topics/Subscriptions** | Broadcast + filtering |
| **Sessions** | Ordered processing |
| **DLQ** | Failed/undeliverable messages |
| **Scheduled** | Future delivery |

## Azure Event Grid

Fully managed **event routing** — event-driven architectures, real-time reactions.

**Key concepts:**

| Concept | Role |
|---------|------|
| **Events** | State-change notifications |
| **Event Sources** | Blob Storage, Resource Groups, custom apps |
| **Event Topics** | Channels events are pushed to |
| **Event Subscriptions** | Route + filter events to endpoints |
| **Event Handlers** | Functions, Logic Apps, webhooks |

**Model:** **Publish-subscribe** — sources publish to topics; subscribers receive via filtered subscriptions.

**Example — Blob upload triggers processing:**

| Component | Role |
|-----------|------|
| Source | Blob Storage (`BlobCreated`) |
| Subscriptions | Image Resizer, Thumbnail Generator, Metadata Storage (filtered) |
| Handlers | Azure Functions |

**Flow:** Upload → event published → subscriptions filter (file type, event type) → handlers process (resize, thumbnail, metadata).

## Azure Event Hubs

High-scale **data streaming** — millions of events/sec; big data & real-time ingestion.

**Key concepts:**

| Concept | Description |
|---------|-------------|
| **Event Producers** | IoT devices, logs, clickstreams |
| **Event Hub** | Gateway for event streams |
| **Partitions** | Parallel distribution for scale |
| **Event Consumers** | Analytics, storage, pipelines |
| **Consumer Groups** | Independent read position per consumer |
| **Offset** | Partition position marker for resume |
| **Throughput Units** | Capacity unit for max throughput |

**Model:** **Partitioned producer-consumer** — high-speed ingest, parallel consumption.

**Example — IoT smart city:**

- Sensors → `iot-data-hub` → partitions
- Consumer groups: Real-Time Analytics (alerts), Storage (archive), Dashboard (live metrics)
- **Offset** tracking enables restart without data loss

## 1. Azure Storage Queue & Azure Service Bus

- **Purpose:** Decouple components (microservices async communication)
- **Use:** OrderService → PaymentService, web app → background worker

## 2. Azure Event Grid & Azure Event Hubs

- **Purpose:** Event-driven architectures, real-time streams

| Service | Use |
|---------|-----|
| **Event Grid** | Route Azure/custom events → Functions, Logic Apps (serverless workflows) |
| **Event Hubs** | High-volume streaming — IoT telemetry, logs, real-time analytics |

**Queue vs Bus:**

- **Message Queue** — point-to-point; one service processes each message
- **Message Bus** — pub-sub; multiple consumers react to same event

### Comparison: Point-to-Point vs Publish-Subscribe

| **Communication Pattern** | **Azure Services** | **Description** |
|----|----|----|
| **Point-to-Point** | **Azure Service Bus (Queues)** | Reliable queue with advanced features |
|  | **Azure Storage Queues** | Simple, cost-effective, large-scale basic messaging |
| **Publish-Subscribe** | **Azure Service Bus (Topics)** | Pub-sub with filtering |
|  | **Azure Event Grid** | Event routing for event-driven architectures |
|  | **Azure Event Hubs** | High-throughput ingestion & streaming |

**When to use:**

- **Point-to-Point:** **Service Bus Queues** or **Storage Queues** — one consumer per message
- **Pub-Sub:** **Service Bus Topics**, **Event Grid** (event-driven), **Event Hubs** (high-throughput streams)
