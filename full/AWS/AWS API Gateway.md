# AWS API Gateway

## Questions Covered

1. What is Amazon API Gateway?
2. What are REST API vs HTTP API vs WebSocket API?
3. How does API Gateway integrate with Lambda?
4. What are API Gateway stages and deployments?
5. How do you implement authentication and authorization?
6. What is throttling and usage plans?
7. What is request/response transformation?
8. How does API Gateway compare to Application Load Balancer?
9. What is Amazon VPC Link?
10. How do you deploy and version APIs?
11. What is API Gateway caching?
12. How does API Gateway compare to Azure APIM?

## What is Amazon API Gateway?

**API Gateway** — fully managed service to create, publish, monitor, and secure HTTP/WebSocket APIs.

```text
Clients → API Gateway → Lambda / HTTP backend / AWS services
              │
              ├── Auth (IAM, Cognito, Lambda authorizer)
              ├── Throttling / usage plans
              ├── Request validation
              └── CloudWatch metrics/logging
```

| Integration target | Example |
|--------------------|---------|
| **Lambda** | Serverless REST API |
| **HTTP proxy** | ECS, EC2, on-prem via VPC Link |
| **AWS service** | DynamoDB, Step Functions direct integration |
| **Mock** | Testing, CORS preflight |

## What are REST API vs HTTP API vs WebSocket API?

| Type | Cost | Features | Use |
|------|------|----------|-----|
| **HTTP API** | Lowest (~70% cheaper) | JWT/Cognito, Lambda proxy, CORS | Modern REST — **default choice** |
| **REST API** | Higher | API keys, request validation, WAF, caching | Legacy features needed |
| **WebSocket API** | Per-message | Bi-directional real-time | Chat, live dashboards |

```bash
aws apigatewayv2 create-api --name prod-api --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:123:function:MyFunc
```

Prefer **HTTP API** for new projects unless you need REST API-only features.

## How does API Gateway integrate with Lambda?

**Lambda proxy integration** — API Gateway passes full request as event; Lambda returns status + body.

```python
def lambda_handler(event, context):
    name = event.get('queryStringParameters', {}).get('name', 'World')
    return {
        'statusCode': 200,
        'headers': { 'Content-Type': 'application/json' },
        'body': json.dumps({ 'message': f'Hello, {name}!' })
    }
```

```yaml
# SAM template
Resources:
  MyApi:
    Type: AWS::Serverless::HttpApi
  MyFunction:
    Type: AWS::Serverless::Function
    Properties:
      Events:
        Api:
          Type: HttpApi
          Properties: { Path: /hello, Method: get }
```

**Lambda permission** — API Gateway needs `lambda:InvokeFunction` resource policy.

## What are API Gateway stages and deployments?

| Concept | Description |
|---------|-------------|
| **Stage** | Named environment (`dev`, `prod`) — own URL |
| **Deployment** | Snapshot of API config pushed to stage |
| **Stage variables** | `$stageVariables.lambdaAlias` — point prod stage to Lambda alias |

```text
https://abc123.execute-api.us-east-1.amazonaws.com/prod/orders
                                                    ^^^^ stage
```

Use **Canary deployments** (REST API) to shift traffic gradually between deployments.

## How do you implement authentication and authorization?

| Method | Use case |
|--------|----------|
| **IAM authorization** | AWS SigV4 — service-to-service |
| **Cognito User Pool** | JWT from mobile/web users |
| **JWT authorizer (HTTP API)** | Entra ID, Auth0, any OIDC |
| **Lambda authorizer** | Custom token logic |
| **API keys** | Simple identification (not security alone) |

```text
HTTP API + JWT authorizer:
  Authorization: Bearer <token>
  → API Gateway validates JWT (issuer, audience, signature)
  → Pass claims to Lambda in event.requestContext.authorizer.jwt.claims
```

```csharp
// Lambda reads claims
var sub = event.RequestContext.Authorizer.Jwt.Claims["sub"];
```

Never rely on **API keys alone** for sensitive APIs — combine with OAuth/JWT.

## What is throttling and usage plans?

| Control | Scope |
|---------|-------|
| **Account throttle** | 10,000 RPS default (soft limit) |
| **Stage/method throttle** | Burst + steady rate |
| **Usage plan** | API key + quota (10K/day) + throttle |

```bash
aws apigateway create-usage-plan --name PartnerPlan \
  --throttle burstLimit=100,rateLimit=50 \
  --quota limit=100000,period=MONTH
```

Return **429 Too Many Requests** when exceeded — implement exponential backoff in clients.

## What is request/response transformation?

**REST API mapping templates (VTL)** — transform request/response body/headers.

```text
Client sends XML → mapping template → Lambda receives JSON
```

**HTTP API** — limited transformation; prefer Lambda to transform or use REST API.

**Request validation** — JSON schema on REST API — reject invalid requests before Lambda (saves cost).

## How does API Gateway compare to Application Load Balancer?

| Aspect | API Gateway | ALB |
|--------|-------------|-----|
| **Primary role** | API management (auth, throttle, keys) | Load balancing HTTP |
| **Pricing** | Per request | Per LCU hour |
| **Lambda** | Native integration | Lambda as target type |
| **WebSocket** | WebSocket API | Native on ALB |
| **WAF** | Supported | Supported |
| **Long-running** | 29s timeout (API GW) | No short timeout |
| **Path routing** | Yes | Yes |

```text
Public REST + auth + pay-per-use   → API Gateway + Lambda
High-throughput microservices      → ALB → ECS/EC2
Both                               → CloudFront → API Gateway (edge) → Lambda
```

## What is Amazon VPC Link?

**VPC Link** — connect API Gateway to **private** resources (NLB in VPC) without public internet.

```text
API Gateway (public) → VPC Link → NLB (private) → ECS/EC2
```

Required when backend runs in private subnets and shouldn't be publicly exposed.

## How do you deploy and version APIs?

| Strategy | Implementation |
|----------|----------------|
| **Stages** | `dev`, `staging`, `prod` URLs |
| **Lambda aliases** | Stage variable points to `prod` alias |
| **Custom domain** | `api.myapp.com` + ACM cert + base path mapping |
| **OpenAPI import** | Swagger/OpenAPI 3 → API definition |

```bash
aws apigateway create-domain-name --domain-name api.myapp.com \
  --regional-certificate-arn arn:aws:acm:us-east-1:123:certificate/abc
```

Use **IaC (SAM, CDK, Terraform)** — not manual console edits in production.

## What is API Gateway caching?

**REST API cache** — cache GET responses at edge (0.5 GB – 237 GB); TTL 0–3600 seconds.

| Benefit | Reduce Lambda/backend load for read-heavy endpoints |
|---------|-----------------------------------------------------|

Enable per stage; invalidate cache on data updates. HTTP API has no built-in cache — use CloudFront in front.

## How does API Gateway compare to Azure APIM?

| Feature | API Gateway | Azure APIM |
|---------|-------------|------------|
| **Developer portal** | Basic / third-party | Rich built-in portal |
| **Policy engine** | Limited + VTL | Extensive XML policies |
| **Products/subscriptions** | Usage plans | Products + subscriptions |
| **Self-hosted gateway** | No | Yes (Premium) |
| **Cost model** | Per-request | Per-unit + tiers |

Both sit at the **API edge** — auth, throttling, routing. APIM stronger for **enterprise API programs**; API Gateway native for **serverless AWS** stacks.

## Related Topics

- **AWS Compute.md** — Lambda functions
- **AWS Identity and IAM.md** — IAM and Cognito authorizers
- **AWS Load Balancing CDN and CDN.md** — ALB vs API Gateway
- **Azure Cloud/Azure API Management and Gateways.md** — APIM comparison
