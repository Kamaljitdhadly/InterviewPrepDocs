# Azure Messaging and Integration

## Questions Covered

1. What Azure messaging services exist, and when do you use each?
2. What is Azure Storage Queue?
3. What is Azure Service Bus?
4. What are Service Bus queues vs topics/subscriptions?
5. What is Azure Event Grid?
6. What is Azure Event Hubs?
7. How do Service Bus and Event Grid compare?
8. What is dead-letter queue handling?
9. How do you integrate messaging with Azure Functions?
10. What is the claim-check pattern?
11. How do you choose between messaging services for microservices?
12. What are message ordering and duplicate handling strategies?

## What Azure messaging services exist, and when do you use each?

| Service | Pattern | Throughput | Use case |
|---------|---------|------------|----------|
| **Storage Queue** | Simple queue | High volume, low cost | Decouple app tiers, job queue |
| **Service Bus** | Queue + pub/sub | Enterprise messaging | Orders, workflows, sessions |
| **Event Grid** | Event routing | Millions/sec events | React to Azure resource changes |
| **Event Hubs** | Event streaming | Big data ingestion | Telemetry, IoT, log streaming |
| **Relay** | Hybrid connectivity | — | Expose on-prem service without VPN |

```text
Decouple web app from processor     → Storage Queue or Service Bus Queue
Pub/sub to multiple subscribers     → Service Bus Topics
Azure Blob created → run function   → Event Grid
Millions of IoT device events       → Event Hubs
```

## What is Azure Storage Queue?

**Storage Queue** — simple, cheap, REST-based FIFO-ish queue (best-effort ordering).

| Feature | Limit |
|---------|-------|
| **Message size** | 64 KB |
| **Visibility timeout** | Hide message during processing |
| **TTL** | Auto-expire unprocessed messages |
| **Poison messages** | Manual handling (move after N failures) |

```csharp
var queueClient = new QueueClient(connectionString, "orders");
await queueClient.SendMessageAsync(Convert.ToBase64String(Encoding.UTF8.GetBytes(json)));

var msg = await queueClient.ReceiveMessageAsync(TimeSpan.FromMinutes(5));
if (msg.Value != null)
{
    await ProcessAsync(msg.Value.MessageText);
    await queueClient.DeleteMessageAsync(msg.Value.MessageId, msg.Value.PopReceipt);
}
```

**When to use:** simple async processing, cost-sensitive, no advanced features needed.

## What is Azure Service Bus?

**Service Bus** — enterprise message broker with queues, topics, transactions, sessions, dead-lettering.

| Feature | Detail |
|---------|--------|
| **Delivery** | At-least-once (default); exactly-once with sessions + duplicate detection |
| **Message size** | Standard 256 KB; Premium 100 MB (claim-check for large payloads) |
| **Tiers** | Basic (queues only), Standard, Premium (VNet, dedicated) |
| **Dead-letter** | Built-in DLQ sub-queue |

```csharp
await using var client = new ServiceBusClient(connectionString);
var sender = client.CreateSender("orders");

await sender.SendMessageAsync(new ServiceBusMessage(json)
{
    MessageId = orderId,
    ContentType = "application/json",
    SessionId = customerId,  // ordered processing per customer
});
```

## What are Service Bus queues vs topics/subscriptions?

| | Queue | Topic + Subscriptions |
|---|-------|----------------------|
| **Pattern** | Point-to-point (1 consumer) | Pub/sub (N subscribers) |
| **Competing consumers** | Yes — multiple readers compete | Each subscription gets copy |
| **Filters** | — | SQL or correlation filters per subscription |

```text
Topic: order-placed
  ├── Subscription: inventory-service  (filter: all orders)
  ├── Subscription: email-service      (filter: all orders)
  └── Subscription: vip-alerts       (filter: Amount > 1000)
```

```csharp
var processor = client.CreateProcessor("orders", "inventory-subscription");
processor.ProcessMessageAsync += async args =>
{
    await HandleOrderAsync(args.Message.Body.ToString());
    await args.CompleteMessageAsync(args.Message);
};
await processor.StartProcessingAsync();
```

## What is Azure Event Grid?

**Event Grid** — serverless **event routing** — react to state changes (push model, not polling).

| Source examples | Event |
|-----------------|-------|
| **Storage Blob** | Blob created/deleted |
| **Resource Group** | Resource created |
| **Subscription** | ARM resource changed |
| **Custom topic** | Your app publishes events |
| **Event Hubs / Service Bus** | Forwarding |

```bash
az eventgrid event-subscription create \
  --name blob-created-sub \
  --source-resource-id $(az storage account show -n mystorage -g rg-prod --query id -o tsv) \
  --endpoint-type azurefunction \
  --endpoint /subscriptions/.../functions/ProcessBlob
```

```csharp
// Custom event publisher
var client = new EventGridPublisherClient(
    new Uri("https://mytopic.eastus-1.eventgrid.azure.net/api/events"),
    new AzureKeyCredential(key));

await client.SendEventAsync(new EventGridEvent(
    subject: "orders/12345",
    eventType: "Order.Placed",
    dataVersion: "1.0",
    data: orderPayload));
```

**Event Grid vs Service Bus:** Event Grid = lightweight event notification and routing; Service Bus = durable messaging with retry, sessions, transactions.

## What is Azure Event Hubs?

**Event Hubs** — big data **ingestion pipeline** (millions events/sec) — Kafka-compatible.

| Concept | Description |
|---------|-------------|
| **Event Hub** | Namespace for streaming data |
| **Partition** | Ordered sequence shard — parallel consumers |
| **Consumer group** | Independent read cursor per app |
| **Capture** | Auto-save to Blob/Data Lake (Avro) |

```csharp
await using var producer = new EventHubProducerClient(connectionString, "telemetry");
await producer.SendAsync(new[] { new EventData(Encoding.UTF8.GetBytes(json)) });
```

Use for **telemetry, IoT, log aggregation** — not for business workflow messaging (use Service Bus).

## How do Service Bus and Event Grid compare?

| Aspect | Service Bus | Event Grid |
|--------|-------------|------------|
| **Model** | Message queue/broker | Event routing (pub/sub) |
| **Retention** | Until consumed (TTL configurable) | Retry then drop/dead-letter |
| **Ordering** | Sessions support FIFO | No ordering guarantee |
| **Consumers** | Competing consumers on queue | Fan-out to many endpoints |
| **Best for** | Work queues, commands | Event notifications, reactive automation |

```text
"Process this order" (command)     → Service Bus Queue
"Order was placed" (event fan-out)  → Service Bus Topic OR Event Grid
"Blob uploaded" (Azure signal)      → Event Grid
```

## What is dead-letter queue handling?

When a message fails processing after max **delivery count**, it moves to the **dead-letter sub-queue**.

```csharp
var dlqReceiver = client.CreateReceiver("orders", new ServiceBusReceiverOptions
{
    SubQueue = SubQueue.DeadLetter,
});

var msg = await dlqReceiver.ReceiveMessageAsync();
// Inspect DeadLetterReason, DeadLetterErrorDescription
await ReprocessOrAlertAsync(msg);
```

| Strategy | Action |
|----------|--------|
| **Alert + manual review** | Ops dashboard for DLQ depth |
| **Auto-retry** | Fix bug, re-submit to main queue |
| **Poison quarantine** | Move to storage for analysis |

Monitor DLQ depth — sustained growth = consumer bug or bad message format.

## How do you integrate messaging with Azure Functions?

```csharp
// Service Bus trigger
[FunctionName("ProcessOrder")]
public static async Task Run(
    [ServiceBusTrigger("orders", Connection = "ServiceBusConnection")] ServiceBusReceivedMessage message,
    [CosmosDB("orders", "items", ConnectionStringSetting = "CosmosConnection")] IAsyncCollector<Order> output,
    ILogger log)
{
    var order = JsonSerializer.Deserialize<Order>(message.Body);
    await output.AddAsync(order!);
}

// Event Grid trigger
[FunctionName("OnBlobCreated")]
public static void Run([EventGridTrigger] EventGridEvent eventGridEvent, ILogger log)
{
    log.LogInformation($"Blob event: {eventGridEvent.Subject}");
}

// Queue trigger (Storage Queue)
[FunctionName("ProcessJob")]
public static void Run([QueueTrigger("jobs")] string message, ILogger log)
{
    log.LogInformation($"Job: {message}");
}
```

Functions scale automatically based on queue depth (Service Bus / Storage Queue).

## What is the claim-check pattern?

Large messages (>256 KB Service Bus, >64 KB Storage Queue) — store payload in **Blob Storage**, send **reference** in message.

```csharp
// Producer
var blobUri = await UploadToBlobAsync(largePayload);
await sender.SendMessageAsync(new ServiceBusMessage(blobUri.ToString())
{
    ContentType = "application/vnd.claimcheck+json",
});

// Consumer
var uri = new Uri(message.Body.ToString());
var payload = await DownloadFromBlobAsync(uri);
```

Reduces broker load; enables replay from blob if processing fails.

## How do you choose between messaging services for microservices?

| Scenario | Service |
|----------|---------|
| Order processing command | Service Bus Queue |
| Notify 3 services of event | Service Bus Topic or Event Grid |
| Azure resource lifecycle hook | Event Grid |
| IoT telemetry stream | Event Hubs |
| Simple background job | Storage Queue |
| Cross-service saga | Service Bus + Durable Functions |

```text
Microservices best practice:
  Commands (do something)  → Queue (one handler)
  Events (something happened) → Topic/Event Grid (multiple subscribers)
  Streaming analytics      → Event Hubs → Stream Analytics / Synapse
```

## What are message ordering and duplicate handling strategies?

| Requirement | Solution |
|-------------|----------|
| **FIFO per entity** | Service Bus **sessions** (`SessionId = orderId`) |
| **Duplicate detection** | `MessageId` + duplicate detection window |
| **Idempotent consumer** | Store processed message IDs; safe to retry |
| **Out-of-order OK** | Competing consumers on queue |

```csharp
var options = new ServiceBusClientOptions { EnableCrossEntityTransactions = true };
// Session processor — one handler per session at a time
var processor = client.CreateSessionProcessor("orders", "fulfillment-sub");
```

**At-least-once delivery** is default — design consumers to be **idempotent**.

## Related Topics

- **Azure Storage and Databases.md** — Storage Queue vs Blob
- **Azure Compute.md** — Functions triggers
- **Microservices/Microservices Communication.md** — messaging patterns
- **Azure API Management and Gateways.md** — async API patterns
