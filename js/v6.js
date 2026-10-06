/* Golden Lion Auctions — HOME v6 "The Hall".
   Data: data/lots.js (window.GLA). Bids, timers, counts and results are SAMPLE DATA.
   Every stop, row and result is static HTML; this file only hydrates it (clocks, watch, sort, forms)
   and, on a large landscape screen with motion allowed, turns the hall into the walk:
   the hangar door slides off, the camera dollies through twelve stitched bays, each car lifted off
   its hall plate by a few pixels of parallax. Under reduced motion none of the walk exists. */
(function () {
  'use strict';
  window.__v6ok = true;
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
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var byId = {};
  lots.forEach(function (l) { byId[l.feed_id] = l; });
  var left = function (l) { return Math.max(0, l.ends_in - (Date.now() - T0) / 1000); };
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

  /* ---------- all lots: sort, make, search ---------- */
  var rowsEl = $('#rows'), rows = $$('.row', rowsEl), tools = $('#tools'), q = $('#q'), make = $('#make');
  var countEl = $('#count'), emptyEl = $('#empty');
  var SORT_WORD = { ending: 'ending soonest first', 'new': 'newly listed first', noreserve: 'no reserve, ending soonest first' };
  function applyBrowse() {
    var sort = (tools.querySelector('input[name="sort"]:checked') || {}).value || 'ending';
    var m = make.value, v = q.value.trim().toLowerCase();
    var list = rows.slice().sort(function (a, b) {
      var la = left(byId[a.dataset.id]), lb = left(byId[b.dataset.id]);
      return sort === 'new' ? lb - la : la - lb;
    });
    var shown = 0;
    list.forEach(function (r) {
      var ok = (sort !== 'noreserve' || r.dataset.reserve === 'no') && (!m || r.dataset.make === m) && (!v || r.dataset.q.indexOf(v) > -1);
      r.hidden = !ok; if (ok) shown++;
      rowsEl.appendChild(r);
    });
    var bits = [];
    if (m) bits.push(m);
    if (v) bits.push('“' + q.value.trim() + '”');
    countEl.textContent = shown === rows.length ? 'Showing all ' + rows.length + ' lots, ' + SORT_WORD[sort]
      : 'Showing ' + shown + ' of ' + rows.length + ' lots' + (bits.length ? ' · ' + bits.join(' · ') : '') + ', ' + SORT_WORD[sort];
    emptyEl.hidden = shown > 0;
  }
  tools.addEventListener('change', applyBrowse);
  q.addEventListener('input', applyBrowse);
  tools.addEventListener('submit', function (e) { e.preventDefault(); });
  $('#clear').addEventListener('click', function () {
    q.value = ''; make.value = ''; tools.querySelector('input[value="ending"]').checked = true; applyBrowse(); q.focus();
  });
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

  /* ---------- how the hammer falls: a simulated last minute ---------- */
  var face = $('#demo-clock'), state = $('#demo-state'), secs = 120, running = false, last = 0, raf = 0;
  function drawFace() {
    var s = Math.ceil(secs), m = s / 60 | 0, x = s % 60;
    var str = m + ':' + pad(x);
    face.innerHTML = str.split('').map(function (c) { return c === ':' ? '<span class="c">:</span>' : '<span class="d">' + c + '</span>'; }).join('');
    face.setAttribute('aria-label', m + ' minutes ' + x + ' seconds left in the simulation');
  }
  function loop() {
    if (!running) return;
    var t = Date.now();
    if (last) secs -= (t - last) / 1000;
    last = t;
    if (secs <= 0) {
      secs = 0; running = false; clearInterval(raf); drawFace();
      face.classList.add('is-closed');
      state.textContent = 'Hammer down. Two minutes passed without a bid, so the lot closes to the last bidder.';
      return;
    }
    drawFace();
  }
  function run(from) {
    clearInterval(raf); secs = from; last = Date.now(); running = true;
    face.classList.remove('is-closed', 'is-reset'); drawFace(); raf = setInterval(loop, 250);
  }
  $('#demo-run').addEventListener('click', function () {
    run(20); state.textContent = 'Twenty seconds left. Place a late bid and watch the clock.';
  });
  $('#demo-bid').addEventListener('click', function () {
    var at = Math.ceil(secs), was = running && at > 0;
    run(120);
    face.classList.add('is-reset');
    setTimeout(function () { face.classList.remove('is-reset'); }, 900);
    state.textContent = was ? 'Bid at 0:' + pad(at) + '. The clock goes back to 2:00, and everyone gets two more minutes.'
      : 'A bid lands. The clock stands at 2:00 and runs down; any new bid sends it back to 2:00.';
  });
  drawFace();

  /* =========================================================
     The hall as a swipe rail (phones, tablets, portrait)
     ========================================================= */
  var hall = $('#hall'), view = $('#view'), track = $('#track'), stops = $$('.stop', track);
  var door = $('#door'), rail = $('#rail'), railN = $('#rail-n'), ticks = $$('.rail__tick', rail);
  var N = stops.length, cur = 0;
  function setCurrent(i) {
    cur = i;
    railN.textContent = pad(i + 1);
    ticks.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    var b = $$('.rail__btn', rail);
    b[0].disabled = i <= 0 && !(walk && walk.u < 0) ; b[1].disabled = i >= N - 1;
  }
  var isRail = function () { return !root.classList.contains('walk') && track.scrollWidth > track.clientWidth + 4; };
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
  track.addEventListener('keydown', function (e) {
    if (!isRail()) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); railTo(cur + (e.key === 'ArrowRight' ? 1 : -1)); }
  });

  /* step buttons, ticks and the door CTA work in every layout */
  function go(i) {
    if (walk) return walk.go(i);
    if (isRail()) {
      railTo(i);
      var r = track.getBoundingClientRect();
      if (r.top < 0 || r.top > window.innerHeight * .5) scrollToEl(stops[0], false);
      return;
    }
    scrollToEl(stops[clamp(i, 0, N - 1)], false);
  }
  $$('.rail__btn', rail).forEach(function (b) {
    b.addEventListener('click', function () {
      var d = Number(b.dataset.step);
      if (walk && walk.u < 0) return go(d > 0 ? 0 : 0);
      go(cur + d);
    });
  });
  $$('[data-go]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); go(Number(a.dataset.go)); });
  });
  setCurrent(0);

  /* ---------- anchors (header, footer, skip): long jumps are immediate ---------- */
  var lenis = null;
  function scrollToEl(el, focus) {
    var y = el.getBoundingClientRect().top + window.pageYOffset - (window.innerWidth < 1024 ? 0 : 0);
    var far = Math.abs(y - window.pageYOffset) > window.innerHeight * 2.5;
    if (lenis) lenis.scrollTo(y, { immediate: far || reduce, duration: 1.1 });
    else window.scrollTo({ top: y, behavior: far || reduce ? 'auto' : 'smooth' });
    if (focus) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute('data-go') || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1);
    var t = id ? document.getElementById(id) : null;
    if (!t) return;
    e.preventDefault();
    if (a.hasAttribute('data-search')) { scrollToEl($('#browse'), false); q.focus({ preventScroll: true }); return; }
    if (t.classList.contains('stop')) return go(stops.indexOf(t));
    scrollToEl(t, true);
  });

  /* =========================================================
     The walk (html.walk): pinned dolly through the stitched hall
     ========================================================= */
  var walk = null;
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
    car.className = 'stop__car'; car.alt = ''; car.setAttribute('aria-hidden', 'true'); car.decoding = 'async';
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
    car.onerror = plate.onerror = function () { hallImg.src = hallImg.dataset.hall || hallImg.src.replace('assets/v6/plate-', 'assets/stage/gen-gla-hall-'); scene.classList.remove('is-pending'); };
    car.src = hallImg.dataset.car;
    plate.src = hallImg.dataset.plate;
  }

  function Walk() {
    var self = this;
    self.u = -1;
    var YC = [], ZB, W, H, B, Dp, g, m, railH, Dw, O = [], Z = [], XC = [], plateX = [], plateB = [], ZE, XCE;
    var E, HOLD, TRAV, TAIL, L;
    var plates = stops.map(function (s) { return $('.plate', s); });
    var caps = stops.map(function (s) { return $('.stop__cap', s); });
    var originals = stops.map(function (s) { return $('.stop__hall', s).getAttribute('src'); });
    var styles = stops.map(function (s) { return s.getAttribute('style') || ''; });

    stops.forEach(function (s, k) {
      s.__walk = true;
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
      railH = 84;
      root.style.setProperty('--rail-h', railH + 'px');
      // zoom per stop: the car + its placard must fit, the placard keeps its size (14px floor)
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
        floorY = Math.max(floorY, (ph + 18 - tyk) / Z[k]);
        plateB[k] = floorY;
        var s = stops[k];
        s.style.left = O[k] + 'px';
        s.style.setProperty('--B', B + 'px');
        s.style.setProperty('--fl', (Math.max(.02, Math.min(.08, b[0] - .012)) * 100) + '%');
        s.style.setProperty('--fr', (Math.max(.02, Math.min(.08, 1 - b[2] - .012)) * 100) + '%');
        s.style.setProperty('--px', plateX[k] + 'px');
        s.style.setProperty('--pb', (H - floorY) + 'px');
        s.style.setProperty('--D', Dp + 'px');
        s.style.setProperty('--capx', (b[0] * B) + 'px');
        // camera centre for this stop: the group (car + placard) centred on screen
        var carL = O[k] + b[0] * B, Sg = ((b[2] - b[0]) * B + g) * Z[k] + Dp;
        XC[k] = carL + Sg / (2 * Z[k]);
        YC[k] = (b[1] + b[3]) / 2 * H;
      }
      // the door: as wide as the lead car allows
      var cw1 = (BOX[0][2] - BOX[0][0]) * B;
      Dw = clamp(W - cw1 - 2 * m, 380, 620);
      if (W - Dw - 2 * m < cw1 * .82) Dw = Math.max(340, W - cw1 * .82 - 2 * m);
      door.style.setProperty('--door-w', Dw + 'px');
      ZE = Math.min(ZB, (W - Dw - 2 * m) / cw1);
      var c1 = (BOX[0][0] + BOX[0][2]) / 2 * B;
      XCE = c1 - (Dw + (W - Dw) / 2 - W / 2) / ZE;
      E = .9 * H; HOLD = .36 * H; TRAV = .64 * H; TAIL = .5 * H;
      L = E + N * HOLD + (N - 1) * TRAV + TAIL;
    }
    self.layout = layout;
    self.length = function () { return L; };

    // scroll px (within the pin) -> u in [-1, N-1]
    function uAt(p) {
      if (p < E) return -1 + ease(clamp(p / E, 0, 1));
      p -= E;
      var seg = HOLD + TRAV, k = Math.floor(p / seg);
      if (k >= N - 1) return N - 1;
      var r = p - k * seg;
      return r < HOLD ? k : k + ease((r - HOLD) / TRAV);
    }
    function pAt(k) { return E + k * (HOLD + TRAV) + HOLD / 2; }   // the middle of stop k's hold
    self.pAt = pAt;

    var oy;
    function render(u) {
      self.u = u;
      oy = H * .58;
      var xc, z, yc, doorT = 0;
      if (u < 0) {
        var t = u + 1;                                   // 0 at the door, 1 at stop 1
        doorT = t;
        xc = lerp(XCE, XC[0], t); z = lerp(ZE, Z[0], t); yc = YC[0];
      } else {
        var k = Math.floor(u), f = u - k;
        if (k >= N - 1) { k = N - 1; f = 0; }
        var k2 = Math.min(k + 1, N - 1);
        xc = lerp(XC[k], XC[k2], f); yc = lerp(YC[k], YC[k2], f);
        z = lerp(Z[k], Z[k2], f) * (1 - .04 * Math.sin(Math.PI * f));   // a half-step back while walking
        doorT = 1;
      }
      // vertical: when the camera stands back, the spare dark is split, a little more of it on the floor under the rail
      var ty = H * (1 - z) * .4;
      track.style.transform = 'translate3d(' + (W / 2 - xc * z).toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + z.toFixed(4) + ')';
      door.style.transform = 'translate3d(' + (-(Dw + 120) * ease(clamp(doorT * 1.08, 0, 1))).toFixed(2) + 'px,0,0)';
      door.style.visibility = doorT >= 1 ? 'hidden' : '';
      var railO = smooth(.55, 1, doorT);
      rail.style.opacity = railO.toFixed(3);
      rail.style.visibility = railO < .02 ? 'hidden' : '';
      var amp = clamp(W * .014, 14, 26), inv = 1 / z;
      for (var i = 0; i < N; i++) {
        var bx = (O[i] + B / 2 - xc) * z / W;            // bay centre, in screen widths from centre
        if (Math.abs(bx) < 1.6) loadStop(i);
        // the car leads its hall by a few pixels as the camera passes; exactly registered at its own stop
        var rel = u < 0 ? 0 : clamp((XC[i] - xc) * z / W, -1.4, 1.4);
        if (stops[i].__car) stops[i].__car.style.transform = rel ? 'translate3d(' + (rel * amp).toFixed(2) + 'px,0,0)' : '';
        var gx = ((O[i] + BOX[i][0] * B) - xc) * z + W / 2;  // car left on screen
        var gc = (gx + ((BOX[i][2] - BOX[i][0]) * B + g) * z + Dp / 2 + gx) / 2;
        var dg = Math.abs(gc - W / 2) / W;
        var o = 1 - smooth(.1, .3, dg);
        if (i === 0) o *= smooth(.5, 1, doorT);
        plates[i].style.opacity = o.toFixed(3);
        plates[i].style.visibility = o < .02 ? 'hidden' : '';
        plates[i].style.transform = inv === 1 ? '' : 'scale(' + inv.toFixed(4) + ')';
      }
      var c = clamp(Math.round(u), 0, N - 1);
      if (c !== cur || u < 0) setCurrent(c);
      for (var j = c + 1; j <= Math.min(N - 1, c + 2); j++) loadStop(j);
    }

    layout();
    // first stop: keep the staged hall (already the LCP), lift the car once both layers are in
    loadStop(0);

    self.st = ST.create({
      trigger: hall, start: 'top top', end: function () { return '+=' + L; },
      pin: view, pinSpacing: true, anticipatePin: 1, invalidateOnRefresh: true,
      onRefreshInit: layout,
      onRefresh: function (st) { render(uAt(st.scroll() - st.start)); },
      onUpdate: function (st) { render(uAt(st.scroll() - st.start)); }
    });
    render(-1);
    root.classList.add('walk-on');

    self.go = function (i) {
      i = clamp(i, 0, N - 1);
      var y = self.st.start + pAt(i);
      var dist = Math.abs(i - Math.max(0, self.u));
      if (lenis) lenis.scrollTo(y, { duration: clamp(.7 + dist * .28, .8, 2.6), easing: function (t) { return 1 - Math.pow(1 - t, 3); } });
      else window.scrollTo(0, y);
    };

    // settle on a stop: if the visitor stops between two platforms, finish the step
    var idleT = 0, lastInput = 0;
    self.onInput = function () { lastInput = Date.now(); };
    ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (t) { window.addEventListener(t, self.onInput, { passive: true }); });
    self.onScroll = function () {
      clearTimeout(idleT);
      idleT = setTimeout(function () {
        if (Date.now() - lastInput > 1600) return;     // only finish a step the visitor started
        var st = self.st, y = window.pageYOffset;
        if (y <= st.start + 4 || y >= st.end - 4) return;
        if (lenis && lenis.isScrolling) return;
        var u = self.u;
        if (Math.abs(u - Math.round(u)) < .004) return;
        if (u < 0) { if (u > -.45) self.go(0); else (lenis ? lenis.scrollTo(st.start, { duration: .8 }) : 0); return; }
        self.go(Math.round(u));
      }, 220);
    };
    if (lenis) lenis.on('scroll', self.onScroll);

    // keyboard: arrows step the hall while it is on screen; tabbing into a stop walks to it
    self.onKey = function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) return;
      var y = window.pageYOffset, st = self.st;
      if (y < st.start - 2 || y > st.end + 2) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var d = e.key === 'ArrowRight' ? 1 : -1;
        self.go(self.u < 0 ? 0 : Math.round(self.u) + d);
      }
    };
    document.addEventListener('keydown', self.onKey);
    self.onFocus = function (e) {
      var s = e.target.closest && e.target.closest('.stop');
      if (!s) return;
      var i = stops.indexOf(s);
      if (Math.abs(self.u - i) > .02) self.go(i);
    };
    track.addEventListener('focusin', self.onFocus);

    self.destroy = function () {
      self.st.kill(true);
      document.removeEventListener('keydown', self.onKey);
      track.removeEventListener('focusin', self.onFocus);
      if (lenis) lenis.off('scroll', self.onScroll);
      ['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(function (t) { window.removeEventListener(t, self.onInput); });
      [track, door, rail].forEach(function (el) { el.removeAttribute('style'); });
      stops.forEach(function (s, k) {
        s.setAttribute('style', styles[k]);
        s.__walk = false;
        var img = $('.stop__hall', s); img.src = originals[k];
        var sc = $('.stop__scene', s); sc.classList.remove('is-pending');
        if (s.__car) { s.__car.remove(); s.__car = null; }
        s.__loaded = false;
        $('.plate', s).removeAttribute('style'); $('.stop__cap', s).removeAttribute('style');
      });
      root.classList.remove('walk-on');
    };
  }

  var mm = gsap.matchMedia();
  mm.add(WALKQ, function () {
    root.classList.add('walk');
    walk = new Walk();
    return function () { if (walk) walk.destroy(); walk = null; root.classList.remove('walk'); setCurrent(0); };
  });
  if (!window.matchMedia(WALKQ).matches) root.classList.remove('walk');

  /* ---------- the hammer: pin, hold, the words leave, release (DNA95) ---------- */
  mm.add('(min-width: 1024px) and (min-height: 700px)', function () {
    var sec = $('#hammer'), copy = $('.hammer__copy', sec);
    if (sec.offsetHeight > window.innerHeight + 2) return;
    var tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + window.innerHeight * .9; }, pin: true, scrub: .35, invalidateOnRefresh: true }
    });
    tl.to({}, { duration: 1 }).to(copy, { y: -80, opacity: 0, ease: 'none', duration: 1 });
  });

  window.__v6 = { lenis: lenis, walk: function () { return walk; } };   // for QA scripts
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
