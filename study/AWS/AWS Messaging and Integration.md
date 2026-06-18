# AWS Messaging and Integration

## Questions Covered

1. What AWS messaging services exist, and when do you use each?
2. What is Amazon SQS?
3. What are standard vs FIFO SQS queues?
4. What is Amazon SNS?
5. How do SNS and SQS work together (fan-out)?
6. What is Amazon EventBridge?
7. What is Amazon Kinesis?
8. How do SQS, SNS, and EventBridge compare?
9. What is dead-letter queue (DLQ) handling?
10. How do you integrate messaging with Lambda?
11. What is the claim-check pattern on AWS?
12. How do you choose messaging for microservices on AWS?

## What AWS messaging services exist, and when do you use each?

| Service | Pattern | Throughput | Use case |
|---------|---------|------------|----------|
| **SQS** | Queue (pull) | Nearly unlimited | Decouple services, job queues |
| **SNS** | Pub/sub (push) | High | Notifications, fan-out |
| **EventBridge** | Event bus (routing) | High | Event-driven architecture, SaaS integration |
| **Kinesis Data Streams** | Streaming | MB/sec per shard | Real-time analytics, logs, IoT |
| **Kinesis Firehose** | Delivery stream | Managed ingest to S3/Redshift | ETL pipeline |
| **MQ (Amazon MQ)** | Managed ActiveMQ/RabbitMQ | Legacy | Existing JMS/AMQP apps |

```text
Process order async        → SQS
Notify email + SMS + push  → SNS
React to domain events     → EventBridge
Stream click telemetry     → Kinesis
```

## What is Amazon SQS?

**SQS (Simple Queue Service)** — fully managed message queue; producers send, consumers poll.

| Feature | Detail |
|---------|--------|
| **Delivery** | At-least-once (standard); exactly-once (FIFO with dedup) |
| **Visibility timeout** | Message hidden while processing |
| **Long polling** | Reduce empty receives (`WaitTimeSeconds=20`) |
| **Retention** | 1 min – 14 days (default 4 days) |
| **Message size** | 256 KB max |

```python
import boto3
sqs = boto3.client('sqs')
queue_url = 'https://sqs.us-east-1.amazonaws.com/123/orders'

sqs.send_message(QueueUrl=queue_url, MessageBody='{"orderId":"ORD-001"}')
response = sqs.receive_message(QueueUrl=queue_url, MaxNumberOfMessages=1, WaitTimeSeconds=20)
# process → delete_message
```

## What are standard vs FIFO SQS queues?

| | Standard | FIFO |
|---|----------|------|
| **Ordering** | Best-effort | Strict FIFO |
| **Throughput** | Unlimited | 300 msg/sec (3000 with batching) |
| **Duplicates** | Possible | Deduplication option |
| **Name** | Any | Must end in `.fifo` |
| **Use** | High throughput, order optional | Order processing, financial |

```bash
aws sqs create-queue --queue-name orders.fifo \
  --attributes FifoQueue=true,ContentBasedDeduplication=true
```

Use **FIFO** when message order matters per message group (`MessageGroupId`).

## What is Amazon SNS?

**SNS (Simple Notification Service)** — pub/sub; publish to **topic**; subscribers receive push delivery.

| Subscriber types | Protocol |
|------------------|----------|
| **Lambda** | Function invoke |
| **SQS** | Queue subscription (fan-out) |
| **Email/SMS** | Human notification |
| **HTTP(S)** | Webhook |
| **Mobile push** | APNS, FCM |

```bash
aws sns publish --topic-arn arn:aws:sns:us-east-1:123:order-events \
  --message '{"orderId":"ORD-001","status":"placed"}'
```

**Fan-out:** one SNS message → multiple SQS queues (inventory, shipping, analytics) in parallel.

## How do SNS and SQS work together (fan-out)?

```text
Order Service → SNS Topic "order-placed"
                    ├── SQS: inventory-queue  → Inventory Lambda
                    ├── SQS: email-queue      → Email Lambda
                    └── SQS: analytics-queue  → Analytics worker
```

| Benefit | Detail |
|---------|--------|
| **Decoupling** | Publisher doesn't know subscribers |
| **Parallel processing** | Each queue consumed independently |
| **Retry per consumer** | DLQ per queue |

SQS subscription to SNS — SNS delivers to SQS; consumer polls SQS (not SNS push to app directly for heavy processing).

## What is Amazon EventBridge?

**EventBridge** — serverless **event bus** with content-based routing and schema registry.

| Feature | Detail |
|---------|--------|
| **Default event bus** | AWS service events (EC2 state change, S3 object created) |
| **Custom event bus** | Your application domain events |
| **Rules** | Pattern match → target (Lambda, SQS, Step Functions, etc.) |
| **Archive/replay** | Debug and reprocess events |
| **SaaS integrations** | Zendesk, Datadog, partners |

```json
{
  "source": ["com.mycompany.orders"],
  "detail-type": ["OrderPlaced"],
  "detail": { "amount": [{ "numeric": [">=", 1000] }] }
}
```

```bash
aws events put-events --entries '[{
  "Source": "com.mycompany.orders",
  "DetailType": "OrderPlaced",
  "Detail": "{\"orderId\":\"ORD-001\",\"amount\":1200}",
  "EventBusName": "prod"
}]'
```

**EventBridge vs SNS:** EventBridge = advanced routing, schema, archives; SNS = simpler pub/sub notifications.

## What is Amazon Kinesis?

| Service | Description |
|---------|-------------|
| **Kinesis Data Streams** | Real-time streaming; shards for throughput; consumers with checkpoints |
| **Kinesis Data Firehose** | Load streams to S3, Redshift, OpenSearch — fully managed |
| **Kinesis Video Streams** | Video ingest |

```python
kinesis.put_record(
    StreamName='clickstream',
    Data=json.dumps({'userId': 'u1', 'page': '/home'}),
    PartitionKey='u1'
)
```

**Lambda** can consume Kinesis batches (event source mapping with parallelization factor).

Use Kinesis for **high-volume ordered streams**; SQS for **simple job queues**.

## How do SQS, SNS, and EventBridge compare?

| Question | SQS | SNS | EventBridge |
|----------|-----|-----|-------------|
| **Model** | Queue (pull) | Topic (push) | Event bus (route) |
| **Consumers** | Competing consumers | Many subscribers | Many targets per rule |
| **Ordering** | FIFO option | No guarantee | No strict order |
| **Filtering** | — | Subscription filter | Advanced pattern matching |
| **AWS events** | Via SNS/EventBridge | Via EventBridge | Native |
| **Best for** | Work queues | Notifications, fan-out | Event-driven microservices |

```text
Command: "Process payment"     → SQS
Event: "PaymentCompleted"      → EventBridge → multiple targets
Alert human ops                → SNS → email/SMS
```

## What is dead-letter queue (DLQ) handling?

After **maxReceiveCount** failures, message moves to **DLQ** for investigation.

```bash
aws sqs set-queue-attributes --queue-url $MAIN_QUEUE \
  --attributes '{"RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:123:orders-dlq\",\"maxReceiveCount\":\"3\"}"}'
```

| Step | Action |
|------|--------|
| **Monitor** | CloudWatch alarm on DLQ depth > 0 |
| **Analyze** | Inspect message body, failure reason |
| **Fix** | Bug fix or bad payload handling |
| **Replay** | Move messages back to main queue |

Lambda SQS trigger also supports **on-failure destinations** and DLQ.

## How do you integrate messaging with Lambda?

| Source | Behavior |
|--------|----------|
| **SQS** | Poll batch; partial batch failure reporting |
| **SNS** | Push invoke (async) |
| **EventBridge** | Rule target invoke |
| **Kinesis** | Shard iterator; batch window |
| **DynamoDB Streams** | Change capture |

```python
def lambda_handler(event, context):
    for record in event['Records']:
        body = record['body']  # SQS
        process(json.loads(body))
    # Auto-delete on success with SQS trigger
```

Configure **visibility timeout ≥ Lambda timeout** to prevent duplicate processing.

## What is the claim-check pattern on AWS?

Large payloads exceed SQS 256 KB → store in **S3**, send pointer in message.

```python
s3.put_object(Bucket='payloads', Key=f'orders/{order_id}.json', Body=large_json)
sqs.send_message(QueueUrl=queue_url, MessageBody=json.dumps({
    's3Bucket': 'payloads',
    's3Key': f'orders/{order_id}.json'
}))
```

Consumer fetches from S3 using IAM role — same pattern as Azure Blob + Service Bus.

## How do you choose messaging for microservices on AWS?

| Scenario | Service |
|----------|---------|
| Order command (one handler) | SQS |
| Domain event (multiple services) | EventBridge or SNS→SQS fan-out |
| Real-time analytics pipeline | Kinesis → Firehose → S3 |
| Scheduled job | EventBridge Scheduler |
| Long-running workflow | Step Functions |
| Cross-account events | EventBridge cross-account bus |

```text
Microservices on AWS (typical):
  API Gateway → Lambda (sync)
  Lambda/ECS → EventBridge (async domain events)
  Workers     → SQS queues with DLQ
  Analytics   → Kinesis → S3 → Athena/Glue
```

## Related Topics

- **AWS Compute.md** — Lambda triggers
- **AWS Storage and Databases.md** — S3 for claim-check
- **Microservices/Microservices Communication.md** — patterns
- **Azure Cloud 1/Azure Messaging and Integration.md** — Azure comparison
