# Joins & `NULL` Behavior

## Concept Explanation

A **JOIN** combines rows from two or more tables based on a related column.

| Join | Returns |
|---|---|
| **INNER JOIN** | only rows with a match in **both** tables |
| **LEFT (OUTER) JOIN** | all rows from the left table + matched right (NULLs where no match) |
| **RIGHT (OUTER) JOIN** | all rows from the right + matched left |
| **FULL (OUTER) JOIN** | all rows from both, matched where possible |
| **CROSS JOIN** | Cartesian product (every left row × every right row) |
| **SELF JOIN** | a table joined to itself (e.g. employee → manager) |

`NULL` represents *unknown*. Comparisons with `NULL` using `=`/`<>` yield **UNKNOWN** (not TRUE), so you must use `IS NULL` / `IS NOT NULL`.

## Code Example(s)

```sql
-- Sample tables: Customers(Id, Name), Orders(Id, CustomerId, Total)

-- INNER: customers who have orders
SELECT c.Name, o.Total
FROM Customers c
INNER JOIN Orders o ON o.CustomerId = c.Id;

-- LEFT: ALL customers, with their orders (NULL if none)
SELECT c.Name, o.Total
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.Id;

-- Find customers with NO orders (anti-join)
SELECT c.Name
FROM Customers c
LEFT JOIN Orders o ON o.CustomerId = c.Id
WHERE o.Id IS NULL;
```

```sql
-- Self join: employees and their managers
SELECT e.Name AS Employee, m.Name AS Manager
FROM Employees e
LEFT JOIN Employees m ON e.ManagerId = m.Id;
```

## Interview Q&A

**🟢 What is the difference between INNER JOIN and LEFT JOIN?**
INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right, with NULLs where there's no match.

**🟢 What is a CROSS JOIN?**
A Cartesian product — every row of the first table combined with every row of the second. No join condition. Rarely used intentionally except for generating combinations.

**🟡 How do you find rows in table A that have no match in table B?**
Use a LEFT JOIN and filter `WHERE b.key IS NULL` (anti-join), or `NOT EXISTS`. Avoid `NOT IN` if the column can contain NULLs.

**🟡 What is a self join and when do you use it?**
A table joined to itself, used for hierarchical or comparative data within the same table — e.g. matching employees to their managers, or comparing rows to other rows.

**🔴 What's the difference in result between filtering in the `ON` clause vs the `WHERE` clause of a LEFT JOIN?**
A condition in `ON` is applied *before* the join (right-side rows that fail it become NULLs but left rows are kept). The same condition in `WHERE` filters *after* the join and can eliminate left rows whose right side is NULL — effectively turning the LEFT JOIN into an INNER JOIN.

## ⚠️ Tricky / Gotchas

- **`NOT IN` with NULLs returns nothing.** If the subquery returns any NULL, `NOT IN` yields UNKNOWN for all rows → empty result. Use `NOT EXISTS` instead.

```sql
-- ❌ if any o.CustomerId is NULL, this returns ZERO rows
SELECT * FROM Customers WHERE Id NOT IN (SELECT CustomerId FROM Orders);
-- ✅ safe
SELECT * FROM Customers c WHERE NOT EXISTS (SELECT 1 FROM Orders o WHERE o.CustomerId = c.Id);
```

- **`ON` vs `WHERE` for outer joins** silently changes results (see Q&A above) — a top interview trap.
- **`= NULL` never matches.** Always use `IS NULL`. `NULL = NULL` is UNKNOWN, not TRUE.
- **Counting with joins** can double-count if a one-to-many join multiplies rows — use `COUNT(DISTINCT ...)` or aggregate before joining.
- **Implicit cross joins** from forgetting the join condition (comma-separated tables in `FROM`) explode row counts.

## 📌 Quick Recap

- INNER = matches only; LEFT/RIGHT = keep one side + NULLs; FULL = both; CROSS = Cartesian.
- Anti-join: `LEFT JOIN ... WHERE right IS NULL` or `NOT EXISTS`.
- `NULL` comparisons are UNKNOWN → use `IS NULL`/`IS NOT NULL`.
- Avoid `NOT IN` with nullable columns; use `NOT EXISTS`.
- Outer-join conditions in `ON` vs `WHERE` give different results.
