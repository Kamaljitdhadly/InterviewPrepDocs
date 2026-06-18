# Azure Identity and Entra ID

## Questions Covered

1. What is Microsoft Entra ID (formerly Azure AD)?
2. How does Entra ID differ from on-premises Active Directory?
3. What are tenants, users, groups, and app registrations?
4. What is Azure RBAC vs Entra ID roles?
5. What are managed identities, and how do you use them?
6. What is the OAuth 2.0 and OpenID Connect flow for web apps?
7. What is a service principal vs managed identity?
8. How does Entra ID integrate with ASP.NET Core?
9. What is Conditional Access?
10. What is Multi-Factor Authentication (MFA)?
11. What is Azure AD B2C vs Entra ID workforce?
12. How do you secure API access with Entra ID?

## What is Microsoft Entra ID (formerly Azure AD)?

**Microsoft Entra ID** is Azure's cloud identity and access management service — the identity provider for Azure Portal, Microsoft 365, and your applications.

| Function | Description |
|----------|-------------|
| **Authentication** | Verify user identity (who you are) |
| **Authorization** | Access to apps/resources (what you can do) |
| **SSO** | Single sign-on across SaaS apps |
| **Device management** | Integration with Intune |
| **B2B/B2C** | External users and customer identity |

Every Azure subscription is bound to one **Entra ID tenant** (`*.onmicrosoft.com` or custom domain).

## How does Entra ID differ from on-premises Active Directory?

| | On-prem AD | Entra ID |
|---|------------|----------|
| **Protocol** | LDAP, Kerberos, NTLM | OAuth 2.0, OIDC, SAML |
| **Structure** | OU, GPO, domain controllers | Flat tenant, Conditional Access |
| **Group Policy** | GPO | Intune, Conditional Access |
| **Trust** | Forest/domain trusts | B2B guest users, federation |
| **Hybrid** | — | **Entra Connect** syncs on-prem AD → cloud |

```text
Hybrid identity:
  On-prem AD ──Entra Connect──► Entra ID ──► Azure resources / SaaS apps
```

**Interview:** Entra ID is **not** a drop-in replacement for AD DS on a VM — it's cloud-native identity. Use **AD DS on VM** only if you need legacy LDAP/Kerberos for apps that can't modernize.

## What are tenants, users, groups, and app registrations?

| Object | Purpose |
|--------|---------|
| **Tenant** | Entire organization boundary |
| **User** | Employee identity (member) or guest (B2B) |
| **Group** | Security group or M365 group — assign RBAC and app access |
| **App registration** | Identity for an application (client ID, secrets/certs) |
| **Enterprise application** | Service principal instance in your tenant |

```text
App Registration (dev defines app)
  └── Enterprise Application (instance in tenant)
        └── Service Principal (security identity used for access)
```

**Two app registrations for SPA + API pattern:**

1. **Frontend (SPA)** — public client, redirect URIs, requests tokens
2. **Backend (API)** — exposes scopes (`api://myapi/access_as_user`)

## What is Azure RBAC vs Entra ID roles?

| System | Scope | Examples |
|--------|-------|----------|
| **Entra ID roles** | Tenant-wide | Global Admin, User Admin, App Admin |
| **Azure RBAC** | Azure resources (sub, RG, resource) | Owner, Contributor, Reader, custom roles |

```bash
# Azure RBAC — grant Contributor on resource group
az role assignment create \
  --assignee user@contoso.com \
  --role Contributor \
  --resource-group rg-prod

# Check effective permissions
az role assignment list --assignee user@contoso.com --output table
```

**Built-in Azure roles:**

| Role | Permissions |
|------|-------------|
| **Owner** | Full access + assign roles |
| **Contributor** | Full access, no role assignment |
| **Reader** | Read-only |
| **User Access Administrator** | Manage role assignments |

**Principle of least privilege:** assign roles at **narrowest scope** (RG > subscription).

## What are managed identities, and how do you use them?

**Managed Identity** — Azure-managed service principal; no credentials in code or config.

| Type | Description |
|------|-------------|
| **System-assigned** | Tied to one resource lifecycle |
| **User-assigned** | Standalone identity shared across resources |

```bash
az webapp identity assign --name myapi-prod --resource-group rg-prod
# Returns principalId — use for RBAC grants
az role assignment create \
  --assignee <principalId> \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/.../storageAccounts/mystorage
```

```csharp
// ASP.NET Core — DefaultAzureCredential picks up managed identity in Azure
var credential = new DefaultAzureCredential();
var blobClient = new BlobServiceClient(
    new Uri("https://mystorage.blob.core.windows.net"),
    credential);
```

**Always prefer managed identity** over connection strings and client secrets in App Service, Functions, AKS.

## What is the OAuth 2.0 and OpenID Connect flow for web apps?

**Common flows:**

| Flow | Use case |
|------|----------|
| **Authorization Code + PKCE** | SPAs, mobile, modern web apps |
| **Client Credentials** | Daemon/service-to-service (no user) |
| **On-Behalf-Of (OBO)** | API calls downstream API as user |

```text
SPA + API flow:
1. User → Entra ID login (authorization code + PKCE)
2. SPA receives access token (aud = API)
3. SPA → API with Bearer token
4. API validates: issuer, audience, signature, expiry, scopes
5. (Optional) API → Graph API via OBO flow
```

```csharp
// API — Microsoft.Identity.Web
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiAccess", policy =>
        policy.RequireClaim("scp", "access_as_user"));
});

[Authorize(Policy = "ApiAccess")]
[HttpGet("orders")]
public IActionResult GetOrders() => Ok(_orders.GetForUser(User));
```

## What is a service principal vs managed identity?

| | Service Principal | Managed Identity |
|---|-------------------|------------------|
| **Credentials** | Client secret or certificate (you rotate) | Azure-managed, automatic rotation |
| **Creation** | App registration + secret | Enable on resource |
| **Use case** | CI/CD pipelines, external apps, local dev | Apps running **in** Azure |

```bash
# Service principal for pipeline (when managed identity not available)
az ad sp create-for-rbac --name sp-github-deploy --role Contributor \
  --scopes /subscriptions/{sub}/resourceGroups/rg-prod
```

For GitHub Actions → Azure: prefer **OIDC federation** (no long-lived secrets).

## How does Entra ID integrate with ASP.NET Core?

```csharp
// appsettings.json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "your-tenant-id",
    "ClientId": "api-app-client-id",
    "Audience": "api://api-app-client-id"
  }
}

// Program.cs — Web API
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

// Blazor / MVC — sign-in users
builder.Services.AddAuthentication(OpenIdConnectDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApp(builder.Configuration.GetSection("AzureAd"));
```

**NuGet packages:** `Microsoft.Identity.Web`, `Microsoft.Identity.Client` (MSAL).

**Frontend (Angular/React):** use **MSAL.js** — `@azure/msal-browser`, `@azure/msal-react`.

## What is Conditional Access?

**Conditional Access** — if/then policies: *if* sign-in matches conditions, *then* require MFA, block, require compliant device.

| Condition | Example |
|-----------|---------|
| **User/group** | All admins |
| **Location** | Outside trusted countries |
| **Device** | Not Intune-compliant |
| **App** | Legacy auth clients |
| **Risk** | Sign-in risk high (Identity Protection) |

```text
Policy: "Require MFA for admins"
  IF user role = Global Admin
  AND location ≠ Trusted
  THEN require MFA
```

Requires **Entra ID P1/P2** licensing.

## What is Multi-Factor Authentication (MFA)?

**MFA** requires two+ verification factors: something you know (password) + something you have (phone, FIDO key).

| Method | Security level |
|--------|----------------|
| **SMS/Voice** | Weaker (SIM swap risk) |
| **Authenticator app** | Strong (TOTP) |
| **FIDO2 / Windows Hello** | Strongest — phishing-resistant |

Enable via **Security Defaults** (free, basic) or **Conditional Access MFA policies** (flexible, P1+).

## What is Azure AD B2C vs Entra ID workforce?

| | Entra ID (workforce) | Entra External ID / B2C |
|---|---------------------|-------------------------|
| **Users** | Employees, partners (B2B guests) | Customers |
| **Branding** | Microsoft login page (customizable) | Fully custom UI/user flows |
| **Social login** | Limited | Google, Facebook, etc. built-in |
| **Use case** | Internal apps, Azure RBAC | Customer-facing apps |

```text
Employee app     → Entra ID workforce + Conditional Access
Customer portal  → Entra External ID (B2C) with custom policies
```

## How do you secure API access with Entra ID?

| Pattern | Description |
|---------|-------------|
| **Bearer JWT validation** | Validate token on every request |
| **Scopes/roles** | `scp` claim for delegated; `roles` for app-only |
| **App roles** | Define `Admin`, `User` in app registration manifest |
| **Managed identity (S2S)** | Backend-to-backend without user |
| **APIM + Entra ID** | Gateway validates JWT before backend |

```csharp
[Authorize(Roles = "Admin")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(string id) { ... }

// Validate audience matches YOUR API, not Microsoft Graph
options.TokenValidationParameters.ValidAudience = "api://my-api-client-id";
```

**Never** accept tokens without validating **issuer**, **audience**, **signature**, **expiry**, and **tenant**.

## Related Topics

- **Azure Basics.md** — subscription and tenant hierarchy
- **Azure API Management and Gateways.md** — APIM OAuth integration
- **C#/.NET Core JSON Web Token.md** — JWT structure and validation
- **Security/Authentication and Identity.md** — general auth patterns
