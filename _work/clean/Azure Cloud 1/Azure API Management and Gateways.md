# Azure API Management and Gateways

## Questions Covered

1. What is Azure API Management (APIM)?
2. What problems does APIM solve?
3. What are APIM policies, and how do they work?
4. What is the APIM developer portal?
5. How does APIM compare to Azure Application Gateway?
6. How does APIM compare to Ocelot (.NET API gateway)?
7. When would you use APIM + Application Gateway together?
8. How do you secure APIs with APIM and Entra ID?
9. What are APIM tiers and scaling options?
10. What is API versioning in APIM?
11. How does APIM integrate with Azure Functions and App Service?
12. What is self-hosted APIM gateway?

## What is Azure API Management (APIM)?

**Azure API Management** is a fully managed **API gateway** for publishing, securing, transforming, monitoring, and monetizing APIs.

```text
Clients → APIM Gateway → Backend APIs (App Service, Functions, AKS, on-prem)
              │
              ├── Authentication / rate limiting
              ├── Request/response transformation
              ├── Caching
              └── Analytics + developer portal
```

**Core components:**

| Component | Role |
|-----------|------|
| **Gateway** | Data plane — handles all API traffic |
| **Management plane** | Configure APIs, policies, products |
| **Developer portal** | API discovery, docs, subscription keys |
| **Publisher portal** | Admin UI (being merged into Azure Portal) |

## What problems does APIM solve?

| Problem | APIM solution |
|---------|---------------|
| **Expose internal APIs safely** | Single public endpoint; hide backend URLs |
| **Authentication centralization** | JWT validation, OAuth, subscription keys at gateway |
| **Rate limiting / throttling** | Per subscription, per IP, per product |
| **Version management** | `/v1`, `/v2` routing to different backends |
| **Legacy modernization** | SOAP → REST transformation policies |
| **Analytics** | Request volume, latency, errors per API |
| **Monetization** | Products + subscription tiers |

```xml
<!-- Rate limit: 100 calls per minute per subscription -->
<rate-limit calls="100" renewal-period="60" />
```

## What are APIM policies, and how do they work?

**Policies** — XML rules applied to API requests/responses in pipeline order:

```text
Inbound → Backend → Outbound → On-error
```

```xml
<policies>
  <inbound>
    <base />
    <validate-jwt header-name="Authorization" failed-validation-httpcode="401">
      <openid-config url="https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration" />
      <audiences>
        <audience>api://my-api-client-id</audience>
      </audiences>
    </validate-jwt>
    <rate-limit calls="200" renewal-period="60" />
    <set-backend-service base-url="https://myapi.azurewebsites.net" />
  </inbound>
  <backend><base /></backend>
  <outbound>
    <base />
    <set-header name="X-Api-Version" exists-action="override">
      <value>1.0</value>
    </set-header>
  </outbound>
  <on-error><base /></on-error>
</policies>
```

**Common policies:** `cors`, `cache-lookup`, `rewrite-uri`, `set-body`, `choose`, `retry`, `circuit-breaker`.

Policies apply at: **global → product → API → operation** scope (most specific wins).

## What is the APIM developer portal?

**Developer portal** — customizable website where API consumers:

- Browse API catalog and documentation (OpenAPI import)
- Subscribe to **products** (grouped APIs)
- Obtain **subscription keys** (header `Ocp-Apim-Subscription-Key`)
- Test APIs interactively

```text
Product: "Partner API"
  ├── APIs: Orders, Inventory
  ├── Subscription required: Yes
  └── Rate limit: 1000/day
```

External developers get keys without accessing your backend directly.

## How does APIM compare to Azure Application Gateway?

| Aspect | APIM | Application Gateway |
|--------|------|---------------------|
| **Primary role** | API gateway (management, dev portal) | Web traffic load balancer + WAF |
| **Layer** | L7 — API-focused | L7 — HTTP/S routing |
| **Auth** | JWT, OAuth, subscription keys, IP filters | WAF rules; not API auth |
| **Transformation** | Request/response body/header rewrite | URL rewrite, redirect |
| **Developer portal** | Yes | No |
| **WAF** | Basic (tier-dependent); often paired with App Gateway/Front Door | Full WAF v2 |

```text
APIM          = "Manage and secure APIs"
App Gateway   = "Load balance and protect web apps"
```

**Not interchangeable** — complementary in enterprise architectures.

## How does APIM compare to Ocelot (.NET API gateway)?

| Aspect | APIM | Ocelot |
|--------|------|--------|
| **Hosting** | Azure managed PaaS | Self-hosted NuGet in your ASP.NET Core app |
| **Cost** | Per-unit pricing | Free (your infra cost) |
| **Developer portal** | Built-in | None (build yourself) |
| **Policies** | Rich XML policy engine | JSON config, middleware |
| **Ops burden** | Low | You manage scaling, HA, patches |
| **Best for** | Enterprise API programs | .NET microservices, on-prem, budget-constrained |

```csharp
// Ocelot — Program.cs (minimal)
builder.Configuration.AddJsonFile("ocelot.json");
builder.Services.AddOcelot();
var app = builder.Build();
await app.UseOcelot();
```

**Interview answer:** With APIM, you **don't need Ocelot** unless you require on-prem, multi-cloud without Azure, or want gateway embedded in your app process. Using both APIM **and** Ocelot is redundant unless Ocelot is internal between microservices and APIM is the public edge.

## When would you use APIM + Application Gateway together?

```text
Internet → Application Gateway (WAF, DDoS, SSL)
              ↓
           APIM (API auth, rate limit, versioning)
              ↓
           Backend APIs
```

| Layer | Responsibility |
|-------|----------------|
| **Front Door / App Gateway** | Edge security, SSL, geo routing, WAF |
| **APIM** | API policies, developer experience, analytics |
| **Backend** | Business logic |

Use when security team requires **WAF at edge** and platform team requires **API management** features APIM provides.

## How do you secure APIs with APIM and Entra ID?

```xml
<validate-jwt header-name="Authorization" failed-validation-httpcode="401">
  <openid-config url="https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration" />
  <audiences><audience>api://backend-api-id</audience></audiences>
  <required-claims>
    <claim name="scp" match="any"><value>access_as_user</value></claim>
  </required-claims>
</validate-jwt>
```

| Pattern | Detail |
|---------|--------|
| **JWT validation at APIM** | Offload auth from backend |
| **Pass-through token** | APIM validates, forwards token to backend |
| **Client credentials** | Service-to-service via Entra app registration |
| **Subscription key + JWT** | Double gate for partner APIs |

**Managed identity:** APIM can authenticate to backend App Service using **authentication-managed-identity** policy — no backend API keys.

## What are APIM tiers and scaling options?

| Tier | Use case |
|------|----------|
| **Consumption** | Serverless, dev, variable traffic — per-call pricing |
| **Developer** | Eval only — not for production |
| **Basic / Standard** | Production, SLA, VNet support (Standard) |
| **Premium** | Multi-region, VNet, self-hosted gateway, high scale |

```bash
az apim create --resource-group rg-prod --name apim-prod \
  --publisher-name Contoso --publisher-email admin@contoso.com \
  --sku-name Premium --location eastus
```

**Scale:** Premium supports multi-region deployment; add **units** for throughput (capacity).

## What is API versioning in APIM?

| Strategy | Implementation |
|----------|----------------|
| **URL path** | `/v1/orders`, `/v2/orders` |
| **Query string** | `/orders?api-version=2` |
| **Header** | `Api-Version: 2` |
| **Separate APIs** | `orders-v1`, `orders-v2` in APIM |

```xml
<choose>
  <when condition="@(context.Request.Headers.GetValueOrDefault("Api-Version") == "2")">
    <set-backend-service base-url="https://myapi-v2.azurewebsites.net" />
  </when>
  <otherwise>
    <set-backend-service base-url="https://myapi-v1.azurewebsites.net" />
  </otherwise>
</choose>
```

Import **OpenAPI** specs per version; deprecate old versions with sunset headers.

## How does APIM integrate with Azure Functions and App Service?

```bash
# Import App Service API into APIM
az apim api import --resource-group rg-prod --service-name apim-prod \
  --api-id orders-api --path orders \
  --specification-format OpenApiJson \
  --specification-url https://myapi.azurewebsites.net/swagger/v1/swagger.json

# Functions — HTTP trigger behind APIM
# Set function auth level to anonymous or function key validated at APIM
```

```xml
<!-- Route to Function App -->
<set-backend-service base-url="https://myfunc.azurewebsites.net/api" />
<set-query-parameter name="code" exists-action="override">
  <value>{{function-key-from-named-value}}</value>
</set-query-parameter>
```

Better: use **managed identity** from APIM to Function App — no function keys in policies.

## What is self-hosted APIM gateway?

**Self-hosted gateway** (Premium tier) — run APIM gateway **on-prem or other clouds**; management stays in Azure.

```text
Azure APIM (management) ──config──► Self-hosted gateway (on-prem K8s/VM)
                                         ↓
                                    Internal APIs
```

Use for: hybrid scenarios, data residency (traffic stays on-prem), low-latency to local backends.

## Related Topics

- **Azure Application Gateway and Load Balancer.md** — L7 load balancing vs API gateway
- **Azure Identity and Entra ID.md** — JWT, app registrations
- **Azure Compute.md** — App Service, Functions as backends
- **Important Concepts/Interview Comparisons.md** — gateway comparisons
