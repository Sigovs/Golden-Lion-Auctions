/* Golden Lion Auctions — HOME v4 "Evening Sale" behaviour.
   Data: data/lots.js (window.GLA). Bids, timers, counts, reserve states and results are SAMPLE.
   The board also simulates a sample bid every few seconds so the flaps have something to say;
   a simulated bid in a lot's last two minutes puts its clock back to 2:00 (the proposed rule).
   Clocks are information: they tick under reduced motion too, only the flips and the curtain go. */
(function () {
  'use strict';
  var D = window.GLA;
  if (!D) return;
  var lots = D.lots, sold = D.sold;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduce && typeof Element.prototype.animate === 'function';
  var AR = 2528 / 1696;

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var pad = function (n) { return String(Math.floor(n)).padStart(2, '0'); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var store = {
    get: function (k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: watch stays per-session */ } }
  };

  /* ---------- data ---------- */
  var now = Date.now();
  var byId = {};
  lots.forEach(function (l) { l.endAt = now + l.ends_in * 1000; byId[l.feed_id] = l; });
  var left = function (l) { return Math.max(0, (l.endAt - Date.now()) / 1000); };
  var open = function (l) { return left(l) > 0; };
  var nameOf = function (l) { return l.year + ' ' + l.make + ' ' + l.model; };
  // BaT-style headline titles, built only from feed facts: reserve state and mileage.
  var headline = function (l) {
    return (l.reserve === 'no' ? 'No Reserve: ' : '') + (l.mileage ? l.mileage.toLocaleString('en-US') + '-Mile ' : '') + nameOf(l);
  };
  var reserveWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Reserve not yet met'; };
  var focus = function (b) { return ((b[0] + b[2]) / 2 * 100).toFixed(1) + '% ' + ((b[1] + b[3]) / 2 * 100).toFixed(1) + '%'; };
  // The name the rostrum calls: the model's short name, taken from the model field.
  var CALL = { 73: 'Miura', 82: '33 Stradale', 79: 'Valour', 8: '33 Stradale', 68: 'Cobra', 49: 'SLR 722 S', 35: '300 SL', 19: 'SF90', 70: 'Ford GT', 41: '300 SLR', 36: '612 TR', 76: 'Pantera' };
  var MULTI = { 41: true }; // frames with more than one car

  function heroClock(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  function cardClock(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    if (s >= 86400) return d + 'd ' + h + 'h';
    return pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  // board: 8 cells. Under a day hh:mm:ss, otherwise "2D 14:37" (days, hours, minutes)
  function boardClock(s) {
    if (s <= 0) return ' CLOSED ';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    if (s >= 86400) return (d + 'D ' + pad(h) + ':' + pad(m)).padStart(8, ' ');
    return pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  function srClock(s) {
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0;
    var p = function (n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); };
    return s <= 0 ? 'Closed' : (d ? p(d, 'day') + ' ' : '') + p(h, 'hour') + ' ' + p(m, 'minute');
  }
  var statusOf = function (l) {
    var s = left(l);
    if (s <= 0) return 'Hammer down';
    if (s < 3600) return 'Final hour';
    return l.reserve === 'no' ? 'No reserve' : l.reserve === 'met' ? 'Reserve met' : 'Reserve not met';
  };

  /* ---------- split flaps ---------- */
  var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$';
  function flipLayers(host, oldTxt, newTxt, cls, dur) {
    // stop a flip in progress and land it
    if (host._flip) host._flip();
    var t = host.querySelector(cls + '.t'), b = host.querySelector(cls + '.b');
    t.textContent = newTxt;
    if (!motion) { b.textContent = newTxt; return; }
    var f1 = document.createElement('span'), f2 = document.createElement('span');
    f1.className = cls.slice(1) + ' t f1'; f2.className = cls.slice(1) + ' b f2';
    f1.textContent = oldTxt; f2.textContent = newTxt;
    f2.style.transform = 'rotateX(90deg)';
    host.appendChild(f1); host.appendChild(f2);
    var done = false;
    var land = function () { if (done) return; done = true; b.textContent = newTxt; f1.remove(); f2.remove(); host._flip = null; };
    host._flip = land;
    var d = dur || 150;
    f1.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: d, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'forwards' });
    var a2 = f2.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: d * 1.15, delay: d, easing: 'cubic-bezier(0,.55,.45,1)', fill: 'forwards' });
    a2.onfinish = land;
  }
  function Cell(el) { this.el = el; this.v = ''; }
  Cell.prototype.set = function (ch, anim) {
    if (ch === ' ') ch = '';
    if (ch === this.v) return;
    var old = this.v; this.v = ch;
    if (!anim) { if (this.el._flip) this.el._flip(); $('.t', this.el).textContent = ch; $('.b', this.el).textContent = ch; return; }
    flipLayers(this.el, old, ch, 'span', 130);
  };
  Cell.prototype.spin = function (ch, steps, delay) {
    var self = this;
    if (!motion) { this.set(ch, false); return; }
    var seq = [];
    for (var i = 0; i < steps; i++) seq.push(CHARSET[Math.random() * CHARSET.length | 0]);
    seq.push(ch === ' ' ? '' : ch);
    seq.forEach(function (c, i) { setTimeout(function () { self.v = '\u0000'; self.set(c, true); }, delay + i * 95); });
  };
  function Flaps(host, n, opts) {
    opts = opts || {};
    this.host = host; this.n = n; this.cells = [];
    host.textContent = '';
    for (var i = 0; i < n; i++) {
      var c = document.createElement('span');
      c.className = 'fl' + (opts.cls ? ' ' + opts.cls : '');
      c.innerHTML = '<span class="t"></span><span class="b"></span>';
      host.appendChild(c);
      this.cells.push(new Cell(c));
    }
  }
  Flaps.prototype.fit = function (s, right) { s = String(s).toUpperCase(); return right ? s.padStart(this.n, ' ').slice(-this.n) : s.padEnd(this.n, ' ').slice(0, this.n); };
  Flaps.prototype.set = function (s, anim, right) { var v = this.fit(s, right); this.cells.forEach(function (c, i) { c.set(v[i], anim); }); };
  Flaps.prototype.spin = function (s, delay, right) { var v = this.fit(s, right); this.cells.forEach(function (c, i) { c.spin(v[i], 2 + (Math.random() * 3 | 0), delay + i * 28); }); };
  Flaps.prototype.cls = function (k, on) { this.cells.forEach(function (c) { c.el.classList.toggle(k, on); }); };

  // a whole-word flap (titles and status), sized by an invisible copy of its text
  function WordFlap(host) {
    this.host = host; this.v = '';
    host.classList.add('wfl');
    host.innerHTML = '<span class="sz"></span><span class="ly t"></span><span class="ly b"></span>';
  }
  WordFlap.prototype.set = function (s, anim) {
    if (s === this.v) return;
    var old = this.v; this.v = s;
    $('.sz', this.host).textContent = s || ' ';
    if (!anim) { if (this.host._flip) this.host._flip(); $('.ly.t', this.host).textContent = s; $('.ly.b', this.host).textContent = s; return; }
    flipLayers(this.host, old, s, '.ly', 210);
  };

  /* ---------- watch ---------- */
  var watched = new Set(store.get('gla-watch') || []);
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-watch]');
    if (!b) return;
    var id = Number(b.dataset.watch);
    if (watched.has(id)) watched.delete(id); else watched.add(id);
    store.set('gla-watch', Array.from(watched));
    syncWatch();
  });

  /* =========================================================
     1. THE ROSTRUM
     ========================================================= */
  var ev = $('#ev'), frame = $('#ev-frame'), scene = $('#ev-scene'), hall = $('#ev-hall'), car = $('#ev-car');
  var call = $('#ev-call'), word = $('#ev-word'), curtain = $('#ev-curtain');
  var idx = 0, busy = false, queued = null;
  var order = $('#ev-order');

  lots.forEach(function (l, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.textContent = pad(l.lot);
    b.setAttribute('aria-label', 'Lot ' + l.lot + ': ' + nameOf(l));
    b.dataset.i = i;
    b.addEventListener('click', function () { go(i); });
    li.appendChild(b); order.appendChild(li);
  });

  function splitWord(txt) {
    word.textContent = '';
    word.setAttribute('data-txt', txt);
    txt.split('').forEach(function (c) {
      var s = document.createElement('span');
      s.className = 'ch' + (c === ' ' ? ' ch--sp' : '');
      s.textContent = c === ' ' ? ' ' : c;
      word.appendChild(s);
    });
  }

  function layout() {
    var l = lots[idx], box = l.stage_box || l.car_box;
    var fw = frame.clientWidth, fh = frame.clientHeight;
    if (!fw || !fh) return;
    var bw = box[2] - box[0];
    // the car takes ~44% of a wide frame and ~80% of a phone frame
    var t = fw >= 1100 ? 0.44 : fw <= 480 ? 0.8 : 0.8 - (fw - 480) / 620 * 0.36;
    var coverW = Math.max(fw, fh * AR);
    var sw = Math.min(Math.max(coverW, fw * t / bw), coverW * 2.2), sh = sw / AR;
    var cx = (box[0] + box[2]) / 2 * sw, cy = (box[1] + box[3]) / 2 * sh;
    var sl = Math.min(0, Math.max(fw - sw, fw / 2 - cx));
    var st = Math.min(0, Math.max(fh - sh, fh * 0.6 - cy));
    var ss = scene.style;
    ss.left = sl + 'px'; ss.top = st + 'px'; ss.width = sw + 'px'; ss.height = sh + 'px'; ss.right = 'auto'; ss.bottom = 'auto';
    scene.classList.add('is-laid');

    // the called name: as wide as the frame allows, its lower part behind the car
    var gut = parseFloat(getComputedStyle(ev).getPropertyValue('--gut')) || 24;
    word.style.fontSize = '100px';
    var w100 = word.getBoundingClientRect().width || 1;
    var carTop = st + box[1] * sh, carH = (box[3] - box[1]) * sh;
    var fs = Math.min((fw - gut * 1.2) / w100 * 100, fh * 0.46, 380, carH * 1.6);
    fs = Math.max(fs, 48);
    var lineH = fs * 0.78;
    var top = carTop + carH * (fw < 760 ? 0.44 : 0.58) - lineH;
    var minTop = fw < 760 ? 52 : 70;
    if (top < minTop) top = minTop;
    word.style.fontSize = fs.toFixed(1) + 'px';
    call.style.left = (-sl) + 'px';
    call.style.right = 'auto';
    call.style.width = fw + 'px';
    call.style.top = (top - st) + 'px';
  }

  function fill(l) {
    var name = nameOf(l);
    $('#ev-title').textContent = headline(l);
    $('#ev-sub').textContent = l.chassis + ' · ' + l.location;
    $('#ev-no').textContent = pad(l.lot);
    $('#ev-on').textContent = 'Lot ' + pad(l.lot);
    $('#ev-bid').textContent = money(l.current_bid);
    $('#ev-reserve').textContent = reserveWord(l.reserve);
    $('#ev-meta').textContent = l.bid_count + ' bids · ' + l.watchers + ' watching';
    $('#ev-clock').dataset.ends = l.feed_id;
    $('#ev-view').href = 'lot.html?id=' + l.feed_id;
    $('#ev-view').setAttribute('aria-label', 'View lot ' + l.lot + ', ' + name);
    var w = $('#ev-watch'); w.dataset.watch = l.feed_id; w.setAttribute('aria-label', 'Watch ' + name);
    $('#ev-capcar').textContent = MULTI[l.feed_id] ? 'Cars' : 'Car';
    car.alt = name + (MULTI[l.feed_id] ? ' with a second car' : '') + ', staged on a low platform in a hall';
    $$('button', order).forEach(function (b, i) { b.setAttribute('aria-current', String(i === idx)); });
    syncWatch(); tickHero();
  }

  var loaded = {};
  function load(src) {
    if (loaded[src]) return loaded[src];
    loaded[src] = new Promise(function (res) {
      var im = new Image();
      im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).then(res, res); };
      im.onerror = res;
      im.src = src;
    });
    return loaded[src];
  }
  var cutOf = function (l) { return 'assets/stage/car-cut-' + l.feed_id + '.webp'; };
  function preloadAround() {
    [1, -1].forEach(function (d) { var l = lots[(idx + d + lots.length) % lots.length]; load(l.stage_image); load(cutOf(l)); });
  }

  function go(n) {
    n = (n + lots.length) % lots.length;
    if (n === idx && !busy) return;
    if (busy) { queued = n; return; }
    busy = true;
    var l = lots[n];
    var ready = Promise.all([load(l.stage_image), load(cutOf(l))]);
    var swap = function () {
      idx = n;
      hall.src = l.stage_image; car.src = cutOf(l);
      splitWord(CALL[l.feed_id] || l.model);
      layout(); fill(l);
    };
    var finish = function () {
      busy = false; preloadAround();
      if (queued !== null && queued !== idx) { var q = queued; queued = null; go(q); } else queued = null;
    };
    if (!motion) { ready.then(function () { swap(); finish(); }); return; }

    var chars = $$('.ch', word);
    chars.forEach(function (c, i) {
      c.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(105%)' }], { duration: 300, delay: i * 18, easing: 'cubic-bezier(.6,0,.9,.4)', fill: 'forwards' });
    });
    curtain.style.transformOrigin = '50% 0';
    var down = curtain.animate([{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 440, delay: 140, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
    Promise.all([ready, down.finished]).then(function () {
      swap();
      var nc = $$('.ch', word);
      nc.forEach(function (c) { c.style.transform = 'translateY(105%)'; });
      curtain.style.transformOrigin = '50% 100%';
      var up = curtain.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 620, delay: 60, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' });
      setTimeout(function () {
        nc.forEach(function (c, i) {
          var a = c.animate([{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { duration: 760, delay: i * 42, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
          a.onfinish = function () { c.style.transform = ''; a.cancel(); };
        });
      }, 330);
      up.finished.then(function () { down.cancel(); up.cancel(); curtain.style.transform = 'scaleY(0)'; finish(); });
    });
  }

  $('#ev-prev').addEventListener('click', function () { go((queued !== null ? queued : idx) - 1); });
  $('#ev-next').addEventListener('click', function () { go((queued !== null ? queued : idx) + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var a = document.activeElement;
    if (a && (/^(INPUT|SELECT|TEXTAREA)$/.test(a.tagName) || a.isContentEditable)) return;
    var r = ev.getBoundingClientRect();
    var inHero = ev.contains(a) || (r.bottom > window.innerHeight * 0.35 && r.top < window.innerHeight * 0.5);
    if (!inHero) return;
    e.preventDefault();
    go((queued !== null ? queued : idx) + (e.key === 'ArrowRight' ? 1 : -1));
  });
  // swipe on the scene (phones)
  (function () {
    var x0 = null, y0 = null;
    frame.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    frame.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    }, { passive: true });
  })();

  splitWord(CALL[lots[0].feed_id]);
  fill(lots[0]);
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  var rz;
  window.addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(layout); });
  window.addEventListener('load', preloadAround);

  function tickHero() {
    var l = lots[idx], s = left(l), c = $('#ev-clock');
    c.textContent = heroClock(s);
    c.classList.toggle('is-urgent', s > 0 && s < 3600);
    c.setAttribute('aria-label', 'Time left: ' + srClock(s));
    $$('button', order).forEach(function (b, i) { var x = left(lots[i]); b.classList.toggle('is-urgent', x > 0 && x < 3600); });
  }

  /* =========================================================
     2. THE BOARD
     ========================================================= */
  var boardRows = $('#board-rows'), boardAwake = false, rowsById = {}, boardKey = '';
  var titleFlaps = new Flaps($('#board-word'), 13);
  var soonest = function () { return lots.filter(open).sort(function (a, b) { return left(a) - left(b); }); };

  function makeRow(l) {
    var tr = document.createElement('tr');
    tr.setAttribute('role', 'row');
    tr.innerHTML =
      '<td role="cell" class="c-lot"><span class="sr"></span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td role="cell" class="c-title"><a></a></td>' +
      '<td role="cell" class="c-bid" data-k="Current bid"><span class="sr"></span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td role="cell" class="c-time" data-k="Time left"><span class="sr"></span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td role="cell" class="c-st"><span class="sr"></span><span aria-hidden="true"></span></td>';
    var a = $('.c-title a', tr);
    a.href = 'lot.html?id=' + l.feed_id;
    var tsr = document.createElement('span'); tsr.className = 'sr'; tsr.textContent = headline(l);
    var tv = document.createElement('span'); tv.setAttribute('aria-hidden', 'true');
    a.appendChild(tsr); a.appendChild(tv);
    var row = {
      tr: tr, l: l,
      lot: new Flaps($('.c-lot .flaps', tr), 2, { cls: 'is-gold' }),
      title: new WordFlap(tv),
      bid: new Flaps($('.c-bid .flaps', tr), 10),
      time: new Flaps($('.c-time .flaps', tr), 8),
      st: new WordFlap($('.c-st span[aria-hidden]', tr))
    };
    $('.c-lot .sr', tr).textContent = 'Lot ' + l.lot;
    rowsById[l.feed_id] = row;
    return row;
  }
  function rowValues(r) {
    var l = r.l, s = left(l);
    return { lot: pad(l.lot), title: headline(l), bid: money(l.current_bid), time: boardClock(s), st: statusOf(l), urgent: s > 0 && s < 3600 };
  }
  function paintRow(r, mode) { // mode: 'set' | 'flip' | 'spin'
    var v = rowValues(r), tr = r.tr;
    $('.c-bid .sr', tr).textContent = v.bid;
    $('.c-time .sr', tr).textContent = srClock(left(r.l));
    $('.c-st .sr', tr).textContent = v.st;
    tr.classList.toggle('is-urgent', v.urgent);
    r.time.cls('is-urgent', v.urgent);
    r.st.host.classList.toggle('is-urgent', v.urgent);
    if (mode === 'spin') {
      var d = r.delay || 0;
      r.lot.spin(v.lot, d, true); r.bid.spin(v.bid, d + 80, true); r.time.spin(v.time, d + 160, true);
      setTimeout(function () { r.title.set(v.title, motion); }, d + 120);
      setTimeout(function () { r.st.set(v.st, motion); }, d + 300);
      return;
    }
    var anim = mode === 'flip' && motion;
    r.lot.set(v.lot, anim, true); r.bid.set(v.bid, anim, true); r.time.set(v.time, anim, true);
    r.title.set(v.title, anim); r.st.set(v.st, anim);
  }
  function buildBoard(spin) {
    var list = soonest().slice(0, 6);
    boardKey = list.map(function (l) { return l.feed_id; }).join(',');
    boardRows.textContent = ''; rowsById = {};
    list.forEach(function (l, i) {
      var r = makeRow(l);
      boardRows.appendChild(r.tr);
      if (spin) { r.delay = i * 140; paintRow(r, 'spin'); }
      else if (boardAwake || !motion) paintRow(r, 'set');
    });
    $('#live-count').textContent = lots.filter(open).length;
  }
  function wakeBoard() {
    if (boardAwake) return;
    boardAwake = true;
    titleFlaps.spin('NEXT TO CLOSE', 0);
    buildBoard(true);
  }
  function tickBoard() {
    var list = soonest().slice(0, 6), key = list.map(function (l) { return l.feed_id; }).join(',');
    if (key !== boardKey) { buildBoard(boardAwake && motion); return; }
    if (!boardAwake && motion) return;
    list.forEach(function (l) { paintRow(rowsById[l.feed_id], 'flip'); });
  }
  if (!motion) { titleFlaps.set('NEXT TO CLOSE', false); boardAwake = true; buildBoard(false); }
  else {
    buildBoard(false);
    if ('IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { wakeBoard(); bio.disconnect(); } }); }, { threshold: 0.25 });
      bio.observe($('.board'));
    } else wakeBoard();
  }

  /* simulated sample bids, so the board shows what a live evening looks like */
  function increment(b) { return b < 500000 ? 5000 : b < 1000000 ? 10000 : 25000; }
  function simBid() {
    var pool = soonest().slice(0, 6);
    if (pool.length) {
      var l = pool[Math.random() * pool.length | 0];
      l.current_bid += increment(l.current_bid);
      l.bid_count += 1;
      if (left(l) < 120) l.endAt = Date.now() + 120000; // proposed rule: back to two minutes
      var r = rowsById[l.feed_id];
      if (r && boardAwake) {
        paintRow(r, 'flip');
        r.tr.classList.add('is-bid');
        setTimeout(function () { r.tr.classList.remove('is-bid'); }, 1600);
      }
      if (lots[idx] === l) {
        $('#ev-bid').textContent = money(l.current_bid);
        $('#ev-meta').textContent = l.bid_count + ' bids · ' + l.watchers + ' watching';
      }
      var card = $('.card[data-id="' + l.feed_id + '"]');
      if (card) $('.card__bid', card).textContent = money(l.current_bid);
    }
    setTimeout(simBid, 7000 + Math.random() * 6000);
  }
  setTimeout(simBid, 6000);

  /* =========================================================
     3. HOW THE HAMMER FALLS
     ========================================================= */
  var sim = $('#sim'), simFlaps = new Flaps($('#sim-flaps'), 4), simT = 12, simRun = false, simTimer = null, simBids = 0;
  simFlaps.cells[1].el.classList.add('fl--p');
  var simBtn = $('#sim-bid'), simLog = $('#sim-log');
  var mmss = function (t) { return Math.floor(t / 60) + ':' + pad(t % 60); };
  function simPaint(anim) {
    var s = mmss(simT); // "0:12" or "2:00"
    simFlaps.set(s, anim, true);
    var mi = Math.floor(simT / 60), se = simT % 60;
    $('#sim-sr').textContent = mi + (mi === 1 ? ' minute ' : ' minutes ') + se + (se === 1 ? ' second' : ' seconds') + ' left';
    $('#sim-bar').style.transform = 'scaleX(' + Math.max(0.002, simT / 120) + ')';
    sim.classList.toggle('is-urgent', simT > 0 && simT <= 15);
  }
  function simStepOn(k) { $$('#sim-steps li').forEach(function (li) { li.classList.toggle('is-on', li.dataset.step === k); }); }
  function simStep() {
    simT = Math.max(0, simT - 1);
    simPaint(true);
    if (simT === 0) {
      clearInterval(simTimer); simRun = false;
      sim.classList.add('is-sold');
      simBtn.disabled = true; simStepOn('sold');
      simLog.innerHTML = 'Two full minutes passed without a bid. <b>The hammer falls:</b> the lot is sold to the highest bidder.';
    }
  }
  function simStart(fromT) {
    clearInterval(simTimer);
    simT = fromT; simBids = 0; simRun = true;
    sim.classList.remove('is-sold'); simBtn.disabled = false;
    simPaint(false); simStepOn('final');
    simLog.textContent = 'The lot is in its final seconds. Place a bid and watch the clock.';
    simTimer = setInterval(simStep, 1000);
  }
  simBtn.addEventListener('click', function () {
    if (!simRun) return;
    var was = mmss(simT);
    simBids++;
    simT = 120; simPaint(true); simStepOn('bid');
    clearInterval(simTimer); simTimer = setInterval(simStep, 1000);
    simLog.innerHTML = 'Bid placed with <b>' + was + '</b> left. The clock goes back to <b>2:00</b>.' + (simBids > 1 ? ' (' + simBids + ' bids so far.)' : '');
  });
  $('#sim-reset').addEventListener('click', function () { simStart(12); });
  simPaint(false);
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { simStart(12); sio.disconnect(); } }); }, { threshold: 0.5 });
    sio.observe(sim);
  } else simStart(12);

  /* =========================================================
     4. THE CATALOGUE
     ========================================================= */
  var cardsEl = $('#cards'), tpl = $('#tpl-card');
  lots.forEach(function (l) {
    var n = tpl.content.firstElementChild.cloneNode(true), name = nameOf(l), box = l.stage_box || l.car_box;
    n.dataset.id = l.feed_id;
    $$('a', n).forEach(function (a) { a.href = 'lot.html?id=' + l.feed_id; });
    var img = $('.card__img img', n);
    img.src = l.stage_image || l.image;
    img.style.objectPosition = focus(box);
    img.style.transformOrigin = focus(box);
    img.style.setProperty('--z', Math.max(1, Math.min(1.55, 0.68 / (box[2] - box[0]))).toFixed(3));
    $('.card__lot', n).textContent = 'Lot ' + pad(l.lot);
    $('.card__name a', n).textContent = headline(l);
    $('.card__chassis', n).textContent = l.chassis + ' · ' + reserveWord(l.reserve);
    $('.card__bid', n).textContent = money(l.current_bid);
    var t = $('.card__time', n); t.dataset.ends = l.feed_id;
    var w = $('.watch', n); w.dataset.watch = l.feed_id; w.setAttribute('aria-label', 'Watch ' + name);
    if (motion) n.classList.add('is-pre');
    cardsEl.appendChild(n);
  });
  // make filter
  var makes = {};
  lots.forEach(function (l) { makes[l.make] = (makes[l.make] || 0) + 1; });
  Object.keys(makes).sort().forEach(function (m) {
    var o = document.createElement('option'); o.value = m; o.textContent = m + ' (' + makes[m] + ')'; $('#f-make').appendChild(o);
  });

  var sortBy = 'ending', fMake = '', fNR = false, query = '';
  var SORTS = {
    ending: function (a, b) { return left(a) - left(b); },
    // newly listed: no listing date in the feed yet, so the longest time left stands in for it
    new: function (a, b) { return left(b) - left(a); },
    low: function (a, b) { return a.current_bid - b.current_bid; }
  };
  function applyCatalogue(animate) {
    var cards = $$('.card', cardsEl);
    var first = {};
    if (animate && motion) cards.forEach(function (c) { if (!c.hidden) first[c.dataset.id] = c.getBoundingClientRect(); });
    var q = query.trim().toLowerCase();
    var list = lots.slice().sort(SORTS[sortBy]);
    var shown = 0;
    list.forEach(function (l) {
      var c = $('.card[data-id="' + l.feed_id + '"]', cardsEl);
      var ok = open(l) && (!fMake || l.make === fMake) && (!fNR || l.reserve === 'no') &&
        (!q || (headline(l) + ' ' + l.chassis).toLowerCase().indexOf(q) > -1);
      c.hidden = !ok;
      if (ok) shown++;
      cardsEl.appendChild(c);
    });
    var live = lots.filter(open).length;
    $('#cat-count').innerHTML = shown === live ? '<b>' + live + '</b> auctions live' : '<b>' + shown + '</b> of ' + live + ' auctions live';
    var empty = $('#cards-empty');
    empty.hidden = shown > 0;
    if (!shown) {
      empty.innerHTML = '';
      empty.append(q ? 'No live lot matches “' + query.trim() + '” with these filters. ' : 'No live lot matches these filters. ');
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn--line btn--sm'; b.textContent = 'Clear filters';
      b.style.marginLeft = '8px';
      b.addEventListener('click', clearFilters);
      empty.appendChild(b);
    }
    if (animate && motion) {
      cards.forEach(function (c) {
        if (c.hidden) return;
        c.classList.remove('is-pre');
        var f = first[c.dataset.id], r = c.getBoundingClientRect();
        if (f) {
          var dx = f.left - r.left, dy = f.top - r.top;
          if (dx || dy) c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 620, easing: 'cubic-bezier(.22,.8,.2,1)' });
        } else c.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.22,.8,.2,1)' });
      });
    }
  }
  function clearFilters() {
    fMake = ''; fNR = false; query = '';
    $('#f-make').value = ''; $('#f-nr').checked = false; $('#q').value = ''; $('#q2').value = '';
    applyCatalogue(true);
  }
  $$('.tools__sort button').forEach(function (b) {
    b.addEventListener('click', function () {
      sortBy = b.dataset.sort;
      $$('.tools__sort button').forEach(function (x) { x.setAttribute('aria-checked', String(x === b)); x.tabIndex = x === b ? 0 : -1; });
      applyCatalogue(true);
    });
    b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1;
  });
  $('.tools__sort').addEventListener('keydown', function (e) { // radiogroup arrow keys
    if (!/^Arrow(Left|Right|Up|Down)$/.test(e.key)) return;
    e.preventDefault(); e.stopPropagation();
    var bs = $$('.tools__sort button'), i = bs.indexOf(document.activeElement);
    var n = bs[(i + (/Right|Down/.test(e.key) ? 1 : -1) + bs.length) % bs.length];
    n.focus(); n.click();
  });
  $('#f-make').addEventListener('change', function () { fMake = this.value; applyCatalogue(true); });
  $('#f-nr').addEventListener('change', function () { fNR = this.checked; applyCatalogue(true); });
  var onSearch = function (e) {
    query = e.target.value;
    if (e.target.id === 'q') $('#q2').value = query; else $('#q').value = query;
    applyCatalogue(false);
    $$('.card.is-pre', cardsEl).forEach(function (c) { c.classList.remove('is-pre'); });
    if (query.trim()) { var c = $('#catalogue'); if (c.getBoundingClientRect().top > window.innerHeight * 0.5) scrollToEl(c); }
  };
  $('#q').addEventListener('input', onSearch);
  $('#q2').addEventListener('input', onSearch);
  $('#q').addEventListener('keydown', function (e) { if (e.key === 'Escape') { this.value = ''; onSearch({ target: this }); } });
  applyCatalogue(false);

  if (motion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var c = e.target; cio.unobserve(c);
        c.style.transitionDelay = (k++ * 90) + 'ms';
        c.classList.remove('is-pre');
        setTimeout(function () { c.style.transitionDelay = ''; }, 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.card', cardsEl).forEach(function (c) { cio.observe(c); });
  } else $$('.card', cardsEl).forEach(function (c) { c.classList.remove('is-pre'); });

  function tickCards() {
    $$('.card', cardsEl).forEach(function (c) {
      var l = byId[c.dataset.id], s = left(l), t = $('.card__time', c);
      t.textContent = cardClock(s);
      t.classList.toggle('is-urgent', s > 0 && s < 3600);
      var tags = $('.card__tags', c), want = [];
      if (s > 0 && s < 3600) want.push(['Final hour', 'tag tag--urgent']);
      if (l.reserve === 'no') want.push(['No reserve', 'tag']);
      var key = want.map(function (x) { return x[0]; }).join('|');
      if (tags.dataset.k !== key) {
        tags.dataset.k = key; tags.textContent = '';
        want.forEach(function (x) { var s2 = document.createElement('span'); s2.className = x[1]; s2.textContent = x[0]; tags.appendChild(s2); });
      }
    });
  }

  /* =========================================================
     6. RECENTLY SOLD
     ========================================================= */
  var sheet = $('#sheet');
  sold.forEach(function (s) {
    var li = document.createElement('li'), name = s.year + ' ' + s.make + ' ' + s.model;
    li.innerHTML = '<img alt="" loading="lazy" width="1920" height="1280" decoding="async"><div><h3 class="sheet__name"></h3><p class="sheet__ch"></p></div><p class="sheet__res"><span>Sold for · sample</span><b></b></p>';
    var im = $('img', li); im.src = s.image; im.alt = name + ', photographed at Patton Motors'; im.style.objectPosition = focus(s.car_box);
    $('.sheet__name', li).textContent = name;
    $('.sheet__ch', li).textContent = s.chassis;
    $('.sheet__res b', li).textContent = money(s.result);
    sheet.appendChild(li);
  });

  /* =========================================================
     7. FORMS (prototype: nothing is sent)
     ========================================================= */
  var vin = $('#vin');
  vin.addEventListener('input', function () { var p = vin.selectionStart; vin.value = vin.value.toUpperCase(); vin.setSelectionRange(p, p); vin.removeAttribute('aria-invalid'); });
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = vin.value.trim().toUpperCase(), msg = $('#vinmsg');
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) {
      vin.removeAttribute('aria-invalid'); msg.className = 'vinform__msg is-ok';
      msg.textContent = 'VIN accepted. In the live product, Golden Lion would contact you about a specialist visit. Prototype: nothing was sent.';
    } else {
      vin.setAttribute('aria-invalid', 'true'); msg.className = 'vinform__msg is-err';
      msg.textContent = v ? 'A VIN has 17 letters and numbers, without I, O or Q. Classic chassis numbers are handled by a specialist.' : 'Enter the 17-character VIN to begin.';
      vin.focus();
    }
  });
  var dm = $('#dmail');
  dm.addEventListener('input', function () { dm.removeAttribute('aria-invalid'); });
  $('#dispatch').addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = $('#dmsg');
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(dm.value.trim())) {
      dm.removeAttribute('aria-invalid'); msg.className = 'dispatch__msg is-ok';
      msg.textContent = 'Thank you. Prototype: nothing was sent and no address was stored.';
    } else {
      dm.setAttribute('aria-invalid', 'true'); msg.className = 'dispatch__msg is-err';
      msg.textContent = 'Enter an email address, like name@example.com.';
      dm.focus();
    }
  });

  /* ---------- phone menu ---------- */
  var mbtn = $('#menu-btn'), panel = $('#menu-panel');
  mbtn.addEventListener('click', function () { var on = panel.hidden; panel.hidden = !on; mbtn.setAttribute('aria-expanded', String(on)); });
  $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { panel.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { panel.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); mbtn.focus(); } });

  /* ---------- the clock ---------- */
  function tick() { tickHero(); tickBoard(); tickCards(); }
  syncWatch(); tick();
  setInterval(tick, 1000);

  /* =========================================================
     MOTION: Lenis + one scrubbed depth move (the called name sinks behind the car)
     ========================================================= */
  var lenis = null;
  function scrollToEl(el) {
    if (lenis) lenis.scrollTo(el, { offset: -parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  window.addEventListener('load', function () {
    if (reduce || !window.gsap || !window.ScrollTrigger) return;
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    if (window.Lenis) {
      lenis = new window.Lenis({ autoRaf: false, anchors: { offset: -parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) } });
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    var mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', function () {
      // the name drifts down behind the car as the hall scrolls away: the depth is read, not told
      gsap.to('#ev-word', { y: function () { return frame.clientHeight * 0.14; }, ease: 'none', scrollTrigger: { trigger: '#ev', start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
      gsap.to('#ev-scene', { scale: 1.05, transformOrigin: '50% 60%', ease: 'none', scrollTrigger: { trigger: '#ev', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.fromTo('.ver__cut img', { xPercent: -3 }, { xPercent: 2, ease: 'none', scrollTrigger: { trigger: '.ver', start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.fromTo('.consign__stage img', { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.consign', start: 'top bottom', end: 'top top', scrub: true } });
    });
    ST.refresh();
  });
})();
