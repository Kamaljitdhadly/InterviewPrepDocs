# Docker and Cloud Integration

## Questions Covered

1. How do you deploy Docker containers on AWS, Azure, or Google Cloud?
2. What is Amazon ECS, and how does it integrate with Docker?
3. How do you use Azure Container Instances (ACI) with Docker?
4. What is the role of Docker in Google Kubernetes Engine (GKE)?

## How do you deploy Docker containers on AWS, Azure, or Google Cloud?

Each cloud provider offers managed services to build, push, and run Docker images.

### AWS

| Service | Steps |
|---------|-------|
| **ECS** | Push image to ECR → create cluster → define task definition (image, CPU, memory, networking) → run tasks on EC2 or Fargate |
| **EKS** | Create cluster → push to ECR → deploy via Kubernetes manifests (Deployment YAML) |
| **Lambda** | Build Lambda-compatible image → push to ECR → create function with container image + triggers |

### Azure

| Service | Steps |
|---------|-------|
| **App Service** | Push to ACR or Docker Hub → create App Service plan → deploy Web App from image |
| **AKS** | Create cluster → push to ACR → deploy via Kubernetes manifests |
| **Functions** | Package function in image → push to ACR → create Function App from image |

### Google Cloud

| Service | Steps |
|---------|-------|
| **GKE** | Create cluster → push to GCR/Artifact Registry → deploy via Kubernetes manifests |
| **Cloud Run** | Push image → deploy to Cloud Run (auto-scales, serverless) |
| **App Engine (Flexible)** | Push to GCR → deploy specifying Docker image |

Each provider offers monitoring, scaling, and management tools — consult service docs for specifics.

## What is Amazon ECS, and how does it integrate with Docker?

**Amazon ECS** is AWS's fully managed container orchestration service for running and scaling Docker containers in production.

**Key features:**

- **Container management** — automates deployment, scaling, and lifecycle of Docker containers.
- **Task definitions** — JSON specs for images, CPU/memory, networking, and config.
- **Cluster management** — EC2 launch type or serverless **Fargate**; handles scheduling and monitoring.
- **Service discovery** — integrates with AWS service discovery for inter-container communication.
- **Load balancing** — configures ELBs to distribute traffic.
- **Scaling** — auto-scales containers based on demand.
- **Security** — IAM access control and VPC networking.

**Docker integration:**

1. **Images** — build locally, push to ECR or Docker Hub; ECS pulls them for tasks.
2. **Task definitions** — specify Docker images, resources, and networking.
3. **Tasks** — running container instances on EC2 or Fargate.
4. **Orchestration** — schedules containers, handles failovers and rolling updates.
5. **Services** — maintain desired replica count; attach load balancers for long-running apps.
6. **AWS ecosystem** — CloudWatch (logging/monitoring), IAM, CloudFormation.

**Deploy workflow:** build & push image → define task definition → create cluster → launch tasks/services → monitor via console/CLI.

## How do you use Azure Container Instances (ACI) with Docker?

**ACI** runs Docker containers in Azure without managing VMs or a full orchestrator — ideal for quick, on-demand workloads.

**Steps:**

1. **Build & push image** — to ACR, Docker Hub, or any compatible registry.
2. **Install Azure CLI** — [Azure CLI installation page](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli); run `az login`.
3. **Create resource group:**

```bash
az group create --name <ResourceGroupName> --location <Location>
```

4. **Create container instance:**

```bash
az container create \
--resource-group <ResourceGroupName> \
--name <ContainerInstanceName> \
--image <ContainerImage> \
--cpu <CPU> \
--memory <Memory> \
--ports <Port1> <Port2> \
--registry-login-server <RegistryLoginServer> \
--registry-username <RegistryUsername> \
--registry-password <RegistryPassword>
```

5. **Verify:** `az container show --resource-group <ResourceGroupName> --name <ContainerInstanceName>`
6. **Access** — use the public IP from `az container show` if ports are exposed.
7. **Logs:** `az container logs --resource-group <ResourceGroupName> --name <ContainerInstanceName>`

**Considerations:**

- **Networking** — public or private IP; configure VNet/subnet for private networking.
- **Scaling** — manual (no auto-scale like K8s/ECS); create instances as needed.
- **Secrets** — pass env vars or use Azure Key Vault.

## What is the role of Docker in Google Kubernetes Engine (GKE)?

In GKE, Docker packages applications; Kubernetes orchestrates deployment and scaling.

- **Docker images** — contain app code, runtime, libraries, and dependencies.
- **Dockerfiles** — define consistent image builds across environments.
- **Image storage** — GCR or Artifact Registry; GKE pulls images when deploying/scaling.
- **Pods** — smallest K8s unit; one or more Docker containers per Pod, specified in YAML.
- **Orchestration** — K8s schedules Pods, manages lifecycle, health checks, and scaling.
- **Building/pushing** — `docker build` locally, `docker push` to registry.
- **Manifests** — YAML defines image, replicas, resource limits, env vars.
- **Controllers** — Deployments, StatefulSets, DaemonSets manage Pod replicas, updates, and rollbacks.

**Workflow:** develop/test locally with Dockerfile → push to GCR → write K8s manifests → `kubectl apply -f <manifest>` → manage/scale via K8s.

**Summary:** Docker handles packaging; GKE/Kubernetes handles deployment, scaling, and management — ensuring portable, consistent cloud-native apps.
