import fs from 'node:fs';

const files = process.argv.slice(2);
for (const f of files) {
  const c = extract('_work/clean/Docker/' + f);
  const t = extract('_work/tight/Docker/' + f);
  const miss = c.filter((x) => !t.some((y) => y === x || y.includes(x) || x.includes(y)));
  console.log(`\n${f}: clean=${c.length} tight=${t.length} likely-missing=${miss.length}`);
  miss.slice(0, 3).forEach((x, i) => console.log(`  ${i + 1}. ${x.slice(0, 100).replace(/\n/g, ' ')}`));
}

function extract(p) {
  const text = fs.readFileSync(p, 'utf8');
  const re = /```[\w]*\n([\s\S]*?)```/g;
  const b = [];
  let m;
  while ((m = re.exec(text)) !== null) b.push(m[1].trim());
  return b;
}
