# AWS Basics

## Questions Covered

1. What is Amazon Web Services (AWS), and how does it compare to Azure and GCP?
2. What are AWS regions, Availability Zones, and Local Zones?
3. What is the AWS global infrastructure hierarchy?
4. What is the difference between IaaS, PaaS, and SaaS on AWS?
5. What is the AWS shared responsibility model?
6. What are AWS accounts, Organizations, and organizational units (OUs)?
7. What are tags, and how do you use them for cost management?
8. What is the AWS Well-Architected Framework?
9. How does AWS pricing work (on-demand, Reserved, Savings Plans, Spot)?
10. What is the AWS Management Console, CLI, and CloudShell?
11. What is Infrastructure as Code on AWS (CloudFormation, CDK, Terraform)?
12. What is an AWS SLA, and how do you design for high availability?
13. How do you choose the right AWS region?
14. What is the AWS Free Tier?

## What is Amazon Web Services (AWS), and how does it compare to Azure and GCP?

**Amazon Web Services (AWS)** is the largest public cloud platform — compute, storage, databases, networking, ML, and 200+ services. Pioneer of cloud computing (2006).

| Aspect | AWS | Azure | GCP |
|--------|-----|-------|-----|
| **Market position** | Largest share, broadest catalog | Strong enterprise / Microsoft stack | Data analytics, Kubernetes |
| **Identity** | IAM | Entra ID | Cloud IAM |
| **Object storage** | S3 | Blob Storage | Cloud Storage |
| **Managed Kubernetes** | EKS | AKS | GKE |
| **Serverless compute** | Lambda | Functions | Cloud Functions |
| **Enterprise hook** | AWS Organizations, Control Tower | Entra ID, hybrid | BigQuery, GKE |

**Interview angle:** Know **service mappings** — EC2 ≈ VM, VPC ≈ VNet, S3 ≈ Blob, RDS ≈ Azure SQL, IAM ≈ Azure RBAC + identity.

## What are AWS regions, Availability Zones, and Local Zones?

| Term | Definition |
|------|------------|
| **Region** | Geographic area with ≥2 isolated AZs (e.g. `us-east-1`, `eu-west-1`) |
| **Availability Zone (AZ)** | One or more datacenters with independent power/network |
| **Local Zone** | Extension of a region — closer to users for ultra-low latency |
| **Wavelength Zone** | 5G edge locations for mobile apps |

```text
Region: us-east-1 (N. Virginia)
  ├── us-east-1a  (AZ)
  ├── us-east-1b  (AZ)
  └── us-east-1c  (AZ)
```

Deploy production across **≥2 AZs** for fault tolerance. Some services are **global** (IAM, Route 53, CloudFront); most are **regional** (EC2, RDS, S3 bucket home region).

## What is the AWS global infrastructure hierarchy?

```text
AWS Organization (optional)
  └── Account(s) — billing + security boundary
        └── Region
              └── VPC (per region)
                    └── Subnet (per AZ)
                          └── Resources (EC2, RDS, Lambda in VPC, etc.)
```

| Scope | Examples |
|-------|----------|
| **Global** | IAM, Route 53, CloudFront, WAF (CloudFront scope) |
| **Regional** | EC2, VPC, RDS, Lambda, S3 (bucket tied to region) |
| **AZ-specific** | Subnet, EC2 instance placement |

Unlike Azure resource groups, AWS has **no mandatory grouping** — use tags, CloudFormation stacks, or AWS Resource Groups.

## What is the difference between IaaS, PaaS, and SaaS on AWS?

| Model | AWS examples | You manage |
|-------|--------------|------------|
| **IaaS** | EC2, EBS | OS, apps, data, middleware |
| **PaaS** | Elastic Beanstalk, RDS, ECS Fargate | Apps and data |
| **SaaS** | Amazon Chime, WorkSpaces (where applicable) | Config and data only |
| **Serverless** | Lambda, API Gateway, DynamoDB (managed) | Code and config |

```text
Lift-and-shift legacy app     → EC2
New web API, minimal ops      → Elastic Beanstalk or Lambda + API Gateway
Managed relational DB         → RDS / Aurora
```

## What is the AWS shared responsibility model?

| Layer | AWS | Customer |
|-------|-----|----------|
| **Physical infrastructure** | ✓ | |
| **Hypervisor / host** | ✓ | |
| **Guest OS (EC2)** | | ✓ |
| **Network config (VPC, SG)** | Shared | Shared |
| **Application code** | | ✓ |
| **Data classification** | | ✓ |
| **IAM policies** | | ✓ |

**PaaS (RDS, Lambda):** AWS patches OS/runtime; you manage data access and app logic.

## What are AWS accounts, Organizations, and organizational units (OUs)?

| Concept | Purpose |
|---------|---------|
| **AWS account** | Security + billing boundary; root user + IAM users/roles |
| **Organizations** | Consolidate billing; SCPs; multi-account strategy |
| **OU** | Group accounts (Prod, Dev, Security, Sandbox) |
| **SCP (Service Control Policy)** | Guardrails — max permissions for accounts in OU |

```text
Organization
  ├── OU: Production
  │     ├── Account: prod-app
  │     └── Account: prod-data
  ├── OU: Development
  │     └── Account: dev-shared
  └── OU: Security (log archive, audit)
```

**Best practice:** Separate **prod/non-prod accounts**; no shared root credentials; use **IAM Identity Center (SSO)** for human access.

## What are tags, and how do you use them for cost management?

**Tags** — key-value metadata on resources (`Environment=prod`, `Team=platform`).

```bash
aws ec2 create-tags --resources i-0abc123 --tags Key=Environment,Value=Production Key=CostCenter,Value=CC-1001
```

| Use | Tag examples |
|-----|--------------|
| **Cost allocation** | `CostCenter`, `Project`, `Owner` |
| **Automation** | `Backup=daily`, `AutoShutdown=true` |
| **Security** | `DataClass=confidential` |

Enable **Cost Allocation Tags** in Billing console; use **Cost Explorer** and **Budgets** for reports.

## What is the AWS Well-Architected Framework?

Six pillars (AWS added **Sustainability**):

| Pillar | Focus |
|--------|-------|
| **Operational Excellence** | Observability, IaC, runbooks |
| **Security** | IAM least privilege, encryption, detection |
| **Reliability** | Multi-AZ, backups, change management |
| **Performance Efficiency** | Right-sizing, caching, serverless |
| **Cost Optimization** | Reserved/Spot, lifecycle policies |
| **Sustainability** | Efficient resource use, region selection |

Use **Well-Architected Tool** in console for workload reviews.

## How does AWS pricing work (on-demand, Reserved, Savings Plans, Spot)?

| Model | Description | Savings |
|-------|-------------|---------|
| **On-Demand** | Pay per hour/second, no commit | Baseline |
| **Reserved Instances** | 1–3 year commit per instance type/region | Up to ~72% |
| **Savings Plans** | $/hour commit — flexible across instance families | Up to ~72% |
| **Spot Instances** | Bid on spare capacity — can be interrupted | Up to ~90% |
| **Dedicated Hosts** | Physical server for compliance/licensing |

```bash
# Spot instance request (example)
aws ec2 run-instances --image-id ami-0abc123 --instance-type t3.medium \
  --instance-market-options MarketType=spot,SpotOptions='{MaxPrice=0.05}'
```

**S3/storage:** pay for storage class + requests + transfer out.

## What is the AWS Management Console, CLI, and CloudShell?

| Tool | Use |
|------|-----|
| **Console** | Web UI — all services |
| **AWS CLI** | Scripting, CI/CD — `aws` command |
| **CloudShell** | Browser shell with CLI pre-installed (per region) |
| **AWS SDK** | Programmatic access (.NET, Java, Python, etc.) |

```bash
aws configure
aws sts get-caller-identity
aws ec2 describe-instances --region us-east-1 --output table
```

**Profiles:** `~/.aws/credentials` + `~/.aws/config` for multiple accounts.

## What is Infrastructure as Code on AWS (CloudFormation, CDK, Terraform)?

| Tool | Description |
|------|-------------|
| **CloudFormation** | Native JSON/YAML templates — stacks |
| **AWS CDK** | TypeScript/Python/C# → CloudFormation |
| **Terraform** | Multi-cloud HCL — widely used |
| **SAM** | Serverless Application Model — Lambda/API Gateway |

```yaml
# CloudFormation snippet
Resources:
  MyBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub '${AWS::StackName}-data'
      VersioningConfiguration:
        Status: Enabled
```

```bash
aws cloudformation deploy --template-file template.yaml --stack-name myapp-dev --capabilities CAPABILITY_IAM
```

## What is an AWS SLA, and how do you design for high availability?

| Pattern | Availability approach |
|---------|----------------------|
| **Single AZ** | Lowest — AZ outage = downtime |
| **Multi-AZ (active/passive)** | RDS Multi-AZ, standby in another AZ |
| **Multi-AZ (active/active)** | ALB across AZs + ASG |
| **Multi-region** | Route 53 failover, S3 CRR, DynamoDB global tables |

Most services publish SLAs (e.g. S3 99.99%, EC2 regional SLA depends on design). **Your architecture** determines effective uptime.

## How do you choose the right AWS region?

| Factor | Check |
|--------|-------|
| **Latency** | Closest to users |
| **Compliance** | Data residency (GDPR, etc.) |
| **Service availability** | Not all instance types/Services everywhere |
| **Pricing** | Varies by region |
| **Disaster recovery** | Pair with second region for critical apps |

```bash
aws ec2 describe-instance-type-offerings --location-type region --filters Name=instance-type,Values=t3.medium --region us-west-2
```

## What is the AWS Free Tier?

| Type | Detail |
|------|--------|
| **12-month free tier** | EC2 t2/t3.micro hours, RDS, Lambda requests (new accounts) |
| **Always free** | Lambda 1M requests/month, DynamoDB 25 GB, etc. |
| **Trials** | Short-term service trials |

Monitor with **Billing alarms** — free tier exhaustion charges real costs.

## Related Topics

- **AWS Compute.md** — EC2, Lambda, ECS, EKS
- **AWS Identity and IAM.md** — accounts, roles, policies
- **AWS CLI and Commands.md** — essential CLI operations
- **Azure Cloud 1/Azure Basics.md** — compare with Azure
