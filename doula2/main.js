// Year stamp
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

// HERO bg smooth reveal after the image actually loads
(() => {
  const hero = document.querySelector('.parallax.parallax--hero');
  if (!hero) return;

    // Prefer mobile var on small screens
  const mqlMobile = window.matchMedia('(max-width: 900px)');
  const preferVar = mqlMobile.matches ? '--bg-mobile' : '--bg';

  // Try preferred var, fall back to --bg
  let raw = getComputedStyle(hero).getPropertyValue(preferVar).trim();
  if (!raw || raw === 'none') {
    raw = getComputedStyle(hero).getPropertyValue('--bg').trim();
  }

  const match = raw && raw.match(/url\((?:'|")?(.*?)(?:'|")?\)/i);
  const src = match && match[1];

  if (!src) { hero.classList.add('is-ready'); return; }

  const img = new Image();
  img.onload  = () => hero.classList.add('is-ready');
  img.onerror = () => hero.classList.add('is-ready');
  img.decoding = 'async';
  img.src = src;

  if (img.complete) hero.classList.add('is-ready');
})();

// Back to top (guard if absent)
(() => {
  const backTop = document.querySelector('.back-to-top');
  if (!backTop) return;

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

// Contact "Other" field (single, guarded, crash-proof)
(() => {
  try {
    const serviceSelect = document.getElementById('services');
    const serviceOther  = document.getElementById('services_other');
    if (!serviceSelect || !serviceOther) return;

    function toggleOther(){
      const show = serviceSelect.value === 'Other';
      serviceOther.hidden   = !show;
      serviceOther.required = show;
      if (!show) serviceOther.value = '';
    }
    serviceSelect.addEventListener('change', toggleOther);
    toggleOther();
  } catch (err) {
    console.warn('Contact “Other” script skipped:', err);
  }
})();



// Only one FAQ open at a time (guard if section absent)
(() => {
  const details = Array.from(document.querySelectorAll('.faq-section .faq'));
  if (!details.length) return;
  details.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) details.forEach(other => { if (other !== d) other.open = false; });
  }));
})();

// Logo URL debug (optional)
(() => {
  const img = document.querySelector('.brand__logo');
  if (!img) return;
  console.log('Logo resolves to:', new URL(img.getAttribute('src'), document.baseURI).href);
  img.addEventListener('error', () => {
    console.error('Logo failed to load. Check path/filename case and that the file exists.');
  });
})();


// MOBILE NAV (≤900px only)
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const menu   = document.getElementById('site-menu');
  if (!toggle || !menu) return;

  const mql = window.matchMedia('(max-width: 900px)');
  let lastFocused = null;

  const firstLink = () => menu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');

  const open  = () => {
    lastFocused = document.activeElement;
    toggle.setAttribute('aria-expanded','true');
    menu.classList.add('is-open');
    document.body.classList.add('nav-open');
    // focus first interactive element in the drawer
    const f = firstLink();
    if (f) setTimeout(() => f.focus(), 0);
    // aria for assistive tech when closed/open
    menu.setAttribute('aria-hidden','false');
  };

  const close = () => {
    toggle.setAttribute('aria-expanded','false');
    menu.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    menu.setAttribute('aria-hidden','true');
    // return focus to the toggler if we opened from it
    if (lastFocused && lastFocused instanceof HTMLElement) lastFocused.focus();
  };

  // only toggle when in mobile range
  toggle.addEventListener('click', (e) => {
    if (!mql.matches) return; // ignore on desktop
    e.preventDefault();
    menu.classList.contains('is-open') ? close() : open();
  });

  // close on link click (mobile only)
  menu.addEventListener('click', (e) => {
    if (!mql.matches) return;
    if (e.target.closest('a')) close();
  });

  // close on ESC (mobile only) — no passive option here
  window.addEventListener('keydown', (e) => {
    if (!mql.matches) return;
    if (e.key === 'Escape') close();
  });

  // close when tapping/clicking outside the drawer (mobile only)
  document.addEventListener('click', (e) => {
    if (!mql.matches) return;
    if (!menu.classList.contains('is-open')) return;
    const clickInside = menu.contains(e.target) || toggle.contains(e.target);
    if (!clickInside) close();
  });

  // if user resizes to desktop, ensure everything is reset
  const handleChange = () => { if (!mql.matches) close(); };
  if (mql.addEventListener) mql.addEventListener('change', handleChange);
  else mql.addListener(handleChange);
})();


document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const drawer = document.getElementById('site-menu');

  if (!toggle || !drawer) return;

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded','false');
  };

  toggle.addEventListener('click', () => {
    const open = drawer.classList.toggle('is-open');
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // close when clicking a link
  drawer.addEventListener('click', (e) => {
    if (e.target.matches('a')) closeDrawer();
  });

  // close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // close when tapping outside the drawer
  document.addEventListener('click', (e) => {
    if (!drawer.classList.contains('is-open')) return;
    const clickInsideDrawer = drawer.contains(e.target) || toggle.contains(e.target);
    if (!clickInsideDrawer) closeDrawer();
  });
});

 // Soft reveal on scroll (single source of truth)
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  // Reduced motion: show immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        obs.unobserve(e.target); // reveal once
      }
    }
  }, { root: null, rootMargin: '0px 0px -10% 0px', threshold: 0.15 });

  els.forEach(el => io.observe(el));
})();

