import fs from 'node:fs';
import path from 'node:path';

const roots = [
  path.resolve('extracted/Data Structures and Algorithms 1'),
  path.resolve('full/Data Structures and Algorithms 1'),
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.isFile() && entry.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function formatText(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inCode = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (/^```/.test(trimmed)) {
      inCode = !inCode;
      out.push(trimmed);
      continue;
    }

    if (/^\*\*(Example|Examples|Example \d+:.*|Real-Life Example|Real Life Example)\*\*$/.test(trimmed)) {
      const label = trimmed.replace(/^\*\*|\*\*$/g, '');
      out.push('');
      out.push(`### ${label}`);
      out.push('');
      continue;
    }

    if (/^\*\*(How .+ Works|Algorithm Steps|Definition|Characteristics|Basic Operations|Why .+|Time Complexity|Space Complexity)\*\*$/.test(trimmed)) {
      const label = trimmed.replace(/^\*\*|\*\*$/g, '');
      out.push('');
      out.push(`### ${label}`);
      out.push('');
      continue;
    }

    if (/^\*\*[^*]+\*\*$/.test(trimmed) && !/^\*\*(Example|Example \d+:|Real-Life Example|Real Life Example)/.test(trimmed)) {
      out.push('');
      out.push(trimmed.replace(/^\*\*|\*\*$/g, ''));
      out.push('');
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^\d+\.\s+/, '- '));
      continue;
    }

    if (/^\*\s+/.test(trimmed)) {
      out.push(trimmed.replace(/^\*\s+/, '- '));
      continue;
    }

    if (/^Input:/i.test(trimmed) || /^Output:/i.test(trimmed) || /^Given:/i.test(trimmed)) {
      out.push(`- ${trimmed}`);
      continue;
    }

    if (/^Possible arrangements:/i.test(trimmed)) {
      out.push(`- ${trimmed}`);
      const block = [];
      let j = i + 1;
      while (j < lines.length) {
        const next = lines[j].trim();
        if (next === '') break;
        if (/^#{1,6}\s+/.test(next) || /^\*\*.+\*\*$/.test(next) || /^```/.test(next)) break;
        if (/^[-*]\s+/.test(next) || /^\d+\.\s+/.test(next)) break;
        if (/^[A-Za-z0-9\[\]_.(),/\\|\-+ ]+$/.test(next)) {
          block.push(next);
          j++;
          continue;
        }
        break;
      }
      if (block.length) {
        out.push('');
        out.push('```text');
        out.push(...block);
        out.push('```');
        out.push('');
        i = j - 1;
      }
      continue;
    }

    if (!inCode && /\[.*\]/.test(trimmed) && !trimmed.startsWith('!')) {
      out.push(`- ${trimmed}`);
      continue;
    }

    out.push(line);
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

let changed = 0;
for (const root of roots) {
  if (!fs.existsSync(root)) continue;
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated = formatText(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      changed++;
    }
  }
}

console.log(`Formatted ${changed} Markdown files with cleaner example blocks.`);
