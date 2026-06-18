import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/Azure DevOps');

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== AZURE DEVOPS AUDIT ===\n');
for (const f of files) {
  const text = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const h1 = text.match(/^# .+/m)?.[0] ?? '(no title)';
  const h2 = (text.match(/^## /gm) || []).length;
  const fences = Math.floor((text.match(/```/g) || []).length / 2);
  console.log(`OK  ${f}`);
  console.log(`     ${h1}  ##=${h2}  fences=${fences}  chars=${text.length}`);
}
const src = fs.readdirSync(path.resolve('docx/Azure DevOps')).filter((f) => f.endsWith('.docx'));
const empty = src.filter((f) => fs.statSync(path.join('docx/Azure DevOps', f)).size === 0);
if (empty.length) console.log(`\nNote: empty source docx skipped: ${empty.join(', ')}`);
console.log(`\nTotal: ${files.length} md files`);
