import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/Data Structures and Algorithms');
const TIGHT = path.resolve('_work/tight/Data Structures and Algorithms');

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\([^)]*\)/g, '')
    .replace(/\*\*/g, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[.?:]+$/, '');
}

function matchesQuestion(h, q) {
  const a = normKey(h);
  const b = normKey(q);
  return a === b || b.startsWith(a) || a.startsWith(b);
}

function parseQuestions(text) {
  const lines = text.split('\n');
  const questions = [];
  let inToc = false;
  for (const line of lines) {
    if (line.trim() === '## Questions Covered') { inToc = true; continue; }
    if (inToc) {
      const m = line.match(/^\d+\.\s+(.*)$/);
      if (m) questions.push(stripBold(m[1]));
      else if (line.trim() === '') continue;
      else inToc = false;
    }
  }
  return questions;
}

function parseAnswerHeadings(text) {
  return text.split('\n').filter((l) => l.startsWith('## ') && !l.startsWith('## Questions')).map((l) => stripBold(l.slice(3)));
}

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

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== DSA TIGHT AUDIT ===\n');
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
  const headings = parseAnswerHeadings(tight);
  const missing = toc.filter((q) => !headings.some((h) => matchesQuestion(h, q)));
  const missingBlocks = blocksMissing(clean, tight);
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const flag = missing.length || missingBlocks.length ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC=${toc.length}  ##=${headings.length}  blocks ${extractBlocks(clean).length}→${extractBlocks(tight).length}  reduction ${pct}%`);
  missing.forEach((m) => console.log(`     MISSING Q: ${m}`));
  if (missingBlocks.length) console.log(`     MISSING ${missingBlocks.length} code block(s)`);
}
console.log(`\nIssues: ${issues}/${files.length}`);
