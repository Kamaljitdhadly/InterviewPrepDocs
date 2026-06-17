# SQL Server Function

## Questions Covered

1. What is scalar and aggregate function?
2. What is IIF function
3. Explain the use of the ISNULL and NULLIF functions.
4. Explain the purpose of COALESCE in SQL.
5. How do you use the CAST and CONVERT functions in SQL Server?
6. What is GUID
7. What is pivot
8. What is Quotename function
9. What is Rollup
10. What is Cube
11. What is Grouping set
12. What is Grouping function
13. Explain window functions in SQL Server.
14. What are the differences between RANK(), ROW_NUMBER(), and DENSE_RANK()?
15. What is NTile function
16. What is Difference between rows and range
17. What is Lead and lag function

## What is scalar and aggregate function?

SQL functions fall into two key categories: **scalar functions** (per-row, single value) and **aggregate functions** (set-level summary).

**Scalar functions** operate on individual values and return one result per input — used for calculations, string manipulation, and date/time operations.

**Examples:**

1. **Mathematical:**

    - ABS(): Returns the absolute value of a number.

    - ROUND(): Rounds a numeric value to the specified number of decimal places.

```sql
SELECT ABS(-10) AS AbsoluteValue; -- Returns 10
SELECT ROUND(123.4567, 2) AS RoundedValue; -- Returns 123.46
```

2. **String:**

```sql
SELECT UPPER('hello') AS Uppercase; -- Returns 'HELLO'
SELECT LOWER('WORLD') AS Lowercase; -- Returns 'world'
SELECT LEN('SQL Server') AS StringLength; -- Returns 11
```

3. **Date and Time:**

```sql
SELECT GETDATE() AS CurrentDateTime; -- Returns the current date and time
SELECT DATEPART(YEAR, GETDATE()) AS CurrentYear; -- Returns the current year
```

**Aggregate functions** calculate over a set of values and return a single summary — typically used with `GROUP BY`.

**Examples:**

1. **SUM()**: Returns the total sum of a numeric column.

```sql
SELECT SUM(Salary) AS TotalSalaries FROM Employees;
```

2. **AVG()**: Returns the average value of a numeric column.

```sql
SELECT AVG(Salary) AS AverageSalary FROM Employees;
```

3. **COUNT()**: Returns the number of rows or non-null values in a column.

```sql
SELECT COUNT(*) AS TotalEmployees FROM Employees;
```

4. **MIN()**: Returns the smallest value in a column.

```sql
SELECT MIN(Salary) AS LowestSalary FROM Employees;
```

5. **MAX()**: Returns the largest value in a column.

```sql
SELECT MAX(Salary) AS HighestSalary FROM Employees;
```

| Type | Operates On | Returns | Typical Use |
|------|-------------|---------|-------------|
| Scalar | Individual values | One value per row | Calculations, strings, dates |
| Aggregate | Set of values | Single summary | SUM, AVG, COUNT, MIN, MAX with GROUP BY |

## What is IIF function

**IIF** is SQL Server's inline conditional — returns one of two values based on a Boolean condition (like a ternary operator).

**Syntax:** `IIF(condition, true_value, false_value)`

- **condition**: Evaluated as true/false.
- **true_value**: Returned when condition is true.
- **false_value**: Returned when condition is false.

**Example** — classify employees as "High" or "Low" salary:

```sql
CREATE TABLE Employees (
EmployeeName NVARCHAR(50),
Salary DECIMAL(10, 2)
);
INSERT INTO Employees (EmployeeName, Salary)
VALUES
('Alice', 1200),
('Bob', 800),
('Charlie', 1500),
('David', 700);
```

```sql
SELECT EmployeeName,
Salary,
IIF(Salary > 1000, 'High', 'Low') AS SalaryCategory
FROM Employees;
```

Condition: `Salary > 1000` → `'High'` if true, `'Low'` if false.

## Explain the use of the ISNULL and NULLIF functions.

**ISNULL** and **NULLIF** both handle NULLs but serve opposite purposes.

### ISNULL

Replaces NULL with a specified replacement value; returns the original value if not NULL.

```sql
-- Replace NULL with 'Unknown'
SELECT ISNULL(NULL, 'Unknown') AS Result; -- Returns 'Unknown'
-- Replace NULL with a default value in a column
SELECT ISNULL(ColumnName, 'DefaultValue') AS ColumnValue
FROM TableName;
```

### NULLIF

Compares two expressions — returns NULL if equal, otherwise returns the first expression. Useful for division-by-zero and conditional NULLing.

```sql
-- Return NULL if the values are equal, otherwise return the first value
SELECT NULLIF(5, 5) AS Result; -- Returns NULL
-- Return NULL if a column value equals a certain value, otherwise return the column value
SELECT NULLIF(ColumnName, 'UnwantedValue') AS ColumnValue
FROM TableName;
```

| Function | Behavior |
|----------|----------|
| ISNULL | NULL → replacement value |
| NULLIF | Equal values → NULL |

## Explain the purpose of COALESCE in SQL.

**COALESCE** returns the **first non-NULL** value from a list of expressions — standard SQL, more flexible than ISNULL (which accepts only two arguments).

**Uses:** handle NULLs, provide defaults, simplify multi-column fallback logic.

**Syntax:** `COALESCE(expression1, expression2, ..., expressionN)`

#### 1. Basic Example

```sql
Suppose you have a table Employees with a column MiddleName that may contain NULL values. You want to display the middle name if it exists; otherwise, you want to display the string "N/A":
SELECT FirstName,
COALESCE(MiddleName, 'N/A') AS MiddleName
FROM Employees;
```

Returns MiddleName when present; otherwise `'N/A'`.

#### 2. Multiple Columns

```sql
SELECT FirstName,
COALESCE(MiddleName, Nickname, 'No Middle Name') AS DisplayName
FROM Employees;
```

Checks MiddleName → Nickname → `'No Middle Name'` in order.

**vs ISNULL:** ISNULL is SQL Server–specific and limited to two arguments; COALESCE is ANSI-standard and accepts multiple.

```sql
-- Equivalent to COALESCE in SQL Server
SELECT FirstName,
ISNULL(MiddleName, 'N/A') AS MiddleName
FROM Employees;
```

## How do you use the CAST and CONVERT functions in SQL Server?

Both convert expressions between data types. **CAST** is ANSI-standard; **CONVERT** is SQL Server–specific and supports date/time **style codes**.

| Function | Standard | Date Formatting |
|----------|----------|-----------------|
| CAST | ANSI SQL | No style codes |
| CONVERT | SQL Server | Style codes for dates |

**Use CAST** for straightforward conversions; **use CONVERT** when you need specific date/time output formats.

#### CAST Example

```sql
-- Convert DATETIME to VARCHAR
SELECT CAST(GETDATE() AS VARCHAR(30)) AS DateAsString;
```

#### CONVERT Example

```sql
-- Convert DATETIME to VARCHAR with different formats
SELECT CONVERT(VARCHAR(30), GETDATE(), 1) AS MMDDYYYYFormat, -- MM/DD/YY
CONVERT(VARCHAR(30), GETDATE(), 3) AS DDMMYYYYFormat, -- DD/MM/YY
CONVERT(VARCHAR(30), GETDATE(), 20) AS YYYYMMDDHHMMFormat -- YYYY-MM-DD HH:MI
```

## What is GUID

A **GUID** (Globally Unique Identifier) is a 128-bit identifier for unique object/record identification across systems without a central authority.

**Key characteristics:**

1. **Uniqueness** — collision probability is extremely low.
2. **Format** — 32-character hex string with hyphens (8-4-4-4-12).
3. **Standardization** — defined by IETF and Microsoft.

**In SQL Server:** stored as **UNIQUEIDENTIFIER** data type.

**Generating GUIDs:**

- **NEWID()** — random GUID.

```sql
SELECT NEWID() AS NewGUID;
```

- **NEWSEQUENTIALID()** — sequentially ordered GUID (SQL Server only; better index performance in some scenarios).

```sql
SELECT NEWSEQUENTIALID() AS SequentialGUID;
```

**Example:**

```sql
CREATE TABLE Users (
UserID UNIQUEIDENTIFIER DEFAULT NEWID(),
UserName NVARCHAR(50)
);
INSERT INTO Users (UserName)
VALUES ('Alice');
SELECT * FROM Users;
```

`UserID` defaults to a new GUID on each insert via `NEWID()`.

## What is Quotename function

**QUOTENAME** safely quotes/escapes identifiers (table, column, database names) — essential for dynamic SQL and reserved keywords.

**Syntax:** `QUOTENAME(string, [quote_character])` — default quote character is square brackets `[]`.

**Purpose:** escape reserved keywords, prevent SQL injection in dynamic SQL, handle special characters.

### Examples

1. **Basic Quoting with Default Brackets**

Result

This example shows how QUOTENAME encloses the identifier TableName in square brackets.

```sql
SELECT QUOTENAME('TableName')
[TableName]
```

2. **Using Custom Quote Character**

Result

This example uses double quotes as the quoting character.

```sql
SELECT QUOTENAME('TableName', '"')
"TableName"
```

3. **Quoting Identifiers with Special Characters**

Result

QUOTENAME adds square brackets around the identifier, handling the spaces and special characters.

```sql
SELECT QUOTENAME('My Table$%')
[My Table$%]
```

4. **Avoiding Reserved Keywords**

Result

This example shows how QUOTENAME handles reserved keywords by quoting them, so they can be used as identifiers.

```sql
SELECT QUOTENAME('Select')
[Select]
```

**Dynamic SQL example:**

```sql
DECLARE @TableName NVARCHAR(128) = 'MyTableName';
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'SELECT * FROM ' + QUOTENAME(@TableName);
EXEC sp_executesql @SQL;
```

## What is pivot

**PIVOT** transforms row values into columns — useful for cross-tabulation and summary reports.

**How it works:**

1. Applies an aggregate function (SUM, COUNT, MAX, MIN, etc.).
2. Converts distinct values from one column into new column headers.
3. Groups by specified non-pivoted columns.

**Syntax:**

SELECT <non-pivoted column>, [<pivoted column value 1>], [<pivoted column value 2>], ...

```sql
FROM
```

(

```sql
SELECT <non-pivoted column>, <pivoted column>, <aggregate column>
FROM <source_table>
```

) AS SourceTable

PIVOT

(

```sql
<aggregate function>(<aggregate column>)
FOR <pivoted column> IN ([<pivoted column value 1>], [<pivoted column value 2>], ...)
) AS PivotTable;
```

**Example:**

```sql
CREATE TABLE Sales (
SalesPerson NVARCHAR(50),
SalesMonth NVARCHAR(20),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales VALUES ('Alice', 'January', 1000);
INSERT INTO Sales VALUES ('Alice', 'February', 1500);
INSERT INTO Sales VALUES ('Bob', 'January', 2000);
INSERT INTO Sales VALUES ('Bob', 'February', 2500);
```

```sql
SELECT SalesPerson, [January], [February]
FROM
```

(

```sql
SELECT SalesPerson, SalesMonth, SalesAmount
FROM Sales
```

) AS SourceTable

PIVOT

(

SUM(SalesAmount)

FOR SalesMonth IN ([January], [February])

) AS PivotTable;

**Result:**

SalesPerson | January | February

```sql
------------|---------|---------
```

Alice | 1000.00 | 1500.00

Bob | 2000.00 | 2500.00

Inner query supplies source data; PIVOT applies `SUM(SalesAmount)` and turns `SalesMonth` values into columns.

## What is Rollup

**ROLLUP** extends `GROUP BY` to produce hierarchical subtotals and a grand total — ideal for multi-level summary reports.

**Key concepts:** hierarchical aggregates at each grouping level; NULL placeholders mark subtotal/grand-total rows.

**Syntax:**

```sql
SELECT column1, column2, ..., aggregate_function(columnN)
FROM table
GROUP BY ROLLUP (column1, column2, ...);
```

**Example:**

```sql
CREATE TABLE Sales (
SalesPerson NVARCHAR(50),
SalesMonth NVARCHAR(20),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales (SalesPerson, SalesMonth, SalesAmount)
VALUES
('Alice', 'January', 1000),
('Alice', 'February', 1500),
('Bob', 'January', 2000),
('Bob', 'February', 2500);
```

```sql
SELECT SalesPerson, SalesMonth, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY ROLLUP (SalesPerson, SalesMonth);
```

Produces: per person/month detail → per-person subtotals → per-month subtotals → grand total.

| **SalesPerson** | **SalesMonth** | **TotalSales** |
|-----------------|----------------|----------------|
| Alice           | January        | 1000.00        |
| Alice           | February       | 1500.00        |
| Alice           | NULL           | 2500.00        |
| Bob             | January        | 2000.00        |
| Bob             | February       | 2500.00        |
| Bob             | NULL           | 4500.00        |
| NULL            | January        | 3000.00        |
| NULL            | February       | 4000.00        |
| NULL            | NULL           | 7000.00        |

## What is Cube

**CUBE** extends `GROUP BY` to compute aggregates for **all possible combinations** of specified columns — multidimensional summaries with subtotals and grand totals.

**vs ROLLUP:** ROLLUP is hierarchical (left-to-right); CUBE generates every combination.

**Syntax:**

```sql
SELECT column1, column2, ..., aggregate_function(columnN)
FROM table
GROUP BY CUBE (column1, column2, ...);
```

**Example:**

```sql
CREATE TABLE Sales (
SalesPerson NVARCHAR(50),
SalesMonth NVARCHAR(20),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales (SalesPerson, SalesMonth, SalesAmount)
VALUES
('Alice', 'January', 1000),
('Alice', 'February', 1500),
('Bob', 'January', 2000),
('Bob', 'February', 2500);
```

```sql
SELECT SalesPerson, SalesMonth, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY CUBE (SalesPerson, SalesMonth);
```

| **SalesPerson** | **SalesMonth** | **TotalSales** |
|-----------------|----------------|----------------|
| Alice           | January        | 1000.00        |
| Alice           | February       | 1500.00        |
| Alice           | NULL           | 2500.00        |
| Bob             | January        | 2000.00        |
| Bob             | February       | 2500.00        |
| Bob             | NULL           | 4500.00        |
| NULL            | January        | 3000.00        |
| NULL            | February       | 4000.00        |
| NULL            | NULL           | 7000.00        |

## What is Grouping set

**GROUPING SETS** specify multiple independent groupings in a single `GROUP BY` — more flexible and often more efficient than separate queries or full CUBE/ROLLUP.

**Syntax:**

```sql
SELECT column1, column2, ..., aggregate_function(columnN)
FROM table
GROUP BY GROUPING SETS
```

(

(column1, column2, ...),

(column1),

(column2),

()

```sql
);
```

**Example:**

```sql
CREATE TABLE Sales (
SalesPerson NVARCHAR(50),
SalesMonth NVARCHAR(20),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales (SalesPerson, SalesMonth, SalesAmount)
VALUES
('Alice', 'January', 1000),
('Alice', 'February', 1500),
('Bob', 'January', 2000),
('Bob', 'February', 2500);
```

```sql
SELECT SalesPerson, SalesMonth, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY GROUPING SETS
```

(

(SalesPerson, SalesMonth), -- Aggregation by SalesPerson and SalesMonth

(SalesPerson), -- Aggregation by SalesPerson only

(SalesMonth), -- Aggregation by SalesMonth only

() -- Aggregation by all (total)

```sql
);
```

Each tuple defines one grouping level: detail, by person, by month, and grand total.

## What is Grouping function

**Grouping functions** distinguish aggregate NULLs (from ROLLUP/CUBE/GROUPING SETS) from real data NULLs.

### GROUPING

Returns **1** if the column is an aggregate/subtotal row; **0** for actual data.

**Syntax:** `GROUPING(column_name)`

```sql
SELECT SalesPerson,
SalesMonth,
SUM(SalesAmount) AS TotalSales,
GROUPING(SalesPerson) AS SalesPersonGrouping,
GROUPING(SalesMonth) AS SalesMonthGrouping
FROM Sales
GROUP BY CUBE (SalesPerson, SalesMonth);
In this example, GROUPING(SalesPerson) will return 1 for rows where SalesPerson is aggregated (i.e., it's a subtotal or grand total), and 0 for rows where SalesPerson is part of the actual data.
```

### GROUPING_ID

Returns an integer bitmask encoding which columns are aggregated — useful for identifying hierarchy level.

**Syntax:** `GROUPING_ID(column1, column2, ...)`

```sql
SELECT SalesPerson,
SalesMonth,
SUM(SalesAmount) AS TotalSales,
GROUPING_ID(SalesPerson, SalesMonth) AS GroupingID
FROM Sales
GROUP BY ROLLUP (SalesPerson, SalesMonth);
In this example, GROUPING_ID(SalesPerson, SalesMonth) returns an integer where each bit represents whether each column is part of the grouping. For instance, if SalesPerson is aggregated but SalesMonth is not, the function might return a value like 1.
```

## Explain window functions in SQL Server.

**Window functions** compute per-row results over a defined window of related rows — unlike aggregates, they don't collapse rows. They use the **OVER** clause for partitioning, ordering, and frame definition.

**Key characteristics:**

1. Row-by-row calculation within a window.
2. **OVER** clause defines partition and frame.
3. Optional **PARTITION BY** and **ORDER BY**.

### Common Window Functions

#### 1. Ranking Functions

- **ROW_NUMBER()**: Unique sequential integer per partition.

```sql
ROW_NUMBER() OVER (PARTITION BY column ORDER BY column)
```

- **RANK()**: Same rank for ties; skips subsequent ranks.

```sql
RANK() OVER (PARTITION BY column ORDER BY column)
```

- **DENSE_RANK()**: Same rank for ties; no gaps.

```sql
DENSE_RANK() OVER (PARTITION BY column ORDER BY column)
```

- **NTILE()**: Divides rows into N roughly equal buckets.

```sql
NTILE(n) OVER (PARTITION BY column ORDER BY column)
```

#### 2. Aggregate Functions (as window functions)

- **SUM()**:

```sql
SUM(column) OVER (PARTITION BY column ORDER BY column ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

- **AVG()**:

```sql
AVG(column) OVER (PARTITION BY column ORDER BY column ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

- **MIN()** and **MAX()**:

```sql
MIN(column) OVER (PARTITION BY column ORDER BY column)
```

#### 3. Statistical Functions

- **CUME_DIST()** — cumulative distribution of a value.

```sql
CUME_DIST() OVER (PARTITION BY column ORDER BY column)
```

- **PERCENT_RANK()** — rank as percentage of total rows.

```sql
PERCENT_RANK() OVER (PARTITION BY column ORDER BY column)
```

**General syntax:**

window_function (expression) OVER (

```sql
[PARTITION BY partition_expression]
[ORDER BY order_expression]
[ROWS BETWEEN start_point AND end_point]
)
```

**Examples:**

#### Ranking Employees by Salary

```sql
SELECT EmployeeID, EmployeeName, Salary,
RANK() OVER (ORDER BY Salary DESC) AS SalaryRank
FROM Employees;
```

#### Running Total of Sales

```sql
SELECT SalesDate, SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesDate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM Sales;
```

#### Moving Average

```sql
SELECT SalesDate, SalesAmount,
AVG(SalesAmount) OVER (ORDER BY SalesDate ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS MovingAvg
FROM Sales;
```

## What are the differences between RANK(), ROW_NUMBER(), and DENSE_RANK()?

All three assign ordering within a partition; they differ in how they handle ties.

### 1. ROW_NUMBER()

Unique sequential number per row; **no ties**. Used for pagination and unique row identifiers.

```sql
ROW_NUMBER() OVER (PARTITION BY column ORDER BY column)
```

```sql
SELECT EmployeeID, EmployeeName,
ROW_NUMBER() OVER (ORDER BY Salary DESC) AS RowNum
FROM Employees;
```

### 2. RANK()

Same rank for ties; **gaps** after ties (e.g., two rank-1 rows → next is rank 3).

```sql
RANK() OVER (PARTITION BY column ORDER BY column)
```

```sql
SELECT EmployeeID, EmployeeName, Salary,
RANK() OVER (ORDER BY Salary DESC) AS Rank
FROM Employees;
```

### 3. DENSE_RANK()

Same rank for ties; **no gaps** (e.g., two rank-1 rows → next is rank 2).

```sql
DENSE_RANK() OVER (PARTITION BY column ORDER BY column)
```

```sql
SELECT EmployeeID, EmployeeName, Salary,
DENSE_RANK() OVER (ORDER BY Salary DESC) AS DenseRank
FROM Employees;
```

| Function | Ties | Gaps | Best For |
|----------|------|------|----------|
| ROW_NUMBER() | No ties | N/A | Pagination, unique IDs |
| RANK() | Same rank | Yes | Competition ranking (Olympic style) |
| DENSE_RANK() | Same rank | No | Dense ranking without gaps |

## What is Difference between rows and range

**ROWS** and **RANGE** define the window frame in `OVER` — they differ in whether the frame is based on physical row position or value range.

### ROWS

Frame by **physical row count** relative to the current row.

```sql
<window_function> OVER (
ORDER BY column_name
ROWS BETWEEN <start_point> AND <end_point>
)
```

```sql
SELECT SalesMonth,
SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesMonth ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS RollingSum
FROM Sales;
```

Includes current row plus 1 preceding and 1 following row by position.

### RANGE

Frame by **value range** in the ORDER BY column.

```sql
<window_function> OVER (
ORDER BY column_name
RANGE BETWEEN <start_point> AND <end_point>
)
```

```sql
SELECT SalesMonth,
SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesAmount RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING) AS RangeSum
FROM Sales;
```

Includes rows where `SalesAmount` falls within ±1000 of the current row's value.

| Aspect | ROWS | RANGE |
|--------|------|-------|
| Frame basis | Physical row position | Value range in ORDER BY column |
| Use case | Fixed-row moving averages | Value-based aggregations |

## What is Lead and lag function

**LEAD** and **LAG** are window functions that access values from **subsequent** or **preceding** rows — useful for period-over-period comparisons and trend analysis.

### LEAD Function

Accesses a value from a **future** row.

```sql
LEAD(expression, [offset], [default]) OVER (PARTITION BY partition_column ORDER BY order_column)
```

- **offset** — rows forward (default 1).
- **default** — returned when offset exceeds result set (default NULL).

**Example:**

```sql
CREATE TABLE Sales (
SalesMonth NVARCHAR(20),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales (SalesMonth, SalesAmount)
VALUES
('January', 1000),
('February', 1500),
('March', 2000),
('April', 2500),
('May', 3000);
```

```sql
SELECT SalesMonth,
SalesAmount,
LEAD(SalesAmount, 1, 'N/A') OVER (ORDER BY SalesMonth) AS NextMonthSales
FROM Sales;
```

| **SalesMonth** | **SalesAmount** | **NextMonthSales** |
|----------------|-----------------|--------------------|
| January        | 1000            | 1500               |
| February       | 1500            | 2000               |
| March          | 2000            | 2500               |
| April          | 2500            | 3000               |
| May            | 3000            | N/A                |

### LAG Function

Accesses a value from a **previous** row.

```sql
LAG(expression, [offset], [default]) OVER (PARTITION BY partition_column ORDER BY order_column)
```

```sql
SELECT SalesMonth,
SalesAmount,
LAG(SalesAmount, 1, 'N/A') OVER (ORDER BY SalesMonth) AS PreviousMonthSales
FROM Sales;
```

| **SalesMonth** | **SalesAmount** | **PreviousMonthSales** |
|----------------|-----------------|------------------------|
| January        | 1000            | N/A                    |
| February       | 1500            | 1000                   |
| March          | 2000            | 1500                   |
| April          | 2500            | 2000                   |
| May            | 3000            | 2500                   |

## What is NTile function

**NTILE(n)** divides an ordered partition into **n** roughly equal groups (tiles/buckets), assigning each row a tile number (1 to n).

**Syntax:**

```sql
NTILE(number_of_tiles) OVER (ORDER BY column_name)
```

**Example:**

```sql
CREATE TABLE Sales (
SalesPerson NVARCHAR(50),
SalesAmount DECIMAL(10, 2)
);
INSERT INTO Sales (SalesPerson, SalesAmount)
VALUES
('Alice', 1000),
('Bob', 1500),
('Charlie', 2000),
('David', 2500),
('Eve', 3000);
You want to divide the salespersons into 3 tiles based on their SalesAmount:
SELECT SalesPerson,
SalesAmount,
NTILE(3) OVER (ORDER BY SalesAmount DESC) AS SalesTile
FROM Sales;
```

| **SalesPerson** | **SalesAmount** | **SalesTile** |
|-----------------|-----------------|---------------|
| Eve             | 3000            | 1             |
| David           | 2500            | 1             |
| Charlie         | 2000            | 2             |
| Bob             | 1500            | 2             |
| Alice           | 1000            | 3             |

Tiles may differ slightly in size when row count isn't evenly divisible by n. Used for quantiles, ranking, and data segmentation.
