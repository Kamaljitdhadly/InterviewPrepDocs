# Cloud and Infrastructure Security

## Questions Covered

1. What is the cloud shared responsibility model?
2. How do IAM and least privilege work in the cloud?
3. How should you manage secrets — Key Vault, environment variables, and alternatives?
4. What are network security groups and how does network segmentation help?
5. What is a WAF and what problems does it solve?
6. What are the basics of DDoS mitigation in the cloud?
7. What Azure security services should you know for interviews?
8. What are container and Kubernetes security basics at the infrastructure level?

## What is the cloud shared responsibility model?

Security is split between provider and customer; the line shifts with IaaS / PaaS / SaaS.

```
                    CUSTOMER MANAGES
                    ─────────────────────────────────────
IaaS (VMs)          | OS, apps, data, identity, network config
                    |─────────────────────────────────────
PaaS (App Service)  | Apps, data, access control, some networking
                    |─────────────────────────────────────
SaaS (M365)         | Data classification, users, device access
                    ─────────────────────────────────────
                    PROVIDER MANAGES
                    Physical DC, hypervisor, host patching (varies),
                    core platform availability
```

| Layer | IaaS (e.g. Azure VM) | PaaS (e.g. App Service) | SaaS (e.g. Exchange Online) |
|-------|----------------------|-------------------------|-----------------------------|
| Data & classification | Customer | Customer | Customer |
| Application | Customer | Customer | Shared |
| Identity & access | Customer | Customer | Customer |
| OS / runtime | Customer | Provider | Provider |
| Network controls | Customer | Shared | Provider |
| Physical security | Provider | Provider | Provider |

**Customer:** data, access policies, misconfig risk. **Provider:** physical DC, hypervisor. **Mistakes:** public blobs, open RDP/SSH, default creds, unpatched IaaS OS.

## How do IAM and least privilege work in the cloud?

IAM = **who** can do **what** on **which resources** under **which conditions**. Least privilege = minimum rights, shortest duration, strong auth.

| Concept | Azure example | Purpose |
|---------|---------------|---------|
| Identity | User, group, service principal, managed identity | Who is calling |
| Role definition | e.g. `Storage Blob Data Reader` | Bundle of allowed actions |
| Role assignment | Principal + role + scope | Grant at subscription/RG/resource |
| Scope | Management group → subscription → RG → resource | Limit blast radius |
| Conditional access | MFA, compliant device, location | Risk-based gates |
| PIM / JIT | Privileged Identity Management | Just-in-time admin elevation |

```
                    ┌─────────────────────────┐
                    │   Subscription          │
                    │  ┌───────────────────┐  │
                    │  │ Resource Group    │  │
                    │  │  ┌─────────────┐  │  │
                    │  │  │ Storage acct│  │  │
                    │  │  │ [assignment]│  │  │
                    │  │  └─────────────┘  │  │
                    │  └───────────────────┘  │
                    └─────────────────────────┘
         assignment at narrowest practical scope
```

**Managed identities** — no embedded creds for App Service, AKS, Functions.

```bash
# List role assignments for a resource group
az role assignment list --resource-group myapp-rg -o table

# Assign read-only blob access to a managed identity at one storage account
az role assignment create \
  --assignee-object-id <managed-identity-object-id> \
  --role "Storage Blob Data Reader" \
  --scope /subscriptions/<sub>/resourceGroups/myapp-rg/providers/Microsoft.Storage/storageAccounts/myappdata

# Create service principal with contributor on ONE resource group (avoid subscription-wide)
az ad sp create-for-rbac --name "ci-myapp" --role contributor \
  --scopes /subscriptions/<sub>/resourceGroups/myapp-rg
```

Narrow scope, MFA + PIM, federated CI/CD OIDC. Avoid subscription Owner for devs and shared account keys.

## How should you manage secrets — Key Vault, environment variables, and alternatives?

Never commit secrets to Git or bake into images.

| Approach | Pros | Cons | Best for |
|----------|------|------|----------|
| **Azure Key Vault** | RBAC, audit logs, HSM option, rotation hooks, references from App Service/AKS | Latency, cost, must wire identity | Production apps, certs, CMK |
| **Environment variables** | Simple, 12-factor friendly | Visible to anyone with shell/exec on host; easy to leak in dumps | Non-prod, bootstrap only |
| **Managed secrets (K8s Secrets)** | Native to orchestrator | Base64 ≠ encrypted by default; etcd encryption at rest required | In-cluster config with caution |
| **CI/CD secret store** | Pipeline variables, GitHub secrets | Scoped to build; not runtime | Deploy-time injection |
| **Hardware / HSM** | Highest assurance | Cost, complexity | Keys under compliance regimes |

```
App (managed identity) ──► Key Vault ──► get secret / cert
                │
                └──► App Configuration (non-secret settings) + Key Vault references
```

```bash
# Create vault with RBAC (preferred over access policies for new setups)
az keyvault create --name myapp-kv --resource-group myapp-rg \
  --location eastus --enable-rbac-authorization true

# Store a secret
az keyvault secret set --vault-name myapp-kv --name "SqlConnectionString" \
  --value "Server=...;User Id=...;Password=...;"

# Grant app managed identity access (Key Vault Secrets User)
az role assignment create --assignee <principal-id> \
  --role "Key Vault Secrets User" \
  --scope $(az keyvault show -n myapp-kv --query id -o tsv)

# App Service Key Vault reference (app settings)
# @Microsoft.KeyVault(SecretUri=https://myapp-kv.vault.azure.net/secrets/SqlConnectionString/)
```

Env vars only when injected from vault at deploy. K8s: **Secrets Store CSI** + Key Vault.

## What are network security groups and how does network segmentation help?

**NSGs** — stateful L3/L4 allow/deny on subnet or NIC (source/dest IP, port, priority).

```
Internet ──X──► [NSG: deny inbound except 443] ──► App subnet
                                                      │
                        [NSG: allow 443 from app only]▼
                                                 Data subnet (SQL)
```

| Priority | Name | Direction | Source | Dest | Port | Action |
|----------|------|-----------|--------|------|------|--------|
| 100 | AllowHttpsInbound | Inbound | Internet | AppSubnet | 443 | Allow |
| 200 | DenyRdpInbound | Inbound | * | * | 3389 | Deny |
| 100 | AllowSqlFromApp | Inbound | AppSubnet | DbSubnet | 1433 | Allow |

```bash
# Create NSG and rule allowing HTTPS from Internet
az network nsg create --resource-group myapp-rg --name app-nsg
az network nsg rule create --resource-group myapp-rg --nsg-name app-nsg \
  --name AllowHttps --priority 100 --direction Inbound --access Allow \
  --protocol Tcp --destination-port-range 443 --source-address-prefix Internet \
  --destination-address-prefix VirtualNetwork

# Associate NSG with subnet
az network vnet subnet update --resource-group myapp-rg --vnet-name myapp-vnet \
  --name app-subnet --network-security-group app-nsg
```

Hub-spoke, private endpoints, ASGs. NSGs ≠ WAF — add L7 and identity controls.

## What is a WAF and what problems does it solve?

**WAF** inspects HTTP/HTTPS (L7) and blocks OWASP-class attacks before origin.

```
Client ──► [ DDoS edge ] ──► [ WAF ] ──► App Gateway / ALB / CDN origin
                              │
                    OWASP CRS rules, bot control,
                    geo filter, rate limits, custom rules
```

| Threat | Example | WAF action |
|--------|---------|------------|
| SQL injection | `' OR 1=1--` in query string | Block / log |
| XSS | `<script>` in form field | Block |
| Path traversal | `../../etc/passwd` | Block |
| Bad bots | credential stuffing, scraping | Challenge / block |
| Protocol abuse | oversized headers, verb tampering | Block |

**Azure WAF:** Application Gateway WAF_v2 (regional) or Front Door WAF (global edge). API Management policies complement rate limit and JWT checks.

```bash
# Create WAF policy (Application Gateway)
az network application-gateway waf-policy create \
  --resource-group myapp-rg --name myapp-waf-policy

# Set OWASP 3.2 managed rule set (example)
az network application-gateway waf-policy managed-rule rule-set add \
  --resource-group myapp-rg --policy-name myapp-waf-policy \
  --type OWASP --version 3.2

# Custom rule: block if query string contains obvious SQLi pattern (simplified)
az network application-gateway waf-policy custom-rule create \
  --resource-group myapp-rg --policy-name myapp-waf-policy \
  --name BlockSqlInQuery --priority 10 --rule-type MatchRule \
  --match-variables QueryString --operator Contains --match-values "UNION SELECT" \
  --action Block
```

Detection vs Prevention modes. WAF complements secure coding — not a replacement.

## What are the basics of DDoS mitigation in the cloud?

**DDoS** exhausts bandwidth, connections, or CPU via volumetric, protocol, or application floods.

| Type | Layer | Example |
|------|-------|---------|
| Volumetric | L3/L4 | UDP/ICMP floods, amplification (DNS, NTP) |
| Protocol | L3/L4 | SYN floods, fragmented packets |
| Application | L7 | HTTP floods, slowloris, expensive API calls |

```
Attacker botnet
      │
      ▼
[ ISP / cloud edge scrubbing ]  ← Azure DDoS Protection, CDN absorption
      │
      ▼
[ WAF + rate limiting ]         ← L7 patterns, geo block
      │
      ▼
[ Auto-scale + connection limits ] ← origin survival
      │
      ▼
[ Origin app / API ]
```

**Azure DDoS Basic** (free, all public IPs) vs **Standard** (VNet-attached, telemetry, cost guarantee).

```bash
# Enable DDoS Protection Standard on a VNet (requires DDoS plan resource)
az network ddos-protection create --resource-group myapp-rg --name myapp-ddos
az network vnet update --resource-group myapp-rg --name myapp-vnet \
  --ddos-protection-plan $(az network ddos-protection show -g myapp-rg -n myapp-ddos --query id -o tsv)
```

CDN/Front Door, WAF, autoscale, playbooks — defense in depth.

## What Azure security services should you know for interviews?

| Service | Role |
|---------|------|
| **Microsoft Defender for Cloud** | CSPM, secure score, threat detection |
| **Microsoft Entra ID** | Identity, MFA, conditional access |
| **Key Vault** | Secrets, keys, certificates |
| **NSG / Azure Firewall / Private Link** | Network filtering and private PaaS |
| **WAF / DDoS Protection** | L7 filtering, volumetric mitigation |
| **Microsoft Sentinel** | SIEM / SOAR |
| **Azure AD PIM** | JIT privileged access |
| **Managed identities** | Passwordless workload auth |

```
                         ┌─────────────────────┐
                         │   Entra ID + PIM    │
                         │   MFA, Conditional  │
                         └──────────┬──────────┘
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
    ▼                               ▼                               ▼
Defender for Cloud            Key Vault                      Sentinel
(CSPM, alerts)            (secrets/certs)                  (SIEM/SOAR)
    │                               │
    ▼                               ▼
NSG / Firewall / Private Link / WAF / DDoS ──► Workloads (VM, AKS, PaaS)
```

```bash
# Enable Defender plan for servers (example)
az security pricing create --name VirtualMachines --tier Standard

# Query secure score recommendations
az security assessment list --resource-group myapp-rg -o table

# Diagnostic settings: send Key Vault logs to Log Analytics
az monitor diagnostic-settings create --name kv-audit \
  --resource $(az keyvault show -n myapp-kv --query id -o tsv) \
  --logs '[{"category":"AuditEvent","enabled":true}]' \
  --workspace $(az monitor log-analytics workspace show -g myapp-rg -n myapp-law --query id -o tsv)
```

Defender finds misconfigs; Sentinel correlates; managed identity removes long-lived keys.

## What are container and Kubernetes security basics at the infrastructure level?

Focus on cluster hardening and blast radius — not only Dockerfile `USER`.

Trusted images, CI scan, digest pins, signing. **AKS:** private cluster, Azure AD RBAC, network policies, PSA restricted, Key Vault CSI, node auto-upgrade.

```
                    ┌──────────────────────────────────┐
                    │  Azure AD / Workload Identity    │
                    └───────────────┬──────────────────┘
                                    │
Internet ──► [Ingress + WAF] ──► [Network Policy] ──► Pods
                    │                    │
                    │              deny east-west
                    │              except allowed NS
                    ▼
              Private API server (private cluster)
```

```bash
# AKS: enable Azure AD + managed identity (create example)
az aks create --resource-group myapp-rg --name myapp-aks \
  --enable-aad --enable-azure-rbac \
  --network-plugin azure --network-policy azure \
  --enable-private-cluster --node-count 3

# Apply default-deny network policy in namespace (conceptual manifest)
kubectl apply -f - <<'EOF'
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: production
spec:
  podSelector: {}
  policyTypes:
  - Ingress
EOF

# Pod security: restricted namespace label
kubectl label namespace production \
  pod-security.kubernetes.io/enforce=restricted \
  pod-security.kubernetes.io/audit=restricted \
  pod-security.kubernetes.io/warn=restricted
```

No privileged pods by default; read-only root FS; OPA/Azure Policy admission.

| Platform team | App team |
|---------------|----------|
| Private cluster, network policy, WAF ingress | Non-root, no secrets in image |
| Workload identity → Key Vault | Patch dependencies |

## Related Topics

- Kubernetes Controllers and Security
- Azure Networking, Azure Active Directory
- Docker Container Lifecycle
- Microservices Security
- Cryptography and TLS
