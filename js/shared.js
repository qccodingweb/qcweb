(function () {
  'use strict';

  var IS_TOUCH = window.matchMedia('(hover: none)').matches;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  // ═══ LENIS SMOOTH SCROLL ═══
  var lenis;
  if (!REDUCED) {
    lenis = new Lenis({
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  window._lenis = lenis;

  // ═══ CUSTOM CURSOR ═══
  function initCursor() {
    if (IS_TOUCH) return;
    var cursor = document.querySelector('.cursor');
    var cursorDot = document.querySelector('.cursor-dot');
    if (!cursor || !cursorDot) return;

    var cx = 0, cy = 0, dx = 0, dy = 0, mx = 0, my = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
    }, { passive: true });

    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      dx += (mx - dx) * 0.5;
      dy += (my - dy) * 0.5;
      cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
      cursorDot.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll('[data-cursor="hover"], a, button, .card, .tier, .pillar, .client-type, input, textarea, select').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('hover'); });
    });
  }

  // ═══ MAGNETIC ELEMENTS ═══
  function initMagnetic() {
    if (IS_TOUCH) return;
    document.querySelectorAll('.magnetic').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ═══ NAV SCROLL STATE ═══
  function initNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    ScrollTrigger.create({
      start: 80,
      end: 99999,
      onUpdate: function (self) {
        nav.classList.toggle('scrolled', self.scroll() > 60);
      }
    });

    // Hamburger
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links-desktop');
    var overlay = document.querySelector('.mobile-overlay');
    if (!hamburger || !navLinks) return;

    function toggle(open) {
      hamburger.classList.toggle('open', open);
      navLinks.classList.toggle('open', open);
      if (overlay) overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    }

    hamburger.addEventListener('click', function () {
      toggle(!navLinks.classList.contains('open'));
    });
    if (overlay) overlay.addEventListener('click', function () { toggle(false); });
    navLinks.querySelectorAll('a').forEach(function (l) {
      l.addEventListener('click', function () { toggle(false); });
    });
  }

  // ═══ FADE-UP REVEALS ═══
  function initFadeUp() {
    if (REDUCED) {
      gsap.set('.fade-up', { opacity: 1, y: 0 });
      return;
    }
    gsap.utils.toArray('.fade-up').forEach(function (el) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        }
      });
    });
  }

  // ═══ COUNTERS ═══
  function initCounters() {
    gsap.utils.toArray('.counter').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          var target = parseFloat(el.dataset.target || el.dataset.count);
          if (isNaN(target)) return;
          var format = el.dataset.format || 'number';
          var decimals = format === 'decimal' ? 1 : 0;
          var suffix = el.dataset.suffix || '';
          var prefix = el.dataset.prefix || '';
          var obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 2,
            ease: 'power3.out',
            onUpdate: function () {
              el.textContent = prefix + obj.val.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              }) + suffix;
            }
          });
        }
      });
    });
  }

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initMagnetic();
    initNav();
    initFadeUp();
    initCounters();
  });
})();
