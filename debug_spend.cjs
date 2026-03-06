const fs = require('fs');

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

function cleanNum(val) {
  if (val === null || val === undefined || val === '') return 0;
  return parseFloat(String(val).replace(/[₱$¥€£,\s]/g, '')) || 0;
}

const files = [
  'MEDIA BUYER & TALENTS _ TRACKER - WFL.csv',
  'MEDIA BUYER & TALENTS _ TRACKER - ROLLEM.csv',
  'T2B MEDIA BUYER TRACKER - February Data.csv'
];

const headerKeywords = [
  'date','livestreamdate','streamdate','name','talentsname','talent','streamer','creator','influencer',
  'cost','spend','adspend','budget','boost','boosting',
  'format','type','contenttype',
  'link','url',
  'reg','register','registrations','signups','newreg',
  'dep','deposit','deposits','fd','ftd',
  'site','platform','page',
];

const matchers = {
  date:     ['livestreamdate','streamdate','dateofstream','date','day'],
  site:     ['site','platform','sitename'],
  streamer: ['talentsname','talentname','streamer','creator','influencer','contentcreator','talent','name'],
  spend:    ['adspend','adcost','adbudget','spend','cost','budget','boosting','boost'],
  reg:      ['newreg','newregistrations','reg','register','registers','registrations','signups','signup'],
  dep:      ['totaldeposit','firstdeposit','ftd','fd','dep','deposit','deposits'],
  type:     ['contenttype','streamtype','posttype','type','format'],
  link:     ['livestreamlink','streamlink','adtrackinglink','link','url'],
};

files.forEach(fname => {
  console.log('\n===', fname);
  const text = fs.readFileSync(fname, 'utf8');
  const lines = text.replace(/\r/g,'').split('\n').filter(l => l.replace(/[,;\t\s]/g,'').length > 0);

  const normH = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let headerLineIdx = 0, bestScore = 0;
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const cells = parseCsvLine(lines[i], ',');
    const score = cells.filter(c => c.trim()).reduce((acc, c) => {
      const n = normH(c);
      return acc + (headerKeywords.some(k => n === k || n.includes(k)) ? 1 : 0);
    }, 0);
    if (score > bestScore) { bestScore = score; headerLineIdx = i; }
  }
  const headers = parseCsvLine(lines[headerLineIdx], ',');
  console.log('Header row idx:', headerLineIdx, 'score:', bestScore);
  console.log('Headers:', headers.map((h, i) => h.trim() ? i + ':' + h.trim() : '').filter(Boolean));

  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const mapping = {};
  headers.forEach((h, i) => {
    const n = norm(h);
    for (const [field, ms] of Object.entries(matchers)) {
      if (mapping[field] === undefined && ms.some(m => n === m || n.includes(m))) {
        mapping[field] = String(i);
      }
    }
  });
  console.log('Mapping:', mapping);

  const rows = lines.slice(headerLineIdx + 1).map(l => parseCsvLine(l, ','));
  if (mapping.spend !== undefined && rows.length > 0) {
    const idx = parseInt(mapping.spend);
    console.log('spend col idx:', idx, 'header:', headers[idx]);
    console.log('First spend raw values:', rows.slice(0, 3).map(r => r[idx]));
    console.log('First spend cleaned:', rows.slice(0, 3).map(r => cleanNum(r[idx])));
  } else {
    console.log('spend NOT mapped!');
    // Show all header/norm pairs to help debug
    console.log('All header norms:', headers.map((h, i) => i + ':' + norm(h)).filter((_, i) => headers[i].trim()));
  }
});
