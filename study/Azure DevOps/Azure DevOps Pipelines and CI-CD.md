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

**Azure Pipelines** runs automated **build, test, and deploy** workflows when you push code, open a PR, or on a schedule. It executes on **agents** — virtual machines (Microsoft-hosted) or your own machines (self-hosted).

The pipeline replaces manual steps like "run dotnet build on my laptop, copy zip to server." Every merge gets the **same repeatable process**, which is the foundation of reliable releases.

| Phase | What the pipeline does |
|-------|------------------------|
| **CI (Continuous Integration)** | Restore, compile, unit test, publish artifact |
| **CD (Continuous Delivery)** | Deploy artifact to dev/staging/prod |
| **Continuous Deployment** | Auto-deploy to prod when all gates pass — no human click |

```yaml
trigger:
  branches:
    include: [main]

pool:
  vmImage: ubuntu-latest

steps:
  - task: DotNetCoreCLI@2
    displayName: Run tests
    inputs:
      command: test
      projects: '**/*Tests.csproj'
```

A minimal pipeline like this gives you **immediate feedback** on every commit to `main`.

## What is the difference between CI, CD, and continuous deployment?

These terms are often confused. Here's the distinction interviewers expect:

| Term | Meaning | Human in the loop? |
|------|---------|-------------------|
| **Continuous Integration** | Frequent merges to main; each merge builds and tests | No — automated |
| **Continuous Delivery** | Main is always deploy-ready; prod release is a **manual** or **approval** step | Yes — for production |
| **Continuous Deployment** | Every green build on main goes to production automatically | No — fully automated |

```text
CI:   git push → restore → build → test → publish artifact
CD:   artifact → deploy staging → [approval gate] → deploy production
CD (deployment):  artifact → production (no approval)
```

**Most enterprises** use continuous **delivery** — prod requires manager approval or change window. **Startups** with strong test coverage may use continuous **deployment** for non-critical apps.

## What is the difference between YAML and classic pipelines?

Azure DevOps supports two pipeline authoring models:

| | **YAML (recommended)** | **Classic (legacy GUI)** |
|--|------------------------|--------------------------|
| **Definition lives in** | Repo file (`azure-pipelines.yml`) | Azure DevOps web UI |
| **Review process** | Same PR as application code | Separate UI changes |
| **Branch-specific** | Different YAML per branch | Awkward |
| **Multi-stage releases** | Native `stages:` | Old "Release pipelines" |

**Why YAML wins:** Infrastructure and app changes ship together. You can see *exactly* what ran for build `#1042` because the YAML at that commit is the definition.

Classic pipelines still exist in older orgs — know they map to the same concepts (tasks, variables, artifacts) but prefer YAML for new work.

## How do you structure a basic azure-pipelines.yml?

A production-style pipeline separates **build once, deploy many times**:

```yaml
trigger:
  - main

variables:
  buildConfiguration: Release
  dotnetVersion: '8.x'

stages:
  - stage: Build
    displayName: Build and test
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
            displayName: Restore NuGet packages

          - script: dotnet build --configuration $(buildConfiguration) --no-restore
            displayName: Build solution

          - script: dotnet test --configuration $(buildConfiguration) --no-build --logger trx
            displayName: Run unit tests

          - task: PublishBuildArtifacts@1
            inputs:
              PathtoPublish: '$(Build.ArtifactStagingDirectory)'
              ArtifactName: drop
```

**Walkthrough:**
1. `trigger` — run when someone pushes to `main`.
2. `variables` — reusable values; can also come from variable groups.
3. `UseDotNet@2` — agent may not have your SDK pre-installed.
4. `dotnet test` — fail the pipeline if tests fail (blocks bad merges).
5. `PublishBuildArtifacts` — save output for later deploy stages.

## What are stages, jobs, steps, and tasks?

Understanding the hierarchy helps you read and debug large pipelines:

```text
Pipeline (azure-pipelines.yml)
  └── Stage          e.g. Build, Deploy_Staging, Deploy_Prod
        └── Job        runs on one agent; jobs in a stage can run in parallel
              └── Step   sequential commands on that agent
                    └── Task   pre-built step (DotNetCoreCLI@2, Docker@2, ...)
```

| Level | Parallelism | Example |
|-------|-------------|---------|
| **Stages** | Sequential by default | Build completes before Deploy |
| **Jobs** | Parallel within a stage | Build API + Build Web in parallel |
| **Steps** | Sequential within a job | Restore → Build → Test |

**Deployment jobs** are a special job type tied to an **environment** (staging, production) with approval gates:

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

`dependsOn: Build` ensures deploy never runs if tests failed. `condition: succeeded()` skips deploy on failure.

## How do variables, variable groups, and Key Vault work?

Variables configure pipelines without hard-coding secrets or environment-specific names.

```yaml
variables:
  - group: shared-secrets          # defined in Pipelines → Library
  - name: imageTag
    value: $(Build.BuildId)

steps:
  - bash: echo "Deploying build $(imageTag) from branch $(Build.SourceBranch)"
  - task: AzureKeyVault@2
    inputs:
      azureSubscription: my-connection
      KeyVaultName: contoso-kv
      SecretsFilter: 'DbConnection--'
```

| Variable type | Scope | Example |
|---------------|-------|---------|
| **Pipeline variable** | This YAML or UI | `buildConfiguration: Release` |
| **Variable group** | Shared across pipelines | Connection strings per env |
| **Key Vault-linked group** | Secrets synced at runtime | API keys, passwords |
| **Predefined** | System-provided | `$(Build.BuildId)`, `$(Agent.OS)` |

**Precedence (highest wins):** Job variable → Stage variable → Pipeline variable → Variable group.

**Secrets:** Mark variables as secret in the UI — they mask in logs. Never `echo $(DbPassword)`. Prefer Key Vault over storing secrets directly in variable groups.

## How do you cache dependencies in .NET and Node builds?

Without caching, every run downloads all NuGet/npm packages — slow and wasteful. The `Cache@2` task stores folders between runs.

```yaml
# .NET — cache NuGet global packages folder
- task: Cache@2
  inputs:
    key: 'nuget | "$(Agent.OS)" | **/packages.lock.json'
    restoreKeys: |
      nuget | "$(Agent.OS)"
    path: $(NUGET_PACKAGES)

# Node — cache npm cache directory
- task: Cache@2
  inputs:
    key: 'npm | "$(Agent.OS)" | package-lock.json'
    path: $(Pipeline.Workspace)/.npm
```

Cache **invalidates** when the key changes (e.g. lock file updated). Commit `packages.lock.json` for .NET deterministic restore.

Typical savings: 2–5 minutes per build on medium solutions.

## How do you run tests in the pipeline?

Tests in CI are your **safety net**. Configure them to publish results so failures are visible in the PR and in Analytics.

```yaml
- script: |
    dotnet test --configuration Release \
      --collect:"XPlat Code Coverage" \
      --logger trx \
      --results-directory $(Agent.TempDirectory)/TestResults
  displayName: Unit and integration tests

- task: PublishTestResults@2
  condition: always()    # publish even if tests fail — see which failed
  inputs:
    testResultsFormat: VSTest
    testResultsFiles: '**/*.trx'

- task: PublishCodeCoverageResults@2
  inputs:
    summaryFileLocation: '$(Agent.TempDirectory)/TestResults/**/coverage.cobertura.xml'
```

**Split fast vs slow tests:**
- PR pipeline: `--filter "Category!=Integration&Category!=E2E"` — finishes in ~5 min.
- Nightly pipeline: full suite including E2E against staging.

`condition: always()` on PublishTestResults ensures you see test output even when the job fails.

## What are pipeline templates and reusable YAML?

When five teams all need "restore, build, test, publish," **templates** avoid copy-paste drift.

```yaml
# templates/dotnet-build.yml
parameters:
  - name: projects
    type: string
    default: '**/*Tests.csproj'

steps:
  - script: dotnet restore
  - script: dotnet build --configuration Release
  - script: dotnet test ${{ parameters.projects }} --configuration Release --no-build

# azure-pipelines.yml (consumer)
stages:
  - stage: Build
    jobs:
      - job: BuildApi
        steps:
          - template: templates/dotnet-build.yml
            parameters:
              projects: 'tests/Api.Tests.csproj'
```

Template types: **step templates**, **job templates**, **stage templates**, and **`extends`** for org-wide enforced pipelines.

**Repository templates:** Pull shared templates from a central `pipeline-templates` repo via `resources.repositories` — one place to update .NET SDK version for the whole org.

## How does Azure Pipelines compare to GitHub Actions?

Concepts map closely — if you know one, the other is a short learning curve:

| Feature | Azure Pipelines | GitHub Actions |
|---------|-----------------|----------------|
| **Config file** | `azure-pipelines.yml` | `.github/workflows/ci.yml` |
| **Runners/agents** | Microsoft-hosted / self-hosted | GitHub-hosted / self-hosted |
| **Environments + approvals** | Built-in Environments | Environments + protection rules |
| **Azure deploy** | Service connections (native) | OIDC to Azure (well supported) |
| **Marketplace** | Extensions (SonarQube, etc.) | Actions marketplace |

**Choose Pipelines when:** Release management with environment approvals is central, or org already standardized on Azure DevOps.

**Choose Actions when:** Code lives on GitHub and team wants CI defined next to repo with minimal extra services.

## What are self-hosted vs Microsoft-hosted agents?

| | **Microsoft-hosted** | **Self-hosted** |
|--|----------------------|-----------------|
| **Maintenance** | None — Microsoft patches VM | You patch OS and agent software |
| **Network** | Public internet egress | Can reach private VNet, on-prem SQL |
| **Cost model** | Parallel job minutes (free tier, then paid) | Your VM/compute cost |
| **Images** | `ubuntu-latest`, `windows-latest`, `macOS` | Install anything (Oracle client, legacy SDK) |
| **Startup** | Fresh VM each job (mostly) | Persistent — faster for huge repos |

**Use Microsoft-hosted** for most cloud-native builds — zero ops.

**Use self-hosted** when you need: internal NuGet feeds without public exposure, deploy targets only reachable inside corporate network, or specialized hardware.

**Security note:** Self-hosted agents on a shared VM inherit secrets from previous jobs unless you use **ephemeral agents** (one job, then destroy).

## How do you trigger pipelines (CI triggers, PR, schedules)?

```yaml
trigger:                    # CI — runs on push
  branches:
    include: [main, release/*]
  paths:
    include: [src/*, azure-pipelines.yml]
    exclude: [docs/*]

pr:                         # PR validation — runs on pull request
  branches:
    include: [main]
  drafts: false

schedules:
  - cron: '0 2 * * *'        # UTC: 2 AM daily
    displayName: Nightly full test suite
    branches:
      include: [main]
    always: false            # skip if no code changes since last run
```

| Trigger | When it runs | Typical use |
|---------|--------------|-------------|
| **`trigger` (CI)** | Push to listed branches | Build + test on merge |
| **`pr`** | PR opened/updated | Validate before merge |
| **`schedules`** | Cron expression | Nightly E2E, dependency scan |
| **Manual / REST API** | User or release tool | Hotfix deploy, re-run failed stage |

**Path filters** save agent minutes — changing `README.md` doesn't need a full .NET rebuild if you exclude docs paths.

**Important:** PR pipelines from forks should **not** expose secrets — use branch policies and "Limit job authorization scope" org setting.

## Related Topics

- Azure DevOps/Azure DevOps Deployment Strategies.md
- Azure DevOps/Azure DevOps Security Artifacts and Repos.md
- Docker/Docker Build and CICD Integration.md
- Testing/Test Pyramid and Best Practices.md
- Terraform/Terraform Basics.md
