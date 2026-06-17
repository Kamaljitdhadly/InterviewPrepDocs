# Reliability: Rate Limiting, CDN & Redundancy

## Concept Explanation

Building reliable systems means protecting against overload, failures, and latency:

- **Rate limiting** — cap how many requests a client can make in a window, protecting against abuse, spikes, and cascading overload. Algorithms: **Token Bucket** (allows bursts), **Leaky Bucket** (smooths to a constant rate), **Fixed/Sliding Window** counters.
- **CDN (Content Delivery Network)** — geographically distributed edge servers that cache static (and some dynamic) content close to users, cutting latency and offloading origin servers.
- **Redundancy & failover** — eliminate single points of failure with replicas/standbys; **active-active** (all serving) or **active-passive** (standby takes over).
- **Graceful degradation** — shed non-essential features under load rather than failing entirely.

## Code Example(s)

```text
TOKEN BUCKET (allows bursts up to bucket size, refills at fixed rate):
  bucket capacity = 10 tokens, refill = 1 token/sec
  each request consumes 1 token; empty bucket → 429 Too Many Requests

CDN:
  User (Tokyo) ─▶ nearest edge (Tokyo PoP) ──cache hit──▶ fast response
                         │ cache miss
                         ▼
                  Origin (us-east)   ← only on misses; CDN offloads it
```

```text
REDUNDANCY:
  Active-Active:   [LB] ─▶ Region A (serving) + Region B (serving)   → both handle load
  Active-Passive:  Primary (serving) ──fails──▶ Standby promoted     → failover
```

## Interview Q&A

**🟢 What is rate limiting and why use it?**
Restricting the number of requests a client can make in a time window to prevent abuse, protect resources, ensure fair usage, and avoid overload/cascading failures.

**🟢 What is a CDN and how does it help?**
A network of edge servers that cache content geographically close to users, reducing latency, saving bandwidth, and offloading the origin — especially for static assets and global audiences.

**🟡 Compare token bucket and leaky bucket.**
Token bucket adds tokens at a fixed rate up to a capacity and allows short bursts (spend accumulated tokens). Leaky bucket processes requests at a constant rate (smoothing), queuing or dropping excess — no bursts. Token bucket is more common for APIs needing burst tolerance.

**🟡 What's the difference between active-active and active-passive redundancy?**
Active-active runs multiple nodes all serving traffic (better utilization, instant failover, but needs state sync). Active-passive keeps a standby idle until the primary fails, then promotes it (simpler, but wasted standby capacity and brief failover time).

**🔴 How would you implement distributed rate limiting across many servers?**
A per-server counter doesn't enforce a global limit. Use a shared store (e.g. Redis) with atomic increments/sliding-window counters keyed by client, or a token-bucket in Redis, so all servers share the same view. Trade-offs: added latency and the store becoming a hotspot — mitigate with sharding/local pre-checks.

## ⚠️ Tricky / Gotchas

- **Per-instance rate limiting doesn't enforce a global limit** — behind a load balancer, a "100 req/min" limit becomes 100×N. Use a shared/distributed counter.
- **Fixed-window counters allow double bursts at boundaries** (e.g. 100 at 0:59 + 100 at 1:00) — sliding window avoids this.
- **CDNs cache stale content** — set proper cache-control/TTLs and use cache invalidation/versioned URLs for updates.
- **Redundancy without testing failover is false safety** — standbys that were never tested often fail when needed (do chaos/DR drills).
- **Returning 429 without `Retry-After`** leaves clients guessing — include backoff hints.

## 📌 Quick Recap

- Rate limiting protects from overload/abuse: Token Bucket (bursts), Leaky Bucket (smooth), Fixed/Sliding Window.
- Distributed rate limiting needs a shared store (Redis) — per-instance limits don't enforce global caps.
- CDN caches content at edge servers near users → lower latency, less origin load; manage TTLs/invalidation.
- Redundancy: active-active (all serving) vs active-passive (standby failover); eliminate SPOFs.
- Graceful degradation under load; test failover; return `Retry-After` with 429s.
