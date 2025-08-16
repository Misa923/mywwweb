(() => {
  const $ = (sel, ctx=document) => ctx.querySelector(sel);
  const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

  // Year
  $('#year')?.append(String(new Date().getFullYear()));

  // Theme toggle
  $('#themeToggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  });

  // Mobile menu
  const drawer = $('#drawer');
  $('#menuBtn')?.addEventListener('click', (e) => {
    const open = e.currentTarget.getAttribute('aria-expanded') === 'true';
    e.currentTarget.setAttribute('aria-expanded', String(!open));
    drawer.innerHTML = !open
      ? `<nav class="drawer-nav">
           <a href="#services">Services</a>
           <a href="#work">Work</a>
           <a href="#playground">Playground</a>
           <a href="#contact">Contact</a>
         </nav>`
      : '';
    drawer.classList.toggle('open');
  });

  // Get a quote scroll
  $('#scrollToContact')?.addEventListener('click', (e) => {
    if (location.hash !== '#contact') {
      const el = $('#contact');
      if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
    }
  });

  // Per-section hide/unhide
  $$('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.closest('section');
      if (!section) return;
      section.classList.toggle('collapsed');
      const isOpen = !section.classList.contains('collapsed');
      btn.setAttribute('aria-expanded', String(isOpen));
      const label = btn.dataset.label || 'Section';
      btn.querySelector('span')?.replaceChildren(document.createTextNode(isOpen ? 'Hide' : 'Show'));
      btn.setAttribute('title', (isOpen ? 'Hide ' : 'Show ') + label);
    });
  });

  // Staggered effects so cards don't animate in sync
  const period = 15; // seconds
  $$('.fx-shine, .fx-wiggle').forEach(el => { el.style.animationDelay = `${Math.random()*period}s`; });

  // Copy email helper
  $('#copyEmail')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('misa@c23m9.com');
      const s = $('#formStatus'); if (s) { s.textContent = 'Email copied to clipboard.'; setTimeout(()=> s.textContent = 'I reply within one business day.', 2500); }
    } catch {}
  });

  // --- Insights data (demo) ---
  const data = [
    { platform: 'YouTube',  mau_bil: 2.7,  ad_aud_bil: 2.53, us_news_pct: 32, roi_top: true },
    { platform: 'Facebook', mau_bil: 3.1,  ad_aud_bil: 2.28, us_news_pct: 30, roi_top: false },
    { platform: 'Instagram',mau_bil: 2.0,  ad_aud_bil: 2.0,  us_news_pct: 16, roi_top: true },
    { platform: 'WhatsApp', mau_bil: 2.95, ad_aud_bil: 0.0,  us_news_pct: 0,  roi_top: false },
    { platform: 'TikTok',   mau_bil: 1.59, ad_aud_bil: 1.6,  us_news_pct: 12, roi_top: true },
    { platform: 'LinkedIn', mau_bil: 1.15, ad_aud_bil: 1.0,  us_news_pct: 4,  roi_top: true }
  ];

  const state = { metric: 'mau_bil', filter2b: false, filterROI: false, sortKey: 'platform', sortDir: 1 };
  const table = $('#dataTable tbody');
  const metricSel = $('#metricSelect');
  const chk2b = $('#filter2b');
  const chkROI = $('#filterROI');
  const resetBtn = $('#resetFilters');
  const canvas = $('#barChart');
  const ctx = canvas?.getContext('2d');

  const applyFilters = (rows) => rows.filter(r => {
    if (state.filter2b && !(r.mau_bil >= 2)) return false;
    if (state.filterROI && !r.roi_top) return false;
    return true;
  });
  const sortRows = (rows) => rows.sort((a,b)=>{
    const k = state.sortKey; const dir = state.sortDir; const av = a[k]; const bv = b[k];
    if (typeof av === 'number' && typeof bv === 'number') return dir*(av-bv);
    return dir*String(av).localeCompare(String(bv));
  });
  const renderTable = () => {
    const rows = sortRows(applyFilters([...data]));
    table.innerHTML = rows.map(r => `
      <tr>
        <td>${r.platform}</td>
        <td>${r.mau_bil.toFixed(2)}</td>
        <td>${r.ad_aud_bil.toFixed(2)}</td>
        <td>${r.us_news_pct}</td>
        <td>${r.roi_top ? '✔' : '—'}</td>
      </tr>`).join('');
  };
  const drawChart = () => {
    if (!ctx || !canvas) return;
    const rows = sortRows(applyFilters([...data]));
    const metric = state.metric; const labels = rows.map(r=>r.platform);
    const values = rows.map(r=> Number(r[metric]||0));
    const w = canvas.width = canvas.clientWidth; const h = canvas.height = 280;
    const pad = 40; const gw = w - pad*2; const gh = h - pad*2;
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText(metric === 'mau_bil' ? 'Monthly active users (billions)' : metric === 'ad_aud_bil' ? 'Ad reach (billions)' : 'US adults getting news (%)', pad, 18);
    const max = Math.max(...values, metric==='us_news_pct'?50:3.2);
    ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
    for (let i=0;i<=4;i++){ const y = pad + (gh/4)*i; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(w-pad,y); ctx.stroke(); }
    const bw = gw/Math.max(1, values.length) * .7;
    values.forEach((v,i)=>{
      const x = pad + i*(gw/values.length) + (gw/values.length - bw)/2;
      const hpx = (v/max)*gh; const y = pad + gh - hpx;
      const grad = ctx.createLinearGradient(0,y,0,y+hpx); grad.addColorStop(0,'#22d3ee'); grad.addColorStop(1,'#a78bfa');
      ctx.fillStyle = grad; ctx.fillRect(x,y,bw,hpx);
      ctx.fillStyle = '#94a3b8'; ctx.fillText(labels[i], x, h - 8);
    });
  };
  const renderAll = () => { renderTable(); drawChart(); };
  metricSel?.addEventListener('change', ()=>{ state.metric = metricSel.value; renderAll(); });
  chk2b?.addEventListener('change', ()=>{ state.filter2b = chk2b.checked; renderAll(); });
  chkROI?.addEventListener('change', ()=>{ state.filterROI = chkROI.checked; renderAll(); });
  resetBtn?.addEventListener('click', ()=>{
    state.metric='mau_bil'; state.filter2b=false; state.filterROI=false; state.sortKey='platform'; state.sortDir=1;
    metricSel.value=state.metric; chk2b.checked=false; chkROI.checked=false; renderAll();
  });
  $$('#dataTable thead th').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.getAttribute('data-key'); if (!key) return;
      if (state.sortKey === key) state.sortDir *= -1; else { state.sortKey = key; state.sortDir = 1; }
      renderAll();
    });
  });
  renderAll();

  // ---- Live effectiveness panel ----
  const el = {
    reply: $('#lmReply'), uptime: $('#lmUptime'), p95: $('#lmP95'), deploys: $('#lmDeploys'), incidents: $('#lmIncidents'), ab: $('#lmAB'),
    spark: $('#liveSpark'), svc: $('#svcHealth'), sla: $('#slaBadge')
  };
  if (el.spark) {
    const ctx = el.spark.getContext('2d');
    const points = Array.from({length:60}, ()=> 180 + Math.random()*120);
    let deploys = 3, incidents = 0, uptime = 99.98, ab = 7.4, replyMin = 22;

    const drawSpark = () => {
      const w = el.spark.width = el.spark.clientWidth; const h = el.spark.height = 70; const pad = 6;
      ctx.clearRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(255,255,255,.15)';
      ctx.beginPath();
      points.forEach((v,i)=>{
        const x = pad + (i/(points.length-1)) * (w - pad*2);
        const y = h - pad - (v/600) * (h - pad*2);
        i?ctx.lineTo(x,y):ctx.moveTo(x,y);
      });
      ctx.stroke();
    };

    const paint = () => {
      el.reply.textContent = String(Math.max(8, Math.round(replyMin + (Math.random()*4-2))));
      el.uptime.textContent = uptime.toFixed(2);
      el.p95.textContent = String(Math.max(80, Math.round(points[points.length-1])));
      el.deploys.textContent = String(deploys);
      el.incidents.textContent = String(incidents);
      el.ab.textContent = ab.toFixed(1);
      drawSpark();
    };

    setInterval(()=>{
      const last = points[points.length-1];
      const next = Math.max(60, Math.min(520, last + (Math.random()*40-20)));
      points.push(next); points.shift();
      paint();
    }, 1000);

    $('#simulateSpike')?.addEventListener('click', ()=>{
      el.svc.textContent = 'Degraded'; el.svc.classList.remove('ok');
      for (let i=0;i<8;i++){ points[points.length-1-i] = 450 + Math.random()*100; }
      replyMin = 28; uptime -= 0.01; paint();
      setTimeout(()=>{ el.svc.textContent='Healthy'; el.svc.classList.add('ok'); replyMin = 20; }, 5000);
    });

    $('#simulateDeploy')?.addEventListener('click', ()=>{
      deploys += 1; ab = Math.min(18, ab + (Math.random()*2+0.5)); paint();
    });

    paint();
  }
})();
