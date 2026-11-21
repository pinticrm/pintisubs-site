'use strict';
const menu = document.querySelector('.menu-toggle');
const mobile = document.querySelector('.mobile-nav');
if (menu && mobile) {
  menu.addEventListener('click', () => {
    const expanded = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!expanded));
    menu.textContent = expanded ? '☰' : '✕';
    mobile.hidden = expanded;
  });
  mobile.querySelectorAll('a').forEach(el => el.addEventListener('click', () => {
    mobile.hidden = true; menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰';
  }));
}
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('reveal-visible'); observer.unobserve(entry.target); }
  });
}, {threshold: .08}) : null;
if (observer) document.querySelectorAll('.feature,.steps article,.engine-tiles > div,.download-ring').forEach(el => { el.classList.add('reveal'); observer.observe(el); });