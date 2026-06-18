# SQL Server Analysis and Reporting

## Questions Covered

1. What is SQL Server Integration Services (SSIS)?
2. What is SQL Server Analysis Services (SSAS)(Data Warehouse database)?
3. What is SQL Server Reporting Services (SSRS) and how do you create a report?
4. How do you design and build a data warehouse using SQL Server?

## What is SQL Server Integration Services (SSIS)?

**SSIS** is SQL Server's platform for **ETL** (extract, transform, load), data migration, and workflow automation.

**Key capabilities:**

- **ETL** — pull from databases, flat files, Excel, XML; load to SQL Server, other DBs, or cloud
- **Transformations** — cleanse, convert, aggregate, sort, join
- **Automation** — backups, email, file moves, stored procedures on a schedule
- **Error handling & logging** — troubleshoot failed packages
- **BI / warehousing** — prepare large datasets for reporting

**Components:**

| Component | Purpose |
|-----------|---------|
| Control Flow | Task workflow (SQL, email, file copy) |
| Data Flow | Actual ETL pipeline |
| Connection Managers | Source/destination connections |
| Event Handlers | React to errors, log events |

**Common uses:** warehouse loads, migrations, data cleansing, scheduled data ops.

### Retail ETL example

**Goal:** Nightly consolidate multi-store sales → central warehouse → regional reports.

1. **Extract** — Data Flow Tasks + Connection Managers to each store DB (or Excel)
2. **Transform** — dedupe, standardize product codes, validate IDs/dates, aggregate by store/region, currency conversion
3. **Load** — into warehouse tables (`ConsolidatedSales`, staging area optional)
4. **Errors** — log to table or email via Event Handlers
5. **Reports** — SQL Task runs report SP; export Excel/PDF
6. **Schedule** — SQL Server Agent runs package nightly

## What is SQL Server Analysis Services (SSAS)(Data Warehouse database)?

**SSAS** provides **OLAP** and **data mining** for fast multidimensional analysis on large datasets.

**Core functions:**

- **OLAP cubes** — measures (sales, profit) across dimensions (time, geography, product); slice/dice/drill-down
- **Tabular models** — in-memory relational tables (VertiPaq/xVelocity); great for Power BI / Excel self-service BI
- **Data mining** — decision trees, clustering, neural nets for prediction

**Features:** pre-aggregations, KPIs, hierarchies (Year → Quarter → Month), role-based security, integration with Power BI, Excel, SSRS.

| Model type | Best for |
|------------|----------|
| Multidimensional (cube) | Classic OLAP, many dimensions |
| Tabular | Fast in-memory, Power BI |

**Example:** Retail cube analyzing sales/profit by region, store, product, and time — identify seasonal/regional trends.

## What is SQL Server Reporting Services (SSRS) and how do you create a report?

**SSRS** designs, deploys, and delivers reports from SQL Server, Oracle, and other sources. Output: tables, charts; export to PDF, Excel, Word; interactive drill-down/filter.

**Create a report:**

1. Install/configure SSRS; open portal (`http://<Server>/Reports`)
2. **SSDT / Visual Studio** → Report Server Project → Add Report (`.rdl`)
3. **Data source** — connection string:

```sql
Data Source=YourServerName;Initial Catalog=YourDatabaseName;
```

4. **Dataset** — query or stored procedure:

```sql
SELECT ProductName, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY ProductName;
```

5. **Layout** — drag fields into table/matrix/chart
6. **Preview** → **Deploy** to SSRS portal
7. Users view, export, or subscribe via portal

**Parameterized example:**

```sql
SELECT ProductName, SUM(SalesAmount) AS TotalSales
FROM Sales
WHERE SalesDate BETWEEN @StartDate AND @EndDate
GROUP BY ProductName;
```

## How do you design and build a data warehouse using SQL Server?

### 1. Planning

- Business metrics, reporting grain (daily/monthly), source systems (ERP, CRM, OLTP)

### 2. Data modeling

| Approach | Style |
|----------|-------|
| Inmon (top-down) | Normalized enterprise warehouse → data marts |
| Kimball (bottom-up) | Star/snowflake marts first |

- **Fact tables** — measures + FKs to dimensions
- **Dimension tables** — descriptive attributes (time, product, customer, store)

### 3. Schema in SQL Server

```sql
CREATE DATABASE SalesDataWarehouse;
```

```sql
CREATE TABLE Product_Dim (
  ProductID INT PRIMARY KEY,
  ProductName NVARCHAR(100),
  Category NVARCHAR(50)
);
```

```sql
CREATE TABLE Sales_Fact (
  SalesID INT PRIMARY KEY,
  ProductID INT FOREIGN KEY REFERENCES Product_Dim(ProductID),
  CustomerID INT,
  SalesDate DATE,
  SalesAmount DECIMAL(18, 2)
);
```

### 4. ETL (typically SSIS)

- **Extract** from sources
- **Transform** — nulls, formats, dedupe, map to star schema; handle **SCDs**
- **Load** into dims/facts:

```sql
INSERT INTO Sales_Fact (SalesID, ProductID, CustomerID, SalesDate, SalesAmount)
VALUES (1, 101, 2001, '2024-09-01', 100.50);
```

### 5. Performance

```sql
CREATE INDEX idx_sales_product ON Sales_Fact (ProductID);
```

Partition large facts; pre-aggregate common rollups.

### 6. Load strategy

- **Full** — initial load
- **Incremental** — delta by timestamp/change tracking:

```sql
SELECT * FROM Sales_Transactions WHERE TransactionDate > '2024-09-01';
```

### 7. Security

```sql
CREATE ROLE SalesManagerRole;
GRANT SELECT ON Sales_Fact TO SalesManagerRole;
```

Encrypt sensitive columns as needed.

### 8. Reporting

SSRS, Power BI, or ad-hoc SQL:

```sql
SELECT ProductName, SUM(SalesAmount) AS TotalSales
FROM Sales_Fact
JOIN Product_Dim ON Sales_Fact.ProductID = Product_Dim.ProductID
GROUP BY ProductName;
```

### 9. Maintenance

Rebuild indexes, monitor ETL quality, regular backups.

**Flow:** Sources → ETL → star/snowflake warehouse → BI tools.
