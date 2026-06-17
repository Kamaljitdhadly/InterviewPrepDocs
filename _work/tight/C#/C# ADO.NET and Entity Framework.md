# C# ADO.NET and Entity Framework

## Questions Covered

1. What are the main concepts of ADO.NET?
2. What are the examples of ADO.NET?
3. What are the different Execute Methods of ADO.NET?
4. What are the Authentication techniques used to connect to SQL Server?
5. What is ORM? What are the different types of ORM?

## What are the main concepts of ADO.NET?

ADO.NET is Microsoft's .NET data access technology for relational databases and other data sources.

### 1. Data Providers

Handle communication between app and data source:

- **Connection** — open/close DB connection (`SqlConnection`, `OleDbConnection`, `OracleConnection`).
- **Command** — execute SQL or stored procedures (`SqlCommand`, `OleDbCommand`).
- **DataReader** — forward-only, read-only data stream (`SqlDataReader`, `OleDbDataReader`).
- **DataAdapter** — bridge between data source and `DataSet`; fill and update (`SqlDataAdapter`, `OleDbDataAdapter`).

### 2. DataSet and DataTable

- **DataSet** — in-memory container for multiple `DataTable` objects with sorting, filtering, and binding.
- **DataTable** — single in-memory table of rows/columns within a `DataSet`.

### 3. Data Relations

- **DataRelation** — parent-child relationship between two `DataTable` objects in a `DataSet`.

### 4. Data Commands

`SqlCommand`, `OleDbCommand`, `OracleCommand`, etc. — execute queries, stored procedures, and SQL statements.

Supports both connected (`DataReader`) and disconnected (`DataSet`) scenarios.

## What are the examples of ADO.NET?

Query `Employees` from SQL Server `SampleDB` using `SqlDataAdapter` and `DataSet`:

```csharp
using System;
using System.Data;
using System.Data.SqlClient;

class Program
{
    static void Main()
    {
        string connectionString =
            "Server=your_server_name;Database=SampleDB;User Id=your_username;Password=your_password;";
        string query = "SELECT EmployeeID, Name, Position FROM Employees";

        DataSet dataSet = new DataSet();
        using (SqlDataAdapter dataAdapter = new SqlDataAdapter(query, connectionString))
        {
            dataAdapter.Fill(dataSet, "Employees");
        }

        DataTable dataTable = dataSet.Tables["Employees"];
        foreach (DataRow row in dataTable.Rows)
        {
            Console.WriteLine(
                $"EmployeeID: {row["EmployeeID"]}, Name: {row["Name"]}, Position: {row["Position"]}");
        }
    }
}
```

**Flow:** connection string → SQL query → `SqlDataAdapter.Fill` populates `DataSet` → iterate `DataTable` rows.

## What are the different Execute Methods of ADO.NET?

`SqlCommand` (and provider equivalents) expose these execute methods:

### 1. ExecuteNonQuery

Runs INSERT, UPDATE, DELETE, or schema changes. Returns `int` — rows affected.

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

Returns a single value (count, sum, etc.). Return type `object` — cast as needed.

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

Returns `SqlDataReader` — forward-only, read-only cursor for SELECT results.

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
                Console.WriteLine(
                    $"EmployeeID: {reader["EmployeeID"]}, Name: {reader["Name"]}, Position: {reader["Position"]}");
            }
        }
    }
}
```

### 4. ExecuteXmlReader

Returns `XmlReader` for queries producing XML result sets.

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
                Console.WriteLine(xmlReader.ReadOuterXml());
        }
    }
}
```

| Method | Use case | Returns |
|---|---|---|
| `ExecuteNonQuery` | INSERT/UPDATE/DELETE | `int` (rows affected) |
| `ExecuteScalar` | Single aggregate value | `object` |
| `ExecuteReader` | Multi-row SELECT | `SqlDataReader` |
| `ExecuteXmlReader` | XML results | `XmlReader` |

## What are the Authentication techniques used to connect to SQL Server?

### 1. Windows Authentication

Uses Windows credentials via integrated security — SSO, Kerberos support, no separate DB password.

```csharp
string connectionString =
    "Server=your_server_name;Database=your_database_name;Integrated Security=True;";

using (SqlConnection connection = new SqlConnection(connectionString))
{
    connection.Open();
}
```

### 2. SQL Server Authentication

SQL Server-managed username/password — works for non-Windows users and cross-platform clients.

```csharp
string connectionString =
    "Server=your_server_name;Database=your_database_name;User Id=your_username;Password=your_password;";

using (SqlConnection connection = new SqlConnection(connectionString))
{
    connection.Open();
}
```

### Additional modes

- **Mixed Mode** — both Windows and SQL Server auth enabled.
- **Azure SQL** — SQL auth or **Azure Active Directory** (MFA, centralized identity).

```csharp
// Azure SQL Authentication
string connectionString =
    "Server=tcp:your_server.database.windows.net,1433;Database=your_database_name;User ID=your_username@your_server;Password=your_password;Encrypt=True;Connection Timeout=30;";

// Azure AD Authentication
string connectionString =
    "Server=tcp:your_server.database.windows.net,1433;Database=your_database_name;Authentication=Active Directory Integrated;";
```

## What is ORM? What are the different types of ORM?

**ORM (Object-Relational Mapping)** maps database tables to application objects, abstracting SQL and enabling object-oriented data access.

**Benefits:** higher-level abstraction; less boilerplate; easier refactoring; database independence.

### 1. Entity Framework (EF)

Microsoft's full-featured .NET ORM — Code First, Database First, and Model First approaches.

```csharp
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

### 2. Dapper

Lightweight micro-ORM — raw SQL with high-performance object mapping.

```csharp
using (var connection = new SqlConnection(connectionString))
{
    string query = "SELECT EmployeeID, Name, Position FROM Employees WHERE EmployeeID = @Id";
    var employee = connection.QuerySingle<Employee>(query, new { Id = 1 });
    Console.WriteLine($"{employee.Name} - {employee.Position}");
}
```

**Summary:** EF = comprehensive ORM with multiple modeling approaches; Dapper = minimal, fast SQL-to-object mapper.
