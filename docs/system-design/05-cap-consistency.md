# CAP Theorem & Consistency

## Concept Explanation

The **CAP theorem** states that a distributed data store can guarantee at most **two of three** properties simultaneously:

- **Consistency (C)** — every read sees the most recent write (all nodes agree).
- **Availability (A)** — every request gets a (non-error) response, even if some nodes fail.
- **Partition tolerance (P)** — the system keeps working despite network partitions (dropped/delayed messages between nodes).

Since network **partitions are unavoidable** in distributed systems, **P is mandatory** — so the real choice during a partition is **C vs A**:
- **CP** systems sacrifice availability to stay consistent (e.g. refuse writes during a partition) — e.g. traditional RDBMS clusters, HBase, ZooKeeper.
- **AP** systems stay available but may return stale data — e.g. Cassandra, DynamoDB (tunable).

**PACELC** extends CAP: even without partitions (Else), you trade **Latency vs Consistency**.

## Code Example(s)

```text
CAP triangle — pick 2 (but P is required in practice):

            Consistency
              /      \
          CP /        \ CA  (CA only without partitions — not realistic for distributed)
            /          \
   Partition ────────── Availability
              \  AP  /
        choose C or A WHEN a partition happens
```

```text
Consistency spectrum (weak ───────────────▶ strong):
  Eventual → Read-your-writes → Monotonic reads → Causal → Linearizable (Strong)
  weaker = faster, more available, may read stale
  stronger = correct, but higher latency / lower availability
```

## Interview Q&A

**🟢 What is the CAP theorem?**
In a distributed system you can have at most two of Consistency, Availability, and Partition tolerance at the same time. Because partitions happen, you effectively choose between consistency and availability during a partition.

**🟢 Why can't you have all three?**
During a network partition, nodes can't communicate. You either refuse requests to keep data consistent (sacrifice availability = CP) or serve possibly-stale data to stay available (sacrifice consistency = AP). You can't be both consistent and available while partitioned.

**🟡 Give examples of CP and AP systems.**
CP: traditional RDBMS clusters, HBase, ZooKeeper, etcd (consistency-first). AP: Cassandra, DynamoDB, Riak (availability-first, eventual/tunable consistency).

**🟡 What is eventual consistency?**
A model where replicas converge to the same value over time after writes stop; reads may be temporarily stale. It favors availability and performance — common in AP systems and caches.

**🔴 What is PACELC and why does it matter?**
PACELC: if there's a Partition, trade Availability vs Consistency; Else (normal operation), trade Latency vs Consistency. It captures that even *without* partitions, stronger consistency costs latency — a more complete picture than CAP for everyday design decisions.

## ⚠️ Tricky / Gotchas

- **"CA" systems aren't realistic for distributed data** — you can't drop partition tolerance across a network. The honest choice is CP vs AP.
- **Consistency in CAP ≠ Consistency in ACID.** CAP-C is about all nodes seeing the latest write (linearizability); ACID-C is about transactions preserving invariants. Mixing them up is a classic trap.
- **CP/AP isn't a fixed label** — many systems are *tunable* per operation (e.g. Cassandra/Cosmos let you choose consistency level per request).
- **Strong consistency has real cost** — latency and reduced availability; don't demand it everywhere (e.g. a "like" count can be eventually consistent; a bank balance shouldn't).
- **Partitions are rare but not negligible** — design for them; ignoring P leads to data corruption/split-brain.

## 📌 Quick Recap

- CAP: at most 2 of Consistency, Availability, Partition tolerance.
- Partitions are unavoidable → P is required → choose C (CP) or A (AP) during a partition.
- CP: consistent, may reject requests (RDBMS clusters, ZooKeeper, etcd). AP: available, may be stale (Cassandra, DynamoDB).
- Eventual consistency = replicas converge over time (favors availability/latency).
- PACELC: even without partitions, trade Latency vs Consistency.
- CAP-C ≠ ACID-C; consistency is often tunable per operation; match it to the data's needs.
