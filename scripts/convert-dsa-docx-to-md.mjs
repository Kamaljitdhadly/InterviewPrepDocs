import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { formatFile } from './format-dsa-clean.mjs';

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function toTitleCase(value) {
  const normalized = value.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return normalized
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, 'docx', 'data-structures-new-notes');
const extractedRoot = path.join(repoRoot, 'extracted', 'Data Structures and Algorithms');
const fullRoot = path.join(repoRoot, 'full', 'Data Structures and Algorithms');
const pandocPath = 'C:\\Users\\Hello\\AppData\\Local\\Pandoc\\pandoc.exe';

fs.mkdirSync(extractedRoot, { recursive: true });
fs.mkdirSync(fullRoot, { recursive: true });

const docxFiles = walk(srcRoot).filter((file) => file.toLowerCase().endsWith('.docx')).sort();
console.log(`Converting ${docxFiles.length} DOCX files`);

for (const file of docxFiles) {
  const rel = path.relative(srcRoot, file).replace(/\\/g, '/');
  const baseName = path.basename(file, '.docx');
  const title = `Data Structures and Algorithms ${toTitleCase(baseName)}`.trim();
  const outputName = `${title}.md`;
  const extractedPath = path.join(extractedRoot, outputName);
  const fullPath = path.join(fullRoot, outputName);

  try {
    execFileSync(pandocPath, ['--from', 'docx', '--to', 'gfm', '--wrap', 'none', '--standalone', file, '-o', extractedPath], {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    let markdown = fs.readFileSync(extractedPath, 'utf8');
    if (!/^#\s+/m.test(markdown)) {
      markdown = `# ${title}\n\n${markdown}`;
    } else {
      markdown = markdown.replace(/^#\s+.*$/m, `# ${title}`);
    }
    fs.writeFileSync(extractedPath, markdown.replace(/\s*\n?$/, '\n'), 'utf8');

    const formatted = formatFile(markdown, title);
    fs.writeFileSync(fullPath, formatted, 'utf8');

    console.log(`Converted ${rel} -> ${outputName}`);
  } catch (error) {
    console.log(`Skipped ${rel}: ${error.message}`);
  }
}
