# System Design CAP Theorem

The **CAP theorem** (Eric Brewer, 2000) states a distributed system can guarantee only **two of three** properties simultaneously:

| Property | Definition |
|----------|------------|
| **Consistency (C)** | Every node has the same data at a single point in time; every read returns the most recent write or an error |
| **Availability (A)** | Every request gets a response (success or failure) without guarantee of the latest write; no downtime |
| **Partition Tolerance (P)** | System continues operating despite network failures that isolate nodes |

## Key Insight

Pick two:

| Combo | Trade-off |
|-------|-----------|
| **CA** (Consistency + Availability) | No partition tolerance |
| **CP** (Consistency + Partition Tolerance) | Availability may be sacrificed |
| **AP** (Availability + Partition Tolerance) | Consistency may be sacrificed |

## CA Systems (Consistency + Availability)

- **Example:** Traditional RDBMS (MySQL, PostgreSQL) in single-node setup.
- **Behavior:** Prioritizes consistent, up-to-date reads; cannot tolerate partitions — system may become unavailable during network splits.

## CP Systems (Consistency + Partition Tolerance)

- **Example:** MongoDB, HBase (strong consistency mode).
- **Behavior:** Ensures all nodes agree on state; may reject operations or become unavailable until partition heals.

## AP Systems (Availability + Partition Tolerance)

- **Example:** Cassandra, CouchDB, DynamoDB.
- **Behavior:** Stays operational during partitions; nodes may temporarily hold different data versions → **eventual consistency** once partition heals.

## Real-World Scenario

Multi-datacenter database with a network partition:

| Choice | Behavior |
|--------|----------|
| **CA** | System may go down until partition resolves to keep data consistent and available |
| **CP** | Stays operational but some operations blocked to maintain consistency |
| **AP** | Stays operational; temporary inconsistency resolved over time |

## Partition Tolerance

A system's ability to function when network failures isolate nodes. **Tolerance** means continued operation, often compromising consistency or availability.

**Key concepts:**

- **Network partition** — nodes can't communicate (link failure, high latency).
- **Tolerance** — system keeps working, possibly with stale or unavailable data.

### Cassandra Example

Three geo-distributed data centers (A, B, C) replicating data. Network failure isolates A from B and C:

1. **Continued operation** — all centers handle reads/writes; A serves clients despite isolation.
2. **Eventual consistency** — conflicting writes during partition reconcile when connectivity restores.
3. **Trade-off** — availability maintained; temporary cross-DC inconsistency accepted.

**Real-world relevance:** partition tolerance is critical for global apps, cloud services, and IoT where network reliability isn't guaranteed. Achieving it may sacrifice consistency (different nodes, different data) or availability (blocked operations until partition resolves) — a fundamental distributed-systems trade-off.
