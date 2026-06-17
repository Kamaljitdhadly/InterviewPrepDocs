import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-angular-clean.mjs';
import { dedupeMarkdown } from './dedupe-markdown.mjs';

function fixCopyCodeFences(text) {
  return text.replace(/```\w*\n(\w+)\nCopy code\n([\s\S]*?)```/g, '```$1\n$2```');
}

function fixImagePaths(text) {
  return text.replace(/_work\\md\\Azure Cloud\\media/g, '_work/md/Azure Cloud/media');
}

function promoteNumberedSections(text) {
  if (text.includes('## Questions Covered')) return text;
  return text.split('\n').map((line) => {
    if (/^###\s+\d+\.\s+/.test(line)) return line.replace(/^###/, '##');
    return line;
  }).join('\n');
}

function unwrapNonCommandFences(text) {
  return text.replace(/```bash\n([\s\S]*?)```/g, (match, body) => {
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.some((l) => /^az\s/i.test(l))) return match;
    if (lines.some((l) => /^(loginRedirect|Get-Az|Connect-Az|New-Az)/i.test(l))) {
      return '```typescript\n' + body.trim() + '\n```';
    }
    return lines.join('\n\n');
  });
}

export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  t = fixCopyCodeFences(t);
  t = fixImagePaths(t);
  t = unwrapNonCommandFences(t);
  t = promoteNumberedSections(t);
  t = dedupeMarkdown(t);
  return t;
}

const DIR = path.resolve('_work/clean/Azure Cloud');

if (import.meta.url.includes('format-azurecloud-clean') && process.argv[1]?.includes('format-azurecloud-clean')) {
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
