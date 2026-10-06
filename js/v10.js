/* Golden Lion Auctions — HOME v10 behaviour (v2 simplified: six lots, three results, no tabs).
   Data: data/lots.js (window.GLA). Bids, timers, counts and results are SAMPLE DATA.
   Motion (SUPPORT): Lenis on gsap.ticker (DNA90); the hero scene settles once; plates unmask once;
   one DNA95 pin on Verified when the section fits the viewport. Nothing moves under reduced motion. */
(function () {
  'use strict';
  var D = window.GLA;
  if (!D) return;
  // the hero is the featured Miura (73); the grid shows six other cars
  var lots = D.lots.filter(function (l) { return l.feed_id !== 73; }).slice(0, 6), sold = D.sold.slice(0, 3);
  var allLots = D.lots;
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var T0 = Date.now();

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
  allLots.forEach(function (l) { byId[l.feed_id] = l; });
  var reserveWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Reserve not yet met'; };
  // the plate is cropped around the car, never around the photo's centre
  var focus = function (box) {
    var cx = (box[0] + box[2]) / 2, cy = (box[1] + box[3]) / 2;
    return (cx * 100).toFixed(1) + '% ' + (cy * 100).toFixed(1) + '%';
  };

  /* ---------- hero ---------- */
  (function () {
    var l = byId[73], h = $('.hero');
    $('[data-f="lotno"]', h).textContent = pad(l.lot);
    $('[data-f="make"]', h).textContent = l.year + ' ' + l.make;
    $('[data-f="bid"]', h).textContent = money(l.current_bid);
    $('[data-f="meta"]', h).textContent = l.bid_count + ' bids · ' + l.watchers + ' watching';
    $('[data-f="reserve"]', h).textContent = reserveWord(l.reserve);
    $('[data-ends]', h).dataset.id = l.feed_id;
  })();

  /* ---------- the floor ---------- */
  var cardsEl = $('#cards'), tpl = $('#tpl-card');
  lots.forEach(function (l) {
    var n = tpl.content.firstElementChild.cloneNode(true);
    var name = l.year + ' ' + l.make + ' ' + l.model;
    n.dataset.id = l.feed_id;
    $('.card__link', n).href = 'lot.html?id=' + l.feed_id;
    var img = $('.card__plate img', n);
    img.src = l.stage_image || l.image;
    img.style.objectPosition = focus(l.stage_box || l.car_box);
    img.alt = name + (l.stage_image ? ', staged: car photographed at Patton Motors, setting generated' : ', photographed at Patton Motors');
    $('.card__lot', n).textContent = 'Lot ' + pad(l.lot);
    $('.card__name', n).textContent = name;
    $('.card__chassis', n).textContent = l.chassis + (l.mileage ? ' · ' + l.mileage.toLocaleString('en-US') + ' mi' : '');
    if (l.note) { var note = $('.card__note', n); note.hidden = false; note.textContent = l.note; }
    $('.card__bid', n).textContent = money(l.current_bid);
    $('.card__bids', n).textContent = l.bid_count + ' bids';
    $('.reserve', n).textContent = reserveWord(l.reserve);
    $('[data-ends]', n).dataset.id = l.feed_id;
    var w = $('.watch-txt', n);
    w.dataset.watch = l.feed_id;
    w.setAttribute('aria-label', 'Watch ' + name);
    cardsEl.appendChild(n);
  });

  /* ---------- recently sold: a ledger, figures first ---------- */
  var ol = $('#ledger');
  sold.forEach(function (s) {
    var li = document.createElement('li');
    li.className = 'row';
    li.innerHTML = '<figure class="row__thumb"><img alt="" loading="lazy" width="1920" height="1280"></figure><p class="row__key">Sold · sample</p><p class="row__result"></p><p class="row__name"></p><p class="row__chassis data"></p>';
    // a small photograph of the car as sold (Patton feed photo), framed on the car itself
    var im = $('.row__thumb img', li), cb = s.car_box || [0, 0, 1, 1];
    im.src = s.image; im.alt = s.year + ' ' + s.make + ' ' + s.model;
    im.style.objectPosition = Math.round((cb[0] + cb[2]) * 50) + '% ' + Math.round((cb[1] + cb[3]) * 50) + '%';
    $('.row__result', li).textContent = money(s.result);
    $('.row__name', li).textContent = s.year + ' ' + s.make + ' ' + s.model;
    $('.row__chassis', li).textContent = s.chassis;
    li.setAttribute('data-in', '');
    ol.appendChild(li);
  });

  /* six live lots only: no tabs on the home page (filters live on the auctions page) */
  var current = 'live';
  var inTab = function (l) { return left(l) > 0; };
  function applyTab() {
    $$('.card', cardsEl).forEach(function (c) { c.hidden = !inTab(byId[c.dataset.id]); });
  }

  /* watch */
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
      b.textContent = on ? 'Watching' : 'Watch';
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
      var ok = inTab(l) && (!v || hay.indexOf(v) > -1);
      c.hidden = !ok; if (ok) shown++;
    });
    var empty = $('.empty', cardsEl);
    if (!shown && !empty) { empty = document.createElement('p'); empty.className = 'empty'; cardsEl.appendChild(empty); }
    if (empty) { empty.hidden = !!shown; empty.textContent = shown ? '' : 'No open lot matches “' + q.value.trim() + '”.'; }
    if (!v) applyTab();
    revealAll();
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
    return u(d, 'd') + u(h, 'h') + u(m, 'm') + (reduce ? '' : u(x, 's'));
  }
  function cardTime(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    if (s >= 86400) return d + 'd ' + h + 'h left';
    if (s >= 3600) return h + 'h ' + pad(m) + 'm left';
    return pad(m) + ':' + pad(x) + ' left';
  }
  function tick() {
    $$('[data-ends]').forEach(function (el) {
      var l = byId[el.dataset.id];
      if (!l) return;
      var s = left(l);
      if (el.dataset.mode === 'hero') {
        el.innerHTML = heroTime(s);
        el.setAttribute('aria-label', 'Ends in ' + Math.floor(s / 86400) + ' days ' + Math.floor(s % 86400 / 3600) + ' hours');
        return;
      }
      el.textContent = cardTime(s);
      var st = $('.status', el.closest('.card'));
      if (s > 0 && s < 3600) { st.className = 'key status status--ending'; st.textContent = 'Ending'; }
      else if (s > 0) { st.className = 'key status'; st.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Live'; }
      else { st.className = 'key status'; st.textContent = 'Closed'; }
    });
  }

  /* ---------- consign form (prototype: nothing is sent) ---------- */
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#vin').value.trim().toUpperCase(), msg = $('#vinmsg');
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) msg.textContent = 'VIN accepted. In the live product, Golden Lion would contact you about a specialist visit. Prototype: nothing was sent.';
    else msg.textContent = 'A VIN has 17 letters and numbers, without I, O or Q. Classic chassis numbers are handled by a specialist.';
  });

  applyTab(); syncWatch(); tick();
  setInterval(tick, 1000);

  /* ---------- motion ---------- */
  var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
  // anything revealed by filtering or tabs must never stay masked
  var revealAll = function () {
    if (!root.classList.contains('js-motion')) return;
    $$('.card:not([hidden]) [data-reveal]', cardsEl).forEach(function (p) { p.style.clipPath = 'inset(0)'; });
  };
  var hasGsap = window.gsap && window.ScrollTrigger;
  if (reduce || !hasGsap) { root.classList.remove('js-motion'); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  var EASE = 'power4.out';

  if (window.Lenis) {
    var lenis = new window.Lenis({ autoRaf: false, anchors: { offset: -parseInt(getComputedStyle(root).getPropertyValue('--hdr'), 10) } });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // hero: the scene is there from frame 0; it settles (1.06 → 1) and the rostrum arrives under it
  var heroIn = function () {
    gsap.fromTo('#hero-img', { scale: 1.06 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
    gsap.to('#rostrum', { y: 0, opacity: 1, duration: 0.9, ease: EASE, delay: 0.25 });
  };
  var hi = $('#hero-img');
  if (hi.complete) heroIn(); else hi.addEventListener('load', heroIn, { once: true });

  // entrances play once
  ST.batch($$('main [data-in]'), {
    start: 'top 90%', once: true,
    onEnter: function (els) { gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.08 }); }
  });
  ST.batch($$('[data-reveal]'), {
    start: 'top 92%', once: true,
    onEnter: function (els) {
      gsap.to(els, { clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: EASE, stagger: 0.08 });
      gsap.fromTo(els.map(function (e) { return $('img', e); }), { scale: 1.06 }, { scale: 1, duration: 1.2, ease: EASE, stagger: 0.08, clearProps: 'transform' });
    }
  });

  // the hallmark is struck once, as the record reaches the reader
  gsap.set('#seal', { opacity: 0 });
  ST.create({
    trigger: '.record', start: 'top 85%', once: true,
    onEnter: function () { gsap.fromTo('#seal', { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: EASE }); }
  });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    // the hero scene drifts slower than the page as the floor arrives
    gsap.to('#hero-img', { yPercent: 6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    // DNA95 on Verified — only when the whole section fits under the header; otherwise it scrolls plainly
    var sec = $('.verified'), hdrH = $('.hdr').offsetHeight;
    if (sec.offsetHeight <= window.innerHeight - hdrH + 8) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: 'top ' + hdrH + 'px', end: '+=90%', pin: true, scrub: 0.35, invalidateOnRefresh: true } });
      tl.to({}, { duration: 0.5 }).to('#verified-text', { y: -80, opacity: 0, ease: 'none', duration: 0.5 });
    }
  });

  window.addEventListener('load', refresh);
})();
