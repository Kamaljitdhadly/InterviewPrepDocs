import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-angular-clean.mjs';
import { dedupeMarkdown } from './dedupe-markdown.mjs';

/** Fix pandoc "lang\\nCopy code\\n" fence artifacts from Word exports */
function fixCopyCodeFences(text) {
  return text.replace(/```\w*\n(\w+)\nCopy code\n([\s\S]*?)```/g, '```$1\n$2```');
}

/** Rejoin words broken across list items (e.g. "This c" / "- ould") */
function fixBrokenHyphenation(text) {
  return text.replace(/(\w) c\n\n- (\w+)/g, '$1 c$2');
}

/** Promote numbered ### sections to ## when file has no Q&A TOC */
function promoteNumberedSections(text) {
  if (text.includes('## Questions Covered')) return text;
  return text.split('\n').map((line) => {
    if (/^###\s+\d+\.\s+/.test(line)) return line.replace(/^###/, '##');
    return line;
  }).join('\n');
}

export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  t = fixCopyCodeFences(t);
  t = fixBrokenHyphenation(t);
  t = promoteNumberedSections(t);
  t = dedupeMarkdown(t);
  return t;
}

const DIR = path.resolve('_work/clean/Important Concepts');

if (import.meta.url.includes('format-importantconcepts-clean') && process.argv[1]?.includes('format-importantconcepts-clean')) {
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
