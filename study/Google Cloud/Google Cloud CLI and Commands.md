# Google Cloud CLI and Commands

## Questions Covered

1. How do you install and authenticate with gcloud?
2. What are projects, configurations, and Application Default Credentials?
3. What are essential Compute Engine commands?
4. What are essential Cloud Storage (gsutil/gcloud storage) commands?
5. What are essential IAM commands?
6. What are essential Cloud Run and GKE commands?
7. What are essential Pub/Sub commands?
8. How do you deploy with Terraform vs gcloud?
9. How do you use gcloud in CI/CD?
10. What are useful output and filtering tips?
11. How do you troubleshoot gcloud errors?
12. What is Cloud Shell?

## How do you install and authenticate with gcloud?

```bash
# Windows (winget)
winget install Google.CloudSDK

# Initialize
gcloud init
gcloud auth login
gcloud auth application-default login   # ADC for SDKs locally

# Set project
gcloud config set project myapp-prod
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a

# Verify
gcloud auth list
gcloud config list
```

**Service account in CI:**

```bash
gcloud auth activate-service-account --key-file=sa-key.json   # avoid keys — use WIF instead
```

Prefer **Workload Identity Federation** from GitHub Actions — no long-lived keys.

## What are projects, configurations, and Application Default Credentials?

```bash
# Named configurations (like AWS profiles)
gcloud config configurations create prod
gcloud config configurations activate prod
gcloud config set project myapp-prod

gcloud config configurations list
```

**ADC** — libraries (`google-cloud-storage`, .NET `Google.Cloud.*`) auto-find credentials: metadata server on GCE/Run/GKE, or `application-default login` locally.

## What are essential Compute Engine commands?

```bash
# Instances
gcloud compute instances create web-01 --zone=us-central1-a --machine-type=e2-medium \
  --subnet=prod-subnet --no-address --tags=http-server

gcloud compute instances list
gcloud compute instances stop web-01 --zone=us-central1-a
gcloud compute instances delete web-01 --zone=us-central1-a --quiet

# SSH via IAP
gcloud compute ssh web-01 --zone=us-central1-a --tunnel-through-iap

# MIG
gcloud compute instance-groups managed list --zones=us-central1-a
gcloud compute instance-groups managed resize web-mig --size=5 --zone=us-central1-a

# Firewall
gcloud compute firewall-rules create allow-health-checks \
  --network=prod-vpc --action=ALLOW --rules=tcp:8080 \
  --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=app
```

## What are essential Cloud Storage (gsutil/gcloud storage) commands?

```bash
# Modern gcloud storage (preferred) or gsutil
gcloud storage buckets create gs://myapp-prod-uploads --location=us-central1
gcloud storage cp report.pdf gs://myapp-prod-uploads/reports/
gcloud storage rsync ./dist gs://myapp-prod-uploads/app/ --recursive
gcloud storage ls gs://myapp-prod-uploads/**

# IAM
gcloud storage buckets add-iam-policy-binding gs://myapp-prod-uploads \
  --member=serviceAccount:run-sa@myapp-prod.iam.gserviceaccount.com \
  --role=roles/storage.objectAdmin

# Signed URL
gcloud storage sign-url gs://myapp-prod-uploads/report.pdf --duration=1h
```

## What are essential IAM commands?

```bash
gcloud projects get-iam-policy myapp-prod
gcloud projects add-iam-policy-binding myapp-prod \
  --member=user:admin@contoso.com --role=roles/viewer

gcloud iam service-accounts create run-sa --display-name="Cloud Run SA"
gcloud iam service-accounts keys list --iam-account=run-sa@myapp-prod.iam.gserviceaccount.com

# Test permissions
gcloud projects get-iam-policy myapp-prod --flatten="bindings[].members" \
  --filter="bindings.members:run-sa@myapp-prod.iam.gserviceaccount.com"
```

## What are essential Cloud Run and GKE commands?

```bash
# Cloud Run
gcloud run deploy myapi --source=. --region=us-central1 --allow-unauthenticated
gcloud run services list --region=us-central1
gcloud run services describe myapi --region=us-central1
gcloud run revisions list --service=myapi --region=us-central1
gcloud run services logs read myapi --region=us-central1

# GKE
gcloud container clusters create-auto prod-cluster --region=us-central1
gcloud container clusters get-credentials prod-cluster --region=us-central1
kubectl get pods -A
```

## What are essential Pub/Sub commands?

```bash
gcloud pubsub topics create order-events
gcloud pubsub subscriptions create inventory-sub --topic=order-events --ack-deadline=60
gcloud pubsub topics publish order-events --message='{"orderId":"1"}'
gcloud pubsub subscriptions pull inventory-sub --auto-ack --limit=5
```

## How do you deploy with Terraform vs gcloud?

| | gcloud | Terraform |
|---|--------|-----------|
| **Use** | Quick ops, scripts, tutorials | Production IaC, drift detection |
| **State** | None | Remote state (GCS backend) |

```hcl
terraform {
  backend "gcs" {
    bucket = "myapp-terraform-state"
    prefix = "prod"
  }
}
```

```bash
gcloud deployment-manager deployments create vpc --config network.yaml  # legacy native IaC
```

## How do you use gcloud in CI/CD?

```yaml
# GitHub Actions — Workload Identity Federation (recommended)
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: projects/123/locations/global/workloadIdentityPools/pool/providers/github
    service_account: ci-sa@myapp-prod.iam.gserviceaccount.com

- uses: google-github-actions/setup-gcloud@v2

- run: gcloud run deploy myapi --image=$IMAGE --region=us-central1 --quiet
```

```yaml
# Cloud Build (native GCP CI)
steps:
  - name: gcr.io/cloud-builders/docker
    args: ['build', '-t', 'us-central1-docker.pkg.dev/$PROJECT_ID/repo/myapi:$SHORT_SHA', '.']
  - name: gcr.io/cloud-builders/gcloud
    args: ['run', 'deploy', 'myapi', '--image=...', '--region=us-central1']
```

## What are useful output and filtering tips?

```bash
# Format
gcloud compute instances list --format="table(name,zone,machineType.basename(),status)"
gcloud compute instances list --format=json | jq '.[].name'

# Filter
gcloud compute instances list --filter="status=RUNNING AND labels.env=prod"

# Export to file
gcloud projects get-iam-policy myapp-prod --format=json > iam-policy.json
```

## How do you troubleshoot gcloud errors?

| Error | Fix |
|-------|-----|
| **PERMISSION_DENIED** | Check IAM role; `gcloud auth list` |
| **API not enabled** | `gcloud services enable run.googleapis.com` |
| **Quota exceeded** | Request quota increase; check region limits |
| **Billing not enabled** | Link billing account to project |
| **Wrong project** | `gcloud config get-value project` |

```bash
gcloud services list --enabled
gcloud logging read "severity>=ERROR" --limit=20 --project=myapp-prod
```

## What is Cloud Shell?

**Cloud Shell** — free ephemeral VM in browser with gcloud, kubectl, 5 GB home persistence.

| Use | Quick admin without local install |
|-----|-----------------------------------|

Not for production CI — use Cloud Build or GitHub Actions with WIF.

## Related Topics

- **Google Cloud Basics.md** — projects, regions
- **Google Cloud Compute.md** — GCE, Cloud Run details
- **Google Cloud Identity and IAM.md** — roles, service accounts
- **AWS/AWS CLI and Commands.md** · **Azure Cloud 1/Azure Commands and CLI.md**
