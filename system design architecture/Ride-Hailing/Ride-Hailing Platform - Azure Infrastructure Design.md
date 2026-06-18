# Ride-Hailing Platform — Azure Infrastructure Design

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-RHP-004 |
| **Version** | 1.0 |
| **Parent** | ARCH-RHP-001 |
| **Audience** | Cloud architects, DevOps, platform engineers, security |

---

## Executive summary

This document translates the logical architecture (ARCH-RHP-001) into **deployable Azure resources**. It follows the Azure Well-Architected Framework across reliability, security, cost, and operational excellence pillars.

Key infrastructure decisions:

- **Hub-spoke networking** with private endpoints — no data plane traffic on public internet
- **Regional AKS clusters** as the unit of scale and failure isolation
- **Managed services over self-hosted** for Redis, messaging, and real-time (SignalR, Event Hubs, Service Bus)
- **Front Door + APIM** as the only public ingress points

Estimated production footprint per large region: one AKS cluster (6–80 nodes autoscale), Redis Premium cluster, Cosmos account regional replica, Event Hubs 10–40 TU, Service Bus Premium namespace.

---

## 1. Purpose

This document defines the **physical and logical Azure deployment** for the ride-hailing platform: networking, compute, data services, identity integration, security controls, and multi-region strategy.

---

## 2. Subscription and landing zone layout

### 2.1 Subscription topology

| Subscription | Purpose |
|--------------|---------|
| `sub-platform-prod` | Production workloads |
| `sub-platform-nonprod` | Dev, test, staging |
| `sub-platform-shared` | DNS, Front Door (optional central), monitoring |
| `sub-platform-security` | Key Vault (prod), Defender, Sentinel |

### 2.2 Resource group structure (per region)

```text
rg-rhp-network-{region}      VNet, NSGs, private DNS zones
rg-rhp-aks-{region}          AKS cluster, node pools
rg-rhp-data-{region}         Cosmos, Redis, Event Hubs, Service Bus
rg-rhp-edge-{region}         Regional APIM (if multi-instance)
rg-rhp-observability-{region} Log Analytics, App Insights
```

Resource groups enforce **blast radius boundaries**. Deleting `rg-rhp-aks-{region}` must not touch data in `rg-rhp-data-{region}`. IAM assignments are scoped to resource group where possible.

---

## 2.1 Environment separation

| Environment | Subscription | Purpose | Data classification |
|-------------|--------------|---------|---------------------|
| Production | `sub-platform-prod` | Live traffic | Customer PII, payment tokens |
| Staging | `sub-platform-nonprod` | Pre-prod integration tests | Synthetic + anonymized snapshots |
| Development | `sub-platform-nonprod` | Feature development | Fake data only |

Production secrets live in `sub-platform-security` Key Vault. Non-prod uses separate vaults with no network path to production data.

---

## 3. Network architecture

Network design prioritizes **zero trust**: workloads assume breach; lateral movement is restricted by NSGs, network policies, and private endpoints.

### 3.1 Hub-spoke topology

```text
                    ┌─────────────────────┐
                    │   Hub VNet          │
                    │   Azure Firewall    │
                    │   VPN / ExpressRoute│
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Spoke (US-East)  Spoke (EU-West)  Spoke (APAC)
        AKS + Data       AKS + Data        AKS + Data
```

### 3.2 AKS network design

| Setting | Value |
|---------|-------|
| CNI | Azure CNI (or Cilium for advanced policies) |
| Ingress | NGINX Ingress Controller or AKS App Routing |
| Internal LB | Services exposed cluster-internal only |
| Pod identity | Workload Identity (Managed Identity per service) |
| Network policies | Deny all; allowlist per namespace |

### 3.3 Private endpoints

All data plane services accessed via **private endpoints** — no public internet exposure:

| Service | Private endpoint subnet |
|---------|------------------------|
| Cosmos DB | `snet-data` |
| Azure SQL | `snet-data` |
| Redis | `snet-data` |
| Event Hubs | `snet-messaging` |
| Service Bus | `snet-messaging` |
| Key Vault | `snet-security` |
| Blob Storage | `snet-data` |

### 3.4 DNS

Private DNS zones linked to hub/spoke VNets:

- `privatelink.documents.azure.com`
- `privatelink.database.windows.net`
- `privatelink.redis.cache.windows.net`
- `privatelink.servicebus.windows.net`

---

## 4. Edge and API layer

The edge is the **only internet-facing attack surface** for APIs. All DDoS mitigation, bot filtering, and TLS termination happen here before traffic reaches AKS.

### 4.1 Azure Front Door (Premium)

| Feature | Configuration |
|---------|---------------|
| Routing | Latency-based to nearest healthy regional origin |
| WAF | OWASP 3.2 managed rules; bot protection |
| TLS | Managed certificates; TLS 1.2 minimum |
| Health probes | `GET /health/ready` on regional ingress every 30s |
| Caching | Static assets; pricing config (60s TTL) |

```text
rider.app.example.com  → Front Door → origin-group-aks-regions
driver.app.example.com → Front Door → origin-group-aks-regions
api.platform.example.com → Front Door → APIM
```

### 4.2 Azure API Management

| Setting | Value |
|---------|-------|
| Tier | Premium (VNet injection) or Developer (non-prod) |
| Products | `rider-api`, `driver-api`, `admin-api` |
| Policies | JWT validation, rate limit, request size cap |

**Rate limits (production):**

| Product | Limit |
|---------|-------|
| Rider API | 60 requests/minute per subscription key (user) |
| Driver location batch | 30 requests/minute per driver |
| Admin API | IP allowlist + 100 req/min |

APIM policy fragment (JWT validation):

```xml
<inbound>
  <validate-jwt header-name="Authorization" failed-validation-httpcode="401">
    <openid-config url="https://login.microsoftonline.com/{tenant}/v2.0/.well-known/openid-configuration" />
    <audiences>
      <audience>api://ride-platform</audience>
    </audiences>
  </validate-jwt>
  <rate-limit-by-key calls="60" renewal-period="60"
    counter-key="@(context.Request.Headers.GetValueOrDefault("X-User-Id",""))" />
</inbound>
```

---

## 5. Compute — AKS

AKS hosts all domain microservices and BFFs. **Node pool separation** isolates location ingest (CPU/network heavy) from payment service (latency-sensitive, fewer replicas).

### 5.1 Cluster specification (per region, production)

| Component | Specification |
|-----------|---------------|
| Kubernetes version | N-1 stable (e.g. 1.29) |
| System node pool | 3 × Standard_D4s_v5 (zone spread) |
| User node pool — core | Autoscale 6–80 × Standard_D8s_v5 |
| User node pool — location | Autoscale 10–100 × Standard_D8s_v5 (CPU-optimized) |
| ACR | `acrrhpprod.azurecr.io` — geo-replicated |

### 5.2 Namespace layout

```text
namespace: rider-bff          (2–20 pods, HPA on RPS)
namespace: driver-bff         (2–20 pods)
namespace: core-services      (trip, matching, pricing, payment)
namespace: location          (ingest API + stream processor)
namespace: workers           (notification, outbox relay, payout batch)
namespace: platform          (ingress, cert-manager, otel-collector)
```

### 5.3 Deployment standards

| Standard | Requirement |
|----------|-------------|
| Replicas (critical) | Minimum 3 per region |
| Rolling update | `maxUnavailable: 0`, `maxSurge: 25%` |
| Probes | `liveness` + `readiness` on all services |
| Resources | Requests and limits defined; no BestEffort in prod |
| PDB | `minAvailable: 2` for trip, matching, location ingest |
| Image tags | Immutable semver; no `latest` in prod |

### 5.4 Autoscaling rules

| Service | HPA metric | Scale trigger |
|---------|------------|---------------|
| Location ingest | CPU + custom (Event Hubs lag) | Lag > 10s |
| Matching | Service Bus `ActiveMessages` | > 100 per instance |
| Rider BFF | HTTP requests/sec | > 500 per pod |
| Trip Service | CPU | > 70% |

**Cluster autoscaler:** Node pool scales when pods are unschedulable for 30s.

---

## 6. Data services

Each data service was selected for a specific workload characteristic. The table below includes **why this Azure service** — not just what is deployed.

### 6.0 Service selection rationale

| Azure service | Workload fit | Why not alternative |
|---------------|--------------|---------------------|
| Cosmos DB | Trip documents, profiles | SQL would struggle with write scale + flexible schema per region |
| Azure SQL Hyperscale | Payment ledger | Cosmos lacks cross-document ACID needed for ledger |
| Redis Premium | Live geo index | Cosmos/SQL too slow for GEORADIUS at 10ms p99 |
| Event Hubs | Location stream | Service Bus too expensive per event at 170K/sec |
| Service Bus Premium | Domain events, DLQ | Event Grid lacks durable subscription processing patterns |
| SignalR Service | 1M+ WebSocket connections | Self-hosted SignalR does not scale connections elastically |
| Blob Storage | KYC documents, receipts | SQL not appropriate for binary payloads |

### 6.1 Azure Cosmos DB

| Setting | Value |
|---------|-------|
| API | NoSQL |
| Account | Multi-region write (or single write + read replicas) |
| Consistency | Session (default for trip reads) |
| Database | `RidePlatform` |

| Container | Partition key | Autoscale max RU |
|-----------|---------------|------------------|
| `trips` | `/regionId` | 100,000 RU |
| `riders` | `/riderId` | 20,000 RU |
| `drivers` | `/driverId` | 20,000 RU |
| `offers` | `/regionId` | 10,000 RU (TTL enabled) |
| `ratings` | `/tripId` | 5,000 RU |

### 6.2 Azure SQL (Payment)

| Setting | Value |
|---------|-------|
| Tier | Hyperscale |
| Geo-replication | Auto-secondary in paired region |
| Backup | Point-in-time 35 days |
| TDE | Enabled (platform-managed key) |

### 6.3 Azure Cache for Redis

| Setting | Value |
|---------|-------|
| Tier | Premium P4+ (cluster mode) |
| Clustering | Enabled; 3 shards minimum per region |
| Zones | Zone redundant |
| Eviction | `volatile-lru` on cache keys with TTL |

**Memory allocation estimate (per large metro):**

```text
100K online drivers × ~500 bytes metadata ≈ 50 MB
GEO index overhead ≈ 200 MB
Surge + idempotency + trip cache ≈ 500 MB
Headroom 3× → Premium cluster ~4 GB minimum per region
```

### 6.4 Event Hubs

| Hub | Partitions | TU (autoscale) | Retention |
|-----|------------|----------------|-----------|
| `location-updates` | 32 | 10–40 | 7 days |
| `platform-analytics` | 16 | 2–10 | 3 days |

Producer partition key: `hash(driverId)` for even distribution.

### 6.5 Service Bus

| Resource | Configuration |
|----------|---------------|
| Tier | Premium |
| Topic `trip-events` | 5 subscriptions (matching, payment, notification, pricing, analytics) |
| DLQ | Enabled; alert on any message |
| Geo-DR | Paired namespace in secondary region |

### 6.6 Azure SignalR Service

| Setting | Value |
|---------|-------|
| Tier | Standard or Premium (100K+ connections) |
| Mode | Default (serverless optional for low-traffic regions) |
| Upstream | Rider BFF / Driver BFF handle negotiate endpoint |

Connection estimate at peak: 500K active trips × 2 clients (rider + driver) = **1M connections** → scale SignalR units accordingly.

### 6.7 Blob Storage

| Container | Purpose | Access |
|-----------|---------|--------|
| `driver-documents` | KYC uploads | Private + SAS |
| `receipts` | PDF receipts | Private |
| `analytics-raw` | Data lake landing | Private |

---

## 7. Identity and secrets

### 7.1 Entra External ID (B2C)

- Rider and driver sign-up / sign-in flows
- Social identity providers optional
- Issues tokens consumed by APIM JWT policy

### 7.2 Workload identity (AKS → Azure)

| Service account | Managed identity permissions |
|-----------------|---------------------------|
| `trip-service` | Cosmos DB Contributor (trips container) |
| `payment-service` | SQL DB Contributor |
| `location-processor` | Event Hubs Data Owner, Redis Contributor |
| `all-services` | Key Vault Secrets User (read secrets) |

### 7.3 Key Vault secrets

| Secret | Consumers |
|--------|-----------|
| `cosmos-connection` | Trip, Profile services |
| `sql-connection` | Payment Service |
| `redis-connection` | Location, BFF, Pricing |
| `servicebus-connection` | All publishers/consumers |
| `maps-api-key` | Pricing, Location |
| `psp-api-key` | Payment Service |

---

## 8. External integrations

| Integration | Azure exposure | Notes |
|-------------|----------------|-------|
| Azure Maps | HTTPS from AKS via NAT Gateway | Route, matrix, geocode |
| Payment PSP | HTTPS egress via Firewall | Tokenization; no PAN in platform |
| FCM / APNs | HTTPS egress | Push notifications |
| KYC provider | Webhook inbound via APIM | `/webhooks/kyc` IP-restricted |

---

## 9. Multi-region deployment

### 9.1 Active region model

```text
Front Door (global)
  ├── US-East (active) — NYC, Boston metros
  ├── US-West (active) — SF, Seattle metros
  └── EU-West (active) — London, Amsterdam metros
```

Each region is **self-contained** for matching and location. No cross-region Redis GEO calls.

### 9.2 Failover

| Component | Failover mechanism | RTO target |
|-----------|-------------------|------------|
| Front Door | Automatic origin health failover | < 2 min |
| AKS | Redeploy to secondary region (GitOps) | < 30 min |
| Cosmos DB | Automatic regional failover (account config) | < 15 min |
| Azure SQL | Manual / auto failover group | < 15 min |
| Redis | Premium zone failover within region; cross-region = rebuild | < 5 min (intra-region) |

### 9.3 Data residency

Trip and profile data for EU users stored in EU-West Cosmos/SQL instances. Front Door geo-fencing routes EU clients to EU origins.

---

## 10. CI/CD and environments

| Environment | AKS | Data |
|-------------|-----|------|
| **Dev** | Shared cluster, namespace per team | Cosmos serverless; Redis Basic |
| **Staging** | Dedicated cluster; prod-like sizing at 10% | Full service topology |
| **Production** | Regional clusters per §5 | Full specification |

**Deployment pipeline (Azure DevOps / GitHub Actions):**

```text
PR → build + unit tests + container scan
  → deploy to staging
  → integration test suite (FL-002 through FL-007 automated)
  → manual approval
  → canary 5% → 25% → 100% (Flagger / Argo Rollouts)
```

---

## 11. Cost drivers and optimization

| Rank | Service | Driver |
|------|---------|--------|
| 1 | Event Hubs | Location firehose volume |
| 2 | AKS compute | Peak node pool scale |
| 3 | Redis Premium | Memory per region |
| 4 | Cosmos DB RU | Trip write rate |
| 5 | SignalR | Peak concurrent connections |
| 6 | Azure Maps | Matrix API calls per match |
| 7 | Egress | Mobile API payload size |

**Optimization levers:** Client location batching (3s), SignalR throttle, route matrix cache, Cosmos autoscale ceilings, scheduled scale-up before known peaks.

---

## 12. Related documents

| ID | Title |
|----|-------|
| ARCH-RHP-001 | Architecture Design Document |
| ARCH-RHP-002 | Services and Data Architecture |
| ARCH-RHP-003 | Request Lifecycle and Integration Flows |
| ARCH-RHP-005 | Reliability, Operations, and Observability |
