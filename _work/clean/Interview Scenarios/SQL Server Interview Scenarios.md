# SQL Server Interview Scenarios

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

## Two transactions deadlock — SQL Server picks victim. Full handling?

**Scenario:**

```sql
-- Tx A: lock Orders then OrderLines
-- Tx B: lock OrderLines then Orders
-- Deadlock graph 1205 on one victim
```

**90% miss:** Retry is **required** — not optional.

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
        await Task.Delay(Random.Shared.Next(50, 200));
    }
}
```

**Prevention:** Consistent lock order (always parent then child), shorter transactions, right indexes to reduce lock footprint.

## Parameter sniffing: fast in dev, timeout in prod?

**Scenario:** Stored proc `@Status` first compiled with `Status=Open` (5M rows) — scan plan. Prod call `Status=Shipped` (100 rows) uses same plan — nested loop disaster or reverse.

**Diagnose:**

```sql
EXEC sp_BlitzCache @SortOrder = 'CPU';
-- Check @parameter_value vs actual in plan cache
```

**Fixes:** `OPTION (RECOMPILE)`, `OPTIMIZE FOR UNKNOWN`, local variable trick (legacy), filtered indexes per status, `Query Store` force plan.

## READ COMMITTED but report counts rows twice during ETL?

**Scenario:** Long-running report `COUNT(*)` while ETL **inserts** rows committed in batches — count not repeatable if report scans twice.

Or: **read skew** — two reads same row different values in one transaction without snapshot.

**Fix for consistent report:** `SNAPSHOT` or `REPEATABLE READ` for report transaction, or read from **read replica**, or **snapshot table** / cube.

## Index on LIKE '%@contoso.com' — still scan?

**Scenario:** Leading wildcard prevents B-tree seek.

**Options:**

| Approach | When |
|----------|------|
| **Full-text index** | Search emails, descriptions |
| **Computed persisted column** | Parse domain, index domain |
| **Elastic / OpenSearch** | Heavy search |
| **Trigram (PostgreSQL)** | Not native SQL Server — use FTS |

```sql
ALTER TABLE Users ADD EmailDomain AS SUBSTRING(Email, CHARINDEX('@', Email), 100) PERSISTED;
CREATE INDEX IX_Users_EmailDomain ON Users(EmailDomain);
```

## Identity hot spot — 10k inserts/sec?

**Scenario:** `IDENTITY` on clustered PK — last page latch contention (insert same page).

**Fixes:** `SEQUENCE` with `HASH` distribution, partition scheme, `NEWSEQUENTIALID()` for GUIDs (different trade-off), In-Memory OLTP for extreme insert rates.

## FK without index on child — parent DELETE blocks system?

**Scenario:** `DELETE FROM Customers WHERE Id=1` must verify no `Orders` — table scan on Orders locks millions of rows.

```sql
CREATE INDEX IX_Orders_CustomerId ON Orders(CustomerId);
```

**Symptom:** `LCK_M_S` blocking chain — one delete blocks all order inserts.

## NOLOCK fixed blocking — finance sees negative balance?

**Scenario:** Developer adds `(NOLOCK)` everywhere — reads **uncommitted** rows; rollback makes "ghost" debits vanish; balance wrong.

**Lesson:** `NOLOCK` = dirty read. Use `READ COMMITTED SNAPSHOT` at DB level instead:

```sql
ALTER DATABASE Contoso SET READ_COMMITTED_SNAPSHOT ON;
```

Readers don't block writers; readers see committed version without dirty reads.

## Always On failover — app writes to old primary 30 seconds?

**Scenario:** Connection string points to listener; failover occurs; connection pool has open connections to old replica; `Login failed` or split writes.

**Fix:** `MultiSubnetFailover=True`, connection retry, `ApplicationIntent=ReadOnly` for replicas, pool clear on failover detection, use **AG listener** not node name.

## Tempdb full — three common causes?

| Cause | Pattern |
|-------|---------|
| **Sort/hash spills** | Huge `ORDER BY` / `GROUP BY` without memory grant |
| **Version store** | Long transactions under RCSI/MVCC |
| **Table variables / #temp** | ETL creates millions of temp objects |

```sql
SELECT * FROM sys.dm_db_file_space_usage;
SELECT * FROM sys.dm_tran_active_snapshot_database_transactions;
```

## Statistics stale by Friday?

**Scenario:** Auto-update threshold (20% + 500 rows) not hit for large table with gradual data skew — plan picks nested loop on Friday peak.

**Fix:** Manual `UPDATE STATISTICS`, `AUTO_UPDATE_STATISTICS_ASYNC`, Query Store plan regression alert.

## varchar(max) update — log explosion?

**Scenario:** In-place update not possible — row moves, logs full old+new value, replication applies slowly.

**Fix:** Smaller row size, `TEXTIMAGE_ON` separate filegroup, avoid frequent large updates, CDC instead of replication for analytics.

## RowVersion concurrency — UX fix?

```sql
CREATE TABLE Orders (
  Id int PRIMARY KEY,
  RowVer rowversion,
  Total decimal(18,2)
);
```

```csharp
// EF Core concurrency token
catch (DbUpdateConcurrencyException)
{
    // Show user: "Someone else changed this order. Reload?"
}
```

Without handling — last write wins silently — lost update problem.

## Related Topics

- Sql Server/SQL Server Transactions and Locking.md
- Sql Server/SQL Server Query Optimization Techniques.md
- Interview Scenarios/Microservices Interview Scenarios.md
