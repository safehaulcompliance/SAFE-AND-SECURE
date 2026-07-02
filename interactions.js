// ─────────────────────────────────────────────────────────────
// Micro-interactions for Safe Haul Compliance
// (native cursor, subtle professional motion only)
// ─────────────────────────────────────────────────────────────

(function() {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  ready(function() {

    // ───── 1. RIPPLE EFFECT ON CLICK ─────────────────────────
    function bindRipple() {
      document.querySelectorAll('.btn').forEach(function(el) {
        if (el.dataset.rippleBound) return;
        el.dataset.rippleBound = 'true';
        el.addEventListener('click', function(e) {
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          const rect = el.getBoundingClientRect();
          const size = Math.max(rect.width, rect.height);
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
          ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
          el.appendChild(ripple);
          setTimeout(function() { ripple.remove(); }, 600);
        });
      });
    }

    // ───── 2. NAV BACKGROUND CHANGE ON SCROLL ────────────────
    const nav = document.querySelector('.nav');
    const hero = document.querySelector('.hero-cine');

    function updateNavBg() {
      if (!nav) return;
      const heroHeight = hero ? hero.offsetHeight : 600;
      // Switch nav to white glass once user scrolls past most of the hero
      if (window.pageYOffset > heroHeight - 100) {
        nav.classList.add('nav-scrolled');
      } else {
        nav.classList.remove('nav-scrolled');
      }
    }

    window.addEventListener('scroll', function() {
      updateNavBg();
    }, { passive: true });
    updateNavBg();

    // ───── 3. INTERSECTION OBSERVER FOR REVEALS ──────────────
    function bindScrollReveals() {
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            entry.target.classList.add('visible');
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

      document.querySelectorAll('.service, .section-reveal, .value').forEach(function(el) {
        if (el.dataset.observed) return;
        el.dataset.observed = 'true';
        observer.observe(el);
      });
    }

    // ───── 4. SMOOTH SCROLL ──────────────────────────────────
    function bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        if (link.dataset.scrollBound) return;
        link.dataset.scrollBound = 'true';
        link.addEventListener('click', function(e) {
          const href = link.getAttribute('href');
          const target = href.length > 1 && document.querySelector(href);
          if (target) {
            e.preventDefault();
            // Offset by the fixed nav's real height so the section heading
            // lands below the bar instead of underneath it
            const nav = document.querySelector('.nav');
            const offset = (nav ? nav.getBoundingClientRect().height : 96) + 24;
            const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
            window.scrollTo({
              top: y,
              behavior: prefersReduced ? 'auto' : 'smooth'
            });
          }
        });
      });
    }

    // ───── 5. BIND ALL (with retry for React) ────────────────
    function bindAll() {
      bindRipple();
      bindScrollReveals();
      bindSmoothScroll();
    }

    bindAll();

    let attempts = 0;
    const interval = setInterval(function() {
      bindAll();
      attempts++;
      if (attempts >= 5) clearInterval(interval);
    }, 1200);

  });

})();
