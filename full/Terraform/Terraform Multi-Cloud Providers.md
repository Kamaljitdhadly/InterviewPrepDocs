# Terraform Multi-Cloud Providers

## Questions Covered

1. How do you configure the Azure (azurerm) provider?
2. How do you configure the AWS provider?
3. How do you configure the Google Cloud provider?
4. How do you authenticate Terraform to Azure without secrets in code?
5. How do you use IAM roles for Terraform on AWS?
6. How do you provision networking on Azure, AWS, and GCP with Terraform?
7. How do you create a Kubernetes cluster with Terraform?
8. How do you manage secrets in Terraform?
9. What is Terraform Cloud and when use it?
10. How do you combine Terraform with Helm or Kubernetes provider?
11. What is a typical multi-cloud Terraform repo layout?
12. How does Terraform compare to cloud-native IaC per platform?

## How do you configure the Azure (azurerm) provider?

The **azurerm** provider is Terraform's plugin for Azure Resource Manager — it creates VMs, VNets, AKS, SQL, Key Vault, and hundreds of other Azure resources.

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"    # pessimistic constraint: >= 4.0, < 5.0
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
  subscription_id = var.subscription_id
  # Local dev: omit subscription_id and run `az login` — provider uses CLI creds
}
```

**Common azurerm resources in interviews:**

| Resource | Purpose |
|----------|---------|
| `azurerm_resource_group` | Container for related resources |
| `azurerm_virtual_network` / `azurerm_subnet` | Networking |
| `azurerm_kubernetes_cluster` | AKS |
| `azurerm_storage_account` | Blob storage |
| `azurerm_key_vault` | Secrets, certificates |
| `azurerm_linux_web_app` | App Service (.NET, Node) |

**Provider `features {}` block is required** — it configures Azure-specific behaviors (soft delete, RG deletion guards). Read provider docs when upgrading major versions — defaults can change.

## How do you configure the AWS provider?

The **aws** provider talks to AWS APIs — EC2, VPC, S3, EKS, RDS, IAM, etc.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region   # e.g. us-east-1

  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
      Project     = "contoso-shop"
    }
  }
}
```

**default_tags** (AWS provider 3.x+) automatically applies tags to all supported resources — great for cost allocation without repeating `tags =` on every resource.

**Common aws resources:**

| Resource | Azure equivalent |
|----------|------------------|
| `aws_vpc` | Virtual Network |
| `aws_s3_bucket` | Blob Storage |
| `aws_eks_cluster` | AKS |
| `aws_rds_instance` | Azure SQL / PostgreSQL Flexible |
| `aws_iam_role` | Managed Identity + RBAC |

See **Cloud Provider Comparison.md** for full mapping tables.

## How do you configure the Google Cloud provider?

The **google** provider manages GCP resources — Compute Engine, GKE, Cloud Storage, Cloud SQL.

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region      # e.g. us-central1
  zone    = var.gcp_zone        # optional, for zonal resources
}
```

**Authentication locally:** `gcloud auth application-default login`

**Common google resources:** `google_compute_network`, `google_container_cluster` (GKE), `google_storage_bucket`, `google_sql_database_instance`.

**Multi-provider note:** A single Terraform root module can use **multiple providers** (azurerm + aws) for true multi-cloud — but most teams use **separate state per cloud** for simpler blast radius.

## How do you authenticate Terraform to Azure without secrets in code?

Hard-coded client secrets in `terraform.tfvars` end up in git history. Prefer **short-lived, federated credentials**.

| Method | Use case |
|--------|----------|
| **`az login`** | Local developer laptop |
| **Service principal + secret** | Legacy CI — rotate regularly |
| **OIDC / workload identity federation** | GitHub Actions, Azure Pipelines — **preferred** |
| **Managed identity** | Self-hosted agent VM on Azure |

**OIDC in Azure Pipelines:**

```yaml
- task: TerraformTaskV4@4
  displayName: Terraform plan
  inputs:
    provider: azurerm
    command: plan
    workingDirectory: infra/environments/prod
  env:
    ARM_USE_OIDC: true
    ARM_CLIENT_ID: $(AZURE_CLIENT_ID)
    ARM_TENANT_ID: $(AZURE_TENANT_ID)
    ARM_SUBSCRIPTION_ID: $(AZURE_SUBSCRIPTION_ID)
```

**Setup summary:**
1. Entra ID **App registration** with federated credential for your CI issuer.
2. Grant app **Contributor** (or custom role) on target subscription/RG.
3. Pipeline authenticates without storing `ARM_CLIENT_SECRET`.

**Environment variables Terraform reads for Azure:**

| Variable | Purpose |
|----------|---------|
| `ARM_SUBSCRIPTION_ID` | Target subscription |
| `ARM_TENANT_ID` | Entra tenant |
| `ARM_CLIENT_ID` | Service principal / app ID |
| `ARM_CLIENT_SECRET` | Legacy secret auth (avoid) |
| `ARM_USE_OIDC` | Enable federated token auth |

## How do you use IAM roles for Terraform on AWS?

Same principle — **least privilege** and **no long-lived keys in git**.

**Assume role in provider (cross-account or CI role):**

```hcl
provider "aws" {
  region = "us-east-1"
  assume_role {
    role_arn     = "arn:aws:iam::123456789012:role/TerraformDeployRole"
    session_name = "terraform-ci"
  }
}
```

**GitHub Actions OIDC (no static AWS keys):**

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsTerraform
    aws-region: us-east-1

- run: terraform plan
  working-directory: infra/aws/prod
```

**Split roles by concern:**
- `TerraformNetworkRole` — VPC, subnets, route tables
- `TerraformAppRole` — RDS, ECS, Lambda
- Prevents one compromised pipeline from owning entire account

## How do you provision networking on Azure, AWS, and GCP with Terraform?

Networking is usually the **first Terraform stack** — everything else depends on it. Patterns are similar; names differ.

**Azure — VNet + subnet:**

```hcl
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${var.environment}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "app" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}
```

**AWS — VPC + subnet:**

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = { Name = "contoso-vpc" }
}

resource "aws_subnet" "app" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "${var.aws_region}a"
}
```

Wait I made a typo - `aws it` should be `aws_vpc` "main". Let me fix the file when writing - I'll write the correct version.

**GCP — custom VPC (no auto subnets):**

```hcl
resource "google_compute_network" "vpc" {
  name                    = "vpc-contoso"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "app" {
  name          = "subnet-app"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.gcp_region
  network       = google_compute_network.vpc.id
}
```

**Design tips:**
- Use **non-overlapping CIDRs** per environment/VNet for future peering/VPN.
- Put **databases in private subnets** with no public IP.
- Terraform **modules** from registry for VPC (especially AWS `terraform-aws-modules/vpc`) save weeks of work.

## How do you create a Kubernetes cluster with Terraform?

Platform teams often provision clusters with Terraform; app teams deploy with Helm/Argo CD.

**AKS (Azure):**

```hcl
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-contoso-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "contoso-${var.environment}"
  kubernetes_version  = "1.29"

  default_node_pool {
    name           = "default"
    node_count     = var.node_count
    vm_size        = "Standard_D4s_v5"
    vnet_subnet_id = azurerm_subnet.aks.id
  }

  identity {
    type = "SystemAssigned"
  }

  network_profile {
    network_plugin = "azure"
  }
}

output "kube_config" {
  value     = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}
```

**EKS / GKE** — prefer community modules:
- `terraform-aws-modules/eks/aws`
- `terraform-google-modules/kubernetes-engine/google//modules/private-cluster`

**After cluster exists:** Configure **Kubernetes** and **Helm** providers using cluster credentials to install ingress, monitoring, etc.

**Division of labor:**

```text
Terraform:  VNet, AKS/EKS/GKE, node pools, IAM, ACR/ECR integration
Helm/Argo:  app deployments, ingress rules, ConfigMaps (change daily)
```

## How do you manage secrets in Terraform?

Secrets in Terraform touch **three risk areas:** git, state file, and plan output.

| Approach | Detail |
|----------|--------|
| **Never commit secrets** | `.gitignore` `*.tfvars`, `*.auto.tfvars` with passwords |
| **`TF_VAR_*` env vars** | `export TF_VAR_db_password='...'` in CI secret variable |
| **Key Vault / Secrets Manager data source** | Read at apply time |
| **`sensitive = true`** | Masks in plan output; still stored in state |

```hcl
variable "db_password" {
  type      = string
  sensitive = true
}

data "azurerm_key_vault_secret" "db_password" {
  name         = "sql-admin-password"
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_postgresql_flexible_server" "db" {
  name                   = "psql-contoso-${var.environment}"
  administrator_login    = "psqladmin"
  administrator_password = data.azurerm_key_vault_secret.db_password.value
  # ...
}
```

**State contains secrets** if you pass them to resources — encrypt state at rest (Azure Storage SSE, S3 encryption), restrict RBAC on state bucket.

**Runtime app secrets** (connection strings in running pods) — use **External Secrets Operator** or Key Vault CSI driver; don't bake into Terraform-managed ConfigMaps unless necessary.

**Anti-pattern:** `password = "P@ssw0rd123"` in `.tf` file committed to git.

## What is Terraform Cloud and when use it?

**HCP Terraform** (formerly Terraform Cloud) is HashiCorp's managed platform for Terraform runs, state, and governance.

| Feature | Benefit |
|---------|---------|
| **Remote runs** | `plan`/`apply` execute on HashiCorp agents |
| **Remote state** | Built-in, no S3/Azure Storage setup |
| **VCS integration** | PR triggers speculative plan with comment |
| **Policy as code** | Sentinel or OPA — block public S3 buckets |
| **Private module registry** | Share internal modules with versioning |
| **RBAC** | Who can plan vs apply to prod workspace |

| Use HCP Terraform when | Use Azure Storage + Azure Pipelines when |
|------------------------|------------------------------------------|
| Multi-cloud, HashiCorp standard | Already all-in on Azure DevOps |
| Need policy-as-code on every apply | Cost-sensitive, simple team |
| Want VCS-driven workflow out of box | Self-hosted agents in private VNet |

**Many Azure shops skip Terraform Cloud** and use **azurerm backend + Azure Pipelines TerraformTask** — equally valid; know both options in interviews.

## How do you combine Terraform with Helm or Kubernetes provider?

**Layered infrastructure model:**

```text
Layer 1 (Terraform):  Cloud networking, K8s cluster, IAM, DNS, databases
Layer 2 (Helm/Argo):  Ingress controller, cert-manager, app charts
Layer 3 (CI/CD):      Container image deploys on every commit
```

**Kubernetes provider** — manage K8s resources after cluster exists:

```hcl
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.aks.kube_config[0].host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].cluster_ca_certificate)
}

resource "kubernetes_namespace" "ingress" {
  metadata { name = "ingress" }
}
```

**Helm provider** — install charts:

```hcl
resource "helm_release" "ingress_nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = kubernetes_namespace.ingress.metadata[0].name
  version    = "4.10.0"
}
```

**Caution:** Managing hundreds of microservice deployments in Terraform is painful — use **Argo CD** or pipeline-based Helm for apps. Terraform Helm provider fits **platform components** (ingress, monitoring stack) that change rarely.

## What is a typical multi-cloud Terraform repo layout?

Organize for **clear ownership** and **isolated state**:

```text
terraform/
  README.md
  modules/                    # shared internal modules
    azure-network/
    azure-aks/
    aws-vpc/
  live/                       # root modules — one folder = one state
    azure/
      networking/
        main.tf
        backend.tf            # key: azure/networking/prod.tfstate
      aks/
        main.tf
        backend.tf            # key: azure/aks/prod.tfstate
    aws/
      networking/
        main.tf
  .checkov.yml                # optional policy scan config
```

**Principles:**
- **One state per stack** — networking separate from AKS so AKS changes don't risk VPC
- **Modules are libraries** — `live/` folders call modules with env-specific vars
- **Don't force one module across clouds** — Azure VNet ≠ AWS VPC; share *patterns*, not identical HCL
- **Consistent tagging** via `locals.common_tags` in every root module

**Alternative:** Monorepo per cloud if platform teams split (`terraform-azure/`, `terraform-aws/`).

## How does Terraform compare to cloud-native IaC per platform?

| Platform | Native IaC | Strengths | When to prefer native |
|----------|------------|-----------|----------------------|
| **Azure** | Bicep → ARM | Azure Policy, RBAC integration, what-if | Azure-only, Microsoft support |
| **AWS** | CloudFormation, CDK | Deep AWS service day-one support, SAM | AWS-only, CDK for devs who want TypeScript |
| **GCP** | Deployment Manager, Config Connector | GKE Config Sync | GKE-centric GitOps shops |

**Hybrid org pattern (common in enterprise):**

```text
Terraform:     networking, DNS, shared services, multi-cloud DR site
Bicep/CDK:     app-specific resources tightly coupled to Azure/AWS services
Helm/Argo:     Kubernetes workloads
Pipelines:     orchestrate plan/apply with approvals
```

**Interview framing:** "We chose Terraform for the **platform layer** because we operate Azure and AWS. App teams use **Bicep** for App Service specifics where Azure-native features matter. It's not either/or."

## Related Topics

- Terraform/Terraform Basics.md
- Terraform/Terraform State Modules and Workflows.md
- Important Concepts/Cloud Provider Comparison.md
- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Azure Cloud/Azure Basics.md
