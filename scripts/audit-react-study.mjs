import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('full/React');
const TIGHT = path.resolve('study/React');

function extractBlocks(text) {
  const blocks = [];
  const re = /```[\w]*\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text))) blocks.push(m[1].trim());
  return blocks;
}

function parseQuestions(text) {
  const sec = text.match(/## Questions Covered\n\n([\s\S]*?)\n\n## /);
  if (!sec) return [];
  return sec[1].split('\n').filter((l) => /^\d+\.\s/.test(l)).map((l) => l.replace(/^\d+\.\s+/, '').trim());
}

function parseAnswerHeadings(text) {
  const afterToc = text.split(/## Questions Covered\n\n[\s\S]*?\n\n/)[1] ?? '';
  return afterToc.split('\n').filter((l) => l.startsWith('## ')).map((l) => l.slice(3).trim());
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== REACT TIGHT AUDIT ===\n');
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
  const headings = parseAnswerHeadings(tight);
  const cleanBlocks = extractBlocks(clean);
  const tightBlocks = extractBlocks(tight);
  const missing = cleanBlocks.filter((b) => !tightBlocks.some((t) => t === b));
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missing.length || toc.length !== tightToc.length || headings.length < toc.length ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC ${toc.length}→${tightToc.length}  ## ${headings.length}  blocks ${cleanBlocks.length}→${tightBlocks.length}  reduction ${pct}%`);
  if (missing.length) console.log(`     MISSING ${missing.length} code block(s)`);
  if (toc.length !== tightToc.length) console.log(`     TOC count mismatch`);
}
console.log(`\nTotal: ${files.length} file(s), ${issues} with issues`);
