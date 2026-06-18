# Azure DevOps Deployment Strategies

## Questions Covered

1. How do you deploy .NET apps to Azure App Service from Azure Pipelines?
2. How do you deploy container images to Azure Container Apps or AKS?
3. What are deployment jobs and environments in Azure Pipelines?
4. What is blue-green deployment in Azure?
5. What are deployment slots, and how do they enable zero-downtime?
6. What is canary deployment, and how is it implemented?
7. What are rolling updates in Kubernetes via Azure Pipelines?
8. How do you manage multi-environment pipelines (dev, staging, prod)?
9. What are approval gates and checks on environments?
10. What is a deployment group vs environment-based deployment?
11. How do you roll back a failed deployment?
12. How do you deploy Angular/React static apps?

## How do you deploy .NET apps to Azure App Service from Azure Pipelines?

```yaml
- stage: Deploy
  jobs:
    - deployment: DeployApi
      environment: staging
      pool:
        vmImage: ubuntu-latest
      strategy:
        runOnce:
          deploy:
            steps:
              - task: DotNetCoreCLI@2
                inputs:
                  command: publish
                  publishWebProjects: true
                  arguments: '-c Release -o $(Build.ArtifactStagingDirectory)/api'

              - task: AzureWebApp@1
                inputs:
                  azureSubscription: 'contoso-azure'
                  appType: webAppLinux
                  appName: 'contoso-api-staging'
                  package: '$(Build.ArtifactStagingDirectory)/api/**/*.zip'
```

**Flow:** build → test → publish zip → deploy task uses service connection to Azure.

## How do you deploy container images to Azure Container Apps or AKS?

```yaml
- task: Docker@2
  inputs:
    command: buildAndPush
    containerRegistry: contoso-acr
    repository: contoso/api
    tags: $(Build.BuildId)

- task: AzureContainerApps@1
  inputs:
    azureSubscription: contoso-azure
    containerAppName: contoso-api
    resourceGroup: rg-contoso
    imageToDeploy: contoso.azurecr.io/contoso/api:$(Build.BuildId)
```

**AKS:**

```yaml
- task: KubernetesManifest@1
  inputs:
    action: deploy
    kubernetesServiceConnection: contoso-aks
    manifests: k8s/deployment.yaml
    containers: contoso.azurecr.io/contoso/api:$(Build.BuildId)
```

## What are deployment jobs and environments in Azure Pipelines?

**Deployment jobs** track deployment history per **environment** (dev, staging, production).

```yaml
- deployment: DeployProd
  environment: production    # approvals + checks attached here
  strategy:
    runOnce:
      deploy:
        steps:
          - script: echo Deploying to prod
```

Environments show **who deployed what, when** — audit trail for releases.

## What is blue-green deployment in Azure?

Two identical environments — only one serves traffic:

```text
Blue  (v1) ← 100% traffic
Green (v2) ← deploy + test, then switch traffic
```

| Azure option | Mechanism |
|--------------|-----------|
| **App Service slots** | Swap staging ↔ production |
| **Front Door / App Gateway** | Weighted routing between backends |
| **AKS** | Two deployments + service selector switch |

Instant rollback = switch traffic back to blue.

## What are deployment slots, and how do they enable zero-downtime?

**App Service slots** — separate instances (staging, canary) under same app:

```yaml
- task: AzureWebApp@1
  inputs:
    deployToSlotOrASE: true
    slotName: staging

- task: AzureAppServiceManage@0
  inputs:
    Action: 'Swap Slots'
    SourceSlot: staging
    SwapWithProduction: true
```

Warm up staging slot (`/health`) before swap — users never see v2 until validated.

## What is canary deployment, and how is it implemented?

Route **small %** of traffic to new version; increase if metrics OK.

```text
v1: 90%  |  v2: 10%  →  monitor errors/latency  →  v2: 100%
```

| Platform | Tool |
|----------|------|
| **AKS** | Flagger, Argo Rollouts |
| **App Gateway** | Weighted backend pools |
| **Azure Front Door** | Traffic splitting |

Pipeline deploys canary + automated rollback on failed health checks.

## What are rolling updates in Kubernetes via Azure Pipelines?

```yaml
# deployment.yaml
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
```

Pipeline updates image tag → K8s gradually replaces pods. **Readiness probes** prevent traffic to unhealthy pods.

For zero-downtime: `maxUnavailable: 0`, sufficient replicas across nodes/AZs.

## How do you manage multi-environment pipelines (dev, staging, prod)?

```yaml
stages:
  - stage: Build
    jobs: [/* build once */]

  - stage: DeployDev
    dependsOn: Build
    jobs:
      - deployment: ToDev
        environment: dev
        variables:
          webAppName: contoso-api-dev

  - stage: DeployStaging
    dependsOn: DeployDev
    jobs:
      - deployment: ToStaging
        environment: staging

  - stage: DeployProd
    dependsOn: DeployStaging
    jobs:
      - deployment: ToProd
        environment: production
```

**Same artifact** promoted through environments — don't rebuild per env.

## What are approval gates and checks on environments?

| Check | Purpose |
|-------|---------|
| **Approvals** | Manual sign-off (lead, change manager) |
| **Branch control** | Only `main` deploys to prod |
| **Azure Monitor alert** | Block if active sev-1 alert |
| **Invoke REST/API** | Custom quality gate |
| **Required template** | Enforce pipeline template |

Configure under **Pipelines → Environments → Approvals and checks**.

## What is a deployment group vs environment-based deployment?

| | **Deployment group** | **Environment (modern)** |
|--|----------------------|--------------------------|
| **Target** | VM agents with tags | Any compute (Azure, K8s, VM) |
| **Use case** | IIS on Windows VMs | App Service, AKS, Functions |
| **Status** | Legacy for VM farms | Preferred for cloud-native |

New projects: **environments + deployment jobs**; deployment groups for **on-prem VM** fleets only.

## How do you roll back a failed deployment?

| Strategy | Action |
|----------|--------|
| **Slot swap back** | Reverse App Service swap |
| **Redeploy previous artifact** | Pipeline re-run with old `BuildId` |
| **K8s rollout undo** | `kubectl rollout undo deployment/api` |
| **Feature flags** | Disable feature without redeploy |

Store **immutable artifacts** (container tags, zip builds) — rollback = deploy known-good version.

```yaml
# Pipeline parameter for hotfix rollback
parameters:
  - name: imageTag
    default: $(Build.BuildId)
```

## How do you deploy Angular/React static apps?

```yaml
- script: npm ci && npm run build
  workingDirectory: client

- task: AzureStaticWebApp@0
  inputs:
    app_location: client
    output_location: dist
    azure_static_web_apps_api_token: $(SWA_TOKEN)
```

Or upload to **Blob Storage + CDN** / **App Service static** / **Azure Front Door** origin.

SPA routing: configure fallback to `index.html`.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Kubernetes/Kubernetes Deployment Strategies.md
- Azure Cloud 1/Azure Compute.md
- Docker/Docker Build and CICD Integration.md
