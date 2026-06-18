# AWS CLI and Commands

## Questions Covered

1. How do you install and configure the AWS CLI?
2. What are profiles, regions, and output formats?
3. What are essential EC2 and VPC commands?
4. What are essential S3 commands?
5. What are essential IAM commands?
6. What are essential Lambda and ECS commands?
7. How do you use CloudFormation and SAM from the CLI?
8. What is the difference between AWS CLI v1 and v2?
9. How do you use AWS CLI in CI/CD?
10. What are JMESPath query tips?
11. How do you troubleshoot CLI errors?
12. What is AWS CloudShell?

## How do you install and configure the AWS CLI?

```bash
# Windows (winget)
winget install Amazon.AWSCLI

# Verify
aws --version   # aws-cli/2.x

# Interactive configure
aws configure
# AWS Access Key ID, Secret, default region (us-east-1), output (json)

# Verify identity
aws sts get-caller-identity
```

**Credentials file:** `~/.aws/credentials`  
**Config file:** `~/.aws/config` (region, output, role_arn for profiles)

```ini
[profile prod]
role_arn = arn:aws:iam::123456789012:role/AdminRole
source_profile = default
region = us-east-1
```

## What are profiles, regions, and output formats?

```bash
aws s3 ls --profile prod --region eu-west-1
aws ec2 describe-instances --profile dev --output table
```

| Output | Use |
|--------|-----|
| **json** | Default — scripting with jq |
| **table** | Human-readable lists |
| **text** | Tab-separated |
| **yaml** | Readable config |

```bash
export AWS_PROFILE=prod
export AWS_DEFAULT_REGION=us-east-1
```

## What are essential EC2 and VPC commands?

```bash
# EC2
aws ec2 run-instances --image-id ami-0abc --instance-type t3.medium \
  --key-name my-key --security-group-ids sg-abc --subnet-id subnet-def \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=web-01}]'

aws ec2 describe-instances --filters "Name=tag:Environment,Values=Production" \
  --query "Reservations[].Instances[].{Id:InstanceId,State:State.Name,Type:InstanceType}" --output table

aws ec2 stop-instances --instance-ids i-0abc123
aws ec2 terminate-instances --instance-ids i-0abc123

# VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16
aws ec2 create-subnet --vpc-id vpc-abc --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 describe-security-groups --group-ids sg-abc

# SSM session (no SSH)
aws ssm start-session --target i-0abc123
```

## What are essential S3 commands?

```bash
aws s3 mb s3://my-bucket-prod
aws s3 cp ./report.pdf s3://my-bucket-prod/reports/
aws s3 sync ./dist s3://my-bucket-prod/app/ --delete
aws s3 ls s3://my-bucket-prod/ --recursive --human-readable --summarize

# Presigned URL (temporary download link)
aws s3 presign s3://my-bucket-prod/reports/report.pdf --expires-in 3600

# Bucket policy
aws s3api put-bucket-policy --bucket my-bucket-prod --policy file://policy.json
aws s3api get-bucket-encryption --bucket my-bucket-prod
```

## What are essential IAM commands?

```bash
aws iam list-users
aws iam create-role --role-name LambdaExec --assume-role-policy-document file://trust.json
aws iam attach-role-policy --role-name LambdaExec \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam create-policy --policy-name S3ReadUploads --policy-document file://policy.json
aws iam list-attached-role-policies --role-name LambdaExec

# Access keys (avoid for apps — use roles)
aws iam create-access-key --user-name ci-user
```

## What are essential Lambda and ECS commands?

```bash
# Lambda
aws lambda create-function --function-name ProcessOrder \
  --runtime python3.12 --role arn:aws:iam::123:role/LambdaExec \
  --handler app.handler --zip-file fileb://function.zip

aws lambda update-function-code --function-name ProcessOrder --zip-file fileb://function.zip
aws lambda invoke --function-name ProcessOrder --payload '{"orderId":"1"}' out.json

# ECS
aws ecs list-clusters
aws ecs run-task --cluster prod --task-definition myapp:5 --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-aaa],securityGroups=[sg-abc],assignPublicIp=DISABLED}"

aws logs tail /aws/lambda/ProcessOrder --follow
```

## How do you use CloudFormation and SAM from the CLI?

```bash
# CloudFormation
aws cloudformation validate-template --template-body file://template.yaml
aws cloudformation deploy --template-file template.yaml --stack-name myapp-prod \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --parameter-overrides Environment=prod

aws cloudformation describe-stacks --stack-name myapp-prod
aws cloudformation delete-stack --stack-name myapp-dev

# SAM
sam build
sam deploy --guided
sam local invoke ProcessOrder --event events/order.json
```

## What is the difference between AWS CLI v1 and v2?

| | CLI v1 | CLI v2 |
|---|--------|--------|
| **Status** | Maintenance | **Current** |
| **Install** | pip `awscli` | Standalone installer |
| **Features** | Older | SSO login, improved performance, `aws s3` enhancements |
| **Recommendation** | Migrate off | Use v2 |

```bash
aws sso login --profile my-sso-profile
```

## How do you use AWS CLI in CI/CD?

```yaml
# GitHub Actions — OIDC (no static keys)
- uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/github-deploy
    aws-region: us-east-1

- run: aws cloudformation deploy --template-file infra.yaml --stack-name myapp-${{ github.ref_name }}
```

```yaml
# Azure DevOps — optional access keys or OIDC
- task: AWSShellScript@1
  inputs:
    awsCredentials: 'AWS-Prod'
    regionName: 'us-east-1'
    scriptType: 'inline'
    inlineScript: |
      aws s3 sync $(Build.ArtifactStagingDirectory) s3://my-bucket-prod/build/
```

## What are JMESPath query tips?

```bash
# Extract instance IDs only
aws ec2 describe-instances --query 'Reservations[].Instances[].InstanceId' --output text

# Filter running instances
aws ec2 describe-instances --filters Name=instance-state-name,Values=running \
  --query 'Reservations[].Instances[].[Tags[?Key==`Name`].Value | [0], InstanceId]' --output table

# Store in variable
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=web-01" \
  --query 'Reservations[0].Instances[0].InstanceId' --output text)
```

Pipe to **jq** for complex JSON: `aws ... --output json | jq '.Stacks[0].StackStatus'`

## How do you troubleshoot CLI errors?

| Error | Fix |
|-------|-----|
| **Unable to locate credentials** | `aws configure` or set `AWS_PROFILE` / IAM role |
| **AccessDenied** | Check IAM policy; `aws sts get-caller-identity` |
| **InvalidParameterValue** | Wrong region/AZ; check service quotas |
| **RequestExpired** | Clock skew — sync system time |
| **Throttling** | Exponential backoff; request limit increase |

```bash
aws ec2 run-instances ... --debug 2>&1 | tee debug.log
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=RunInstances
```

## What is AWS CloudShell?

**CloudShell** — browser-based shell in AWS Console with CLI v2 pre-installed; 1 GB persistent storage per region.

| Use | Quick commands without local install |
|-----|--------------------------------------|

Not for CI/CD — use local CLI or pipeline agents for automation.

## Related Topics

- **AWS Basics.md** — regions, IAM overview
- **AWS Compute.md** — EC2, Lambda details
- **AWS Identity and IAM.md** — roles, policies
- **Azure Cloud 1/Azure Commands and CLI.md** — Azure CLI comparison
