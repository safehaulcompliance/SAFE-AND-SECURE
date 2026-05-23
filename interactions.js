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

    // Create smoke puffs (from exhaust)
    const smokePuffs = [];
    for (let i = 0; i < 6; i++) {
      const puff = document.createElement('div');
      puff.className = 'cursor-smoke';
      document.body.appendChild(puff);
      smokePuffs.push({ el: puff, x: 0, y: 0, life: 0, size: 1 });
    }

    // Create tire dust particles
    const dustParticles = [];
    for (let i = 0; i < 10; i++) {
      const dust = document.createElement('div');
      dust.className = 'cursor-dust';
      document.body.appendChild(dust);
      dustParticles.push({ el: dust, x: 0, y: 0, vx: 0, vy: 0, life: 0 });
    }

    // Create crash sparks (yellow/red explosion bits)
    const crashSparks = [];
    for (let i = 0; i < 16; i++) {
      const spark = document.createElement('div');
      spark.className = 'cursor-spark';
      document.body.appendChild(spark);
      crashSparks.push({ el: spark, x: 0, y: 0, vx: 0, vy: 0, life: 0 });
    }

    // Create impact burst (the explosion ring)
    const crashBurst = document.createElement('div');
    crashBurst.className = 'cursor-burst';
    document.body.appendChild(crashBurst);

    // Create BAM text
    const crashBam = document.createElement('div');
    crashBam.className = 'cursor-bam';
    crashBam.textContent = 'BAM!';
    document.body.appendChild(crashBam);

    // Crash state
    let lastCrashTime = 0;
    let crashCooldown = 800; // ms between crashes
    let burstLife = 0;
    let bamLife = 0;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let truckX = mouseX;
    let truckY = mouseY;
    let lastMouseX = mouseX;
    let lastMouseY = mouseY;

    document.addEventListener('mousemove', function(e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    let currentRotation = 0;
    let targetRotation = 0;
    let isMoving = false;
    let moveTimeout;
    let smokeIdx = 0;
    let dustIdx = 0;

    function animateCursor() {
      // Smooth truck movement with lag
      truckX += (mouseX - truckX) * 0.18;
      truckY += (mouseY - truckY) * 0.18;

      // Rotate truck based on movement direction (truck faces right by default)
      const dx = mouseX - lastMouseX;
      const dy = mouseY - lastMouseY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (Math.abs(dx) > 0.5) {
        targetRotation = dx > 0 ? 0 : 180;
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(function() { isMoving = false; }, 100);
      }
      lastMouseX = mouseX;
      lastMouseY = mouseY;

      // Smooth rotation transition
      const rotDiff = targetRotation - currentRotation;
      currentRotation += rotDiff * 0.2;

      cursorTruck.style.transform = `translate(${truckX}px, ${truckY}px) rotateY(${currentRotation}deg)`;

      // ── SMOKE PUFFS from exhaust stack ──
      if (isMoving && Math.random() > 0.45) {
        const puff = smokePuffs[smokeIdx];
        const facingRight = currentRotation < 90;
        // Exhaust stack is on the cab side (right when facing right, left when facing left)
        const stackOffset = facingRight ? 6 : -6;
        puff.x = truckX + stackOffset + (Math.random() - 0.5) * 3;
        puff.y = truckY - 8 + (Math.random() - 0.5) * 2;
        puff.life = 1;
        puff.size = 0.6 + Math.random() * 0.4;
        puff.el.style.transform = `translate(${puff.x}px, ${puff.y}px) scale(${puff.size})`;
        puff.el.style.opacity = '0.55';
        smokeIdx = (smokeIdx + 1) % smokePuffs.length;
      }

      // Fade and grow smoke (drifts up, expands, fades)
      smokePuffs.forEach(function(p) {
        if (p.life > 0) {
          p.life -= 0.025;
          p.y -= 0.6 + Math.random() * 0.3;
          p.x += (Math.random() - 0.5) * 0.4;
          p.size += 0.03;
          p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.size})`;
          p.el.style.opacity = Math.max(0, p.life * 0.55);
        }
      });

      // ── TIRE DUST (kicked up from wheels when moving fast) ──
      if (isMoving && speed > 4 && Math.random() > 0.6) {
        const dust = dustParticles[dustIdx];
        const facingRight = currentRotation < 90;
        const wheelOffset = facingRight ? -10 : 10; // Behind wheels
        dust.x = truckX + wheelOffset + (Math.random() - 0.5) * 8;
        dust.y = truckY + 12;
        // Dust flies backward and up slightly
        dust.vx = facingRight ? -0.8 - Math.random() * 0.8 : 0.8 + Math.random() * 0.8;
        dust.vy = -0.3 - Math.random() * 0.4;
        dust.life = 1;
        dust.el.style.transform = `translate(${dust.x}px, ${dust.y}px)`;
        dust.el.style.opacity = '0.5';
        dustIdx = (dustIdx + 1) % dustParticles.length;
      }

      // Animate dust particles (move with velocity, fade)
      dustParticles.forEach(function(d) {
        if (d.life > 0) {
          d.life -= 0.04;
          d.x += d.vx;
          d.y += d.vy;
          d.vy += 0.05; // Gravity pulls dust back down
          d.el.style.transform = `translate(${d.x}px, ${d.y}px)`;
          d.el.style.opacity = Math.max(0, d.life * 0.5);
        }
      });

      // ── CRASH DETECTION (when truck hits screen edges) ──
      const edgeThreshold = 8;
      const truckHalfWidth = 16;
      const truckHalfHeight = 11;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const now = Date.now();

      let crashX = -1, crashY = -1;

      if (truckX - truckHalfWidth < edgeThreshold && speed > 1.5) {
        crashX = 0; crashY = truckY;
      } else if (truckX + truckHalfWidth > winW - edgeThreshold && speed > 1.5) {
        crashX = winW; crashY = truckY;
      } else if (truckY - truckHalfHeight < edgeThreshold && speed > 1.5) {
        crashX = truckX; crashY = 0;
      } else if (truckY + truckHalfHeight > winH - edgeThreshold && speed > 1.5) {
        crashX = truckX; crashY = winH;
      }

      if (crashX >= 0 && (now - lastCrashTime > crashCooldown)) {
        lastCrashTime = now;
        triggerCrash(crashX, crashY);
      }

      // ── ANIMATE CRASH SPARKS ──
      crashSparks.forEach(function(s) {
        if (s.life > 0) {
          s.life -= 0.03;
          s.x += s.vx;
          s.y += s.vy;
          s.vy += 0.15; // Gravity pulls sparks down
          s.vx *= 0.97; // Air resistance
          s.el.style.transform = `translate(${s.x}px, ${s.y}px) scale(${0.5 + s.life * 0.5})`;
          s.el.style.opacity = Math.max(0, s.life);
        }
      });

      // ── ANIMATE IMPACT BURST ──
      if (burstLife > 0) {
        burstLife -= 0.045;
        const scale = 1.6 - burstLife * 0.6; // grows
        crashBurst.style.transform = `scale(${scale})`;
        crashBurst.style.opacity = Math.max(0, burstLife);
      }

      // ── ANIMATE BAM TEXT ──
      if (bamLife > 0) {
        bamLife -= 0.025;
        // Bam grows then shrinks, with slight rotation wiggle
        const scale = bamLife > 0.7 ? (1 - bamLife) * 4 + 0.4 : 1.2 + Math.sin(bamLife * 10) * 0.05;
        const rot = Math.sin(bamLife * 8) * 5;
        crashBam.style.transform = `translate(-50%, -50%) scale(${Math.min(scale, 1.4)}) rotate(${rot}deg)`;
        crashBam.style.opacity = Math.max(0, bamLife * 1.2);
      }

      requestAnimationFrame(animateCursor);
    }

    // ── TRIGGER CRASH EFFECT ──
    function triggerCrash(x, y) {
      // Spawn 16 sparks in all directions
      crashSparks.forEach(function(s, i) {
        const angle = (i / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = 3 + Math.random() * 4;
        s.x = x;
        s.y = y;
        s.vx = Math.cos(angle) * speed;
        s.vy = Math.sin(angle) * speed - 1.5; // slight upward boost
        s.life = 1;
        s.el.style.transform = `translate(${x}px, ${y}px) scale(1)`;
        s.el.style.opacity = '1';
      });

      // Impact burst circle
      burstLife = 1;
      crashBurst.style.left = x + 'px';
      crashBurst.style.top = y + 'px';
      crashBurst.style.transform = 'scale(0)';
      crashBurst.style.opacity = '0.9';

      // BAM text
      bamLife = 1;
      // Position BAM offset toward center of screen so it stays visible
      const offsetX = x < 50 ? 40 : (x > window.innerWidth - 50 ? -40 : 0);
      const offsetY = y < 50 ? 30 : (y > window.innerHeight - 50 ? -30 : 0);
      crashBam.style.left = (x + offsetX) + 'px';
      crashBam.style.top = (y + offsetY) + 'px';
      crashBam.style.transform = 'translate(-50%, -50%) scale(0)';
      crashBam.style.opacity = '0';
    }
    animateCursor();

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', function() {
      cursorTruck.style.opacity = '0';
      smokePuffs.forEach(function(p) { p.el.style.opacity = '0'; });
      dustParticles.forEach(function(d) { d.el.style.opacity = '0'; });
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
      document.querySelectorAll('.btn, .nav-links a').forEach(function(el) {
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

    // ───── 5. (scroll progress bar removed) ──────────────────
    // ───── 6. (back-to-top button removed) ───────────────────
    // ───── 7. SCROLL EVENTS ──────────────────────────────────

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

    // ───── 11. DISABLE CUSTOM CURSOR ON TOUCH DEVICES ────────
    if ('ontouchstart' in window) {
      cursorTruck.style.display = 'none';
      smokePuffs.forEach(function(p) { p.el.style.display = 'none'; });
      dustParticles.forEach(function(d) { d.el.style.display = 'none'; });
      crashSparks.forEach(function(s) { s.el.style.display = 'none'; });
      crashBurst.style.display = 'none';
      crashBam.style.display = 'none';
      document.body.style.cursor = '';
    }

  });

})();
