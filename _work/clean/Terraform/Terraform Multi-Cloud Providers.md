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

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = true
    }
  }
  subscription_id = var.subscription_id
  # use_cli = true  # local dev with az login
}
```

Common resources: `azurerm_resource_group`, `azurerm_virtual_network`, `azurerm_kubernetes_cluster`, `azurerm_storage_account`, `azurerm_key_vault`.

## How do you configure the AWS provider?

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
  region = var.aws_region
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

Resources: `aws_vpc`, `aws_subnet`, `aws_eks_cluster`, `aws_s3_bucket`, `aws_iam_role`.

## How do you configure the Google Cloud provider?

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
  region  = var.gcp_region
}
```

Resources: `google_compute_network`, `google_container_cluster`, `google_storage_bucket`, `google_service_account`.

## How do you authenticate Terraform to Azure without secrets in code?

| Method | Use |
|--------|-----|
| **`az login`** | Local development |
| **Service principal + client secret** | CI (legacy) |
| **OIDC federated credentials** | GitHub Actions / Azure Pipelines — **preferred** |
| **Managed identity** | Self-hosted agent on Azure VM |

```yaml
# Azure Pipelines — ARM_USE_OIDC=true
- task: TerraformTaskV4@4
  env:
    ARM_USE_OIDC: true
    ARM_CLIENT_ID: $(AZURE_CLIENT_ID)
    ARM_TENANT_ID: $(AZURE_TENANT_ID)
    ARM_SUBSCRIPTION_ID: $(AZURE_SUBSCRIPTION_ID)
```

Never commit `client_secret` in `terraform.tfvars`.

## How do you use IAM roles for Terraform on AWS?

```hcl
provider "aws" {
  assume_role {
    role_arn = "arn:aws:iam::123456789012:role/TerraformDeployRole"
  }
}
```

CI: GitHub Actions OIDC → `aws-actions/configure-aws-credentials` → short-lived token.

**Least privilege policy** — only permissions TF needs (often split: network admin vs app deploy roles).

## How do you provision networking on Azure, AWS, and GCP with Terraform?

**Azure:**

```hcl
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-contoso"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}
```

**AWS:**

```hcl
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
}
```

**GCP:**

```hcl
resource "google_compute_network" "vpc" {
  name                    = "vpc-contoso"
  auto_create_subnetworks = false
}
```

See **Cloud Provider Comparison** for service mapping table.

## How do you create a Kubernetes cluster with Terraform?

**AKS:**

```hcl
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "aks-contoso"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  dns_prefix          = "contoso"

  default_node_pool {
    name       = "default"
    node_count = 3
    vm_size    = "Standard_D4s_v5"
  }

  identity {
    type = "SystemAssigned"
  }
}
```

**EKS / GKE** — use official modules (`terraform-aws-modules/eks/aws`, `terraform-google-modules/kubernetes-engine`).

Post-apply: `azurerm_kubernetes_cluster.aks.kube_config` → Kubernetes provider for in-cluster resources.

## How do you manage secrets in Terraform?

| Approach | Detail |
|----------|--------|
| **Never in git** | `.gitignore` `*.tfvars` with secrets |
| **Environment variables** | `TF_VAR_db_password` |
| **Key Vault / Secrets Manager data source** | Read at apply time |
| **Sensitive outputs** | Mark `sensitive = true` |

```hcl
data "azurerm_key_vault_secret" "db_password" {
  name         = "db-admin-password"
  key_vault_id = azurerm_key_vault.kv.id
}

resource "azurerm_mssql_server" "sql" {
  administrator_login_password = data.azurerm_key_vault_secret.db_password.value
}
```

Consider **External Secrets Operator** for runtime secrets in K8s — not in TF state if avoidable.

## What is Terraform Cloud and when use it?

**Terraform Cloud / HCP Terraform** — managed remote state, runs, policy (Sentinel/OPA), VCS-driven workflow.

| Use when | Skip when |
|----------|-----------|
| Team needs RBAC on applies | Simple solo projects |
| Policy as code required | Already have Azure DevOps + Storage backend |
| Private module registry | Cost-sensitive |

Alternative: **Azure Storage backend + Azure Pipelines** — common in Azure shops.

## How do you combine Terraform with Helm or Kubernetes provider?

**Pattern:** TF provisions cluster + IAM; Helm deploys apps.

```hcl
provider "kubernetes" {
  host                   = azurerm_kubernetes_cluster.aks.kube_config[0].host
  client_certificate     = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].client_certificate)
  client_key             = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].client_key)
  cluster_ca_certificate = base64decode(azurerm_kubernetes_cluster.aks.kube_config[0].cluster_ca_certificate)
}

resource "helm_release" "nginx" {
  name       = "ingress-nginx"
  repository = "https://kubernetes.github.io/ingress-nginx"
  chart      = "ingress-nginx"
  namespace  = "ingress"
}
```

**Split responsibility:** platform team = TF; app team = Helm/Argo CD.

## What is a typical multi-cloud Terraform repo layout?

```text
terraform/
  modules/
    azure-network/
    aws-network/
  live/
    azure/prod/
    aws/prod/
  policies/           # OPA/Sentinel optional
```

Or **monorepo per cloud** if teams split. Share **naming/tagging standards** via docs, not always shared modules (APIs differ).

## How does Terraform compare to cloud-native IaC per platform?

| Platform | Native IaC | When native wins |
|----------|------------|------------------|
| **Azure** | Bicep/ARM | Azure-only, Policy, RBAC deep integration |
| **AWS** | CloudFormation/CDK | AWS-only, SAM for serverless |
| **GCP** | Deployment Manager/Config Connector | GKE-centric GitOps |

**Hybrid orgs:** Terraform for portable base; cloud-native for app-specific templates.

## Related Topics

- Terraform/Terraform Basics.md
- Important Concepts/Cloud Provider Comparison.md
- Azure Cloud 1/Azure Basics.md
- AWS/AWS Basics.md
- Google Cloud/Google Cloud Basics.md
