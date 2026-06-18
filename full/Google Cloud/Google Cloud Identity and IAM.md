# Google Cloud Identity and IAM

## Questions Covered

1. What is Cloud IAM, and how does authorization work?
2. What are principals, roles, and policies?
3. What is the difference between basic, predefined, and custom roles?
4. What are service accounts, and how do you use them securely?
5. What is Workload Identity for GKE?
6. What is Identity-Aware Proxy (IAP)?
7. How does Firebase Auth / Identity Platform differ from Cloud IAM?
8. What is the principle of least privilege on GCP?
9. What are organization policies?
10. How does IAM integrate with Cloud Run and Compute Engine?
11. What is workforce identity federation?
12. How do you secure API access with IAM and OAuth?

## What is Cloud IAM, and how does authorization work?

**Cloud IAM** — unified identity and access management for all GCP resources.

| Term | Description |
|------|-------------|
| **Principal** | Who — user, group, service account, domain |
| **Role** | Collection of permissions |
| **Policy** | Binding of role → principal on resource |
| **Permission** | `service.resource.verb` (e.g. `storage.objects.get`) |

```bash
gcloud projects add-iam-policy-binding myapp-prod \
  --member="user:admin@contoso.com" --role="roles/viewer"

gcloud storage buckets add-iam-policy-binding gs://myapp-prod-uploads \
  --member="serviceAccount:run-sa@myapp-prod.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"
```

**Deny policies** (preview/org feature) — explicit deny overrides allow.

## What are principals, roles, and policies?

```text
Policy on resource (project, bucket, dataset):
  bindings:
    - role: roles/storage.objectViewer
      members:
        - user:alice@contoso.com
        - serviceAccount:app@myapp-prod.iam.gserviceaccount.com
```

| Role type | Example |
|-----------|---------|
| **Basic** | Owner, Editor, Viewer — **avoid** except Viewer |
| **Predefined** | `roles/run.invoker`, `roles/cloudsql.client` |
| **Custom** | Org-specific least-privilege bundle |

**Resource hierarchy inheritance:** org → folder → project → resource — policy additive (union of grants).

## What is the difference between basic, predefined, and custom roles?

| | Basic | Predefined | Custom |
|---|-------|------------|--------|
| **Granularity** | Coarse (Editor = broad write) | Service-specific | Exact permissions you choose |
| **Recommendation** | Avoid Editor/Owner for daily use | **Preferred** | When predefined too broad |

```bash
gcloud iam roles create objectReaderCustom --project=myapp-prod \
  --title="Object Reader Custom" --permissions=storage.objects.get,storage.objects.list
```

Use **IAM Recommender** — suggests permission reductions from 90-day usage.

## What are service accounts, and how do you use them securely?

**Service account (SA)** — identity for applications and VMs — not for humans.

| Rule | Why |
|------|-----|
| **Dedicated SA per app** | Blast radius isolation |
| **No user-managed keys** | Keys don't expire automatically — leak risk |
| **Use attached SA** | GCE, Cloud Run, GKE Workload Identity |
| **Short-lived credentials** | OAuth token via metadata server |

```bash
gcloud iam service-accounts create run-sa --display-name="Cloud Run SA"
gcloud run services update myapi --service-account=run-sa@myapp-prod.iam.gserviceaccount.com
```

```csharp
// ADC on Cloud Run — automatic
var storage = StorageClient.Create(); // uses run-sa credentials
```

If you must create keys — rotate and store in **Secret Manager** — treat as emergency only.

## What is Workload Identity for GKE?

Maps **Kubernetes service account** → **Google service account** — pods get GCP credentials without key files.

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: my-app-ksa
  annotations:
    iam.gke.io/gcp-service-account: gke-app@myapp-prod.iam.gserviceaccount.com
```

```bash
gcloud iam service-accounts add-iam-policy-binding gke-app@myapp-prod.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:myapp-prod.svc.id.goog[default/my-app-ksa]"
```

Equivalent to **AWS IRSA** and **Azure Workload Identity**.

## What is Identity-Aware Proxy (IAP)?

**IAP** — Google-managed authorization layer for **HTTPS apps** — zero-trust access without VPN.

```text
User → IAP (Google login + IAM check) → Cloud Run / GCE / GKE backend
```

| Use | Access internal admin tools without public auth bypass |
|-----|------------------------------------------------------|

Enable IAP on backend service; grant `roles/iap.httpsResourceAccessor` to authorized users/groups.

Also used for **IAP TCP forwarding** (SSH/RDP without public IP).

## How does Firebase Auth / Identity Platform differ from Cloud IAM?

| | Cloud IAM | Identity Platform / Firebase Auth |
|---|-----------|-----------------------------------|
| **Users** | Employees, SAs | **App end users** |
| **Protocols** | GCP API auth | OIDC, SAML, email/password, social |
| **Tokens** | OAuth tokens for Google APIs | Firebase JWT for your app |

```text
Engineer deploys to GCP     → Cloud IAM
Customer logs into your app → Identity Platform → JWT → Cloud Run (verify token)
```

**Identity Platform** — enterprise Firebase Auth on GCP (SLA, multi-tenant, SAML).

## What is the principle of least privilege on GCP?

| Practice | Tool |
|----------|------|
| **Predefined roles** | Not `roles/editor` |
| **Resource-level IAM** | Bucket/dataset scope |
| **IAM Conditions** | `request.time`, resource name prefix |
| **Regular audits** | Policy Analyzer, Asset Inventory |
| **Break-glass accounts** | Minimal Owner accounts with MFA |

```json
{
  "role": "roles/storage.objectViewer",
  "members": ["user:contractor@partner.com"],
  "condition": {
    "title": "temp_access",
    "expression": "request.time < timestamp('2025-12-31T23:59:59Z')"
  }
}
```

## What are organization policies?

**Organization policies** — constraints on resources (boolean or list).

| Constraint example | Effect |
|--------------------|--------|
| `constraints/compute.vmExternalIpAccess` | Deny external IPs on VMs |
| `constraints/iam.disableServiceAccountKeyCreation` | No downloadable SA keys |
| `constraints/storage.uniformBucketLevelAccess` | Require uniform access |

Applied at org/folder/project — use for guardrails across all projects.

## How does IAM integrate with Cloud Run and Compute Engine?

| Service | Integration |
|---------|-------------|
| **Cloud Run** | `--service-account` — identity for GCP API calls |
| **Cloud Run invoker** | `roles/run.invoker` — who can call service |
| **Compute Engine** | Attached service account — scopes or full cloud-platform |
| **Cloud Functions** | Runtime SA per function |

```bash
# Public API — allow unauthenticated (careful)
gcloud run services add-iam-policy-binding myapi --member=allUsers --role=roles/run.invoker

# Private API — only specific SA
gcloud run services add-iam-policy-binding myapi \
  --member=serviceAccount:frontend@myapp-prod.iam.gserviceaccount.com \
  --role=roles/run.invoker
```

Prefer **authenticated invokers** + **API Gateway** or **LB + IAP** for user-facing apps.

## What is workforce identity federation?

**Workforce Identity Federation** — let external identities (Entra ID, Okta) access GCP without Google accounts.

```text
Employee @ Entra ID → federated login → short-lived GCP credentials → access BigQuery
```

Similar to **AWS IAM Identity Center** / **Azure external identity** for workforce.

## How do you secure API access with IAM and OAuth?

| Pattern | Use |
|---------|-----|
| **Cloud Run + IAM** | Bearer token from gcloud or SA — service-to-service |
| **API Gateway** | JWT validation, API keys |
| **Apigee** | Enterprise API management (like Azure APIM) |
| **End-user JWT** | Identity Platform / Firebase verify in app |

```csharp
// Verify Google ID token or Firebase JWT in ASP.NET Core
// Use Google.Apis.Auth for validation
```

For user-facing APIs on GCP, verify **OIDC JWT** audience matches your service.

## Related Topics

- **Google Cloud Security and Monitoring.md** — Cloud Audit Logs, VPC SC
- **Google Cloud API Gateway.md** — API auth at gateway
- **AWS/AWS Identity and IAM.md** · **Azure Cloud/Azure Identity and Entra ID.md**
- **Security/Authentication and Identity.md**
