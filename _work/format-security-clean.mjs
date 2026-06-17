import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-generic-clean.mjs';

export { formatFile };

const DIR = path.resolve('_work/clean/Security');

if (import.meta.url.includes('format-security-clean') && process.argv[1]?.includes('format-security-clean')) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const before = fs.readFileSync(p, 'utf8');
    const after = baseFormat(before, f.replace(/\.md$/i, ''));
    fs.writeFileSync(p, after, 'utf8');
    console.log(`${f}: ${before.length} -> ${after.length}`);
  }
}
