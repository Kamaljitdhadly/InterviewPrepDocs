# Terraform State Modules and Workflows

## Questions Covered

1. What is remote state, and how do you configure it?
2. What is state locking, and why is it required?
3. What happens when state is lost or corrupted?
4. What are Terraform modules?
5. How do you create and consume a module?
6. What is the difference between count and for_each?
7. What are depends_on and implicit dependencies?
8. What is terraform import and moved blocks?
9. How do you manage multiple environments with Terraform?
10. What is workspace vs directory per environment?
11. What is drift detection and remediation?
12. What are lifecycle rules (create_before_destroy, prevent_destroy)?

## What is remote state, and how do you configure it?

**Remote state** stores `terraform.tfstate` in shared storage instead of on your laptop. Every team member and CI pipeline reads/writes the **same state** — the single source of truth for what Terraform manages.

**Why local state fails for teams:**

```text
Engineer A applies on laptop → state on A's disk
Engineer B applies on laptop → different state → duplicate resources or conflicts
CI pipeline → third copy of state → chaos
```

**Azure Storage backend (common for Azure shops):**

```hcl
# backend.tf
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "contosotfstate"
    container_name       = "tfstate"
    key                  = "networking/prod.terraform.tfstate"
  }
}
```

**AWS S3 + DynamoDB locking:**

```hcl
terraform {
  backend "s3" {
    bucket         = "contoso-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}
```

**Setup flow:**
1. Bootstrap: create storage bucket/account (sometimes a tiny separate "bootstrap" Terraform or manual once).
2. Add `backend` block to your config.
3. Run `terraform init` — prompts to migrate existing local state to remote.
4. Enable **versioning** on S3 / Azure blob container for state history.

**State key naming:** Use paths like `shop/prod.tfstate`, `shop/dev.tfstate` — one key per stack/environment.

## What is state locking, and why is it required?

**State locking** prevents two people (or two CI jobs) from running `apply` at the same time on the same state file.

```text
Pipeline A: apply starts → acquires lock
Pipeline B: apply starts → BLOCKED "Error acquiring state lock"
Pipeline A: apply finishes → releases lock
Pipeline B: can now proceed
```

| Backend | Lock mechanism |
|---------|----------------|
| **Azure Blob** | Native blob lease |
| **S3 + DynamoDB** | Lock row in DynamoDB table |
| **Terraform Cloud** | Managed by HashiCorp |

**Stale lock:** If a job crashes mid-apply, lock may remain. Verify no job is running, then:

```bash
terraform force-unlock <LOCK_ID>
```

**Never force-unlock** while another apply is genuinely in progress — you can corrupt state.

## What happens when state is lost or corrupted?

State disasters happen — laptop lost, bucket accidentally deleted, bad merge on state file. Know recovery options:

| Situation | What Terraform sees | Recovery |
|-----------|----------------------|----------|
| **State lost, cloud resources exist** | Empty state | `terraform import` each resource (painful) |
| **Resource deleted in portal** | State says exists | Next plan: recreate OR remove from config |
| **Ghost in state** (resource gone) | Plan error on refresh | `terraform state rm azurerm_x.y` |
| **Renamed resource in code** | Plan: destroy old + create new | `moved` block or `state mv` |
| **Corrupted state JSON** | Init/plan fails | Restore from blobService versioning |

**Prevention beats recovery:**
- Remote backend with **versioning enabled**
- **Separate state per environment** — prod corruption doesn't wipe dev
- Restrict who can delete state storage (RBAC on storage account)
- Never edit state JSON by hand unless you know exactly what you're doing

```bash
# Remove resource from state WITHOUT deleting in Azure
terraform state rm azurerm_storage_account.old

# Rename in state to match refactored code
terraform state mv azurerm_storage_account.old azurerm_storage_account.new
```

## What are Terraform modules?

A **module** is a reusable container of Terraform configuration — like a function or NuGet package for infrastructure.

**Why modules matter:**
- **DRY** — define AKS cluster once, use in dev/staging/prod with different variables
- **Standards** — platform team publishes "approved" network module
- **Testing** — validate module in isolation before consumers adopt

```text
modules/aks/
  main.tf       # resources
  variables.tf  # inputs
  outputs.tf    # exports (kube_config, cluster_id)
  README.md     # documentation for consumers
```

**Calling a local module:**

```hcl
module "aks" {
  source = "./modules/aks"

  cluster_name        = "aks-contoso-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  node_count          = var.environment == "prod" ? 5 : 2
  vm_size             = "Standard_D4s_v5"
}

output "cluster_name" {
  value = module.aks.cluster_name
}
```

**Public Registry modules** — community-maintained, version-pinned:

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.13.0"
  name    = "contoso-vpc"
  cidr    = "10.0.0.0/16"
  # ...
}
```

Browse [registry.terraform.io](https://registry.terraform.io) — always **pin versions**; don't use `@latest` in production.

## How do you create and consume a module?

**Module contract:** inputs via `variable`, outputs via `output`, documented in README.

```hcl
# modules/storage/variables.tf
variable "name_prefix" {
  type        = string
  description = "Prefix for storage account name (globally unique)"
}

variable "resource_group_name" {
  type = string
}

# modules/storage/outputs.tf
output "storage_account_id" {
  value = azurerm_storage_account.sa.id
}

output "primary_blob_endpoint" {
  value = azurerm_storage_account.sa.primary_blob_endpoint
}

output "connection_string" {
  value     = azurerm_storage_account.sa.primary_connection_string
  sensitive = true
}
```

**Consumer references outputs:**

```hcl
module "storage" {
  source = "./modules/storage"
  name_prefix         = local.name_prefix
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_role_assignment" "app_storage" {
  scope                = module.storage.storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.app.principal_id
}
```

**Module sources:**

| Source | Example |
|--------|---------|
| Local path | `source = "./modules/aks"` |
| Git | `source = "git::https://github.com/contoso/tf-modules.git//aks?ref=v1.2.0"` |
| Registry | `source = "Azure/avm-res-network-virtualnetwork/azurerm"` |
| Terraform Cloud private registry | `source = "app.terraform.io/contoso/vnet/azurerm"` |

## What is the difference between count and for_each?

Both create **multiple instances** of a resource — but behave differently when the list changes.

**count** — integer index `0, 1, 2...`:

```hcl
variable "subnet_cidrs" {
  default = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

resource "azurerm_subnet" "sn" {
  count                = length(var.subnet_cidrs)
  name                 = "subnet-${count.index}"
  address_prefixes     = [var.subnet_cidrs[count.index]]
  virtual_network_name = azurerm_virtual_network.vnet.name
  resource_group_name  = azurerm_resource_group.rg.name
}

# Reference: azurerm_subnet.sn[0], azurerm_subnet.sn[1]
```

**Problem with count:** Remove the **middle** subnet from the list → indices shift → Terraform **destroys and recreates** resources that moved index — painful for stateful resources.

**for_each** — map or set keys (preferred for stability):

```hcl
variable "storage_accounts" {
  type = map(object({ tier = string, replication = string }))
  default = {
    logs  = { tier = "Standard", replication = "LRS" }
    media = { tier = "Premium", replication = "LRS" }
  }
}

resource "azurerm_storage_account" "sa" {
  for_each = var.storage_accounts

  name                     = "contoso${each.key}001"
  account_tier             = each.value.tier
  account_replication_type = each.value.replication
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
}

# Reference: azurerm_storage_account.sa["logs"]
```

Remove `media` from map → only `media` is destroyed; `logs` untouched.

**Rule of thumb:** Use **for_each** for named resources; **count** for "create N identical things" or conditional single resource (`count = var.enabled ? 1 : 0`).

## What are depends_on and implicit dependencies?

Terraform builds a **dependency graph** to determine create/update order.

**Implicit dependency** — referencing another resource's attribute:

```hcl
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-contoso"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "sn" {
  name                 = "subnet-app"
  virtual_network_name = azurerm_virtual_network.vnet.name   # implicit: subnet waits for vnet
  resource_group_name  = azurerm_resource_group.rg.name
  address_prefixes     = ["10.0.1.0/24"]
}
```

Terraform knows: create RG → VNet → Subnet.

**Explicit `depends_on`** — when order matters but **no attribute reference** exists:

```hcl
resource "azurerm_role_assignment" "aks_network" {
  scope                = azurerm_subnet.aks.id
  role_definition_name = "Network Contributor"
  principal_id         = azurerm_kubernetes_cluster.aks.identity[0].principal_id

  depends_on = [
    azurerm_subnet.aks,
    azurerm_kubernetes_cluster.aks   # ensure cluster identity exists first
  ]
}
```

**Use sparingly** — overusing `depends_on` often hides design problems. Prefer attribute references that naturally express dependencies.

**Parallelism:** Terraform creates independent resources in parallel — large applies are faster than sequential scripts.

## What is terraform import and moved blocks?

**Refactoring** and **adopting existing infra** are two common real-world tasks.

**Import** — bring existing cloud resource under Terraform management:

```bash
# Write resource block first, then:
terraform import azurerm_resource_group.rg /subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg-contoso

terraform plan   # fix any config drift until plan is empty
```

Import only updates **state**, not your `.tf` files — you write the config manually.

**moved block (Terraform 1.1+)** — refactor without destroy/recreate:

```hcl
# Renamed resource or moved into module
moved {
  from = azurerm_storage_account.old
  to   = module.storage.azurerm_storage_account.sa
}

moved {
  from = azurerm_storage_account.old
  to   = azurerm_storage_account.new
}
```

Terraform updates state mapping on next apply — **no API calls**, no downtime.

**CLI equivalent:** `terraform state mv SOURCE DESTINATION`

## How do you manage multiple environments with Terraform?

Three common patterns — pick one and stick with it:

| Pattern | Structure | State |
|---------|-----------|-------|
| **Directory per env** | `env/dev/`, `env/prod/` | Separate backend key per directory |
| **Workspace** | Same code, `terraform workspace select prod` | Separate state per workspace |
| **Single dir + tfvars** | One folder, `-var-file=prod.tfvars` | Risky if same state — avoid |

**Recommended: directory per environment**

```text
infra/
  modules/
    network/
  environments/
    dev/
      main.tf
      backend.tf      # key = "shop/dev.tfstate"
      terraform.tfvars
    prod/
      main.tf
      backend.tf      # key = "shop/prod.tfstate"
      terraform.tfvars
```

```hcl
# environments/prod/terraform.tfvars
environment  = "prod"
node_count   = 5
sku          = "Standard_D4s_v5"

# environments/dev/terraform.tfvars
environment  = "dev"
node_count   = 1
sku          = "Standard_B2s"
```

```bash
cd infra/environments/prod
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

**Blast radius:** Prod state corruption doesn't affect dev. Prod apply requires separate pipeline approval.

## What is workspace vs directory per environment?

**Workspaces** — multiple state files in same backend, selected by name:

```bash
terraform workspace new dev
terraform workspace new prod
terraform workspace select prod
terraform apply
```

| | **Workspaces** | **Separate directories** |
|--|----------------|--------------------------|
| **Code duplication** | None — one folder | Some — each env calls same modules |
| **Wrong-env risk** | High — forgot `workspace select prod` | Lower — explicit path |
| **CI clarity** | Must pass workspace name | Pipeline points to `environments/prod/` |
| **Team preference** | Solo/small teams | Enterprise, regulated |

**Interview answer:** "We use **separate directories and state keys** for prod vs non-prod because applying to the wrong workspace is a common outage cause."

## What is drift detection and remediation?

**Drift** = real infrastructure differs from Terraform code + state because someone changed the portal, CLI, or another tool.

```bash
terraform plan
```

Plan output examples:

```text
# Someone changed SKU in portal:
~ azurerm_app_service_plan.plan {
    ~ sku_name = "S1" -> "P1v3"   # Terraform will change back to code value on apply
  }

# Someone deleted a resource:
+ azurerm_storage_account.sa will be created   # Terraform recreates it
```

**Remediation options:**

| Approach | When |
|----------|------|
| **terraform apply** | Code is correct; revert manual change |
| **Update .tf to match reality** | Manual change was intentional — codify it |
| **import** | Adopt new manually-created resource |

**CI scheduled drift detection:**

```yaml
# Nightly — plan only, no apply; alert if changes detected
- script: terraform plan -detailed-exitcode
  # exit 2 = changes present → notify Slack
```

**Culture:** "If it's not in Terraform, it doesn't exist long-term" — or changes get reverted on next apply.

## What are lifecycle rules (create_before_destroy, prevent_destroy)?

**Lifecycle** meta-arguments change how Terraform handles create/update/destroy:

```hcl
resource "azurerm_storage_account" "sa" {
  name                     = "contosoproddata001"
  resource_group_name      = azurerm_resource_group.rg.name
  location                 = azurerm_resource_group.rg.location
  account_tier             = "Standard"
  account_replication_type = "GRS"

  lifecycle {
    prevent_destroy = true
    create_before_destroy = true
    ignore_changes  = [tags["last_patched_by_policy"]]
  }
}
```

| Rule | Effect | Use case |
|------|--------|----------|
| `prevent_destroy = true` | Blocks `terraform destroy` on this resource | Production databases, state storage |
| `create_before_destroy = true` | Creates replacement before destroying old | Resources where name can't overlap during replace |
| `ignore_changes = [...]` | Terraform won't revert listed attribute drift | Tags set by Azure Policy automation |

**Conditional prevent_destroy:**

```hcl
lifecycle {
  prevent_destroy = var.environment == "prod"
}
```

**Caution:** `prevent_destroy` doesn't stop someone deleting in the portal — it only blocks Terraform destroy. Combine with Azure **resource locks** for real protection.

## Related Topics

- Terraform/Terraform Basics.md
- Terraform/Terraform Multi-Cloud Providers.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Important Concepts/Cloud Provider Comparison.md
