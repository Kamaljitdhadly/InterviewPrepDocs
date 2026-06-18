import fs from 'node:fs';
import path from 'node:path';
import { formatFile } from './format-angular-clean.mjs';

export { formatFile };

const DIR = path.resolve('full/Javascript');

if (import.meta.url.includes('format-javascript-clean') && process.argv[1]?.includes('format-javascript-clean')) {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
  for (const f of files) {
    const p = path.join(DIR, f);
    const before = fs.readFileSync(p, 'utf8');
    const baseName = f.replace(/\.md$/i, '');
    const after = formatFile(before, baseName);
    fs.writeFileSync(p, after, 'utf8');
    const blocksBefore = (before.match(/```/g) || []).length / 2;
    const blocksAfter = (after.match(/```/g) || []).length / 2;
    console.log(`${f}: ${before.length} -> ${after.length} (blocks ~${Math.floor(blocksBefore)} -> ~${Math.floor(blocksAfter)})`);
  }
}
