const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.main-nav');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

document.querySelectorAll('[data-rule-link]').forEach(link => {
  link.addEventListener('click', () => {
    const id = link.dataset.ruleLink;
    const detail = document.getElementById(id);
    if (detail && detail.tagName === 'DETAILS') detail.open = true;
  });
});

if (location.hash) {
  const target = document.querySelector(location.hash);
  if (target && target.tagName === 'DETAILS') target.open = true;
}


// V1.6 — animation légère de la bannière d’accueil.
const hero = document.querySelector('.hero');
const heroImageLayer = document.querySelector('.hero-image-layer');
if (hero && heroImageLayer) {
  const allowMotion = window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (allowMotion && finePointer) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) - 0.5;
      const ny = ((event.clientY - rect.top) / rect.height) - 0.5;
      hero.style.setProperty('--hero-parallax-x', `${(-nx * 4).toFixed(2)}px`);
      hero.style.setProperty('--hero-parallax-y', `${(-ny * 2).toFixed(2)}px`);
    });
    hero.addEventListener('pointerleave', () => {
      hero.style.setProperty('--hero-parallax-x', '0px');
      hero.style.setProperty('--hero-parallax-y', '0px');
    });
  }
}
