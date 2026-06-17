import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/Important Concepts');

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== IMPORTANT CONCEPTS AUDIT ===\n');
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const h1 = clean.match(/^# .+/m)?.[0] ?? '(no title)';
  const h2 = (clean.match(/^## /gm) || []).length;
  const h3 = (clean.match(/^### /gm) || []).length;
  const fences = (clean.match(/```/g) || []).length / 2;
  console.log(`OK  ${f}`);
  console.log(`     ${h1}  ##=${h2}  ###=${h3}  fences=${fences}  chars=${clean.length}`);
}
console.log(`\nTotal: ${files.length} files`);
