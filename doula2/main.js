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
  // RECOMMENDED: rename your contact select/input ids to avoid clashing with the Services section
  const serviceSelect = document.getElementById('contact_service');        // <select id="contact_service">
  const serviceOther  = document.getElementById('contact_service_other');  // <input id="contact_service_other">
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
