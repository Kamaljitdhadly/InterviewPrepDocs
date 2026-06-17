import fs from 'node:fs';
import path from 'node:path';
import { formatFile as formatCSharpClean } from './format-csharp-clean.mjs';
import { formatFile as formatAngularClean } from './format-angular-clean.mjs';
import { formatFile as formatJavascriptClean } from './format-javascript-clean.mjs';
import { formatFile as formatSqlServerClean } from './format-sqlserver-clean.mjs';
import { formatFile as formatMicroservicesClean } from './format-microservices-clean.mjs';
import { formatFile as formatSystemDesignClean } from './format-systemdesign-clean.mjs';
import { formatFile as formatDockerClean } from './format-docker-clean.mjs';
import { formatFile as formatKubernetesClean } from './format-kubernetes-clean.mjs';
import { formatFile as formatImportantConceptsClean } from './format-importantconcepts-clean.mjs';

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
    : topicLower.includes('sql')
      ? 'sql'
      : topicLower.includes('microservices')
        ? 'json'
        : topicLower.includes('system design')
          ? 'json'
          : topicLower.includes('docker')
            ? 'bash'
            : topicLower.includes('kubernetes')
              ? 'yaml'
              : topicLower.includes('important concepts')
                ? 'text'
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
const CODE_STRONG_SQL = [
  /\bSELECT\b/i, /\bINSERT\b/i, /\bUPDATE\b/i, /\bDELETE\b/i,
  /\bCREATE\s+(TABLE|PROCEDURE|FUNCTION|VIEW|INDEX|TRIGGER|DATABASE|SCHEMA)\b/i,
  /\bALTER\s+(TABLE|PROCEDURE|FUNCTION|VIEW|INDEX|DATABASE)\b/i, /\bDROP\s+(TABLE|PROCEDURE|FUNCTION|VIEW|INDEX|DATABASE)\b/i,
  /\bFROM\b/i, /\bWHERE\b/i, /\b(INNER|LEFT|RIGHT|FULL|CROSS)\s+JOIN\b/i, /\bJOIN\b/i,
  /\bDECLARE\b/i, /\bSET\s+@/i, /\bBEGIN\b/i, /\bEND\b/i, /\bGO\b/i,
  /\bEXEC(UTE)?\b/i, /\bCOLLATE\b/i, /\bTHROW\b/i, /\bRAISERROR\b/i,
  /\bWITH\s*\(/i, /\bON\s+DELETE\b/i, /\bON\s+UPDATE\b/i,
  /\bFOREIGN\s+KEY\b/i, /\bPRIMARY\s+KEY\b/i, /\bCONSTRAINT\b/i,
  /\bINTO\b/i, /\bVALUES\b/i, /\bGROUP\s+BY\b/i, /\bORDER\s+BY\b/i, /\bHAVING\b/i,
  /\bUNION\b/i, /\bEXCEPT\b/i, /\bINTERSECT\b/i, /\bEXISTS\b/i,
  /\bBACKUP\b/i, /\bRESTORE\b/i, /\bCHECKPOINT\b/i, /\bDBCC\b/i,
  /\bUSE\s+\[/i, /\bUSE\s+\w+/i, /\bsp_\w+/i, /\bxp_\w+/i,
  /^\s*--/, /\bTRY\b/i, /\bCATCH\b/i, /\bTRAN(SACTION)?\b/i, /\bCOMMIT\b/i, /\bROLLBACK\b/i,
  /\bPARTITION\b/i, /\bFILESTREAM\b/i, /\bMERGE\b/i, /\bOUTPUT\b/i,
];
const CODE_STRONG_MS = [
  /\bapiVersion:/i, /\bkind:\s/i, /\bmetadata:/i, /\bspec:/i,
  /\bdocker\s+/i, /\bkubectl\s+/i, /\bhelm\s+/i,
  /\bgrpc/i, /\bprotobuf/i, /\bkafka/i, /\brabbitmq/i,
  /\b"[^"]+"\s*:/, /^\s*\{/, /^\s*\[/, /^\s*-\s+\w+:/,
  /\bcurl\s+-/i, /\bnpm\s+/i, /\bdotnet\s+/i,
];
const CODE_STRONG_DOCKER = [
  /\bdocker\s+(run|build|pull|push|exec|ps|images|rmi|stop|start|rm|network|volume|compose|login|tag)\b/i,
  /\bdocker-compose\b/i, /^FROM\s+/i, /^RUN\s+/i, /^CMD\s+/i, /^ENTRYPOINT\s+/i,
  /^COPY\s+/i, /^WORKDIR\s+/i, /^EXPOSE\s+/i, /^ENV\s+/i, /^ARG\s+/i,
  /^ADD\s+/i, /^LABEL\s+/i, /^VOLUME\s+/i, /^USER\s+/i, /^HEALTHCHECK\s+/i,
  /^\s*-\s*["']?[\w./-]+:/, /host\.docker\.internal/i,
  /^\s*version:\s*["']?3/i, /^\s*services:/i,
];
const CODE_STRONG_K8S = [
  /\bapiVersion:/i, /\bkind:\s/i, /\bmetadata:/i, /\bspec:/i, /\bstatus:/i,
  /\bkubectl\s+(apply|get|describe|create|delete|edit|patch|scale|rollout|logs|exec|port-forward|config|cluster-info|auth|label|annotate|run|expose)\b/i,
  /\bhelm\s+(install|upgrade|uninstall|list|repo|search|template|rollback|status)\b/i,
  /\bnamespace:\s/i, /\bcontainers:/i, /\bselector:/i, /\breplicas:/i,
  /\bPersistentVolume/i, /\bStorageClass/i, /\bIngressClass/i,
  /^\s*-\s+name:/i, /^\s*---\s*$/, /\bport:\s*\d+/i, /\bimage:\s/i,
  /\benv:/i, /\bvolumeMounts:/i, /\bvolumes:/i, /\bnodeSelector:/i,
  /\btolerations:/i, /\baffinity:/i, /\blivenessProbe:/i, /\breadinessProbe:/i,
];
const CODE_STRONG_TEXT = [
  /\bIN\s+(A|AAAA|MX|TXT|NS|PTR|SRV|CNAME)\b/i,
  /\.in-addr\.arpa/i,
  /\bSELECT\b/i, /\bINSERT\b/i, /\bUPDATE\b/i, /\bDELETE\b/i,
  /<script/i, /document\.(write|getElementById)/i,
  /encodeURIComponent/i, /\.textContent\s*=/i,
  /^Copy code$/i,
  /^html$/i, /^javascript$/i, /^sql$/i, /^csharp$/i,
];
const CODE_STRONG = [
  ...CODE_STRONG_COMMON,
  ...(CODE_LANG === 'csharp' ? CODE_STRONG_CS
    : CODE_LANG === 'javascript' ? CODE_STRONG_JS
      : CODE_LANG === 'sql' ? CODE_STRONG_SQL
        : CODE_LANG === 'bash' ? CODE_STRONG_DOCKER
          : CODE_LANG === 'json' ? CODE_STRONG_MS
            : CODE_LANG === 'yaml' ? CODE_STRONG_K8S
              : CODE_LANG === 'text' ? CODE_STRONG_TEXT
                : CODE_STRONG_TS),
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

function isBlockquotePara(p) {
  return /^>\s?/.test(p) || p.split('\n').every((l) => /^>\s?/.test(l) || l.trim() === '' || /^>$/.test(l.trim()));
}

function blockquoteLines(p) {
  const codeLines = [];
  p.split('\n').forEach((l) => {
    const stripped = l.replace(/^>\s?/, '').replace(/^>$/, '');
    codeLines.push(unescapeCommon(stripped));
  });
  return codeLines.filter((l) => l.trim() !== '');
}

function blockquoteLooksLikeCode(lines) {
  if (!lines.length) return false;
  if (lines.some((l) => looksStrongCode(l) || looksWeakCode(l))) return true;
  if (lines.some((l) => /^\s*--/.test(l))) return true;
  const joined = lines.join(' ');
  if (/^(Example|Output|Result|Syntax|Usage|Step \d+)/i.test(stripBold(joined)) && lines.length <= 2) return false;
  return lines.length > 2;
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
  // Title: bold first line, or derive from filename (skip numbered section labels)
  if (paras.length && isBoldOnly(paras[0])) {
    const firstBold = boldText(paras[0]);
    if (/^\d+\.\s+/.test(firstBold) && fileBaseName) {
      out.push(`# ${fileBaseName}`);
      out.push('');
    } else {
      out.push(`# ${unescapeCommon(firstBold)}`);
      out.push('');
      i = 1;
    }
  } else if (fileBaseName) {
    out.push(`# ${fileBaseName}`);
    out.push('');
  }

  // Skip blockquote section titles (e.g. > **SQL Basics**) before TOC
  while (i < paras.length && isBlockquotePara(paras[i])) {
    const bq = blockquoteLines(paras[i]);
    if (blockquoteLooksLikeCode(bq)) break;
    i++;
  }

  // Collect TOC numbered items (may include **bold** questions)
  const toc = [];
  while (i < paras.length) {
    const m = paras[i].match(/^\s*\d+\.\s+(.*)$/s);
    if (m && !isBoldOnly(paras[i])) {
      const q = stripBold(unescapeCommon(m[1].replace(/\s+/g, ' ').trim()));
      toc.push(q);
      questionKeys.add(normKey(q));
      questionKeys.add(normKey(q.replace(/^\d+\.\s*/, '')));
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
      const raw = unescapeCommon(boldText(p)).replace(/:+$/, '');
      const t = raw.replace(/^\d+\.\s*/, '');
      if (questionKeys.has(normKey(t)) || questionKeys.has(normKey(raw)) || /\?$/.test(t)) {
        out.push(`## ${t}`);
      } else {
        out.push(`### ${raw}`);
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

    if (isBlockquotePara(p)) {
      const codeLines = [];
      while (j < rest.length && isBlockquotePara(rest[j])) {
        codeLines.push(...blockquoteLines(rest[j]));
        j++;
      }
      if (!blockquoteLooksLikeCode(codeLines)) {
        for (const l of codeLines) {
          const t = l.trim();
          if (!t) continue;
          if (isBoldOnly(t)) out.push(`### ${unescapeCommon(boldText(t)).replace(/:+$/, '')}`);
          else out.push(unescapeCommon(l));
        }
        out.push('');
        continue;
      }
      out.push('```' + CODE_LANG);
      out.push(...codeLines);
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
    if (single && /^<img\s/i.test(p.trim())) {
      out.push(unescapeCommon(p));
      out.push('');
      j++;
      continue;
    }
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
  else if (topicLower.includes('sql')) cleaned = formatSqlServerClean(cleaned, baseName);
  else if (topicLower.includes('microservices')) cleaned = formatMicroservicesClean(cleaned, baseName);
  else if (topicLower.includes('system design')) cleaned = formatSystemDesignClean(cleaned, baseName);
  else if (topicLower.includes('docker')) cleaned = formatDockerClean(cleaned, baseName);
  else if (topicLower.includes('kubernetes')) cleaned = formatKubernetesClean(cleaned, baseName);
  else if (topicLower.includes('important concepts')) cleaned = formatImportantConceptsClean(cleaned, baseName);
  fs.writeFileSync(path.join(OUT, f), cleaned, 'utf8');
  console.log(`cleaned: ${f} (${raw.length} -> ${cleaned.length})`);
}
