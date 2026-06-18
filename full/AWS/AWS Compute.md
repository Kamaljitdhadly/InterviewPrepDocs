# AWS Compute

## Questions Covered

1. What AWS compute services exist, and when do you use each?
2. What is Amazon EC2, and how do you launch and secure instances?
3. What are EC2 instance types and purchasing options?
4. What is an Auto Scaling Group (ASG)?
5. What is AWS Lambda, and how does it work?
6. What is Amazon ECS vs EKS vs Fargate?
7. What is AWS Elastic Beanstalk?
8. What is AWS Batch?
9. What are AMI, EBS, and instance store?
10. How do you connect to EC2 instances securely?
11. How does AWS compute integrate with load balancers?
12. What is AWS App Runner?

## What AWS compute services exist, and when do you use each?

| Service | Model | Best for |
|---------|-------|----------|
| **EC2** | IaaS VMs | Full control, lift-and-shift |
| **Lambda** | Serverless functions | Event-driven, short tasks |
| **ECS** | Container orchestration (AWS-native) | Docker without full K8s |
| **EKS** | Managed Kubernetes | K8s ecosystem, microservices |
| **Fargate** | Serverless containers | ECS/EKS without managing nodes |
| **Elastic Beanstalk** | PaaS | Quick deploy web apps |
| **App Runner** | Container PaaS | HTTP services from container image |
| **Batch** | HPC | Parallel batch jobs |
| **Lightsail** | Simplified VPS | Small sites, dev |

```text
Need OS control?              → EC2 (+ ASG)
Event/cron/API (<15 min)?     → Lambda
Docker, no K8s?               → ECS on Fargate
Kubernetes?                   → EKS
Simple web deploy?            → Elastic Beanstalk or App Runner
```

## What is Amazon EC2, and how do you launch and secure instances?

**EC2 (Elastic Compute Cloud)** — resizable virtual machines in your VPC.

```bash
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name my-keypair \
  --security-group-ids sg-0abc123 \
  --subnet-id subnet-0def456 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-01}]' \
  --count 1
```

**Security checklist:**

| Risk | Mitigation |
|------|------------|
| **SSH/RDP open to 0.0.0.0/0** | Restrict SG to bastion/VPN IP |
| **Long-lived access keys on instance** | **IAM instance profile** (role) |
| **Unpatched OS** | SSM Patch Manager, golden AMIs |
| **IMDSv1 token theft** | Enforce **IMDSv2** (`HttpTokens=required`) |

```bash
# Attach IAM role to EC2 — no keys on disk
aws ec2 associate-iam-instance-profile \
  --instance-id i-0abc123 \
  --iam-instance-profile Name=WebServerRole
```

## What are EC2 instance types and purchasing options?

**Naming:** `m5.xlarge` → family `m` (general), generation `5`, size `xlarge`.

| Family | Use |
|--------|-----|
| **t** | Burstable — dev, low CPU average |
| **m** | General purpose |
| **c** | Compute optimized |
| **r** | Memory optimized |
| **i** | Storage optimized |
| **g/p** | GPU |

| Purchase | When |
|----------|------|
| **On-Demand** | Unpredictable, short-term |
| **Reserved / Savings Plans** | Steady production load |
| **Spot** | Fault-tolerant, batch, stateless workers |
| **Dedicated** | Compliance, license-bound |

## What is an Auto Scaling Group (ASG)?

**ASG** maintains desired count of EC2 instances — scale on metrics or schedule; register with ALB/NLB.

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name web-asg \
  --launch-template LaunchTemplateName=web-lt,Version='$Latest' \
  --min-size 2 --max-size 10 --desired-capacity 2 \
  --vpc-zone-identifier "subnet-aaa,subnet-bbb" \
  --target-group-arns arn:aws:elasticloadbalancing:us-east-1:123:targetgroup/web-tg/abc
```

| Policy type | Trigger |
|-------------|---------|
| **Target tracking** | Keep CPU at 50% |
| **Step scaling** | CPU > 70% → add 2 instances |
| **Scheduled** | Scale up weekdays 8am |

Combine **Multi-AZ subnets + ASG + ALB** for resilient web tiers.

## What is AWS Lambda, and how does it work?

**Lambda** — run code without servers; pay per invocation + duration (GB-seconds).

| Concept | Limit (typical) |
|---------|-----------------|
| **Timeout** | 15 minutes max |
| **Memory** | 128 MB – 10 GB |
| **Deployment package** | 50 MB zipped (250 MB unzipped) |
| **Concurrency** | Account/region limits (request increases) |

```python
import json

def lambda_handler(event, context):
    order_id = event.get('orderId')
    return {
        'statusCode': 200,
        'body': json.dumps({'processed': order_id})
    }
```

**Triggers:** API Gateway, S3, SQS, DynamoDB Streams, EventBridge, Kinesis, SNS.

```bash
aws lambda create-function --function-name ProcessOrder \
  --runtime python3.12 --handler lambda_function.lambda_handler \
  --role arn:aws:iam::123456789012:role/lambda-exec \
  --zip-file fileb://function.zip
```

**Cold starts:** minimize package size; use Provisioned Concurrency for latency-sensitive APIs.

## What is Amazon ECS vs EKS vs Fargate?

| | ECS | EKS |
|---|-----|-----|
| **Orchestrator** | AWS-native | Kubernetes |
| **Learning curve** | Lower | Higher (K8s API) |
| **Portability** | AWS-centric | Multi-cloud K8s |
| **Integration** | Deep AWS native | CNCF ecosystem |

**Fargate** — run ECS tasks or EKS pods **without EC2 nodes**; pay per vCPU/memory.

```bash
# ECS Fargate task (conceptual via task definition JSON)
aws ecs run-task --cluster prod --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-aaa],securityGroups=[sg-abc],assignPublicIp=DISABLED}" \
  --task-definition myapp:3
```

```bash
# EKS cluster
aws eks create-cluster --name prod-cluster --role-arn arn:aws:iam::123:role/EKSClusterRole \
  --resources-vpc-config subnetIds=subnet-aaa,subnet-bbb,securityGroupIds=sg-abc
```

## What is AWS Elastic Beanstalk?

**Elastic Beanstalk** — upload code (or Docker); AWS provisions EC2, ALB, scaling, health monitoring.

```bash
eb init myapp --platform "64bit Amazon Linux 2023 v4.0.0 running Python 3.11"
eb create prod-env --instance-types t3.small --envvars DB_HOST=...
eb deploy
```

| Pros | Cons |
|------|------|
| Fast PaaS-style deploy | Less control than raw EC2 |
| Built-in rolling updates | Platform version tied to AWS |
| .NET, Java, Node, Python, Go | Not for arbitrary OS packages |

Similar role to **Azure App Service**.

## What is AWS Batch?

**AWS Batch** — run containerized batch jobs at scale on EC2 or Fargate; job queues + compute environments.

Use for: rendering, genomics, ETL, Monte Carlo simulations — not web traffic.

## What are AMI, EBS, and instance store?

| | AMI | EBS volume | Instance store |
|---|-----|------------|----------------|
| **What** | Image template (OS + apps) | Network-attached persistent disk | Ephemeral local NVMe |
| **Persistence** | Reusable template | Survives stop/start | Lost on stop/terminate |
| **Use** | Launch new instances | Root + data disks | Temp cache, scratch |

```bash
aws ec2 create-image --instance-id i-0abc123 --name "web-golden-v1.2" --no-reboot
```

**gp3** — default general SSD; **io2** — high IOPS databases.

## How do you connect to EC2 instances securely?

| Method | Detail |
|--------|--------|
| **Session Manager (SSM)** | No inbound port; IAM-based — **preferred** |
| **EC2 Instance Connect** | Browser/temporary SSH key push |
| **Bastion host** | Jump box in public subnet |
| **Direct SSH/RDP** | Only with restricted SG — avoid in prod |

```bash
aws ssm start-session --target i-0abc123
```

Requires **SSM Agent** + **IAM role** with `AmazonSSMManagedInstanceCore`.

## How does AWS compute integrate with load balancers?

```text
Internet → ALB (HTTP/HTTPS) → Target Group → EC2 / ECS / Lambda (via ALB)
Internet → NLB (TCP/UDP)     → EC2 / IP targets
API clients → API Gateway    → Lambda / ECS / HTTP backend
```

| Compute | Typical front door |
|---------|-------------------|
| **EC2 + ASG** | ALB or NLB |
| **ECS/EKS** | ALB Ingress Controller |
| **Lambda (HTTP)** | API Gateway or ALB (Lambda target) |
| **Elastic Beanstalk** | Managed ALB |

See **AWS Load Balancing CDN and API Gateway.md**.

## What is AWS App Runner?

**App Runner** — deploy container or source repo; auto-scale HTTP services with minimal config.

```bash
aws apprunner create-service --service-name myapi \
  --source-configuration '{"ImageRepository":{"ImageIdentifier":"123.dkr.ecr.us-east-1.amazonaws.com/myapi:latest","ImageRepositoryType":"ECR"}}' \
  --instance-configuration '{"Cpu":"1 vCPU","Memory":"2 GB"}'
```

Between **Lambda** (functions) and **ECS** (full control) in complexity.

## Related Topics

- **AWS Networking.md** — VPC, security groups
- **AWS Load Balancing CDN and API Gateway.md** — ALB, NLB
- **AWS Storage and Databases.md** — EBS, EFS
- **Kubernetes/Kubernetes Basics.md** — EKS concepts
