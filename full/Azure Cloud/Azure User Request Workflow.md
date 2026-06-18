# Azure User Request Workflow

If you want to add Azure Active Directory (Azure AD) authentication to your architecture, it would typically be integrated at the Azure API Management (APIM) level. Here's how it fits into the flow:
## 1. User Request to Azure Application Gateway

- The user sends a request, which first hits the **Azure Application Gateway**.

- The Application Gateway performs its usual tasks like SSL termination, Web Application Firewall (WAF), and routing.
## 2. Routing to Azure API Management (APIM)

- The request is routed from the Application Gateway to **Azure API Management (APIM)**.

- At this point, APIM checks if the incoming request is authenticated and authorized to access the API.
## 3. Azure Active Directory Authentication

- **Integration with Azure AD**: APIM can be configured to enforce Azure AD authentication.

- **Authentication Flow**:

  - **Challenge**: If the request is not authenticated, APIM redirects the user to Azure AD for authentication.

  - **Token Issuance**: Azure AD prompts the user to sign in. Upon successful authentication, Azure AD issues an OAuth 2.0 token (usually a JWT) that represents the user's identity and permissions.

  - **Token Validation**: The user’s request is then resent to APIM, now including the token in the Authorization header. APIM validates this token with Azure AD to ensure that it’s valid and that the user has the required permissions.

- **Authorization**: After validating the token, APIM checks whether the user is authorized to access the specific API and performs any necessary role-based access control (RBAC) checks.
## 4. Forwarding to Backend Services

- **Token Propagation**: If needed, APIM can forward the validated Azure AD token to the backend services (VMs, containers, Kubernetes, etc.), allowing them to perform further authorization checks based on the user's identity.

- **Request Processing**: The backend service processes the request and sends the response back to APIM.
## 5. Response Flow Back to the User

- The response travels back through APIM and the Application Gateway before reaching the user.

### Summary of the Flow with Azure AD Authentication

1.  **User → Azure Application Gateway**: Initial request.

2.  **Azure Application Gateway → Azure API Management**: Request is routed to APIM.

3.  **Azure API Management → Azure AD**: If the request is not authenticated, APIM redirects to Azure AD for authentication.

4.  **Azure AD → User**: User is prompted to sign in; upon successful sign-in, Azure AD issues a token.

5.  **User → Azure API Management**: User resends the request with the token, APIM validates it.

6.  **Azure API Management → Backend Services**: Request is forwarded to the backend services with the validated token.

7.  **Backend Services → Azure API Management → Azure Application Gateway → User**: Response is sent back to the user.

### Key Points

- **Azure AD Authentication** is enforced at the **Azure API Management** layer.

- **APIM** validates the token issued by Azure AD and ensures the user is authorized to access the API.

- **Token Propagation**: APIM can pass the token to backend services if further authentication/authorization is required.
