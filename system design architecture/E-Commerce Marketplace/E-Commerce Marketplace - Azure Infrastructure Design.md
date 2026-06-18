# E-Commerce Marketplace — Azure Infrastructure Design

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-ECOM-004 |
| **Version** | 1.0 |
| **Parent** | ARCH-ECOM-001 |
| **Audience** | Cloud architects, DevOps, platform engineers, security |

---

## Executive summary

This document maps the marketplace logical architecture to **deployable Azure resources** in India regions (Central India, South India). The infrastructure is optimized for two distinct load profiles:

1. **Steady-state** — high read volume (search, PDP), moderate checkout writes
2. **Sale events** — extreme read spikes + checkout bursts requiring pre-warmed CDN, Redis, and checkout queue capacity

Estimated production footprint per region: AKS cluster (10–120 nodes autoscale), Azure AI Search (S1–S3 scale units or partitioned), Redis Premium cluster (10+ GB), Cosmos DB (100K+ RU autoscale), Event Hubs (20–60 TU during sales).

---

## 1. Subscription and landing zone

| Subscription | Purpose |
|--------------|---------|
| `sub-ecom-prod` | Production workloads |
| `sub-ecom-nonprod` | Dev, staging, load test |
| `sub-ecom-shared` | Front Door, DNS, global CDN config |
| `sub-ecom-security` | Key Vault prod, Defender, Sentinel |

### Resource groups (per region)

```text
rg-ecom-network-{region}       VNet, NSGs, private DNS
rg-ecom-aks-{region}           AKS, ingress
rg-ecom-data-{region}          Cosmos, SQL, Redis, AI Search
rg-ecom-edge-{region}          APIM instance
rg-ecom-observability-{region} Log Analytics, App Insights
```

---

## 2. Network architecture

Hub-spoke topology with **private endpoints** for all data services. AKS pods have no direct internet egress except via Azure Firewall allowlist (PSP, carriers, SMS).

| Subnet | Purpose |
|--------|---------|
| `snet-aks` | AKS node pools |
| `snet-data` | Private endpoints Cosmos, SQL, Redis |
| `snet-apim` | APIM VNet injection |
| `snet-ingress` | Application Gateway / NGINX |

Private DNS zones: `privatelink.documents.azure.com`, `privatelink.database.windows.net`, `privatelink.redis.cache.windows.net`, `privatelink.search.windows.net`, `privatelink.servicebus.windows.net`.

---

## 3. Edge and CDN

### 3.1 Azure Front Door Premium

| Feature | Configuration |
|---------|---------------|
| Routing | Latency to Central India / South India origins |
| WAF | OWASP 3.2, bot protection, geo-filter if required |
| Health probes | `/health/ready` every 30s |
| Rules engine | Sale-event path-based rate limits |

### 3.2 Azure CDN (Microsoft Standard / Premium Verizon)

| Cached content | TTL | Notes |
|----------------|-----|-------|
| PDP API responses | 60s + SWR 30s | Key: `skuId` + pincode region |
| Product images | 7 days | Blob origin; WebP variants |
| Sale landing pages | 5 min | Pre-warmed before event |
| Static JS/CSS | 1 year | Hash in filename |

```text
shop.example.com        → Front Door → CDN → Shopper BFF (origin)
cdn-images.example.com  → CDN → Blob Storage
api.example.com         → Front Door → APIM
```

### 3.3 API Management

| Product | Rate limit (steady) | Sale-event limit |
|---------|---------------------|------------------|
| Shopper API | 120 req/min/user | 30 req/min/user (non-checkout) |
| Checkout place | 10 req/min/user | Token required (FL-012) |
| Seller API | 300 req/min/seller | unchanged |
| Search | 60 req/min/user | 120 req/min/user |

```xml
<inbound>
  <validate-jwt header-name="Authorization" failed-validation-httpcode="401" />
  <rate-limit-by-key calls="120" renewal-period="60"
    counter-key="@(context.Request.Headers.GetValueOrDefault("X-Customer-Id",""))" />
  <choose>
    <when condition="@(context.Request.Url.Path.Contains("checkout/place"))">
      <check-header name="X-Checkout-Token" failed-check-httpcode="429" />
    </when>
  </choose>
</inbound>
```

---

## 4. Compute — AKS

### 4.1 Cluster (per region, production)

| Component | Specification |
|-----------|---------------|
| K8s version | N-1 stable |
| System pool | 3 × Standard_D4s_v5 (zone spread) |
| General pool | Autoscale 10–60 × Standard_D8s_v5 |
| Search enricher pool | 4–20 × Standard_D4s_v5 (CPU) |
| Checkout pool | 6–40 × Standard_D8s_v5 (isolated — bulkhead) |

### 4.2 Namespaces

```text
shopper-bff          HPA on RPS
seller-bff
core-services        catalog, order, cart, pricing
checkout             orchestrator, payment (isolated)
search               query API + indexer workers
inventory            high-write Redis clients
workers              notifications, outbox relay, catalog batch
platform             ingress, cert-manager, otel
```

### 4.3 Sale-event pre-scale

Scheduled scale-up **T-4 hours** before sale:

- AKS checkout pool minimum → 30 nodes
- Redis cluster scale alert review
- AI Search replica count +1
- CDN purge + pre-warm script on top 10K SKUs
- APIM unit scale-out

---

## 5. Data services

### 5.0 Selection rationale

| Service | Workload | Why |
|---------|----------|-----|
| Azure AI Search | 50M SKU search | Managed indexing, semantic rank, sharding |
| Cosmos DB | Orders, catalog | Flexible schema, India regions |
| Azure SQL Hyperscale | Payments, inventory audit | ACID ledger |
| Redis Premium | Cart, stock counters, checkout session | Atomic DECRBY, sub-ms |
| Event Hubs | Clickstream | Millions events/sec sale peak |
| Service Bus Premium | Order/catalog events | DLQ, transactions |
| Blob + CDN | Product images | Cost-effective media |

### 5.1 Azure AI Search

| Setting | Value |
|---------|-------|
| Tier | Standard S3+ or multiple partitions |
| Indexes | `products` (50M docs), `suggest` (autocomplete) |
| Replicas | 3+ for HA; 6+ during sales |
| Indexers | From Service Bus catalog-events |

### 5.2 Cosmos DB

| Container | PK | Autoscale max RU |
|-----------|-----|------------------|
| `orders` | `/customerId` | 100,000 |
| `catalog` | `/sellerId` | 50,000 |
| `returns` | `/customerId` | 10,000 |

### 5.3 Redis Premium

| Use | Key pattern | Memory est. |
|-----|-------------|-------------|
| Cart | `cart:{customerId}` | 2 GB |
| Stock counters | `stock:{sku}:{wh}` | 4 GB |
| Reservations | `reservation:{checkoutId}:*` | 1 GB |
| PDP cache | `pdp:{sku}:{pin}` | 3 GB |
| Idempotency | `idem:{key}` | 500 MB |

Cluster mode enabled; zone redundant.

### 5.4 Event Hubs

| Hub | Partitions | TU (sale peak) |
|-----|------------|----------------|
| `clickstream` | 64 | 40–60 |
| `catalog-ingest` | 16 | 4–10 |

### 5.5 Service Bus Premium

Topics: `order-events`, `catalog-events`, `inventory-events`. Geo-DR paired namespace.

---

## 6. Identity and secrets

- **Entra External ID (B2C)** — shopper/seller login, social OAuth
- **Workload Identity** — AKS pods → Key Vault, Cosmos, Service Bus
- **Key Vault secrets** — PSP keys, carrier API keys, AI Search admin key

---

## 7. Multi-region and DR

| Component | Strategy | RTO |
|-----------|----------|-----|
| Front Door | Auto failover origins | < 2 min |
| CDN | Global PoPs (automatic) | N/A |
| Cosmos DB | Multi-region write or failover | < 15 min |
| Azure SQL | Failover group | < 15 min |
| AI Search | Secondary region index rebuild | < 1 hour |
| Redis | Per-region; no cross-region | < 5 min intra-zone |

**Data residency:** Customer PII and orders remain in India Azure regions.

---

## 8. CI/CD

```text
PR → build, test, container scan
  → deploy staging
  → integration tests (FL-005 through FL-008)
  → load test gate (optional for sale branches)
  → canary 5% → 50% → 100%
```

Sale branches require manual approval + pre-scale checklist sign-off.

---

## 9. Cost drivers

| Rank | Service | Driver |
|------|---------|--------|
| 1 | CDN egress | Sale PDP traffic |
| 2 | Azure AI Search | Replica count × index size |
| 3 | AKS | Sale node hours |
| 4 | Redis | Memory for stock counters |
| 5 | Cosmos RU | Order write rate |
| 6 | Event Hubs | Clickstream volume |

**Optimization:** CDN cache hit ratio >90% on PDP; search replica scale-down off-peak; Cosmos autoscale floor tuning.

---

## 10. Related documents

| ID | Title |
|----|-------|
| ARCH-ECOM-001 | Architecture Design Document |
| ARCH-ECOM-002 | Services and Data Architecture |
| ARCH-ECOM-003 | Request Lifecycle and Integration Flows |
| ARCH-ECOM-005 | Reliability, Operations, and Observability |
