# Entity Framework Core

## Concept Explanation

**EF Core** is an **ORM** (Object-Relational Mapper): you work with C# objects and LINQ, and EF translates that into SQL. Core pieces:

- **`DbContext`** — a unit of work + session with the database; exposes `DbSet<T>` per entity.
- **Change tracking** — the context tracks entities it loads and detects modifications so `SaveChanges()` knows what `INSERT`/`UPDATE`/`DELETE` to emit.
- **Migrations** — version-controlled schema changes generated from your model.
- **Loading strategies** — eager (`Include`), explicit, and lazy loading for related data.

## Code Example(s)

```csharp
public class AppDbContext : DbContext
{
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<Post> Posts => Set<Post>();
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts) { }
}
```

```csharp
// Eager loading with Include avoids N+1
var blogs = await db.Blogs
    .Include(b => b.Posts)            // JOIN posts in one query
    .Where(b => b.IsPublished)
    .ToListAsync();

// Tracking vs no-tracking
var readOnly = await db.Blogs.AsNoTracking().ToListAsync(); // faster for read-only

// Insert/update/delete via change tracking
var blog = new Blog { Name = "EF" };
db.Blogs.Add(blog);
await db.SaveChangesAsync();          // INSERT
blog.Name = "EF Core";                // tracked change
await db.SaveChangesAsync();          // UPDATE
```

```bash
# Migrations (CLI)
dotnet ef migrations add InitialCreate
dotnet ef database update
```

## Interview Q&A

**🟢 What is EF Core?**
An object-relational mapper that lets you query and persist data using C# objects and LINQ instead of writing raw SQL.

**🟡 What is change tracking?**
The DbContext records the state of loaded entities (Added/Modified/Deleted/Unchanged). On `SaveChanges`, it generates the appropriate SQL for the detected changes.

**🟡 Difference between eager, lazy, and explicit loading?**
Eager: load related data upfront with `Include`. Lazy: related data loads automatically when the navigation property is accessed (requires proxies). Explicit: load on demand via `context.Entry(x).Collection(...).Load()`.

**🟡 What is `AsNoTracking` and when do you use it?**
It disables change tracking for a query, improving performance and memory for read-only scenarios where you won't update the returned entities.

**🔴 What is the N+1 query problem and how do you fix it?**
When you load N parent rows and then trigger a separate query per parent for its children (often via lazy loading in a loop), you get N+1 round-trips. Fix with eager loading (`Include`) or a projection that joins in a single query.

## ⚠️ Tricky / Gotchas

- **N+1 via lazy loading in a loop** is the classic perf killer:

```csharp
var blogs = db.Blogs.ToList();             // 1 query
foreach (var b in blogs)
    Console.WriteLine(b.Posts.Count);      // +1 query EACH (lazy) → N+1
// Fix: db.Blogs.Include(b => b.Posts).ToList();
```

- **`IEnumerable` vs `IQueryable`**: calling `.AsEnumerable()` / `.ToList()` too early pulls the whole table into memory, then filters in C#. Keep filtering on `IQueryable` so it runs in SQL.

```csharp
db.Orders.Where(o => o.Total > 100);                 // ✅ filters in DB
db.Orders.ToList().Where(o => o.Total > 100);        // ❌ loads ALL rows first
```

- **DbContext is not thread-safe** and should be **scoped** (one per request). Don't share it across threads/`Task.WhenAll` parallel queries.
- **Client-side evaluation**: methods EF can't translate to SQL may throw or silently evaluate in memory (older versions). Keep `Where`/`Select` translatable.
- **Tracking the same entity twice** can throw; use `AsNoTracking` or detach.

## 📌 Quick Recap

- EF Core = ORM; `DbContext` + `DbSet<T>`, LINQ → SQL.
- Change tracking → `SaveChanges` emits INSERT/UPDATE/DELETE.
- Loading: eager (`Include`), lazy (proxies), explicit (`.Load()`).
- `AsNoTracking` for read-only speed; `DbContext` is scoped & not thread-safe.
- Avoid N+1 (use `Include`); keep filtering on `IQueryable` so it runs in the DB.
- Schema via migrations (`add` / `database update`).
