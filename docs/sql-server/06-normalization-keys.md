# Normalization & Keys

## Concept Explanation

**Normalization** organizes data to reduce **redundancy** and avoid **update/insert/delete anomalies** by splitting data into related tables.

- **1NF** — atomic values (no repeating groups/arrays in a column), each row unique.
- **2NF** — 1NF + no partial dependency (non-key columns depend on the *whole* composite key).
- **3NF** — 2NF + no transitive dependency (non-key columns depend only on the key, not on other non-key columns).

**Keys:**
- **Primary key** — uniquely identifies a row; not NULL; one per table.
- **Candidate key** — any column(s) that could serve as PK.
- **Foreign key** — references a PK in another table; enforces referential integrity.
- **Composite key** — a key made of multiple columns.

**Denormalization** intentionally adds redundancy (e.g. for read performance/reporting), trading integrity simplicity for speed.

## Code Example(s)

```sql
-- Normalized: separate Customers and Orders, linked by a foreign key
CREATE TABLE Customers (
    Id   INT PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    City NVARCHAR(100)
);

CREATE TABLE Orders (
    Id         INT PRIMARY KEY,
    CustomerId INT NOT NULL,
    Total      DECIMAL(10,2) NOT NULL,
    CONSTRAINT FK_Orders_Customers
        FOREIGN KEY (CustomerId) REFERENCES Customers(Id)
);
```

```sql
-- ❌ Un-normalized (violates 1NF): multiple products in one column
-- OrderId | Products
--    1     | "Pen, Book, Pencil"

-- ✅ Normalized into an OrderItems table
CREATE TABLE OrderItems (
    OrderId   INT,
    ProductId INT,
    Quantity  INT,
    PRIMARY KEY (OrderId, ProductId)   -- composite key
);
```

## Interview Q&A

**🟢 What is normalization and why do it?**
Organizing data into related tables to eliminate redundancy and prevent update/insert/delete anomalies, improving data integrity.

**🟢 What is the difference between a primary key and a foreign key?**
A primary key uniquely identifies a row within its table (unique, not NULL). A foreign key references a primary key in another table to enforce relationships and referential integrity.

**🟡 Explain 1NF, 2NF, 3NF briefly.**
1NF: atomic columns, no repeating groups. 2NF: 1NF + every non-key column depends on the whole key (no partial dependency). 3NF: 2NF + no transitive dependencies (non-key columns depend only on the key).

**🟡 What is denormalization and when is it useful?**
Deliberately introducing redundancy to reduce joins and speed up reads — common in reporting/data warehouses or read-heavy systems, at the cost of more complex updates.

**🔴 Can a primary key be NULL or can a table have multiple primary keys?**
A primary key can never be NULL and there's exactly **one** primary key per table (though it may span multiple columns = composite). Other candidate keys can be enforced with `UNIQUE` constraints, which *do* allow a single NULL.

## ⚠️ Tricky / Gotchas

- **Primary key vs unique constraint:** both enforce uniqueness, but PK disallows NULLs and there's one per table; a `UNIQUE` constraint allows one NULL (in SQL Server) and you can have many.
- **Composite keys and 2NF:** partial dependency only applies when the key is composite; with a single-column key, 2NF is automatically satisfied.
- **Foreign keys don't auto-create indexes** in SQL Server — you often should add one on the FK column for join/delete performance.
- **Over-normalization** can hurt read performance with too many joins; balance integrity vs query cost.
- **A surrogate key (identity/GUID)** is often preferred over a natural key for stability, but adds a column and doesn't enforce business uniqueness by itself (add a UNIQUE constraint).

## 📌 Quick Recap

- Normalization removes redundancy/anomalies: 1NF (atomic) → 2NF (no partial dep) → 3NF (no transitive dep).
- PK: unique + not NULL + one per table (can be composite). FK: references a PK, enforces integrity.
- UNIQUE constraint ≈ candidate key, allows one NULL, many per table.
- FKs aren't auto-indexed — add indexes for performance.
- Denormalization trades integrity simplicity for read speed.
