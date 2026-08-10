// Self-hosted variable fonts (no external CDN — faster & GDPR-friendly)
import '@fontsource-variable/fraunces/index.css';
import '@fontsource-variable/fraunces/standard-italic.css';
import '@fontsource-variable/inter/index.css';

import './style.css';
import { translations } from './i18n.js';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createIcons,
  Sprout, ShoppingBasket, Snowflake, Truck,
  Leaf, Wheat, CupSoda, Sun, Sparkle,
  CakeSlice, ArrowLeft,
  CookingPot, Flame, Pizza, Egg,
} from 'lucide';

gsap.registerPlugin(ScrollTrigger);

// Render all [data-lucide] placeholders as inline SVG icons
createIcons({
  icons: { Sprout, ShoppingBasket, Snowflake, Truck, Leaf, Wheat, CupSoda, Sun, Sparkle, CakeSlice, ArrowLeft, CookingPot, Flame, Pizza, Egg },
  attrs: { 'stroke-width': 1.6, class: 'lucide' },
});

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ============================================================
   i18n
   ============================================================ */
const STORAGE_KEY = 'berryland-lang';
let lang = localStorage.getItem(STORAGE_KEY) || (navigator.language?.startsWith('sq') ? 'sq' : 'en');

function applyLang(next) {
  lang = next;
  const dict = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const val = dict[key];
    if (val == null) return;
    if (el.hasAttribute('data-i18n-attr')) {
      el.setAttribute(el.dataset.i18nAttr, val);
    } else {
      el.textContent = val;
    }
  });
  // <title> + meta handled above via data-i18n / data-i18n-attr

  $$('.lang__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.lang === lang));
  ScrollTrigger.refresh();
}

$$('.lang__btn').forEach((b) =>
  b.addEventListener('click', () => applyLang(b.dataset.lang))
);

/* ============================================================
   Smooth scroll (Lenis) + GSAP sync
   ============================================================ */
let lenis;
if (!prefersReduced) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToId(id) {
  const el = document.querySelector(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
$$('a[href^="#"]').forEach((a) =>
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      e.preventDefault();
      scrollToId(id);
      closeMenu();
    }
  })
);

/* ============================================================
   Header scroll state
   ============================================================ */
const header = $('#header');
ScrollTrigger.create({
  start: 'top -60',
  onUpdate: (self) => header.classList.toggle('is-scrolled', self.scroll() > 60),
});
// fallback for reduced-motion (no lenis driving ST)
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 60), { passive: true });

/* ============================================================
   Mobile menu
   ============================================================ */
const burger = $('#burger');
const menu = $('#mobileMenu');
function closeMenu() {
  burger.classList.remove('is-open');
  menu.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-hidden', 'true');
}
burger.addEventListener('click', () => {
  const open = burger.classList.toggle('is-open');
  menu.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-hidden', String(!open));
});

/* ============================================================
   Reveal on scroll
   ============================================================ */
if (prefersReduced) {
  $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));
} else {
  // group reveals by their section for a gentle stagger
  $$('[data-reveal]').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 86%',
      once: true,
      onEnter: () => el.classList.add('is-in'),
    });
  });
}

/* ============================================================
   Hero intro timeline (home page only)
   ============================================================ */
if (!prefersReduced && $('.hero')) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero__kicker', { y: 20, opacity: 0, duration: 0.6 })
    .from('.hero__title .line > span', { yPercent: 115, duration: 0.95, stagger: 0.09 }, '-=0.2')
    .from('.hero__lead', { y: 24, opacity: 0, duration: 0.7 }, '-=0.45')
    .from('.hero__cta > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
    .from('.hero__meta li', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
    .from('.hero__photo', { clipPath: 'inset(100% 0 0 0)', duration: 1.05, ease: 'power4.out' }, '-=1.1')
    .from('.hero__cap', { yPercent: 120, duration: 0.6 }, '-=0.4');
}

/* ============================================================
   Parallax (scroll-driven)
   ============================================================ */
if (!prefersReduced) {
  $$('[data-parallax]').forEach((el) => {
    const depth = parseFloat(el.dataset.parallax) || 0.1;
    gsap.to(el.querySelector('img, video') || el, {
      yPercent: depth * 100,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // CTA banner: drift the content as it passes through the viewport
  const cta = $('.cta-banner');
  if (cta) {
    gsap.fromTo(
      cta.querySelector('.cta-banner__inner'),
      { y: 40 },
      { y: -40, ease: 'none', scrollTrigger: { trigger: cta, start: 'top bottom', end: 'bottom top', scrub: true } }
    );
  }
}

/* ============================================================
   Marquee — seamless infinite loop
   ============================================================ */
if (!prefersReduced) {
  const track = $('.marquee__track');
  if (track) {
    const loop = () => {
      gsap.to(track, {
        xPercent: -50,
        ease: 'none',
        duration: 22,
        repeat: -1,
      });
    };
    loop();
  }
}

/* ============================================================
   Stat counters
   ============================================================ */
$$('.stat__num[data-count]').forEach((el) => {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  if (prefersReduced) { el.textContent = target + suffix; return; }
  const obj = { v: 0 };
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.to(obj, {
        v: target,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v) + suffix; },
      });
    },
  });
});

/* ============================================================
   Process progress line
   ============================================================ */
if (!prefersReduced) {
  const prog = $('.steps__progress');
  if (prog) {
    gsap.to(prog, {
      width: '100%',
      ease: 'none',
      scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 70%', scrub: true },
    });
  }
}

/* ============================================================
   Product card 3D tilt
   ============================================================ */
if (!prefersReduced && window.matchMedia('(hover: hover)').matches) {
  $$('.card').forEach((card) => {
    const strength = 8;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotationY: px * strength, rotationX: -py * strength, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotationY: 0, rotationX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ============================================================
   Custom cursor
   ============================================================ */
if (window.matchMedia('(hover: hover)').matches && !prefersReduced) {
  const cursor = $('.cursor');
  const dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const pos = { ...dot };
  window.addEventListener('mousemove', (e) => { dot.x = e.clientX; dot.y = e.clientY; });
  gsap.ticker.add(() => {
    pos.x += (dot.x - pos.x) * 0.18;
    pos.y += (dot.y - pos.y) * 0.18;
    cursor.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  });
  $$('a, button, .card').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

/* ============================================================
   Contact form (front-end only demo)
   ============================================================ */
const form = $('#contactForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const note = $('#formNote');
    note.hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
    if (!prefersReduced) gsap.fromTo(note, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 });
    form.reset();
  });
}

/* ============================================================
   Misc
   ============================================================ */
// active nav state based on current path
(() => {
  const path = location.pathname;
  let active = 'home';
  if (path.includes('/products')) active = 'products';
  else if (path.includes('/about')) active = 'about';
  else if (path.includes('/contact')) active = 'contact';
  $$('[data-nav]').forEach((a) => {
    if (a.dataset.nav === active) { a.classList.add('is-current'); a.setAttribute('aria-current', 'page'); }
  });
})();

const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
applyLang(lang);

// refresh triggers once fonts/images settle
window.addEventListener('load', () => ScrollTrigger.refresh());
