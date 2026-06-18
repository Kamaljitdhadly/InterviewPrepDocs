# E-Commerce Marketplace — Services and Data Architecture

| Field | Value |
|-------|-------|
| **Document ID** | ARCH-ECOM-002 |
| **Version** | 1.0 |
| **Parent** | ARCH-ECOM-001 |
| **Audience** | Service owners, backend engineers, data engineers |

---

## Executive summary

This document specifies **microservice boundaries**, **API contracts**, **data ownership**, and **messaging topology** for the marketplace platform. The highest-risk integration points are **inventory reservation during checkout** and **payment-order consistency** — both are specified in detail here.

Data ownership is strict: Inventory Service does not read the orders table; Order Service does not directly decrement Redis stock counters. All cross-domain coordination uses synchronous APIs for the checkout critical path and asynchronous events for everything after order placement.

---

## 1. Purpose

Use this document when defining APIs, choosing datastores, onboarding to a service team, or reviewing cross-service changes in design review.

---

## 1.1 Service interaction overview

```text
                         ┌──────────────┐
                         │ Shopper BFF  │
                         └──────┬───────┘
                                │
    ┌───────────┬───────────────┼───────────────┬───────────┐
    ▼           ▼               ▼               ▼           ▼
┌────────┐ ┌─────────┐   ┌───────────┐   ┌─────────┐ ┌─────────┐
│ Search │ │ Catalog │   │ Checkout  │   │  Cart   │ │ Pricing │
└────────┘ └────┬────┘   │Orchestrator│   └─────────┘ └─────────┘
                │        └─────┬─────┘
                │              │
                ▼              ▼
         ┌──────────┐    ┌──────────┐    ┌─────────┐
         │Inventory │◄──►│  Order   │◄──►│ Payment │
         └──────────┘    └────┬─────┘    └─────────┘
                              │ order-events
                              ▼
                    ┌─────────────────────────┐
                    │ Fulfillment │ Shipping  │
                    │ Returns │ Notification  │
                    └─────────────────────────┘
```

---

## 2. Service catalog

### 2.1 Identity Service

Central **authentication and authorization** for shoppers, sellers, and admins. Issues JWT with `sub`, `role`, `customerId` or `sellerId`, and `auth_version` for forced logout.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Credentials, refresh tokens, roles, MFA state |
| **Store** | Azure SQL + Microsoft Entra External ID (B2C) |
| **APIs** | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/otp/send` |

OTP login is common in India; SMS OTP via Azure Communication Services with rate limiting per phone number.

---

### 2.2 Customer Profile Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Names, addresses, pincode history, communication preferences, wallet references |
| **Store** | Cosmos DB (PK: `/customerId`) |
| **Does not own** | Cart contents, order history (Order Service), payment tokens (Payment Service) |

```json
{
  "customerId": "cust_123",
  "name": "Priya Sharma",
  "defaultAddressId": "addr_456",
  "addresses": [
    {
      "id": "addr_456",
      "line1": "42 MG Road",
      "city": "Bengaluru",
      "state": "KA",
      "pincode": "560001",
      "phone": "+919876543210"
    }
  ],
  "marketingConsent": false
}
```

---

### 2.3 Product Catalog Service

**System of record for product master data.** Search index is a derived read model — Catalog does not serve search queries at scale.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | SKU attributes, title, description, brand, category, images, seller mapping |
| **Store** | Cosmos DB (PK: `/sellerId` for seller SKUs) + Blob Storage for images |
| **Publishes** | `CatalogItemCreated`, `CatalogItemUpdated`, `CatalogItemDeleted` |

```json
{
  "skuId": "sku_iphone15_128_blue",
  "sellerId": "seller_flipkart_retail",
  "title": "Apple iPhone 15 128GB Blue",
  "categoryId": "cat_mobiles",
  "attributes": { "color": "Blue", "storage": "128GB" },
  "mrp": 79900,
  "imageUrls": ["https://cdn.../img1.jpg"],
  "status": "ACTIVE"
}
```

Catalog changes trigger async indexer via Service Bus → Search Service.

---

### 2.4 Search & Discovery Service

Serves **full-text search, faceted navigation, autocomplete, and browse-by-category**. Optimized for read throughput — never writes orders or inventory.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Search index documents, query ranking, synonym maps |
| **Store** | Azure AI Search index (sharded at scale) |
| **Ingest** | Consumes `catalog-events`; enriches with inventory snapshot (eventual) |

Index document (simplified):

```json
{
  "skuId": "sku_iphone15_128_blue",
  "title": "Apple iPhone 15 128GB Blue",
  "brand": "Apple",
  "categoryPath": ["Electronics", "Mobiles", "Smartphones"],
  "price": 74999,
  "inStock": true,
  "serviceablePincodes": ["560001", "560002"],
  "sellerRating": 4.8
}
```

**Pincode serviceability** may be denormalized into index or checked at PDP via Inventory Service — trade-off between index size and accuracy.

---

### 2.5 Inventory Service

**Prevents overselling.** The most contended service during sale events.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Stock levels per SKU per warehouse, reservations, availability by pincode |
| **Hot store** | Redis (atomic counters per `skuId:warehouseId`) |
| **Cold store** | Azure SQL (audit log, reconciliation) |
| **APIs** | `GET /availability`, `POST /reserve`, `POST /confirm`, `POST /release` |

#### Reservation model

```text
available = Redis GET stock:sku_123:wh_blr_01
reserve:   DECRBY stock:sku_123:wh_blr_01 qty (if result >= 0)
           SET reservation:{checkoutId}:{skuId} qty EX 900  (15 min TTL)
confirm:   (on payment success) delete reservation key; write SQL audit
release:   INCRBY stock (on checkout abandon or payment fail)
```

**Oversell prevention:** Redis `DECRBY` is atomic. If result negative, increment back and return `OUT_OF_STOCK`. No application-level read-modify-write race.

---

### 2.6 Cart Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Line items, quantities, selected seller offers per SKU |
| **Store** | Redis (PK: `cart:{customerId}` or `cart:guest:{sessionId}`) |
| **TTL** | 30 days for logged-in; 7 days for guest |

```json
{
  "cartId": "cart_abc",
  "customerId": "cust_123",
  "items": [
    {
      "skuId": "sku_iphone15_128_blue",
      "sellerId": "seller_1",
      "quantity": 1,
      "addedAt": "2026-06-18T10:00:00Z"
    }
  ],
  "updatedAt": "2026-06-18T10:05:00Z"
}
```

On login, guest cart merges into customer cart (last-write-wins per SKU with quantity sum).

---

### 2.7 Pricing & Promotions Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Sale prices, coupons, bank offers, GST rate rules, shipping fee rules |
| **Store** | Azure SQL (rules) + Redis (active promotion cache) |
| **APIs** | `POST /price/evaluate` (cart snapshot → priced lines) |

Evaluation inputs: cart items, customer segment, coupon code, payment method, pincode. Output includes per-line price, discount breakdown, GST, shipping estimate.

---

### 2.8 Checkout Orchestrator

**Coordinates the checkout saga** — does not own order or inventory data long-term.

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Checkout session state machine, saga coordination |
| **Store** | Redis (checkout session, 30 min TTL) + saga log in SQL |
| **Pattern** | Orchestration-based saga |

```text
Checkout steps:
  1. Validate cart (Cart Service)
  2. Evaluate price (Pricing Service)
  3. Check serviceability (Inventory + Shipping)
  4. Fraud score (Fraud Service)
  5. Reserve inventory (Inventory Service) — all line items
  6. Initiate payment (Payment Service)
  7. On payment success → Create order(s) (Order Service)
  8. On failure → Release inventory, mark checkout FAILED
```

---

### 2.9 Order Service

**Aggregate root for post-placement lifecycle.**

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Order documents, status transitions, invoice metadata |
| **Store** | Cosmos DB (PK: `/customerId` or `/orderId`) |
| **Pattern** | Outbox → Service Bus `order-events` |

Split order model:

```json
{
  "parentCheckoutId": "chk_parent_789",
  "orders": [
    {
      "orderId": "ord_seller1_001",
      "sellerId": "seller_1",
      "status": "PAID",
      "lines": [{ "skuId": "sku_123", "qty": 1, "priceInPaise": 7499900 }],
      "shippingAddress": { "pincode": "560001" },
      "gstInvoice": { "gstin": "29AAAA...", "cgst": 0, "sgst": 0, "igst": 6750 }
    }
  ]
}
```

---

### 2.10 Payment Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Payment intents, PSP integration, refunds, COD state |
| **Store** | Azure SQL Hyperscale (immutable ledger) |
| **Methods** | UPI (intent/collect), cards (tokenized), wallets, COD |

| Method | Flow |
|--------|------|
| **UPI** | Create intent → client opens PSP app → webhook confirms |
| **Card** | Token charge via PSP |
| **COD** | Mark `COD_PENDING`; confirm on delivery scan |
| **Wallet** | Internal ledger debit |

---

### 2.11 Fulfillment Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Warehouse allocation, pick lists, pack confirmation |
| **Store** | Azure SQL + integration messages to WMS |
| **Triggers** | `OrderPaid` event |

Allocates nearest warehouse with stock (already reserved) to minimize delivery time.

---

### 2.12 Shipping Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Carrier selection, AWB generation, tracking events |
| **Integrations** | Delhivery, Blue Dart, etc. via REST |
| **APIs** | `POST /shipments`, `GET /track/{awb}` |

---

### 2.13 Returns & Refunds Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | RMA requests, pickup scheduling, refund initiation |
| **Store** | Cosmos DB (returns) + SQL (refund linkage) |
| **Flow** | Return approved → Payment Service refund → Order status `REFUNDED` |

---

### 2.14 Seller Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Seller onboarding, KYC, commission rates, settlement schedule |
| **Store** | Cosmos DB + Blob (documents) |

---

### 2.15 Review & Rating Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Product reviews, star aggregates |
| **Store** | Cosmos DB (PK: `/skuId`) |
| **Consistency** | Eventual aggregate on Catalog/Search index |

---

### 2.16 Notification Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Templates, delivery tracking, channel failover |
| **Channels** | FCM, SMS, email, WhatsApp Business API |
| **Consumes** | `OrderPlaced`, `OrderShipped`, `OrderDelivered`, `PaymentFailed` |

---

### 2.17 Fraud & Risk Service

| Attribute | Specification |
|-----------|---------------|
| **Owns** | Rules engine, velocity limits, device fingerprint scores |
| **Returns** | `ALLOW`, `CHALLENGE` (OTP), `BLOCK` on checkout |
| **Signals** | New account + high-value order, address mismatch, velocity |

---

## 3. BFF layer design

### 3.1 Shopper BFF

| Endpoint | Orchestration |
|----------|---------------|
| `GET /api/v1/pdp/{skuId}` | Catalog + Inventory (stock) + Pricing + Reviews (parallel) |
| `GET /api/v1/search` | Search Service + optional personalization |
| `POST /api/v1/cart/items` | Cart Service |
| `POST /api/v1/checkout/start` | Cart + Pricing + address validation |
| `POST /api/v1/checkout/place` | Checkout Orchestrator (saga) |
| `GET /api/v1/orders/{id}` | Order + Shipping tracking |

PDP response is **cacheable at CDN** with short TTL (60s) or stale-while-revalidate during sales.

### 3.2 Seller BFF

Catalog upload, inventory bulk update, order list for seller, settlement reports.

### 3.3 Admin BFF

Promotion configuration, fraud review queue, manual refund approval.

---

## 4. Data architecture

### 4.1 Storage allocation matrix

| Domain | Technology | Partition key | Notes |
|--------|------------|---------------|-------|
| Catalog | Cosmos DB | `sellerId` | Flexible attributes per category |
| Search index | Azure AI Search | `skuId` | Sharded indexes at 50M+ docs |
| Cart | Redis | `customerId` | TTL-based expiry |
| Inventory hot | Redis | `skuId:warehouseId` | Atomic counters |
| Inventory audit | Azure SQL | `skuId` | Reconciliation |
| Checkout session | Redis | `checkoutId` | Saga state |
| Orders | Cosmos DB | `customerId` | Query by customer history |
| Payments | Azure SQL | `orderId` | ACID ledger |
| Images | Blob + CDN | `skuId` path | WebP variants |
| Clickstream | Event Hubs | `customerId` hash | Analytics |

### 4.2 Data flow classification

```text
HOT (ms-critical):     Search, PDP cache, cart read/write, inventory check
WARM (seconds):        Checkout saga, payment webhook, order create
COLD (minutes/hours):  Search index update, recommendations, settlements
```

---

## 5. Messaging topology

### 5.1 Service Bus topics

**`catalog-events`** → Search indexer, Recommendation feature pipeline

**`order-events`**

| Subscription | Consumer | Action |
|--------------|----------|--------|
| `fulfillment` | Fulfillment Service | Create pick list on `OrderPaid` |
| `notification` | Notification Service | SMS/push on status changes |
| `analytics` | Event Hubs forwarder | Warehouse reporting |
| `seller` | Seller Service | Update seller dashboard |

**`inventory-events`** → Search index stock flag update, low-stock alerts

### 5.2 Event envelope

```json
{
  "eventId": "evt_a1b2",
  "eventType": "OrderPlaced",
  "eventVersion": "1.0",
  "occurredAt": "2026-06-18T14:30:00Z",
  "correlationId": "corr_xyz",
  "payload": {
    "orderId": "ord_001",
    "customerId": "cust_123",
    "totalPaise": 7499900,
    "paymentMethod": "UPI"
  }
}
```

---

## 6. Idempotency

| Layer | Mechanism |
|-------|-----------|
| `POST /checkout/place` | `Idempotency-Key` header → Redis 24h dedup |
| Payment webhook | PSP event ID dedup table |
| Inventory confirm | `checkoutId` as idempotency key |
| Order create | `checkoutId` unique constraint |
| Service Bus | `messageId` deduplication |

---

## 7. Related documents

| ID | Title |
|----|-------|
| ARCH-ECOM-001 | Architecture Design Document |
| ARCH-ECOM-003 | Request Lifecycle and Integration Flows |
| ARCH-ECOM-004 | Azure Infrastructure Design |
| ARCH-ECOM-005 | Reliability, Operations, and Observability |
