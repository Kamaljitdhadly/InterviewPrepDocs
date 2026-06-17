import fs from 'node:fs';
import path from 'node:path';

const TOPICS = ['Certificates', 'Git', 'Bash', 'Testing'];

console.log('=== DOC TOPICS AUDIT ===\n');
let total = 0;
for (const topic of TOPICS) {
  const dir = path.resolve('_work/clean', topic);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  console.log(`--- ${topic} (${files.length} files) ---`);
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    const h1 = text.match(/^# .+/m)?.[0] ?? '(no title)';
    const h2 = (text.match(/^## /gm) || []).length;
    const fences = Math.floor((text.match(/```/g) || []).length / 2);
    const imgs = (text.match(/<img /g) || []).length;
    const copy = (text.match(/Copy code/g) || []).length;
    const flag = copy ? 'WARN' : 'OK';
    console.log(`  ${flag}  ${f}  ${h1.slice(0,40)}  ##=${h2}  fences=${fences}  imgs=${imgs}  chars=${text.length}`);
    total++;
  }
}
console.log(`\nTotal: ${total} files`);
