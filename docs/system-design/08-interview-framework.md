# How to Approach a System Design Interview (+ worked example)

## Concept Explanation

System design interviews assess how you **structure ambiguity**, reason about **trade-offs**, and communicate. There's no single right answer — they want to see a **methodical approach**. Use a repeatable framework:

1. **Clarify requirements** (don't jump to a solution):
   - **Functional** — what features? (e.g. shorten URL, redirect)
   - **Non-functional** — scale, latency, availability, consistency, read/write ratio.
2. **Estimate scale** — back-of-the-envelope: QPS, storage, bandwidth.
3. **Define the API** — key endpoints/contracts.
4. **High-level design** — draw boxes: clients → LB → services → data stores → cache → queue.
5. **Deep dive** — data model, the bottleneck component, scaling choices.
6. **Address bottlenecks & trade-offs** — caching, sharding, replication, CAP choice, failure handling.
7. **Summarize** — recap design and call out trade-offs and what you'd do with more time.

## Code Example(s)

```text
WORKED EXAMPLE: Design a URL shortener (TinyURL)

1. Requirements
   Functional:  create short URL for a long URL; redirect short → long.
   Non-func:    read-heavy (100:1 reads:writes), low-latency redirects, highly available.

2. Scale (estimate)
   100M new URLs/month ≈ ~40 writes/sec; reads ~4K/sec; 5 yrs ≈ 6B URLs.
   Need ~7-char short code (base62^7 ≈ 3.5T combos — plenty).

3. API
   POST /shorten { longUrl } -> { shortUrl }
   GET  /{code} -> 301 redirect to longUrl

4. High-level
   Client ─▶ LB ─▶ App servers ─▶ Cache (Redis) ─▶ DB (key: code, value: longUrl)
   Write path: generate unique code (counter/base62 or hash+collision check) → store.
   Read path:  code → cache → (miss) DB → 301 redirect.

5. Deep dive
   Code generation: distributed counter (e.g. range-allocated) → base62; avoids collisions.
   DB choice: key-value store (DynamoDB/Cassandra) — simple lookups, huge scale (AP, fine here).

6. Bottlenecks/trade-offs
   Reads dominate → cache hot URLs (cache-aside). Redirects are eventually consistent (OK).
   Sharding by code (hash) for write/storage scale. CDN for ultra-low-latency redirects.
```

```text
TRADE-OFF talking points to mention:
  - SQL vs NoSQL (simple KV lookups → NoSQL scales easily)
  - Strong vs eventual consistency (a new short URL being readable instantly? mostly fine eventually)
  - Cache invalidation & TTLs; analytics (click counts) via async queue, not in the redirect path
```

## Interview Q&A

**🟢 How should you start a system design interview?**
By clarifying functional and non-functional requirements and constraints — never jump straight to a solution. Confirm scope, scale, and priorities first.

**🟢 Why do interviewers care about requirements and estimation?**
They reveal whether you design for the actual problem and scale. Estimates (QPS, storage) justify design choices (caching, sharding) instead of arbitrary decisions.

**🟡 How do you handle the "design X" being too broad?**
Scope it down with the interviewer: pick the core use cases, state assumptions explicitly, and design those well rather than trying to cover everything shallowly.

**🟡 What should you do when you hit a bottleneck in your design?**
Identify the constrained resource (DB writes, hot key, single service), then apply the right tool: caching, read replicas, sharding, async queues, or CDN — and explain the trade-off each introduces.

**🔴 What separates a strong system design answer from a weak one?**
Strong answers reason explicitly about **trade-offs** (consistency vs availability, cost vs latency, complexity vs scale), tie decisions to the stated requirements/scale, identify bottlenecks, and acknowledge what they'd improve with more time — rather than reciting a fixed "correct" architecture.

## ⚠️ Tricky / Gotchas

- **Jumping to a solution before clarifying** is the most common failure — always gather requirements first.
- **Over-engineering for imaginary scale** (designing for billions when asked for thousands) signals poor judgment — design for the stated scale.
- **Reciting buzzwords without trade-offs** ("we'll use Kafka and microservices and sharding") is weak — justify every component against requirements.
- **Ignoring the read/write ratio** leads to wrong choices — a read-heavy system is designed very differently from write-heavy.
- **Silence / not narrating your thinking** — interviewers evaluate communication; think out loud and use the whiteboard.
- **Forgetting failures** — discuss what happens when a component dies (redundancy, retries, degradation).

## 📌 Quick Recap

- Framework: clarify requirements (functional + non-functional) → estimate scale → API → high-level design → deep dive → bottlenecks/trade-offs → summarize.
- Always clarify before designing; design for the stated scale (avoid over-engineering).
- Justify every component with trade-offs tied to requirements (CAP, cost, latency, complexity).
- Identify bottlenecks and apply caching / replication / sharding / queues / CDN deliberately.
- Account for failures and redundancy; think out loud and communicate clearly.
- There's no single right answer — reasoning and trade-offs matter most.
