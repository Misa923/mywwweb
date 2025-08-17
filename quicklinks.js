
/*
  Floating Quick Links
  - Drop this file on every page (or include via <scrip defer src="quicklinks.js"></scrip>)
  - Optional globals before this script:
      window.QL_PAGES = [{href:'file.html', label:'Label', icon:'…'}, ...]
      window.QL_NEW_TAB = true   // open links in new tab if desired
      window.QL_LABEL = 'Pages'  // handle text
*/

(function(){
  const PAGES = (window.QL_PAGES && Array.isArray(window.QL_PAGES)) ? window.QL_PAGES : [
    { href:'services.html', label:'Case notes',        icon:'📝' },
    { href:'employment.html', label:'Employment',       icon:'💼' },
    { href:'immigration.html',label:'Immigration',      icon:'🛂' },
    { href:'orr.html',        label:'ORR',              icon:'🏛️' },
    { href:'prog.html',       label:'Program Enrollment', icon:'📋' }, // handy link back
  ];
  const OPEN_IN_NEW_TAB = !!window.QL_NEW_TAB;
  const HANDLE_LABEL = window.QL_LABEL || 'Pages';

  // Build DOM
  const nav = document.createElement('nav');
  nav.className = 'quicklinks';
  nav.id = 'quicklinks';
  nav.setAttribute('aria-label','Quick Links');

  // Panel links markup
  const linksHTML = PAGES.map(p => {
    const safeHref = (p.href || '#');
    const a = `<a href="${safeHref}" role="menuitem" data-href="${safeHref}">
                 ${p.icon ? p.icon : '→'} <span>${p.label || safeHref}</span>
               </a>`;
    return a;
  }).join('');

  nav.innerHTML = `
    <button class="ql-handle" id="qlToggle" aria-expanded="false" aria-controls="qlPanel" title="Open quick links">
      <span class="ql-icon" aria-hidden="true">☰</span>
      <span class="ql-label">${HANDLE_LABEL}</span>
    </button>
    <div class="ql-panel" id="qlPanel" role="menu" aria-label="Quick Links menu">
      <div class="ql-head">Jump to</div>
      ${linksHTML}
    </div>
  `;

  // Insert at end of body to avoid stacking issues
  const ready = (fn)=> (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', fn) : fn();
  ready(() => {
    document.body.appendChild(nav);

    const root  = nav;
    const btn   = nav.querySelector('#qlToggle');
    const panel = nav.querySelector('#qlPanel');

    function open(){ root.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    function close(){ root.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }

    btn.addEventListener('click', () => root.classList.contains('open') ? close() : open());

    document.addEventListener('click', (e)=> { if(!root.contains(e.target)) close(); });
    document.addEventListener('keydown', (e)=> { if(e.key === 'Escape') close(); });

    // Configure links: active state + target
    const here = location.pathname.split('/').pop().toLowerCase();
    panel.querySelectorAll('a[role="menuitem"]').forEach(a=>{
      const file = (a.getAttribute('data-href') || '').split('/').pop().toLowerCase();
      if (OPEN_IN_NEW_TAB) { a.setAttribute('target','_blank'); a.setAttribute('rel','noopener'); }
      if (file === here || (file === '' && here === '')) {
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
      a.addEventListener('click', () => close());
    });
  });
})();

