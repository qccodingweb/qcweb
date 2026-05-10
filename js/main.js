(function () {
  'use strict';

  var IS_TOUCH = window.matchMedia('(hover: none)').matches;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  gsap.registerPlugin(ScrollTrigger);

  // ═══ LENIS ═══
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

  // ═══ PRELOADER ═══
  function initPreloader() {
    var el = document.querySelector('.preloader');
    if (!el) { animateHero(); return; }
    if (REDUCED) { el.remove(); animateHero(); return; }

    if (sessionStorage.getItem('qc-loaded')) {
      el.remove();
      animateHero();
      return;
    }
    sessionStorage.setItem('qc-loaded', '1');
    if (lenis) lenis.stop();

    var tl = gsap.timeline({
      onComplete: function () { el.remove(); if (lenis) lenis.start(); },
    });

    tl.to('.preloader-progress', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
      .to('.preloader', { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, '+=0.12')
      .add(animateHero, '-=0.4');
  }

  // ═══ CURSOR ═══
  function initCursor() {
    if (IS_TOUCH) return;
    var dot = document.querySelector('.cursor-dot');
    var ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    var mx = -100, my = -100;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      gsap.set(dot, { x: mx, y: my });
    }, { passive: true });

    gsap.ticker.add(function () {
      gsap.to(ring, { x: mx, y: my, duration: 0.15, ease: 'power2.out', overwrite: true });
    });

    var targets = 'a, button, .card, .tier, .pillar, .client-type, .product-panel, input, textarea, select';
    document.querySelectorAll(targets).forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); dot.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); dot.classList.remove('hover'); });
    });

    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  // ═══ HERO ENTRANCE ═══
  function animateHero() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    if (REDUCED) {
      gsap.set(['.hero .label', '.hero h1 > span', '.hero p', '.hero .btn-group', '.marquee'], {
        opacity: 1, y: 0,
      });
      return;
    }

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero .label', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo('.hero h1 > span', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.15, ease: 'power4.out' }, '-=0.4')
      .fromTo('.hero p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
      .fromTo('.hero .btn-group', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
      .fromTo('.marquee', { opacity: 0 }, { opacity: 1, duration: 0.8 }, '-=0.3');
  }

  // ═══ SCROLL REVEALS ═══
  function initScrollAnimations() {
    if (REDUCED) {
      gsap.set('.reveal, .reveal-left, .reveal-scale', { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    ScrollTrigger.batch('.reveal', {
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power3.out', overwrite: true }
        );
      },
      start: 'top 88%',
      once: true,
    });

    gsap.utils.toArray('.reveal-left').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, x: -60 },
        { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      );
    });

    gsap.utils.toArray('.reveal-scale').forEach(function (el) {
      gsap.fromTo(el,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } }
      );
    });

    // Hero parallax
    gsap.to('.hero-glow-1', { y: -120, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-glow-2', { y: -80, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero-content', { y: 100, opacity: 0.3, scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

    // Comparison rows
    gsap.utils.toArray('.comparison-row').forEach(function (row, i) {
      gsap.fromTo(row,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } }
      );
    });
  }

  // ═══ TEXT SPLITS ═══
  var splitTriggers = [];

  function splitWords(el) {
    var text = el.textContent.trim();
    if (!text) return [];
    el.innerHTML = text.split(/\s+/).map(function (w) {
      return '<span class="word-wrap"><span class="word">' + w + '</span></span>';
    }).join(' ');
    return el.querySelectorAll('.word');
  }

  function initTextSplits() {
    if (REDUCED) return;
    splitTriggers.forEach(function (st) { if (st.kill) st.kill(); });
    splitTriggers = [];

    document.querySelectorAll('.section-header h2').forEach(function (el) {
      var words = splitWords(el);
      if (!words.length) return;

      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        gsap.set(words, { y: '0%', rotateX: 0, opacity: 1 });
        return;
      }

      var st = ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function () {
          gsap.fromTo(words,
            { y: '110%', rotateX: -80, opacity: 0 },
            { y: '0%', rotateX: 0, opacity: 1, duration: 0.9, stagger: 0.04, ease: 'power3.out' }
          );
        },
      });
      splitTriggers.push(st);
    });
  }

  // ═══ HORIZONTAL SCROLL ═══
  function initHorizontalScroll() {
    var section = document.querySelector('.products-horizontal');
    if (!section || REDUCED) return;
    var track = section.querySelector('.products-track');
    if (!track) return;

    function animateProductContents(containerAnim) {
      gsap.utils.toArray('.product-content').forEach(function (content) {
        var stOpts = { trigger: content, start: 'top 85%', once: true };
        if (containerAnim) {
          stOpts = { trigger: content, containerAnimation: containerAnim, start: 'left 80%', once: true };
        }
        gsap.fromTo(content.children,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', scrollTrigger: stOpts }
        );
      });
    }

    ScrollTrigger.matchMedia({
      '(min-width: 769px)': function () {
        var scrollTween = gsap.to(track, {
          x: function () { return -(track.scrollWidth - window.innerWidth); },
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            pin: true,
            scrub: 1,
            end: function () { return '+=' + (track.scrollWidth - window.innerWidth); },
            invalidateOnRefresh: true,
          },
        });
        animateProductContents(scrollTween);
      },
      '(max-width: 768px)': function () {
        animateProductContents(null);
      },
    });
  }

  // ═══ NAVIGATION ═══
  function initNav() {
    var nav = document.querySelector('.nav');
    var hamburger = document.querySelector('.hamburger');
    var navLinks = document.querySelector('.nav-links');
    var overlay = document.querySelector('.mobile-overlay');

    var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 50); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (hamburger) {
      var toggle = function (open) {
        hamburger.classList.toggle('open', open);
        navLinks.classList.toggle('open', open);
        overlay.classList.toggle('active', open);
        document.body.style.overflow = open ? 'hidden' : '';
        if (lenis) { open ? lenis.stop() : lenis.start(); }
      };
      hamburger.addEventListener('click', function () { toggle(!navLinks.classList.contains('open')); });
      overlay.addEventListener('click', function () { toggle(false); });
      navLinks.querySelectorAll('a').forEach(function (l) { l.addEventListener('click', function () { toggle(false); }); });
    }
  }

  // ═══ CARD EFFECTS ═══
  function initCardEffects() {
    document.querySelectorAll('.card, .tier, .pillar, .stat').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });

    if (!IS_TOUCH) {
      document.querySelectorAll('[data-tilt]').forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: x * 10, rotateX: -y * 10, transformPerspective: 800, duration: 0.5, ease: 'power2.out' });
        });
        card.addEventListener('mouseleave', function () {
          gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
        });
      });
    }
  }

  // ═══ COUNTERS ═══
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: function () {
          var target = el.getAttribute('data-count');
          var num = parseFloat(target);
          if (isNaN(num)) { el.textContent = target; return; }
          var suffix = el.getAttribute('data-suffix') || '';
          var prefix = el.getAttribute('data-prefix') || '';
          gsap.to({ v: 0 }, {
            v: num, duration: 2, ease: 'power2.out',
            onUpdate: function () { el.textContent = prefix + Math.round(this.targets()[0].v) + suffix; },
          });
        },
      });
    });
  }

  // ═══ LANG CHANGE ═══
  document.addEventListener('langchange', function () {
    setTimeout(initTextSplits, 60);
  });

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initCursor();
    initNav();
    initScrollAnimations();
    initTextSplits();
    initHorizontalScroll();
    initCardEffects();
    initCounters();
  });
})();
