/* ========== LOADER ========== */
window.addEventListener('load', function () {
  var loader = document.getElementById('loader');
  if (!loader) { initIntro(); return; }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    loader.remove();
    initIntro();
    return;
  }

  if (sessionStorage.getItem('qc-loaded')) {
    loader.remove();
    initIntro();
    return;
  }
  sessionStorage.setItem('qc-loaded', '1');
  if (window._lenis) window._lenis.stop();

  var bar = document.querySelector('.loader-bar');
  bar.innerHTML = '<div style="position:absolute; inset:0; background: #14e89c; transform-origin:left; transform:scaleX(0);" id="bar-fill"></div>';

  var tl = gsap.timeline({
    onComplete: function () {
      loader.style.display = 'none';
      if (window._lenis) window._lenis.start();
      initIntro();
    }
  });

  tl.to('.loader-text span', { y: 0, duration: 0.9, ease: 'power3.out' })
    .to('#bar-fill', { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, 0.3)
    .to({}, { duration: 0.6 })
    .to('.loader', { yPercent: -100, duration: 1, ease: 'power3.inOut' });
});

/* ========== HERO TEXT REVEAL ========== */
function initIntro() {
  gsap.fromTo('.hero-content .label-mint',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.1 }
  );
  gsap.to('.hero-headline .char', {
    y: '0%',
    duration: 1.1,
    stagger: 0.018,
    ease: 'power4.out',
    delay: 0.3,
  });
  gsap.to('#hero-bottom', {
    opacity: 1, y: 0,
    duration: 1, delay: 1.5, ease: 'power3.out'
  });
}

/* ========== DUBAI TIME (removed) ========== */

/* ========== MANIFESTO PINNED REVEAL ========== */
document.addEventListener('DOMContentLoaded', function () {
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (REDUCED) return;

  // Active manifesto based on language
  function getActiveManifesto() {
    var lang = (typeof currentLang !== 'undefined') ? currentLang : 'en';
    var el = document.querySelector('.manifesto-text[data-lang="' + lang + '"]');
    if (!el) el = document.querySelector('.manifesto-text');
    return el;
  }

  function showActiveManifesto() {
    document.querySelectorAll('.manifesto-text').forEach(function (el) {
      el.style.display = 'none';
    });
    var active = getActiveManifesto();
    if (active) active.style.display = '';
  }
  showActiveManifesto();
  document.addEventListener('langchange', showActiveManifesto);

  var manifestoWords = gsap.utils.toArray('.manifesto-word');
  ScrollTrigger.create({
    trigger: '.manifesto-pin',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.manifesto-stage',
    scrub: 0.5,
    onUpdate: function (self) {
      var progress = self.progress;
      // Get all visible words
      var visibleWords = [];
      manifestoWords.forEach(function (w) {
        if (w.offsetParent !== null) visibleWords.push(w);
      });
      var total = visibleWords.length;
      var activeIndex = Math.floor(progress * total * 1.2);
      visibleWords.forEach(function (w, i) {
        if (i <= activeIndex) {
          w.classList.add('active');
        } else {
          w.classList.remove('active');
        }
      });
    }
  });

  /* ========== PRODUCTS HORIZONTAL SCROLL ========== */
  var track = document.getElementById('products-track');
  if (track) {
    var panelCount = 3;
    ScrollTrigger.create({
      trigger: '.products-pin',
      start: 'top top',
      end: 'bottom bottom',
      pin: '.products-stage',
      scrub: 0.7,
      onUpdate: function (self) {
        var x = -self.progress * (panelCount - 1) * 100;
        track.style.transform = 'translateX(' + x + 'vw)';
      }
    });
  }

  /* ========== BLUEPRINT SVG ANIMATION ========== */
  ScrollTrigger.create({
    trigger: '.products-pin',
    start: 'top center',
    onEnter: function () {
      gsap.to('.b-line', {
        strokeDashoffset: 0,
        duration: 2,
        stagger: 0.1,
        ease: 'power2.inOut'
      });
      gsap.to('.b-dot', {
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        delay: 1.2
      });
    }
  });

  /* ========== DASHBOARD TICKING ========== */
  var marketsData = [
    { code: 'DE', name: 'Germany', value: 218450, fill: 92, trend: '+8.4%' },
    { code: 'FR', name: 'France', value: 184320, fill: 78, trend: '+6.1%' },
    { code: 'IT', name: 'Italy', value: 156780, fill: 67, trend: '+4.2%' },
    { code: 'ES', name: 'Spain', value: 142180, fill: 60, trend: '+11.8%' },
    { code: 'NL', name: 'Netherlands', value: 98420, fill: 42, trend: '+3.7%' },
  ];

  var marketsContainer = document.getElementById('markets-container');
  if (marketsContainer) {
    marketsData.forEach(function (m) {
      var row = document.createElement('div');
      row.className = 'market-row';
      row.innerHTML =
        '<div class="market-flag">' + m.code + '</div>' +
        '<div class="market-bar"><div class="market-bar-fill" style="right: 100%" data-fill="' + m.fill + '"></div></div>' +
        '<div class="market-value">€<span class="m-val" data-base="' + m.value + '">' + m.value.toLocaleString() + '</span></div>' +
        '<div class="market-trend">' + m.trend + '</div>';
      marketsContainer.appendChild(row);
    });

    ScrollTrigger.create({
      trigger: '.dashboard',
      start: 'top 75%',
      onEnter: function () {
        document.querySelectorAll('.market-bar-fill').forEach(function (bar, i) {
          var fill = parseInt(bar.dataset.fill);
          gsap.to(bar, {
            right: (100 - fill) + '%',
            duration: 1.5,
            delay: i * 0.1,
            ease: 'power3.out'
          });
        });
      },
      once: true
    });

    setInterval(function () {
      document.querySelectorAll('.m-val').forEach(function (el) {
        var base = parseInt(el.dataset.base);
        var variance = base * 0.001;
        var newVal = Math.floor(base + (Math.random() - 0.4) * variance);
        el.dataset.base = newVal;
        el.textContent = newVal.toLocaleString();
      });
      var syncEl = document.getElementById('last-sync');
      if (syncEl) syncEl.textContent = Math.floor(Math.random() * 4 + 1) + 's ago';
    }, 2400);
  }

  /* ========== SPARKLINES ========== */
  function generateSparkline(id, points) {
    points = points || 20;
    var el = document.getElementById(id);
    if (!el) return;
    var data = [];
    var v = 0.5;
    for (var i = 0; i < points; i++) {
      v += (Math.random() - 0.45) * 0.18;
      v = Math.max(0.1, Math.min(0.9, v));
      data.push(v);
    }
    var w = 200, h = 40;
    var path = '';
    data.forEach(function (d, i) {
      var x = (i / (points - 1)) * w;
      var y = h - d * h;
      path += (i === 0 ? 'M' : 'L') + x + ',' + y + ' ';
    });
    el.setAttribute('d', path);
    if (id === 'spark-1') {
      var fillEl = document.getElementById('spark-1-fill');
      if (fillEl) fillEl.setAttribute('d', path + ' L' + w + ',' + h + ' L0,' + h + ' Z');
    }
  }
  generateSparkline('spark-1');
  generateSparkline('spark-2');
  generateSparkline('spark-3');

  /* ========== CRESCENDO SCALE ========== */
  ScrollTrigger.create({
    trigger: '.crescendo-pin',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.crescendo-stage',
    scrub: 1,
    onUpdate: function (self) {
      var p = self.progress;
      var scale = 1 + p * 6;
      var cresc = document.getElementById('crescendo');
      if (cresc) {
        cresc.style.transform = 'scale(' + scale + ')';
        cresc.style.opacity = 1 - p * 0.3;
      }
    }
  });

  /* ========== RULES NUMBERS PARALLAX ========== */
  gsap.utils.toArray('.rule-num').forEach(function (el) {
    gsap.fromTo(el,
      { yPercent: 30, opacity: 0 },
      {
        yPercent: -30,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );
  });

  /* ========== COMPARISON ROW ANIMATION ========== */
  gsap.utils.toArray('.comparison-row').forEach(function (row, i) {
    gsap.fromTo(row,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, delay: i * 0.08, ease: 'power2.out', scrollTrigger: { trigger: row, start: 'top 90%', once: true } }
    );
  });

  /* ========== GRADIENT MESH PARALLAX ========== */
  gsap.to('.gradient-mesh', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      start: 'top top',
      end: 'bottom bottom',
      scrub: true
    }
  });
});
