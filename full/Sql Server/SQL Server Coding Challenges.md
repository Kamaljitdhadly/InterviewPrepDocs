# SQL Server Coding Challenges

## Questions Covered

1. Write a SQL Server query to find the second-highest salary in an Employees table?
2. Write a query to find the nth highest salary in a table?
3. Write a query to find employees who earn more than their managers?
4. Write a query to delete duplicate rows and keep only one row per key?
5. Write a query to calculate a running total of sales ordered by date?
6. Write a query to find missing values in a sequential ID column?
7. Write a query to display an employee organizational hierarchy using a recursive CTE?
8. Write a T-SQL query to reverse a string without using built-in reverse functions?
9. Write a T-SQL query to check whether a given string is a palindrome?
10. Write a query to find duplicate records in a table?
11. Write a query to find the highest-paid employee in each department?
12. Write a query to find customers who have never placed an order?
13. Write a query to pivot monthly sales from rows into columns?
14. Write a query to compare each row with the previous row using LAG?
15. Write a query to find employees hired in the last N days?

## Write a SQL Server query to find the second-highest salary in an Employees table?

### Sample setup

```sql
CREATE TABLE Employees (
    EmployeeId INT PRIMARY KEY,
    Name       NVARCHAR(100),
    Salary     DECIMAL(10, 2)
);

INSERT INTO Employees (EmployeeId, Name, Salary) VALUES
(1, 'Alice', 90000),
(2, 'Bob',   75000),
(3, 'Carol', 90000),
(4, 'Dave',  60000);
```

### Solution 1 — MAX with subquery

```sql
SELECT MAX(Salary) AS SecondHighestSalary
FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);
```

### Solution 2 — ROW_NUMBER()

```sql
WITH SalaryRank AS (
    SELECT Salary,
           ROW_NUMBER() OVER (ORDER BY Salary DESC) AS rn
    FROM Employees
)
SELECT Salary AS SecondHighestSalary
FROM SalaryRank
WHERE rn = 2;
```

### Solution 3 — OFFSET FETCH (SQL Server 2012+)

```sql
SELECT Salary AS SecondHighestSalary
FROM Employees
ORDER BY Salary DESC
OFFSET 1 ROW FETCH NEXT 1 ROW ONLY;
```

### Explanation

| Approach | Notes |
|----------|-------|
| **MAX + subquery** | Simple; returns one row even when top salaries tie |
| **ROW_NUMBER()** | Ranks every row; `rn = 2` is the second row in descending order (not necessarily second distinct salary) |
| **OFFSET FETCH** | Skips the highest row and fetches the next one |

Use **DENSE_RANK()** instead of ROW_NUMBER() when you need the second **distinct** salary and duplicates at the top should not consume rank positions.

**Sample:** `75000.00`

## Write a query to find the nth highest salary in a table?

Replace `n` with the rank you need (e.g. 3 for third-highest).

### Solution 1 — DENSE_RANK() (distinct salaries)

```sql
DECLARE @n INT = 3;

WITH RankedSalaries AS (
    SELECT Salary,
           DENSE_RANK() OVER (ORDER BY Salary DESC) AS SalaryRank
    FROM Employees
)
SELECT Salary AS NthHighestSalary
FROM RankedSalaries
WHERE SalaryRank = @n;
```

### Solution 2 — OFFSET FETCH

```sql
DECLARE @n INT = 3;

SELECT Salary AS NthHighestSalary
FROM Employees
ORDER BY Salary DESC
OFFSET (@n - 1) ROW FETCH NEXT 1 ROW ONLY;
```

### Explanation

- **DENSE_RANK()**: Tied salaries share the same rank; `@n = 3` returns the third distinct salary value.
- **OFFSET FETCH**: `@n - 1` skips the first `n - 1` rows; `FETCH NEXT 1` returns the nth row. Ties can produce arbitrary ordering among equal salaries unless you add a tie-breaker column to `ORDER BY`.

**Sample (`@n = 3`):** `60000.00`

## Write a query to find employees who earn more than their managers?

### Sample setup

```sql
CREATE TABLE EmployeeHierarchy (
    EmployeeId INT PRIMARY KEY,
    Name       NVARCHAR(100),
    ManagerId  INT NULL,
    Salary     DECIMAL(10, 2)
);

INSERT INTO EmployeeHierarchy (EmployeeId, Name, ManagerId, Salary) VALUES
(1, 'CEO',    NULL, 120000),
(2, 'Manager', 1,    80000),
(3, 'Alice',   2,    95000),
(4, 'Bob',     2,    70000);
```

### Solution — self-join

```sql
SELECT e.Name  AS EmployeeName,
       e.Salary AS EmployeeSalary,
       m.Name  AS ManagerName,
       m.Salary AS ManagerSalary
FROM EmployeeHierarchy e
INNER JOIN EmployeeHierarchy m ON e.ManagerId = m.EmployeeId
WHERE e.Salary > m.Salary;
```

### Explanation

1. **Self-join**: `EmployeeHierarchy` is joined to itself — alias `e` for employees, `m` for managers.
2. **Join condition**: `e.ManagerId = m.EmployeeId` links each employee to their manager row.
3. **Filter**: `e.Salary > m.Salary` keeps only employees out-earning their manager.

**Sample:** Alice (`95000`) > Manager (`80000`)

## Write a query to delete duplicate rows and keep only one row per key?

Keep the row with the **lowest** `Id` per `Email` (adjust the tie-breaker as needed).

### Sample setup

```sql
CREATE TABLE Users (
    Id    INT PRIMARY KEY,
    Email NVARCHAR(200),
    Name  NVARCHAR(100)
);

INSERT INTO Users (Id, Email, Name) VALUES
(1, 'alice@contoso.com', 'Alice'),
(2, 'bob@contoso.com',   'Bob'),
(3, 'alice@contoso.com', 'Alice Duplicate'),
(4, 'carol@contoso.com', 'Carol');
```

### Solution 1 — CTE with ROW_NUMBER() and DELETE

```sql
;WITH Duplicates AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) AS rn
    FROM Users
)
DELETE FROM Duplicates
WHERE rn > 1;
```

### Solution 2 — DELETE with subquery

```sql
DELETE FROM Users
WHERE Id NOT IN (
    SELECT MIN(Id)
    FROM Users
    GROUP BY Email
);
```

### Explanation

- **PARTITION BY Email**: Groups rows that share the same email.
- **ORDER BY Id**: `rn = 1` is the row to keep (lowest Id).
- **DELETE WHERE rn > 1**: Removes all duplicate copies.

Always test deletes inside a transaction first: `BEGIN TRAN` → run query → `SELECT` to verify → `ROLLBACK` or `COMMIT`.

**Sample:** Removes Id `3`; keeps one row per email

## Write a query to calculate a running total of sales ordered by date?

### Sample setup

```sql
CREATE TABLE Sales (
    SaleId   INT PRIMARY KEY,
    SaleDate DATE,
    Amount   DECIMAL(10, 2)
);

INSERT INTO Sales (SaleId, SaleDate, Amount) VALUES
(1, '2025-01-01', 100),
(2, '2025-01-02', 250),
(3, '2025-01-03',  75),
(4, '2025-01-04', 300);
```

### Solution — SUM() window function

```sql
SELECT SaleId,
       SaleDate,
       Amount,
       SUM(Amount) OVER (ORDER BY SaleDate, SaleId) AS RunningTotal
FROM Sales
ORDER BY SaleDate, SaleId;
```

### Explanation

- **SUM(Amount) OVER (ORDER BY SaleDate, SaleId)**: Adds each row's `Amount` to the sum of all prior rows in sort order.
- **ORDER BY inside OVER**: Defines the window frame for the running calculation.
- **SaleId tie-breaker**: Ensures deterministic ordering when two sales share a date.

**Sample:** Running totals `100 → 350 → 425 → 725`

## Write a query to find missing values in a sequential ID column?

Find gaps in `OrderId` where IDs are expected to be consecutive integers.

### Sample setup

```sql
CREATE TABLE Orders (
    OrderId INT PRIMARY KEY
);

INSERT INTO Orders (OrderId) VALUES (1), (2), (3), (5), (6), (9);
-- Missing: 4, 7, 8
```

### Solution 1 — recursive CTE to generate the full range

```sql
;WITH NumberSeries AS (
    SELECT MIN(OrderId) AS n FROM Orders
    UNION ALL
    SELECT n + 1
    FROM NumberSeries
    WHERE n < (SELECT MAX(OrderId) FROM Orders)
)
SELECT ns.n AS MissingOrderId
FROM NumberSeries ns
LEFT JOIN Orders o ON ns.n = o.OrderId
WHERE o.OrderId IS NULL
OPTION (MAXRECURSION 0);
```

### Solution 2 — LAG() to detect gaps

```sql
SELECT (OrderId + 1) AS MissingFrom,
       NextId - 1    AS MissingTo
FROM (
    SELECT OrderId,
           LEAD(OrderId) OVER (ORDER BY OrderId) AS NextId
    FROM Orders
) g
WHERE NextId > OrderId + 1;
```

### Explanation

| Approach | Best for |
|----------|----------|
| **Recursive CTE** | Lists every individual missing ID |
| **LAG() / LEAD()** | Reports contiguous gap ranges (`MissingFrom`–`MissingTo`) |

`OPTION (MAXRECURSION 0)` removes the default recursion limit when the ID range is large.

**Sample:** Missing IDs `4`, `7`, `8`

## Write a query to display an employee organizational hierarchy using a recursive CTE?

Show each employee with their management chain indented by level.

### Sample setup

```sql
CREATE TABLE OrgChart (
    EmployeeId INT PRIMARY KEY,
    Name       NVARCHAR(100),
    ManagerId  INT NULL
);

INSERT INTO OrgChart (EmployeeId, Name, ManagerId) VALUES
(1, 'CEO',      NULL),
(2, 'VP Sales', 1),
(3, 'VP Eng',   1),
(4, 'Rep A',    2),
(5, 'Rep B',    2),
(6, 'Dev A',    3);
```

### Solution — recursive CTE

```sql
;WITH OrgTree AS (
    -- Anchor: top-level (no manager)
    SELECT EmployeeId,
           Name,
           ManagerId,
           0 AS Level,
           CAST(Name AS NVARCHAR(500)) AS HierarchyPath
    FROM OrgChart
    WHERE ManagerId IS NULL

    UNION ALL

    -- Recursive: direct reports
    SELECT c.EmployeeId,
           c.Name,
           c.ManagerId,
           p.Level + 1,
           CAST(p.HierarchyPath + N' > ' + c.Name AS NVARCHAR(500))
    FROM OrgChart c
    INNER JOIN OrgTree p ON c.ManagerId = p.EmployeeId
)
SELECT EmployeeId,
       REPLICATE('  ', Level) + Name AS IndentedName,
       Level,
       HierarchyPath
FROM OrgTree
ORDER BY HierarchyPath;
```

### Explanation

1. **Anchor member**: Selects root nodes (`ManagerId IS NULL`).
2. **Recursive member**: Joins `OrgChart` to `OrgTree` on `ManagerId = EmployeeId` to walk down the tree.
3. **Level**: Increments depth for indentation.
4. **HierarchyPath**: Builds a sortable path string for display and ordering.

**Sample:** CEO → VP Sales → Rep A / Rep B; CEO → VP Eng → Dev A

## Write a T-SQL query to reverse a string without using built-in reverse functions?

Avoid `REVERSE()` — iterate characters from end to start.

### Solution — WHILE loop

```sql
DECLARE @input  NVARCHAR(100) = N'OpenAI';
DECLARE @output NVARCHAR(100) = N'';
DECLARE @i      INT = LEN(@input);

WHILE @i > 0
BEGIN
    SET @output = @output + SUBSTRING(@input, @i, 1);
    SET @i = @i - 1;
END

SELECT @input AS OriginalString,
       @output AS ReversedString;
```

### Explanation

- **LEN(@input)**: Starting index at the last character.
- **SUBSTRING(@input, @i, 1)**: Extracts one character at position `@i`.
- **WHILE @i > 0**: Appends characters from right to left into `@output`.

**Sample:** `OpenAI` → `IAnepO`

## Write a T-SQL query to check whether a given string is a palindrome?

A **palindrome** reads the same forwards and backwards (e.g. `madam`, `racecar`).

### Solution

```sql
DECLARE @input NVARCHAR(100) = N'madam';
DECLARE @len   INT = LEN(@input);
DECLARE @i     INT = 1;
DECLARE @isPalindrome BIT = 1;

WHILE @i <= @len / 2
BEGIN
    IF SUBSTRING(@input, @i, 1) <> SUBSTRING(@input, @len - @i + 1, 1)
    BEGIN
        SET @isPalindrome = 0;
        BREAK;
    END
    SET @i = @i + 1;
END

SELECT @input AS InputString,
       CASE WHEN @isPalindrome = 1
            THEN N'The string is a palindrome.'
            ELSE N'The string is not a palindrome.'
       END AS Result;
```

### Explanation

1. Compare characters from both ends moving toward the center: position `@i` vs `@len - @i + 1`.
2. On the first mismatch, set `@isPalindrome = 0` and `BREAK`.
3. If the loop completes without mismatch, the string is a palindrome.

Case sensitivity follows the database collation. Use `LOWER()` or a case-insensitive collation if `Madam` should match `madaM`.

**Sample:** `madam` → palindrome; `hello` → not

## Write a query to find duplicate records in a table?

### Sample setup

```sql
CREATE TABLE Customers (
    CustomerId INT PRIMARY KEY,
    Email      NVARCHAR(200),
    Name       NVARCHAR(100)
);

INSERT INTO Customers (CustomerId, Email, Name) VALUES
(1, 'alice@contoso.com', 'Alice'),
(2, 'bob@contoso.com',   'Bob'),
(3, 'alice@contoso.com', 'Alice Copy'),
(4, 'carol@contoso.com', 'Carol');
```

### Solution 1 — GROUP BY + HAVING

```sql
SELECT Email,
       COUNT(*) AS DuplicateCount
FROM Customers
GROUP BY Email
HAVING COUNT(*) > 1;
```

### Solution 2 — list every duplicate row

```sql
SELECT c.*
FROM Customers c
INNER JOIN (
    SELECT Email
    FROM Customers
    GROUP BY Email
    HAVING COUNT(*) > 1
) d ON c.Email = d.Email
ORDER BY c.Email, c.CustomerId;
```

### Explanation

- **HAVING COUNT(*) > 1**: Groups with more than one row share the same key.
- **Self-join to grouped subquery**: Returns full duplicate rows, not just the email.

**Sample:** `alice@contoso.com` appears twice

## Write a query to find the highest-paid employee in each department?

Classic **TOP N per group** with `ROW_NUMBER()` or `RANK()`.

### Sample setup

```sql
CREATE TABLE DeptEmployees (
    EmployeeId   INT PRIMARY KEY,
    Name         NVARCHAR(100),
    DepartmentId INT,
    Salary       DECIMAL(10, 2)
);

INSERT INTO DeptEmployees (EmployeeId, Name, DepartmentId, Salary) VALUES
(1, 'Alice', 10, 90000),
(2, 'Bob',   10, 75000),
(3, 'Carol', 20, 82000),
(4, 'Dave',  20, 95000),
(5, 'Eve',   20, 88000);
```

### Solution — ROW_NUMBER() per department

```sql
WITH Ranked AS (
    SELECT Name,
           DepartmentId,
           Salary,
           ROW_NUMBER() OVER (
               PARTITION BY DepartmentId
               ORDER BY Salary DESC, EmployeeId
           ) AS rn
    FROM DeptEmployees
)
SELECT Name, DepartmentId, Salary
FROM Ranked
WHERE rn = 1;
```

### Explanation

- **PARTITION BY DepartmentId**: Resets ranking per department.
- **ORDER BY Salary DESC**: Highest salary gets `rn = 1`.
- **EmployeeId tie-breaker**: Deterministic when salaries tie.

**Sample:** Dept 10 → Alice (`90000`); Dept 20 → Dave (`95000`)

## Write a query to find customers who have never placed an order?

Use **LEFT JOIN** and filter where the child side is `NULL` (anti-join pattern).

### Sample setup

```sql
CREATE TABLE CustomersNoOrder (
    CustomerId INT PRIMARY KEY,
    Name       NVARCHAR(100)
);

CREATE TABLE CustomerOrders (
    OrderId    INT PRIMARY KEY,
    CustomerId INT,
    OrderDate  DATE
);

INSERT INTO CustomersNoOrder VALUES (1, 'Alice'), (2, 'Bob'), (3, 'Carol');
INSERT INTO CustomerOrders VALUES (101, 1, '2025-01-10'), (102, 1, '2025-02-01');
-- Bob and Carol have no orders
```

### Solution

```sql
SELECT c.CustomerId,
       c.Name
FROM CustomersNoOrder c
LEFT JOIN CustomerOrders o ON c.CustomerId = o.CustomerId
WHERE o.OrderId IS NULL;
```

### Alternative — NOT EXISTS

```sql
SELECT c.CustomerId,
       c.Name
FROM CustomersNoOrder c
WHERE NOT EXISTS (
    SELECT 1
    FROM CustomerOrders o
    WHERE o.CustomerId = c.CustomerId
);
```

### Explanation

| Pattern | When to use |
|---------|-------------|
| **LEFT JOIN ... IS NULL** | Readable; watch duplicate orders (use `DISTINCT` or `EXISTS` if multiple orders) |
| **NOT EXISTS** | Often preferred by optimizers; naturally handles duplicates |

**Sample:** Bob and Carol — no orders

## Write a query to pivot monthly sales from rows into columns?

Turn `(Month, Amount)` rows into one row per year with month columns.

### Sample setup

```sql
CREATE TABLE MonthlySales (
    SaleYear  INT,
    SaleMonth INT,
    Amount    DECIMAL(10, 2)
);

INSERT INTO MonthlySales (SaleYear, SaleMonth, Amount) VALUES
(2024, 1, 1000),
(2024, 2, 1200),
(2024, 3,  900),
(2025, 1, 1100),
(2025, 2, 1300);
```

### Solution — conditional aggregation

```sql
SELECT SaleYear,
       SUM(CASE WHEN SaleMonth = 1 THEN Amount ELSE 0 END) AS Jan,
       SUM(CASE WHEN SaleMonth = 2 THEN Amount ELSE 0 END) AS Feb,
       SUM(CASE WHEN SaleMonth = 3 THEN Amount ELSE 0 END) AS Mar
FROM MonthlySales
GROUP BY SaleYear
ORDER BY SaleYear;
```

### Solution 2 — PIVOT operator

```sql
SELECT SaleYear, [1] AS Jan, [2] AS Feb, [3] AS Mar
FROM (
    SELECT SaleYear, SaleMonth, Amount
    FROM MonthlySales
) src
PIVOT (
    SUM(Amount) FOR SaleMonth IN ([1], [2], [3])
) p
ORDER BY SaleYear;
```

### Explanation

- **CASE + SUM**: Portable; explicit column names.
- **PIVOT**: SQL Server-specific; column list must be known at compile time (dynamic SQL for unknown months).

**Sample:** 2024 → Jan `1000`, Feb `1200`, Mar `900`

## Write a query to compare each row with the previous row using LAG?

Find day-over-day change in metrics.

### Sample setup

```sql
CREATE TABLE DailyRevenue (
    RevenueDate DATE PRIMARY KEY,
    Revenue     DECIMAL(10, 2)
);

INSERT INTO DailyRevenue (RevenueDate, Revenue) VALUES
('2025-01-01', 1000),
('2025-01-02', 1250),
('2025-01-03', 1100),
('2025-01-04', 1400);
```

### Solution

```sql
SELECT RevenueDate,
       Revenue,
       LAG(Revenue) OVER (ORDER BY RevenueDate) AS PreviousRevenue,
       Revenue - LAG(Revenue) OVER (ORDER BY RevenueDate) AS DayOverDayChange
FROM DailyRevenue
ORDER BY RevenueDate;
```

### Explanation

- **LAG(Revenue)**: Value from the prior row in `ORDER BY` sequence.
- **First row**: `LAG` returns `NULL` — no previous day.
- **LEAD()**: Same pattern for next-row comparison.

**Sample:** `2025-01-02` → previous `1000`, change `+250`

## Write a query to find employees hired in the last N days?

### Sample setup

```sql
CREATE TABLE HiredEmployees (
    EmployeeId INT PRIMARY KEY,
    Name       NVARCHAR(100),
    HireDate   DATE
);

INSERT INTO HiredEmployees (EmployeeId, Name, HireDate) VALUES
(1, 'Alice', '2025-06-01'),
(2, 'Bob',   '2025-05-15'),
(3, 'Carol', '2025-06-10');
-- Assume today is 2025-06-15
```

### Solution

```sql
DECLARE @days INT = 30;

SELECT EmployeeId,
       Name,
       HireDate
FROM HiredEmployees
WHERE HireDate >= DATEADD(DAY, -@days, CAST(GETDATE() AS DATE))
ORDER BY HireDate DESC;
```

### Explanation

- **DATEADD(DAY, -@days, GETDATE())**: Rolling window start date.
- **CAST(... AS DATE)**: Strip time for date-only comparison.
- Use `SYSDATETIME()` or pass `@asOfDate` parameter in tests for reproducibility.

**Sample:** `@days = 30` on `2025-06-15` → Alice and Carol
