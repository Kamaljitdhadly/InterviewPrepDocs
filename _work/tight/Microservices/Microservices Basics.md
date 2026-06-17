# Microservices Basics

## Questions Covered

1. What are microservices, and how do they differ from monolithic architecture?
2. What are the advantages and disadvantages of using microservices?
3. How do you decide whether to use microservices in a system design?
4. What is service granularity, and how do you define the right size of a microservice?
5. How do you ensure high cohesion and low coupling in microservices?
6. What role does domain-driven design (DDD) play in microservices architecture?

## What are microservices, and how do they differ from monolithic architecture?

**Microservices** build an application as loosely coupled, independently deployable services — each owning a specific business function and communicating via HTTP or messaging.

**Monolithic architecture** packages the entire app (UI, business logic, data access) as one tightly coupled process.

| Aspect | Monolith | Microservices |
|--------|----------|---------------|
| Modularity | Single coupled unit | Smaller, focused services |
| Deployment | Entire app redeployed | Services deployed independently |
| Scalability | Scale the whole system | Scale individual services |
| Technology | Unified stack | Per-service technology choices |

## What are the advantages and disadvantages of using microservices?

| Advantages | Disadvantages |
|------------|---------------|
| Independent scaling | Service discovery & orchestration complexity |
| Per-service tech flexibility | Network latency and failure risk |
| Faster independent deployments | Operational overhead (deploy, monitor, log) |
| Fault isolation | Distributed data consistency challenges |
| Better modularity | Higher infrastructure cost |

## How do you decide whether to use microservices in a system design?

**Use microservices** when the app has multiple domains, multiple independent teams, varying scale needs, frequent per-service updates, fault-isolation requirements, technology diversity, and mature DevOps (CI/CD, monitoring).

**Avoid** when the app is small/simple, ops maturity is low (no CI/CD or monitoring), or performance-critical paths can't tolerate network overhead.

## What is service granularity, and how do you define the right size of a microservice?

**Service granularity** defines how much functionality a single microservice owns.

| Guideline | Detail |
|-----------|--------|
| **Single Responsibility** | One clear business function per service |
| **Cohesion** | Internal components work together on the same capability |
| **Bounded Context (DDD)** | Align each service with a self-contained domain boundary |
| **Business capabilities** | Map to distinct features or problems the business solves |
| **Avoid excessive splitting** | Too fine → communication overhead; too coarse → monolith-like coupling |

Balance: **small enough** to deploy independently, **large enough** to avoid unnecessary inter-service chatter.

## How do you ensure high cohesion and low coupling in microservices?

**High cohesion** = each service does one well-defined job. **Low coupling** = minimal dependencies between services.

- **Business capabilities** — organize around domains that rarely change together.
- **DDD bounded contexts** — encapsulate logic, behavior, and data per domain.
- **APIs for communication** — REST, gRPC, or messaging; no leaking internal implementations.
- **Encapsulate data** — each service owns its database; share via APIs, not direct DB access.
- **Asynchronous communication** — events/messaging reduce runtime dependencies vs. synchronous calls.
- **Version APIs** — let services evolve without breaking dependents.
- **Limit shared libraries** — shared code creates tight coupling across services.
- **Service discovery + load balancing** — avoid hardcoded addresses.

## What role does domain-driven design (DDD) play in microservices architecture?

**DDD** provides a framework for defining service boundaries aligned with business domains.

- **Bounded contexts** — each microservice maps to a well-defined domain boundary, reducing cross-service complexity.
- **Ubiquitous language** — shared vocabulary between domain experts and developers within a context.
- **Entities, aggregates, value objects** — organize internal structure; aggregates enforce business rules and cohesion.
- **Anti-corruption layer (ACL)** — insulate services from external/legacy systems, maintaining loose coupling.
- **Event-driven architecture** — domain events propagate state changes across services without tight coupling.

DDD structures microservices around core business logic — high cohesion within services, clear separation between them.
