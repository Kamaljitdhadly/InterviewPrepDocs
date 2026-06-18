import fs from 'node:fs';
import path from 'node:path';
import { formatFile as baseFormat } from './format-angular-clean.mjs';
import { dedupeMarkdown } from './dedupe-markdown.mjs';

function fixCopyCodeFences(text) {
  text = text.replace(/```\w*\n(\w+)\nCopy code\n([\s\S]*?)```/g, '```$1\n$2```');
  text = text.replace(/^([a-z#]+)\n\nCopy code\n\n(?=```)/gim, '');
  text = text.replace(/\nCopy code\n\n(?=```)/g, '\n');
  text = text.replace(/^([a-z#]+)\n\nCopy code\n\n/gm, '');
  return text;
}

function fixImagePaths(text) {
  return text.replace(/(<img src=")([^"]+)"/g, (_, pre, src) => `${pre}${src.replace(/\\/g, '/')}"`);
}

function unwrapNonCommandFences(text) {
  return text.replace(/```bash\n([\s\S]*?)```/g, (match, body) => {
    const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.some((l) => /^(az|git|openssl|ls |cd |mkdir|rm |cp |mv |cat |grep |chmod|chown|sudo|curl|wget|ssh|scp|echo|export|source|pwd|head|tail|find|sort|uniq|wc |df |du |ps |kill|tar |gzip)\b/i.test(l))) return match;
    if (lines.some((l) => /\b(ls|cd|pwd|mkdir|rm|cp|mv|cat|grep)\b/.test(l) && /#/.test(l))) return match;
    if (lines.some((l) => /^git\s/i.test(l))) return match;
    if (lines.some((l) => /^openssl\s/i.test(l))) return match;
    return lines.join('\n\n');
  });
}

function promoteNumberedSections(text) {
  if (text.includes('## Questions Covered')) return text;
  return text.split('\n').map((line) => {
    if (/^###\s+\d+\.\s+/.test(line)) return line.replace(/^###/, '##');
    if (/^###\s+\d+\)/.test(line)) return line.replace(/^###/, '##');
    return line;
  }).join('\n');
}

export function formatFile(raw, fileBaseName = '') {
  let t = baseFormat(raw, fileBaseName);
  t = fixCopyCodeFences(t);
  t = fixImagePaths(t);
  t = unwrapNonCommandFences(t);
  t = promoteNumberedSections(t);
  t = dedupeMarkdown(t);
  return t;
}
