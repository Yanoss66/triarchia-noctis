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
