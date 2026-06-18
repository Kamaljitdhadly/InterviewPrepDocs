# Azure Application Gateway and Load Balancer

## Questions Covered

1. What is the difference between Layer 4 and Layer 7 load balancing?
2. What is Azure Load Balancer, and when do you use it?
3. What is Azure Application Gateway, and when do you use it?
4. How do health probes work?
5. What is SSL/TLS termination vs end-to-end SSL?
6. What is the Web Application Firewall (WAF) on Application Gateway?
7. What is path-based and host-based routing?
8. How does Application Gateway integrate with App Service and AKS?
9. What is Azure Load Balancer vs Application Gateway vs Front Door?
10. How does session affinity (sticky sessions) work?
11. How do you configure a Load Balancer with VMSS?
12. When does App Service need an external load balancer?

## What is the difference between Layer 4 and Layer 7 load balancing?

| OSI Layer | Name | Routes based on | Azure service |
|-----------|------|-----------------|---------------|
| **L4** | Transport | IP + port (TCP/UDP) | Load Balancer, Internal LB |
| **L7** | Application | HTTP URL, headers, host | Application Gateway, Front Door |

```text
L4:  All traffic to 443 → round-robin to backend pool (any HTTPS site)
L7:  /api/* → API servers; /static/* → CDN; Host: admin.contoso.com → admin pool
```

L7 enables **content-aware routing** and **WAF** — L4 is faster and simpler for non-HTTP protocols.

## What is Azure Load Balancer, and when do you use it?

**Azure Load Balancer** — regional L4 load balancer for TCP/UDP.

| SKU | Scope |
|-----|-------|
| **Public Load Balancer** | Internet → VMs/VMSS |
| **Internal Load Balancer** | Private VNet traffic only |

**Features:**

- **Hash-based distribution** (5-tuple: source IP/port, dest IP/port, protocol)
- **Health probes** — TCP, HTTP, HTTPS
- **Outbound SNAT** — VMs reach internet via LB public IP
- **HA Ports** — all ports on one rule (active/passive firewalls)

```bash
az network lb create --resource-group rg-prod --name lb-web --sku Standard \
  --public-ip-address pip-web --frontend-ip-name fe --backend-pool-name be

az network lb probe create --resource-group rg-prod --lb-name lb-web \
  --name http-probe --protocol Http --port 80 --path /health

az network lb rule create --resource-group rg-prod --lb-name lb-web \
  --name rule-https --protocol Tcp --frontend-port 443 --backend-port 443 \
  --frontend-ip-name fe --backend-pool-name be --probe-name http-probe
```

**Use when:** non-HTTP traffic, simple TCP distribution, VMSS backend, NLB for AKS `LoadBalancer` service type.

## What is Azure Application Gateway, and when do you use it?

**Application Gateway** — regional L7 HTTP/S reverse proxy and load balancer.

| Feature | Benefit |
|---------|---------|
| **URL path routing** | `/api` vs `/web` to different pools |
| **Host-based routing** | Multi-tenant by subdomain |
| **SSL termination** | Offload crypto from backends |
| **WAF v2** | OWASP CRS, bot protection |
| **Autoscaling** | Scale units 0–125 |
| **Zone redundancy** | Deploy across AZs (WAF_v2) |

```text
Internet → Application Gateway (WAF)
              ├── Pool A: App Service (web)
              ├── Pool B: VMSS (API)
              └── Pool C: AKS ingress controller
```

**Use when:** web apps needing WAF, path routing, SSL centralization, or multi-backend routing.

## How do health probes work?

**Probes** determine backend health — unhealthy instances removed from rotation.

| Probe type | LB | App Gateway |
|------------|-----|-------------|
| **TCP** | Port open check | — |
| **HTTP/HTTPS** | Custom path + status code | `/health` returns 200–399 |
| **Interval** | Configurable (default 15s) | Configurable |

```csharp
// ASP.NET Core health endpoint for probes
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Or full health checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString)
    .AddAzureBlobStorage(blobConnectionString);
app.MapHealthChecks("/health");
```

**Common mistake:** probe path requires auth → all backends marked unhealthy → outage.

## What is SSL/TLS termination vs end-to-end SSL?

| Mode | Flow | Pros |
|------|------|------|
| **Termination at gateway** | Client → HTTPS → Gateway → HTTP → backend | Central cert management; less backend CPU |
| **End-to-end SSL** | Client → HTTPS → Gateway → HTTPS → backend | Encrypts internal segment |

```text
Termination:
  Browser ══HTTPS══► App Gateway ══HTTP══► VM (port 80)

End-to-end:
  Browser ══HTTPS══► App Gateway ══HTTPS══► VM (port 443, cert on VM)
```

Upload certificate to Application Gateway or use **Key Vault integration** for auto-renewal.

## What is the Web Application Firewall (WAF) on Application Gateway?

**WAF v2** protects against OWASP Top 10 — SQL injection, XSS, command injection, etc.

| Mode | Behavior |
|------|----------|
| **Detection** | Log only — no blocking |
| **Prevention** | Block matching requests |

**Rule sets:** OWASP 3.2, Bot Manager, custom rules (geo-block, rate limit by IP).

```bash
az network application-gateway waf-config set \
  --resource-group rg-prod \
  --gateway-name agw-prod \
  --enabled true \
  --firewall-mode Prevention \
  --rule-set-type OWASP \
  --rule-set-version 3.2
```

Tune with **exclusions** for false positives (specific headers, cookie names).

## What is path-based and host-based routing?

**Path-based:**

```text
www.contoso.com/api/*  → backend-pool-api
www.contoso.com/*      → backend-pool-web
```

**Host-based (multi-site):**

```text
api.contoso.com   → backend-pool-api
www.contoso.com   → backend-pool-web
admin.contoso.com → backend-pool-admin
```

```bash
# App Gateway path rule (conceptual — often configured in Portal/Bicep)
# urlPathMap: /api/* → pool-api, default → pool-web
```

Application Gateway supports **rewrite rules** — modify headers/URL before forwarding.

## How does Application Gateway integrate with App Service and AKS?

| Backend | Integration |
|---------|-------------|
| **App Service** | Backend pool points to App Service FQDN; AGW handles SSL |
| **VMSS** | NICs in backend pool; health probe on VM |
| **AKS** | **AGIC** (Application Gateway Ingress Controller) — K8s ingress resource drives AGW config |

```yaml
# AKS — Ingress with AGW annotation
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
spec:
  rules:
  - host: api.contoso.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-api
            port:
              number: 80
```

**App Service built-in LB:** scales instances internally — add AGW when you need WAF, unified routing across App Service + VMs + AKS, or custom SSL policies.

## What is Azure Load Balancer vs Application Gateway vs Front Door?

| Service | Scope | Layer | WAF | Best for |
|---------|-------|-------|-----|----------|
| **Load Balancer** | Regional | L4 | No | TCP/UDP, VMSS, internal traffic |
| **Application Gateway** | Regional | L7 | Yes (v2) | Regional web apps, VNet integration |
| **Front Door** | Global | L7 | Yes | Global users, CDN, multi-region failover |
| **Traffic Manager** | Global | DNS | No | DNS-level failover (no proxy) |

```text
Single region web app with WAF     → Application Gateway
Global SaaS with CDN + WAF         → Front Door
Internal TCP service               → Internal Load Balancer
Multi-region active-active DNS     → Traffic Manager or Front Door
```

## How does session affinity (sticky sessions) work?

**Cookie-based affinity** — gateway sets cookie; subsequent requests route to same backend.

| Service | Affinity |
|---------|----------|
| **Application Gateway** | Enabled per backend pool — `ApplicationGatewayAffinity` cookie |
| **Load Balancer** | **Source IP affinity** (5-tuple hash) — not cookie |
| **App Service** | ARR affinity cookie (built-in) |

Use when app stores **session state in memory** on one server. **Better approach:** externalize session to **Redis** and disable affinity for true scale-out.

## How do you configure a Load Balancer with VMSS?

```text
Internet → Public IP → Load Balancer (frontend :443)
                              ↓
                         Backend pool ← VMSS instances (NICs auto-registered)
                              ↓
                         Health probe : GET /health
```

```bash
az vmss create --resource-group rg-prod --name vmss-web \
  --image Ubuntu2204 --instance-count 3 \
  --lb lb-web --vnet-name vnet-prod --subnet subnet-web \
  --health-probe lb-webhttp-probe \
  --upgrade-policy-mode automatic
```

VMSS automatically adds/removes instances from LB pool on scale events.

## When does App Service need an external load balancer?

**App Service includes internal load balancing** when you scale to multiple instances — you don't add LB for basic scale-out.

**Add Application Gateway / Front Door when:**

- WAF protection required
- Route traffic across **App Service + non-App-Service** backends
- Central SSL cert on custom domain with advanced policies
- Path-based routing across multiple apps
- Private ingress with public WAF edge (App Gateway in VNet + private endpoint to App Service)

**ACI / raw VMs** always need explicit LB/AGW for multi-instance HTTP traffic distribution.

## Related Topics

- **Azure Networking.md** — VNet, NSG, peering
- **Azure Compute.md** — VMSS, App Service, AKS
- **Azure API Management and Gateways.md** — APIM vs App Gateway
- **Certificates/Certificates.md** — SSL cert management
