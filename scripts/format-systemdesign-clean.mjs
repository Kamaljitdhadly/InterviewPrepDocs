import fs from 'node:fs';
import path from 'node:path';
export { formatFile } from './format-microservices-clean.mjs';
import { formatFile } from './format-microservices-clean.mjs';

const DIR = path.resolve('full/System Design');

if (import.meta.url.includes('format-systemdesign-clean') && process.argv[1]?.includes('format-systemdesign-clean')) {
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
