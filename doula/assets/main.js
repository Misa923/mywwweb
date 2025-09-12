
// assets/main.js
(function(){
  // Active nav highlighting
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href');
    if ((here === 'index.html' && href === 'index.html') || (href && href.endsWith(here))) {
      a.classList.add('active');
    }
  });

  // Mobile menu toggle
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.menu');
  const menuList = document.getElementById('menu');
  menuBtn && menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  menuList && menuList.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  // Testimonials carousel (only on testimonials page)
  const carousels = document.querySelectorAll('[data-carousel]');
  carousels.forEach((c)=>{
    const track = c.querySelector('.track');
    const slides = [...c.querySelectorAll('.slide')];
    const dotsWrap = c.querySelector('.dots');
    let i = 0;
    const go = (n) => {
      i = (n + slides.length) % slides.length;
      track.style.transform = `translateX(${-i*100}%)`;
      dotsWrap.querySelectorAll('.dot').forEach((d,di)=>d.classList.toggle('active', di===i));
    };
    slides.forEach((_,idx)=>{
      const b = document.createElement('button'); b.className = 'dot'; b.type='button';
      b.addEventListener('click', ()=>go(idx)); dotsWrap.appendChild(b);
    });
    go(0); let t=setInterval(()=>go(i+1), 6000);
    c.addEventListener('mouseenter', ()=>clearInterval(t));
    c.addEventListener('mouseleave', ()=>t=setInterval(()=>go(i+1), 6000));
  });

  // Contact form (client-side demo)
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      const req = ['first','last','email','message'];
      const status = document.getElementById('status');
      for(const r of req){ if(!fd.get(r)){ status.textContent='Please fill required fields.'; return; } }
      status.textContent='Thanks! Your message was “sent” (demo).';
      form.reset();
    });
  }

  // Client hub demo gate (NOT SECURE)
  const hubForm = document.getElementById('hubGate');
  if (hubForm) {
    hubForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const pass = document.getElementById('hubPass').value;
      const note = document.getElementById('hubNote');
      if(pass==='doula-demo'){
        note.textContent=''; document.getElementById('hubContent').style.display='block'; hubForm.style.display='none';
      } else {
        note.textContent='Incorrect password (try: doula-demo)';
      }
    });
  }
})();
