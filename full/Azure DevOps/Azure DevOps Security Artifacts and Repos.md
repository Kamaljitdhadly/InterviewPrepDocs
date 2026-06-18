# Azure DevOps Security Artifacts and Repos

## Questions Covered

1. How do you manage security and RBAC in Azure DevOps?
2. What are service connections, and how do you secure them?
3. What is OIDC federation for Azure deployments without secrets?
4. What are Azure Artifacts, and how do they fit CI/CD?
5. How do you publish and consume NuGet packages from Azure Artifacts?
6. How do you use npm and Maven feeds in Azure DevOps?
7. How do you scan for vulnerabilities in pipelines?
8. What is pipeline secret hygiene?
9. How does Azure DevOps support compliance and auditing?
10. How do you integrate GitHub repos with Azure Pipelines?
11. What are pipeline permissions and job tokens?
12. How do you implement DevSecOps in Azure Pipelines?

## How do you manage security and RBAC in Azure DevOps?

Security in Azure DevOps is **layered** — permissions inherit from organization down to individual pipelines and environments. Understanding this hierarchy prevents both lockouts and over-permissive access.

```text
Organization permissions
  └── Project permissions (Contributors, Readers, Build Admins)
        └── Repo permissions (branch-level optional)
              └── Pipeline permissions (who can edit/run)
                    └── Environment permissions (who can approve prod)
```

| Built-in group | Typical access |
|----------------|----------------|
| **Project Administrators** | Change settings, manage service connections |
| **Contributors** | Push code, queue builds, create PRs |
| **Readers** | View boards, pipelines, repos — no edit |
| **Build Administrators** | Agent pools, retention, queue settings |

**Best practice:** Map **Entra ID (Azure AD) groups** to Azure DevOps groups — when someone leaves the company, disabling their Entra account removes access everywhere. Avoid managing users one-by-one in ADO.

**Least privilege examples:**
- Not every developer approves **production** deployments.
- Not every pipeline can use the **production Azure subscription** service connection — restrict to release pipelines only.
- **Readers** for stakeholders who need visibility without write access.

## What are service connections, and how do you secure them?

A **service connection** is a stored credential or federated trust that lets a pipeline talk to external systems — Azure, Docker registries, Kubernetes, GitHub, etc.

| Type | Grants access to |
|------|------------------|
| **Azure Resource Manager** | Deploy to subscriptions, resource groups |
| **Docker Registry** | Push/pull from ACR or Docker Hub |
| **Kubernetes** | `kubectl apply` to AKS |
| **Generic** | REST APIs with username/password or token |

**How to secure them:**

1. **Scope narrowly** — one connection per subscription or per environment, not "Global Azure Admin."
2. **Restrict pipeline access** — Project Settings → Service connection → Security → allow only specific pipelines.
3. **Prefer OIDC over secrets** — no password to rotate or leak (see next section).
4. **Audit usage** — pipeline logs show which connection was used; org audit log tracks permission changes.
5. **Rotate** — if you must use a client secret, set calendar reminder before expiry.

A compromised service connection with subscription **Owner** role is a full Azure breach — treat connections like production passwords.

## What is OIDC federation for Azure deployments without secrets?

Traditionally, pipelines used a **service principal + client secret** stored in Azure DevOps. Secrets expire, get copied to YAML, and appear in logs.

**OIDC (OpenID Connect) workload identity federation** lets Azure DevOps prove its identity to Entra ID **without a long-lived secret**:

```text
Pipeline job starts
  → requests OIDC token from Azure DevOps
  → presents token to Entra ID with federated credential match
  → receives short-lived Azure access token
  → deploys via Azure CLI / ARM tasks
```

```yaml
- task: AzureCLI@2
  displayName: Deploy with federated identity
  inputs:
    azureSubscription: contoso-azure-oidc   # service connection using workload identity
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: |
      az account show
      az webapp deploy --resource-group rg-contoso --name contoso-api --src-path app.zip
```

**Setup summary (one-time):**
1. Create App Registration in Entra ID.
2. Add **federated credential** — issuer = Azure DevOps, subject = `sc://{org}/{project}/{serviceConnectionName}`.
3. Grant app **Contributor** (or narrower) on target resource group.
4. Create Azure RM service connection using **Workload Identity federation**.

**Interview answer:** "We use federated credentials so CI/CD never stores Azure client secrets in DevOps or git."

## What are Azure Artifacts, and how do they fit CI/CD?

**Azure Artifacts** is a **private package registry** inside Azure DevOps. It stores NuGet, npm, Maven, Python, and Universal packages with the same access control as your project.

```text
Library build pipeline
  → dotnet pack Contoso.Common v2.4.0
  → push to Artifacts feed "internal-nuget"
API build pipeline
  → dotnet restore (pulls Contoso.Common 2.4.0 from feed)
  → build and deploy API
```

| Benefit | Explanation |
|---------|-------------|
| **Reproducible builds** | Pin exact package version — not "whatever was on nuget.org today" |
| **Upstream proxy** | Feed caches nuget.org/npmjs — faster restores, outage resilience |
| **Shared internal libs** | Common.Domain, Common.Auth published once, consumed by many repos |
| **Access control** | Only project members pull private packages |

Without Artifacts, teams often hack around private packages with git submodules or duplicated code — Artifacts is the cleaner enterprise pattern.

## How do you publish and consume NuGet packages from Azure Artifacts?

**Publish in pipeline:**

```yaml
- task: DotNetCoreCLI@2
  displayName: Pack NuGet packages
  inputs:
    command: pack
    packagesToPack: 'src/Contoso.Common/Contoso.Common.csproj'
    versioningScheme: byBuildNumber
    buildProperties: 'VersionSuffix='

- task: NuGetCommand@2
  displayName: Push to internal feed
  inputs:
    command: push
    publishVstsFeed: 'contoso/internal-nuget'
    allowPackageConflicts: false
```

**Consume in repo** — add `nuget.config` at solution root:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <packageSources>
    <clear />
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="internal" value="https://pkgs.dev.azure.com/contoso/_packaging/internal-nuget/nuget/v3/index.json" />
  </packageSources>
</configuration>
```

**In pipeline before restore:**

```yaml
- task: NuGetAuthenticate@0
  displayName: Authenticate to Artifacts feeds
```

Local dev: install **Azure Artifacts Credential Provider** (`dotnet tool` or VS extension) — it prompts once via browser login.

## How do you use npm and Maven feeds in Azure DevOps?

**npm (Angular/React client):**

```yaml
- task: npmAuthenticate@0
  inputs:
    workingFile: client/.npmrc

- script: npm ci && npm run build
  workingDirectory: client
```

`client/.npmrc`:

```text
registry=https://pkgs.dev.azure.com/contoso/_packaging/npm-feed/npm/registry/
always-auth=true
```

**Maven:** Use `MavenAuthenticate@0` and reference feed in `settings.xml` or `pom.xml` repository section.

**Monorepo tip:** One feed per org or per product line — too many feeds creates confusion about where to publish shared `@contoso/ui-components`.

## How do you scan for vulnerabilities in pipelines?

Security scanning belongs in **CI** — fail the PR before vulnerable code merges.

```yaml
# Dependency scan (.NET)
- script: dotnet list package --vulnerable --include-transitive
  displayName: Check vulnerable NuGet packages

# SAST — SonarQube example
- task: SonarQubePrepare@6
  inputs:
    SonarQube: SonarCloud
    scannerMode: CLI
    configMode: manual
    cliProjectKey: contoso-shop-api

- script: dotnet build
- task: SonarQubeAnalyze@6
- task: SonarQubePublish@6

# Container scan after docker build
- script: |
    trivy image --severity HIGH,CRITICAL --exit-code 1 contoso.azurecr.io/api:$(Build.BuildId)
  displayName: Scan container image
```

| Scan type | What it finds | When to run |
|-----------|---------------|-------------|
| **SAST** | Code bugs, injection patterns | Every PR |
| **Dependency (SCA)** | Known CVEs in NuGet/npm | Every PR |
| **Container** | OS and layer vulnerabilities | After `docker build` |
| **Secret scan** | Committed API keys | Every PR (credscan, gitleaks) |
| **IaC scan** | Terraform misconfigurations | PR touching `/infra` |

Policy: **fail on CRITICAL** in main; warn on HIGH until remediated. Don't let perfect be the enemy of good — start with dependency scanning.

## What is pipeline secret hygiene?

Secrets leak from pipelines more often than from application code. Common failure modes: echo in bash, secrets in fork PRs, secrets in artifact names.

| Do | Don't |
|----|-------|
| Store in Key Vault → variable group (secret flag) | Put passwords in `azure-pipelines.yml` |
| Use OIDC for Azure deploy | Share one service principal across all envs |
| Mark variables as secret in UI | `echo $(ConnectionString)` in scripts |
| Use `AzureKeyVault@2` task to fetch at runtime | Commit `.env` files |
| Disable secret access on fork PR builds | Run prod deploy pipeline from untrusted forks |

```yaml
variables:
  - group: prod-secrets   # all vars marked secret in Library

steps:
  - script: dotnet ef database update
    env:
      ConnectionStrings__Default: $(DbConnectionString)   # masked in logs
```

**Review pipeline logs** after first run — Azure masks known secret variables, but custom logging can still leak if you print whole config objects.

## How does Azure DevOps support compliance and auditing?

Regulated industries (finance, healthcare) need to prove **who changed what, when, and who approved production releases**.

| Feature | Compliance value |
|---------|------------------|
| **Organization audit log** | Permission changes, deletions, PAT creation |
| **Retention policies** | Keep build/release records N years |
| **Branch policies** | Enforce review + successful build before merge |
| **Environment deployment history** | Approver name + timestamp for prod |
| **Work item linking** | Trace requirement → commit → build → release |
| **Export to Log Analytics** | Central SIEM correlation |

```text
Auditor asks: "Who deployed v2.3 to production on June 1?"
Answer: Pipelines → Environments → production → deployment history → build 1042 → approved by jane@contoso.com
```

Signed commits (GPG) optional — proves commit author identity beyond ADO account.

## How do you integrate GitHub repos with Azure Pipelines?

Many orgs keep **source on GitHub** (community, Actions ecosystem) but use **Azure Pipelines for releases** (environment approvals, Azure integration).

```yaml
# azure-pipelines.yml lives IN the GitHub repo
trigger:
  - main

resources:
  repositories:
    - repository: self
      type: github
      endpoint: contoso-github-connection   # PAT or GitHub App in ADO
      name: contoso/shop-api
```

**Setup steps:**
1. Project Settings → Service connections → New → GitHub.
2. Authorize via OAuth, PAT, or GitHub App (App is best for org-wide).
3. Install Azure Pipelines GitHub App on the repo (or org).
4. Pipeline triggers on GitHub webhook when you push.

**Why hybrid:** GitHub Copilot/Actions for dev inner loop; Azure Environments + Entra for controlled prod releases to Azure.

## What are pipeline permissions and job tokens?

Each running job receives an **OAuth token** scoped to what that job needs. Misconfiguration can expose repos or secrets to untrusted code.

**Key settings (Organization Settings → Pipelines):**

| Setting | Recommendation |
|---------|----------------|
| **Limit job authorization scope to referenced repos** | On — job can't access every repo in project |
| **Protect secrets from fork PRs** | Don't inject prod secrets into PR builds from forks |
| **Require approval for pipeline runs from forks** | On for public-facing repos |

**Fork PR attack:** Attacker opens PR with YAML that exfiltrates secrets. Mitigation: PR validation pipeline has **no access** to production variable groups; use separate "PR CI" vs "Release" pipeline.

**Environment protection:** Production secrets only available in deployment job targeting `environment: production` — not in arbitrary script steps on PR builds.

## How do you implement DevSecOps in Azure Pipelines?

**DevSecOps** embeds security into every stage instead of a final "security gate" before release.

```text
Plan          → threat modeling in design review
Code          → branch policies, secret scanning on commit
Build (CI)    → SAST, dependency scan, unit tests
Test          → DAST against staging (optional)
Release (CD)  → container scan, IaC scan, prod approval
Operate       → Azure Monitor alerts, Sentinel, incident response
```

```yaml
stages:
  - stage: Build
    jobs:
      - job: SecureBuild
        steps:
          - template: templates/dotnet-restore-build.yml
          - template: templates/security-scan.yml      # Sonar + dotnet list vulnerable
          - script: dotnet test --filter Category=Security

  - stage: DeployStaging
    dependsOn: Build
    jobs:
      - deployment: Staging
        environment: staging
        strategy:
          runOnce:
            deploy:
              steps:
                - template: templates/deploy-api.yml

  - stage: DeployProd
    dependsOn: DeployStaging
    jobs:
      - deployment: Production
        environment: production   # approval + branch check here
        strategy:
          runOnce:
            deploy:
              steps:
                - template: templates/deploy-api.yml
```

**Shift-left mantra:** The cheapest vulnerability fix is in the PR that introduced it — not in a pen test three months later.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Security/Secure Development Lifecycle.md
- Terraform/Terraform Basics.md
- Azure Cloud/Azure Identity and Entra ID.md
