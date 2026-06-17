# Core Concepts: Regions, Resource Groups & Subscriptions

## Concept Explanation

Azure organizes resources in a **hierarchy**:

```
Management Group → Subscription → Resource Group → Resource
```

- **Tenant (Entra ID directory)** — the identity boundary for an organization.
- **Management Group** — groups subscriptions for org-wide policy/governance.
- **Subscription** — a billing + access boundary; resources are billed and quota-limited per subscription.
- **Resource Group (RG)** — a logical container for related resources sharing a lifecycle (deploy/delete together). Every resource lives in exactly one RG.
- **Region** — a geographic location (e.g. `eastus`, `westeurope`) where resources physically run. **Availability Zones** are isolated datacenters within a region for high availability.

**ARM (Azure Resource Manager)** is the deployment/management layer; you describe infrastructure declaratively with **ARM templates** or **Bicep** (Infrastructure as Code).

## Code Example(s)

```bash
# Azure CLI basics
az login
az account set --subscription "Prod Subscription"

az group create --name rg-shop --location eastus

az resource list --resource-group rg-shop --output table

# Deleting an RG deletes everything inside it
az group delete --name rg-shop --yes
```

```bicep
// Bicep (Infrastructure as Code) — declarative resource definition
param location string = resourceGroup().location

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: 'shopstorage${uniqueString(resourceGroup().id)}'
  location: location
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
}
```

## Interview Q&A

**🟢 What is a resource group?**
A logical container for Azure resources that share a lifecycle and management/access boundary. Resources in an RG can be deployed, managed, and deleted together.

**🟢 What is the difference between a region and an availability zone?**
A region is a geographic area containing datacenters. Availability Zones are physically separate datacenters within a region (independent power/network/cooling) used to protect against datacenter-level failures.

**🟡 What is a subscription and why does it matter?**
A subscription is a billing and access-control boundary that also enforces quotas/limits. Organizations split workloads across subscriptions for billing separation, isolation, and to avoid hitting limits.

**🟡 What is ARM / Bicep?**
Azure Resource Manager is the control-plane service that handles all resource operations. ARM templates (JSON) and Bicep (a cleaner DSL) let you define infrastructure as code for repeatable, declarative deployments.

**🔴 How do management groups help governance at scale?**
They let you apply **Azure Policy** and RBAC across many subscriptions at once (e.g. allowed regions, required tags, denied SKUs), enforcing compliance organization-wide instead of per-subscription.

## ⚠️ Tricky / Gotchas

- **Deleting a resource group deletes ALL resources in it** — irreversibly. A common accidental data-loss scenario.
- **A resource lives in exactly one RG**, but it can reference resources in other RGs/regions. Moving resources between RGs/subscriptions is supported for some types but not all.
- **Region availability varies** — not every service/SKU/VM size exists in every region; deployments fail if you pick an unsupported region.
- **Availability Zones ≠ regions** — zones protect against datacenter failure within a region; for region-level disaster recovery you need multi-region (geo-replication).
- **Tags** are key for cost tracking/governance but are not inherited by default from RG to resources.

## 📌 Quick Recap

- Hierarchy: Management Group → Subscription → Resource Group → Resource.
- Subscription = billing + access + quota boundary; RG = lifecycle container (delete RG = delete all).
- Region = geography; Availability Zone = isolated datacenter within a region (HA).
- ARM is the management layer; Bicep/ARM templates = Infrastructure as Code.
- Management Groups + Azure Policy = governance across subscriptions.
- Service/SKU availability differs by region; multi-region for DR.
