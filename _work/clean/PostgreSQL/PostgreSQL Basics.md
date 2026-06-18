# PostgreSQL Basics

## Questions Covered

1. What is PostgreSQL, and how does it compare to SQL Server and MySQL?
2. When should you choose PostgreSQL over MongoDB or SQL Server?
3. What are PostgreSQL schemas, databases, and roles?
4. What are common PostgreSQL data types?
5. What is JSONB, and why is it popular in PostgreSQL?
6. What are primary keys, foreign keys, and constraints?
7. How do you create tables and basic CRUD in PostgreSQL?
8. What are sequences and identity columns?
9. What is MVCC in PostgreSQL?
10. What are PostgreSQL extensions (PostGIS, pg_trgm)?
11. How does PostgreSQL run in the cloud (Azure, AWS, GCP)?
12. How do you connect to PostgreSQL from .NET and Node.js?

## What is PostgreSQL, and how does it compare to SQL Server and MySQL?

**PostgreSQL** is an open-source **relational DBMS** — ACID, SQL standard, extensible types, strong JSON support.

| Feature | PostgreSQL | SQL Server | MySQL |
|---------|------------|------------|-------|
| **License** | Open source | Commercial / Express free | Open source |
| **JSON** | JSONB (indexed) | JSON columns | JSON |
| **Extensions** | Rich (PostGIS, etc.) | Limited | Plugins |
| **Window functions** | Full | Full | Full (modern) |
| **Typical cloud** | RDS, Azure Flexible, Cloud SQL | Azure SQL | RDS |

**Interview:** PostgreSQL = default for **cloud-native**, **startup**, and **polyglot** stacks; SQL Server for **Microsoft-centric** enterprises.

## When should you choose PostgreSQL over MongoDB or SQL Server?

| Choose PostgreSQL | Choose MongoDB | Choose SQL Server |
|-------------------|----------------|-------------------|
| Relational model + joins | Flexible schema, document model | Existing Microsoft stack, SSIS/SSRS |
| JSONB + SQL together | Horizontal sharding at doc level | Windows-integrated auth legacy |
| Open source, multi-cloud | Rapid schema iteration | T-SQL heavy teams |

PostgreSQL handles **semi-structured** data via JSONB without giving up transactions.

## What are PostgreSQL schemas, databases, and roles?

```text
Cluster (instance)
  └── Database (contoso)
        └── Schema (public, sales, audit)
              └── Tables, views, functions
```

```sql
CREATE DATABASE contoso;
CREATE SCHEMA sales;
CREATE ROLE app_user WITH LOGIN PASSWORD 'secret';
GRANT USAGE ON SCHEMA sales TO app_user;
```

| Term | Meaning |
|------|---------|
| **Database** | Isolation boundary (connections target one DB) |
| **Schema** | Namespace within database |
| **Role** | User or group; permissions via GRANT |

Unlike SQL Server, `schema` ≠ database — one server hosts many databases.

## What are common PostgreSQL data types?

| Category | Types |
|----------|-------|
| **Numeric** | `integer`, `bigint`, `numeric(p,s)`, `real` |
| **Text** | `varchar(n)`, `text`, `char(n)` |
| **Date/time** | `timestamp`, `timestamptz`, `date`, `interval` |
| **Boolean** | `boolean` |
| **UUID** | `uuid` |
| **JSON** | `json`, `jsonb` |
| **Array** | `integer[]`, `text[]` |
| **Network** | `inet`, `cidr` |

```sql
CREATE TABLE products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku         varchar(50) NOT NULL UNIQUE,
  price       numeric(10, 2) NOT NULL,
  tags        text[],
  metadata    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);
```

Use **`timestamptz`** for timestamps (stores UTC).

## What is JSONB, and why is it popular in PostgreSQL?

**JSONB** — binary JSON, indexable, efficient queries:

```sql
INSERT INTO products (sku, price, metadata)
VALUES ('W-1', 9.99, '{"color": "red", "warranty": 12}');

SELECT * FROM products WHERE metadata->>'color' = 'red';
SELECT * FROM products WHERE metadata @> '{"warranty": 12}';

CREATE INDEX idx_products_metadata ON products USING gin (metadata);
```

| json | jsonb |
|------|-------|
| Preserves whitespace | Normalized |
| Slower queries | Index-friendly |

Hybrid relational + document without separate MongoDB.

## What are primary keys, foreign keys, and constraints?

```sql
CREATE TABLE customers (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE
);

CREATE TABLE orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  total       numeric(12, 2) NOT NULL CHECK (total >= 0),
  status      varchar(20) NOT NULL DEFAULT 'pending'
);
```

| Constraint | Purpose |
|------------|---------|
| **PRIMARY KEY** | Unique row identifier |
| **FOREIGN KEY** | Referential integrity |
| **UNIQUE** | Alternate keys |
| **CHECK** | Domain rules |
| **NOT NULL** | Required columns |

## How do you create tables and basic CRUD in PostgreSQL?

```sql
-- Create (insert)
INSERT INTO customers (email) VALUES ('ada@example.com') RETURNING id;

-- Read
SELECT id, email FROM customers WHERE email LIKE '%@example.com';

-- Update
UPDATE customers SET email = 'ada@corp.com' WHERE id = '...';

-- Delete
DELETE FROM orders WHERE status = 'cancelled' AND created_at < now() - interval '90 days';
```

**RETURNING** clause — get generated IDs without second query (nice for APIs).

## What are sequences and identity columns?

```sql
-- Modern identity (PG 10+)
CREATE TABLE logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  message text NOT NULL
);

-- Legacy serial
CREATE TABLE legacy (
  id serial PRIMARY KEY
);
```

Prefer **IDENTITY** over `serial` for SQL standard compliance.

## What is MVCC in PostgreSQL?

**Multi-Version Concurrency Control** — readers don't block writers; each transaction sees a **snapshot**.

| Benefit | Detail |
|---------|--------|
| **Read consistency** | No dirty reads in default isolation |
| **Concurrency** | SELECT doesn't lock rows for UPDATE |

**Vacuum** reclaims dead row versions — monitor bloat and autovacuum. Long transactions block cleanup.

## What are PostgreSQL extensions (PostGIS, pg_trgm)?

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_customers_email_trgm ON customers USING gin (email gin_trgm_ops);
```

| Extension | Use |
|-----------|-----|
| **PostGIS** | Geospatial queries |
| **pg_trgm** | Fuzzy text search |
| **uuid-ossp / pgcrypto** | UUID generation |
| **citext** | Case-insensitive text |

Enable only what you need — security and maintenance surface.

## How does PostgreSQL run in the cloud (Azure, AWS, GCP)?

| Cloud | Service |
|-------|---------|
| **Azure** | Azure Database for PostgreSQL Flexible Server |
| **AWS** | RDS PostgreSQL, Aurora PostgreSQL |
| **GCP** | Cloud SQL for PostgreSQL |

Managed features: automated backups, HA replicas, PITR, patching, monitoring.

**Interview mapping:** same engine; differ in networking (Private Link, VPC), auth (Entra/IAM), and tier naming.

## How do you connect to PostgreSQL from .NET and Node.js?

**.NET (Npgsql + EF Core):**

```csharp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
```

```json
"ConnectionStrings": {
  "Postgres": "Host=localhost;Database=contoso;Username=app;Password=secret"
}
```

**Node (pg):**

```typescript
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const { rows } = await pool.query('SELECT id, email FROM customers WHERE id = $1', [userId]);
```

Always use **parameterized queries** — `$1`, `$2` — never string concat.

## Related Topics

- PostgreSQL/PostgreSQL Queries and Performance.md
- Sql Server/SQL Server Basics.md
- MongoDB/MongoDB Basics.md
- Important Concepts/Interview Comparisons.md
