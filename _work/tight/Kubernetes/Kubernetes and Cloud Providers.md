# Kubernetes and Cloud Providers

## Questions Covered

1. How do cloud providers (e.g., AWS, Azure, GCP) integrate with Kubernetes?
2. What is Google Kubernetes Engine (GKE)?
3. What is Amazon EKS (Elastic Kubernetes Service)?
4. What is Azure Kubernetes Service (AKS)?
5. How can you integrate Kubernetes with CI/CD pipelines?

## How do cloud providers (e.g., AWS, Azure, GCP) integrate with Kubernetes?

Major clouds offer **managed Kubernetes** plus deep integration with native IAM, networking, storage, load balancing, and observability.

### AWS — Amazon EKS

| Area | Integration |
|------|-------------|
| **Control plane** | Fully managed (API server, etcd, scheduler) |
| **IAM** | AuthN/AuthZ for cluster and AWS resources |
| **Networking** | VPC + VPC CNI plugin |
| **Storage** | EBS (block), S3 (object) |
| **Load balancing** | ELB (internal/external) |
| **Monitoring** | CloudWatch |

**Additional:** Route 53 (DNS), **AWS Fargate** (serverless pods).

### Azure — AKS

| Area | Integration |
|------|-------------|
| **Control plane** | Managed by Azure |
| **Identity** | Azure Active Directory (AAD) |
| **Networking** | VNet + Azure CNI |
| **Storage** | Azure Disk, Azure Blob |
| **Load balancing** | Azure Load Balancer, Application Gateway |
| **Monitoring** | Azure Monitor, Log Analytics |

**Additional:** Azure DevOps (CI/CD), **ACI** (serverless containers).

### GCP — GKE

| Area | Integration |
|------|-------------|
| **Control plane** | Fully managed |
| **IAM** | Google Cloud IAM |
| **Networking** | VPC + Google CNI |
| **Storage** | Persistent Disk, Cloud Storage |
| **Load balancing** | Google Cloud Load Balancing |
| **Monitoring** | Cloud Operations Suite (Stackdriver) |

**Additional:** Cloud Build (CI/CD), **Anthos** (hybrid/multi-cloud).

Managed services offload control-plane ops so teams focus on applications.

## What is Google Kubernetes Engine (GKE)?

**GKE** is GCP's fully managed Kubernetes service for deploying, managing, and scaling containerized apps.

### Key Features

| Feature | Details |
|---------|---------|
| **Control plane** | Managed API server, etcd, scheduler; automatic upgrades |
| **Node pools** | Multiple pools per cluster (different machine types); HPA + cluster autoscaling |
| **Cloud integration** | Persistent Disk, Cloud Storage, VPC, Cloud Load Balancing, Operations Suite |
| **Security** | IAM, network policies, private clusters (control plane off public internet) |
| **Productivity** | Cloud Build CI/CD; **GKE Autopilot** (managed nodes/infrastructure) |
| **Hybrid/multi-cloud** | **Anthos** extends GKE to on-prem and other clouds |

### Key Concepts

- **Clusters** — control plane + worker nodes
- **Node pools** — groups of similarly configured nodes
- **Namespaces** — logical isolation within a cluster

### Example Workflow

1. **Create cluster:**

gcloud container clusters create my-cluster --zone us-central1-a

2. **Deploy:**

```yaml
kubectl apply -f my-deployment.yaml
```

3. **Expose (LoadBalancer):**

```yaml
kubectl expose deployment my-app --type=LoadBalancer --port 80 --target-port 8080
```

4. **Monitor** — Cloud Operations Suite
5. **Scale:**

```yaml
kubectl scale deployment my-app --replicas=3
```

6. **Secure** — IAM roles + network policies

## What is Amazon EKS (Elastic Kubernetes Service)?

**EKS** is AWS's fully managed Kubernetes service — AWS runs the control plane and integrates with the AWS ecosystem.

### Key Features

| Feature | Details |
|---------|---------|
| **Control plane** | Managed across multiple AZs for HA |
| **Nodes** | EC2 **node groups**; HPA + cluster autoscaling |
| **AWS integration** | IAM, VPC + AWS CNI, EBS, S3, ELB |
| **Security** | IAM Roles for Service Accounts (IRSA); private clusters |
| **Observability** | CloudWatch metrics/logs/alarms; AWS X-Ray tracing |
| **Productivity** | **EKS Fargate** (serverless pods); CodePipeline/CodeBuild CI/CD |

### Key Concepts

- **Clusters** — managed control plane + worker nodes (Console, CLI, SDKs)
- **Node groups** — EC2 collections with instance types and scaling policies
- **Service discovery** — Route 53 DNS integration

### Example Workflow

1. **Create cluster:**

```yaml
aws eks create-cluster --name my-cluster --role-arn arn:aws:iam::<account-id>:role/EKS-Cluster-Role --resources-vpc-config subnetIds=subnet-12345678,subnet-23456789,securityGroupIds=sg-12345678
```

2. **Configure kubectl:**

aws eks update-kubeconfig --name my-cluster

3. **Deploy:**

```yaml
kubectl apply -f my-deployment.yaml
```

4. **Expose:**

```yaml
kubectl expose deployment my-app --type=LoadBalancer --port 80 --target-port 8080
```

5. **Monitor** — CloudWatch
6. **Scale:**

```yaml
kubectl scale deployment my-app --replicas=3
```

## What is Azure Kubernetes Service (AKS)?

**AKS** is Azure's fully managed Kubernetes service with integrated Azure identity, networking, and DevOps tooling.

### Key Features

| Feature | Details |
|---------|---------|
| **Control plane** | Managed across AZs; patching/upgrades handled by Azure |
| **Node pools** | Multiple VM-based pools per cluster; HPA + cluster autoscaling |
| **Azure integration** | AAD, VNet + Azure CNI, Azure Disk, Blob, Load Balancer, Application Gateway |
| **Security** | Azure RBAC + AAD; network policies; private clusters (API in VNet only) |
| **Observability** | Azure Monitor, Log Analytics, Security Center |
| **Productivity** | Azure DevOps CI/CD; ACI for serverless/hybrid workloads |

### Key Concepts

- **Clusters** — portal, Azure CLI, or ARM templates
- **Node pools** — VM groups with size/scaling config
- **Namespaces** — isolate apps and environments

### Example Workflow

1. **Create cluster:**

az aks create --resource-group myResourceGroup --name myAKSCluster --node-count 3 --enable-addons monitoring --generate-ssh-keys

2. **Configure kubectl:**

az aks get-credentials --resource-group myResourceGroup --name myAKSCluster

3. **Deploy:**

```yaml
kubectl apply -f my-deployment.yaml
```

4. **Expose:**

```yaml
kubectl expose deployment my-app --type=LoadBalancer --port 80 --target-port 8080
```

5. **Monitor** — Azure Monitor / Log Analytics
6. **Scale:**

```yaml
kubectl scale deployment my-app --replicas=3
```

## How can you integrate Kubernetes with CI/CD pipelines?

CI/CD automates **build → test → deploy** to Kubernetes clusters.

### Pipeline Stages

- **CI** — build, test, validate code changes
- **CD** — deploy to staging/production environments

### Popular Tools

| Tool | Kubernetes Integration |
|------|------------------------|
| **Jenkins** | Jenkinsfile + Kubernetes/Docker plugins; build image → push → `kubectl` deploy |
| **GitLab CI/CD** | `.gitlab-ci.yml` or Auto DevOps; registry push + `kubectl`/Helm deploy |
| **GitHub Actions** | Workflows build/push images and deploy via `kubectl` |
| **Azure Pipelines** | Built-in tasks for AKS or any cluster; ACR + `kubectl`/Helm |
| **CircleCI** | `.circleci/config.yml` workflows with registry + K8s deploy |

### Integration Steps

**1. Build & Test** — checkout → Docker build → run tests:

```yaml
# Example for GitHub Actions
jobs:
build:
runs-on: ubuntu-latest
steps:
- name: Checkout code
uses: actions/checkout@v2
- name: Build Docker image
run: docker build -t my-app:latest .
- name: Run tests
run: docker run my-app:latest test
```

**2. Push to Registry** — Docker Hub, GCR, ACR, etc.:

```yaml
# Example for GitHub Actions
jobs:
push:
runs-on: ubuntu-latest
steps:
- name: Login to Docker Hub
uses: docker/login-action@v1
with:
username: ${{ secrets.DOCKER_USERNAME }}
password: ${{ secrets.DOCKER_PASSWORD }}
- name: Push Docker image
run: docker push my-app:latest
```

**3. Deploy to Kubernetes** — `kubectl apply` or Helm:

```yaml
# Example for GitHub Actions
jobs:
deploy:
runs-on: ubuntu-latest
steps:
- name: Checkout code
uses: actions/checkout@v2
- name: Setup kubectl
uses: azure/setup-kubectl@v1
with:
version: 'latest'
- name: Deploy to Kubernetes
run: kubectl apply -f k8s/deployment.yaml
```

### Best Practices

- **Config** — environment-specific files, ConfigMaps, Secrets
- **Helm** — templated deploys and upgrades
- **Rolling updates** — minimize downtime
- **Monitoring** — track deploy success and app health
- **Security** — least-privilege credentials/secrets
- **Testing** — unit, integration, and e2e in pipeline
