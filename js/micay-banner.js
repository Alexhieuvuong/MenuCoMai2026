/* Mì Cay banner — page-synced version.
   Same 2-page animation as the standalone banner, but progress is derived
   from how far the #best-seller .scroller has moved through the viewport,
   so it plays in sync with the main index page scroll instead of its own. */
(function () {
  var section  = document.getElementById('best-seller');
  if (!section) return;
  var scroller = section.querySelector('.scroller');
  var stage    = section.querySelector('#stage');
  var promoEl  = section.querySelector('.promo');
  var menuEl   = section.querySelector('.menu');
  var skipBtn  = section.querySelector('.skip-cue');
  var cheBtn   = section.querySelector('.skip-che');
  var root     = document.documentElement;
  if (!scroller || !stage) return;

  var splashEl    = section.querySelector('#splash');
  var splashFired = false;
  var dishSplashEl    = section.querySelector('#dish-splash');
  var dishSplashFired = false;

  var ings = Array.from(section.querySelectorAll('.ing')).map(function (el) {
    return {
      el: el,
      tx: parseFloat(el.dataset.tx)    || 0,
      ty: parseFloat(el.dataset.ty)    || 0,
      ts: parseFloat(el.dataset.ts)    || 1,
      tr: parseFloat(el.dataset.tr)    || 0,
      d:  parseFloat(el.dataset.delay) || 0
    };
  });

  function ease(t)  { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp(v) { return Math.max(0, Math.min(1, v)); }

  function fit() {
    var s = Math.min(window.innerWidth / 430, window.innerHeight / 932);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  function apply(p) {
    // 2-page timeline: assemble (0 → ~0.55) → dish reveal + mì cay menu (→ 1)
    var cf       = clamp(1 - p / 0.25);
    var swap     = clamp((p - 0.12) / 0.20);
    var realfade = clamp((p - 0.34) / 0.16);
    var dishfade = 1 - realfade;
    var cuefade  = 1 - clamp((p - 0.80) / 0.10);

    root.style.setProperty('--cfade',    cf);
    root.style.setProperty('--cuefade',  cuefade);
    root.style.setProperty('--pfade',    1 - swap);
    root.style.setProperty('--mfade',    swap);
    root.style.setProperty('--realfade', realfade);
    root.style.setProperty('--realout',  0);
    root.style.setProperty('--dishfade', dishfade);

    promoEl.style.pointerEvents = swap > 0.5 ? 'none' : 'auto';
    var darkOn = swap > 0.5;
    menuEl.style.pointerEvents = darkOn ? 'auto' : 'none';
    menuEl.setAttribute('aria-hidden', darkOn ? 'false' : 'true');

    var pm = clamp(p / 0.34);

    if (pm >= 0.93 && !splashFired) {
      splashFired = true;
      splashEl.classList.remove('splash--active');
      void splashEl.offsetWidth;
      splashEl.classList.add('splash--active');
    }
    if (pm < 0.93) {
      splashFired = false;
      splashEl.classList.remove('splash--active');
    }

    if (realfade >= 0.5 && !dishSplashFired) {
      dishSplashFired = true;
      dishSplashEl.classList.remove('dish-splash--active');
      void dishSplashEl.offsetWidth;
      dishSplashEl.classList.add('dish-splash--active');
    }
    if (realfade < 0.5) {
      dishSplashFired = false;
      dishSplashEl.classList.remove('dish-splash--active');
    }

    ings.forEach(function (o) {
      var lp = o.d >= 1 ? 0 : clamp((pm - o.d) / (1 - o.d));
      var e  = ease(lp);
      var sc = 1 + (o.ts - 1) * e;
      o.el.style.transform =
        'translate(' + (o.tx * e) + 'px,' + (o.ty * e) + 'px)' +
        ' scale(' + sc + ')' +
        ' rotate(' + (o.tr * e) + 'deg)';
      var isRamen = o.el.classList.contains('ing-ramen');
      o.el.style.opacity = isRamen ? dishfade : Math.max(0, 1 - e) * dishfade;
    });

    // cross-fade the two pills at the end of the banner: the Mì Cay button hands
    // off to the Chè button, and only the visible one is tappable.
    if (skipBtn) skipBtn.style.pointerEvents = cuefade < 0.5 ? 'none' : 'auto';
    if (cheBtn)  cheBtn.style.pointerEvents  = cuefade < 0.5 ? 'auto' : 'none';
  }

  function onScroll() {
    // progress = distance scrolled past the top of the scroller,
    // over the scroller's pinnable length (its height minus one viewport).
    var rect  = scroller.getBoundingClientRect();
    var total = scroller.offsetHeight - window.innerHeight;
    var p = clamp(total > 0 ? (-rect.top) / total : 0);
    apply(p);
  }

  // rAF-throttle scroll: run the scrub at most once per frame to avoid thrashing.
  var ticking = false;
  function requestTick() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; onScroll(); });
  }

  // Skip button → jump to the end of the banner scrub (the Mì Cay menu page).
  // 'auto' overrides the global scroll-behavior:smooth so we don't fast-replay
  // the whole animation over the jump.
  if (skipBtn) {
    skipBtn.addEventListener('click', function () {
      var r = scroller.getBoundingClientRect();
      var y = window.scrollY + r.top + (scroller.offsetHeight - window.innerHeight);
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  }

  // Chè button (shown at the end of the banner) → jump on to the Chè menu.
  if (cheBtn) {
    cheBtn.addEventListener('click', function () {
      var che = document.getElementById('che');
      if (che) che.scrollIntoView({ behavior: 'auto' });
    });
  }

  window.addEventListener('resize', function () { fit(); onScroll(); });
  window.addEventListener('scroll', requestTick, { passive: true });
  fit();
  onScroll();
})();
