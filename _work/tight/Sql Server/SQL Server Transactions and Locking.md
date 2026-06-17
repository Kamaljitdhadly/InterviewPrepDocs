# SQL Server Transactions and Locking

## Questions Covered

1. What is a transaction in SQL Server, and how do you implement one?
2. Explain different types of lock?
3. what is no-lock in sql server?
4. Explain isolation levels in SQL Server?
5. What is Phantom Read?
6. Non-repeatable read ?
7. What is Snapshot Isolation Level?
8. What is a deadlock, and how do you prevent it?
9. How can you detect and resolve blocking issues in SQL Server?

## What is a transaction in SQL Server, and how do you implement one?

A **transaction** is a sequence of SQL operations executed as a single unit of work, ensuring data integrity even on error or rollback.

### ACID Properties

| Property | Meaning | Example |
|----------|---------|---------|
| **Atomicity** | All operations succeed or none do | Transfer $100 between accounts — rollback on any failure |
| **Consistency** | Valid state to valid state; constraints enforced | Order + OrderDetails FK must both succeed |
| **Isolation** | Concurrent transactions don't interfere unexpectedly | REPEATABLE READ keeps reads stable |
| **Durability** | Committed changes survive system failure | Status update persists after crash |

**Atomicity example:**

```sql
BEGIN TRANSACTION
UPDATE Accounts
SET Balance = Balance - 100
WHERE AccountID = 1;
UPDATE Accounts
SET Balance = Balance + 100
WHERE AccountID = 2;
IF @@ERROR <> 0
BEGIN
ROLLBACK TRANSACTION;
END
ELSE
BEGIN
COMMIT TRANSACTION;
END
```

**Consistency example:**

```sql
BEGIN TRANSACTION
INSERT INTO Orders (OrderID, CustomerID, OrderDate)
VALUES (1, 'C001', GETDATE());
INSERT INTO OrderDetails (OrderID, ProductID, Quantity)
VALUES (1, 'P001', 2);
COMMIT TRANSACTION;
```

**Isolation example:**

```sql
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
BEGIN TRANSACTION
SELECT * FROM Products WHERE ProductID = 'P001';
SELECT * FROM Products WHERE ProductID = 'P001';
COMMIT TRANSACTION;
```

**Durability example:**

```sql
BEGIN TRANSACTION
UPDATE Orders
SET Status = 'Completed'
WHERE OrderID = 1;
COMMIT TRANSACTION;
```

### Implementing Transactions

| Statement | Purpose |
|-----------|---------|
| `BEGIN TRANSACTION` | Start a transaction |
| `COMMIT` | Make changes permanent |
| `ROLLBACK` | Undo all changes |

```sql
BEGIN TRANSACTION;
BEGIN TRY
-- Perform operations
INSERT INTO Employees (EmployeeID, Name, Position)
VALUES (1, 'John Doe', 'Manager');
UPDATE Departments
SET Budget = Budget - 1000
WHERE DepartmentID = 1;
-- Commit the transaction if all operations succeed
COMMIT;
END TRY
BEGIN CATCH
-- Rollback the transaction if an error occurs
ROLLBACK;
-- Optionally, handle the error
SELECT ERROR_MESSAGE() AS ErrorMessage;
END CATCH;
```

**Additional considerations:**

- Transactions can span multiple statements/procedures — keep scope short.
- **IMPLICIT_TRANSACTIONS** mode auto-wraps each statement.
- **Isolation levels** control concurrency vs consistency trade-offs.
- Locks and deadlocks require careful transaction design.

## Explain different types of lock?

### Lock Modes

| Lock | Behavior |
|------|----------|
| **Shared (S)** | Concurrent reads; no modifications |
| **Exclusive (X)** | Modifies resource; blocks all other access |
| **Update (U)** | Hybrid for updates; prevents deadlocks during read-then-write |
| **Intent Shared (IS)** | Intent to acquire S locks at lower level |
| **Intent Exclusive (IX)** | Intent to acquire X locks at lower level |
| **SIX** | Shared on resource + intent to lock subordinates exclusively |
| **Schema Modification (Sch-M)** | Schema changes |
| **Schema Stability (Sch-S)** | Query compilation |
| **Bulk Update (BU)** | Parallel bulk load operations |

### Lock Granularity

| Level | Scope |
|-------|-------|
| Row | Individual row |
| Page | Data page (multiple rows) |
| Table | Entire table |
| Database | Entire database |
| Key-range | Range of rows in range queries |

### Lock Escalation

SQL Server converts many fine-grained (row/page) locks into a coarser lock (e.g., table) to reduce lock management overhead.

### Deadlocks and Timeouts

Deadlocks occur when transactions circularly wait on each other's locks — SQL Server kills one victim. **Lock timeouts** prevent indefinite waits.

## what is no-lock in sql server?

**NOLOCK** is a table hint for **non-blocking reads** — the query does not acquire shared locks and ignores exclusive locks held by writers.

```sql
SELECT *
FROM Orders WITH (NOLOCK);
Alternatively, you can use it within the FROM clause for specific tables:
SELECT o.OrderID, o.CustomerID, o.OrderDate
FROM Orders o WITH (NOLOCK)
JOIN Customers c WITH (NOLOCK) ON o.CustomerID = c.CustomerID
WHERE o.OrderDate BETWEEN '2023-01-01' AND '2023-12-31';
```

**Trade-offs:**

| Benefit | Risk |
|---------|------|
| Reduced locking contention | **Dirty reads** (uncommitted data) |
| Higher throughput in busy systems | **Non-repeatable reads** |
| | **Phantom reads** |

**When to use:** reporting queries and data warehousing where approximate real-time accuracy is acceptable.

**Alternatives:**

```sql
ALTER DATABASE YourDatabaseName
SET READ_COMMITTED_SNAPSHOT ON;
```

```sql
ALTER DATABASE YourDatabaseName
SET ALLOW_SNAPSHOT_ISOLATION ON;
```

RCSI and Snapshot Isolation use row versioning for consistency without NOLOCK's dirty-read risks.

**Example** — high-traffic e-commerce reporting:

```sql
SELECT OrderID, CustomerID, OrderDate, Amount
FROM Orders WITH (NOLOCK)
WHERE OrderDate BETWEEN '2023-01-01' AND '2023-12-31';
```

Use NOLOCK judiciously; prefer RCSI or Snapshot Isolation when consistency matters.

## Explain isolation levels in SQL Server?

**Isolation levels** control how transactions see each other's changes, balancing consistency vs concurrency.

| Level | Dirty Read | Non-Repeatable | Phantom | Notes |
|-------|-----------|----------------|---------|-------|
| Read Uncommitted | Yes | Yes | Yes | Fastest; no read locks |
| Read Committed | No | Yes | Yes | **Default**; locks released after read |
| Repeatable Read | No | No | Yes | Holds shared locks until commit |
| Serializable | No | No | No | Range locks; lowest concurrency |
| Snapshot | No | No | No | Row versioning; non-blocking |

**Use cases:** Read Uncommitted for approximate reporting; Read Committed for general apps; Repeatable Read for financial read-update; Serializable for critical integrity; Snapshot for OLAP/high-read consistency.

### Locks by Statement Type

**SELECT** — acquires **Shared (S)** and **Intent Shared (IS)** locks; behavior varies by isolation level (no locks at Read Uncommitted; held until commit at Repeatable Read; range locks at Serializable; versioning at Snapshot).

**UPDATE** — acquires **Exclusive (X)** locks held until COMMIT/ROLLBACK, blocking other readers/writers on locked rows.

```sql
BEGIN TRANSACTION;
-- Update statement acquires an exclusive lock on the affected rows
UPDATE mytable
SET column1 = value
WHERE condition;
-- The exclusive lock remains until the transaction is completed
-- Perform other operations as needed
-- Commit or rollback the transaction to release the lock
COMMIT TRANSACTION;
-- or
ROLLBACK TRANSACTION;
```

Keep transactions short to minimize blocking.

## What is Phantom Read?

A **phantom read** occurs when a transaction reads rows matching a condition, then re-reads and finds **new or missing rows** inserted/deleted by another committed transaction.

| OrderID | CustomerID | Amount |
|---------|------------|--------|
| 1 | 101 | 500 |
| 2 | 102 | 300 |
| 3 | 101 | 200 |

**Transaction A** — first read:

```sql
BEGIN TRANSACTION;
SELECT * FROM Orders WHERE CustomerID = 101;
```

| OrderID | CustomerID | Amount |
|---------|------------|--------|
| 1 | 101 | 500 |
| 3 | 101 | 200 |

**Transaction A** — second read (phantom):

```sql
SELECT * FROM Orders WHERE CustomerID = 101;
```

| OrderID | CustomerID | Amount |
|---------|------------|--------|
| 1 | 101 | 500 |
| 3 | 101 | 200 |
| 4 | 101 | 700 |

```sql
Transaction A sees a new row with OrderID = 4 that was not present in the first read.
```

**Transaction B** inserts while A is open:

```sql
While Transaction A is open, Transaction B inserts a new order for CustomerID = 101.
BEGIN TRANSACTION;
INSERT INTO Orders (OrderID, CustomerID, Amount) VALUES (4, 101, 700);
COMMIT TRANSACTION;
```

**Prevention:** Serializable uses range locks; Snapshot uses versioning. Read Committed and Repeatable Read allow phantom reads.

## Non-repeatable read ?

A **non-repeatable read** occurs when a transaction reads the same row twice and gets **different values** because another transaction modified and committed the data between reads.

| AccountID | Balance |
|-----------|---------|
| 1 | 1000 |
| 2 | 2000 |

**Transaction A:**

```sql
BEGIN TRANSACTION;
SELECT Balance FROM Accounts WHERE AccountID = 1;
**Result**: Balance = 1000
```

**Transaction A** — second read:

```sql
SELECT Balance FROM Accounts WHERE AccountID = 1;
**Result**: Balance = 900
```

**Transaction B** updates while A is open:

```sql
While Transaction A is open, Transaction B updates the balance for AccountID = 1.
BEGIN TRANSACTION;
UPDATE Accounts SET Balance = Balance - 100 WHERE AccountID = 1;
COMMIT TRANSACTION;
```

**Prevention:** Repeatable Read and Serializable hold shared locks; Read Committed releases locks immediately after read.

## What is Snapshot Isolation Level?

**Snapshot Isolation** provides a **consistent snapshot** of data at transaction start using **row versioning** in tempdb instead of traditional locking — eliminating dirty, non-repeatable, and phantom reads without blocking.

**How it works:**

1. **Version Store** in tempdb keeps old row versions on updates.
2. Transactions see data as of their start time.
3. Reads don't block writes (and vice versa).
4. **Commit conflicts** — if another transaction committed changes to data you're updating, your commit fails.

**Enable:**

```sql
ALTER DATABASE YourDatabase SET ALLOW_SNAPSHOT_ISOLATION ON;
```

```sql
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
-- Perform your queries and updates here
COMMIT TRANSACTION;
```

**Example** — two concurrent snapshot transactions on Accounts (1000/2000):

| **AccountID** | **Balance** |
|---------------|-------------|
| 1             | 1000        |
| 2             | 2000        |

**Transaction A**

```sql
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
-- Read initial balances
SELECT * FROM Accounts;
```

```sql
UPDATE Accounts SET Balance = Balance - 100 WHERE AccountID = 1;
```

```sql
COMMIT TRANSACTION;
```

**Transaction B**

```sql
SET TRANSACTION ISOLATION LEVEL SNAPSHOT;
BEGIN TRANSACTION;
-- Read initial balances
SELECT * FROM Accounts;
```

```sql
UPDATE Accounts SET Balance = Balance - 200 WHERE AccountID = 2;
```

```sql
COMMIT TRANSACTION;
```

**Advantages:** non-blocking reads, consistent view, high concurrency.

**Considerations:** tempdb storage/I/O overhead; commit-time update conflicts; not equivalent to full Serializable semantics for all complex scenarios.

## What is a deadlock, and how do you prevent it?

A **deadlock** occurs when two or more transactions each hold a lock the other needs, creating a circular wait. SQL Server detects deadlocks and rolls back one **victim** transaction.

**Example:** Transaction A holds Resource X, needs Y; Transaction B holds Y, needs X.

**Prevention:**

1. **Short transactions** — minimize lock hold time.
2. **Consistent resource access order** — prevents cyclic dependencies.
3. **Minimize lock contention** — fewer, shorter-held locks.
4. **Appropriate isolation levels** — READ COMMITTED over SERIALIZABLE when possible.
5. **Retry logic** — reattempt after victim rollback.
6. **Optimize queries** — indexing reduces lock duration.

## How can you detect and resolve blocking issues in SQL Server?

**Blocking** — one transaction holds a lock preventing others from accessing the same resource (not circular like deadlocks).

### Detecting Blocking

| Tool | Use |
|------|-----|
| SSMS Activity Monitor | Visual blocking chains |
| `sys.dm_exec_requests` | Blocking session details |
| `sys.dm_exec_sessions` | Active session info |
| `sys.dm_tran_locks` | Current lock holders |
| SQL Server Profiler | Capture blocking events |

```sql
SELECT
blocking_session_id AS BlockingSessionID,
session_id AS BlockedSessionID,
wait_type,
wait_time,
wait_resource
FROM sys.dm_exec_requests
WHERE blocking_session_id <> 0;
```

### Resolving Blocking

1. Optimize or break up long-running transactions.
2. Index and tune blocking queries.
3. Locking hints (`NOLOCK`, `READPAST`) — use cautiously.
4. Monitor resource contention (CPU, I/O, memory).
5. Lower isolation levels where appropriate.
6. Analyze deadlock graphs via Profiler/Extended Events.
7. Set transaction/query timeouts to avoid indefinite waits.

**Deadlock resolution:** capture deadlock graph → analyze transaction dependencies → adjust access order or split transactions in application logic.
