# Microservices Security

## Questions Covered

1. How do you secure communication between microservices?
2. How do you handle secrets and sensitive data in microservices?
3. What is OAuth 2.0, and how can it be used for authentication and authorization?
4. How do you manage security in an API Gateway?

## How do you secure communication between microservices?

| Area | Practices |
|------|-----------|
| **HTTPS/TLS** | Encrypt all traffic in transit; valid SSL certs per service |
| **Authentication** | OAuth 2.0 / OpenID Connect for token-based service auth |
| **mTLS** | Both client and server present certs for mutual authentication |
| **API Gateway** | Centralized auth, token verification, rate limiting |
| **Network policies** | Segment networks; allow only required service-to-service paths |
| **Service mesh** | Istio/Linkerd with built-in mTLS and policy enforcement |
| **RBAC** | Fine-grained roles/permissions per service |
| **Least privilege** | Minimum permissions needed per service |
| **Audit & monitoring** | Log inter-service communication; detect anomalies |

## How do you handle secrets and sensitive data in microservices?

| Practice | Details |
|----------|---------|
| **Secrets managers** | HashiCorp Vault, AWS Secrets Manager, Azure Key Vault — encrypted at rest and in transit |
| **Environment variables** | Never hardcode secrets; use env vars or Docker Secrets |
| **Access control** | Role-based access; temporary/rotated credentials |
| **Audit logs** | Track who accessed what and when; regular policy reviews |
| **Data encryption** | Encrypt DB/file storage; manage keys via secrets tools |
| **Tokenization** | Replace sensitive data with non-sensitive equivalents for processing |

## What is OAuth 2.0, and how can it be used for authentication and authorization?

**OAuth 2.0** is an open authorization standard enabling delegated access without exposing user credentials.

**Key roles:**

| Role | Description |
|------|-------------|
| **Resource Owner** | User who owns data and grants access |
| **Client** | App requesting access (web/mobile) |
| **Authorization Server** | Issues tokens after auth and consent |
| **Resource Server** | Hosts protected APIs |

**Common flows:**

| Flow | Use Case |
|------|----------|
| **Authorization Code** | Server-side apps with secure client secret |
| **Implicit** | SPAs (deprecated; use PKCE instead in practice) |
| **Resource Owner Password** | Trusted apps only — discouraged for third-party |
| **Client Credentials** | Server-to-server without user involvement |

**Auth vs authorization:** OAuth is primarily authorization; combined with an identity provider, access tokens authenticate users. Tokens carry **scopes** (read/write) sent with API requests.

## How do you manage security in an API Gateway?

The API Gateway is the single entry point for clients — security is critical.

| Area | Practices |
|------|-----------|
| **Auth** | OAuth 2.0 / JWT token validation before forwarding |
| **RBAC** | Role-based access to resources and actions |
| **Rate limiting & throttling** | Prevent overload and abuse |
| **Input validation** | Block injection attacks; enforce expected formats |
| **TLS** | Encrypt client ↔ gateway ↔ backend traffic |
| **IP whitelist/blacklist** | Restrict trusted sources; block malicious IPs |
| **Logging & SIEM** | Audit all requests; real-time threat detection |
| **Centralized policies** | Consistent security across all microservices |
