import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/TypeScript');
const TIGHT = path.resolve('study/TypeScript');

function extractBlocks(text) {
  const b = [];
  const r = /```[\w]*\n([\s\S]*?)```/g;
  let m;
  while ((m = r.exec(text))) b.push(m[1].trim());
  return b;
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== TYPESCRIPT TIGHT AUDIT ===\n');
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const tight = fs.readFileSync(path.join(TIGHT, f), 'utf8');
  const missing = extractBlocks(clean).filter((b) => !extractBlocks(tight).some((t) => t === b));
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  console.log(`${missing.length ? 'ISSUES' : 'OK'}  ${f}  blocks missing=${missing.length}  reduction ${pct}%`);
}
