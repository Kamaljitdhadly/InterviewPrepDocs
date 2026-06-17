# `GROUP BY`, `HAVING` & Aggregates

## Concept Explanation

**Aggregate functions** (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`) compute a single value over a set of rows. **`GROUP BY`** partitions rows into groups so aggregates are computed per group.

- **`WHERE`** filters individual rows **before** grouping/aggregation.
- **`HAVING`** filters **groups after** aggregation (it can reference aggregate results).

**Logical processing order** is key: `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`. This is why you can't use a `SELECT` alias in `WHERE`, and why aggregates can't appear in `WHERE`.

## Code Example(s)

```sql
-- Total and count of orders per customer, only customers spending > 1000
SELECT CustomerId,
       COUNT(*)      AS OrderCount,
       SUM(Total)    AS TotalSpent
FROM Orders
WHERE Status = 'Completed'      -- filter rows BEFORE grouping
GROUP BY CustomerId
HAVING SUM(Total) > 1000        -- filter groups AFTER aggregation
ORDER BY TotalSpent DESC;
```

```sql
-- COUNT(*) vs COUNT(column) vs COUNT(DISTINCT)
SELECT
  COUNT(*)               AS AllRows,        -- counts every row
  COUNT(DiscountCode)    AS NonNullCodes,   -- ignores NULLs
  COUNT(DISTINCT CustomerId) AS UniqueCustomers
FROM Orders;
```

## Interview Q&A

**🟢 What is the difference between `WHERE` and `HAVING`?**
`WHERE` filters rows before grouping and cannot use aggregate functions. `HAVING` filters groups after aggregation and can use aggregates like `SUM`/`COUNT`.

**🟢 What does `GROUP BY` do?**
It groups rows that share values in the specified columns so aggregate functions are applied per group rather than over the whole table.

**🟡 What's the difference between `COUNT(*)`, `COUNT(column)`, and `COUNT(DISTINCT column)`?**
`COUNT(*)` counts all rows including NULLs. `COUNT(column)` counts non-NULL values in that column. `COUNT(DISTINCT column)` counts unique non-NULL values.

**🟡 Can you use a column in `SELECT` that's not in `GROUP BY`?**
Only if it's wrapped in an aggregate function. Every non-aggregated column in the SELECT must appear in the GROUP BY, otherwise SQL Server raises an error.

**🔴 Why can't you reference a `SELECT` alias in the `WHERE` clause?**
Because of logical processing order: `WHERE` is evaluated before `SELECT`, so the alias doesn't exist yet. You can reference aliases in `ORDER BY` (processed last). Use the full expression or a CTE/subquery.

## ⚠️ Tricky / Gotchas

- **Aggregates ignore NULLs** (except `COUNT(*)`). `AVG(col)` divides by the count of *non-NULL* values, which can surprise you.

```sql
-- AVG of (10, NULL, 20) = 15, not 10 — NULL is excluded from both sum and count
```

- **`WHERE` can't contain aggregates** — `WHERE SUM(x) > 10` is an error; use `HAVING`.
- **`HAVING` without `GROUP BY`** treats the whole table as one group — valid but unusual.
- **`COUNT(column)` vs `COUNT(*)`** differ whenever the column has NULLs — a common trick question.
- **Grouping by an expression** must repeat the expression (no alias) due to processing order.
- **Filtering belongs in `WHERE` when possible** — putting non-aggregate filters in `HAVING` works but is less efficient (filters after grouping).

## 📌 Quick Recap

- `WHERE` filters rows (pre-group, no aggregates); `HAVING` filters groups (post-aggregate).
- Logical order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.
- Non-aggregated SELECT columns must be in GROUP BY.
- Aggregates ignore NULLs; `COUNT(*)` counts all rows.
- `COUNT(col)` = non-null; `COUNT(DISTINCT col)` = unique non-null.
- Can't use SELECT aliases in WHERE (can in ORDER BY).
