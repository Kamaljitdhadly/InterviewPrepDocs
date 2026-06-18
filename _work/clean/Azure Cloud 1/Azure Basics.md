# Azure Basics

## Questions Covered

1. What is Microsoft Azure and how does it compare to AWS and GCP?
2. What are regions, availability zones, and geographies?
3. What is the Azure resource hierarchy (management groups, subscriptions, resource groups)?
4. What is the difference between IaaS, PaaS, and SaaS?
5. What are managed vs unmanaged services in Azure?
6. What is serverless in Azure?
7. What is Azure Resource Manager (ARM)?
8. What are ARM templates and Bicep?
9. What is an Azure SLA, and how do availability sets and zones affect it?
10. What are fault domains and update domains?
11. How does Azure pricing and cost management work?
12. What is Azure Cloud Shell, CLI, and PowerShell?
13. What is the Azure Well-Architected Framework?
14. How do you choose the right Azure region?

## What is Microsoft Azure and how does it compare to AWS and GCP?

**Microsoft Azure** is a public cloud platform providing compute, storage, networking, databases, identity, AI, and DevOps services. It integrates deeply with **Microsoft 365**, **Entra ID (Azure AD)**, and **.NET** — making it the default cloud for many enterprise .NET shops.

| Aspect | Azure | AWS | GCP |
|--------|-------|-----|-----|
| **Strengths** | Enterprise AD integration, hybrid (Arc), .NET | Broadest service catalog, maturity | Data analytics, Kubernetes origin |
| **Compute flagship** | App Service, AKS, VMs | EC2, ECS/EKS, Lambda | GCE, GKE, Cloud Functions |
| **Identity** | Entra ID native | IAM | Cloud IAM |
| **Hybrid** | Azure Arc, Stack HCI | Outposts | Anthos |
| **Portal UX** | Azure Portal + Portal design system | AWS Console | GCP Console |

**Interview angle:** Azure wins hybrid/enterprise Microsoft stacks; know service **equivalents** (Blob ≈ S3, AKS ≈ EKS, Service Bus ≈ SQS/SNS).

## What are regions, availability zones, and geographies?

| Term | Definition |
|------|------------|
| **Geography** | Group of regions for compliance/data residency (e.g. United States, Europe) |
| **Region** | Datacenter cluster in one location (e.g. `eastus`, `westeurope`) |
| **Availability Zone (AZ)** | Physically separate datacenters within a region (independent power/network) |
| **Region pair** | Paired regions for disaster recovery (Azure replicates platform data between pairs) |

```text
Geography: Europe
  └── Region: West Europe (Amsterdam)
        ├── Availability Zone 1
        ├── Availability Zone 2
        └── Availability Zone 3
  └── Region: North Europe (Dublin)  ← paired with West Europe
```

**Best practice:** Deploy production workloads across **≥2 AZs** (zone-redundant) or use **Availability Zones** on PaaS SKUs. Not all regions have AZs — check [Azure regions](https://azure.microsoft.com/explore/global-infrastructure/geographies/).

## What is the Azure resource hierarchy (management groups, subscriptions, resource groups)?

```text
Tenant (Entra ID)
  └── Management Groups (optional — policy inheritance)
        └── Subscriptions (billing + RBAC boundary)
              └── Resource Groups (lifecycle container)
                    └── Resources (VM, App Service, Storage, etc.)
```

| Level | Purpose |
|-------|---------|
| **Management group** | Organize subscriptions; apply policies at scale |
| **Subscription** | Billing unit; RBAC scope; soft limit on resources |
| **Resource group (RG)** | Logical container — delete RG deletes all resources in it |
| **Resource** | Individual service instance |

```bash
az group create --name rg-myapp-dev --location eastus
az storage account create --resource-group rg-myapp-dev --name mystorageacct --sku Standard_LRS
```

**Rule:** Every resource belongs to exactly **one** resource group and **one** subscription. RGs don't nest.

## What is the difference between IaaS, PaaS, and SaaS?

| Model | You manage | Azure manages | Examples |
|-------|------------|---------------|----------|
| **IaaS** | OS, apps, data, runtime | Hardware, network, hypervisor | Virtual Machines |
| **PaaS** | Apps, data | OS, runtime, scaling | App Service, Azure SQL, AKS (control plane) |
| **SaaS** | Configuration, data | Everything | Microsoft 365, Dynamics 365 |

```text
Stack layer          On-prem   IaaS    PaaS    SaaS
─────────────────────────────────────────────────────
Applications           You      You     You    Vendor
Data                   You      You     You    Vendor
Runtime                You      You    Azure   Vendor
OS                     You      You    Azure   Vendor
Virtualization         You     Azure  Azure   Vendor
Servers/Storage/Net    You     Azure  Azure   Vendor
```

**Interview tip:** Higher abstraction = less ops burden, less control. Choose **IaaS** for lift-and-shift; **PaaS** for new cloud-native apps.

## What are managed vs unmanaged services in Azure?

| | Unmanaged | Managed |
|---|-----------|---------|
| **Definition** | You manage the guest OS and middleware | Azure handles patching, scaling, HA |
| **Examples** | Virtual Machines | App Service, Azure SQL, Azure Functions |
| **Responsibility** | OS updates, antivirus, runtime install | App code and configuration only |

A **VM running IIS** is unmanaged — you patch Windows. **App Service** is managed — you deploy code; Azure runs the web server.

## What is serverless in Azure?

**Serverless** means you don't provision or size servers — Azure scales automatically and bills per execution.

| Service | Trigger | Use case |
|---------|---------|----------|
| **Azure Functions** | HTTP, queue, timer, blob | Event-driven logic, APIs |
| **Logic Apps** | Connectors, workflows | Integration, low-code |
| **Azure Container Apps** | HTTP, events | Containerized serverless |
| **Event Grid** | Pub/sub events | React to resource changes |

```csharp
[FunctionName("ProcessOrder")]
public static async Task Run(
    [ServiceBusTrigger("orders", Connection = "ServiceBusConnection")] string message,
    ILogger log)
{
    log.LogInformation($"Processing: {message}");
}
```

Serverless still runs on servers — you just don't manage them.

## What is Azure Resource Manager (ARM)?

**ARM** is the deployment and management layer for all Azure resources. Every API call, Portal action, and CLI command goes through ARM.

**Features:**

- **Declarative deployment** — describe desired state (ARM/Bicep/TF)
- **RBAC** — who can do what at any scope
- **Tags** — cost allocation, environment labels
- **Locks** — prevent accidental delete/modify
- **Policy** — enforce org rules (allowed regions, SKUs)
- **Activity log** — audit who changed what

```bash
az deployment group create \
  --resource-group rg-myapp-dev \
  --template-file main.bicep \
  --parameters environment=dev
```

## What are ARM templates and Bicep?

| Format | Description |
|--------|-------------|
| **ARM JSON** | Native declarative template language |
| **Bicep** | Domain-specific language that compiles to ARM — preferred for new projects |
| **Terraform** | Third-party; multi-cloud; widely used in enterprises |

```bicep
// main.bicep
param location string = resourceGroup().location
param appName string

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: '${appName}storage'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}

resource app 'Microsoft.Web/sites@2022-09-01' = {
  name: appName
  location: location
  properties: { serverFarmId: plan.id }
}
```

**Interview:** Bicep is **transpiled to ARM** at deploy time — same underlying engine.

## What is an Azure SLA, and how do availability sets and zones affect it?

**SLA (Service Level Agreement)** = guaranteed uptime percentage. Missing SLA → service credits.

| Configuration | Typical VM SLA |
|---------------|----------------|
| Single VM | 99.9% |
| Availability Set (≥2 VMs) | 99.95% |
| Availability Zones (≥2 VMs across zones) | 99.99% |

**Availability Set** — spreads VMs across **fault domains** (racks) and **update domains** (maintenance groups) within one datacenter.

**Availability Zones** — spreads VMs across physically separate datacenters in a region — higher resilience than availability sets alone.

```bash
az vm create \
  --resource-group rg-prod \
  --name vm-web-01 \
  --image Ubuntu2204 \
  --zone 1 \
  --size Standard_D2s_v5
```

## What are fault domains and update domains?

| Concept | Purpose |
|---------|---------|
| **Fault domain (FD)** | Rack-level isolation — shared power/network. Default 2–3 FDs per region. |
| **Update domain (UD)** | Maintenance grouping — Azure reboots one UD at a time during host updates. Default 5 UDs. |

```text
Availability Set grid (2 FD × 3 UD example):

              FD1          FD2
UD1         VM-A         VM-C
UD2         VM-B         (empty)
UD3         (empty)      VM-D
```

Place **≥2 VMs** in an availability set so a single rack failure or maintenance window doesn't take down the app.

## How does Azure pricing and cost management work?

| Concept | Detail |
|---------|--------|
| **Pay-as-you-go** | Per-second/minute billing for most services |
| **Reservations** | 1–3 year commit — up to ~72% savings on VMs, SQL |
| **Savings Plans** | Flexible compute commitment |
| **Spot VMs** | Unused capacity — up to 90% off; can be evicted |
| **Free tier** | Limited free services for 12 months + always-free SKUs |
| **Cost Management** | Budgets, alerts, cost analysis in Portal |

```bash
az consumption budget create \
  --budget-name monthly-dev \
  --amount 500 \
  --resource-group rg-myapp-dev \
  --time-grain Monthly
```

Use **Azure Pricing Calculator** before architecting. Tag all resources: `Environment`, `CostCenter`, `Owner`.

## What is Azure Cloud Shell, CLI, and PowerShell?

| Tool | Description |
|------|-------------|
| **Azure Portal** | Web UI for all services |
| **Azure CLI (`az`)** | Cross-platform command line — bash-friendly |
| **Azure PowerShell (`Az`)** | PowerShell module — Windows/admin scripts |
| **Cloud Shell** | Browser-based shell with `az` + `Az` pre-installed; persistent storage |

```bash
az login
az account set --subscription "My Subscription"
az group list --output table
```

```powershell
Connect-AzAccount
Get-AzResourceGroup | Format-Table Name, Location
```

**Interview:** Prefer **`az`** for cross-platform CI/CD; **`Az`** in Windows-centric enterprise scripts.

## What is the Azure Well-Architected Framework?

Five pillars for designing reliable cloud workloads:

| Pillar | Focus |
|--------|-------|
| **Reliability** | HA, DR, resilience |
| **Security** | Identity, encryption, threat protection |
| **Cost Optimization** | Right-sizing, reservations, monitoring spend |
| **Operational Excellence** | Monitoring, automation, IaC |
| **Performance Efficiency** | Scaling, caching, appropriate SKUs |

Use the **Well-Architected Review** in Azure Portal to assess workloads against these pillars.

## How do you choose the right Azure region?

| Factor | Consideration |
|--------|---------------|
| **Latency** | Closest to users |
| **Compliance** | Data residency (GDPR, etc.) |
| **Service availability** | Not all SKUs in all regions |
| **Region pairs** | DR strategy — pair-aware failover |
| **Cost** | Pricing varies by region |
| **AZ support** | Required for zone-redundant HA |

```bash
# Check VM SKU availability in a region
az vm list-skus --location eastus --size Standard_D --output table
```

## Related Topics

- **Azure Compute.md** — VMs, App Service, AKS, Functions
- **Azure Networking.md** — VNet, NSG, load balancing
- **Azure Identity and Entra ID.md** — RBAC, subscriptions, access
- **Azure Commands and CLI.md** — essential `az` commands
