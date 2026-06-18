# Google Cloud Compute

## Questions Covered

1. What GCP compute services exist, and when do you use each?
2. What is Compute Engine, and how do you secure VMs?
3. What are machine types and disk options?
4. What is a Managed Instance Group (MIG)?
5. What is Cloud Run?
6. What is Google Kubernetes Engine (GKE)?
7. What is Cloud Functions (2nd gen)?
8. What is App Engine?
9. What are preemptible and Spot VMs?
10. How do you connect to VMs securely?
11. How does GCP compute integrate with load balancing?
12. What is Batch and Compute Engine for HPC?

## What GCP compute services exist, and when do you use each?

| Service | Model | Best for |
|---------|-------|----------|
| **Compute Engine (GCE)** | IaaS VMs | Full OS control, lift-and-shift |
| **Managed Instance Groups** | IaaS + autoscale | Identical VMs behind LB |
| **Cloud Run** | Serverless containers | HTTP services, scale to zero |
| **Cloud Functions** | Serverless functions | Events, small logic units |
| **GKE** | Managed Kubernetes | Container orchestration |
| **App Engine** | PaaS | Legacy Google PaaS (prefer Cloud Run for new) |
| **Batch** | HPC/batch jobs | Parallel compute workloads |

```text
Need full VM?           → Compute Engine + MIG
HTTP container API?     → Cloud Run
Kubernetes?             → GKE Autopilot or Standard
Simple event handler?   → Cloud Functions
```

## What is Compute Engine, and how do you secure VMs?

**Compute Engine** — VMs in your VPC with customizable machine type, disk, and network.

```bash
gcloud compute instances create web-01 \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --subnet=prod-subnet \
  --no-address \
  --tags=http-server \
  --service-account=web-sa@myapp-prod.iam.gserviceaccount.com \
  --scopes=cloud-platform
```

| Security practice | Detail |
|-------------------|--------|
| **No public IP** | Use IAP for SSH, or Cloud NAT for outbound only |
| **Service account** | Attach dedicated SA — no JSON keys on VM |
| **OS Login** | IAM-based SSH key management |
| **Shielded VMs** | Secure Boot, vTPM, integrity monitoring |
| **Block project SSH keys** | Force OS Login / IAP only |

**Never** expose RDP/SSH to `0.0.0.0/0` in production firewall rules.

## What are machine types and disk options?

| Family | Use |
|--------|-----|
| **E2** | Cost-optimized general purpose — default |
| **N2/N2D** | Balanced performance |
| **C2/C3** | Compute optimized |
| **M1/M2/M3** | Memory optimized |
| **T2A** | Arm-based (Tau) — cost efficient |

| Disk type | Use |
|-----------|-----|
| **pd-balanced** | Default SSD |
| **pd-ssd** | Higher IOPS |
| **pd-extreme** | Highest IOPS (provisioned) |
| **hyperdisk** | Next-gen flexible performance |
| **Local SSD** | Ephemeral — cache, temp data |

```bash
gcloud compute disks create data-disk --size=100GB --type=pd-balanced --zone=us-central1-a
gcloud compute instances attach-disk web-01 --disk=data-disk --zone=us-central1-a
```

## What is a Managed Instance Group (MIG)?

**MIG** — autoscaling group of identical VMs from instance template; supports rolling updates and health checks.

```bash
gcloud compute instance-templates create web-template \
  --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud \
  --tags=http-server --service-account=web-sa@myapp-prod.iam.gserviceaccount.com

gcloud compute instance-groups managed create web-mig \
  --base-instance-name=web --template=web-template --size=2 \
  --zone=us-central1-a

gcloud compute instance-groups managed set-autoscaling web-mig \
  --zone=us-central1-a --max-num-replicas=10 --min-num-replicas=2 \
  --target-cpu-utilization=0.6
```

**Regional MIG** — spread across zones in a region for HA.

## What is Cloud Run?

**Cloud Run** — fully managed serverless **containers** — scale to zero; pay per request + CPU/memory time.

| Feature | Detail |
|---------|--------|
| **Any language** | Container image (Docker/OCI) |
| **Concurrency** | Many requests per instance |
| **Min instances** | 0 (cold start) or warm pool |
| **VPC connector** | Reach private RDS, Memorystore |
| **Invoked by** | HTTP, Pub/Sub, Eventarc |

```bash
gcloud run deploy myapi \
  --image=us-central1-docker.pkg.dev/myapp-prod/repo/myapi:v1 \
  --region=us-central1 \
  --allow-unauthenticated \
  --service-account=run-sa@myapp-prod.iam.gserviceaccount.com \
  --set-env-vars=ENV=prod
```

```csharp
// ASP.NET Core on Cloud Run — same container as anywhere
// Dockerfile: FROM mcr.microsoft.com/dotnet/aspnet:8.0
```

**Cloud Run vs Cloud Functions:** Run = container; Functions = single-function deploy (2nd gen runs on Cloud Run infrastructure).

## What is Google Kubernetes Engine (GKE)?

**GKE** — managed Kubernetes; Google invented K8s.

| Mode | Description |
|------|-------------|
| **Autopilot** | Google manages nodes — pay per pod resources |
| **Standard** | You manage node pools — more control |

```bash
gcloud container clusters create prod-cluster \
  --region=us-central1 \
  --num-nodes=1 --enable-autoscaling --min-nodes=1 --max-nodes=10 \
  --workload-pool=myapp-prod.svc.id.goog

gcloud container clusters get-credentials prod-cluster --region=us-central1
kubectl get nodes
```

**Workload Identity** — K8s service account maps to Google service account — no key files.

## What is Cloud Functions (2nd gen)?

**Cloud Functions (Gen 2)** — event-driven functions built on Cloud Run.

| Trigger | Source |
|---------|--------|
| **HTTP** | Direct invoke |
| **Pub/Sub** | Message publish |
| **Cloud Storage** | Object finalize |
| **Firestore** | Document write |
| **Eventarc** | 90+ event sources |

```python
import functions_framework

@functions_framework.cloud_event
def process_gcs(cloud_event):
    data = cloud_event.data
    bucket = data["bucket"]
    name = data["name"]
    print(f"New file: gs://{bucket}/{name}")
```

```bash
gcloud functions deploy process_upload --gen2 --runtime=python312 \
  --region=us-central1 --source=. --entry-point=process_gcs \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=uploads-prod"
```

Max timeout 60 minutes (gen 2) — longer than AWS Lambda default.

## What is App Engine?

**App Engine** — original Google PaaS (Standard and Flexible environments).

| Environment | Detail |
|-------------|--------|
| **Standard** | Sandboxed runtimes; fast scale; limited language versions |
| **Flexible** | Docker-based; more control |

**New projects:** prefer **Cloud Run** unless App Engine features required (traffic splitting built-in historically).

## What are preemptible and Spot VMs?

| Type | Behavior | Discount |
|------|----------|----------|
| **Spot VM** | Can be preempted with 30s notice | Up to ~91% |
| **Preemptible (legacy term)** | Same concept | |

Use for **fault-tolerant batch**, CI workers, stateless MIG with backup capacity — not single-instance prod.

```bash
gcloud compute instances create batch-worker --preemptible --machine-type=n2-standard-4
```

## How do you connect to VMs securely?

| Method | Description |
|--------|-------------|
| **IAP TCP forwarding** | SSH/RDP through Identity-Aware Proxy — no public IP |
| **OS Login** | IAM controls who can SSH |
| **Serial console** | Emergency access when networking broken |

```bash
gcloud compute ssh web-01 --zone=us-central1-a --tunnel-through-iap
```

Requires firewall rule allowing IAP range `35.235.240.0/20` → tag `ssh`.

## How does GCP compute integrate with load balancing?

```text
Internet → Global/external HTTP(S) LB → Backend service → MIG / NEG (Cloud Run, GKE)
Internal traffic → Internal HTTP(S) LB or TCP/UDP LB
```

**Network Endpoint Groups (NEG):** connect LB to Cloud Run, GKE pods, or serverless.

See **Google Cloud Load Balancing and CDN.md**.

## What is Batch and Compute Engine for HPC?

**Batch** — schedule batch jobs on Compute Engine or via workflows.

Use **HPC-ready machine types** + **Placement policies** for low-latency MPI workloads.

## Related Topics

- **Google Cloud Networking.md** — VPC, firewall rules
- **Google Cloud Load Balancing and CDN.md** — HTTP(S) LB
- **Kubernetes/Kubernetes Basics.md** — GKE concepts
- **AWS/AWS Compute.md** — comparison
