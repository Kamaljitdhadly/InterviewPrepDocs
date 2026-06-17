# Microservices Service Discovery

## Questions Covered

1. What is service discovery, and why is it important in microservices?
2. How does client-side discovery differ from server-side discovery?
3. What are some popular service discovery tools (e.g., Eureka, Consul)?

## What is service discovery, and why is it important in microservices?

**Service discovery** lets services find and communicate with each other without hardcoding IP addresses or hostnames — essential when instances are added, removed, or moved dynamically.

**Why it matters:**

- **Dynamic scaling** — locate new instances automatically as services scale up/down.
- **Load balancing** — distribute requests across healthy instances.
- **Fault tolerance** — reroute away from failed instances.
- **Simplified configuration** — no manual endpoint management.

## How does client-side discovery differ from server-side discovery?

| Aspect | Client-Side Discovery | Server-Side Discovery |
|--------|---------------------|---------------------|
| **Mechanism** | Client queries a registry (Eureka, Consul), picks an instance, calls it directly | Client sends to a load balancer/gateway; intermediary queries registry and forwards |
| **Pros** | Less server load; custom instance-selection logic (round-robin, least connections) | Simpler clients; centralized load balancing and failover |
| **Cons** | Client complexity; client must implement balancing/failover | Extra hop (latency); intermediary can be a single point of failure |

**Client-side** puts discovery on the caller; **server-side** offloads it to a central load balancer or API gateway.

## What are some popular service discovery tools (e.g., Eureka, Consul)?

| Tool | Overview | Key features |
|------|----------|--------------|
| **Eureka** (Netflix) | Java-focused service registry | Client-side load balancing; REST registry; auto register/discover |
| **Consul** (HashiCorp) | Service discovery + infra management | Health checks, KV store, multi-DC, web UI; client or server-side |
| **Zookeeper** (Apache) | Distributed coordination | Config, sync, naming; usable for discovery |
| **Kubernetes** | Container orchestration | DNS-based discovery by service name; built-in load balancing |
| **AWS Cloud Map** | Managed AWS discovery | Register any resource; discover via API |
| **Mesos + Marathon** | Cluster manager + orchestrator | Service registration, discovery, scaling, load balancing |

Choose based on stack, deployment environment, and whether you need client-side or server-side discovery patterns.
