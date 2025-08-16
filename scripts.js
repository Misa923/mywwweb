// /scripts.js — updated: sticky header (CSS handles), ES i18n fixed, no menu button, spider tooltip, theme-aware chart, FormSubmit
(() => {
  const $  = (s,c=document)=>c.querySelector(s);
  const $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));

  // Cleanup stray "</span>" text nodes if present
  try {
    document.querySelectorAll('body *').forEach(n=>{
      n.childNodes.forEach(c=>{
        if (c.nodeType===3 && c.nodeValue?.includes('</span>')) {
          c.nodeValue = c.nodeValue.replaceAll('</span>','');
        }
      });
    });
  } catch {}

  // Year stamp
  $('#year')?.append(String(new Date().getFullYear()));

  // -----------------
  // i18n dictionaries
  // -----------------
  const I18N = {
    en: {
      nav: { services:'Services', work:'Work', playground:'Playground', dash:'Dashboard', contact:'Contact' },
      services: {
        title:'Simple services that reduce risk', kicker:'From idea to launch — and after',
        items: {
          web: { h3:'Build it right', p:'We build modern, accessible websites and apps that load fast and are easy to update.' },
          db:  { h3:'Clean data, quick answers', p:'We design schemas that make sense, queries that fly, and backups you can trust.' },
          api: { h3:'Connect your tools', p:'We ship stable, well-documented APIs so your product plays nicely with others.' },
          devops:{ h3:'Launch with confidence', p:'We automate deploys, provide rollbacks, and monitor so downtime isn’t a surprise.' },
          perf:{ h3:'Fast where it matters', p:'We measure, then optimize. Real users, real speed, real impact.' },
          sec: { h3:'Safe by default', p:'We apply least privilege, keep dependencies clean, and do practical threat modeling.' }
        }
      },
      work: { title:'Recent wins', kicker:'Ask for case study details' },
      pg: {
        title:'Social Media Insights (demo)', kicker:'Filter and sort — sourced, rounded figures',
        metric:'Metric', filter2b:'MAU ≥ 2B', filterROI:'Marketer ROI leaders', reset:'Reset',
        th: { platform:'Platform', mau:'MAU (B)', ad:'Ad reach (B)', news:'US news (%)', roi:'ROI leader' }
      },
      contact: {
        kicker:'Tell us about your project', name:'Name', email:'Email', budget:'Budget', timeline:'Timeline',
        brief:'Project brief', send:'Send inquiry', copy:'Copy email', resume:'Download résumé', sla:'We reply within one business day.',
        budgetChoose:'Select a range', timelineChoose:'Choose',
        trust: { privacy:'Privacy-first', nda:'NDA-friendly', sla:'1-business-day reply', ssl:'Backups & SSL' }
      },
      home: { cta:'Get a quote' },
      ui: { hide:'Hide', show:'Show', spiderTip:'Try spider theme' }
    },
    es: {
      nav: { services:'Servicios', work:'Proyectos', playground:'Insights', dash:'Panel', contact:'Contacto' },
      services: {
        title:'Servicios simples que reducen el riesgo', kicker:'De la idea al lanzamiento — y después',
        items: {
          web: { h3:'Construir bien', p:'Creamos sitios y apps accesibles y modernos que cargan rápido y son fáciles de mantener.' },
          db:  { h3:'Datos limpios, respuestas rápidas', p:'Diseñamos esquemas claros, consultas veloces y copias de seguridad confiables.' },
          api: { h3:'Conecta tus herramientas', p:'Publicamos APIs estables y documentadas para integrar tu producto sin fricción.' },
          devops:{ h3:'Lanzar con confianza', p:'Automatizamos despliegues, habilitamos rollbacks y monitoreamos para evitar sorpresas.' },
          perf:{ h3:'Rápido donde importa', p:'Medimos y luego optimizamos. Usuarios reales, velocidad real, impacto real.' },
          sec: { h3:'Seguro por defecto', p:'Aplicamos mínimo privilegio, mantenemos dependencias limpias y modelamos amenazas de forma práctica.' }
        }
      },
      work: { title:'Resultados recientes', kicker:'Pide detalles de los casos' },
      pg: {
        title:'Insights de redes sociales (demo)', kicker:'Filtra y ordena — cifras con fuentes y redondeadas',
        metric:'Métrica', filter2b:'MAU ≥ 2B', filterROI:'Plataformas con mejor ROI', reset:'Reiniciar',
        th: { plataforma:'Plataforma', platform:'Plataforma', mau:'MAU (B)', ad:'Alcance publicitario (B)', news:'Noticias en EE. UU. (%)', roi:'Líder en ROI' }
      },
      contact: {
        kicker:'Cuéntanos sobre tu proyecto', name:'Nombre', email:'Correo', budget:'Presupuesto', timeline:'Plazo',
        brief:'Resumen del proyecto', send:'Enviar consulta', copy:'Copiar correo', resume:'Descargar CV', sla:'Respondemos en un día hábil.',
        budgetChoose:'Selecciona un rango', timelineChoose:'Elegir',
        trust: { privacy:'Privacidad primero', nda:'Compatible con NDA', sla:'Respuesta en 1 día hábil', ssl:'Backups y SSL' }
      },
      home: { cta:'Pide una cotización' },
      ui: { hide:'Ocultar', show:'Mostrar', spiderTip:'Prueba el tema Spider' }
    }
  };

  const langSelect = $('#langSelect');
  let LANG = (langSelect && langSelect.value) || 'en';

  const getPath = (obj, pathArr) => pathArr.reduce((o,k)=> (o && o[k] != null) ? o[k] : undefined, obj);
  function t(key){
    const parts = key.split('.');
    return getPath(I18N[LANG], parts) ?? getPath(I18N.en, parts) ?? key;
  }

  function applyI18n(){
    $$('[data-i18n]').forEach(el=>{ el.textContent = t(el.dataset.i18n); });

    // placeholders
    const ph = {
      name:{en:'Your name', es:'Tu nombre'},
      email:{en:'you@company.com', es:'tú@empresa.com'},
      message:{en:'What are we building? Goals, users, integrations…', es:'¿Qué vamos a construir? Objetivos, usuarios, integraciones…'}
    };
    Object.entries(ph).forEach(([id,map])=>{
      const el = document.getElementById(id); if (el) el.placeholder = map[LANG] || map.en;
    });

    // section toggle labels
    $$('.section-toggle').forEach(btn=>{
      const section = btn.closest('section');
      const open = section && !section.classList.contains('collapsed');
      const label = btn.dataset.labelI18n ? t(btn.dataset.labelI18n) : (btn.dataset.label||'');
      btn.textContent = open ? t('ui.hide') : `${t('ui.show')} ${label}`;
      btn.title = btn.textContent;
    });

    // spider tooltip text
    const sp = $('#spideyToggle');
    if (sp){
      const tip = t('ui.spiderTip') || 'Try spider theme';
      sp.setAttribute('data-tip', tip);
      sp.title = tip;
    }

    // sync selector
    if (langSelect && langSelect.value !== LANG) langSelect.value = LANG;
  }

  langSelect?.addEventListener('change', (e)=>{ LANG = e.target.value || 'en'; applyI18n(); });
  document.addEventListener('DOMContentLoaded', applyI18n);

  // ------------------
  // Theme / Spider toggles
  // ------------------
  $('#themeToggle')?.addEventListener('click', ()=>{
    const html = document.documentElement;
    const cur = html.dataset.theme || 'dark';
    html.dataset.theme = (cur === 'light') ? 'dark' : 'light';
    if (typeof drawChart === 'function') drawChart();
  });

  $('#spideyToggle')?.addEventListener('click', (e)=>{
    const html = document.documentElement;
    html.dataset.variant = (html.dataset.variant === 'spidey') ? '' : 'spidey';

    // web-thread drop animation
    const btn = e.currentTarget;
    btn.classList.remove('web-drop'); void btn.offsetWidth; btn.classList.add('web-drop');
    setTimeout(()=>btn.classList.remove('web-drop'), 1600);

    if (typeof drawChart === 'function') drawChart();
  });

  // Remove any legacy menu/drawer artifacts if present
  $('#menuBtn')?.remove();
  $('#drawer')?.remove();

  // ------------------
  // Section hide/show
  // ------------------
  $$('.section-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const s = btn.closest('section'); if (!s) return;
      s.classList.toggle('collapsed');
      const open = !s.classList.contains('collapsed');
      btn.setAttribute('aria-expanded', String(open));
      applyI18n();
    });
  });

  // Stagger subtle effects so they don't all run at once
  const period = 15;
  $$('.fx-shine, .fx-wiggle').forEach(el=>{ el.style.animationDelay = `${Math.random()*period}s`; });

  // ------------------
  // Copy email button
  // ------------------
  $('#copyEmail')?.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText('misa@c23m9.com');
      const s = $('#formStatus'); if (s){ s.textContent='Email copied to clipboard.'; setTimeout(()=> s.textContent = t('contact.sla'), 2500); }
    }catch{}
  });

  // ------------------
  // Insights (Playground) demo
  // ------------------
  const data = [
    { platform:'YouTube',  mau_bil:2.70, ad_aud_bil:2.53, us_news_pct:32, roi_top:true },
    { platform:'Facebook', mau_bil:3.10, ad_aud_bil:2.28, us_news_pct:30, roi_top:false },
    { platform:'Instagram',mau_bil:2.00, ad_aud_bil:2.00, us_news_pct:16, roi_top:true },
    { platform:'WhatsApp', mau_bil:2.95, ad_aud_bil:0.00, us_news_pct:0,  roi_top:false },
    { platform:'TikTok',   mau_bil:1.59, ad_aud_bil:1.60, us_news_pct:12, roi_top:true },
    { platform:'LinkedIn', mau_bil:1.15, ad_aud_bil:1.00, us_news_pct:4,  roi_top:true }
  ];
  const state = { metric:'mau_bil', filter2b:false, filterROI:false, sortKey:'platform', sortDir:1 };

  const tableBody = $('#dataTable tbody');
  const metricSel = $('#metricSelect');
  const chk2b = $('#filter2b');
  const chkROI = $('#filterROI');
  const resetBtn = $('#resetFilters');

  const applyFilters = rows => rows.filter(r=>{
    if (state.filter2b && !(r.mau_bil >= 2)) return false;
    if (state.filterROI && !r.roi_top) return false;
    return true;
  });
  const sortRows = rows => rows.sort((a,b)=>{
    const k=state.sortKey, dir=state.sortDir, av=a[k], bv=b[k];
    if (typeof av==='number' && typeof bv==='number') return dir*(av-bv);
    return dir*String(av).localeCompare(String(bv));
  });

  function renderTable(){
    if (!tableBody) return;
    const rows = sortRows(applyFilters([...data]));
    tableBody.innerHTML = rows.map(r=>`
      <tr>
        <td>${r.platform}</td>
        <td>${r.mau_bil.toFixed(2)}</td>
        <td>${r.ad_aud_bil.toFixed(2)}</td>
        <td>${r.us_news_pct}</td>
        <td>${r.roi_top ? '✔' : '—'}</td>
      </tr>`).join('');
  }

  // Chart (theme-aware)
  const canvas = $('#barChart');
  const ctx = canvas?.getContext('2d');
  const isLightTheme = ()=> (document.documentElement.dataset.theme || 'dark') === 'light';

  function drawChart(){
    if (!ctx || !canvas) return;
    const rows = sortRows(applyFilters([...data]));
    const metric = state.metric;
    const labels = rows.map(r=>r.platform);
    const values = rows.map(r=>Number(r[metric]||0));

    const titleColor = isLightTheme() ? '#0b1b2b' : '#cbd5e1';
    const labelColor = isLightTheme() ? '#334155' : '#94a3b8';
    const gridColor  = isLightTheme() ? 'rgba(2,6,23,.12)' : 'rgba(255,255,255,.08)';

    const w = canvas.width = canvas.clientWidth;
    const h = canvas.height = 360;
    const padL=40, padR=24, padT=30, padB=64;
    const gw = w - padL - padR, gh = h - padT - padB;

    ctx.clearRect(0,0,w,h);

    // Title
    ctx.fillStyle = titleColor;
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText(
      metric==='mau_bil' ? 'Monthly active users (billions)' :
      metric==='ad_aud_bil' ? 'Ad reach (billions)' : 'US adults getting news (%)',
      padL, 18
    );

    // Grid
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
    for (let i=0;i<=4;i++){ const y = padT + (gh/4)*i; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke(); }

    // Bars
    const max = Math.max(...values, metric==='us_news_pct' ? 50 : 3.2);
    const slot = gw / Math.max(1, values.length);
    const bw = slot * 0.7;

    values.forEach((v,i)=>{
      const x = padL + i*slot + (slot - bw)/2;
      const hpx = (v/ max) * gh; const y = padT + gh - hpx;
      const grad = ctx.createLinearGradient(0,y,0,y+hpx);
      grad.addColorStop(0,'#22d3ee'); grad.addColorStop(1,'#a78bfa');
      ctx.fillStyle = grad; ctx.fillRect(x,y,bw,hpx);

      // X labels with auto-shrink
      ctx.fillStyle = labelColor; ctx.textAlign = 'center';
      let fs = 12; ctx.font = `${fs}px Inter, system-ui, sans-serif`;
      while (ctx.measureText(labels[i]).width > slot - 8 && fs > 9) { fs -= 1; ctx.font = `${fs}px Inter, system-ui, sans-serif`; }
      ctx.fillText(labels[i], x + bw/2, h - padB + 18);
    });
  }

  function renderAll(){ renderTable(); drawChart(); }

  metricSel?.addEventListener('change', ()=>{ state.metric = metricSel.value; renderAll(); });
  chk2b?.addEventListener('change', ()=>{ state.filter2b = chk2b.checked; renderAll(); });
  chkROI?.addEventListener('change', ()=>{ state.filterROI = chkROI.checked; renderAll(); });
  resetBtn?.addEventListener('click', ()=>{
    state.metric='mau_bil'; state.filter2b=false; state.filterROI=false; state.sortKey='platform'; state.sortDir=1;
    if (metricSel) metricSel.value=state.metric; if (chk2b) chk2b.checked=false; if (chkROI) chkROI.checked=false; renderAll();
  });
  $$('#dataTable thead th').forEach(th=>{
    th.addEventListener('click', ()=>{
      const k = th.getAttribute('data-key'); if (!k) return;
      if (state.sortKey === k) state.sortDir *= -1; else { state.sortKey = k; state.sortDir = 1; }
      renderAll();
    });
  });

  renderAll();
  window.addEventListener('resize', drawChart);

  // ------------------
  // Live effectiveness panel (synthetic)
  // ------------------
  const live = { reply:$('#lmReply'), uptime:$('#lmUptime'), p95:$('#lmP95'), deploys:$('#lmDeploys'), incidents:$('#lmIncidents'), ab:$('#lmAB'), spark:$('#liveSpark'), svc:$('#svcHealth') };
  if (live.spark){
    const sctx = live.spark.getContext('2d');
    const points = Array.from({length:60}, ()=> 180 + Math.random()*120);
    let deploys = 3, incidents = 0, uptime = 99.98, ab = 7.4, replyMin = 22;

    function drawSpark(){
      const w = live.spark.width = live.spark.clientWidth;
      const h = live.spark.height = 70; const pad = 6;
      sctx.clearRect(0,0,w,h);
      sctx.strokeStyle = 'rgba(255,255,255,.15)';
      sctx.beginPath();
      points.forEach((v,i)=>{
        const sx = pad + (i/(points.length-1)) * (w - pad*2);
        const y = h - pad - (v/600) * (h - pad*2);
        i ? sctx.lineTo(sx,y) : sctx.moveTo(sx,y);
      });
      sctx.stroke();
    }
    function paint(){
      if (live.reply) live.reply.textContent = String(Math.max(8, Math.round(replyMin + (Math.random()*4 - 2))));
      if (live.uptime) live.uptime.textContent = uptime.toFixed(2);
      if (live.p95) live.p95.textContent = String(Math.max(80, Math.round(points[points.length-1])));
      if (live.deploys) live.deploys.textContent = String(deploys);
      if (live.incidents) live.incidents.textContent = String(incidents);
      if (live.ab) live.ab.textContent = ab.toFixed(1);
      drawSpark();
    }
    setInterval(()=>{
      const last = points[points.length-1];
      const next = Math.max(60, Math.min(520, last + (Math.random()*40 - 20)));
      points.push(next); points.shift(); paint();
    }, 1000);

    $('#simulateSpike')?.addEventListener('click', ()=>{
      if (live.svc){ live.svc.textContent = 'Degraded'; live.svc.classList.remove('ok'); }
      for (let i=0;i<8;i++){ points[points.length-1-i] = 450 + Math.random()*100; }
      replyMin = 28; uptime -= 0.01; paint();
      setTimeout(()=>{ if (live.svc){ live.svc.textContent = 'Healthy'; live.svc.classList.add('ok'); } replyMin = 20; }, 5000);
    });
    $('#simulateDeploy')?.addEventListener('click', ()=>{ deploys += 1; ab = Math.min(18, ab + (Math.random()*2 + 0.5)); paint(); });

    window.addEventListener('resize', drawSpark);
    paint();
  }

  // ------------------
  // FormSubmit wiring (ensures redirect + no captcha)
  // ------------------
  const contactForm = $('#contactForm');
  if (contactForm){
    contactForm.addEventListener('submit', ()=>{
      const ensure=(n,v)=>{ let el=contactForm.querySelector(`input[name="${n}"]`); if(!el){ el=document.createElement('input'); el.type='hidden'; el.name=n; contactForm.appendChild(el); } el.value=v; };
      ensure('_next', `${location.origin}/#contact?sent=1`);
      ensure('_captcha','false');
    });
    const sent = location.hash.includes('sent=1') || new URLSearchParams(location.search).get('sent')==='1';
    if (sent){ const s=$('#formStatus'); if(s) s.textContent='Thanks! We’ll reply within one business day.'; try{ history.replaceState({},'',location.origin+'/#contact'); }catch{} }
  }
})();
