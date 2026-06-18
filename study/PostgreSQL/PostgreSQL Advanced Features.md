# PostgreSQL Advanced Features

## Questions Covered

1. What are views and materialized views?
2. What are stored procedures and functions in PostgreSQL?
3. What are triggers, and when should you use them?
4. What is full-text search in PostgreSQL?
5. What are partitioning strategies in PostgreSQL?
6. What is logical vs physical replication?
7. What are read replicas and connection routing?
8. What is row-level security (RLS)?
9. What are advisory locks?
10. How does EF Core map to PostgreSQL-specific features?
11. What are backup and point-in-time recovery (PITR) options?
12. How does PostgreSQL compare to SQL Server for advanced features?

## What are views and materialized views?

**View** — saved query, no stored data:

```sql
CREATE VIEW active_orders AS
SELECT id, customer_id, total FROM orders WHERE status IN ('pending', 'processing');
```

**Materialized view** — cached result, refresh explicitly:

```sql
CREATE MATERIALIZED VIEW monthly_revenue AS
SELECT date_trunc('month', created_at) AS month, SUM(total) AS revenue
FROM orders GROUP BY 1;

REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_revenue;
```

Use materialized views for **expensive dashboards** — trade freshness for speed.

## What are stored procedures and functions in PostgreSQL?

**Function** (returns value, usable in SELECT):

```sql
CREATE OR REPLACE FUNCTION order_total(p_order_id uuid)
RETURNS numeric LANGUAGE sql AS $$
  SELECT COALESCE(SUM(line_total), 0) FROM order_lines WHERE order_id = p_order_id;
$$;
```

**Procedure** (PG 11+, no return in SELECT, can commit/rollback):

```sql
CREATE OR REPLACE PROCEDURE archive_old_orders()
LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO orders_archive SELECT * FROM orders WHERE created_at < now() - interval '2 years';
  DELETE FROM orders WHERE created_at < now() - interval '2 years';
  COMMIT;
END;
$$;
```

**Interview:** prefer **application logic** for business rules; DB functions for data-local operations close to data.

## What are triggers, and when should you use them?

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_orders_updated
BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

| Good use | Avoid |
|----------|-------|
| Audit columns | Complex business logic |
| Audit log insert | Logic duplicated from app |
| Enforce cross-row rules | Hidden behavior hard to test |

## What is full-text search in PostgreSQL?

```sql
ALTER TABLE articles ADD COLUMN search_vector tsvector;

UPDATE articles SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body,''));

CREATE INDEX idx_articles_fts ON articles USING gin (search_vector);

SELECT title FROM articles
WHERE search_vector @@ plainto_tsquery('english', 'postgresql indexing');
```

| vs Elasticsearch | PostgreSQL FTS |
|------------------|----------------|
| Dedicated search cluster | Built-in, good for moderate scale |
| Advanced analyzers | `tsvector`, `tsquery`, ranking |

For heavy search at scale, sync to OpenSearch/Elasticsearch.

## What are partitioning strategies in PostgreSQL?

**Declarative partitioning** (PG 10+):

```sql
CREATE TABLE orders (
  id uuid NOT NULL,
  created_at timestamptz NOT NULL,
  total numeric(12,2)
) PARTITION BY RANGE (created_at);

CREATE TABLE orders_2025_q1 PARTITION OF orders
  FOR VALUES FROM ('2025-01-01') TO ('2025-04-01');
```

| Strategy | Use |
|----------|-----|
| **RANGE** | Time-series (orders by month) |
| **LIST** | Region/country |
| **HASH** | Even spread when no natural key |

**Partition pruning** — query with `created_at` filter scans only relevant partitions.

## What is logical vs physical replication?

| Type | Mechanism | Use |
|------|-----------|-----|
| **Streaming (physical)** | WAL byte stream | HA standby, read replica |
| **Logical** | Row changes decoded | Selective tables, cross-version, CDC |

```sql
-- Logical replication (simplified)
CREATE PUBLICATION orders_pub FOR TABLE orders;
```

Cloud managed services handle replication — know concepts for interviews.

## What are read replicas and connection routing?

```text
Primary (writes) ──WAL──→ Replica 1 (reads)
                      └──→ Replica 2 (reads)
```

| Pattern | Detail |
|---------|--------|
| **Write to primary** | Always |
| **Read from replica** | Eventual consistency — lag aware |
| **EF Core** | Separate read connection string; no auto routing |

Use replicas for **reporting**, **analytics**, not immediately-after-write reads.

## What is row-level security (RLS)?

Restrict rows per database user/session — multi-tenant in DB:

```sql
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

App sets per request:

```sql
SET app.tenant_id = 'tenant-uuid';
```

**Defense in depth** — still enforce tenant filter in application code.

## What are advisory locks?

Application-level locks using PostgreSQL:

```sql
SELECT pg_advisory_lock(hashtext('job:import-orders'));
-- critical section
SELECT pg_advisory_unlock(hashtext('job:import-orders'));
```

Lighter than row locks for **job coordination** — or use Redis/ShedLock in app layer.

## How does EF Core map to PostgreSQL-specific features?

```csharp
modelBuilder.Entity<Product>(e =>
{
    e.Property(p => p.Metadata).HasColumnType("jsonb");
    e.HasIndex(p => p.Metadata).HasMethod("gin");  // Npgsql extension
});

// Npgsql enums, arrays
properties.Property(x => x.Tags).HasColumnType("text[]");
```

Packages: `Npgsql.EntityFrameworkCore.PostgreSQL`.

Migrations generate PostgreSQL-specific DDL — review for index types and extensions.

## What are backup and point-in-time recovery (PITR) options?

| Method | Detail |
|--------|--------|
| **pg_dump** | Logical backup; portable |
| **pg_basebackup** | Physical base backup |
| **WAL archiving** | PITR to任意 moment |
| **Cloud automated** | Azure/AWS/GCP daily + WAL |

**RPO/RTO:** managed PITR typically minutes RPO; test restore regularly.

## How does PostgreSQL compare to SQL Server for advanced features?

| Feature | PostgreSQL | SQL Server |
|---------|------------|------------|
| **JSON** | JSONB + GIN | JSON + indexes |
| **Temporal tables** | Extension / triggers | Built-in system-versioned |
| **Columnstore** | Limited | Strong analytics |
| **Full-text** | Built-in | CONTAINS |
| **Partitioning** | Declarative | Partition functions/schemes |
| **Licensing** | Open | Per-core |

Choose PostgreSQL for **OSS, JSONB, cloud portability**; SQL Server for **deep Microsoft BI stack**.

## Related Topics

- PostgreSQL/PostgreSQL Queries and Performance.md
- Sql Server/SQL Server Transactions and Locking.md
- MongoDB/MongoDB Schema Design.md
- Azure Cloud/Azure Storage and Databases.md
