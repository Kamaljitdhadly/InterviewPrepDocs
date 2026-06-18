# SQL Server Queries

## Questions Covered

1. How would you write a query to find the second-highest salary in a table?
2. How do you optimize a slow-running query in SQL Server?

## How would you write a query to find the second-highest salary in a table?

Common approaches:

### 1. MAX with subquery

```sql
SELECT MAX(Salary) AS SecondHighestSalary
FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);
```

Inner query gets max salary; outer gets max below that.

### 2. ROW_NUMBER()

```sql
WITH SalaryRank AS (
  SELECT Salary, ROW_NUMBER() OVER (ORDER BY Salary DESC) AS Rank
  FROM Employees
)
SELECT Salary AS SecondHighestSalary
FROM SalaryRank
WHERE Rank = 2;
```

Assigns row numbers by descending salary; pick rank 2.

### 3. DENSE_RANK() — second distinct salary

```sql
WITH SalaryRank AS (
  SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) AS Rank
  FROM Employees
)
SELECT Salary AS SecondHighestSalary
FROM SalaryRank
WHERE Rank = 2;
```

Same rank for ties — returns second **distinct** salary value.

### 4. OFFSET FETCH (SQL Server 2012+)

```sql
SELECT Salary
FROM Employees
ORDER BY Salary DESC
OFFSET 1 ROW FETCH NEXT 1 ROW ONLY;
```

Skip top row, fetch next.

### 5. DISTINCT + MIN subquery

```sql
SELECT MIN(Salary) AS SecondHighestSalary
FROM (SELECT DISTINCT Salary FROM Employees ORDER BY Salary DESC OFFSET 1 ROWS) AS Subquery;
```

**When to use what:**

| Goal | Approach |
|------|----------|
| Second distinct salary (handle ties) | DENSE_RANK() |
| Second row regardless of duplicates | ROW_NUMBER() or OFFSET FETCH |
| Simple, no window functions | MAX WHERE < subquery |

## How do you optimize a slow-running query in SQL Server?

### 1. Execution plan

In SSMS: **Include Actual Execution Plan**. Watch for table scans, index scans, high-cost operators. Prefer seeks over scans.

### 2. Indexes

- Add indexes on WHERE/JOIN/ORDER BY columns
- Use **covering indexes** to avoid key lookups
- Avoid over-indexing (hurts writes)
- Match clustered vs non-clustered to access pattern

### 3. Query syntax

- Avoid `SELECT *` — fetch only needed columns
- Filter/join on indexed columns
- Use appropriate join types

### 4. Statistics

```sql
UPDATE STATISTICS table_name;
```

Stale stats → bad plans. `AUTO_UPDATE_STATISTICS` helps.

### 5. Subqueries vs joins

Replace correlated subqueries with joins when possible:

```sql
SELECT Name FROM Employees WHERE DepartmentID = (SELECT DepartmentID FROM Departments WHERE DepartmentName = 'HR');
```

```sql
SELECT e.Name
FROM Employees e
JOIN Departments d ON e.DepartmentID = d.DepartmentID
WHERE d.DepartmentName = 'HR';
```

### 6. Joins, CTEs, temp tables

Index join columns; use inner joins when outer rows aren't needed. Break very complex logic into CTEs or `#temp` tables to avoid repeated work.

### 7. Avoid cursors

Prefer set-based UPDATE/INSERT/DELETE over row-by-row cursors.

### 8. Partition large tables

Horizontal partitioning (e.g. by date) limits scan range on big tables.

### 9. Query hints (use sparingly)

```sql
SELECT * FROM Employees WITH (INDEX(index_name))
WHERE DepartmentID = 5;
```

Hints can backfire as data changes.

### 10. Monitor CPU/I/O

Use Profiler, Extended Events, and DMVs:

```sql
SELECT TOP 10
  total_worker_time/execution_count AS AvgCPUTime,
  execution_count,
  total_elapsed_time/execution_count AS AvgElapsedTime,
  query_hash
FROM sys.dm_exec_query_stats
ORDER BY AvgCPUTime DESC;
```

### 11. TempDB

Multiple tempdb data files reduce contention; monitor space; limit unnecessary temp objects.

### 12. Blocking / deadlocks

`sp_who2`, Activity Monitor, Extended Events. Tune isolation levels, indexing, and lock order. `NOLOCK` only with care.

### 13. Plan reuse

Parameterized queries and stored procedures encourage plan reuse; avoid unnecessary recompiles (`sp_executesql` for dynamic SQL).

**Checklist:** execution plan → indexes → simpler SQL → fresh statistics → set-based logic → resource monitoring → tempdb/blocking review.
