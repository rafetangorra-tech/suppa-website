/* ------------------------------------------------------------------ *
   SUPPA — scroll engine
   Modeled on the blanc site: Lenis smooth scroll wired into GSAP,
   pinned scrub sections, melt curtains with grown drip edges,
   living-portrait video layers that play only in view.
 * ------------------------------------------------------------------ */

(function () {
  document.getElementById('year').textContent = new Date().getFullYear();

  var root = document.documentElement;
  root.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || typeof gsap === 'undefined') return; // static site still works

  gsap.registerPlugin(ScrollTrigger);

  /* ---- Smooth scroll (Lenis) wired into GSAP's ticker ---- */
  var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.2 });
    });
  });

  /* ---- Drip edges: grown, not stamped (port of blanc's DripEdge) ----
     Seeded PRNG so every curtain's liquid is unique but stable. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function dripSVG(color, seed) {
    var rnd = mulberry32(seed * 9301 + 49297);
    var R = function (min, max) { return min + rnd() * (max - min); };
    var W = 1440, H = 140;
    var x = 0, y = R(12, 24);
    var d = 'M0 0 L0 ' + y.toFixed(1);
    var droplets = '';

    while (x < W - 70) {
      var gap = R(40, 125);
      var nx = Math.min(x + gap, W);
      var ny = R(11, 26);
      d += ' C' + (x + gap * 0.33).toFixed(0) + ' ' + (y + R(-7, 7)).toFixed(1) +
           ' ' + (nx - gap * 0.33).toFixed(0) + ' ' + (ny + R(-7, 7)).toFixed(1) +
           ' ' + nx.toFixed(0) + ' ' + ny.toFixed(1);
      x = nx; y = ny;
      if (x >= W - 70) break;

      var streak = rnd() < 0.25;
      var neck = streak ? R(3, 5.5) : R(5.5, 10);
      var bulb = streak ? neck + R(1, 3) : neck + R(4, 10);
      var len = Math.min(streak ? R(70, 122) : R(22, 78), 126 - y);
      var cx = x + neck + R(-3, 3);
      var tipY = y + len;
      var skew = R(-6, 6);

      d += ' C' + (cx - neck * 0.8).toFixed(1) + ' ' + (y + len * 0.45).toFixed(1) +
           ' ' + (cx - bulb + skew * 0.5).toFixed(1) + ' ' + (tipY - len * 0.14).toFixed(1) +
           ' ' + (cx + skew).toFixed(1) + ' ' + tipY.toFixed(1);
      d += ' C' + (cx + bulb + skew * 0.5).toFixed(1) + ' ' + (tipY - len * 0.14).toFixed(1) +
           ' ' + (cx + neck * 0.8).toFixed(1) + ' ' + (y + len * 0.45).toFixed(1) +
           ' ' + (cx + neck).toFixed(1) + ' ' + y.toFixed(1);

      if (rnd() < 0.35) {
        var dy = tipY + R(9, 24);
        var r = R(2.5, 5.5);
        if (dy < H - 5) {
          droplets += '<ellipse cx="' + (cx + skew + R(-2, 2)).toFixed(1) +
            '" cy="' + dy.toFixed(1) + '" rx="' + r.toFixed(1) +
            '" ry="' + (r * 1.35).toFixed(1) + '" fill="' + color + '"/>';
        }
      }
      x = cx + neck;
    }
    d += ' C' + (x + (W - x) * 0.4).toFixed(0) + ' ' + (y + R(-6, 6)).toFixed(1) +
         ' ' + (W - 30).toFixed(0) + ' ' + R(12, 22).toFixed(1) +
         ' ' + W + ' ' + R(14, 22).toFixed(1) + ' L' + W + ' 0 Z';

    return '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' +
      '<path fill="' + color + '" d="' + d + '"></path>' + droplets + '</svg>';
  }

  document.querySelectorAll('.melt-curtain').forEach(function (c) {
    var color = c.dataset.dripColor || '#0b0b0d';
    var seed = parseInt(c.dataset.dripSeed || '1', 10);
    c.style.background = color;
    c.insertAdjacentHTML('beforeend', dripSVG(color, seed));
    c.style.display = 'block'; // curtains exist only when the engine drives
  });

  /* ---- Intro: load reveal, then the pinned signature moment ---- */
  gsap.set('.reveal', { y: 32 });

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .to('#intro .reveal', { opacity: 1, y: 0, duration: 1, stagger: 0.15 }, 0.2)
    .fromTo('.intro__art', { opacity: 0, scale: 0.94 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' }, 0.35);

  /* Pin the intro: the wordmark spreads and fades behind the living cover,
     the cover breathes forward. Registered FIRST — pinned triggers must be
     created in document order or the sections below get stale scroll math. */
  gsap.timeline({
    scrollTrigger: {
      trigger: '#intro',
      start: 'top top',
      end: '+=120%',
      pin: true,
      scrub: true,
      anticipatePin: 1,
    },
  })
    .to('#wordmark span', { letterSpacing: '0.34em', opacity: 0.1, ease: 'none' }, 0)
    .to('.intro__art', { scale: 1.06, yPercent: -4, ease: 'none' }, 0)
    /* fromTo + immediateRender:false — these elements are also load-revealed,
       and a plain .to would capture their pre-reveal opacity (0) as the start */
    .fromTo('.intro__eyebrow, .intro__tagline, .scroll-cue',
      { opacity: 1 }, { opacity: 0, ease: 'none', immediateRender: false }, 0);

  /* ---- The single: pinned mix-in. Forward builds the mix, backward
     strips it — the scrollbar is the fader. ---- */
  var single = document.querySelector('#single');
  var sCurtain = single.querySelector('.melt-curtain');
  var sLabel = single.querySelector('[data-wtext="label"]');
  var sTitle = single.querySelector('[data-wtext="title"]');
  var sBlurb = single.querySelector('[data-wtext="blurb"]');
  var sCta = single.querySelector('[data-wtext="cta"]');
  var sEmbed = single.querySelector('[data-wtext="embed"]');

  var stl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: '#single',
      start: 'top top',
      end: '+=140%',
      pin: true,
      scrub: 0.4,
      anticipatePin: 1,
    },
  });

  // Act 1 — the intro's black melts down and away, drips trailing
  stl.to(sCurtain, { yPercent: 130, duration: 0.2, ease: 'none' }, 0);
  // Act 2 — the mix builds channel by channel
  stl.fromTo(sLabel, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.1 }, 0.2);
  stl.fromTo(sTitle, { opacity: 0, y: 70, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.18 }, 0.24);
  stl.fromTo(sBlurb, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.14 }, 0.32);
  stl.fromTo(sCta, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.14 }, 0.4);
  stl.fromTo(sEmbed, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.14 }, 0.46);
  // spacer — the rest of the pin is pure spin
  stl.to({ v: 0 }, { v: 1, duration: 0.4, ease: 'none' }, 0.6);

  /* ---- Unpinned melt curtains: photos + booking melt in as they arrive.
     The last section can run out of scroll before its top nears the viewport
     top, which would strand its curtain mid-melt — so booking's melt ends at
     the page's maximum scroll instead of a trigger position. ---- */
  [
    { sel: '#photos', start: 'top 60%', end: 'top 2%' },
    { sel: '#booking', start: 'top 85%', end: function () { return ScrollTrigger.maxScroll(window); } },
  ].forEach(function (o) {
    var c = document.querySelector(o.sel + ' .melt-curtain');
    if (!c) return;
    gsap.to(c, {
      yPercent: 130,
      ease: 'none',
      scrollTrigger: { trigger: o.sel, start: o.start, end: o.end, scrub: 0.4 },
    });
  });

  /* ---- Living portraits: drained + oversized on arrival, flood to color ---- */
  gsap.utils.toArray('.portrait').forEach(function (p) {
    gsap.fromTo(p,
      { scale: 1.08, filter: 'grayscale(1) contrast(0.92) brightness(1.05)' },
      {
        scale: 1,
        filter: 'grayscale(0) contrast(1) brightness(1)',
        ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 92%', end: 'top 34%', scrub: 0.5 },
      });
  });

  /* ---- Parallax layers ---- */
  gsap.utils.toArray('[data-speed]').forEach(function (layer) {
    var speed = parseFloat(layer.dataset.speed || '1');
    gsap.to(layer, {
      yPercent: -10 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: layer.closest('section, footer'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  /* ---- Section reveals — reversible ---- */
  ['#writtenby', '#photos', '#about', '#booking'].forEach(function (sel) {
    gsap.to(sel + ' .reveal', {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: sel, start: 'top 72%', toggleActions: 'play none none reverse' },
    });
  });

  /* ---- Nav dots ---- */
  ['single', 'photos', 'about'].forEach(function (id) {
    var dot = document.querySelector('[data-dot="' + id + '"] .dot');
    if (!dot) return;
    ScrollTrigger.create({
      trigger: '#' + id,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: function (self) { dot.classList.toggle('is-active', self.isActive); },
    });
  });

  /* ---- Scroll progress ---- */
  gsap.to('#progress', {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: true },
  });

  /* ---- Lazy living media: load as it approaches, play only in view.
     If a video file is missing the poster still stands — the page never
     depends on the living layer. ---- */
  var livingVids = document.querySelectorAll('[data-living] .living');
  if (livingVids.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (!v.src && v.dataset.src) {
            v.src = v.dataset.src;
            v.preload = 'auto';
            v.load();
            v.addEventListener('error', function () { v.remove(); }, { once: true });
            v.addEventListener('playing', function () { v.classList.add('is-playing'); });
          }
          v.play().catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { rootMargin: '600px' });
    livingVids.forEach(function (v) { io.observe(v); });
  }

  /* Recalculate once fonts/layout settle */
  requestAnimationFrame(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
