# SQL Server Basics

## Questions Covered

1. What is Collation? What are the different types of Collation Sensitivity?
2. What are the different types of data types in SQL Server?
3. What are the differences between DATETIME, SMALLDATETIME, and DATE data types?
4. What are user-defined data types?
5. What is the difference between CHAR and VARCHAR?
6. What is Normalization and Denormalization?
7. What are the different types of joins in SQL Server?
8. What is CROSS APPLY And OUTER APPLY?
9. What types of SQL relationships do you know?
10. Explain the difference between WHERE and HAVING clauses.
11. What are constraints in SQL? Name the different types.
12. How do you enforce unique data in a SQL Server table?
13. Explain cascading actions (ON DELETE, ON UPDATE) for foreign keys.
14. What is a primary key, and can a table have more than one primary key?
15. How do you use the EXISTS clause in SQL?
16. How would you use the GROUP BY clause?
17. Explain UNION vs. UNION ALL.
18. What is difference between union, intersect and except
19. What are cursors
20. What is the purpose of a temporary table, and how do you create one?
21. How do you use table variables vs. temporary tables?
22. What is a Common Table Expression (CTE)? Provide an example.
23. Explain what a view is and its use cases.
24. What are indexed(a materialized view) views, and how do they differ from regular views?
25. Can views be updated in SQL Server? If so, how?
26. What are stored procedures? How do they differ from functions?
27. What is a trigger? Can you give an example of when to use it?
28. what are magic tables
29. How do you handle exceptions in SQL Server stored procedures?
30. What is the difference between RAISEERROR and THROW?
31. What is the purpose of a FILESTREAM in SQL Server?
32. What is table partitioning, and how does it improve performance?
33. How do you create and manage partitioned tables in SQL Server?
34. What is the SQL Server error log, and how do you access it?

## What is Collation? What are the different types of Collation Sensitivity?

**Collation** defines how SQL Server sorts and compares string data — character set, sort order, and comparison rules (case, accent, language). It affects ORDER BY, WHERE comparisons, and indexes on text columns.

**Collation sensitivity types:**

| Type | Sensitive | Insensitive | Effect |
|------|-----------|-------------|--------|
| Case (CS/CI) | 'A' ≠ 'a' | 'A' = 'a' | Upper vs lower case |
| Accent (AS/AI) | 'é' ≠ 'e' | 'é' = 'e' | Accented characters |
| Kana (KS/KI) | Hiragana ≠ Katakana | Treated equal | Japanese scripts |
| Width (WS/WI) | Single-byte ≠ double-byte | Treated equal | Full-width vs half-width |

**Example:**

```sql
-- Case-sensitive collation
COLLATE Latin1_General_BIN
SELECT 'A' = 'a'; -- Returns 0 (false)
-- Case-insensitive collation
COLLATE Latin1_General_CI_AS
SELECT 'A' = 'a'; -- Returns 1 (true)
```

**Example:**

```sql
-- Accent-sensitive collation
COLLATE Latin1_General_BIN
SELECT 'é' = 'e'; -- Returns 0 (false)
-- Accent-insensitive collation
COLLATE Latin1_General_CI_AI
SELECT 'é' = 'e'; -- Returns 1 (true)
```

**Example:**

```sql
-- Kana-sensitive collation
COLLATE Japanese_XJIS_BIN
SELECT 'あ' = 'ア'; -- Returns 0 (false)
-- Kana-insensitive collation
COLLATE Japanese_XJIS_CI_AI
SELECT 'あ' = 'ア'; -- Returns 1 (true)
```

**Example:**

```sql
-- Width-sensitive collation
COLLATE Korean_Wansung_BIN
SELECT 'a' = 'ａ'; -- Returns 0 (false)
-- Width-insensitive collation
COLLATE Korean_Wansung_CI_AI
SELECT 'a' = 'ａ'; -- Returns 1 (true)
```

Collation can be set at **database**, **column**, or **query** level:

```sql
CREATE DATABASE MyDatabase
COLLATE Latin1_General_CI_AS;
```

```sql
CREATE TABLE MyTable (
Name NVARCHAR(100) COLLATE Latin1_General_BIN
);
```

```sql
SELECT *
FROM MyTable
WHERE Name COLLATE Latin1_General_CI_AI = 'example';
```

## What are the different types of data types in SQL Server?

SQL Server data types fall into several categories. Choose based on range, precision, Unicode needs, and storage.

**1. Numeric:** INT (32-bit), BIGINT (64-bit), SMALLINT, TINYINT, DECIMAL/NUMERIC(p,s) (exact), FLOAT/REAL (approximate).

**2. Character:** CHAR(n) fixed, VARCHAR(n) variable, TEXT (deprecated — use VARCHAR(MAX)).

**3. Unicode:** NCHAR(n), NVARCHAR(n), NTEXT (deprecated — use NVARCHAR(MAX)).

**4. Date/Time:** DATE, TIME, DATETIME, DATETIME2, SMALLDATETIME, DATETIMEOFFSET.

**5. Binary:** BINARY(n), VARBINARY(n), IMAGE (deprecated — use VARBINARY(MAX)).

**6. Other:** BIT, UNIQUEIDENTIFIER (GUID), XML, JSON (stored in VARCHAR/NVARCHAR, queried via functions).

**7. Spatial:** GEOGRAPHY (spherical), GEOMETRY (planar).

**Guidelines:** Use VARCHAR/CHAR for non-Unicode, NVARCHAR for Unicode; DECIMAL for exact numbers; VARBINARY(MAX) for large binary data.

## What are the differences between DATETIME, SMALLDATETIME, and DATE data types?

| Type | Stores | Range | Precision | Storage |
|------|--------|-------|-----------|---------|
| DATETIME | Date + time | 1753–9999 | ~3.33 ms (1/300 sec) | 8 bytes |
| SMALLDATETIME | Date + time | 1900–2079 | Minute (rounded) | 4 bytes |
| DATE | Date only | 0001–9999 | N/A | 3 bytes |

```sql
-- Example of DATETIME usage
SELECT CAST('2024-09-06 14:30:00.123' AS DATETIME) AS DateTimeValue;
```

```sql
-- Example of SMALLDATETIME usage
SELECT CAST('2024-09-06 14:30:00' AS SMALLDATETIME) AS SmallDateTimeValue;
```

```sql
-- Example of DATE usage
SELECT CAST('2024-09-06' AS DATE) AS DateValue;
```

Use **DATETIME** when you need date and time with millisecond precision; **SMALLDATETIME** when minute precision and smaller storage suffice; **DATE** when time is irrelevant.

## What are user-defined data types?

User-defined types wrap system types for consistency and reuse. Two kinds: **scalar UDTs** and **table types**.

**Scalar UDT** — alias with optional rules:

```sql
CREATE TYPE CustomDataType AS VARCHAR(100);
```

```sql
-- Create a table with a column using the user-defined data type
CREATE TABLE ExampleTable (
ID INT PRIMARY KEY,
```

Name CustomDataType

```sql
);
```

SQL Server does not support altering UDTs — drop and recreate:

```sql
-- Alter the user-defined data type (if needed)
```

-- SQL Server does not support altering user-defined types directly. You need to drop and recreate them.

```sql
-- Drop a user-defined data type
DROP TYPE CustomDataType;
```

**Table type** — reusable table structure for TVPs:

CREATE TYPE CustomTableType AS TABLE (

```sql
ID INT PRIMARY KEY,
Name VARCHAR(100),
```

CreatedDate DATETIME

```sql
);
```

```sql
-- Declare a variable of the user-defined table type
DECLARE @TableVariable CustomTableType;
-- Insert data into the table variable
INSERT INTO @TableVariable (ID, Name, CreatedDate)
VALUES (1, 'SampleName', GETDATE());
-- Use the table variable in a query
SELECT * FROM @TableVariable;
```

## What is the difference between CHAR and VARCHAR?

| Criteria | CHAR | VARCHAR |
|----------|------|---------|
| Storage | Fixed-length (padded with spaces) | Variable-length |
| Performance | Slightly faster for fixed-size data | Slower for large variable data |
| Use case | Fixed-length codes (e.g., country codes) | Variable-length text (names, descriptions) |
| Max size | 8,000 chars | 8,000 chars (or 2 GB with MAX) |

## What is Normalization and Denormalization?

**Normalization** organizes tables to reduce redundancy and improve integrity. **Denormalization** intentionally adds redundancy (often for read performance in reporting/warehousing).

**Normal forms:**

| Form | Requirement |
|------|-------------|
| 1NF | Atomic values; primary key; no repeating groups |
| 2NF | 1NF + no partial dependencies on composite keys |
| 3NF | 2NF + no transitive dependencies (non-key → non-key) |
| BCNF | 3NF + every determinant is a candidate key |
| 4NF | BCNF + no multi-valued dependencies |
| 5NF | 4NF + no join dependencies beyond candidate keys |

**Example of 1NF Violation**

Fixed to 1NF

```sql
StudentID | Name | Courses
----------|--------|----------------------
1 | John | Math, English
2 | Jane | Science
StudentID | Name | Course
----------|--------|---------
1 | John | Math
1 | John | English
2 | Jane | Science
```

**Example of 2NF Violation**

Fixed to 2NF

Orders Table

Products Table

```sql
OrderID | ProductID | ProductName | Quantity
------- | --------- | ----------- | --------
1 | 101 | Widget | 10
1 | 102 | Gadget | 5
OrderID | ProductID | Quantity
------- | --------- | --------
1 | 101 | 10
1 | 102 | 5
ProductID | ProductName
--------- | -----------
101 | Widget
102 | Gadget
```

**Example of 3NF Violation**

Fixed to 3NF

Students Table

Advisors Table

StudentAdvisors Table

```sql
StudentID | Name | AdvisorName
----------|--------|-------------
1 | John | Dr. Smith
2 | Jane | Dr. Jones
StudentID | Name
----------|-----
1 | John
2 | Jane
AdvisorID | AdvisorName
----------|------------
1 | Dr. Smith
2 | Dr. Jones
StudentID | AdvisorID
----------|-----------
1 | 1
2 | 2
```

```sql
**Example**: If a table includes multiple independent sets of values (e.g., skills and languages for an employee), these should be separated into different tables.
```

**Benefits:** less redundancy, better integrity, easier maintenance. **Denormalization** trades normalization for faster reads when consistency is less critical.

## What are the different types of joins in SQL Server?

Joins combine rows from two or more tables on related columns:

1. **INNER JOIN** — matching rows only.

```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.common_column = table2.common_column;
```

2. **LEFT JOIN** — all left rows + matched right rows (NULL if no match).

```sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.common_column = table2.common_column;
```

3. **RIGHT JOIN** — all right rows + matched left rows.

```sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.common_column = table2.common_column;
```

4. **FULL JOIN** — all rows from both sides; NULL where no match.

```sql
SELECT columns
FROM table1
FULL JOIN table2
ON table1.common_column = table2.common_column;
```

5. **CROSS JOIN** — Cartesian product (no ON clause).

```sql
SELECT columns
FROM table1
CROSS JOIN table2;
```

6. **SELF JOIN** — table joined to itself (hierarchies, row comparisons).

## What is CROSS APPLY And OUTER APPLY?

```sql
SELECT a.columns, b.columns
FROM table a
INNER JOIN table b
ON a.common_column = b.common_column;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
```

**CROSS APPLY** and **OUTER APPLY** join an outer table to a table-valued function or derived table per row — like JOIN, but the right side can depend on the outer row.

**CROSS APPLY** — only outer rows where the function returns results (like INNER JOIN):

```sql
SELECT t.*, f.*
FROM OuterTable t
CROSS APPLY TableValuedFunction(t.ColumnName) f;
```

**OUTER APPLY** — all outer rows; NULLs when the function returns nothing (like LEFT JOIN):

```sql
SELECT t.*, f.*
FROM OuterTable t
OUTER APPLY TableValuedFunction(t.ColumnName) f;
```

| | CROSS APPLY | OUTER APPLY |
|---|-------------|-------------|
| Outer rows | Only when function returns rows | All outer rows |
| No match | Row excluded | Row included with NULLs |

## What types of SQL relationships do you know?

| Relationship | Description | Implementation |
|--------------|-------------|----------------|
| One-to-One (1:1) | Each row in A maps to exactly one in B | PK/FK on either side |
| One-to-Many (1:N) | One A row → many B rows | FK on the "many" side |
| Many-to-Many (M:N) | Many on both sides | Junction table with composite PK |

**1:1 example:**

```sql
-- Employees table
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name VARCHAR(100)
);
-- EmployeeDetails table
CREATE TABLE EmployeeDetails (
EmployeeID INT PRIMARY KEY,
Address VARCHAR(255),
Phone VARCHAR(20),
FOREIGN KEY (EmployeeID) REFERENCES Employees(EmployeeID)
);
```

**1:N example:**

```sql
-- Departments table
CREATE TABLE Departments (
DepartmentID INT PRIMARY KEY,
DepartmentName VARCHAR(100)
);
-- Employees table
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name VARCHAR(100),
DepartmentID INT,
FOREIGN KEY (DepartmentID) REFERENCES Departments(DepartmentID)
);
```

**M:N example:**

```sql
-- Students table
CREATE TABLE Students (
StudentID INT PRIMARY KEY,
StudentName VARCHAR(100)
);
-- Courses table
CREATE TABLE Courses (
CourseID INT PRIMARY KEY,
CourseName VARCHAR(100)
);
-- StudentCourses table (junction table)
CREATE TABLE StudentCourses (
StudentID INT,
CourseID INT,
PRIMARY KEY (StudentID, CourseID),
FOREIGN KEY (StudentID) REFERENCES Students(StudentID),
FOREIGN KEY (CourseID) REFERENCES Courses(CourseID)
);
```

## Explain the difference between WHERE and HAVING clauses.

```sql
In SQL, both **WHERE** and **HAVING** clauses are used to filter rows, but they serve different purposes and are applied at different stages of query execution
```

| Clause | When applied | Filters |
|--------|--------------|---------|
| WHERE | Before grouping | Individual rows |
| HAVING | After GROUP BY / aggregates | Groups |

```sql
SELECT ProductName, Price
FROM Products
WHERE Price > 100;
```

```sql
SELECT Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY Category
HAVING COUNT(ProductID) > 10;
```

Aggregate functions cannot appear in WHERE — use HAVING instead. Combined example:

```sql
SELECT Category, AVG(Price) AS AvgPrice
FROM Products
WHERE Price > 100 -- Filter rows before grouping
GROUP BY Category
HAVING AVG(Price) > 200; -- Filter groups based on aggregate function
```

## What are constraints in SQL? Name the different types.

**Constraints** enforce data integrity rules on columns or tables.

1. **PRIMARY KEY** — unique, NOT NULL; one per table (can be composite).

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
FirstName NVARCHAR(50),
LastName NVARCHAR(50)
);
```

2. **FOREIGN KEY** — links to a parent PK; enforces referential integrity.

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
CustomerID INT,
FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);
```

3. **UNIQUE** — distinct values; allows NULL (one per column); multiple per table.

```sql
CREATE TABLE Users (
UserID INT PRIMARY KEY,
Email NVARCHAR(255) UNIQUE
);
```

4. **NOT NULL** — column must have a value.

```sql
CREATE TABLE Products (
ProductID INT PRIMARY KEY,
ProductName NVARCHAR(100) NOT NULL
);
```

5. **CHECK** — custom validation rule.

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Salary DECIMAL(10, 2),
CHECK (Salary >= 0) -- Salary must be non-negative
);
```

6. **DEFAULT** — value used when none supplied.

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
OrderDate DATETIME DEFAULT GETDATE() -- Default to current date/time
);
```

7. **Index** (not a constraint) — speeds retrieval without enforcing integrity rules.

## How do you enforce unique data in a SQL Server table?

| Method | Notes |
|--------|-------|
| UNIQUE constraint | Column or composite uniqueness |
| PRIMARY KEY | Unique + NOT NULL; one per table |
| UNIQUE INDEX | Same effect as unique constraint; created independently |
| Composite unique | `UNIQUE (col1, col2)` or composite PK |

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Email NVARCHAR(255) UNIQUE
);
```

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name NVARCHAR(255)
);
```

```sql
CREATE UNIQUE INDEX UX_Email
ON Employees (Email);
```

```sql
ALTER TABLE table_name
ADD CONSTRAINT constraint_name UNIQUE (column1, column2);
```

```sql
CREATE TABLE EmployeeProjects (
EmployeeID INT,
ProjectID INT,
PRIMARY KEY (EmployeeID, ProjectID)
);
```

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
OrderDate DATE,
CustomerID INT,
CHECK (OrderDate >= '2020-01-01')
);
```

## Explain cascading actions (ON DELETE, ON UPDATE) for foreign keys.

Cascading actions propagate parent changes to child FK rows automatically.

**ON DELETE CASCADE** — delete child rows when parent is deleted:

```sql
CREATE TABLE ParentTable (
ParentID INT PRIMARY KEY,
ParentName NVARCHAR(100)
);
CREATE TABLE ChildTable (
ChildID INT PRIMARY KEY,
ParentID INT,
ChildName NVARCHAR(100),
FOREIGN KEY (ParentID) REFERENCES ParentTable(ParentID)
ON DELETE CASCADE
);
In this example:
```

**ON UPDATE CASCADE** — update child FK when parent PK changes:

```sql
CREATE TABLE ParentTable (
ParentID INT PRIMARY KEY,
ParentName NVARCHAR(100)
);
CREATE TABLE ChildTable (
ChildID INT PRIMARY KEY,
ParentID INT,
ChildName NVARCHAR(100),
FOREIGN KEY (ParentID) REFERENCES ParentTable(ParentID)
ON UPDATE CASCADE
);
In this example:
```

**Other options:**

| Action | Behavior |
|--------|----------|
| ON DELETE NO ACTION (default) | Block delete if children exist |
| ON DELETE SET NULL | Set child FK to NULL |
| ON UPDATE SET NULL | Set child FK to NULL on parent PK change |

```sql
CREATE TABLE ChildTable (
ChildID INT PRIMARY KEY,
ParentID INT NULL,
ChildName NVARCHAR(100),
FOREIGN KEY (ParentID) REFERENCES ParentTable(ParentID)
ON DELETE SET NULL
);
In this example:
```

```sql
CREATE TABLE ChildTable (
ChildID INT PRIMARY KEY,
ParentID INT NULL,
ChildName NVARCHAR(100),
FOREIGN KEY (ParentID) REFERENCES ParentTable(ParentID)
ON UPDATE SET NULL
);
In this example:
```

## What is a primary key, and can a table have more than one primary key?

A **primary key** uniquely identifies each row (unique + NOT NULL). It can be a single column or **composite** (multiple columns forming one key).

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name NVARCHAR(100)
);
```

```sql
CREATE TABLE OrderDetails (
OrderID INT,
ProductID INT,
Quantity INT,
PRIMARY KEY (OrderID, ProductID)
);
```

**Only one primary key per table**, but it may span multiple columns. For additional uniqueness, use **UNIQUE constraints** or **unique indexes**:

```sql
CREATE TABLE Users (
UserID INT PRIMARY KEY,
```

Email NVARCHAR(255) UNIQUE

```sql
);
```

## How do you use the EXISTS clause in SQL?

**EXISTS** tests whether a subquery returns any rows — returns TRUE/FALSE. Efficient for correlated subqueries.

```sql
SELECT ProductID, ProductName
FROM Products p
WHERE EXISTS (
SELECT 1
FROM OrderDetails od
WHERE od.ProductID = p.ProductID
);
```

**EXISTS vs IN:** EXISTS checks row existence (often faster for correlated queries); IN checks membership in a value set.

```sql
EXISTS and IN can sometimes be used interchangeably, but they have different use cases. For instance, finding employees who work in departments with a budget over $1,000,000:
Using EXISTS:
SELECT EmployeeID, EmployeeName
FROM Employees e
WHERE EXISTS (
SELECT 1
FROM Departments d
WHERE d.DepartmentID = e.DepartmentID
```

AND d.Budget > 1000000

```sql
);
Using IN:
SELECT EmployeeID, EmployeeName
FROM Employees
WHERE DepartmentID IN (
SELECT DepartmentID
FROM Departments
WHERE Budget > 1000000
);
```

**EXISTS in DELETE:**

```sql
DELETE FROM Customers
WHERE EXISTS (
SELECT 1
FROM Orders
WHERE Orders.CustomerID = Customers.CustomerID
```

AND Orders.OrderDate < '2024-01-01'

```sql
);
```

## How would you use the GROUP BY clause?

**GROUP BY** aggregates rows sharing column values. Use with COUNT, SUM, AVG, MIN, MAX. Non-aggregated SELECT columns must appear in GROUP BY.

```sql
SELECT Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY Category;
```

```sql
SELECT Category, SUM(Amount) AS TotalSales
FROM Sales
GROUP BY Category;
```

```sql
SELECT SupplierID, Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY SupplierID, Category;
```

## Explain UNION vs. UNION ALL.

| Criteria | UNION | UNION ALL |
|----------|-------|-----------|
| Duplicates | Removed | Kept |
| Performance | Slower (sort/dedup) | Faster |
| Use case | Distinct combined set | When duplicates are acceptable |

Both require the same number of columns with compatible types.

## What is difference between union, intersect and except

Set operators combining query results (same column count and compatible types):

| Operator | Result |
|----------|--------|
| UNION | All rows from both queries; removes duplicates (use UNION ALL to keep them) |
| INTERSECT | Rows common to both |
| EXCEPT | Rows in first query not in second |

```sql
SELECT ProductName
FROM Sales2019
UNION
SELECT ProductName
FROM Sales2020;
```

```sql
SELECT ProductName
FROM Sales2019
INTERSECT
SELECT ProductName
FROM Sales2020;
```

```sql
SELECT ProductName
FROM Sales2019
EXCEPT
SELECT ProductName
FROM Sales2020;
```

## What are cursors

A **cursor** processes a result set **row by row** instead of set-based operations. Use only when row-by-row logic is unavoidable — cursors are slower and more resource-intensive.

**Lifecycle:** DECLARE → OPEN → FETCH (loop) → CLOSE → DEALLOCATE.

```sql
-- Declare a cursor
DECLARE @EmployeeID INT, @EmployeeName NVARCHAR(100);
DECLARE employee_cursor CURSOR FOR
SELECT EmployeeID, EmployeeName
FROM Employees;
-- Open the cursor
OPEN employee_cursor;
-- Fetch the first row
FETCH NEXT FROM employee_cursor INTO @EmployeeID, @EmployeeName;
-- Loop through the result set
WHILE @@FETCH_STATUS = 0
BEGIN
-- Perform operations on each row
PRINT 'Employee ID: ' + CAST(@EmployeeID AS NVARCHAR) + ', Name: ' + @EmployeeName;
-- Fetch the next row
FETCH NEXT FROM employee_cursor INTO @EmployeeID, @EmployeeName;
END;
-- Close the cursor
CLOSE employee_cursor;
-- Deallocate the cursor
DEALLOCATE employee_cursor;
```

**Types:** Static (snapshot), Dynamic (reflects live changes), Forward-only (fetch forward only), Keyset-driven (key-based result set).

Prefer set-based SQL (JOIN, GROUP BY, window functions) whenever possible.

## What is the purpose of a temporary table, and how do you create one?

**Temporary tables** store intermediate results in `tempdb` during a session or procedure — useful for breaking complex queries into steps.

| Type | Prefix | Scope | Dropped |
|------|--------|-------|---------|
| Local | `#` | Current session | Session end (or DROP) |
| Global | `##` | All sessions | Last session referencing it ends |

```sql
CREATE TABLE #TempTable (
Column1 INT,
Column2 NVARCHAR(100)
);
```

```sql
CREATE TABLE ##GlobalTempTable (
Column1 INT,
Column2 NVARCHAR(100)
);
```

## How do you use table variables vs. temporary tables?

| Feature | Table Variable (`@`) | Temp Table (`#` / `##`) |
|---------|---------------------|-------------------------|
| Scope | Batch/procedure/function | Session (local) or all sessions (global) |
| Storage | In memory initially | tempdb |
| Indexes | PK/unique only | Full index support |
| Statistics | None | Auto-generated |
| Logging | Minimal | Full table logging |
| Best for | Small datasets, simple logic | Large datasets, complex queries |

```sql
DECLARE @TableVariable TABLE (
Column1 DataType1,
Column2 DataType2,
```

...

```sql
);
```

```sql
-- Declare a table variable
DECLARE @EmployeeTable TABLE (
EmployeeID INT PRIMARY KEY,
EmployeeName VARCHAR(100),
```

HireDate DATETIME

```sql
);
-- Insert data into the table variable
INSERT INTO @EmployeeTable (EmployeeID, EmployeeName, HireDate)
VALUES (1, 'John Doe', GETDATE()), (2, 'Jane Smith', GETDATE());
-- Query the table variable
SELECT * FROM @EmployeeTable;
```

## What is a Common Table Expression (CTE)? Provide an example.

A **CTE** is a named temporary result set scoped to a single statement. Improves readability, enables reuse within a query, and supports **recursive** hierarchies.

**Syntax:** `WITH CTE_Name AS (query) SELECT ... FROM CTE_Name`

**Simple CTE:**

WITH DepartmentEmployeeCount AS (

```sql
SELECT DepartmentID, COUNT(EmployeeID) AS EmployeeCount
FROM Employees
GROUP BY DepartmentID
)
SELECT e.EmployeeID, e.EmployeeName, d.EmployeeCount
FROM Employees e
JOIN DepartmentEmployeeCount d
ON e.DepartmentID = d.DepartmentID
WHERE d.EmployeeCount > 10;
```

**Recursive CTE** (employee hierarchy):

WITH EmployeeHierarchy AS (

```sql
-- Anchor member: the starting point of the recursion
SELECT EmployeeID, EmployeeName, ManagerID
FROM Employees
WHERE ManagerID IS NULL -- Starting with the top-level managers
UNION ALL
-- Recursive member: joins with the CTE to find employees reporting to the current set of employees
SELECT e.EmployeeID, e.EmployeeName, e.ManagerID
FROM Employees e
INNER JOIN EmployeeHierarchy eh
ON e.ManagerID = eh.EmployeeID
)
SELECT EmployeeID, EmployeeName
FROM EmployeeHierarchy;
```

## Explain what a view is and its use cases.

A **view** is a virtual table defined by a SELECT query — no stored data (unless indexed). Use cases:

- **Simplify complex queries** — encapsulate joins/filters.
- **Security** — hide sensitive columns.
- **Abstraction** — unified interface across tables.
- **Reporting** — pre-aggregated summaries.

```sql
CREATE VIEW EmployeeDetails AS
SELECT e.EmployeeID, e.FirstName, e.LastName, d.DepartmentName, e.Salary
FROM Employees e
JOIN Departments d ON e.DepartmentID = d.DepartmentID
WHERE e.Salary > 50000;
```

```sql
CREATE VIEW EmployeeOverview AS
SELECT EmployeeID, FirstName, LastName, DepartmentID
FROM Employees;
```

```sql
CREATE VIEW CustomerOrders AS
SELECT c.CustomerID, c.CustomerName, o.OrderID, o.OrderDate
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID;
```

```sql
CREATE VIEW MonthlySalesReport AS
SELECT MONTH(OrderDate) AS SalesMonth, SUM(TotalAmount) AS TotalSales
FROM Sales
GROUP BY MONTH(OrderDate);
```

Views are queried like tables. Some are updatable; complex views (aggregates, DISTINCT, multi-table joins) often are not.

## What are indexed(a materialized view) views, and how do they differ from regular views?

An **indexed view** (materialized view) physically stores results via a **clustered index**. Requires `WITH SCHEMABINDING`. SQL Server reads from the index instead of re-executing the query.

```sql
CREATE VIEW SalesSummary
WITH SCHEMABINDING AS
SELECT s.StoreID, SUM(s.SalesAmount) AS TotalSales
FROM Sales s
GROUP BY s.StoreID;
GO
CREATE UNIQUE CLUSTERED INDEX IDX_SalesSummary
ON SalesSummary (StoreID);
```

| Feature | Regular View | Indexed View |
|---------|--------------|--------------|
| Data storage | Virtual (no data) | Physically stored + indexed |
| Performance | No direct gain | Major gain for aggregates/joins |
| Updates | Always current | Maintenance overhead on base-table changes |
| Indexing | Not on view itself | Requires clustered index |
| Schema binding | Optional | Mandatory |
| Use case | Query shortcuts | Read-heavy aggregations |

**Trade-offs:** indexed views consume disk space and slow DML on base tables; regular views have low overhead but no performance boost.

## Can views be updated in SQL Server? If so, how?

Yes, **simple views** can be updated if SQL Server can map changes to a single base table:

- No aggregates (SUM, COUNT), DISTINCT, GROUP BY, UNION, or HAVING.
- All NOT NULL columns without defaults must be included.

```sql
CREATE VIEW dbo.EmployeeView AS
SELECT EmployeeID, Name, Salary
FROM Employees;
```

```sql
-- Update a record through the view
UPDATE dbo.EmployeeView
SET Salary = 60000
WHERE EmployeeID = 101;
-- Insert a new record through the view
INSERT INTO dbo.EmployeeView (EmployeeID, Name, Salary)
VALUES (102, 'Jane Doe', 55000);
-- Delete a record through the view
DELETE FROM dbo.EmployeeView
WHERE EmployeeID = 102;
```

**Non-updatable** — views with aggregates, joins that can't be mapped, or computed columns:

```sql
CREATE VIEW dbo.SalesSummary AS
SELECT StoreID, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY StoreID;
```

## What are stored procedures? How do they differ from functions?

**Stored procedures** encapsulate SQL/business logic, executed via `EXEC`. Can modify data, manage transactions, return result sets, output parameters, and status codes.

```sql
CREATE PROCEDURE ProcedureName
@Parameter1 DataType,
@Parameter2 DataType OUTPUT
```

AS

```sql
BEGIN
-- SQL statements
SELECT * FROM TableName;
-- Optional: Set output parameter
SET @Parameter2 = some_value;
END;
```

```sql
CREATE PROCEDURE GetEmployeeDetails
```

@EmployeeID INT

AS

```sql
BEGIN
SELECT EmployeeName, Department FROM Employees WHERE EmployeeID = @EmployeeID;
END;
```

```sql
EXEC GetEmployeeDetails @EmployeeID = 123;
```

**Functions** return a scalar value or table; used inline in SELECT/WHERE/JOIN. Should be deterministic with no side effects (no DML, no transactions).

```sql
CREATE FUNCTION GetEmployeeName (@EmployeeID INT)
RETURNS NVARCHAR(100)
AS
BEGIN
DECLARE @EmployeeName NVARCHAR(100);
SELECT @EmployeeName = EmployeeName FROM Employees WHERE EmployeeID = @EmployeeID;
RETURN @EmployeeName;
END;
SELECT dbo.GetEmployeeName(123);
```

```sql
CREATE FUNCTION GetEmployeeByDepartment (@Department NVARCHAR(100))
RETURNS TABLE
AS
RETURN
(
SELECT EmployeeID, EmployeeName FROM Employees WHERE Department = @Department
);
SELECT * FROM dbo.GetEmployeeByDepartment('Sales');
```

| Aspect | Stored Procedure | Function |
|--------|------------------|----------|
| Return | Result sets, output params, status | Scalar value or table |
| Invocation | EXEC | Inline in SQL expressions |
| Side effects | Allowed (DML, transactions) | Not allowed |
| Parameters | Input + output | Input only |

## What is a trigger? Can you give an example of when to use it?

A **trigger** is a special stored procedure that **fires automatically** on DML/DDL events. Use for auditing, enforcing business rules, cascading updates, or blocking schema changes — without modifying application code.

**AFTER trigger** — runs after the operation completes (e.g., audit logging):

```sql
CREATE TRIGGER trg_AfterInsert
ON Employees
AFTER INSERT
AS
BEGIN
INSERT INTO AuditLog (EmployeeID, ActionType, ActionDate)
SELECT EmployeeID, 'INSERT', GETDATE()
FROM INSERTED;
END;
```

**INSTEAD OF trigger** — replaces the default operation (common on views):

```sql
CREATE TRIGGER trg_InsteadOfUpdate
ON Employees
INSTEAD OF UPDATE
AS
BEGIN
UPDATE Employees
SET Salary = i.Salary
FROM INSERTED i
WHERE Employees.EmployeeID = i.EmployeeID;
END;
```

**DML triggers** (INSERT/UPDATE/DELETE):

```sql
-- AFTER DML Trigger Example
CREATE TRIGGER trg_AfterDelete
ON Employees
AFTER DELETE
AS
BEGIN
INSERT INTO DeletedRecords (EmployeeID, DeletedDate)
SELECT EmployeeID, GETDATE()
FROM DELETED;
END;
-- INSTEAD OF DML Trigger Example
CREATE TRIGGER trg_InsteadOfInsert
ON Employees
INSTEAD OF INSERT
AS
BEGIN
-- Custom logic to handle insert
INSERT INTO Employees (EmployeeID, EmployeeName, Salary)
SELECT EmployeeID, EmployeeName, Salary
FROM INSERTED;
END;
```

**DDL trigger** — fires on schema events (CREATE/ALTER/DROP):

```sql
CREATE TRIGGER trg_PreventTableDrop
ON DATABASE
FOR DROP_TABLE
AS
BEGIN
PRINT 'Dropping tables is not allowed.';
ROLLBACK;
END;
```

Triggers use **INSERTED** and **DELETED** magic tables and cannot be called directly. Avoid recursive trigger chains.

## what are magic tables

**Magic tables** are system-managed tables available inside triggers:

| Table | Contents |
|-------|----------|
| INSERTED | New/updated rows (INSERT, UPDATE) |
| DELETED | Old/deleted rows (DELETE, UPDATE) |

**UPDATE example** — compare old vs new values:

```sql
CREATE TRIGGER trgAfterUpdate
```

ON Employees

```sql
FOR UPDATE
```

AS

```sql
BEGIN
-- Insert the updated rows into a log table
INSERT INTO EmployeeLog (EmployeeID, OldSalary, NewSalary)
SELECT d.EmployeeID, d.Salary, i.Salary
FROM DELETED d
INNER JOIN INSERTED i ON d.EmployeeID = i.EmployeeID
END;
```

**DELETE example:**

```sql
CREATE TRIGGER trgAfterDelete
```

ON Employees

```sql
FOR DELETE
```

AS

```sql
BEGIN
-- Insert the deleted rows into a log table
INSERT INTO EmployeeLog (EmployeeID, Salary)
SELECT EmployeeID, Salary
FROM DELETED
END;
```

## How do you handle exceptions in SQL Server stored procedures?

Use **TRY...CATCH** blocks. TRY runs statements; CATCH handles errors using built-in functions.

```sql
BEGIN TRY
-- SQL statements that might throw an error
END TRY
BEGIN CATCH
-- Error handling logic
END CATCH
```

```sql
CREATE PROCEDURE SampleProcedure
```

AS

```sql
BEGIN
BEGIN TRY
-- Attempt to execute some SQL statements
INSERT INTO Employees (EmployeeID, EmployeeName)
VALUES (1, 'John Doe');
-- This will cause an error if EmployeeID 1 already exists
UPDATE Employees
SET EmployeeName = 'Jane Doe'
WHERE EmployeeID = 1;
END TRY
BEGIN CATCH
-- Error handling
DECLARE @ErrorNumber INT = ERROR_NUMBER();
DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
DECLARE @ErrorState INT = ERROR_STATE();
-- Log error information or take corrective action
PRINT 'Error Number: ' + CAST(@ErrorNumber AS NVARCHAR);
PRINT 'Error Message: ' + @ErrorMessage;
PRINT 'Error Severity: ' + CAST(@ErrorSeverity AS NVARCHAR);
PRINT 'Error State: ' + CAST(@ErrorState AS NVARCHAR);
-- Optionally, you can re-throw the error if needed
-- RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH
END;
```

**CATCH functions:** ERROR_NUMBER(), ERROR_SEVERITY(), ERROR_STATE(), ERROR_MESSAGE(), ERROR_LINE().

```sql
RAISERROR ('An error occurred while executing the procedure.', 16, 1);
```

Combine with transactions — ROLLBACK in CATCH:

```sql
CREATE PROCEDURE TransactionProcedure
AS
BEGIN
BEGIN TRANSACTION;
BEGIN TRY
-- SQL statements
INSERT INTO Employees (EmployeeID, EmployeeName) VALUES (2, 'Alice');
-- Simulate an error
EXEC sp_executesql N'SELECT 1/0'; -- This will cause a divide by zero error
COMMIT TRANSACTION;
END TRY
BEGIN CATCH
ROLLBACK TRANSACTION;
DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
PRINT 'Error occurred: ' + @ErrorMessage;
END CATCH
END;
```

## What is the difference between RAISEERROR and THROW?

Both report errors; **THROW** (SQL Server 2012+) is preferred for re-throwing with preserved context.

**RAISEERROR** — custom messages, severity levels (0–25), formatting placeholders:

```sql
RAISERROR (message_string, severity, state, argument1, argument2, ...);
```

```sql
BEGIN TRY
-- Some code that may cause an error
INSERT INTO Employees (EmployeeID, Name) VALUES (1, 'John Doe');
END TRY
BEGIN CATCH
-- Handle the error
RAISERROR ('Error occurred: %s', 16, 1, ERROR_MESSAGE());
END CATCH
```

**THROW** — simpler syntax; `THROW;` in CATCH re-throws the original error with call stack:

```sql
THROW [error_number, message, state];
```

```sql
BEGIN TRY
-- Some code that may cause an error
INSERT INTO Employees (EmployeeID, Name) VALUES (1, 'John Doe');
END TRY
BEGIN CATCH
-- Handle the error
THROW; -- Re-throws the original exception
END CATCH
```

| | RAISERROR | THROW |
|---|-----------|-------|
| Custom messages | Yes, with formatting | Yes |
| Re-throw in CATCH | Manual | `THROW;` preserves context |
| Transaction rollback | Manual | Automatic in open transactions |

Use **THROW** for re-throwing; **RAISEERROR** when you need custom severity/formatting.

## What is the purpose of a FILESTREAM in SQL Server?

**FILESTREAM** stores large BLOBs (documents, images, video) on the **NTFS file system** while keeping **transactional consistency** with the database. Included in standard backup/restore.

- FILESTREAM column: `VARBINARY(MAX) FILESTREAM`
- SQL Server stores a reference in the table; NTFS handles file I/O
- Better performance than inline VARBINARY(MAX) for large files

```sql
CREATE TABLE Documents
```

(

DocumentID UNIQUEIDENTIFIER ROWGUIDCOL NOT NULL UNIQUE,

Name NVARCHAR(100),

```sql
FileContent VARBINARY(MAX) FILESTREAM,
CreationDate DATETIME DEFAULT GETDATE()
);
```

**Limitation:** FILESTREAM data is accessed from local SQL Server instances only.

## What is table partitioning, and how does it improve performance?

**Table partitioning** splits a large table into **partitions** by a partition key (date range, ID range, etc.). Benefits:

- **Partition elimination** — queries scan only relevant partitions.
- **Targeted maintenance** — rebuild indexes or purge old data per partition.
- **Parallel processing** — work distributed across partitions/CPUs.
- **Efficient loads** — insert into a specific partition without touching others.
- **Data lifecycle** — archive old partitions to cheaper storage.

## How do you create and manage partitioned tables in SQL Server?

**Steps:** partition function → partition scheme → create table on scheme.

**1. Partition function** — defines boundaries:

```sql
CREATE PARTITION FUNCTION MyPartitionFunction (int)
AS RANGE LEFT FOR VALUES (1000, 2000, 3000);
```

RANGE LEFT: boundary values belong to the left partition. Creates 4 partitions: ≤1000, 1001–2000, 2001–3000, >3000.

**2. Partition scheme** — maps partitions to filegroups:

```sql
CREATE PARTITION SCHEME MyPartitionScheme
AS PARTITION MyPartitionFunction
TO (FileGroup1, FileGroup2, FileGroup3, FileGroup4);
```

**3. Create partitioned table:**

```sql
CREATE TABLE MyPartitionedTable
```

(

```sql
ID int PRIMARY KEY,
Name varchar(100),
```

PartitionColumn int

)

```sql
ON MyPartitionScheme(PartitionColumn);
```

**4. Insert** — SQL Server routes rows to the correct partition:

```sql
INSERT INTO MyPartitionedTable (ID, Name, PartitionColumn)
VALUES (1, 'John Doe', 1500); -- This will go into the second partition
```

**5. Query** — partition elimination applies automatically:

```sql
SELECT * FROM MyPartitionedTable WHERE PartitionColumn = 1500;
```

**6. Split / merge partitions:**

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
SPLIT RANGE (4000); -- Splits at 4000, creating an additional partition
```

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
MERGE RANGE (3000); -- Merges the partition holding 3000 with the next partition
```

**7. Switch partitions** — move data without copying:

```sql
ALTER TABLE MyPartitionedTable SWITCH PARTITION 1 TO AnotherTable;
```

**8. Per-partition index maintenance:**

```sql
ALTER INDEX ALL ON MyPartitionedTable
REBUILD PARTITION = 2; -- Rebuild only the second partition
```

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
MERGE RANGE (2000); -- Remove a partition after archiving its data
```

**Tips:** choose an even partition key; align with query patterns (range filters); distribute filegroups across disks.

## What is the SQL Server error log, and how do you access it?

The **error log** records server events — startups/shutdowns, errors, backups, login failures. Essential for troubleshooting and auditing.

**Default path:** `C:\Program Files\Microsoft SQL Server\MSSQLXX.MSSQLSERVER\MSSQL\Log`

**SSMS:** Management → SQL Server Logs → right-click → View SQL Server Log.

**T-SQL:**

```sql
EXEC sp_readerrorlog;
You can also specify the log file number and filter results:
EXEC sp_readerrorlog 0, 1, 'error message';
```

```sql
EXEC sp_readerrorlog 1; -- For the previous log file
Use 2, 3, etc., for older logs.
```

**Windows Event Viewer:** Application log → source MSSQLSERVER.

**Management:**

```sql
EXEC sp_cycle_errorlog;
```

SQL Server rotates logs automatically (default: 6 retained). Configure retention in SSMS → Server Properties → Advanced.

```sql
EXEC sp_readerrorlog 0, 1, 'startup';
```
