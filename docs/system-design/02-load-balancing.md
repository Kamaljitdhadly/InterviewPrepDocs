# Load Balancing

## Concept Explanation

A **load balancer (LB)** distributes incoming traffic across multiple backend servers to improve **scalability**, **availability**, and **performance**. It also performs **health checks**, removing unhealthy servers from rotation.

- **Layer 4 (transport)** — routes by IP/port (TCP/UDP); fast, protocol-agnostic.
- **Layer 7 (application)** — routes by HTTP content (URL path, headers, cookies); enables smart routing, SSL termination, and content-based rules.

**Algorithms:** Round Robin, Weighted Round Robin, Least Connections, IP Hash (sticky), Least Response Time.

**Sticky sessions** pin a client to one server (needed if state is local) — but they undermine even distribution and failover; prefer stateless servers + shared session store.

## Code Example(s)

```text
                 ┌──────────────┐
  Clients ──────▶│ Load Balancer│ (health checks, algorithm)
                 └──────┬───────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Server 1    Server 2    Server 3   (stateless; any can serve any request)
       (healthy)   (healthy)   (DOWN ✗ — removed from rotation)
```

```nginx
# NGINX as an L7 load balancer
upstream backend {
    least_conn;                 # algorithm
    server app1:8080;
    server app2:8080;
    server app3:8080 backup;    # only used if others fail
}
server {
    location / { proxy_pass http://backend; }
}
```

## Interview Q&A

**🟢 What does a load balancer do?**
Distributes incoming requests across multiple servers, performs health checks to route around failures, and improves availability, scalability, and performance.

**🟢 What's the difference between Layer 4 and Layer 7 load balancing?**
L4 routes by IP/port (TCP/UDP) without inspecting content — fast and generic. L7 inspects HTTP (path, headers, cookies) to make routing decisions, terminate TLS, and apply content-based rules — more flexible but more overhead.

**🟡 What are common load balancing algorithms?**
Round Robin (even rotation), Weighted Round Robin (by capacity), Least Connections (to the least busy), IP Hash (same client → same server), and Least Response Time.

**🟡 What are sticky sessions and what's the downside?**
Sticky sessions route a client consistently to the same server (via cookie/IP hash), useful when session state is stored locally. Downsides: uneven load, and losing the server loses the session. Prefer stateless servers with a shared session store (Redis).

**🔴 How do you avoid the load balancer being a single point of failure?**
Run redundant load balancers (active-active or active-passive) with failover (e.g. floating/virtual IP, DNS failover, or a managed cloud LB that's inherently HA). At very large scale, combine DNS-based global load balancing with regional LBs.

## ⚠️ Tricky / Gotchas

- **The LB itself can be a single point of failure** — it must be redundant/HA, or it defeats the purpose.
- **Sticky sessions break clean horizontal scaling and failover** — they're a band-aid for stateful servers; fix the statefulness instead.
- **Health checks must be meaningful** — a shallow TCP check can keep routing to a server whose app is broken; use an app-level `/health` endpoint.
- **L7 adds latency/CPU** (parsing, TLS) vs L4 — choose based on whether you need content-based routing.
- **Thundering herd on failover** — when a server dies, its load shifts suddenly; capacity planning must absorb N-1 server failures.

## 📌 Quick Recap

- LB distributes traffic, health-checks backends, boosts availability/scalability.
- L4 (IP/port, fast) vs L7 (HTTP-aware, smart routing + TLS).
- Algorithms: Round Robin, Weighted, Least Connections, IP Hash, Least Response Time.
- Sticky sessions pin clients (avoid; prefer stateless + shared session store).
- Make the LB redundant (active-active/passive) so it isn't a SPOF.
- Use app-level health checks; plan capacity for N-1 failures.
