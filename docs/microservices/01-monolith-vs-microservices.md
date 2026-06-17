# Monolith vs Microservices

## Concept Explanation

- **Monolith** — the whole application is one deployable unit (one codebase, one process, usually one database). Simple to build, test, and deploy initially.
- **Microservices** — the app is split into small, independently deployable services, each owning a **business capability** and (ideally) its **own data**, communicating over the network (HTTP/gRPC/messaging).

Microservices trade **development simplicity** for **operational flexibility**: independent deployment, scaling, and technology choices — at the cost of **distributed-systems complexity** (network failures, data consistency, observability).

| | Monolith | Microservices |
|---|---|---|
| Deployment | one unit | many independent |
| Scaling | whole app | per service |
| Data | shared DB | DB per service |
| Complexity | code complexity | operational/distributed complexity |
| Best when | small/medium, early stage | large teams, independent scaling needs |

## Code Example(s)

```text
MONOLITH
┌─────────────────────────────┐
│  Orders | Payments | Users  │  → single process, single DB
└─────────────────────────────┘

MICROSERVICES
┌────────┐  ┌──────────┐  ┌────────┐
│ Orders │  │ Payments │  │ Users  │   each: own process + own DB
└───┬────┘  └────┬─────┘  └───┬────┘
    └──── API Gateway / message bus ────┘
```

```text
Decomposition by business capability (good):  Orders, Inventory, Shipping
Decomposition by technical layer (bad):       UI-service, DB-service, Logic-service
```

## Interview Q&A

**🟢 What are microservices?**
An architectural style where an application is composed of small, independently deployable services, each owning a business capability and its own data, communicating over the network.

**🟢 What are the main benefits and drawbacks?**
Benefits: independent deployment/scaling, team autonomy, fault isolation, tech flexibility. Drawbacks: distributed complexity, network latency/failures, harder data consistency, more operational overhead (monitoring, deployment, testing).

**🟡 When should you NOT use microservices?**
For small apps/teams or early-stage products where the domain isn't well understood. The distributed overhead outweighs the benefits — start with a well-structured monolith and split later ("monolith first").

**🟡 How do you decide service boundaries?**
By business capability / bounded context (Domain-Driven Design), so each service is cohesive, loosely coupled, and owns its data. Avoid splitting by technical layers, which creates chatty, tightly-coupled services.

**🔴 What is a "distributed monolith" and why is it bad?**
Microservices that are so tightly coupled (shared database, synchronous chains, lock-step deployment) that you get the complexity of distribution *without* the independence. It's the worst of both worlds — usually caused by wrong boundaries or a shared data store.

## ⚠️ Tricky / Gotchas

- **"Microservices = best practice" is a trap.** Interviewers want nuance: they add real cost and should solve a real problem (scaling teams, independent deploys), not be a default.
- **Shared database across services** is an anti-pattern — it couples services, prevents independent schema evolution, and creates a distributed monolith.
- **Splitting too early/too fine** ("nanoservices") creates network chatter and operational pain before the domain is understood.
- **Synchronous call chains** (A→B→C→D) multiply latency and failure probability and reduce availability — prefer async where possible.
- **Network is not free or reliable** — every in-process call that becomes a network call gains latency and failure modes (one of the fallacies of distributed computing).

## 📌 Quick Recap

- Monolith = one deployable unit (simple ops, code complexity). Microservices = many independent services (operational/distributed complexity).
- Benefits: independent deploy/scale, team autonomy, fault isolation, tech choice.
- Costs: network failures, data consistency, observability, ops overhead.
- Decompose by business capability/bounded context, not technical layers.
- Avoid shared databases & sync call chains → "distributed monolith".
- Default to a clean monolith; adopt microservices when there's a clear need.
