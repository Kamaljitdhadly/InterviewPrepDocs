# Subqueries vs CTEs

## Concept Explanation

A **subquery** is a query nested inside another query. Types:
- **Scalar** — returns a single value (usable in `SELECT`/`WHERE`).
- **Multi-row** — used with `IN`, `ANY`, `ALL`.
- **Correlated** — references the outer query and is (logically) evaluated per outer row.

A **CTE (Common Table Expression)** is a named temporary result set defined with `WITH`, available within the statement that follows. CTEs improve **readability**, allow **referencing the same subquery multiple times**, and support **recursion** (e.g. hierarchies). Functionally, a non-recursive CTE is similar to a derived table/subquery — the optimizer often treats them the same.

## Code Example(s)

```sql
-- Correlated subquery: customers whose order count > 5
SELECT c.Name
FROM Customers c
WHERE (SELECT COUNT(*) FROM Orders o WHERE o.CustomerId = c.Id) > 5;
```

```sql
-- CTE: cleaner and reusable
WITH OrderStats AS (
    SELECT CustomerId, COUNT(*) AS Cnt, SUM(Total) AS Spent
    FROM Orders
    GROUP BY CustomerId
)
SELECT c.Name, s.Cnt, s.Spent
FROM Customers c
JOIN OrderStats s ON s.CustomerId = c.Id
WHERE s.Spent > 1000;
```

```sql
-- Recursive CTE: walk an org hierarchy
WITH OrgChart AS (
    SELECT Id, Name, ManagerId, 0 AS Level
    FROM Employees WHERE ManagerId IS NULL      -- anchor
    UNION ALL
    SELECT e.Id, e.Name, e.ManagerId, oc.Level + 1
    FROM Employees e
    JOIN OrgChart oc ON e.ManagerId = oc.Id     -- recursive part
)
SELECT * FROM OrgChart ORDER BY Level;
```

## Interview Q&A

**🟢 What is a CTE?**
A named temporary result set defined with `WITH` that you can reference in the following query. It improves readability and supports recursion.

**🟢 What is a correlated subquery?**
A subquery that references columns from the outer query, so it's logically evaluated once per outer row (e.g. `WHERE EXISTS (... WHERE inner.x = outer.x)`).

**🟡 What's the difference between a CTE and a subquery?**
A CTE is named, can be referenced multiple times in the same statement, reads top-to-bottom, and supports recursion. A subquery is inline. Performance is usually similar — the optimizer can inline a CTE.

**🟡 Difference between `EXISTS` and `IN`?**
`IN` compares against a list/result set of values; `EXISTS` checks for the presence of any matching row and short-circuits. `EXISTS` is generally preferred for correlated checks and is NULL-safe, unlike `NOT IN`.

**🔴 Are CTEs materialized (cached) in SQL Server?**
No — by default SQL Server does **not** materialize a CTE; it inlines/expands the CTE definition into the query, so referencing it multiple times can re-execute it. For guaranteed single evaluation, use a temp table or `#table`.

## ⚠️ Tricky / Gotchas

- **CTEs are not cached** — referencing a CTE twice can run it twice. People assume it's computed once; it isn't. Use a temp table if you need that.
- **A CTE only lives for the single statement that follows it.** You can't reference it in a later statement.
- **Recursive CTEs need an anchor + recursive member joined by `UNION ALL`**, and hit a default `MAXRECURSION` of 100 — raise with `OPTION (MAXRECURSION n)` or you'll get an error on deep hierarchies.
- **Correlated subqueries can be slow** (row-by-row logic) — often rewritable as a JOIN for better performance.
- **`NOT IN` with NULLs** breaks (returns no rows) — same gotcha as joins; prefer `NOT EXISTS`.

## 📌 Quick Recap

- Subquery = nested query (scalar / multi-row / correlated).
- CTE (`WITH`) = named, readable, reusable within one statement, supports recursion.
- CTEs are **not materialized** by default — multiple references may re-run.
- Recursive CTE = anchor + `UNION ALL` + recursive member; mind `MAXRECURSION`.
- Prefer `EXISTS`/`NOT EXISTS` over `IN`/`NOT IN` (NULL-safe, often faster).
