# Google Cloud Basics

## Questions Covered

1. What is Google Cloud Platform (GCP), and how does it compare to AWS and Azure?
2. What are regions, zones, and multi-region resources?
3. What is the Google Cloud resource hierarchy?
4. What is the difference between IaaS, PaaS, and SaaS on GCP?
5. What is the Google Cloud shared responsibility model?
6. What are projects, folders, and organizations?
7. How does billing and cost management work on GCP?
8. What is the Google Cloud Well-Architected Framework?
9. What is the gcloud CLI, Cloud Console, and Cloud Shell?
10. What is Infrastructure as Code on GCP (Deployment Manager, Terraform, Config Connector)?
11. What is an GCP SLA, and how do you design for high availability?
12. How do you choose the right GCP region?
13. What is the Google Cloud Free Tier?

## What is Google Cloud Platform (GCP), and how does it compare to AWS and Azure?

**Google Cloud Platform (GCP)** is Google's public cloud — compute, storage, data analytics, ML (Vertex AI), and Kubernetes (GKE originated here).

| Aspect | GCP | AWS | Azure |
|--------|-----|-----|-------|
| **Strengths** | Data analytics, BigQuery, GKE, ML/AI | Broadest catalog, maturity | Microsoft enterprise, hybrid |
| **Compute flagship** | Compute Engine, Cloud Run, GKE | EC2, Lambda, EKS | VM, App Service, AKS |
| **Object storage** | Cloud Storage | S3 | Blob |
| **Identity** | Cloud IAM | IAM | Entra ID |
| **Global network** | Premium Tier (Google backbone) | Global Accelerator, CloudFront | Front Door |

**Interview mappings:** Compute Engine ≈ EC2 ≈ VM; VPC ≈ AWS VPC ≈ Azure VNet; Cloud Storage ≈ S3 ≈ Blob; Cloud Run ≈ Lambda/Container Apps.

## What are regions, zones, and multi-region resources?

| Term | Definition |
|------|------------|
| **Region** | Geographic area (e.g. `us-central1`, `europe-west1`) |
| **Zone** | Isolated datacenter within a region (`us-central1-a`) |
| **Multi-region** | Resource spans regions (Cloud Storage multi-region, Firestore) |
| **Dual-region** | Two specific regions for storage (custom pairing) |

```text
Region: us-central1 (Iowa)
  ├── us-central1-a
  ├── us-central1-b
  └── us-central1-c
```

Deploy across **≥2 zones** for HA. Some services are **global** (Cloud IAM, Cloud DNS, Load Balancing anycast IP).

## What is the Google Cloud resource hierarchy?

```text
Organization (optional)
  └── Folder(s) (optional — dept/env grouping)
        └── Project(s) — billing + IAM boundary
              └── Resources (VM, bucket, GKE cluster, etc.)
```

| Level | Purpose |
|-------|---------|
| **Organization** | Company root; org policies |
| **Folder** | Group projects (Prod, Dev, Platform) |
| **Project** | Billing unit; every resource belongs to one project |
| **Resource** | Individual service instance |

```bash
gcloud projects create myapp-prod --name="My App Production"
gcloud config set project myapp-prod
```

Unlike AWS accounts, GCP uses **projects** inside an organization — multiple projects per billing account.

## What is the difference between IaaS, PaaS, and SaaS on GCP?

| Model | GCP examples | You manage |
|-------|--------------|------------|
| **IaaS** | Compute Engine, persistent disks | OS, apps, data |
| **PaaS** | Cloud Run, App Engine, Cloud SQL, GKE (control plane) | Apps, data |
| **Serverless** | Cloud Functions, Cloud Run, BigQuery | Code, config |
| **SaaS** | Google Workspace, Firebase (partial) | Configuration |

```text
Full VM control        → Compute Engine
Containers, no cluster → Cloud Run
Kubernetes             → GKE
Event functions        → Cloud Functions (2nd gen on Cloud Run)
```

## What is the Google Cloud shared responsibility model?

| Google manages | Customer manages |
|----------------|------------------|
| Physical security, hypervisor | Data, access (IAM) |
| Managed service patching (Cloud SQL, Run) | App code, VPC firewall rules |
| Global network infrastructure | OS patching on Compute Engine |
| | Compliance configuration |

Same concept as AWS/Azure — higher abstraction = less customer ops.

## What are projects, folders, and organizations?

**Organization policies** — constraints applied down the hierarchy (e.g. restrict VM external IPs, require CMEK).

```bash
# Org policy example — disable service account key creation
gcloud resource-manager org-policies set-policy policy.yaml --project=myapp-prod
```

| Best practice | Detail |
|---------------|--------|
| **Separate projects** | prod / non-prod / shared VPC host |
| **No default project abuse** | Explicit project per workload |
| **Centralized logging** | Log sink to security project |

Use **Shared VPC** — host project owns network; service projects attach workloads.

## How does billing and cost management work on GCP?

| Concept | Detail |
|---------|--------|
| **Billing account** | Linked to projects; payment method |
| **Budgets & alerts** | Email/Pub/Sub when spend exceeds threshold |
| **Committed use discounts (CUD)** | 1–3 year commit — Compute Engine, Cloud SQL |
| **Sustained use discounts** | Automatic — long-running VMs |
| **Preemptible / Spot VMs** | Up to ~91% discount; can be terminated |
| **Free tier** | Always-free SKUs + $300 credit for new accounts |

```bash
gcloud billing budgets create --billing-account=XXXX --display-name=monthly-prod \
  --budget-amount=5000USD --threshold-rule=percent=0.9,basis=current-spend
```

Use **labels** (`environment=prod`, `team=platform`) for cost allocation — like AWS tags.

## What is the Google Cloud Well-Architected Framework?

Google's framework aligns with operational excellence across:

| Pillar | Focus |
|--------|-------|
| **Operational excellence** | Monitoring, automation, SRE practices |
| **Security, privacy, compliance** | IAM, encryption, VPC SC |
| **Reliability** | Multi-zone, backups, DR |
| **Cost optimization** | CUD, right-sizing, preemptible |
| **Performance optimization** | Machine types, caching, CDN |

Google emphasizes **SRE** (error budgets, SLIs/SLOs) — strong interview talking point for GCP roles.

## What is the gcloud CLI, Cloud Console, and Cloud Shell?

| Tool | Use |
|------|-----|
| **Cloud Console** | Web UI |
| **gcloud** | Primary CLI — `gcloud`, `gsutil`, `bq`, `kubectl` |
| **Cloud Shell** | Browser VM with gcloud pre-installed (free) |

```bash
gcloud auth login
gcloud config set project myapp-prod
gcloud config set compute/region us-central1
gcloud compute instances list
```

**Application Default Credentials (ADC)** — SDK and gcloud use same credential chain for local dev → GCP APIs.

## What is Infrastructure as Code on GCP?

| Tool | Description |
|------|-------------|
| **Terraform** | Most common — Google provider |
| **Deployment Manager** | Native YAML/Python — legacy |
| **Config Connector** | Kubernetes CRDs → GCP resources |
| **Cloud Deployment Manager** | Declarative templates |

```hcl
# Terraform — GCS bucket
resource "google_storage_bucket" "uploads" {
  name     = "myapp-prod-uploads"
  location = "US"
  uniform_bucket_level_access = true
}
```

```bash
gcloud deployment-manager deployments create prod --config network.yaml
```

## What is an GCP SLA, and how do you design for high availability?

| Pattern | GCP approach |
|---------|--------------|
| **Single zone** | AZ outage = downtime for zonal resources |
| **Multi-zone MIG** | Managed Instance Group across zones |
| **Regional services** | Cloud SQL regional, regional GKE |
| **Multi-region** | Cloud Storage, Firestore, global LB |

Compute Engine SLA requires **≥2 VMs in multi-zone MIG** for qualifying workloads.

## How do you choose the right GCP region?

| Factor | Consideration |
|--------|---------------|
| **Latency** | Closest to users |
| **Compliance** | Data residency |
| **Carbon** | Google publishes low-carbon region list |
| **SKU availability** | GPU, TPU not everywhere |
| **Pricing** | Varies by region |

```bash
gcloud compute regions list
gcloud compute machine-types list --zones=us-central1-a
```

## What is the Google Cloud Free Tier?

| Type | Examples |
|------|----------|
| **Always free** | 1 f1-micro VM/month (select regions), 5 GB Cloud Storage, 2M Cloud Functions invocations |
| **90-day trial** | $300 credit for new customers |
| **Free limits** | BigQuery sandbox, Firestore daily quotas |

Set **billing alerts** immediately — free tier overages charge real money.

## Related Topics

- **Google Cloud Compute.md** — GCE, Cloud Run, GKE, Functions
- **Google Cloud Identity and IAM.md** — projects, roles, service accounts
- **Google Cloud CLI and Commands.md** — gcloud essentials
- **AWS/AWS Basics.md** · **Azure Cloud/Azure Basics.md** — cloud comparisons
