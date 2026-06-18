# Azure Security and Monitoring

## Questions Covered

1. What is the Azure shared responsibility model?
2. What is Azure Key Vault, and how do you use it?
3. What is Microsoft Defender for Cloud?
4. What is Azure DDoS Protection?
5. What is Azure Monitor, and what does it include?
6. What is Application Insights?
7. What are Log Analytics workspaces?
8. What are Azure alerts and action groups?
9. What is Azure Policy vs Azure RBAC?
10. How do you implement defense in depth on Azure?
11. What is Azure Backup and Site Recovery?
12. How do you monitor costs and set budgets?

## What is the Azure shared responsibility model?

| Area | IaaS (VM) | PaaS (App Service) | SaaS (M365) |
|------|-----------|-------------------|-------------|
| **Data** | Customer | Customer | Customer |
| **Apps** | Customer | Customer | — |
| **OS / runtime** | Customer | Microsoft | Microsoft |
| **Network controls** | Shared | Shared | Microsoft |
| **Physical security** | Microsoft | Microsoft | Microsoft |

```text
You always own: data, access management, endpoints, compliance choices
Microsoft owns: physical datacenter, host OS (PaaS), hypervisor
```

**Interview:** Higher abstraction = **more Microsoft responsibility**, but **you still own data and identity**.

## What is Azure Key Vault, and how do you use it?

**Key Vault** — secure storage for secrets, keys, and certificates.

| Object type | Use |
|-------------|-----|
| **Secrets** | Connection strings, API keys |
| **Keys** | Encryption keys (CMK for storage, SQL) |
| **Certificates** | SSL/TLS certs for App Service, AGW |

```bash
az keyvault create --name kv-myapp-prod --resource-group rg-prod --location eastus

az keyvault secret set --vault-name kv-myapp-prod --name SqlConnectionString \
  --value "Server=...;Database=...;"

# Grant App Service managed identity access
az keyvault set-policy --name kv-myapp-prod \
  --object-id <managed-identity-principal-id> \
  --secret-permissions get list
```

```csharp
// ASP.NET Core — Key Vault configuration provider
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://kv-myapp-prod.vault.azure.net/"),
    new DefaultAzureCredential());

// Reference in appsettings: @Microsoft.KeyVault(SecretUri=...)
var conn = builder.Configuration["SqlConnectionString"];
```

**Best practices:** soft delete + purge protection enabled; private endpoint; no secrets in source code or ARM parameters (use Key Vault references).

## What is Microsoft Defender for Cloud?

**Defender for Cloud** — unified security posture management and threat protection.

| Plan | Protects |
|------|----------|
| **CSPM (free tier)** | Secure score, recommendations, compliance dashboards |
| **Defender for Servers** | VM/agentless vulnerability scanning, EDR |
| **Defender for App Service** | Threat detection on web apps |
| **Defender for Storage** | Unusual access patterns, malware upload |
| **Defender for SQL** | SQL injection, anomalous queries |
| **Defender for Containers** | AKS, ACR image scanning |

```bash
az security pricing create --name VirtualMachines --tier Standard
```

**Secure Score** — prioritized recommendations (NSG rules, MFA, encryption). Review weekly.

## What is Azure DDoS Protection?

| Tier | Coverage |
|------|----------|
| **Basic** | Free — automatic protection for Azure edge (all services) |
| **Standard** | Enhanced mitigation, telemetry, cost protection guarantee |

Enable **DDoS Network Protection** on VNet for public-facing apps with **Standard** tier when SLA/compliance requires advanced mitigation and attack analytics.

Pair with **WAF** (Application Gateway / Front Door) for L7 attack filtering.

## What is Azure Monitor, and what does it include?

**Azure Monitor** — unified observability platform for metrics, logs, and traces.

| Component | Data type |
|-----------|-----------|
| **Metrics** | Numeric time-series (CPU, requests, latency) — 1-min granularity |
| **Logs** | Structured log data in Log Analytics |
| **Alerts** | Rule-based notifications |
| **Dashboards** | Grafana, workbooks, Portal dashboards |
| **VM Insights / Container Insights** | Infrastructure monitoring |

```bash
# Query metrics
az monitor metrics list --resource $(az webapp show -g rg-prod -n myapi-prod --query id -o tsv) \
  --metric "Requests" --interval PT1H
```

```kusto
// Log Analytics (KQL) — failed requests last hour
AppRequests
| where TimeGenerated > ago(1h)
| where Success == false
| summarize count() by ResultCode, Name
| order by count_ desc
```

## What is Application Insights?

**Application Insights** — APM for applications (part of Azure Monitor).

| Feature | Detail |
|---------|--------|
| **Request tracking** | HTTP dependency map, latency |
| **Exceptions** | Stack traces, frequency |
| **Dependencies** | SQL, HTTP, Redis call tracking |
| **Live Metrics** | Real-time stream |
| **Smart Detection** | Anomaly alerts (failure rate spike) |
| **Distributed tracing** | Correlation across microservices |

```csharp
// ASP.NET Core — Program.cs
builder.Services.AddApplicationInsightsTelemetry();

// Custom event
_telemetry.TrackEvent("OrderPlaced", new Dictionary<string, string>
{
    ["OrderId"] = order.Id,
    ["Amount"] = order.Total.ToString("F2"),
});

// Custom metric
_telemetry.GetMetric("OrdersProcessed").TrackValue(1);
```

Connect to **Log Analytics workspace** for cross-app KQL queries and long retention.

## What are Log Analytics workspaces?

**Log Analytics workspace** — central repository for logs from Azure resources, agents, and custom apps.

```bash
az monitor log-analytics workspace create --resource-group rg-prod \
  --workspace-name log-myapp-prod
```

**Data sources:**

- App Service / Function logs
- Activity Log (control plane audit)
- Diagnostic settings from any resource
- Azure AD sign-in logs (P1/P2)
- Custom logs via API

```kusto
// Cross-resource query
AzureActivity
| where OperationNameValue == "Microsoft.Resources/deployments/write"
| where ActivityStatusValue == "Failed"
| project TimeGenerated, Caller, ResourceGroup, Status
```

## What are Azure alerts and action groups?

```bash
# Metric alert — CPU > 80% for 5 min
az monitor metrics alert create --name vm-high-cpu --resource-group rg-prod \
  --scopes $(az vm show -g rg-prod -n vm-web-01 --query id -o tsv) \
  --condition "avg Percentage CPU > 80" --window-size 5m \
  --evaluation-frequency 1m --action email admin@contoso.com

# Action group — notify team via email, SMS, webhook, Logic App
az monitor action-group create --name ag-ops-team --resource-group rg-prod \
  --short-name OpsTeam --email admin admin@contoso.com
```

| Alert type | Source |
|------------|--------|
| **Metric alerts** | Platform metrics |
| **Log alerts** | KQL query on Log Analytics |
| **Activity log alerts** | RBAC changes, deletions |
| **Smart detection** | Application Insights anomalies |

Integrate with **PagerDuty**, **Teams**, **ServiceNow** via webhooks.

## What is Azure Policy vs Azure RBAC?

| | Azure RBAC | Azure Policy |
|---|------------|--------------|
| **Question** | Who can do this? | Is this allowed? |
| **Scope** | User/group/service principal | Resource configuration |
| **Example** | User X is Contributor on RG | Only `Standard_D` SKUs allowed in dev |
| **Effect** | Allow/deny access | Deny, audit, deployIfNotExists, modify |

```bash
# Assign policy — allow only eastus and westus
az policy assignment create --name allowed-locations --scope /subscriptions/{sub} \
  --policy /providers/Microsoft.Authorization/policyDefinitions/e56962a6-4747-49cd-b67b-5f0177831265 \
  --params '{"listOfAllowedLocations": {"value": ["eastus", "westus"]}}'
```

**Initiatives** — bundle policies (e.g. **ISO 27001**, **CIS benchmark**).

Use **Policy** for guardrails; **RBAC** for access control — both required.

## How do you implement defense in depth on Azure?

```text
Layer 1: Identity       — Entra ID, MFA, Conditional Access, managed identity
Layer 2: Perimeter      — Front Door WAF, DDoS Standard
Layer 3: Network        — NSG, Azure Firewall, private endpoints, no public IPs
Layer 4: Compute          — Patch management, JIT VM access, Defender
Layer 5: Application      — Secure coding, APIM auth, input validation
Layer 6: Data             — Encryption at rest (SSE/CMK), TLS in transit, RBAC on data plane
Layer 7: Monitoring       — Defender, App Insights, alerts, SIEM (Sentinel)
```

| Control | Example |
|---------|---------|
| **Zero Trust** | Verify explicitly; least privilege; assume breach |
| **Private Link** | SQL, Storage, Key Vault — no public endpoints |
| **Network segmentation** | Hub-spoke, NSG per subnet |
| **Secrets** | Key Vault + managed identity only |

## What is Azure Backup and Site Recovery?

| Service | Purpose |
|---------|---------|
| **Azure Backup** | VM, SQL, file share, blob backup; point-in-time restore |
| **Azure Site Recovery (ASR)** | Disaster recovery — replicate VMs to paired region; orchestrated failover |

```bash
# Recovery Services vault
az backup vault create --resource-group rg-prod --name rsv-prod --location eastus

# Enable VM backup
az backup protection enable-for-vm --resource-group rg-prod --vault-name rsv-prod \
  --vm vm-web-01 --policy-name DailyPolicy
```

**RPO/RTO targets** drive backup frequency and ASR replication policy.

Pair with **geo-redundant storage** and **SQL geo-replication** for data-layer DR.

## How do you monitor costs and set budgets?

```bash
# Monthly budget with email alert at 80%
az consumption budget create --budget-name monthly-prod --amount 5000 \
  --time-grain Monthly --start-date 2025-01-01 --end-date 2026-01-01 \
  --resource-group rg-prod \
  --notifications amount=4000 enabled=true operator=GreaterThan contact-emails=admin@contoso.com

# Cost analysis by tag
az consumption usage list --start-date 2025-03-01 --end-date 2025-03-31 -o table
```

| Tool | Purpose |
|------|---------|
| **Cost Management + Billing** | Budgets, alerts, cost analysis |
| **Azure Advisor** | Right-sizing, unused resources, reserved instance recommendations |
| **Tags** | `Environment`, `CostCenter`, `Application` for chargeback |
| **Reservations / Savings Plans** | Commit for predictable workloads |

**Alert on anomalies** — sudden spike may indicate misconfiguration or attack (denial-of-wallet).

## Related Topics

- **Azure Identity and Entra ID.md** — RBAC, managed identity
- **Azure Networking.md** — NSG, Firewall, private endpoints
- **Azure Basics.md** — SLA, Well-Architected Framework
- **Security/Cloud and Infrastructure Security.md** — cross-cloud security patterns
