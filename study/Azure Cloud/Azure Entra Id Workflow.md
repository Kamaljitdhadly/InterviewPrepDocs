# Azure Entra Id Workflow

## Big Picture Architecture

```
[ Angular SPA ] → [ .NET API ] → [ Microsoft Graph ]
       ↓                ↓
   (Login)        (Validate Token)
       ↓                ↓
[ Microsoft Entra ID ]
```

## Step 1: App Registrations (Setup)

In **Microsoft Entra ID**:

## 🟢 1. Angular App Registration (Frontend)

- Redirect URI → Angular URL
- Platform → **SPA**
- API Permissions: `openid`, `profile`; `api://backend-app/access_api`

## 🔵 2. .NET API App Registration (Backend)

- **Expose an API** — scope: `access_api`
- **API Permissions (Graph):** `User.Read`, `Mail.Read` (optional)
- **App Roles (optional):** Admin / User

## Step 2: User Login (Authentication)

## 🟢 Angular initiates login

```typescript
loginRedirect({ scopes: ["openid", "profile", "api://backend/access_api"] });
```

## 🔁 Flow:

1. Angular → Entra ID (redirect)
2. User logs in
3. Entra ID → **authorization code**
4. Angular exchanges code → tokens

## 🎁 Angular receives:

| Token | Purpose |
|-------|---------|
| **ID Token** | Authentication (who user is) |
| **Access Token** | Call backend API |

## Step 3: Token Usage (Frontend → Backend)

## Angular calls API:

```
GET /api/data
Authorization: Bearer <access_token>
```

## Token contains:

Token claims: `"aud": "backend-app"`, `"scp": "access_api"`

## Step 4: Backend Token Validation

.NET API validates: **signature**, **issuer** (`iss`), **audience** (`aud`), **expiry** (`exp`), **scope** (`scp`)

- Valid → allow | Invalid → **401/403**

## Step 5: Backend → Microsoft Graph (OBO)

## Problem:

**Problem:** Angular token ❌ not valid for Graph

## Solution: **On-Behalf-Of Flow**

## Backend does:

1. Backend receives user token
2. Calls Entra ID `/token` endpoint
3. Exchanges for Graph token: `"aud": "graph.microsoft.com"`, `"scp": "User.Read"`

## Gets new token:

(OBO token for Graph)

## Backend calls:

```
GET https://graph.microsoft.com/v1.0/me
Authorization: Bearer <graph_token>
```

## Step 6: Response Flow

Graph → .NET API → Angular → User

## Full End-to-End Flow

1. Angular → Login → Entra ID
2. Entra ID → Code → Angular
3. Angular → Token endpoint → Entra ID
4. Angular ← Tokens
5. Angular → .NET API (access token)
6. .NET API → Validate token
7. .NET API → OBO → Entra ID
8. Entra ID → Graph token → .NET API
9. .NET API → Microsoft Graph
10. Graph → .NET API → Angular

## Key Concepts

## 🟢 Tokens

| **Token** | **Purpose** |
|-----------|-------------|
| ID Token | Login (authentication) |
| Access Token | API access (authorization) |

## 🟢 Permissions

| **Type** | **Used for** |
|----------|--------------|
| Delegated | User + app (OBO, login) |
| Application | App only (background jobs) |

## 🟢 Flows

| **Flow** | **Use** |
|----------|---------|
| Authorization Code + PKCE | Angular login |
| OBO | Backend → Graph |
| Client Credentials | Background services |

## 🟢 App Registration Roles

| **Feature** | **Purpose** |
|-------------|-------------|
| API Permissions | Call other APIs |
| Expose an API | Allow others to call your API |
| App Roles | Authorization inside app |

## Mental Model

- **Entra ID** = identity provider (issues tokens)
- **Angular** = gets token & calls API
- **.NET API** = validates token & enforces access
- **Graph** = external API via OBO

## Best Practices

- **2 app registrations** (SPA + API)
- **Authorization Code + PKCE** for login
- **OBO** for Graph access
- **ID token** for login; **access token** for APIs
- Always validate token in backend

---

## User Consent vs Admin Consent

## 🟢 User Consent (what you've been using)

- User approves themselves
- Works for: `User.Read`, basic profile

## 🔴 Admin Consent

- Admin grants on behalf of **entire organization**
- Required for: high-privilege scopes, org-wide access, many Graph permissions

| **Permission** | **Consent** |
|----------------|-------------|
| User.Read | User can consent |
| Mail.Read | Often admin required |
| User.Read.All | Admin required |

## Workflow WITH Admin Consent

## 🟢 Angular App

- **Angular:** `openid`, `profile`, `api://backend/access_api`

## 🔵 Backend App

- **Backend:** exposes `access_api`; Graph: `User.Read`, `Mail.Read`

## What happens internally?

Admin clicks **"Grant admin consent"** → permissions stored in tenant → users **not prompted** → app trusted org-wide

## 🔥 Difference now

| | Without Admin Consent | With Admin Consent |
|--|----------------------|-------------------|
| Consent screen | User prompted | No prompt |
| Approval | Per user | Org-wide |
| OBO | May fail | Works silently |

## Without admin consent:

User prompted per permission; OBO may fail for org-wide scopes.

## With admin consent:

No consent screen; OBO works silently for pre-approved scopes.

### Setup (reference)

**Key:** Admin consent does NOT change OAuth flow — only **who approves permissions**.

**Security:** Admin trusts app to access resources for all users.

### End-to-end (with admin consent)

1. Admin grants consent (once)
2. User logs in (no consent screen)
3. Angular gets token → calls backend
4. Backend validates → OBO → Graph token (no prompt) → Graph

### When admin consent is required

- `User.Read.All`, `Mail.Read`, directory-wide data

**Enterprise tip:** Prefer **admin consent upfront**.
