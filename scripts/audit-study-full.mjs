import fs from 'node:fs';
import path from 'node:path';

const STUDY_ROOT = path.resolve('study');
const FULL_ROOT = path.resolve('full');

function extractBlocks(text) {
  const b = [];
  const r = /```[\w]*\n([\s\S]*?)```/g;
  let m;
  while ((m = r.exec(text))) b.push(m[1].trim());
  return b;
}

function parseQuestions(text) {
  const sec = text.match(/## Questions Covered\n\n([\s\S]*?)\n\n## /);
  if (!sec) return [];
  return sec[1].split('\n').filter((l) => /^\d+\.\s/.test(l));
}

const topics = fs.readdirSync(STUDY_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let total = 0;
let issues = 0;
let missingStudy = 0;
const report = [];

console.log('=== STUDY vs FULL AUDIT ===\n');

for (const topic of topics) {
  const fullDir = path.join(FULL_ROOT, topic);
  const studyDir = path.join(STUDY_ROOT, topic);
  if (!fs.existsSync(fullDir)) continue;
  const files = fs.readdirSync(fullDir).filter((f) => f.endsWith('.md')).sort();
  let topicIssues = 0;
  for (const f of files) {
    total++;
    const fullPath = path.join(fullDir, f);
    const studyPath = path.join(studyDir, f);
    const full = fs.readFileSync(fullPath, 'utf8');
    if (!fs.existsSync(studyPath)) {
      missingStudy++;
      topicIssues++;
      issues++;
      report.push({ topic, file: f, flag: 'MISSING STUDY' });
      continue;
    }
    const study = fs.readFileSync(studyPath, 'utf8');
    const toc = parseQuestions(full);
    const studyToc = parseQuestions(study);
    const cb = extractBlocks(full);
    const tb = extractBlocks(study);
    const missing = cb.filter((x) => !tb.some((y) => y === x));
    const pct = full.length ? ((1 - study.length / full.length) * 100).toFixed(1) : '0';
    const flag = missing.length || (toc.length && toc.length !== studyToc.length) ? 'ISSUES' : 'OK';
    if (flag === 'ISSUES') {
      topicIssues++;
      issues++;
      report.push({ topic, file: f, flag, missing: missing.length, toc: `${toc.length}→${studyToc.length}`, pct });
    }
  }
  const status = topicIssues ? `${topicIssues} issue(s)` : 'OK';
  console.log(`${topic.padEnd(32)} ${String(files.length).padStart(3)} files  ${status}`);
}

console.log(`\n--- Details (${report.length} items) ---`);
for (const r of report.slice(0, 40)) {
  console.log(`${r.flag.padEnd(12)} ${r.topic}/${r.file}${r.missing ? ` (${r.missing} blocks)` : ''}${r.toc ? ` TOC ${r.toc}` : ''}`);
}
if (report.length > 40) console.log(`... +${report.length - 40} more`);

console.log(`\nTotal: ${total} files across ${topics.length} topics`);
console.log(`Issues: ${issues} (${missingStudy} missing study file)`);
