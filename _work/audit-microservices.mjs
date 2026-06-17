import fs from 'node:fs';
import path from 'node:path';

const MD = path.resolve('_work/md/Microservices');
const CLEAN = path.resolve('_work/clean/Microservices');

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  const strip = (x) => x.replace(/\([^)]*\)/g, '').replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
  return strip(s);
}

function matchesQuestion(heading, question) {
  const h = normKey(heading);
  const q = normKey(question);
  if (h === q) return true;
  return q.startsWith(h) || h.startsWith(q);
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

function norm(s) {
  return s.toLowerCase().replace(/`/g, '').replace(/[*_#>]/g, '').replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
console.log('=== MICROSERVICES AUDIT ===\n');
let issues = 0;
for (const f of files) {
  const md = fs.readFileSync(path.join(MD, f), 'utf8');
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const toc = parseQuestions(clean);
  const headings = parseAnswerHeadings(clean);
  const missing = toc.filter((q) => !headings.some((h) => matchesQuestion(h, q)));
  const pct = ((1 - clean.length / md.length) * 100).toFixed(1);
  const flag = missing.length ? 'ISSUES' : 'OK';
  if (missing.length) issues++;
  console.log(`${flag}  ${f}`);
  console.log(`     TOC=${toc.length}  ##answers=${headings.length}  md->clean ${pct}%`);
  if (missing.length) missing.forEach((m) => console.log(`     MISSING: ${m}`));
}

// cross-file sentence dupes
const sentMap = new Map();
for (const f of files) {
  const text = fs.readFileSync(path.join(CLEAN, f), 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const s of text.split(/(?<=[.!?])\s+/)) {
    const n = norm(s);
    if (n.length < 60) continue;
    if (!sentMap.has(n)) sentMap.set(n, new Set());
    sentMap.get(n).add(f);
  }
}
const cross = [...sentMap.entries()].filter(([, set]) => set.size > 1).sort((a, b) => b[1].size - a[1].size);
console.log(`\n=== Cross-file duplicate sentences (>=60 chars): ${cross.length} ===`);
for (const [n, set] of cross.slice(0, 12)) {
  console.log(`\n[${set.size} files] ${n.slice(0, 100)}...`);
  console.log('  ' + [...set].join(' | '));
}
console.log(`\nStructure issues: ${issues}/${files.length}`);
