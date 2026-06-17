# LINQ & Deferred Execution

## Concept Explanation

**LINQ** (Language Integrated Query) provides a uniform query syntax over collections, databases, XML, etc. There are two syntaxes — **method/fluent** (`.Where(...).Select(...)`) and **query** (`from x in xs where ... select ...`) — that compile to the same thing.

The key concept is **deferred (lazy) execution**: most LINQ operators (`Where`, `Select`, `OrderBy`, etc.) don't run when you define the query — they run when you **enumerate** it (`foreach`, `ToList()`, `Count()`, `First()`). This means the query reflects the data's state *at enumeration time* and can be re-evaluated each time you iterate.

## Code Example(s)

```csharp
var numbers = new List<int> { 1, 2, 3, 4, 5 };

// Deferred: nothing runs here, just builds the query
var evens = numbers.Where(n => n % 2 == 0);

numbers.Add(6);          // added BEFORE enumeration
foreach (var n in evens) // executes NOW → sees 6
    Console.Write(n);    // "246"
```

```csharp
// Method syntax vs query syntax (equivalent)
var q1 = numbers.Where(n => n > 2).Select(n => n * 10);
var q2 = from n in numbers where n > 2 select n * 10;

// Common operators
var result = numbers
    .Where(n => n > 1)              // filter
    .OrderByDescending(n => n)      // sort
    .Select(n => n * n)             // project
    .Take(2)                        // limit
    .ToList();                      // FORCE execution → materialize
```

```csharp
// Grouping & aggregation
var words = new[] { "apple", "banana", "avocado", "cherry" };
var byLetter = words
    .GroupBy(w => w[0])
    .Select(g => new { Letter = g.Key, Count = g.Count() });
```

## Interview Q&A

**🟢 What is LINQ?**
A set of language features and methods for querying collections, databases, XML, etc., with a consistent syntax.

**🟡 What is deferred execution?**
The query is not executed when defined, only when enumerated. This allows composition and lazy evaluation, and means the result reflects the source's current state at enumeration.

**🟡 Which operators force immediate execution?**
Materializing/aggregating operators: `ToList()`, `ToArray()`, `ToDictionary()`, `Count()`, `Sum()`, `First()`, `Single()`, `Any()`. They iterate the source right away.

**🟡 Difference between `First()` and `FirstOrDefault()`?**
`First()` throws if no element matches; `FirstOrDefault()` returns the type's default (e.g. `null`/`0`). Same pattern for `Single`/`SingleOrDefault` — but `Single` also throws if there's more than one match.

**🔴 Difference between `IEnumerable<T>` and `IQueryable<T>` in LINQ?**
`IEnumerable<T>` runs LINQ in memory (LINQ-to-Objects), pulling all data first. `IQueryable<T>` builds an expression tree that a provider (e.g. EF Core) translates to SQL, so filtering happens in the database. Mixing them up causes loading whole tables into memory.

## ⚠️ Tricky / Gotchas

- **Multiple enumeration re-runs the query.** Each `foreach`/`Count()`/`ToList()` re-executes deferred operators — and for DB queries, re-hits the database.

```csharp
var query = numbers.Where(n => { Console.Write("!"); return n > 0; });
query.Count();   // runs the predicate
query.ToList();  // runs it AGAIN
// Materialize once with .ToList() if you'll use it multiple times
```

- **Captured variables affect deferred queries.** Modifying a variable used in a `Where` before enumeration changes the result.
- **`Select` is projection, not iteration.** `list.Select(x => DoSomething(x));` does nothing until enumerated — people expect it to execute like `ForEach`. There is no LINQ `ForEach`.
- **`Single()` vs `First()`** — `Single` enumerates further to ensure exactly one match (more expensive); don't use it just to get the first item.
- **N+1 with `IQueryable`**: calling `.ToList()` then looping with more DB queries inside causes many round-trips.

## 📌 Quick Recap

- LINQ = uniform querying; method and query syntax are equivalent.
- Deferred execution → query runs at enumeration, not definition.
- Force execution with `ToList/ToArray/Count/First/Sum/Any`.
- `IEnumerable` = in-memory; `IQueryable` = translated to SQL (filter in DB).
- Beware multiple enumeration (re-runs / re-queries) — materialize once.
- `Select` ≠ execution; there's no LINQ `ForEach`.
