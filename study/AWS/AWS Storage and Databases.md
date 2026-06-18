# AWS Storage and Databases

## Questions Covered

1. What AWS storage services exist, and when do you use each?
2. What is Amazon S3, and what storage classes are available?
3. What is S3 versioning, lifecycle, and encryption?
4. What is Amazon EBS vs EFS vs FSx?
5. What is Amazon RDS, and what engines are supported?
6. What is Amazon Aurora?
7. What is Amazon DynamoDB?
8. What are DynamoDB capacity modes and indexes?
9. What is Amazon ElastiCache?
10. What is backup and DR for RDS and S3?
11. How do you secure S3 buckets?
12. How do you choose between RDS, Aurora, and DynamoDB?

## What AWS storage services exist, and when do you use each?

| Service | Type | Use case |
|---------|------|----------|
| **S3** | Object storage | Files, backups, static sites, data lake |
| **EBS** | Block storage | EC2 boot/data volumes |
| **EFS** | Managed NFS | Shared file storage across EC2/ECS |
| **FSx** | Windows/Lustre/NetApp/ONTAP | Specialized file workloads |
| **Glacier** | Archive (via S3 Glacier classes) | Long-term retention |
| **Storage Gateway** | Hybrid | On-prem ↔ AWS storage bridge |

```text
User uploads, logs, assets     → S3
EC2 disk                       → EBS
Shared config across containers → EFS
```

## What is Amazon S3, and what storage classes are available?

**S3** — unlimited object storage; bucket name globally unique; objects keyed by prefix.

| Class | Access | Min storage duration |
|-------|--------|---------------------|
| **Standard** | Frequent | — |
| **Intelligent-Tiering** | Auto-moves by access pattern | — |
| **Standard-IA** | Infrequent | 30 days |
| **One Zone-IA** | Infrequent, single AZ | 30 days |
| **Glacier Instant Retrieval** | Archive, ms retrieval | 90 days |
| **Glacier Flexible Retrieval** | Archive, minutes–hours | 90 days |
| **Glacier Deep Archive** | Coldest, 12+ hr retrieval | 180 days |

```bash
aws s3 mb s3://mycompany-prod-uploads --region us-east-1
aws s3 cp report.pdf s3://mycompany-prod-uploads/reports/2025/report.pdf
aws s3 ls s3://mycompany-prod-uploads/reports/ --recursive --human-readable
```

**Consistency:** S3 provides **read-after-write consistency** for all operations (overwritten PUTs, DELETEs, LIST).

## What is S3 versioning, lifecycle, and encryption?

**Versioning** — keep object history; protect against accidental delete/overwrite.

```json
{
  "Rules": [{
    "ID": "archive-old-logs",
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [{ "Days": 30, "StorageClass": "STANDARD_IA" }],
    "NoncurrentVersionTransitions": [{ "NoncurrentDays": 90, "StorageClass": "GLACIER" }]
  }]
}
```

| Encryption | Detail |
|------------|--------|
| **SSE-S3** | AWS-managed keys (AES-256) |
| **SSE-KMS** | KMS CMK — audit trail |
| **SSE-C** | Customer-provided keys |
| **Default encryption** | Enforce on bucket |

```bash
aws s3api put-bucket-encryption --bucket mycompany-prod-uploads \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"arn:aws:kms:..."}}]}'
```

## What is Amazon EBS vs EFS vs FSx?

| | EBS | EFS | FSx |
|---|-----|-----|-----|
| **Access** | Single EC2 (multi-attach io2 only) | Thousands of EC2/NFS clients | Windows SMB, Lustre HPC |
| **Scope** | AZ-bound | Regional | Varies |
| **Use** | Boot volumes, DB disks | Shared app data | Windows shares, HPC |

```bash
aws ec2 create-volume --availability-zone us-east-1a --size 100 --volume-type gp3 --iops 3000
```

**gp3** — baseline 3000 IOPS; scale independently from storage size.

## What is Amazon RDS, and what engines are supported?

**RDS** — managed relational databases: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server.

| Feature | Detail |
|---------|--------|
| **Multi-AZ** | Sync standby in another AZ — automatic failover |
| **Read replicas** | Async — scale reads, cross-region DR |
| **Automated backups** | Point-in-time recovery (PITR) |
| **Parameter groups** | Engine configuration |

```bash
aws rds create-db-instance \
  --db-instance-identifier prod-mysql \
  --db-instance-class db.r6g.large \
  --engine mysql \
  --master-username admin \
  --master-user-password 'ComplexP@ss1!' \
  --allocated-storage 100 \
  --multi-az \
  --vpc-security-group-ids sg-db \
  --db-subnet-group-name private-db-subnets
```

Place RDS in **private subnets**; SG allows app tier only.

## What is Amazon Aurora?

**Aurora** — AWS-built MySQL/PostgreSQL-compatible database; distributed storage, high performance.

| Feature | Benefit |
|---------|---------|
| **Storage auto-scales** | Up to 128 TB |
| **6 copies across 3 AZs** | Durability |
| **Aurora Serverless v2** | Auto-scaling capacity |
| **Global Database** | Cross-region read replicas <1s lag |

```text
Aurora cluster
  ├── Writer instance
  └── Reader instance(s) — read scaling
Shared storage volume (auto-replicated)
```

Use Aurora when you need **MySQL/PostgreSQL compatibility** with higher throughput than standard RDS.

## What is Amazon DynamoDB?

**DynamoDB** — fully managed NoSQL key-value/document; single-digit ms latency at any scale.

| Concept | Detail |
|---------|--------|
| **Table** | Collection of items |
| **Primary key** | Partition key or partition + sort key |
| **Item** | Up to 400 KB |
| **Streams** | Change data capture → Lambda |

```python
import boto3
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Orders')

table.put_item(Item={'orderId': 'ORD-001', 'customerId': 'C123', 'total': 99.50})
response = table.get_item(Key={'orderId': 'ORD-001'})
```

Compare with **MongoDB** — similar document model; DynamoDB is serverless AWS-native.

## What are DynamoDB capacity modes and indexes?

| Mode | Billing |
|------|---------|
| **On-demand** | Pay per request — unpredictable traffic |
| **Provisioned** | RCU/WCU — steady, cheaper at scale |

**Indexes:**

| Type | Purpose |
|------|---------|
| **GSI (Global Secondary Index)** | Alternate partition/sort key — own throughput |
| **LSI (Local Secondary Index)** | Same partition key, different sort — must define at table creation |

```bash
aws dynamodb query --table-name Orders \
  --index-name CustomerIndex \
  --key-condition-expression "customerId = :cid" \
  --expression-attribute-values '{":cid":{"S":"C123"}}'
```

Design partition key for **even access distribution** — avoid hot partitions.

## What is Amazon ElastiCache?

**ElastiCache** — managed **Redis** or **Memcached** in-memory cache.

| Engine | Use |
|--------|-----|
| **Redis** | Persistence, replication, pub/sub, sorted sets — **preferred** |
| **Memcached** | Simple cache, multi-node |

```csharp
// .NET — StackExchange.Redis with ElastiCache endpoint
services.AddStackExchangeRedisCache(options =>
    options.Configuration = "mycluster.abc123.ng.0001.use1.cache.amazonaws.com:6379");
```

Patterns: session store, cache-aside, rate limiting, leaderboards.

## What is backup and DR for RDS and S3?

| Service | Backup approach |
|---------|-----------------|
| **RDS** | Automated snapshots + PITR; manual snapshots before major changes |
| **RDS cross-region** | Read replica or snapshot copy |
| **S3** | Versioning + CRR (Cross-Region Replication) |
| **S3 Object Lock** | WORM compliance — legal hold |

```bash
aws rds create-db-snapshot --db-instance-identifier prod-mysql --db-snapshot-identifier pre-migration-$(date +%Y%m%d)
```

Define **RPO/RTO** — Multi-AZ RDS for instance failure; cross-region for regional disaster.

## How do you secure S3 buckets?

| Misconfiguration | Fix |
|------------------|-----|
| **Public bucket ACL/policy** | Block Public Access at account + bucket level |
| **Overly broad IAM** | Least privilege; prefix-scoped policies |
| **No encryption** | Default SSE-KMS |
| **HTTP access** | Deny `aws:SecureTransport` in bucket policy |

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Deny",
    "Principal": "*",
    "Action": "s3:*",
    "Resource": ["arn:aws:s3:::mycompany-prod-uploads", "arn:aws:s3:::mycompany-prod-uploads/*"],
    "Condition": { "Bool": { "aws:SecureTransport": "false" } }
  }]
}
```

Use **IAM roles** (not access keys) for EC2/Lambda S3 access.

## How do you choose between RDS, Aurora, and DynamoDB?

| Need | Choice |
|------|--------|
| SQL, JOINs, ACID, reporting | **RDS** or **Aurora** |
| Highest MySQL/PostgreSQL perf + HA | **Aurora** |
| Massive scale, flexible schema, ms latency | **DynamoDB** |
| Full SQL Server features | **RDS SQL Server** or EC2 |
| Graph workloads | **Neptune** (not covered here) |

```text
Order management (relational)     → Aurora PostgreSQL
Shopping cart / session           → DynamoDB or ElastiCache
Product images                    → S3
Analytics on orders               → RDS read replica → export to S3 → Athena
```

## Related Topics

- **AWS Compute.md** — EBS attachment, Lambda + DynamoDB
- **AWS Networking.md** — VPC endpoints for S3/DynamoDB
- **MongoDB/MongoDB Basics.md** — compare with DynamoDB
- **AWS Security and Monitoring.md** — KMS, bucket policies
