import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('full');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));

const norm = (s) => s.toLowerCase().replace(/`/g, '').replace(/[*_#>]/g, '')
  .replace(/\s+/g, ' ').replace(/[^a-z0-9 ]/g, '').trim();

// 1) Repeated sentences (>= 50 chars) across the whole corpus
const sentMap = new Map();
for (const f of files) {
  const text = fs.readFileSync(path.join(DIR, f), 'utf8');
  // drop code blocks
  const noCode = text.replace(/```[\s\S]*?```/g, '');
  const sents = noCode.split(/(?<=[.!?])\s+/);
  for (const s of sents) {
    const n = norm(s);
    if (n.length < 50) continue;
    if (!sentMap.has(n)) sentMap.set(n, new Set());
    sentMap.get(n).add(f);
  }
}
let repeated = [...sentMap.entries()].filter(([n, fs]) => fs.size > 1)
  .sort((a, b) => b[1].size - a[1].size);
console.log(`=== Repeated sentences across >=2 files: ${repeated.length} ===`);
for (const [n, set] of repeated.slice(0, 40)) {
  console.log(`\n[${set.size} files] "${n.slice(0, 110)}..."`);
  console.log('   ' + [...set].join(' | '));
}

// 2) Topic overlap: which files share the most repeated sentences
const pairCount = new Map();
for (const [, set] of sentMap) {
  const arr = [...set];
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++) {
      const k = [arr[i], arr[j]].sort().join('  <->  ');
      pairCount.set(k, (pairCount.get(k) || 0) + 1);
    }
}
console.log('\n\n=== Top overlapping file pairs (shared sentences) ===');
[...pairCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15)
  .forEach(([k, c]) => console.log(`  ${c}  ${k}`));
