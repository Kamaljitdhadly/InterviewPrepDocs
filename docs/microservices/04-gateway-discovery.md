# API Gateway & Service Discovery

## Concept Explanation

**API Gateway** — a single entry point in front of your services. Clients call the gateway, which **routes** to the right service and handles **cross-cutting concerns**: authentication, rate limiting, TLS termination, request aggregation, caching, and protocol translation. It avoids exposing many service endpoints and prevents clients from coupling to internal topology.

**Service Discovery** — because service instances are dynamic (scaling, restarts, changing IPs), services need to *find* each other:
- **Client-side discovery** — the client queries a registry (e.g. Consul, Eureka) and picks an instance.
- **Server-side discovery** — a load balancer/registry routes for you (e.g. Kubernetes Services + DNS).

A **service registry** keeps the live list of healthy instances.

## Code Example(s)

```text
            ┌─────────────┐
 Client ───▶│ API Gateway │───▶ Orders Service   (/orders/*)
            │  (auth,     │───▶ Catalog Service  (/products/*)
            │  rate-limit,│───▶ Cart Service     (/cart/*)
            │  routing)   │
            └─────────────┘
   One public endpoint; internal services stay private.
```

```yaml
# Example: Ocelot (.NET API gateway) route config
{
  "Routes": [
    {
      "UpstreamPathTemplate": "/orders/{everything}",
      "DownstreamPathTemplate": "/{everything}",
      "DownstreamHostAndPorts": [{ "Host": "orders-svc", "Port": 80 }],
      "AuthenticationOptions": { "AuthenticationProviderKey": "Bearer" }
    }
  ]
}
```

## Interview Q&A

**🟢 What is an API Gateway and why use one?**
A single entry point that routes client requests to backend services and centralizes cross-cutting concerns (auth, rate limiting, TLS, aggregation). It simplifies clients and hides internal service topology.

**🟢 What is service discovery?**
The mechanism by which services find the network locations of other service instances, which change dynamically due to scaling and restarts — typically via a service registry and/or DNS.

**🟡 What's the difference between client-side and server-side discovery?**
Client-side: the client queries the registry and chooses an instance (more control, registry-aware clients). Server-side: a load balancer/router (or platform like Kubernetes) resolves and forwards — clients stay simple. Kubernetes uses server-side via Services + DNS.

**🟡 What is the BFF (Backend-for-Frontend) pattern?**
A dedicated gateway per client type (web, mobile) that tailors and aggregates responses for that client's needs, avoiding a one-size-fits-all gateway and reducing over/under-fetching.

**🔴 What are the risks of an API Gateway?**
It can become a **single point of failure** and a **performance bottleneck** if not made highly available/scaled. Putting too much business logic in it recreates a monolith. Keep it focused on routing/cross-cutting concerns and run it redundantly.

## ⚠️ Tricky / Gotchas

- **Gateway as a god object:** stuffing business logic into the gateway recouples everything — keep it to routing, auth, rate limiting, aggregation.
- **Single point of failure:** the gateway must be highly available and scalable, or it takes the whole system down.
- **In Kubernetes, service discovery is built-in** (Services + DNS) — adding a separate registry (Eureka/Consul) is often redundant. Know your platform.
- **Stale registry entries:** without health checks, discovery may route to dead instances; registries must evict unhealthy nodes.
- **Don't confuse API Gateway with a load balancer** — LB is L4/L7 traffic distribution; a gateway adds API-level concerns (auth, routing by path, aggregation, transformation).

## 📌 Quick Recap

- API Gateway = single entry point; handles routing + cross-cutting concerns (auth, rate limit, TLS, aggregation); hides internal topology.
- Service discovery finds dynamic instances via a registry/DNS.
- Client-side (client picks instance) vs server-side (LB/platform routes); Kubernetes = server-side via Services + DNS.
- BFF = a gateway tailored per client type.
- Keep the gateway thin (no business logic) and highly available (avoid SPOF/bottleneck).
- Registries need health checks to avoid routing to dead instances.
