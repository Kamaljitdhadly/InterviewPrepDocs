# C# ADO.NET and Entity Framework

## Questions Covered

1. What are the main concepts of ADO.NET?
2. What are the examples of ADO.NET?
3. What are the different Execute Methods of ADO.NET?
4. What are the Authentication techniques used to connect to SQL Server?
5. What is ORM? What are the different types of ORM?

What are the main concepts of ADO.NET?

ADO.NET is a data access technology from Microsoft that provides a way to interact with relational databases and other data sources. It is part of the .NET Framework and provides a set of components for building data-driven applications. The main components of ADO.NET are:

### 1. Data Providers

Data providers are components that handle communication between the application and the data source. Each data provider consists of several key components:

- **Connection**: Represents a connection to a specific data source. It is used to open and close connections to the database.

  - **Example**: SqlConnection for SQL Server, OleDbConnection for OLE DB sources, OracleConnection for Oracle databases.

- **Command**: Represents a SQL command or stored procedure to execute against the data source. It is used to execute queries and commands.

  - **Example**: SqlCommand for SQL Server, OleDbCommand for OLE DB sources.

- **DataReader**: Provides a forward-only, read-only stream of data from the data source. It is used to retrieve data efficiently.

  - **Example**: SqlDataReader for SQL Server, OleDbDataReader for OLE DB sources.

- **DataAdapter**: Acts as a bridge between the data source and the DataSet. It is used to fill the DataSet with data and update the data source with changes.

  - **Example**: SqlDataAdapter for SQL Server, OleDbDataAdapter for OLE DB sources.

### 2. DataSet and DataTable

- **DataSet**: An in-memory representation of data that can hold multiple DataTable objects. It allows for complex data manipulation and relationships between tables.

  - **Example**: DataSet can be used to store data from multiple tables and perform operations like sorting, filtering, and data binding.

- **DataTable**: Represents a single table of in-memory data within a DataSet. It can be used to store and manipulate rows and columns of data.

  - **Example**: DataTable is used to represent data in tabular form within a DataSet.

### 3. Data Relations

- **DataRelation**: Represents a relationship between two DataTable objects within a DataSet. It is used to define and manage parent-child relationships between tables.

  - **Example**: DataRelation allows you to create a relationship between a parent table and a child table, which helps in navigating and managing hierarchical data.

### 4. Data Commands

Data commands include SqlCommand, OleDbCommand, OracleCommand, and other command classes that are used to execute queries, stored procedures, and SQL statements against the data source.

### Summary of Main Components

1.  **Data Providers**:

    - **Connection**: Manages the connection to the data source.

    - **Command**: Executes SQL queries and commands.

    - **DataReader**: Provides a forward-only stream of data.

    - **DataAdapter**: Fills a DataSet and updates the data source.

2.  **DataSet**:

    - **DataSet**: An in-memory data structure that can contain multiple tables.

    - **DataTable**: Represents a table of data within a DataSet.

    - **DataRelation**: Manages relationships between DataTable objects.

ADO.NET provides a rich set of components for accessing, manipulating, and managing data in .NET applications. It supports a variety of data sources and is designed to work with both connected and disconnected data scenarios.

What are the examples of ADO.NET?

Sure! Here’s a basic example demonstrating the use of ADO.NET components to interact with a SQL Server database. This example includes connecting to the database, executing a query, and working with a DataSet and DataTable.

### Example: Using ADO.NET to Query a SQL Server Database

**Scenario**: You want to connect to a SQL Server database, execute a query to retrieve data from a table, and display the results.

**Assumptions**:

- You have a SQL Server database named SampleDB.

- There is a table named Employees with columns EmployeeID, Name, and Position.

**Code**:

```csharp
using System;
using System.Data;
using System.Data.SqlClient;
class Program
{
static void Main()
{
// Connection string (modify with your database details)
string connectionString = "Server=your_server_name;Database=SampleDB;User Id=your_username;Password=your_password;";
// SQL query to retrieve data
string query = "SELECT EmployeeID, Name, Position FROM Employees";
// Create a DataSet and DataTable
DataSet dataSet = new DataSet();
// Use SqlDataAdapter to fill the DataSet
using (SqlDataAdapter dataAdapter = new SqlDataAdapter(query, connectionString))
{
// Fill the DataSet with data
dataAdapter.Fill(dataSet, "Employees");
}
// Access the DataTable from the DataSet
DataTable dataTable = dataSet.Tables["Employees"];
// Display the data
foreach (DataRow row in dataTable.Rows)
{
Console.WriteLine($"EmployeeID: {row["EmployeeID"]}, Name: {row["Name"]}, Position: {row["Position"]}");
}
}
}
```

### Explanation

1.  **Connection String**:

    - Contains details for connecting to the SQL Server database, including server name, database name, and credentials.

2.  **SQL Query**:

    - The query variable contains a SQL statement to select data from the Employees table.

3.  **DataSet and DataTable**:

    - DataSet is used to hold one or more DataTable objects. In this case, we are using it to hold the data retrieved from the database.

    - DataTable represents a single table of data within the DataSet. We use it to store the results of our query.

4.  **SqlDataAdapter**:

    - SqlDataAdapter is used to fill the DataSet with data from the database. It acts as a bridge between the database and the DataSet.

5.  **Fill Method**:

    - The Fill method of SqlDataAdapter populates the DataSet with the results of the query. The second argument specifies the name of the DataTable within the DataSet.

6.  **Display Data**:

    - Iterate over the rows of the DataTable and print each row’s data to the console.

What are the different Execute Methods of ADO.NET?

In ADO.NET, there are several methods provided by the SqlCommand class (and other command classes for different data providers) for executing SQL commands and stored procedures against a database. Here are the main Execute methods:

### 1. ExecuteNonQuery

**Purpose**: Executes a SQL statement that does not return any data. It is used for commands that perform database operations such as INSERT, UPDATE, DELETE, or schema modifications.

**Return Type**: int - The number of rows affected by the command.

**Example**:

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
string commandText = "UPDATE Employees SET Position = 'Manager' WHERE EmployeeID = 1";
using (SqlCommand command = new SqlCommand(commandText, connection))
{
connection.Open();
int rowsAffected = command.ExecuteNonQuery();
Console.WriteLine($"{rowsAffected} rows updated.");
}
}
```

### 2. ExecuteScalar

**Purpose**: Executes a SQL query that returns a single value (a single cell of data). It is typically used for queries that return a single aggregate value, such as a count or a sum.

**Return Type**: object - The result of the query, which needs to be cast to the appropriate type.

**Example**:

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
string commandText = "SELECT COUNT(*) FROM Employees";
using (SqlCommand command = new SqlCommand(commandText, connection))
{
connection.Open();
int count = (int)command.ExecuteScalar();
Console.WriteLine($"Total employees: {count}");
}
}
```

### 3. ExecuteReader

**Purpose**: Executes a SQL query that returns a SqlDataReader object. It is used for queries that return multiple rows and columns, such as SELECT queries.

**Return Type**: SqlDataReader - A forward-only, read-only cursor that allows you to read through the result set.

**Example**:

csharp

Copy code

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
string commandText = "SELECT EmployeeID, Name, Position FROM Employees";
using (SqlCommand command = new SqlCommand(commandText, connection))
{
connection.Open();
using (SqlDataReader reader = command.ExecuteReader())
{
while (reader.Read())
{
Console.WriteLine($"EmployeeID: {reader["EmployeeID"]}, Name: {reader["Name"]}, Position: {reader["Position"]}");
}
}
}
}
```

### 4. ExecuteXmlReader

**Purpose**: Executes a SQL query that returns XML data. It is used when the query returns an XML result set.

**Return Type**: XmlReader - Provides a forward-only, read-only cursor for XML data.

**Example**:

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
string commandText = "SELECT EmployeeData FROM EmployeesXml WHERE EmployeeID = 1";
using (SqlCommand command = new SqlCommand(commandText, connection))
{
connection.Open();
using (XmlReader xmlReader = command.ExecuteXmlReader())
{
while (xmlReader.Read())
{
Console.WriteLine(xmlReader.ReadOuterXml());
}
}
}
}
```

### Summary of Execute Methods

- **ExecuteNonQuery**: Used for executing commands that do not return any data (e.g., INSERT, UPDATE, DELETE).

- **ExecuteScalar**: Used for executing commands that return a single value.

- **ExecuteReader**: Used for executing commands that return multiple rows and columns (e.g., SELECT queries).

- **ExecuteXmlReader**: Used for executing commands that return XML data.

Each of these methods is designed to handle different types of operations and return different types of results. Choosing the appropriate method depends on the nature of the SQL command and the type of result you expect to receive.

What are the Authentication techniques used to connect to SQL Server?

When connecting to SQL Server, authentication is crucial to ensure secure access to the database. SQL Server supports two primary authentication modes:

### 1. Windows Authentication

**Description**: Uses the Windows operating system's security to authenticate users. It relies on the user’s Windows credentials (username and password) and leverages the Windows operating system to manage user access.

**Advantages**:

- **Integrated Security**: Simplifies management by using existing Windows credentials, avoiding the need for separate database passwords.

- **Kerberos Support**: Provides support for Kerberos authentication, which enhances security in networked environments.

- **Single Sign-On (SSO)**: Users can use their Windows credentials to access SQL Server without needing to enter additional credentials.

**Example Connection String**:

```csharp
string connectionString = "Server=your_server_name;Database=your_database_name;Integrated Security=True;";
```

**Example Code**:

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
connection.Open();
// Perform database operations
}
```

### 2. SQL Server Authentication

**Description**: Uses a SQL Server-specific username and password to authenticate users. SQL Server manages these credentials independently of the Windows operating system.

**Advantages**:

- **Flexibility**: Allows connections from users who may not have Windows accounts or when connecting from non-Windows platforms.

- **Isolated Security**: SQL Server manages its own authentication and does not rely on the Windows security model.

**Example Connection String**:

```csharp
string connectionString = "Server=your_server_name;Database=your_database_name;User Id=your_username;Password=your_password;";
```

**Example Code**:

```csharp
using (SqlConnection connection = new SqlConnection(connectionString))
{
connection.Open();
// Perform database operations
}
```

### Additional Authentication Considerations

- **Mixed Mode Authentication**: SQL Server can be configured to support both Windows Authentication and SQL Server Authentication. This is known as Mixed Mode Authentication. It allows for greater flexibility in environments where both types of authentication are required.

- **Azure SQL Database Authentication**: For Azure SQL Database, you can use:

  - **SQL Authentication**: Similar to SQL Server Authentication, using SQL Server credentials.

  - **Azure Active Directory Authentication**: Uses Azure AD identities to authenticate, providing additional features like multi-factor authentication and centralized identity management.

**Azure SQL Authentication Example**:

```csharp
string connectionString = "Server=tcp:your_server.database.windows.net,1433;Database=your_database_name;User ID=your_username@your_server;Password=your_password;Encrypt=True;Connection Timeout=30;";
```

**Azure Active Directory Authentication Example**:

```csharp
string connectionString = "Server=tcp:your_server.database.windows.net,1433;Database=your_database_name;Authentication=Active Directory Integrated;";
```

### Summary

- **Windows Authentication**: Uses Windows credentials and integrates with the Windows security model.

- **SQL Server Authentication**: Uses SQL Server-specific credentials.

- **Mixed Mode Authentication**: Supports both Windows and SQL Server Authentication.

- **Azure SQL Authentication**: Supports SQL Authentication and Azure Active Directory Authentication.

What is ORM? What are the different types of ORM?

**ORM (Object-Relational Mapping)** is a programming technique used to interact with a relational database by mapping database tables to objects in an application. ORM simplifies data manipulation by allowing developers to work with database records as objects, abstracting the complexities of SQL queries and data access.

### Key Benefits of ORM

- **Abstraction**: Provides a higher-level abstraction over raw SQL, allowing developers to interact with the database using object-oriented principles.

- **Productivity**: Reduces the amount of boilerplate code needed for data access and manipulation.

- **Maintainability**: Makes it easier to maintain and refactor data access code.

- **Database Independence**: Facilitates switching between different database systems with minimal changes to code.

### Different Types of ORM

1.  **Entity Framework (EF)**

```csharp
**Description**: Entity Framework is a popular ORM framework developed by Microsoft for .NET applications. It supports both Code First and Database First approaches, allowing developers to work with data using C# classes.
**Features**:
```

- **Code First**: Allows developers to define the database schema using C# classes and code.

- **Database First**: Generates C# classes based on an existing database schema.

- **Model First**: Allows developers to create a visual model and generate the database schema from it.

```csharp
**Example**:
public class Employee
{
public int EmployeeID { get; set; }
public string Name { get; set; }
public string Position { get; set; }
}
public class MyContext : DbContext
{
public DbSet<Employee> Employees { get; set; }
}
using (var context = new MyContext())
{
var employee = new Employee { Name = "John Doe", Position = "Developer" };
context.Employees.Add(employee);
context.SaveChanges();
}
```

2.  **Dapper**

```csharp
**Description**: Dapper is a lightweight and fast micro-ORM for .NET. It provides a simple API for querying and mapping database results to objects, focusing on performance and simplicity.
**Features**:
```

- **Performance**: Known for high performance due to its minimalistic design.

- **Flexibility**: Allows writing raw SQL queries and mapping results to objects.

```csharp
**Example**:
using (var connection = new SqlConnection(connectionString))
{
string query = "SELECT EmployeeID, Name, Position FROM Employees WHERE EmployeeID = @Id";
var employee = connection.QuerySingle<Employee>(query, new { Id = 1 });
Console.WriteLine($"{employee.Name} - {employee.Position}");
}
```

### Summary

- **Entity Framework (EF)**: Comprehensive ORM with support for Code First, Database First, and Model First approaches.

- **Dapper**: Lightweight micro-ORM focused on performance and simplicity.
