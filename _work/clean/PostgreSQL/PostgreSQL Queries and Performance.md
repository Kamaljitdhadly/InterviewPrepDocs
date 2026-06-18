# PostgreSQL Queries and Performance

## Questions Covered

1. What are joins in PostgreSQL, and how do they work?
2. What are aggregate functions and GROUP BY?
3. What are window functions, and when use them?
4. What are subqueries vs CTEs (WITH clauses)?
5. What are indexes in PostgreSQL, and what types exist?
6. How do you use EXPLAIN and EXPLAIN ANALYZE?
7. What is a query execution plan, and what to look for?
8. What are common PostgreSQL performance anti-patterns?
9. What is connection pooling (PgBouncer)?
10. What are transactions and isolation levels in PostgreSQL?
11. What are locks and deadlocks?
12. How do you optimize JSONB queries?

## What are joins in PostgreSQL, and how do they work?

```sql
SELECT o.id, o.total, c.email
FROM orders o
INNER JOIN customers c ON c.id = o.customer_id
WHERE o.status = 'shipped';

-- Left join — all customers even without orders
SELECT c.email, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.email;
```

| Join | Result |
|------|--------|
| **INNER** | Matching rows only |
| **LEFT** | All left + matched right |
| **FULL** | All from both |
| **CROSS** | Cartesian product |

Index **foreign key columns** (`customer_id`) for join performance.

## What are aggregate functions and GROUP BY?

```sql
SELECT status, COUNT(*) AS cnt, SUM(total) AS revenue
FROM orders
WHERE created_at >= date_trunc('month', now())
GROUP BY status
HAVING SUM(total) > 1000
ORDER BY revenue DESC;
```

| Clause | Filters |
|--------|---------|
| **WHERE** | Rows before grouping |
| **HAVING** | Groups after aggregation |

Common aggregates: `COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `array_agg`, `jsonb_agg`.

## What are window functions, and when use them?

Compute across related rows **without collapsing** result set:

```sql
SELECT
  id,
  customer_id,
  total,
  SUM(total) OVER (PARTITION BY customer_id) AS customer_total,
  ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
FROM orders;
```

| Function | Use |
|----------|-----|
| `ROW_NUMBER()` | Dedupe, top-N per group |
| `RANK()` / `DENSE_RANK()` | Leaderboards with ties |
| `LAG()` / `LEAD()` | Previous/next row comparison |
| Running totals | `SUM() OVER (ORDER BY date)` |

Replaces self-joins for many analytics queries.

## What are subqueries vs CTEs (WITH clauses)?

**Subquery:**

```sql
SELECT * FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

**CTE — readable, reusable:**

```sql
WITH monthly AS (
  SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY 1
)
SELECT month, revenue,
       revenue - LAG(revenue) OVER (ORDER BY month) AS delta
FROM monthly;
```

**Recursive CTE** — org charts, hierarchies:

```sql
WITH RECURSIVE tree AS (
  SELECT id, parent_id, name, 1 AS depth FROM categories WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.name, t.depth + 1
  FROM categories c JOIN tree t ON c.parent_id = t.id
)
SELECT * FROM tree;
```

## What are indexes in PostgreSQL, and what types exist?

```sql
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE UNIQUE INDEX idx_customers_email ON customers (lower(email));

-- Composite
CREATE INDEX idx_orders_status_date ON orders (status, created_at);

-- Partial
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending';
```

| Index type | Use |
|------------|-----|
| **B-tree** | Default; equality, range |
| **GIN** | JSONB, arrays, full-text |
| **GiST** | Geometric, range types |
| **Hash** | Equality only (rare) |

**Covering index** (INCLUDE):

```sql
CREATE INDEX idx_orders_cover ON orders (customer_id) INCLUDE (total, status);
```

## How do you use EXPLAIN and EXPLAIN ANALYZE?

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE customer_id = '...' AND status = 'pending';
```

| Node type | Concern |
|-----------|---------|
| **Seq Scan** | Full table read — OK small tables |
| **Index Scan** | Good — using index |
| **Bitmap Heap Scan** | Multiple index conditions |
| **Nested Loop** | OK small inner; bad large |
| **Hash Join / Merge Join** | Large set joins |

**ANALYZE** runs query — use on dev/staging, not prod under load casually.

## What is a query execution plan, and what to look for?

```text
Seq Scan on orders  (cost=0..10000 rows=500000)
  Filter: (status = 'pending')
```

| Red flag | Fix |
|----------|-----|
| Seq scan on large table | Add index on filter/join columns |
| High **rows** estimate vs actual | Run `ANALYZE`; update statistics |
| Sort + high cost | Index matching ORDER BY |
| N+1 from ORM | Eager load, batch queries |

Monitor **pg_stat_statements** for top queries by total time.

## What are common PostgreSQL performance anti-patterns?

| Anti-pattern | Better |
|--------------|--------|
| `SELECT *` | Project needed columns |
| ORM N+1 queries | `.Include()` / joins / dataloaders |
| Missing indexes on FK | Index FK columns |
| `%LIKE%` leading wildcard | Full-text search / trigram index |
| Too many connections | PgBouncer pooling |
| Long idle in transaction | Keep transactions short |
| Over-indexing | Slows writes; index selectively |

## What is connection pooling (PgBouncer)?

Each PostgreSQL connection is **expensive** (~MB RAM). Apps opening connection per request exhaust limits.

```text
App instances (100 conn each) → PgBouncer (pool 20) → PostgreSQL
```

| Mode | Behavior |
|------|----------|
| **Transaction pooling** | Connection returned after transaction |
| **Session pooling** | Held for client session |

Npgsql has built-in **multiplexing** in newer versions; still use PgBouncer at scale.

## What are transactions and isolation levels in PostgreSQL?

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
-- ROLLBACK on error
```

| Level | Behavior |
|-------|----------|
| **Read committed** | Default; no dirty reads |
| **Repeatable read** | Snapshot for transaction |
| **Serializable** | Strictest; may fail with serialization error |

EF Core: `IsolationLevel.ReadCommitted` default; use serializable for critical financial ops with retry.

## What are locks and deadlocks?

```sql
SELECT * FROM orders WHERE id = '...' FOR UPDATE;  -- row lock
```

**Deadlock** — two transactions wait on each other's locks; PostgreSQL kills one.

| Prevention | Detail |
|------------|--------|
| Consistent lock order | Always lock table A then B |
| Short transactions | Less overlap |
| Retry on `40001` | Serialization/deadlock errors |

View: `pg_locks`, `pg_stat_activity`.

## How do you optimize JSONB queries?

```sql
-- Index containment
CREATE INDEX idx_meta ON products USING gin (metadata jsonb_path_ops);

SELECT * FROM products WHERE metadata @> '{"category": "electronics"}';

-- Expression index
CREATE INDEX idx_meta_color ON products ((metadata->>'color'));
```

| Operator | Meaning |
|----------|---------|
| `->` | JSON object field |
| `->>` | Text extraction |
| `@>` | Contains |
| `?` | Key exists |

Avoid `metadata::text LIKE '%foo%'` on large tables — use GIN.

## Related Topics

- PostgreSQL/PostgreSQL Basics.md
- PostgreSQL/PostgreSQL Advanced Features.md
- Sql Server/SQL Server Query Optimization Techniques.md
- C#/C# ADO.NET and Entity Framework.md
