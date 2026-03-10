import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Brush } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign, Users, Calendar, Filter, Video, VideoOff, Radio, ExternalLink, Plus, Trash2, Edit2, X, BarChart2, Activity, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';
import * as XLSX from 'xlsx';


// ─── BUILT-IN STREAMER ALIAS DICTIONARY ───────────────────────────────────
// Maps normalised CSV header/section names → canonical streamer display names.
// Works even when the app has zero existing data (no dependency on stored entries).
const STREAMER_ALIASES = {
  // ── WFL ──
  holyfather: 'HolyFather',          holyfatherreels: 'HolyFather',
  holyfatherpage: 'HolyFather',      holyfatherlive: 'HolyFather',
  jasoon: 'Jason',                   jasonreels: 'Jason',
  jason: 'Jason',                    itsj4soon: 'Jason',
  itsmeJ4soon: 'Jason',
  neggytv: 'Neggy',                  neggy: 'Neggy',
  neggytvofficial: 'Neggy',          neggyreels: 'Neggy',
  aether: 'WoolFyBets',              woolfybets: 'WoolFyBets',
  woolfybetsad: 'WoolFyBets',            woolfybetsreels: 'WoolFyBets',
  teamaether: 'WoolFyBets',              teamaetherreels: 'WoolFyBets',
  ghostwrecker: 'Wrecker',      bosswrecker: 'Wrecker',
  wrecker: 'Wrecker',           wreckeread: 'Wrecker',
  ato: 'ATO',                        atoclasss: 'ATO',
  atoclassworldwide: 'ATO',          atoclasssworld: 'ATO',
  wflato: 'ATO',
  wflaffiliate: 'WFL Affiliate',     wflaffliates: 'WFL Affiliate',
  // ── RLM ──
  pepper: 'Pepper',                  akosipep: 'Pepper',
  akosipepvt: 'Pepper',              pep: 'Pepper',
  aj: 'AJ',                          apriljoy: 'AJ',
  apriljoybad: 'AJ',                 apriljoylive: 'AJ',
  wflajad: 'AJ',                     wflajreels: 'AJ',
  ajheib: 'AJ',
  yuji: 'Yuji',                      magedad: 'Yuji',
  magedadyuji: 'Yuji',               magedadyujii: 'Yuji',
  yujimagedad: 'Yuji',
  jape: 'Jape',                      japealdea: 'Jape',
  japealdealive: 'Jape',
  kim: 'Kim',                        kimsolis: 'Kim',
  sainty: 'Sainty',                  saintymaxwin: 'Sainty',
  saintymaxwinreels: 'Sainty',
  chadkinis: 'Chadkinis',            chad: 'Chadkinis',
  chadkinislive: 'Chadkinis',        chadkinisreels: 'Chadkinis',
  // ── T2B ──
  time2bet: 'T2B Affiliate',
  akosidogie: 'Dogie',   dogie: 'Dogie',
  yawi: 'Yawi',
  renejay: 'Renejay',
  h2wo: 'H2wo',
  ribo: 'Ribo',
  zico: 'Zico',
  // ── COW ──
  cow: 'COW Affiliate',
};

// Helper: split array into chunks for Firestore batch (max 500 ops)
function chunkArray(arr, size = 400) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size));
  return chunks;
}

// ─── Date Range Picker ───────────────────────────────────────────────────────
function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, minDate, maxDate }) {
  const [open, setOpen] = React.useState(false);
  const [hoverDate, setHoverDate] = React.useState(null);
  const [stage, setStage] = React.useState('start'); // 'start' | 'end'
  const [showPresets, setShowPresets] = React.useState(false);
  const ref = React.useRef(null);

  const parsedStart = startDate ? new Date(startDate + 'T00:00:00') : new Date();
  const [leftYear, setLeftYear] = React.useState(parsedStart.getFullYear());
  const [leftMonth, setLeftMonth] = React.useState(parsedStart.getMonth());

  const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
  const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setShowPresets(false); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const MNAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const DNAMES = ['S','M','T','W','T','F','S'];

  const toYMD = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const todayYMD = () => { const d = new Date(); return toYMD(d.getFullYear(), d.getMonth(), d.getDate()); };
  const fmt = (s) => { if (!s) return '—'; const [y,m,d] = s.split('-'); return `${MNAMES[+m-1]} ${+d}, ${y}`; };

  const prevMonth = () => { if (leftMonth === 0) { setLeftYear(y => y-1); setLeftMonth(11); } else setLeftMonth(m => m-1); };
  const nextMonth = () => { if (leftMonth === 11) { setLeftYear(y => y+1); setLeftMonth(0); } else setLeftMonth(m => m+1); };

  const handleDayClick = (ymd) => {
    if (stage === 'start') {
      onStartChange(ymd); onEndChange(ymd);
      setStage('end');
    } else {
      if (ymd < startDate) { onStartChange(ymd); setStage('end'); }
      else { onEndChange(ymd); setStage('start'); setOpen(false); }
    }
  };

  const applyPreset = (key) => {
    const tm = new Date();
    const toYMDd = (d) => toYMD(d.getFullYear(), d.getMonth(), d.getDate());
    const today = toYMDd(tm);
    const nd = (n) => { const s = new Date(); s.setDate(s.getDate()-(n-1)); return toYMDd(s); };

    // yesterday
    const yd = new Date(tm); yd.setDate(tm.getDate()-1);
    const yesterday = toYMDd(yd);

    // this week Mon–today
    const twStart = new Date(tm); twStart.setDate(tm.getDate() - ((tm.getDay()+6)%7));

    // last week Mon–Sun
    const lwEnd = new Date(twStart); lwEnd.setDate(twStart.getDate()-1);
    const lwStart = new Date(lwEnd); lwStart.setDate(lwEnd.getDate()-6);

    // this month
    const tmStart = new Date(tm.getFullYear(), tm.getMonth(), 1);
    const tmEnd   = new Date(tm.getFullYear(), tm.getMonth()+1, 0);

    // last month
    const lmStart = new Date(tm.getFullYear(), tm.getMonth()-1, 1);
    const lmEnd   = new Date(tm.getFullYear(), tm.getMonth(), 0);

    // this quarter
    const q = Math.floor(tm.getMonth()/3);
    const tqStart = new Date(tm.getFullYear(), q*3, 1);
    const tqEnd   = new Date(tm.getFullYear(), q*3+3, 0);

    // last quarter
    const lq = (q - 1 + 4) % 4;
    const lqYear = q === 0 ? tm.getFullYear()-1 : tm.getFullYear();
    const lqStart = new Date(lqYear, lq*3, 1);
    const lqEnd   = new Date(lqYear, lq*3+3, 0);

    // this year
    const tyStart = new Date(tm.getFullYear(), 0, 1);
    const tyEnd   = new Date(tm.getFullYear(), 11, 31);

    // last year
    const lyStart = new Date(tm.getFullYear()-1, 0, 1);
    const lyEnd   = new Date(tm.getFullYear()-1, 11, 31);

    const presets = {
      today:        [today, today],
      yesterday:    [yesterday, yesterday],
      thisweek:     [toYMDd(twStart), today],
      lastweek:     [toYMDd(lwStart), toYMDd(lwEnd)],
      thismonth:    [toYMDd(tmStart), toYMDd(tmEnd)],
      lastmonth:    [toYMDd(lmStart), toYMDd(lmEnd)],
      thisquarter:  [toYMDd(tqStart), toYMDd(tqEnd)],
      lastquarter:  [toYMDd(lqStart), toYMDd(lqEnd)],
      thisyear:     [toYMDd(tyStart), toYMDd(tyEnd)],
      lastyear:     [toYMDd(lyStart), toYMDd(lyEnd)],
      last7:        [nd(7), today],
      last14:       [nd(14), today],
      last28:       [nd(28), today],
      last30:       [nd(30), today],
      last90:       [nd(90), today],
    };
    if (presets[key]) { onStartChange(presets[key][0]); onEndChange(presets[key][1]); }
    setShowPresets(false); setOpen(false); setStage('start');
  };

  const renderCal = (year, month) => {
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const today = todayYMD();
    const effectiveEnd = stage === 'end' && hoverDate && hoverDate >= startDate ? hoverDate : endDate;

    return (
      <div className="w-52">
        <div className="grid grid-cols-7 mb-2">
          {DNAMES.map((d, i) => <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={idx} />;
            const ymd = toYMD(year, month, day);
            const isStart = ymd === startDate;
            const isEnd   = ymd === effectiveEnd;
            const inRange = ymd > startDate && ymd < effectiveEnd;
            const isDisabled = (minDate && ymd < minDate) || (maxDate && ymd > maxDate);
            const isToday = ymd === today;
            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => handleDayClick(ymd)}
                onMouseEnter={() => setHoverDate(ymd)}
                onMouseLeave={() => setHoverDate(null)}
                className={[
                  'h-8 w-full text-xs font-medium transition-all select-none',
                  isDisabled ? 'text-slate-300 cursor-not-allowed' : 'cursor-pointer',
                  isStart ? 'bg-indigo-600 text-white rounded-l-full' : '',
                  isEnd && isStart ? 'rounded-full' : isEnd ? 'bg-indigo-600 text-white rounded-r-full' : '',
                  inRange ? 'bg-indigo-100 text-indigo-800' : '',
                  !isStart && !isEnd && !inRange && !isDisabled ? 'hover:bg-indigo-50 rounded-full' : '',
                  isToday && !isStart && !isEnd ? 'font-bold underline decoration-indigo-400' : '',
                ].filter(Boolean).join(' ')}
              >{day}</button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen(o => !o); setStage('start'); setShowPresets(false); }}
        className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 text-xs font-medium text-slate-700 hover:border-indigo-400 transition-colors"
      >
        <Calendar size={14} className="text-slate-400" />
        {startDate && endDate ? (
          <>
            <span className="font-semibold text-indigo-700">{fmt(startDate)}</span>
            <span className="text-slate-300">–</span>
            <span className="font-semibold text-indigo-700">{fmt(endDate)}</span>
          </>
        ) : (
          <span className="text-slate-400 italic">Select date range…</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 min-w-max">
          {/* Header */}
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-700">Select date range</span>
            <div className="relative">
              <button
                onClick={() => setShowPresets(p => !p)}
                className="flex items-center gap-1.5 text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-50 font-medium"
              >
                Quick select <span className="text-slate-400 text-[10px]">▾</span>
              </button>
              {showPresets && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 w-48 overflow-hidden">
                  {/* --- Relative --- */}
                  <div className="px-4 pt-1 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relative</div>
                  {[
                    { label: 'Today',          key: 'today' },
                    { label: 'Yesterday',      key: 'yesterday' },
                    { label: 'This week',      key: 'thisweek' },
                    { label: 'Last week',      key: 'lastweek' },
                    { label: 'This month',     key: 'thismonth' },
                    { label: 'Last month',     key: 'lastmonth' },
                    { label: 'This quarter',   key: 'thisquarter' },
                    { label: 'Last quarter',   key: 'lastquarter' },
                    { label: 'This year',      key: 'thisyear' },
                    { label: 'Last year',      key: 'lastyear' },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className="w-full text-left px-4 py-1.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >{p.label}</button>
                  ))}
                  {/* --- Last N days --- */}
                  <div className="px-4 pt-2 pb-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-t border-slate-100 mt-1">Last N days</div>
                  {[
                    { label: 'Last 7 days',   key: 'last7' },
                    { label: 'Last 14 days',  key: 'last14' },
                    { label: 'Last 28 days',  key: 'last28' },
                    { label: 'Last 30 days',  key: 'last30' },
                    { label: 'Last 90 days',  key: 'last90' },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className="w-full text-left px-4 py-1.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >{p.label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendars */}
          <div className="flex gap-6">
            {/* Left */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">‹</button>
                <span className="text-xs font-bold text-slate-700 tracking-wide">{MNAMES[leftMonth]} {leftYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">›</button>
              </div>
              {renderCal(leftYear, leftMonth)}
            </div>

            <div className="w-px bg-slate-100" />

            {/* Right */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">‹</button>
                <span className="text-xs font-bold text-slate-700 tracking-wide">{MNAMES[rightMonth]} {rightYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-base leading-none">›</button>
              </div>
              {renderCal(rightYear, rightMonth)}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-400 italic">
              {stage === 'end' ? '📅 Now click an end date' : '📅 Click a start date'}
            </span>
            <button
              onClick={() => { setOpen(false); setStage('start'); }}
              className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
            >Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CUSTOM FILTER DROPDOWN ──────────────────────────────────────────────────
const ChevronIcon = ({open}) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}><polyline points="6 9 12 15 18 9"/></svg>
);
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const DropdownPanel = ({children, align='right', minWidth='140px'}) => (
  <div className={`absolute top-full ${align==='left'?'left-0':'right-0'} mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-indigo-100/40 dark:shadow-black/30 overflow-hidden z-50 py-1`} style={{minWidth, animation:'dropdownPop 0.15s cubic-bezier(0.22,1,0.36,1) both'}}>
    {children}
  </div>
);
const DropdownItem = ({active, onClick, children}) => (
  <button type="button" onClick={onClick} className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center gap-2 transition-colors ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300'}`}>
    {active ? <CheckIcon/> : <span className="w-[10px]"/>}
    {children}
  </button>
);

function FilterDropdown({ icon, value, options, allLabel, onChange, triggerClass }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const displayLabel = (allLabel && value === 'All') ? allLabel : value;
  const allOptions = allLabel ? ['All', ...options] : options;
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(o => !o)}
        className={triggerClass || `flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer select-none ${ open ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'}`}
      >
        {icon}
        <span className="max-w-[140px] truncate">{displayLabel}</span>
        <ChevronIcon open={open}/>
      </button>
      {open && (
        <DropdownPanel>
          {allOptions.map(opt => {
            const label = (allLabel && opt === 'All') ? allLabel : opt;
            const active = value === opt;
            return <DropdownItem key={opt} active={active} onClick={() => { onChange(opt); setOpen(false); }}>{label}</DropdownItem>;
          })}
        </DropdownPanel>
      )}
    </div>
  );
}

// ─── FORM SELECT (full-width, for modals & popovers) ─────────────────────────
function FormSelect({ value, onSelect, options, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} className={`relative ${className||''}`}>
      <button type="button" onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between gap-2 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer transition-colors hover:border-indigo-300 ${ open ? 'border-indigo-400 ring-2 ring-indigo-100' : ''}`}
      >
        <span>{value}</span>
        <ChevronIcon open={open}/>
      </button>
      {open && (
        <DropdownPanel align="left" minWidth="100%">
          {options.map(opt => (
            <DropdownItem key={opt} active={value===opt} onClick={() => { onSelect(opt); setOpen(false); }}>{opt}</DropdownItem>
          ))}
        </DropdownPanel>
      )}
    </div>
  );
}

export default function App() {
  // --- AUTH ---
  const { role, signOut, user } = useAuth();
  const isAdmin = role === 'admin';

  // --- DATA STATE (Supabase) ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRows = async (table, extraQuery) => {
    const PAGE = 1000;
    let all = [], from = 0;
    while (true) {
      let q = supabase.from(table).select('*').range(from, from + PAGE - 1);
      if (extraQuery) q = extraQuery(q);
      else q = q.order('key', { ascending: true }); // stable pagination order
      const { data: rows, error } = await q;
      if (error) {
        console.error(`[fetchAllRows] ${table} page ${from}: error`, error.message || error);
        break;
      }
      if (!rows || rows.length === 0) break;
      all = all.concat(rows);
      console.log(`[fetchAllRows] ${table} page ${from}: got ${rows.length} rows (total so far: ${all.length})`);
      if (rows.length < PAGE) break;
      from += PAGE;
    }
    return all;
  };

  const fetchData = async () => {
    setLoading(true);
    const rows = await fetchAllRows('campaigns', q => q.order('date', { ascending: true }));
    if (rows.length > 0) {
      const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const normalized = rows.map(r => {
        const alias = STREAMER_ALIASES[norm(r.streamer)];
        return alias ? { ...r, streamer: alias } : r;
      });
      setData(normalized);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- VIEW STATE ---
  const [activeView, setActiveView] = useState('dashboard');
  const [reportSubTab, setReportSubTab] = useState('ads');

  // --- DARK MODE ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // --- LAYOUT MODE ---
  const [layoutMode, setLayoutMode] = useState(() => {
    const saved = localStorage.getItem('layoutMode') || 'stretched';
    document.documentElement.classList.toggle('compact', saved === 'compact');
    return saved;
  });
  useEffect(() => {
    localStorage.setItem('layoutMode', layoutMode);
    document.documentElement.classList.toggle('compact', layoutMode === 'compact');
  }, [layoutMode]);

  // --- DISCLAIMER ---
  const [showDisclaimer, setShowDisclaimer] = useState(() => localStorage.getItem('disclaimerDismissed') !== 'true');
  const dismissDisclaimer = () => { setShowDisclaimer(false); localStorage.setItem('disclaimerDismissed', 'true'); };

  // --- ADS REPORT DATA ---
  const [adsReportData, setAdsReportData] = useState({});
  const fetchAdsReport = async () => {
    const rows = await fetchAllRows('ads_report');
    if (rows.length === 0) return;
    const obj = {};
    rows.forEach(r => { obj[r.key] = { ggr: r.ggr, bonus: r.bonus, ngr: r.ngr, boosting: r.boosting }; });
    setAdsReportData(prev => ({ ...prev, ...obj }));
  };
  useEffect(() => { fetchAdsReport(); }, []);

  // --- CREATOR PERF DATA ---
  const [creatorPerfData, setCreatorPerfData] = useState({});
  const fetchCreatorPerf = async () => {
    const rows = await fetchAllRows('creator_perf');
    console.log('[fetchCreatorPerf] total rows fetched:', rows.length);
    if (rows.length === 0) return;
    const obj = {};
    rows.forEach(r => {
      obj[r.key] = { ggr: r.ggr, bonus: r.bonus, ngr: r.ngr, activePl: r.active_pl, validTurnover: r.valid_turnover, totalWithdrawal: r.total_withdrawal, reg: r.reg, dep: r.dep, status: r.status };
    });
    console.log('[fetchCreatorPerf] sample keys:', Object.keys(obj).slice(0, 3));
    setCreatorPerfData(prev => ({ ...prev, ...obj }));
  };
  useEffect(() => { fetchCreatorPerf(); }, []);

  // --- NO STREAM DATA ---
  const [noStreamData, setNoStreamData] = useState({});
  const fetchNoStream = async () => {
    const rows = await fetchAllRows('no_stream');
    if (rows.length === 0) return;
    const obj = {};
    rows.forEach(r => { obj[r.key] = true; });
    setNoStreamData(prev => ({ ...prev, ...obj }));
  };
  useEffect(() => { fetchNoStream(); }, []);

  // --- STREAM TALLY (live/reels counts from CSV side table, persisted to localStorage) ---
  const [streamTally, setStreamTally] = useState(() => {
    try { return JSON.parse(localStorage.getItem('streamTally') || '{}'); } catch { return {}; }
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const importRawRef = useRef({ name: '', content: '', size: 0 });

  const fetchUploadedFiles = async () => {
    const { data: rows } = await supabase.from('uploaded_files').select('*').order('uploaded_at', { ascending: false });
    if (rows) setUploadedFiles(rows);
  };
  useEffect(() => { fetchUploadedFiles(); }, []);

  // --- REFRESH ---
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchData(), fetchAdsReport(), fetchCreatorPerf(), fetchNoStream(), fetchUploadedFiles()]);
    setRefreshing(false);
  };

  const saveFileRecord = async (extraInfo = '') => {
    const { name, content, size, binaryContent } = importRawRef.current;
    if (!name) return;
    const record = {
      file_name: name,
      uploaded_at: new Date().toISOString(),
      uploaded_by: user?.email ?? 'unknown',
      file_size: size,
      file_type: name.split('.').pop().toLowerCase(),
      extra_info: extraInfo,
      file_content: content,
      // For XLSX files, store the raw bytes as base64 so the file can be downloaded intact
      ...(binaryContent ? { file_content_binary: binaryContent } : {}),
    };
    const { data: saved } = await supabase.from('uploaded_files').insert([record]).select();
    if (saved) setUploadedFiles(prev => [saved[0], ...prev]);
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Remove this file record?')) return;
    await supabase.from('uploaded_files').delete().eq('id', id);
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDownloadFile = (file) => {
    const ext = (file.file_name || '').split('.').pop().toLowerCase();
    const isXlsx = ext === 'xlsx' || ext === 'xls';
    let blob;
    if (isXlsx && file.file_content_binary) {
      // Stored as base64 for XLSX
      const binary = atob(file.file_content_binary);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    } else {
      blob = new Blob([file.file_content || ''], { type: 'text/csv' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- ADS EDIT MODAL STATE ---
  const [showAdsModal, setShowAdsModal] = useState(false);
  const [adsEditKey, setAdsEditKey] = useState(null);
  const [adsEditLabel, setAdsEditLabel] = useState('');
  const emptyAdsForm = { ggr: '', bonus: '', ngr: '', boosting: '' };
  const [adsFormValues, setAdsFormValues] = useState(emptyAdsForm);

  const openAdsEditModal = (site, streamer, type, label) => {
    const key = `${site}|${streamer}|${type}`;
    setAdsEditKey(key);
    setAdsEditLabel(label);
    const existing = adsReportData[key] || {};
    setAdsFormValues({
      ggr: existing.ggr !== undefined ? String(existing.ggr) : '',
      bonus: existing.bonus !== undefined ? String(existing.bonus) : '',
      ngr: existing.ngr !== undefined ? String(existing.ngr) : '',
      boosting: existing.boosting !== undefined ? String(existing.boosting) : '',
    });
    setShowAdsModal(true);
  };

  const handleAdsSave = async () => {
    const val = {
      ggr: parseFloat(adsFormValues.ggr) || 0,
      bonus: parseFloat(adsFormValues.bonus) || 0,
      ngr: parseFloat(adsFormValues.ngr) || 0,
      boosting: parseFloat(adsFormValues.boosting) || 0,
    };
    await supabase.from('ads_report').upsert({ key: adsEditKey, ...val }, { onConflict: 'key' });
    setAdsReportData(prev => ({ ...prev, [adsEditKey]: val }));
    setShowAdsModal(false);
  };

  // --- CREATOR SUMMARY (lifted for header cards) ---
  const [creatorSummary, setCreatorSummary] = useState({ spend: 0, dep: 0, reg: 0, ggr: 0, bonus: 0, ngr: 0, efficacyRate: null, streams: 0, reels: 0 });

  // Chart series visibility toggles
  const [hiddenSeries, setHiddenSeries] = useState({ spend: false, dep: false, ggr: false, bonus: false, ngr: false });

  // --- CREATOR PERF MODAL STATE ---
  const [showCreatorPerfModal, setShowCreatorPerfModal] = useState(false);
  const [creatorPerfEditKey, setCreatorPerfEditKey] = useState(null);
  const [creatorPerfLabel, setCreatorPerfLabel] = useState('');
  const emptyCreatorPerfForm = { ggr: '', bonus: '', ngr: '', activePl: '', validTurnover: '', totalWithdrawal: '', status: 'Pending' };
  const [creatorPerfFormValues, setCreatorPerfFormValues] = useState(emptyCreatorPerfForm);

  const openCreatorPerfModal = (date, streamer, site) => {
    const key = `${date}|${streamer}|${site}`;
    setCreatorPerfEditKey(key);
    setCreatorPerfLabel(`${streamer} — ${date} — ${site}`);
    const existing = creatorPerfData[key] || {};
    setCreatorPerfFormValues({
      ggr: existing.ggr !== undefined ? String(existing.ggr) : '',
      bonus: existing.bonus !== undefined ? String(existing.bonus) : '',
      ngr: existing.ngr !== undefined ? String(existing.ngr) : '',
      activePl: existing.activePl !== undefined ? String(existing.activePl) : '',
      validTurnover: existing.validTurnover !== undefined ? String(existing.validTurnover) : '',
      totalWithdrawal: existing.totalWithdrawal !== undefined ? String(existing.totalWithdrawal) : '',
      status: existing.status !== undefined ? existing.status : null,
    });
    setShowCreatorPerfModal(true);
  };

  const handleCreatorPerfSave = async () => {
    const val = {
      ggr: parseFloat(creatorPerfFormValues.ggr) || 0,
      bonus: parseFloat(creatorPerfFormValues.bonus) || 0,
      ngr: parseFloat(creatorPerfFormValues.ngr) || 0,
      activePl: parseFloat(creatorPerfFormValues.activePl) || 0,
      validTurnover: parseFloat(creatorPerfFormValues.validTurnover) || 0,
      totalWithdrawal: parseFloat(creatorPerfFormValues.totalWithdrawal) || 0,
      status: creatorPerfFormValues.status !== null ? creatorPerfFormValues.status : undefined,
    };
    await supabase.from('creator_perf').upsert({
      key: creatorPerfEditKey,
      ggr: val.ggr, bonus: val.bonus, ngr: val.ngr,
      active_pl: val.activePl, valid_turnover: val.validTurnover,
      total_withdrawal: val.totalWithdrawal, status: val.status,
    }, { onConflict: 'key' });
    setCreatorPerfData(prev => ({ ...prev, [creatorPerfEditKey]: val }));
    setShowCreatorPerfModal(false);
  };

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // Firestore id OR array index
  const emptyForm = { date: new Date().toISOString().split('T')[0], site: 'WFL', streamer: '', spend: '', reg: '', dep: '', type: 'Live', link: '', status: 'Pending' };
  const [formValues, setFormValues] = useState(emptyForm);

  const openAddModal = () => {
    setEditingId(null);
    setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0] });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    const { id: _id, ...rest } = item;
    setFormValues({ status: 'Pending', ...rest, spend: String(item.spend), reg: String(item.reg), dep: String(item.dep) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formValues.date || !formValues.streamer) return;
    const { id: _id, ...formClean } = formValues;
    const entry = { ...formClean, spend: parseFloat(formClean.spend) || 0, reg: parseInt(formClean.reg) || 0, dep: parseFloat(formClean.dep) || 0 };
    if (editingId !== null) {
      const item = data.find(d => d.id === editingId);
      const { error } = await supabase.from('campaigns').update(entry).eq('id', item.id);
      if (!error) {
        setData(prev => prev.map(d => d.id === editingId ? { ...d, ...entry } : d));
        await logEdit('edit', item.id, item, entry);
      }
    } else {
      const { data: newRows, error } = await supabase.from('campaigns').insert([entry]).select();
      if (!error && newRows) {
        setData(prev => [...prev, newRows[0]]);
        await logEdit('add', newRows[0]?.id, null, entry);
      }
    }
    setShowModal(false);
  };

  const handleDelete = async (item) => {
    if (window.confirm('Delete this entry?')) {
      const { error } = await supabase.from('campaigns').delete().eq('id', item.id);
      if (!error) {
        setData(prev => prev.filter(d => d.id !== item.id));
        await logEdit('delete', item.id, item, null);
      }
    }
  };

  // --- UNDO TOAST ---
  const [undoToast, setUndoToast] = useState(null);
  const undoTimerRef = useRef(null);

  const dismissUndoToast = () => {
    clearTimeout(undoTimerRef.current);
    setUndoToast(null);
  };

  const handleDeleteDay = async (dayEntries, perfKey) => {
    const hasEntries = dayEntries && dayEntries.length > 0;
    const hasPerf = !!perfKey;
    const label = hasEntries
      ? `${dayEntries.length} campaign entr${dayEntries.length === 1 ? 'y' : 'ies'}`
      : 'EOD performance record';

    // 1. Optimistic — remove from local state immediately
    const removedEntries = hasEntries ? dayEntries : [];
    const removedPerfValue = hasPerf ? creatorPerfData[perfKey] : null;
    if (hasEntries) {
      const ids = dayEntries.map(d => d.id);
      setData(prev => prev.filter(d => !ids.includes(d.id)));
    }
    if (hasPerf) {
      setCreatorPerfData(prev => { const u = { ...prev }; delete u[perfKey]; return u; });
    }

    // 2. Show undo toast — commit to DB after 5s
    clearTimeout(undoTimerRef.current);
    setUndoToast({ label, campaignEntries: removedEntries, perfKey, perfValue: removedPerfValue, ts: Date.now() });
    undoTimerRef.current = setTimeout(async () => {
      // Commit deletes
      if (hasEntries) {
        const ids = removedEntries.map(d => d.id);
        await supabase.from('campaigns').delete().in('id', ids);
      }
      if (hasPerf) {
        await supabase.from('creator_perf').delete().eq('key', perfKey);
      }
      setUndoToast(null);
    }, 10000);
  };

  const handleUndoDelete = () => {
    if (!undoToast) return;
    clearTimeout(undoTimerRef.current);
    // Restore local state
    if (undoToast.campaignEntries.length > 0) {
      setData(prev => [...prev, ...undoToast.campaignEntries]);
    }
    if (undoToast.perfKey && undoToast.perfValue) {
      setCreatorPerfData(prev => ({ ...prev, [undoToast.perfKey]: undoToast.perfValue }));
    }
    setUndoToast(null);
  };

  const handleMarkNoStream = async (date, streamer, site) => {
    const key = `${date}|${streamer}|${site}`;
    await supabase.from('no_stream').upsert({ key }, { onConflict: 'key' });
    setNoStreamData(prev => ({ ...prev, [key]: true }));
  };

  const handleUnmarkNoStream = async (key) => {
    await supabase.from('no_stream').delete().eq('key', key);
    setNoStreamData(prev => { const u = { ...prev }; delete u[key]; return u; });
  };

  const handleDeduplicateData = async () => {
    const seen = new Set();
    const toRemove = [];
    data.forEach(e => {
      const key = `${e.date}|${e.site}|${e.streamer}|${e.link}`;
      if (seen.has(key)) { toRemove.push(e.id); }
      else { seen.add(key); }
    });
    if (toRemove.length === 0) { alert('No duplicates found.'); return; }
    if (window.confirm(`Found ${toRemove.length} duplicate entr${toRemove.length === 1 ? 'y' : 'ies'}. Remove them?`)) {
      const { error } = await supabase.from('campaigns').delete().in('id', toRemove);
      if (!error) setData(prev => prev.filter(d => !toRemove.includes(d.id)));
    }
  };

  const handleClearAllData = async () => {
    setClearingData(true);
    // Always clear local state first so UI is immediately empty
    setData([]);
    setAdsReportData({});
    setCreatorPerfData({});
    setNoStreamData({});
    setUploadedFiles([]);
    setStreamTally({});
    try { localStorage.removeItem('streamTally'); } catch {}
    try {
      // Use not('id','is',null) so ALL rows are matched regardless of created_at being NULL
      const delCampaigns = await supabase.from('campaigns').delete().not('id', 'is', null);
      if (delCampaigns.error) {
        // Fallback: try with a site-based filter
        await supabase.from('campaigns').delete().neq('site', '__never__');
      }
      const sideDeletes = await Promise.all([
        supabase.from('ads_report').delete().not('id', 'is', null),
        supabase.from('creator_perf').delete().not('id', 'is', null),
        supabase.from('no_stream').delete().not('id', 'is', null),
        supabase.from('uploaded_files').delete().not('id', 'is', null),
      ]);
      const sideErrors = sideDeletes.filter(r => r.error).map(r => r.error.message);
      // Verify campaigns were actually deleted
      const { count, error: countErr } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
      const remaining = countErr ? null : count;
      if (remaining === null || remaining > 0) {
        const detail = remaining === null ? 'Could not verify — count query failed.' : `${remaining} row(s) remain.`;
        const sideDetail = sideErrors.length ? `\n\nSide-table errors:\n${sideErrors.join('\n')}` : '';
        alert(`⚠️ Database clear may have failed. ${detail}${sideDetail}\n\nThis is likely a Supabase RLS (Row Level Security) permissions issue.\n\nTo fix, run this in your Supabase SQL Editor:\n\nDELETE FROM public.campaigns;\nDELETE FROM public.ads_report;\nDELETE FROM public.creator_perf;\nDELETE FROM public.no_stream;\nDELETE FROM public.uploaded_files;\n\nLocal data has been wiped — refresh after running the SQL.`);
      }
    } catch (e) {
      alert(`⚠️ Error clearing database: ${e.message}\n\nLocal data has been wiped.`);
    } finally {
      setClearingData(false);
      setShowClearModal(false);
      setClearConfirmText('');
    }
  };

  // --- EDIT LOGGING ---
  const cachedIP = useRef(null);
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(d => { cachedIP.current = d.ip; })
      .catch(() => { cachedIP.current = 'unavailable'; });
  }, []);

  const getDevicePlatform = () => {
    const ua = navigator.userAgent || '';
    if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'Mobile';
    return 'Desktop';
  };

  const logEdit = async (action, entryId, before, after) => {
    try {
      const now = new Date();
      await supabase.from('edit_logs').insert([{
        edited_at: now.toISOString(),
        actor: user?.email ?? 'unknown',
        ip_address: cachedIP.current ?? 'fetching',
        platform: getDevicePlatform(),
        action,
        entry_id: entryId ?? null,
        before: before ? JSON.stringify(before) : null,
        after: after ? JSON.stringify(after) : null,
      }]);
    } catch (_) {}
  };

  // ─── CSV HELPERS ──────────────────────────────────────────────────────────
  function parseCsvLine(line, delimiter = ',') {
    const result = [];
    let cur = '', inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === delimiter && !inQ) { result.push(cur.trim()); cur = ''; }
      else { cur += c; }
    }
    result.push(cur.trim());
    return result;
  }

  function cleanNum(val) {
    if (val === null || val === undefined || val === '') return 0;
    // Strip any currency symbol (₱ peso, $ dollar, ¥ yen, € euro, £ pound) plus commas/spaces
    return parseFloat(String(val).replace(/[₱$¥€£,\s]/g, '')) || 0;
  }

  function normDate(s) {
    if (!s) return '';
    s = s.trim();
    // Strip time portion from datetime strings (e.g. "2026-01-23 10:30:00" or "1/23/2026 10:30 AM")
    s = s.replace(/\s+\d{1,2}:\d{2}(:\d{2})?(\s*(AM|PM))?$/i, '').trim();
    // Already ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    // YYYY/MM/DD
    const ymd2 = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd2) return `${ymd2[1]}-${ymd2[2].padStart(2,'0')}-${ymd2[3].padStart(2,'0')}`;
    // MM/DD/YYYY or M/D/YYYY
    const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mdy) return `${mdy[3]}-${mdy[1].padStart(2,'0')}-${mdy[2].padStart(2,'0')}`;
    // MM-DD-YYYY
    const mdy2 = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    if (mdy2) return `${mdy2[3]}-${mdy2[1].padStart(2,'0')}-${mdy2[2].padStart(2,'0')}`;
    const mo = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    // DD Mon YYYY  (e.g. "05 Feb 2026")
    const dmy = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
    if (dmy) { const m = mo[dmy[2].toLowerCase().slice(0,3)]; if (m) return `${dmy[3]}-${String(m).padStart(2,'0')}-${dmy[1].padStart(2,'0')}`; }
    // DD-Mon-YYYY  (e.g. "05-Feb-2026") or D-Mon-YY (e.g. "2-Feb-26" — Excel short format)
    const dmyd = s.match(/^(\d{1,2})-([A-Za-z]+)-(\d{2,4})$/);
    if (dmyd) {
      const m = mo[dmyd[2].toLowerCase().slice(0,3)];
      if (m) {
        const yr = dmyd[3].length === 2 ? (parseInt(dmyd[3], 10) >= 50 ? `19${dmyd[3]}` : `20${dmyd[3]}`) : dmyd[3];
        return `${yr}-${String(m).padStart(2,'0')}-${dmyd[1].padStart(2,'0')}`;
      }
    }
    // Mon DD, YYYY  (e.g. "Feb 5, 2026")
    const mdy3 = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (mdy3) { const m = mo[mdy3[1].toLowerCase().slice(0,3)]; if (m) return `${mdy3[3]}-${String(m).padStart(2,'0')}-${mdy3[2].padStart(2,'0')}`; }
    // Excel serial date (numeric, e.g. 46054)
    if (/^\d{5}$/.test(s)) {
      const serial = parseInt(s, 10);
      if (serial > 40000 && serial < 60000) {
        const d = new Date(Date.UTC(1899, 11, 30) + serial * 86400000);
        return d.toISOString().split('T')[0];
      }
    }
    return s;
  }

  function isValidDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }

  // ─── EOD FORMAT DETECTION & PARSING ──────────────────────────────────────
  function isEODFormat(text) {
    // Require BOTH the section header AND the column-header row (DAY + REGISTER)
    // so that summary/roster sheets that incidentally contain "END OF DAY" text
    // are not mistaken for EOD reports.
    return (
      /OF DAY REPORT|END OF\s+THE\s+DAY|END OF DAY/i.test(text) &&
      /\bDAY\b.*\bREGISTER/i.test(text)
    );
  }

  function siteFromFilename(name) {
    const f = name.toLowerCase();
    // Check full words / known aliases first (most specific)
    if (f.includes('time2bet') || /\bt2b\b/.test(f) || f.startsWith('t2b ') || f.startsWith('t2b_') || f.startsWith('t2b-')) return 'T2B';
    if (f.includes('rollem') || /\brlm\b/.test(f) || f.includes('_rlm') || f.includes('-rlm') || f.includes(' rlm')) return 'RLM';
    if (/\bwfl\b/.test(f) || f.includes('_wfl') || f.includes('-wfl') || f.includes(' wfl') || f.includes('wfl-88') || f.includes('wfl88')) return 'WFL';
    if (/\bcow\b/.test(f) || f.includes('cashonwins') || f.includes('cash on wins')) return 'COW';
    if (f.includes('perya') || /\bperya\b/.test(f)) return 'PERYA';
    // Generic fallback: grab any site code token
    const m = f.match(/\b(t2b|rlm|wfl|cow|perya)\b/);
    if (m) { const map = { t2b: 'T2B', rlm: 'RLM', wfl: 'WFL', cow: 'COW' }; return map[m[1]] || ''; }
    return '';
  }

  // Try to infer the site from the file's actual text content (first ~30 lines).
  // Useful when the filename has no site code but the CSV header or URLs contain one.
  function siteFromContent(text) {
    const sample = text.slice(0, 3000).toLowerCase();
    // Check URLs and domain names embedded in the CSV
    if (sample.includes('wfl-88') || sample.includes('wfl88') || sample.includes('/wfl')) return 'WFL';
    if (sample.includes('rollem') || sample.includes('rlm88') || sample.includes('/rlm')) return 'RLM';
    if (sample.includes('time2bet') || sample.includes('t2b') ) return 'T2B';
    if (sample.includes('cashonwins') || sample.includes('cow')) return 'COW';
    return '';
  }

  // Returns { name, hint } — name is the cleaned header word, hint is bracket/paren content
  function streamerFromHeader(line) {
    // Extract hint from brackets or parens BEFORE stripping: "WOOLFYBETS [AETHER]" → hint "AETHER"
    const bracketMatch = line.match(/\[([^\]]+)\]|\(([^)]+)\)/);
    const hint = bracketMatch ? (bracketMatch[1] || bracketMatch[2]).trim() : '';

    let name = line
      .replace(/\s*:.*$/i, '')              // remove everything after :
      .replace(/\[[^\]]*\]/g, '')           // remove [bracket] content
      .replace(/\([^)]*\)/g, '')            // remove (paren) content
      .replace(/\s+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER).*/i, '')
      // Strip "END OF DAY REPORT" / "END OF THE DAY" / "OF DAY REPORT" suffix
      // These are part of the section title row, not the streamer name
      .replace(/\s*(?:END\s+OF\s+(?:THE\s+)?DAY(?:\s+REPORT)?|OF\s+DAY\s+REPORT).*/i, '')
      .replace(/[&]?LP$/i, '')              // strip &LP or LP suffix
      .replace(/^(?:WFL|RLM|T2B|COW)/i, '') // strip site prefix
      .trim();
    const cleanName = name
      ? name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
      : 'Unknown';
    return { name: cleanName, hint };
  }

  // Smart fuzzy match: checks built-in alias dict first (no existing data needed),
  // then falls back to matching against known streamers already in the app.
  function smartMatchStreamer(headerName, hint, aliasName, knownStreamers, filenameHint = '') {
    const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // ── Step 0: built-in alias dictionary (works with zero existing data) ──
    const tryAlias = (raw) => {
      const n = norm(raw);
      if (!n || n.length < 2) return null;
      // exact key
      if (STREAMER_ALIASES[n]) return STREAMER_ALIASES[n];
      // csv token contains an alias key ("saintymaxwin" → "sainty")
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && n.includes(key)) return val;
      }
      // alias key contains csv token ("neggy" inside "neggytv")
      // Require n.length >= 5 so short site codes (wfl, rlm, cow, t2b) don't
      // accidentally match long keys like "wflaffiliate".
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && key.startsWith(n) && n.length >= 5) return val;
      }
      return null;
    };

    const fromAlias =
      tryAlias(hint) ||
      tryAlias(filenameHint) ||
      tryAlias(headerName) ||
      tryAlias(aliasName);
    if (fromAlias) return fromAlias;

    // ── Step 1: match against live streamer list (when app already has data) ──
    if (!knownStreamers.length) return null;
    const pool = knownStreamers.map(s => ({ name: s, n: norm(s) }));

    const tryName = (raw) => {
      const n = norm(raw);
      if (!n || n.length < 2) return null;
      const exact = pool.find(k => k.n === n);
      if (exact) return exact.name;
      const contained = pool.find(k => k.n.length >= 3 && n.includes(k.n));
      if (contained) return contained.name;
      const csvStartsKnown = pool.find(k => k.n.length >= 3 && k.n.startsWith(n) && n.length >= 3);
      if (csvStartsKnown) return csvStartsKnown.name;
      const knownStartsCsv = pool.find(k => k.n.length >= 3 && n.startsWith(k.n));
      if (knownStartsCsv) return knownStartsCsv.name;
      return null;
    };

    return tryName(hint) || tryName(filenameHint) || tryName(headerName) || tryName(aliasName) || null;
  }

  // Extract a streamer name hint embedded in the CSV filename.
  // e.g. "UNRAVEL EOD TALENTS - WFL - HOLYFATHER.csv" → "HOLYFATHER"
  function streamerHintFromFilename(filename) {
    const base = filename.replace(/\.[^.]+$/, ''); // strip extension
    // Split on common separators and grab non-keyword tokens
    const skipWords = new Set(['unravel','eod','talents','talent','wfl','rlm','t2b','cow','time2bet','rollem','the','of','end','day','report']);
    const tokens = base.split(/[\s\-_]+/).map(t => t.trim().toLowerCase()).filter(t => t.length >= 3 && !skipWords.has(t));
    // Return the first token that has a known alias (most specific match)
    for (const t of tokens) {
      const matched = STREAMER_ALIASES[t];
      if (matched) return matched;
      // partial: alias key inside token or vice-versa
      for (const [key, val] of Object.entries(STREAMER_ALIASES)) {
        if (key.length >= 3 && (t.includes(key) || key.startsWith(t))) return val;
      }
    }
    return null;
  }

  function parseEODCsv(text, filename) {
    const detectedSite = siteFromFilename(filename);
    const lines = text.split(/\r?\n/);
    const sections = [];
    let cur = null;
    let inData = false;

    const isHeaderLine = (line) =>
      /(?:OF DAY REPORT|END OF\s+THE\s+DAY|END OF DAY)/i.test(line) &&
      !/^,/.test(line.trim());

    const isColHeaderLine = (cols) =>
      cols[0]?.toUpperCase().trim() === 'DAY' &&
      cols[1]?.toUpperCase().includes('REGISTER');

    const isSummaryLine = (cols) =>
      cols[1]?.toUpperCase().includes('TOTAL') ||
      /^Demo and With Risk/i.test(cols[0] || '');

    // Month names and generic report-level labels that are never real streamer names.
    // "FEBRUARY END OF DAY REPORT" → streamerFromHeader → "February" must be discarded.
    // "WFL AFFILIATE END OF DAY REPORT" → "Affiliate" — a site-level aggregate, not a talent.
    const PHANTOM_LABELS = new Set([
      'january','february','march','april','may','june',
      'july','august','september','october','november','december',
      'affiliate','unknown',
    ]);

    for (const raw of lines) {
      const cols = parseCsvLine(raw);
      const first = (cols[0] || '').trim();

      if (isHeaderLine(raw)) {
        if (cur && cur.rows.length > 0) sections.push(cur);
        const { name: parsedName, hint } = streamerFromHeader(first);
        // Discard report-level titles (month names, "Affiliate", etc.) — set cur to null
        // so any data rows beneath this header are skipped until the next real section.
        if (PHANTOM_LABELS.has(parsedName.toLowerCase())) {
          cur = null;
          inData = false;
          continue;
        }
        cur = { streamer: parsedName, hint, editName: parsedName, alias: '', site: detectedSite, selected: false, rows: [] };
        inData = false;
        continue;
      }
      if (!cur) continue;
      if (isColHeaderLine(cols)) { inData = true; continue; }
      if (!inData) continue;
      if (isSummaryLine(cols)) {
        // Capture the TOTAL row's first cell as an alias (e.g. "ajheib", "akosipepper", "MageDadYujii")
        if (first && !first.startsWith(',')) cur.alias = first;
        continue;
      }

      const dateVal = normDate(first);
      if (!isValidDate(dateVal)) continue;
      // Skip empty strings
      if (!cols[1] && !cols[7]) continue;

      const _reg = cleanNum(cols[1]);
      const _dep = cleanNum(cols[7]);
      const _ggr = cleanNum(cols[4]);
      const _ngr = cleanNum(cols[6]);
      const _vt  = cleanNum(cols[3]);
      const _apl = cleanNum(cols[2]);
      const _bon = cleanNum(cols[5]);
      // Skip all-zero rows (future placeholder dates with no data yet)
      if (_reg === 0 && _dep === 0 && _ggr === 0 && _ngr === 0 && _vt === 0 && _apl === 0 && _bon === 0) continue;

      cur.rows.push({
        date: dateVal,
        reg:             Math.round(cleanNum(cols[1])),
        activePl:        cleanNum(cols[2]),
        validTurnover:   cleanNum(cols[3]),
        ggr:             cleanNum(cols[4]),
        bonus:           cleanNum(cols[5]),
        ngr:             cleanNum(cols[6]),
        dep:             cleanNum(cols[7]),
        totalWithdrawal: cleanNum(cols[8]),
      });
    }
    if (cur && cur.rows.length > 0) sections.push(cur);
    return { sections, detectedSite };
  }

  // ─── FLAT CSV PARSING (Campaign Data) ────────────────────────────────────
  // Split raw CSV text into logical lines, respecting quoted fields that may contain
  // embedded newlines (e.g. URLs split across lines inside double-quotes).
  function splitCsvText(text) {
    const lines = [];
    let cur = '';
    let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        inQ = !inQ;
        cur += c;
      } else if (!inQ && c === '\r') {
        // swallow \r; \n will follow and flush the line
      } else if (!inQ && c === '\n') {
        lines.push(cur);
        cur = '';
      } else {
        cur += c;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function parseFlatCSV(text) {
    // Strip UTF-8 BOM if present (common in Excel-exported CSV files)
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    // Filter lines that are truly empty OR contain only commas/tabs/spaces (no real content)
    const lines = splitCsvText(text).filter(l => l.replace(/[,;\t\s]/g, '').length > 0);
    if (lines.length < 2) return { headers: [], rows: [] };
    // Detect delimiter: tab > semicolon > comma (score by which produces more columns in first line)
    const firstLine = lines[0];
    const tabCols  = firstLine.split('\t').length;
    const semiCols = firstLine.split(';').length;
    const commCols = firstLine.split(',').length;
    const delim = tabCols >= semiCols && tabCols >= commCols ? '\t'
                : semiCols > commCols ? ';' : ',';

    // Detect the actual header row — some CSVs (e.g. MEDIA BUYER tracker) have title rows
    // like "MEDIA BUYER'S TRACKER,,,,,,,,TALENT MANAGER'S TRACKER,..." before the real headers.
    // Score each of the first 20 lines by how many cells match recognised field keywords,
    // then pick the row with the highest score (avoids false matches on title rows).
    const headerKeywords = [
      'date','livestreamdate','streamdate','name','talentsname','talent','streamer','creator','influencer',
      'cost','spend','adspend','budget','boost','boosting',
      'format','type','contenttype',
      'link','url',
      'reg','register','registrations','signups','newreg',
      'dep','deposit','deposits','fd','ftd',
      'site','platform','page',
    ];
    const normH = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    let headerLineIdx = 0;
    let bestScore = 0;
    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const cells = parseCsvLine(lines[i], delim);
      const score = cells.filter(c => c.trim()).reduce((acc, c) => {
        const n = normH(c);
        return acc + (headerKeywords.some(k => n === k || n.includes(k)) ? 1 : 0);
      }, 0);
      if (score > bestScore) { bestScore = score; headerLineIdx = i; }
    }

    const headers = parseCsvLine(lines[headerLineIdx], delim);
    const rows = lines.slice(headerLineIdx + 1).map(l => parseCsvLine(l, delim));

    // ── Smart side-table extraction ───────────────────────────────────────────
    // Strategy: scan EVERY row (and the header row) for a cell that looks like a
    // "live count" or "reels count" header. Different CSV designs label these columns
    // differently, so we use broad keyword sets. Once we find the header row we read
    // data from subsequent rows until the name cell is empty.
    //
    // Supported layouts:
    //  • Side-table header in main header row (ROLLEM/WFL): cols named "TALENT'S NAME, REELS, LIVESTREAM"
    //  • Side-table header inside a data row (T2B): rows[n] has "TALENT'S NAME, LIVESTREAM COUNT, REELS COUNT"
    //  • Multiple period sub-sections (e.g., FEBRUARY / JANUARY 23-31) — all accumulated into totals
    //
    // Column matching uses broad keyword sets plus standalone exact-match terms so bare
    // headers like "LIVESTREAM" (no "count") are recognized alongside "LIVESTREAM COUNT".
    const nc = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const isLiveCountHeader = (n, siblingHasReels) =>
      // With qualifier word: "LIVESTREAM COUNT", "LIVE TOTAL", "STREAM NUM" …
      ((n.includes('live') || n.includes('stream')) &&
       (n.includes('count') || n.includes('total') || n.includes('num'))) ||
      // Standalone bare header — ONLY accepted when the same row also has an explicit
      // reels column (siblingHasReels=true), to avoid matching FORMAT cell values like "Livestream"
      (siblingHasReels &&
        (n === 'livestream' || n === 'live' || n === 'lives' ||
         n === 'streams'   || n === 'livestreams'));

    const isReelsCountHeader = n =>
      (n.includes('reel') &&
       (n.includes('count') || n.includes('total') || n.includes('num'))) ||
      n === 'reels' || n === 'reel';

    const isNameHeader = n =>
      n.includes('talent') || n.includes('streamer') ||
      n.includes('creator') || n === 'name';

    // Returns column indices if cells look like a side-table header row, else null
    const detectSideCols = (cells) => {
      let nameCol = -1, liveCol = -1, reelsCol = -1;
      // First pass: find reels column (no ambiguity — "reels" never appears as a data value)
      cells.forEach((c, ci) => { if (isReelsCountHeader(nc(c))) reelsCol = ci; });
      // Second pass: find live column — allow bare "LIVESTREAM" only when reels col already found
      const siblingHasReels = reelsCol >= 0;
      cells.forEach((c, ci) => { if (isLiveCountHeader(nc(c), siblingHasReels)) liveCol = ci; });
      if (liveCol < 0 || reelsCol < 0) return null;
      // Search left of the count columns for an explicit name header; fallback = adjacent left cell
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

    // True when a name cell is a section/period label, not a real streamer name.
    // e.g., "FEBRUARY", "January 23 - 31", "TOTAL"
    // Full-name alternatives come first so "APRIL" matches before the abbreviated "APR";
    // the trailing group requires a digit, dash, or end-of-string so that real names
    // like "APRIL JOY" (starts with month word but continues with letters) are NOT filtered.
    const MONTH_RE = /^(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\s*\d|\s*[-–]|\s*$)/i;
    const looksLikeSectionName = name =>
      MONTH_RE.test(name.trim()) ||
      /\d.*[-–].*\d/.test(name) ||
      /^(total|grand\s*total|summary|subtotal)$/i.test(name.trim());

    // Collect all side-table sections (supports multi-period CSVs)
    // Each section: { cols, dataRows, inlineLayout }
    //   inlineLayout=true  → side-table header was in the MAIN header row;
    //                         side data shares rows with main data (e.g. ROLLEM/WFL).
    //                         Do NOT skip rows because col 0 is a date — just skip
    //                         rows where the name cell is empty.
    //   inlineLayout=false → side-table header was embedded inside a data row (e.g. T2B);
    //                         main rows must be filtered out by date in col 0.
    const sections = [];

    // 1. Check the main header row first (inline layout)
    const mainSideCols = detectSideCols(headers);
    if (mainSideCols) {
      // Inline layout: use mainSideCols for ALL data rows in one pass.
      // Period sub-section labels (e.g. "JANUARY 23 - 31", "FEBUARY") appearing
      // in the name column are already filtered by looksLikeSectionName, so there
      // is no need to split into separate sections.
      // Previously the code re-ran detectSideCols on each data row and updated
      // curCols when it found a boundary row; this caused nameCol to shift to
      // whatever non-empty cell was left of the REELS column (e.g. TIME values
      // like "8:08PM" in ROLLEM), producing garbage entries in the sideTable.
      sections.push({ cols: mainSideCols, dataRows: rows, inlineLayout: true });
    } else {
      // 2. Scan all data rows for embedded side-table header(s) (separate-section layout)
      let curCols = null, curStart = null;
      for (let ri = 0; ri < rows.length; ri++) {
        const found = detectSideCols(rows[ri]);
        if (found) {
          if (curCols !== null) sections.push({ cols: curCols, dataRows: rows.slice(curStart, ri), inlineLayout: false });
          curCols = found; curStart = ri + 1;
        }
      }
      if (curCols !== null) sections.push({ cols: curCols, dataRows: rows.slice(curStart), inlineLayout: false });
    }

    // Aggregate all sections — values for the same streamer are summed across periods
    const sideTable = {};
    sections.forEach(({ cols, dataRows, inlineLayout }) => {
      const { nameCol, liveCol, reelsCol } = cols;
      dataRows.forEach(cells => {
        const name      = (cells[nameCol] || '').trim();
        const live      = Math.round(cleanNum(cells[liveCol]  || 0));
        const reels     = Math.round(cleanNum(cells[reelsCol] || 0));

        if (!name) return;
        if (looksLikeSectionName(name)) return;   // "FEBRUARY", "JAN 23-31", "TOTAL" …

        // For separate-section layout, skip rows where the name cell looks like a header
        // (e.g. "TALENT'S NAME" re-appearing in a data row from the main table columns).
        // We DON'T filter by date in col 0 — T2B has dates in col 0 on every side-data row.
        if (!inlineLayout && (isNameHeader(nc(name)) || isLiveCountHeader(nc(name)))) return;

        if (live === 0 && reels === 0) return;     // nothing to record

        // Accumulate so multi-period CSVs produce campaign totals
        if (sideTable[name]) {
          sideTable[name].live  += live;
          sideTable[name].reels += reels;
        } else {
          sideTable[name] = { live, reels };
        }
      });
    });

    return { headers, rows, sideTable };
  }

  function autoMapColumns(headers) {
    const mapping = {};
    const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Ordered by priority — first match wins per field
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
    headers.forEach((h, i) => {
      const n = norm(h);
      for (const [field, ms] of Object.entries(matchers)) {
        if (mapping[field] === undefined && ms.some(m => n === m || n.includes(m))) mapping[field] = String(i);
      }
    });
    return mapping;
  }

  function buildCampaignPreview(rawRows, mapping) {
    // Cache normalized name lookups so we don't re-run smartMatchStreamer for every row
    const nameCache = {};
    // Site codes must never be resolved as streamer names — they appear as cell values
    // in site-column-less sheets and would otherwise match aliases like
    // `cow → 'COW Affiliate'` or `wflaffiliate` via prefix fuzzy rule.
    const SITE_CODES = new Set(['wfl', 'rlm', 't2b', 'cow', 'rollem', 'time2bet']);
    const normalizeStreamer = (raw) => {
      if (!raw) return raw;
      if (nameCache[raw] !== undefined) return nameCache[raw];
      // Skip alias/fuzzy matching for bare site codes
      const normRaw = raw.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (SITE_CODES.has(normRaw)) { nameCache[raw] = raw; return raw; }
      // `streamers` useMemo is defined later in the component but is in scope when this
      // function is actually called (always from an event handler, after full render).
      const knownList = (typeof streamers !== 'undefined' && Array.isArray(streamers)) ? streamers : [];
      const resolved = smartMatchStreamer(raw, '', '', knownList, '') || raw;
      nameCache[raw] = resolved;
      return resolved;
    };
    return rawRows.map(row => ({
      date:     normDate(mapping.date     !== undefined ? row[parseInt(mapping.date)]     : ''),
      site:     mapping.site !== undefined
                  ? (row[parseInt(mapping.site)] || '').trim()
                  : (mapping._defaultSite || ''),
      streamer: normalizeStreamer((mapping.streamer !== undefined ? (row[parseInt(mapping.streamer)] || '') : '').trim()),
      spend:    cleanNum(mapping.spend !== undefined ? row[parseInt(mapping.spend)] : 0),
      reg:      Math.round(cleanNum(mapping.reg !== undefined ? row[parseInt(mapping.reg)] : 0)),
      dep:      cleanNum(mapping.dep   !== undefined ? row[parseInt(mapping.dep)]   : 0),
      type:     (() => { const raw = (mapping.type !== undefined ? (row[parseInt(mapping.type)] || 'Live') : 'Live').trim(); return /livestream/i.test(raw) ? 'Live' : raw; })(),
      link:     mapping.link !== undefined ? (row[parseInt(mapping.link)] || '').trim() : '',
      status:   'Pending',
    })).filter(r => isValidDate(r.date) && r.streamer);
  }

  // ─── CLEAR ALL DATA STATE ──────────────────────────────────────────────────
  const [showClearModal,    setShowClearModal]    = useState(false);
  const [clearingData,      setClearingData]      = useState(false);
  const [clearConfirmText,  setClearConfirmText]  = useState('');

  // ─── IMPORT STATE ─────────────────────────────────────────────────────────
  const [showImportModal, setShowImportModal]   = useState(false);
  const [importEODOnly,   setImportEODOnly]     = useState(false); // true when opened from Creator Report
  const [importStep,      setImportStep]        = useState(1);
  const [importMode,      setImportMode]        = useState(null);   // 'eod' | 'campaign'
  const [importDragOver,  setImportDragOver]    = useState(false);
  const [importResult,    setImportResult]      = useState(null);
  const importFileRef = useRef(null);

  const openEODImport = () => { setImportEODOnly(true); setShowImportModal(true); };

  // EOD-specific state
  const [eodSections, setEodSections]   = useState([]);   // [{ streamer, editName, site, selected, rows }]
  const [eodSite,     setEodSite]       = useState('');
  const [importing,    setImporting]     = useState(false);

  // Campaign-specific state
  const [campHeaders,   setCampHeaders]   = useState([]);
  const [campRawRows,   setCampRawRows]   = useState([]);
  const [campMapping,   setCampMapping]   = useState({});
  const [campPreview,   setCampPreview]   = useState([]);
  const [campSideTable, setCampSideTable] = useState({});
  const [sheetSummary,  setSheetSummary]  = useState(null); // { used: [{name,count}], skipped: [name] }
  const campRequiredFields = ['date', 'site', 'streamer'];
  const campAllFields      = ['date', 'site', 'streamer', 'spend', 'reg', 'dep', 'type', 'link'];

  // saveStreamTally helper — defined here so handleCampaignImport can call it
  const saveStreamTally = (updated) => {
    setStreamTally(updated);
    try { localStorage.setItem('streamTally', JSON.stringify(updated)); } catch {}
  };

  // ─── XLSX → SHEETS CONVERSION ─────────────────────────────────────────────
  // Returns an array of { name, csv } for every non-blank sheet in the workbook.
  const xlsxToSheets = (arrayBuffer) => {
    // cellDates:true makes SheetJS parse date cells as JS Date objects instead of
    // using the cell's raw Excel-formatted text (e.g. "2-Feb-26" short format).
    // dateNF forces sheet_to_csv to emit those dates as ISO yyyy-mm-dd strings.
    const wb = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    return wb.SheetNames
      .map(name => ({
        name,
        csv: XLSX.utils.sheet_to_csv(wb.Sheets[name], { blankrows: false, dateNF: 'yyyy-mm-dd' }),
      }))
      .filter(s => s.csv.replace(/[,\n\r\s]/g, '').length > 0); // skip fully blank sheets
  };

  // ─── IMPORT HANDLERS ──────────────────────────────────────────────────────
  const handleImportFile = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const isXlsxFile = ext === 'xlsx' || ext === 'xls';

    // ── Core processing — works on plain text (CSV) or a pre-converted array of sheets ──
    const processText = (text, rawBinary = null) => {
      importRawRef.current = {
        name: file.name,
        content: text,
        size: file.size,
        ...(isXlsxFile && rawBinary ? { binaryContent: rawBinary } : {}),
      };
      if (importEODOnly && !isEODFormat(text)) {
        alert('❌ This file is not an UNRAVEL EOD TALENTS report.\nPlease upload the correct EOD CSV file.');
        return;
      }
      if (isEODFormat(text)) {
        const { sections, detectedSite } = parseEODCsv(text, file.name);
        const fnHint = streamerHintFromFilename(file.name);
        const useFnHintDirect = sections.length === 1 && !!fnHint;
        const matched = sections.map(sec => {
          const known = useFnHintDirect
            ? fnHint
            : smartMatchStreamer(sec.streamer, sec.hint, sec.alias, streamers, fnHint);
          const resolvedName = known || sec.streamer;
          const autoMatched = resolvedName !== sec.streamer;
          return { ...sec, editName: resolvedName, autoMatched };
        });
        setEodSections(matched);
        setEodSite(detectedSite);
        setImportMode('eod');
      } else {
        const { headers, rows, sideTable } = parseFlatCSV(text);
        if (!headers.length) return;
        const mapping = autoMapColumns(headers);
        if (mapping.site === undefined) {
          const siteHint = siteFromFilename(file.name) || siteFromContent(text);
          if (siteHint) mapping._defaultSite = siteHint;
        }
        setCampHeaders(headers);
        setCampRawRows(rows);
        setCampMapping(mapping);
        setCampPreview(buildCampaignPreview(rows, mapping));
        setCampSideTable(sideTable || {});
        setImportMode('campaign');
      }
      setImportStep(2);
    };

    // ── Multi-sheet XLSX handler ──────────────────────────────────────────────
    const processSheets = (sheets, rawBinary) => {
      if (sheets.length === 0) { alert('❌ The XLSX file appears to be empty.'); return; }

      // EOD: parse each sheet independently, then MERGE sections by streamer+site key.
      // Concatenating all sheets caused every streamer to appear N times (once per sheet)
      // and non-EOD sheets to inject garbage entries.
      const anyEOD = sheets.some(s => isEODFormat(s.csv));
      if (anyEOD || importEODOnly) {
        // Use sheet name to infer site when the EOD file itself has no site marker
        const mergedMap = {}; // key = "streamer|||site" → section object

        sheets.forEach(sheet => {
          if (!isEODFormat(sheet.csv)) return;
          const sheetSiteHint = siteFromFilename(sheet.name) || siteFromFilename(file.name);
          const { sections } = parseEODCsv(sheet.csv, sheet.name || file.name);
          sections.forEach(sec => {
            const site = sec.site || sheetSiteHint || '';
            // Resolve canonical name NOW (before building the merge key) so that
            // different aliases of the same streamer (e.g. "Chad" vs "Chadkinis")
            // collapse into a single entry rather than creating duplicates.
            const canonical = smartMatchStreamer(sec.streamer, sec.hint, sec.alias, [], '') || sec.streamer;
            const key = `${canonical.toLowerCase()}|||${site}`;
            if (!mergedMap[key]) {
              mergedMap[key] = { ...sec, site, streamer: canonical };
            } else {
              // Same streamer+site appeared in another sheet — merge rows (union by date)
              const existing = mergedMap[key];
              const existingDates = new Set(existing.rows.map(r => r.date));
              sec.rows.forEach(r => { if (!existingDates.has(r.date)) existing.rows.push(r); });
              // Keep the alias if we didn't have one yet
              if (!existing.alias && sec.alias) existing.alias = sec.alias;
            }
          });
        });

        // Require at least 2 real data rows — eliminates phantom sections created
        // when a non-data sheet is partially misread as EOD format.
        const MIN_ROWS = 2;
        const allSections = Object.values(mergedMap).filter(s => s.rows.length >= MIN_ROWS);
        if (!allSections.length) { alert('❌ No EOD data found in this XLSX file.'); return; }

        // Resolve streamer names the same way processText does
        const fnHint = streamerHintFromFilename(file.name);
        const useFnHintDirect = allSections.length === 1 && !!fnHint;
        const matched = allSections.map(sec => {
          const known = useFnHintDirect
            ? fnHint
            : smartMatchStreamer(sec.streamer, sec.hint, sec.alias, streamers, fnHint);
          const resolvedName = known || sec.streamer;
          return { ...sec, editName: resolvedName, autoMatched: resolvedName !== sec.streamer };
        });

        // Infer site — use first detected, fall back to filename
        const detectedSite = allSections.find(s => s.site)?.site ||
          siteFromFilename(file.name) || '';

        importRawRef.current = {
          name: file.name,
          content: sheets.filter(s => isEODFormat(s.csv)).map(s => s.csv).join('\n\n'),
          size: file.size,
          binaryContent: rawBinary,
        };
        setEodSections(matched);
        setEodSite(detectedSite);
        setImportMode('eod');
        setImportStep(2);
        return;
      }

      // Campaign: parse each sheet independently, infer site from sheet name, merge results
      let mergedHeaders = [];
      let mergedRows = [];
      let mergedSideTable = {};
      let firstMapping = null;

      // Sheets whose names match these words are summary/guide sheets — not raw campaign data.
      const NON_DATA_SHEET_RE = /\b(report(ing)?|guide|dashboard|summary|overview)\b/i;
      const sheetResults = { used: [], skipped: [] };

      sheets.forEach(sheet => {
        // Skip obvious non-data sheets by name (e.g. "WFL REPORTING", "MEDIA BUYER GUIDE")
        if (NON_DATA_SHEET_RE.test(sheet.name)) {
          sheetResults.skipped.push(sheet.name);
          return;
        }

        const { headers, rows, sideTable } = parseFlatCSV(sheet.csv);
        if (!headers.length) { sheetResults.skipped.push(sheet.name); return; }
        const mapping = autoMapColumns(headers);

        // Per-sheet site inference: site column > sheet name > filename > content
        if (mapping.site === undefined) {
          const siteHint = siteFromFilename(sheet.name) || siteFromFilename(file.name) || siteFromContent(sheet.csv);
          if (siteHint) mapping._defaultSite = siteHint;
        }

        // Build preview to validate this sheet has actual usable rows
        const preview = buildCampaignPreview(rows, mapping);
        if (preview.length === 0) {
          // Sheet produced no valid (date + streamer) rows — skip it
          sheetResults.skipped.push(sheet.name);
          return;
        }

        sheetResults.used.push({ name: sheet.name, count: preview.length });
        if (!firstMapping) { firstMapping = mapping; mergedHeaders = headers; }

        // Collect rows — use this sheet's own mapping so column offsets are correct
        mergedRows = mergedRows.concat(rows);
        mergedSideTable = { ...mergedSideTable, ...(sideTable || {}) };

        // Accumulate preview directly (avoids re-running buildCampaignPreview on mixed rows)
        if (!firstMapping._prebuiltPreview) firstMapping._prebuiltPreview = [];
        firstMapping._prebuiltPreview = firstMapping._prebuiltPreview.concat(preview);
      });

      if (!firstMapping) { alert('❌ No usable data found in this XLSX file.'); return; }
      setSheetSummary(sheetResults);

      importRawRef.current = { name: file.name, content: sheets.map(s=>s.csv).join('\n\n'), size: file.size, binaryContent: rawBinary };

      const finalPreview = firstMapping._prebuiltPreview || [];
      delete firstMapping._prebuiltPreview;

      setCampHeaders(mergedHeaders);
      setCampRawRows(mergedRows);
      setCampMapping(firstMapping);
      setCampPreview(finalPreview);
      setCampSideTable(mergedSideTable);
      setImportMode('campaign');
      setImportStep(2);
    };

    if (isXlsxFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const arrayBuffer = e.target.result;
          const sheets = xlsxToSheets(arrayBuffer);

          // Convert arrayBuffer → base64 for later download
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);

          if (sheets.length === 1) {
            processText(sheets[0].csv, base64);
          } else {
            processSheets(sheets, base64);
          }
        } catch (err) {
          alert('❌ Could not read XLSX file. Make sure it is a valid Excel file.\n' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Plain CSV / TSV / TXT — read as text as before
      const reader = new FileReader();
      reader.onload = (e) => processText(e.target.result);
      reader.readAsText(file);
    }
  };

  const handleEODImport = async () => {
    if (importing) return;
    setImporting(true);
    const newPerf = { ...creatorPerfData };
    const upsertRows = [];
    let count = 0;
    eodSections.filter(s => s.selected).forEach(section => {
      // Use the per-section detected site first, fall back to the global eodSite picker
      const site = section.site || eodSite;
      section.rows.forEach(row => {
        const key = `${row.date}|${section.editName}|${site}`;
        newPerf[key] = {
          ggr:             row.ggr,
          bonus:           row.bonus,
          ngr:             row.ngr,
          activePl:        row.activePl,
          validTurnover:   row.validTurnover,
          totalWithdrawal: row.totalWithdrawal,
          reg:             row.reg,
          dep:             row.dep,
        };
        upsertRows.push({
          key,
          ggr: row.ggr, bonus: row.bonus, ngr: row.ngr,
          active_pl: row.activePl, valid_turnover: row.validTurnover,
          total_withdrawal: row.totalWithdrawal, reg: row.reg, dep: row.dep,
        });
        count++;
      });
    });
    if (upsertRows.length > 0) {
      // Deduplicate by key — PostgreSQL rejects upserts where the same key appears twice in one batch
      const deduped = Object.values(
        upsertRows.reduce((acc, row) => { acc[row.key] = row; return acc; }, {})
      );
      const { error: upsertErr } = await supabase.from('creator_perf').upsert(deduped, { onConflict: 'key' });
      if (upsertErr) {
        console.error('[EOD import] upsert error:', upsertErr.message || upsertErr);
        alert(`⚠️ EOD data saved locally but failed to persist to database:\n${upsertErr.message}\n\nYour data will be lost on refresh. Check console for details.`);
      }
    }
    setCreatorPerfData(newPerf);
    setImportResult({ imported: count, skipped: 0, mode: 'eod' });
    await saveFileRecord(`EOD · ${eodSections.filter(s=>s.selected).map(s=>`${s.editName}(${s.site||eodSite})`).join(', ')}`);
    setImporting(false);
    setImportStep(3);
  };

  const handleCampaignImport = async (skipDuplicates) => {
    if (importing) return;
    setImporting(true);
    const findDup = (e) => data.find(d =>
      d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.link === e.link
    );
    // Separate rows: truly new vs existing duplicates
    const dupRows    = campPreview.map(e => ({ preview: e, existing: findDup(e) })).filter(x => x.existing);
    const newEntries = campPreview.filter(e => !findDup(e));
    const toImport   = skipDuplicates ? newEntries : campPreview;
    const skipped    = campPreview.length - toImport.length - dupRows.filter(x => x.preview.spend > 0 && x.existing.spend === 0).length;

    // For duplicate rows where old spend=0 but new spend>0, update spend in DB
    const spendUpdates = dupRows.filter(x => x.preview.spend > 0 && (x.existing.spend == null || x.existing.spend === 0));
    for (const { preview, existing } of spendUpdates) {
      const { error: upErr } = await supabase.from('campaigns').update({ spend: preview.spend }).eq('id', existing.id);
      if (upErr) { console.error('[spend-update] Supabase error:', upErr); }
      else { setData(prev => prev.map(d => d.id === existing.id ? { ...d, spend: preview.spend } : d)); }
    }

    const { data: newRows, error } = await supabase.from('campaigns').insert(toImport).select();
    if (error) {
      const msg = error.message || error.code || JSON.stringify(error);
      console.error('[campaign-insert] FULL ERROR:', JSON.stringify(error));
      console.error('[campaign-insert] first row sample:', JSON.stringify(toImport[0]));
      alert(`❌ Import failed:\n${msg}\n\nIf this says "column spend does not exist", run this SQL in your Supabase dashboard:\nALTER TABLE campaigns ADD COLUMN spend numeric DEFAULT 0;`);
      setImporting(false);
      return;
    }
    if (newRows) {
      // Hard-refresh from DB so state exactly matches what Supabase stored
      await fetchData();
    }
    let noStreamCount = 0;

    // Auto-detect no-stream days from MEDIA BUYER CSV:
    // For each streamer in this file, find dates within the file's range where they have NO entry.
    // Use campPreview (all rows) not toImport (may be empty if all are duplicates) so the site
    // is always resolved even when re-importing the same file a second time.
    const site = campMapping._defaultSite || (campPreview[0]?.site ?? '') || (toImport[0]?.site ?? '');
    if (site && campPreview.length > 0) {
      const allDates = [...new Set(campPreview.map(r => r.date))].sort();
      const minDate = allDates[0], maxDate = allDates[allDates.length - 1];
      // Build full date range between min and max
      const dateRange = [];
      const d = new Date(minDate);
      const end = new Date(maxDate);
      while (d <= end) {
        dateRange.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 1);
      }
      const streamers = [...new Set(campPreview.map(r => r.streamer))].filter(Boolean);
      // For no-stream detection, only Livestream rows count as "streamed".
      // Reels-only days should still be marked as no-stream days.
      const liveRows = campPreview.filter(r => !r.type || r.type === 'Live');
      // For each streamer, dates they did a livestream
      const streamedOn = {};
      streamers.forEach(s => {
        streamedOn[s] = new Set(liveRows.filter(r => r.streamer === s).map(r => r.date));
      });

      // Normalize CSV streamer names to match EOD names already in creatorPerfData for this site.
      // e.g. "AKOSI DOGIE" in CSV → "Dogie" in EOD keys → use "Dogie" for no-stream keys
      // so the Creator Performance view can find them.
      const perfStreamersForSite = [...new Set(
        Object.keys(creatorPerfData)
          .map(k => k.split('|'))
          .filter(parts => parts[2] === site)
          .map(parts => parts[1])
      )];
      const streamerNameMap = {};
      streamers.forEach(s => {
        if (perfStreamersForSite.length > 0) {
          const matched = smartMatchStreamer(s, '', '', perfStreamersForSite, '');
          streamerNameMap[s] = matched || s;
        } else {
          streamerNameMap[s] = s;
        }
      });


      // Build no-stream keys for missing dates
      const noStreamKeys = [];
      streamers.forEach(s => {
        const normalizedName = streamerNameMap[s];
        dateRange.forEach(date => {
          if (!streamedOn[s].has(date)) {
            noStreamKeys.push({ key: `${date}|${normalizedName}|${site}` });
          }
        });
      });
      if (noStreamKeys.length > 0) {
        await supabase.from('no_stream').upsert(noStreamKeys, { onConflict: 'key' });
        const newNS = { ...noStreamData };
        noStreamKeys.forEach(({ key }) => { newNS[key] = true; });
        setNoStreamData(newNS);
        noStreamCount = noStreamKeys.length;
      }
    }
    // Persist stream tally from side table into streamTally state + localStorage.
    // Use campPreview (never empty) rather than toImport (could be empty on re-import).
    if (Object.keys(campSideTable).length > 0 && site) {
      const normA = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const previewStreamers = [...new Set(campPreview.map(r => r.streamer))].filter(Boolean);
      const updated = { ...streamTally };
      Object.entries(campSideTable).forEach(([rawName, counts]) => {
        // Try alias first, then smartMatch against known streamers, then fall back to raw name
        const alias = STREAMER_ALIASES[normA(rawName)];
        const normalizedName = alias || smartMatchStreamer(rawName, '', '', previewStreamers, '') || rawName;
        // Store with lowercase key so lookup is case-insensitive
        const tallyKey = `${site.toLowerCase()}|${normalizedName.toLowerCase()}`;
        updated[tallyKey] = counts;
      });
      saveStreamTally(updated);
    }

    setImportResult({ imported: toImport.length, skipped, noStream: noStreamCount, spendUpdated: spendUpdates.length, mode: 'campaign' });
    await saveFileRecord(`Campaign · ${toImport.length} rows`);
    setImporting(false);
    setImportStep(3);
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportEODOnly(false);
    setImportStep(1);
    setImportMode(null);
    setEodSections([]);
    setEodSite('');
    setCampHeaders([]);
    setCampRawRows([]);
    setCampMapping({});
    setCampPreview([]);
    setSheetSummary(null);
    setImportResult(null);
    setImporting(false);
  };

  const uniqueDates = useMemo(() => [...new Set(data.map(d => d.date))].sort(), [data]);

  // minDate and maxDate both consider campaign data AND EOD creatorPerfData dates
  // so the date range is always valid even when campaign data is empty
  const minDate = useMemo(() => {
    const perfDates = Object.keys(creatorPerfData).map(k => k.split('|')[0]);
    const all = [...uniqueDates, ...perfDates].filter(Boolean).sort();
    return all[0] || '';
  }, [uniqueDates, creatorPerfData]);

  const maxDate = useMemo(() => {
    const perfDates = Object.keys(creatorPerfData).map(k => k.split('|')[0]);
    const all = [...uniqueDates, ...perfDates].filter(Boolean).sort();
    return all[all.length - 1] || '';
  }, [uniqueDates, creatorPerfData]);

  const [filterSite, setFilterSite] = useState('All');
  const [filterStreamer, setFilterStreamer] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Auto-initialize date range only on first load (when dates are null)
  useEffect(() => {
    if (minDate && !startDate) setStartDate(minDate);
  }, [minDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (maxDate && !endDate) setEndDate(maxDate);
  }, [maxDate]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- DERIVED METRICS ---
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return [];
    return data.filter(item => {
      if (item.site === 'PP') return false;
      const siteMatch = filterSite === 'All' || item.site === filterSite;
      const streamerMatch = filterStreamer === 'All' || item.streamer === filterStreamer;
      const typeMatch = filterType === 'All' || item.type === filterType;
      const dateMatch = (!startDate || item.date >= startDate) && (!endDate || item.date <= endDate);
      return siteMatch && streamerMatch && typeMatch && dateMatch;
    });
  }, [data, filterSite, filterStreamer, filterType, startDate, endDate]);

  // Total Metrics
  const totals = useMemo(() => {
    return filteredData.reduce((acc, curr) => ({
      spend: acc.spend + curr.spend,
      reg: acc.reg + curr.reg,
      dep: acc.dep + curr.dep,
    }), { spend: 0, reg: 0, dep: 0 });
  }, [filteredData]);

  // Global NGR from creatorPerfData within date range + matching filters
  const globalCreatorNGR = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.ngr) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalCreatorDep = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.dep) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalCreatorReg = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.reg) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalCreatorGGR = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.ggr) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalCreatorBonus = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return Object.entries(creatorPerfData).reduce((sum, [key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (startDate && date < startDate) return sum;
      if (endDate && date > endDate) return sum;
      if (filterSite !== 'All' && site !== filterSite) return sum;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return sum;
      return sum + (parseFloat(val.bonus) || 0);
    }, 0);
  }, [creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  const globalEfficacyRate = totals.spend > 0 ? (globalCreatorNGR / totals.spend) * 100 : null;

  // Group by Streamer for Summary Table — merged with adsReportData
  const streamerSummary = useMemo(() => {
    const summary = {};

    // Step 1: accumulate ad spend / reg / dep / live+reels counts from filtered campaign data.
    // Boosting is the only metric sourced from adsReportData (it doesn't exist in creatorPerfData).
    filteredData.forEach(item => {
      if (!summary[item.streamer]) {
        summary[item.streamer] = {
          name: item.streamer,
          site: item.site,
          spend: 0, reg: 0, dep: 0,
          ggr: 0, bonus: 0, ngr: 0, boosting: 0,
          liveCount: 0, reelsCount: 0,
        };
      }
      const s = summary[item.streamer];
      s.spend += item.spend;
      s.reg += item.reg;
      s.dep += item.dep;
      if (item.type === 'Live') s.liveCount += 1;
      else if (item.type === 'Reels') s.reelsCount += 1;

      // Boosting only — avoid double-counting per unique site|streamer|type key
      const adsKey = `${item.site}|${item.streamer}|${item.type}`;
      if (!s._adsKeysAdded) s._adsKeysAdded = new Set();
      if (!s._adsKeysAdded.has(adsKey)) {
        s._adsKeysAdded.add(adsKey);
        s.boosting += parseFloat((adsReportData[adsKey] || {}).boosting) || 0;
      }
    });

    // Step 2: merge GGR / Bonus / NGR / dep / reg from creatorPerfData (keyed date|streamer|site).
    // This is the exact same source the Creator Report uses, so totals will always match.
    // If a streamer doesn't appear in campaign data at all (e.g. T2B has no rawData entries),
    // still create a summary row for them so the leaderboard isn't empty.
    Object.entries(creatorPerfData).forEach(([key, val]) => {
      const [date, streamer, site] = key.split('|');
      // Respect the active date range and site / streamer filters
      if (date < startDate || date > endDate) return;
      if (filterSite !== 'All' && site !== filterSite) return;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return;
      // Create a stub entry if this streamer has no campaign data rows
      if (!summary[streamer]) {
        summary[streamer] = {
          name: streamer,
          site: site,
          spend: 0, reg: 0, dep: 0,
          ggr: 0, bonus: 0, ngr: 0, boosting: 0,
          liveCount: 0, reelsCount: 0,
        };
      }
      summary[streamer].dep   += parseFloat(val.dep)   || 0;
      summary[streamer].reg   += parseFloat(val.reg)   || 0;
      summary[streamer].ggr   += parseFloat(val.ggr)   || 0;
      summary[streamer].bonus += parseFloat(val.bonus) || 0;
      summary[streamer].ngr   += parseFloat(val.ngr)   || 0;
    });

    // Step 3: overlay liveCount/reelsCount from imported side-table tally when available.
    // This is authoritative (counts prepared by the media buyer) and handles cases where
    // campaign rows have mismatched names or types.
    Object.values(summary).forEach(s => {
      const tallyKey = `${(s.site||'').toLowerCase()}|${(s.name||'').toLowerCase()}`;
      if (streamTally[tallyKey]) {
        s.liveCount  = streamTally[tallyKey].live  ?? s.liveCount;
        s.reelsCount = streamTally[tallyKey].reels ?? s.reelsCount;
      }
    });

    return Object.values(summary)
      .map(({ _adsKeysAdded, ...rest }) => rest)
      .sort((a, b) => b.dep - a.dep);
  }, [filteredData, adsReportData, creatorPerfData, startDate, endDate, filterSite, filterStreamer, streamTally]);

  // Chart Data (Daily Totals)
  const chartData = useMemo(() => {
    const daily = {};
    filteredData.forEach(item => {
      if (!daily[item.date]) daily[item.date] = { date: item.date, spend: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
      daily[item.date].spend += item.spend;
      daily[item.date].dep += item.dep;
    });
    // Merge GGR / Bonus / NGR / dep from creatorPerfData
    Object.entries(creatorPerfData).forEach(([key, val]) => {
      const [date, streamer, site] = key.split('|');
      if (filterSite !== 'All' && site !== filterSite) return;
      if (filterStreamer !== 'All' && streamer !== filterStreamer) return;
      if (date < startDate || date > endDate) return;
      if (!daily[date]) daily[date] = { date, spend: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
      daily[date].dep += parseFloat(val.dep) || 0;
      daily[date].ggr   -= parseFloat(val.ggr)   || 0;
      daily[date].bonus += parseFloat(val.bonus)  || 0;
      daily[date].ngr   -= parseFloat(val.ngr)    || 0;
    });
    return Object.values(daily)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, creatorPerfData, startDate, endDate, filterSite, filterStreamer]);

  // Format currency
  const formatPHP = (val) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val);
  const formatNum = (val) => new Intl.NumberFormat('en-US').format(val);

  // Calculate ROI
  const getROI = (spend, dep) => {
    if (spend === 0) return dep > 0 ? 1000 : 0; 
    return ((dep - spend) / spend) * 100;
  };

  const totalROI = getROI(totals.spend, totals.dep);

  // Streamers derived from both campaign data AND creatorPerfData keys (date|streamer|site)
  // so the Creator Report dropdown is populated even when no campaign CSV has been uploaded yet.
  const streamers = useMemo(() => {
    const fromData = (filterSite === 'All' ? data : data.filter(d => d.site === filterSite)).map(d => d.streamer);
    const fromPerf = Object.keys(creatorPerfData).map(k => {
      const [, streamer, site] = k.split('|');
      return (filterSite === 'All' || site === filterSite) ? streamer : null;
    }).filter(Boolean);
    return [...new Set([...fromData, ...fromPerf])].sort();
  }, [data, creatorPerfData, filterSite]);

  // Reset streamer filter when it no longer belongs to the selected site
  useEffect(() => {
    if (filterStreamer !== 'All' && !streamers.includes(filterStreamer)) {
      setFilterStreamer('All');
    }
  }, [streamers, filterStreamer]);

  const perfSites = Object.keys(creatorPerfData).map(k => k.split('|')[2]).filter(Boolean);
  const sites = [...new Set([...data.map(d => d.site), ...perfSites])].filter(s => s && s !== 'PP').sort();
  const types = ["Live", "Reels"];

  // Layout wrapper class — stretched = full-width, compact = boxed + smaller text
  const mw = layoutMode === 'compact' ? 'max-w-7xl mx-auto px-4 md:px-6' : 'max-w-[1600px] mx-auto px-4 md:px-6';
  const mwHdr = layoutMode === 'compact' ? 'max-w-7xl mx-auto px-4 md:px-6' : 'max-w-[1600px] mx-auto px-4 md:px-8';

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* STICKY HEADER WRAPPER */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className={mwHdr}>

          {/* ROW 1 — Brand + User Controls */}
          <div className="flex items-center justify-between h-14 gap-4">
            {/* Left: Logo + Title + Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">Campaign Tracker</h1>
              {/* Refresh */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh all data"
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={refreshing ? 'animate-spin' : ''}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>
              {/* Dark mode toggle */}
              <button
                onClick={() => setDarkMode(d => !d)}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
              >
                {darkMode
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                }
              </button>
            </div>

            {/* Center: Tab Navigation */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'dashboard' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp size={13}/> Dashboard
              </button>
              <button
                onClick={() => setActiveView('report')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeView === 'report' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <BarChart2 size={13}/> Report
              </button>
            </div>

            {/* Right: User Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Layout toggle */}
              <button
                onClick={() => setLayoutMode(m => m === 'stretched' ? 'compact' : 'stretched')}
                title={layoutMode === 'stretched' ? 'Switch to Compact Mode' : 'Switch to Full-Width Mode'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all text-xs font-semibold shadow-sm whitespace-nowrap"
              >
                {layoutMode === 'stretched'
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
                }
                {layoutMode === 'stretched' ? 'Compact' : 'Full-Width'}
              </button>
              {/* Role badge */}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>{role ?? 'viewer'}</span>
              {/* Sign out */}
              <button
                onClick={signOut}
                title="Sign out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all text-xs font-semibold shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          </div>

          {/* ROW 2 — Actions + Filters */}
          <div className="flex items-center justify-between h-12 gap-3 border-t border-slate-100">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button onClick={openAddModal} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap">
                  <Plus size={13} /> Add Entry
                </button>
              )}
              {isAdmin && !(activeView === 'report' && reportSubTab === 'creator') && (
                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap">
                  <Upload size={13} /> Import File
                </button>
              )}
              {isAdmin && (
                <button onClick={handleDeduplicateData} className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap">
                  <CheckCircle size={13} /> Dedup
                </button>
              )}
              {isAdmin && (
                <button onClick={() => setShowClearModal(true)} className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm whitespace-nowrap">
                  <Trash2 size={13} /> Clear All Data
                </button>
              )}
              <button
                onClick={() => setActiveView('files')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-sm whitespace-nowrap ${
                  activeView === 'files'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-transparent shadow-md shadow-indigo-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                FILES
                {uploadedFiles.length > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold leading-none ${
                    activeView === 'files' ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                  }`}>{uploadedFiles.length}</span>
                )}
              </button>
            </div>

            {/* Right: Date Picker + Filters */}
            <div className="flex items-center gap-2">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
              />
              <div className="flex items-center gap-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-visible divide-x divide-slate-100 dark:divide-slate-700">
                  <FilterDropdown
                    icon={<Filter size={12} className="text-indigo-400 shrink-0" />}
                    value={filterSite}
                    options={sites}
                    allLabel="All Sites"
                    onChange={setFilterSite}
                  />
                  <FilterDropdown
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 shrink-0"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>}
                    value={filterStreamer}
                    options={streamers}
                    allLabel="All Streamers"
                    onChange={setFilterStreamer}
                  />
                  {!(activeView === 'report' && reportSubTab === 'creator') && (
                  <FilterDropdown
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400 shrink-0"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>}
                    value={filterType}
                    options={types}
                    allLabel="All Formats"
                    onChange={setFilterType}
                  />
                  )}
                </div>
            </div>
          </div>

        </div>
      </div>

      {/* DISCLAIMER BANNER */}
      {showDisclaimer && (
        <div className="bg-violet-50 border-b border-violet-200 disclaimer-enter">
          <div className={`${mwHdr} py-2`}>
            <div className="flex items-start gap-3">
              <AlertTriangle size={15} className="text-violet-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-violet-700 flex-1 leading-relaxed">
                <span className="font-bold">Disclaimer:</span>{' '}
                <em>The data presented in this Campaign Performance Tracker is based solely on the CSV files or Google Sheets submitted by the admin on a daily basis. This tracker is not directly connected to or integrated with any Whitelabel sites indicated within this system. All figures are manually sourced and may not reflect real-time data from those platforms.</em>
              </p>
              <button onClick={dismissDisclaimer} title="Dismiss" className="text-violet-400 hover:text-violet-600 shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATS CARDS */}
      <div className={`${mwHdr} py-3`}>

          <div className={`grid gap-3 ${(activeView === 'report' && reportSubTab === 'creator') ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4 xl:grid-cols-7'}`}>
            {(() => {
              const isCreator = activeView === 'report' && reportSubTab === 'creator';
              const displaySpend = isCreator ? creatorSummary.spend : totals.spend;
              const displayReg   = isCreator ? creatorSummary.reg   : globalCreatorReg;
              const displayDep   = isCreator ? creatorSummary.dep   : globalCreatorDep;
              const displayGGR   = isCreator ? creatorSummary.ggr   : globalCreatorGGR;
              const displayBonus = isCreator ? creatorSummary.bonus : globalCreatorBonus;
              const displayNGR   = isCreator ? creatorSummary.ngr   : globalCreatorNGR;
              const displayEff   = isCreator
                ? (creatorSummary.efficacyRate !== null && creatorSummary.efficacyRate !== undefined ? creatorSummary.efficacyRate : null)
                : globalEfficacyRate;
              return (<>
            {!isCreator && <MetricCard
              title="Total Ad Spend"
              value={formatPHP(displaySpend)}
              icon={<ArrowDownRight className="text-red-500" size={16} />}
              color="border-l-4 border-red-500"
            />}
            {isCreator && <MetricCard
              title="Total Register"
              value={(creatorSummary.reg || 0).toLocaleString()}
              icon={<ArrowUpRight className="text-sky-500" size={16} />}
              color="border-l-4 border-sky-500"
            />}
            {!isCreator && <MetricCard
              title="Total Register"
              value={(displayReg || 0).toLocaleString()}
              icon={<ArrowUpRight className="text-sky-500" size={16} />}
              color="border-l-4 border-sky-500"
            />}
            <MetricCard
              title="Total Deposit"
              value={formatPHP(displayDep)}
              icon={<ArrowUpRight className="text-emerald-500" size={16} />}
              color="border-l-4 border-emerald-500"
            />
            {isCreator && <MetricCard
              title="Total GGR"
              value={formatPHP(creatorSummary.ggr || 0)}
              icon={<DollarSign className={(creatorSummary.ggr || 0) >= 0 ? "text-amber-500" : "text-red-500"} size={16} />}
              color={(creatorSummary.ggr || 0) >= 0 ? "border-l-4 border-amber-400" : "border-l-4 border-red-500"}
              valueColor={(creatorSummary.ggr || 0) >= 0 ? '' : 'text-red-500'}
            />}
            {!isCreator && <MetricCard
              title="Total GGR"
              value={formatPHP(displayGGR)}
              icon={<DollarSign className={displayGGR >= 0 ? "text-amber-500" : "text-red-500"} size={16} />}
              color={displayGGR >= 0 ? "border-l-4 border-amber-400" : "border-l-4 border-red-500"}
              valueColor={displayGGR >= 0 ? '' : 'text-red-500'}
            />}
            {isCreator && <MetricCard
              title="Total Bonus"
              value={formatPHP(creatorSummary.bonus || 0)}
              icon={<DollarSign className="text-purple-500" size={16} />}
              color="border-l-4 border-purple-500"
            />}
            {!isCreator && <MetricCard
              title="Total Bonus"
              value={formatPHP(displayBonus)}
              icon={<DollarSign className="text-purple-500" size={16} />}
              color="border-l-4 border-purple-500"
            />}
            <MetricCard
              title="Total NGR"
              value={formatPHP(displayNGR)}
              icon={<DollarSign className={displayNGR >= 0 ? "text-indigo-500" : "text-red-500"} size={16} />}
              color={displayNGR >= 0 ? "border-l-4 border-indigo-500" : "border-l-4 border-red-500"}
              valueColor={displayNGR >= 0 ? 'text-emerald-600' : 'text-red-500'}
            />
            {!isCreator && <MetricCard
              title="Efficacy Rate"
              value={displayEff !== null ? `${displayEff.toFixed(2)}%` : 'N/A'}
              icon={<TrendingUp className={displayEff !== null && displayEff >= 100 ? "text-emerald-600" : "text-amber-500"} size={16} />}
              subValue="NGR ÷ Ad Spend"
              color={displayEff !== null && displayEff >= 100 ? "border-l-4 border-emerald-600" : "border-l-4 border-amber-400"}
            />}
              </>);
            })()}
          </div>
          {(activeView === 'report' && reportSubTab === 'creator') && (
            <div className="flex items-center justify-center gap-3 pt-1">
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl px-4 py-1.5 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-200 shrink-0"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                <span className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wide">Streams</span>
                <span className="text-sm font-black text-white">{creatorSummary.streams ?? 0}</span>
              </div>
              <div className="flex items-center gap-2.5 bg-gradient-to-r from-violet-600 to-violet-500 rounded-xl px-4 py-1.5 shadow-sm shadow-violet-200 dark:shadow-violet-900/40">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-200 shrink-0"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/></svg>
                <span className="text-[11px] font-semibold text-violet-200 uppercase tracking-wide">Reels</span>
                <span className="text-sm font-black text-white">{creatorSummary.reels ?? 0}</span>
              </div>
            </div>
          )}
        </div>

      {(!startDate || !endDate) && (
        <div className={`${mw} py-8 view-enter`}>
          <div className="flex flex-col items-center justify-center gap-4 py-24 bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              <Calendar size={28} className="text-indigo-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Select a Date Range</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Use the <span className="font-semibold text-indigo-600 dark:text-indigo-400">date picker</span> in the top-right to choose a start and end date before viewing any data.
            </p>
          </div>
        </div>
      )}

      {startDate && endDate && activeView === 'dashboard' && (
      <div className={`${mw} py-8 space-y-8 view-enter`}>
        
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          {/* ── Chart header ── */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Calendar size={20} className="text-slate-400"/>
              Daily Financial Trend
            </h3>
            {/* Legend toggles */}
            <div className="flex flex-wrap gap-2">
              {[{key:'spend',label:'Ad Spend',color:'#ef4444'},{key:'dep',label:'Deposits',color:'#10b981'},{key:'ggr',label:'GGR',color:'#f59e0b'},{key:'bonus',label:'Bonus',color:'#a855f7'},{key:'ngr',label:'NGR',color:'#6366f1'}].map(s => (
                <button
                  key={s.key}
                  onClick={() => setHiddenSeries(prev => ({ ...prev, [s.key]: !prev[s.key] }))}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                    hiddenSeries[s.key]
                      ? 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                  style={!hiddenSeries[s.key] ? { borderColor: s.color, color: s.color } : {}}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: hiddenSeries[s.key] ? '#cbd5e1' : s.color }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                <defs>
                  <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradGGR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradBonus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradNGR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

                <XAxis
                  dataKey="date"
                  tickFormatter={str => { const d = new Date(str); return `${d.getMonth()+1}/${d.getDate()}`; }}
                  stroke="#94a3b8" tick={{ fontSize: 11 }}
                  tickLine={false} axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8" tick={{ fontSize: 11 }}
                  tickLine={false} axisLine={false}
                  tickFormatter={val => val === 0 ? '0' : `₱${(val/1000).toFixed(0)}k`}
                  width={58}
                />

                {/* Zero baseline */}
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 3" strokeWidth={1.5}
                  label={{ value: '0', position: 'insideTopLeft', fontSize: 10, fill: '#94a3b8' }}
                />

                {/* Tooltip */}
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -4px rgb(0 0 0 / 0.12)', fontSize: 12, padding: '10px 14px' }}
                  labelFormatter={str => { const d = new Date(str); return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }); }}
                  formatter={(value, name) => [formatPHP(value), name]}
                  itemSorter={() => -1}
                />

                {/* Brush zoom */}
                <Brush dataKey="date" height={36} stroke="#6366f1" fill="#eef2ff" travellerWidth={10}
                  tickFormatter={str => { const d = new Date(str); return `${d.getMonth()+1}/${d.getDate()}`; }}
                  y={335}
                  style={{ fontSize: 11, fontWeight: 600, color: '#6366f1' }}
                  gap={2}
                />

                {/* Areas (filled) */}
                {!hiddenSeries.spend && <Area type="monotone" dataKey="spend" name="Ad Spend" stroke="#ef4444" strokeWidth={2} fill="url(#gradSpend)" dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
                {!hiddenSeries.dep   && <Area type="monotone" dataKey="dep"   name="Deposits" stroke="#10b981" strokeWidth={2} fill="url(#gradDep)"   dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
                {!hiddenSeries.ggr   && <Area type="monotone" dataKey="ggr"      name="GGR"   stroke="#f59e0b" strokeWidth={2} fill="url(#gradGGR)"   dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
                {!hiddenSeries.bonus && <Area type="monotone" dataKey="bonus"    name="Bonus" stroke="#a855f7" strokeWidth={2} fill="url(#gradBonus)" dot={{ r: 3, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
                {!hiddenSeries.ngr   && <Area type="monotone" dataKey="ngr"      name="NGR"   stroke="#6366f1" strokeWidth={2} fill="url(#gradNGR)"   dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5 }} />}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Peak value summary */}
          {chartData.length > 0 && (() => {
            const peaks = {
              dep:   chartData.reduce((p, c) => c.dep   > p.dep   ? c : p, chartData[0]),
              ggr:   chartData.reduce((p, c) => c.ggr   > p.ggr   ? c : p, chartData[0]),
              ngr:   chartData.reduce((p, c) => c.ngr   > p.ngr   ? c : p, chartData[0]),
              spend: chartData.reduce((p, c) => c.spend > p.spend ? c : p, chartData[0]),
            };
            const fmt = d => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
            return (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1 self-center">Peaks</span>
                {[{label:'Best Deposits',val:peaks.dep.dep,date:peaks.dep.date,color:'text-emerald-600'},
                  {label:'Best GGR',val:peaks.ggr.ggr,date:peaks.ggr.date,color:'text-amber-600'},
                  {label:'Best NGR',val:peaks.ngr.ngr,date:peaks.ngr.date,color:'text-indigo-600'},
                  {label:'Highest Spend',val:peaks.spend.spend,date:peaks.spend.date,color:'text-red-500'}].map(p => (
                  <div key={p.label} className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1">
                    <span className="text-[10px] text-slate-400 font-medium">{p.label}</span>
                    <span className={`text-[11px] font-bold ${p.color}`}>{formatPHP(p.val)}</span>
                    <span className="text-[10px] text-slate-400">on {fmt(p.date)}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-slate-400"/>
              Streamer ROI Leaderboard
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Streamer</th>
                  <th className="p-4 font-semibold">Site</th>
                  <th className="p-4 font-semibold text-center">Lives</th>
                  <th className="p-4 font-semibold text-center">Reels</th>
                  <th className="p-4 font-semibold text-right">Ad Spend</th>
                  <th className="p-4 font-semibold text-right">Reg</th>
                  <th className="p-4 font-semibold text-right">Deposits</th>
                  <th className="p-4 font-semibold text-right">GGR</th>
                  <th className="p-4 font-semibold text-right">Bonus</th>
                  <th className="p-4 font-semibold text-right">NGR</th>
                  <th className="p-4 font-semibold text-right">Boosting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {streamerSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.name}</td>
                    <td className="p-4 text-slate-500">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.site === 'WFL' ? 'bg-blue-100 text-blue-700' :
                        item.site === 'RLM' ? 'bg-purple-100 text-purple-700' :
                        item.site === 'COW' ? 'bg-teal-100 text-teal-700' :
                        item.site === 'T2B' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                      }`}>{item.site}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <Radio size={14} className="text-red-500"/>{item.liveCount}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-slate-600">
                        <Video size={14} className="text-blue-500"/>{item.reelsCount}
                      </div>
                    </td>
                    <td className="p-4 text-right text-red-500 font-medium">{formatPHP(item.spend)}</td>
                    <td className="p-4 text-right text-slate-600">{formatNum(item.reg)}</td>
                    <td className="p-4 text-right text-emerald-600 font-medium">{formatPHP(item.dep)}</td>
                    <td className={`p-4 text-right ${ item.ggr === 0 ? 'text-slate-300' : item.ggr >= 0 ? 'text-slate-700' : 'text-red-500'}`}>
                      {item.ggr === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.ggr)}
                    </td>
                    <td className={`p-4 text-right ${ item.bonus === 0 ? 'text-slate-300' : 'text-amber-600'}`}>
                      {item.bonus === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.bonus)}
                    </td>
                    <td className={`p-4 text-right font-semibold ${ item.ngr === 0 ? 'text-slate-300' : item.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.ngr === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.ngr)}
                    </td>
                    <td className={`p-4 text-right ${ item.boosting === 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                      {item.boosting === 0 ? '—' : new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(item.boosting)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {streamerSummary.length > 0 && (() => {
                const gt = streamerSummary.reduce((acc, r) => ({
                  spend: acc.spend + r.spend, reg: acc.reg + r.reg, dep: acc.dep + r.dep,
                  ggr: acc.ggr + r.ggr, bonus: acc.bonus + r.bonus, ngr: acc.ngr + r.ngr, boosting: acc.boosting + r.boosting,
                  liveCount: acc.liveCount + r.liveCount, reelsCount: acc.reelsCount + r.reelsCount,
                }), { spend:0, reg:0, dep:0, ggr:0, bonus:0, ngr:0, boosting:0, liveCount:0, reelsCount:0 });
                return (
                  <tfoot>
                    <tr className="bg-slate-800 text-white text-sm font-bold">
                      <td className="p-4 uppercase tracking-wider" colSpan={2}>Grand Total</td>
                      <td className="p-4 text-center">{gt.liveCount}</td>
                      <td className="p-4 text-center">{gt.reelsCount}</td>
                      <td className="p-4 text-right">{formatPHP(gt.spend)}</td>
                      <td className="p-4 text-right">{formatNum(gt.reg)}</td>
                      <td className="p-4 text-right">{formatPHP(gt.dep)}</td>
                      <td className={`p-4 text-right ${gt.ggr >= 0 ? '' : 'text-red-300'}`}>{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.ggr)}</td>
                      <td className="p-4 text-right opacity-80">{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.bonus)}</td>
                      <td className={`p-4 text-right ${gt.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.ngr)}</td>
                      <td className="p-4 text-right opacity-80">{new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(gt.boosting)}</td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800">Daily Transaction Log</h3>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-3 font-semibold w-16"></th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Site</th>
                  <th className="p-3 font-semibold">Streamer</th>
                  <th className="p-3 font-semibold">Format</th>
                  <th className="p-3 font-semibold">Link</th>
                  <th className="p-3 font-semibold text-right">Spend</th>
                  <th className="p-3 font-semibold text-right">Registers</th>
                  <th className="p-3 font-semibold text-right">Deposits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      {isAdmin && (
                      <div className="flex gap-1">
                        <button onClick={() => openEditModal(item)} className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Edit"><Edit2 size={13}/></button>
                        <button onClick={() => handleDelete(item)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={13}/></button>
                      </div>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 whitespace-nowrap">{item.date}</td>
                    <td className="p-3 text-slate-500">{item.site}</td>
                    <td className="p-3 font-medium text-slate-700">{item.streamer}</td>
                    <td className="p-3 text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-xs border ${
                        item.type === 'Live' ? 'bg-red-50 text-red-600 border-red-100' :
                        item.type === 'Reels' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        item.type === 'General' ? 'bg-gray-50 text-gray-600 border-gray-200' :
                        'bg-purple-50 text-purple-600 border-purple-100'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3">
                      {item.link ? (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
                          <ExternalLink size={14} /> <span className="text-xs whitespace-nowrap">View URL</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3 text-right text-slate-600">{formatPHP(item.spend)}</td>
                    <td className="p-3 text-right text-slate-600">{item.reg}</td>
                    <td className="p-3 text-right font-medium text-emerald-600">{formatPHP(item.dep)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      )}

      {startDate && endDate && activeView === 'report' && (
        <div className={`${mw} pt-2 view-enter`}>
          {/* Sub-tab bar */}
          <div className="flex gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200 w-fit mb-6">
            <button
              onClick={() => setReportSubTab('ads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportSubTab === 'ads' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <BarChart2 size={13}/> Ads Summary
            </button>
            <button
              onClick={() => setReportSubTab('creator')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                reportSubTab === 'creator' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Activity size={13}/> Creator Report
            </button>
          </div>
        </div>
      )}

      {activeView === 'report' && reportSubTab === 'ads' && (
        <AdsReportView
          layoutMode={layoutMode}
          filteredData={filteredData}
          adsReportData={adsReportData}
          creatorPerfData={creatorPerfData}
          startDate={startDate}
          endDate={endDate}
          filterSite={filterSite}
          filterStreamer={filterStreamer}
          onEdit={openAdsEditModal}
          formatPHP={formatPHP}
          formatNum={formatNum}
        />
      )}

      {activeView === 'report' && reportSubTab === 'creator' && (
        <CreatorReportView
          layoutMode={layoutMode}
          data={data}
          startDate={startDate}
          endDate={endDate}
          creatorPerfData={creatorPerfData}
          onEdit={openCreatorPerfModal}
          onSummaryChange={setCreatorSummary}
          formatPHP={formatPHP}
          streamers={streamers}
          sites={sites}
          externalSite={filterSite}
          externalStreamer={filterStreamer}
          onImportEOD={openEODImport}
          onAddEntry={(streamer, site) => {
            setEditingId(null);
            setFormValues({ ...emptyForm, date: new Date().toISOString().split('T')[0], streamer, site: (site && site !== 'All') ? site : 'WFL' });
            setShowModal(true);
          }}
          onEditEntry={openEditModal}
          onDeleteEntry={handleDelete}
          onDeleteDay={handleDeleteDay}
          isAdmin={isAdmin}
          noStreamData={noStreamData}
          onMarkNoStream={handleMarkNoStream}
          onUnmarkNoStream={handleUnmarkNoStream}
          streamTally={streamTally}
        />
      )}

      {/* FILE MANAGEMENT VIEW */}
      {activeView === 'files' && (
        <div className={`${mw} py-8 view-enter`}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">File Management</h2>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-[10px] font-bold">{uploadedFiles.length}</span>
              </div>
              {isAdmin && (
                <button onClick={() => setShowImportModal(true)} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm">
                  <Upload size={13}/> Import File
                </button>
              )}
            </div>

            {/* Table */}
            {uploadedFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <p className="text-sm text-slate-400 font-medium">No files uploaded yet</p>
                <p className="text-xs text-slate-400">Files will appear here after you import a CSV</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 text-left">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">File Name</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date &amp; Time Uploaded</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded By</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Info</th>
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {uploadedFiles.map((file, i) => (
                      <tr key={file.id ?? i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              file.file_type === 'csv' ? 'bg-emerald-100 text-emerald-700'
                              : file.file_type === 'xlsx' || file.file_type === 'xls' ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                            }`}>{file.file_type || 'file'}</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 text-xs truncate max-w-[220px]" title={file.file_name}>{file.file_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500">{file.file_type?.toUpperCase() || '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          {file.uploaded_at ? new Date(file.uploaded_at).toLocaleString() : '—'}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-600 dark:text-slate-400">{file.uploaded_by || '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">
                          {file.file_size ? (file.file_size >= 1024 ? `${(file.file_size/1024).toFixed(1)} KB` : `${file.file_size} B`) : '—'}
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-500 max-w-[160px] truncate" title={file.extra_info}>{file.extra_info || '—'}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            {file.file_content && (
                              <button
                                onClick={() => handleDownloadFile(file)}
                                title="Download"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-200 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                Download
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                title="Delete"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 transition-colors"
                              >
                                <Trash2 size={11}/> Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 modal-content">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-800">{editingId !== null ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</label>
                  <input type="date" value={formValues.date} onChange={e => setFormValues({...formValues, date: e.target.value})} className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Site</label>
                  <FormSelect className="mt-1" value={formValues.site} onSelect={v => setFormValues({...formValues, site: v})} options={['WFL','RLM','COW','T2B']}/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Streamer</label>
                  <input type="text" value={formValues.streamer} onChange={e => setFormValues({...formValues, streamer: e.target.value})} placeholder="e.g. HolyFather" list="streamer-suggestions" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <datalist id="streamer-suggestions">
                    {streamers.map(s => <option key={s} value={s}/>)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
                  <FormSelect className="mt-1" value={formValues.type} onSelect={v => setFormValues({...formValues, type: v})} options={['Live','Reels']}/>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Spend (₱)</label>
                  <input type="number" value={formValues.spend} onChange={e => setFormValues({...formValues, spend: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registers</label>
                  <input type="number" value={formValues.reg} onChange={e => setFormValues({...formValues, reg: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deposits (₱)</label>
                  <input type="number" value={formValues.dep} onChange={e => setFormValues({...formValues, dep: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Link (optional)</label>
                  <input type="text" value={formValues.link} onChange={e => setFormValues({...formValues, link: e.target.value})} placeholder="https://..." className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                  <FormSelect className="mt-1" value={formValues.status || 'Pending'} onSelect={v => setFormValues({...formValues, status: v})} options={['Pending','Success','Failed']}/>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} disabled={!formValues.date || !formValues.streamer} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm transition-colors">
                {editingId !== null ? 'Save Changes' : 'Add Entry'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL DATA CONFIRMATION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 shrink-0">
                <AlertTriangle size={20} className="text-red-600"/>
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-800">Clear All Data</h2>
                <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              This will permanently delete <span className="font-bold text-red-600">all campaigns, ads reports, creator performance, no-stream flags, and uploaded file records</span> from the database. Use this before your boss sends new CSVs to start fresh.
            </p>
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Type <span className="font-bold text-red-600 tracking-widest">CONFIRM</span> to enable the button
              </label>
              <input
                type="text"
                value={clearConfirmText}
                onChange={e => setClearConfirmText(e.target.value)}
                placeholder="Type CONFIRM here"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-300 transition-all"
                disabled={clearingData}
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowClearModal(false); setClearConfirmText(''); }}
                disabled={clearingData}
                className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50"
              >Cancel</button>
              <button
                onClick={handleClearAllData}
                disabled={clearingData || clearConfirmText !== 'CONFIRM'}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {clearingData
                  ? <><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Clearing…</>
                  : <><Trash2 size={14}/> Yes, Clear Everything</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={(e) => e.target === e.currentTarget && closeImportModal()}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-content">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2"><Upload size={18} className="text-emerald-500"/> {importEODOnly ? 'Import EOD Report' : 'Import File'}</h2>
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
                  {importStep === 1 && (importEODOnly ? 'UNRAVEL EOD TALENTS files only' : 'Drop any CSV or XLSX — format is detected automatically')}
                  {importStep === 2 && importMode === 'eod'      && `EOD Report detected — ${eodSections.length} streamer(s) found`}
                  {importStep === 2 && importMode === 'campaign' && `Campaign data — ${campPreview.length} rows ready`}
                  {importStep === 3 && 'Done!'}
                </p>
              </div>
              <button onClick={closeImportModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20}/></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">

              {/* STEP 1 — File Upload */}
              {importStep === 1 && (
                <div
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    importDragOver ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => importFileRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setImportDragOver(true); }}
                  onDragLeave={() => setImportDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setImportDragOver(false); handleImportFile(e.dataTransfer.files[0]); }}
                >
                  <Upload size={40} className="mx-auto text-slate-300 mb-3"/>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-200 mb-1">Click anywhere here or drag & drop a CSV or XLSX file</p>
                  <p className="text-xs text-slate-400 dark:text-slate-400 mb-4">
                    {importEODOnly ? 'Only UNRAVEL EOD TALENTS CSV/XLSX files are accepted here' : 'EOD reports and campaign files are both supported — CSV and XLSX'}
                  </p>
                  <input ref={importFileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls" className="hidden" onChange={(e) => handleImportFile(e.target.files[0])}/>
                  <div className="flex justify-center gap-4 text-[11px] text-slate-400 mt-4">
                    {importEODOnly
                      ? <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full font-semibold">UNRAVEL EOD TALENTS - *.csv / *.xlsx</span>
                      : <><span className="bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">UNRAVEL EOD *.csv / *.xlsx</span><span className="bg-slate-100 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 rounded-full">MEDIA BUYER TRACKER *.csv / *.xlsx</span></>
                    }
                  </div>
                </div>
              )}

              {/* STEP 2 — EOD Mode: Streamers review */}
              {importStep === 2 && importMode === 'eod' && (
                <div className="space-y-4">
                  {/* Site selector — fallback only, used when a section has no auto-detected site */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">Fallback site:</label>
                    <div className="flex gap-2">
                      {['WFL','RLM','T2B','COW'].map(s => (
                        <button
                          key={s}
                          onClick={() => setEodSite(s)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                            eodSite === s
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-300 hover:border-indigo-300'
                          }`}
                        >{s}</button>
                      ))}
                    </div>
                    {eodSections.some(s => !s.site) && !eodSite && <span className="text-xs text-amber-600 font-semibold">← needed for undetected rows</span>}
                    {eodSections.every(s => s.site) && <span className="text-xs text-emerald-600 font-semibold">✓ all sites auto-detected from file</span>}
                  </div>

                  {/* Streamers table */}
                  {/* datalist of all known canonical streamer names for autocomplete */}
                  <datalist id="eod-streamer-names">
                    {[...new Set(Object.values(STREAMER_ALIASES))].sort().map(n => <option key={n} value={n}/>)}
                    {streamers.map(n => <option key={'k-'+n} value={n}/>)}
                  </datalist>
                  <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-600">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-3 py-2 w-8">
                            <input type="checkbox" checked={eodSections.every(s => s.selected)}
                              onChange={e => setEodSections(prev => prev.map(s => ({ ...s, selected: e.target.checked })))}
                              className="rounded"/>
                          </th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Streamer (from file)</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Import as</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Site</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Status</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Rows</th>
                          <th className="px-3 py-2 text-center font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Date range</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {eodSections.map((sec, i) => {
                          const dates = sec.rows.map(r => r.date).filter(Boolean).sort();
                          const dateRange = dates.length ? `${dates[0]} → ${dates[dates.length-1]}` : '—';
                          const isAutoMatched = sec.autoMatched;
                          return (
                            <tr key={i} className={sec.selected ? (isAutoMatched ? 'hover:bg-slate-50 dark:hover:bg-slate-700' : 'bg-amber-50/40 dark:bg-amber-900/20 hover:bg-amber-50 dark:hover:bg-amber-900/30') : 'opacity-40'}>
                              <td className="px-3 py-2 text-center">
                                <input type="checkbox" checked={sec.selected}
                                  onChange={e => setEodSections(prev => prev.map((s,j) => j===i ? { ...s, selected: e.target.checked } : s))}
                                  className="rounded"/>
                              </td>
                              <td className="px-3 py-2 font-medium text-slate-500 dark:text-slate-200">{sec.streamer}</td>
                              <td className="px-3 py-2">
                                <input
                                  type="text"
                                  value={sec.editName}
                                  list="eod-streamer-names"
                                  onChange={e => setEodSections(prev => prev.map((s,j) => j===i ? { ...s, editName: e.target.value, autoMatched: true } : s))}
                                  placeholder="Type streamer name…"
                                  className={`border rounded px-2 py-0.5 w-36 text-xs focus:outline-none focus:ring-1 bg-white dark:bg-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${
                                    isAutoMatched
                                      ? 'border-emerald-300 dark:border-emerald-500 focus:ring-emerald-400'
                                      : 'border-amber-300 dark:border-amber-500 focus:ring-amber-400'
                                  }`}
                                />
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={sec.site || eodSite || ''}
                                  onChange={e => setEodSections(prev => prev.map((s,j) => j===i ? { ...s, site: e.target.value } : s))}
                                  className={`border rounded px-1 py-0.5 text-xs font-bold focus:outline-none focus:ring-1 bg-white dark:bg-slate-700 dark:text-slate-100 ${
                                    sec.site ? 'border-emerald-300 text-emerald-700 dark:border-emerald-500 dark:text-emerald-300' : 'border-amber-300 text-amber-600 dark:border-amber-500'
                                  }`}
                                >
                                  <option value="">—</option>
                                  {['WFL','RLM','T2B','COW'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-center">
                                {isAutoMatched
                                  ? <span className="inline-flex items-center gap-0.5 bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full"><CheckCircle size={10}/> Matched</span>
                                  : <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full"><AlertTriangle size={10}/> Review</span>
                                }
                              </td>
                              <td className="px-3 py-2 text-center text-slate-500 dark:text-slate-300">{sec.rows.length}</td>
                              <td className="px-3 py-2 text-center text-slate-400 dark:text-slate-400 whitespace-nowrap">{dateRange}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {eodSections.some(s => s.selected && !s.autoMatched) && (
                    <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-600 rounded-lg px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0"/>
                      <span><strong>Review required:</strong> Some streamers could not be auto-identified. Type the correct name in the "Import as" field — it will auto-suggest known names.</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Data saves to Creator Performance (EOD) tab. Existing entries for the same date+streamer+site are overwritten.</p>
                </div>
              )}

              {/* STEP 2 — Campaign Mode: Column mapping + preview */}
              {importStep === 2 && importMode === 'campaign' && (() => {
                const campRequiredFields = ['date','site','streamer'];
                const campAllFields = ['date','site','streamer','spend','reg','dep','type','link'];
                const dupCheck = (e) => data.some(d =>
                  d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.type === e.type
                );
                const dupCount = campPreview.filter(dupCheck).length;
                const newCount = campPreview.length - dupCount;
                return (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-3">Column Mapping</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {campAllFields.map(field => (
                          <div key={field}>
                            <label className={`text-xs font-semibold uppercase tracking-wide ${
                              campRequiredFields.includes(field) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                            }`}>
                              {field} {campRequiredFields.includes(field) && <span className="text-red-400">*</span>}
                            </label>
                            {field === 'site' && campMapping._defaultSite && campMapping.site === undefined ? (
                              <div className="mt-1 w-full border border-emerald-200 rounded-lg px-2 py-1.5 text-xs bg-emerald-50 text-emerald-700 font-semibold">
                                Auto: {campMapping._defaultSite} (filename)
                              </div>
                            ) : (
                              <select
                                value={campMapping[field] ?? ''}
                                onChange={e => {
                                  const updated = { ...campMapping, [field]: e.target.value };
                                  setCampMapping(updated);
                                  setCampPreview(buildCampaignPreview(campRawRows, updated));
                                }}
                                className="mt-1 w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              >
                                <option value="">— skip —</option>
                                {campHeaders.map((h, idx) => (
                                  <option key={idx} value={String(idx)}>{h || `Column ${idx+1}`}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    {sheetSummary && (
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sheets detected</p>
                        <div className="flex flex-wrap gap-1.5">
                          {sheetSummary.used.map(s => (
                            <span key={s.name} className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                              {s.name} <span className="opacity-60">({s.count})</span>
                            </span>
                          ))}
                          {sheetSummary.skipped.map(name => (
                            <span key={name} className="bg-slate-100 text-slate-400 border border-slate-200 text-xs px-2 py-0.5 rounded-full line-through">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 text-xs">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-3 py-1.5 rounded-lg">{newCount} new rows</span>
                      {dupCount > 0 && <span className="bg-amber-50 text-amber-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"><AlertTriangle size={12}/> {dupCount} duplicates</span>}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">Preview ({campPreview.length} rows)</h3>
                      <div className="overflow-x-auto max-h-48 rounded-lg border border-slate-200 dark:border-slate-600">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                            <tr>
                              {['date','site','streamer','spend','reg','dep','type'].map(f => (
                                <th key={f} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-300 uppercase tracking-wide whitespace-nowrap">{f}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {campPreview.map((row, i) => {
                              const dup = dupCheck(row);
                              return (
                                <tr key={i} className={dup ? 'bg-amber-50 dark:bg-amber-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}>
                                  <td className="px-3 py-1.5 whitespace-nowrap dark:text-slate-200">{row.date}</td>
                                  <td className="px-3 py-1.5 dark:text-slate-200">{row.site}</td>
                                  <td className="px-3 py-1.5 dark:text-slate-200">{row.streamer}</td>
                                  <td className="px-3 py-1.5 text-right dark:text-slate-200">{row.spend?.toLocaleString()}</td>
                                  <td className="px-3 py-1.5 text-right dark:text-slate-200">{row.reg}</td>
                                  <td className="px-3 py-1.5 text-right dark:text-slate-200">{row.dep?.toLocaleString()}</td>
                                  <td className="px-3 py-1.5 dark:text-slate-200">{row.type}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* STEP 3 — Result */}
              {importStep === 3 && importResult && (
                <div className="text-center py-10">
                  <CheckCircle size={52} className="mx-auto text-emerald-500 mb-4"/>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                    {importResult.mode === 'eod' ? 'EOD Data Imported!' : 'Campaign Data Imported!'}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-emerald-600">{importResult.imported} {importResult.mode === 'eod' ? 'day-entries' : 'rows'}</span> saved successfully.
                    {(importResult.spendUpdated ?? 0) > 0 && <> <span className="font-bold text-blue-600">{importResult.spendUpdated} ad spend values</span> updated.</>}
                    {importResult.skipped > 0 && <> <span className="font-bold text-amber-600">{importResult.skipped} duplicates</span> skipped.</>}
                    {(importResult.noStream ?? 0) > 0 && <> <span className="font-bold text-slate-500">{importResult.noStream} no-stream days</span> auto-marked.</>}
                  </p>
                  {importResult.mode === 'eod' && (
                    <p className="text-xs text-slate-400 mt-2">View results in the Creator Performance tab.</p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center gap-3">
              {importStep === 1 && (
                <>
                  <span className="text-xs text-slate-400 dark:text-slate-500">Supports .csv and .tsv files</span>
                  <button onClick={closeImportModal} className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancel</button>
                </>
              )}
              {importStep === 2 && importMode === 'eod' && (
                <>
                  <button onClick={() => setImportStep(1)} className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">← Back</button>
                  <button
                    onClick={handleEODImport}
                    disabled={importing || eodSections.filter(s=>s.selected).some(s => !s.site && !eodSite) || eodSections.every(s => !s.selected)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {importing
                      ? <><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Importing…</>
                      : <><Upload size={14}/> Import EOD Data ({eodSections.filter(s=>s.selected).reduce((a,s)=>a+s.rows.length,0)} entries)</>}
                  </button>
                </>
              )}
              {importStep === 2 && importMode === 'campaign' && (() => {
                const campRequiredFields = ['date','site','streamer'];
                const dupCount = campPreview.filter(e => data.some(d =>
                  d.date === e.date && d.site === e.site && d.streamer === e.streamer && d.type === e.type
                )).length;
                const missingRequired = campRequiredFields.some(f => {
                  if (f === 'site' && campMapping._defaultSite) return false;
                  return !campMapping[f];
                });
                return (
                  <>
                    <button onClick={() => setImportStep(1)} className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700">← Back</button>
                    <div className="flex gap-2">
                      {dupCount > 0 && (
                        <button
                          onClick={() => handleCampaignImport(true)}
                          disabled={importing || missingRequired}
                          className="flex items-center gap-1.5 border border-amber-400 dark:border-amber-500 text-amber-700 dark:text-amber-300 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-amber-50 dark:hover:bg-amber-900/30 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <AlertTriangle size={14}/> Skip Duplicates ({campPreview.length - dupCount})
                        </button>
                      )}
                      <button
                        onClick={() => handleCampaignImport(false)}
                        disabled={importing || missingRequired || campPreview.length === 0}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {importing
                          ? <><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Importing…</>
                          : <><Upload size={14}/> Import All ({campPreview.length})</>
                        }
                      </button>
                    </div>
                  </>
                );
              })()}
              {importStep === 3 && (
                <>
                  <span/>
                  <button onClick={closeImportModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors">Done</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADS REPORT EDIT MODAL */}
      {showAdsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowAdsModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit GGR Data</h2>
              <button onClick={() => setShowAdsModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">{adsEditLabel}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GGR</label>
                  <input type="number" value={adsFormValues.ggr} onChange={e => setAdsFormValues({...adsFormValues, ggr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bonus</label>
                  <input type="number" value={adsFormValues.bonus} onChange={e => setAdsFormValues({...adsFormValues, bonus: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NGR</label>
                  <input type="number" value={adsFormValues.ngr} onChange={e => setAdsFormValues({...adsFormValues, ngr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Boosting</label>
                  <input type="number" value={adsFormValues.boosting} onChange={e => setAdsFormValues({...adsFormValues, boosting: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAdsModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdsSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATOR PERF EDIT MODAL */}
      {showCreatorPerfModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowCreatorPerfModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 modal-content">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-800">Edit Daily EOD Data</h2>
              <button onClick={() => setShowCreatorPerfModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs font-bold text-indigo-700 tracking-wider">{creatorPerfLabel}</p>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Active PL</label>
                  <input type="number" value={creatorPerfFormValues.activePl} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, activePl: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Valid Turnover</label>
                  <input type="number" value={creatorPerfFormValues.validTurnover} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, validTurnover: e.target.value})} placeholder="0" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">GGR (Win/Loss)</label>
                  <input type="number" value={creatorPerfFormValues.ggr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ggr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Bonus</label>
                  <input type="number" value={creatorPerfFormValues.bonus} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, bonus: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">NGR</label>
                  <input type="number" value={creatorPerfFormValues.ngr} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, ngr: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                  <p className="text-[10px] text-slate-400 mt-1">Efficacy = NGR ÷ Ad Spend</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Withdrawal</label>
                  <input type="number" value={creatorPerfFormValues.totalWithdrawal} onChange={e => setCreatorPerfFormValues({...creatorPerfFormValues, totalWithdrawal: e.target.value})} placeholder="0.00" className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                <div className="mt-1 flex gap-2">
                  {['Pending', 'Success', 'Failed'].map(s => (
                    <button
                      key={s}
                      onClick={() => setCreatorPerfFormValues({...creatorPerfFormValues, status: s})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                        (creatorPerfFormValues.status || 'Pending') === s
                          ? s === 'Success' ? 'bg-emerald-500 text-white border-emerald-500'
                            : s === 'Failed' ? 'bg-red-500 text-white border-red-500'
                            : 'bg-amber-400 text-white border-amber-400'
                          : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowCreatorPerfModal(false)} className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreatorPerfSave} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO TOAST */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 bg-slate-900 dark:bg-slate-700 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-black/30 border border-slate-700 dark:border-slate-600" style={{animation:'dropdownPop 0.2s cubic-bezier(0.22,1,0.36,1) both', minWidth:'280px'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400 shrink-0"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">Deleted <span className="text-red-300">{undoToast.label}</span></p>
            <div className="mt-1.5 h-0.5 bg-slate-700 dark:bg-slate-600 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{animation:'undoCountdown 10s linear forwards'}}/>
            </div>
          </div>
          <button onClick={handleUndoDelete} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            Undo
          </button>
          <button onClick={dismissUndoToast} className="text-slate-400 hover:text-white transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, subValue, icon, color, valueColor }) {
  return (
    <div className={`metric-card card-enter bg-white p-3 rounded-xl shadow-sm border-t border-r border-b border-slate-200 ${color} flex flex-col justify-between`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-wide truncate pr-2">{title}</span>
        <div className="p-1.5 bg-slate-50 rounded-md scale-90">{icon}</div>
      </div>
      <div>
        <div className={`text-lg md:text-xl font-bold leading-tight ${valueColor || 'text-slate-900'}`}>{value}</div>
        {subValue && <div className="text-[10px] font-medium text-slate-400">{subValue}</div>}
      </div>
    </div>
  );
}

function AdsReportView({ layoutMode, filteredData, adsReportData, creatorPerfData, startDate, endDate, filterSite, filterStreamer, onEdit, formatNum }) {
  const mw = layoutMode === 'compact' ? 'max-w-7xl mx-auto px-4 md:px-6' : 'max-w-[1600px] mx-auto px-4 md:px-6';
  // Group from campaign entries: site → streamer → type → { reg, dep }
  const grouped = {};
  filteredData.forEach(item => {
    if (item.type === 'General') return;
    if (!grouped[item.site]) grouped[item.site] = {};
    if (!grouped[item.site][item.streamer]) grouped[item.site][item.streamer] = { Live: { reg: 0, dep: 0 }, Reels: { reg: 0, dep: 0 }, spend: 0 };
    grouped[item.site][item.streamer].spend += (item.spend || 0);
    if (item.type === 'Live') {
      grouped[item.site][item.streamer].Live.reg += item.reg;
      grouped[item.site][item.streamer].Live.dep += item.dep;
    } else if (item.type === 'Reels') {
      grouped[item.site][item.streamer].Reels.reg += item.reg;
      grouped[item.site][item.streamer].Reels.dep += item.dep;
    }
  });

  // Also merge EOD creatorPerfData: adds sites/streamers missing from campaign data,
  // and provides GGR/Bonus/NGR directly from the EOD reports.
  Object.entries(creatorPerfData || {}).forEach(([key, perf]) => {
    const [date, streamer, site] = key.split('|');
    if (!date || !streamer || !site) return;
    if (startDate && date < startDate) return;
    if (endDate && date > endDate) return;
    if (filterSite && filterSite !== 'All' && site !== filterSite) return;
    if (filterStreamer && filterStreamer !== 'All' && streamer !== filterStreamer) return;
    if (!grouped[site]) grouped[site] = {};
    if (!grouped[site][streamer]) grouped[site][streamer] = { Live: { reg: 0, dep: 0 }, Reels: { reg: 0, dep: 0 } };
    if (!grouped[site][streamer]._perf) grouped[site][streamer]._perf = { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
    grouped[site][streamer]._perf.reg   += perf.reg   || 0;
    grouped[site][streamer]._perf.dep   += perf.dep   || 0;
    grouped[site][streamer]._perf.ggr   += perf.ggr   || 0;
    grouped[site][streamer]._perf.bonus += perf.bonus || 0;
    grouped[site][streamer]._perf.ngr   += perf.ngr   || 0;
  });

  const SITE_LABELS = { WFL: 'WINFORLIFE', RLM: 'ROLLEM', COW: 'COW', T2B: 'T2B' };
  const getAds = (site, streamer, type) => adsReportData[`${site}|${streamer}|${type}`] || { ggr: 0, bonus: 0, ngr: 0, boosting: 0 };

  const fmtVal = (val) => {
    const n = parseFloat(val) || 0;
    if (n === 0) return '0';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  };

  // All sites that have any data (campaign or EOD)
  const siteOrder = ['WFL', 'RLM', 'COW', 'T2B'].filter(s => grouped[s]);

  // Pre-compute aggregates
  const siteData = siteOrder.map(site => {
    const streamers = Object.keys(grouped[site]).sort((a, b) => {
      const regA = grouped[site][a].Live.reg + grouped[site][a].Reels.reg + (grouped[site][a]._perf?.reg || 0);
      const regB = grouped[site][b].Live.reg + grouped[site][b].Reels.reg + (grouped[site][b]._perf?.reg || 0);
      return regB - regA;
    });
    const streamerData = streamers.map(streamer => {
      const liveStats  = grouped[site][streamer].Live;
      const reelsStats = grouped[site][streamer].Reels;
      const perf       = grouped[site][streamer]._perf || { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0 };
      const liveAds    = getAds(site, streamer, 'Live');
      const reelsAds   = getAds(site, streamer, 'Reels');

      // reg/dep: use campaign entries when present, otherwise fall back to EOD perf totals
      const campReg = liveStats.reg + reelsStats.reg;
      const campDep = liveStats.dep + reelsStats.dep;
      const totalReg = campReg > 0 ? campReg : perf.reg;
      const totalDep = campDep > 0 ? campDep : perf.dep;

      // GGR/Bonus/NGR: prefer manually entered adsReportData, then EOD perf totals
      const manualGGR   = liveAds.ggr + reelsAds.ggr;
      const manualBonus = liveAds.bonus + reelsAds.bonus;
      const manualNGR   = liveAds.ngr + reelsAds.ngr;
      const totalGGR    = manualGGR   !== 0 ? manualGGR   : perf.ggr;
      const totalBonus  = manualBonus !== 0 ? manualBonus : perf.bonus;
      const totalNGR    = manualNGR   !== 0 ? manualNGR   : perf.ngr;
      const totalBoosting = liveAds.boosting + reelsAds.boosting;
      const totalSpend  = grouped[site][streamer].spend || 0;

      // Decide whether to show Live/Reels rows or a single EOD row
      const hasLive   = liveStats.reg > 0 || liveStats.dep > 0;
      const hasReels  = reelsStats.reg > 0 || reelsStats.dep > 0;
      const hasEODOnly = !hasLive && !hasReels && perf.reg > 0;

      return {
        streamer, liveStats, reelsStats, liveAds, reelsAds,
        perf, hasLive, hasReels, hasEODOnly,
        totalReg, totalDep, totalGGR, totalBonus, totalNGR, totalBoosting, totalSpend,
      };
    });
    const siteTotal = streamerData.reduce((acc, s) => ({
      reg: acc.reg + s.totalReg, dep: acc.dep + s.totalDep,
      ggr: acc.ggr + s.totalGGR, bonus: acc.bonus + s.totalBonus,
      ngr: acc.ngr + s.totalNGR, boosting: acc.boosting + s.totalBoosting,
      spend: acc.spend + s.totalSpend,
    }), { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0, boosting: 0, spend: 0 });
    return { site, streamerData, siteTotal };
  });

  const grandTotal = siteData.reduce((acc, s) => ({
    reg: acc.reg + s.siteTotal.reg, dep: acc.dep + s.siteTotal.dep,
    ggr: acc.ggr + s.siteTotal.ggr, bonus: acc.bonus + s.siteTotal.bonus,
    ngr: acc.ngr + s.siteTotal.ngr, boosting: acc.boosting + s.siteTotal.boosting,
    spend: acc.spend + s.siteTotal.spend,
  }), { reg: 0, dep: 0, ggr: 0, bonus: 0, ngr: 0, boosting: 0, spend: 0 });

  const ColHeader = () => (
    <tr className="bg-slate-50/80 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
      <th className="px-4 py-2 text-left font-semibold w-44">Campaign</th>
      <th className="px-4 py-2 text-right font-semibold">REG ▼</th>
      <th className="px-4 py-2 text-right font-semibold">Deposits</th>
      <th className="px-4 py-2 text-right font-semibold text-red-400">Ad Spend</th>
      <th className="px-4 py-2 text-right font-semibold">GGR</th>
      <th className="px-4 py-2 text-right font-semibold">Bonus</th>
      <th className="px-4 py-2 text-right font-semibold">NGR</th>
      <th className="px-4 py-2 text-right font-semibold">Boosting</th>
    </tr>
  );

  return (
    <div className={`${mw} py-8 space-y-10 view-enter`}>
      {siteData.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">📊</div>
          <p className="font-semibold text-slate-500 text-lg mb-1">No data to display</p>
          <p className="text-sm">Import an EOD report or campaign CSV to see the Ads Report.</p>
        </div>
      )}
      {siteData.map(({ site, streamerData, siteTotal }) => {
        const label = SITE_LABELS[site] || site;
        const colorCls = site === 'WFL' ? 'bg-blue-600' : site === 'RLM' ? 'bg-purple-600' : site === 'COW' ? 'bg-teal-600' : site === 'T2B' ? 'bg-rose-600' : 'bg-slate-600';
        const totalRowBg = site === 'WFL' ? 'bg-blue-950 border-blue-700' : site === 'RLM' ? 'bg-purple-950 border-purple-700' : site === 'COW' ? 'bg-teal-950 border-teal-700' : site === 'T2B' ? 'bg-rose-950 border-rose-700' : 'bg-slate-900 border-slate-600';
        const totalRowText = site === 'WFL' ? 'text-blue-100' : site === 'RLM' ? 'text-purple-100' : site === 'COW' ? 'text-teal-100' : site === 'T2B' ? 'text-rose-100' : 'text-slate-100';
        const totalRowMuted = site === 'WFL' ? 'text-blue-200' : site === 'RLM' ? 'text-purple-200' : site === 'COW' ? 'text-teal-200' : site === 'T2B' ? 'text-rose-200' : 'text-slate-300';
        return (
          <div key={site} className="space-y-4">
            {/* Site Header */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl ${colorCls} text-white font-bold text-sm tracking-wider shadow-sm`}>{label}</div>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {/* Per-Streamer Cards */}
            {streamerData.map(({ streamer, liveStats, reelsStats, liveAds, reelsAds, perf, hasLive, hasReels, hasEODOnly, totalReg, totalDep, totalGGR, totalBonus, totalNGR, totalBoosting, totalSpend }) => {
              const lbl = streamer.toUpperCase();
              return (
                <div key={streamer} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700 tracking-wide text-sm">{lbl}</span>
                    <div className="flex gap-2">
                      {hasLive && (
                        <button onClick={() => onEdit(site, streamer, 'Live', `${lbl}AD`)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                          <Edit2 size={11}/> Edit AD
                        </button>
                      )}
                      {hasReels && (
                        <button onClick={() => onEdit(site, streamer, 'Reels', `${lbl}REEL`)} className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2.5 py-1 rounded-lg transition-colors font-medium">
                          <Edit2 size={11}/> Edit REEL
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><ColHeader /></thead>
                      <tbody className="divide-y divide-slate-50">
                        {hasLive && (
                          <tr className="hover:bg-red-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-red-400 inline-block"></span>{lbl}AD
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(liveStats.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(liveStats.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">—</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${liveAds.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(liveAds.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(liveAds.boosting)}</td>
                          </tr>
                        )}
                        {hasReels && (
                          <tr className="hover:bg-violet-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-violet-400 inline-block"></span>{lbl}REEL
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(reelsStats.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(reelsStats.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">—</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${reelsAds.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(reelsAds.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(reelsAds.boosting)}</td>
                          </tr>
                        )}
                        {/* EOD-only row: shown when no campaign entries exist but EOD data does */}
                        {hasEODOnly && (
                          <tr className="hover:bg-sky-50/30 transition-colors">
                            <td className="px-4 py-2.5 font-medium text-slate-700">
                              <span className="inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-sky-400 inline-block"></span>EOD Data
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{formatNum(perf.reg)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-600">{fmtVal(perf.dep)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">—</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(perf.ggr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-500">{fmtVal(perf.bonus)}</td>
                            <td className={`px-4 py-2.5 text-right font-medium ${perf.ngr >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(perf.ngr)}</td>
                            <td className="px-4 py-2.5 text-right text-slate-400">—</td>
                          </tr>
                        )}
                        <tr className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-700">
                          <td className="px-4 py-2.5 text-xs uppercase text-slate-400 tracking-wider">Total</td>
                          <td className="px-4 py-2.5 text-right">{formatNum(totalReg)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalDep)}</td>
                          <td className="px-4 py-2.5 text-right text-red-500">{totalSpend > 0 ? fmtVal(totalSpend) : '—'}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalGGR)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalBonus)}</td>
                          <td className={`px-4 py-2.5 text-right ${totalNGR >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(totalNGR)}</td>
                          <td className="px-4 py-2.5 text-right">{fmtVal(totalBoosting)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {/* Site Total Row */}
            <div className={`rounded-xl border-2 overflow-hidden shadow-sm ${totalRowBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-bold">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-4 py-1.5 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-widest w-44"></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-sky-100 text-sky-600 px-1.5 py-0.5 rounded">Reg</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">Deposits</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Ad Spend</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">GGR</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded">Bonus</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-teal-100 text-teal-600 px-1.5 py-0.5 rounded">NGR</span></th>
                      <th className="px-4 py-1.5 text-right text-[10px] font-bold uppercase tracking-widest"><span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded">Boosting</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className={`px-4 py-3 w-44 tracking-wider font-bold ${totalRowText}`}>{label} TOTAL</td>
                      <td className={`px-4 py-3 text-right font-bold ${totalRowText}`}>{formatNum(siteTotal.reg)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${totalRowText}`}>{fmtVal(siteTotal.dep)}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-400">{siteTotal.spend > 0 ? fmtVal(siteTotal.spend) : '—'}</td>
                      <td className={`px-4 py-3 text-right ${totalRowMuted}`}>{fmtVal(siteTotal.ggr)}</td>
                      <td className={`px-4 py-3 text-right ${totalRowMuted}`}>{fmtVal(siteTotal.bonus)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${siteTotal.ngr >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmtVal(siteTotal.ngr)}</td>
                      <td className={`px-4 py-3 text-right ${totalRowMuted}`}>{fmtVal(siteTotal.boosting)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {/* Grand Total */}
      {siteData.length > 1 && (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #1e1b4b 100%)'}}>
          {/* Decorative top accent line */}
          <div className="h-1 w-full" style={{background: 'linear-gradient(90deg, #38bdf8, #a78bfa, #f472b6, #fb923c, #34d399)'}} />
          <div className="px-6 py-5">
            {/* Title row */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" />
                <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">Grand Total</span>
              </div>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white font-extrabold text-base tracking-wider">TOTAL {siteOrder.join(' & ')}</span>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-7 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-white/10">
                <span className="text-sky-300 text-[10px] font-bold uppercase tracking-widest">Reg</span>
                <span className="text-white font-extrabold text-sm">{formatNum(grandTotal.reg)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-white/10">
                <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-widest">Deposits</span>
                <span className="text-white font-extrabold text-sm">{fmtVal(grandTotal.dep)}</span>
              </div>
              <div className="bg-red-500/20 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-red-400/30">
                <span className="text-red-300 text-[10px] font-bold uppercase tracking-widest">Ad Spend</span>
                <span className="text-red-300 font-extrabold text-sm">{fmtVal(grandTotal.spend)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-white/10">
                <span className="text-amber-300 text-[10px] font-bold uppercase tracking-widest">GGR</span>
                <span className="text-white/80 font-bold text-sm">{fmtVal(grandTotal.ggr)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-white/10">
                <span className="text-orange-300 text-[10px] font-bold uppercase tracking-widest">Bonus</span>
                <span className="text-white/80 font-bold text-sm">{fmtVal(grandTotal.bonus)}</span>
              </div>
              <div className={`backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border ${grandTotal.ngr >= 0 ? 'bg-emerald-500/20 border-emerald-400/30' : 'bg-red-500/20 border-red-400/30'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${grandTotal.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>NGR</span>
                <span className={`font-extrabold text-sm ${grandTotal.ngr >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>{fmtVal(grandTotal.ngr)}</span>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 flex flex-col gap-1 border border-white/10">
                <span className="text-violet-300 text-[10px] font-bold uppercase tracking-widest">Boosting</span>
                <span className="text-white/80 font-bold text-sm">{fmtVal(grandTotal.boosting)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function CreatorReportView({ layoutMode, data, startDate, endDate, creatorPerfData, onEdit, onSummaryChange, formatPHP, streamers, sites, externalSite, externalStreamer, onAddEntry, onEditEntry, onDeleteEntry, onDeleteDay, noStreamData, onMarkNoStream, onUnmarkNoStream, onImportEOD, isAdmin, streamTally }) {
  const mw = layoutMode === 'compact' ? 'max-w-7xl mx-auto px-4 md:px-6' : 'max-w-[1600px] mx-auto px-4 md:px-6';
  const [selectedStreamer, setSelectedStreamer] = React.useState(streamers[0] || '');
  const [selectedSite, setSelectedSite] = React.useState('All');

  // Sync external (top bar) site/streamer filters into the local selection
  React.useEffect(() => {
    if (externalSite && externalSite !== 'All') setSelectedSite(externalSite);
    else setSelectedSite('All');
  }, [externalSite]);
  React.useEffect(() => {
    if (externalStreamer && externalStreamer !== 'All') setSelectedStreamer(externalStreamer);
  }, [externalStreamer]);

  // Derive streamers scoped to the selected site
  const siteFilteredStreamers = React.useMemo(() => {
    if (selectedSite === 'All') return streamers;
    const fromData = [...new Set(data.filter(d => d.site === selectedSite).map(d => d.streamer))].filter(Boolean);
    const fromPerf = [...new Set(
      Object.keys(creatorPerfData)
        .filter(k => k.split('|')[2] === selectedSite)
        .map(k => k.split('|')[1])
    )].filter(Boolean);
    return [...new Set([...fromData, ...fromPerf])].sort();
  }, [selectedSite, data, creatorPerfData, streamers]);

  // Auto-select first streamer when list becomes available or site changes
  React.useEffect(() => {
    if (siteFilteredStreamers.length > 0 && !siteFilteredStreamers.includes(selectedStreamer)) {
      setSelectedStreamer(siteFilteredStreamers[0]);
    }
  }, [siteFilteredStreamers]);
  const [expandedRow, setExpandedRow] = React.useState(null);
  const [noStreamDateInput, setNoStreamDateInput] = React.useState('');
  const [noStreamSiteInput, setNoStreamSiteInput] = React.useState(sites[0] || '');
  const [nsOpen, setNsOpen] = React.useState(false);
  const nsRef = React.useRef(null);
  const [eodSort, setEodSort] = React.useState({ col: null, dir: null });

  const toggleSort = (col) => {
    setEodSort(prev => {
      if (prev.col !== col) return { col, dir: 'desc' };
      if (prev.dir === 'desc') return { col, dir: 'asc' };
      return { col: null, dir: null }; // third click = reset
    });
  };

  React.useEffect(() => {
    if (!nsOpen) return;
    const h = (e) => { if (nsRef.current && !nsRef.current.contains(e.target)) setNsOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [nsOpen]);

  // Filter data for the selected creator
  const creatorEntries = data.filter(d =>
    d.streamer === selectedStreamer &&
    (!startDate || d.date >= startDate) &&
    (!endDate   || d.date <= endDate) &&
    (selectedSite === 'All' || d.site === selectedSite)
  );

  // Stream / Reels counts — derived from campaign rows, overridden by side-table tally when available
  const rawStreams = creatorEntries.filter(d => d.type === 'Live').length;
  const rawReels   = creatorEntries.filter(d => d.type === 'Reels').length;
  // Resolve the active site (use first matching site when selectedSite is 'All')
  const activeSite = selectedSite !== 'All'
    ? selectedSite
    : (creatorEntries[0]?.site ||
       Object.keys(creatorPerfData).find(k => k.split('|')[1] === selectedStreamer)?.split('|')[2] || '');
  const tallyKey    = `${(activeSite||'').toLowerCase()}|${(selectedStreamer||'').toLowerCase()}`;
  const tallyData   = (streamTally || {})[tallyKey];
  const totalStreams = tallyData?.live  ?? rawStreams;
  const totalReels   = tallyData?.reels ?? rawReels;

  // Get dates from campaign entries AND from creatorPerfData (so EOD-only days show up too)
  const perfDates = Object.keys(creatorPerfData)
    .filter(key => {
      const [date, streamer, site] = key.split('|');
      return streamer === selectedStreamer &&
        (!startDate || date >= startDate) &&
        (!endDate   || date <= endDate) &&
        (selectedSite === 'All' || site === selectedSite);
    })
    .map(key => key.split('|')[0]);

  const creatorDates = [...new Set([...creatorEntries.map(d => d.date), ...perfDates])].sort();

  // Collect all manually-marked no-stream keys for this streamer/date-range/site
  const noStreamKeySet = new Set(
    Object.keys(noStreamData).filter(key => {
      const [date, streamer, site] = key.split('|');
      return streamer === selectedStreamer &&
        (!startDate || date >= startDate) &&
        (!endDate   || date <= endDate) &&
        (selectedSite === 'All' || site === selectedSite);
    })
  );

  // Build per-day rows — flag rows that are also marked no-stream so we can show
  // the indicator inline without hiding actual performance data.
  const entryRows = creatorDates.map(date => {
    const dayEntries = creatorEntries.filter(e => e.date === date);
    const totalSpend = dayEntries.reduce((s, e) => s + e.spend, 0);
    // Use site from campaign entry if available, otherwise find from creatorPerfData
    let siteName = dayEntries[0]?.site || '';
    if (!siteName && selectedSite !== 'All') siteName = selectedSite;
    if (!siteName) {
      const perfKey = Object.keys(creatorPerfData).find(k => k.startsWith(`${date}|${selectedStreamer}|`));
      if (perfKey) siteName = perfKey.split('|')[2];
    }
    const key = `${date}|${selectedStreamer}|${siteName}`;
    const perf = creatorPerfData[key] || { ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0, reg: 0, dep: 0 };
    // Always prefer EOD perf data for reg/dep (authoritative source); campaign entries carry 0 as placeholders
    const campaignReg = dayEntries.reduce((s, e) => s + e.reg, 0);
    const campaignDep = dayEntries.reduce((s, e) => s + e.dep, 0);
    const totalReg = (perf.reg != null && perf.reg > 0) ? perf.reg : campaignReg;
    const totalDep = (perf.dep != null && perf.dep > 0) ? perf.dep : campaignDep;
    const efficacyRate = totalSpend > 0 ? (perf.ngr / totalSpend) * 100 : null;
    // noStream=true if any no-stream marker exists for this date (any site)
    const isNoStream = [...noStreamKeySet].some(k => k.startsWith(`${date}|`));
    return { date, siteName, totalSpend, totalDep, totalReg, ...perf, efficacyRate, key, dayEntries, noStream: isNoStream, hasData: true };
  });

  // Pure no-stream rows = dates marked no-stream that have NO entry row at all
  const entryDateSet = new Set(entryRows.map(r => r.date));
  const pureNoStreamRows = [...noStreamKeySet]
    .filter(key => {
      const [date] = key.split('|');
      return !entryDateSet.has(date);
    })
    .reduce((acc, key) => {
      // deduplicate by date — only one row per date
      const [date, , site] = key.split('|');
      if (!acc.seen.has(date)) { acc.seen.add(date); acc.rows.push({ date, siteName: site, noStream: true, hasData: false, key }); }
      return acc;
    }, { seen: new Set(), rows: [] }).rows;

  // Merge and sort all rows by date
  const rows = [...entryRows, ...pureNoStreamRows].sort((a, b) => a.date.localeCompare(b.date));

  // Sort rows
  const sortedRows = React.useMemo(() => {
    const colMap = {
      date: r => r.date,
      site: r => r.siteName || '',
      reg: r => r.totalReg || 0,
      activePl: r => r.activePl || 0,
      validTurnover: r => r.validTurnover || 0,
      totalDep: r => r.totalDep || 0,
      withdrawal: r => r.totalWithdrawal || 0,
      ggr: r => r.ggr || 0,
      bonus: r => r.bonus || 0,
      ngr: r => r.ngr || 0,
    };
    if (!eodSort.col) return [...rows].sort((a, b) => a.date.localeCompare(b.date));
    const fn = colMap[eodSort.col] || (r => r.date);
    return [...rows].sort((a, b) => {
      const av = fn(a), bv = fn(b);
      if (typeof av === 'string') return eodSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return eodSort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [rows, eodSort]);

  // Totals — include no-stream rows that DO have data (streamer had data even without streaming)
  const totals = rows.filter(r => r.hasData !== false).reduce((acc, r) => ({
    spend: acc.spend + r.totalSpend,
    dep: acc.dep + r.totalDep,
    reg: acc.reg + r.totalReg,
    ggr: acc.ggr + (r.ggr || 0),
    bonus: acc.bonus + (r.bonus || 0),
    ngr: acc.ngr + (r.ngr || 0),
    activePl: acc.activePl + (r.activePl || 0),
    validTurnover: parseFloat((acc.validTurnover + (r.validTurnover || 0)).toFixed(2)),
    totalWithdrawal: parseFloat((acc.totalWithdrawal + (r.totalWithdrawal || 0)).toFixed(2)),
  }), { spend: 0, dep: 0, reg: 0, ggr: 0, bonus: 0, ngr: 0, activePl: 0, validTurnover: 0, totalWithdrawal: 0 });

  const totalEfficacy = totals.spend > 0 ? (totals.ngr / totals.spend) * 100 : null;

  // Grand totals across ALL streamers (for the header summary cards)
  const allTotals = React.useMemo(() => {
    const filtered = data.filter(d =>
      (!startDate || d.date >= startDate) &&
      (!endDate   || d.date <= endDate)
    );
    const allSpend = filtered.reduce((s, e) => s + e.spend, 0);
    const campaignDep = filtered.reduce((s, e) => s + e.dep, 0);
    let perfDep = 0, perfNGR = 0, perfReg = 0, perfGGR = 0, perfBonus = 0;
    Object.entries(creatorPerfData).forEach(([key, perf]) => {
      const [date] = key.split('|');
      if ((!startDate || date >= startDate) && (!endDate || date <= endDate)) {
        perfDep   += perf.dep   || 0;
        perfNGR   += perf.ngr   || 0;
        perfReg   += perf.reg   || 0;
        perfGGR   += perf.ggr   || 0;
        perfBonus += perf.bonus || 0;
      }
    });
    const allDep = perfDep > 0 ? perfDep : campaignDep;
    const allNGR = perfNGR;
    const allEfficacy = allSpend > 0 ? (allNGR / allSpend) * 100 : null;
    return { spend: allSpend, dep: allDep, reg: perfReg, ggr: perfGGR, bonus: perfBonus, ngr: allNGR, efficacyRate: allEfficacy };
  }, [data, creatorPerfData, startDate, endDate]);

  // Lift summary up to header — use per-streamer totals, not grand totals
  React.useEffect(() => {
    onSummaryChange({ ...totals, efficacyRate: totalEfficacy, streams: totalStreams, reels: totalReels });
  }, [totals.spend, totals.dep, totals.reg, totals.ggr, totals.bonus, totals.ngr, totalEfficacy, totalStreams, totalReels, onSummaryChange]);

  // Index of the last actual (non-noStream) row for PENDING badge — based on date-sorted order
  const lastEntryDate = rows.filter(r => !r.noStream).at(-1)?.date;

  const fmtVal = (n) => {
    const v = parseFloat(n) || 0;
    if (v === 0) return <span className="text-slate-300">—</span>;
    const formatted = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(v));
    return v < 0 ? <span className="text-red-500">-{formatted}</span> : formatted;
  };

  const fmtDate = (str) => {
    const d = new Date(str + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const efficacyColor = (val) => {
    if (val === null) return 'text-slate-300';
    if (val >= 100) return 'text-emerald-600 font-bold';
    if (val >= 50) return 'text-amber-500 font-semibold';
    return 'text-red-500 font-semibold';
  };

  const siteColors = { WFL: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', RLM: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', COW: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', T2B: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' };

  return (
    <div className={`${mw} py-8 space-y-6 view-enter`}>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
        <button
          onClick={() => onAddEntry(selectedStreamer, selectedSite)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Plus size={15}/> Add Day
        </button>
        <button
          onClick={onImportEOD}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
        >
          <Upload size={15}/> Import EOD
        </button>
        {/* No Stream — popover */}
        <div className="relative" ref={nsRef}>
          <button
            onClick={() => setNsOpen(o => !o)}
            className={`flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-all border ${nsOpen ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400'}`}
          >
            <X size={14}/> Mark No Stream
          </button>
          {nsOpen && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Mark a day as No Stream</p>
              <p className="text-xs text-slate-400 mb-3 leading-relaxed">Select the date when <span className="font-semibold text-slate-600">{selectedStreamer}</span> did not stream.</p>
              <input
                type="date"
                value={noStreamDateInput}
                min={startDate}
                max={endDate}
                onChange={e => setNoStreamDateInput(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
              />
              {selectedSite === 'All' && (
                <div className="mb-3">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">Site</label>
                  <FormSelect value={noStreamSiteInput} onSelect={setNoStreamSiteInput} options={sites}/>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!noStreamDateInput) return;
                    const site = selectedSite !== 'All' ? selectedSite : noStreamSiteInput;
                    onMarkNoStream(noStreamDateInput, selectedStreamer, site);
                    setNoStreamDateInput('');
                    setNsOpen(false);
                  }}
                  disabled={!noStreamDateInput}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-xl transition-colors"
                >
                  <X size={13}/> Confirm
                </button>
                <button
                  onClick={() => { setNsOpen(false); setNoStreamDateInput(''); }}
                  className="px-4 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 transition-colors font-medium"
                >Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>

        {/* Right: Viewing indicator */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-sm text-slate-400 font-medium">Viewing:</span>
          <span className="text-base font-bold text-slate-700 dark:text-slate-200">{selectedStreamer || '—'}</span>
          {selectedSite && selectedSite !== 'All' && (
            <span className={`px-3.5 py-1.5 rounded-xl text-sm font-bold tracking-wide ${siteColors[selectedSite] || 'bg-slate-100 text-slate-600'}`}>
              {selectedSite}
            </span>
          )}
          {(!selectedSite || selectedSite === 'All') && (
            <span className="px-3.5 py-1.5 rounded-xl text-sm font-bold tracking-wide bg-slate-100 text-slate-500">All Sites</span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{selectedStreamer}</span>
          <span className="text-sm text-slate-400 dark:text-slate-500 font-medium">: End of Day Performance</span>
          <div className="text-xs text-slate-400 dark:text-slate-500 ml-auto">{rows.length} day{rows.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="overflow-auto max-h-[70vh]">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-green-900 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
                {[{col:'date',label:'Day',align:'left'},{col:'site',label:'Site',align:'left'},{col:'reg',label:'Reg',align:'right'},{col:'activePl',label:'Active PL',align:'right'},{col:'validTurnover',label:'Valid Turnover',align:'right'},{col:'totalDep',label:'Total Deposit',align:'right'},{col:'withdrawal',label:'Withdrawal',align:'right'},{col:'ggr',label:'Win/Loss',align:'right'},{col:'bonus',label:'Bonus',align:'right'},{col:'ngr',label:'NGR',align:'right'}].map(({col,label,align})=>{
                  const active = eodSort.col === col;
                  const isDesc = active && eodSort.dir === 'desc';
                  const isAsc  = active && eodSort.dir === 'asc';
                  return (
                    <th key={col} onClick={()=>toggleSort(col)} className={`px-2 py-2 text-${align} font-semibold cursor-pointer select-none group whitespace-nowrap bg-green-900 hover:bg-green-800 transition-colors`}>
                      <span className={`inline-flex items-center gap-1 w-full ${align==='right' ? 'justify-end' : 'justify-start'}`}>
                        {align==='right'&&(
                          <span className="opacity-0 group-hover:opacity-60 transition-opacity">
                            {!active&&<span className="text-[10px]">⇅</span>}
                          </span>
                        )}
                        <span>{label}</span>
                        {align==='left'&&(
                          <span className="opacity-0 group-hover:opacity-60 transition-opacity">
                            {!active&&<span className="text-[10px]">⇅</span>}
                          </span>
                        )}
                        {isDesc&&<span className="text-[11px] text-emerald-300 font-bold">▲</span>}
                        {isAsc&&<span className="text-[11px] text-red-300 font-bold">▼</span>}
                      </span>
                    </th>
                  );
                })}
                <th className="px-2 py-2 text-center font-semibold bg-green-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No data for <strong>{selectedStreamer}</strong> in the selected date range. Use <span className="text-amber-600 dark:text-amber-400 font-semibold">Mark No Stream</span> to record days with no activity.
                  </td>
                </tr>
              )}
              {sortedRows.map((row, idx) => (
                <React.Fragment key={idx}>
                  <>
                  {/* ── Unified row — red VideoOff icon before date when no-stream ── */}
                  <tr
                    className={`transition-colors ${row.noStream ? 'hover:brightness-110' : 'hover:bg-green-50/40 dark:hover:bg-green-900/20'} ${row.noStream ? '' : (idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/30 dark:bg-slate-800/20')}`}
                    style={row.noStream ? { background: 'linear-gradient(90deg, rgba(239,68,68,0.55) 0px, rgba(239,68,68,0.18) 6px, rgba(239,68,68,0.08) 100%)' } : {}}
                  >
                    <td className="px-2 py-2 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {row.noStream && <VideoOff size={13} className="text-red-500 shrink-0" title="No Stream"/>}
                        {fmtDate(row.date)}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${siteColors[row.siteName] || 'bg-gray-100 text-gray-600'}`}>{row.siteName}</span>
                    </td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.hasData !== false ? row.totalReg : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.activePl ? row.activePl.toLocaleString() : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-slate-600 dark:text-slate-400">{row.validTurnover ? row.validTurnover.toLocaleString() : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-emerald-600 font-medium">{row.hasData !== false ? formatPHP(row.totalDep) : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className="px-2 py-2 text-right text-red-400">{row.totalWithdrawal ? `-${Math.abs(row.totalWithdrawal).toLocaleString()}` : <span className="text-slate-300 dark:text-slate-600">—</span>}</td>
                    <td className={`px-2 py-2 text-right ${(row.ggr || 0) >= 0 ? 'text-slate-600 dark:text-slate-400' : 'text-red-500'}`}>{fmtVal(row.ggr)}</td>
                    <td className="px-2 py-2 text-right text-amber-600">{fmtVal(row.bonus)}</td>
                    <td className={`px-2 py-2 text-right ${(row.ngr || 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtVal(row.ngr)}</td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-0.5">
                      {row.hasData !== false && (
                        <button
                          onClick={() => onEdit(row.date, selectedStreamer, row.siteName)}
                          className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Edit GGR / Bonus / NGR"
                        >
                          <Edit2 size={12}/>
                        </button>
                      )}
                      {row.noStream && (
                        <button
                          onClick={() => [...noStreamKeySet].filter(k => k.startsWith(`${row.date}|`)).forEach(k => onUnmarkNoStream(k))}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove no-stream marker"
                        >
                          <VideoOff size={12}/>
                        </button>
                      )}
                      {row.hasData !== false && isAdmin && (
                        <button
                          onClick={() => onDeleteDay(row.dayEntries, row.key)}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete all entries for this day"
                        >
                          <Trash2 size={12}/>
                        </button>
                      )}
                      </div>
                    </td>
                  </tr>
                  {/* Inline entries sub-row */}
                  {expandedRow === row.date && row.hasData !== false && (
                    <tr className="bg-indigo-50/60 dark:bg-indigo-900/15">
                      <td colSpan={11} className="px-6 py-3">
                        <div className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-2">Campaign Entries — {fmtDate(row.date)}</div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-indigo-100 dark:border-indigo-800">
                              <th className="py-1 text-left font-semibold">Type</th>
                              <th className="py-1 text-right font-semibold">Spend</th>
                              <th className="py-1 text-right font-semibold">Reg</th>
                              <th className="py-1 text-right font-semibold">Deposit</th>
                              <th className="py-1 text-center font-semibold w-16"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.dayEntries.map((entry, ei) => (
                              <tr key={ei} className="border-b border-indigo-50 dark:border-indigo-900/40 last:border-0">
                                <td className="py-1.5 text-slate-600 dark:text-slate-400">{entry.type}</td>
                                <td className="py-1.5 text-right text-red-500">{formatPHP(entry.spend)}</td>
                                <td className="py-1.5 text-right text-slate-600 dark:text-slate-400">{entry.reg}</td>
                                <td className="py-1.5 text-right text-emerald-600">{formatPHP(entry.dep)}</td>
                                <td className="py-1.5 text-center flex items-center justify-center gap-1">
                                  {isAdmin && (
                                  <button
                                    onClick={() => onEditEntry(entry)}
                                    className="p-1 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded transition-colors"
                                    title="Edit entry"
                                  >
                                    <Edit2 size={11}/>
                                  </button>
                                  )}
                                  {isAdmin && (
                                  <button
                                    onClick={() => onDeleteEntry(entry)}
                                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title="Delete entry"
                                  >
                                    <Trash2 size={11}/>
                                  </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {isAdmin && (
                        <button
                          onClick={() => onAddEntry(selectedStreamer, row.siteName)}
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
                        >
                          <Plus size={11}/> Add entry for this day
                        </button>
                        )}
                      </td>
                    </tr>
                  )}
                  </>
                </React.Fragment>
              ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-green-900 dark:bg-green-950 text-white font-bold text-sm">
                  <td className="px-2 py-2 uppercase tracking-wider" colSpan={2}>{selectedStreamer} Total</td>
                  <td className="px-2 py-2 text-right">{totals.reg}</td>
                  <td className="px-2 py-2 text-right">{totals.activePl ? totals.activePl.toLocaleString() : '—'}</td>
                  <td className="px-2 py-2 text-right">{totals.validTurnover ? totals.validTurnover.toLocaleString() : '—'}</td>
                  <td className="px-2 py-2 text-right">{formatPHP(totals.dep)}</td>
                  <td className="px-2 py-2 text-right opacity-80">{totals.totalWithdrawal ? `-${Math.abs(totals.totalWithdrawal).toLocaleString()}` : '—'}</td>
                  <td className={`px-2 py-2 text-right ${totals.ggr >= 0 ? '' : 'text-red-300'}`}>{fmtVal(totals.ggr)}</td>
                  <td className="px-2 py-2 text-right opacity-80">{fmtVal(totals.bonus)}</td>
                  <td className={`px-2 py-2 text-right ${totals.ngr >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{fmtVal(totals.ngr)}</td>
                  <td className={`px-2 py-2 text-right ${totalEfficacy !== null && totalEfficacy >= 100 ? 'text-emerald-300' : totalEfficacy !== null ? 'text-amber-300' : ''}`}>
                    {totalEfficacy !== null ? `${totalEfficacy.toFixed(2)}%` : '—'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
        {rows.length > 0 && (
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                </span>
                Total Streams: <span className="text-slate-700 dark:text-slate-200 font-bold">{totalStreams}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M12 12h.01"/></svg>
                </span>
                Total Reels: <span className="text-slate-700 dark:text-slate-200 font-bold">{totalReels}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Efficacy Rate</span> = NGR ÷ Ad Spend × 100 &nbsp;·&nbsp; Click the edit button per row to enter GGR, Bonus & NGR
            </p>
          </div>
        )}
      </div>
    </div>
  );
}