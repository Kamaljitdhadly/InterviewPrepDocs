# SQL Server Interview Scenarios

**What this is:** SQL Server behavior under **concurrency, scale, and operational stress** — not "write a SELECT." Interviewers describe symptoms (random 500s, wrong balances, failover writes to dead primary) and expect you to connect them to isolation levels, indexes, hints, and connection semantics.

**Pair with:** Sql Server Transactions and Locking for fundamentals; Query Optimization for plan analysis.

## Questions Covered

1. Two transactions deadlock — SQL Server picks victim. App shows random 500s. Full handling?
2. Parameter sniffing: fast in dev, timeout in prod on same query. Diagnose and fix?
3. `READ COMMITTED` but report counts rows twice during ETL — how?
4. You add index on `WHERE Email LIKE '%@contoso.com'` — still table scan. Why?
5. Identity column hot spot on `INSERT` — 10k/sec inserts serialize. Options?
6. FK without index on child table — parent `DELETE` blocks entire system. Explain?
7. `NOLOCK` hint fixed blocking — now finance sees negative balance. What happened?
8. Always On failover — app keeps writing to old primary 30 seconds. Why?
9. Tempdb full — what three common app patterns cause it?
10. Statistics updated nightly — Monday morning plans are fast, Friday slow. Why?
11. Split `varchar(max)` update — log explodes, replication lag 2 hours. Cause?
12. RowVersion optimistic concurrency — user overwrites without knowing. UX fix?

## Two transactions deadlock — full handling?

**Context:**

```sql
-- Tx A: lock Orders then OrderLines
-- Tx B: lock OrderLines then Orders
-- SQL Server detects cycle, kills victim — error 1205
```

**What trips people up:** Returning 500 to user without **retry** — deadlocks are expected under concurrency.

```csharp
const int maxRetries = 3;
for (int i = 0; i < maxRetries; i++)
{
    try
    {
        await using var tx = await _db.Database.BeginTransactionAsync();
        // ... work ...
        await tx.CommitAsync();
        return;
    }
    catch (SqlException ex) when (ex.Number == 1205)
    {
        await Task.Delay(Random.Shared.Next(50, 200));  // jitter
    }
}
```

**Prevention:** Consistent lock order (parent before child), shorter transactions, indexes to reduce lock footprint.

**Strong close:** "1205 is normal — retry with jitter; fix design to reduce deadlock frequency."

## Parameter sniffing — fast in dev, timeout in prod?

**Context:** Stored procedure `@Status` first compiled with `Status = 'Open'` (millions of rows) — scan plan cached. Production call with `Status = 'Shipped'` (few rows) reuses bad plan — timeout or nested loop disaster.

**Diagnose:**

```sql
EXEC sp_BlitzCache @SortOrder = 'CPU';
-- Compare parameter compile value vs actual in plan cache
```

**Fixes:** `OPTION (RECOMPILE)` for skewed params; `OPTIMIZE FOR UNKNOWN`; filtered indexes per status; Query Store force good plan.

**Strong close:** "First parameter value bakes the plan — sniffing is a compile-time vs runtime data mismatch."

## READ COMMITTED — report counts rows twice during ETL?

**Context:** Long report runs `COUNT(*)` while ETL inserts committed batches — if report scans twice, counts differ. Or **non-repeatable read** within one transaction without snapshot.

**What trips people up:** Assuming `READ COMMITTED` means stable reads throughout a transaction.

**Fix:** `SNAPSHOT` isolation for report session; read from **replica**; or materialized snapshot / cube for reporting.

**Strong close:** "Reporting needs repeatable read or snapshot — not default read committed across long scans."

## Index on LIKE '%@contoso.com' — still scan?

**Context:** Leading wildcard `%` prevents B-tree **seek** — index on `Email` cannot be used efficiently.

| Approach | When |
|----------|------|
| **Full-text index** | Email/description search |
| **Computed persisted column** | Extract domain, index domain |
| **Elastic / OpenSearch** | Heavy search workloads |

```sql
ALTER TABLE Users ADD EmailDomain AS
  SUBSTRING(Email, CHARINDEX('@', Email), 100) PERSISTED;
CREATE INDEX IX_Users_EmailDomain ON Users(EmailDomain);
WHERE EmailDomain = '@contoso.com'  -- seekable
```

**Strong close:** "Sargability — leading wildcard kills B-tree; restructure data or use FTS."

## Identity hot spot — 10k inserts/sec?

**Context:** `IDENTITY` on **clustered** primary key — all inserts hit the **last page** of the B-tree → latch contention (insert hot spot).

**Fixes:** `SEQUENCE` with hash partition scheme; `NEWSEQUENTIALID()` for GUID clustered PK (different fragmentation trade-off); In-Memory OLTP for extreme insert rates.

**Strong close:** "Monotonic clustered identity serializes inserts on one page — spread keys or partition."

## FK without index on child — parent DELETE blocks system?

**Context:** `DELETE FROM Customers WHERE Id = 1` must verify no child `Orders` — without index on `Orders.CustomerId`, SQL Server **scans** Orders and locks huge ranges.

```sql
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
```

**Symptom:** `LCK_M_S` blocking chain — one delete blocks all order activity.

**Strong close:** "Every FK child column needs an index — parent deletes/updates probe children."

## NOLOCK — finance sees negative balance?

**Context:** Dev adds `(NOLOCK)` to fix blocking reports. Finance sees balances that **don't exist** — uncommitted rows read, then rolled back.

**What happened:** `NOLOCK` = **dirty read** — not a isolation level, a read-uncommitted hint.

**Better:**

```sql
ALTER DATABASE Contoso SET READ_COMMITTED_SNAPSHOT ON;
```

Readers see committed row version without blocking writers; no dirty reads.

**Strong close:** "NOLOCK trades correctness for speed — use RCSI instead for read/write concurrency."

## Always On failover — app writes to old primary 30s?

**Context:** Failover completes; app still sends writes to old node — split brain or login failures.

**Causes:** Connection string points to **node name** not listener; pool holds open connections to old primary; no `MultiSubnetFailover`.

**Fix:** AG **listener** in connection string; `MultiSubnetFailover=True`; `ApplicationIntent=ReadOnly` for replicas; clear pool on failover notification in app if needed.

**Strong close:** "Connection pool is sticky — listener + failover attributes + pool awareness."

## Tempdb full — three common causes?

| Cause | Pattern |
|-------|---------|
| **Sort/hash spills** | Huge `ORDER BY` / `GROUP BY` without enough memory grant |
| **Version store** | Long transactions under RCSI/MVCC — versions accumulate in tempdb |
| **Temp tables / table variables** | ETL creates millions of `#temp` objects |

```sql
SELECT * FROM sys.dm_db_file_space_usage;
SELECT * FROM sys.dm_tran_active_snapshot_database_transactions;
```

**Strong close:** "Tempdb is shared — spills, version store, and temp object churn are top culprits."

## Statistics stale by Friday?

**Context:** Auto-update threshold (roughly 20% + 500 row change) not triggered on billion-row table with gradual skew. Monday plan OK; Friday peak traffic uses nested loop on wrong cardinality estimate.

**Fix:** Scheduled `UPDATE STATISTICS`; `AUTO_UPDATE_STATISTICS_ASYNC`; Query Store alerts on regression.

**Strong close:** "Auto-stats has a threshold — large tables need proactive maintenance."

## varchar(max) update — log explosion?

**Context:** Updating large `varchar(max)` column may not update in place — row moves, transaction log records full old + new value; replication/CDC applies slowly → hours of lag.

**Fix:** Smaller row design; avoid frequent large in-place updates; separate blob storage; CDC instead of transactional replication for analytics.

**Strong close:** "Large row updates are log-heavy — design away from hot large-column updates."

## RowVersion concurrency — UX fix?

```sql
CREATE TABLE Orders (
  Id int PRIMARY KEY,
  RowVer rowversion,
  Total decimal(18,2)
);
```

```csharp
catch (DbUpdateConcurrencyException)
{
    // "Someone else changed this order. Reload and retry?"
}
```

**Without handling:** Last write wins — lost update, angry users.

**Strong close:** "`rowversion` + catch concurrency exception + merge UI — never silent overwrite."

## Related Topics

- Sql Server/SQL Server Transactions and Locking.md
- Sql Server/SQL Server Query Optimization Techniques.md
- Interview Scenarios/Microservices Interview Scenarios.md
