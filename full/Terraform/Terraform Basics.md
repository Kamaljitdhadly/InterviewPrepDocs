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

**Terraform** (by HashiCorp) is an open-source **Infrastructure as Code (IaC)** tool. You write configuration in **HCL** (HashiCorp Configuration Language) describing the infrastructure you *want* — VPCs, databases, Kubernetes clusters, DNS records — and Terraform figures out how to create, update, or delete cloud resources to match.

**Without IaC:** An engineer clicks through the Azure portal, creates a resource group, forgets a setting, and nobody can reproduce staging exactly. **With IaC:** The same `main.tf` applied to a new subscription creates an identical environment.

| Benefit | What it means in practice |
|---------|---------------------------|
| **Reproducibility** | Dev, staging, and prod use the same code with different variable files |
| **Version control** | Infra changes go through PR review like application code |
| **Automation** | Azure Pipelines runs `terraform plan` on PR, `apply` after approval |
| **Multi-cloud** | One workflow for Azure, AWS, GCP, Kubernetes, GitHub, Cloudflare |

```text
Developer edits main.tf → PR review → terraform plan (shows diff)
  → approve → terraform apply → Azure/AWS/GCP resources updated
  → state file records what was created
```

**Interview one-liner:** Terraform is **declarative** — you describe desired state; the tool computes the delta. You don't script "click button A then B."

## How does Terraform compare to Bicep, CloudFormation, and Pulumi?

Teams often ask which IaC tool to standardize on. Here's an honest comparison:

| Tool | Language | Cloud scope | Typical buyer |
|------|----------|-------------|---------------|
| **Terraform** | HCL | Multi-cloud + SaaS providers | Platform teams, multi-cloud orgs |
| **Bicep** | DSL → ARM JSON | Azure only | Azure-centric .NET shops |
| **CloudFormation** | YAML/JSON | AWS only | AWS-native enterprises |
| **Pulumi** | C#, TS, Python, Go | Multi-cloud | Devs who want real programming languages |
| **Ansible** | YAML | Config management + some provisioning | Server config, not primary cloud provisioning |

**When Terraform wins:** You deploy to **more than one cloud**, or want one skill set across Azure + AWS + Kubernetes + Datadog + GitHub.

**When Bicep/CloudFormation wins:** Single cloud, deep integration with native policy/RBAC (Azure Policy, AWS Service Control Policies), and you want first-party Microsoft/AWS support.

**Coexistence is normal:** Platform team provisions **network + AKS with Terraform**; app team deploys **App Service slots with Bicep** or pipeline templates. Interviewers want you to know *trade-offs*, not "Terraform always."

## What is the Terraform workflow (init, plan, apply, destroy)?

Every Terraform operation follows a predictable lifecycle. Memorize this flow for interviews:

```bash
terraform init      # Download providers, configure backend, prepare .terraform/
terraform fmt       # Format HCL files consistently
terraform validate  # Check syntax and internal consistency
terraform plan      # Preview: create 2, change 1, destroy 0
terraform apply     # Execute the plan (prompts unless -auto-approve)
terraform destroy   # Tear down all managed resources in this config
```

```text
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌───────────────┐
│  init   │ →  │   plan   │ →  │  approve  │ →  │ apply + state │
└─────────┘    └──────────┘    └───────────┘    └───────────────┘
                    ↑
              shows exact diff
              before any change
```

**What each step does:**

| Command | Purpose | When it fails |
|---------|---------|---------------|
| **init** | Install provider plugins (azurerm, aws); connect remote backend | Backend credentials wrong |
| **plan** | Compare config + state vs real world; output execution plan | Syntax error, missing variable |
| **apply** | Call cloud APIs to make changes | Permission denied, quota exceeded |
| **destroy** | Delete everything Terraform manages in this root module | `prevent_destroy` lifecycle blocks |

**Golden rule for production:** Never `apply` without reviewing `plan` first. In CI, save plan to=artifact and apply *that exact plan file* (`terraform apply tfplan`) so what you reviewed is what runs.

## What is HCL, and what does a basic Terraform file look like?

**HCL** looks like JSON but is more readable — blocks, attributes, and nested structures:

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"    # allow 4.x, not 5.0
    }
  }
}

provider "azurerm" {
  features {}               # required block for Azure provider
}

resource "azurerm_resource_group" "rg" {
  name     = "rg-contoso-dev"
  location = "eastus"
  tags = {
    environment = "dev"
    managed_by  = "terraform"
  }
}

output "resource_group_name" {
  value       = azurerm_resource_group.rg.name
  description = "Name of the created resource group"
}
```

**Reading a resource block:**
- `resource "azurerm_resource_group" "rg"` — type = Azure resource group, local name = `rg` (reference as `azurerm_resource_group.rg`).
- `name`, `location`, `tags` — arguments passed to Azure API.

**Declarative mindset:** You don't write "if not exists, create." You write "there should be a resource group named X" and Terraform reconciles.

## What are providers, resources, and data sources?

Three building blocks appear in almost every Terraform project:

| Construct | Role | Analogy |
|-----------|------|---------|
| **Provider** | Plugin that talks to a platform API | Database driver |
| **Resource** | Something Terraform **creates and manages** | `INSERT` row you own |
| **Data source** | Read **existing** infra Terraform won't destroy | `SELECT` reference |

```hcl
# Provider — configure HOW to connect (subscription, region, credentials)
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}

# Data source — reference existing shared resource group (read-only)
data "azurerm_resource_group" "existing" {
  name = "rg-shared-platform"
}

# Resource — Terraform owns lifecycle; will create/update/delete
resource "azurerm_storage_account" "sa" {
  name                     = "contosodevstore001"
  resource_group_name      = data.azurerm_resource_group.existing.name
  location                 = data.azurerm_resource_group.existing.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
```

**When to use data sources:** Shared networking owned by a central team, existing DNS zone, manually created Key Vault you don't want Terraform to delete. Data sources **look up**; they never appear as "will be destroyed" in plan unless you remove the data block itself.

## What are variables, outputs, and locals?

These separate **inputs**, **computed values**, and **exported results**:

```hcl
variable "environment" {
  type        = string
  description = "Environment name: dev, staging, prod"
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}

locals {
  name_prefix = "contoso-${var.environment}"
  common_tags = {
    environment = var.environment
    managed_by  = "terraform"
    cost_center = "platform"
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "${local.name_prefix}-rg"
  location = var.location
  tags     = local.common_tags
}

output "resource_group_id" {
  value       = azurerm_resource_group.rg.id
  description = "Pass to other Terraform stacks or pipelines"
}
```

| Construct | Purpose | Set by |
|-----------|---------|--------|
| **variable** | Input from outside | `terraform.tfvars`, `-var`, `TF_VAR_*` env |
| **local** | Internal computed value | Expressions in `.tf` files |
| **output** | Expose values after apply | Other stacks, CI scripts, humans |

**File conventions (team standard):**

| File | Contents |
|------|----------|
| `variables.tf` | Variable declarations |
| `outputs.tf` | Output declarations |
| `locals.tf` | Local values (optional) |
| `terraform.tfvars` | Actual values — **gitignore if secrets** |
| `terraform.tfvars.example` | Committed template without secrets |

Pass secrets via `TF_VAR_db_password` environment variable in CI — never commit passwords to git.

## What is Terraform state, and why is it important?

**State** is Terraform's memory. The file `terraform.tfstate` (JSON) maps:

```text
azurerm_resource_group.rg  →  /subscriptions/.../resourceGroups/rg-contoso-dev
azurerm_storage_account.sa →  /subscriptions/.../storageAccounts/contosodevstore
```

Without state, Terraform doesn't know which real Azure resource matches `azurerm_resource_group.rg` — it would try to **create duplicates** on every apply.

| State storage | Problem it solves |
|---------------|-------------------|
| **Local** (default) | Fine for solo learning; bad for teams |
| **Remote backend** | Shared truth for whole team + CI |
| **State locking** | Prevents two applies corrupting state simultaneously |

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-tfstate"
    storage_account_name = "contosotfstate"
    container_name       = "tfstate"
    key                  = "shop/dev.terraform.tfstate"
  }
}
```

**First-time setup:** Create storage account + container manually (or bootstrap stack), then `terraform init` configures the backend. **Enable versioning** on the storage account — state backup is disaster recovery.

**Interview must-know:** State contains resource IDs and sometimes **sensitive values** — treat state storage as highly confidential.

## What is the difference between managed and data resources?

| | **Managed resource** (`resource`) | **Data source** (`data`) |
|--|-----------------------------------|--------------------------|
| **Terraform lifecycle** | Create, update, delete | Read only |
| **In plan output** | `+ create`, `~ update`, `- destroy` | `<= read` |
| **Example** | `resource "aws_s3_bucket" "logs"` | `data "aws_vpc" "default"` |

**Importing existing infra** — when resources were created manually or by another tool, bring them under Terraform management:

```bash
# 1. Write matching resource block in .tf
# 2. Import into state (does NOT change Azure resource)
terraform import azurerm_resource_group.rg /subscriptions/xxx/resourceGroups/rg-contoso

# 3. terraform plan — should show no changes if config matches reality
```

Import is **per resource** and tedious at scale — prefer greenfield Terraform or tools like Azure Export for Terraform (where available).

## How do you organize Terraform for a small project?

Start simple; refactor when pain appears:

```text
infra/
  main.tf              # primary resources OR callsites by concern
  variables.tf
  outputs.tf
  providers.tf
  versions.tf          # terraform + provider version constraints
  terraform.tfvars.example
  modules/
    network/           # reusable VNet module
    aks/               # reusable AKS module
  environments/
    dev/
      main.tf          # calls modules with dev vars
      terraform.tfvars
      backend.tf       # key = "shop/dev.tfstate"
    prod/
      main.tf
      terraform.tfvars
      backend.tf       # key = "shop/prod.tfstate"
```

**Guidelines:**
- **One state file per environment** (dev/prod) — never share state between envs.
- **Modules** when the same pattern repeats twice (VNet, AKS, SQL).
- **Don't over-module early** — a 200-line flat `main.tf` is fine for learning.

## What is terraform fmt, validate, and plan in CI?

Infrastructure changes should go through the same PR process as code:

```yaml
# Azure Pipelines example
- script: |
    cd infra/environments/dev
    terraform init -input=false
    terraform fmt -check -recursive
    terraform validate
    terraform plan -input=false -out=tfplan -var-file=terraform.tfvars
  displayName: Terraform fmt, validate, plan
  env:
    ARM_USE_OIDC: true
    ARM_CLIENT_ID: $(AZURE_CLIENT_ID)
    ARM_TENANT_ID: $(AZURE_TENANT_ID)
    ARM_SUBSCRIPTION_ID: $(AZURE_SUBSCRIPTION_ID)

# Separate stage with manual approval for apply
- script: terraform apply -input=false tfplan
  displayName: Terraform apply (approved plan only)
```

| CI check | Catches |
|----------|---------|
| `fmt -check` | Inconsistent formatting — fails PR |
| `validate` | Syntax errors, wrong attribute names |
| `plan` | Unexpected destroys, drift, permission issues |
| **Policy scan** (optional) | Checkov, tfsec — public IPs, open SG rules |

**Scheduled `plan` on prod** (no apply) detects **drift** — someone changed resources in the portal.

## What are common Terraform interview questions?

Be ready to explain these clearly:

| Topic | Strong answer includes |
|-------|------------------------|
| **State** | Maps config to real IDs; remote backend + locking for teams |
| **Plan vs apply** | Plan is dry-run; apply executes; use saved plan in CI |
| **Secrets** | Key Vault data source, `TF_VAR_`, never in git; state is sensitive |
| **Modules** | Reuse, versioning, public registry vs private |
| **Drift** | Manual portal edit → next plan shows diff |
| **Import vs replace** | Import adopts existing; replace destroys and recreates |
| **count vs for_each** | for_each stable keys; count index shifts cause recreation |
| **Provider vs module** | Provider = API plugin; module = reusable config package |

## When should you not use Terraform?

Terraform is for **relatively stable infrastructure**, not dynamic runtime behavior:

| Scenario | Better tool |
|----------|-------------|
| App feature flags / runtime config | Azure App Configuration, LaunchDarkly |
| One-off emergency portal fix | Portal/CLI — then import or codify later |
| Deploying app containers daily | CI/CD + Helm/Argo CD, not Terraform |
| Autoscaling pod count | HPA/KEDA — changes every minute |
| Application secret rotation at runtime | Key Vault + app SDK, External Secrets Operator |

**Terraform sweet spot:** Networks, IAM roles, databases, Kubernetes clusters, DNS zones, storage accounts — things that change on **release cycles**, not **request cycles**.

## Related Topics

- Terraform/Terraform State Modules and Workflows.md
- Terraform/Terraform Multi-Cloud Providers.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Important Concepts/Cloud Provider Comparison.md
