# Transactions, ACID & Isolation Levels

## Concept Explanation

A **transaction** is a unit of work that either fully completes (**COMMIT**) or fully undoes (**ROLLBACK**). Transactions guarantee **ACID**:

- **Atomicity** — all or nothing.
- **Consistency** — moves the DB from one valid state to another (constraints hold).
- **Isolation** — concurrent transactions don't interfere (controlled by isolation level).
- **Durability** — once committed, changes survive crashes.

**Isolation levels** trade consistency vs concurrency by controlling which **concurrency phenomena** are allowed:

| Phenomenon | Meaning |
|---|---|
| **Dirty read** | reading another transaction's *uncommitted* changes |
| **Non-repeatable read** | a row's value changes if re-read in the same transaction |
| **Phantom read** | new rows appear matching a re-run query |

| Isolation level | Dirty | Non-repeatable | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | ✅ allowed | ✅ | ✅ |
| READ COMMITTED *(default)* | ❌ | ✅ | ✅ |
| REPEATABLE READ | ❌ | ❌ | ✅ |
| SERIALIZABLE | ❌ | ❌ | ❌ |
| SNAPSHOT | ❌ | ❌ | ❌ (via row versioning) |

## Code Example(s)

```sql
-- Explicit transaction with error handling
BEGIN TRY
    BEGIN TRANSACTION;
        UPDATE Accounts SET Balance = Balance - 100 WHERE Id = 1;
        UPDATE Accounts SET Balance = Balance + 100 WHERE Id = 2;
    COMMIT TRANSACTION;            -- both succeed together
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION; -- undo everything on error
    THROW;
END CATCH;
```

```sql
-- Setting an isolation level
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;   -- default
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;          -- readers don't block writers
```

## Interview Q&A

**🟢 What is a transaction?**
A unit of work that executes as a whole — it either fully commits or fully rolls back, leaving the database consistent.

**🟢 What does ACID stand for?**
Atomicity, Consistency, Isolation, Durability — the guarantees that make transactions reliable.

**🟡 What is a dirty read?**
Reading data that another transaction has modified but not yet committed; if that transaction rolls back, you read data that never officially existed. Only possible at READ UNCOMMITTED.

**🟡 What's the default isolation level in SQL Server, and what does it prevent?**
READ COMMITTED. It prevents dirty reads (you only see committed data) but still allows non-repeatable and phantom reads.

**🔴 What's the difference between SERIALIZABLE and SNAPSHOT isolation?**
Both prevent dirty/non-repeatable/phantom reads. SERIALIZABLE uses **locking** (range locks), reducing concurrency and risking blocking/deadlocks. SNAPSHOT uses **row versioning** (in tempdb) so readers see a consistent point-in-time snapshot without blocking writers — better concurrency, but can hit update conflicts.

## ⚠️ Tricky / Gotchas

- **`WITH (NOLOCK)`** is READ UNCOMMITTED — it can return dirty, duplicated, or missing rows. It's not a safe "go faster" hint despite being widely (mis)used.
- **Higher isolation = more locking = more blocking/deadlocks** and lower concurrency. There's always a trade-off.
- **A `ROLLBACK` resets `@@TRANCOUNT` to 0**, but nested `BEGIN TRAN` only increments the counter — only the outermost commit actually commits. Use `@@TRANCOUNT`/savepoints carefully.
- **Long transactions hold locks** and bloat the log / version store — keep them short.
- **Deadlocks**: two transactions each holding a lock the other needs. SQL Server kills one (the "deadlock victim"); apps should catch and retry.
- **Consistency ≠ isolation** — interviewers test whether you can separate the C and the I in ACID.

## 📌 Quick Recap

- Transaction = atomic unit; COMMIT all or ROLLBACK all.
- ACID: Atomicity, Consistency, Isolation, Durability.
- Phenomena: dirty read, non-repeatable read, phantom read.
- Levels (low→high): READ UNCOMMITTED → READ COMMITTED (default) → REPEATABLE READ → SERIALIZABLE; SNAPSHOT uses row versioning.
- Higher isolation = safer but more blocking; `NOLOCK` = dirty reads.
- Keep transactions short; handle deadlocks with retries.
