import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('full/C#');

// ---- helpers ---------------------------------------------------------------

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  return stripBold(s).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
}

function isCodeishLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (/^#{1,6}\s/.test(t)) return false;
  if (/^[-*+]\s/.test(t)) return false;
  if (/^\d+\.\s/.test(t)) return false;
  if (/^\|/.test(t)) return false;
  if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) return false; // label only
  if (/^```/.test(t)) return false;
  // prose sentence (long, no code chars)
  if (t.length > 80 && /[.!?]$/.test(t) && !/[{};=()]/.test(t)) return false;
  if (
    /^(public|private|protected|internal|static|class|void|using|namespace|return|if|else|for|foreach|while|switch|case|try|catch|finally|new|var|int|string|bool|async|await|Console\.|\[|#region|#endregion|\/\/|\/\*|\*\/|num\s*=|driver\.|team\.|house\.|\}|\{|;)/i.test(t) ||
    /[{};=]/.test(t) ||
    /^\w+\s*\(/.test(t) ||
    /^\/\//.test(t) ||
    /^\}/.test(t) ||
    /^\{/.test(t)
  ) return true;
  return false;
}

function isProseLabel(line) {
  return /^\*\*(Example|Output|Explanation|Usage|Steps|Syntax|Note|Template|Component Class|Component|Method|Class)\*\*:?\s*$/i.test(line.trim());
}

function isProseOnly(line) {
  const t = line.trim();
  if (!t) return true;
  if (isProseLabel(t)) return true;
  if (/^\*\*[^*]+\*\*:?\s+\S/.test(t) && !isCodeishLine(t)) return true; // bold lead-in prose
  if (t.length > 60 && /[.!?]$/.test(t) && !/[{};=]/.test(t)) return true;
  return false;
}

/** Merge ```csharp blocks split by 1-3 code-ish lines between fences */
function mergeSplitCodeFences(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === '```csharp' && i + 1 < lines.length) {
      const block = ['```csharp'];
      let j = i + 1;
      while (j < lines.length) {
        if (lines[j].trim() === '```') {
          block.push(lines[j]);
          j++;
          // look ahead: merge if next non-empty lines are code-ish (max 4 lines) then another ```csharp
          let k = j;
          const bridge = [];
          while (k < lines.length && bridge.length < 5) {
            if (lines[k].trim() === '') { k++; continue; }
            if (lines[k].trim() === '```csharp') break;
            if (isProseOnly(lines[k])) break;
            if (isCodeishLine(lines[k]) || lines[k].trim().startsWith('//')) {
              bridge.push(lines[k]);
              k++;
              continue;
            }
            break;
          }
          if (bridge.length && k < lines.length && lines[k].trim() === '```csharp') {
            block.pop(); // remove closing ```
            block.push(...bridge);
            j = k + 1;
            continue;
          }
          break;
        }
        block.push(lines[j]);
        j++;
      }
      out.push(...block);
      i = j;
      continue;
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

/** Move **Example**: and similar labels out of code fences; strip trapped prose sentences at end of block */
function cleanInsideCodeFences(text) {
  return text.replace(/```csharp\n([\s\S]*?)```/g, (match, body) => {
    const lines = body.split('\n');
    const code = [];
    const extracted = [];
    for (const line of lines) {
      const t = line.trim();
      if (isProseLabel(t)) {
        extracted.push(t.replace(/^\*\*/, '').replace(/\*\*:?\s*$/, '').replace(/:+$/, ''));
        continue;
      }
      // full prose sentence trapped in code
      if (t.length > 50 && /[.!?]$/.test(t) && !/[{};=()]/.test(t) && !t.startsWith('//')) {
        extracted.push(t);
        continue;
      }
      if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) {
        extracted.push(stripBold(t).replace(/:+$/, ''));
        continue;
      }
      code.push(line);
    }
    const cleaned = code.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    const prefix = extracted.length
      ? extracted.map((l) => (l.match(/^(Example|Output|Explanation)$/i) ? `**${l}:**` : l)).join('\n\n') + '\n\n'
      : '';
    return prefix + '```csharp\n' + cleaned + '\n```';
  });
}

/** Simple brace-based indent for readability (formatting only) */
function indentCSharp(code) {
  const lines = code.split('\n');
  let depth = 0;
  const out = [];
  for (let raw of lines) {
    const t = raw.trim();
    if (!t) { out.push(''); continue; }
    if (t.startsWith('}')) depth = Math.max(0, depth - 1);
    out.push('  '.repeat(depth) + t);
    if (t.endsWith('{')) depth++;
    else if (t.startsWith('}') && t.length > 1 && t.includes('{')) { /* } else { */ }
    else if (t === '}' && depth > 0) { /* already decremented */ }
  }
  return out.join('\n');
}

function formatCSharpIndentation(text) {
  return text.replace(/```csharp\n([\s\S]*?)```/g, (_, body) => '```csharp\n' + indentCSharp(body.trim()) + '\n```');
}

/** Add ## headings for Questions Covered entries missing as headings */
function addQuestionHeadings(text) {
  const lines = text.split('\n');
  const questions = [];
  let inToc = false;
  for (const line of lines) {
    if (line.trim() === '## Questions Covered') { inToc = true; continue; }
    if (inToc) {
      const m = line.match(/^\d+\.\s+(.*)$/);
      if (m) questions.push(stripBold(m[1]));
      else if (line.trim() === '') continue;
      else inToc = false;
    }
  }
  if (!questions.length) return text;

  const qKeys = new Set(questions.map(normKey));
  const existing = new Set();
  for (const line of lines) {
    if (line.startsWith('## ') && !line.startsWith('## Questions')) {
      existing.add(normKey(line.slice(3)));
    }
  }

  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // duplicate plain question line (not heading) right after TOC block
    const plain = stripBold(line.trim());
    const key = normKey(plain);
    if (
      qKeys.has(key) &&
      !existing.has(key) &&
      !line.startsWith('#') &&
      plain.length > 5
    ) {
      out.push(`## ${plain}`);
      existing.add(key);
      i++;
      continue;
    }
    // bold-only question line
    if (/^\*\*[^*].*\*\*$/.test(line.trim()) && qKeys.has(normKey(line)) && !existing.has(normKey(line))) {
      const t = stripBold(line.trim()).replace(/:+$/, '');
      out.push(`## ${t}`);
      existing.add(normKey(t));
      i++;
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

/** Collapse extra blank lines */
function collapseBlank(text) {
  return text.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function formatFile(raw) {
  let t = raw;
  t = mergeSplitCodeFences(t);
  t = cleanInsideCodeFences(t);
  t = formatCSharpIndentation(t);
  t = addQuestionHeadings(t);
  t = collapseBlank(t);
  return t;
}

export { formatFile };

// ---- run (when executed directly) ------------------------------------------

if (process.argv[1]?.includes('format-csharp-clean')) {
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));
for (const f of files) {
  const p = path.join(DIR, f);
  const before = fs.readFileSync(p, 'utf8');
  const after = formatFile(before);
  fs.writeFileSync(p, after, 'utf8');
  const splitsBefore = (before.match(/```csharp/g) || []).length;
  const splitsAfter = (after.match(/```csharp/g) || []).length;
  console.log(`${f}: ${before.length} -> ${after.length} (csharp blocks ${splitsBefore} -> ${splitsAfter})`);
}
}
