// ─────────────────────────────────────────────────────────────
// Premium Micro-interactions for Safe Haul Compliance
// ─────────────────────────────────────────────────────────────

(function() {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Cute mini truck cursor (friendly emoji style)
  const TRUCK_SVG = `
    <svg viewBox="0 0 40 28" xmlns="http://www.w3.org/2000/svg">
      <!-- Cargo box (rounded, cute) -->
      <rect x="1" y="6" width="22" height="14" rx="3" fill="#2563EB"/>

      <!-- Cab (rounded, friendly) -->
      <path d="M 23 10 Q 23 8, 25 8 L 33 8 Q 35 8, 36 10 L 37 16 Q 37 20, 35 20 L 23 20 Z" fill="#1E40AF"/>

      <!-- Big cute windshield (like an eye) -->
      <rect x="25" y="10" width="9" height="6" rx="2" fill="#BFDBFE"/>
      <!-- Sparkle in window -->
      <circle cx="32" cy="12" r="0.8" fill="#FFFFFF"/>

      <!-- Wheels (chunky, cute) -->
      <circle cx="7" cy="22" r="4" fill="#1F2937"/>
      <circle cx="7" cy="22" r="1.5" fill="#9CA3AF"/>

      <circle cx="17" cy="22" r="4" fill="#1F2937"/>
      <circle cx="17" cy="22" r="1.5" fill="#9CA3AF"/>

      <circle cx="31" cy="22" r="4" fill="#1F2937"/>
      <circle cx="31" cy="22" r="1.5" fill="#9CA3AF"/>

      <!-- Headlight -->
      <circle cx="36" cy="15" r="1" fill="#FCD34D"/>
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

    let currentRotation = 0;
    let targetRotation = 0;
    let isMoving = false;
    let moveTimeout;

    function animateCursor() {
      // Smooth truck movement with lag
      truckX += (mouseX - truckX) * 0.18;
      truckY += (mouseY - truckY) * 0.18;

      // Rotate truck based on movement direction (truck faces right by default)
      const dx = mouseX - lastMouseX;
      if (Math.abs(dx) > 0.5) {
        targetRotation = dx > 0 ? 0 : 180; // 0 = facing right, 180 = facing left
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(function() { isMoving = false; }, 100);
      }
      lastMouseX = mouseX;

      // Smooth rotation transition
      const rotDiff = targetRotation - currentRotation;
      currentRotation += rotDiff * 0.2;

      cursorTruck.style.transform = `translate(${truckX}px, ${truckY}px) rotateY(${currentRotation}deg)`;

      // Drop exhaust trail particles when moving
      if (isMoving && Math.random() > 0.6) {
        const trail = trails[trailIndex];
        // Position exhaust behind cab (opposite of direction)
        const behindOffset = currentRotation > 90 ? 30 : -30;
        trail.x = truckX + behindOffset + (Math.random() - 0.5) * 6;
        trail.y = truckY - 12 + (Math.random() - 0.5) * 4; // Near exhaust stack height
        trail.life = 1;
        trail.el.style.transform = `translate(${trail.x}px, ${trail.y}px)`;
        trail.el.style.opacity = '0.5';
        trailIndex = (trailIndex + 1) % trails.length;
      }

      // Fade out all trails (smoke dissipates upward)
      trails.forEach(function(t) {
        if (t.life > 0) {
          t.life -= 0.035;
          t.y -= 0.5; // Drift upward like smoke
          t.el.style.transform = `translate(${t.x}px, ${t.y}px)`;
          t.el.style.opacity = Math.max(0, t.life * 0.4);
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
