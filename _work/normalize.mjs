import fs from 'node:fs';
import path from 'node:path';
import { formatFile as formatCSharpClean } from './format-csharp-clean.mjs';
import { formatFile as formatAngularClean } from './format-angular-clean.mjs';
import { formatFile as formatJavascriptClean } from './format-javascript-clean.mjs';

const args = process.argv.slice(2);
const topicIdx = args.indexOf('--topic');
const topic = topicIdx >= 0 ? args[topicIdx + 1] : (args.find((a) => a.startsWith('--topic='))?.split('=')[1] ?? '');
const only = args.find((a) => !a.startsWith('--') && a !== topic) ?? '';

const SRC = path.resolve('_work/md', topic);
const OUT = path.resolve('_work/clean', topic);
const topicLower = topic.toLowerCase();
const CODE_LANG = topicLower.includes('c#') || topicLower === 'csharp'
  ? 'csharp'
  : topicLower.includes('javascript') || topicLower === 'js'
    ? 'javascript'
    : 'typescript';

fs.mkdirSync(OUT, { recursive: true });

// ---- helpers ---------------------------------------------------------------

function unescapeCommon(s) {
  return s.replace(/\\([\[\]\*_#@$`~<>(){}.\-+!|"'])/g, '$1');
}

function stripBold(s) {
  return s.replace(/\*\*/g, '').trim();
}

function backtickInlineTokens(s) {
  if (s.includes('`')) return s;
  const tokens = [
    /\*ngIf/g, /\*ngFor/g, /\*ngSwitchCase/g, /\*ngSwitchDefault/g, /\*ngTemplateOutlet/g,
    /\bIEnumerable</g, /\bTask</g, /\bList</g, /\bDictionary</g,
    /\basync\s+Task/g,
  ];
  for (const re of tokens) s = s.replace(re, (m) => '`' + m + '`');
  return s;
}

const CODE_STRONG_COMMON = [
  /=>/, /\{\s*$/, /^\s*\}/, /\);\s*$/, /\breturn\s+/,
  /\bclass\s+\w+/, /\bfunction\s+\w+/, /<\/?[a-zA-Z][\w-]*[\s>]/, /\bthis\./,
];
const CODE_STRONG_TS = [
  /\bimport\s+\{/, /\bimport\s+[\w*]/, /\bexport\s+(class|const|function|default|interface|enum)/,
  /@(NgModule|Component|Injectable|Directive|Pipe|Input|Output|ViewChild|HostListener|Effect)\b/,
  /\.pipe\(/, /\.subscribe\(/, /\bconst\s+\w+\s*\$?\s*=/, /\blet\s+\w+\s*=/,
  /selector\s*:/, /template(Url)?\s*:/, /styleUrls?\s*:/, /:\s*Observable</,
];
const CODE_STRONG_CS = [
  /\busing\s+[\w.]+;/, /\bnamespace\s+/, /\bpublic\s+(class|interface|enum|struct|static|async|void)/,
  /\bprivate\s+/, /\bprotected\s+/, /\binternal\s+/, /\bstatic\s+/, /\basync\s+Task/,
  /\bget;\s*set;/, /\bset;\s*}/, /\bvoid\s+\w+\(/, /\bnew\s+\w+/,
  /\[[\w.]+\]/, /\bvar\s+\w+\s*=/, /\bstring\s+\w+/, /\bint\s+\w+/,
  /\bConsole\.Write/, /\bIEnumerable</, /\bList</, /\bTask</, /\bdelegate\s+/,
  /\bevent\s+/, /\b#pragma\s+/, /\b#region\b/, /\b#endregion\b/,
];
const CODE_STRONG_JS = [
  /\bimport\s+/, /\bexport\s+/, /\brequire\s*\(/, /\bmodule\.exports/,
  /\bconst\s+\w+\s*=/, /\blet\s+\w+\s*=/, /\bvar\s+\w+\s*=/,
  /\bfunction\s*\(/, /\basync\s+function/, /\bawait\s+/,
  /\bconsole\.(log|error|warn|info)/, /\bdocument\./, /\bwindow\./, /\baddEventListener/,
  /\.then\s*\(/, /\.catch\s*\(/, /\.map\s*\(/, /\.filter\s*\(/, /\bPromise\./,
  /\blocalStorage/, /\bsessionStorage/, /\bfetch\s*\(/, /\bJSON\./,
];
const CODE_STRONG = [
  ...CODE_STRONG_COMMON,
  ...(CODE_LANG === 'csharp' ? CODE_STRONG_CS : CODE_LANG === 'javascript' ? CODE_STRONG_JS : CODE_STRONG_TS),
];

const CODE_WEAK = [
  /[{}]/, /;\s*$/, /^\s*\/\//, /\(\)/, /=>/, /\$/, /\[\]/, /==|===|!=|&&|\|\|/,
  /^\s*(declarations|imports|exports|providers|bootstrap|entryComponents)\s*:/,
  /\)\s*$/, /,\s*$/, /^\s*[\w$]+\(/, /^\s*\[/, /get;\s*set;/,
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
  const words = l.split(/\s+/).length;
  return words >= 6 && /[.:!?]$/.test(l) && !/[{};=]|=>|\$/.test(l);
}

// ---- main per-file transform ----------------------------------------------

function normalize(raw, fileBaseName) {
  let lines = raw.replace(/\r\n/g, '\n').split('\n');
  lines = lines.map((ln) => ln.replace(/\s*(Top of Form|Bottom of Form)\s*/g, ''));
  lines = lines.filter((ln) => {
    const t = ln.trim();
    if (/^\/{10,}$/.test(t)) return false;
    return true;
  });

  const text = lines.join('\n');
  const paras = text.split(/\n\s*\n/).map((p) => p.replace(/\s+$/g, '')).filter((p) => p.length > 0);

  const out = [];
  const normKey = (s) => stripBold(unescapeCommon(s)).replace(/\s+/g, ' ').trim().toLowerCase().replace(/[.?:]+$/, '');
  const questionKeys = new Set();

  const isBoldOnly = (p) => {
    const t = p.trim();
    return /^\*\*[^*].*\*\*$/.test(t) && !t.slice(2, -2).includes('**');
  };
  const boldText = (p) => p.trim().replace(/^\*\*/, '').replace(/\*\*$/, '').trim();

  let i = 0;
  // Title: bold first line, or derive from filename
  if (paras.length && isBoldOnly(paras[0])) {
    out.push(`# ${unescapeCommon(boldText(paras[0]))}`);
    out.push('');
    i = 1;
  } else if (fileBaseName) {
    out.push(`# ${fileBaseName}`);
    out.push('');
  }

  // Collect TOC numbered items (may include **bold** questions)
  const toc = [];
  while (i < paras.length) {
    const m = paras[i].match(/^\s*\d+\.\s+(.*)$/s);
    if (m && !isBoldOnly(paras[i])) {
      const q = stripBold(unescapeCommon(m[1].replace(/\s+/g, ' ').trim()));
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

  const rest = paras.slice(i);
  let j = 0;
  while (j < rest.length) {
    const p = rest[j];

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

    if (/^#{1,6}\s/.test(p)) {
      out.push(unescapeCommon(p));
      out.push('');
      j++;
      continue;
    }

    if (/^>\s?/.test(p) || p.split('\n').every((l) => /^>\s?/.test(l) || l.trim() === '' || /^>$/.test(l.trim()))) {
      const codeLines = [];
      while (j < rest.length && rest[j].split('\n').every((l) => /^>/.test(l.trim()) || l.trim() === '')) {
        rest[j].split('\n').forEach((l) => {
          const stripped = l.replace(/^>\s?/, '').replace(/^>$/, '');
          codeLines.push(unescapeCommon(stripped));
        });
        j++;
      }
      const code = codeLines.filter((l) => l.trim() !== '');
      out.push('```' + CODE_LANG);
      out.push(...code);
      out.push('```');
      out.push('');
      continue;
    }

    if (/^\s*([-*+]\s|\d+\.\s)/.test(p) || /^\|/.test(p.trim())) {
      const fixed = p.split('\n').map((l) => backtickInlineTokens(unescapeCommon(l))).join('\n');
      out.push(fixed);
      out.push('');
      j++;
      continue;
    }

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
      out.push('```' + CODE_LANG);
      out.push(...codeLines);
      out.push('```');
      out.push('');
      continue;
    }

    const fixed = p.split('\n').map((l) => backtickInlineTokens(unescapeCommon(l))).join('\n');
    out.push(fixed);
    out.push('');
    j++;
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ---- run -------------------------------------------------------------------

if (!fs.existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  process.exit(1);
}

const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.md'));
for (const f of files) {
  if (only && !f.includes(only)) continue;
  const raw = fs.readFileSync(path.join(SRC, f), 'utf8');
  const baseName = f.replace(/\.md$/i, '');
  let cleaned = normalize(raw, baseName);
  if (CODE_LANG === 'csharp') cleaned = formatCSharpClean(cleaned);
  else if (topicLower === 'angular') cleaned = formatAngularClean(cleaned, baseName);
  else if (topicLower.includes('javascript')) cleaned = formatJavascriptClean(cleaned, baseName);
  fs.writeFileSync(path.join(OUT, f), cleaned, 'utf8');
  console.log(`cleaned: ${f} (${raw.length} -> ${cleaned.length})`);
}
