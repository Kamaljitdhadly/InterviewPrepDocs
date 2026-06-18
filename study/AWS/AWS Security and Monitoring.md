# AWS Security and Monitoring

## Questions Covered

1. What is the AWS shared responsibility model for security?
2. What is AWS KMS?
3. What is AWS Secrets Manager vs Systems Manager Parameter Store?
4. What is AWS CloudTrail?
5. What is Amazon CloudWatch?
6. What is AWS X-Ray?
7. What is Amazon GuardDuty?
8. What is AWS Config?
9. What is AWS Security Hub?
10. What is AWS WAF and Shield?
11. How do you implement defense in depth on AWS?
12. How do you monitor costs and set billing alarms?

## What is the AWS shared responsibility model for security?

| AWS responsibility | Customer responsibility |
|--------------------|-------------------------|
| Physical datacenter security | IAM policies and MFA |
| Hypervisor patching | Guest OS patching (EC2) |
| Managed service patching (Lambda, RDS) | App code security |
| Global infrastructure availability | Data encryption choices |
| | Network configuration (SG, NACL) |
| | Compliance attestation of workloads |

**"Security OF the cloud vs IN the cloud"** — classic interview phrasing.

## What is AWS KMS?

**KMS (Key Management Service)** — create and control **encryption keys** for AWS services and your apps.

| Key type | Description |
|----------|-------------|
| **AWS managed** | Service-owned (e.g. default S3 SSE) |
| **Customer managed CMK** | You control rotation, policy, audit |
| **AWS owned** | Shared across accounts — limited audit |

```bash
aws kms create-key --description "prod-app-data"
aws kms encrypt --key-id alias/prod-app --plaintext fileb://secret.txt --output text --query CiphertextBlob
```

**Envelope encryption** — KMS encrypts data keys; data keys encrypt large payloads (S3, EBS, RDS).

Use **separate CMKs** per environment; restrict `kms:Decrypt` via key policy + IAM.

## What is AWS Secrets Manager vs Systems Manager Parameter Store?

| | Secrets Manager | Parameter Store |
|---|-----------------|-----------------|
| **Rotation** | Built-in (RDS, etc.) | Manual |
| **Cost** | Per secret/month | Standard free; Advanced paid |
| **Use** | DB passwords, API keys | Config, non-rotating secrets |

```bash
aws secretsmanager create-secret --name prod/db/password --secret-string 'ComplexP@ss1!'
aws secretsmanager get-secret-value --secret-id prod/db/password
```

```csharp
// .NET — fetch at startup
var client = new AmazonSecretsManagerClient();
var response = await client.GetSecretValueAsync(new GetSecretValueRequest { SecretId = "prod/db/password" });
```

Prefer **IAM roles** over secrets where possible; use Secrets Manager for database credentials with **automatic rotation**.

## What is AWS CloudTrail?

**CloudTrail** — audit log of **API calls** in your account (who did what, when, from where).

| Trail type | Scope |
|------------|-------|
| **Management events** | Control plane — CreateBucket, RunInstances |
| **Data events** | S3 object-level, Lambda invoke (optional, extra cost) |
| **Insights** | Unusual API activity |

```bash
aws cloudtrail create-trail --name org-trail --s3-bucket-name my-cloudtrail-logs \
  --is-multi-region-trail --enable-log-file-validation
```

Send logs to **S3** (immutable + validation) and **CloudWatch Logs** for alerting. Enable **organization trail** for all accounts.

## What is Amazon CloudWatch?

**CloudWatch** — metrics, logs, alarms, dashboards.

| Feature | Use |
|---------|-----|
| **Metrics** | CPU, Lambda duration, custom business metrics |
| **Logs** | Centralized log groups (Lambda, ECS, app logs) |
| **Alarms** | Trigger SNS/Lambda on threshold |
| **Dashboards** | Ops visibility |
| **Synthetics** | Canary uptime checks |
| **Evidently** | Feature flags / A/B |

```bash
aws logs tail /aws/lambda/ProcessOrder --follow --format short

aws cloudwatch put-metric-alarm --alarm-name lambda-errors --metric-name Errors \
  --namespace AWS/Lambda --statistic Sum --period 300 --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=ProcessOrder \
  --evaluation-periods 1 --alarm-actions arn:aws:sns:us-east-1:123:ops-alerts
```

## What is AWS X-Ray?

**X-Ray** — distributed tracing — visualize request flow across API Gateway → Lambda → DynamoDB.

```python
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.core import patch_all
patch_all()

@xray_recorder.capture('process_order')
def process_order(order_id):
    ...
```

Enable on API Gateway, Lambda, ECS — **service map** shows latency bottlenecks.

## What is Amazon GuardDuty?

**GuardDuty** — ML-based **threat detection** — analyzes CloudTrail, VPC Flow Logs, DNS logs.

| Finding examples | |
|------------------|---|
| Unusual API calls | Crypto mining, credential exfil |
| Compromised EC2 | C2 communication |
| Reconnaissance | IAM permission probing |

No agents required — enable per region/account; integrate findings with **Security Hub** and **EventBridge** for auto-remediation.

## What is AWS Config?

**Config** — record **resource configuration changes** and evaluate compliance rules.

```text
Rule: s3-bucket-public-read-prohibited
  → Config evaluates all buckets → NON_COMPLIANT → SNS alert
```

| Use | Detect drift from secure baseline |
|-----|-----------------------------------|

Pair with **Conformance packs** (CIS, PCI-DSS templates).

## What is AWS Security Hub?

**Security Hub** — aggregate findings from GuardDuty, Inspector, Macie, Config, partner tools — **CSPM dashboard**.

| Benefit | Single prioritized view of security posture |
|---------|---------------------------------------------|

Enable **FSBP (Foundational Security Best Practices)** standard — automated checks with remediation guidance.

## What is AWS WAF and Shield?

| Service | Layer | Scope |
|---------|-------|-------|
| **Shield Standard** | DDoS | Free — CloudFront, Route 53, ALB |
| **Shield Advanced** | DDoS | 24/7 DRT, cost protection |
| **WAF** | L7 | SQLi, XSS, geo block, rate limit |

Attach WAF to **CloudFront**, **ALB**, or **API Gateway**.

```bash
aws wafv2 create-web-acl --name prod-waf --scope REGIONAL \
  --default-action Allow={} --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=prod-waf \
  --rules file://rules.json
```

## How do you implement defense in depth on AWS?

```text
Layer 1: Organization SCPs + account separation
Layer 2: IAM Identity Center + MFA + least privilege
Layer 3: VPC segmentation + private subnets + SG
Layer 4: WAF + Shield at edge
Layer 5: Encryption (KMS) at rest + TLS in transit
Layer 6: Secrets Manager + no hardcoded credentials
Layer 7: CloudTrail + GuardDuty + Security Hub
Layer 8: Incident response runbooks + automated remediation (Lambda)
```

| Control | Example |
|---------|---------|
| **No public S3** | Block Public Access + bucket policies |
| **IMDSv2** | Prevent SSRF credential theft from EC2 |
| **Private RDS** | SG allows app tier only |
| **Break-glass** | Root MFA; rarely used admin role |

## How do you monitor costs and set billing alarms?

```bash
aws budgets create-budget --account-id 123456789012 --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

```json
{
  "BudgetName": "monthly-prod",
  "BudgetLimit": { "Amount": "5000", "Unit": "USD" },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

| Tool | Purpose |
|------|---------|
| **Cost Explorer** | Analyze spend by service, tag, account |
| **Budgets** | Alerts at 80%, 100%, forecasted overrun |
| **Cost Anomaly Detection** | ML-detected unusual spend |
| **CUR (Cost & Usage Report)** | Detailed export to S3/Athena |

Tag everything: `Environment`, `Project`, `Owner` — enforce with **Config rules** or **Service Control Policies**.

## Related Topics

- **AWS Identity and IAM.md** — policies, roles, MFA
- **AWS Networking.md** — security groups, Flow Logs
- **AWS Load Balancing CDN and API Gateway.md** — WAF attachment
- **Security/Cloud and Infrastructure Security.md** — cross-cloud security
- **Azure Cloud/Azure Security and Monitoring.md** — Azure comparison
