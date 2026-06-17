# Window Functions (`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `LEAD`/`LAG`)

## Concept Explanation

**Window functions** perform calculations across a set of rows (a "window") **related to the current row**, *without collapsing rows* like `GROUP BY` does. You define the window with `OVER (PARTITION BY ... ORDER BY ...)`.

- **`ROW_NUMBER()`** — unique sequential number per partition (no ties).
- **`RANK()`** — ranking with **gaps** after ties (1,2,2,4).
- **`DENSE_RANK()`** — ranking with **no gaps** after ties (1,2,2,3).
- **`LAG()` / `LEAD()`** — value from the previous / next row (good for trends, differences).
- **Aggregates as windows** — `SUM(...) OVER (...)`, running totals, moving averages.

## Code Example(s)

```sql
-- Ranking employees by salary within each department
SELECT Name, Dept, Salary,
  ROW_NUMBER() OVER (PARTITION BY Dept ORDER BY Salary DESC) AS RowNum,
  RANK()       OVER (PARTITION BY Dept ORDER BY Salary DESC) AS Rnk,
  DENSE_RANK() OVER (PARTITION BY Dept ORDER BY Salary DESC) AS DenseRnk
FROM Employees;
```

```sql
-- Top earner per department (common interview task)
WITH Ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY Dept ORDER BY Salary DESC) AS rn
  FROM Employees
)
SELECT Name, Dept, Salary FROM Ranked WHERE rn = 1;
```

```sql
-- LAG/LEAD: month-over-month change + running total
SELECT Month, Revenue,
  LAG(Revenue) OVER (ORDER BY Month)              AS PrevMonth,
  Revenue - LAG(Revenue) OVER (ORDER BY Month)    AS Change,
  SUM(Revenue) OVER (ORDER BY Month
       ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS RunningTotal
FROM MonthlySales;
```

## Interview Q&A

**🟢 What is a window function?**
A function that computes a value over a set of rows related to the current row, without collapsing those rows into one (unlike `GROUP BY`).

**🟡 Difference between `ROW_NUMBER`, `RANK`, and `DENSE_RANK`?**
For ties: `ROW_NUMBER` assigns unique numbers (arbitrary among ties). `RANK` gives equal rank to ties then skips numbers (1,2,2,4). `DENSE_RANK` gives equal rank with no gaps (1,2,2,3).

**🟡 What does `PARTITION BY` do?**
It divides rows into groups; the window function restarts/recomputes per partition — like `GROUP BY` but without merging rows.

**🟡 How would you get the 2nd highest salary per department?**
Use `DENSE_RANK() OVER (PARTITION BY Dept ORDER BY Salary DESC)` in a CTE, then filter `WHERE rank = 2` (DENSE_RANK handles ties correctly).

**🔴 What are `LAG` and `LEAD` used for?**
Accessing a prior or following row's value within the partition — computing differences, growth rates, gaps between events, or comparing consecutive rows.

## ⚠️ Tricky / Gotchas

- **`ROW_NUMBER` vs `RANK` vs `DENSE_RANK` for "Nth highest"** — pick carefully. To get *distinct* salary values use `DENSE_RANK`; `ROW_NUMBER` would skip duplicate salaries incorrectly.
- **Window functions run AFTER `WHERE`/`GROUP BY`/`HAVING`** but before `ORDER BY`. So you can't filter on a window function in `WHERE` — wrap it in a CTE/subquery and filter outside.

```sql
-- ❌ can't reference rn in WHERE of the same query
-- ✅ use a CTE then filter rn = 1 (see example above)
```

- **`RANK` leaves gaps after ties** — if positions 1,2 tie, the next is 4, not 3. Surprises people expecting consecutive numbers.
- **Forgetting `ORDER BY` inside `OVER`** for ranking gives undefined ordering.
- **Running totals need a frame** (`ROWS BETWEEN ...`); without it, the default frame (`RANGE`) can include unexpected peer rows on ties.

## 📌 Quick Recap

- Window functions compute over related rows without collapsing them (`OVER (PARTITION BY ... ORDER BY ...)`).
- `ROW_NUMBER` = unique; `RANK` = ties + gaps; `DENSE_RANK` = ties, no gaps.
- `LAG`/`LEAD` = previous/next row value (trends, diffs).
- Can't filter window results in `WHERE` — use a CTE/subquery.
- Use `DENSE_RANK` for "Nth distinct" problems; mind frames for running totals.
