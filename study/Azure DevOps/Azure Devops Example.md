# Azure Devops Example

## Questions Covered

1. What does this sample pipeline automate end-to-end?
2. How does the trigger and agent pool work?
3. How are Docker images built and pushed for .NET and Angular?
4. How does deployment to Kubernetes work in this example?
5. What service connections and secrets are required?
6. What would you improve for a production pipeline?
7. How does this relate to multi-stage YAML pipelines?

## What does this sample pipeline automate end-to-end?

This is a **single-job pipeline** that demonstrates a full **build → push → deploy** flow for a **.NET API** and **Angular frontend**, both containerized and deployed to **Kubernetes**.

```text
Push to main
  → Microsoft-hosted Ubuntu agent
  → Install .NET SDK
  → docker build (API) + docker build (Web)
  → docker push both images to registry
  → kubectl apply deployments
  → kubectl apply ingress (external URL)
```

It is intentionally **simple** — one `job` does everything. Production pipelines usually split into **Build** and **Deploy** stages with tests, approvals, and separate environments.

## Sample azure-pipelines.yml

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  dockerRegistryServiceConnection: 'your-docker-registry-service-connection'
  imageRepositoryDotnet: 'your-dockerhub-username/dotnet-app'
  imageRepositoryAngular: 'your-dockerhub-username/angular-app'
  containerRegistry: 'your-container-registry-name'
  kubernetesCluster: 'your-kubernetes-cluster-name'
  kubernetesNamespace: 'default'
  kubectlServiceConnection: 'your-kubectl-service-connection'

jobs:
- job: BuildAndDeploy
  displayName: Build images and deploy to AKS
  steps:
  - task: UseDotNet@2
    inputs:
      packageType: 'sdk'
      version: '8.x'
      installationPath: $(Agent.ToolsDirectory)/dotnet

  - script: |
      echo Building .NET app...
      docker build -t $(imageRepositoryDotnet):$(Build.BuildId) -f Dockerfile.dotnet .
    displayName: 'Build .NET Docker image'

  - script: |
      echo Building Angular app...
      docker build -t $(imageRepositoryAngular):$(Build.BuildId) -f Dockerfile.angular .
    displayName: 'Build Angular Docker image'

  - task: Docker@2
    inputs:
      command: 'push'
      containerRegistry: $(dockerRegistryServiceConnection)
      repository: $(imageRepositoryDotnet)
      tags: $(Build.BuildId)
    displayName: 'Push .NET Docker image'

  - task: Docker@2
    inputs:
      command: 'push'
      containerRegistry: $(dockerRegistryServiceConnection)
      repository: $(imageRepositoryAngular)
      tags: $(Build.BuildId)
    displayName: 'Push Angular Docker image'

  - task: Kubernetes@1
    inputs:
      kubernetesServiceEndpoint: $(kubectlServiceConnection)
      namespace: $(kubernetesNamespace)
      command: apply
      arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'
    displayName: 'Deploy to Kubernetes'

  - task: Kubernetes@1
    inputs:
      kubernetesServiceEndpoint: $(kubectlServiceConnection)
      namespace: $(kubernetesNamespace)
      command: apply
      arguments: '-f k8s/ingress.yaml'
    displayName: 'Apply Ingress Configuration'
```

## How does the trigger and agent pool work?

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'
```

**Trigger:** Pipeline runs automatically when commits land on `main`. For team workflows, add a separate `pr:` trigger for validation before merge (see Azure DevOps Pipelines and CI-CD.md).

**Pool:** `ubuntu-latest` is a **Microsoft-hosted** Linux VM — fresh each run, has Docker pre-installed. Use `windows-latest` only if your Dockerfiles require Windows containers (rare for .NET Core + Angular).

**Build ID tagging:** `$(Build.BuildId)` is a unique integer per run — use it as the image tag so every deployment is traceable and rollback-friendly.

## How are Docker images built and pushed for .NET and Angular?

The pipeline assumes **two Dockerfiles** at repo root:

| File | Builds |
|------|--------|
| `Dockerfile.dotnet` | ASP.NET Core API — multi-stage `sdk` → `aspnet` runtime |
| `Dockerfile.angular` | Angular app — `node` build stage → `nginx` serves static files |

```yaml
docker build -t $(imageRepositoryDotnet):$(Build.BuildId) -f Dockerfile.dotnet .
```

**Docker@2 push task** uses a **service connection** to authenticate to ACR or Docker Hub — you never put registry passwords in YAML.

**Typical improvement:** Use `Docker@2` with `command: buildAndPush` in one step per image, and build only what changed via path filters (`src/api/**` vs `client/**`).

## How does deployment to Kubernetes work in this example?

Two **Kubernetes@1** tasks run `kubectl apply`:

```yaml
# Task 1: Deploy workloads
arguments: '-f k8s/dotnet-deployment.yaml -f k8s/angular-deployment.yaml'

# Task 2: Expose via Ingress
arguments: '-f k8s/ingress.yaml'
```

**Expected manifest structure:**

```text
k8s/
  dotnet-deployment.yaml   # Deployment + Service for API
  angular-deployment.yaml  # Deployment + Service for SPA
  ingress.yaml             # Routes /api → dotnet, / → angular
```

The **kubectl service connection** stores cluster URL + credentials (kubeconfig or Azure RM linked AKS). The agent must reach the Kubernetes API — for private clusters, use a **self-hosted agent** inside the VNet.

**Note:** Static `kubectl apply` with YAML that says `image: myrepo/api:latest` won't pick up your new tag unless manifests use `$(Build.BuildId)` substitution — production pipelines use `KubernetesManifest@1` with `containers:` override or Kustomize/Helm.

## What service connections and secrets are required?

Configure in **Project Settings → Service connections** before first run:

| Service connection | Purpose |
|--------------------|---------|
| **Docker registry** | Push images to ACR / Docker Hub |
| **Kubernetes** | Run kubectl against AKS cluster |

Replace placeholder variables:

```yaml
dockerRegistryServiceConnection: 'contoso-acr-connection'
imageRepositoryDotnet: 'contoso.azurecr.io/shop-api'
imageRepositoryAngular: 'contoso.azurecr.io/shop-web'
kubectlServiceConnection: 'contoso-aks-connection'
kubernetesNamespace: 'shop'
```

For **Azure Container Registry + AKS**, prefer **managed identity** on AKS to pull from ACR — no registry password in cluster secrets.

## What would you improve for a production pipeline?

This sample is a learning baseline. Production changes:

| Gap in sample | Production fix |
|---------------|----------------|
| Single job — build and deploy together | Separate **Build** / **DeployStaging** / **DeployProd** stages |
| No tests | Add `dotnet test`, `npm test`, container scan |
| Deploys straight to cluster from build | Use **deployment job** + **environment** approval for prod |
| `latest` tag risk | Only immutable `$(Build.BuildId)` tags |
| Hard-coded `main` deploy | Path filters; PR validation pipeline |
| kubectl apply without image update | `KubernetesManifest@1` sets image tag explicitly |
| No health check after deploy | Smoke test `/health` step; rollback on failure |
| Secrets in variables | OIDC to Azure, Key Vault variable groups |

**Production skeleton:**

```yaml
stages:
  - stage: Build
    jobs: [/* test, docker buildAndPush, publish manifests */]
  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: Staging
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps: [/* deploy + smoke test */]
  - stage: DeployProd
    dependsOn: DeployStaging
    jobs:
      - deployment: Production
        environment: production
        strategy:
          runOnce:
            deploy:
              steps: [/* deploy */]
```

## How does this relate to multi-stage YAML pipelines?

This example uses the **legacy flat `jobs:`** structure at pipeline root. Modern pipelines prefer **`stages:`** because they:

- Express **build vs deploy** ordering clearly
- Attach **approvals** to environments on deploy stages only
- Allow **parallel jobs** within build (API and Web build simultaneously)
- Support **re-running only failed stage** instead of whole pipeline

The concepts are identical — **steps → tasks**, **variables**, **service connections** — only the container hierarchy changes. Migrating this sample to stages is the natural next step after understanding the flow.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Azure DevOps/Azure DevOps Deployment Strategies.md
- Docker/Docker Build and CICD Integration.md
- Kubernetes/Kubernetes Deployment Strategies.md
