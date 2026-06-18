# AWS Identity and IAM

## Questions Covered

1. What is AWS IAM, and how does authentication work?
2. What are IAM users, groups, roles, and policies?
3. What is the difference between identity-based and resource-based policies?
4. What are IAM roles vs IAM users for applications?
5. What is IAM Identity Center (AWS SSO)?
6. How does Cognito differ from IAM?
7. What is the principle of least privilege in AWS?
8. How do you secure the AWS root account?
9. What is AWS STS and temporary credentials?
10. How does IAM integrate with EC2, Lambda, and ECS?
11. What are permission boundaries and SCPs?
12. How do you implement API authentication with IAM and Cognito?

## What is AWS IAM, and how does authentication work?

**IAM (Identity and Access Management)** — global service controlling **who** can access **what** in AWS.

| Concept | Description |
|---------|-------------|
| **Authentication** | Prove identity — password, access key, SSO, role assumption |
| **Authorization** | IAM policy evaluation — allow/deny action on resource |
| **Account** | Container for all IAM identities and resources |

```bash
aws sts get-caller-identity
# { "Account": "123456789012", "Arn": "arn:aws:iam::123456789012:user/dev", "UserId": "..." }
```

Every API call is signed and evaluated against IAM policies (except anonymous S3/CloudFront where allowed).

## What are IAM users, groups, roles, and policies?

| Entity | Purpose |
|--------|---------|
| **User** | Long-lived identity for humans or legacy apps |
| **Group** | Collection of users — attach policies to group |
| **Role** | Temporary identity — assumed by user/service/account |
| **Policy** | JSON document — permissions |

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:PutObject"],
    "Resource": "arn:aws:s3:::mycompany-prod-uploads/*"
  }]
}
```

```bash
aws iam create-role --role-name LambdaExecRole \
  --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name LambdaExecRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

**Prefer roles over users** for applications and federated human access.

## What is the difference between identity-based and resource-based policies?

| Type | Attached to | Example |
|------|-------------|---------|
| **Identity-based** | User, group, role | IAM policy on `LambdaExecRole` |
| **Resource-based** | S3 bucket, SNS topic, KMS key | S3 bucket policy |
| **Permission boundary** | Max permissions for identity | Delegate admin safely |
| **SCP** | Organization/account | Deny `ec2:RunInstances` except `t3.*` |

**Evaluation:** Explicit **Deny** always wins; default deny unless allowed.

```json
// S3 bucket policy — allow CloudFront OAC
{
  "Effect": "Allow",
  "Principal": { "Service": "cloudfront.amazonaws.com" },
  "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::mybucket/*",
  "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::123:distribution/ABC" } }
}
```

## What are IAM roles vs IAM users for applications?

| | IAM User + access keys | IAM Role |
|---|------------------------|----------|
| **Credentials** | Long-lived access key | Temporary via STS |
| **Rotation** | Manual burden | Automatic short TTL |
| **Use on EC2** | Bad practice | **Instance profile** |
| **Lambda/ECS** | Never | Execution role |

```bash
# EC2 instance profile
aws iam create-instance-profile --instance-profile-name WebServerProfile
aws iam add-role-to-instance-profile --instance-profile-name WebServerProfile --role-name WebServerRole
```

```csharp
// .NET SDK — default credential chain picks EC2/Lambda role
var s3 = new AmazonS3Client(); // uses instance/task role automatically
```

**Interview:** Never embed access keys in source code or AMIs.

## What is IAM Identity Center (AWS SSO)?

**IAM Identity Center** — centralized SSO for AWS accounts and cloud apps (successor to AWS SSO).

| Feature | Benefit |
|---------|---------|
| **Single sign-on** | One login → multiple AWS accounts |
| **Permission sets** | Mapped to IAM roles in target accounts |
| **External IdP** | Integrate Entra ID, Okta, Google Workspace |
| **Application assignments** | SAML apps |

```text
User → Entra ID → IAM Identity Center → Permission Set → Role in Account A, B, C
```

Replace **long-lived IAM users** for employees with Identity Center + MFA.

## How does Cognito differ from IAM?

| | IAM | Cognito |
|---|-----|---------|
| **Users** | Developers, admins, services | **Application end users** |
| **Use case** | AWS API/console access | Sign-up/sign-in for your web/mobile app |
| **Features** | Policies, roles | User pools, identity pools, social login, JWT |
| **Token** | AWS SigV4 / STS | OIDC JWT tokens |

```text
Employee accessing AWS Console  → IAM Identity Center
Customer using your React app  → Cognito User Pool → JWT → API Gateway authorizer
```

**Identity pools** — exchange Cognito/social identity for **temporary AWS credentials** (direct S3 access from mobile app — use carefully).

## What is the principle of least privilege in AWS?

| Practice | Implementation |
|----------|----------------|
| **Minimal actions** | `s3:GetObject` on one prefix — not `s3:*` |
| **Condition keys** | `"aws:MultiFactorAuthPresent": true` |
| **Resource ARN scoping** | Specific bucket/table ARN |
| **Regular access reviews** | IAM Access Analyzer, credential reports |
| **No wildcards in prod** | Avoid `"Resource": "*"` |

```json
{
  "Effect": "Allow",
  "Action": "dynamodb:GetItem",
  "Resource": "arn:aws:dynamodb:us-east-1:123:table/Orders",
  "Condition": { "ForAllValues:StringEquals": { "dynamodb:LeadingKeys": ["${cognito:username}"] } }
}
```

Use **IAM Access Analyzer** to find overly permissive policies and external access.

## How do you secure the AWS root account?

| Rule | Action |
|------|--------|
| **No daily use** | Root for account setup only |
| **MFA mandatory** | Hardware MFA preferred |
| **No access keys** | Delete if any exist |
| **Alternate contacts** | Billing, security, operations |
| **CloudTrail** | Log all API activity including root |

Create **admin IAM role** via Identity Center for day-to-day administration.

## What is AWS STS and temporary credentials?

**STS (Security Token Service)** — issue temporary credentials (access key + secret + session token).

```bash
aws sts assume-role --role-arn arn:aws:iam::123:role/CrossAccountRead \
  --role-session-name dev-session
```

| API | Use |
|-----|-----|
| **AssumeRole** | Cross-account, role chaining |
| **GetSessionToken** | MFA-protected API calls |
| **AssumeRoleWithWebIdentity** | OIDC from GitHub Actions, EKS IRSA |

**GitHub Actions OIDC** — no static AWS keys in secrets:

```yaml
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123:role/github-deploy
    aws-region: us-east-1
```

## How does IAM integrate with EC2, Lambda, and ECS?

| Service | IAM integration |
|---------|-----------------|
| **EC2** | Instance profile → role → SDK auto-credentials |
| **Lambda** | Execution role — CloudWatch Logs, DynamoDB, VPC |
| **ECS task** | Task role (app AWS API calls) + task execution role (pull image, logs) |
| **EKS** | IRSA — pod-level IAM roles via OIDC |

```json
// ECS task role trust policy (ecs-tasks.amazonaws.com)
// Lambda trust policy (lambda.amazonaws.com)
```

Separate **execution role** (platform) from **task role** (application) in ECS.

## What are permission boundaries and SCPs?

| Control | Scope |
|---------|-------|
| **Permission boundary** | Max permissions an IAM admin can grant to others |
| **SCP (Organizations)** | Max permissions for entire account/OU — cannot grant what SCP denies |

```json
// SCP — deny all except us-east-1 and us-west-2
{
  "Effect": "Deny",
  "Action": "*",
  "Resource": "*",
  "Condition": { "StringNotEquals": { "aws:RequestedRegion": ["us-east-1", "us-west-2"] } }
}
```

SCPs don't grant permissions — they filter what accounts **can** use.

## How do you implement API authentication with IAM and Cognito?

| Method | Use case |
|--------|----------|
| **IAM authorizer** | Service-to-service SigV4 (AWS SDK clients) |
| **Cognito User Pool authorizer** | Mobile/web users with JWT |
| **Lambda authorizer** | Custom token validation |
| **JWT authorizer** | External OIDC (Entra ID, Auth0) |

```text
React SPA → Cognito login → JWT → API Gateway → Lambda
Internal microservice → SigV4 signed request → API Gateway (IAM auth)
```

Validate JWT: issuer, audience, expiry, signature — same as Entra ID pattern in Azure.

## Related Topics

- **AWS Security and Monitoring.md** — CloudTrail, GuardDuty
- **AWS API Gateway.md** — authorizers
- **Azure Cloud/Azure Identity and Entra ID.md** — compare identity models
- **Security/Authentication and Identity.md** — OAuth/OIDC fundamentals
