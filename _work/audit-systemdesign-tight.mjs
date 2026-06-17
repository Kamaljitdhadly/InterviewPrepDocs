import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/System Design');
const TIGHT = path.resolve('_work/tight/System Design');

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

function countFences(text) {
  return (text.match(/```/g) || []).length / 2;
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== SYSTEM DESIGN TIGHT AUDIT ===\n');
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
  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  const fenceDrop = countFences(clean) - countFences(tight);
  const flag = missing.length || fenceDrop > 0 ? 'ISSUES' : 'OK';
  if (flag === 'ISSUES') issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC=${toc.length}  ##=${headings.length}  fences ${countFences(clean)}→${countFences(tight)}  reduction ${pct}%`);
  missing.forEach((m) => console.log(`     MISSING: ${m}`));
  if (fenceDrop > 0) console.log(`     DROPPED ${fenceDrop} code fence(s)`);
}
console.log(`\nIssues: ${issues}/${files.length}`);
