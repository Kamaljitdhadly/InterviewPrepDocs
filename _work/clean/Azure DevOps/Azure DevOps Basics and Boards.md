# Azure DevOps Basics and Boards

## Questions Covered

1. What is Azure DevOps, and what are its main services?
2. How does Azure DevOps differ from GitHub?
3. What are Azure Boards, and how do they support Agile?
4. What are work item types (Epic, Feature, User Story, Task, Bug)?
5. How do sprints, backlogs, and kanban boards work?
6. What is Azure Repos, and how does branching work?
7. What are pull requests and branch policies in Azure Repos?
8. What is the difference between Azure DevOps Server and Azure DevOps Services?
9. How do you organize projects, teams, and area paths?
10. What are service connections and project settings basics?
11. How does Azure DevOps fit in the Microsoft ecosystem?
12. What is "shift-left" in Azure DevOps context?

## What is Azure DevOps, and what are its main services?

**Azure DevOps** is Microsoft's **DevOps platform** — plan, code, build, test, release, and monitor in one suite (cloud: `dev.azure.com`).

| Service | Purpose |
|---------|---------|
| **Boards** | Work tracking, Agile/Kanban |
| **Repos** | Git (or TFVC) source control |
| **Pipelines** | CI/CD (YAML or classic) |
| **Test Plans** | Manual/exploratory test management |
| **Artifacts** | Package feeds (NuGet, npm, Maven) |

```text
Boards → Repos → Pipelines → Artifacts → Deploy (Azure/K8s/on-prem)
```

## How does Azure DevOps differ from GitHub?

| Aspect | Azure DevOps | GitHub |
|--------|--------------|--------|
| **Primary strength** | Enterprise pipelines, boards, Azure integration | Open source, Actions, community |
| **CI/CD** | Azure Pipelines | GitHub Actions |
| **Work tracking** | Built-in Boards | Issues + Projects |
| **Identity** | Entra ID (Azure AD) | GitHub accounts / EMU |

Many orgs use **GitHub + Azure Pipelines** or **Azure Repos + Pipelines**. Microsoft integrates both; know Pipelines YAML regardless of repo host.

## What are Azure Boards, and how do they support Agile?

**Boards** track work with backlogs, sprints, queries, and dashboards.

| Artifact | Use |
|----------|-----|
| **Product backlog** | Prioritized stories/features |
| **Sprint backlog** | Work committed for iteration |
| **Board** | Drag-and-drop WIP limits (Kanban) |
| **Queries** | Custom WIQL filters |

Supports **Scrum** (sprints) and **Kanban** (continuous flow).

## What are work item types (Epic, Feature, User Story, Task, Bug)?

| Type | Level | Example |
|------|-------|---------|
| **Epic** | Portfolio | "Checkout redesign" |
| **Feature** | Release slice | "Guest checkout" |
| **User Story** | Deliverable behavior | "As a guest, I can pay with PayPal" |
| **Task** | Implementation step | "Add PayPal SDK" |
| **Bug** | Defect | "Tax calculated twice" |

Hierarchy: Epic → Feature → Story → Task. Link PRs and commits to work items for traceability.

## How do sprints, backlogs, and kanban boards work?

**Scrum flow:**
1. Groom product backlog.
2. Plan sprint — pull stories into sprint backlog.
3. Daily standup against task board.
4. Review + retrospective at sprint end.

**Kanban:** Columns (New → Active → Resolved → Closed) with **WIP limits** — no fixed sprints.

```text
Backlog (prioritized) → Sprint 42 → Board columns → Done
```

Velocity = completed story points per sprint (Scrum metric).

## What is Azure Repos, and how does branching work?

**Azure Repos** = Git hosting in Azure DevOps (similar to GitHub/GitLab).

Common **branching strategies:**

| Strategy | Pattern |
|----------|---------|
| **GitFlow** | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` |
| **Trunk-based** | Short-lived branches → `main` |
| **Release branches** | `main` + `release/1.x` for patches |

```bash
git checkout -b feature/order-api
git push -u origin feature/order-api
# Open PR in Azure Repos
```

## What are pull requests and branch policies in Azure Repos?

**Pull requests (PRs):** code review gate before merge.

**Branch policies** on `main`:
- Minimum reviewers (e.g. 2)
- Build validation (pipeline must pass)
- Comment resolution required
- Linked work item required
- No direct pushes

```text
feature branch → PR → build + review → merge to main → pipeline deploys
```

## What is the difference between Azure DevOps Server and Azure DevOps Services?

| | **Services (cloud)** | **Server (on-prem)** |
|--|----------------------|----------------------|
| **Hosting** | Microsoft SaaS | Your datacenter |
| **Updates** | Continuous | Upgrade cycles |
| **Scale** | Managed | You maintain SQL Server |
| **URL** | `dev.azure.com/org` | `https://server/tfs` |

Most new projects use **Services**.

## How do you organize projects, teams, and area paths?

```text
Organization (contoso)
  └── Project (ContosoShop)
        ├── Team A (area: \Shop\Web)
        ├── Team B (area: \Shop\Mobile)
        └── Repos / Pipelines / Boards (shared or per team)
```

| Concept | Purpose |
|---------|---------|
| **Area path** | Categorize work by component |
| **Iteration path** | Sprint timeline |
| **Team** | Backlog filtered by area |

## What are service connections and project settings basics?

**Service connections** authorize pipelines to external systems — Azure, ACR, Kubernetes, GitHub, npm feeds.

| Setting | Location |
|---------|----------|
| Service connections | Project Settings → Pipelines |
| Variable groups | Pipelines → Library (link Key Vault) |
| Agent pools | Organization / project settings |
| Permissions | Project / repo / environment RBAC |

Use **managed identity** or **service principal** for Azure — avoid long-lived secrets in YAML.

## How does Azure DevOps fit in the Microsoft ecosystem?

| Integration | Example |
|-------------|---------|
| **Entra ID** | SSO, group-based access |
| **Azure** | Deploy Web App, AKS, Functions |
| **GitHub** | Repos + Actions or Azure Pipelines |
| **Teams** | Notifications via webhooks |
| **Azure Monitor** | Release gates on metrics |

Full-stack .NET teams often: **Azure Repos/Boards + Pipelines → Azure App Service/AKS**.

## What is "shift-left" in Azure DevOps context?

Move quality and security **earlier**:

| Shift-left practice | Azure DevOps tool |
|---------------------|-------------------|
| Unit tests on PR | Branch policy + pipeline |
| SAST | Microsoft Security DevOps / Sonar |
| IaC validation | Terraform plan in PR pipeline |
| Preview env | Ephemeral slot per PR |

Catch defects before production — cheaper than hotfixes.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Azure DevOps/Azure DevOps Deployment Strategies.md
- Git/Git Commands.md
- Azure Cloud 1/Azure Basics.md
