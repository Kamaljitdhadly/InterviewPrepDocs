# Terraform Basics

## Questions Covered

1. What is Terraform, and why use Infrastructure as Code (IaC)?
2. How does Terraform compare to Bicep, CloudFormation, and Pulumi?
3. What is the Terraform workflow (init, plan, apply, destroy)?
4. What is HCL, and what does a basic Terraform file look like?
5. What are providers, resources, and data sources?
6. What are variables, outputs, and locals?
7. What is Terraform state, and why is it important?
8. What is the difference between managed and data resources?
9. How do you organize Terraform for a small project?
10. What is terraform fmt, validate, and plan in CI?
11. What are common Terraform interview questions?
12. When should you not use Terraform?

## What is Terraform, and why use Infrastructure as Code (IaC)?

**Terraform** (HashiCorp) is an **open-source IaC tool** — declaratively define cloud/on-prem resources in HCL; Terraform creates/updates/destroys to match config.

| Benefit | Detail |
|---------|--------|
| **Reproducibility** | Same config → same infra |
| **Version control** | PR review for infrastructure |
| **Automation** | CI/CD pipelines apply changes |
| **Multi-cloud** | One tool, many providers |

```text
Code (main.tf) → terraform plan → terraform apply → Azure/AWS/GCP resources
```

## How does Terraform compare to Bicep, CloudFormation, and Pulumi?

| Tool | Language | Cloud scope |
|------|----------|-------------|
| **Terraform** | HCL | Multi-cloud |
| **Bicep** | DSL → ARM | Azure-native |
| **CloudFormation** | YAML/JSON | AWS-native |
| **Pulumi** | C#, TS, Python, Go | Multi-cloud |
| **Ansible** | YAML | Config + some provisioning |

**Interview:** Terraform for **multi-cloud** and team standard; Bicep/CloudFormation when **single-cloud** and deep platform integration. Often coexist — Terraform for networking, Bicep for app-specific Azure resources.

## What is the Terraform workflow (init, plan, apply, destroy)?

```bash
terraform init      # download providers, backend setup
terraform fmt       # format HCL
terraform validate  # syntax check
terraform plan      # preview changes
terraform apply     # execute changes (confirm or -auto-approve)
terraform destroy   # tear down managed resources
```

```text
init → plan (diff) → human/CI approval → apply → state updated
```

**Never** apply without plan in production pipelines.

## What is HCL, and what does a basic Terraform file look like?

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-contoso-dev"
  location = "eastus"
}

output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}
```

HCL is **declarative** — describe desired end state, not imperative steps.

## What are providers, resources, and data sources?

| Construct | Purpose |
|-----------|---------|
| **Provider** | Plugin for Azure, AWS, GCP, Kubernetes, etc. |
| **Resource** | Creates/manages infra (`azurerm_storage_account`) |
| **Data source** | Read existing infra (`data "azurerm_client_config" "current"`) |

```hcl
data "azurerm_resource_group" "existing" {
  name = "rg-shared"
}

resource "azurerm_storage_account" "sa" {
  name                     = "contosodevstore"
  resource_group_name      = data.azurerm_resource_group.existing.name
  location                 = data.azurerm_resource_group.existing.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
```

## What are variables, outputs, and locals?

```hcl
variable "environment" {
  type        = string
  description = "dev, staging, prod"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Invalid environment."
  }
}

locals {
  name_prefix = "contoso-${var.environment}"
  common_tags = {
    env     = var.environment
    managed = "terraform"
  }
}

output "storage_account_id" {
  value     = azurerm_storage_account.sa.id
  sensitive = false
}
```

| File convention | Content |
|-----------------|---------|
| `variables.tf` | Inputs |
| `outputs.tf` | Exported values |
| `locals.tf` | Computed constants |
| `terraform.tfvars` | Environment values (don't commit secrets) |

## What is Terraform state, and why is it important?

**State** (`terraform.tfstate`) maps config to **real resource IDs** — Terraform knows what it manages.

| Without remote state | Problem |
|----------------------|---------|
| Local file on laptop | Team conflicts, data loss |
| No locking | Concurrent apply corruption |

**Remote backend** (Azure Storage, S3 + DynamoDB lock, Terraform Cloud) — shared, locked state.

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "contosotfstate"
    container_name       = "tfstate"
    key                  = "prod.terraform.tfstate"
  }
}
```

## What is the difference between managed and data resources?

| | **Managed resource** | **Data source** |
|--|---------------------|-----------------|
| **Lifecycle** | Terraform creates/updates/deletes | Read-only reference |
| **Example** | `resource "aws_s3_bucket"` | `data "aws_vpc" "default"` |

Import existing resources:

```bash
terraform import azurerm_resource_group.rg /subscriptions/.../resourceGroups/rg-contoso
```

## How do you organize Terraform for a small project?

```text
infra/
  main.tf
  variables.tf
  outputs.tf
  providers.tf
  terraform.tfvars.example
  modules/
    network/
    app/
  environments/
    dev/terraform.tfvars
    prod/terraform.tfvars
```

Start flat; split modules when reuse appears.

## What is terraform fmt, validate, and plan in CI?

```yaml
- script: |
    terraform init -backend=false
    terraform fmt -check
    terraform validate
    terraform plan -out=tfplan
  displayName: Terraform validate and plan
```

| Command | CI gate |
|---------|---------|
| `fmt -check` | Style enforcement |
| `validate` | Config correctness |
| `plan` | Show drift; fail on unexpected destroy |

Apply stage: manual approval + `terraform apply tfplan`.

## What are common Terraform interview questions?

- Explain **state** and **remote backend**
- **Plan vs apply**
- Handle **secrets** (Key Vault, env vars, never in tfvars in git)
- **Module** reuse
- **Drift** detection (`plan` shows changes)
- **Import** vs **replace**
- **Count vs for_each**

## When should you not use Terraform?

| Scenario | Alternative |
|----------|-------------|
| App config / feature flags | App config service |
| One-off manual fix | Portal/CLI (then import or codify) |
| Kubernetes app deploys only | Helm/Kustomize |
| Highly dynamic runtime scaling | Autoscaler policies, not TF |

Terraform excels at **foundational infra** — networks, clusters, databases, IAM roles.

## Related Topics

- Terraform/Terraform State Modules and Workflows.md
- Terraform/Terraform Multi-Cloud Providers.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Important Concepts/Cloud Provider Comparison.md
