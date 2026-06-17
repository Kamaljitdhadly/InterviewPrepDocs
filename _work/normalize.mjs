import fs from 'node:fs';
import path from 'node:path';

const SRC = path.resolve('_work/md');
const OUT = path.resolve('_work/clean');
fs.mkdirSync(OUT, { recursive: true });

// ---- helpers ---------------------------------------------------------------

// Unescape pandoc gfm backslash-escapes. Safe inside code (literal) and mostly
// safe in prose for these chars.
function unescapeCommon(s) {
  return s
    .replace(/\\([\[\]\*_#@$`~<>(){}.\-+!|"'])/g, '$1');
}

// Inline tokens that must be wrapped in backticks in prose so pandoc doesn't
// re-interpret them as markdown when converting back to docx.
function backtickInlineTokens(s) {
  // Don't touch text already inside backticks.
  if (s.includes('`')) return s;
  const tokens = [
    /\*ngIf/g, /\*ngFor/g, /\*ngSwitchCase/g, /\*ngSwitchDefault/g,
    /\*ngTemplateOutlet/g,
  ];
  for (const re of tokens) s = s.replace(re, (m) => '`' + m + '`');
  return s;
}

const CODE_STRONG = [
  /\bimport\s+\{/, /\bimport\s+[\w*]/, /\bexport\s+(class|const|function|default|interface|enum)/,
  /@(NgModule|Component|Injectable|Directive|Pipe|Input|Output|ViewChild|HostListener|Effect)\b/,
  /=>/, /\{\s*$/, /^\s*\}/, /\);\s*$/, /\.pipe\(/, /\.subscribe\(/,
  /\bconst\s+\w+\s*\$?\s*=/, /\blet\s+\w+\s*=/, /\bclass\s+\w+/, /\bfunction\s+\w+/,
  /\breturn\s+/, /selector\s*:/, /template(Url)?\s*:/, /styleUrls?\s*:/,
  /<\/?[a-zA-Z][\w-]*[\s>]/, /\bthis\./, /:\s*Observable</, /:\s*\w+\[\]/,
];
const CODE_WEAK = [
  /[{}]/, /;\s*$/, /^\s*\/\//, /\(\)/, /=>/, /\$/, /\[\]/, /==|===|!=|&&|\|\|/,
  /^\s*(declarations|imports|exports|providers|bootstrap|entryComponents)\s*:/,
  /\)\s*$/, /,\s*$/, /^\s*[\w$]+\(/,
];

function looksStrongCode(line) {
  const l = unescapeCommon(line);
  return CODE_STRONG.some((re) => re.test(l));
}
function looksWeakCode(line) {
  const l = unescapeCommon(line);
  return CODE_WEAK.some((re) => re.test(l));
}
function looksProse(line) {
  const l = line.trim();
  if (!l) return false;
  // A real sentence: has several words and ends with sentence punctuation,
  // and has no obvious code chars.
  const words = l.split(/\s+/).length;
  return words >= 6 && /[.:!?]$/.test(l) && !/[{};=]|=>|\$/.test(l);
}

// ---- main per-file transform ----------------------------------------------

function normalize(raw) {
  // strip Word form artifacts & separators up front (line-based)
  let lines = raw.replace(/\r\n/g, '\n').split('\n');
  // strip Word form artifacts even when glued to other text
  lines = lines.map((ln) => ln.replace(/\s*(Top of Form|Bottom of Form)\s*/g, ''));
  lines = lines.filter((ln) => {
    const t = ln.trim();
    if (/^\/{10,}$/.test(t)) return false; // ///// separators
    return true;
  });

  // Re-join then split into paragraphs separated by blank lines.
  const text = lines.join('\n');
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/\s+$/g, '')).filter((p) => p.length > 0);

  // Identify title (first paragraph if it's a lone bold line)
  const out = [];
  let started = false;

  const normKey = (s) => unescapeCommon(s).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
  const questionKeys = new Set();

  const isBoldOnly = (p) => {
    const t = p.trim();
    return /^\*\*[^*].*\*\*$/.test(t) && !t.slice(2, -2).includes('**');
  };
  const boldText = (p) => p.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').trim();

  let i = 0;
  // Title
  if (paras.length && isBoldOnly(paras[0])) {
    out.push(`# ${unescapeCommon(boldText(paras[0]))}`);
    out.push('');
    i = 1;
  }

  // Collect TOC numbered items right after title into a clean list
  const toc = [];
  while (i < paras.length) {
    const m = paras[i].match(/^\s*\d+\.\s+(.*)$/s);
    if (m && !isBoldOnly(paras[i])) {
      const q = unescapeCommon(m[1].replace(/\s+/g, ' ').trim());
      toc.push(q);
      questionKeys.add(normKey(q));
      i++;
    } else break;
  }
  if (toc.length) {
    out.push('## Questions Covered');
    out.push('');
    toc.forEach((q, idx) => out.push(`${idx + 1}. ${q}`));
    out.push('');
  }

  // Process remaining paragraphs
  const rest = paras.slice(i);
  let j = 0;
  while (j < rest.length) {
    const p = rest[j];

    // Heading paragraphs
    if (isBoldOnly(p)) {
      const t = unescapeCommon(boldText(p)).replace(/:+$/, '');
      if (questionKeys.has(normKey(boldText(p))) || /\?$/.test(t)) {
        out.push(`## ${t}`);
      } else {
        out.push(`### ${t}`);
      }
      out.push('');
      j++;
      continue;
    }

    // Existing markdown headings -> keep, but demote nothing (they sit under ##)
    if (/^#{1,6}\s/.test(p)) {
      out.push(unescapeCommon(p));
      out.push('');
      j++;
      continue;
    }

    // Blockquote code run (lines starting with >)
    if (/^>\s?/.test(p) || p.split('\n').every((l) => /^>\s?/.test(l) || l.trim() === '' || /^>$/.test(l.trim()))) {
      // gather following paragraphs that are also blockquotes
      const codeLines = [];
      while (j < rest.length && rest[j].split('\n').every((l) => /^>/.test(l.trim()) || l.trim() === '')) {
        rest[j].split('\n').forEach((l) => {
          const stripped = l.replace(/^>\s?/, '').replace(/^>$/, '');
          codeLines.push(unescapeCommon(stripped));
        });
        j++;
      }
      const code = codeLines.filter((l) => l.trim() !== '');
      out.push('```typescript');
      out.push(...code);
      out.push('```');
      out.push('');
      continue;
    }

    // Lists / tables -> keep as-is (unescaped), but backtick-protect tokens
    if (/^\s*([-*+]\s|\d+\.\s)/.test(p) || /^\|/.test(p.trim())) {
      const fixed = p.split('\n').map((l) => backtickInlineTokens(unescapeCommon(l))).join('\n');
      out.push(fixed);
      out.push('');
      j++;
      continue;
    }

    // Single-line paragraph that is strong code -> start a code run
    const single = p.split('\n').length === 1;
    if (single && looksStrongCode(p) && !looksProse(p)) {
      const codeLines = [unescapeCommon(p)];
      j++;
      while (j < rest.length) {
        const q = rest[j];
        if (q.split('\n').length !== 1) break;
        if (isBoldOnly(q) || /^#{1,6}\s/.test(q) || /^\s*([-*+]\s|\d+\.\s)/.test(q) || /^\|/.test(q.trim())) break;
        if (looksProse(q)) break;
        if (looksStrongCode(q) || looksWeakCode(q)) {
          codeLines.push(unescapeCommon(q));
          j++;
        } else break;
      }
      out.push('```typescript');
      out.push(...codeLines);
      out.push('```');
      out.push('');
      continue;
    }

    // Default: prose paragraph
    const fixed = p.split('\n').map((l) => backtickInlineTokens(unescapeCommon(l))).join('\n');
    out.push(fixed);
    out.push('');
    j++;
  }

  // collapse 3+ blank lines
  let result = out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
  return result;
}

// ---- run -------------------------------------------------------------------

const only = process.argv[2]; // optional filename filter
const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md'));
for (const f of files) {
  if (only && !f.includes(only)) continue;
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const cleaned = normalize(raw);
  fs.writeFileSync(path.join(OUT, f), cleaned, 'utf8');
  console.log(`cleaned: ${f} (${raw.length} -> ${cleaned.length})`);
}
