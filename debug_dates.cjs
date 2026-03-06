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

const t = fs.readFileSync('MEDIA BUYER & TALENTS _ TRACKER - WFL.csv', 'utf8');
const lines = t.replace(/\r/g, '').split('\n').filter(l => l.replace(/[,;\t\s]/g, '').length > 0);
const rows = lines.slice(2).map(l => parseCsvLine(l, ','));
const dates = rows.map(r => r[0]).filter(Boolean);
const sorted = [...new Set(dates)].sort();
console.log('WFL date range:', sorted[0], '->', sorted[sorted.length - 1]);
console.log('Has Feb dates:', sorted.some(d => d.startsWith('2/')));
console.log('Total data rows:', rows.length);

// Also check last 5 rows
console.log('\nLast 5 date values:');
rows.slice(-5).forEach(r => console.log(' ', r[0], '|', r[1]));
