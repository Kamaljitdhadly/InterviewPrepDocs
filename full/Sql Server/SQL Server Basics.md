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

**Collation** in SQL Server refers to a set of rules that determine how data is sorted and compared. It defines the character set, the rules for character comparison (e.g., case sensitivity, accent sensitivity), and how characters are ordered. Collation settings affect the way queries sort and compare text data, making it crucial for applications involving multilingual data or diverse character sets.

### **Key Aspects of Collation**

1.  **Character Set**: Defines the collection of characters available, such as ASCII or Unicode.

2.  **Sort Order**: Determines how characters are ordered, e.g., alphabetically or numerically.

3.  **Comparison Rules**: Specifies how text comparisons are performed, considering factors like case sensitivity, accent sensitivity, and language-specific rules.

### **Types of Collation Sensitivity**

Collation sensitivity refers to the different aspects that can be affected by collation settings. The main types of collation sensitivity are:

1.  **Case Sensitivity (CS vs CI)**

    - **Case-Sensitive (CS)**: Distinguishes between uppercase and lowercase letters. For example, 'A' is considered different from 'a'.

    - **Case-Insensitive (CI)**: Treats uppercase and lowercase letters as equivalent. For example, 'A' is considered the same as 'a'.

**Example:**

```sql
-- Case-sensitive collation
COLLATE Latin1_General_BIN
SELECT 'A' = 'a'; -- Returns 0 (false)
-- Case-insensitive collation
COLLATE Latin1_General_CI_AS
SELECT 'A' = 'a'; -- Returns 1 (true)
```

2.  **Accent Sensitivity (AS vs AI)**

    - **Accent-Sensitive (AS)**: Distinguishes between characters with accents and those without. For example, 'é' is different from 'e'.

    - **Accent-Insensitive (AI)**: Treats accented characters as equivalent to their unaccented counterparts. For example, 'é' is considered the same as 'e'.

**Example:**

```sql
-- Accent-sensitive collation
COLLATE Latin1_General_BIN
SELECT 'é' = 'e'; -- Returns 0 (false)
-- Accent-insensitive collation
COLLATE Latin1_General_CI_AI
SELECT 'é' = 'e'; -- Returns 1 (true)
```

3.  **Kana Sensitivity (KS vs KI)**

    - **Kana-Sensitive (KS)**: Distinguishes between Japanese Hiragana and Katakana characters. For example, 'あ' (Hiragana) is different from 'ア' (Katakana).

    - **Kana-Insensitive (KI)**: Treats Hiragana and Katakana characters as equivalent.

**Example:**

```sql
-- Kana-sensitive collation
COLLATE Japanese_XJIS_BIN
SELECT 'あ' = 'ア'; -- Returns 0 (false)
-- Kana-insensitive collation
COLLATE Japanese_XJIS_CI_AI
SELECT 'あ' = 'ア'; -- Returns 1 (true)
```

4.  **Width Sensitivity (WS vs WI)**

    - **Width-Sensitive (WS)**: Distinguishes between single-byte and double-byte characters. For example, 'a' (single-byte) is different from 'ａ' (double-byte).

    - **Width-Insensitive (WI)**: Treats single-byte and double-byte characters as equivalent.

**Example:**

```sql
-- Width-sensitive collation
COLLATE Korean_Wansung_BIN
SELECT 'a' = 'ａ'; -- Returns 0 (false)
-- Width-insensitive collation
COLLATE Korean_Wansung_CI_AI
SELECT 'a' = 'ａ'; -- Returns 1 (true)
```

### **Choosing Collation**

- **Database Creation**: When creating a database, you specify the default collation, which affects all text columns unless otherwise specified.

- **Column-Level Collation**: You can override the database default collation for individual columns in a table.

- **Query-Level Collation**: You can specify collation settings directly in queries for specific operations or comparisons.

### **Examples**

#### **Setting Collation for a Database**

```sql
CREATE DATABASE MyDatabase
COLLATE Latin1_General_CI_AS;
```

#### **Setting Collation for a Column**

```sql
CREATE TABLE MyTable (
Name NVARCHAR(100) COLLATE Latin1_General_BIN
);
```

#### **Setting Collation for a Query**

```sql
SELECT *
FROM MyTable
WHERE Name COLLATE Latin1_General_CI_AI = 'example';
```

In summary, collation in SQL Server defines how string data is compared and sorted. Understanding and choosing the right collation sensitivity is important for ensuring accurate and meaningful text data operations, especially in multilingual and diverse environments.

## What are the different types of data types in SQL Server?

SQL Server provides a wide range of data types to handle different kinds of data. Understanding these data types is crucial for designing efficient and effective database schemas. Here’s a comprehensive overview of the different types of data types available in SQL Server:

### 1. Numeric Data Types

- **INT**: A 32-bit integer. Range: -2,147,483,648 to 2,147,483,647.

- **BIGINT**: A 64-bit integer. Range: -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807.

- **SMALLINT**: A 16-bit integer. Range: -32,768 to 32,767.

- **TINYINT**: An 8-bit integer. Range: 0 to 255.

- **DECIMAL(p,s)**: A fixed precision and scale numeric value. p specifies the total number of digits, and s specifies the number of digits after the decimal point. Maximum precision is 38.

- **NUMERIC(p,s)**: Functionally equivalent to DECIMAL.

- **FLOAT**: A floating-point number with approximate precision. Precision is controlled by the number of bits (usually 53 bits for FLOAT(53)).

- **REAL**: A floating-point number with lower precision than FLOAT. It has a precision of 24 bits.

### 2. Character Data Types

- **CHAR(n)**: A fixed-length character string. n is the number of characters. Padding with spaces occurs if the string is shorter than n.

- **VARCHAR(n)**: A variable-length character string. n specifies the maximum number of characters. No padding occurs.

- **TEXT**: A deprecated type for variable-length character data. Use VARCHAR(MAX) instead.

### 3. Unicode Data Types

- **NCHAR(n)**: A fixed-length Unicode character string. n is the number of characters.

- **NVARCHAR(n)**: A variable-length Unicode character string. n specifies the maximum number of characters.

- **NTEXT**: A deprecated type for variable-length Unicode data. Use NVARCHAR(MAX) instead.

### 4. Date and Time Data Types

- **DATE**: Stores date values only. Format: YYYY-MM-DD. Range: 0001-01-01 to 9999-12-31.

- **TIME**: Stores time values only. Format: HH:MM:SS[.fraction]. Precision up to 100 nanoseconds.

- **DATETIME**: Stores date and time values. Format: YYYY-MM-DD HH:MM:SS[.fraction]. Range: 1753-9999.

- **DATETIME2**: An extension of DATETIME with higher precision for date and time values. Precision up to 100 nanoseconds. Range: 0001-9999.

- **SMALLDATETIME**: Stores date and time values with a lower range and precision compared to DATETIME. Range: 1900-2079.

- **DATETIMEOFFSET**: Stores date and time with time zone offset. Format: YYYY-MM-DD HH:MM:SS[.fraction] [+-]HH:MM.

### 5. Binary Data Types

- **BINARY(n)**: A fixed-length binary data. n is the number of bytes.

- **VARBINARY(n)**: A variable-length binary data. n specifies the maximum number of bytes. Use VARBINARY(MAX) for very large data.

- **IMAGE**: A deprecated type for variable-length binary data. Use VARBINARY(MAX) instead.

### 6. Other Data Types

- **BIT**: Stores a 1-bit integer. Values are 0, 1, or NULL.

- **UNIQUEIDENTIFIER**: Stores a globally unique identifier (GUID). Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.

- **XML**: Stores XML data. Allows for querying and manipulation of XML documents.

- **JSON**: SQL Server does not have a dedicated JSON data type, but JSON data can be stored in VARCHAR, NVARCHAR, or VARBINARY columns and queried using built-in functions.

### 7. Spatial Data Types

- **GEOGRAPHY**: Stores spatial data in a spherical coordinate system (latitude/longitude).

- **GEOMETRY**: Stores spatial data in a planar coordinate system.

### Choosing Data Types

- **Character vs. Unicode**: Use CHAR or VARCHAR for non-Unicode data and NCHAR or NVARCHAR for Unicode data.

- **Precision and Scale**: Use DECIMAL or NUMERIC when you need exact numeric precision, and FLOAT or REAL for approximate precision.

- **Date and Time**: Choose based on the precision and range needed.

- **Binary Data**: Use VARBINARY(MAX) for large binary data, such as files or images.

## What are the differences between DATETIME, SMALLDATETIME, and DATE data types?

The DATETIME, SMALLDATETIME, and DATE data types in SQL Server are used to store date and time values, but they differ in their range, precision, and storage requirements. Here's a detailed comparison of these data types:

### **1.** DATETIME

- **Purpose**: Stores both date and time values.

- **Range**: January 1, 1753 to December 31, 9999.

- **Precision**: Up to 3.33 milliseconds. The time is accurate to 1/300th of a second.

- **Storage**: 8 bytes.

#### **Example**

```sql
-- Example of DATETIME usage
SELECT CAST('2024-09-06 14:30:00.123' AS DATETIME) AS DateTimeValue;
```

### **2.** SMALLDATETIME

- **Purpose**: Stores both date and time values but with less precision than DATETIME.

- **Range**: January 1, 1900 to June 6, 2079.

- **Precision**: Accurate to the minute. The time is rounded to the nearest minute.

- **Storage**: 4 bytes.

#### **Example**

```sql
-- Example of SMALLDATETIME usage
SELECT CAST('2024-09-06 14:30:00' AS SMALLDATETIME) AS SmallDateTimeValue;
```

### **3.** DATE

- **Purpose**: Stores only date values, without time.

- **Range**: January 1, 0001 to December 31, 9999.

- **Precision**: Not applicable since it does not store time.

- **Storage**: 3 bytes.

#### **Example**

```sql
-- Example of DATE usage
SELECT CAST('2024-09-06' AS DATE) AS DateValue;
```

### **Comparison Summary**

- **DATETIME**:

  - **Range**: Broad range from 1753 to 9999.

  - **Precision**: Up to 1/300th of a second.

  - **Storage**: 8 bytes.

  - **Use Case**: Suitable for applications needing high precision for both date and time values.

- **SMALLDATETIME**:

  - **Range**: More limited range from 1900 to 2079.

  - **Precision**: Rounded to the nearest minute.

  - **Storage**: 4 bytes.

  - **Use Case**: Suitable for applications where lower precision and a smaller storage requirement are acceptable.

- **DATE**:

  - **Range**: Covers a broad range from 0001 to 9999.

  - **Precision**: No time component, only the date.

  - **Storage**: 3 bytes.

  - **Use Case**: Ideal for scenarios where only the date is needed without time information.

### **When to Use Each**

- **DATETIME**: Use when you need to store and manipulate both date and time with high precision.

- **SMALLDATETIME**: Use when you need to store date and time with less precision and reduced storage requirements.

- **DATE**: Use when you only need to store dates without time information.

## What are user-defined data types?

User-defined data types in SQL Server allow you to create custom data types based on existing system data types. This can be useful for encapsulating common data structures, improving data consistency, and enhancing code readability. They are essentially custom wrappers around existing data types and provide a way to enforce consistent data storage and handling rules across your database.

### **Types of User-Defined Data Types**

1.  **User-Defined Data Types (UDTs)**

2.  **User-Defined Table Types**

### **1. User-Defined Data Types (UDTs)**

User-Defined Data Types (UDTs) are custom data types that you define using an existing system data type as the base. They can include constraints and default values to enforce specific rules.

#### **Creating a User-Defined Data Type**

```sql
CREATE TYPE CustomDataType AS VARCHAR(100);
```

- **CustomDataType**: The name of the user-defined data type.

- **VARCHAR(100)**: The underlying system data type.

#### **Using a User-Defined Data Type**

```sql
-- Create a table with a column using the user-defined data type
CREATE TABLE ExampleTable (
ID INT PRIMARY KEY,
```

Name CustomDataType

```sql
);
```

In this example, the Name column uses the CustomDataType which is based on VARCHAR(100).

#### **Altering or Dropping a User-Defined Data Type**

```sql
-- Alter the user-defined data type (if needed)
```

-- SQL Server does not support altering user-defined types directly. You need to drop and recreate them.

```sql
-- Drop a user-defined data type
DROP TYPE CustomDataType;
```

### **2. User-Defined Table Types**

User-Defined Table Types allow you to define a custom table structure that can be used as a parameter in stored procedures and functions.

#### **Creating a User-Defined Table Type**

CREATE TYPE CustomTableType AS TABLE (

```sql
ID INT PRIMARY KEY,
Name VARCHAR(100),
```

CreatedDate DATETIME

```sql
);
```

#### **Using a User-Defined Table Type**

```sql
-- Declare a variable of the user-defined table type
DECLARE @TableVariable CustomTableType;
-- Insert data into the table variable
INSERT INTO @TableVariable (ID, Name, CreatedDate)
VALUES (1, 'SampleName', GETDATE());
-- Use the table variable in a query
SELECT * FROM @TableVariable;
```

### **Summary**

- **User-Defined Data Types (UDTs)**: Custom types based on existing types, useful for consistency and constraints.

- **User-Defined Table Types**: Custom table structures for use in procedures and functions.

## What is the difference between CHAR and VARCHAR?

**CHAR** and **VARCHAR** are both used to store character data in SQL Server, but they differ in how they store and handle this data.

### **Key Differences Between CHAR and VARCHAR**

| **Criteria** | **CHAR** | **VARCHAR** |
|----|----|----|
| **Full Name** | **CHAR** stands for **Character** | **VARCHAR** stands for **Variable Character** |
| **Storage Size** | Fixed-length, always uses the defined space | Variable-length, uses only as much space as needed |
| **Performance** | Slightly faster for fixed-size data (due to fixed size) | May be slower for large, variable data (due to dynamic length) |
| **Use Case** | Best for storing data that is always the same length (e.g., fixed-length codes) | Best for storing data of variable length (e.g., names, descriptions) |
| **Padding Behavior** | Pads with spaces to fill the defined size | Does not pad with spaces |
| **Maximum Size** | Up to 8,000 characters | Up to 8,000 characters (or up to 2GB with VARCHAR(MAX)) |
| **Memory Efficiency** | Less efficient for storing variable-length data | More efficient for storing variable-length data |

## What is Normalization and Denormalization?

**Normalization** is a database design process aimed at organizing a database to reduce redundancy and improve data integrity. It involves structuring the data in a way that eliminates anomalies and ensures that the database adheres to a set of rules, known as normal forms. The primary goals of normalization are to:

1.  **Eliminate Redundancy**: Avoid storing the same data in multiple places.

2.  **Improve Data Integrity**: Ensure that data is consistent and accurate across the database.

3.  **Facilitate Efficient Data Management**: Make it easier to maintain, update, and query the data.

### Normal Forms

Normalization involves several steps, each resulting in a "normal form." Each normal form has specific requirements and aims to address different types of redundancy and anomalies. Here’s an overview of the common normal forms:

1.  **First Normal Form (1NF)**

    - **Requirement**: Ensure that the table has a primary key and that all columns contain atomic (indivisible) values. This means that each column must contain only a single value, and each row must be unique.

    - **Example**: A table where each cell contains a single value and there are no repeating groups or arrays.

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

2.  **Second Normal Form (2NF)**

    - **Requirement**: The table must be in 1NF and have no partial dependencies. This means that all non-key columns must be fully functionally dependent on the entire primary key, not just part of it.

    - **Example**: If a table has a composite primary key, each non-key column must depend on all parts of that key.

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

3.  **Third Normal Form (3NF)**

    - **Requirement**: The table must be in 2NF and have no transitive dependencies. This means that non-key columns must not depend on other non-key columns.

    - **Example**: If a non-key column is dependent on another non-key column, this violates 3NF.

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

4.  **Boyce-Codd Normal Form (BCNF)**

    - **Requirement**: The table must be in 3NF and, additionally, every determinant must be a candidate key. This is a stricter version of 3NF.

    - **Example**: This form deals with situations where multiple candidate keys exist and ensures that the table remains free from anomalies.

**Example of BCNF Violation and Fixes** typically involves more complex relationships and dependencies, but the process involves ensuring all functional dependencies are handled by candidate keys.

5.  **Fourth Normal Form (4NF)**

    - **Requirement**: The table must be in BCNF and have no multi-valued dependencies. A multi-valued dependency occurs when a table contains multiple independent multi-valued facts about an entity.

```sql
**Example**: If a table includes multiple independent sets of values (e.g., skills and languages for an employee), these should be separated into different tables.
```

6.  **Fifth Normal Form (5NF)**

    - **Requirement**: The table must be in 4NF and must not contain any join dependencies that are not implied by the candidate keys.

**Example**: It involves decomposing tables to ensure that all information can be reconstructed without redundancy.

### Benefits of Normalization

- **Reduced Data Redundancy**: Eliminates duplicate data by breaking it into related tables.

- **Improved Data Integrity**: Ensures that updates, deletions, and insertions are handled consistently.

- **Efficient Queries**: Optimizes query performance by structuring data in a logical and organized manner.

- **Easier Maintenance**: Simplifies the maintenance of data by keeping it organized and avoiding anomalies.

Normalization vs. Denormalization

- Normalization: Focuses on reducing redundancy and improving data integrity. Ideal for transactional databases where data consistency is crucial.

- Denormalization: Involves combining tables and adding redundancy to improve read performance in certain scenarios, such as data warehousing or reporting, where speed is prioritized over normalization.

## What are the different types of joins in SQL Server?

In SQL Server, there are several types of joins that you can use to combine rows from two or more tables based on related columns. Here’s a brief overview of each type:

1.  **INNER JOIN**: Returns rows when there is a match in both tables. If a row in the first table matches multiple rows in the second table, you get multiple rows in the result set.

```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.common_column = table2.common_column;
```

2.  **LEFT JOIN (or LEFT OUTER JOIN)**: Returns all rows from the left table and the matched rows from the right table. If there is no match, the result is NULL on the right side.

```sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.common_column = table2.common_column;
```

3.  **RIGHT JOIN (or RIGHT OUTER JOIN)**: Returns all rows from the right table and the matched rows from the left table. If there is no match, the result is NULL on the left side.

```sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.common_column = table2.common_column;
```

4.  **FULL JOIN (or FULL OUTER JOIN)**: Returns all rows when there is a match in one of the tables. If there is no match, the result is NULL on the side where there is no match.

```sql
SELECT columns
FROM table1
FULL JOIN table2
ON table1.common_column = table2.common_column;
```

5.  **CROSS JOIN**: Returns the Cartesian product of the two tables, i.e., all possible combinations of rows. It does not require a condition to join the tables.

```sql
SELECT columns
FROM table1
CROSS JOIN table2;
```

6.  **SELF JOIN**: A self-join is a regular join but the table is joined with itself. It's useful for querying hierarchical data or comparing rows within the same table.

## What is CROSS APPLY And OUTER APPLY?

```sql
SELECT a.columns, b.columns
FROM table a
INNER JOIN table b
ON a.common_column = b.common_column;
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
```

In SQL Server, CROSS APPLY and OUTER APPLY are used to join a table with a table-valued function, or to join two tables where one of the tables can be a table-valued function. They are similar to JOIN operations but are particularly useful for querying scenarios where you need to use a table-valued function that returns different results for each row of the outer table.

### CROSS APPLY

CROSS APPLY is used to join each row from the outer table with the result of a table-valued function or a derived table. It only returns rows where the table-valued function or derived table produces a result for each row of the outer table. If the table-valued function returns no rows for a given row from the outer table, that row will not appear in the result set.

### Example

```sql
SELECT t.*, f.*
FROM OuterTable t
CROSS APPLY TableValuedFunction(t.ColumnName) f;
```

Here, TableValuedFunction is a function that returns a table. For each row in OuterTable, TableValuedFunction is executed, and the result is joined with the row from OuterTable. Only rows from OuterTable for which TableValuedFunction returns rows are included in the result set.

### OUTER APPLY

OUTER APPLY is similar to CROSS APPLY, but it returns all rows from the outer table, regardless of whether the table-valued function or derived table returns results. If the table-valued function returns no rows for a particular row in the outer table, that row will still appear in the result set, with NULLs for columns from the table-valued function.

### Example

```sql
SELECT t.*, f.*
FROM OuterTable t
OUTER APPLY TableValuedFunction(t.ColumnName) f;
```

Here, OUTER APPLY will return all rows from OuterTable. If TableValuedFunction does not return any rows for a particular row in OuterTable, that row will still appear in the result set, with NULL values for the columns from TableValuedFunction.

### Key Differences

- **CROSS APPLY**: Only includes rows from the outer table where the table-valued function returns rows. If no rows are returned by the function, the outer row is excluded.

- **OUTER APPLY**: Includes all rows from the outer table, even if the table-valued function returns no rows for some outer rows. For those cases, columns from the function are NULL.

## What types of SQL relationships do you know?

In SQL databases, relationships between tables define how data in one table relates to data in another. Properly defining these relationships is essential for maintaining data integrity and ensuring accurate data retrieval. The primary types of SQL relationships are:

### **1. One-to-One (1:1) Relationship**

In a one-to-one relationship, each record in Table A corresponds to exactly one record in Table B, and vice versa. This relationship is used when you need to split data into separate tables for organizational or security reasons, but each record in both tables is uniquely associated with a single record in the other table.

#### **Example:**

- **Table A**: Employees

- **Table B**: EmployeeDetails

  - Each employee has exactly one detailed record.

### Schema Example

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

### **2. One-to-Many (1) Relationship**

In a one-to-many relationship, a single record in Table A can relate to multiple records in Table B, but each record in Table B relates to only one record in Table A. This is the most common type of relationship and is used to model hierarchical data structures.

#### **Example:**

- **Table A**: Departments

- **Table B**: Employees

  - Each department can have multiple employees, but each employee belongs to only one department.

### Schema Example

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

### **3. Many-to-Many (N) Relationship**

In a many-to-many relationship, multiple records in Table A can relate to multiple records in Table B. This type of relationship is typically implemented using a junction table (also known as a bridge or linking table) that holds foreign keys referencing the primary keys of both Table A and Table B.

#### **Example:**

- **Table A**: Students

- **Table B**: Courses

- **Junction Table**: StudentCourses

  - Each student can enroll in multiple courses, and each course can have multiple students.

### Schema Example

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

### WHERE Clause

- **Purpose**: The WHERE clause is used to filter rows **before** any grouping or aggregation occurs. It filters the rows that are selected by the FROM clause.

- **Usage**: You typically use WHERE when you want to filter rows based on specific conditions on **individual columns**.

#### Example with WHERE:

```sql
SELECT ProductName, Price
FROM Products
WHERE Price > 100;
```

- This query selects products with a price greater than 100. The WHERE clause filters rows based on the Price column **before any aggregation or grouping**.

### **HAVING Clause**

- **Purpose**: The HAVING clause is used to filter rows **after** they have been grouped or aggregated (using GROUP BY or aggregate functions). It is typically used to filter the results of aggregate functions.

- **Usage**: You use HAVING when you want to filter the groups of rows created by the GROUP BY clause, often based on **aggregate results** (e.g., SUM, COUNT, etc.).

#### Example with HAVING:

```sql
SELECT Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY Category
HAVING COUNT(ProductID) > 10;
```

- This query groups the products by Category and then counts how many products are in each category. The HAVING clause filters the result to include only categories with more than 10 products.

- **Without** the GROUP BY and HAVING, the COUNT aggregate function cannot be used in the WHERE clause directly.

### **Summary**:

- Use **WHERE** to filter rows **before** aggregation or grouping. It operates on **individual rows** of the table.

- Use **HAVING** to filter groups or aggregated results **after** grouping has occurred. It operates on **grouped rows** (after the GROUP BY clause or aggregate function).

#### Combined Example:

```sql
SELECT Category, AVG(Price) AS AvgPrice
FROM Products
WHERE Price > 100 -- Filter rows before grouping
GROUP BY Category
HAVING AVG(Price) > 200; -- Filter groups based on aggregate function
```

- The WHERE clause filters products with a price greater than 100 **before** the grouping.

- The HAVING clause filters categories where the average price is greater than 200 **after** the grouping.

## What are constraints in SQL? Name the different types.

In SQL, **constraints** are rules applied to columns or entire tables to enforce data integrity and define how the data in the database should be stored or manipulated. Constraints help ensure that the data adheres to certain rules and prevents invalid data from being entered into the database.

### Types of Constraints in SQL

1.  **Primary Key Constraint**

    - Ensures that each row in a table is **unique** and that the column(s) cannot contain NULL values.

    - Each table can only have **one** primary key, but it can consist of **one or more columns** (composite key).

    - Example:

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
FirstName NVARCHAR(50),
LastName NVARCHAR(50)
);
```

2.  **Foreign Key Constraint**

    - Enforces a relationship between two tables by linking a column (or group of columns) in one table to a **primary key** in another table.

    - Ensures **referential integrity**, meaning the foreign key value must match a primary key value in the referenced table or be NULL.

    - Example:

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
CustomerID INT,
FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);
```

3.  **Unique Constraint**

    - Ensures that **all values** in a column (or a group of columns) are **unique** across the table, meaning no duplicate values are allowed.

    - Unlike the primary key, a table can have **multiple unique constraints**, and columns with unique constraints can accept NULL values (but only one NULL per column).

    - Example:

```sql
CREATE TABLE Users (
UserID INT PRIMARY KEY,
Email NVARCHAR(255) UNIQUE
);
```

4.  **Not Null Constraint**

    - Ensures that a column cannot contain NULL values. This guarantees that every row in the table must have a value for that column.

    - Example:

```sql
CREATE TABLE Products (
ProductID INT PRIMARY KEY,
ProductName NVARCHAR(100) NOT NULL
);
```

5.  **Check Constraint**

    - Ensures that all values in a column meet a specified condition or rule. The condition can involve comparisons, logical expressions, or functions.

    - Example:

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Salary DECIMAL(10, 2),
CHECK (Salary >= 0) -- Salary must be non-negative
);
```

6.  **Default Constraint**

    - Provides a **default value** for a column when no value is specified during data insertion. If a value is not supplied for the column, the default value is automatically used.

    - Example:

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
OrderDate DATETIME DEFAULT GETDATE() -- Default to current date/time
);
```

7.  **Index (Not a constraint but often mentioned)**

    - While not a constraint, indexes are used to **speed up data retrieval**. They can be created on one or more columns in a table to improve performance but don't directly affect data integrity.

## How do you enforce unique data in a SQL Server table?

To enforce unique data in a SQL Server table, you can use various methods, each serving different purposes based on your requirements. Here are the primary methods to ensure uniqueness:

### 1. Unique Constraints

- **Definition**: A unique constraint ensures that all values in a column or a combination of columns are distinct from each other within the table.

- **Example**:

In this example, the Email column will only accept unique email addresses.

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Email NVARCHAR(255) UNIQUE
);
```

### 2. Primary Keys

- **Definition**: A primary key is a special case of a unique constraint. It uniquely identifies each row in a table and cannot contain NULL values.

- **Example**:

In this example, EmployeeID is the primary key, ensuring each employee has a unique ID.

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name NVARCHAR(255)
);
```

### 3. Unique Indexes

- **Definition**: A unique index ensures that the values in one or more columns are unique across all rows in the table. Unlike constraints, indexes can be created independently.

- **Example**:

This creates a unique index on the Email column, ensuring that no two rows have the same email address.

```sql
CREATE UNIQUE INDEX UX_Email
ON Employees (Email);
```

### 4. Combination of Columns

- **Definition**: You can enforce uniqueness across a combination of columns (composite unique constraints or indexes), ensuring that the combination of values in these columns is unique.

- **Syntax**:

```sql
ALTER TABLE table_name
ADD CONSTRAINT constraint_name UNIQUE (column1, column2);
```

- **Example**:

In this example, the combination of EmployeeID and ProjectID must be unique, ensuring that an employee cannot be assigned to the same project more than once.

```sql
CREATE TABLE EmployeeProjects (
EmployeeID INT,
ProjectID INT,
PRIMARY KEY (EmployeeID, ProjectID)
);
```

### 5. Check Constraints with Unique Logic

- **Definition**: Though not specifically for enforcing uniqueness, you can use a check constraint to enforce specific conditions that might indirectly ensure uniqueness.

- **Example**:

This example enforces that all orders must be placed on or after January 1, 2020. While not a uniqueness constraint, it ensures specific data conditions.

```sql
CREATE TABLE Orders (
OrderID INT PRIMARY KEY,
OrderDate DATE,
CustomerID INT,
CHECK (OrderDate >= '2020-01-01')
);
```

## Explain cascading actions (ON DELETE, ON UPDATE) for foreign keys.

Cascading actions in SQL Server allow you to define how changes to parent rows affect corresponding rows in child tables through foreign key relationships. These actions ensure referential integrity between tables by automatically propagating changes (such as updates or deletions) to related rows in other tables.

### Cascading Actions

1.  **ON DELETE CASCADE**

    - **Definition**: When a row in the parent table is deleted, the corresponding rows in the child table are automatically deleted.

    - **Usage**: Ensures that if a parent record is removed, all related child records are also removed, preventing orphaned records.

**Example:**

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

- If a row in ParentTable is deleted, all rows in ChildTable that reference the deleted ParentID will also be deleted automatically.

2.  **ON UPDATE CASCADE**

    - **Definition**: When a value in the parent table’s primary key is updated, the corresponding values in the child table’s foreign key are automatically updated.

    - **Usage**: Ensures that if the primary key value in the parent table changes, all related foreign key values in the child table are updated to reflect the new value.

**Example:**

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

- If the ParentID in ParentTable is updated, the ParentID in ChildTable will be updated automatically to match the new value.

### Other Options

- **ON DELETE NO ACTION** (default behavior if no action specified):

  - Prevents the deletion of a parent row if there are related rows in the child table. The delete operation is blocked if it would violate referential integrity.

- **ON DELETE SET NULL**:

  - Sets the foreign key column in the child table to NULL when the related row in the parent table is deleted. This requires that the foreign key column in the child table allows NULL values.

**Example:**

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

- If a row in ParentTable is deleted, the ParentID column in ChildTable is set to NULL for all related rows.

- **ON UPDATE SET NULL**:

  - Sets the foreign key column in the child table to NULL when the related primary key value in the parent table is updated. This requires that the foreign key column in the child table allows NULL values.

**Example:**

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

- If the ParentID in ParentTable is updated, the ParentID in ChildTable is set to NULL for all related rows.

### Summary

- **ON DELETE CASCADE**: Automatically deletes related rows in the child table when a parent row is deleted.

- **ON UPDATE CASCADE**: Automatically updates related rows in the child table when the parent table’s primary key is updated.

- **ON DELETE NO ACTION**: Prevents deletion of parent rows if related rows exist in the child table.

- **ON DELETE SET NULL**: Sets foreign key values in the child table to NULL when the parent row is deleted.

- **ON UPDATE SET NULL**: Sets foreign key values in the child table to NULL when the parent key value is updated.

## What is a primary key, and can a table have more than one primary key?

A **primary key** is a column (or a set of columns) in a table that uniquely identifies each row in that table. The primary key ensures that:

- **Uniqueness**: No two rows can have the same value(s) for the primary key column(s). This guarantees that every record is distinct.

- **Non-nullability**: A primary key column cannot contain NULL values. This ensures that each row has a valid, unique identifier.

The primary key is usually used to **enforce entity integrity**, ensuring that each record can be uniquely identified in the database.

### **Characteristics of a Primary Key**:

- **Unique**: No duplicate values are allowed in the primary key column(s).

- **Not NULL**: Primary key columns cannot contain NULL values.

- **Single or Composite**: A primary key can consist of a single column (simple primary key) or multiple columns (composite primary key).

#### Example of a Simple Primary Key:

```sql
CREATE TABLE Employees (
EmployeeID INT PRIMARY KEY,
Name NVARCHAR(100)
);
```

In this example, the EmployeeID is the primary key that uniquely identifies each employee.

#### Example of a Composite Primary Key:

```sql
CREATE TABLE OrderDetails (
OrderID INT,
ProductID INT,
Quantity INT,
PRIMARY KEY (OrderID, ProductID)
);
```

Here, the combination of OrderID and ProductID is the primary key. Each combination of OrderID and ProductID must be unique, ensuring that each row in the table represents a unique product for a particular order.

### **Can a Table Have More Than One Primary Key?**

- **No**, a table can have **only one primary key**. This is because a primary key is meant to uniquely identify each row in the table, and having multiple primary keys would conflict with this purpose.

- However, a primary key can consist of **multiple columns** (as in the case of a composite primary key), but **together**, they form a **single** primary key for the table.

### **Alternative for Multiple Keys:**

If you need multiple unique identifiers in a table, you can use **unique constraints** or **unique indexes**. These ensure uniqueness without being a primary key.

#### Example of a Unique Constraint:

```sql
CREATE TABLE Users (
UserID INT PRIMARY KEY,
```

Email NVARCHAR(255) UNIQUE

```sql
);
```

In this example, UserID is the primary key, and Email has a unique constraint, ensuring that no two users can have the same email address. But still, there is only **one primary key** in the table.

### **Summary**:

- A **primary key** uniquely identifies each row in a table and cannot contain NULL values.

- A table can have only **one primary key**, but that key can consist of one or more columns (composite key).

- For additional unique constraints, **unique constraints** or **unique indexes** can be used.

## How do you use the EXISTS clause in SQL?

The **EXISTS** clause in SQL is used to check for the existence of rows in a subquery. It is often used in correlated subqueries to determine whether certain conditions are met in the subquery's result set. The EXISTS clause returns TRUE if the subquery returns one or more rows, and FALSE if the subquery returns no rows.

- **subquery**: A query that is evaluated for the existence of rows. The outer query’s results depend on whether this subquery returns any rows.

### **Example Usage**

#### **1. Using EXISTS with Correlated Subqueries**

If you want to find products that have been ordered at least once:

```sql
SELECT ProductID, ProductName
FROM Products p
WHERE EXISTS (
SELECT 1
FROM OrderDetails od
WHERE od.ProductID = p.ProductID
);
```

- **What it does**: The subquery checks for the existence of records in OrderDetails where ProductID matches the ProductID in Products. The EXISTS clause returns TRUE if there are matching rows.

#### **2. EXISTS vs. IN**

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

- **Difference**: EXISTS typically checks for the existence of rows without caring about the actual values returned, whereas IN checks if the values are present in a set. In general, EXISTS can be more efficient for correlated subqueries.

#### **3. Using EXISTS in DELETE Statements**

You can also use EXISTS in DELETE statements to remove rows based on the presence of related data:

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

- **What it does**: Deletes customers who have placed at least one order before January 1, 2024.

## How would you use the GROUP BY clause?

The **GROUP BY** clause in SQL is used to group rows that have the same values in specified columns into summary rows, typically used with aggregate functions such as COUNT(), SUM(), AVG(), MAX(), or MIN(). It allows you to perform calculations on grouped data rather than individual rows.

### **Purpose of** GROUP BY

- The GROUP BY clause is used to aggregate data across multiple records by grouping rows that share the same values in one or more columns.

- After grouping, you can apply aggregate functions to calculate totals, averages, counts, etc., for each group.

### **Steps to Use** GROUP BY:

1.  **Select Columns**: Choose the columns to display in the result.

2.  **Aggregate Data**: Use aggregate functions (e.g., SUM(), COUNT(), AVG()) to perform operations on the grouped data.

3.  **Group By Column(s)**: Use the GROUP BY clause to group rows based on one or more columns.

### **Example 1: Simple GROUP BY with COUNT()**

Let's say we have a Products table with the following columns: ProductID, ProductName, Category, and Price.

```sql
SELECT Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY Category;
```

- **What it does**: This query groups the rows by the Category column and counts how many products are in each category.

### **Example 2: GROUP BY with SUM()**

To get the total sales by product category, assuming we have a Sales table with SaleID, Category, and Amount columns:

```sql
SELECT Category, SUM(Amount) AS TotalSales
FROM Sales
GROUP BY Category;
```

- **What it does**: This query groups the rows by Category and sums up the Amount for each category.

### **Example 3: GROUP BY with Multiple Columns**

You can also group by multiple columns. Suppose you want to count the number of products in each category for each supplier:

```sql
SELECT SupplierID, Category, COUNT(ProductID) AS ProductCount
FROM Products
GROUP BY SupplierID, Category;
```

- **What it does**: This groups the data by both SupplierID and Category and counts the products for each supplier and category combination.

### **Common Aggregate Functions with GROUP BY**:

- COUNT(): Counts the number of rows in each group.

- SUM(): Adds up numeric values in each group.

- AVG(): Calculates the average of numeric values in each group.

- MIN(): Returns the smallest value in each group.

- MAX(): Returns the largest value in each group.

## Explain UNION vs. UNION ALL.

In SQL Server, both **UNION** and **UNION ALL** are used to combine the results of two or more SELECT queries into a single result set. However, they behave differently in terms of handling duplicate rows and performance.

### **Key Differences Between UNION and UNION ALL**

| **Criteria** | **UNION** | **UNION ALL** |
|----|----|----|
| **Duplicates** | Removes duplicate rows from the result set | Includes all rows, including duplicates |
| **Performance** | Slower due to duplicate removal (sorting) | Faster because no duplicate checking is done |
| **Use Case** | Use when you want to avoid duplicates | Use when duplicates are acceptable |

## What is difference between union, intersect and except

The UNION, INTERSECT, and EXCEPT operators in SQL Server are set operators used to combine or compare the results of two or more queries. Each operator performs a different type of set operation:

### 1. UNION

- **Purpose**: Combines the results of two or more queries into a single result set.

- **Duplicates**: By default, UNION removes duplicate rows from the result set. If you want to include duplicates, use UNION ALL.

- **Column Match**: The queries must have the same number of columns with compatible data types.

**Example**:

```sql
SELECT ProductName
FROM Sales2019
UNION
SELECT ProductName
FROM Sales2020;
```

This query returns all distinct product names from both Sales2019 and Sales2020.

### 2. INTERSECT

- **Purpose**: Returns only the rows that are common to both result sets.

- **Duplicates**: By default, INTERSECT removes duplicate rows from the result set.

- **Column Match**: The queries must have the same number of columns with compatible data types.

**Example**:

```sql
SELECT ProductName
FROM Sales2019
INTERSECT
SELECT ProductName
FROM Sales2020;
```

This query returns only the product names that are present in both Sales2019 and Sales2020.

### 3. EXCEPT

- **Purpose**: Returns rows from the first result set that are not present in the second result set.

- **Duplicates**: By default, EXCEPT removes duplicate rows from the result set.

- **Column Match**: The queries must have the same number of columns with compatible data types.

**Example**:

```sql
SELECT ProductName
FROM Sales2019
EXCEPT
SELECT ProductName
FROM Sales2020;
```

This query returns the product names that are in Sales2019 but not in Sales2020.

### Summary

- **UNION**: Combines all rows from multiple queries, removing duplicates by default (use UNION ALL to include duplicates).

- **INTERSECT**: Returns only rows that are common to both queries, removing duplicates by default.

- **EXCEPT**: Returns rows from the first query that are not present in the second query, removing duplicates by default.

## What are cursors

In SQL Server, a cursor is a database object used to retrieve, manipulate, and process rows in a result set one at a time. Cursors are often used when you need to perform operations on each row of a result set individually, rather than processing all rows in a set-based manner.

### Key Concepts of Cursors

1.  **Definition**: A cursor allows you to iterate over a set of rows returned by a query and perform operations on each row.

2.  **Use Cases**:

    - When row-by-row processing is required (e.g., complex calculations, updates based on multiple conditions).

    - When you need to perform operations that cannot be done using set-based operations.

3.  **Performance**: Cursors can be less efficient compared to set-based operations because they process rows individually. They should be used judiciously and only when necessary.

### Cursor Lifecycle

1.  **Declare**: Define the cursor and the query that will populate it.

2.  **Open**: Execute the query and establish the result set for the cursor.

3.  **Fetch**: Retrieve rows one at a time from the cursor.

4.  **Close**: Release the current result set and free up resources.

5.  **Deallocate**: Remove the cursor definition and release all associated resources.

### Syntax

Here is a basic example demonstrating how to use a cursor in SQL Server:

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

### Explanation of the Example

1.  **Declare**: The DECLARE statement defines the cursor and specifies the query to retrieve employee data.

2.  **Open**: The OPEN statement executes the query and establishes the cursor result set.

3.  **Fetch**: The FETCH NEXT statement retrieves the next row from the cursor into specified variables.

4.  **Loop**: The WHILE loop iterates through each row, processing the data (e.g., printing employee information).

5.  **Close**: The CLOSE statement releases the current result set and frees up resources.

6.  **Deallocate**: The DEALLOCATE statement removes the cursor definition and releases all associated resources.

### Types of Cursors

1.  **Static Cursor**: Takes a snapshot of the result set at the time the cursor is opened. Changes made to the data after the cursor is opened are not visible.

2.  **Dynamic Cursor**: Reflects changes to the data as they occur. Rows can be inserted, updated, or deleted, and the cursor will reflect these changes.

3.  **Forward-Only Cursor**: Allows you to fetch rows only in a forward direction. It is more efficient than static or dynamic cursors for simple tasks.

4.  **Keyset-Driven Cursor**: The cursor’s result set is determined by the keys of the rows, and changes to the data (e.g., values) are reflected in the cursor.

### Considerations

- **Performance**: Cursors can be slow and resource-intensive. Set-based operations (using JOIN, GROUP BY, etc.) are usually preferred for performance reasons.

- **Complexity**: Cursors can make code more complex and harder to maintain.

- **Use Cases**: Use cursors when necessary for tasks that cannot be accomplished with set-based operations, but consider alternatives where possible.

### Summary

Cursors are a powerful tool in SQL Server for processing rows individually, allowing complex row-by-row operations. However, due to their potential impact on performance and complexity, they should be used carefully and only when necessary. In many cases, set-based operations are more efficient and should be preferred.

## What is the purpose of a temporary table, and how do you create one?

**Temporary tables** in SQL are special types of tables that are created and used during the lifetime of a session or a transaction. They are primarily used to store intermediate results temporarily and simplify complex queries or operations. Temporary tables are useful for breaking down complex processing tasks and can improve performance and manageability in SQL queries.

### **Purpose of Temporary Tables**

1.  **Intermediate Storage**: Temporary tables are useful for storing intermediate results during the execution of a complex query or multiple queries.

2.  **Simplify Queries**: By using temporary tables, you can simplify complex queries by breaking them into smaller, more manageable parts.

3.  **Improve Performance**: They can improve performance by reducing the need for repeated calculations and by optimizing query execution plans.

4.  **Facilitate Data Manipulation**: Temporary tables allow for intermediate data manipulation without affecting the main database tables.

### **Types of Temporary Tables**

1.  **Local Temporary Tables**:

    - These are specific to the session or connection in which they are created. They are automatically dropped when the session or connection is closed.

    - Local temporary tables are created with a single # prefix.

    - Example: #TempTable

2.  **Global Temporary Tables**:

    - These are visible to all sessions and connections. They are dropped only when the last session that references them is closed.

    - Global temporary tables are created with a double ## prefix.

    - Example: ##GlobalTempTable

### **Creating Temporary Tables**

#### **1. Local Temporary Table**

To create a local temporary table:

```sql
CREATE TABLE #TempTable (
Column1 INT,
Column2 NVARCHAR(100)
);
```

- **What it does**: Creates a temporary table named #TempTable with two columns: Column1 of type INT and Column2 of type NVARCHAR(100).

#### **2. Global Temporary Table**

To create a global temporary table:

```sql
CREATE TABLE ##GlobalTempTable (
Column1 INT,
Column2 NVARCHAR(100)
);
```

- **What it does**: Creates a global temporary table named ##GlobalTempTable with the same column definitions.

### **Summary**

- **Purpose**: Temporary tables are used for storing intermediate results and simplifying complex queries.

- **Types**: Local temporary tables (prefix #) and global temporary tables (prefix ##).

- **Creation**: Use CREATE TABLE #TableName or CREATE TABLE ##TableName.

- **Usage**: Insert, query, and manipulate data in temporary tables.

- **Dropping**: Temporary tables are dropped automatically when the session ends, but can also be manually dropped with DROP TABLE.

## How do you use table variables vs. temporary tables?

In SQL Server, both table variables and temporary tables are used to store intermediate results and perform complex operations within a query or a stored procedure. However, they have different characteristics, use cases, and performance implications. Here's a comparison of table variables and temporary tables, along with guidance on when to use each.

### **1. Table Variables**

**Table variables** are variables that hold data in a table format. They are declared using the DECLARE statement and are scoped to the batch, stored procedure, or function in which they are declared.

#### **Syntax**

```sql
DECLARE @TableVariable TABLE (
Column1 DataType1,
Column2 DataType2,
```

...

```sql
);
```

#### **Example**

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

#### **Characteristics**

- **Scope**: Limited to the batch, stored procedure, or function where it's declared. Not visible outside of this scope.

- **Transaction Logging**: Minimal logging compared to temporary tables, which can reduce overhead for large operations.

- **Indexes**: Supports primary keys, unique constraints, and indexes, but does not support non-clustered indexes.

- **Performance**: Generally faster for small datasets due to reduced overhead and scope constraints. Performance may vary with complex queries or large datasets.

- **Statistics**: No automatic statistics are generated, which might impact performance for large datasets.

### **2. Temporary Tables**

**Temporary tables** are actual tables that are created in the tempdb database and are used to store intermediate results. They can be local or global.

- **Scope**:

  - **Local Temporary Tables (#TempTable)**: Visible only to the session that created them. They are dropped automatically when the session ends.

  - **Global Temporary Tables (##GlobalTempTable)**: Visible to all sessions and are dropped automatically when the last session using them ends.

- **Transaction Logging**: More extensive logging compared to table variables, as they are actual tables in tempdb.

- **Indexes**: Supports a full range of indexes, including clustered and non-clustered indexes.

- **Performance**: Suitable for larger datasets or more complex queries due to the ability to use indexes and gather statistics.

- **Statistics**: Automatic statistics are generated, which can help optimize query performance for larger datasets.

### **Summary**

- **Table Variables**: Best for small datasets and scenarios where the scope is limited to a single batch or procedure. They have less overhead and do not support automatic statistics.

- **Temporary Tables**: Better for larger datasets and complex queries requiring indexing and statistics. They offer more functionality but come with additional overhead and are subject to more extensive logging.

## What is a Common Table Expression (CTE)? Provide an example.

A **Common Table Expression (CTE)** is a temporary result set that is defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE statement. It provides a way to write more readable and manageable SQL queries by breaking them down into simpler, modular components. CTEs are particularly useful for organizing complex queries and recursive operations.

### **Purpose of CTEs**

1.  **Improve Readability**: By breaking down complex queries into simpler, reusable parts, CTEs make SQL code easier to understand and maintain.

2.  **Encapsulation**: CTEs allow you to define a result set that can be referenced multiple times within a query, reducing redundancy.

3.  **Recursive Queries**: CTEs support recursive queries, making it possible to handle hierarchical or tree-structured data, such as organizational charts or directory structures.

### **Example of Using CTE**

#### **1. Simple CTE**

Suppose you have an Employees table and you want to find employees in departments that have more than 10 employees. You can use a CTE to simplify the query:

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

- **What it does**:

  - **CTE Definition**: DepartmentEmployeeCount calculates the number of employees per department.

  - **Main Query**: Joins the Employees table with the CTE to get employees from departments with more than 10 employees.

#### **2. Recursive CTE**

Recursive CTEs are used to handle hierarchical data. For example, if you have an Employees table with a self-referencing ManagerID to indicate reporting relationships, you can use a recursive CTE to retrieve all employees under a specific manager:

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

- **What it does**:

  - **Anchor Member**: Selects the top-level managers (those without a manager).

  - **Recursive Member**: Recursively joins the Employees table with the CTE to find all employees reporting to the current set of employees.

  - **Result**: Provides a hierarchical list of employees under each top-level manager.

### **Summary**

- **Definition**: A CTE is a temporary result set defined within a query, which simplifies complex queries and supports recursive operations.

- **Syntax**: WITH CTE_Name AS (CTE query) SELECT ... FROM CTE_Name ...

- **Usage**:

  - Simplifies complex queries by breaking them into smaller parts.

  - Supports recursive queries for hierarchical data.

  - Improves readability and maintainability of SQL code.

## Explain what a view is and its use cases.

A **view** in SQL is a virtual table that is derived from one or more tables or other views. It does not store the data itself but rather provides a way to present the data in a specific format or structure as defined by the SQL query used to create the view.

### **Creating a View**

The CREATE VIEW statement is used to define a view. The view can be created from a simple SELECT query or a more complex one involving joins, aggregations, and other SQL operations.

### **Example Use Cases**

#### 1. **Simplifying Complex Queries**

Imagine you frequently need to query a table with complex joins and conditions. You can create a view to simplify this process:

```sql
CREATE VIEW EmployeeDetails AS
SELECT e.EmployeeID, e.FirstName, e.LastName, d.DepartmentName, e.Salary
FROM Employees e
JOIN Departments d ON e.DepartmentID = d.DepartmentID
WHERE e.Salary > 50000;
```

- **What it does**: Provides a simplified way to access employee details with a salary greater than 50,000, combining data from Employees and Departments.

#### 2. **Enhancing Security**

Suppose you have a table Employees with sensitive information such as Salary. You can create a view that excludes this column:

```sql
CREATE VIEW EmployeeOverview AS
SELECT EmployeeID, FirstName, LastName, DepartmentID
FROM Employees;
```

- **What it does**: Allows users to access employee information without seeing sensitive salary details.

#### 3. **Providing Data Abstraction**

You can create a view that combines data from multiple tables to present a unified interface:

```sql
CREATE VIEW CustomerOrders AS
SELECT c.CustomerID, c.CustomerName, o.OrderID, o.OrderDate
FROM Customers c
JOIN Orders o ON c.CustomerID = o.CustomerID;
```

- **What it does**: Provides a unified view of customer and order data, simplifying queries that involve both tables.

#### 4. **Facilitating Reporting**

For reporting purposes, you might need a specific subset of data aggregated in a particular way. A view can be created to pre-aggregate this data:

```sql
CREATE VIEW MonthlySalesReport AS
SELECT MONTH(OrderDate) AS SalesMonth, SUM(TotalAmount) AS TotalSales
FROM Sales
GROUP BY MONTH(OrderDate);
```

- **What it does**: Provides a summarized view of sales data by month, making it easier to generate monthly reports.

### **Updating and Using Views**

- **Updating Views**: Some views are updatable, meaning you can perform INSERT, UPDATE, or DELETE operations on them if they are defined in a way that allows it. However, views that involve complex joins, aggregations, or groupings might be non-updatable.

- **Using Views**: Once created, views are used in SQL queries just like tables. You can select from views, join them with other tables or views, and use them in various SQL operations.

## What are indexed(a materialized view) views, and how do they differ from regular views?

### 1. **Indexed Views**

An **indexed view** (also called a **materialized view**) is a view that stores the query results physically on disk using a **clustered index**. This means the data is precomputed and stored, allowing SQL Server to access the data more efficiently. Indexed views can significantly improve performance, especially for complex queries.

#### Example of an Indexed View:

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

- **Execution**: When you query the indexed view, SQL Server retrieves the data directly from the index, which is much faster than dynamically executing the underlying query.

- **Performance**: Indexed views provide performance benefits because the results of the view are stored and indexed. They are especially useful in scenarios involving complex aggregations or frequent joins.

- **Storage**: Unlike regular views, indexed views take up disk space because the data is materialized and stored.

### Key Differences Between Regular Views and Indexed Views

| **Feature** | **Regular Views** | **Indexed Views** |
|----|----|----|
| **Data Storage** | No data is stored; it’s a virtual table. | Data is physically stored and indexed. |
| **Performance** | No direct performance improvement. | Significant performance improvement for complex queries. |
| **Updates** | Always reflects the current state of the underlying tables. | Must be maintained as the base tables change, which incurs additional overhead. |
| **Indexing** | Cannot have indexes directly on the view. | Requires a clustered index on the view. |
| **Use Case** | Simple query shortcuts. | Aggregations, joins, and scenarios where read performance is critical. |
| **Maintenance Overhead** | Low, since it doesn’t store data. | Higher, as changes to base tables require updating the indexed view. |
| **Schema Binding** | Optional. | Mandatory (WITH SCHEMABINDING). |

### Benefits of Indexed Views:

- **Improved Performance**: By storing the precomputed results, SQL Server can quickly retrieve data from the index instead of recalculating it every time.

- **Aggregation Queries**: Indexed views are particularly useful for queries with **aggregations** (e.g., SUM(), COUNT()) or **joins**, as these can be expensive to compute on the fly.

### Drawbacks of Indexed Views:

- **Maintenance Overhead**: Any changes to the underlying tables (such as INSERT, UPDATE, or DELETE operations) require SQL Server to update the indexed view, which can slow down data modification operations.

- **Disk Space**: Since the indexed view stores data, it consumes disk space.

- **Schema Binding Requirement**: Indexed views must be created with the SCHEMABINDING option, meaning you cannot modify the schema of the underlying tables without first dropping the view.

### Use Case Considerations:

- **Regular Views**: Best for situations where you need to simplify complex queries or present a consistent interface to the data, but performance isn’t a primary concern.

- **Indexed Views**: Ideal for situations where complex queries involving aggregations or joins are frequently executed, and performance is critical.

## Can views be updated in SQL Server? If so, how?

Yes, **views can be updated in SQL Server**, but there are some important rules and limitations to keep in mind. The ability to update a view depends on how it is constructed and whether the update can be translated directly to the underlying base tables.

### Simple Updatable Views

For a view to be updatable, it must generally meet these criteria:

- The view must be based on a **single table** or **multiple tables** joined in a way that doesn't break updatability rules.

- It must **not contain any aggregate functions**, like SUM(), COUNT(), MAX(), etc.

- The view **must not contain DISTINCT**, GROUP BY, UNION, or HAVING clauses.

- It **must include all columns required by any constraints** (e.g., NOT NULL columns).

#### Example of an Updatable View:

```sql
CREATE VIEW dbo.EmployeeView AS
SELECT EmployeeID, Name, Salary
FROM Employees;
```

You can perform INSERT, UPDATE, or DELETE operations on this view, and those changes will be reflected in the underlying table (Employees).

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

SQL Server translates these operations into actions on the underlying table (Employees) since the view directly maps to the table’s columns.

### Views That Cannot Be Updated

Certain types of views are **not inherently updatable**:

- Views with **aggregate functions** (e.g., SUM(), AVG(), COUNT()).

- Views with **DISTINCT** or **GROUP BY** clauses.

- Views that include **JOINs** or **UNIONs** where the update operation cannot be applied to all tables involved.

- Views that use **derived columns** (e.g., SELECT column1 + column2 AS Total).

#### Example of a Non-Updatable View:

```sql
CREATE VIEW dbo.SalesSummary AS
SELECT StoreID, SUM(SalesAmount) AS TotalSales
FROM Sales
GROUP BY StoreID;
```

This view is **not updatable** because it contains an aggregate function (SUM()).

## What are stored procedures? How do they differ from functions?

Stored procedures and functions are both types of database objects in SQL Server that encapsulate SQL code for reuse, but they have different characteristics and purposes. Here’s a detailed comparison of the two:

### Stored Procedures

**Definition**: A stored procedure is a precompiled collection of one or more SQL statements that can be executed as a unit. Stored procedures are used to encapsulate logic for various database operations such as querying, inserting, updating, or deleting data.

**Characteristics**:

- **Purpose**: Designed for performing operations on the database. They can include complex business logic, multiple SQL statements, and procedural constructs.

- **Return Type**: Stored procedures do not return a value like a function. Instead, they can return a status code or a result set (e.g., a set of rows from a query).

- **Execution**: Invoked using the EXEC or EXECUTE command.

- **Parameters**: Can accept input parameters and return output parameters or result sets.

- **Side Effects**: Can modify data or perform actions that change the state of the database.

**Syntax**:

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

**Example**:

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

**Usage**:

```sql
EXEC GetEmployeeDetails @EmployeeID = 123;
```

### Functions

**Definition**: A function is a database object that performs a computation and returns a single value or a table. Functions are designed to return a result based on the input parameters and can be used in SQL expressions.

**Characteristics**:

- **Purpose**: Designed for returning values or computing results. They are often used for calculations, data transformations, or simple operations.

- **Return Type**: Functions must return a value or a table. Scalar functions return a single value, while table-valued functions return a table.

- **Execution**: Invoked as part of a SQL statement (e.g., in SELECT, WHERE, or JOIN clauses).

- **Parameters**: Can accept input parameters but cannot return output parameters. The result is typically returned directly.

- **Side Effects**: Functions should not have side effects such as modifying database state or performing non-deterministic operations.

**Example**:

- **Scalar Function**:

**Usage:**

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

- **Table-Valued Function**:

**Usage:**

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

### Differences

1.  **Return Type**:

    - **Stored Procedure**: Can return a result set, status code, or output parameters. Does not directly return a value.

    - **Function**: Must return a value (scalar function) or a table (table-valued function).

2.  **Usage Context**:

    - **Stored Procedure**: Executed using EXEC or EXECUTE statements. Used for performing operations and executing complex logic.

    - **Function**: Used within SQL statements, such as in SELECT, WHERE, and JOIN clauses. Used for computing values or returning data.

3.  **Side Effects**:

    - **Stored Procedure**: Can modify database state, perform transactions, and produce side effects.

    - **Function**: Should be deterministic and free of side effects. Generally used for calculations and data retrieval.

4.  **Parameters**:

    - **Stored Procedure**: Can accept input and output parameters.

    - **Function**: Can only accept input parameters and return a result.

5.  **Transaction Handling**:

    - **Stored Procedure**: Can include transaction control statements (e.g., BEGIN TRANSACTION, COMMIT, ROLLBACK).

    - **Function**: Cannot include transaction control statements or perform operations that affect database state.

### Summary

- **Stored Procedures**: Used for encapsulating complex logic, performing operations, and managing transactions. They can return result sets and status codes.

- **Functions**: Designed for returning computed values or data. They can be used within SQL queries and should not have side effects.

## What is a trigger? Can you give an example of when to use it?

A trigger in SQL Server is a special kind of stored procedure that automatically executes in response to specific events on a table or view. Triggers are used to enforce business rules, maintain data integrity, and automatically perform tasks when data changes.

### Types of Triggers

1.  **AFTER Triggers**

    - **Definition**: Executes after an INSERT, UPDATE, or DELETE operation has been completed on a table or view.

    - **Usage**: Often used for tasks that need to occur only after the data modification is confirmed, such as logging changes, updating related tables, or enforcing business rules that depend on the successful completion of the initial operation.

**Example:**

In this example, the trg_AfterInsert trigger logs details of newly inserted records into an AuditLog table after an INSERT operation.

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

2.  **INSTEAD OF Triggers**

    - **Definition**: Executes instead of the INSERT, UPDATE, or DELETE operation on a table or view.

    - **Usage**: Useful for replacing or modifying the default behavior of data modification operations. For instance, handling complex updates, conditional logic, or managing operations that involve multiple tables.

**Example:**

In this example, the trg_InsteadOfUpdate trigger replaces the default update behavior, directly updating the Employees table with new salary values from the INSERTED table.

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

3.  **DML Triggers**

    - **Definition**: Data Manipulation Language (DML) triggers respond to INSERT, UPDATE, or DELETE operations.

    - **Types**:

      - **AFTER DML Trigger**: Executes after the data modification operation.

      - **INSTEAD OF DML Trigger**: Executes in place of the data modification operation.

**Example of DML Triggers**

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

4.  **DDL Triggers**

    - **Definition**: Data Definition Language (DDL) triggers respond to schema changes, such as CREATE, ALTER, or DROP statements.

    - **Usage**: Used for auditing changes to the database schema, enforcing naming conventions, or preventing certain schema modifications.

**Example:**

In this example, the trg_PreventTableDrop trigger prevents the dropping of tables by rolling back the operation and displaying a message.

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

### Key Points

- **Automatic Execution**: Triggers are automatically invoked by specific database operations and cannot be manually executed like other stored procedures.

- **Pseudo-Tables**: Triggers use special tables called INSERTED and DELETED to access the rows affected by the triggering operation. INSERTED contains the new rows or modified rows, while DELETED contains the old rows or deleted rows.

- **Side Effects**: Triggers should not have side effects that can lead to recursive or unintended behavior. For instance, a trigger that updates a table could potentially invoke another trigger, leading to recursion.

### Summary

- **AFTER Triggers**: Execute after a data modification operation and are used for post-operation tasks.

- **INSTEAD OF Triggers**: Execute in place of the data modification operation and allow for custom behavior.

- **DML Triggers**: Handle INSERT, UPDATE, and DELETE operations on tables and views.

- **DDL Triggers**: Handle changes to the database schema, such as CREATE, ALTER, and DROP.

## what are magic tables

In SQL Server, **magic tables** refer to special tables that are automatically created by the database system when certain events occur, such as triggers. These tables are not directly created by the user but are used internally by SQL Server to facilitate the operation of triggers. They are:

1.  **INSERTED Table**

2.  **DELETED Table**

### **1.** INSERTED **Table**

The INSERTED table holds a copy of the rows that are being inserted or updated in the target table of an INSERT or UPDATE operation. When a trigger is fired in response to an INSERT or UPDATE, SQL Server places the affected rows into the INSERTED table.

#### **Usage Example:**

If you have a table called Employees and you want to create a trigger that logs changes to another table, you would use the INSERTED table to reference the new or updated rows.

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

### **2.** DELETED **Table**

The DELETED table holds a copy of the rows that are being deleted or updated from the target table of a DELETE or UPDATE operation. When a trigger is fired in response to a DELETE or UPDATE, SQL Server places the affected rows into the DELETED table.

#### **Usage Example:**

Continuing with the Employees example, you can use the DELETED table to log information about rows that have been deleted.

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

### **Key Points**

- **Automatic Creation**: INSERTED and DELETED tables are automatically created and managed by SQL Server when a trigger is executed. They are not explicitly created or modified by users.

- **Trigger Context**: These tables provide context for triggers, allowing you to reference the old and new states of rows affected by INSERT, UPDATE, or DELETE operations.

- **Use in Triggers**: They are crucial for writing triggers that need to perform actions based on the changes to the data, such as auditing, logging, or enforcing business rules.

### **Summary**

Magic tables (INSERTED and DELETED) are special, system-generated tables used in SQL Server to support the operation of triggers by holding copies of rows affected by INSERT, UPDATE, and DELETE operations. Understanding these tables is essential for writing effective triggers and managing data changes within SQL Server.

## How do you handle exceptions in SQL Server stored procedures?

Handling exceptions in SQL Server stored procedures is crucial for ensuring that your procedures can gracefully manage errors and provide meaningful feedback. SQL Server provides several mechanisms for exception handling, primarily using TRY...CATCH blocks. Here’s a detailed explanation of how to handle exceptions:

### Using TRY...CATCH Blocks

The TRY...CATCH construct allows you to handle errors that occur during the execution of SQL code. Here's how it works:

1.  **TRY Block**: Contains the SQL statements that might throw an error.

2.  **CATCH Block**: Executes if an error occurs in the TRY block. You can use this block to handle the error, log it, or take corrective actions.

### Syntax

```sql
BEGIN TRY
-- SQL statements that might throw an error
END TRY
BEGIN CATCH
-- Error handling logic
END CATCH
```

### Example

Here’s a simple example of a stored procedure using TRY...CATCH for error handling:

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

### Key Functions in CATCH Block

- **ERROR_NUMBER()**: Returns the error number of the error that caused the CATCH block to execute.

- **ERROR_SEVERITY()**: Returns the severity level of the error.

- **ERROR_STATE()**: Returns the state number of the error.

- **ERROR_MESSAGE()**: Returns the full text of the error message.

- **ERROR_LINE()**: Returns the line number where the error occurred.

### Additional Error Handling Techniques

1.  **Using RAISERROR**: You can use the RAISERROR statement to generate your own error messages and to re-throw caught errors. This can be useful for propagating errors to calling applications or procedures.

```sql
RAISERROR ('An error occurred while executing the procedure.', 16, 1);
```

2.  **Transaction Management**: In conjunction with error handling, you might want to manage transactions. Use BEGIN TRANSACTION, COMMIT, and ROLLBACK statements within TRY...CATCH blocks to ensure transactions are properly handled in case of errors.

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

### Best Practices

- **Error Logging**: Consider implementing an error logging mechanism to capture and store error details for future analysis.

- **Minimal Impact**: Ensure that error handling does not significantly impact performance or cause unnecessary disruptions.

- **Testing**: Thoroughly test error handling paths to ensure that all possible errors are handled gracefully.

### Summary

- **TRY...CATCH Blocks**: Use these to manage and handle errors in SQL Server stored procedures.

- **Error Functions**: Utilize functions like ERROR_NUMBER(), ERROR_MESSAGE(), and ERROR_SEVERITY() to capture error details.

- **RAISERROR**: Generate custom error messages or re-throw errors as needed.

- **Transaction Management**: Manage transactions within error handling blocks to maintain data integrity.

## What is the difference between RAISEERROR and THROW?

RAISEERROR and THROW are both used in SQL Server to handle and report errors, but they have different functionalities and use cases. Here’s a comparison of the two:

### **1.** RAISEERROR

#### **Purpose:**

- Used to generate an error message and send it to the client application. It can also be used to re-throw an error within a CATCH block.

#### **Syntax:**

```sql
RAISERROR (message_string, severity, state, argument1, argument2, ...);
```

- message_string: The error message text.

- severity: The severity level of the error (from 0 to 25).

- state: The state of the error (an integer from 0 to 255).

- argument1, argument2, ...: Optional arguments for formatting the message string.

#### **Features:**

- **Custom Error Messages**: Allows for custom error messages with placeholders for formatting.

- **Severity Levels**: Supports a wide range of severity levels (0 to 25).

- **Re-throwing Errors**: Can be used in a CATCH block to re-throw an existing error.

#### **Example:**

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

#### **Behavior:**

- **Error Handling**: RAISEERROR generates an error message and can halt execution depending on the severity level.

- **Transaction**: If used in a transaction, it will not automatically rollback the transaction unless explicitly done.

### **2.** THROW

#### **Purpose:**

- Introduced in SQL Server 2012, THROW is used to raise an exception in a more simplified and consistent manner. It also re-throws the original exception if used in a CATCH block.

#### **Syntax:**

```sql
THROW [error_number, message, state];
```

- error_number: The error number of the exception (must be a valid SQL Server error number).

- message: The message text for the exception.

- state: The state of the exception (an integer from 0 to 255).

#### **Features:**

- **Simplified Syntax**: Easier to use than RAISEERROR for re-throwing errors.

- **Preserves Error Information**: When re-throwing, THROW preserves the original error information, including the call stack.

- **Automatic Rollback**: Automatically triggers the transaction rollback when used within a transaction scope if not explicitly committed.

#### **Example:**

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

#### **Behavior:**

- **Error Handling**: THROW automatically includes the original error context when re-throwing.

- **Transaction**: Automatically triggers transaction rollback if used inside a transaction.

|     |     |     |
|-----|-----|-----|
|     |     |     |

### **Summary**

- **RAISEERROR**: Provides more control over error message formatting and severity levels. It is suitable for generating custom error messages and handling errors in various ways.

- **THROW**: Offers a simpler and more consistent approach to error handling and re-throwing. It automatically preserves the original error context and simplifies error re-throwing.

In general, use THROW for its simplicity and better error context preservation, and use RAISEERROR when you need custom error messages or specific severity levels.

## What is the purpose of a FILESTREAM in SQL Server?

**FILESTREAM** in SQL Server is a feature that allows you to store large binary data, such as documents, images, and videos, directly in the file system, while still maintaining transactional consistency within the SQL Server database. It integrates the NTFS file system with SQL Server's database engine, allowing unstructured data to be managed alongside structured data.

### Purpose of FILESTREAM

1.  **Efficient Storage of Large Data**: FILESTREAM is ideal for storing large binary objects (BLOBs) such as files, images, and media, which are not suited for regular database storage (like VARBINARY(MAX) columns).

2.  **File System Performance**: By storing large files on the NTFS file system, FILESTREAM provides better performance for operations like streaming large media files, as NTFS is optimized for handling large objects.

3.  **Transactional Consistency**: FILESTREAM ensures that the binary data in the file system is managed in a way that it is consistent with other data stored in the database. SQL Server manages the data so that any INSERT, UPDATE, or DELETE operations on the FILESTREAM column are part of a database transaction.

4.  **SQL Server Backup and Restore**: The FILESTREAM data is included in regular SQL Server backup and restore operations, making it easier to manage the binary data without needing separate backup processes.

### Example Scenario

Imagine a document management system where users upload files (e.g., PDFs, Word documents). Storing these files directly in the database might slow down performance and increase storage costs. FILESTREAM allows the system to store these files in the file system but still have them referenced and managed as part of the database, ensuring transactional integrity.

### How FILESTREAM Works

- A **FILESTREAM column** is defined in a table using the VARBINARY(MAX) data type with the FILESTREAM attribute.

- When a file is inserted into this column, SQL Server stores the file in the file system and a reference to the file in the database table.

- Any access to the data (SELECT, UPDATE, DELETE) can be performed using T-SQL commands, and the underlying file system handles the file operations.

### Example of Creating a FILESTREAM Table

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

### Benefits

- **Improved Performance** for handling large unstructured data.

- **Scalability**: FILESTREAM scales well with large amounts of data.

- **Data Management**: It simplifies the management of BLOBs alongside structured data within SQL Server.

### Limitations

- FILESTREAM data can only be accessed from local SQL Server instances.

## What is table partitioning, and how does it improve performance?

**Table partitioning** in SQL Server is a database optimization technique where a large table is split into smaller, more manageable pieces called **partitions**. Each partition can store data based on a specific range of values, such as date ranges, IDs, or other columns. This division allows SQL Server to process data more efficiently when querying large datasets.

### How Table Partitioning Improves Performance

1.  **Faster Query Processing**: When queries are run on partitioned tables, SQL Server can **scan only the relevant partitions** instead of the entire table. This is called **partition elimination**, and it reduces the amount of data that needs to be read, speeding up query execution.

2.  **Improved Maintenance**: Operations such as index rebuilding, statistics updates, or deleting old data can be done on individual partitions instead of the whole table. This leads to **lower downtime** and faster maintenance tasks.

3.  **Enhanced Data Management**: Partitioning helps in managing data lifecycle better. For example, older data can be moved to slower, cheaper storage without affecting newer, more frequently accessed data.

4.  **Parallel Processing**: SQL Server can distribute the load of queries across different partitions and CPU cores, allowing **parallel execution** of queries, improving overall performance in high-load scenarios.

5.  **Efficient Data Loading**: Large data loads can be faster since new data can be added directly into a specific partition without affecting others.

## How do you create and manage partitioned tables in SQL Server?

Creating and managing partitioned tables in SQL Server involves several steps, including defining a partition function, creating a partition scheme, and then assigning a table to the partition scheme. Here's a breakdown:

### Steps to Create and Manage Partitioned Tables

#### 1. **Create a Partition Function**

A **partition function** defines how the data in a table will be divided. It specifies the column and the boundaries for partitioning.

```sql
CREATE PARTITION FUNCTION MyPartitionFunction (int)
AS RANGE LEFT FOR VALUES (1000, 2000, 3000);
```

- The RANGE LEFT means that values equal to the boundary values (1000, 2000, etc.) will be included in the left partition.

- In this example, we are partitioning based on an integer column with the following partitions:

  - Partition 1: Values less than or equal to 1000.

  - Partition 2: Values greater than 1000 and less than or equal to 2000.

  - Partition 3: Values greater than 2000 and less than or equal to 3000.

  - Partition 4: Values greater than 3000.

#### 2. **Create a Partition Scheme**

A **partition scheme** maps the partitions created by the partition function to filegroups. Filegroups can reside on different disks, allowing for better performance if distributed properly.

```sql
CREATE PARTITION SCHEME MyPartitionScheme
AS PARTITION MyPartitionFunction
TO (FileGroup1, FileGroup2, FileGroup3, FileGroup4);
```

- The TO clause specifies the filegroups where each partition’s data will be stored.

- You can map partitions to different filegroups or place them all in the same filegroup.

#### 3. **Create a Table Using the Partition Scheme**

Now, you can create a table that uses the partition scheme. The table must have a column that corresponds to the partitioning column (in this case, an integer).

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

- The ON MyPartitionScheme(PartitionColumn) specifies that the table is partitioned based on the PartitionColumn using the partition scheme.

#### 4. **Insert Data into the Partitioned Table**

When you insert data into the table, SQL Server will automatically assign rows to the appropriate partition based on the PartitionColumn values.

```sql
INSERT INTO MyPartitionedTable (ID, Name, PartitionColumn)
VALUES (1, 'John Doe', 1500); -- This will go into the second partition
```

#### 5. **Querying Partitioned Tables**

Queries on partitioned tables work the same as on non-partitioned tables. However, SQL Server will use **partition elimination** to scan only the relevant partitions, improving performance.

```sql
SELECT * FROM MyPartitionedTable WHERE PartitionColumn = 1500;
```

SQL Server will scan only the partition that holds values between 1001 and 2000.

#### 6. **Splitting and Merging Partitions**

You can manage partitions by splitting or merging them as your data grows or changes.

- **Splitting a Partition**:

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
SPLIT RANGE (4000); -- Splits at 4000, creating an additional partition
```

- **Merging Partitions**:

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
MERGE RANGE (3000); -- Merges the partition holding 3000 with the next partition
```

#### 7. **Switching Partitions**

You can move data between partitions or tables without physically copying the data using the ALTER TABLE ... SWITCH command.

```sql
ALTER TABLE MyPartitionedTable SWITCH PARTITION 1 TO AnotherTable;
```

This allows efficient data movement without downtime.

#### 8. **Maintaining Partitioned Tables**

- **Rebuilding Indexes**: You can rebuild indexes for a specific partition, reducing maintenance overhead.

```sql
ALTER INDEX ALL ON MyPartitionedTable
REBUILD PARTITION = 2; -- Rebuild only the second partition
```

- **Archiving Data**: Old data in a specific partition can be archived by moving it to another table or database and then truncating that partition.

```sql
ALTER PARTITION FUNCTION MyPartitionFunction()
MERGE RANGE (2000); -- Remove a partition after archiving its data
```

### Key Considerations for Partitioning

- **Partition Key**: Choose a partition key that allows for even distribution of data.

- **Query Patterns**: Partitioning works best when queries can benefit from partition elimination. For example, range queries on the partitioned column.

- **Filegroups**: Distribute partitions across different filegroups to balance I/O operations.

## What is the SQL Server error log, and how do you access it?

The SQL Server error log is a critical component for monitoring and troubleshooting SQL Server instances. It records important events and errors, such as startup and shutdown information, login attempts, execution of database commands, and error messages.

### **Understanding the SQL Server Error Log**

#### **1. Purpose of the Error Log:**

- **Error Tracking**: Records detailed information about errors and warnings encountered by SQL Server.

- **Event Logging**: Captures significant events like database backups, restores, and server start-up or shutdown.

- **Audit Trail**: Provides a historical record of operations and changes to help diagnose issues and ensure compliance.

#### **2. Log File Locations:**

- **Default Location**: By default, SQL Server error logs are stored in the SQL Server log directory. The typical path is:

  - **For SQL Server 2016 and later**: C:\Program Files\Microsoft SQL Server\MSSQLXX.MSSQLSERVER\MSSQL\Log

  - **For older versions**: Similar paths, adjusted for version and instance name.

### **Accessing the SQL Server Error Log**

#### **1. Using SQL Server Management Studio (SSMS):**

- **Access via SSMS:**

  1.  Open SQL Server Management Studio.

  2.  Connect to your SQL Server instance.

  3.  In Object Explorer, expand the Management node.

  4.  Expand the SQL Server Logs node.

  5.  Right-click on Current (or any specific log file) and choose View SQL Server Log to open the error log.

- **View Error Log:**

  - The error log viewer will display recent logs, including messages and errors. You can use filters to search for specific events or error messages.

#### **2. Using T-SQL:**

You can also access SQL Server error logs using T-SQL commands:

- **View Current Error Log:**

```sql
EXEC sp_readerrorlog;
You can also specify the log file number and filter results:
EXEC sp_readerrorlog 0, 1, 'error message';
```

- 0 specifies the current log file.

- 1 specifies the log type (1 = SQL Server error log).

- You can include a search string like 'error message' to filter results.

- **View Previous Error Logs:**

```sql
EXEC sp_readerrorlog 1; -- For the previous log file
Use 2, 3, etc., for older logs.
```

#### **3. Using Windows Event Viewer:**

SQL Server also writes some errors to the Windows Event Log:

- **Access Event Viewer:**

  1.  Open Windows Event Viewer (eventvwr.msc).

  2.  Navigate to Windows Logs > Application.

  3.  Look for events with the source "MSSQLSERVER" or the named instance.

### **Managing SQL Server Error Logs**

#### **1. Error Log Rotation:**

- **Automatic Rotation**: SQL Server automatically rotates error logs, keeping a certain number of logs (default is 6). Older logs are archived and removed.

- **Manual Rotation**: You can manually cycle the error log:

```sql
EXEC sp_cycle_errorlog;
```

#### **2. Configuration:**

- **Log File Configuration**: Configure the number of error logs retained and log file size through SQL Server Management Studio:

  1.  In SSMS, right-click the server instance and select Properties.

  2.  Go to the Advanced page.

  3.  Configure the Error Log settings, including the number of logs to retain.

### **Example Scenario:**

If you encounter an issue where SQL Server is not starting up properly, you might want to review the error log to diagnose the problem:

1.  **Open SSMS** and navigate to Management > SQL Server Logs.

2.  **Review Recent Logs** for any startup errors or issues.

3.  **Use T-SQL** to query specific errors or timestamps:

```sql
EXEC sp_readerrorlog 0, 1, 'startup';
```

### **Summary:**

The SQL Server error log is an essential tool for monitoring, diagnosing, and troubleshooting SQL Server instances. You can access and manage the error logs using SQL Server Management Studio, T-SQL commands, and Windows Event Viewer. Regularly reviewing error logs helps maintain server health and resolve issues efficiently.
