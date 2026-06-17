/**
 * Remove verbatim duplicate prose paragraphs within a markdown document.
 * Preserves code fences, headings, tables, and short fragments (< minLen).
 */

function normPara(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '');
}

function splitBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim().startsWith('```')) {
      const block = [lines[i]];
      i++;
      while (i < lines.length) {
        block.push(lines[i]);
        if (lines[i].trim() === '```' && block.length > 1) { i++; break; }
        i++;
      }
      blocks.push({ type: 'code', text: block.join('\n') });
      continue;
    }
    if (lines[i].trim() === '') { i++; continue; }
    const start = i;
    while (i < lines.length && lines[i].trim() !== '') {
      if (lines[i].trim().startsWith('```')) break;
      i++;
    }
    blocks.push({ type: 'para', text: lines.slice(start, i).join('\n') });
  }
  return blocks;
}

function isStructural(block) {
  const t = block.text.trim();
  if (!t) return true;
  if (/^#{1,6}\s/.test(t)) return true;
  if (/^\|/.test(t)) return true;
  if (/^[-*+]\s/.test(t) || /^\d+\.\s/.test(t)) return false; // lists deduped separately
  return false;
}

function dedupeSection(blocks, minLen = 80) {
  const seen = new Set();
  const out = [];
  let lastNorm = '';

  for (const block of blocks) {
    if (block.type === 'code') {
      out.push(block);
      lastNorm = '';
      continue;
    }

    const t = block.text.trim();
    if (/^#{1,6}\s/.test(t)) {
      seen.clear();
      lastNorm = '';
      out.push(block);
      continue;
    }

    const n = normPara(t);
    if (n.length < minLen) {
      out.push(block);
      if (n.length > 20) lastNorm = n;
      continue;
    }

    // skip consecutive duplicate
    if (n === lastNorm) continue;
    // skip global duplicate within section (after last heading)
    if (seen.has(n)) continue;

    seen.add(n);
    lastNorm = n;
    out.push(block);
  }
  return out;
}

export function dedupeMarkdown(text) {
  // split on ## headings to reset seen sets per answer section
  const parts = text.split(/(?=^## )/m);
  const out = [];

  for (const part of parts) {
    if (!part.trim()) continue;
    const lines = part.split('\n');
    const first = lines[0]?.trim() ?? '';
    if (first.startsWith('## ')) {
      out.push(first);
      const body = lines.slice(1).join('\n');
      const blocks = splitBlocks(body);
      const deduped = dedupeSection(blocks);
      const bodyOut = deduped.map((b) => b.text).filter(Boolean).join('\n\n');
      if (bodyOut) out.push('', bodyOut);
    } else {
      const blocks = splitBlocks(part);
      const deduped = dedupeSection(blocks);
      out.push(deduped.map((b) => b.text).filter(Boolean).join('\n\n'));
    }
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}
