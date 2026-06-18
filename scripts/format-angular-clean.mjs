import fs from 'node:fs';
import path from 'node:path';

const FENCE_LANGS = ['typescript', 'html', 'javascript', 'json', 'bash', 'css', 'scss', 'sql', 'yaml', 'yml', 'dockerfile', 'text', 'csharp'];
const INDENT_LANGS = ['typescript', 'javascript', 'csharp'];

// ---- helpers ---------------------------------------------------------------

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function normKey(s) {
  return stripBold(s).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
}

function isFenceOpen(line) {
  const t = line.trim();
  if (!t.startsWith('```')) return null;
  const lang = t.slice(3).trim();
  return FENCE_LANGS.includes(lang) ? lang : null;
}

function isCodeishLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (t === '`') return true; // template-literal artifact
  if (/^#{1,6}\s/.test(t)) return false;
  if (/^[-*+]\s/.test(t)) return false;
  if (/^\d+\.\s/.test(t)) return false;
  if (/^\|/.test(t)) return false;
  if (/^\*\*[^*]+\*\*:?\s*$/.test(t)) return false;
  if (/^```/.test(t)) return false;
  if (t.length > 90 && /[.!?]$/.test(t) && !/[{};=<>()]/.test(t)) return false;
  if (
    /^(import|export|public|private|protected|static|class|void|using|namespace|return|if|else|for|foreach|while|switch|case|try|catch|finally|new|const|let|var|async|await|interface|type|enum|@Component|@NgModule|@Injectable|@Directive|@Pipe|@Input|@Output|@ViewChild|selector|template|templateUrl|styleUrls|providedIn|ng generate|console\.|Observable|subscribe|pipe\()/i.test(t) ||
    /^<\/?[a-zA-Z]/.test(t) ||
    /[{};=]/.test(t) ||
    /^\w+\s*\(/.test(t) ||
    /^\/\//.test(t) ||
    /^\}/.test(t) ||
    /^\{/.test(t) ||
    /\*ng[A-Z]/.test(t) ||
    /^\)\s*$/.test(t) ||
    /^template:\s*`/.test(t) ||
    /^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|DECLARE|SET|BEGIN|END|GO|EXEC|WITH|USE)\b/i.test(t) ||
    /^\s*--/.test(t) ||
    /\b(FROM|WHERE|JOIN|INTO|VALUES|COLLATE|GROUP BY|ORDER BY|HAVING|UNION|EXCEPT|INTERSECT)\b/i.test(t)
  ) return true;
  return false;
}

function isProseLabel(line) {
  const t = line.trim();
  return /^\*\*(Example|Output|Explanation|Usage|Steps|Syntax|Note|Template|Component Class|Component|Method|Class|Child component|Parent component|Problem|Service|Directive|Module|Reducer|Effect|Selector|Action)([^*]*)\*\*:?\s*$/i.test(t) ||
    /^\*\*Example\s+[^*]+\*\*:?\s*$/i.test(t) ||
    /^\*\*Component\s+[^(]*\([^)]*\):\*\*\s*$/i.test(t);
}

function isProseOnly(line) {
  const t = line.trim();
  if (!t) return true;
  if (t === '`') return false;
  if (isProseLabel(t)) return true;
  if (/^\*\*[^*]+\*\*\s*\([^)]*\)\s*:?\s*$/.test(t)) return true; // **Child component** (file):
  if (/^\*\*[^*]+\*\*:?\s+\S/.test(t) && !isCodeishLine(t)) return true;
  if (t.length > 70 && /[.!?]$/.test(t) && !/[{};=<>`]/.test(t)) return true;
  return false;
}

/** Merge code fences split by bridge lines (incl. lone ` from template literals) */
function mergeSplitCodeFences(text) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const openLang = isFenceOpen(lines[i]);
    if (openLang) {
      const open = '```' + openLang;
      const block = [open];
      let j = i + 1;
      while (j < lines.length) {
        if (lines[j].trim() === '```') {
          block.push(lines[j]);
          j++;
          let k = j;
          const bridge = [];
          while (k < lines.length && bridge.length < 10) {
            if (lines[k].trim() === '') { k++; continue; }
            const nextLang = isFenceOpen(lines[k]);
            if (nextLang) break;
            if (isProseOnly(lines[k])) break;
            if (isCodeishLine(lines[k]) || lines[k].trim().startsWith('<!--')) {
              bridge.push(lines[k]);
              k++;
              continue;
            }
            break;
          }
          if (bridge.length && k < lines.length && isFenceOpen(lines[k])) {
            block.pop();
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
    // drop orphan standalone backtick lines between fences (already merged above when possible)
    if (lines[i].trim() === '`' && i > 0 && i + 1 < lines.length) {
      const prev = out[out.length - 1]?.trim();
      const next = lines[i + 1]?.trim();
      if (prev === '```' || next?.startsWith('```') || isCodeishLine(lines[i + 1])) {
        i++;
        continue;
      }
    }
    out.push(lines[i]);
    i++;
  }
  return out.join('\n');
}

function cleanInsideCodeFences(text) {
  for (const lang of FENCE_LANGS) {
    const re = new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g');
    text = text.replace(re, (match, body) => {
      const lines = body.split('\n');
      const code = [];
      const extracted = [];
      for (const line of lines) {
        const t = line.trim();
        if (isProseLabel(t)) {
          extracted.push(stripBold(t).replace(/:+$/, ''));
          continue;
        }
        if (/^\*\*[^*]+\*\*/.test(t) && !isCodeishLine(t)) {
          extracted.push(stripBold(t).replace(/:+$/, ''));
          continue;
        }
        if (t.length > 55 && /[.!?]$/.test(t) && !/[{};=<>()]/.test(t) && !t.startsWith('//') && !t.startsWith('<!--')) {
          extracted.push(t);
          continue;
        }
        code.push(line);
      }
      const cleaned = code.join('\n').replace(/\n{3,}/g, '\n\n').trim();
      const prefix = extracted.length
        ? extracted.map((l) => {
            if (/^(Example|Output|Explanation|Usage|Problem)$/i.test(l)) return `**${l}:**`;
            if (/^Example\s/i.test(l)) return `**${l}**`;
            return l;
          }).join('\n\n') + '\n\n'
        : '';
      return prefix + '```' + lang + '\n' + cleaned + '\n```';
    });
  }
  return text;
}

function indentBraces(code) {
  const lines = code.split('\n');
  let depth = 0;
  const out = [];
  for (const raw of lines) {
    const t = raw.trim();
    if (!t) { out.push(''); continue; }
    if (t.startsWith('}')) depth = Math.max(0, depth - 1);
    out.push('  '.repeat(depth) + t);
    if (t.endsWith('{')) depth++;
  }
  return out.join('\n');
}

function formatIndentation(text) {
  for (const lang of INDENT_LANGS) {
    const re = new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g');
    text = text.replace(re, (_, body) => '```' + lang + '\n' + indentBraces(body.trim()) + '\n```');
  }
  return text;
}

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
  let inTocSection = false;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '## Questions Covered') {
      inTocSection = true;
      out.push(line);
      out.push('');
      i++;
      continue;
    }
    if (inTocSection) {
      const t = line.trim();
      if (/^\d+\.\s+\*\*/.test(t)) {
        inTocSection = false;
      } else if (/^\d+\.\s+/.test(t)) {
        out.push(line);
        i++;
        continue;
      } else if (t === '') {
        out.push(line);
        i++;
        continue;
      } else {
        inTocSection = false;
      }
    }
    const numM = line.match(/^\d+\.\s+(.*)$/);
    if (numM) {
      const q = stripBold(numM[1].trim());
      const key = normKey(q);
      if (qKeys.has(key) && !existing.has(key)) {
        out.push(`## ${q}`);
        existing.add(key);
        i++;
        continue;
      }
    }
    const plain = stripBold(line.trim());
    const key = normKey(plain);
    if (qKeys.has(key) && !existing.has(key) && !line.startsWith('#') && plain.length > 5) {
      out.push(`## ${plain}`);
      existing.add(key);
      i++;
      continue;
    }
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

function fixH1Title(text, fileBaseName) {
  const m = text.match(/^# (.+)$/m);
  if (!m) return `# ${fileBaseName}\n\n` + text;
  if (normKey(m[1]) !== normKey(fileBaseName)) {
    return text.replace(/^# .+$/m, '# ' + fileBaseName);
  }
  return text;
}

function collapseBlank(text) {
  return text.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

export function formatFile(raw, fileBaseName = '') {
  let t = raw;
  if (fileBaseName) t = fixH1Title(t, fileBaseName);
  t = t.replace(/<!--\s*-->\s*\n/g, '');
  t = mergeSplitCodeFences(t);
  t = cleanInsideCodeFences(t);
  t = formatIndentation(t);
  t = addQuestionHeadings(t);
  t = collapseBlank(t);
  return t;
}

// ---- CLI: node format-angular-clean.mjs ------------------------------------

const DIR = path.resolve('full/Angular');
if (import.meta.url.includes('format-angular-clean') && process.argv[1]?.includes('format-angular-clean')) {
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
