// tech.js — theme toggles + SLO playground
(() => {
  const $  = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const html = document.documentElement;
  const STORE = { theme:'c23_theme', variant:'c23_variant' };

  // initial theme (auto → system)
  if (html.dataset.theme === 'auto') {
    html.dataset.theme = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  try {
    const t = localStorage.getItem(STORE.theme);
    const v = localStorage.getItem(STORE.variant);
    if (t) html.dataset.theme = t;
    if (v !== null && v !== undefined) html.dataset.variant = v;
  } catch {}

  const saveTheme   = () => { try{ localStorage.setItem(STORE.theme, html.dataset.theme || 'dark'); }catch{} };
  const saveVariant = () => { try{ localStorage.setItem(STORE.variant, html.dataset.variant || ''); }catch{} };

  on($('#themeToggle'), 'click', ()=>{ html.dataset.theme = (html.dataset.theme === 'light') ? 'dark' : 'light'; saveTheme(); drawChart(); });
  on($('#spideyToggle'),'click', ()=>{ html.dataset.variant = (html.dataset.variant === 'spidey') ? '' : 'spidey'; saveVariant(); drawChart(); });

  /* ---------------- SLO Playground ---------------- */
  const els = {
    slo: $('#slo_target'),
    win: $('#slo_window'),
    rpm: $('#traffic_rpm'),
    err: $('#err_rate'),
    scn: $('#scenario'),
    reset: $('#resetSlo'),
    chart: $('#sloChart'),
    tbl: $('#sloTable tbody'),
    out: {
      budgetPct: $('#budgetPct'),
      allowed:   $('#allowedErrs'),
      burn:      $('#burnRate'),
      ttr:       $('#ttr'),
    }
  };

  const get = () => ({
    slo: parseFloat(els.slo.value),         // e.g. 99.9
    days: parseInt(els.win.value, 10),      // e.g. 30
    rpm: Math.max(1, parseInt(els.rpm.value,10)),
    errPct: Math.max(0, parseFloat(els.err.value)),   // %
    scenMul: parseFloat(els.scn.value)      // multiplier
  });

  function fmtInt(n){ return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }
  function fmt1(n){ return n.toFixed(1); }
  function fmt2(n){ return n.toFixed(2); }

  function compute(){
    const { slo, days, rpm, errPct, scenMul } = get();
    const budgetFrac = 1 - (slo / 100);               // e.g. 0.001
    const reqPerWindow = rpm * 60 * 24 * days;
    const allowedErrs = reqPerWindow * budgetFrac;    // absolute allowed errors

    const errFracNow = (errPct/100) * scenMul;        // current scenario
    const burnRate = budgetFrac === 0 ? Infinity : (errFracNow / budgetFrac); // × of safe
    const errsPerHour = rpm * 60 * errFracNow;
    const ttrHours = errsPerHour > 0 ? (allowedErrs / errsPerHour) : Infinity;

    return { budgetFrac, allowedErrs, burnRate, ttrHours, errsPerHour };
  }

  function fillTable(hours=48){
    const { allowedErrs, errsPerHour } = compute();
    let remaining = allowedErrs;
    const rows = [];
    for(let h=0; h<=hours; h++){
      const used = Math.min(allowedErrs, errsPerHour*h);
      remaining = Math.max(0, allowedErrs - used);
      rows.push(`<tr><td>${h}h</td><td>${fmtInt(remaining)}</td><td>${fmtInt(used)}</td></tr>`);
    }
    els.tbl.innerHTML = rows.join('');
  }

  function drawChart(){
    const c = els.chart, ctx = c.getContext('2d'); if (!ctx) return;
    // sizing
    const w = c.width = c.clientWidth;
    const h = c.height = Math.max(260, Math.min(380, Math.round(window.innerHeight*0.45)));
    const padL=48, padR=18, padT=24, padB=38;
    const gw = w - padL - padR, gh = h - padT - padB;

    const isLight = (html.dataset.theme||'dark')==='light';
    const color = {
      title: isLight ? '#0b1b2b' : '#cbd5e1',
      axis:  isLight ? 'rgba(2,6,23,.14)' : 'rgba(255,255,255,.10)',
      text:  isLight ? '#334155' : '#94a3b8',
      line:  ['#22d3ee','#a78bfa']
    };

    const { allowedErrs, errsPerHour, burnRate } = compute();
    const hours = 72;
    const yMax = allowedErrs;
    const points = [];
    for(let i=0;i<=hours;i++){
      const used = Math.min(allowedErrs, errsPerHour*i);
      const remain = allowedErrs - used;
      const x = padL + (gw*(i/hours));
      const y = padT + gh*(1 - (remain / yMax));
      points.push([x,y,remain]);
    }

    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = color.title; ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText('Projected error budget (next 72h)', padL, 16);

    // grid
    ctx.strokeStyle = color.axis; ctx.lineWidth = 1;
    for (let i=0;i<=4;i++){ const y=padT+(gh/4)*i; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke(); }

    // line (remain)
    const grad = ctx.createLinearGradient(0,padT,0,h-padB);
    grad.addColorStop(0, color.line[0]); grad.addColorStop(1, color.line[1]);
    ctx.strokeStyle = grad; ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach(([x,y],i)=>{ i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();

    // baseline (1.0× burn @ 30d budget pace)
    ctx.setLineDash([4,4]); ctx.strokeStyle = color.text;
    ctx.beginPath(); ctx.moveTo(padL,padT); ctx.lineTo(padL+gw,padT+gh); ctx.stroke();
    ctx.setLineDash([]);

    // legend
    ctx.fillStyle = color.text;
    ctx.fillText(`Burn rate: ${isFinite(burnRate) ? fmt2(burnRate) + '×' : '—'}`, w - padR - 140, 16);
  }

  function paintNumbers(){
    const { budgetFrac, allowedErrs, burnRate, ttrHours } = compute();
    els.out.budgetPct.textContent = (budgetFrac*100).toFixed(3) + '%';
    els.out.allowed.textContent   = fmtInt(allowedErrs);
    els.out.burn.textContent      = isFinite(burnRate) ? fmt2(burnRate)+'×' : '—';
    els.out.ttr.textContent       = isFinite(ttrHours) ? (ttrHours>=48 ? (ttrHours/24).toFixed(1)+' days' : fmt1(ttrHours)+' h') : '—';
  }

  function go(){ paintNumbers(); fillTable(48); drawChart(); }
  ['change','input'].forEach(ev=>{
    on(els.slo, ev, go); on(els.win, ev, go); on(els.rpm, ev, go); on(els.err, ev, go); on(els.scn, ev, go);
  });
  on(els.reset,'click', ()=>{
    els.slo.value='99.9'; els.win.value='30'; els.rpm.value='12000'; els.err.value='0.12'; els.scn.value='1'; go();
  });
  window.addEventListener('resize', ()=> drawChart());

  go();
})();
