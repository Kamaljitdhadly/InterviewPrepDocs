# Microservices Communication Design Patterns - API Gateways

## Questions Covered

1. What is an API Gateway, and what role does it play in microservices architecture?
2. How does an API Gateway differ from a reverse proxy?
3. What responsibilities does an API Gateway have (e.g., routing, security, caching)?
4. What is the Backend for Frontend (BFF) pattern, and how does it differ from API Gateway?
5. How do you implement rate-limiting, throttling, and caching in an API Gateway?

## What is an API Gateway, and what role does it play in microservices architecture?

An **API Gateway** is a single entry point through which clients access multiple microservices. It routes requests, aggregates responses, and returns a unified result — decoupling clients from the underlying service topology.

**Key roles:**

- **Request Routing** — directs requests to the correct microservice by URL, method, or other criteria.
- **Load Balancing** — distributes traffic across service instances for performance and availability.
- **Security** — authentication, authorization, token validation, SSL termination.
- **Rate Limiting & Throttling** — controls request volume to prevent abuse and ensure fair resource use.
- **Caching** — stores frequent responses to reduce backend load.
- **Response Aggregation** — combines data from multiple services into one client response.
- **Monitoring & Logging** — centralized metrics, tracing, and error tracking.
- **Protocol Translation** — bridges HTTP, WebSocket, and other protocols for diverse clients (web, mobile, IoT).
- **Service Discovery** — dynamically routes to available service instances.

The gateway simplifies client interaction, centralizes cross-cutting concerns, and improves maintainability.

## How does an API Gateway differ from a reverse proxy?

Both sit between clients and backends, but serve different purposes:

| Aspect | API Gateway | Reverse Proxy |
|--------|-------------|---------------|
| **Purpose** | Comprehensive API management for microservices | Traffic forwarding and basic infrastructure tasks |
| **Features** | Routing, auth, rate limiting, caching, aggregation, protocol translation | Load balancing, SSL termination, hiding backend IPs |
| **Complexity** | Higher — business logic, API-specific policies | Lower — directs traffic with minimal request/response manipulation |
| **OSI Layer** | Application layer (L7) — content-based routing, payload operations | L4 and L7 — primarily TCP/IP forwarding by IP/port |
| **Client Awareness** | Clients interact directly with the gateway as the API surface | Clients typically unaware; see only the backend |
| **Use Cases** | Microservices exposing multiple APIs needing security, monitoring, composition | Traditional web apps; can be a component within microservices |

In short: a reverse proxy routes traffic; an API Gateway adds API-centric capabilities tailored to microservices.

## What responsibilities does an API Gateway have (e.g., routing, security, caching)?

Core responsibilities:

- **Routing** — single entry point; forwards requests to the correct microservice.
- **Security** — authentication (OAuth tokens, API keys), authorization, SSL/TLS termination.
- **Rate Limiting & Throttling** — caps request volume to protect backends from overload.
- **Caching** — serves repeated requests from cache to improve latency and reduce load.
- **Response Aggregation** — merges data from multiple services into one response.
- **Monitoring & Logging** — tracks performance, errors, and usage analytics.
- **Protocol Translation** — supports varied client protocols (HTTP, WebSocket, etc.).
- **Service Discovery** — routes to healthy, available instances dynamically.
- **Load Balancing** — distributes traffic across replicas.
- **Error Handling** — global error responses, retries, and fallback strategies.

The gateway acts as a mediator that enhances security, efficiency, and operational control over API traffic.

## What is the Backend for Frontend (BFF) pattern, and how does it differ from API Gateway?

The **Backend for Frontend (BFF)** pattern provides a dedicated backend layer per client type (web, mobile, IoT), tailored to that client's data and UX needs.

**BFF responsibilities:**

- **Client-specific logic** — optimized data shapes and business rules per client (e.g., mobile gets a lighter payload).
- **Data aggregation** — combines microservice responses with client context in mind.
- **Simplified API surface** — abstracts microservice complexity behind a purpose-built interface.
- **Customization** — per-client performance and functionality tuning.

| Aspect | BFF | API Gateway |
|--------|-----|-------------|
| **Scope** | One BFF per client type; multiple BFFs possible | Single generalized entry point for all clients |
| **Business Logic** | Contains client-specific transformations and logic | Focuses on cross-cutting concerns (routing, security, caching) |
| **Optimization** | Tailored per client experience | Unified API, not optimized for any single client |
| **Use Cases** | Different clients need different formats, fields, or interaction patterns | Centralized routing, auth, and infrastructure concerns for all clients |

BFF optimizes per-client experiences; the API Gateway centralizes shared infrastructure concerns.

## How do you implement rate-limiting, throttling, and caching in an API Gateway?

### Rate-Limiting

Controls how many requests a client may make within a time window.

- **Token Bucket** — clients consume tokens per interval; empty bucket rejects requests until replenished.
- **Leaky Bucket** — maintains a constant output rate; excess requests are queued or dropped.
- **Configuration** — limits by client ID/IP, endpoint, or HTTP method.
- **Response** — return **429 Too Many Requests** when the limit is exceeded.

### Throttling

Finer-grained control over request rate, often adapting to system conditions.

- **Time-based** — e.g., 10 requests/second; excess requests queued or blocked.
- **Dynamic** — adjusts limits based on server load during peak traffic.
- **Back-off** — inform clients of wait time so they can retry responsibly.

### Caching

Stores frequent responses to reduce backend calls and latency.

- **In-memory caching** — fast retrieval for static or slow-changing data.
- **Time-based expiration** — stale entries refreshed on next request.
- **Cache keys** — unique per URL, query params, and headers.
- **Cache-Control headers** — `Cache-Control`, `ETag`, `Last-Modified` for client and intermediary caches.
- **Invalidation** — refresh or purge cache when underlying data changes.
