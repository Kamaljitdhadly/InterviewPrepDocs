# Fundamentals: Scalability, Latency & Throughput

## Concept Explanation

Core vocabulary for system design:

- **Scalability** — the ability to handle growing load. **Vertical scaling (scale up)** = bigger machine (simple, but limited and a single point of failure). **Horizontal scaling (scale out)** = more machines (near-unlimited, but needs statelessness/coordination).
- **Latency** — time to handle a single request (e.g. 50 ms). Often measured at percentiles (**p50, p95, p99**) because averages hide tail latency.
- **Throughput** — work done per unit time (e.g. requests/sec, QPS).
- **Availability** — % uptime (the "nines": 99.9% ≈ 8.7h/yr down; 99.99% ≈ 52 min/yr).
- **Statelessness** — servers keep no per-client state between requests (state goes to a shared store), which is what makes horizontal scaling and load balancing work.

**Trade-offs are everything** — there's no perfect design, only the right trade-offs for the requirements.

## Code Example(s)

```text
VERTICAL (scale up)              HORIZONTAL (scale out)
   ┌──────────┐                  ┌────┐ ┌────┐ ┌────┐
   │  BIG box │                  │ s1 │ │ s2 │ │ s3 │   ← add more boxes
   │ more CPU │                  └────┘ └────┘ └────┘
   │ more RAM │                      ▲ behind a load balancer
   └──────────┘                  needs stateless servers + shared state store
```

```text
Latency percentiles for 1000 requests:
  p50 = 20ms   (half are faster)
  p95 = 120ms  (5% are slower than this)
  p99 = 450ms  (the slow tail — what your unhappiest users feel)
Optimize the tail (p99), not just the average.
```

## Interview Q&A

**🟢 What's the difference between vertical and horizontal scaling?**
Vertical adds resources to a single machine (simpler, but capped and a single point of failure). Horizontal adds more machines (virtually unlimited, fault-tolerant) but requires stateless services and coordination/load balancing.

**🟢 What's the difference between latency and throughput?**
Latency is the time for one request; throughput is how many requests are processed per unit time. You can have high throughput with high latency (batching) or low latency with low throughput.

**🟡 Why measure p99 latency instead of average?**
Averages hide the slow "tail." p99 means 1% of requests are slower than that value — and at scale that's many users (and often your most active ones). Tail latency drives perceived reliability.

**🟡 Why is statelessness important for scaling?**
Stateless servers let any instance handle any request, so you can add/remove servers freely behind a load balancer and survive failures. State is pushed to shared stores (DB, cache, session store).

**🔴 How do you estimate capacity (back-of-the-envelope)?**
Estimate from requirements: users → QPS (e.g. 10M daily users, ~100M requests/day ≈ ~1.2K QPS average, with peaks 2–5×), storage (items × size × retention), and bandwidth. These rough numbers drive design choices (caching, sharding, number of servers).

## ⚠️ Tricky / Gotchas

- **"Just scale up" hits a ceiling** and remains a single point of failure — interviewers expect horizontal scaling for large systems.
- **Average latency is misleading** — always think in percentiles (p95/p99). A 20 ms average can hide 2 s p99.
- **More servers ≠ linear speedup** — coordination, shared resources (DB), and Amdahl's law limit gains; the database often becomes the bottleneck.
- **Availability math:** services in series multiply (two 99.9% deps ≈ 99.8%); redundancy in parallel improves it. Know the difference.
- **Premature scaling** — don't design for billions of users when the requirement is thousands; over-engineering is a red flag.

## 📌 Quick Recap

- Scalability: vertical (bigger box, capped, SPOF) vs horizontal (more boxes, needs statelessness).
- Latency = per-request time (use p50/p95/p99, not average); throughput = requests/sec.
- Availability in "nines"; series deps multiply, redundancy improves.
- Statelessness enables horizontal scaling + load balancing (push state to shared stores).
- Do back-of-the-envelope capacity estimates; design for the requirement, not fantasy scale.
- Everything is trade-offs — justify them against requirements.
