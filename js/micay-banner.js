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

  // "Small" viewport height (the height with the mobile browser toolbar showing).
  // It stays put while the toolbar shows/hides during scroll — unlike innerHeight,
  // which grows as the toolbar collapses and used to make the whole banner jump in
  // size mid-scroll. Falls back to innerHeight where 100svh isn't supported.
  function smallVH() {
    if (window.CSS && CSS.supports && CSS.supports('height', '100svh')) {
      var probe = document.createElement('div');
      probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none';
      document.body.appendChild(probe);
      var h = probe.getBoundingClientRect().height;
      document.body.removeChild(probe);
      if (h > 0) return h;
    }
    return window.innerHeight;
  }

  var stageH = smallVH();
  function fit() {
    // Contain the 430×932 design canvas in the *stable* small viewport, so the
    // banner holds one consistent size per device instead of rescaling as the
    // toolbar moves. The pin's gradient is full-bleed behind it either way.
    var s = Math.min(window.innerWidth / 430, stageH / 932);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }

  function apply(p) {
    // 2-page timeline: a quick page-1 assembly that hands off to the finished
    // page-2 (Mì Cay menu + dish) early, which then holds so it can be read and the
    // "Xem Chè" escape used. assemble (0 → 0.40) → promo→menu swap (0.20 → 0.38) →
    // real-dish reveal (0.40 → 0.60) → page 2 holds (0.60 → 1).
    var cf       = clamp(1 - p / 0.25);
    var swap     = clamp((p - 0.20) / 0.18);
    var realfade = clamp((p - 0.40) / 0.20);
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

    var pm = clamp(p / 0.40);

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

    // "Xem Chè" is a page-2 control: only tappable once the Mì Cay menu is in,
    // so a page-1 tap (where the pill is invisible) can't jump away by accident.
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

  // "Xem Chè" pill — now an always-available escape: a customer who came for the
  // Chè menu (not Mì Cay) can tap out from the very first frame instead of being
  // pinned through the whole assembly. 'auto' overrides scroll-behavior:smooth.
  if (cheBtn) {
    cheBtn.addEventListener('click', function () {
      var che = document.getElementById('che');
      if (che) che.scrollIntoView({ behavior: 'auto' });
    });
  }

  // Only re-probe the stable height when the width actually changes (orientation),
  // not on every toolbar show/hide — those keep the same small-viewport height.
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth !== lastW) { lastW = window.innerWidth; stageH = smallVH(); }
    fit(); onScroll();
  });
  window.addEventListener('scroll', requestTick, { passive: true });
  fit();
  onScroll();
})();
