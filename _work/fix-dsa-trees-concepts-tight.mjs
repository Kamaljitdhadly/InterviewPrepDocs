import fs from 'node:fs';
import path from 'node:path';
import { formatFile } from './format-generic-clean.mjs';

const cleanPath = path.resolve('_work/clean/Data Structures and Algorithms/Data Structures and Algorithms Trees Concepts.md');
const tightPath = path.resolve('_work/tight/Data Structures and Algorithms/Data Structures and Algorithms Trees Concepts.md');
const clean = fs.readFileSync(cleanPath, 'utf8');
let t = formatFile(clean, 'Data Structures and Algorithms Trees Concepts');

const parts = t.split(/(```[\s\S]*?```)/g);
t = parts.map((part) => {
  if (part.startsWith('```')) {
    return part
      .replace(/```csharp\n(mathematica|markdown|text)\nCopy code\n/gi, '```text\n')
      .replace(/```\w+\n(\w+)\nCopy code\n/gi, '```text\n');
  }
  return part
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^(csharp|markdown|mathematica|Copy code)\s*$/gim, '')
    .replace(/\n{3,}/g, '\n\n');
}).join('');

fs.writeFileSync(tightPath, t.trim() + '\n', 'utf8');
console.log(`clean ${clean.length} -> tight ${t.length} (${((1 - t.length / clean.length) * 100).toFixed(1)}% reduction)`);
