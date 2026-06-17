import fs from 'node:fs';
import path from 'node:path';

function sqlBlocks(file) {
  const t = fs.readFileSync(file, 'utf8');
  const re = /```sql\n([\s\S]*?)```/g;
  const b = [];
  let m;
  while ((m = re.exec(t)) !== null) b.push(m[1].trim());
  return b;
}

const files = ['SQL Server Analysis and Reporting.md', 'SQL Server Basics.md', 'SQL Server Queries.md'];
for (const f of files) {
  const c = sqlBlocks(path.join('_work/clean/Sql Server', f));
  const t = sqlBlocks(path.join('_work/tight/Sql Server', f));
  console.log('\n===', f, '===');
  const miss = c.filter((x) => !t.some((y) => y === x));
  const extra = t.filter((x) => !c.some((y) => y === x));
  console.log('clean:', c.length, 'tight:', t.length, 'missing:', miss.length, 'extra:', extra.length);
  miss.forEach((x, i) => console.log('MISS', i + 1, JSON.stringify(x.slice(0, 150))));
  extra.forEach((x, i) => console.log('EXTRA', i + 1, JSON.stringify(x.slice(0, 150))));
}

// heading in fence
const basics = fs.readFileSync('_work/clean/Sql Server/SQL Server Basics.md', 'utf8');
const re = /```[\s\S]*?```/g;
let m;
while ((m = re.exec(basics)) !== null) {
  if (/^##\s/m.test(m[0])) console.log('\nFENCE WITH HEADING:', m[0].slice(0, 200));
}
