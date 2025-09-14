// Year stamp
document.documentElement.classList.add('js');
document.documentElement.classList.add('js');
document.querySelectorAll('#year').forEach(el => el.textContent = new Date().getFullYear());

// PARALLAX (desktop + mobile)
(() => {
  const sections = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!sections.length) return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  let ticking = false;

  const update = () => {
    const vh = window.innerHeight || 1;
    sections.forEach(sec => {
      const speed = parseFloat(sec.dataset.speed || '0.35');
      const rect = sec.getBoundingClientRect();
      const distanceFromCenter = rect.top + rect.height / 2 - vh / 2;
      sec.style.setProperty('--y', (-(distanceFromCenter * speed)).toFixed(2) + 'px');
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
})();

// ▼ HERO bg smooth reveal after the image actually loads (paste after PARALLAX IIFE)
(() => {
  const hero = document.querySelector('.parallax.parallax--hero');
  if (!hero) return;

  // Read the CSS variable value:  --bg: url('images/im9.png');
  const raw = getComputedStyle(hero).getPropertyValue('--bg').trim();
  const match = raw.match(/url\((?:'|")?(.*?)(?:'|")?\)/i);
  const src = match && match[1];
  if (!src) { hero.classList.add('is-ready'); return; }

  const img = new Image();
  img.onload  = () => hero.classList.add('is-ready');
  img.onerror = () => hero.classList.add('is-ready'); // fail safe so it doesn't stay hidden
  img.decoding = 'async';
  img.src = src;

  // If cached, onload may not fire—cover that case:
  if (img.complete) hero.classList.add('is-ready');
})();




// Back to top (guard if absent)
(() => {
  const backTop = document.querySelector('.back-to-top');
  if (!backTop) return; // <-- prevents crash

  const revealAt = 200;
  function toggleBackTop(){
    const show = window.scrollY > revealAt;
    backTop.classList.toggle('is-visible', show);
    backTop.setAttribute('aria-hidden', String(!show));
  }
  window.addEventListener('scroll', toggleBackTop, { passive: true });
  toggleBackTop();

  backTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

// Contact "Other" field (use dedicated IDs; guard if absent)
(() => {
  // RECOMMENDED: rename your contact select/input ids to avoid clashing with the Services sectionconst serviceSelect = document.getElementById('services');
  const serviceOther  = document.getElementById('services_other');
  if (!serviceSelect || !serviceOther) return;

  function toggleOther(){
    const show = serviceSelect.value === 'Other';
    serviceOther.hidden = !show;
    serviceOther.required = show;
    if (!show) serviceOther.value = '';
  }
  serviceSelect.addEventListener('change', toggleOther);
  toggleOther();
})();

// Reveal on scroll for testimonials + FAQ (guarded; with fallback)
(() => {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
})();

// Only one FAQ open at a time (guard if section absent)
(() => {
  const details = Array.from(document.querySelectorAll('.faq-section .faq'));
  if (!details.length) return;
  details.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) details.forEach(other => { if (other !== d) other.open = false; });
  }));
})();

// Logs the exact URL the browser is trying to load for the logo
  (function(){
    const img = document.querySelector('.brand__logo');
    if (!img) return;
    console.log('Logo resolves to:', new URL(img.getAttribute('src'), document.baseURI).href);
    img.addEventListener('error', () => {
      console.error('Logo failed to load. Check path/filename case and that the file exists.');
    });
  })();

  