import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/Azure Cloud');

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== AZURE CLOUD AUDIT ===\n');
let imgTotal = 0;
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const h1 = clean.match(/^# .+/m)?.[0] ?? '(no title)';
  const h2 = (clean.match(/^## /gm) || []).length;
  const fences = Math.floor((clean.match(/```/g) || []).length / 2);
  const imgs = (clean.match(/<img /g) || []).length;
  imgTotal += imgs;
  console.log(`OK  ${f}`);
  console.log(`     ${h1}  ##=${h2}  fences=${fences}  images=${imgs}  chars=${clean.length}`);
}
console.log(`\nTotal: ${files.length} files, ${imgTotal} images`);
