# Azure User Request Workflow

**Azure AD** auth at **APIM** layer:

## 1. User Request to Azure Application Gateway

- Hits **Azure Application Gateway** — **SSL termination**, **WAF**, **routing**.

## 2. Routing to Azure API Management (APIM)

- Gateway → **APIM**; APIM checks **authn/authz**.

## 3. Azure Active Directory Authentication

- APIM enforces **Azure AD**:
  - **Challenge** — unauthenticated → Azure AD redirect
  - **Token issuance** — sign-in → **OAuth 2.0 JWT**
  - **Token validation** — `Authorization` header; APIM validates with Azure AD
- **RBAC** authorization after token validation.

## 4. Forwarding to Backend Services

- **Token propagation** to backends (VMs, containers, K8s) for downstream authz.
- Backend processes; response → APIM.

## 5. Response Flow Back to the User

- **Backend → APIM → App Gateway → User**

| # | Flow |
|---|------|
| 1 | **User → Gateway** |
| 2 | **Gateway → APIM** |
| 3 | **APIM → Azure AD** (if unauthenticated) |
| 4 | **Azure AD → User** (token) |
| 5 | **User → APIM** (validated) |
| 6 | **APIM → Backend** |
| 7 | **Backend → APIM → Gateway → User** |

- **Azure AD** at **APIM** — validates tokens, authorizes APIs.
- **Token propagation** when backends need identity/authz.
