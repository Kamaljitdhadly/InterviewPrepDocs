import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/Security');
const TIGHT = path.resolve('_work/tight/Security');

function extractBlocks(text) {
  const b = [];
  const r = /```[\w-]*\r?\n([\s\S]*?)```/g;
  let m;
  while ((m = r.exec(text))) b.push(m[1].trim());
  return b;
}

function parseQuestions(text) {
  const idx = text.indexOf('## Questions Covered');
  if (idx < 0) return [];
  const next = text.indexOf('\n## ', idx + 22);
  const block = next > 0 ? text.slice(idx, next) : text.slice(idx, idx + 8000);
  return block.split('\n').filter((l) => /^\d+\.\s/.test(l));
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== SECURITY TIGHT AUDIT ===\n');
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
  const toc = parseQuestions(clean);
  const tightToc = parseQuestions(tight);
  const missing = extractBlocks(clean).filter((b) => !extractBlocks(tight).some((t) => t === b));
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missing.length || toc.length !== tightToc.length ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC ${toc.length}→${tightToc.length}  blocks ${extractBlocks(clean).length}→${extractBlocks(tight).length}  reduction ${pct}%`);
  if (missing.length) console.log(`     MISSING ${missing.length} code block(s)`);
}
console.log(`\nTotal: ${files.length} files, ${issues} with issues`);
