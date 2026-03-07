  const fs = require('fs');
const text = fs.readFileSync('j:/For Work/campaign_tracker/MEDIA BUYER & TALENTS _ TRACKER - ROLLEM.csv', 'utf8');

function parseCsvLine(line, delim) {
  const result = []; let cur = ''; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; }
    else if (ch === delim && !inQ) { result.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  result.push(cur.trim());
  return result;
}

function cleanNum(v) {
  if (typeof v === 'number') return v;
  return parseFloat((v+'').replace(/[^0-9.\-]/g,'')) || 0;
}

const lines = text.split(/\r?\n/).filter(l => l.replace(/[,\t\s]/g,'').length > 0);
const delim = ',';
const headerKeywords = ['date','livestreamdate','name','talentsname','talent','streamer','cost','spend','format','link','reg','dep','site'];
const normH = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
let headerLineIdx = 0, bestScore = 0;
for (let i = 0; i < Math.min(lines.length, 10); i++) {
  const cells = parseCsvLine(lines[i], delim);
  const score = cells.filter(c => c.trim()).reduce((acc, c) => {
    const n = normH(c);
    return acc + (headerKeywords.some(k => n === k || n.includes(k)) ? 1 : 0);
  }, 0);
  if (score > bestScore) { bestScore = score; headerLineIdx = i; }
}
const headers = parseCsvLine(lines[headerLineIdx], delim);
const rows = lines.slice(headerLineIdx + 1).map(l => parseCsvLine(l, delim));
console.log('Header row idx:', headerLineIdx);
console.log('Headers:', headers.map((h, i) => h.trim() ? i + ':' + h.trim() : '').filter(Boolean));

const nc = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const isLiveCountHeader = n =>
  ((n.includes('live') || n.includes('stream')) && (n.includes('count') || n.includes('total') || n.includes('num'))) ||
  n === 'livestream' || n === 'live' || n === 'lives' || n === 'streams' || n === 'livestreams';
const isReelsCountHeader = n =>
  (n.includes('reel') && (n.includes('count') || n.includes('total') || n.includes('num'))) ||
  n === 'reels' || n === 'reel';
const isNameHeader = n => n.includes('talent') || n.includes('streamer') || n.includes('creator') || n === 'name';

const detectSideCols = (cells) => {
  let nameCol = -1, liveCol = -1, reelsCol = -1;
  cells.forEach((c, ci) => {
    const n = nc(c);
    if (isLiveCountHeader(n)) liveCol = ci;
    if (isReelsCountHeader(n)) reelsCol = ci;
  });
  if (liveCol < 0 || reelsCol < 0) return null;
  const leftBound = Math.min(liveCol, reelsCol);
  for (let ci = leftBound - 1; ci >= 0; ci--) {
    const n = nc(cells[ci]);
    if (n.length > 0) {
      if (isNameHeader(n) || ci < leftBound - 1) { nameCol = ci; break; }
      if (nameCol < 0) nameCol = ci;
    }
  }
  if (nameCol < 0 && leftBound > 0) nameCol = leftBound - 1;
  return { nameCol, liveCol, reelsCol };
};

const mainSideCols = detectSideCols(headers);
console.log('mainSideCols:', mainSideCols);

if (mainSideCols) {
  const { nameCol, liveCol, reelsCol } = mainSideCols;
  console.log('nameCol header:', JSON.stringify(headers[nameCol]));
  console.log('liveCol header:', JSON.stringify(headers[liveCol]));
  console.log('reelsCol header:', JSON.stringify(headers[reelsCol]));
  
  // Build final sideTable (inline layout — no date-skip filter)
  const MONTH_RE = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
  const looksLikeSectionName = name =>
    MONTH_RE.test(name.trim()) || /\d.*[-].*\d/.test(name) || /^(total|grand total|summary|subtotal)$/i.test(name.trim());

  const sideTable = {};
  rows.forEach((cells, ri) => {
    const name  = (cells[nameCol] || '').trim();
    const live  = Math.round(cleanNum(cells[liveCol]  || 0));
    const reels = Math.round(cleanNum(cells[reelsCol] || 0));
    if (!name || looksLikeSectionName(name)) return;
    if (live === 0 && reels === 0) return;
    if (sideTable[name]) { sideTable[name].live += live; sideTable[name].reels += reels; }
    else { sideTable[name] = { live, reels }; }
  });
  console.log('\n=== FINAL sideTable ===');
  console.log(JSON.stringify(sideTable, null, 2));
}
