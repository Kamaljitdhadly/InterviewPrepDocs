# AWS Networking

## Questions Covered

1. What is Amazon VPC, and how is it structured?
2. What are subnets, route tables, and internet gateways?
3. What is the difference between public and private subnets?
4. What are security groups vs network ACLs?
5. What is NAT Gateway vs NAT Instance?
6. What is VPC peering vs Transit Gateway?
7. What is AWS PrivateLink?
8. What is Route 53, and what routing policies exist?
9. What is Amazon CloudFront?
10. What is AWS VPN vs Direct Connect?
11. How do you design a multi-tier VPC architecture?
12. What is VPC Flow Logs?
13. How does Lambda access resources in a VPC?

## What is Amazon VPC, and how is it structured?

**Amazon VPC (Virtual Private Cloud)** — isolated virtual network in an AWS region (Azure equivalent: **VNet**).

```text
VPC 10.0.0.0/16 (region us-east-1)
  ├── subnet-public-a   10.0.1.0/24  (AZ us-east-1a)
  ├── subnet-public-b   10.0.2.0/24  (AZ us-east-1b)
  ├── subnet-private-a  10.0.10.0/24 (AZ us-east-1a)
  └── subnet-private-b  10.0.11.0/24 (AZ us-east-1b)
```

```bash
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=prod-vpc}]'
aws ec2 create-subnet --vpc-id vpc-0abc --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
```

Default VPC exists per region — replace with custom VPC for production.

## What are subnets, route tables, and internet gateways?

| Component | Role |
|-----------|------|
| **Subnet** | IP range in one AZ — resources launch here |
| **Route table** | Routes traffic (local, IGW, NAT, TGW, peering) |
| **Internet Gateway (IGW)** | VPC ↔ internet — attached to VPC |

```text
Route table (public):
  10.0.0.0/16 → local
  0.0.0.0/0   → igw-0abc

Route table (private):
  10.0.0.0/16 → local
  0.0.0.0/0   → nat-0def   (outbound only)
```

Each subnet associates with **one** route table.

## What is the difference between public and private subnets?

| | Public subnet | Private subnet |
|---|---------------|----------------|
| **Route to IGW** | Yes (`0.0.0.0/0 → IGW`) | No |
| **Public IP on launch** | Often enabled | Disabled |
| **Typical resources** | ALB, NAT Gateway, bastion | App servers, RDS, Lambda (VPC) |

**Best practice:** App and data tiers in **private subnets**; only load balancers/bastions in public subnets.

## What are security groups vs network ACLs?

| | Security Group (SG) | Network ACL (NACL) |
|---|---------------------|---------------------|
| **Level** | Instance/ENI | Subnet |
| **State** | **Stateful** — return traffic auto-allowed | **Stateless** — need explicit inbound + outbound |
| **Rules** | Allow only | Allow + deny |
| **Default** | Deny all inbound; allow all outbound | Allow all |

```bash
aws ec2 authorize-security-group-ingress --group-id sg-0abc \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# ALB SG → allow 443 from internet
# App SG → allow 8080 from ALB SG only (reference SG ID, not CIDR)
```

**Defense in depth:** SG for instance-level; NACL for subnet-level deny rules (e.g. block IP range).

## What is NAT Gateway vs NAT Instance?

| | NAT Gateway | NAT Instance |
|---|-------------|--------------|
| **Managed** | Yes (AWS) | Self-managed EC2 |
| **HA** | Per-AZ; create one per AZ | Manual failover |
| **Bandwidth** | Up to 100 Gbps | Instance limited |
| **Cost** | Hourly + data processing | EC2 cost only |

Private subnet instances use **NAT Gateway** (in public subnet) for outbound internet (patches, APIs) without inbound exposure.

## What is VPC peering vs Transit Gateway?

| | VPC Peering | Transit Gateway (TGW) |
|---|-------------|----------------------|
| **Topology** | Point-to-point | Hub-and-spoke |
| **Transitive** | **No** (A↔B + B↔C ≠ A↔C) | Yes via hub |
| **Scale** | Limited mesh complexity | Hundreds of VPCs |
| **Cross-region** | Cross-region peering available | Inter-region TGW peering |

```text
Hub-spoke (enterprise):
  VPC Prod ──┐
  VPC Dev  ──┼── Transit Gateway ── VPN / Direct Connect ── On-prem
  VPC Shared ┘
```

## What is AWS PrivateLink?

**PrivateLink** — private connectivity to AWS services or your services without internet/VPC peering.

| Type | Example |
|------|---------|
| **Interface endpoint** | S3 (Gateway), DynamoDB (Gateway), most AWS APIs (Interface) |
| **PrivateLink service** | Expose your NLB to other VPCs/accounts |

```bash
aws ec2 create-vpc-endpoint --vpc-id vpc-0abc --service-name com.amazonaws.us-east-1.s3 --route-table-ids rtb-0def
```

Traffic stays on AWS network — no NAT required for S3/DynamoDB with **Gateway endpoints** (free).

## What is Route 53, and what routing policies exist?

**Route 53** — DNS + domain registration + health checks.

| Routing policy | Use case |
|----------------|----------|
| **Simple** | Single record |
| **Weighted** | A/B testing, gradual rollout |
| **Latency** | Route to lowest-latency region |
| **Failover** | Active/passive DR |
| **Geolocation** | Content by user location |
| **Multi-value** | Simple load spread |

```bash
aws route53 change-resource-record-sets --hosted-zone-id Z123 --change-batch file://records.json
```

**Alias records** — free queries to CloudFront, ALB, S3 website (no charge for alias to AWS resource).

## What is Amazon CloudFront?

**CloudFront** — global CDN + edge caching + DDoS protection (with Shield Standard).

```text
User → CloudFront edge (cache hit?) → Origin (S3, ALB, custom HTTP)
```

| Feature | Benefit |
|---------|---------|
| **Edge locations** | Low latency worldwide |
| **Signed URLs/cookies** | Private content |
| **OAC/OAI** | Secure S3 origin access |
| **WAF integration** | L7 filtering at edge |

Pair with **S3 static sites** or **ALB** origins for global web apps.

## What is AWS VPN vs Direct Connect?

| | Site-to-Site VPN | Direct Connect |
|---|------------------|----------------|
| **Connection** | Encrypted over internet | Dedicated private link via partner |
| **Setup time** | Hours | Weeks |
| **Bandwidth** | Up to 1.25 Gbps per tunnel | 1 Gbps – 100 Gbps |
| **Cost** | Lower | Higher |
| **Use** | Hybrid cloud, backup link | Enterprise primary hybrid |

**VPN** terminates on **Virtual Private Gateway** or **Transit Gateway**.

## How do you design a multi-tier VPC architecture?

```text
                    Internet
                        │
                   Internet Gateway
                        │
        ┌───────────────┴───────────────┐
        │     Public Subnets (2 AZ)    │
        │  ALB, NAT Gateway, Bastion  │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴───────────────┐
        │    Private Subnets (2 AZ)      │
        │  EC2 / ECS / Lambda (app tier) │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴───────────────┐
        │  Private Subnets (data tier)   │
        │  RDS, ElastiCache (no NAT req) │
        └───────────────────────────────┘
```

| Tier | Subnet | Access |
|------|--------|--------|
| **Web** | Public (ALB only) | Inbound from internet via ALB |
| **App** | Private | From ALB SG only |
| **Data** | Private | From app SG only |

## What is VPC Flow Logs?

**Flow Logs** — capture IP traffic metadata (accept/reject) to CloudWatch Logs or S3.

```bash
aws ec2 create-flow-logs --resource-type VPC --resource-ids vpc-0abc \
  --traffic-type ALL --log-destination-type cloud-watch-logs \
  --log-group-name /vpc/flowlogs/prod
```

Use for security analysis, troubleshooting SG/NACL issues — not packet payload.

## How does Lambda access resources in a VPC?

Configure Lambda with **VPC subnets + SG** to reach RDS, ElastiCache, private APIs.

| Trade-off | Detail |
|-----------|--------|
| **ENI creation** | Cold start latency increase |
| **Subnet sizing** | Need enough IPs for Lambda scaling |
| **Outbound internet** | Requires NAT Gateway in VPC |

```bash
aws lambda update-function-configuration --function-name MyFunc \
  --vpc-config SubnetIds=subnet-private-a,subnet-private-b,SecurityGroupIds=sg-lambda
```

For AWS APIs (S3, DynamoDB) prefer **VPC endpoints** over NAT to reduce cost.

## Related Topics

- **AWS Compute.md** — EC2, Lambda, placement
- **AWS Load Balancing CDN and API Gateway.md** — ALB, CloudFront
- **AWS Security and Monitoring.md** — WAF, Flow Logs analysis
- **Azure Cloud 1/Azure Networking.md** — Azure comparison
