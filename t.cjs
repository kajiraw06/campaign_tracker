const fs=require('fs');
const nc=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const isLv=n=>n==='livestream'||n==='live'||n==='lives'||n==='streams'||((n.includes('live')||n.includes('stream'))&&(n.includes('count')||n.includes('total')));
const isRl=n=>n==='reels'||n==='reel'||(n.includes('reel')&&(n.includes('count')||n.includes('total')));
const isNm=n=>n.includes('talent')||n.includes('streamer')||n==='name';
function det(cells){let nm=-1,lv=-1,rl=-1;cells.forEach((c,i)=>{const n=nc(c);if(isLv(n))lv=i;if(isRl(n))rl=i;});if(lv<0||rl<0)return null;const lb=Math.min(lv,rl);for(let i=lb-1;i>=0;i--){const n=nc(cells[i]);if(n.length>0){if(isNm(n)||i<lb-1){nm=i;break;}if(nm<0)nm=i;}}if(nm<0&&lb>0)nm=lb-1;return{nm,lv,rl};}
function parseLine(line){const r=[];let c='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){q=!q;}else if(ch===','&&!q){r.push(c.trim());c='';}else c+=ch;}r.push(c.trim());return r;}
function cn(v){return parseFloat((v+'').replace(/[^0-9.-]/g,''))||0;}
const skip=n=>(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(n))||(/\d.*-.*\d/.test(n));
['ROLLEM','WFL'].forEach(function(s){
  const path='j:/For Work/campaign_tracker/MEDIA BUYER & TALENTS _ TRACKER - '+s+'.csv';
  const text=fs.readFileSync(path,'utf8');
  const lines=text.split(/\r?\n/).filter(function(l){return l.replace(/[,\t\s]/g,'').length>0;});
  const hkw=['date','talent','streamer','cost','format','link'];
  var hi=0,bs=0;
  for(var i=0;i<Math.min(lines.length,10);i++){var cells=parseLine(lines[i]);var sc=cells.reduce(function(a,c){var n=nc(c);return a+(hkw.some(function(k){return n.includes(k);})?1:0);},0);if(sc>bs){bs=sc;hi=i;}}
  var hdrs=parseLine(lines[hi]);
  var rows=lines.slice(hi+1).map(function(l){return parseLine(l);});
  var mc=det(hdrs);
  var site=s==='ROLLEM'?'rlm':'wfl';
  console.log('\n===',s,'mainSideCols:',JSON.stringify(mc));
  if(mc){
    var nm=mc.nm,lv=mc.lv,rl=mc.rl;
    var t={};
    rows.forEach(function(cells){var name=(cells[nm]||'').trim();var live=Math.round(cn(cells[lv]||0));var reels=Math.round(cn(cells[rl]||0));if(!name||skip(name)||(!live&&!reels))return;if(t[name]){t[name].live+=live;t[name].reels+=reels;}else t[name]={live:live,reels:reels};});
    Object.keys(t).forEach(function(k){console.log(' KEY: "'+site+'|'+k.toLowerCase()+'" ->', JSON.stringify(t[k]));});
  }
});
