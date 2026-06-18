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

In SQL, functions are categorized into different types based on their behavior and the kind of operations they perform. Two key categories are **scalar functions** and **aggregate functions**. Here’s a detailed look at each type:

**Scalar functions** operate on individual values and return a single value based on the input values. They are used to perform calculations, manipulate strings, and handle date and time operations on a per-row basis.

#### **Examples of Scalar Functions:**

1.  **Mathematical Functions:**

    - ABS(): Returns the absolute value of a number.

    - ROUND(): Rounds a numeric value to the specified number of decimal places.

```sql
SELECT ABS(-10) AS AbsoluteValue; -- Returns 10
SELECT ROUND(123.4567, 2) AS RoundedValue; -- Returns 123.46
```

2.  **String Functions:**

```sql
SELECT UPPER('hello') AS Uppercase; -- Returns 'HELLO'
SELECT LOWER('WORLD') AS Lowercase; -- Returns 'world'
SELECT LEN('SQL Server') AS StringLength; -- Returns 11
```

3.  **Date and Time Functions:**

```sql
SELECT GETDATE() AS CurrentDateTime; -- Returns the current date and time
SELECT DATEPART(YEAR, GETDATE()) AS CurrentYear; -- Returns the current year
```

**Aggregate functions** perform a calculation on a set of values and return a single value. They are typically used with GROUP BY clauses to summarize data.

#### **Examples of Aggregate Functions:**

1.  **SUM()**: Returns the total sum of a numeric column.

```sql
SELECT SUM(Salary) AS TotalSalaries FROM Employees;
```

2.  **AVG()**: Returns the average value of a numeric column.

```sql
SELECT AVG(Salary) AS AverageSalary FROM Employees;
```

3.  **COUNT()**: Returns the number of rows or non-null values in a column.

```sql
SELECT COUNT(*) AS TotalEmployees FROM Employees;
```

4.  **MIN()**: Returns the smallest value in a column.

```sql
SELECT MIN(Salary) AS LowestSalary FROM Employees;
```

5.  **MAX()**: Returns the largest value in a column.

```sql
SELECT MAX(Salary) AS HighestSalary FROM Employees;
```

### **Summary**

- **Scalar Functions**: Operate on individual values and return a single result for each input value. They are used for calculations, string manipulations, and date operations.

- **Aggregate Functions**: Operate on a set of values and return a single result summarizing the set. They are used to perform operations like summing, averaging, counting, and finding min/max values.

## What is IIF function

The IIF function in SQL Server is a shorthand way to write conditional logic within a query. It provides a way to return one of two values based on a specified condition, similar to the IF statement in programming languages. The IIF function simplifies the syntax for conditional logic, making it easier to use inline conditions.

### Syntax

IIF(condition, true_value, false_value)

- **condition**: The condition you want to evaluate. If this condition is true, true_value is returned.

- **true_value**: The value returned if the condition evaluates to true.

- **false_value**: The value returned if the condition evaluates to false.

### Example

Suppose you have a table Employees with a column Salary, and you want to categorize employees as "High" or "Low" salary based on a threshold:

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

You can use the IIF function to classify salaries:

```sql
SELECT EmployeeName,
Salary,
IIF(Salary > 1000, 'High', 'Low') AS SalaryCategory
FROM Employees;
```

### Explanation

- **Condition**: Salary > 1000

- **True Value**: 'High' (returned if the condition is true)

- **False Value**: 'Low' (returned if the condition is false)

## Explain the use of the ISNULL and NULLIF functions.

In SQL Server, ISNULL and NULLIF are functions used to handle NULL values, but they serve different purposes:

### **1.** ISNULL **Function**

The ISNULL function is used to replace NULL values with a specified replacement value. It evaluates an expression and returns the replacement value if the expression is NULL. If the expression is not NULL, it returns the original value.

#### **Example**

```sql
-- Replace NULL with 'Unknown'
SELECT ISNULL(NULL, 'Unknown') AS Result; -- Returns 'Unknown'
-- Replace NULL with a default value in a column
SELECT ISNULL(ColumnName, 'DefaultValue') AS ColumnValue
FROM TableName;
```

In this example, if ColumnName contains NULL, it will be replaced with 'DefaultValue'. If ColumnName has a non-NULL value, that value is returned.

### **2.** NULLIF **Function**

The NULLIF function compares two expressions and returns NULL if they are equal. If they are not equal, it returns the first expression. It is useful for avoiding division by zero or handling specific conditional logic.

#### **Example**

```sql
-- Return NULL if the values are equal, otherwise return the first value
SELECT NULLIF(5, 5) AS Result; -- Returns NULL
-- Return NULL if a column value equals a certain value, otherwise return the column value
SELECT NULLIF(ColumnName, 'UnwantedValue') AS ColumnValue
FROM TableName;
```

In this example, if ColumnName has the value 'UnwantedValue', the result will be NULL. For any other value, the actual column value is returned.

In summary, ISNULL is used to replace NULL values with a specified default, while NULLIF is used to return NULL when two expressions are equal, which can be useful in various conditional and error-handling scenarios.

## Explain the purpose of COALESCE in SQL.

The **COALESCE** function in SQL is used to return the first non-null value from a list of arguments. It's particularly useful for handling NULL values and ensuring that your query returns meaningful data when dealing with possible NULL values.

### **Purpose of COALESCE**

1.  **Handle NULL Values**: COALESCE allows you to specify a default value to be returned if the actual value is NULL. This is useful for preventing NULL results from propagating through your calculations or reports.

2.  **Provide Default Values**: It helps in providing default values for columns that might otherwise be NULL, which can be important for reports, data integrity, and user interfaces.

3.  **Simplify Expressions**: Using COALESCE can simplify expressions where multiple potential NULL values are considered, reducing the need for complex CASE statements.

### **Syntax**:

COALESCE(expression1, expression2, ..., expressionN)

- **expression1, expression2, ..., expressionN**: A list of expressions to evaluate. COALESCE returns the first non-null value from this list. If all expressions evaluate to NULL, it returns NULL.

### **Example Usage**

#### 1. **Basic Example**

```sql
Suppose you have a table Employees with a column MiddleName that may contain NULL values. You want to display the middle name if it exists; otherwise, you want to display the string "N/A":
SELECT FirstName,
COALESCE(MiddleName, 'N/A') AS MiddleName
FROM Employees;
```

- **What it does**: For each row, it returns the MiddleName if it's not NULL; otherwise, it returns 'N/A'.

#### 2. **Multiple Columns**

If you have several columns and you want to return the first non-null value from these columns, you can use COALESCE:

```sql
SELECT FirstName,
COALESCE(MiddleName, Nickname, 'No Middle Name') AS DisplayName
FROM Employees;
```

- **What it does**: It returns MiddleName if it's not NULL. If MiddleName is NULL, it checks Nickname. If both are NULL, it returns 'No Middle Name'.

### **Comparison with Other Functions**

- **ISNULL()**: In SQL Server, ISNULL() is similar to COALESCE but is limited to two arguments and is specific to SQL Server. COALESCE is more flexible and standard across various SQL databases.

```sql
-- Equivalent to COALESCE in SQL Server
SELECT FirstName,
ISNULL(MiddleName, 'N/A') AS MiddleName
FROM Employees;
```

### **Summary**

- **COALESCE** returns the first non-null value from a list of arguments.

- It is used to handle NULL values by providing default values.

- It simplifies queries by reducing the need for complex CASE statements or multiple ISNULL() calls.

## How do you use the CAST and CONVERT functions in SQL Server?

In SQL Server, the CAST and CONVERT functions are used to change an expression from one data type to another. They are both useful for data type conversions, but they have some differences in functionality and syntax.

### **1.** CAST **Function**

The CAST function is a standard SQL function used to convert an expression from one data type to another. It is used in a straightforward manner and adheres to the SQL standard.

### **2.** CONVERT **Function**

The CONVERT function is specific to SQL Server and provides more control over the format of the conversion, especially for date and time conversions. It allows you to specify a style code when converting dates and times to different formats.

### **Use Cases**

- **CAST**: When you need straightforward type conversion without additional formatting requirements.

- **CONVERT**: When you need to convert dates and times with specific formatting or need to handle conversions in a SQL Server-specific way.

### **Examples with Date Formatting**

#### CAST **Example**

```sql
-- Convert DATETIME to VARCHAR
SELECT CAST(GETDATE() AS VARCHAR(30)) AS DateAsString;
```

#### CONVERT **Example**

```sql
-- Convert DATETIME to VARCHAR with different formats
SELECT CONVERT(VARCHAR(30), GETDATE(), 1) AS MMDDYYYYFormat, -- MM/DD/YY
CONVERT(VARCHAR(30), GETDATE(), 3) AS DDMMYYYYFormat, -- DD/MM/YY
CONVERT(VARCHAR(30), GETDATE(), 20) AS YYYYMMDDHHMMFormat -- YYYY-MM-DD HH:MI
```

In summary, both CAST and CONVERT functions are used for type conversion in SQL Server, but CONVERT offers more flexibility, particularly for date and time formatting, while CAST provides a simpler, more standard approach.

## What is GUID

A **GUID** (Globally Unique Identifier) is a 128-bit identifier used to uniquely identify objects or records across systems and applications. GUIDs are widely used in databases, distributed systems, and software development to ensure unique identification without the need for a central authority.

### Key Characteristics of GUID

1.  **Uniqueness**: GUIDs are designed to be unique across space and time. The probability of generating two identical GUIDs is extremely low.

2.  **Format**: GUIDs are typically represented as a 32-character hexadecimal string with hyphens separating specific sections (8-4-4-4-12 characters).

3.  **Standardization**: GUIDs are standardized by various organizations, such as the IETF and the Microsoft Corporation.

### GUID in SQL Server

In SQL Server, GUIDs are represented by the UNIQUEIDENTIFIER data type. This data type is used to store GUID values in database tables.

**Generating GUIDs in SQL Server**:

- **NEWID() Function**: Generates a new GUID.

```sql
SELECT NEWID() AS NewGUID;
```

- **NEWSEQUENTIALID() Function**: Generates a GUID that is sequentially ordered, which can be useful for performance reasons in certain scenarios. Note that this function is only available on SQL Server.

```sql
SELECT NEWSEQUENTIALID() AS SequentialGUID;
```

### Example Usage

Here is an example of creating a table with a UNIQUEIDENTIFIER column and inserting a row with a GUID:

```sql
CREATE TABLE Users (
UserID UNIQUEIDENTIFIER DEFAULT NEWID(),
UserName NVARCHAR(50)
);
INSERT INTO Users (UserName)
VALUES ('Alice');
SELECT * FROM Users;
```

In this example:

- UserID is a UNIQUEIDENTIFIER column with a default value generated by NEWID().

- When a new row is inserted, SQL Server automatically generates a unique GUID for the UserID column.

### Summary

- **GUID**: A 128-bit identifier designed to be globally unique.

- **Format**: Typically represented as a 32-character hexadecimal string with hyphens.

- **Usage in SQL Server**: Stored using the UNIQUEIDENTIFIER data type, generated by functions like NEWID() and NEWSEQUENTIALID().

## What is Quotename function

The QUOTENAME function in SQL Server is used to safely quote and escape identifiers such as table names, column names, and database names. This function is particularly useful for dynamically constructing SQL queries and for ensuring that identifiers are correctly formatted to avoid conflicts with reserved keywords or special characters.

### Syntax

QUOTENAME(string, [quote_character])

- **string**: The identifier you want to quote.

- **quote_character**: Optional. Specifies the character used for quoting the identifier. The default is square brackets ([]). You can use other characters like single quotes (') or double quotes ("), but it's less common.

### Purpose

- **Escape Reserved Keywords**: Automatically handles reserved keywords and special characters in identifiers.

- **Prevent SQL Injection**: Helps prevent SQL injection by safely quoting identifiers in dynamic SQL.

- **Handle Special Characters**: Manages special characters in identifiers that could otherwise cause syntax errors.

### Examples

1.  **Basic Quoting with Default Brackets**

Result

This example shows how QUOTENAME encloses the identifier TableName in square brackets.

```sql
SELECT QUOTENAME('TableName')
[TableName]
```

2.  **Using Custom Quote Character**

Result

This example uses double quotes as the quoting character.

```sql
SELECT QUOTENAME('TableName', '"')
"TableName"
```

3.  **Quoting Identifiers with Special Characters**

Result

QUOTENAME adds square brackets around the identifier, handling the spaces and special characters.

```sql
SELECT QUOTENAME('My Table$%')
[My Table$%]
```

4.  **Avoiding Reserved Keywords**

Result

This example shows how QUOTENAME handles reserved keywords by quoting them, so they can be used as identifiers.

```sql
SELECT QUOTENAME('Select')
[Select]
```

### Usage in Dynamic SQL

In dynamic SQL, QUOTENAME helps to ensure that identifiers are correctly formatted, thus preventing syntax errors and SQL injection vulnerabilities.

**Example**:

```sql
DECLARE @TableName NVARCHAR(128) = 'MyTableName';
DECLARE @SQL NVARCHAR(MAX);
SET @SQL = N'SELECT * FROM ' + QUOTENAME(@TableName);
EXEC sp_executesql @SQL;
```

In this example:

- QUOTENAME is used to safely quote the table name, handling any special characters or reserved keywords.

### Summary

- **QUOTENAME Function**: Safely quotes and escapes SQL identifiers.

- **Syntax**: QUOTENAME(string, [quote_character])

- **Purpose**: Prevents syntax errors, handles special characters, and avoids conflicts with reserved keywords.

- **Usage**: Useful in dynamic SQL and when dealing with identifiers that may include special characters.

## What is pivot

The PIVOT operator in SQL Server is used to transform or "pivot" data from rows to columns. This is useful when you need to aggregate data and present it in a more readable or organized format, such as converting row-based data into a cross-tabulation format.

### How PIVOT Works

The PIVOT operator performs the following steps:

1.  **Aggregate Function**: It applies an aggregate function (like SUM, COUNT, MAX, MIN, etc.) to the data.

2.  **Column Transformation**: It transforms unique values from a specific column into multiple columns in the result set.

3.  **Grouping**: It groups the results based on specified columns, aggregating data as needed.

### Syntax

The general syntax of the PIVOT operator is:

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

### Example

Suppose you have a sales table with the following data:

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

To pivot this data and show sales amounts for each salesperson across months, you would use:

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

### Explanation of the Example

1.  **Source Data**: The inner query (aliased as SourceTable) selects the columns to be pivoted: SalesPerson, SalesMonth, and SalesAmount.

2.  **Pivot Operation**: The PIVOT clause applies the SUM function to SalesAmount, transforming SalesMonth values into column headers.

3.  **Result**: The result shows each salesperson with their sales amounts for each month as columns.

### Result

The result of the pivot operation would look like:

SalesPerson | January | February

```sql
------------|---------|---------
```

Alice | 1000.00 | 1500.00

Bob | 2000.00 | 2500.00

### Summary

- **Purpose**: The PIVOT operator is used to transform rows into columns, making it easier to present aggregated data in a summary format.

- **Aggregation**: It applies an aggregate function to the data.

- **Column Transformation**: It converts distinct values from a row into column headers.

- **Use Cases**: Useful for generating reports, summarizing data, and creating cross-tabulations.

## What is Rollup

The ROLLUP operator in SQL Server is a powerful extension of the GROUP BY clause that allows you to create subtotals and grand totals in the result set. It simplifies the process of generating hierarchical aggregates and is useful for reporting purposes where you need to see summary data at various levels of granularity.

### Key Concepts of ROLLUP

- **Hierarchical Aggregates**: ROLLUP provides a way to aggregate data at different levels of a hierarchy. It calculates subtotals for each level and a grand total.

- **Simplification**: It simplifies queries by automatically generating the necessary groupings and aggregations.

- **NULL Values**: The result set includes rows with NULL values for columns at higher levels of aggregation.

### Syntax

The basic syntax for using ROLLUP is:

```sql
SELECT column1, column2, ..., aggregate_function(columnN)
FROM table
GROUP BY ROLLUP (column1, column2, ...);
```

### Example

Suppose you have a sales table with the following data:

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

You want to calculate total sales by SalesPerson, by SalesMonth, and overall total sales. You can use ROLLUP to achieve this:

```sql
SELECT SalesPerson, SalesMonth, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY ROLLUP (SalesPerson, SalesMonth);
```

### Explanation of the Example

- **Grouping by SalesPerson and SalesMonth**: Calculates the total sales for each combination of salesperson and month.

- **Grouping by SalesPerson only**: Calculates the total sales for each salesperson across all months.

- **Grouping by nothing**: Calculates the overall total sales.

### Result

The result of the query will include:

1.  Total sales per salesperson per month.

2.  Total sales per salesperson across all months.

3.  Total sales per month across all salespeople.

4.  Overall total sales.

The result set might look like this:

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

### Summary

- **Purpose**: The ROLLUP operator is used to generate hierarchical aggregates and subtotals in the result set, simplifying the creation of summaries and totals.

- **Syntax**: ROLLUP extends the GROUP BY clause by adding subtotals and grand totals.

- **Use Cases**: Useful for generating reports with multiple levels of aggregation, such as financial summaries, sales reports, and other hierarchical data analyses.

## What is Cube

The CUBE operator in SQL Server is an extension of the GROUP BY clause that generates a multidimensional set of aggregations for all combinations of specified columns. It provides a way to compute aggregates for every possible combination of values in the specified columns, including subtotals and grand totals.

### Key Concepts of CUBE

- **Multidimensional Aggregates**: CUBE computes aggregates for all possible combinations of the specified columns, producing a comprehensive result set with detailed summaries.

- **Subtotals and Totals**: It includes subtotals for each combination of columns and a grand total, making it suitable for generating detailed reports.

- **NULL Values**: The result set includes rows with NULL values for columns at various levels of aggregation.

### Syntax

The basic syntax for using CUBE is:

```sql
SELECT column1, column2, ..., aggregate_function(columnN)
FROM table
GROUP BY CUBE (column1, column2, ...);
```

### Example

Suppose you have a sales table with the following data:

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

You want to calculate total sales by SalesPerson, by SalesMonth, and overall total sales. You can use CUBE to achieve this:

```sql
SELECT SalesPerson, SalesMonth, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY CUBE (SalesPerson, SalesMonth);
```

### Explanation of the Example

- **Grouping by SalesPerson and SalesMonth**: Calculates the total sales for each combination of salesperson and month.

- **Grouping by SalesPerson only**: Calculates the total sales for each salesperson across all months.

- **Grouping by SalesMonth only**: Calculates the total sales for each month across all salespeople.

- **Grouping by nothing**: Calculates the overall total sales.

### Result

The result of the query will include:

1.  Total sales per salesperson per month.

2.  Total sales per salesperson across all months.

3.  Total sales per month across all salespeople.

4.  Overall total sales.

The result set might look like this:

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

### Summary

- **Purpose**: The CUBE operator is used to generate a comprehensive set of aggregations for all combinations of specified columns, including detailed subtotals and grand totals.

- **Syntax**: CUBE extends the GROUP BY clause by calculating aggregates for every possible combination of columns.

- **Use Cases**: Useful for generating detailed and multidimensional reports, such as sales summaries, financial reports, and other complex data analyses.

## What is Grouping set

**Grouping Sets** in SQL Server allow you to perform complex aggregations by specifying multiple groupings in a single GROUP BY clause. They enable you to generate various aggregate results in one query, providing more flexibility compared to standard GROUP BY.

### Key Concepts of Grouping Sets

- **Flexibility**: Grouping sets allow you to define multiple groupings within a single query, which helps in generating different levels of aggregate data.

- **Combinations**: You can specify various combinations of columns to group by, and SQL Server will compute the aggregates for each combination.

- **Performance**: Grouping sets can improve performance by reducing the need to write multiple queries for different aggregations.

### Syntax

The basic syntax for using grouping sets is:

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

### Example

Suppose you have a sales table with the following data:

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

You want to calculate total sales by SalesPerson, by SalesMonth, and overall total sales. You can use grouping sets to achieve this in one query:

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

### Explanation of the Example

- **(SalesPerson, SalesMonth)**: Calculates the total sales for each salesperson for each month.

- **(SalesPerson)**: Calculates the total sales for each salesperson across all months.

- **(SalesMonth)**: Calculates the total sales for each month across all salespeople.

- **()**: Calculates the overall total sales.

### Result

The result of the query will include:

- Total sales per salesperson per month.

- Total sales per salesperson across all months.

- Total sales per month across all salespeople.

- Overall total sales.

### Summary

- **Purpose**: Grouping sets are used for performing multiple aggregations in a single query with different groupings.

- **Syntax**: Allows you to specify multiple groupings within a single GROUP BY clause.

- **Use Cases**: Useful for generating different levels of aggregated data efficiently in a single query, reducing the need for multiple queries or complex operations.

## What is Grouping function

In SQL Server, **grouping functions** are used to manage and simplify the results of aggregations when working with the GROUP BY clause. These functions help identify and handle different levels of grouping and aggregation in the result set, especially when using advanced grouping techniques like ROLLUP, CUBE, or GROUPING SETS.

### Key Grouping Functions

1.  **GROUPING Function**

    - **Purpose**: The GROUPING function is used to differentiate between NULLs that are a result of grouping (e.g., in a ROLLUP or CUBE operation) and actual NULL values in the data. It helps in distinguishing between data rows and aggregate rows in the result set.

    - **Syntax**: GROUPING(column_name)

    - **Returns**: Returns 1 if the column is aggregated (i.e., it's part of a rollup or cube subtotal), and 0 if it contains actual data.

**Example:**

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

2.  **GROUPING_ID Function**

    - **Purpose**: The GROUPING_ID function provides an integer value that represents the grouping level of each row. It can be useful for determining the hierarchy of subtotals and grand totals in the result set.

    - **Syntax**: GROUPING_ID(column1, column2, ...)

    - **Returns**: Returns an integer that encodes the grouping levels as a bit mask. The integer value corresponds to the combination of columns that are being aggregated.

**Example:**

```sql
SELECT SalesPerson,
SalesMonth,
SUM(SalesAmount) AS TotalSales,
GROUPING_ID(SalesPerson, SalesMonth) AS GroupingID
FROM Sales
GROUP BY ROLLUP (SalesPerson, SalesMonth);
In this example, GROUPING_ID(SalesPerson, SalesMonth) returns an integer where each bit represents whether each column is part of the grouping. For instance, if SalesPerson is aggregated but SalesMonth is not, the function might return a value like 1.
```

### Summary

- **GROUPING Function**: Helps differentiate between data rows and aggregate rows by returning 1 for aggregate rows and 0 for actual data rows.

- **GROUPING_ID Function**: Provides an integer value representing the grouping level, useful for understanding the hierarchy of subtotals and grand totals.

## Explain window functions in SQL Server.

**Window functions** in SQL Server are a powerful set of functions that perform calculations across a specified range of rows related to the current row within the result set. They allow for advanced analytical and aggregate calculations, providing insights into data in ways that regular aggregate functions do not. Unlike aggregate functions, which return a single result for the entire result set, window functions return a result for each row within the defined window.

### **Key Characteristics of Window Functions**

1.  **Row-by-Row Calculation**: Window functions calculate values for each row individually within a defined window of rows.

2.  **Over Clause**: They use the OVER clause to define the window or partition of rows for the calculation.

3.  **Partitioning and Ordering**: You can partition the data into subsets and/or order the data within those subsets to control how the function calculates its results.

### **Common Window Functions**

#### **1. Ranking Functions**

- **ROW_NUMBER()**: Assigns a unique sequential integer to rows within a partition. It is often used for pagination.

```sql
ROW_NUMBER() OVER (PARTITION BY column ORDER BY column)
```

- **RANK()**: Assigns a rank to rows within a partition, handling ties by assigning the same rank to duplicate values but skipping subsequent ranks.

```sql
RANK() OVER (PARTITION BY column ORDER BY column)
```

- **DENSE_RANK()**: Similar to RANK(), but does not skip ranks for ties. All duplicate values receive the same rank, and the next rank increments by 1.

```sql
DENSE_RANK() OVER (PARTITION BY column ORDER BY column)
```

- **NTILE()**: Divides the result set into a specified number of approximately equal parts and assigns a unique bucket number to each row.

```sql
NTILE(n) OVER (PARTITION BY column ORDER BY column)
```

#### **2. Aggregate Functions**

- **SUM()**: Calculates the sum of values within a window.

```sql
SUM(column) OVER (PARTITION BY column ORDER BY column ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

- **AVG()**: Calculates the average of values within a window.

```sql
AVG(column) OVER (PARTITION BY column ORDER BY column ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)
```

- **MIN()** and **MAX()**: Calculate the minimum or maximum value within a window.

```sql
MIN(column) OVER (PARTITION BY column ORDER BY column)
```

#### **3. Statistical Functions**

- **CUME_DIST()**: Calculates the cumulative distribution of a value in a set of values. It returns the relative position of the value in the result set.

```sql
CUME_DIST() OVER (PARTITION BY column ORDER BY column)
```

- **PERCENT_RANK()**: Calculates the rank of a value as a percentage of the total number of rows.

```sql
PERCENT_RANK() OVER (PARTITION BY column ORDER BY column)
```

### **Syntax of Window Functions**

The general syntax for using a window function is:

window_function (expression) OVER (

```sql
[PARTITION BY partition_expression]
[ORDER BY order_expression]
[ROWS BETWEEN start_point AND end_point]
)
```

- **PARTITION BY**: Divides the result set into partitions to which the window function is applied.

- **ORDER BY**: Defines the order of rows within each partition.

- **ROWS BETWEEN**: Specifies the range of rows within the partition to include in the calculation. It can be defined with various options like UNBOUNDED PRECEDING, CURRENT ROW, UNBOUNDED FOLLOWING, etc.

### **Examples**

#### **1. Ranking Employees by Salary**

```sql
SELECT EmployeeID, EmployeeName, Salary,
RANK() OVER (ORDER BY Salary DESC) AS SalaryRank
FROM Employees;
```

- **What it does**: Ranks employees by their salary in descending order, handling ties by assigning the same rank.

#### **2. Running Total of Sales**

```sql
SELECT SalesDate, SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesDate ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM Sales;
```

- **What it does**: Calculates a running total of sales amounts, adding up values from the beginning up to the current row based on the order of sales dates.

#### **3. Calculating Moving Average**

```sql
SELECT SalesDate, SalesAmount,
AVG(SalesAmount) OVER (ORDER BY SalesDate ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS MovingAvg
FROM Sales;
```

- **What it does**: Computes a 3-day moving average of sales amounts (current day plus the previous two days).

### **Summary**

- **Definition**: Window functions perform calculations across a set of table rows related to the current row.

- **Usage**: Useful for ranking, aggregate calculations, and advanced analytical tasks.

- **Syntax**: Uses OVER clause with options for partitioning, ordering, and defining the window range.

- **Examples**: Ranking rows, calculating running totals, and computing moving averages.

## What are the differences between RANK(), ROW_NUMBER(), and DENSE_RANK()

RANK(), ROW_NUMBER(), and DENSE_RANK() are window functions in SQL used to assign a unique rank or number to rows within a result set. They are useful for ranking data, especially in scenarios involving sorting and pagination. Here’s a breakdown of the differences between these functions:

### 1. ROW_NUMBER()

- **Purpose**: Assigns a unique sequential integer to rows within a partition of a result set. The numbering starts at 1 for the first row in each partition.

- **Duplicates**: There are no ties. Each row receives a unique number regardless of any ties in the data.

- **Usage**: Commonly used for pagination or when you need a unique identifier for each row in the result set.

**Syntax**:

```sql
ROW_NUMBER() OVER (PARTITION BY column ORDER BY column)
```

**Example**:

```sql
SELECT EmployeeID, EmployeeName,
ROW_NUMBER() OVER (ORDER BY Salary DESC) AS RowNum
FROM Employees;
```

- **Result**: Assigns a unique sequential number to each employee based on their salary in descending order.

### 2. RANK()

- **Purpose**: Assigns a unique rank to each row within a partition of a result set. Rows with equal values receive the same rank, but the next rank(s) will have gaps.

- **Duplicates**: Handles ties by assigning the same rank to duplicate values and skips subsequent ranks accordingly.

**Syntax**:

```sql
RANK() OVER (PARTITION BY column ORDER BY column)
```

**Example**:

```sql
SELECT EmployeeID, EmployeeName, Salary,
RANK() OVER (ORDER BY Salary DESC) AS Rank
FROM Employees;
```

- **Result**: Employees with the same salary receive the same rank. If there are ties, the next rank is skipped. For instance, if there are two employees with the highest salary, both get rank 1, and the next rank assigned will be 3.

### 3. DENSE_RANK()

- **Purpose**: Similar to RANK(), but does not leave gaps between ranks. Rows with equal values receive the same rank, and the next rank is incremented by 1 without gaps.

- **Duplicates**: Handles ties by assigning the same rank to duplicate values, but does not skip subsequent ranks.

**Syntax**:

```sql
DENSE_RANK() OVER (PARTITION BY column ORDER BY column)
```

**Example**:

```sql
SELECT EmployeeID, EmployeeName, Salary,
DENSE_RANK() OVER (ORDER BY Salary DESC) AS DenseRank
FROM Employees;
```

- **Result**: Employees with the same salary receive the same rank. Unlike RANK(), there are no gaps in the ranks. For example, if two employees are ranked 1 due to a tie, the next rank assigned will be 2.

### Comparison Summary

- **ROW_NUMBER()**:

  - Provides a unique sequential number to each row.

  - No ties or gaps, each row gets a unique number.

- **RANK()**:

  - Provides ranks with potential gaps if there are ties.

  - Rows with the same value get the same rank, but the next rank will skip numbers accordingly.

- **DENSE_RANK()**:

  - Provides ranks without gaps between them, even if there are ties.

  - Rows with the same value get the same rank, and the next rank is incremented by 1.

## What is Difference between rows and range

In SQL Server, ROWS and RANGE are options used with window functions to specify the frame of rows to be considered for calculations. They determine which rows are included in the window frame for each row within a partition. The main difference between them lies in how they define the window frame for aggregation and calculations.

### ROWS

- **Definition**: ROWS defines the window frame as a specific number of rows before or after the current row.

- **Functionality**: It specifies a frame of rows based on their physical positions relative to the current row. This means that the frame is defined by a fixed number of rows, regardless of the values in those rows.

**Syntax**:

```sql
<window_function> OVER (
ORDER BY column_name
ROWS BETWEEN <start_point> AND <end_point>
)
```

**Example**:

```sql
SELECT SalesMonth,
SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesMonth ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS RollingSum
FROM Sales;
```

In this example:

- ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING defines a window frame that includes the row immediately before and after the current row, as well as the current row itself.

- The SUM function calculates the sum of SalesAmount for the current row and its adjacent rows.

### RANGE

- **Definition**: RANGE defines the window frame based on the range of values within the specified column, rather than a specific number of rows.

- **Functionality**: It specifies a frame of rows that fall within a range of values relative to the current row's value. This means the frame is determined by the values of the column being ordered, not by the number of rows.

**Syntax**:

```sql
<window_function> OVER (
ORDER BY column_name
RANGE BETWEEN <start_point> AND <end_point>
)
```

**Example**:

```sql
SELECT SalesMonth,
SalesAmount,
SUM(SalesAmount) OVER (ORDER BY SalesAmount RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING) AS RangeSum
FROM Sales;
```

In this example:

- RANGE BETWEEN 1000 PRECEDING AND 1000 FOLLOWING defines a window frame that includes rows where the SalesAmount is within a range of 1000 units before and after the current row's SalesAmount.

- The SUM function calculates the sum of SalesAmount for rows where SalesAmount falls within the specified range around the current row's SalesAmount.

### Key Differences

1.  **Definition of Frame**:

    - **ROWS**: Defines the frame based on a number of physical rows.

    - **RANGE**: Defines the frame based on a range of values.

2.  **Frame Behavior**:

    - **ROWS**: The frame includes a fixed number of rows relative to the current row's position.

    - **RANGE**: The frame includes rows with values within a specified range relative to the current row's value.

3.  **Usage**:

    - **ROWS**: Useful when you need a fixed number of rows regardless of their values, such as calculating moving averages over a specific number of preceding and following rows.

    - **RANGE**: Useful when you want to aggregate based on value ranges, such as summing values within a certain amount around the current row's value.

## What is Lead and lag function

The LEAD and LAG functions in SQL Server are window functions used to access data from subsequent or preceding rows in the result set, respectively. They are useful for comparing values across different rows and analyzing trends or changes over time.

### LEAD Function

- **Purpose**: The LEAD function provides access to a value in a subsequent row, relative to the current row. It helps in comparing the current row's value with a value from a future row.

- **Syntax**:

```sql
LEAD(expression, [offset], [default]) OVER (PARTITION BY partition_column ORDER BY order_column)
```

- **expression**: The column or expression whose value you want to access.

- **offset**: The number of rows forward from the current row to fetch the value. Defaults to 1 if not specified.

- **default**: The value to return if the offset goes beyond the end of the result set. Defaults to NULL if not specified.

- **PARTITION BY partition_column**: Optional. Divides the result set into partitions to apply the function separately to each partition.

- **ORDER BY order_column**: Specifies the order of rows within each partition.

### Example

Consider a sales table with monthly sales data:

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

You want to compare each month's sales with the sales of the next month:

```sql
SELECT SalesMonth,
SalesAmount,
LEAD(SalesAmount, 1, 'N/A') OVER (ORDER BY SalesMonth) AS NextMonthSales
FROM Sales;
```

### Explanation

- **LEAD(SalesAmount, 1, 'N/A')**: Retrieves the SalesAmount from the next row (next month) and defaults to 'N/A' if there is no next row.

- **ORDER BY SalesMonth**: Orders the rows by SalesMonth.

### Result

| **SalesMonth** | **SalesAmount** | **NextMonthSales** |
|----------------|-----------------|--------------------|
| January        | 1000            | 1500               |
| February       | 1500            | 2000               |
| March          | 2000            | 2500               |
| April          | 2500            | 3000               |
| May            | 3000            | N/A                |

### LAG Function

- **Purpose**: The LAG function provides access to a value in a preceding row, relative to the current row. It helps in comparing the current row's value with a value from a previous row.

- **Syntax**:

```sql
LAG(expression, [offset], [default]) OVER (PARTITION BY partition_column ORDER BY order_column)
```

- **expression**: The column or expression whose value you want to access.

- **offset**: The number of rows backward from the current row to fetch the value. Defaults to 1 if not specified.

- **default**: The value to return if the offset goes before the beginning of the result set. Defaults to NULL if not specified.

- **PARTITION BY partition_column**: Optional. Divides the result set into partitions to apply the function separately to each partition.

- **ORDER BY order_column**: Specifies the order of rows within each partition.

### Example

You want to compare each month's sales with the sales of the previous month:

```sql
SELECT SalesMonth,
SalesAmount,
LAG(SalesAmount, 1, 'N/A') OVER (ORDER BY SalesMonth) AS PreviousMonthSales
FROM Sales;
```

### Explanation

- **LAG(SalesAmount, 1, 'N/A')**: Retrieves the SalesAmount from the previous row (previous month) and defaults to 'N/A' if there is no previous row.

- **ORDER BY SalesMonth**: Orders the rows by SalesMonth.

### Result

| **SalesMonth** | **SalesAmount** | **PreviousMonthSales** |
|----------------|-----------------|------------------------|
| January        | 1000            | N/A                    |
| February       | 1500            | 1000                   |
| March          | 2000            | 1500                   |
| April          | 2500            | 2000                   |
| May            | 3000            | 2500                   |

### Summary

- **LEAD Function**: Accesses data from subsequent rows.

- **LAG Function**: Accesses data from preceding rows.

- **Use Cases**: Useful for trend analysis, comparing current values with past or future values, and calculating differences or changes over time.

## What is NTile function

The NTILE function in SQL Server is a window function used to divide a result set into a specified number of roughly equal-sized groups, known as "tiles" or "buckets." It assigns a unique integer value to each row, indicating the tile or group to which the row belongs.

### Key Concepts of NTILE

- **Partitioning**: NTILE divides the ordered result set into a specified number of groups.

- **Tiles**: Each row is assigned a tile number based on its position in the ordered partition.

- **Approximate Size**: The sizes of the tiles are approximately equal, but they may not be exactly the same if the total number of rows is not perfectly divisible by the number of tiles.

### Syntax

```sql
NTILE(number_of_tiles) OVER (ORDER BY column_name)
```

- **number_of_tiles**: The number of tiles (or groups) you want to divide the result set into.

- **ORDER BY column_name**: Specifies the order in which the rows are processed and assigned to tiles.

### Example

Suppose you have a sales table with the following data:

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

### Explanation of the Example

- **NTILE(3)**: Divides the result set into 3 tiles.

- **ORDER BY SalesAmount DESC**: Orders the rows by SalesAmount in descending order before assigning tiles.

### Result

The result might look like this:

| **SalesPerson** | **SalesAmount** | **SalesTile** |
|-----------------|-----------------|---------------|
| Eve             | 3000            | 1             |
| David           | 2500            | 1             |
| Charlie         | 2000            | 2             |
| Bob             | 1500            | 2             |
| Alice           | 1000            | 3             |

In this example:

- **Tile 1** contains the top 2 rows with the highest SalesAmount.

- **Tile 2** contains the next 2 rows.

- **Tile 3** contains the remaining row.

### Summary

- **Purpose**: NTILE is used to divide a result set into a specified number of roughly equal-sized groups or tiles.

- **Syntax**: NTILE(number_of_tiles) OVER (ORDER BY column_name)

- **Use Cases**: Useful for creating quantiles, ranking data, and partitioning data into groups for further analysis.
