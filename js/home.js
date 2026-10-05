/* Golden Lion Auctions — HOME prototype behaviour.
   Data: data/lots.js (window.GLA). Bids, timers, counts and results are SAMPLE DATA.
   Motion: Lenis (DNA90) on gsap.ticker; ScrollTrigger only for the overlap, the parallax and the one DNA95 pin. */
(function () {
  'use strict';
  var D = window.GLA;
  if (!D) return;
  var lots = D.lots, sold = D.sold;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var phoneMQ = window.matchMedia('(max-width: 760px)');
  var T0 = Date.now();
  var HEADER = 64;

  /* ---------- helpers ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var money = function (n) { return '$' + n.toLocaleString('en-US'); };
  var pad = function (n) { return String(Math.floor(n)).padStart(2, '0'); };
  var store = {
    get: function (k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: watch stays per-session */ } }
  };
  var watched = new Set(store.get('gla-watch') || []);
  var left = function (lot) { return Math.max(0, lot.ends_in - (Date.now() - T0) / 1000); };
  var byId = {};
  lots.forEach(function (l) { byId[l.feed_id] = l; });
  var reserveWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Reserve not yet met'; };

  /* ---------- framing: the car, not the photo, is the constant ---------- */
  // Places a feed photo inside a box so the authored car_box lands at a set size and position.
  function frame(img, box, cw, ch, o) {
    var iw = img.naturalWidth || 1920, ih = img.naturalHeight || 1280;
    var bw = (box[2] - box[0]) * iw, bh = (box[3] - box[1]) * ih;
    var s = Math.min(o.fill * cw / bw, (o.maxH || 0.8) * ch / bh);
    if (o.cover) s = Math.max(s, cw / iw, ch / ih);
    var w = iw * s, h = ih * s;
    var x = o.cx * cw - (box[0] + (box[2] - box[0]) / 2) * iw * s;
    var y = o.bottom - box[3] * ih * s;
    if (o.cover) { x = Math.min(0, Math.max(cw - w, x)); y = Math.min(0, Math.max(ch - h, y)); }
    img.style.width = w + 'px'; img.style.height = h + 'px';
    img.style.left = x + 'px'; img.style.top = y + 'px';
    return { s: s, x: x, y: y, w: w, h: h,
      car: { x0: box[0] * iw * s, y0: box[1] * ih * s, x1: box[2] * iw * s, y1: box[3] * ih * s } };
  }

  /* ---------- the house light (stages only): mask the room, never the car box ---------- */
  var stages = {};
  function lightStage(name, o) {
    var stage = $('[data-stage="' + name + '"]');
    if (!stage) return;
    var img = $('.stage__img', stage);
    var lot = byId[o.id];
    img.style.setProperty('--mask', 'url(../assets/stage/mask-' + o.id + '.png)');
    var cw = stage.clientWidth, ch = stage.clientHeight;
    var f = frame(img, lot.car_box, cw, ch, o);
    var c = f.car, m = 0.03 * (c.x1 - c.x0);
    var st = stages[name] || (stages[name] = { open: reduce ? 1 : (stages[name] ? stages[name].open : 1) });
    st.img = img; st.c = c; st.m = m; st.fx = 0.24 * cw; st.fy = 0.16 * ch; st.floor = o.floor || 0;
    applyLight(st);
    img.style.transformOrigin = ((c.x0 + c.x1) / 2) + 'px ' + ((c.y0 + c.y1) / 2) + 'px';
  }
  function applyLight(st) {
    var c = st.c, k = st.open, s = st.img.style, w = c.x1 - c.x0, h = c.y1 - c.y0;
    s.setProperty('--mx', ((c.x0 + c.x1) / 2) + 'px');
    s.setProperty('--my', (c.y0 + h * 0.62) + 'px');
    s.setProperty('--rx', (w * 0.82) + 'px');
    s.setProperty('--ry', (h * 1.55) + 'px');
    s.setProperty('--room', (0.62 * k).toFixed(3));
  }
  function layoutStages() {
    var phone = phoneMQ.matches;
    var hero = $('.hero'), rost = $('.rostrum', hero);
    var heroH = $('[data-stage="hero"]').clientHeight;
    lightStage('hero', phone
      ? { id: 73, fill: 0.92, maxH: 0.5, cx: 0.5, bottom: heroH * 0.82, floor: heroH * 0.1 }
      : { id: 73, fill: 0.52, maxH: 0.5, cx: 0.6, bottom: heroH - rost.offsetHeight - 10, floor: 40 });
    var recH = $('[data-stage="record"]').clientHeight, base = $('.record__base').offsetHeight;
    lightStage('record', phone
      ? { id: 79, fill: 0.92, maxH: 0.5, cx: 0.5, bottom: recH * 0.84, floor: recH * 0.1 }
      : { id: 79, fill: 0.5, maxH: 0.42, cx: 0.69, bottom: recH - base - 10, floor: 40 });
  }

  /* ---------- hero data ---------- */
  function fillHero() {
    var l = byId[73], h = $('.hero');
    $('[data-f="lotno"]', h).textContent = pad(l.lot);
    $('[data-f="make"]', h).textContent = l.year + ' ' + l.make;
    $('[data-f="chassis"]', h).textContent = l.chassis;
    $('[data-f="bid"]', h).textContent = money(l.current_bid);
    $('[data-f="meta"]', h).textContent = l.bid_count + ' bids · ' + l.watchers + ' watching';
    $('[data-f="reserve"]', h).textContent = reserveWord(l.reserve);
    $('[data-ends]', h).dataset.id = l.feed_id;
  }

  /* ---------- the floor ---------- */
  var cardsEl = $('#cards'), tpl = $('#tpl-card');
  var plates = [];
  function renderCards() {
    lots.forEach(function (l) {
      var n = tpl.content.firstElementChild.cloneNode(true);
      var name = l.year + ' ' + l.make + ' ' + l.model;
      n.dataset.id = l.feed_id;
      $('.card__link', n).href = 'lot.html?id=' + l.feed_id;
      var img = $('.plate__img', n);
      img.src = l.image; img.alt = name + ', photographed at Patton Motors';
      plates.push({ img: img, box: l.car_box, plate: $('.plate', n), fill: 0.76 });
      $('.card__name', n).textContent = name;
      $('.card__chassis', n).textContent = l.chassis + (l.mileage ? ' · ' + l.mileage.toLocaleString('en-US') + ' mi' : '');
      if (l.note) { var note = $('.card__note', n); note.hidden = false; note.textContent = l.note; }
      $('.reserve', n).textContent = reserveWord(l.reserve);
      $('.dataline__bid', n).textContent = money(l.current_bid);
      $('.dataline__bids', n).textContent = l.bid_count + ' bids';
      $('[data-ends]', n).dataset.id = l.feed_id;
      var w = $('.watch', n);
      w.dataset.watch = l.feed_id;
      w.setAttribute('aria-label', 'Watch ' + name);
      cardsEl.appendChild(n);
    });
  }
  function renderLedger() {
    var ol = $('#ledger');
    sold.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'row';
      var name = s.year + ' ' + s.make + ' ' + s.model;
      li.innerHTML =
        '<div class="plate" data-reveal><div class="plate__inner"><div class="plate__frame"><img class="plate__img" src="' + s.image + '" alt="" loading="lazy" width="1920" height="1280"></div></div></div>' +
        '<p class="row__name"></p><p class="data row__chassis"></p>' +
        '<p class="row__result"><span class="key">Sold · sample</span><span class="v"></span></p>';
      var img = $('img', li);
      img.alt = name + ', photographed at Patton Motors';
      $('.row__name', li).textContent = name;
      $('.row__chassis', li).textContent = s.chassis;
      $('.v', li).textContent = money(s.result);
      plates.push({ img: img, box: s.car_box, plate: $('.plate', li), fill: 0.94 });
      ol.appendChild(li);
    });
  }
  function layoutPlates() {
    plates.forEach(function (p) {
      var cw = p.plate.clientWidth, ch = p.plate.clientHeight;
      if (!cw) return;
      var go = function () { frame(p.img, p.box, cw, ch, { fill: p.fill, maxH: 0.78, cx: 0.5, bottom: ch * 0.88, cover: true }); };
      if (p.img.complete && p.img.naturalWidth) go(); else p.img.addEventListener('load', go, { once: true });
    });
  }

  /* tabs */
  var current = 'live';
  var inTab = function (l, t) {
    var s = left(l);
    if (s <= 0) return false;
    if (t === 'ending') return s < 86400;
    if (t === 'noreserve') return l.reserve === 'no';
    return true;
  };
  function counts() {
    ['live', 'ending', 'noreserve'].forEach(function (t) {
      $('[data-count="' + t + '"]').textContent = lots.filter(function (l) { return inTab(l, t); }).length;
    });
  }
  function applyTab() {
    var shown = 0;
    $$('.card', cardsEl).forEach(function (c) {
      var ok = inTab(byId[c.dataset.id], current);
      c.hidden = !ok;
      c.classList.toggle('is-extra', ok && ++shown > 6);
    });
    $('#more').hidden = !cardsEl.classList.contains('is-collapsed') || shown <= 6;
    layoutPlates();
  }
  $$('.tab').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.tab === current) return;
      $$('.tab').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      current = b.dataset.tab;
      if (reduce) { applyTab(); return; }
      cardsEl.classList.add('is-swapping');
      setTimeout(function () { applyTab(); cardsEl.classList.remove('is-swapping'); refresh(); }, 450);
    });
  });
  $('#more').addEventListener('click', function () {
    cardsEl.classList.remove('is-collapsed'); this.hidden = true; layoutPlates(); refresh();
  });

  /* watch */
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
      if (b.classList.contains('watch-btn')) b.textContent = on ? 'Watching' : 'Watch';
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

  /* search: filters the floor by make, model or chassis */
  var hdr = $('.hdr'), q = $('#q'), sbtn = $('#search-btn');
  function openSearch(on) {
    hdr.classList.toggle('is-searching', on);
    sbtn.setAttribute('aria-expanded', String(on));
    if (on) q.focus(); else { q.value = ''; filterQ(); }
  }
  function filterQ() {
    var v = q.value.trim().toLowerCase(), shown = 0;
    $$('.card', cardsEl).forEach(function (c) {
      var l = byId[c.dataset.id];
      var hay = (l.year + ' ' + l.make + ' ' + l.model + ' ' + l.chassis).toLowerCase();
      var ok = inTab(l, current) && (!v || hay.indexOf(v) > -1);
      c.hidden = !ok; if (ok) shown++;
      c.classList.remove('is-extra');
    });
    var empty = $('.empty', cardsEl);
    if (!shown && !empty) { empty = document.createElement('p'); empty.className = 'empty'; cardsEl.appendChild(empty); }
    if (empty) { empty.hidden = !!shown; empty.textContent = shown ? '' : 'No open lot matches \u201c' + q.value.trim() + '\u201d.'; }
    if (!v) applyTab(); else layoutPlates();
  }
  sbtn.addEventListener('click', function () { openSearch(!hdr.classList.contains('is-searching')); });
  q.addEventListener('input', function () {
    filterQ();
    if (q.value.trim()) { var f = $('#floor'); if (f.getBoundingClientRect().top > window.innerHeight * 0.5) f.scrollIntoView(); }
  });
  q.addEventListener('keydown', function (e) { if (e.key === 'Escape') { openSearch(false); sbtn.focus(); } });

  /* phone menu */
  var mbtn = $('#menu-btn'), panel = $('#menu-panel');
  mbtn.addEventListener('click', function () {
    var on = panel.hidden; panel.hidden = !on; mbtn.setAttribute('aria-expanded', String(on));
  });
  $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { panel.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- clocks: information, so they run even under reduced motion ---------- */
  function heroTime(s) {
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    var u = function (n, k) { return pad(n) + '<small>' + k + '</small>'; };
    return reduce ? u(d, 'd') + u(h, 'h') + u(m, 'm') : u(d, 'd') + u(h, 'h') + u(m, 'm') + u(x, 's');
  }
  function cardTime(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    if (s >= 86400) return d + 'd ' + h + 'h';
    if (s >= 3600) return h + 'h ' + pad(m) + 'm';
    return pad(m) + ':' + pad(x);
  }
  function tick() {
    $$('[data-ends]').forEach(function (el) {
      var l = byId[el.dataset.id];
      if (!l) return;
      var s = left(l);
      if (el.dataset.mode === 'hero') {
        el.innerHTML = heroTime(s);
        el.setAttribute('aria-label', 'Ends in ' + Math.floor(s / 86400) + ' days ' + Math.floor(s % 86400 / 3600) + ' hours');
      } else {
        el.textContent = cardTime(s);
        var card = el.closest('.card'), st = $('.status', card);
        if (s > 0 && s < 3600) { st.className = 'key status status--ending'; st.textContent = 'Ending'; }
        else if (s > 0) { st.className = 'key status live'; st.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Live'; }
        else { st.className = 'key status'; st.textContent = 'Closed'; }
      }
    });
  }

  /* ---------- consign form (prototype: nothing is sent) ---------- */
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#vin').value.trim().toUpperCase(), msg = $('#vinmsg');
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) msg.textContent = 'VIN accepted. In the live product, Golden Lion would contact you about a specialist visit. Prototype: nothing was sent.';
    else msg.textContent = 'A VIN has 17 letters and numbers, without I, O or Q. Classic chassis numbers are handled by a specialist.';
  });

  /* ---------- build ---------- */
  fillHero();
  renderCards();
  renderLedger();
  counts();
  applyTab();
  syncWatch();
  tick();
  setInterval(tick, 1000);
  var heroImg = $('#hero-img');
  var ready = function (img, fn) { if (img.complete && img.naturalWidth) fn(); else img.addEventListener('load', fn, { once: true }); };
  ready(heroImg, layoutStages);
  ready($('#record-img'), layoutStages);
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { layoutStages(); layoutPlates(); refresh(); }, 120);
  });

  /* ---------- motion ---------- */
  var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (reduce || !hasGsap) { root.classList.remove('js-motion'); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var EASE_IN = 'power4.out', EASE_OUT = 'power2.in';

  // Lenis — DNA90: on gsap.ticker, autoRaf off, anchors on, never under reduced motion
  if (window.Lenis) {
    var lenis = new window.Lenis({ autoRaf: false, anchors: { offset: -HEADER } });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // hero load (≤1.4s; car, name and bid are present from frame 0 — only their arrival is timed)
  var hs = stages.hero;
  var heroIn = function () {
    if (stages.hero) {
      var o = { k: 0 };
      gsap.to(o, { k: 1, duration: 1.2, ease: EASE_IN, onUpdate: function () { stages.hero.open = o.k; applyLight(stages.hero); } });
    }
    gsap.to($$('.hero [data-in="side"]'), { x: 0, y: 0, opacity: 1, duration: 0.9, ease: EASE_IN, stagger: 0.09 });
    gsap.to($$('.hero [data-in="rise"]'), { y: 0, opacity: 1, duration: 0.9, ease: EASE_IN, stagger: 0.06, delay: 0.15 });
  };
  ready(heroImg, heroIn);

  // entrances: play once, never replay on the way back up
  ST.batch($$('main [data-in]').filter(function (el) { return !el.closest('.hero'); }), {
    start: 'top 88%', once: true,
    onEnter: function (els) { gsap.to(els, { x: 0, y: 0, opacity: 1, duration: 0.9, ease: EASE_IN, stagger: 0.12 }); }
  });
  // plates: masked reveal with the counter-scale that reads as weight
  ST.batch($$('.plate[data-reveal]'), {
    start: 'top 92%', once: true,
    onEnter: function (els) {
      gsap.to(els, { clipPath: 'inset(0% 0 0 0)', duration: phoneMQ.matches ? 0.4 : 1.2, ease: EASE_IN, stagger: 0.08 });
      gsap.to(els.map(function (e) { return $('.plate__inner', e); }), { scale: 1, duration: 1.2, ease: EASE_IN, stagger: 0.08, clearProps: 'transform' });
    }
  });

  // the hallmark press, once
  ST.create({
    trigger: '.record', start: 'top 70%', once: true,
    onEnter: function () { gsap.fromTo('#seal', { scale: 1.06, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: EASE_IN }); }
  });
  gsap.set('#seal', { opacity: 0 });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', function () {
    root.classList.add('is-desk-motion');
    // overlap 1: the floor rises over the held stage; the photo drifts slower than the page
    gsap.to('#hero-img', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.floor', start: 'top bottom', end: 'top top', scrub: true } });
    // the Valour settles on approach only
    gsap.fromTo('#record-img', { scale: 1.04 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.record', start: 'top bottom', end: 'top ' + HEADER + 'px', scrub: true } });
    // DNA95: pin, hold half, the text block alone rises and fades, release; overlap 2: the ledger rises over it
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.record', start: 'top ' + HEADER + 'px', end: '+=90%', pin: true, scrub: 0.35, invalidateOnRefresh: true } });
    tl.to({}, { duration: 0.5 })
      .to('#record-col', { y: -80, opacity: 0, ease: 'none', duration: 0.5 });
    return function () { root.classList.remove('is-desk-motion'); };
  });
  mm.add('(max-width: 760px)', function () {
    gsap.set('main [data-in]', { x: 0 });
  });

  window.addEventListener('load', refresh);
})();
