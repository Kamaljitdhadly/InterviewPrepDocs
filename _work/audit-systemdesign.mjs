import fs from 'node:fs';
import path from 'node:path';

const CLEAN = path.resolve('_work/clean/System Design');

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

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== SYSTEM DESIGN AUDIT ===\n');
let issues = 0;
for (const f of files) {
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const toc = parseQuestions(clean);
  const headings = parseAnswerHeadings(clean);
  const missing = toc.filter((q) => !headings.some((h) => matchesQuestion(h, q)));
  const flag = missing.length ? 'ISSUES' : 'OK';
  if (missing.length) issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC=${toc.length}  ##answers=${headings.length}`);
  missing.forEach((m) => console.log(`     MISSING: ${m}`));
}
console.log(`\nIssues: ${issues}/${files.length}`);
