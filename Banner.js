  (function () {
    var stage    = document.getElementById('stage');
    var scroller = document.querySelector('.scroller');
    var promoEl  = document.querySelector('.promo');
    var menuEl   = document.querySelector('.menu');
    var dessertEl = document.querySelector('.menu-dessert');
    var cheEl    = document.querySelector('.menu-che');
    var drinksEl = document.querySelector('.menu-drinks');
    var cakeEl   = document.querySelector('.menu-cake');
    var root     = document.documentElement;

    var splashEl   = document.getElementById('splash');
    var splashFired = false;

    var dishSplashEl   = document.getElementById('dish-splash');
    var dishSplashFired = false;

    var ings = Array.from(document.querySelectorAll('.ing')).map(function (el) {
      return {
        el: el,
        tx: parseFloat(el.dataset.tx)    || 0,
        ty: parseFloat(el.dataset.ty)    || 0,
        ts: parseFloat(el.dataset.ts)    || 1,
        tr: parseFloat(el.dataset.tr)    || 0,
        d:  parseFloat(el.dataset.delay) || 0
      };
    });

    function ease(t)  { return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2, 2)/2; }
    function clamp(v) { return Math.max(0, Math.min(1, v)); }

    function fit() {
      var s = Math.min(window.innerWidth / 430, window.innerHeight / 932);
      // desktop: shrink slightly so the framed stage floats with margin
      if (window.innerWidth >= 700 && window.innerWidth > window.innerHeight * 0.55) s *= 0.92;
      stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
    }

    function apply(p) {
      // ── 6-page timeline ───────────────────────────
      // p1 assemble → p2 dish hold → p3 chè → p4 sữa chua → p5 drinks → p6 ăn vặt
      var cf       = clamp(1 - p / 0.15);
      var swap     = clamp((p - 0.06) / 0.11);   // promo out, dark menu in
      // PAGE 2 — dish reveals by ~0.25, HOLDS STATIC until 0.36
      var realfade = clamp((p - 0.17) / 0.08);
      var dishfade = 1 - realfade;
      // PAGE 3 — chè menu in; real dish out FAST (0.36 → 0.40)
      var chefade = clamp((p - 0.36) / 0.08);
      var realout = clamp((p - 0.36) / 0.04);
      // PAGE 4 — sữa chua fades over chè (0.52 → 0.60, hold to 0.68)
      var dessertfade = clamp((p - 0.52) / 0.08);
      // PAGE 5 — drinks fade over chè (0.68 → 0.76, hold to 0.84)
      var drfade = clamp((p - 0.68) / 0.08);
      // PAGE 6 — ăn vặt fades over drinks (0.84 → 0.92, hold to end)
      var ckfade = clamp((p - 0.84) / 0.08);
      // scroll cue stays until the final page settles
      var cuefade  = 1 - clamp((p - 0.94) / 0.05);

      root.style.setProperty('--cfade',    cf);
      root.style.setProperty('--cuefade',  cuefade);
      root.style.setProperty('--pfade',    1 - swap);
      root.style.setProperty('--mfade',    swap);
      root.style.setProperty('--realfade', realfade);
      root.style.setProperty('--realout',  realout);
      root.style.setProperty('--dishfade', dishfade);
      root.style.setProperty('--dfade',    dessertfade);
      root.style.setProperty('--chefade',  chefade);
      root.style.setProperty('--drfade',   drfade);
      root.style.setProperty('--ckfade',   ckfade);

      promoEl.style.pointerEvents = swap > 0.5 ? 'none' : 'auto';
      // each layer interactive only while it is the topmost visible page
      var darkOn    = swap > 0.5 && chefade < 0.5;
      var cheOn     = chefade > 0.5 && dessertfade < 0.5;
      var dessertOn = dessertfade > 0.5 && drfade < 0.5;
      var drinksOn  = drfade > 0.5 && ckfade < 0.5;
      var cakeOn    = ckfade > 0.5;
      menuEl.style.pointerEvents  = darkOn ? 'auto' : 'none';
      menuEl.setAttribute('aria-hidden', darkOn ? 'false' : 'true');
      dessertEl.style.pointerEvents = dessertOn ? 'auto' : 'none';
      dessertEl.setAttribute('aria-hidden', dessertOn ? 'false' : 'true');
      cheEl.style.pointerEvents = cheOn ? 'auto' : 'none';
      cheEl.setAttribute('aria-hidden', cheOn ? 'false' : 'true');
      drinksEl.style.pointerEvents = drinksOn ? 'auto' : 'none';
      drinksEl.setAttribute('aria-hidden', drinksOn ? 'false' : 'true');
      cakeEl.style.pointerEvents = cakeOn ? 'auto' : 'none';
      cakeEl.setAttribute('aria-hidden', cakeOn ? 'false' : 'true');

      var pm = clamp(p / 0.17);   // assembly completes by p=0.17, before the dish reveal

      // fire splash when assembly reaches ~93%, reset if scrolled back
      if (pm >= 0.93 && !splashFired) {
        splashFired = true;
        splashEl.classList.remove('splash--active');
        void splashEl.offsetWidth; // force reflow so animation restarts
        splashEl.classList.add('splash--active');
      }
      if (pm < 0.93) {
        splashFired = false;
        splashEl.classList.remove('splash--active');
      }

      // fire dish splash when real dish is half-visible, reset if scrolled back
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
        // ramen bowl fades only with the global dishfade;
        // other ingredients also fade individually as they approach the pot
        var isRamen = o.el.classList.contains('ing-ramen');
        o.el.style.opacity = isRamen
          ? dishfade
          : Math.max(0, 1 - e) * dishfade;
      });
    }

    // ── Quick-access dish nav ─────────────────────
    var navItems = Array.from(document.querySelectorAll('.dishnav .dn-item'));
    navItems.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var total  = scroller.offsetHeight - window.innerHeight;
        var target = parseFloat(btn.dataset.p) * total;
        // jump directly: smooth-scrolling would sweep through every
        // page in between (each is a stacked crossfade on the timeline)
        window.scrollTo({ top: target, behavior: 'auto' });
        viewportEl.classList.remove('arrive');
        void viewportEl.offsetWidth;  // restart the arrival animation
        viewportEl.classList.add('arrive');
      });
    });
    var viewportEl = document.getElementById('viewport');

    function updateNav(p) {
      // page ranges matching the scroll timeline above
      var idx = p < 0.12 ? 0          // menu (1st page — hero/assembly)
              : p < 0.40 ? 1          // mì cay (dish + price list)
              : p < 0.56 ? 2          // chè
              : p < 0.72 ? 3          // sữa chua
              : p < 0.88 ? 4          // đồ uống
              : 5;                    // ăn vặt
      navItems.forEach(function (btn, i) {
        btn.classList.toggle('on', i === idx);
      });
      updateNextCue(idx);
    }

    // ── Next-page cue ─────────────────────────────
    var nextCue   = document.getElementById('next-cue');
    var ncKicker  = nextCue.querySelector('.nc-kicker');
    var ncLabel   = nextCue.querySelector('.nc-label');
    var nextIdx   = 1;
    function updateNextCue(idx) {
      var last = idx === navItems.length - 1;
      nextIdx = last ? 0 : idx + 1;
      ncKicker.textContent = last ? 'Hết menu' : 'Tiếp theo';
      ncLabel.textContent  = last
        ? 'Về đầu trang'
        : navItems[nextIdx].textContent.trim();
      nextCue.classList.toggle('nc-light', idx >= 2 && idx <= 3 || idx === 5);
    }
    nextCue.addEventListener('click', function () {
      navItems[nextIdx].click();
    });

    function onScroll() {
      var total = scroller.offsetHeight - window.innerHeight;
      var p = clamp(total > 0 ? window.scrollY / total : 0);
      apply(p);
      updateNav(p);
    }

    window.addEventListener('resize', function () { fit(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });
    fit();
    onScroll();
  })();
