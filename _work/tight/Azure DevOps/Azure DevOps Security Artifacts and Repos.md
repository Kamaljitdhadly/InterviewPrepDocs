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

Permissions at **organization → project → repo → pipeline → environment** levels.

| Group | Typical permissions |
|-------|---------------------|
| **Project Administrators** | Full project config |
| **Contributors** | Code, run pipelines |
| **Readers** | View only |
| **Build Administrators** | Agent pools, retention |

Use **Entra ID groups** mapped to Azure DevOps groups — central offboarding.

**Least privilege:** prod environment approvers ≠ every developer.

## What are service connections, and how do you secure them?

**Service connections** grant pipelines access to external resources:

| Type | Target |
|------|--------|
| **Azure Resource Manager** | Subscriptions, resource groups |
| **Docker Registry** | ACR, Docker Hub |
| **Kubernetes** | AKS cluster |
| **Generic** | REST APIs with secrets |

**Secure:**
- Scope to single subscription/RG
- Restrict which pipelines may use connection
- Rotate secrets; prefer **workload identity federation (OIDC)**
- Audit service connection usage in logs

## What is OIDC federation for Azure deployments without secrets?

Pipelines authenticate to Azure via **federated identity** — no client secret in YAML.

```yaml
- task: AzureCLI@2
  inputs:
    azureSubscription: contoso-azure-oidc   # federated SC
    scriptType: bash
    scriptLocation: inlineScript
    inlineScript: az account show
```

Setup: Entra ID app registration + federated credential trusting Azure DevOps issuer + subject (`sc://org/project/connection`).

**Interview win:** OIDC > long-lived secrets for CI/CD.

## What are Azure Artifacts, and how do they fit CI/CD?

**Azure Artifacts** hosts **private package feeds** — NuGet, npm, Maven, Python, Universal Packages.

```text
Build pipeline → publish package v1.2.3 → Artifacts feed
Deploy / other repos → consume exact version
```

| Benefit | Detail |
|---------|--------|
| **Immutability** | Version pinned builds |
| **Upstream proxy** | Cache nuget.org/npmjs |
| **Access control** | Same RBAC as project |

## How do you publish and consume NuGet packages from Azure Artifacts?

```yaml
- task: DotNetCoreCLI@2
  inputs:
    command: pack
    packagesToPack: '**/*.csproj'
    versioningScheme: byBuildNumber

- task: NuGetCommand@2
  inputs:
    command: push
    publishVstsFeed: 'contoso/internal-nuget'
```

**Consume** — `nuget.config` in repo:

```xml
<packageSources>
  <add key="internal" value="https://pkgs.dev.azure.com/contoso/_packaging/internal/nuget/v3/index.json" />
</packageSources>
```

Authenticate via `Azure Artifacts Credential Provider` in pipeline (`NuGetAuthenticate@1`).

## How do you use npm and Maven feeds in Azure DevOps?

```yaml
- task: npmAuthenticate@0
  inputs:
    workingFile: client/.npmrc

- script: npm ci && npm run build
  workingDirectory: client
```

`.npmrc`:

```text
registry=https://pkgs.dev.azure.com/contoso/_packaging/npm-feed/npm/registry/
always-auth=true
```

Maven: `authenticate` task + `settings.xml` server credentials.

## How do you scan for vulnerabilities in pipelines?

```yaml
- task(keyword): AdvancedSecurity
  # GitHub Advanced Security for Azure DevOps / Microsoft Defender for DevOps

- task: SonarQubePrepare@6
- script: dotnet build
- task: SonarQubeAnalyze@6

- task: trivy@1   # container scan extension
  inputs:
    image: contoso.azurecr.io/api:$(Build.BuildId)
```

| Scan type | Tool examples |
|-----------|---------------|
| **SAST** | SonarQube, CodeQL |
| **Dependencies** | Dependabot, `dotnet list package --vulnerable` |
| **Containers** | Trivy, Defender for Cloud |
| **Secrets** | GitLeaks, credscan |

Fail build on **critical** findings in main branch.

## What is pipeline secret hygiene?

| Do | Don't |
|----|-------|
| Store secrets in Key Vault / variable groups (secret) | Commit secrets to YAML |
| Use OIDC for Azure | Print env vars in scripts |
| Mask secrets in logs | Pass secrets as CLI args visible in process list |
| Short-lived tokens | Shared prod passwords in wiki |

```yaml
variables:
  - group: prod-secrets   # secret vars never echo
```

Review **pipeline run logs** for accidental exposure.

## How does Azure DevOps support compliance and auditing?

| Feature | Use |
|---------|-----|
| **Audit log** | Org-level actions (permissions, deletes) |
| **Retention policies** | Build/release history |
| **Branch policies** | Enforce review + build |
| **Signed commits** | Optional GPG verification |

| **Export** | Audit streams to Log Analytics |

Regulated industries: tie **work items → commits → builds → releases** for traceability.

## How do you integrate GitHub repos with Azure Pipelines?

```yaml
# azure-pipelines.yml in GitHub repo
resources:
  repositories:
    - repository: self
      type: github
      endpoint: contoso-github-connection
      name: contoso/shop-api

trigger:
  - main
```

**GitHub connection** uses PAT or GitHub App. Azure DevOps runs pipelines on GitHub webhooks — common hybrid pattern.

## What are pipeline permissions and job tokens?

**Job authorization scope** limits what a running job can access:

- Repository: default read; restrict if job doesn't need code
- **Protect secrets** from fork PRs (don't run secrets on untrusted forks)
- **Environment** checks before prod secrets available

Organization setting: **Limit job authorization scope to referenced Azure DevOps repositories**.

## How do you implement DevSecOps in Azure Pipelines?

```text
Plan (threat model) → Code (branch policy) → Build (SAST, deps) →
Test (DAST optional) → Release (IaC scan, container scan) → Operate (monitor)
```

```yaml
stages:
  - stage: Build
    jobs:
      - job: SecureBuild
        steps:
          - template: templates/dotnet-build.yml
          - template: templates/security-scan.yml   # Sonar + Trivy
          - script: dotnet test --filter Category=Security
```

**Shift-left:** security tasks fail PR builds; don't only scan prod deploy.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Security/Secure Development Lifecycle.md
- Terraform/Terraform Basics.md
- Azure Cloud 1/Azure Identity and Entra ID.md
