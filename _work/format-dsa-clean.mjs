import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-microservices-clean.mjs';

/** Source docs often repeat a generic bold title; prefer filename. */
export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  if (fileBaseName) {
    t = t.replace(/^# .+\n/, `# ${fileBaseName}\n`);
  }
  return t;
}

const DIR = path.resolve('_work/clean/Data Structures and Algorithms');

if (import.meta.url.includes('format-dsa-clean') && process.argv[1]?.includes('format-dsa-clean')) {
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
