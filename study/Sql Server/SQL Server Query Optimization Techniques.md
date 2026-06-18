# SQL Server Query Optimization Techniques

## Questions Covered

1. What are indexes, and how do they improve query performance?
2. Explain the difference between table scans, index scans, and index seeks.
3. What are filtered indexes, and when would you use them?
4. How can you determine if an index is being used or not?
5. What is full-text indexing, and how do you implement it?
6. Explain the concept of columnstore indexes and how they work.
7. How do you force a query to use a specific index?
8. Explain index fragmentation and how to resolve it.

## What are indexes, and how do they improve query performance?

**Indexes** speed up row retrieval by organizing column values in searchable structures (typically B-trees) — like a book index for your table.

### How Indexes Work

1. **Data Structure** — B-trees or hash tables for fast search/insert/delete.
2. **Index Keys** — one or more columns whose values are organized for rapid lookup.
3. **Index Pages** — pages of index entries pointing to data rows.

### Types of Indexes

| Type | Definition | Impact |
|------|------------|--------|
| Clustered | Physical row order; one per table | Fast range scans and sorting |
| Non-Clustered | Separate sorted structure with row pointers | Multiple per table; no physical reorder |
| Unique | Enforces unique values in indexed columns | Data integrity |
| Full-Text | Word-based text search | Complex text queries |
| Composite | Multiple columns | Multi-column filter/sort |

```sql
CREATE CLUSTERED INDEX idx_EmployeeID
ON Employees (EmployeeID);
```

```sql
CREATE NONCLUSTERED INDEX idx_LastName
ON Employees (LastName);
```

```sql
CREATE UNIQUE INDEX idx_UniqueEmail
ON Employees (Email);
```

```sql
CREATE FULLTEXT INDEX ON Employees (Description)
KEY INDEX PK_EmployeeID;
```

```sql
CREATE NONCLUSTERED INDEX idx_Composite
ON Employees (LastName, FirstName);
```

### Performance Benefits

- **Faster retrieval** — locate rows without full table scans.
- **Efficient sorting/filtering** — pre-sorted structure for `ORDER BY`/`WHERE`.
- **Reduced I/O** — fewer pages read.
- **Improved joins** — faster matching on indexed join columns.
- **Faster aggregates** — quicker access to relevant rows.

### Trade-Offs

- **Write overhead** — INSERT/UPDATE/DELETE must update indexes.
- **Storage cost** — indexes consume disk space.
- **Maintenance** — fragmentation requires reorganize/rebuild.
- **Design matters** — balance read gains against write/storage costs.

## Explain the difference between table scans, index scans, and index seeks.

These are the optimizer's data-access methods — efficiency depends on indexes, selectivity, and data size.

### Table Scan

Reads **every row** in the table. Occurs when no usable index exists, or the optimizer judges a full scan cheaper (small table or large result set).

- Full table access; inefficient on large tables.
- No index involved.

```sql
SELECT * FROM Employees WHERE Salary > 50000;
```

Without an index on `Salary`, SQL Server scans all rows.

**Best for:** very small tables.

### Index Scan

Reads **all entries** in an index. Used when an index exists but the query doesn't narrow results enough for seeks.

- Scans entire index (smaller than table, but still costly at scale).
- Faster than table scan; slower than seek for selective queries.

```sql
SELECT * FROM Employees WHERE DepartmentID BETWEEN 1 AND 5;
```

Broad range on indexed `DepartmentID` may trigger index scan.

**Best for:** queries returning a large percentage of rows.

### Index Seek

Navigates the B-tree **directly** to matching rows — most efficient for selective queries.

- Direct lookup; highly selective.
- Leverages index structure.

```sql
SELECT * FROM Employees WHERE EmployeeID = 101;
```

With an index on `EmployeeID`, SQL Server seeks directly to the row.

**Best for:** queries returning a small subset of rows.

| Method | Reads | Efficiency | When Used |
|--------|-------|------------|-----------|
| Table Scan | All table rows | Lowest (large tables) | No index; small table |
| Index Scan | All index entries | Medium | Index exists; broad range |
| Index Seek | Targeted rows | Highest | Selective filter on index |

## How can you determine if an index is being used or not?

Use a combination of execution plans, DMVs, and I/O statistics:

1. **Actual Execution Plan** (SSMS) — verify **Index Seek** or **Index Scan** on the expected index vs a table scan.
2. **sys.dm_db_index_usage_stats** — `user_seeks`, `user_scans`, `user_lookups`, `user_updates` since last restart (reset when index is dropped/recreated).
3. **sys.dm_db_index_operational_stats** — operational-level seeks/scans/lookups.
4. **SET STATISTICS IO ON** — compare logical reads with and without the index.
5. **Query Store** — plan history and regressions after index changes.

```sql
SELECT
  OBJECT_NAME(s.object_id) AS TableName,
  i.name AS IndexName,
  s.user_seeks,
  s.user_scans,
  s.user_lookups,
  s.user_updates,
  s.last_user_seek,
  s.last_user_scan
FROM sys.dm_db_index_usage_stats AS s
INNER JOIN sys.indexes AS i
  ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE OBJECT_NAME(s.object_id) = 'YourTableName';
```

If `user_seeks` and `user_scans` stay at zero while queries filter on indexed columns, the optimizer may be ignoring the index (stale statistics, low selectivity, or implicit conversions).
## What are filtered indexes, and when would you use them?

A **filtered index** is a non-clustered index on a **subset** of rows (via `WHERE`), reducing size and maintenance cost while speeding targeted queries.

### Advantages

1. Faster searches on frequently queried subsets.
2. Smaller index footprint.
3. Lower maintenance on writes outside the filter.
4. Ideal for **sparse columns** (many NULLs).

### When to Use

- Frequently queried subsets (active records, specific status).
- Sparse data (exclude NULLs).
- Read-heavy workloads with narrow filters.
- Highly selective conditions.

### Examples

Active orders only:

CREATE NONCLUSTERED INDEX IX_Orders_ActiveStatus

ON Orders (OrderDate)

```sql
WHERE Status = 'Active';
```

Non-null emails only:

CREATE NONCLUSTERED INDEX IX_Customers_EmailAddress

ON Customers (EmailAddress)

```sql
WHERE EmailAddress IS NOT NULL;
```

**Use cases:** status filtering, date ranges, sparse columns, boolean flags (`IsActive = 1`).

The optimizer uses the filtered index when query predicates match the filter:

```sql
SELECT OrderID, OrderDate
FROM Orders
WHERE Status = 'Active';
This query will benefit from the filtered index, as the index contains only the rows where Status = 'Active'.
```

## What is full-text indexing, and how do you implement it?

**Full-text indexing** enables efficient word/phrase/pattern searches on large text columns (`VARCHAR`, `TEXT`, `XML`) — far beyond what `LIKE` can do at scale.

### Key Features

- **Word-based searches** — proximity, inflectional forms, synonyms, wildcards.
- **Language support** — word-breaking and stemming per language.
- **Advanced queries** — prefix (`word*`), proximity (`NEAR`), exact phrase (`CONTAINS`), semantic (`FREETEXT`).

### Implementation Steps

**1. Verify Full-Text is installed:**

```sql
SELECT SERVERPROPERTY('IsFullTextInstalled');
```

**2. Create a catalog:**

CREATE FULLTEXT CATALOG MyFullTextCatalog;

**3. Create table and full-text index:**

```sql
CREATE TABLE Articles
```

(

```sql
ArticleID INT PRIMARY KEY,
Title NVARCHAR(200),
```

Body TEXT

```sql
);
```

CREATE FULLTEXT INDEX ON Articles(Title, Body)

KEY INDEX PK_Articles

ON MyFullTextCatalog;

**4. Populate:**

ALTER FULLTEXT INDEX ON Articles START FULL POPULATION;

**5. Query examples:**

```sql
SELECT * FROM Articles
WHERE CONTAINS(Body, 'database');
```

```sql
SELECT * FROM Articles
WHERE CONTAINS(Body, '"database performance"');
```

```sql
SELECT * FROM Articles
WHERE CONTAINS(Body, 'NEAR((database, tuning))');
```

```sql
SELECT * FROM Articles
WHERE FREETEXT(Body, 'database tuning');
```

**6. Manage:**

```sql
ALTER FULLTEXT INDEX ON Articles DISABLE;
```

```sql
ALTER FULLTEXT INDEX ON Articles REBUILD;
```

```sql
DROP FULLTEXT INDEX ON Articles;
```

**Query functions:** `CONTAINS`, `FREETEXT`, `CONTAINSTABLE`, `FREETEXTTABLE` (with rank scores).

**Pros:** fast large-text search, linguistic features. **Cons:** resource-intensive, maintenance overhead; overkill for short text fields.

## Explain the concept of columnstore indexes and how they work.

**Columnstore indexes** store data **column-by-column** (not row-by-row), optimized for analytics, warehousing, and read-heavy aggregation workloads.

**Rowstore** keeps all columns of a row together; **columnstore** groups each column's values — ideal when queries touch few columns across many rows.

### Key Components

- **Segments** — storage unit per column.
- **Row groups** — ~1 million rows per logical block with per-column segments.
- **Compression** — run-length/dictionary encoding; high savings on repetitive data.
- **Batch processing** — processes data in batches for analytical queries.

### Types

1. **Clustered Columnstore Index (CCI)** — entire table in columnar format; best for DW/analytics, not frequent OLTP updates.

```sql
CREATE CLUSTERED COLUMNSTORE INDEX CCI_Sales
ON Sales;
```

2. **Non-Clustered Columnstore Index (NCCI)** — columnstore on top of rowstore table; supports mixed OLTP + reporting.

```sql
CREATE NONCLUSTERED COLUMNSTORE INDEX NCCI_Orders
ON Orders (OrderDate, TotalAmount);
```

3. **Delta store** — row-based buffer for recent inserts/updates before compression into columnstore; enables updatable CCI.

## How do you force a query to use a specific index?

Use **index hints** via `WITH (INDEX(...))` in the `FROM` clause to override the optimizer.

```sql
SELECT column_list
FROM table_name WITH (INDEX(index_name_or_id))
WHERE conditions;
```

**By name:**

```sql
SELECT OrderID, OrderDate, CustomerID
FROM Orders WITH (INDEX(IX_Orders_OrderDate))
WHERE OrderDate = '2024-09-01';
```

**By ID** (from `sys.indexes`):

```sql
SELECT OrderID, OrderDate, CustomerID
FROM Orders WITH (INDEX(2)) -- assuming the index ID is 2
WHERE OrderDate = '2024-09-01';
```

**When to use:** optimizer picks wrong index (stale stats, complex predicates); you know a specific index is optimal.

**Caveats:** may cause suboptimal plans; query breaks if index is dropped; keep statistics current.

**Best practices:** use sparingly; run `UPDATE STATISTICS`; revisit after schema/workload changes.

## Explain index fragmentation and how to resolve it.

**Fragmentation** occurs when index page logical order doesn't match physical disk order — caused by frequent inserts, updates, and deletes. Increases I/O and slows scans/seeks.

### Types

| Type | Description | Impact |
|------|-------------|--------|
| Internal | Unused space within index pages | Wasted space; extra I/O |
| External | Non-contiguous page ordering on disk | Additional I/O for related pages |

### Resolution

1. **REORGANIZE** — lightweight defrag of leaf level; low fragmentation (~5–30%); minimal locking.

```sql
ALTER INDEX [IndexName] ON [TableName]
REORGANIZE;
```

2. **REBUILD** — drops and recreates index; high fragmentation (>30%); more resource-intensive, may lock table.

```sql
ALTER INDEX [IndexName] ON [TableName]
REBUILD;
```

3. **REBUILD WITH ONLINE = ON** (Enterprise) — rebuild without blocking access.

```sql
ALTER INDEX [IndexName] ON [TableName]
REBUILD WITH (ONLINE = ON);
```

4. **UPDATE STATISTICS** — after maintenance, refresh optimizer metadata.

```sql
UPDATE STATISTICS [TableName] [IndexName];
```

**Check fragmentation:** `sys.dm_db_index_physical_stats`. **Best practice:** automate regular maintenance; monitor impact.

## What is an execution plan, and how do you read it?

An **execution plan** is the optimizer's roadmap showing how SQL Server executes a query — essential for performance tuning.

**Purpose:** identify inefficient operations (scans, sorts) and resource bottlenecks (CPU, I/O).

### Types

1. **Estimated** — predicted plan without running the query (SSMS: Ctrl+L).
2. **Actual** — plan used after execution with runtime row counts (Ctrl+M).

### Reading the Plan

**Operators** (icons + labels) connected by arrows showing data flow:

- **Table Scan / Index Scan** — may need better indexes.
- **Index Seek** — efficient targeted access.
- **Nested Loops / Merge Join / Hash Join** — join strategies.
- **Sort** — may indicate missing index.

**Arrows** — thickness = rows processed; thick arrows signal inefficiency.

**Cost %** — focus optimization on highest-cost operators.

**Tooltips** — actual vs estimated rows (discrepancies suggest stale stats), CPU/I/O costs.

**Example query:**

```sql
SELECT FirstName, LastName
FROM Employees
WHERE DepartmentID = 5;
```

Likely shows Index Seek on `DepartmentID`, possible Nested Loops for joins, and final Select operator.

### Optimization Tips

1. Add indexes for frequent scans.
2. Update statistics when row estimates are wrong.
3. Rewrite queries to reduce joins, dataset size, and unnecessary sorts.
4. Implement missing-index suggestions from the plan.

## What is statistics in SQL Server and execution plan?

### What is Statistics in SQL Server?

**Statistics** are metadata describing data distribution in tables/indexes — the optimizer uses them to estimate row counts and choose efficient plans.

**Components:**

- **Histogram** — value ranges and row counts per step.
- **Density vector** — uniqueness info for multi-column stats.
- **String summary** — estimates for `LIKE`/string searches.

| **Range of Age** | **Number of Rows** |
|------------------|--------------------|
| 20 - 30          | 1000               |
| 31 - 40          | 500                |
| 41 - 50          | 200                |

```sql
If you query SELECT * FROM Employees WHERE Age = 25, the statistics tell the optimizer how many rows will likely match the condition, influencing whether it should perform a full table scan or use an index.
```

### 2. Execution Plan in SQL Server

The optimizer generates candidate plans and picks the lowest estimated cost using statistics.

**Example:**

```sql
SELECT FirstName, LastName
FROM Employees
WHERE Age > 30;
```

Likely: **Index Seek** on `Age` → **Key Lookup** for non-indexed columns (`FirstName`, `LastName`).

```sql
SELECT FirstName, LastName
FROM Employees
WHERE Age = 35;
```

View in SSMS: **Display Estimated Execution Plan** or **Include Actual Execution Plan**.

Statistics guide plan selection; the execution plan reveals what was chosen and why.

## What is parameter sniffing, and how do you handle it?

**Parameter sniffing** occurs when the optimizer uses **first-execution parameter values** to build a cached plan reused for all subsequent executions — problematic when parameter values vary widely.

### How It Works

1. First execution "sniffs" parameter values → generates plan.
2. Plan cached in plan cache.
3. Later executions reuse plan even if different values need a different strategy.

**Example:**

```sql
SELECT *
FROM Orders
WHERE OrderDate = @OrderDate;
If the first execution uses @OrderDate = '2023-01-01', the optimizer might create a plan assuming that this date is common and that the query will return a small number of rows. If subsequent executions use a different date, like @OrderDate = '2023-06-01', which might return a large number of rows, the initial plan may not be efficient for this new parameter value.
```

### Handling Techniques

1. **OPTION (RECOMPILE)** — new plan each execution.

```sql
SELECT *
FROM Orders
WHERE OrderDate = @OrderDate
OPTION (RECOMPILE);
```

2. **Local variables** — may reduce sniffing (not guaranteed).

```sql
DECLARE @LocalOrderDate DATE = @OrderDate;
SELECT *
FROM Orders
WHERE OrderDate = @LocalOrderDate;
```

3. **Query hints** — influence plan generation.
4. **Plan guides** — force or influence specific plans.
5. **Plan cache management** — `DBCC FREEPROCCACHE` (temporary fix).
6. **Improve indexes** — reduce plan sensitivity to parameter values.
7. **Query optimization** — analyze plans, optimize joins and data volume.

## What are query hints, and when should you use them?

**Query hints** override the optimizer's default plan choices for a specific query.

### Types

1. **Index hints** — `FORCESEEK`, `FORCESCAN`, `INDEX`.

```sql
SELECT *
FROM Orders
WITH (INDEX(IX_OrderDate))
WHERE OrderDate = '2023-01-01';
```

2. **Join hints** — `LOOP`, `MERGE`, `HASH`.

```sql
SELECT *
FROM Orders o
INNER JOIN Customers c
ON o.CustomerID = c.CustomerID
OPTION (LOOP JOIN);
```

3. **Optimization hints** — `RECOMPILE`, `OPTIMIZE FOR UNKNOWN`.

```sql
SELECT *
FROM Orders
WHERE OrderDate = @OrderDate
OPTION (RECOMPILE);
```

```sql
SELECT *
FROM Orders
WHERE OrderDate = @OrderDate
OPTION (OPTIMIZE FOR UNKNOWN);
```

4. **Parallelism** — `MAXDOP`.

```sql
SELECT *
FROM Orders
OPTION (MAXDOP 2);
```

5. **OPTIMIZE FOR** — plan tuned for specific parameter values.

```sql
SELECT *
FROM Orders
WHERE OrderDate = @OrderDate
OPTION (OPTIMIZE FOR (@OrderDate = '2023-01-01'));
```

### When to Use

- Suboptimal optimizer plans despite indexing/rewriting.
- Complex queries with poor optimizer choices.
- Parameter sniffing issues.
- Need for consistent, predictable performance.
- Testing/troubleshooting plan alternatives.

Use judiciously — test thoroughly and monitor for unintended regressions.

## How do you resolve performance bottlenecks in a SQL Server query?

Systematic approach: identify → optimize → configure → monitor.

### 1. Identify the Bottleneck

- **Execution plans** — expensive scans, joins, sorts.
- **Profiler/Extended Events** — long-running queries.
- **DMVs** — `sys.dm_exec_query_stats`, `sys.dm_exec_requests`, `sys.dm_exec_sql_text`.
- **Wait statistics** — I/O, CPU, locking waits.
- **Resource utilization** — CPU, memory, disk I/O.

### 2. Optimize the Query

- Simplify structure; use appropriate join types.
- Create/update **covering indexes**; maintain via reorganize/rebuild.
- Remove unused indexes.
- Apply hints (`RECOMPILE`, `OPTIMIZE FOR UNKNOWN`) for sniffing issues.

### 3. Optimize Database Design

- Normalize/denormalize as appropriate.
- **Partitioning** for large tables.
- **Update/create statistics** — `UPDATE STATISTICS`, `sp_updatestats`.

### 4. Optimize Server Configuration

- Adequate hardware resources.
- Memory allocation for SQL Server.
- **MAXDOP** and **cost threshold for parallelism**.

### 5. Monitor and Maintain

- Continuous performance monitoring.
- Regular backups and `DBCC CHECKDB`.

**Example** — slow date-range query:

```sql
SELECT OrderID, CustomerID, OrderDate
FROM Orders
WHERE OrderDate BETWEEN '2023-01-01' AND '2023-12-31';
```

1. Check plan for table/index scan.
2. Create index:

```sql
CREATE INDEX IX_OrderDate ON Orders(OrderDate);
```
3. Update stats:

```sql
UPDATE STATISTICS Orders;
```
4. Add `OPTION (OPTIMIZE FOR UNKNOWN)` if sniffing is an issue.
5. Verify server resources aren't contended.
