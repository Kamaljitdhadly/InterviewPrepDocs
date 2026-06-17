# Azure Application Gateway

Use Application Gateway alongside App Service/AKS when you need Layer 7 routing, WAF, SSL termination, and centralized control across multiple backends.
## 1. Layer 7 Load Balancing

- **Advanced Load Balancing**: Layer 7 (HTTP/HTTPS) routing by URL, headers, or body—beyond Layer 4 TCP/UDP load balancing.

- **Path-Based Routing**: Route by URL path (e.g., `/api` vs `/web` to different backend pools).
## 2. Web Application Firewall (WAF)

- **Security Features**: WAF blocks OWASP Top 10 threats—SQL injection, XSS, and similar web vulnerabilities.
## 3. SSL Termination

- **Centralized SSL Management**: Terminates SSL/TLS at the gateway; offloads crypto from backends and centralizes certs.
## 4. End-to-End SSL

- **Re-encryption**: Optionally re-encrypts traffic to backends for end-to-end security.
## 5. Global Load Balancing

- **Integration with Traffic Manager**: Regional gateway + Traffic Manager = multi-region distribution and failover.
## 6. Customizable Health Probes

- **Health Monitoring**: Custom health probes route only to healthy backends—more flexible than App Service defaults.
## 7. Centralized Management for Multiple Backends

- **Multi-Backend Integration**: Single gateway for App Service, VMs, AKS, and mixed environments.
## 8. Scaling Complex Applications

- **Large, Complex Applications**: One control point for routing, security, and LB across tiers/microservices.
## 9. Session Affinity (Sticky Sessions)

- **Cookie-Based Affinity**: Sticky sessions pin users to the same backend instance when stateful.
## 10. Centralized Routing Rules Across Services

- **Uniform Routing and Security Policies**: Enforce consistent routing, security, and logging across App Service, AKS, and VMs.

**Use cases**: Enterprise apps (AKS + App Service) with WAF and centralized SSL; microservices spanning App Service, AKS, and VMs with uniform LB/security.

**Summary**: App Service/AKS offer basic LB; Application Gateway adds Layer 7 routing, WAF, SSL termination, session affinity, and multi-backend management for secure, scalable enterprise apps.
