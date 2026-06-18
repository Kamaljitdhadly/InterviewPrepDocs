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

**App Service** is the most common target for ASP.NET Core APIs and web apps. The pipeline **builds once**, publishes a zip, and the deploy task pushes it to Azure using a **service connection**.

```yaml
- stage: Deploy
  displayName: Deploy to staging
  jobs:
    - deployment: DeployApi
      environment: staging
      pool:
        vmImage: ubuntu-latest
      strategy:
        runOnce:
          deploy:
            steps:
              - download: current
                artifact: drop

              - task: DotNetCoreCLI@2
                inputs:
                  command: publish
                  publishWebProjects: true
                  arguments: '-c Release -o $(Pipeline.Workspace)/publish'

              - task: AzureWebApp@1
                inputs:
                  azureSubscription: 'contoso-azure'
                  appType: webAppLinux
                  appName: 'contoso-api-staging'
                  package: '$(Pipeline.Workspace)/publish/**/*.zip'
```

**End-to-end flow:**
1. **Build stage** (earlier) compiles and runs tests.
2. **Deploy stage** downloads the artifact or publishes fresh from source.
3. `AzureWebApp@1` uses the service connection to authenticate to Azure and upload the package.
4. App Service restarts the app with the new bits.

Use **Linux + .NET 8** App Service for new projects unless you need Windows-specific features (legacy COM, etc.).

## How do you deploy container images to Azure Container Apps or AKS?

Container deployments add **build image → push to registry → update running service** steps.

**Container Apps** (serverless containers — good default for microservices):

```yaml
- task: Docker@2
  displayName: Build and push API image
  inputs:
    command: buildAndPush
    containerRegistry: contoso-acr
    repository: contoso/api
    Dockerfile: src/Api/Dockerfile
    tags: |
      $(Build.BuildId)
      latest

- task: AzureContainerApps@1
  inputs:
    azureSubscription: contoso-azure
    containerAppName: contoso-api
    resourceGroup: rg-contoso
    imageToDeploy: contoso.azurecr.io/contoso/api:$(Build.BuildId)
```

**AKS** (full Kubernetes control):

```yaml
- task: KubernetesManifest@1
  inputs:
    action: deploy
    kubernetesServiceConnection: contoso-aks
    namespace: shop
    manifests: |
      k8s/deployment.yaml
      k8s/service.yaml
    containers: contoso.azurecr.io/contoso/api:$(Build.BuildId)
```

**Why tag with `$(Build.BuildId)`:** Every build gets an immutable tag. Rollback = redeploy a previous build ID. Avoid overwriting `latest` only — you can't roll back what you can't identify.

## What are deployment jobs and environments in Azure Pipelines?

Regular **jobs** run build steps. **Deployment jobs** are specialized — they record history against a named **environment** and support deployment strategies (rolling, canary).

```yaml
- deployment: DeployProd
  displayName: Deploy to production
  environment: production    # approvals and checks attach HERE
  strategy:
    runOnce:
      deploy:
        steps:
          - script: echo "Deploying build $(Build.BuildId) to production"
```

**Environments** (Pipelines → Environments) give you:
- **Deployment history** — who deployed build #1042, when, to which env
- **Approvals** — named approvers must click "Approve" before steps run
- **Checks** — Azure Monitor alert, branch control, REST gate
- **Resource tracking** — link to App Service, AKS, etc.

This is how enterprises satisfy **change management** — prod deploy isn't just a YAML step, it's a gated process with audit trail.

## What is blue-green deployment in Azure?

**Blue-green** means two identical production-capacity environments. Traffic goes to one (blue) while you deploy and test the other (green), then switch traffic instantly.

```text
Before:  Blue (v1.4) ← 100% users
Deploy:  Green (v1.5) ← smoke tests, no user traffic
Switch:  Green (v1.5) ← 100% users   (Blue idle for rollback)
```

| Azure service | How to implement |
|---------------|------------------|
| **App Service slots** | Deploy to staging slot, swap with production |
| **Front Door / App Gateway** | Two backend pools; flip weights 100/0 |
| **AKS** | Two Deployments + Service selector or Ingress weights |

**Rollback:** Switch traffic back to blue — seconds, not a rebuild. This is why slots are popular for .NET web apps.

## What are deployment slots, and how do they enable zero-downtime?

An App Service **slot** is a separate instance of your app under the same name (e.g. `contoso-api/staging`). Slots can share settings or override per slot.

```yaml
# Step 1: Deploy to staging slot (production still on v1)
- task: AzureWebApp@1
  inputs:
    azureSubscription: contoso-azure
    appName: contoso-api
    deployToSlotOrASE: true
    slotName: staging
    package: '$(Pipeline.Workspace)/drop/*.zip'

# Step 2: Warm up — hit /health until 200
- script: curl -f https://contoso-api-staging.azurewebsites.net/health

# Step 3: Swap — staging becomes production atomically
- task: AzureAppServiceManage@0
  inputs:
    Action: Swap Slots
    WebAppName: contoso-api
    SourceSlot: staging
    SwapWithProduction: true
```

**What happens during swap:** Azure swaps hostnames between slots — users on `contoso-api.azurewebsites.net` suddenly hit v2 with no DNS change. The old production becomes staging (now running v1 for quick swap-back).

**Slot settings:** Mark connection strings as "slot specific" if staging uses a different database.

## What is canary deployment, and how is it implemented?

**Canary** releases to a **small slice** of users first. If error rate and latency stay healthy, you increase traffic gradually.

```text
Phase 1:  v1 = 95%   v2 = 5%   (watch 15 min)
Phase 2:  v1 = 50%   v2 = 50%
Phase 3:  v1 = 0%    v2 = 100%
```

| Platform | Tooling |
|----------|---------|
| **AKS** | Flagger, Argo Rollouts — automated analysis + rollback |
| **Application Gateway** | Weighted backend pools |
| **Azure Front Door** | Traffic splitting rules |

Pipeline role: deploy v2 alongside v1, then either **manually promote** or let a **release gate** (Application Insights query — error rate < 1%) trigger the next phase.

Canaries catch issues that staging missed because staging traffic doesn't mirror prod diversity.

## What are rolling updates in Kubernetes via Azure Pipelines?

Kubernetes **rolling updates** replace pods gradually when you change the Deployment image:

```yaml
# k8s/deployment.yaml
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # one extra pod during update
      maxUnavailable: 0  # never go below 4 ready pods
```

Pipeline updates the image tag in manifest (or uses `KubernetesManifest@1` `containers` override) → K8s creates new pods → waits for **readiness probe** → terminates old pods.

**Readiness probe** is critical — without it, traffic hits pods still starting up:

```yaml
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```

For zero-downtime: `maxUnavailable: 0`, enough replicas, pod spread across nodes/AZs.

## How do you manage multi-environment pipelines (dev, staging, prod)?

**Golden rule:** Build the artifact **once**, promote the **same bits** through environments. Rebuilding for prod introduces "works in staging, different binary in prod" risk.

```yaml
stages:
  - stage: Build
    jobs:
      - job: BuildOnce
        steps:
          - script: dotnet publish -c Release -o $(Build.ArtifactStagingDirectory)
          - publish: $(Build.ArtifactStagingDirectory)
            artifact: drop

  - stage: DeployDev
    dependsOn: Build
    variables:
      webAppName: contoso-api-dev
    jobs:
      - deployment: ToDev
        environment: dev
        strategy:
          runOnce:
            deploy:
              steps:
                - template: deploy-app-service.yml

  - stage: DeployStaging
    dependsOn: DeployDev

  - stage: DeployProd
    dependsOn: DeployStaging
    # production environment has approval gate
```

Environment-specific values (`webAppName`, connection strings) live in **variable groups** linked per environment — not hard-coded forks of the whole pipeline.

## What are approval gates and checks on environments?

Configure under **Pipelines → Environments → [production] → Approvals and checks**:

| Check | What it does |
|-------|--------------|
| **Approvals** | Named users/groups must approve before deploy steps run |
| **Branch control** | Only pipelines from `main` or `release/*` can deploy here |
| **Azure Monitor** | Block deploy if sev-0/1 alert is firing |
| **Invoke REST API** | Call external change-management system |
| **Required template** | Pipeline must `extends` org standard template |
| **Business hours** | No prod deploy outside window |

```text
DeployProd stage starts → waits at environment gate → approver notified in email/Teams
→ approver clicks Approve → deploy steps execute → history logged
```

Typical setup: **dev** = no approval, **staging** = optional, **production** = 1–2 approvers + branch control.

## What is a deployment group vs environment-based deployment?

| | **Deployment group (legacy)** | **Environment + deployment job (modern)** |
|--|-------------------------------|-------------------------------------------|
| **Targets** | VMs with deployment group agent installed | App Service, AKS, Container Apps, VMs |
| **Typical use** | IIS on Windows Server farm | Cloud-native and hybrid |
| **Microsoft guidance** | Maintenance mode for new designs | Preferred for all new pipelines |

**Deployment groups** made sense when you RDP'd to five Windows VMs and ran scripts. **Environments** abstract the target — same approval model whether you deploy to App Service or AKS.

If interview mentions "deployment group," explain you know it but would use **YAML deployment jobs + environments** for greenfield work.

## How do you roll back a failed deployment?

Rollback strategy depends on what you deployed:

| Scenario | Rollback action | Time to recover |
|----------|-----------------|-----------------|
| **App Service slot swap** | Swap back — staging now has last good version | ~30 seconds |
| **Container / K8s** | Redeploy previous image tag `$(Build.BuildId - 1)` | Minutes |
| **K8s quick undo** | `kubectl rollout undo deployment/contoso-api` | Minutes |
| **Feature flag** | Disable flag in App Configuration | Seconds (no redeploy) |
| **Database migration failed** | Forward-fix migration or restore DB snapshot | Hours — plan separately |

**Prerequisite:** You kept **immutable artifacts**. Container registry retains old tags; build artifacts have retention policy (don't delete last 10 prod builds).

```yaml
parameters:
  - name: imageTag
    displayName: Image tag to deploy (for rollback, pick older BuildId)
    type: string
    default: $(Build.BuildId)
```

Run pipeline manually with `imageTag: 1040` to roll back without rebuilding.

## How do you deploy Angular/React static apps?

SPAs produce static files (`dist/`) — no server-side runtime unless you use SSR (Next.js on Node).

**Azure Static Web Apps** (CDN + optional API — great for React/Vite/Angular):

```yaml
- script: npm ci && npm run build -- --configuration production
  workingDirectory: client
  displayName: Build Angular app

- task: AzureStaticWebApp@0
  inputs:
    app_location: client
    output_location: dist/contoso-web/browser   # Angular 17+ path may vary
    azure_static_web_apps_api_token: $(SWA_DEPLOYMENT_TOKEN)
```

**Alternatives:**

| Target | When |
|--------|------|
| **Blob Storage + CDN** | Cheapest static hosting, custom domain |
| **App Service** | Need Windows/Linux process alongside API |
| **Front Door origin** | Global CDN with WAF in front of blob |

**SPA routing:** Configure fallback to `index.html` so `/products/42` doesn't 404 on refresh — Static Web Apps and Front Door both support this rule.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Kubernetes/Kubernetes Deployment Strategies.md
- Azure Cloud/Azure Compute.md
- Docker/Docker Build and CICD Integration.md
