/* Golden Lion Auctions — HOME v7 "The Hall", revised (from v6).
   Data: data/lots.js (window.GLA). Bids, timers, counts and results are SAMPLE DATA.
   Every stop, row and result is static HTML; this file hydrates it (clocks, watch, sort, forms) and,
   on a large landscape screen with motion allowed, turns the hall section into a stage: a 2.5D camera
   that dollies between twelve stitched bays on arrows, ticks, keys, drag, trackpad sideways and shift+wheel.
   The stage never takes vertical scroll: a vertical wheel or swipe always goes to the page.
   Under reduced motion (and without JS) the hall is a native horizontal scroller; no camera, no parallax. */
(function () {
  'use strict';
  window.__v7ok = true;
  var D = window.GLA;
  if (!D) return;
  var root = document.documentElement;
  var lots = D.lots;
  var T0 = Date.now();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WALKQ = '(min-width: 1024px) and (min-height: 620px) and (min-aspect-ratio: 5/4)';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return String(Math.floor(n)).padStart(2, '0'); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var byId = {};
  lots.forEach(function (l) { byId[l.feed_id] = l; });
  var left = function (l) { return Math.max(0, l.ends_in - (Date.now() - T0) / 1000); };
  var topH = function () { var t = $('#top'); return t ? t.offsetHeight : 0; };
  var store = {
    get: function (k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: watch lasts this visit */ } }
  };

  /* ---------- clocks: information, so they run under reduced motion too ---------- */
  function fmtLong(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    return (d ? d + 'd ' : '') + h + 'h ' + pad(m) + 'm ' + pad(x) + 's';
  }
  function fmtShort(s) {
    if (s <= 0) return 'Closed';
    if (s >= 86400) return (s / 86400 | 0) + 'd ' + ((s % 86400) / 3600 | 0) + 'h';
    if (s >= 3600) return (s / 3600 | 0) + 'h ' + pad((s % 3600) / 60) + 'm';
    return pad(s / 60) + ':' + pad(s % 60);
  }
  var clocks = $$('[data-ends]');
  function tick() {
    var open = 0;
    lots.forEach(function (l) { if (left(l) > 0) open++; });
    clocks.forEach(function (el) {
      var l = byId[el.dataset.ends]; if (!l) return;
      var s = left(l);
      el.textContent = el.dataset.mode === 'short' ? fmtShort(s) : fmtLong(s);
      var box = el.closest('.plate__time, .row__time');
      if (!box) return;
      var urgent = s > 0 && s < 3600;
      box.classList.toggle('is-urgent', urgent);
      var dt = $('dt', box);
      var want = s <= 0 ? 'Auction' : urgent ? 'Ending soon' : 'Time left';
      if (dt.textContent !== want) dt.textContent = want;
    });
    $$('#live-n, .door__live b').forEach(function (b) { b.textContent = open; });
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- header: a shadow once the page moves under it ---------- */
  var topEl = $('#top');
  function onPageScroll() { topEl.classList.toggle('is-scrolled', window.pageYOffset > 8); }
  window.addEventListener('scroll', onPageScroll, { passive: true });
  onPageScroll();

  /* ---------- watch ---------- */
  var watched = new Set(store.get('gla-watch') || []);
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
      var t = $('span', b); if (t) t.textContent = on ? 'Watching' : 'Watch';
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-watch]'); if (!b) return;
    var id = Number(b.dataset.watch);
    if (watched.has(id)) watched.delete(id); else watched.add(id);
    store.set('gla-watch', Array.from(watched));
    syncWatch();
  });
  syncWatch();

  /* ---------- toast, register, menu ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }
  $$('[data-register]').forEach(function (b) {
    b.addEventListener('click', function () { toast('Registration opens with the live product. This prototype takes no bids.'); });
  });
  var mbtn = $('#menu-btn'), menu = $('#menu');
  mbtn.addEventListener('click', function () { var on = menu.hidden; menu.hidden = !on; mbtn.setAttribute('aria-expanded', String(on)); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- all lots: sort, no-reserve filter, make, search ---------- */
  var rowsEl = $('#rows'), rows = $$('.row', rowsEl), tools = $('#tools'), q = $('#q'), make = $('#make');
  var nores = tools.querySelector('input[name="noreserve"]');
  var countEl = $('#count'), emptyEl = $('#empty'), resetEl = $('#reset');
  var SORT_WORD = { ending: 'ending soonest first', 'new': 'newly listed first' };
  function applyBrowse() {
    var sort = (tools.querySelector('input[name="sort"]:checked') || {}).value || 'ending';
    var m = make.value, v = q.value.trim().toLowerCase(), nr = nores.checked;
    var list = rows.slice().sort(function (a, b) {
      var la = left(byId[a.dataset.id]), lb = left(byId[b.dataset.id]);
      return sort === 'new' ? lb - la : la - lb;
    });
    var shown = 0;
    list.forEach(function (r) {
      var ok = (!nr || r.dataset.reserve === 'no') && (!m || r.dataset.make === m) && (!v || r.dataset.q.indexOf(v) > -1);
      r.hidden = !ok; if (ok) shown++;
      rowsEl.appendChild(r);
    });
    var bits = [];
    if (nr) bits.push('no reserve');
    if (m) bits.push(m);
    if (v) bits.push('“' + q.value.trim() + '”');
    countEl.textContent = !bits.length ? 'Showing all ' + rows.length + ' lots, ' + SORT_WORD[sort]
      : 'Showing ' + shown + ' of ' + rows.length + ' lots · ' + bits.join(' · ') + ', ' + SORT_WORD[sort];
    resetEl.hidden = !bits.length;
    emptyEl.hidden = shown > 0;
  }
  function clearBrowse() { q.value = ''; make.value = ''; nores.checked = false; applyBrowse(); }
  tools.addEventListener('change', applyBrowse);
  q.addEventListener('input', applyBrowse);
  tools.addEventListener('submit', function (e) { e.preventDefault(); });
  $('#clear').addEventListener('click', function () { clearBrowse(); q.focus(); });
  resetEl.addEventListener('click', function () { clearBrowse(); q.focus(); });
  applyBrowse();

  /* ---------- consign: VIN ---------- */
  var vin = $('#vin'), vinMsg = $('#vin-msg'), vinLen = $('#vin-len');
  var TR = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  var WT = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  function checkDigitOk(v) {
    var sum = 0;
    for (var i = 0; i < 17; i++) { var c = v[i]; sum += (/\d/.test(c) ? Number(c) : TR[c]) * WT[i]; }
    var r = sum % 11; return (r === 10 ? 'X' : String(r)) === v[8];
  }
  vin.addEventListener('input', function () {
    var p = vin.selectionStart, clean = vin.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean !== vin.value) { vin.value = clean; try { vin.setSelectionRange(p, p); } catch (e) { /* type without selection */ } }
    vinLen.textContent = clean.length;
    vin.removeAttribute('aria-invalid'); vin.classList.remove('is-ok');
    vinMsg.textContent = ''; vinMsg.className = 'vinform__msg';
  });
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = vin.value.trim().toUpperCase();
    var bad = function (t) { vin.setAttribute('aria-invalid', 'true'); vinMsg.className = 'vinform__msg is-error'; vinMsg.textContent = t; vin.focus(); };
    if (!v) return bad('Enter the 17-character VIN to begin.');
    if (/[IOQ]/.test(v)) return bad('A VIN never uses I, O or Q. Check for a 1 or a 0.');
    if (v.length !== 17) return bad('That is ' + v.length + ' characters. A VIN has 17.');
    var notes = [];
    if (v.slice(0, 3) === 'SCF') notes.push('SCF reads as Aston Martin');
    notes.push(checkDigitOk(v) ? 'the check digit is valid' : 'the check digit does not validate, which a specialist will confirm');
    vin.classList.add('is-ok');
    vinMsg.className = 'vinform__msg is-ok';
    vinMsg.textContent = 'VIN received: ' + notes.join(', ') + '. In the live product a Golden Lion specialist would contact you next. Prototype: nothing was sent.';
  });

  /* ---------- the dispatch ---------- */
  var email = $('#email'), emailMsg = $('#email-msg');
  $('#dispatch').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      email.setAttribute('aria-invalid', 'true'); emailMsg.className = 'dispatch__msg is-error';
      emailMsg.textContent = v ? 'That address looks incomplete.' : 'Enter an email address.'; email.focus(); return;
    }
    email.removeAttribute('aria-invalid'); emailMsg.className = 'dispatch__msg is-ok';
    emailMsg.textContent = 'You are on the list. Prototype: nothing was sent.';
  });
  email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

  /* how the hammer falls: js/v7-hammer.js owns the section (clock, steps, pin) */

  /* =========================================================
     The hall — shared: position, ticks, steps
     ========================================================= */
  var hall = $('#hall'), view = $('#view'), track = $('#track'), stops = $$('.stop', track);
  var rail = $('#rail'), railN = $('#rail-n'), ticks = $$('.rail__tick', rail), stepBtns = $$('.rail__btn', rail);
  var N = stops.length, cur = 0, stage = null, lenis = null;
  function setCurrent(i) {
    cur = i;
    railN.textContent = pad(i + 1);
    ticks.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    stepBtns[0].disabled = i <= 0; stepBtns[1].disabled = i >= N - 1;
  }

  /* the native scroller (phones, tablets, reduced motion, no stage) */
  var isRail = function () { return !stage; };
  function railTo(i) {
    i = clamp(i, 0, N - 1);
    setCurrent(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }
  var railRaf = 0;
  track.addEventListener('scroll', function () {
    if (!isRail()) return;
    cancelAnimationFrame(railRaf);
    railRaf = requestAnimationFrame(function () { setCurrent(clamp(Math.round(track.scrollLeft / track.clientWidth), 0, N - 1)); });
  }, { passive: true });

  /* page scrolling (header offset included) */
  function scrollToY(y, immediate) {
    y = Math.max(0, y);
    var far = Math.abs(y - window.pageYOffset) > window.innerHeight * 2.5;
    if (lenis) lenis.scrollTo(y, { immediate: immediate || far || reduce, duration: 1.1 });
    else window.scrollTo({ top: y, behavior: immediate || far || reduce ? 'auto' : 'smooth' });
  }
  function scrollToEl(el, focus) {
    var y = el === topEl ? 0 : el.getBoundingClientRect().top + window.pageYOffset - topH();
    scrollToY(y);
    if (focus) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }
  /* bring the hall to rest under the nav: in the stage, the view fills the screen below it */
  function hallY() {
    var el = stage ? view : hall;
    var y = el.getBoundingClientRect().top + window.pageYOffset - topH();
    if (!stage) y += parseFloat(getComputedStyle(hall).paddingTop) - 24;
    return y;
  }
  function hallInView() {
    var r = view.getBoundingClientRect(), vh = window.innerHeight;
    return r.top < vh * .45 && r.bottom > vh * .55;
  }
  function enterHall(focusView) {
    scrollToY(hallY());
    if (focusView) view.focus({ preventScroll: true });
  }

  function go(i) {
    i = clamp(i, 0, N - 1);
    if (stage) stage.go(i); else railTo(i);
  }
  stepBtns.forEach(function (b) {
    b.addEventListener('click', function () { go(cur + Number(b.dataset.step)); });
  });
  $$('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      // keyboard activation (detail 0) hands focus to the hall so the arrow keys work at once; a click does not draw a ring
      if (a.hasAttribute('data-enter') || !hallInView()) enterHall(a.hasAttribute('data-enter') && e.detail === 0);
      go(Number(a.dataset.go));
    });
  });
  $$('[data-enter]:not([data-go])').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); enterHall(e.detail === 0); });
  });
  /* keys: arrows, Home and End move the hall while focus is inside it */
  view.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    var to = e.key === 'ArrowRight' ? cur + 1 : e.key === 'ArrowLeft' ? cur - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? N - 1 : null;
    if (to === null) return;
    e.preventDefault();
    go(to);
  });
  setCurrent(0);

  /* ---------- anchors (header, footer, skip): long jumps are immediate ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-go') || a.hasAttribute('data-enter') || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1);
    var t = id ? document.getElementById(id) : null;
    if (!t) return;
    e.preventDefault();
    if (a.hasAttribute('data-search')) { scrollToEl($('#browse'), false); q.focus({ preventScroll: true }); return; }
    if (t.classList.contains('stop')) { if (!hallInView()) enterHall(false); return go(stops.indexOf(t)); }
    scrollToEl(t, true);
  });

  /* =========================================================
     Motion from here on. Under reduced motion none of it exists.
     ========================================================= */
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (reduce || !hasGsap) {
    root.classList.remove('walk', 'motion');
    return;
  }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  if (window.Lenis) {
    lenis = new window.Lenis({ autoRaf: false, anchors: false });
    lenis.on('scroll', ST.update);
    lenis.on('scroll', onPageScroll);
    ST.addEventListener('refresh', function () { lenis.resize(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  var BOX = stops.map(function (s) { return s.dataset.box.split(',').map(Number); });
  var RATIO = 2528 / 1696;

  function loadStop(k) {
    var s = stops[k]; if (!s || s.__loaded) return;
    s.__loaded = true;
    var scene = $('.stop__scene', s), hallImg = $('.stop__hall', s);
    var car = new Image();
    car.className = 'stop__car'; car.alt = ''; car.setAttribute('aria-hidden', 'true'); car.decoding = 'async'; car.draggable = false;
    car.width = 2528; car.height = 1696;
    var plate = new Image();
    var need = 2, done = function () {
      if (--need) return;
      if (!s.__walk) return;
      hallImg.src = plate.src;           // pixel-identical at rest: the plate + the lifted car = the staged hall
      scene.insertBefore(car, $('.stop__cap', scene));
      s.__car = car;
      scene.classList.remove('is-pending');
    };
    car.onload = plate.onload = done;
    car.onerror = plate.onerror = function () { hallImg.src = s.__orig || hallImg.src; scene.classList.remove('is-pending'); };
    car.src = hallImg.dataset.car;
    plate.src = hallImg.dataset.plate;
  }

  /* ---------- the stage: a camera on user input, never on vertical scroll ---------- */
  function Stage() {
    var self = this;
    self.u = 0;
    var W, H, B, Dp, g, m, railH, ZB, O = [], Z = [], XC = [], plateX = [];
    var plates = stops.map(function (s) { return $('.plate', s); });
    var originals = stops.map(function (s) { return $('.stop__hall', s).getAttribute('src'); });
    var styles = stops.map(function (s) { return s.getAttribute('style') || ''; });
    var tween = null;

    stops.forEach(function (s, k) {
      s.__walk = true; s.__orig = originals[k];
      $('.stop__hall', s).draggable = false;
      if (k > 0 && !s.__loaded) {
        var img = $('.stop__hall', s);
        $('.stop__scene', s).classList.add('is-pending');
        img.setAttribute('loading', 'lazy');
        img.src = img.dataset.plate;   // the staged hall is never fetched twice: plate + car rebuild it
      }
    });

    function layout() {
      W = view.clientWidth; H = view.clientHeight;
      B = H * RATIO;
      Dp = clamp(W * .235, 300, 392);
      g = clamp(W * .034, 32, 72);
      m = clamp(W * .075, 56, 170);
      railH = rail.offsetHeight || 88;
      stops.forEach(function (s) { s.style.setProperty('--D', Dp + 'px'); s.style.setProperty('--B', B + 'px'); });
      // a camera standing back: the car takes about a third of the frame, never the whole of it
      ZB = clamp((W * .36) / (.47 * B), .7, .9);
      Z = BOX.map(function (b) { var cw = (b[2] - b[0]) * B; return Math.min(ZB, (W - 2 * m - Dp) / (cw + g), W * .52 / cw); });
      O = [0];
      for (var k = 0; k < N; k++) {
        var b = BOX[k];
        plateX[k] = b[2] * B + g;                                    // relative to the bay
        if (k < N - 1) {
          var zlo = Math.min(Z[k], Z[k + 1]) * .955;
          O[k + 1] = O[k] + plateX[k] + Dp / zlo + g * 2.6 - BOX[k + 1][0] * B;
        }
        // the placard stands on the floor beside the car, wholly inside the frame (its screen height is unscaled)
        var tyk = H * (1 - Z[k]) * .4, ph = plates[k].offsetHeight;
        var floorY = Math.min(b[3] * H + .05 * H, (H - railH - 14 - tyk) / Z[k]);
        floorY = Math.max(floorY, (ph + clamp(H * .06, 32, 56) - tyk) / Z[k]);   // headroom under the nav
        var s = stops[k];
        s.style.left = O[k] + 'px';
        s.style.setProperty('--fl', (Math.max(.02, Math.min(.08, b[0] - .012)) * 100) + '%');
        s.style.setProperty('--fr', (Math.max(.02, Math.min(.08, 1 - b[2] - .012)) * 100) + '%');
        s.style.setProperty('--px', plateX[k] + 'px');
        s.style.setProperty('--pb', (H - floorY) + 'px');
        // camera centre for this stop: the group (car + placard) centred on screen
        var carL = O[k] + b[0] * B, Sg = ((b[2] - b[0]) * B + g) * Z[k] + Dp;
        XC[k] = carL + Sg / (2 * Z[k]);
      }
    }
    self.layout = layout;

    // camera position <-> u (linear between stops, so drag is 1:1 under the finger)
    function zAt(u) { var k = clamp(Math.floor(u), 0, N - 1), k2 = Math.min(k + 1, N - 1), f = clamp(u - k, 0, 1); return lerp(Z[k], Z[k2], f); }
    function xAt(u) {
      if (u < 0) return XC[0] + u * (XC[1] - XC[0]);
      if (u > N - 1) return XC[N - 1] + (u - N + 1) * (XC[N - 1] - XC[N - 2]);
      var k = Math.min(Math.floor(u), N - 2), f = u - k; return lerp(XC[k], XC[k + 1], f);
    }
    function uAt(x) {
      if (x <= XC[0]) return (x - XC[0]) / (XC[1] - XC[0]);
      if (x >= XC[N - 1]) return N - 1 + (x - XC[N - 1]) / (XC[N - 1] - XC[N - 2]);
      for (var k = 0; k < N - 1; k++) if (x <= XC[k + 1]) return k + (x - XC[k]) / (XC[k + 1] - XC[k]);
      return N - 1;
    }

    function render(u) {
      self.u = u;
      var uc = clamp(u, 0, N - 1), k = Math.min(Math.floor(uc), N - 1), f = uc - k;
      var xc = xAt(u), z = zAt(uc) * (1 - .04 * Math.sin(Math.PI * f));   // a half-step back while walking
      var ty = H * (1 - z) * .4;
      track.style.transform = 'translate3d(' + (W / 2 - xc * z).toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + z.toFixed(4) + ')';
      var amp = clamp(W * .014, 14, 26), inv = 1 / z;
      for (var i = 0; i < N; i++) {
        var bx = (O[i] + B / 2 - xc) * z / W;            // bay centre, in screen widths from centre
        if (Math.abs(bx) < 1.6) loadStop(i);
        // the car leads its hall by a few pixels as the camera passes; exactly registered at its own stop
        var rel = clamp((XC[i] - xc) * z / W, -1.4, 1.4);
        if (stops[i].__car) stops[i].__car.style.transform = Math.abs(rel) > .0005 ? 'translate3d(' + (rel * amp).toFixed(2) + 'px,0,0)' : '';
        var gx = ((O[i] + BOX[i][0] * B) - xc) * z + W / 2;  // car left on screen
        var gc = (gx + ((BOX[i][2] - BOX[i][0]) * B + g) * z + Dp / 2 + gx) / 2;
        var o = 1 - smooth(.1, .3, Math.abs(gc - W / 2) / W);
        plates[i].style.opacity = o.toFixed(3);
        plates[i].style.visibility = o < .02 ? 'hidden' : '';
        plates[i].style.transform = 'scale(' + inv.toFixed(4) + ')';
      }
      var c = clamp(Math.round(u), 0, N - 1);
      if (c !== cur) setCurrent(c);
      for (var j = c + 1; j <= Math.min(N - 1, c + 2); j++) loadStop(j);
    }
    self.render = render;

    self.go = function (i) {
      i = clamp(i, 0, N - 1);
      if (tween) tween.kill();
      var dist = Math.abs(i - self.u);
      if (dist < .001) { render(i); return; }
      setCurrent(i);
      tween = gsap.to(self, { u: i, duration: clamp(.55 + dist * .2, .6, 1.8), ease: 'power3.out', onUpdate: function () { render(self.u); }, onComplete: function () { tween = null; } });
    };
    /* finish a gesture: a deliberate push (an eighth of a step or more) always reaches the next platform */
    function settle(from, bias) {
      var d = self.u - from + (bias || 0), base = Math.round(from);
      if (Math.abs(d) < .12) return self.go(base);
      self.go(clamp(base + (d > 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(d))), 0, N - 1));
    }
    function nudge(dxScreen) {   // move the camera by screen pixels (drag, trackpad)
      if (tween) { tween.kill(); tween = null; }
      var z = zAt(clamp(self.u, 0, N - 1));
      render(clamp(uAt(xAt(self.u) + dxScreen / z), -.12, N - 1 + .12));
    }

    /* drag / swipe: horizontal intent only; vertical intent is left to the page */
    var ptr = null;
    self.onDown = function (e) {
      if (e.button !== 0 || e.target.closest('.plate, .rail, .hall__head, a, button, input, select')) return;
      ptr = { from: self.u, id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, t: e.timeStamp, v: 0, on: false };
    };
    self.onMove = function (e) {
      if (!ptr || e.pointerId !== ptr.id) return;
      var dx = e.clientX - ptr.x, dy = e.clientY - ptr.y;
      if (!ptr.on) {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { ptr = null; return; }
        if (Math.abs(dx) < 6) return;
        ptr.on = true; view.classList.add('is-drag');
        try { view.setPointerCapture(e.pointerId); } catch (x) { /* capture unavailable */ }
      }
      var step = e.clientX - ptr.lx, dt = Math.max(1, e.timeStamp - ptr.t);
      ptr.v = ptr.v * .6 + (step / dt) * .4; ptr.lx = e.clientX; ptr.t = e.timeStamp;
      nudge(-step);
    };
    self.onUp = function (e) {
      if (!ptr || e.pointerId !== ptr.id) return;
      var was = ptr.on, v = ptr.v, from = ptr.from; ptr = null;
      view.classList.remove('is-drag');
      if (!was) return;
      var bias = clamp(-v * .9, -.6, .6);            // a flick carries on to the next platform
      settle(from, Math.abs(bias) > .12 ? bias : 0);
    };
    view.addEventListener('pointerdown', self.onDown);
    view.addEventListener('pointermove', self.onMove);
    view.addEventListener('pointerup', self.onUp);
    view.addEventListener('pointercancel', self.onUp);

    /* trackpad sideways and shift+wheel: horizontal input only. A vertical wheel passes straight to the page. */
    var wheelT = 0, wheelFrom = null, wheelLock = 0;
    self.onWheel = function (e) {
      if (e.ctrlKey) return;
      var dx = e.deltaX, dy = e.deltaY, horiz = Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 0;
      if (!horiz && e.shiftKey && dy) { dx = dy; horiz = true; }
      if (!horiz) return;
      e.preventDefault(); e.stopPropagation();          // keep it from Lenis and from history-swipe
      if (e.deltaMode === 1) dx *= 16;
      if (e.timeStamp < wheelLock) { wheelLock = e.timeStamp + 160; return; }   // a trackpad's coasting tail after a settle is spent, not counted again
      if (wheelFrom === null) wheelFrom = Math.round(self.u);
      nudge(dx);
      clearTimeout(wheelT);
      wheelT = setTimeout(function () { var f = wheelFrom; wheelFrom = null; wheelLock = performance.now() + 160; settle(f, 0); }, 140);
    };
    view.addEventListener('wheel', self.onWheel, { passive: false });

    /* tabbing into a placard walks to it; the view itself never scrolls natively */
    self.onFocus = function (e) {
      view.scrollLeft = 0; view.scrollTop = 0;
      var s = e.target.closest && e.target.closest('.stop');
      if (!s) return;
      var i = stops.indexOf(s);
      if (Math.abs(self.u - i) > .02) self.go(i);
    };
    view.addEventListener('focusin', self.onFocus);
    self.onResize = function () { layout(); render(clamp(Math.round(self.u), 0, N - 1)); };
    window.addEventListener('resize', self.onResize);

    layout();
    loadStop(0);
    render(0);
    root.classList.add('walk-on');
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(self.onResize);

    self.destroy = function () {
      if (tween) tween.kill();
      view.removeEventListener('pointerdown', self.onDown);
      view.removeEventListener('pointermove', self.onMove);
      view.removeEventListener('pointerup', self.onUp);
      view.removeEventListener('pointercancel', self.onUp);
      view.removeEventListener('wheel', self.onWheel);
      view.removeEventListener('focusin', self.onFocus);
      window.removeEventListener('resize', self.onResize);
      track.removeAttribute('style');
      stops.forEach(function (s, k) {
        s.setAttribute('style', styles[k]);
        s.__walk = false;
        var img = $('.stop__hall', s); img.src = originals[k];
        $('.stop__scene', s).classList.remove('is-pending');
        if (s.__car) { s.__car.remove(); s.__car = null; }
        s.__loaded = false;
        $('.plate', s).removeAttribute('style');
      });
      root.classList.remove('walk-on');
    };
  }

  var mm = gsap.matchMedia();
  mm.add(WALKQ, function () {
    root.classList.add('walk');
    stage = new Stage();
    return function () { if (stage) stage.destroy(); stage = null; root.classList.remove('walk'); setCurrent(0); track.scrollLeft = 0; };
  });
  if (!window.matchMedia(WALKQ).matches) root.classList.remove('walk');

  window.__v7 = { lenis: lenis, stage: function () { return stage; } };   // for QA scripts
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
