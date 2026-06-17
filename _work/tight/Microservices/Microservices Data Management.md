# Microservices Data Management

## Questions Covered

1. What is the "Database per service" pattern, and what are the trade-offs?
2. How do you handle data consistency across distributed microservices?
3. What is eventual consistency, and how do you implement it?
4. How do you avoid data coupling between microservices with separate databases?
5. How do you manage schema versioning and evolution in microservices databases?

## What is the "Database per service" pattern, and what are the trade-offs?

The **Database per service** pattern gives each microservice its own dedicated database. Each service independently chooses database technology and schema for its needs.

| Advantage | Description |
|-----------|-------------|
| **Decoupling** | Services evolve, deploy, and scale independently in data management |
| **Independence** | Schema changes in one service don't affect others |
| **Optimized storage** | Each service picks the best DB (SQL, NoSQL, etc.) for its workload |
| **Scalability** | Scale services based on individual load |
| **Fault isolation** | One service's DB failure doesn't directly impact others |

| Disadvantage | Description |
|--------------|-------------|
| **Operational complexity** | Multiple DBs mean more backups, migrations, and monitoring |
| **Consistency challenges** | Shared or cross-service data is harder to keep consistent |
| **Transaction management** | ACID transactions across DBs are difficult |
| **Development overhead** | Teams must know multiple DB technologies and schemas |
| **Data duplication** | Similar data may exist in multiple DBs, risking sync issues |

## How do you handle data consistency across distributed microservices?

Independent services and separate databases make consistency challenging. Common strategies:

| Strategy | How it works | Best for |
|----------|--------------|----------|
| **Event Sourcing** | Store state changes as an event sequence; services subscribe to update local state | Auditing, historical tracking |
| **CQRS** | Separate write (commands) and read (queries) models; writes trigger events to update read models | Complex read/write requirements |
| **Sagas** | Sequence of local transactions coordinated by events; compensating transactions roll back on failure | Long-running multi-service workflows |
| **Two-Phase Commit (2PC)** | Coordinator ensures all participants commit or abort | Strong consistency (rare in microservices — blocking, complex) |
| **Change Data Capture (CDC)** | Stream DB log changes as events to other services (e.g., Debezium) | Cross-system sync with eventual consistency |
| **API Composition** | Aggregator service calls multiple APIs and combines results | Read-heavy operations needing multi-service data |
| **Eventual Consistency** | Accept temporary inconsistency; services converge over time | High availability/performance over strict consistency |

## What is eventual consistency, and how do you implement it?

**Eventual consistency** accepts temporary inconsistency across services, guaranteeing that all updates eventually propagate and replicas converge to the same state.

**Characteristics:**

- **Temporary inconsistency** — lag between services is acceptable
- **Asynchronous updates** — services don't immediately see others' transactions
- **Guaranteed convergence** — given no new updates, all replicas reach the same state

**Implementation strategies:**

| Strategy | Approach |
|----------|----------|
| **Event-driven architecture** | Publish-subscribe via message brokers (Kafka, RabbitMQ, Azure Service Bus) on state changes |
| **Change Data Capture** | Monitor DB changes and propagate as events (e.g., Debezium) |
| **Background jobs** | Scheduled reconciliation between services when real-time sync isn't required |
| **Conflict resolution** | Last-write-wins, versioning, or custom logic for concurrent updates |
| **Stale data handling** | Tolerate stale reads; warn users or invalidate caches |

## How do you avoid data coupling between microservices with separate databases?

Maintain service independence and scalability by preventing direct data dependencies:

| Strategy | Approach |
|----------|----------|
| **API contracts** | Communicate only via well-defined REST/GraphQL APIs — never direct DB access |
| **Event-driven communication** | Publish/subscribe through a message broker instead of sharing data |
| **Data duplication + sync** | Duplicate needed data locally; keep in sync via events or batch jobs |
| **Domain-Driven Design (DDD)** | Bounded contexts — each service owns its domain logic and data model |
| **API Gateway** | Unified client interface; internal service structure stays hidden |
| **Database schema versioning** | Backward-compatible schema evolution so dependents aren't broken |
| **Read models + CQRS** | Tailored read models per service without shared data structures |

## How do you manage schema versioning and evolution in microservices databases?

Services must evolve schemas independently without breaking dependents:

| Strategy | Approach |
|----------|----------|
| **Migration tools** | Flyway, Liquibase, or EF Core Migrations for version-controlled, controlled schema changes |
| **Semantic versioning** | Major = breaking; Minor = additive; Patch = backward-compatible fixes |
| **Backward compatibility** | Add fields (don't remove/rename); use defaults or nullable new columns |
| **Feature toggles** | Deploy schema changes before exposing dependent features |
| **API versioning** | URL (`/api/v1/`) or header versioning when schema breaks compatibility |
| **Change notifications** | Event-driven alerts or docs when schemas change |
| **Automated testing** | Integration tests validate schema changes don't break functionality |
| **Staging environments** | Test schema changes in production-like setup before live deployment |
