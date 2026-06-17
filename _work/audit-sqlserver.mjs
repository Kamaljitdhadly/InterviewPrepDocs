import fs from 'node:fs';
import path from 'node:path';

const MD = path.resolve('_work/md/Sql Server');
const CLEAN = path.resolve('_work/clean/Sql Server');
const TIGHT = path.resolve('_work/tight/Sql Server');

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  return stripBold(s).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
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
  const lines = text.split('\n');
  const headings = [];
  for (const line of lines) {
    if (line.startsWith('## ') && !line.startsWith('## Questions')) {
      headings.push(stripBold(line.slice(3)));
    }
  }
  return headings;
}

function countCodeBlocks(text) {
  const matches = text.match(/```[\s\S]*?```/g) || [];
  return matches.length;
}

function extractSqlBlocks(text) {
  const re = /```sql\n([\s\S]*?)```/g;
  const blocks = [];
  let m;
  while ((m = re.exec(text)) !== null) blocks.push(m[1].trim());
  return blocks;
}

function headingInCodeFence(text) {
  const re = /```[\s\S]*?```/g;
  let m;
  const issues = [];
  while ((m = re.exec(text)) !== null) {
    if (/^##\s/m.test(m[0])) issues.push(m[0].slice(0, 80).replace(/\n/g, ' '));
  }
  return issues;
}

function duplicateHeadings(headings) {
  const seen = new Map();
  const dups = [];
  for (const h of headings) {
    const k = normKey(h);
    if (seen.has(k)) dups.push(h);
    else seen.set(k, true);
  }
  return dups;
}

function missingFromToc(toc, headings) {
  const hKeys = new Set(headings.map(normKey));
  return toc.filter((q) => !hKeys.has(normKey(q)));
}

function extraHeadings(toc, headings) {
  const tKeys = new Set(toc.map(normKey));
  return headings.filter((h) => !tKeys.has(normKey(h)));
}

function countNumberedQuestionsInMd(text) {
  const lines = text.split('\n');
  let count = 0;
  for (const line of lines) {
    if (/^\d+\.\s+/.test(line.trim()) && line.length < 200) count++;
  }
  return count;
}

const files = fs.readdirSync(CLEAN).filter((f) => f.endsWith('.md')).sort();
const report = { issues: [], summary: [] };

for (const f of files) {
  const mdRaw = fs.readFileSync(path.join(MD, f), 'utf8');
  const clean = fs.readFileSync(path.join(CLEAN, f), 'utf8');
  const tight = fs.readFileSync(path.join(TIGHT, f), 'utf8');

  const cleanToc = parseQuestions(clean);
  const tightToc = parseQuestions(tight);
  const cleanHeadings = parseAnswerHeadings(clean);
  const tightHeadings = parseAnswerHeadings(tight);

  const fileIssues = [];

  if (!cleanToc.length) fileIssues.push('CLEAN: missing ## Questions Covered');
  if (!tightToc.length) fileIssues.push('TIGHT: missing ## Questions Covered');

  if (cleanToc.length !== tightToc.length) {
    fileIssues.push(`TOC count mismatch: clean=${cleanToc.length} tight=${tightToc.length}`);
  } else {
    for (let i = 0; i < cleanToc.length; i++) {
      if (normKey(cleanToc[i]) !== normKey(tightToc[i])) {
        fileIssues.push(`TOC Q${i + 1} text differs`);
        break;
      }
    }
  }

  const cleanMissing = missingFromToc(cleanToc, cleanHeadings);
  const tightMissing = missingFromToc(tightToc, tightHeadings);
  if (cleanMissing.length) fileIssues.push(`CLEAN missing ## answers: ${cleanMissing.length} — ${cleanMissing.slice(0, 2).join(' | ')}`);
  if (tightMissing.length) fileIssues.push(`TIGHT missing ## answers: ${tightMissing.length} — ${tightMissing.slice(0, 2).join(' | ')}`);

  const cleanDups = duplicateHeadings(cleanHeadings);
  const tightDups = duplicateHeadings(tightHeadings);
  if (cleanDups.length) fileIssues.push(`CLEAN duplicate ## headings: ${cleanDups.join(' | ')}`);
  if (tightDups.length) fileIssues.push(`TIGHT duplicate ## headings: ${tightDups.join(' | ')}`);

  const cleanFenceHeadings = headingInCodeFence(clean);
  const tightFenceHeadings = headingInCodeFence(tight);
  if (cleanFenceHeadings.length) fileIssues.push(`CLEAN heading inside code fence`);
  if (tightFenceHeadings.length) fileIssues.push(`TIGHT heading inside code fence`);

  const cleanBlocks = countCodeBlocks(clean);
  const tightBlocks = countCodeBlocks(tight);
  if (tightBlocks < cleanBlocks) {
    fileIssues.push(`Code fence count dropped: clean=${cleanBlocks} tight=${tightBlocks}`);
  }

  const cleanSql = extractSqlBlocks(clean);
  const tightSql = extractSqlBlocks(tight);
  const missingSql = cleanSql.filter((b) => !tightSql.some((t) => t === b));
  if (missingSql.length) {
    fileIssues.push(`TIGHT missing ${missingSql.length} sql block(s) from clean`);
  }

  const mdNumQs = countNumberedQuestionsInMd(mdRaw.split(/\n\s*\n/)[0] ? mdRaw : mdRaw);
  // rough md question count from numbered list at start
  let mdQs = 0;
  const paras = mdRaw.split(/\n\s*\n/);
  for (const p of paras) {
    if (/^\s*\d+\.\s+/.test(p)) mdQs++;
    else if (mdQs > 0 && !/^\s*\d+\.\s+/.test(p) && p.trim() && !p.startsWith('>')) break;
  }
  if (cleanToc.length && mdQs && Math.abs(cleanToc.length - mdQs) > 2) {
    fileIssues.push(`MD numbered Q count (~${mdQs}) vs clean TOC (${cleanToc.length})`);
  }

  const pct = ((1 - tight.length / clean.length) * 100).toFixed(1);
  report.summary.push({ file: f, toc: cleanToc.length, cleanH: cleanHeadings.length, tightH: tightHeadings.length, sqlClean: cleanSql.length, sqlTight: tightSql.length, reduction: pct + '%', ok: !fileIssues.length });
  if (fileIssues.length) report.issues.push({ file: f, issues: fileIssues });
}

console.log('=== SQL SERVER AUDIT ===\n');
for (const s of report.summary) {
  const flag = s.ok ? 'OK' : 'ISSUES';
  console.log(`${flag}  ${s.file}`);
  console.log(`     TOC=${s.toc}  clean##=${s.cleanH}  tight##=${s.tightH}  sql=${s.sqlClean}→${s.sqlTight}  reduction=${s.reduction}`);
}
console.log('\n=== ISSUES ===\n');
if (!report.issues.length) console.log('None found.');
else {
  for (const { file, issues } of report.issues) {
    console.log(file);
    for (const i of issues) console.log('  -', i);
    console.log('');
  }
}
