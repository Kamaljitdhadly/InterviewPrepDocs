# Azure DevOps Pipelines and CI-CD

## Questions Covered

1. What are Azure Pipelines, and how do they support CI/CD?
2. What is the difference between CI, CD, and continuous deployment?
3. What is the difference between YAML and classic pipelines?
4. How do you structure a basic azure-pipelines.yml?
5. What are stages, jobs, steps, and tasks?
6. How do variables, variable groups, and Key Vault work?
7. How do you cache dependencies in .NET and Node builds?
8. How do you run tests in the pipeline?
9. What are pipeline templates and reusable YAML?
10. How does Azure Pipelines compare to GitHub Actions?
11. What are self-hosted vs Microsoft-hosted agents?
12. How do you trigger pipelines (CI triggers, PR, schedules)?

## What are Azure Pipelines, and how do they support CI/CD?

**Azure Pipelines** automates **build, test, and deploy** on commits or schedules — cloud-hosted or self-hosted agents.

| Phase | Pipeline responsibility |
|-------|-------------------------|
| **CI** | Compile, unit test, package artifact |
| **CD** | Deploy to dev/staging/prod with approvals |
| **Continuous deployment** | Auto-deploy to prod when gates pass |

```yaml
trigger:
  branches:
    include: [main]

pool:
  vmImage: ubuntu-latest

steps:
  - task: DotNetCoreCLI@2
    inputs:
      command: test
      projects: '**/*Tests.csproj'
```

## What is the difference between CI, CD, and continuous deployment?

| Term | Meaning |
|------|---------|
| **Continuous Integration** | Merge to main frequently; automated build + test |
| **Continuous Delivery** | Always deploy-ready; prod deploy is manual approval |
| **Continuous Deployment** | Every green main → production automatically |

```text
CI:  commit → build → test → artifact
CD:  artifact → staging → [approval] → prod
```

Interview: most enterprises use **continuous delivery** with manual prod gate; startups may use full CD.

## What is the difference between YAML and classic pipelines?

| | **YAML (recommended)** | **Classic (GUI)** |
|--|------------------------|-------------------|
| **Definition** | Code in repo (`azure-pipelines.yml`) | Azure DevOps UI |
| **Version control** | Same PR as app code | Stored in service |
| **Reusability** | Templates | Task groups |
| **Multi-stage** | Native `stages` | Release pipelines (legacy) |

**Always prefer YAML** — reviewable, repeatable, branch-specific.

## How do you structure a basic azure-pipelines.yml?

```yaml
trigger:
  - main

variables:
  buildConfiguration: Release
  dotnetVersion: '8.x'

stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        pool:
          vmImage: ubuntu-latest
        steps:
          - task: UseDotNet@2
            inputs:
              packageType: sdk
              version: $(dotnetVersion)

          - script: dotnet restore
            displayName: Restore

          - script: dotnet build --configuration $(buildConfiguration) --no-restore
            displayName: Build

          - script: dotnet test --configuration $(buildConfiguration) --no-build --logger trx
            displayName: Test

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: '$(Build.ArtifactStagingDirectory)'
              ArtifactName: drop
```

## What are stages, jobs, steps, and tasks?

```text
Pipeline
  └── Stage (Build, Deploy)
        └── Job (runs on one agent)
              └── Step (script or task)
                    └── Task (DotNetCoreCLI@2, Docker@2, ...)
```

| Level | Parallelism |
|-------|-------------|
| **Stages** | Sequential by default (`dependsOn`) |
| **Jobs** | Parallel within stage |
| **Steps** | Sequential within job |

```yaml
- stage: Deploy
  dependsOn: Build
  condition: succeeded()
  jobs:
    - deployment: DeployWeb
      environment: production
      strategy:
        runOnce:
          deploy:
            steps:
              - task: AzureWebApp@1
                inputs:
                  azureSubscription: 'my-azure-connection'
                  appName: 'contoso-api'
                  package: '$(Pipeline.Workspace)/drop/*.zip'
```

## How do variables, variable groups, and Key Vault work?

```yaml
variables:
  - group: shared-secrets          # Library variable group
  - name: imageTag
    value: $(Build.BuildId)

steps:
  - bash: echo "Deploying $(imageTag)"
  - task: AzureKeyVault@2
    inputs:
      azureSubscription: my-connection
      KeyVaultName: contoso-kv
      SecretsFilter: 'DbConnection--'
```

| Type | Scope |
|------|-------|
| **Pipeline variables** | YAML / UI |
| **Variable groups** | Shared across pipelines |
| **Key Vault linkage** | Secrets synced at runtime |
| **Predefined** | `$(Build.SourceBranch)`, `$(Agent.OS)` |

Mark secrets as **secret** — never log them.

## How do you cache dependencies in .NET and Node builds?

```yaml
# .NET
- task: Cache@2
  inputs:
    key: 'nuget | "$(Agent.OS)" | **/packages.lock.json'
    path: $(NUGET_PACKAGES)

# Node
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    path: $(Pipeline.Workspace)/.npm
```

Faster builds — invalidate cache when lock files change.

## How do you run tests in the pipeline?

```yaml
- script: |
    dotnet test --configuration Release \
      --collect:"XPlat Code Coverage" \
      --logger trx \
      --results-directory $(Agent.TempDirectory)/TestResults
  displayName: Unit + Integration tests

- task: PublishTestResults@2
  inputs:
    testResultsFormat: VSTest
    testResultsFiles: '**/*.trx'

- task: PublishCodeCoverageResults@2
  inputs:
    summaryFileLocation: '$(Agent.TempDirectory)/TestResults/**/coverage.cobertura.xml'
```

Filter slow tests: `--filter "Category!=E2E"`. Run E2E in separate stage against staging.

## What are pipeline templates and reusable YAML?

**Template** in separate file — DRY for org standards:

```yaml
# templates/dotnet-build.yml
parameters:
  - name: projects
    type: string
steps:
  - script: dotnet test ${{ parameters.projects }}

# azure-pipelines.yml
extends:
  template: templates/dotnet-build.yml
  parameters:
    projects: '**/*Tests.csproj'
```

Also: **stage templates**, **variable templates**, **repository templates** (`resources.repositories`).

## How does Azure Pipelines compare to GitHub Actions?

| Feature | Azure Pipelines | GitHub Actions |
|---------|-----------------|----------------|
| **Config** | `azure-pipelines.yml` | `.github/workflows/*.yml` |
| **Runners** | Microsoft-hosted / self-hosted agents | GitHub-hosted / self-hosted |
| **Environments** | Approvals, checks | Environments + protection rules |
| **Azure integration** | Native service connections | OIDC federation to Azure |
| **Marketplace** | Extensions | Actions marketplace |

Concepts map 1:1: triggers, jobs, steps, secrets, artifacts.

## What are self-hosted vs Microsoft-hosted agents?

| | **Microsoft-hosted** | **Self-hosted** |
|--|----------------------|-----------------|
| **Maintenance** | None | You patch agents |
| **Network** | Public internet | Access private VNet/ on-prem |
| **Cost** | Parallel job minutes | Your VM compute |
| **Image** | `ubuntu-latest`, `windows-latest` | Custom capabilities |

Use self-hosted for **internal APIs**, **large monorepos**, or **compliance** constraints.

## How do you trigger pipelines (CI triggers, PR, schedules)?

```yaml
trigger:
  branches:
    include: [main, release/*]
  paths:
    include: [src/*]
    exclude: [docs/*]

pr:
  branches:
    include: [main]

schedules:
  - cron: '0 2 * * *'
    displayName: Nightly E2E
    branches:
      include: [main]
```

| Trigger | Use |
|---------|-----|
| **CI (`trigger`)** | Push to branch |
| **PR (`pr`)** | Validation before merge |
| **Scheduled** | Nightly tests, dependency scans |
| **Manual / REST** | On-demand deploy |

## Related Topics

- Azure DevOps/Azure DevOps Deployment Strategies.md
- Azure DevOps/Azure DevOps Security Artifacts and Repos.md
- Docker/Docker Build and CICD Integration.md
- Testing/Test Pyramid and Best Practices.md
- Terraform/Terraform Basics.md
