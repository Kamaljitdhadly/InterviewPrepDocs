# Cloud Provider Comparison

## Questions Covered

1. How do Azure, AWS, and GCP compare at a high level?
2. What is the service mapping for compute across the three clouds?
3. What is the service mapping for networking and load balancing?
4. What is the service mapping for storage and object stores?
5. What is the service mapping for relational and NoSQL databases?
6. What is the service mapping for identity and IAM?
7. What is the service mapping for messaging and eventing?
8. What is the service mapping for serverless and containers?
9. What is the service mapping for API management and CDN?
10. What is the service mapping for monitoring and logging?
11. How do you choose between Azure, AWS, and GCP?
12. What are hybrid and multi-cloud considerations?

## How do Azure, AWS, and GCP compare at a high level?

| Dimension | **Microsoft Azure** | **Amazon AWS** | **Google Cloud (GCP)** |
|-----------|---------------------|----------------|------------------------|
| **Strengths** | Enterprise Microsoft stack, hybrid, Entra ID | Broadest catalog, maturity, market share | Data analytics, GKE, ML/BigQuery |
| **Identity** | Microsoft Entra ID | IAM | Cloud IAM |
| **Default K8s story** | AKS | EKS | GKE (often considered best-in-class) |
| **Enterprise hook** | M365, Active Directory, SAP | Largest partner ecosystem | Kubernetes origin, AI/ML |
| **Billing** | Subscriptions, RBAC | Accounts, Organizations | Projects, org hierarchy |
| **IaC common** | Bicep, Terraform | CloudFormation, Terraform | Terraform, Deployment Manager |

**Interview framing:** Know **equivalent service names** — interviewers often ask "What's AWS X in Azure?"

## What is the service mapping for compute across the three clouds?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Virtual machines** | Virtual Machines | EC2 | Compute Engine |
| **VM scale set / ASG** | VM Scale Sets | Auto Scaling Groups | Managed Instance Groups |
| **Platform PaaS (web)** | App Service | Elastic Beanstalk | App Engine |
| **Serverless functions** | Azure Functions | Lambda | Cloud Functions |
| **Container orchestration** | AKS | EKS | GKE |
| **Serverless containers** | Container Apps | Fargate (ECS/EKS) | Cloud Run |
| **Batch / HPC** | Azure Batch | AWS Batch | Batch |

```text
Lift-and-shift legacy     → VM / EC2 / Compute Engine
Managed web API (.NET)    → App Service / Elastic Beanstalk / Cloud Run
Event-driven microtask    → Functions / Lambda / Cloud Functions
Kubernetes platform       → AKS / EKS / GKE
```

## What is the service mapping for networking and load balancing?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Virtual network** | Virtual Network (VNet) | VPC | VPC Network |
| **Subnet / NSG** | Subnet + NSG | Subnet + Security Group | Subnet + Firewall rules |
| **Public IP** | Public IP | Elastic IP | External IP |
| **L4 load balancer** | Azure Load Balancer | Network Load Balancer (NLB) | TCP/UDP load balancing |
| **L7 load balancer** | Application Gateway | Application Load Balancer (ALB) | HTTP(S) Load Balancing |
| **Global traffic manager** | Azure Front Door / Traffic Manager | Route 53 + CloudFront | Cloud Load Balancing + Cloud CDN |
| **Private connectivity** | Private Link | VPC Endpoints / PrivateLink | Private Service Connect |
| **VPN / ExpressRoute** | VPN Gateway / ExpressRoute | Site-to-Site VPN / Direct Connect | Cloud VPN / Cloud Interconnect |
| **DNS** | Azure DNS | Route 53 | Cloud DNS |
| **WAF** | WAF (Front Door / App Gateway) | WAF (ALB / CloudFront) | Cloud Armor |

```text
Internet → CDN/WAF → L7 LB → App tier → L4 LB → DB tier (private subnet)
```

## What is the service mapping for storage and object stores?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Object storage** | Blob Storage | S3 | Cloud Storage |
| **Block storage (VM disk)** | Managed Disks | EBS | Persistent Disk |
| **File shares (SMB/NFS)** | Azure Files | EFS / FSx | Filestore |
| **Archive / cold tier** | Archive Blob | S3 Glacier | Archive / Coldline |
| **Hybrid sync** | Azure File Sync | Storage Gateway | Transfer Appliance |
| **Data lake** | ADLS Gen2 | S3 + Lake Formation | Cloud Storage + BigQuery |

| Blob/S3/GCS tier | Use |
|------------------|-----|
| Hot / Standard | Frequent access |
| Cool / Infrequent | Backups, older data |
| Archive / Glacier | Long-term retention |

## What is the service mapping for relational and NoSQL databases?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Managed SQL Server** | Azure SQL Database | RDS SQL Server | Cloud SQL (SQL Server) |
| **Managed PostgreSQL** | Azure Database for PostgreSQL | RDS PostgreSQL / Aurora PG | Cloud SQL PostgreSQL |
| **Managed MySQL** | Azure Database for MySQL | RDS MySQL / Aurora | Cloud SQL MySQL |
| **Global-scale SQL** | Cosmos DB (API options) | Aurora Global | Spanner |
| **Document NoSQL** | Cosmos DB (MongoDB API) | DocumentDB | Firestore |
| **Key-value** | Cosmos DB / Table Storage | DynamoDB | Firestore / Bigtable |
| **Wide-column** | Cassandra (Cosmos DB) | Keyspaces | Bigtable |
| **Cache** | Azure Cache for Redis | ElastiCache | Memorystore |
| **Graph** | Cosmos DB (Gremlin) | Neptune | — |
| **Warehouse / analytics** | Synapse Analytics | Redshift | BigQuery |
| **Search** | Azure AI Search | OpenSearch | Vertex AI Search |

**Interview:** PostgreSQL on all three — **Azure Flexible Server**, **RDS**, **Cloud SQL**.

## What is the service mapping for identity and IAM?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Human identity / SSO** | Microsoft Entra ID | IAM Identity Center (SSO) | Cloud Identity |
| **Resource permissions** | Azure RBAC | IAM policies | IAM roles |
| **Managed identity / workload ID** | Managed Identity | IAM roles for service accounts | Workload Identity |
| **Secrets** | Key Vault | Secrets Manager | Secret Manager |
| **Certificate management** | Key Vault | ACM | Certificate Manager |
| **Conditional access / MFA** | Entra Conditional Access | IAM + external IdP | Context-aware access |
| **Organization structure** | Management groups, subscriptions | Organizations, OUs, accounts | Organization, folders, projects |

```text
User → Entra ID / SSO → federated role → cloud resources
App  → Managed Identity / IRSA / Workload Identity → least-privilege role
```

## What is the service mapping for messaging and eventing?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Message queue** | Service Bus (Queue) | SQS | Cloud Tasks / Pub/Sub pull |
| **Pub/sub** | Service Bus (Topic) / Event Grid | SNS | Pub/Sub |
| **Event routing** | Event Grid | EventBridge | Eventarc |
| **Stream processing** | Event Hubs | Kinesis Data Streams | Pub/Sub + Dataflow |
| **Workflow / orchestration** | Logic Apps / Durable Functions | Step Functions | Workflows |
| **Kafka-compatible** | Event Hubs (Kafka API) | MSK | Pub/Sub (different model) |

| Pattern | Typical pick |
|---------|--------------|
| Order processing queue | Service Bus / SQS |
| Domain events | Event Grid / EventBridge / Eventarc |
| High-throughput telemetry | Event Hubs / Kinesis |

## What is the service mapping for serverless and containers?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Functions** | Azure Functions | Lambda | Cloud Functions |
| **API front door** | API Management / Functions HTTP | API Gateway | API Gateway (Apigee optional) |
| **Container registry** | ACR | ECR | Artifact Registry |
| **Managed Kubernetes** | AKS | EKS | GKE |
| **Serverless containers** | Container Apps | Fargate | Cloud Run |
| **Container CI/CD** | ACR Tasks | CodeBuild | Cloud Build |

```text
Docker image → ACR/ECR/GAR → AKS/EKS/GKE or Container Apps/Fargate/Cloud Run
```

## What is the service mapping for API management and CDN?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **API gateway (managed)** | API Management (APIM) | API Gateway | API Gateway |
| **CDN** | Azure CDN / Front Door | CloudFront | Cloud CDN |
| **Global anycast + WAF** | Azure Front Door | CloudFront + WAF | Cloud CDN + Cloud Armor |
| **Self-hosted gateway** | APIM self-hosted / Ocelot (.NET) | — | — |

| Use | Service |
|-----|---------|
| Rate limit, OAuth, developer portal | APIM / API Gateway |
| Static asset edge cache | CDN / CloudFront / Cloud CDN |

## What is the service mapping for monitoring and logging?

| Capability | Azure | AWS | GCP |
|------------|-------|-----|-----|
| **Metrics + dashboards** | Azure Monitor | CloudWatch | Cloud Monitoring |
| **Centralized logs** | Log Analytics | CloudWatch Logs | Cloud Logging |
| **APM / distributed tracing** | Application Insights | X-Ray | Cloud Trace |
| **Alerting** | Azure Monitor Alerts | CloudWatch Alarms | Alerting policies |
| **SIEM** | Microsoft Sentinel | Security Hub / OpenSearch | Chronicle (enterprise) |
| **OpenTelemetry** | Supported on all three | Supported | Supported |

```text
App (OTel SDK) → APM (App Insights / X-Ray / Trace) + Logs + Metrics → Alerts → On-call
```

## How do you choose between Azure, AWS, and GCP?

| Choose **Azure** | Choose **AWS** | Choose **GCP** |
|------------------|----------------|----------------|
| Entra ID + M365 already standard | Maximum service breadth | GKE-first, Kubernetes platform team |
| .NET + Windows + hybrid | Startup with AWS credits / hiring pool | BigQuery / ML / data platform |
| SAP on Azure, ExpressRoute to datacenter | GovCloud, mature compliance programs | Multi-cloud analytics |

**Multi-cloud reality:** Often **primary cloud + DR secondary** or **acquisition merge** — use Terraform + abstractions, accept operational cost.

**Interview answer:** Pick based on **team skills, existing contracts, compliance, and data residency** — not "best cloud" absolutes.

## What are hybrid and multi-cloud considerations?

| Concern | Approach |
|---------|----------|
| **Identity federation** | Entra ID / SSO across clouds |
| **Networking** | VPN, ExpressRoute, Direct Connect, Interconnect |
| **IaC** | Terraform modules per cloud; shared tagging policy |
| **Observability** | OpenTelemetry → unified backend (Grafana, Datadog) |
| **Data gravity** | Replicate async; avoid synchronous cross-cloud DB |
| **Egress cost** | Design APIs at edge; cache aggressively |

```text
                    ┌─────────────┐
   On-prem ────────►│ Azure (primary) │
                    └──────┬──────┘
                           │ async replication
                    ┌──────▼──────┐
                    │ AWS (DR)    │
                    └─────────────┘
```

**Anti-pattern:** Same app actively dual-written to two clouds without strong ops maturity.

## Related Topics

- Azure Cloud/Azure Basics.md
- AWS/AWS Basics.md
- Google Cloud/Google Cloud Basics.md
- Important Concepts/Interview Comparisons.md
- Terraform/Terraform Multi-Cloud Providers.md
