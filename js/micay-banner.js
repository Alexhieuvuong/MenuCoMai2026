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
    // 2-page timeline, stretched to fill the (now shorter) scrub so nothing sits
    // frozen: assemble (0 → 0.55) → promo→menu swap (0.30 → 0.52) → real-dish
    // reveal (0.55 → 0.88) → a brief settle before the pin releases (0.88 → 1).
    var cf       = clamp(1 - p / 0.40);
    var swap     = clamp((p - 0.30) / 0.22);
    var realfade = clamp((p - 0.55) / 0.33);
    var dishfade = 1 - realfade;

    // Offset the cross-fade so the promo and menu headlines don't both bloom at
    // half-opacity stacked on top of each other: the promo clears out first, then
    // the menu fades in (they only graze near-zero opacity at the midpoint).
    var pfade = 1 - clamp(swap / 0.55);
    var mfade = clamp((swap - 0.45) / 0.55);

    root.style.setProperty('--cfade',    cf);
    root.style.setProperty('--pfade',    pfade);
    root.style.setProperty('--mfade',    mfade);
    root.style.setProperty('--realfade', realfade);
    root.style.setProperty('--realout',  0);
    root.style.setProperty('--dishfade', dishfade);

    promoEl.style.pointerEvents = swap > 0.5 ? 'none' : 'auto';
    var darkOn = swap > 0.5;
    menuEl.style.pointerEvents = darkOn ? 'auto' : 'none';
    menuEl.setAttribute('aria-hidden', darkOn ? 'false' : 'true');

    var pm = clamp(p / 0.55);

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

    // the "Xem Chè" pill is only tappable once the Mì Cay menu has assembled in.
    if (cheBtn) cheBtn.style.pointerEvents = swap > 0.5 ? 'auto' : 'none';
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

  // Chè button (shown once the Mì Cay menu has assembled) → jump on to the Chè menu.
  // 'auto' overrides the global scroll-behavior:smooth.
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
