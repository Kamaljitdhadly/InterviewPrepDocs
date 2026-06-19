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

**Setup:**

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

**MAX + subquery** — max salary below the overall max:

```sql
SELECT MAX(Salary) AS SecondHighestSalary
FROM Employees
WHERE Salary < (SELECT MAX(Salary) FROM Employees);
```

**ROW_NUMBER():**

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

**OFFSET FETCH (2012+):**

```sql
SELECT Salary AS SecondHighestSalary
FROM Employees
ORDER BY Salary DESC
OFFSET 1 ROW FETCH NEXT 1 ROW ONLY;
```

Use **DENSE_RANK()** for second **distinct** salary when ties exist at the top. **Sample:** `75000.00`

## Write a query to find the nth highest salary in a table?

**DENSE_RANK()** — nth distinct salary:

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

**OFFSET FETCH:**

```sql
DECLARE @n INT = 3;

SELECT Salary AS NthHighestSalary
FROM Employees
ORDER BY Salary DESC
OFFSET (@n - 1) ROW FETCH NEXT 1 ROW ONLY;
```

**Sample (`@n = 3`):** `60000.00`

## Write a query to find employees who earn more than their managers?

Self-join `e` (employee) to `m` (manager) on `e.ManagerId = m.EmployeeId`, filter `e.Salary > m.Salary`.

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

```sql
SELECT e.Name  AS EmployeeName,
       e.Salary AS EmployeeSalary,
       m.Name  AS ManagerName,
       m.Salary AS ManagerSalary
FROM EmployeeHierarchy e
INNER JOIN EmployeeHierarchy m ON e.ManagerId = m.EmployeeId
WHERE e.Salary > m.Salary;
```

**Sample:** Alice (`95000`) > Manager (`80000`)

## Write a query to delete duplicate rows and keep only one row per key?

Keep lowest `Id` per `Email`. Test inside `BEGIN TRAN` first.

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

**CTE + DELETE:**

```sql
;WITH Duplicates AS (
    SELECT Id,
           ROW_NUMBER() OVER (PARTITION BY Email ORDER BY Id) AS rn
    FROM Users
)
DELETE FROM Duplicates
WHERE rn > 1;
```

**Subquery alternative:**

```sql
DELETE FROM Users
WHERE Id NOT IN (
    SELECT MIN(Id)
    FROM Users
    GROUP BY Email
);
```

**Sample:** Removes Id `3`; keeps one row per email.

## Write a query to calculate a running total of sales ordered by date?

`SUM() OVER (ORDER BY ...)` — cumulative sum in sort order.

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

```sql
SELECT SaleId,
       SaleDate,
       Amount,
       SUM(Amount) OVER (ORDER BY SaleDate, SaleId) AS RunningTotal
FROM Sales
ORDER BY SaleDate, SaleId;
```

**Sample:** Running totals `100 → 350 → 425 → 725`

## Write a query to find missing values in a sequential ID column?

**Recursive CTE** — every missing ID between min and max:

```sql
CREATE TABLE Orders (
    OrderId INT PRIMARY KEY
);

INSERT INTO Orders (OrderId) VALUES (1), (2), (3), (5), (6), (9);
```

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

**LAG()** — gap ranges:

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

**Sample:** Missing `4`, `7`, `8`

## Write a query to display an employee organizational hierarchy using a recursive CTE?

Anchor = roots (`ManagerId IS NULL`); recursive member joins children on `ManagerId`.

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

```sql
;WITH OrgTree AS (
    SELECT EmployeeId,
           Name,
           ManagerId,
           0 AS Level,
           CAST(Name AS NVARCHAR(500)) AS HierarchyPath
    FROM OrgChart
    WHERE ManagerId IS NULL

    UNION ALL

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

**Sample:** CEO → VP Sales → Rep A / Rep B; CEO → VP Eng → Dev A

## Write a T-SQL query to reverse a string without using built-in reverse functions?

Loop from `LEN` down to 1, append `SUBSTRING` one char at a time.

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

**Sample:** `OpenAI` → `IAnepO`

## Write a T-SQL query to check whether a given string is a palindrome?

Compare chars from both ends (`@i` vs `@len - @i + 1`); mismatch → not palindrome.

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

**Sample:** `madam` → palindrome; `hello` → not. Collation controls case sensitivity.

## Write a query to find duplicate records in a table?

`GROUP BY` + `HAVING COUNT(*) > 1`, or join back to list full rows.

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

```sql
SELECT Email,
       COUNT(*) AS DuplicateCount
FROM Customers
GROUP BY Email
HAVING COUNT(*) > 1;
```

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

**Sample:** `alice@contoso.com` × 2

## Write a query to find the highest-paid employee in each department?

`ROW_NUMBER() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC)` → `rn = 1`.

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

**Sample:** Dept 10 → Alice; Dept 20 → Dave

## Write a query to find customers who have never placed an order?

`LEFT JOIN` + `WHERE child IS NULL`, or `NOT EXISTS`.

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
```

```sql
SELECT c.CustomerId,
       c.Name
FROM CustomersNoOrder c
LEFT JOIN CustomerOrders o ON c.CustomerId = o.CustomerId
WHERE o.OrderId IS NULL;
```

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

**Sample:** Bob and Carol — no orders

## Write a query to pivot monthly sales from rows into columns?

`CASE` + `SUM`, or `PIVOT` operator.

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

```sql
SELECT SaleYear,
       SUM(CASE WHEN SaleMonth = 1 THEN Amount ELSE 0 END) AS Jan,
       SUM(CASE WHEN SaleMonth = 2 THEN Amount ELSE 0 END) AS Feb,
       SUM(CASE WHEN SaleMonth = 3 THEN Amount ELSE 0 END) AS Mar
FROM MonthlySales
GROUP BY SaleYear
ORDER BY SaleYear;
```

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

**Sample:** 2024 → Jan `1000`, Feb `1200`, Mar `900`

## Write a query to compare each row with the previous row using LAG?

`LAG(col) OVER (ORDER BY ...)` for prior-row value and delta.

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

```sql
SELECT RevenueDate,
       Revenue,
       LAG(Revenue) OVER (ORDER BY RevenueDate) AS PreviousRevenue,
       Revenue - LAG(Revenue) OVER (ORDER BY RevenueDate) AS DayOverDayChange
FROM DailyRevenue
ORDER BY RevenueDate;
```

**Sample:** `2025-01-02` → previous `1000`, change `+250`

## Write a query to find employees hired in the last N days?

`HireDate >= DATEADD(DAY, -@days, CAST(GETDATE() AS DATE))`.

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
```

```sql
DECLARE @days INT = 30;

SELECT EmployeeId,
       Name,
       HireDate
FROM HiredEmployees
WHERE HireDate >= DATEADD(DAY, -@days, CAST(GETDATE() AS DATE))
ORDER BY HireDate DESC;
```

**Sample:** `@days = 30` → recent hires in rolling window
