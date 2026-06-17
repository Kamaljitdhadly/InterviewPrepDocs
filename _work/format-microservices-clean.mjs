import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-angular-clean.mjs';
import { dedupeMarkdown } from './dedupe-markdown.mjs';

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  return stripBold(s).replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
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

function matchesQuestion(heading, question) {
  const h = normKey(heading);
  const q = normKey(question);
  if (h === q) return true;
  const strip = (s) => s.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const hs = normKey(strip(heading));
  const qs = normKey(strip(question));
  if (hs === qs) return true;
  return qs.startsWith(hs) || hs.startsWith(qs);
}

/** Promote ### 1. Question / **1. Question** style to ## when in TOC */
function promoteQuestionHeadings(text) {
  const questions = parseQuestions(text);
  if (!questions.length) return text;
  const qKeys = questions.map(normKey);

  const lines = text.split('\n');
  const out = [];
  for (const line of lines) {
    const h3 = line.match(/^###\s+(\d+)\.\s+(.*)$/);
    if (h3) {
      const idx = parseInt(h3[1], 10) - 1;
      if (questions[idx]) {
        out.push(`## ${questions[idx]}`);
        continue;
      }
      if (qKeys.some((k) => matchesQuestion(h3[2], questions.find((q) => normKey(q) === k) ?? h3[2]))) {
        const q = questions.find((qq) => matchesQuestion(h3[2], qq));
        if (q) { out.push(`## ${q}`); continue; }
      }
    }
    const bold = line.trim();
    const boldM = bold.match(/^\*\*(\d+)\.\s+([^*]+)\*\*$/);
    if (boldM) {
      const idx = parseInt(boldM[1], 10) - 1;
      if (questions[idx]) {
        out.push(`## ${questions[idx]}`);
        continue;
      }
    }
    if (/^\*\*[^*]+\*\*$/.test(bold) && !bold.match(/^\*\*\d+\./)) {
      const inner = stripBold(bold);
      const q = questions.find((qq) => matchesQuestion(inner, qq));
      if (q) { out.push(`## ${q}`); continue; }
    }
    out.push(line);
  }
  return out.join('\n');
}

export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  t = promoteQuestionHeadings(t);
  t = dedupeMarkdown(t);
  return t;
}

const DIR = path.resolve('_work/clean/Microservices');

if (import.meta.url.includes('format-microservices-clean') && process.argv[1]?.includes('format-microservices-clean')) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const before = fs.readFileSync(p, 'utf8');
    const baseName = f.replace(/\.md$/i, '');
    const after = formatFile(before, baseName);
    fs.writeFileSync(p, after, 'utf8');
    console.log(`${f}: ${before.length} -> ${after.length}`);
  }
}
