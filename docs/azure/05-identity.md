# Identity: Entra ID, RBAC & Managed Identities

## Concept Explanation

- **Microsoft Entra ID** (formerly Azure Active Directory / AAD) — Azure's cloud **identity provider**. It manages users, groups, app registrations, and issues tokens (OAuth2/OIDC) for authentication.
- **Azure RBAC (Role-Based Access Control)** — authorization for the Azure **control plane**: who can do what on which resources, via **role assignments** = (security principal + role definition + scope). Scopes nest: Management Group → Subscription → Resource Group → Resource.
- **Managed Identity** — an automatically-managed Entra identity for an Azure resource (App Service, VM, Function) so it can authenticate to other services **without storing credentials**. Two kinds: **system-assigned** (tied to one resource's lifecycle) and **user-assigned** (standalone, shareable).

## Code Example(s)

```bash
# Assign an RBAC role at a scope
az role assignment create \
  --assignee <user-or-app-id> \
  --role "Reader" \
  --scope /subscriptions/<sub>/resourceGroups/rg-shop

# Enable a system-assigned managed identity on a web app
az webapp identity assign -g rg-shop -n shop-api

# Grant that identity access to a Key Vault / Storage
az role assignment create --assignee <app-principal-id> \
  --role "Storage Blob Data Reader" --scope <storage-resource-id>
```

```csharp
// App authenticates to Azure services with NO secrets, using its managed identity
var credential = new DefaultAzureCredential(); // picks up managed identity in Azure
var client = new BlobServiceClient(
    new Uri("https://shopstorage.blob.core.windows.net"), credential);
// Locally, DefaultAzureCredential falls back to your az login / VS credentials.
```

## Interview Q&A

**🟢 What is Microsoft Entra ID?**
Azure's cloud identity and access management service (formerly Azure AD). It authenticates users/apps and issues tokens via OAuth2/OpenID Connect, and underpins RBAC and managed identities.

**🟢 What is Azure RBAC?**
Authorization based on role assignments: a security principal (user/group/service principal/managed identity) is granted a role definition (set of permissions) at a scope (management group/subscription/RG/resource). Permissions inherit down the scope hierarchy.

**🟡 What is a Managed Identity and why use it?**
An Entra identity automatically managed by Azure for a resource, so the app can authenticate to other Azure services without storing secrets/connection strings. It eliminates credential management and rotation.

**🟡 Difference between system-assigned and user-assigned managed identity?**
System-assigned is created with and tied to a single resource (deleted when the resource is). User-assigned is a standalone identity you can assign to multiple resources and manage independently — good for shared identity across services.

**🔴 What's the difference between authentication and authorization here, and between Entra roles and Azure RBAC roles?**
Entra ID handles authentication (proving identity) and **directory** roles (e.g. Global Admin — manage Entra/tenant). Azure RBAC handles authorization on **Azure resources** (e.g. Contributor on an RG). They're separate systems — a Global Admin isn't automatically a resource Owner.

## ⚠️ Tricky / Gotchas

- **Entra (directory) roles ≠ Azure RBAC roles.** Global Administrator manages the directory; it does **not** grant access to manage Azure resources unless explicitly elevated. A classic confusion.
- **RBAC is additive and inherited down the hierarchy** — a role at the subscription scope applies to all RGs/resources beneath it; there are limited "deny assignments."
- **Managed identity needs RBAC too** — enabling a managed identity does nothing until you grant it a role on the target resource.
- **`DefaultAzureCredential` order** can surprise locally vs in Azure — it tries multiple sources; ensure the right one is available in each environment.
- **Connection strings/keys still floating around** defeats the purpose — the goal is no secrets via managed identity + RBAC/Key Vault.

## 📌 Quick Recap

- Entra ID = identity provider (authn, tokens, directory roles, app registrations).
- Azure RBAC = authorization on resources: principal + role + scope; inherits down MG→Sub→RG→Resource.
- Managed Identity = credential-free auth for Azure resources; system-assigned (per-resource) vs user-assigned (shared).
- Managed identity still needs an RBAC role grant to do anything.
- Entra directory roles ≠ Azure RBAC roles (different systems).
- Use Managed Identity + Key Vault to eliminate secrets in code.
