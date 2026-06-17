# Indexes (Clustered vs Non-Clustered)

## Concept Explanation

An **index** is a data structure (a B-tree in SQL Server) that speeds up data retrieval at the cost of extra storage and slower writes (inserts/updates/deletes must maintain the index).

- **Clustered index** — defines the **physical order** of rows in the table; the table data *is* the leaf level of this index. **One per table** (often the primary key). Think: the table sorted by this key.
- **Non-clustered index** — a separate structure with a copy of the indexed column(s) plus a pointer (the clustered key or a row locator) back to the row. **Many per table**.

Good indexing dramatically speeds up `WHERE`, `JOIN`, `ORDER BY`, and `GROUP BY`. Bad/excess indexing slows writes and wastes space.

## Code Example(s)

```sql
-- Clustered index (usually the PK creates one automatically)
CREATE CLUSTERED INDEX IX_Orders_Id ON Orders(Id);

-- Non-clustered index to speed up lookups by CustomerId
CREATE NONCLUSTERED INDEX IX_Orders_CustomerId ON Orders(CustomerId);

-- Covering index: INCLUDE extra columns so the query needs no key lookup
CREATE NONCLUSTERED INDEX IX_Orders_Cust_Covering
ON Orders(CustomerId)
INCLUDE (Total, Status);   -- query selecting these is "covered"
```

```sql
-- This query benefits from IX_Orders_CustomerId (a seek instead of a scan)
SELECT Total, Status FROM Orders WHERE CustomerId = 42;
```

## Interview Q&A

**🟢 What is an index and why use one?**
A data structure that speeds up reads by avoiding full table scans. It trades extra storage and slower writes for faster lookups, joins, and sorts.

**🟢 Difference between clustered and non-clustered indexes?**
A clustered index determines the physical row order and there's only one per table (the data itself). A non-clustered index is a separate structure pointing back to rows; you can have many.

**🟡 What is a covering index?**
A non-clustered index that includes all columns a query needs (via key columns + `INCLUDE`), so the query is satisfied entirely from the index without looking up the base table (no "key lookup").

**🟡 What is the difference between an index seek and an index scan?**
A **seek** navigates the B-tree directly to the matching rows (efficient, uses the index). A **scan** reads the whole index/table (used when no useful index exists or many rows match). Seeks are generally better for selective queries.

**🔴 Why might SQL Server ignore an index you created?**
Reasons: the query isn't selective enough (a scan is cheaper), a function/implicit conversion on the indexed column makes it non-SARGable, the column order in a composite index doesn't match the predicate, outdated statistics, or `SELECT *` forcing key lookups that make the index unattractive.

## ⚠️ Tricky / Gotchas

- **Non-SARGable predicates kill index usage.** Wrapping the indexed column in a function or doing arithmetic prevents a seek:

```sql
WHERE YEAR(OrderDate) = 2024            -- ❌ function on column → scan
WHERE OrderDate >= '2024-01-01'
  AND OrderDate <  '2025-01-01'         -- ✅ SARGable → seek
```

- **Implicit conversion** (e.g. comparing an `nvarchar` column to a `varchar` literal or an `int`) can force a scan and a conversion warning.
- **Composite index column order matters** — an index on `(A, B)` helps `WHERE A = ...` and `WHERE A = ... AND B = ...`, but NOT `WHERE B = ...` alone (leftmost-prefix rule).
- **Over-indexing slows writes** — every insert/update/delete must update all affected indexes.
- **Clustered index on a wide/volatile key** bloats every non-clustered index (they store the clustered key as the row locator) and causes fragmentation.

## 📌 Quick Recap

- Index = B-tree that speeds reads, costs storage + write overhead.
- Clustered = physical order, one per table (the data). Non-clustered = separate, many allowed.
- Covering index (`INCLUDE`) satisfies a query without base-table lookups.
- Seek (targeted) > Scan (whole) for selective queries.
- Keep predicates SARGable (no functions/implicit conversions on indexed columns).
- Composite indexes follow the leftmost-prefix rule; don't over-index.
