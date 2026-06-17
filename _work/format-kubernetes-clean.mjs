import fs from 'node:fs';
import path from 'node:path';
export { formatFile } from './format-microservices-clean.mjs';
import { formatFile } from './format-microservices-clean.mjs';

const DIR = path.resolve('_work/clean/Kubernetes');

if (import.meta.url.includes('format-kubernetes-clean') && process.argv[1]?.includes('format-kubernetes-clean')) {
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
