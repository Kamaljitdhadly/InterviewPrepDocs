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

**Remote state** stores `terraform.tfstate` in shared storage — team collaboration + CI applies.

```hcl
# backend.tf — Azure Storage
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "contosotfstate"
    container_name       = "tfstate"
    key                  = "networking/prod.tfstate"
  }
}
```

```hcl
# AWS S3 + DynamoDB lock
terraform {
  backend "s3" {
    bucket         = "contoso-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

Run `terraform init -migrate-state` when changing backends.

## What is state locking, and why is it required?

**Lock** prevents two `apply` operations simultaneously — avoids duplicate/conflicting resources.

| Backend | Lock mechanism |
|---------|----------------|
| **Azure Blob** | Blob lease |
| **S3** | DynamoDB table |
| **Terraform Cloud** | Managed |

If apply crashes, stale lock may need manual force-unlock (`terraform force-unlock`) after verifying no run active.

## What happens when state is lost or corrupted?

| Situation | Recovery |
|-----------|----------|
| **State lost, resources exist** | `terraform import` each resource |
| **Resource deleted outside TF** | Next plan shows recreate or remove from config |
| **Orphan in state** | `terraform state rm` |
| **Rename in config** | `moved` block or `state mv` |

**Backup:** enable state versioning on storage account / S3 bucket.

## What are Terraform modules?

**Modules** = reusable packages of Terraform config — DRY for VPC, AKS cluster, etc.

```text
modules/
  aks/
    main.tf
    variables.tf
    outputs.tf
```

```hcl
module "aks" {
  source = "./modules/aks"

  cluster_name        = "aks-contoso-prod"
  resource_group_name = azurerm_resource_group.rg.name
  node_count          = 3
  vm_size             = "Standard_D4s_v5"
}

output "kube_config" {
  value     = module.aks.kube_config
  sensitive = true
}
```

Public registry: `source = "terraform-aws-modules/vpc/aws"`.

## How do you create and consume a module?

**Module outputs** expose values to caller:

```hcl
# modules/storage/outputs.tf
output "primary_connection_string" {
  value     = azurerm_storage_account.sa.primary_connection_string
  sensitive = true
}
```

**Version pinned modules:**

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"
  # ...
}
```

Document inputs in `variables.tf` with descriptions and defaults.

## What is the difference between count and for_each?

**count** — index-based list:

```hcl
variable "subnets" { type = list(string) default = ["10.0.1.0/24", "10.0.2.0/24"] }

resource "azurerm_subnet" "sn" {
  count                = length(var.subnets)
  name                 = "sn-${count.index}"
  address_prefixes     = [var.subnets[count.index]]
}
```

**for_each** — map/set keyed resources (preferred for stable addressing):

```hcl
variable "storage_accounts" {
  type = map(object({ tier = string }))
  default = {
    logs  = { tier = "Standard" }
    media = { tier = "Premium" }
  }
}

resource "azurerm_storage_account" "sa" {
  for_each = var.storage_accounts
  name     = "contoso${each.key}"
  account_tier = each.value.tier
}
```

Removing middle item from `count` list **recreates** downstream indices — `for_each` avoids that.

## What are depends_on and implicit dependencies?

**Implicit** — reference attribute creates dependency:

```hcl
resource "azurerm_subnet" "sn" {
  virtual_network_name = azurerm_virtual_network.vnet.name  # implicit dep
}
```

**Explicit `depends_on`** — when order matters but no attribute reference:

```hcl
resource "azurerm_role_assignment" "aks" {
  depends_on = [azurerm_subnet.sn]
}
```

Use sparingly — overuse hides real graph.

## What is terraform import and moved blocks?

**Import** existing resource into state:

```bash
terraform import azurerm_resource_group.rg /subscriptions/xxx/resourceGroups/rg-contoso
```

**Terraform 1.1+ moved block** — refactor without destroy/recreate:

```hcl
moved {
  from = azurerm_storage_account.old
  to   = module.storage.azurerm_storage_account.sa
}
```

**state mv** CLI equivalent for renames.

## How do you manage multiple environments with Terraform?

| Pattern | Structure |
|---------|-----------|
| **Directory per env** | `env/dev`, `env/prod` separate state keys |
| **Workspace** | Same code, `terraform workspace select prod` |
| **Single pipeline** | `-var-file=prod.tfvars` |

```hcl
# prod.tfvars
environment = "prod"
node_count  = 5

# dev.tfvars
environment = "dev"
node_count  = 1
```

**Recommended:** separate **state files** per environment — blast radius isolation.

## What is workspace vs directory per environment?

| | **Workspaces** | **Separate directories** |
|--|----------------|--------------------------|
| **State isolation** | Same backend, different key | Clear separation |
| **Complexity** | Lower | Higher duplication |
| **Prod safety** | Easy to apply wrong workspace | Explicit path |

Many teams prefer **`infra/env/prod`** over workspaces for production.

## What is drift detection and remediation?

**Drift** — manual portal changes differ from code.

```bash
terraform plan   # shows drift
terraform apply  # reconciles to code (or destroys unexpected)
```

**CI scheduled plan** — alert on non-empty plan without apply.

**Policy:** discourage console edits; use TF or import changes back.

## What are lifecycle rules (create_before_destroy, prevent_destroy)?

```hcl
resource "azurerm_storage_account" "sa" {
  name = "contosodata"

  lifecycle {
    prevent_destroy = true
    create_before_destroy = true
  }
}
```

| Rule | Use |
|------|-----|
| `prevent_destroy` | Prod databases |
| `create_before_destroy` | Zero-downtime name changes where supported |
| `ignore_changes` | Ignore tags managed externally |

```hcl
lifecycle {
  ignore_changes = [tags["last_patched"]]
}
```

## Related Topics

- Terraform/Terraform Basics.md
- Terraform/Terraform Multi-Cloud Providers.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
