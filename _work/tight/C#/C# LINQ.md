# C# LINQ

## Questions Covered

1. What is the difference between LINQ to SQL and Entity Framework?
2. What is the difference between First and FirstOrDefault methods in LINQ?
3. Differences Between IEnumerable and IQueryable in C#?

## What is the difference between LINQ to SQL and Entity Framework?

**LINQ (Language Integrated Query)** provides a unified, strongly typed query syntax in C# for arrays, collections, databases, XML, and more. Queries use deferred execution — they run when results are enumerated.

**Key features:** declarative syntax · compile-time type checking · consistent API across data sources · deferred execution

### LINQ flavors

| Type | Data source | Example |
|------|-------------|---------|
| LINQ to Objects | In-memory collections | `from num in numbers where num % 2 == 0 select num` |
| LINQ to SQL | Relational DB via `DataContext` | `from c in context.Customers where c.IsActive select c` |
| LINQ to Entities (EF) | EF `DbContext` models | `context.Orders.Where(o => o.OrderDate > cutoff).ToList()` |
| LINQ to XML | XML documents | `from person in root.Elements("Person") ...` |

```csharp
// LINQ to Objects
int[] numbers = { 1, 2, 3, 4, 5 };
var evenNumbers = from num in numbers where num % 2 == 0 select num;

// LINQ to SQL / EF (syntax similar; provider differs)
using (var context = new MyDbContext())
{
    var customers = from c in context.Customers where c.IsActive select c;
    var orders = context.Orders
        .Where(o => o.OrderDate > DateTime.Now.AddDays(-30))
        .ToList();
}
```

### LINQ to SQL vs Entity Framework

| Aspect | LINQ to SQL | Entity Framework |
|--------|-------------|------------------|
| Scope | SQL Server only | Multiple DB providers |
| ORM model | 1:1 table-to-class mapping | Full ORM — entities, relationships, inheritance |
| Status | Legacy (maintenance mode) | Active, recommended |
| Features | Basic CRUD + LINQ queries | Migrations, change tracking, lazy/eager loading, complex mappings |
| Use case | Simple SQL Server apps | Enterprise apps, complex domain models |

**When to use LINQ:** simplify data access · improve readability · consistent syntax across sources · compile-time safety · efficient in-memory filtering/sorting.

```csharp
List<Employee> employees = new List<Employee>
{
    new Employee { Name = "Alice", Age = 30 },
    new Employee { Name = "Bob", Age = 25 },
    new Employee { Name = "Charlie", Age = 35 }
};

var youngEmployees = from e in employees
                     where e.Age < 30
                     orderby e.Name
                     select e;

foreach (var employee in youngEmployees)
    Console.WriteLine($"{employee.Name}, Age: {employee.Age}");
```

## What is the difference between First and FirstOrDefault methods in LINQ?

Both return the first element matching a predicate (or first element if no predicate).

| | **First** | **FirstOrDefault** |
|---|-----------|-------------------|
| No match | Throws `InvalidOperationException` | Returns default (`null`, `0`, `false`, etc.) |
| Use when | Match is guaranteed or exception is acceptable | Match may be absent; handle gracefully |

```csharp
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };

int firstEven = numbers.First(num => num % 2 == 0);
Console.WriteLine(firstEven); // 2

int firstGreaterThanFive = numbers.First(num => num > 5); // InvalidOperationException

int firstEvenSafe = numbers.FirstOrDefault(num => num % 2 == 0);
Console.WriteLine(firstEvenSafe); // 2

int none = numbers.FirstOrDefault(num => num > 5);
Console.WriteLine(none); // 0
```

## Differences Between IEnumerable and IQueryable in C#?

Both enumerate data, but differ in where and when queries execute.

| Feature | **IEnumerable** | **IQueryable** |
|---------|-----------------|----------------|
| Namespace | `System.Collections` | `System.Linq` |
| Data source | In-memory (List, Array) | Remote (database via EF, LINQ to SQL) |
| Execution | In-memory after data is loaded | Deferred; translated to SQL at enumeration |
| LINQ provider | LINQ to Objects | LINQ to Entities / LINQ to SQL |
| Performance | Loads all data then filters | Pushes filter to data source |

**IEnumerable** — forward-only cursor over in-memory collections. LINQ runs client-side.

```csharp
List<int> numbers = new List<int> { 1, 2, 3, 4, 5 };
IEnumerable<int> result = numbers.Where(x => x > 3); // Filter in memory
```

**IQueryable** — extends `IEnumerable`; expression trees enable provider translation (e.g., SQL).

```csharp
IQueryable<Employee> employees = dbContext.Employees;
var result = employees.Where(e => e.Salary > 5000);
// Translates to: SELECT * FROM Employees WHERE Salary > 5000
```

### Practical comparison

**IEnumerable (inefficient for large DB datasets):**

```csharp
List<Employee> employees = dbContext.Employees.ToList(); // All rows loaded
IEnumerable<Employee> result = employees.Where(e => e.Salary > 5000); // Filter in memory
```

**IQueryable (efficient — filter on server):**

```csharp
IQueryable<Employee> query = dbContext.Employees;
var result = query.Where(e => e.Salary > 5000); // SQL executed at enumeration
foreach (var emp in result)
    Console.WriteLine($"{emp.Name} - {emp.Salary}");
```

**Rule of thumb:** `IQueryable` for database queries (filter before materializing); `IEnumerable` for in-memory collections or after you've intentionally loaded data.
