import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/Important Concepts');
const TIGHT = path.resolve('study/Important Concepts');

function extractBlocks(text) {
  const re = /```[\w]*\n([\s\S]*?)```/g;
  const b = [];
  let m;
  while ((m = re.exec(text)) !== null) b.push(m[1].trim());
  return b;
}

function blocksMissing(clean, tight) {
  const c = extractBlocks(clean);
  const t = extractBlocks(tight);
  return c.filter((x) => !t.some((y) => y === x || y.includes(x) || x.includes(y)));
}

function h2Headings(text) {
  return text.split('\n').filter((l) => l.startsWith('## '));
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== IMPORTANT CONCEPTS TIGHT AUDIT ===\n');
let issues = 0;
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const tightPath = path.join(TIGHT, f);
  if (!fs.existsSync(tightPath)) {
    console.log(`MISSING  ${f}`);
    issues++;
    continue;
  }
  const tight = fs.readFileSync(tightPath, 'utf8');
  const cleanH2 = h2Headings(clean);
  const tightH2 = h2Headings(tight);
  const missingH2 = cleanH2.filter((h) => !tightH2.includes(h));
  const missingBlocks = blocksMissing(clean, tight);
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missingH2.length || missingBlocks.length ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     ## ${cleanH2.length}→${tightH2.length}  blocks ${extractBlocks(clean).length}→${extractBlocks(tight).length}  reduction ${pct}%`);
  missingH2.forEach((h) => console.log(`     MISSING H2: ${h}`));
  if (missingBlocks.length) console.log(`     MISSING ${missingBlocks.length} code block(s)`);
}
console.log(`\nIssues: ${issues}/${files.length}`);
