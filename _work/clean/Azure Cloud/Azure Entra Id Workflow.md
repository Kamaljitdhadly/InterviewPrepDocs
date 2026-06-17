# Azure Entra Id Workflow

# 🧠 🎯 Big Picture Architecture

You have:

[ Angular SPA ] → [ .NET API ] → [ Microsoft Graph ]\
↓ ↓\
(Login) (Validate Token)\
↓ ↓\
[ Microsoft Entra ID ]

# 🔧 🔥 Step 1: App Registrations (Setup Phase)

In **Microsoft Entra ID**
## 🟢 1. Angular App Registration (Frontend)

Configure:

- ✔️ Redirect URI → Angular URL

- ✔️ Platform → SPA

- ✔️ API Permissions:

  - openid, profile (for login)

  - api://backend-app/access_api (to call backend)
## 🔵 2. .NET API App Registration (Backend)

Configure:

### ✔️ Expose an API

- Create scope:

access_api

### ✔️ API Permissions (for Graph)

- User.Read

- Mail.Read (if needed)

### ✔️ (Optional) App Roles

- Admin / User (for your app authorization)

# 🔐 🔥 Step 2: User Login (Authentication)
## 🟢 Angular initiates login

Using MSAL:

```typescript
loginRedirect({ scopes: ["openid", "profile", "api://backend/access_api"] });
```
## 🔁 Flow:

1.  Angular → redirects user to Entra ID

2.  User logs in

3.  Entra ID → sends **authorization code**

4.  Angular → exchanges code → gets tokens
## 🎁 Angular receives:

- ✔️ **ID Token** → login (who user is)

- ✔️ **Access Token** → for backend API

# 🔑 🔥 Step 3: Token Usage (Frontend → Backend)
## Angular calls API:

GET /api/data\
Authorization: Bearer <access_token>
## Token contains:

{\
"aud": "backend-app",\
"scp": "access_api"\
}

# 🔐 🔥 Step 4: Backend Token Validation

In .NET API:

- Validate:

  - ✔️ Signature

  - ✔️ Issuer (iss)

  - ✔️ Audience (aud)

  - ✔️ Expiry (exp)

  - ✔️ Scope (scp)

👉 If valid → request allowed\
👉 If invalid → 401 / 403

# 🔄 🔥 Step 5: Backend calling Microsoft Graph (OBO)
## Problem:

👉 Token from Angular is:

- ❌ Not valid for Graph
## Solution: **On-Behalf-Of Flow**
## Backend does:

1.  Receives user token

2.  Calls Entra ID /token endpoint

3.  Exchanges token
## Gets new token:

{\
"aud": "graph.microsoft.com",\
"scp": "User.Read"\
}
## Backend calls:

GET https://graph.microsoft.com/v1.0/me\
Authorization: Bearer <graph_token>

# 🔁 🔥 Step 6: Response Flow

Graph → .NET API → Angular → User

# 🧠 🔥 Full End-to-End Flow

1. Angular → Login → Entra ID\
2. Entra ID → Code → Angular\
3. Angular → Token endpoint → Entra ID\
4. Angular ← Tokens\
5. Angular → .NET API (access token)\
6. .NET API → Validate token\
7. .NET API → (OBO) → Entra ID\
8. Entra ID → Graph token → .NET API\
9. .NET API → Microsoft Graph\
10. Graph → .NET API → Angular

# 🔐 🔥 Key Concepts (What you learned)
## 🟢 Tokens

| **Token**    | **Purpose**                |
|--------------|----------------------------|
| ID Token     | Login (authentication)     |
| Access Token | API access (authorization) |
## 🟢 Permissions

| **Type**    | **Used for**               |
|-------------|----------------------------|
| Delegated   | User + app (OBO, login)    |
| Application | App only (background jobs) |
## 🟢 Flows

| **Flow**                  | **Use**             |
|---------------------------|---------------------|
| Authorization Code + PKCE | Angular login       |
| OBO                       | Backend → Graph     |
| Client Credentials        | Background services |
## 🟢 App Registration Roles

| **Feature**     | **Purpose**                   |
|-----------------|-------------------------------|
| API Permissions | Call other APIs               |
| Expose an API   | Allow others to call your API |
| App Roles       | Authorization inside app      |

# 🎯 🔥 Final Mental Model

**Entra ID = Identity provider (issues tokens)**\
**Angular = Gets token & calls API**\
**.NET API = Validates token & enforces access**\
**Graph = External API accessed via OBO**

# 💡 🔥 Real-world Best Practices

- ✔️ Use **2 app registrations**

- ✔️ Use **Authorization Code Flow + PKCE**

- ✔️ Use **OBO for Graph access**

- ✔️ Use **ID token for login, access token for APIs**

- ✔️ Validate token in backend always

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Admin consent changes *who approves permissions*, not the core OAuth flow — but it has important implications.

Let’s walk it end-to-end.

------------------------------------------------------------------------

# 🔥 First: User Consent vs Admin Consent
## 🟢 User Consent (what you’ve been using)

- User approves permissions themselves

- Works for:

  - User.Read

  - basic profile access
## 🔴 Admin Consent

An **admin grants permissions on behalf of the entire organization**

- Required for:

  - high-privilege scopes

  - org-wide access

  - some **Microsoft Graph** permissions

# 🧠 Example

| **Permission** | **Consent type**             |
|----------------|------------------------------|
| User.Read      | User can consent             |
| Mail.Read      | Often admin consent required |
| User.Read.All  | Admin consent required       |

------------------------------------------------------------------------

# 🔥 Now full workflow WITH Admin Consent

------------------------------------------------------------------------

# 🔧 Step 1: App Registration Setup

In **Microsoft Entra ID**

------------------------------------------------------------------------
## 🟢 Angular App

- Requests:

  - openid, profile

  - api://backend/access_api
## 🔵 Backend App

- Exposes API (access_api)

- Requests Graph permissions:

  - User.Read

  - Mail.Read

# 🔴 Step 2: Admin grants consent (IMPORTANT)

Admin clicks:

👉 **“Grant admin consent”**
## What happens internally?

- Permissions are stored in tenant

- Users will NOT be prompted anymore

- App is trusted for all users

# 🔐 Step 3: User Login (SSO)

Same as before:

1.  Angular → login

2.  User authenticates

3.  Token issued

👉 But now:

- No consent screen shown (already approved)

# 🎁 Step 4: Token issued to Angular

{\
"scp": "access_api"\
}

------------------------------------------------------------------------

# 🔁 Step 5: Angular → Backend

Same as before

------------------------------------------------------------------------

# 🔄 Step 6: Backend → Graph (OBO)

------------------------------------------------------------------------
## 🔥 Difference now

Backend requests Graph token:

scope=User.Read Mail.Read

------------------------------------------------------------------------
## Without admin consent:

- ❌ Might fail

- ❌ Or user prompted
## With admin consent:

- ✅ Works silently

- ✅ No prompt

# 🎯 Token issued for Graph

{\
"scp": "User.Read Mail.Read"\
}

------------------------------------------------------------------------

# 🧠 Key difference in flow

| **Step**            | **Without Admin Consent** | **With Admin Consent** |
|---------------------|---------------------------|------------------------|
| Consent screen      | User sees prompt          | No prompt              |
| Permission approval | Per user                  | Org-wide               |
| OBO flow            | Might fail                | Works smoothly         |

------------------------------------------------------------------------

# 🔥 Important concept (VERY IMPORTANT)

Admin consent does NOT change OAuth flow — it changes **who approves permissions**

------------------------------------------------------------------------

# 🧠 Real-world scenario

### Without admin consent:

- Each user sees:\
  👉 “App wants to read your mail”

### With admin consent:

- Admin approves once

- Users login seamlessly

# 🔐 Security implication

Admin is saying:

“I trust this app to access these resources for all users”

------------------------------------------------------------------------

# 🎯 Final end-to-end flow (with admin consent)

1. Admin grants consent (once)\
2. User logs in (no consent screen)\
3. Angular gets token\
4. Angular calls backend\
5. Backend validates token\
6. Backend uses OBO\
7. Backend gets Graph token (no prompt)\
8. Backend calls Graph

------------------------------------------------------------------------

# 💡 When do you NEED admin consent?

- Access:

  - all users data (User.Read.All)

  - emails (Mail.Read)

  - directory data

# 🚀 Final answer

When admin consent is involved, an administrator pre-approves the permissions requested by the application for all users in the tenant. The authentication and token flow remain the same, but users are not prompted for consent, and backend operations like OBO can proceed seamlessly without permission-related failures.

------------------------------------------------------------------------

# 💡 Pro tip (very useful)

In enterprise apps:

✅ Always prefer **admin consent upfront**
