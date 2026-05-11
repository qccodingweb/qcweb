(function () {
  'use strict';

  var IS_TOUCH = window.matchMedia('(hover: none)').matches;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    if (window._lenis) window._lenis.stop();

    var tl = gsap.timeline({
      onComplete: function () { el.remove(); if (window._lenis) window._lenis.start(); }
    });
    tl.to('.preloader-progress', { scaleX: 1, duration: 0.9, ease: 'power2.inOut' })
      .to('.preloader', { yPercent: -100, duration: 0.7, ease: 'power4.inOut' }, '+=0.12')
      .add(animateHero, '-=0.4');
  }

  // ═══ PARTICLE CANVAS ═══
  function initParticles() {
    if (REDUCED) return;
    var canvas = document.querySelector('.page-hero-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var W, H, particles;
    var mouse = { x: -9999, y: -9999 };
    var COUNT = window.innerWidth < 768 ? 35 : 70;
    var LINK_DIST = 140;
    var MOUSE_R = 180;
    var COLOR = [20, 232, 156];

    function resize() {
      W = canvas.width = canvas.parentElement.offsetWidth;
      H = canvas.height = canvas.parentElement.offsetHeight;
    }
    function seed() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.8 + 0.8,
        });
      }
    }
    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var dx = mouse.x - p.x;
        var dy = mouse.y - p.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_R) {
          var f = (MOUSE_R - d) / MOUSE_R;
          p.vx -= (dx / d) * f * 0.015;
          p.vy -= (dy / d) * f * 0.015;
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.995; p.vy *= 0.995;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        p.x = Math.max(0, Math.min(W, p.x));
        p.y = Math.max(0, Math.min(H, p.y));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + COLOR[0] + ',' + COLOR[1] + ',' + COLOR[2] + ',0.45)';
        ctx.fill();
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var lx = p.x - q.x, ly = p.y - q.y;
          var ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < LINK_DIST) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = 'rgba(' + COLOR[0] + ',' + COLOR[1] + ',' + COLOR[2] + ',' + ((1 - ld / LINK_DIST) * 0.12) + ')';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(loop);
    }
    canvas.parentElement.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }, { passive: true });
    canvas.parentElement.addEventListener('mouseleave', function () {
      mouse.x = -9999; mouse.y = -9999;
    });
    resize(); seed(); loop();
    window.addEventListener('resize', function () { resize(); seed(); });
  }

  // ═══ HERO ENTRANCE ═══
  function animateHero() {
    var hero = document.querySelector('.page-hero');
    if (!hero) return;
    if (REDUCED) {
      gsap.set('.page-hero-content .label-mint, .page-hero-content h1, .page-hero-content p', { opacity: 1, y: 0 });
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.page-hero-content .label-mint', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
      .fromTo('.page-hero-content h1', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'power4.out' }, '-=0.4')
      .fromTo('.page-hero-content p', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5');
  }

  // ═══ SCROLL REVEALS ═══
  function initScrollReveal() {
    if (REDUCED) {
      gsap.set('.reveal, .reveal-left', { opacity: 1, y: 0, x: 0 });
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
  }

  // ═══ CARD EFFECTS ═══
  function initCardEffects() {
    document.querySelectorAll('.card, .tier, .pillar, .client-type').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width) * 100 + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height) * 100 + '%');
      });
    });
  }

  // ═══ GRADIENT MESH PARALLAX ═══
  function initMeshParallax() {
    if (REDUCED) return;
    gsap.to('.gradient-mesh', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'bottom bottom', scrub: true }
    });
  }

  // ═══ INIT ═══
  document.addEventListener('DOMContentLoaded', function () {
    initPreloader();
    initParticles();
    initScrollReveal();
    initCardEffects();
    initMeshParallax();
  });
})();
