import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/Azure DevOps');
const TIGHT = path.resolve('_work/tight/Azure DevOps');

function extractBlocks(text) {
  const blocks = [];
  const re = /```[\w]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) blocks.push(m[1].trim());
  return blocks;
}

function countFences(text) {
  return Math.floor((text.match(/```/g) || []).length / 2);
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== AZURE DEVOPS TIGHT AUDIT ===\n');
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const tightPath = path.join(TIGHT, f);
  if (!fs.existsSync(tightPath)) {
    console.log(`MISSING  ${f}`);
    continue;
  }
  const tight = fs.readFileSync(tightPath, 'utf8');
  const cleanBlocks = extractBlocks(clean);
  const tightBlocks = extractBlocks(tight);
  const missing = cleanBlocks.filter((b) => !tightBlocks.some((t) => t === b));
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missing.length || countFences(tight) < countFences(clean) ? 'ISSUES' : 'OK';
  console.log(`${flag}  ${f}`);
  console.log(`     blocks ${cleanBlocks.length}→${tightBlocks.length}  fences ${countFences(clean)}→${countFences(tight)}  reduction ${pct}%`);
  if (missing.length) console.log(`     MISSING ${missing.length} code block(s)`);
}
const empty = fs.readdirSync(path.resolve('docx/Azure DevOps'))
  .filter((f) => f.endsWith('.docx') && fs.statSync(path.join('docx/Azure DevOps', f)).size === 0);
if (empty.length) console.log(`\nNote: empty source docx skipped: ${empty.join(', ')}`);
console.log(`\nTotal: ${files.length} file(s)`);
