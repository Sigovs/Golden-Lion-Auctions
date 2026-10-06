/* Golden Lion Auctions — HOME v9.
   Data: data/lots.js (window.GLA). Bids, timers, counts, reserve states and results are SAMPLE DATA.
   Every section is static HTML; this file hydrates it: clocks, watch, the lot caller, the split-flap board,
   the catalogue tools, the VIN anatomy, prices realised, the forms. Then, when motion is allowed, Lenis and a
   small set of scroll moves (see MOTION). "How the hammer falls" is js/v9-hammer.js (v7 logic).
   Clocks are information: they tick under reduced motion too. */
(function () {
  'use strict';
  var D = window.GLA;
  if (!D) return;
  var root = document.documentElement;
  var lots = D.lots, sold = D.sold;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var waapi = !reduce && typeof Element.prototype.animate === 'function';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pad = function (n) { return String(Math.floor(n)).padStart(2, '0'); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var store = {
    get: function (k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: watch lasts this visit */ } }
  };

  /* ---------- data ---------- */
  var T0 = Date.now(), byId = {};
  lots.forEach(function (l) { l.endAt = T0 + l.ends_in * 1000; byId[l.feed_id] = l; });
  var left = function (l) { return Math.max(0, (l.endAt - Date.now()) / 1000); };
  var open = function (l) { return left(l) > 0; };
  var nameOf = function (l) { return l.year + ' ' + l.make + ' ' + l.model; };
  var headline = function (l) { return (l.reserve === 'no' ? 'No Reserve: ' : '') + (l.mileage ? l.mileage.toLocaleString('en-US') + '-Mile ' : '') + nameOf(l); };
  var headlineHtml = function (l) {
    return (l.reserve === 'no' ? 'No Reserve: ' : '') + (l.mileage ? '<span class="nw">' + l.mileage.toLocaleString('en-US') + '-Mile</span> ' : '') +
      esc(nameOf(l)).replace(/(Mercedes-Benz|S-Klub)/g, '<span class="nw">$1</span>');
  };
  var resWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Reserve not yet met'; };
  var soonest = function () { return lots.filter(open).sort(function (a, b) { return left(a) - left(b); }); };

  /* ---------- clocks ---------- */
  function fmtClock(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    return (d ? d + 'd ' : '') + pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  function fmtShort(s) {
    if (s <= 0) return 'Closed';
    if (s >= 86400) return (s / 86400 | 0) + 'd ' + ((s % 86400) / 3600 | 0) + 'h';
    if (s >= 3600) return (s / 3600 | 0) + 'h ' + pad((s % 3600) / 60) + 'm';
    return pad(s / 60) + ':' + pad(s % 60);
  }
  function fmtBoard(s) {             // eight cells: "2D 14:37" over a day, otherwise hh:mm:ss
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
  function tickClocks() {
    var live = lots.filter(open).length;
    $$('[data-live]').forEach(function (b) { if (b.textContent !== String(live)) b.textContent = live; });
    $$('[data-ends]').forEach(function (el) {
      var l = byId[el.dataset.ends]; if (!l) return;
      var mode = el.dataset.mode; if (mode === 'board') return;
      var s = left(l);
      el.textContent = mode === 'short' ? fmtShort(s) : fmtClock(s);
      var urgent = s > 0 && s < 3600;
      var box = el.closest('[data-tbox]');
      if (box) {
        box.classList.toggle('is-urgent', urgent);
        var dt = $('dt', box);
        if (dt && box.classList.contains('row__time')) {
          var want = s <= 0 ? 'Auction' : urgent ? 'Ending soon' : 'Time left';
          if (dt.textContent !== want) dt.textContent = want;
        }
      } else el.classList.toggle('is-urgent', urgent);
    });
  }

  /* ---------- header, toast, register, menu ---------- */
  var topEl = $('#top');
  var topH = function () { return topEl ? topEl.offsetHeight : 0; };
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); mbtn.focus(); } });

  /* ---------- watch ---------- */
  var watched = new Set(store.get('gla-watch') || []);
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
      var t = $('.watch__t', b); if (t) t.textContent = on ? 'Watching' : 'Watch';
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

  /* =========================================================
     02 ON THE BLOCK — six lots on one track.
     Rail (phones, tablets, reduced motion): native horizontal scroll with snap; prev/next, ticks, counter.
     Pinned (>= 900 wide, motion allowed; see MOTION): vertical scroll drives the track, resting on whole lots.
     ========================================================= */
  var blk = $('#block'), view = $('#blk-view'), track = $('#blk-track'), slides = $$('.slide', track);
  var NB = slides.length, cur = -1, posEl = $('#blk-pos'), ticks = $$('.ltick', blk), stepBtns = $$('.caller__btn', blk);
  var blkPin = null;                                  // the ScrollTrigger while the track is pinned
  function setCur(i) {
    i = clamp(i, 0, NB - 1);
    if (i === cur) return;
    cur = i;
    posEl.textContent = pad(byId[slides[i].dataset.id].lot);
    ticks.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
    stepBtns[0].disabled = i <= 0; stepBtns[1].disabled = i >= NB - 1;
  }
  /* the called name: as wide as the frame allows, its lower half behind the car */
  function layoutWords() {
    slides.forEach(function (s) {
      var scn = $('.slide__scene', s), call = $('.call', s), word = $('.call__w', s), st = $('.scene__stage--front', scn);
      var fw = scn.clientWidth, fh = scn.clientHeight; if (!fw || !fh) return;
      var b = byId[s.dataset.id].stage_box, sr = st.getBoundingClientRect(), fr = scn.getBoundingClientRect();
      var carTop = sr.top - fr.top + b[1] * sr.height, carH = (b[3] - b[1]) * sr.height;
      var keep = word.style.transform; word.style.transform = '';
      word.style.fontSize = '100px';
      var w100 = word.getBoundingClientRect().width || 1;
      word.style.transform = keep;
      var gut = parseFloat(getComputedStyle(blk).getPropertyValue('--gut')) || 24;
      var fs = Math.max(48, Math.min((fw - gut * 2) / w100 * 100, fh * .44, carH * 1.75, 320));
      word.style.fontSize = fs.toFixed(1) + 'px';
      call.style.top = Math.max(fh * .04, carTop + carH * .52 - fs * .8).toFixed(1) + 'px';
    });
  }
  function goLot(i) {
    i = clamp(i, 0, NB - 1);
    if (blkPin) { scrollToY(blkPin.start + (blkPin.end - blkPin.start) * i / (NB - 1)); return; }
    setCur(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }
  ticks.forEach(function (t) { t.addEventListener('click', function () { goLot(Number(t.dataset.go)); }); });
  stepBtns.forEach(function (b) { b.addEventListener('click', function () { goLot(cur + Number(b.dataset.step)); }); });
  blk.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey || /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault(); goLot(cur + (e.key === 'ArrowRight' ? 1 : -1));
  });
  var railRaf = 0;
  track.addEventListener('scroll', function () {
    if (blkPin) return;
    cancelAnimationFrame(railRaf);
    railRaf = requestAnimationFrame(function () { setCur(Math.round(track.scrollLeft / track.clientWidth)); });
  }, { passive: true });
  /* tabbing to a lot's link brings that lot on */
  track.addEventListener('focusin', function (e) {
    var s = e.target.closest('.slide'); if (!s) return;
    view.scrollLeft = 0; if (blkPin) track.scrollLeft = 0;
    var i = slides.indexOf(s); if (i !== cur) goLot(i);
  });
  /* the six halls load before the track arrives, so no lot pops in mid-travel */
  if ('IntersectionObserver' in window) {
    var lio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; lio.disconnect();
      $$('img[loading="lazy"]', track).forEach(function (im) { im.loading = 'eager'; });
    }, { rootMargin: '100% 0px' });
    lio.observe(blk);
  }
  setCur(0);
  layoutWords();
  window.addEventListener('load', layoutWords);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutWords);
  var rz;
  window.addEventListener('resize', function () { cancelAnimationFrame(rz); rz = requestAnimationFrame(layoutWords); });
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

  /* =========================================================
     03 NEXT TO CLOSE — split flaps (v4)
     ========================================================= */
  var CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$';
  function flipLayers(host, oldTxt, newTxt, cls, dur) {
    if (host._flip) host._flip();
    var t = host.querySelector(cls + '.t'), b = host.querySelector(cls + '.b');
    t.textContent = newTxt;
    if (!waapi) { b.textContent = newTxt; return; }
    var f1 = document.createElement('span'), f2 = document.createElement('span');
    var base = cls === 'span' ? '' : cls.slice(1) + ' ';
    f1.className = base + 't f1'; f2.className = base + 'b f2';
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
    if (!waapi) { this.set(ch, false); return; }
    var seq = [];
    for (var i = 0; i < steps; i++) seq.push(CHARSET[Math.random() * CHARSET.length | 0]);
    seq.push(ch === ' ' ? '' : ch);
    seq.forEach(function (c, i) { setTimeout(function () { self.v = '\u0000'; self.set(c, true); }, delay + i * 95); });
  };
  function Flaps(host, n, cls) {
    this.n = n; this.cells = [];
    host.textContent = '';
    for (var i = 0; i < n; i++) {
      var c = document.createElement('span');
      c.className = 'fl' + (cls ? ' ' + cls : '');
      c.innerHTML = '<span class="t"></span><span class="b"></span>';
      host.appendChild(c);
      this.cells.push(new Cell(c));
    }
  }
  Flaps.prototype.fit = function (s, right) { s = String(s).toUpperCase(); return right ? s.padStart(this.n, ' ').slice(-this.n) : s.padEnd(this.n, ' ').slice(0, this.n); };
  Flaps.prototype.set = function (s, anim, right) { var v = this.fit(s, right); this.cells.forEach(function (c, i) { c.set(v[i], anim); }); };
  Flaps.prototype.spin = function (s, delay, right) { var v = this.fit(s, right); this.cells.forEach(function (c, i) { c.spin(v[i], 2 + (Math.random() * 3 | 0), delay + i * 28); }); };
  Flaps.prototype.cls = function (k, on) { this.cells.forEach(function (c) { c.el.classList.toggle(k, on); }); };
  function WordFlap(host) { this.host = host; this.v = ''; host.classList.add('wfl'); host.innerHTML = '<span class="sz"></span><span class="ly t"></span><span class="ly b"></span>'; }
  WordFlap.prototype.set = function (s, anim) {
    if (s === this.v) return;
    var old = this.v; this.v = s;
    $('.sz', this.host).textContent = s || ' ';
    if (!anim) { if (this.host._flip) this.host._flip(); $('.ly.t', this.host).textContent = s; $('.ly.b', this.host).textContent = s; return; }
    flipLayers(this.host, old, s, '.ly', 210);
  };

  var boardEl = $('#board'), boardRows = $('#board-rows'), boardAwake = false, rowsById = {}, boardKey = '';
  var titleHost = $('.board__word', boardEl);
  var titleText = titleHost.textContent;
  titleHost.className = 'board__word flaps'; titleHost.setAttribute('aria-hidden', 'true');
  titleHost.insertAdjacentHTML('beforebegin', '<span class="sr">' + titleText + '</span>');
  var titleFlaps = new Flaps(titleHost, titleText.length);
  var statusOf = function (l) { var s = left(l); return s <= 0 ? 'Hammer down' : s < 3600 ? 'Final hour' : l.reserve === 'no' ? 'No reserve' : l.reserve === 'met' ? 'Reserve met' : 'Reserve not met'; };

  function makeRow(l) {
    var tr = document.createElement('tr');
    tr.dataset.id = l.feed_id;
    tr.innerHTML =
      '<td class="c-lot"><span class="sr">Lot ' + l.lot + '</span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td class="c-title"><a href="lot.html?id=' + l.feed_id + '"><span class="sr">' + esc(headline(l)) + '</span><span aria-hidden="true"></span></a></td>' +
      '<td class="c-bid" data-k="Current bid"><span class="sr"></span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td class="c-time" data-k="Time left"><span class="sr"></span><span class="flaps" aria-hidden="true"></span></td>' +
      '<td class="c-st"><span class="sr"></span><span aria-hidden="true"></span></td>';
    var r = {
      tr: tr, l: l,
      lot: new Flaps($('.c-lot .flaps', tr), 2, 'is-gold'),
      title: new WordFlap($('.c-title a span[aria-hidden]', tr)),
      bid: new Flaps($('.c-bid .flaps', tr), 10),
      time: new Flaps($('.c-time .flaps', tr), 8),
      st: new WordFlap($('.c-st span[aria-hidden]', tr))
    };
    rowsById[l.feed_id] = r;
    return r;
  }
  function paintRow(r, mode) {
    var l = r.l, s = left(l), tr = r.tr, urgent = s > 0 && s < 3600;
    var v = { lot: pad(l.lot), title: headline(l), bid: money(l.current_bid), time: fmtBoard(s), st: statusOf(l) };
    $('.c-bid .sr', tr).textContent = v.bid;
    $('.c-time .sr', tr).textContent = srClock(s);
    $('.c-st .sr', tr).textContent = v.st;
    tr.classList.toggle('is-urgent', urgent);
    r.time.cls('is-urgent', urgent);
    r.st.host.classList.toggle('is-urgent', urgent);
    if (mode === 'spin') {
      var d = r.delay || 0;
      r.lot.spin(v.lot, d, true); r.bid.spin(v.bid, d + 80, true); r.time.spin(v.time, d + 160, true);
      setTimeout(function () { r.title.set(v.title, waapi); }, d + 120);
      setTimeout(function () { r.st.set(v.st, waapi); }, d + 300);
      return;
    }
    var anim = mode === 'flip' && waapi;
    r.lot.set(v.lot, anim, true); r.bid.set(v.bid, anim, true); r.time.set(v.time, anim, true);
    r.title.set(v.title, anim); r.st.set(v.st, anim);
  }
  function buildBoard(spin) {
    var list = soonest().slice(0, 5);
    boardKey = list.map(function (l) { return l.feed_id; }).join(',');
    boardRows.textContent = ''; rowsById = {};
    list.forEach(function (l, i) {
      var r = makeRow(l);
      boardRows.appendChild(r.tr);
      if (spin) { r.delay = i * 140; paintRow(r, 'spin'); } else paintRow(r, 'set');
    });
  }
  function tickBoard() {
    var list = soonest().slice(0, 5), key = list.map(function (l) { return l.feed_id; }).join(',');
    if (key !== boardKey) { buildBoard(false); return; }
    list.forEach(function (l) { paintRow(rowsById[l.feed_id], boardAwake && waapi ? 'flip' : 'set'); });
  }
  buildBoard(false);
  titleFlaps.set(titleText, false);
  if (waapi && 'IntersectionObserver' in window) {
    var bio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        bio.disconnect(); boardAwake = true;
        titleFlaps.cells.forEach(function (c) { c.v = '\u0000'; });
        titleFlaps.spin(titleText, 0);
        Object.keys(rowsById).forEach(function (k, i) { var r = rowsById[k]; r.delay = i * 140; r.lot.cells.concat(r.bid.cells, r.time.cells).forEach(function (c) { c.v = '\u0000'; }); paintRow(r, 'spin'); });
      });
    }, { threshold: .3 });
    bio.observe(boardEl);
  } else boardAwake = true;

  /* simulated sample bids, so the board shows what a live sale looks like; a bid in the last two minutes
     puts that lot's clock back to 2:00 (the proposed rule) */
  function increment(b) { return b < 500000 ? 5000 : b < 1000000 ? 10000 : 25000; }
  function simBid() {
    var pool = soonest().slice(0, 5);
    if (pool.length) {
      var l = pool[Math.random() * pool.length | 0];
      l.current_bid += increment(l.current_bid);
      l.bid_count += 1;
      if (left(l) < 120) l.endAt = Date.now() + 120000;
      var r = rowsById[l.feed_id];
      if (r) paintRow(r, boardAwake && waapi ? 'flip' : 'set');
      var sl = $('.slide[data-id="' + l.feed_id + '"]');
      if (sl) { $('.dd--bid dd', sl).textContent = money(l.current_bid); $('.dd--meta dd', sl).textContent = l.bid_count + ' bids · ' + l.watchers + ' watching'; }
      var row = $('.row[data-id="' + l.feed_id + '"]');
      if (row) { $('.row__data dd', row).textContent = money(l.current_bid); $$('.row__data dd', row)[2].textContent = l.bid_count; row.dataset.bid = l.current_bid; }
      if (l === lots[0]) { var hb = $('.lotbar .dd--bid dd'); if (hb) hb.textContent = money(l.current_bid); }
    }
    setTimeout(simBid, 9000 + Math.random() * 7000);
  }
  setTimeout(simBid, 8000);

  /* =========================================================
     04 THE CATALOGUE — sort, no reserve, make, search (v7)
     ========================================================= */
  var rowsEl = $('#rows'), rows = $$('.row', rowsEl), tools = $('#tools'), q = $('#q'), make = $('#make');
  var nores = tools.querySelector('input[name="noreserve"]');
  var countEl = $('#count'), emptyEl = $('#empty'), resetEl = $('#reset');
  var SORT_WORD = { ending: 'ending soonest first', 'new': 'newly listed first', low: 'lowest bid first' };
  function applyBrowse() {
    var sort = (tools.querySelector('input[name="sort"]:checked') || {}).value || 'ending';
    var m = make.value, v = q.value.trim().toLowerCase(), nr = nores.checked;
    var list = rows.slice().sort(function (a, b) {
      var la = byId[a.dataset.id], lb = byId[b.dataset.id];
      if (sort === 'low') return la.current_bid - lb.current_bid;
      // newly listed: the feed has no listing date yet, so the longest time left stands in for it
      return sort === 'new' ? left(lb) - left(la) : left(la) - left(lb);
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
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape' && q.value) { q.value = ''; applyBrowse(); } });
  tools.addEventListener('submit', function (e) { e.preventDefault(); });
  $('#clear').addEventListener('click', function () { clearBrowse(); q.focus(); });
  resetEl.addEventListener('click', function () { clearBrowse(); q.focus(); });
  applyBrowse();

  /* =========================================================
     05 VERIFIED — the VIN, read and decoded (v5)
     ========================================================= */
  var VIN = 'SCFSBGKV0RGZ10077';
  var TR = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
  var WT = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];
  function checkDigit(v) {
    var sum = 0;
    for (var i = 0; i < 17; i++) { var c = v[i]; sum += (/\d/.test(c) ? Number(c) : TR[c]) * WT[i]; }
    var r = sum % 11; return r === 10 ? 'X' : String(r);
  }
  var YEARS = 'ABCDEFGHJKLMNPRSTVWXY123456789';   // 1980 → 2009, then the cycle repeats from 2010
  function yearsFor(c) { var i = YEARS.indexOf(c); return i < 0 ? [] : [1980 + i, 2010 + i].filter(function (y) { return y <= 2039; }); }
  var cd = checkDigit(VIN);
  var GROUPS = [
    '<b>SCF</b> · world manufacturer identifier: Aston Martin.',
    '<b>SBGKV</b> · vehicle descriptor: model, body and engine codes, set by the maker.',
    '<b>0</b> · check digit. Computed from the other sixteen characters: ' + cd + '. <span class="ok">' + (cd === VIN[8] ? 'Valid.' : 'Does not match.') + '</span>',
    '<b>R</b> · model year: 2024.',
    '<b>G</b> · assembly plant code.',
    '<b>Z10077</b> · serial: this car’s production sequence.'
  ];
  var vinRow = $('.vin__row'), vinRead = $('#vin-read'), vinGrps = $$('.vin__grp', vinRow);
  var VIN_DEFAULT = 'Decoded on intake: Aston Martin, model year 2024, check digit <span class="ok">' + (cd === VIN[8] ? 'valid' : 'invalid') + '</span>. Mileage at inspection: 225.';
  vinRead.innerHTML = VIN_DEFAULT;
  function vinOn(b) {
    vinGrps.forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    vinRow.classList.add('has-active'); vinRead.innerHTML = GROUPS[Number(b.dataset.g)];
  }
  function vinOff() {
    vinRow.classList.remove('has-active');
    vinGrps.forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
    vinRead.innerHTML = VIN_DEFAULT;
  }
  vinGrps.forEach(function (b) {
    b.addEventListener('mouseenter', function () { vinOn(b); });
    b.addEventListener('focus', function () { vinOn(b); });
    b.addEventListener('click', function () { if (b.classList.contains('is-active') && b.getAttribute('aria-pressed') === 'true' && document.activeElement !== b) vinOff(); else vinOn(b); });
  });
  $('#vin-diagram').addEventListener('mouseleave', function () { if (!vinRow.contains(document.activeElement)) vinOff(); });
  vinRow.addEventListener('focusout', function (e) { if (!vinRow.contains(e.relatedTarget)) vinOff(); });

  /* =========================================================
     07 RECENTLY SOLD — prices realised select the photograph (v5)
     ========================================================= */
  var soldImg = $('#sold-img'), soldBtns = $$('.realised__row');
  var soldCur = 0, soldT;
  function showSold(b) {
    soldBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    var i = Number(b.dataset.i);
    if (i === soldCur) return;
    soldCur = i;
    var apply = function () {
      soldImg.src = b.dataset.src; soldImg.alt = b.dataset.alt;
      $('#sold-price').textContent = b.dataset.price;
      $('#sold-name').textContent = b.dataset.name;
      $('#sold-ch').textContent = b.dataset.chassis;
      soldImg.classList.remove('is-swapping');
    };
    clearTimeout(soldT);
    if (reduce) { apply(); return; }
    soldImg.classList.add('is-swapping');
    load(b.dataset.src).then(function () { soldT = setTimeout(apply, 180); });
  }
  soldBtns.forEach(function (b) {
    b.addEventListener('mouseenter', function () { showSold(b); });
    b.addEventListener('focus', function () { showSold(b); });
    b.addEventListener('click', function () { showSold(b); });
    load(b.dataset.src);
  });

  /* =========================================================
     08 CONSIGN — the VIN form (v5 + v7). Prototype: nothing is sent.
     ========================================================= */
  var vin = $('#vin'), vinMsg = $('#vin-msg'), vinLen = $('#vin-len'), vinHelp = $('#vin-help'), vinEmail = $('#vin-email');
  var HELP = vinHelp.innerHTML;
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  vin.addEventListener('input', function () {
    var p = vin.selectionStart, clean = vin.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean !== vin.value) { vin.value = clean; try { vin.setSelectionRange(p, p); } catch (e) { /* no selection */ } }
    vin.removeAttribute('aria-invalid'); vin.classList.remove('is-ok');
    vinMsg.textContent = ''; vinMsg.className = 'form-msg';
    if (clean.length === 17 && !/[IOQ]/.test(clean)) {
      var c = checkDigit(clean), ys = yearsFor(clean[9]);
      vinHelp.innerHTML = '17 of 17 · ' + (c === clean[8] ? '<span class="ok">check digit ' + c + ', valid</span>' : 'the check digit does not compute; a specialist confirms') + (ys.length ? ' · model-year code ' + clean[9] + ': ' + ys.join(' or ') : '');
    } else if (/[IOQ]/.test(clean)) {
      vinHelp.textContent = clean.length + ' of 17 · a VIN never uses I, O or Q. Check for a 1 or a 0.';
    } else { vinHelp.innerHTML = HELP; $('#vin-len').textContent = clean.length; }
  });
  vinEmail.addEventListener('input', function () { vinEmail.removeAttribute('aria-invalid'); });
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = vin.value.trim().toUpperCase(), em = vinEmail.value.trim();
    var bad = function (el, t) { el.setAttribute('aria-invalid', 'true'); vinMsg.className = 'form-msg is-error'; vinMsg.textContent = t; el.focus(); };
    if (!v) return bad(vin, 'Enter the 17-character VIN to begin.');
    if (/[IOQ]/.test(v)) return bad(vin, 'A VIN never uses I, O or Q. Check for a 1 or a 0.');
    if (v.length !== 17) return bad(vin, 'That is ' + v.length + ' characters. A VIN has 17.');
    if (em && !emailOk(em)) return bad(vinEmail, 'That email address looks incomplete.');
    vin.classList.add('is-ok');
    vinMsg.className = 'form-msg is-ok';
    vinMsg.textContent = 'VIN received' + (v.slice(0, 3) === 'SCF' ? ': SCF reads as Aston Martin' : '') + '. In the live product a Golden Lion specialist would contact you to arrange the inspection. Prototype: nothing was sent.';
  });
  void vinLen;

  /* the dispatch */
  var email = $('#email'), emailMsg = $('#email-msg');
  $('#dispatch').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = email.value.trim();
    if (!emailOk(v)) {
      email.setAttribute('aria-invalid', 'true'); emailMsg.className = 'dispatch__msg is-error';
      emailMsg.textContent = v ? 'That address looks incomplete.' : 'Enter an email address.'; email.focus(); return;
    }
    email.removeAttribute('aria-invalid'); emailMsg.className = 'dispatch__msg is-ok';
    emailMsg.textContent = 'You are on the list. Prototype: nothing was sent.';
  });
  email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });

  /* 10 the finale's live line follows the soonest lot */
  var finNext = $('#fin-next'), finClock = $('#fin-clock');
  function tickFinale() {
    var l = soonest()[0]; if (!l) return;
    if (finClock.dataset.ends !== String(l.feed_id)) {
      finClock.dataset.ends = l.feed_id;
      finNext.textContent = 'Lot ' + pad(l.lot) + ' · ' + nameOf(l);
      finNext.href = 'lot.html?id=' + l.feed_id;
    }
  }

  /* ---------- the clock ---------- */
  function tick() { tickFinale(); tickClocks(); tickBoard(); }
  tick();
  setInterval(tick, 1000);

  /* =========================================================
     ANCHORS: header offset; long jumps are immediate
     ========================================================= */
  var lenis = null;
  function scrollToY(y) {
    y = Math.max(0, y);
    var far = Math.abs(y - window.pageYOffset) > window.innerHeight * 2.5;
    if (lenis) lenis.scrollTo(y, { immediate: far || reduce, duration: 1.1 });
    else window.scrollTo({ top: y, behavior: far || reduce ? 'auto' : 'smooth' });
  }
  function yOf(el) {
    // a pinned section's spacer is where it lives in the flow
    var box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    return box.getBoundingClientRect().top + window.pageYOffset - topH();
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented) return;
    var id = a.getAttribute('href').slice(1);
    var t = id ? document.getElementById(id) : null;
    if (!t) return;
    e.preventDefault();
    if (a.hasAttribute('data-search')) { scrollToY(yOf($('#catalogue'))); setTimeout(function () { q.focus({ preventScroll: true }); }, lenis ? 0 : 0); q.focus({ preventScroll: true }); return; }
    if (id === 'top-scene') { scrollToY(0); return; }
    scrollToY(yOf(t));
    if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  });

  /* =========================================================
     MOTION. Restrained and designed; none of it exists under reduced motion or without GSAP.
     - Lenis (DNA90).
     - Pin 1 of 2 (>= 900 wide): On the block. The section holds at exactly one screen under the header; vertical
       scroll drives the track of six lots (scrub .6), and when the scroll settles it eases to the nearest whole lot,
       so a resting frame is always one complete lot. Each called name lags its car a little: depth, read not told.
       Pin 2 of 2 is the hammer (js/v9-hammer.js). The hero is a normal first screen.
     - Titles enter horizontally (a clip opening left to right, a short travel); body copy rises; key
       photographs open through a mask; ivory sheets settle as they arrive; light parallax on two images.
     ========================================================= */
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (reduce || !hasGsap) { window.__v8 = { lenis: null }; return; }
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  if (window.Lenis) {
    lenis = new window.Lenis({ autoRaf: false, anchors: false });
    lenis.on('scroll', ST.update);
    ST.addEventListener('refresh', function () { lenis.resize(); });
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var M = { title: 1.0, rise: .9, reveal: 1.3, ease: 'power3.out' };

  /* HERO INTRO (Alex, 7 Oct 2026): the lights come up in the hall, the lot is lit, then it is called.
     The whole scene settles from 1.04 (hall and car together, so the car never leaves its stage); the hall
     surfaces from the dark; the car brightens a beat later; the live line rises, the title opens left to right,
     the lede and links rise, the lot plate rises piece by piece. About 2s; every word is readable by ~1.1s.
     Skipped when the page opens scrolled (back/forward, anchors), so nobody watches an intro off screen. */
  (function heroIntro() {
    if (!root.classList.contains('intro')) return;
    if (window.scrollY > 80) { root.classList.remove('intro'); return; }
    var hero = $('.hero');
    var scene = $('.hero__scene', hero), back = $('.scene__stage--back', hero), front = $('.scene__stage--front', hero),
        cap = $('.scene__cap', hero), head = $$('.hero__head > *', hero), title = $('.hero__title', hero),
        plate = $$('.lotbar > *', hero);
    var all = [scene, back, front, cap, title].concat(head, plate);
    /* the lights come up on the photograph, not on an empty frame: wait for the hall and the car (≤ 1.2s) */
    var imgs = $$('.scene__hall, .scene__car', hero).map(function (im) {
      return im.complete && im.naturalWidth ? Promise.resolve() : (im.decode ? im.decode().catch(function () {}) : new Promise(function (r) { im.addEventListener('load', r, { once: true }); im.addEventListener('error', r, { once: true }); }));
    });
    var go = false;
    var start = function () { if (go) return; go = true; play(); };
    Promise.all(imgs).then(start); setTimeout(start, 1200);
    function play() {
    var tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      /* clear only what the intro animated: the scene's inline style carries its car box (--x0…--y1) */
      onComplete: function () { gsap.set(all, { clearProps: 'opacity,transform,translate,scale,filter,clipPath' }); root.classList.remove('intro'); }
    });
    tl.fromTo(scene, { scale: 1.04 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo(back, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.out' }, 0)
      .fromTo(front, { opacity: 0, filter: 'brightness(.35)' }, { opacity: 1, filter: 'brightness(1)', duration: 1.3, ease: 'power2.out' }, .45)
      .fromTo(head[0], { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .8 }, .25)
      .fromTo(title, { opacity: 1, x: -40, clipPath: 'inset(-10% 100% -20% 0)' }, { x: 0, clipPath: 'inset(-10% 0% -20% 0)', duration: 1.1 }, .35)
      .fromTo(head.slice(2), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .85, stagger: .1 }, .7)
      .fromTo(plate, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .9, stagger: .08 }, .95)
      .fromTo(cap, { opacity: 0 }, { opacity: 1, duration: .8 }, 1.5);
    }
  })();

  var mm = gsap.matchMedia();
  mm.add({ desk: '(min-width: 1024px) and (min-height: 640px)', any: '(min-width: 0px)' }, function (ctx) {
    var c = ctx.conditions;
    /* titles: enter horizontally, once */
    $$('.t-in').forEach(function (el) {
      gsap.fromTo(el, { x: c.desk ? -56 : -28, clipPath: 'inset(-10% 100% -20% 0)' }, {
        x: 0, clipPath: 'inset(-10% 0% -20% 0)', duration: M.title, ease: M.ease,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true, refreshPriority: -1 },
        onComplete: function () { gsap.set(el, { clearProps: 'clipPath,transform' }); }
      });
    });
    /* body copy rises */
    $$('.rise').forEach(function (el) {
      gsap.fromTo(el, { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: M.rise, ease: M.ease, delay: .12, scrollTrigger: { trigger: el, start: 'top 90%', once: true, refreshPriority: -1 }, onComplete: function () { gsap.set(el, { clearProps: 'all' }); } });
    });
    /* photographs open through a mask */
    $$('.reveal').forEach(function (fig) {
      var box = fig.querySelector('.plate, .sold__pic, .house__pic'), img = box && box.querySelector('img');
      if (!box) return;
      gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true, refreshPriority: -1 }, onComplete: function () { gsap.set([box, img], { clearProps: 'clipPath,transform' }); } })
        .fromTo(box, { clipPath: 'inset(14% 8% 14% 8%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: M.reveal, ease: 'expo.out' }, 0)
        .fromTo(img, { scale: 1.12 }, { scale: 1, duration: M.reveal * 1.2, ease: 'expo.out' }, 0);
    });
    if (!c.desk) return;

    /* ivory sheets settle as they arrive */
    $$('.record, .realised').forEach(function (s) {
      gsap.fromTo(s, { y: 72 }, { y: 0, ease: 'none', scrollTrigger: { trigger: s, start: 'top bottom', end: 'top 60%', scrub: .5, refreshPriority: -1 } });
    });
    /* light parallax: the house photograph and the finale's name */
    gsap.fromTo('.house__pic img', { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: 'none', scrollTrigger: { trigger: '.house', start: 'top bottom', end: 'bottom top', scrub: true, refreshPriority: -1 } });
    /* the closing name drives in letter by letter from under its baseline as the page ends (Alex, 7 Oct 2026);
       scrubbed, so scrolling back takes it apart again. The real text stays in the .sr span. */
    (function () {
      var w = $('.finale__w'); if (!w || w.dataset.split) return;
      w.dataset.split = '1';
      var txt = w.textContent; w.textContent = '';
      var chars = txt.split('').map(function (ch) {
        var m = document.createElement('span'); m.className = 'fl-m';
        var c = document.createElement('span'); c.className = 'fl-c'; c.textContent = ch === ' ' ? ' ' : ch;
        m.appendChild(c); w.appendChild(m); return c;
      });
      gsap.fromTo(chars, { yPercent: 115 }, { yPercent: 0, ease: 'power2.out', stagger: .12,
        scrollTrigger: { trigger: '.finale__word', start: 'top bottom', end: 'bottom bottom', scrub: .4, refreshPriority: -1 } });
    })();
  });

  /* pin 1: on the block — the pinned horizontal track */
  mm.add('(min-width: 900px) and (min-height: 600px)', function () {
    root.classList.add('blk-pin');
    track.scrollLeft = 0;
    /* exactly one screen under the header, measured, not 100vh (which can round a pixel long under zoom) */
    // ScrollTrigger ceils the pinned box; under browser zoom the header edge is fractional (76.0000076), so a
    // fractional remainder is floored here and the ceil brings it back to exactly the bottom of the screen
    var size = function () { var h = window.innerHeight - topEl.getBoundingClientRect().bottom; blk.style.height = Math.floor(h) + 'px'; };
    size();
    ST.addEventListener('refreshInit', size);
    var words = slides.map(function (s) { return $('.call__w', s); });
    var dist = function () { return (NB - 1) * view.clientWidth; };
    var tw = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: blk, start: function () { return 'top ' + topH(); }, end: function () { return '+=' + Math.round((NB - 1) * window.innerHeight * .85); },
        pin: true, scrub: .6, invalidateOnRefresh: true,
        onUpdate: function (self) {
          var u = self.progress * (NB - 1), w = view.clientWidth;
          setCur(Math.round(u));
          words.forEach(function (el, i) { var d = i - u; el.style.transform = Math.abs(d) > 1.5 ? '' : 'translate3d(' + (d * w * .22).toFixed(1) + 'px,0,0)'; });
        },
        onRefresh: function () { layoutWords(); }
      }
    });
    blkPin = tw.scrollTrigger;
    /* rest on a whole lot. When the scroll settles inside the pin, a deliberate push (an eighth of a lot or more)
       carries on to the next lot in its direction; anything less returns to the lot it left. */
    var snapT = 0, restI = 0;
    function snapCheck() {
      clearTimeout(snapT);
      snapT = setTimeout(function () {
        var st = blkPin; if (!st) return;
        var y = window.pageYOffset, step = (st.end - st.start) / (NB - 1);
        if (y <= st.start + 1) { restI = 0; return; }
        if (y >= st.end - 1) { restI = NB - 1; return; }
        var u = (y - st.start) / step, d = u - restI, k;
        if (Math.abs(u - Math.round(u)) * step < 1.5) { restI = Math.round(u); return; }
        if (Math.abs(d) < .12) k = restI;
        else k = clamp(restI + (d > 0 ? 1 : -1) * Math.max(1, Math.round(Math.abs(d))), 0, NB - 1);
        restI = k;
        var ty = st.start + k * step;
        if (lenis) lenis.scrollTo(ty, { duration: .65, easing: function (t) { return 1 - Math.pow(1 - t, 3); } });
        else window.scrollTo({ top: ty, behavior: 'smooth' });
      }, 160);
    }
    var unsub = lenis ? lenis.on('scroll', snapCheck) : null;
    if (!lenis) window.addEventListener('scroll', snapCheck, { passive: true });
    requestAnimationFrame(layoutWords);
    return function () {
      if (typeof unsub === 'function') unsub(); else window.removeEventListener('scroll', snapCheck);
      clearTimeout(snapT); blkPin = null;
      ST.removeEventListener('refreshInit', size); blk.style.height = '';
      root.classList.remove('blk-pin');
      gsap.set(track, { clearProps: 'transform' });
      words.forEach(function (el) { el.style.transform = ''; });
      cur = -1; setCur(0);
      requestAnimationFrame(layoutWords);
    };
  });

  window.__v8 = { lenis: lenis, go: goLot, blk: function () { return blkPin; } };
  window.addEventListener('load', function () { ST.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
})();
