# MongoDB Replication

## Questions Covered

1. What is MongoDB replica set architecture?
2. What are the roles of primary and secondary members?
3. How do replica set elections work?
4. What is the oplog and how does it work?
5. What are read preferences and when do you use each?
6. How do write concern and replication interact?
7. What happens during replica set failover?

## What is MongoDB replica set architecture?

A **replica set** is MongoDB's HA cluster: `mongod` processes sharing **the same data set**. One **primary** accepts writes; **secondaries** replicate. Clients connect via a **replica set connection string**.

```
                    +------------------+
                    |   Application    |
                    |  (MongoDB Driver)|
                    +--------+---------+
                             |
              mongodb://rs0/m1:27017,m2:27017,m3:27017
                             |
         +-------------------+-------------------+
         |                   |                   |
    +----+----+         +----+----+         +----+----+
    | PRIMARY |         |SECONDARY|         |SECONDARY|
    |  m1     | ◄─oplog─│  m2     │         |  m3     │
    | R/W     │  repl   | read    │         | read    │
    +---------+         +---------+         +---------+
         │
    [ data volumes — each member has full copy of data ]
```

| Component | Purpose |
|-----------|---------|
| **Primary** | All writes; default reads |
| **Secondary** | Async replication; optional reads |
| **Arbiter** | Vote only — no data (dev only) |
| **Hidden / Delayed** | Analytics or PITR |

**Production minimum:** 3 data-bearing members. Majority of votes must be reachable for a stable primary.

```javascript
// Initiate a 3-member replica set (run on first node)
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1.example.com:27017", priority: 2 },
    { _id: 1, host: "mongo2.example.com:27017", priority: 1 },
    { _id: 2, host: "mongo3.example.com:27017", priority: 1 }
  ]
});

// Check status
rs.status();
rs.conf();

// Connection string — driver discovers primary automatically
// mongodb://mongo1:27017,mongo2:27017,mongo3:27017/?replicaSet=rs0
```

Replica sets = **HA + failover**, not write scaling (use sharding). Each member holds a **full data copy**.

## What are the roles of primary and secondary members?

**Primary** accepts **writes**; **secondaries** tail the **oplog** and apply ops. Drivers track which node is primary.

```
WRITE PATH
  App ──write──► PRIMARY ──oplog entry──► SECONDARY (apply ops)
                      │
                      └── ack based on writeConcern

READ PATH (default)
  App ──read──► PRIMARY

READ PATH (secondaryPreferred)
  App ──read──► SECONDARY (may be slightly stale)
```

| Role | Writes | Reads | Notes |
|------|--------|-------|-------|
| **Primary** | Yes | Yes (default) | Publishes oplog |
| **Secondary** | No | With read pref | Can be elected primary |
| **Arbiter** | No | No | Vote only |
| **Hidden** | No | Internal only | Excluded from client reads |
| **Delayed** | No | No | Lagged apply (PITR) |

```javascript
// Primary-only write (default behavior)
db.orders.insertOne({ orderId: "ORD-9001", total: 149.99 });

// Read from secondary (mongosh)
db.getMongo().setReadPref("secondaryPreferred");
db.products.find({ category: "electronics" }).limit(10);

// Node roles in rs.status() output
rs.status().members.forEach(m => {
  print(`${m.name}: state=${m.stateStr}, health=${m.health}`);
});
// PRIMARY, SECONDARY, ARBITER, RECOVERING, etc.

// Priority controls election preference (higher = preferred primary)
cfg = rs.conf();
cfg.members[0].priority = 5;  // prefer mongo1 as primary
cfg.members[1].priority = 1;
rs.reconfig(cfg);
```

Monitor **replication lag** via `replSetGetStatus`. **Delayed secondaries** protect against operator mistakes.

## How do replica set elections work?

When the primary is lost or stepped down, members hold an **election** — **majority of votes** picks the new primary.

```
Election trigger examples
  • Primary heartbeat timeout (default ~10s)
  • rs.stepDown() / maintenance
  • New rs.initiate() or reconfig adding member
  • Secondary has higher priority and primary is down

Election flow (simplified)
  1. Secondary detects no primary
  2. Calls election if it can win majority votes
  3. If won → becomes PRIMARY, others stay SECONDARY
  4. Drivers detect topology change, route writes to new primary
```

| Concept | Detail |
|---------|--------|
| **Term** | Election epoch — blocks stale primaries |
| **Vote** | 1 per voting member |
| **Majority** | > half configured votes |
| **Priority** | Highest eligible wins ties |
| **Catch-up** | Candidate must be sufficiently current |

```javascript
// Graceful step-down — 120s window for another primary to win
rs.stepDown(120);

// Freeze a node so it won't seek election (maintenance)
rs.freeze(600);  // 600 seconds

// Check election-related fields
rs.status().members.forEach(m => {
  printjson({
    host: m.name,
    state: m.stateStr,
    optime: m.optimeDate,
    electionTime: m.electionTime,
    electionDate: m.electionDate
  });
});

// Reconfig during rolling upgrade — use { force: true } only in emergencies
cfg = rs.conf();
cfg.version++;
cfg.members[1].host = "mongo2-new.example.com:27017";
rs.reconfig(cfg, { force: false });
```

**Split-brain prevention:** primary cannot survive without **majority**. **Rollback** affects writes on a partitioned ex-primary not replicated to majority — use `{ w: "majority" }`.

## What is the oplog and how does it work?

The **oplog** (`local.oplog.rs`) is a **capped collection** recording idempotent write ops. Secondaries **tail** and apply them.

```
PRIMARY                              SECONDARY
  write to orders                         │
       │                                  │
       ▼                                  │
  local.oplog.rs  ─── tailable cursor ───► apply same op
  (capped, fixed size)                    to orders
```

| Property | Detail |
|----------|--------|
| **Collection** | `local.oplog.rs` |
| **Type** | Capped — rolls when full |
| **Idempotency** | Safe to re-apply |
| **Op types** | `i` insert, `u` update, `d` delete, `c` command |

```javascript
// Inspect oplog on primary (short query)
use local
db.oplog.rs.find().sort({ $natural: -1 }).limit(3).pretty();

// Sample oplog entry structure
{
  ts: Timestamp(1718000001, 1),
  t: Long("3"),           // election term
  h: Long("..."),         // hash
  v: 2,
  op: "i",                // insert
  ns: "shop.orders",
  o: { _id: ObjectId("..."), orderId: "ORD-1", total: 99 }
}

// Oplog window — how far back you can recover
rs.printReplicationInfo();
// "log length start to end: 720 mins"

rs.printSecondaryReplicationInfo();
// lag per secondary

// Change streams use oplog internally
const cs = db.orders.watch();
cs.hasNext() && printjson(cs.next());
```

Size oplog for **24+ hours** at peak load. Falling off the window forces **initial sync**.

## What are read preferences and when do you use each?

**Read preference** routes **reads** to replica set members. Writes always target the primary.

```
readPreference modes (where driver sends reads)

  primary          ──► PRIMARY only
  primaryPreferred ──► PRIMARY, else secondary
  secondary        ──► SECONDARY only
  secondaryPreferred ── SECONDARY, else primary
  nearest          ──► lowest latency member (any role)
```

| Mode | Use case | Staleness |
|------|----------|-----------|
| `primary` (default) | Strong consistency | None |
| `primaryPreferred` | Prefer primary; tolerate failover | Low |
| `secondary` | Analytics, reports | Yes |
| `secondaryPreferred` | Offload reads | Usually low |
| `nearest` | Geo-distributed; low RTT | Varies |

```javascript
// mongosh — set read preference for session
db.getMongo().setReadPref("secondaryPreferred", [
  { nodeType: "ANALYTICS" }  // tag set — only members with { analytics: "true" }
]);

db.inventory.find({ qty: { $lt: 20 } });

// Driver (Node.js) example
const client = new MongoClient(uri, {
  readPreference: "secondaryPreferred",
  readPreferenceTags: [{ region: "us-east", workload: "reporting" }],
  maxStalenessSeconds: 120  // skip secondaries >120s behind primary
});

// Tag members in replica set config for targeted reads
cfg = rs.conf();
cfg.members[2].tags = { region: "us-east", workload: "reporting", nodeType: "ANALYTICS" };
rs.reconfig(cfg);

// Hedged reads (MongoDB 4.4+) — send duplicate read to another member if slow
// readPreference: 'nearest', hedge: { enabled: true }
```

Use `maxStalenessSeconds` (min 90s) to skip lagging secondaries. For **read-your-writes**, use `primary` or causal consistency.

## How do write concern and replication interact?

**Write concern** defines how many members must ack a write before the driver returns — trades **durability** vs **latency**.

```
writeConcern: { w: <value>, j: <bool>, wtimeout: <ms> }

  w: 1           ── primary ack only (fast, less durable)
  w: "majority"  ── majority of voting members acked
  w: 3            ── exactly 3 members (specific count)
  j: true         ── wait for journal flush to disk
```

| Setting | Meaning | Trade-off |
|---------|---------|-----------|
| `{ w: 1 }` | Primary applied | Fast; may lose on crash |
| `{ w: "majority" }` | Majority replicated | Survives node failure |
| `{ j: true }` | Journal durable | Extra fsync latency |
| `wtimeout` | Max wait | Prevents hang |

```javascript
// Default — acknowledged by primary only
db.orders.insertOne({ sku: "A1", qty: 5 });

// Majority — durable across replica set
db.orders.insertOne(
  { sku: "B2", qty: 10 },
  { writeConcern: { w: "majority", j: true, wtimeout: 5000 } }
);

// Custom concern — wait for 2 members including primary
db.getMongo().setWriteConcern({ w: 2, j: true });

// Causal consistency session — writes and reads in order
const session = db.getMongo().startSession({ causalConsistency: true });
session.startTransaction();
const orders = session.getDatabase("shop").orders;
orders.insertOne({ orderId: "X1" }, { writeConcern: { w: "majority" } });
orders.findOne({ orderId: "X1" });  // guaranteed visible in same session
session.commitTransaction();

// Check default write concern on replica set
rs.conf().settings.get("defaultWriteConcern");
// e.g. { w: "majority", wtimeout: 0 }
```

`{ w: "majority" }` writes survive elections without rollback. MongoDB 5.0+ defaults to majority if unset.

## What happens during replica set failover?

Failover = detect primary loss → election → promote secondary → drivers refresh topology.

```
Timeline (typical)
  T+0s    Primary crashes / network partition
  T+~10s  Remaining members detect via heartbeat timeout
  T+~12s  Election completes; new PRIMARY elected
  T+~13s  Drivers refresh topology; writes resume
          (brief write errors: "not primary" / "node is recovering")
```

| Phase | App impact |
|-------|------------|
| **Detection** | In-flight writes may fail |
| **Election** | ~1–12s no writable primary |
| **Topology refresh** | Retryable writes reconnect |
| **Catch-up / rollback** | Old primary may roll back divergent ops |
| **Recovery** | Normal operations |

```javascript
// Simulate failover — step down current primary
rs.stepDown(60, 30);  // stepDown, secondary catch-up timeout 30s

// Driver retry — enable retryable writes (default in modern drivers)
// retryWrites=true in connection string

// Handle failover in application (pseudocode pattern)
async function insertWithRetry(doc, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await db.orders.insertOne(doc, { writeConcern: { w: "majority" } });
    } catch (e) {
      if (e.hasErrorLabel("RetryableWriteError") && i < maxRetries - 1) {
        await sleep(1000 * (i + 1));
        continue;
      }
      throw e;
    }
  }
}

// After failover — verify new primary
rs.isMaster();  // legacy; rs.status() preferred
rs.status().members.find(m => m.stateStr === "PRIMARY");

// Rollback inspection (on former primary after rejoin)
db.getCollection("system.rollback.id").find().pretty();
```

**Best practices:** `{ w: "majority" }` for critical writes; retryable writes/reads; `rs.stepDown()` before patching primary; monitor replication lag.

```
Partition scenario
  DC-A (old primary, minority)     DC-B (majority secondaries)
  ── accepts writes w:1 ──       ── elects NEW primary ──
  On heal: old primary rolls back un-replicated writes
```

## Related Topics

- MongoDB Sharding — horizontal scaling beyond replica sets
- MongoDB Schema Design — migration backfill affects replication lag
- System Design — CAP trade-offs; MongoDB is CP within a replica set partition
