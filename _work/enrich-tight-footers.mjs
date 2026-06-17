import fs from 'node:fs';
import path from 'node:path';

const manifest = JSON.parse(fs.readFileSync('_work/topic-manifest.json', 'utf8'));
const TIGHT = path.resolve('_work/tight');
const relations = manifest.fileRelations ?? {};

const MARKER = '## Related Topics';
let updated = 0;
let skipped = 0;

for (const [key, related] of Object.entries(relations)) {
  const [topic, file] = key.split('/');
  const filePath = path.join(TIGHT, topic, file);
  if (!fs.existsSync(filePath)) {
    console.log(`skip missing: ${key}`);
    skipped++;
    continue;
  }
  let text = fs.readFileSync(filePath, 'utf8').trimEnd();
  if (text.includes(MARKER)) {
    skipped++;
    continue;
  }
  const lines = related.map((r) => {
    const [t, f] = r.split('/');
    const label = f.replace(/\.md$/i, '');
    return `- **${label}** (\`${t}/\`)`;
  });
  text += `\n\n---\n\n${MARKER}\n\n${lines.join('\n')}\n`;
  fs.writeFileSync(filePath, text, 'utf8');
  updated++;
  console.log(`enriched: ${key}`);
}

console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
