# AWS Load Balancing and CDN

## Questions Covered

1. What is the difference between Layer 4 and Layer 7 load balancing on AWS?
2. What is Application Load Balancer (ALB)?
3. What is Network Load Balancer (NLB)?
4. What is Gateway Load Balancer (GWLB)?
5. How do target groups and health checks work?
6. What is SSL/TLS termination on ALB?
7. What is Amazon CloudFront?
8. How do ALB, CloudFront, and Route 53 work together?
9. What is AWS Global Accelerator?
10. What is AWS WAF and Shield?
11. How does sticky session (session affinity) work on ALB?
12. When do you choose NLB vs ALB vs CloudFront?

## What is the difference between Layer 4 and Layer 7 load balancing on AWS?

| Layer | AWS service | Routes on |
|-------|-------------|-----------|
| **L4 (Transport)** | NLB, Classic LB (legacy) | IP + TCP/UDP port |
| **L7 (Application)** | ALB | HTTP host, path, headers, query |

```text
L4: 443 → any healthy backend (TCP pass-through or TLS at NLB)
L7: /api/* → API target group; /static/* → static target group
```

L7 enables **content-based routing** and **AWS WAF** integration on ALB/CloudFront.

## What is Application Load Balancer (ALB)?

**ALB** — regional HTTP/HTTPS load balancer; primary choice for web apps and APIs.

| Feature | Detail |
|---------|--------|
| **Listeners** | HTTP :80, HTTPS :443 |
| **Target types** | EC2, IP, Lambda, ALB (cross-VPC) |
| **Routing** | Path, host, header, query, source IP |
| **WebSockets/HTTP2** | Supported |
| **Cross-zone** | Enabled by default (Standard ALB) |

```bash
aws elbv2 create-load-balancer --name prod-alb --type application \
  --subnets subnet-public-a subnet-public-b \
  --security-groups sg-alb

aws elbv2 create-target-group --name web-tg --protocol HTTP --port 8080 \
  --vpc-id vpc-0abc --health-check-path /health
```

Place ALB in **public subnets**; targets typically in **private subnets**.

## What is Network Load Balancer (NLB)?

**NLB** — ultra-high performance L4 load balancer; static IP per AZ; preserves source IP.

| Use case | Why NLB |
|----------|---------|
| **TCP/UDP traffic** | Non-HTTP protocols |
| **Millions of RPS** | Low latency, high throughput |
| **Static IP requirement** | Elastic IP per AZ |
| **TLS pass-through** | Terminate TLS on backend |

```bash
aws elbv2 create-load-balancer --name prod-nlb --type network \
  --subnets subnet-public-a subnet-public-b
```

NLB + **TLS listener** can terminate SSL or pass through to targets.

## What is Gateway Load Balancer (GWLB)?

**GWLB** — deploy **third-party virtual appliances** (firewalls, IDS) inline in VPC traffic flow.

```text
Traffic → GWLB endpoint → Firewall appliance (transparent) → destination
```

Specialized — know it exists for security appliance insertion (similar to Azure NVAs).

## How do target groups and health checks work?

**Target group** — pool of registered targets (EC2 instance ID, IP, Lambda ARN).

| Setting | Recommendation |
|---------|----------------|
| **Protocol/path** | HTTP GET `/health` → 200 |
| **Interval** | 30s default |
| **Healthy threshold** | 2–3 consecutive successes |
| **Unhealthy threshold** | 2–3 failures → deregister |
| **Matcher** | `200-399` for HTTP |

```csharp
// ASP.NET Core health endpoint for ALB
app.MapGet("/health", () => Results.Ok());
```

Failed health checks → target removed → no traffic until healthy again.

## What is SSL/TLS termination on ALB?

| Mode | Flow |
|------|------|
| **Terminate at ALB** | Client HTTPS → ALB decrypts → HTTP to backend |
| **HTTPS to backend** | Re-encrypt to target (end-to-end) |

```bash
aws elbv2 create-listener --load-balancer-arn $ALB_ARN \
  --protocol HTTPS --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:123:certificate/abc \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

Use **ACM (AWS Certificate Manager)** for free public certs — auto-renewal.

## What is Amazon CloudFront?

**CloudFront** — global CDN caching content at **edge locations** (~450+ POPs).

| Feature | Detail |
|---------|--------|
| **Origins** | S3, ALB, custom HTTP, MediaPackage |
| **Cache behaviors** | Path patterns, TTL, forwarded headers/cookies |
| **OAC** | Origin Access Control — secure S3 origins |
| **Signed URLs** | Private content delivery |
| **HTTP/3, HTTP/2** | Supported |

```bash
aws cloudfront create-distribution --origin-domain-name mybucket.s3.amazonaws.com \
  --default-root-object index.html
```

```text
User (Tokyo) → CloudFront edge (cache hit) → fast response
Cache miss → Origin (ALB us-east-1) → cache at edge for next users
```

## How do ALB, CloudFront, and Route 53 work together?

```text
Route 53 (DNS: www.myapp.com)
    → CloudFront distribution (global CDN + WAF)
        → Origin: ALB (regional)
            → Target Group → EC2/ECS (private subnets)
```

| Component | Role |
|-----------|------|
| **Route 53** | DNS resolution, health-checked failover |
| **CloudFront** | Edge cache, DDoS (Shield Standard), global latency |
| **ALB** | Regional load spread across AZs |

**Alias record** in Route 53 to CloudFront — no charge for DNS queries to alias.

## What is AWS Global Accelerator?

**Global Accelerator** — anycast static IPs at edge; routes to optimal regional endpoint (ALB, NLB, EC2, EIP).

| vs CloudFront | Global Accelerator |
|---------------|-------------------|
| **CloudFront** | Cache static/dynamic content at edge |
| **Global Accelerator** | TCP/UDP proxy — no caching; good for non-HTTP games, IoT, VoIP |

Use when you need **static IP** and **low-latency TCP/UDP** globally without CDN caching.

## What is AWS WAF and Shield?

| Service | Protection |
|---------|------------|
| **Shield Standard** | Free — DDoS protection for CloudFront, Route 53, ALB |
| **Shield Advanced** | Paid — 24/7 DDoS Response Team, cost protection |
| **AWS WAF** | L7 rules — SQLi, XSS, rate limit, geo block |

```json
{
  "Name": "RateLimitAPI",
  "Priority": 1,
  "Statement": {
    "RateBasedStatement": { "Limit": 2000, "AggregateKeyType": "IP" }
  },
  "Action": { "Block": {} }
}
```

Attach WAF Web ACL to **CloudFront**, **ALB**, or **API Gateway**.

## How does sticky session (session affinity) work on ALB?

**Target group stickiness** — ALB sets `AWSALB` cookie; routes same client to same target.

| Duration | 1 second – 7 days (configurable) |
|----------|----------------------------------|

**Better pattern:** store session in **ElastiCache/DynamoDB** — stateless app servers, no stickiness required.

NLB can use **source IP affinity** (5-tuple hash) — less precise behind NAT.

## When do you choose NLB vs ALB vs CloudFront?

| Requirement | Choice |
|-------------|--------|
| HTTP routing by URL path | **ALB** |
| WebSockets, gRPC (HTTP/2) | **ALB** |
| TCP/UDP, static IP, extreme RPS | **NLB** |
| Global static assets, cache | **CloudFront** |
| Global API with edge WAF | **CloudFront + ALB** origin |
| Lambda HTTP target | **ALB** or **API Gateway** |
| Non-HTTP global low latency | **Global Accelerator** |

```text
Static React app on S3        → CloudFront → S3
Regional REST API             → ALB → ECS
Gaming TCP protocol           → NLB
Public API with auth/throttle → API Gateway (see AWS API Gateway.md)
```

## Related Topics

- **AWS Networking.md** — subnets, security groups for ALB
- **AWS API Gateway.md** — HTTP API vs ALB
- **AWS Compute.md** — ASG registers with target groups
- **Azure Cloud/Azure Application Gateway and Load Balancer.md** — Azure comparison
