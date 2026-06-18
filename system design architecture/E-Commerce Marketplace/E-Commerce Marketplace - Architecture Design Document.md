# E-Commerce Marketplace — Architecture Design Document

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-ECOM-001 |
| **Version** | 1.0 |
| **Status** | Approved for implementation planning |
| **Classification** | Internal — Engineering |
| **Audience** | Solution architects, platform engineers, service owners, SRE, security, product |
| **Related documents** | ARCH-ECOM-002 (Services & Data), ARCH-ECOM-003 (Request Lifecycle), ARCH-ECOM-004 (Azure Infrastructure), ARCH-ECOM-005 (Reliability & Operations) |

---

## Executive summary

This document defines the **target enterprise architecture** for a large-scale B2C e-commerce marketplace comparable to Flipkart or Amazon India: multi-seller catalog, search-driven discovery, cart and checkout, multi-method payments, warehouse fulfillment, and returns.

Unlike a content site or simple storefront, a marketplace at this scale is a **distributed transaction system** disguised as a shopping experience. The dominant engineering challenges are:

- **Catalog and search at scale** — 50M+ SKUs with sub-200ms search latency
- **Inventory correctness** — no overselling during flash sales when 1M users hit one SKU
- **Checkout sagas** — reserve inventory, charge payment, create order; compensate on any failure
- **Traffic spikes** — sale events (Big Billion Day) drive 10–50× normal load for hours

The architecture addresses these by separating **read-heavy paths** (search, product detail) from **write-critical paths** (inventory reservation, payment, order), using cache-first catalog delivery, event-driven order fulfillment, and regional scale on **Microsoft Azure**.

**Design envelope:** 100M+ registered users, 30M MAU, 5M+ daily orders at peak season, 500K+ browse/search QPS at sale peak, deployed multi-region in India with global CDN edge.

---

## 1. Purpose

This architecture design document establishes the logical structure, quality attributes, service boundaries, and design principles for the marketplace platform. Implementation teams use it to align microservices, data stores, and operational models before build-out.

The platform follows **domain-driven decomposition**: services own business capabilities (orders, inventory, catalog) — not technical layers. Shared databases between teams are explicitly forbidden; integration occurs via APIs and domain events.

---

## 1.1 Stakeholders and concerns

| Stakeholder | Primary concern | Architectural response |
|-------------|-----------------|------------------------|
| **Buyers** | Fast search, accurate stock, reliable checkout | Azure AI Search, inventory reservation, checkout saga |
| **Sellers** | Easy catalog upload, timely settlements | Seller portal BFF, async indexing pipeline |
| **Operations** | Fulfill orders on time, handle sale peaks | WMS integration, pre-warmed scale, load shedding |
| **Finance** | GST-compliant invoicing, auditable payments | Order Service + Payment ledger, immutable transaction log |
| **Legal / compliance** | Data localization, consumer protection | India-region data residency, return policy enforcement |
| **SRE** | Survive sale events without outage | SLOs, cache stampede controls, runbooks (ARCH-ECOM-005) |
| **Security** | Fraud, account takeover, payment abuse | Fraud service, WAF, PCI tokenization, device fingerprinting |

---

## 2. Scope

### 2.1 In scope

- Shopper web and mobile apps (browse, search, cart, checkout, track, return)
- Seller portal (catalog, inventory, orders, settlements)
- Multi-seller marketplace with split carts and consolidated checkout
- Product catalog, search, recommendations integration points
- Inventory reservation and oversell prevention
- Payments: UPI, cards, wallets, COD
- Warehouse pick-pack-ship and last-mile carrier integration
- Returns, refunds, and partial cancellations
- Sale events and flash deals (high-traffic SKU handling)
- Notifications (SMS, email, push, WhatsApp)
- Deployment on **Microsoft Azure** (India regions primary)

### 2.2 Out of scope (referenced only)

- Physical warehouse robotics and conveyor systems
- Detailed UI/UX specifications and A/B test framework
- Seller payment settlement banking integrations (treasury system)
- Private-label manufacturing

---

## 3. Context and constraints

### 3.1 System context

```text
                         ┌──────────────────────────────────────┐
                         │     E-Commerce Marketplace Platform   │
                         │  catalog, search, cart, order, pay   │
                         └───────────────┬──────────────────────┘
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
   Shoppers (web/mobile)         Sellers (portal)              Operations
         │                              │                         (WMS, support)
         ▼                              ▼                              ▼
   External: PSP (Razorpay/PayU),    Carriers (Delhivery,          GST/e-invoice
   UPI networks, CDN, SMS           Blue Dart, etc.)              providers
```

### 3.2 Regulatory and compliance constraints

| Constraint | Architectural implication |
|------------|---------------------------|
| PCI-DSS | Card data tokenized at PSP; platform stores tokens and last-4 only |
| GST / e-invoicing | Order Service generates invoice metadata; tax rules in Pricing Service |
| Data localization | Customer PII and order data in India Azure regions |
| Consumer protection | Return window enforced in Order Service; refund SLA tracked |
| COD reconciliation | Separate payment state machine branch; carrier cash collection confirmation |

### 3.3 Technical constraints

- Cloud: **Azure** (Central India, South India regions)
- Microservices on **AKS** with managed Azure data services
- Search: **Azure AI Search** (or OpenSearch on AKS at hyperscale)
- Sale events require pre-planned capacity; autoscale alone is insufficient

---

## 4. Business capabilities

| Capability | Description | Primary owning services |
|------------|-------------|-------------------------|
| **Identity & profiles** | Auth, addresses, preferences | Identity, Customer Profile |
| **Catalog** | SKU master, attributes, media | Product Catalog |
| **Search & discovery** | Full-text, facets, autocomplete | Search Service |
| **Inventory** | Stock levels, reservation, deduction | Inventory Service |
| **Cart** | Session cart, merge on login | Cart Service |
| **Pricing & promotions** | MRP, discounts, coupons, sales | Pricing & Promotions |
| **Checkout** | Orchestrate validation and placement | Checkout Orchestrator |
| **Orders** | Order lifecycle, split by seller | Order Service |
| **Payments** | Charge, refund, COD tracking | Payment Service |
| **Fulfillment** | Warehouse allocation, pick list | Fulfillment Service |
| **Shipping** | Carrier booking, tracking | Shipping Service |
| **Returns** | RMA, pickup, refund trigger | Returns Service |
| **Seller management** | Onboarding, KYC, catalog rights | Seller Service |
| **Reviews** | Product ratings, moderation | Review Service |
| **Notifications** | Order updates, marketing (consent) | Notification Service |
| **Fraud & risk** | Checkout scoring, velocity limits | Fraud Service |

Capabilities are **loosely coupled**. Inventory Service does not create orders; Checkout Orchestrator requests reservation. Payment Service never mutates order line items — it reacts to `OrderPlaced` events.

---

## 5. Architecture principles

| # | Principle | Rationale |
|---|-----------|-----------|
| P1 | **Domain-owned data** | Each service owns its datastore; no shared tables |
| P2 | **Order as aggregate root** | Order Service owns post-checkout lifecycle |
| P3 | **Cache-first catalog reads** | CDN + Redis for PDP; origin hit only on cache miss |
| P4 | **Reserve before charge** | Inventory soft-lock during checkout; hard deduct on payment success |
| P5 | **Idempotent checkout** | `checkoutId` + idempotency key prevents duplicate orders |
| P6 | **Async after order placed** | Fulfillment, notifications, search index updates do not block confirmation page |
| P7 | **Sale-event isolation** | Flash SKU traffic isolated via CDN, queue, or token bucket |
| P8 | **Observable by design** | `orderId`, `checkoutId`, `customerId` on every log and trace |

Principles P4 and P5 together prevent the most expensive marketplace failure: **charging a customer for stock that does not exist**.

---

## 6. Quality attributes (non-functional requirements)

### 6.1 Availability and reliability

| Attribute | Target | Measurement |
|-----------|--------|-------------|
| Search API availability | 99.95% monthly | Excludes planned maintenance |
| Product detail (PDP) availability | 99.95% | CDN + origin |
| Checkout completion (started → order placed) | 99.9% | Excludes user abandonment |
| Payment success (authorized methods) | 99.95% | After retries |
| Order record durability | 99.99% | No lost placed orders |

### 6.2 Performance

| Path | p50 | p99 |
|------|-----|-----|
| Search autocomplete | 50 ms | 150 ms |
| Search results page | 100 ms | 200 ms |
| Product detail page (PDP) | 80 ms | 300 ms |
| Add to cart | 50 ms | 150 ms |
| Checkout page load | 300 ms | 800 ms |
| Place order (sync portion) | 500 ms | 2 s |

### 6.3 Scalability targets (design envelope)

| Metric | Value |
|--------|-------|
| Registered users | 100M+ |
| Monthly active users | 30M |
| Catalog SKUs | 50M+ |
| Daily orders (baseline) | 500K |
| Daily orders (peak season) | 5M+ |
| Peak browse/search QPS | 500K+ (global edge) |
| Peak checkout rate | 50K orders/hour |
| Flash sale SKU traffic | 1M users in 5 minutes on single PDP |

#### Capacity derivation notes

**500K search QPS** at sale peak assumes 10M concurrent users × 0.05 searches/second average, concentrated on sale landing pages. CDN serves 80–90% of PDP traffic; origin sees 50K–100K QPS.

**50K orders/hour** peak checkout ≈ 14 orders/second globally — modest for write path but each order triggers inventory deduction, payment, fulfillment message, and 3–5 notifications. Write amplification factor is ~20× order rate.

**50M SKUs** in search index at ~5 KB average indexed document ≈ 250 GB index size — requires sharded Azure AI Search or partitioned OpenSearch cluster.

### 6.4 Consistency model

| Domain | Consistency | Notes |
|--------|-------------|-------|
| Inventory reservation | Strong per SKU-warehouse | Optimistic locking or Redis atomic decrement |
| Order placement | Strong per `orderId` | Single writer in Order Service |
| Payment ledger | Strong / ACID | Azure SQL |
| Search index | Eventual | Seconds to minutes after catalog change |
| Cart | Session-strong | Redis with TTL; merge on login |
| Recommendations | Eventual | Hours acceptable |

---

## 7. Logical architecture

### 7.1 Layered view

```text
┌────────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER                                                            │
│   Shopper App (Web/iOS/Android)   Seller Portal   Admin Console        │
└───────────────────────────────┬────────────────────────────────────────┘
                                │ HTTPS
┌───────────────────────────────▼────────────────────────────────────────┐
│ EDGE LAYER                                                              │
│   Azure Front Door + CDN + WAF                                          │
│   Azure API Management (auth, rate limit, sale-event policies)          │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│ EXPERIENCE LAYER (BFF)                                                  │
│   Shopper BFF    Seller BFF    Admin BFF                                 │
└───────────────────────────────┬────────────────────────────────────────┘
                                │
┌───────────────────────────────▼────────────────────────────────────────┐
│ DOMAIN SERVICES (AKS)                                                   │
│ Catalog │ Search │ Cart │ Checkout │ Order │ Inventory │ Payment │ ... │
└───────┬───────────────────────────────────────┬────────────────────────┘
        │                                       │
┌───────▼───────────────┐           ┌───────────▼────────────────────────┐
│ DATA PLANE            │           │ MESSAGING & STREAMING               │
│ Cosmos, SQL, Redis      │           │ Service Bus, Event Hubs, AI Search  │
│ Blob (images)         │           │                                     │
└───────────────────────┘           └─────────────────────────────────────┘
        │
┌───────▼────────────────────────────────────────────────────────────────┐
│ EXTERNAL: PSP, UPI, carriers, SMS, GST provider, Fraud vendors         │
└────────────────────────────────────────────────────────────────────────┘
```

#### Layer responsibilities

**Edge layer** — TLS termination, WAF, CDN caching of PDP and static assets. Sale-event request shaping (queue tokens, rate limits) applied here before origin overload.

**BFF layer** — Aggregates catalog + inventory + price for PDP in one response. Checkout BFF orchestrates synchronous saga steps with timeouts.

**Domain services** — Own business rules and data. No cross-database joins.

### 7.2 Regional topology

```text
Primary: Azure Central India + South India (active-active for read paths)
DR: Paired region failover for order/payment data
CDN: Global PoPs; India edge caches hot PDP and sale landing pages
```

Order and payment data remain in India regions for compliance. CDN serves cacheable content worldwide for NRI shoppers if product scope expands.

### 7.3 Communication patterns

| Pattern | Usage |
|---------|-------|
| **Sync REST** | PDP aggregation, checkout steps, inventory check |
| **Service Bus topics** | `order-events`, `catalog-events`, `inventory-events` |
| **Event Hubs** | Clickstream, analytics, recommendation features |
| **Transactional outbox** | Order placed + event publish atomicity |
| **CQRS** | Catalog writes → async search index update |

---

## 8. Order lifecycle (state machine summary)

```text
CREATED → PAYMENT_PENDING → PAID → FULFILLMENT_PENDING → PICKED → PACKED
    → SHIPPED → OUT_FOR_DELIVERY → DELIVERED

Branches:
  PAYMENT_PENDING → PAYMENT_FAILED → (retry) or CANCELLED
  Any pre-ship → CANCELLED (customer or seller)
  DELIVERED → RETURN_REQUESTED → RETURNED → REFUNDED
```

Full transition rules and compensating actions: **ARCH-ECOM-003**.

---

## 9. Architecture decision records

| ADR | Decision | Alternatives | Outcome |
|-----|----------|--------------|---------|
| ADR-001 | Microservices on AKS | Monolith, Container Apps only | AKS for sale-event scale, HPA |
| ADR-002 | Azure AI Search for catalog search | Elasticsearch self-hosted, SQL full-text | Managed ops; sharding at scale |
| ADR-003 | Redis for cart and inventory hot counters | DB-only cart | Sub-ms cart; atomic stock decrement |
| ADR-004 | Cosmos DB for order documents | SQL only | Flexible order schema; geo-replication |
| ADR-005 | Azure SQL for payment ledger | Cosmos | ACID transactions required |
| ADR-006 | Checkout saga with inventory reservation | Two-phase order without reserve | Prevents oversell |
| ADR-007 | CDN-first PDP | Origin on every PDP hit | Sale traffic survivability |
| ADR-008 | Service Bus for order events | Event Grid only | DLQ, sessions, retry |
| ADR-009 | Token queue for flash SKU checkout | Open checkout to all | Prevents checkout stampede |
| ADR-010 | Split order per seller | Single order multi-seller fulfillment | Simpler seller SLA and settlement |

---

## 10. Security architecture (summary)

| Layer | Control |
|-------|---------|
| Edge | WAF, bot management, DDoS Protection |
| API | JWT at APIM; per-user and per-IP rate limits |
| Payment | PCI scope reduction via PSP hosted fields / tokenization |
| Data | Encryption at rest; private endpoints; India residency |
| Fraud | Real-time checkout scoring; velocity limits on new accounts |

Full network and identity design: **ARCH-ECOM-004**.

---

## 11. Evolution roadmap

| Phase | Capability | Architecture |
|-------|------------|--------------|
| **Phase 0 — MVP** | Single seller, card pay, one warehouse | Modular monolith; PostgreSQL + Redis |
| **Phase 1 — Marketplace** | Multi-seller, search, returns | Extract Catalog, Search, Order, Inventory |
| **Phase 2 — Scale** | Sale events, UPI, multi-warehouse | Full microservices; CDN; checkout queue |
| **Phase 3 — Hyperscale** | 50M SKUs, 5M orders/day | Sharded search; regional inventory cells |

---

## 12. Document index

| ID | Title |
|----|-------|
| ARCH-ECOM-001 | Architecture Design Document (this document) |
| ARCH-ECOM-002 | Services and Data Architecture |
| ARCH-ECOM-003 | Request Lifecycle and Integration Flows |
| ARCH-ECOM-004 | Azure Infrastructure Design |
| ARCH-ECOM-005 | Reliability, Operations, and Observability |

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **PDP** | Product Detail Page |
| **SKU** | Stock Keeping Unit — sellable product variant |
| **Soft reservation** | Temporary inventory hold during checkout (TTL 15 min) |
| **Hard deduction** | Permanent stock reduction on successful payment |
| **Split order** | Parent checkout splits into per-seller child orders |
| **Saga** | Distributed transaction with compensating steps |
| **Sale event** | Time-boxed promotion with extreme traffic (e.g. Big Billion Day) |
| **Serviceability** | Whether a SKU can be delivered to a pincode |
