// ─────────────────────────────────────────────────────────────
// Premium Micro-interactions for Safe Haul Compliance
// ─────────────────────────────────────────────────────────────

(function() {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // Premium American semi-truck silhouette (Peterbilt-inspired)
  const TRUCK_SVG = `
    <svg viewBox="0 0 80 50" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#E5E7EB"/>
        </linearGradient>
        <linearGradient id="cabGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#2563EB"/>
          <stop offset="100%" stop-color="#1E40AF"/>
        </linearGradient>
        <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#BFDBFE"/>
          <stop offset="100%" stop-color="#3B82F6"/>
        </linearGradient>
        <filter id="truckShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="2"/>
          <feComponentTransfer><feFuncA type="linear" slope="0.3"/></feComponentTransfer>
          <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#truckShadow)">
        <!-- Trailer (53-foot dry van — boxy clean rectangle) -->
        <rect x="2" y="12" width="44" height="26" rx="1.5" fill="url(#bodyGrad)" stroke="#0A1F44" stroke-width="0.8"/>
        <!-- Trailer subtle horizontal accent line -->
        <line x1="4" y1="22" x2="44" y2="22" stroke="#9CA3AF" stroke-width="0.4" opacity="0.6"/>
        <line x1="4" y1="30" x2="44" y2="30" stroke="#9CA3AF" stroke-width="0.4" opacity="0.6"/>
        <!-- Mud flap at trailer rear -->
        <rect x="2" y="38" width="2" height="4" fill="#0A1F44"/>

        <!-- Cab gap -->
        <rect x="46" y="14" width="2" height="24" fill="#0A1F44"/>

        <!-- Cab (American long-nose / Peterbilt style) -->
        <path d="M 48 16 L 60 16 L 62 18 L 62 26 L 70 26 L 74 30 L 74 38 L 48 38 Z"
              fill="url(#cabGrad)" stroke="#0A1F44" stroke-width="0.8" stroke-linejoin="round"/>

        <!-- Hood/engine bay (sloped front of American truck) -->
        <path d="M 62 26 L 70 26 L 70 32 L 62 32 Z" fill="url(#cabGrad)" stroke="#0A1F44" stroke-width="0.6"/>

        <!-- Windshield (split with center divider — classic American style) -->
        <path d="M 50 18 L 60 18 L 62 22 L 50 22 Z" fill="url(#windowGrad)" stroke="#0A1F44" stroke-width="0.5"/>
        <line x1="55" y1="18" x2="55.5" y2="22" stroke="#0A1F44" stroke-width="0.4"/>

        <!-- Side door window -->
        <rect x="50" y="24" width="6" height="6" rx="0.5" fill="url(#windowGrad)" stroke="#0A1F44" stroke-width="0.4"/>

        <!-- Chrome grille -->
        <rect x="70.5" y="28" width="3.5" height="4" fill="#9CA3AF"/>
        <line x1="70.5" y1="29.5" x2="74" y2="29.5" stroke="#0A1F44" stroke-width="0.3"/>
        <line x1="70.5" y1="31" x2="74" y2="31" stroke="#0A1F44" stroke-width="0.3"/>

        <!-- Headlight -->
        <circle cx="73" cy="34" r="1.2" fill="#FCD34D" stroke="#0A1F44" stroke-width="0.4"/>

        <!-- Exhaust stack (iconic vertical chrome pipe) -->
        <rect x="49" y="6" width="1.8" height="12" rx="0.5" fill="#9CA3AF" stroke="#0A1F44" stroke-width="0.3"/>
        <ellipse cx="49.9" cy="6" rx="1" ry="0.6" fill="#6B7280"/>

        <!-- Front bumper -->
        <rect x="69" y="36" width="6" height="2" rx="0.5" fill="#9CA3AF" stroke="#0A1F44" stroke-width="0.3"/>

        <!-- Wheels (3 sets — trailer tandem + cab tandem + steer) -->
        <!-- Trailer tandem axles -->
        <circle cx="10" cy="40" r="5" fill="#0A1F44"/>
        <circle cx="10" cy="40" r="2.5" fill="#374151"/>
        <circle cx="10" cy="40" r="1" fill="#9CA3AF"/>

        <circle cx="20" cy="40" r="5" fill="#0A1F44"/>
        <circle cx="20" cy="40" r="2.5" fill="#374151"/>
        <circle cx="20" cy="40" r="1" fill="#9CA3AF"/>

        <!-- Cab tandem -->
        <circle cx="52" cy="40" r="5" fill="#0A1F44"/>
        <circle cx="52" cy="40" r="2.5" fill="#374151"/>
        <circle cx="52" cy="40" r="1" fill="#9CA3AF"/>

        <circle cx="61" cy="40" r="5" fill="#0A1F44"/>
        <circle cx="61" cy="40" r="2.5" fill="#374151"/>
        <circle cx="61" cy="40" r="1" fill="#9CA3AF"/>

        <!-- Steer axle -->
        <circle cx="71" cy="40" r="4.5" fill="#0A1F44"/>
        <circle cx="71" cy="40" r="2.2" fill="#374151"/>
        <circle cx="71" cy="40" r="0.9" fill="#9CA3AF"/>
      </g>
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
