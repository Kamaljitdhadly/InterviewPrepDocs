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

**Azure DevOps** is Microsoft's **DevOps platform** — a single place to plan work, host code, run automated builds, manage releases, and track quality. The cloud version lives at `dev.azure.com/{organization}`.

Think of it as the **operating system for your delivery pipeline**: Boards tell you *what* to build, Repos hold *how* it's built, Pipelines automate *build and deploy*, and Artifacts store *packages* between stages.

| Service | Purpose |
|---------|---------|
| **Boards** | Work tracking, Agile/Kanban, sprints |
| **Repos** | Git (or legacy TFVC) source control |
| **Pipelines** | CI/CD — YAML or classic editor |
| **Test Plans** | Manual/exploratory test cases (optional) |
| **Artifacts** | Private NuGet, npm, Maven feeds |

```text
Plan (Boards)
) → Code (Repos) → Build/Test (Pipelines) → Package (Artifacts) → Deploy (Azure/K8s/VM)
```

**Interview tip:** You don't have to use every service. Many teams use **GitHub for code + Azure Boards + Azure Pipelines** — that's a valid and common setup.

## How does Azure DevOps differ from GitHub?

Both can host Git and run CI/CD. The difference is **emphasis and enterprise tooling depth**.

| Aspect | Azure DevOps | GitHub |
|--------|--------------|--------|
| **Primary strength** | Enterprise pipelines, boards, Azure integration | Open source, Actions, community, Copilot |
| **CI/CD** | Azure Pipelines (mature multi-stage, environments) | GitHub Actions (tight repo integration) |
| **Work tracking** | Boards with Epics/Features/Stories hierarchy | Issues + Projects (lighter) |
| **Identity** | Microsoft Entra ID (Azure AD) native | GitHub accounts / Enterprise Managed Users |

**When teams pick Azure DevOps:** Already on Entra ID, heavy Azure deployment, need formal release environments with approvals, or want Boards + Pipelines in one portal.

**When teams pick GitHub:** Open-source culture, Actions ecosystem, or GitHub-first hiring. They may still deploy to Azure using **OIDC federation** from GitHub Actions.

**Hybrid (very common):** GitHub repo + `azure-pipelines.yml` triggered via service connection — best of both if your org standardizes on Pipelines for release governance.

## What are Azure Boards, and how do they support Agile?

**Boards** is the work-tracking hub. It answers: *What are we building, who's doing it, and what's the status?*

| Artifact | Use |
|----------|-----|
| **Product backlog** | All prioritized work not yet in a sprint |
| **Sprint backlog** | Work committed for the current iteration |
| **Board (Kanban)** | Visual columns with WIP limits — drag cards |
| **Queries** | Saved filters (WIQL) — e.g. "my open bugs" |
| **Dashboards** | Widgets: burndown, velocity, query charts |

Boards supports **Scrum** (time-boxed sprints, story points) and **Kanban** (continuous flow, no fixed sprint). Pick one process template when creating the project — you can customize columns and work item types later.

**Practical note:** Link commits and PRs to work items (`AB#12345` in commit message) so you can trace *which code change fulfilled which story* — auditors and product owners love this.

## What are work item types (Epic, Feature, User Story, Task, Bug)?

Work items are **typed tickets** with fields, states, and relationships. The default Agile process template uses this hierarchy:

| Type | Level | Example |
|------|-------|---------|
| **Epic** | Portfolio / multi-sprint | "Checkout redesign" |
| **Feature** | Release-sized slice | "Guest checkout" |
| **User Story** | User-visible behavior | "As a guest, I can pay with PayPal" |
| **Task** | Dev work breakdown | "Integrate PayPal SDK" |
| **Bug** | Defect | "Tax calculated twice on cart" |

```text
Epic: Checkout redesign
  └── Feature: Guest checkout
        └── Story: Pay with PayPal
              ├── Task: Add PayPal SDK
              └── Task: Write integration tests
```

**Story points** go on Stories/Features (Scrum); **Tasks** are often hour estimates. **Bugs** can be pulled into a sprint like stories or kept on a separate bug backlog depending on team policy.

States flow: `New` → `Active` → `Resolved` → `Closed` (customizable). Closing a Story often means "deployed and accepted," not just "code merged."

## How do sprints, backlogs, and kanban boards work?

**Scrum sprint cycle (typical 2 weeks):**

1. **Backlog refinement** — clarify stories, add acceptance criteria.
2. **Sprint planning** — team pulls stories into sprint until capacity is full.
3. **Daily standup** — board shows who's blocked; update task states.
4. **Sprint review** — demo completed work to stakeholders.
5. **Retrospective** — improve process (not the product).

```text
Product backlog (prioritized)
      ↓ sprint planning
Sprint 42 backlog → Board: New | Active | Resolved | Done
      ↓
Velocity chart (story points completed per sprint)
```

**Kanban** skips fixed sprints. Work flows through columns (`Backlog → In Progress → Review → Done`) with **WIP limits** (e.g. max 3 items in "In Progress") to prevent overload.

**Velocity** = sum of completed story points per sprint. Use it for *rough* forecasting, not performance ranking individuals.

## What is Azure Repos, and how does branching work?

**Azure Repos** is Git hosting inside Azure DevOps — same core Git commands as GitHub/GitLab. Each project can have multiple repos (e.g. `Shop.Api`, `Shop.Web`, `Shop.Infra`).

Common **branching strategies:**

| Strategy | Pattern | Best for |
|----------|---------|----------|
| **Trunk-based** | Short `feature/*` → merge to `main` quickly | CI/CD, small teams |
| **GitFlow** | `main`, `develop`, `feature/*`, `release/*`, `hotfix/*` | Scheduled releases |
| **Release branches** | `main` + long-lived `release/2.x` | Patch older versions |

```bash
git checkout -b feature/order-api
# ... commits ...
git push -u origin feature/order-api
# Open PR in Azure Repos → Azure DevOps UI
```

**Recommendation for most .NET teams today:** **Trunk-based** with `main` protected, feature branches living days not weeks, and **feature flags** for incomplete work.

## What are pull requests and branch policies in Azure Repos?

A **pull request (PR)** is the quality gate before code hits a shared branch. Reviewers comment, pipeline runs, policies must pass, then merge.

**Branch policies** on `main` (configure under Repos → Branches → `main` → Branch policies):

| Policy | Why it matters |
|--------|----------------|
| **Minimum reviewers (2)** | Knowledge sharing, catch bugs |
| **Build validation** | Broken code never merges |
| **Comment resolution required** | Review feedback addressed |
| **Linked work item** | Traceability to Boards |
| **Block direct pushes** | All changes go through PR |

```text
feature/order-api → PR opened → CI pipeline runs → 2 approvals → merge to main → CD pipeline deploys
```

**Optional but valuable:** Require **automatic reviewers** from code owners (via `CODEOWNERS` or path filters) for sensitive folders like `/infra` or `/security`.

## What is the difference between Azure DevOps Server and Azure DevOps Services?

| | **Services (cloud SaaS)** | **Server (on-premises)** |
|--|---------------------------|--------------------------|
| **Hosting** | Microsoft manages | Your datacenter |
| **Updates** | Continuous, automatic | You schedule upgrades |
| **Backend** | Azure-managed SQL | You run SQL Server |
| **URL** | `dev.azure.com/contoso` | `https://tfs.contoso.local/tfs` |
| **Typical buyer** | Most new projects | Air-gapped or strict data residency |

**Services** is the default for new work. **Server** appears in regulated environments that cannot use cloud SaaS — same concepts, different admin burden.

## How do you organize projects, teams, and area paths?

Azure DevOps hierarchy:

```text
Organization (contoso)           ← billing, Entra ID, agent pools
  └── Project (ContosoShop)        ← repos, pipelines, boards for one product
        ├── Team: Web              ← backlog filtered to \Shop\Web
        ├── Team: Mobile           ← backlog filtered to \Shop\Mobile
        └── Shared: pipelines, repos, artifacts
```

| Concept | Purpose |
|---------|---------|
| **Area path** | Categorize work by component (`\Shop\Web\Api`) |
| **Iteration path** | Sprint calendar (`\2025\Sprint 42`) |
| **Team** | Each team sees its area's backlog on its board |

**One project vs many:** Single project with multiple teams works for one product family. Separate projects when teams need **isolated permissions**, billing, or completely unrelated products.

## What are service connections and project settings basics?

Before pipelines can deploy anywhere, they need **permission to external systems** via service connections.

**Service connections** (Project Settings → Pipelines → Service connections):

| Type | Connects to |
|------|-------------|
| **Azure Resource Manager** | Subscriptions, deploy Web Apps, AKS |
| **Docker Registry** | ACR, Docker Hub |
| **Kubernetes** | AKS or any K8s cluster |
| **GitHub** | Trigger or checkout from GitHub repos |

**Other key settings:**

| Setting | Location | Purpose |
|---------|----------|---------|
| **Variable groups** | Pipelines → Library | Shared config; link to Key Vault |
| **Agent pools** | Org / project settings | Microsoft-hosted vs self-hosted |
| **Permissions** | Project settings | Who can edit pipelines, approve prod |

Use **managed identity** or **OIDC federation** for Azure instead of storing client secrets that expire and leak.

## How does Azure DevOps fit in the Microsoft ecosystem?

Azure DevOps is the **delivery layer** on top of Azure and Entra ID:

| Integration | What it enables |
|-------------|-----------------|
| **Entra ID** | SSO login; security groups → ADO permissions |
| **Azure** | Deploy App Service, Functions, AKS, SQL via service connections |
| **Azure Monitor** | Release gate — block deploy if active sev-1 alert |
| **GitHub** | Source in GitHub, build/release in Pipelines |
| **Teams** | Webhook notifications on build failure or release |

Typical **full-stack .NET path:** Code in Repos (or GitHub) → Pipelines build/test → deploy to **App Service** or **AKS** → monitor with **Application Insights** → work tracked in **Boards**.

## What is "shift-left" in Azure DevOps context?

**Shift-left** means catching problems **earlier** — at PR time, not in production Friday night.

| Practice | How Azure DevOps helps |
|----------|------------------------|
| Unit tests on every PR | Branch policy + build validation pipeline |
| Security scanning | SonarQube / Defender for DevOps in CI stage |
| IaC review | Terraform `plan` as PR comment |
| Preview environment | Deploy PR to ephemeral App Service slot |

The cost of fixing a bug rises sharply left → right: **minutes in IDE**, **hours in PR**, **days in staging**, **weeks if production incident**. Pipelines and branch policies automate the left side so humans don't skip checks under pressure.

## Related Topics

- Azure DevOps/Azure DevOps Pipelines and CI-CD.md
- Azure DevOps/Azure DevOps Deployment Strategies.md
- Git/Git Commands.md
- Azure Cloud/Azure Basics.md
