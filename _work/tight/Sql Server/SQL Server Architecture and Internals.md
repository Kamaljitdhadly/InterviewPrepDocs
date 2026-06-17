# SQL Server Architecture and Internals

## Questions Covered

1. What is the SQL Server database engine?
2. Explain the SQL Server architecture, including the role of the storage engine and query processor.
3. What are data pages, extents, and allocation units in SQL Server?
4. What is the purpose of the tempdb database? How is it used internally?
5. How does SQL Server handle I/O operations for read and write?

## What is the SQL Server database engine?

The **SQL Server database engine** is the core service for storing, processing, and securing data. It provides controlled access and fast transaction processing for workloads from small apps to large enterprise systems, supporting relational tables plus JSON, XML, and spatial data.

**Responsibilities:**

- **Query processing** — optimizes and executes SQL
- **Storage management** — physical data on disk
- **Transactions** — ACID guarantees
- **Security** — encryption, authentication, authorization

## Explain the SQL Server architecture, including the role of the storage engine and query processor.

SQL Server splits into two main engines that work together:

### Relational Engine (Query Processor)

- Parses, optimizes, and executes queries
- Builds execution plans using indexes and statistics
- Focuses on *how* to retrieve data efficiently

### Storage Engine

- Stores data in MDF/NDF (data) and LDF (log) files
- Manages transactions (ACID)
- Maintains the **buffer pool** (in-memory page cache)
- Handles physical disk I/O

| Component | Role |
|-----------|------|
| Query Processor | Plan and execute queries |
| Storage Engine | Persist data, log, buffer pool, I/O |

## What are data pages, extents, and allocation units in SQL Server?

Fundamental on-disk storage concepts for tuning and capacity planning.

### Data Pages

- **8 KB** (8192 bytes) — smallest storage unit
- Row and index data live on pages

**Page types:** data pages, index pages, IAM (extent tracking), GAM/SGAM (global/shared allocation maps).

When a page fills, SQL Server allocates another page for new rows.

### Extents

- **8 contiguous pages = 64 KB**
- **Uniform extent** — all 8 pages belong to one object
- **Mixed extent** — pages shared by multiple small objects

Large tables tend toward uniform extents; small objects may share mixed extents.

### Allocation Units

Logical containers grouping pages/extents:

| Type | Stores |
|------|--------|
| In-row data | Normal row data (incl. variable-length columns) |
| LOB | TEXT/NTEXT/IMAGE, VARCHAR(MAX), VARBINARY(MAX) |
| Columnstore | Columnstore index data (SQL Server 2012+) |

A table with LOB columns uses separate allocation units for in-row vs LOB storage.

## What is the purpose of the tempdb database? How is it used internally?

**tempdb** is a system database for temporary and intermediate objects. It is **recreated on every SQL Server restart** — nothing persists across restarts.

**Uses:**

- `#temp` tables and table variables (session scope)
- Internal **worktables** (sorts, hash joins, index builds)
- **Version store** (row versions for snapshot isolation / RCSI)
- **DBCC** intermediate results (e.g. CHECKDB)

Offloading temp work to tempdb keeps user databases lean and isolates spill/sort pressure.

## How does SQL Server handle I/O operations for read and write?

### Write path

1. Change written to **log buffer** in memory
2. Record flushed to **transaction log** (LDF) for durability
3. Data page updated in **buffer pool**
4. **Checkpoint** or **lazy writer** eventually flushes dirty pages to disk (not immediate)

### Read path

1. Check **buffer pool** for the page
2. **Logical read** — page already in memory
3. **Physical read** — fetch from disk, load into buffer pool, then serve

**Optimizations:** buffer pool caching, asynchronous I/O, read-ahead — minimize physical disk access and latency.
