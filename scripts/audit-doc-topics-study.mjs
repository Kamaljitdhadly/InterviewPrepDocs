import fs from 'node:fs';
import path from 'node:path';

const TOPICS = ['Certificates', 'Git', 'Bash', 'Testing'];

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

function normH2(s) {
  return s
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function h2Missing(clean, tight) {
  const tightKeys = tight.split('\n').filter((l) => l.startsWith('## ')).map((l) => normH2(l.slice(3)));
  return clean.split('\n').filter((l) => l.startsWith('## ')).filter((h) => {
    const k = normH2(h.slice(3));
    return !tightKeys.some((t) => t === k || t.includes(k) || k.includes(t));
  });
}

function countImgs(text) {
  return (text.match(/<img /g) || []).length;
}

console.log('=== DOC TOPICS TIGHT AUDIT ===\n');
let issues = 0;
let total = 0;
for (const topic of TOPICS) {
  const cleanDir = path.resolve('full', topic);
  const tightDir = path.resolve('study', topic);
  const files = fs.readdirSync(cleanDir).filter((f) => f.endsWith('.md')).sort();
  for (const f of files) {
    total++;
    const cleanPath = path.join(cleanDir, f);
    const tightPath = path.join(tightDir, f);
    if (!fs.existsSync(tightPath)) {
      console.log(`MISSING  ${topic}/${f}`);
      issues++;
      continue;
    }
    const clean = fs.readFileSync(cleanPath, 'utf8');
    const tight = fs.readFileSync(tightPath, 'utf8');
    const missingH2 = h2Missing(clean, tight);
    const missingBlocks = blocksMissing(clean, tight);
    const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
    const ci = countImgs(clean);
    const ti = countImgs(tight);
    const flag = missingH2.length || missingBlocks.length || ci !== ti ? 'ISSUES' : 'OK';
    if (flag === 'ISSUES') issues++;
    console.log(`${flag}  ${topic}/${f}`);
    console.log(`     ## ${h2Missing.length ? 'some missing' : 'ok'}  blocks ${extractBlocks(clean).length}→${extractBlocks(tight).length}  imgs ${ci}→${ti}  reduction ${pct}%`);
    missingH2.slice(0, 3).forEach((h) => console.log(`     MISSING H2: ${h}`));
    if (missingH2.length > 3) console.log(`     ... +${missingH2.length - 3} more H2`);
    if (missingBlocks.length) console.log(`     MISSING ${missingBlocks.length} code block(s)`);
    if (ci !== ti) console.log(`     IMAGE COUNT MISMATCH`);
  }
}
console.log(`\nIssues: ${issues}/${total}`);
