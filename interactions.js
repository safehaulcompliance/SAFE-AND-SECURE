// ─────────────────────────────────────────────────────────────
// Premium Micro-interactions for Safe Haul Compliance
// ─────────────────────────────────────────────────────────────

(function() {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Truck SVG icon (matches brand colors)
  const TRUCK_SVG = `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="truckGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1E40AF"/>
        </linearGradient>
      </defs>
      <!-- Trailer body -->
      <rect x="4" y="20" width="34" height="22" rx="2" fill="url(#truckGrad)" stroke="#0A1F44" stroke-width="1.5"/>
      <!-- Cabin -->
      <path d="M 38 26 L 50 26 L 56 36 L 56 42 L 38 42 Z" fill="url(#truckGrad)" stroke="#0A1F44" stroke-width="1.5" stroke-linejoin="round"/>
      <!-- Windshield -->
      <rect x="42" y="29" width="9" height="6" rx="1" fill="#E0EBFA"/>
      <!-- Wheels -->
      <circle cx="14" cy="46" r="5" fill="#0A1F44"/>
      <circle cx="14" cy="46" r="2" fill="#4A90E2"/>
      <circle cx="28" cy="46" r="5" fill="#0A1F44"/>
      <circle cx="28" cy="46" r="2" fill="#4A90E2"/>
      <circle cx="48" cy="46" r="5" fill="#0A1F44"/>
      <circle cx="48" cy="46" r="2" fill="#4A90E2"/>
      <!-- Trailer detail lines -->
      <line x1="10" y1="26" x2="34" y2="26" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
      <line x1="10" y1="32" x2="34" y2="32" stroke="#FFFFFF" stroke-width="0.8" opacity="0.5"/>
    </svg>
  `;

  ready(function() {

    // ───── 1. TRUCK CURSOR FOLLOWER ──────────────────────────
    const cursorTruck = document.createElement('div');
    cursorTruck.className = 'cursor-truck';
    cursorTruck.innerHTML = TRUCK_SVG;
    document.body.appendChild(cursorTruck);

    // Create trail particles
    const trails = [];
    for (let i = 0; i < 5; i++) {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      document.body.appendChild(trail);
      trails.push({ el: trail, x: 0, y: 0, life: 0 });
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let truckX = mouseX;
    let truckY = mouseY;
    let lastMouseX = mouseX;
    let trailIndex = 0;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Smooth truck movement with lag
      truckX += (mouseX - truckX) * 0.18;
      truckY += (mouseY - truckY) * 0.18;

      // Rotate truck based on movement direction
      const dx = mouseX - lastMouseX;
      let rotation = 0;
      if (Math.abs(dx) > 1) {
        rotation = dx > 0 ? 0 : 180; // Face direction of movement
      } else {
        rotation = 0;
      }
      lastMouseX = mouseX;

      cursorTruck.style.transform = `translate(${truckX}px, ${truckY}px) rotateY(${rotation}deg)`;

      // Drop trail particles occasionally
      if (Math.random() > 0.7) {
        const trail = trails[trailIndex];
        trail.x = truckX + (Math.random() - 0.5) * 8;
        trail.y = truckY + 15 + Math.random() * 5; // Behind truck (below it)
        trail.life = 1;
        trail.el.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
        trail.el.style.opacity = '0.7';
        trailIndex = (trailIndex + 1) % trails.length;
      }

      // Fade out all trails
      trails.forEach(function(t) {
        if (t.life > 0) {
          t.life -= 0.04;
          t.el.style.opacity = Math.max(0, t.life * 0.5);
        }
      });

      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function() {
      cursorTruck.style.opacity = '0';
      trails.forEach(function(t) { t.el.style.opacity = '0'; });
    });
    document.addEventListener('mouseenter', function() {
      cursorTruck.style.opacity = '1';
    });

    // Grow truck when hovering interactive elements
    function bindCursorScale() {
      const interactive = document.querySelectorAll('a, button, .btn, .service, .value, .run-step, input, select, textarea, [role="button"], .nav-brand');
      interactive.forEach(function(el) {
        if (el.dataset.cursorBound) return;
        el.dataset.cursorBound = 'true';
        el.addEventListener('mouseenter', function() {
          cursorTruck.classList.add('cursor-truck--active');
        });
        el.addEventListener('mouseleave', function() {
          cursorTruck.classList.remove('cursor-truck--active');
        });
      });
    }

    // ───── 2. MAGNETIC BUTTONS ───────────────────────────────
    function bindMagneticButtons() {
      const magneticEls = document.querySelectorAll('.btn');
      magneticEls.forEach(function(el) {
        if (el.dataset.magneticBound) return;
        el.dataset.magneticBound = 'true';
        el.addEventListener('mousemove', function(e) {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) translateY(-2px)`;
        });
        el.addEventListener('mouseleave', function() {
          el.style.transform = '';
        });
      });
    }

    // ───── 3. 3D CARD TILT ───────────────────────────────────
    function bindCardTilt() {
      const tiltCards = document.querySelectorAll('.service, .value');
      tiltCards.forEach(function(card) {
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = 'true';
        card.addEventListener('mousemove', function(e) {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });
        card.addEventListener('mouseleave', function() {
          card.style.transform = '';
        });
      });
    }

    // ───── 4. RIPPLE EFFECT ON CLICK ─────────────────────────
    function bindRipple() {
      document.querySelectorAll('.btn, .nav-links a, .back-to-top').forEach(function(el) {
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

    // ───── 5. SCROLL PROGRESS BAR ────────────────────────────
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    function updateScrollProgress() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.width = progress + '%';
    }

    // ───── 6. BACK TO TOP BUTTON ─────────────────────────────
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '↑';
    document.body.appendChild(backToTop);

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function toggleBackToTop() {
      if (window.pageYOffset > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    // ───── 7. SCROLL EVENTS ──────────────────────────────────
    let scrollTimeout;
    window.addEventListener('scroll', function() {
      updateScrollProgress();
      toggleBackToTop();
    }, { passive: true });

    // ───── 8. INTERSECTION OBSERVER FOR REVEALS ──────────────
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

    // ───── 9. SMOOTH SCROLL ──────────────────────────────────
    function bindSmoothScroll() {
      document.querySelectorAll('a[href^="#"]').forEach(function(link) {
        if (link.dataset.scrollBound) return;
        link.dataset.scrollBound = 'true';
        link.addEventListener('click', function(e) {
          const href = link.getAttribute('href');
          if (href.length > 1 && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
    }

    // ───── 10. BIND ALL (with retry for React) ───────────────
    function bindAll() {
      bindCursorScale();
      bindMagneticButtons();
      bindCardTilt();
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

    // Initial scroll state
    updateScrollProgress();
    toggleBackToTop();

    // ───── 11. DISABLE CUSTOM CURSOR ON TOUCH DEVICES ────────
    if ('ontouchstart' in window) {
      cursorTruck.style.display = 'none';
      trails.forEach(function(t) { t.el.style.display = 'none'; });
      document.body.style.cursor = '';
    }

  });

})();
