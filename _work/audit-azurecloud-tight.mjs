import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/Azure Cloud');
const TIGHT = path.resolve('_work/tight/Azure Cloud');

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

function countImgs(text) {
  return (text.match(/<img /g) || []).length;
}

function normH2(s) {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function h2Headings(text) {
  return text.split('\n').filter((l) => l.startsWith('## '));
}

function h2Missing(clean, tight) {
  const tightKeys = h2Headings(tight).map((h) => normH2(h.slice(3)));
  return h2Headings(clean).filter((h) => {
    const k = normH2(h.slice(3));
    return !tightKeys.some((t) => t === k || t.includes(k) || k.includes(t));
  });
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== AZURE CLOUD TIGHT AUDIT ===\n');
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
  const missingH2 = h2Missing(clean, tight);
  const missingBlocks = blocksMissing(clean, tight);
  const cleanImgs = countImgs(clean);
  const tightImgs = countImgs(tight);
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missingH2.length || missingBlocks.length || cleanImgs !== tightImgs ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     ## ${cleanH2.length}→${tightH2.length}  blocks ${extractBlocks(clean).length}→${extractBlocks(tight).length}  images ${cleanImgs}→${tightImgs}  reduction ${pct}%`);
  missingH2.forEach((h) => console.log(`     MISSING H2: ${h}`));
  if (missingBlocks.length) console.log(`     MISSING ${missingBlocks.length} code block(s)`);
  if (cleanImgs !== tightImgs) console.log(`     IMAGE COUNT MISMATCH`);
}
console.log(`\nIssues: ${issues}/${files.length}`);
