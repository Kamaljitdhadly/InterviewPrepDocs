# Google Cloud Security and Monitoring

## Questions Covered

1. What is the Google Cloud shared responsibility model for security?
2. What is Cloud KMS?
3. What is Secret Manager?
4. What are Cloud Audit Logs?
5. What is Cloud Monitoring and Cloud Logging?
6. What is Cloud Trace and Cloud Profiler?
7. What is Security Command Center?
8. What is VPC Service Controls?
9. What is Cloud Armor (security context)?
10. How do you implement defense in depth on GCP?
11. What is Assured Workloads and compliance?
12. How do you monitor costs and set budgets?

## What is the Google Cloud shared responsibility model for security?

| Google secures | Customer secures |
|----------------|------------------|
| Physical datacenters | IAM policies, MFA |
| Hypervisor, host on managed services | App code, data classification |
| Global network infrastructure | VPC firewall rules, VPC SC |
| Encryption at rest infrastructure | CMEK choices, key access |
| Patch managed services (Cloud SQL, Run) | Guest OS on Compute Engine |

Same framing as AWS/Azure — **security OF the cloud vs IN the cloud**.

## What is Cloud KMS?

**Cloud Key Management Service** — manage encryption keys for GCP services and applications.

| Key type | Use |
|----------|-----|
| **Google-managed** | Default encryption (GCS, PD, BigQuery) |
| **Customer-managed (CMEK)** | You control rotation, IAM, audit |
| **HSM-backed keys** | FIPS 140-2 Level 3 — Cloud HSM |

```bash
gcloud kms keyrings create prod-ring --location=us-central1
gcloud kms keys create storage-key --keyring=prod-ring --location=us-central1 --purpose=encryption

# Encrypt bucket with CMEK
gcloud storage buckets update gs://myapp-prod-uploads \
  --default-encryption-key=projects/myapp-prod/locations/us-central1/keyRings/prod-ring/cryptoKeys/storage-key
```

**Envelope encryption** — KMS wraps data encryption keys (DEKs) for application-level crypto.

## What is Secret Manager?

**Secret Manager** — store API keys, DB passwords, certs — versioned, audited access.

```bash
echo -n "ComplexP@ss1!" | gcloud secrets create db-password --data-file=-
gcloud secrets versions access latest --secret=db-password

# Grant Cloud Run SA access
gcloud secrets add-iam-policy-binding db-password \
  --member=serviceAccount:run-sa@myapp-prod.iam.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

```csharp
// .NET — Secret Manager API
var client = SecretManagerServiceClient.Create();
var secret = client.AccessSecretVersion(new SecretVersionName("myapp-prod", "db-password", "latest"));
var password = secret.Payload.Data.ToStringUtf8();
```

Mount as env var in Cloud Run — **prefer Secret Manager over env files in images**.

## What are Cloud Audit Logs?

**Cloud Audit Logs** — record who did what, when, on GCP resources.

| Log type | Content |
|----------|---------|
| **Admin Activity** | Config changes — always on, no charge |
| **Data Access** | Read/write user data — must enable per service |
| **System Event** | Google-initiated changes |
| **Policy Denied** | IAM deny decisions |

```bash
gcloud logging read 'protoPayload.serviceName="run.googleapis.com" AND protoPayload.methodName:"google.cloud.run"' \
  --limit=10 --project=myapp-prod
```

Export to **BigQuery** (long retention/analysis) or **Cloud Storage** (cheap archive) — **org sink** for centralized SIEM.

Compare **AWS CloudTrail** / **Azure Activity Log**.

## What is Cloud Monitoring and Cloud Logging?

| Service | Purpose |
|---------|---------|
| **Cloud Logging** | Centralized logs — platform, apps, audit |
| **Cloud Monitoring** | Metrics, dashboards, alerts, SLOs |
| **Error Reporting** | Aggregated app exceptions |
| **Uptime checks** | Synthetic monitoring |

```bash
gcloud monitoring uptime create https://www.myapp.com/health --period=60
```

```csharp
// Structured logging on Cloud Run — stdout → Cloud Logging automatically
_logger.LogInformation("Order {OrderId} placed", orderId);
```

**Alerting policy** — notify Pub/Sub, email, PagerDuty when metric threshold breached.

```yaml
# Example: alert on Cloud Run 5xx rate
displayName: High error rate
conditions:
  - displayName: 5xx ratio
    conditionThreshold:
      filter: resource.type="cloud_run_revision" AND metric.type="run.googleapis.com/request_count"
      comparison: COMPARISON_GT
      thresholdValue: 0.05
```

## What is Cloud Trace and Cloud Profiler?

| Service | Purpose |
|---------|---------|
| **Cloud Trace** | Distributed tracing — latency breakdown across services |
| **Cloud Profiler** | Continuous CPU/memory profiling — production safe |

Auto-instrument **Cloud Run, GKE, App Engine** — OpenTelemetry export supported.

Compare **AWS X-Ray** / **Application Insights**.

## What is Security Command Center?

**Security Command Center (SCC)** — unified security and risk dashboard for GCP org.

| Feature | Detail |
|---------|--------|
| **Asset inventory** | All resources across projects |
| **Vulnerability findings** | Container Analysis, Web Security Scanner |
| **Threat detection** | Event Threat Detection (like GuardDuty) |
| **Compliance** | CIS, PCI, NIST benchmarks |
| **Risk scoring** | Prioritized misconfigurations |

Enable at **organization level** — security team single pane of glass.

## What is VPC Service Controls?

**VPC Service Controls** — security **perimeter** around projects — restrict data exfiltration from GCP services.

```text
Perimeter "prod-data":
  Projects: myapp-prod, analytics-prod
  Restricted services: storage.googleapis.com, bigquery.googleapis.com
  Access levels: corporate IP + device policy only
```

Blocks exfil even if IAM credentials leak outside perimeter — **high security / regulated** workloads.

Compare **Azure Private Link + policy** combinations — GCP VPC SC is distinctive interview topic.

## What is Cloud Armor (security context)?

Documented in **Google Cloud Load Balancing and CDN.md** — WAF + DDoS for HTTP(S) LB.

| Security stack layer | Service |
|----------------------|---------|
| Edge WAF | Cloud Armor |
| DDoS | Google infrastructure + Armor adaptive protection |
| Bot management | reCAPTCHA Enterprise integration |

## How do you implement defense in depth on GCP?

```text
Layer 1: Organization policies + VPC Service Controls
Layer 2: IAM + Workforce Identity + MFA
Layer 3: VPC segmentation + firewall + Private Google Access
Layer 4: Private IP only (Cloud SQL, internal LB)
Layer 5: CMEK + Secret Manager
Layer 6: Cloud Armor at edge
Layer 7: Audit logs + SCC + Chronicle SIEM
Layer 8: Binary Authorization (GKE — only signed images deploy)
```

| Control | Example |
|---------|---------|
| **No SA keys** | Org policy disable key creation |
| **IAP** | Admin tools without VPN |
| **Binary Authorization** | GKE deploy only vetted images |
| **Org policy** | Restrict external VM IPs |

## What is Assured Workloads and compliance?

**Assured Workloads** — deploy workloads with **compliance controls** baked in (FedRAMP, IL5, EU regions, etc.).

| Feature | Benefit |
|---------|---------|
| **Data residency** | Resources stay in chosen region/jurisdiction |
| **Personnel access controls** | Google support staff restrictions |
| **Compliance monitoring** | Continuous control checks |

Know for **government/regulated** GCP interview contexts.

## How do you monitor costs and set budgets?

```bash
gcloud billing budgets create --billing-account=XXXX \
  --display-name="monthly-prod" --budget-amount=5000USD \
  --threshold-rule=percent=0.9,basis=current-spend \
  --notifications-rule=pubsub-topic=projects/myapp-prod/topics/billing-alerts
```

| Tool | Purpose |
|------|---------|
| **Billing reports** | By project, SKU, label |
| **Budgets & alerts** | Email, Pub/Sub on threshold |
| **Recommender** | CUD suggestions, idle resources |
| **Cost table (BigQuery)** | Detailed export for FinOps |

```bash
# Label resources for chargeback
gcloud compute instances create web-01 --labels=environment=prod,team=platform ...
```

Set **quota alerts** and review **CUD** commitments for steady Compute Engine / GKE spend.

## Related Topics

- **Google Cloud Identity and IAM.md** — IAM, org policies
- **Google Cloud Load Balancing and CDN.md** — Cloud Armor
- **Google Cloud Networking.md** — VPC SC, firewall
- **Security/Cloud and Infrastructure Security.md**
- **AWS/AWS Security and Monitoring.md** · **Azure Cloud 1/Azure Security and Monitoring.md**
