/* ------------ i18n (same minimal dictionary as before) ------------ */
const I18N = {
  en: {
    nav:{services:"Services",work:"Work",stack:"Stack",playground:"Playground",dash:"Dashboards",contact:"Contact"},
    home:{
      availability:"Available for Q4", role:"Web & Database Engineer",
      h1a:"Build once.", h1b:"Scale safely.", h1c:"Ship websites, databases &", h1d:"APIs with confidence.",
      sub:"I help teams design clean schemas, ship robust web apps, and automate cloud deployments. Security-first. Documented. Observable.",
      cta2:"Get a quote", highlights:"Highlights"
    },
    services:{title:"Services that reduce risk and increase velocity", kicker:"From Figma to production & beyond"},
    work:{title:"Selected case studies",cta:"Request detailed write-ups"},
    stack:{title:"Preferred stack",kicker:"Pragmatic picks with great ecosystems"},
    pg:{
      title:"SQL Query Explorer", kicker:"Try a safe demo — no real data",
      run:"Run Query", label:"SQL (supports: <code>SELECT cols FROM table [WHERE a='x' AND b='y']</code>)",
      sample:{choose:"Choose sample"}, ds:{default:"Default dataset", ecomm:"E-commerce", support:"Support"},
      quests:{title:"Quests (try these):"},
      chart:{kicker:"Mini performance dashboard", title:"Throughput & latency (simulated)"}
    },
    contact:{kicker:"Tell me about your project", name:"Name", email:"Email", budget:"Budget", budgetChoose:"Select a range",
      timeline:"Timeline", timelineChoose:"Choose", brief:"Project brief", send:"Send inquiry", copy:"Copy email", resume:"Download résumé", sla:"I reply within one business day."
    },
    footer:{rights:"All rights reserved."}
  },
  es: {
    nav:{services:"Servicios",work:"Proyectos",stack:"Stack",playground:"Playground",dash:"Dashboards",contact:"Contacto"},
    home:{
      availability:"Disponible para Q4", role:"Ingeniero Web & Bases de Datos",
      h1a:"Construye una vez.", h1b:"Escala con seguridad.", h1c:"Entrega sitios, bases de datos y", h1d:"APIs con confianza.",
      sub:"Ayudo a diseñar esquemas limpios, publicar apps web robustas y automatizar despliegues en la nube. Seguridad primero. Documentado. Observable.",
      cta2:"Solicitar cotización", highlights:"Destacados"
    },
    services:{title:"Servicios que reducen riesgo y aumentan velocidad", kicker:"De Figma a producción y más allá"},
    work:{title:"Casos de estudio seleccionados",cta:"Solicitar documentos detallados"},
    stack:{title:"Stack preferido",kicker:"Elecciones pragmáticas con gran ecosistema"},
    pg:{
      title:"Explorador de Consultas SQL", kicker:"Demo segura — sin datos reales",
      run:"Ejecutar consulta", label:"SQL (soporta: <code>SELECT columnas FROM tabla [WHERE a='x' Y b='y']</code>)",
      sample:{choose:"Elegir ejemplo"}, ds:{default:"Dataset por defecto", ecomm:"E-commerce", support:"Soporte"},
      quests:{title:"Retos (prueba estos):"},
      chart:{kicker:"Mini panel de rendimiento", title:"Throughput y latencia (simulado)"}
    },
    contact:{kicker:"Cuéntame de tu proyecto", name:"Nombre", email:"Correo", budget:"Presupuesto", budgetChoose:"Selecciona un rango",
      timeline:"Plazo", timelineChoose:"Elige", brief:"Resumen del proyecto", send:"Enviar consulta", copy:"Copiar correo", resume:"Descargar CV", sla:"Respondo en un día hábil."
    },
    footer:{rights:"Todos los derechos reservados."}
  }
};

function applyI18n(lang){
  const dict = I18N[lang] || I18N.en;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const path = el.getAttribute('data-i18n').split('.');
    let val = dict; for(const k of path){ val = val?.[k]; if(val==null) break; }
    if(val!=null){ if(/<code>/.test(val)) el.innerHTML = val; else el.textContent = val; }
  });
  localStorage.setItem('site_lang', lang);
}
const langSelect = document.getElementById('langSelect');
langSelect?.addEventListener('change', ()=>applyI18n(langSelect.value));
applyI18n(localStorage.getItem('site_lang') || 'en');

/* ------------ Theme ------------ */
const root = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function applyTheme(mode){
  if(mode==='light'||mode==='dark'){ root.setAttribute('data-theme', mode); localStorage.setItem('theme', mode); }
  else { root.setAttribute('data-theme', prefersDark ? 'dark' : 'light'); localStorage.removeItem('theme'); }
}
applyTheme(savedTheme || 'auto');
themeToggle?.addEventListener('click', ()=>{ const cur=root.getAttribute('data-theme'); applyTheme(cur==='dark'?'light':'dark'); });

/* ------------ Mobile drawer (built once from desktop nav) ------------ */
const drawer = document.getElementById('drawer');
const menuBtn = document.getElementById('menuBtn');
const desktopNav = document.getElementById('desktopNav');
let drawerBuilt = false;
function buildDrawerFromDesktopOnce(){
  if(drawerBuilt) return;
  desktopNav?.querySelectorAll('a').forEach(a=>{
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.setAttribute('data-i18n', a.getAttribute('data-i18n') || '');
    link.textContent = a.textContent;
    drawer.appendChild(link);
  });
  drawerBuilt = true;
}
menuBtn?.addEventListener('click', ()=>{
  buildDrawerFromDesktopOnce();
  const open = drawer.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
drawer?.addEventListener('click', e=>{
  if(e.target.matches('a')){ drawer.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); }
});

/* ------------ Reveal on view ------------ */
const io = new IntersectionObserver((entries)=>{ for(const e of entries){ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target);} } }, {threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ------------ Hero counters ------------ */
function animateNumber(el,to,suffix=''){ const start=0; const dur=900; const t0=performance.now();
  function step(t){ const k=Math.min(1,(t-t0)/dur); const val=Math.round(start+(to-start)*(1-Math.pow(1-k,3))); el.textContent=val+suffix; if(k<1) requestAnimationFrame(step);}
  requestAnimationFrame(step);
}
window.addEventListener('load', ()=>{ animateNumber(document.getElementById('m1'),120); animateNumber(document.getElementById('m2'),99,'%'); animateNumber(document.getElementById('m3'),5); });

/* ------------ Playground demo (same as before) ------------ */
const datasets = {
  default:{ customers:[{id:1,name:'Ava Chen',email:'ava@exa.com',plan:'pro',active:'true'},{id:2,name:'Mark Diaz',email:'mark@exa.com',plan:'free',active:'true'},{id:3,name:'Nora Lee',email:'nora@exa.com',plan:'pro',active:'false'},{id:4,name:'Ibrahim A.',email:'ibra@exa.com',plan:'business',active:'true'}],
    orders:[{id:101,customer_id:1,total:129.90,status:'paid'},{id:102,customer_id:2,total:0.00,status:'free'},{id:103,customer_id:1,total:59.00,status:'refunded'},{id:104,customer_id:4,total:399.00,status:'paid'}],
    products:[{id:201,name:'Laptop',price:899,stock:'12'},{id:202,name:'Mouse',price:29,stock:'0'},{id:203,name:'Keyboard',price:99,stock:'5'}]},
  ecomm:{ customers:[{id:10,name:'Priya M',email:'priya@exa.com',plan:'business',active:'true'},{id:11,name:'Tom K',email:'tom@exa.com',plan:'pro',active:'true'},{id:12,name:'Jae',email:'jae@exa.com',plan:'free',active:'false'}],
    orders:[{id:501,customer_id:10,total:799.00,status:'paid'},{id:502,customer_id:11,total:25.00,status:'paid'},{id:503,customer_id:12,total:0.00,status:'free'}],
    products:[{id:601,name:'Phone',price:699,stock:'7'},{id:602,name:'Case',price:19,stock:'34'},{id:603,name:'Charger',price:29,stock:'0'}]},
  support:{ tickets:[{id:9001,summary:'Login fails SSO',status:'open',priority:'high'},{id:9002,summary:'Password reset loop',status:'open',priority:'low'},{id:9003,summary:'API rate limits',status:'closed',priority:'high'}],
    customers:[{id:88,name:'Acme Inc',email:'ops@acme.com',plan:'business',active:'true'}], orders:[] }
};
let db = structuredClone(datasets.default);

function parseSQL(sql){
  const clean = sql.trim().replace(/;+\s*$/, '');
  const m = clean.match(/^SELECT\s+([\w\s,\*]+)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
  if(!m) throw new Error('Only SELECT ... FROM ... [WHERE ...] is supported.');
  const [, colsRaw, table, whereRaw] = m;
  const cols = colsRaw.split(',').map(s=>s.trim());
  const where = [];
  if(whereRaw){
    const parts = whereRaw.split(/\s+AND\s+/i);
    for(const p of parts){
      const mw = p.match(/^(\w+)\s*=\s*'([^']*)'$/);
      if(!mw) throw new Error('WHERE only supports = with single-quoted strings.');
      where.push({ col: mw[1], val: mw[2] });
    }
  }
  return { cols, table, where };
}
function runQuery(ast){
  const data = db[ast.table];
  if(!data) throw new Error(`Unknown table: ${ast.table}`);
  let rows = data;
  for(const cond of ast.where){ rows = rows.filter(r => String(r[cond.col]) === cond.val); }
  const selected = rows.map(r=>{
    if(ast.cols.length===1 && ast.cols[0]==='*') return r;
    const o={}; for(const c of ast.cols){ o[c]=(c in r)?r[c]:undefined; } return o;
  });
  return selected;
}
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;","&gt;":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
function renderTable(rows){
  if(!rows.length) return '<div class="status">No rows.</div>';
  const headers = Object.keys(rows[0]);
  let html = '<table><thead><tr>' + headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('') + '</tr></thead><tbody>';
  for(const r of rows){ html += '<tr>' + headers.map(h=>`<td>${escapeHtml(String(r[h]))}</td>`).join('') + '</tr>'; }
  html += '</tbody></table>'; return html;
}

const sqlInput = document.getElementById('sqlInput');
const runBtn = document.getElementById('runBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('resultTable');
const sampleSel = document.getElementById('sampleQueries');
const datasetSel = document.getElementById('datasetSelect');
const xpFill = document.getElementById('xpFill');
const xpLabel = document.getElementById('xpLabel');
let xp=0, streak=0;

function bumpXP(amount){
  xp = Math.max(0, xp + amount);
  streak = Math.min(99, streak + 1);
  xpFill.style.width = Math.min(100, (xp % 100)) + '%';
  xpLabel.textContent = `XP ${xp} • Streak ${streak}`;
}

function execute(){
  const t0 = performance.now();
  try{
    const ast = parseSQL(sqlInput.value);
    const rows = runQuery(ast);
    const html = renderTable(rows);
    const ms = Math.max(1, Math.round(performance.now() - t0));
    resultEl.innerHTML = html;
    statusEl.textContent = `Returned ${rows.length} row(s) in ${ms} ms.`;
    injectPerf(rows.length);
    bumpXP(5 + Math.min(20, rows.length));
  }catch(err){
    resultEl.innerHTML = '';
    statusEl.textContent = `Error: ${err.message}`;
    injectPerf(0, true);
    streak = 0; xpLabel.textContent = `XP ${xp} • Streak ${streak}`;
  }
}

runBtn?.addEventListener('click', execute);
sampleSel?.addEventListener('change', e=>{ if(e.target.value){ sqlInput.value=e.target.value; execute(); }});
datasetSel?.addEventListener('change', e=>{ const key=e.target.value; db = structuredClone(datasets[key]||datasets.default); bumpXP(3); });
document.querySelectorAll('.quest').forEach(btn=>btn.addEventListener('click', ()=>{ sqlInput.value=btn.dataset.q; execute(); bumpXP(7); }));
document.addEventListener('keydown', e=>{
  const mod = e.ctrlKey || e.metaKey;
  if(mod && e.key.toLowerCase()==='enter'){ e.preventDefault(); execute(); }
  if(mod && e.key.toLowerCase()==='l'){ e.preventDefault(); sqlInput.value=''; resultEl.innerHTML=''; statusEl.textContent='Cleared.'; }
  if(mod && e.key==='/'){ e.preventDefault(); sampleSel.focus(); }
});

/* Chart */
const canvas = document.getElementById('chart');
const ctx = canvas?.getContext('2d');
const N=80; const pts = Array.from({length:N},(_,i)=>({x:i,qps:40+Math.random()*40,p95:60+Math.random()*80}));

function draw(){
  if(!canvas || !ctx) return;
  const w=canvas.clientWidth, h=canvas.clientHeight;
  canvas.width=w*devicePixelRatio; canvas.height=h*devicePixelRatio; ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  ctx.clearRect(0,0,w,h);
  ctx.globalAlpha=.15; ctx.strokeStyle='#9aa4b2'; ctx.lineWidth=1;
  for(let y=0;y<=4;y++){ ctx.beginPath(); ctx.moveTo(0,(h/4)*y); ctx.lineTo(w,(h/4)*y); ctx.stroke(); }
  ctx.globalAlpha=1;
  const pad=12; const qw=Math.max(...pts.map(p=>p.qps)); const pw=Math.max(...pts.map(p=>p.p95));
  const sx=i=>pad+(w-pad*2)*(i/(N-1));
  const sy=(v,max)=>h-pad-(h-pad*2)*(v/max);
  // qps
  ctx.beginPath();
  for(let i=0;i<N;i++){ const y=sy(pts[i].qps,Math.max(120,qw)); if(i) ctx.lineTo(sx(i),y); else ctx.moveTo(sx(i),y); }
  ctx.strokeStyle='#22d3ee'; ctx.lineWidth=2; ctx.stroke();
  // p95
  ctx.beginPath();
  for(let i=0;i<N;i++){ const y=sy(pts[i].p95,Math.max(200,pw)); if(i) ctx.lineTo(sx(i),y); else ctx.moveTo(sx(i),y); }
  ctx.strokeStyle='#7c5cff'; ctx.lineWidth=2; ctx.stroke();
}
function injectPerf(rows,isError=false){
  const last=pts.at(-1);
  const next={ x:last.x+1,
    qps:Math.max(20,Math.min(140,(isError?last.qps*0.9:last.qps*0.95+rows*2+Math.random()*5))),
    p95:Math.max(40,Math.min(220,(isError?last.p95*1.1:last.p95*0.95-rows*0.5+Math.random()*6)))
  };
  pts.push(next); pts.shift(); draw();
  document.getElementById('qps')?.textContent = Math.round(next.qps);
  document.getElementById('p95')?.textContent = Math.round(next.p95);
}
function tick(){ injectPerf(0); if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) requestAnimationFrame(()=>setTimeout(tick,650)); }
window.addEventListener('resize', draw); draw(); tick();

/* Contact helpers */
function toast(msg){
  const el=document.createElement('div');
  el.textContent=msg; el.style.cssText='position:fixed;left:50%;top:1rem;transform:translateX(-50%);background:var(--card);border:1px solid '+getComputedStyle(document.body).getPropertyValue('--ring')+';padding:.6rem .8rem;border-radius:12px;z-index:2000;box-shadow:var(--shadow)';
  document.body.append(el); setTimeout(()=>el.remove(),1600);
}
document.getElementById('budgetPills')?.addEventListener('click', (e)=>{
  if(e.target.matches('button.pill')){ document.getElementById('budget').value = e.target.dataset.val; }
});
document.getElementById('copyEmail')?.addEventListener('click', async ()=>{
  try{ await navigator.clipboard.writeText('misa@c23m9.com'); toast('Email copied'); }catch{ toast('Unable to copy'); }
});
document.getElementById('year').textContent = new Date().getFullYear();
