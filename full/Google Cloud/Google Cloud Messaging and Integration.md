# Google Cloud Messaging and Integration

## Questions Covered

1. What GCP messaging services exist, and when do you use each?
2. What is Pub/Sub?
3. What are Pub/Sub topics, subscriptions, and message flow?
4. What is message ordering and dead-letter topics?
5. What is Cloud Tasks?
6. What is Eventarc?
7. What is Cloud Scheduler?
8. What is Dataflow in the messaging pipeline?
9. How do Pub/Sub, Cloud Tasks, and Eventarc compare?
10. How do you integrate Pub/Sub with Cloud Run and Cloud Functions?
11. What is the outbox pattern on GCP?
12. How do you choose messaging for microservices on GCP?

## What GCP messaging services exist, and when do you use each?

| Service | Pattern | Use case |
|---------|---------|----------|
| **Pub/Sub** | Async pub/sub | Event-driven architecture, decoupling |
| **Cloud Tasks** | Task queue (HTTP/gRPC push) | Rate-limited async work, retries |
| **Eventarc** | Event routing | Route GCP events to Cloud Run/Functions |
| **Cloud Scheduler** | Cron | Scheduled jobs |
| **Dataflow** | Stream/batch processing | ETL, stream analytics on Pub/Sub |
| **Kafka (managed)** | Managed Kafka | Kafka-native workloads (GCP Managed Service for Kafka) |

```text
Domain events fan-out       → Pub/Sub
HTTP task with retry/delay  → Cloud Tasks
GCS upload → process file   → Eventarc → Cloud Run
Cron nightly report         → Cloud Scheduler → Pub/Sub
```

## What is Pub/Sub?

**Cloud Pub/Sub** — globally distributed, scalable messaging — at-least-once delivery.

| Concept | Description |
|---------|-------------|
| **Topic** | Named channel publishers send to |
| **Subscription** | Consumer view — pull or push |
| **Message** | Opaque bytes + attributes; max 10 MB |
| **Ack deadline** | Must ack or redeliver (default 10s, extendable) |

```python
from google.cloud import pubsub_v1

publisher = pubsub_v1.PublisherClient()
topic = publisher.topic_path("myapp-prod", "order-events")
publisher.publish(topic, b'{"orderId":"ORD-001"}', event_type="OrderPlaced")

subscriber = pubsub_v1.SubscriberClient()
sub = subscriber.subscription_path("myapp-prod", "inventory-sub")
subscriber.subscribe(sub, callback=handle_message)
```

## What are Pub/Sub topics, subscriptions, and message flow?

```text
Publisher(s) → Topic "order-events"
                  ├── Subscription: inventory-push → Cloud Run (push endpoint)
                  ├── Subscription: analytics-pull  → Dataflow job
                  └── Subscription: audit-pull      → BigQuery subscription
```

| Delivery | Detail |
|----------|--------|
| **Pull** | Client pulls messages — workers, Dataflow |
| **Push** | Pub/Sub POSTs to HTTPS endpoint — Cloud Run URL |
| **BigQuery subscription** | Direct write to BQ table (analytics) |

One topic → many subscriptions = **fan-out** (each subscription gets every message).

## What is message ordering and dead-letter topics?

**Ordering keys** — messages with same key delivered in order (single region).

```python
publisher.publish(topic, data, ordering_key="customer-123")
```

Enable **message ordering** on subscription.

**Dead-letter topic** — after max delivery attempts, message moved to DLQ topic for inspection.

```bash
gcloud pubsub subscriptions update inventory-sub \
  --dead-letter-topic=projects/myapp-prod/topics/inventory-dlq \
  --max-delivery-attempts=5
```

Monitor DLQ depth — alert on Cloud Monitoring metric `dead_letter_message_count`.

## What is Cloud Tasks?

**Cloud Tasks** — fully managed task queue — **push HTTP requests** to your handler with retries and rate limits.

| vs Pub/Sub | Cloud Tasks |
|------------|-------------|
| **Model** | Queue of tasks targeting specific URL | Pub/sub fan-out |
| **Schedule** | Delay, schedule time per task | N/A |
| **Rate control** | Max dispatches per second | Subscriber concurrency |
| **Use** | "Call this URL later" | "Broadcast event happened" |

```python
from google.cloud import tasks_v2

client = tasks_v2.CloudTasksClient()
task = {
    "http_request": {
        "http_method": tasks_v2.HttpMethod.POST,
        "url": "https://myapi-xxx.run.app/process",
        "oidc_token": {"service_account_email": "tasks-sa@myapp-prod.iam.gserviceaccount.com"},
        "body": json.dumps({"jobId": "J1"}).encode(),
    }
}
client.create_task(parent=queue_path, task=task)
```

Similar to **AWS SQS + Lambda** or **Azure Storage Queue** push pattern.

## What is Eventarc?

**Eventarc** — route events from Google Cloud services (and custom sources) to Cloud Run, GKE, Functions.

```bash
gcloud eventarc triggers create gcs-trigger \
  --location=us-central1 \
  --destination-run-service=process-upload --destination-run-region=us-central1 \
  --event-filters="type=google.cloud.storage.object.v1.finalized" \
  --event-filters="bucket=uploads-prod" \
  --service-account=eventarc-sa@myapp-prod.iam.gserviceaccount.com
```

| vs Pub/Sub directly | Eventarc adds routing, filtering, standardized CloudEvents format |
|---------------------|---------------------------------------------------------------------|

Compare **AWS EventBridge** / **Azure Event Grid**.

## What is Cloud Scheduler?

**Cloud Scheduler** — managed cron — HTTP, Pub/Sub, or Cloud Tasks target.

```bash
gcloud scheduler jobs create pubsub nightly-report \
  --schedule="0 2 * * *" --topic=nightly-jobs --message-body='{"report":"sales"}' \
  --time-zone="America/New_York"
```

Use for **periodic batch triggers** — not high-frequency scheduling (use Cloud Tasks for per-item delays).

## What is Dataflow in the messaging pipeline?

**Dataflow** (Apache Beam) — stream/batch processing — consume Pub/Sub, transform, write to BigQuery, GCS, etc.

```text
Pub/Sub topic → Dataflow streaming job → BigQuery (real-time analytics)
```

Know at interview level: Pub/Sub = transport; Dataflow = processing.

## How do Pub/Sub, Cloud Tasks, and Eventarc compare?

| Question | Pub/Sub | Cloud Tasks | Eventarc |
|----------|---------|-------------|----------|
| **Primary use** | Event broadcast | Delayed HTTP work item | Route GCP events |
| **Consumers** | Many subscriptions | One queue → one handler pattern | One destination per trigger |
| **Fan-out** | Native | Per-task | Can publish to Pub/Sub |
| **Scheduling** | Immediate | Per-task schedule | On event occurrence |

```text
"OrderPlaced" event → 3 services     → Pub/Sub
"Send email in 1 hour"               → Cloud Tasks
"File uploaded to GCS"               → Eventarc → Cloud Run
```

## How do you integrate Pub/Sub with Cloud Run and Cloud Functions?

```bash
# Push subscription to Cloud Run
gcloud pubsub subscriptions create orders-push \
  --topic=order-events \
  --push-endpoint=https://myapi-xxx.run.app/events/orders \
  --push-auth-service-account=pubsub-invoker@myapp-prod.iam.gserviceaccount.com

# Grant invoker on Cloud Run
gcloud run services add-iam-policy-binding myapi \
  --member=serviceAccount:pubsub-invoker@myapp-prod.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

Cloud Functions gen 2 — Eventarc trigger from Pub/Sub is preferred pattern.

**Idempotent handlers** — Pub/Sub is at-least-once; dedupe with message ID or business key.

## What is the outbox pattern on GCP?

Transactional **outbox table** in Cloud SQL → publisher reads → Pub/Sub — ensures DB commit and event publish consistency.

```text
BEGIN TX
  INSERT INTO orders ...
  INSERT INTO outbox (event_type, payload) ...
COMMIT
→ Separate worker polls outbox → publishes to Pub/Sub → marks sent
```

Alternative: **change data capture** (Datastream) from DB to Pub/Sub for event sourcing pipelines.

## How do you choose messaging for microservices on GCP?

| Scenario | Service |
|----------|---------|
| Domain events to multiple services | **Pub/Sub** |
| Async HTTP job with retry | **Cloud Tasks** |
| React to GCS/Firestore/Audit log | **Eventarc** |
| Cron workflows | **Cloud Scheduler** + Pub/Sub |
| Stream processing | **Pub/Sub + Dataflow** |
| Cross-cloud events | Pub/Sub + Cloud Functions bridge |

```text
GCP microservices default stack:
  Sync: Cloud Run + global LB
  Async: Pub/Sub + Eventarc
  Workflow: Workflows (GCP) or Temporal on GKE
```

## Related Topics

- **Google Cloud Compute.md** — Cloud Run, Functions triggers
- **Google Cloud Storage and Databases.md** — GCS Eventarc events
- **Microservices/Microservices Communication.md**
- **AWS/AWS Messaging and Integration.md** · **Azure Cloud 1/Azure Messaging and Integration.md**
