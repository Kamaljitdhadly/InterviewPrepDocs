import fs from 'node:fs';
import path from 'node:path';

const DIRS = [
  path.resolve('full/Sql Server'),
  path.resolve('study/Sql Server'),
];

function fixFile(text, file) {
  let t = text;

  // --- Architecture: align ## headings with TOC ---
  if (file.includes('Architecture and Internals')) {
    t = t.replace(/^## 1\. What is the SQL Server database engine\?/m, '## What is the SQL Server database engine?');
    t = t.replace(/^### 2\. Explain the SQL Server architecture, including the role of the storage engine and query processor\./m,
      '## Explain the SQL Server architecture, including the role of the storage engine and query processor.');
    t = t.replace(/^## 3\. What are data pages, extents, and allocation units in SQL Server\?/m,
      '## What are data pages, extents, and allocation units in SQL Server?');
    t = t.replace(/^## 4\. What is the purpose of the tempdb database\? How is it used internally\?/m,
      '## What is the purpose of the tempdb database? How is it used internally?');
    t = t.replace(/^## 5\. How does SQL Server handle I\/O operations for read and write\?/m,
      '## How does SQL Server handle I/O operations for read and write?');
  }

  // --- Analysis: SSAS heading matches TOC ---
  if (file.includes('Analysis and Reporting')) {
    t = t.replace(
      /^## What is SQL Server Analysis Services \(SSAS\)\?/m,
      '## What is SQL Server Analysis Services (SSAS)(Data Warehouse database)?'
    );
  }

  // --- Backup: promote Q8 section ---
  if (file.includes('Backup and Restore')) {
    t = t.replace(/^### Example for backup and recovery model$/m, '## Example for backup and recovery model? Important');
  }

  // --- Basics: promote join & trigger sections ---
  if (file.endsWith('SQL Server Basics.md')) {
    t = t.replace(/^### What are the different types of joins in SQL Server\?/m,
      '## What are the different types of joins in SQL Server?');
    t = t.replace(/^### What is a trigger\? Different Types of trigger/m,
      '## What is a trigger? Can you give an example of when to use it?');
    // remove stray heading inside code fence if present
    t = t.replace(/```sql\n## What are indexed\(a materialized view\) views[^\n]*\n```\n\n## What are indexed/m,
      '## What are indexed');
  }

  // --- Mirroring: add HA/DR heading ---
  if (file.includes('Mirroring and AlwaysOn')) {
    if (!/^## Difference between High Availability/m.test(t)) {
      t = t.replace(
        /(9\. What is the difference between AlwaysOn Failover Cluster Instances \(FCI\) and AlwaysOn Availability Groups\?\n\n)/,
        '$1## Difference between High Availability (HA) and Disaster Recovery (DR)\n\n'
      );
    }
  }

  // --- Transactions: fix mis-tagged headings ---
  if (file.includes('Transactions and Locking')) {
    // second "Explain different types of lock?" block is actually NOLOCK
    const parts = t.split(/^## Explain different types of lock\?\n/m);
    if (parts.length === 3) {
      t = parts[0] + '## Explain different types of lock?\n' + parts[1] + '## what is no-lock in sql server?\n' + parts[2];
    }
    t = t.replace(/^### What is Non-repeatable read\s*$/m, '## Non-repeatable read ?');
    t = t.replace(/^### Deadlocks in SQL Server$/m, '## What is a deadlock, and how do you prevent it?');
    t = t.replace(/^## What is Phantom Read$/m, '## What is Phantom Read?');
    t = t.replace(/^## Explain isolation levels in SQL Server\.$/m, '## Explain isolation levels in SQL Server?');
  }

  // --- Queries: fix split CTE code fences ---
  if (file.endsWith('SQL Server Queries.md')) {
    t = t.replace(
      /WITH SalaryRank AS \(\n\n```sql\nSELECT Salary, ROW_NUMBER\(\) OVER \(ORDER BY Salary DESC\) AS Rank\nFROM Employees\n\)\nSELECT Salary AS SecondHighestSalary\nFROM SalaryRank\nWHERE Rank = 2;\n```/g,
      '```sql\nWITH SalaryRank AS (\n  SELECT Salary, ROW_NUMBER() OVER (ORDER BY Salary DESC) AS Rank\n  FROM Employees\n)\nSELECT Salary AS SecondHighestSalary\nFROM SalaryRank\nWHERE Rank = 2;\n```'
    );
    t = t.replace(
      /WITH SalaryRank AS \(\n\n```sql\nSELECT Salary, DENSE_RANK\(\) OVER \(ORDER BY Salary DESC\) AS Rank\nFROM Employees\n\)\nSELECT Salary AS SecondHighestSalary\nFROM SalaryRank\nWHERE Rank = 2;\n```/g,
      '```sql\nWITH SalaryRank AS (\n  SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) AS Rank\n  FROM Employees\n)\nSELECT Salary AS SecondHighestSalary\nFROM SalaryRank\nWHERE Rank = 2;\n```'
    );
    // broken subquery example fence
    t = t.replace(
      /```sql\nSELECT Name FROM Employees WHERE DepartmentID = \(SELECT DepartmentID FROM Departments WHERE DepartmentName = 'HR'\);\nUse:\nSELECT e\.Name\nFROM Employees e\nJOIN Departments d ON e\.DepartmentID = d\.DepartmentID\nWHERE d\.DepartmentName = 'HR';\n```/,
      '```sql\nSELECT Name FROM Employees WHERE DepartmentID = (SELECT DepartmentID FROM Departments WHERE DepartmentName = \'HR\');\n```\n\n```sql\nSELECT e.Name\nFROM Employees e\nJOIN Departments d ON e.DepartmentID = d.DepartmentID\nWHERE d.DepartmentName = \'HR\';\n```'
    );
    // NOLOCK example split fence in transactions - handled in transactions file
  }

  // --- Query Optimization: demote numbered scan headings; add Q4 if missing ---
  if (file.includes('Query Optimization Techniques')) {
    t = t.replace(/^## (\d+)\. \*\*(Table Scan|Index Scan|Index Seek)\*\*/gm, '### $2');
    t = t.replace(/^## 1\. What is Statistics in SQL Server\?$/m, '### What is Statistics in SQL Server?');
    if (!/^## How can you determine if an index is being used or not\?/m.test(t)) {
      const insertAfter = '## Explain the difference between table scans, index scans, and index seeks.';
      const q4 = `

## How can you determine if an index is being used or not?

Use a combination of execution plans, DMVs, and I/O statistics:

1. **Actual Execution Plan** (SSMS) — verify **Index Seek** or **Index Scan** on the expected index vs a table scan.
2. **sys.dm_db_index_usage_stats** — \`user_seeks\`, \`user_scans\`, \`user_lookups\`, \`user_updates\` since last restart (reset when index is dropped/recreated).
3. **sys.dm_db_index_operational_stats** — operational-level seeks/scans/lookups.
4. **SET STATISTICS IO ON** — compare logical reads with and without the index.
5. **Query Store** — plan history and regressions after index changes.

\`\`\`sql
SELECT
  OBJECT_NAME(s.object_id) AS TableName,
  i.name AS IndexName,
  s.user_seeks,
  s.user_scans,
  s.user_lookups,
  s.user_updates,
  s.last_user_seek,
  s.last_user_scan
FROM sys.dm_db_index_usage_stats AS s
INNER JOIN sys.indexes AS i
  ON s.object_id = i.object_id AND s.index_id = i.index_id
WHERE OBJECT_NAME(s.object_id) = 'YourTableName';
\`\`\`

If \`user_seeks\` and \`user_scans\` stay at zero while queries filter on indexed columns, the optimizer may be ignoring the index (stale statistics, low selectivity, or implicit conversions).`;
      if (t.includes(insertAfter)) {
        const idx = t.indexOf(insertAfter) + insertAfter.length;
        // insert before next ## if exists
        const nextH = t.indexOf('\n## ', idx);
        if (nextH > idx) {
          t = t.slice(0, nextH) + q4 + t.slice(nextH);
        } else {
          t += q4;
        }
      }
    }
  }

  // --- Transactions: fix broken NOLOCK sql fence ---
  if (file.includes('Transactions and Locking')) {
    t = t.replace(
      /```sql\nSELECT \*\nFROM Orders WITH \(NOLOCK\);\nAlternatively, you can use it within the FROM clause for specific tables:\nSELECT o\.OrderID, o\.CustomerID, o\.OrderDate\nFROM Orders o WITH \(NOLOCK\)\nJOIN Customers c WITH \(NOLOCK\) ON o\.CustomerID = c\.CustomerID\nWHERE o\.OrderDate BETWEEN '2023-01-01' AND '2023-12-31';\n```/,
      '```sql\nSELECT *\nFROM Orders WITH (NOLOCK);\n```\n\n```sql\nSELECT o.OrderID, o.CustomerID, o.OrderDate\nFROM Orders o WITH (NOLOCK)\nJOIN Customers c WITH (NOLOCK) ON o.CustomerID = c.CustomerID\nWHERE o.OrderDate BETWEEN \'2023-01-01\' AND \'2023-12-31\';\n```'
    );
  }

  return t.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

for (const dir of DIRS) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(dir, f);
    const before = fs.readFileSync(p, 'utf8');
    const after = fixFile(before, f);
    if (after !== before) {
      fs.writeFileSync(p, after, 'utf8');
      console.log(`fixed: ${path.basename(dir)}/${f}`);
    }
  }
}

console.log('Done.');
