import fs from 'node:fs';
import path from 'node:path';

const TIGHT_ROOT = path.resolve('study');
const CLEAN_ROOT = path.resolve('full');

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

const topics = fs.readdirSync(TIGHT_ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

let total = 0;
let issues = 0;
let missingTight = 0;
const report = [];

console.log('=== GLOBAL TIGHT AUDIT ===\n');

for (const topic of topics) {
  const cleanDir = path.join(CLEAN_ROOT, topic);
  const tightDir = path.join(TIGHT_ROOT, topic);
  if (!fs.existsSync(cleanDir)) continue;
  const files = fs.readdirSync(cleanDir).filter((f) => f.endsWith('.md')).sort();
  let topicIssues = 0;
  for (const f of files) {
    total++;
    const cleanPath = path.join(cleanDir, f);
    const tightPath = path.join(tightDir, f);
    const clean = fs.readFileSync(cleanPath, 'utf8');
    if (!fs.existsSync(tightPath)) {
      missingTight++;
      topicIssues++;
      issues++;
      report.push({ topic, file: f, flag: 'MISSING TIGHT' });
      continue;
    }
    const tight = fs.readFileSync(tightPath, 'utf8');
    const toc = parseQuestions(clean);
    const tightToc = parseQuestions(tight);
    const cb = extractBlocks(clean);
    const tb = extractBlocks(tight);
    const missing = cb.filter((x) => !tb.some((y) => y === x));
    const pct = clean.length ? ((1 - tight.length / clean.length) * 100).toFixed(1) : '0';
    const flag = missing.length || (toc.length && toc.length !== tightToc.length) ? 'ISSUES' : 'OK';
    if (flag === 'ISSUES') {
      topicIssues++;
      issues++;
      report.push({ topic, file: f, flag, missing: missing.length, toc: `${toc.length}→${tightToc.length}`, pct });
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
console.log(`Issues: ${issues} (${missingTight} missing tight)`);
