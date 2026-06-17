# Stored Procedures, Functions, Triggers & DDL/DML

## Concept Explanation

- **Stored procedure (SP)** — a precompiled batch of T-SQL you call by name. Can have input/output parameters, run DML, control flow, transactions. Doesn't have to return a value.
- **User-defined function (UDF)** — returns a value (scalar) or a table; meant to be used *within* queries. Cannot perform DML on permanent tables or have side effects.
- **Trigger** — special procedure that fires **automatically** in response to `INSERT`/`UPDATE`/`DELETE` (DML triggers) or DDL events. Uses the virtual `inserted` and `deleted` tables.
- **DDL vs DML vs DCL/TCL:** DDL = structure (`CREATE`, `ALTER`, `DROP`, `TRUNCATE`); DML = data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`); TCL = transactions (`COMMIT`, `ROLLBACK`); DCL = permissions (`GRANT`, `REVOKE`).

## Code Example(s)

```sql
-- Stored procedure with input + output
CREATE PROCEDURE GetCustomerStats
    @CustomerId INT,
    @OrderCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT @OrderCount = COUNT(*) FROM Orders WHERE CustomerId = @CustomerId;
    SELECT * FROM Orders WHERE CustomerId = @CustomerId;
END;

DECLARE @cnt INT;
EXEC GetCustomerStats @CustomerId = 42, @OrderCount = @cnt OUTPUT;
```

```sql
-- Scalar function (usable in queries, no side effects)
CREATE FUNCTION dbo.GetFullName(@First NVARCHAR(50), @Last NVARCHAR(50))
RETURNS NVARCHAR(101)
AS
BEGIN
    RETURN @First + ' ' + @Last;
END;
SELECT dbo.GetFullName(FirstName, LastName) FROM Employees;
```

```sql
-- Trigger: audit deletes using the virtual "deleted" table
CREATE TRIGGER trg_Orders_Delete ON Orders
AFTER DELETE
AS
BEGIN
    INSERT INTO OrderAudit (OrderId, DeletedAt)
    SELECT Id, GETDATE() FROM deleted;   -- "deleted" holds removed rows
END;
```

## Interview Q&A

**🟢 What is a stored procedure and what are its benefits?**
A precompiled, reusable set of SQL statements stored in the DB. Benefits: performance (cached plan), security (permissions + parameterization reduce injection), reduced network traffic, and reusability.

**🟢 Difference between `DELETE`, `TRUNCATE`, and `DROP`?**
`DELETE` removes rows (optionally with `WHERE`), is logged per-row, fires triggers, and can be rolled back. `TRUNCATE` removes *all* rows quickly with minimal logging, resets identity, doesn't fire row triggers (but is still transactional in SQL Server). `DROP` removes the entire table (structure + data).

**🟡 Difference between a stored procedure and a function?**
A function must return a value and can be used inside queries but can't perform DML/side effects or transactions. A procedure can perform DML, return result sets, use output parameters and transactions, but can't be called inside a `SELECT`.

**🟡 What are the `inserted` and `deleted` tables in a trigger?**
Virtual tables holding the affected rows: `inserted` has new/updated row values, `deleted` has old/removed values. An UPDATE populates both (old in `deleted`, new in `inserted`).

**🔴 Why are scalar UDFs often a performance problem?**
Traditional scalar UDFs execute row-by-row and can prevent parallelism, hurting performance in large queries. SQL Server 2019+ can inline some scalar UDFs to mitigate this; otherwise prefer inline table-valued functions or set-based logic.

## ⚠️ Tricky / Gotchas

- **`TRUNCATE` vs `DELETE` differences** are a top question: `TRUNCATE` can't use `WHERE`, resets `IDENTITY`, is minimally logged, and won't fire `AFTER DELETE` triggers; `DELETE` is fully logged and fires triggers. Both can be rolled back inside a transaction in SQL Server.
- **Triggers fire per statement, not per row** — `inserted`/`deleted` can contain multiple rows. Writing trigger logic assuming a single row is a classic bug.
- **Scalar UDFs in `WHERE`/`SELECT`** can silently destroy performance (row-by-row, non-SARGable).
- **`SET NOCOUNT ON`** in procedures avoids extra "rows affected" messages that can confuse some clients/ORMs.
- **Triggers add hidden behavior** — they make data changes do unexpected extra work; many teams avoid heavy trigger logic for maintainability.

## 📌 Quick Recap

- SP = precompiled callable batch (DML, transactions, output params); not used in `SELECT`.
- Function = returns scalar/table, usable in queries, no side effects/DML.
- Trigger = auto-fires on INSERT/UPDATE/DELETE; uses `inserted`/`deleted` (multi-row!).
- `DELETE` (rows, logged, triggers, WHERE) vs `TRUNCATE` (all rows, minimal log, resets identity, no row triggers) vs `DROP` (whole table).
- DDL = structure, DML = data, TCL = transactions, DCL = permissions.
- Beware scalar UDF performance and per-statement trigger semantics.
