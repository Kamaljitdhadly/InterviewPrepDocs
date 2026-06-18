import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-javascript-clean.mjs';

export { formatFile };

const DIR = path.resolve('full/MongoDB');

if (import.meta.url.includes('format-mongodb-clean') && process.argv[1]?.includes('format-mongodb-clean')) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const before = fs.readFileSync(p, 'utf8');
    const after = baseFormat(before, f.replace(/\.md$/i, ''));
    fs.writeFileSync(p, after, 'utf8');
    console.log(`${f}: ${before.length} -> ${after.length}`);
  }
}
