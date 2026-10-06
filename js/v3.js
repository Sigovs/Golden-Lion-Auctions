/* Golden Lion Auctions — HOME v3 behaviour.
   Data: data/lots.js (window.GLA). Bids, timers, counts and results are SAMPLE DATA.
   Motion: Lenis on gsap.ticker (DNA90); the console slides into the scene; cards and panels
   rise once; the record settles onto the table; the hero scene drifts. Nothing moves under
   reduced motion, and every element is visible without JS. */
(function () {
  'use strict';
  var D = window.GLA;
  if (!D) return;
  var lots = D.lots, sold = D.sold;
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
  lots.forEach(function (l) { byId[l.feed_id] = l; });
  var nameOf = function (l) { return l.year + ' ' + l.make + ' ' + l.model; };
  var reserveWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Reserve not yet met'; };
  var focus = function (box) { return ((box[0] + box[2]) / 2 * 100).toFixed(1) + '% ' + ((box[1] + box[3]) / 2 * 100).toFixed(1) + '%'; };
  var bySoonest = lots.slice().sort(function (a, b) { return a.ends_in - b.ends_in; });

  /* ---------- hero console + strip ---------- */
  (function () {
    var l = byId[73], h = $('.hero');
    $('[data-f="lotno"]', h).textContent = pad(l.lot);
    $('[data-f="make"]', h).textContent = l.year + ' ' + l.make;
    $('[data-f="chassis"]', h).textContent = l.chassis;
    $('[data-f="bid"]', h).textContent = money(l.current_bid);
    $('[data-f="meta"]', h).textContent = l.bid_count + ' bids · ' + l.watchers + ' watching';
    $('[data-f="reserve"]', h).textContent = reserveWord(l.reserve);
    $('.clockbox', h).dataset.id = l.feed_id;
    var next = bySoonest[0];
    $('[data-f="livecount"]', h).textContent = lots.length;
    $('[data-f="nextname"]', h).textContent = next.year + ' ' + next.make + ' ' + next.model.split(' ')[0];
    $('[data-f="nextclock"]', h).dataset.id = next.feed_id;
  })();

  /* ---------- cards ---------- */
  var cardsEl = $('#cards'), tpl = $('#tpl-card');
  lots.forEach(function (l) {
    var n = tpl.content.firstElementChild.cloneNode(true), name = nameOf(l);
    n.dataset.id = l.feed_id;
    $('.card__link', n).href = 'lot.html?id=' + l.feed_id;
    var img = $('.card__img img', n);
    img.src = l.stage_image || l.image;
    img.style.objectPosition = focus(l.stage_box || l.car_box);
    img.alt = name + (l.stage_image ? ', staged: car photographed at Patton Motors, setting generated' : '');
    $('.card__lot', n).textContent = 'Lot ' + pad(l.lot);
    $('.card__name', n).textContent = name;
    $('.card__chassis', n).textContent = l.chassis + (l.mileage ? ' · ' + l.mileage.toLocaleString('en-US') + ' mi' : '');
    if (l.note) { var note = $('.card__note', n); note.hidden = false; note.textContent = l.note; }
    $('.card__bid', n).textContent = money(l.current_bid);
    $('.card__bids', n).textContent = l.bid_count;
    $('.reserve', n).textContent = reserveWord(l.reserve);
    $('[data-ends]', n).dataset.id = l.feed_id;
    var w = $('.card__watch', n);
    w.dataset.watch = l.feed_id;
    w.setAttribute('aria-label', 'Watch ' + name);
    n.setAttribute('data-in', '');
    cardsEl.appendChild(n);
  });

  /* ---------- closing next rail ---------- */
  var cl = $('#closing');
  bySoonest.slice(0, 5).forEach(function (l) {
    var li = document.createElement('li');
    li.innerHTML = '<a><img alt="" loading="lazy" width="72" height="48"><div><strong></strong><span><em class="b"></em><em class="t" data-ends data-mode="card"></em></span></div></a>';
    var a = $('a', li); a.href = 'lot.html?id=' + l.feed_id;
    var im = $('img', li); im.src = l.stage_image || l.image; im.style.objectPosition = focus(l.stage_box || l.car_box);
    $('strong', li).textContent = nameOf(l);
    $('.b', li).textContent = money(l.current_bid);
    $('.t', li).dataset.id = l.feed_id;
    $$('em', li).forEach(function (e) { e.style.fontStyle = 'normal'; });
    cl.appendChild(li);
  });

  /* ---------- sold results ---------- */
  var ol = $('#ledger');
  sold.forEach(function (s) {
    var li = document.createElement('li');
    li.innerHTML = '<p class="n"></p><p class="c"></p><p class="v"></p>';
    $('.n', li).textContent = s.year + ' ' + s.make + ' ' + s.model;
    $('.c', li).textContent = s.chassis;
    $('.v', li).textContent = money(s.result);
    ol.appendChild(li);
  });

  /* ---------- tabs ---------- */
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
  }
  $$('.seg__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.dataset.tab === current) return;
      $$('.seg__btn').forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
      current = b.dataset.tab;
      if (reduce) { applyTab(); return; }
      cardsEl.classList.add('is-swapping');
      setTimeout(function () { applyTab(); revealAll(); cardsEl.classList.remove('is-swapping'); refresh(); }, 400);
    });
  });
  $('#more').addEventListener('click', function () { cardsEl.classList.remove('is-collapsed'); this.hidden = true; revealAll(); refresh(); });

  /* ---------- watch ---------- */
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

  /* ---------- search ---------- */
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
      var ok = inTab(l, current) && (!v || (nameOf(l) + ' ' + l.chassis).toLowerCase().indexOf(v) > -1);
      c.hidden = !ok; if (ok) shown++;
      c.classList.remove('is-extra');
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

  /* ---------- phone menu ---------- */
  var mbtn = $('#menu-btn'), panel = $('#menu-panel');
  mbtn.addEventListener('click', function () { var on = panel.hidden; panel.hidden = !on; mbtn.setAttribute('aria-expanded', String(on)); });
  $$('a', panel).forEach(function (a) { a.addEventListener('click', function () { panel.hidden = true; mbtn.setAttribute('aria-expanded', 'false'); }); });

  /* ---------- clocks: information, so they run even under reduced motion ---------- */
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
      if (el.dataset.mode === 'boxes') {
        var v = [s / 86400 | 0, (s % 86400) / 3600 | 0, (s % 3600) / 60 | 0, s % 60 | 0];
        $$('b', el).forEach(function (b, i) { b.textContent = pad(v[i]); });
        el.setAttribute('aria-label', 'Ends in ' + v[0] + ' days ' + v[1] + ' hours ' + v[2] + ' minutes');
        return;
      }
      el.textContent = cardTime(s);
      var card = el.closest('.card');
      if (!card) return;
      var st = $('.status', card);
      if (s > 0 && s < 3600) { st.className = 'chip chip--ending status'; st.textContent = 'Ending'; }
      else if (s > 0) { st.className = 'chip chip--glass status'; st.innerHTML = '<span class="live-dot" aria-hidden="true"></span>Live'; }
      else { st.className = 'chip chip--glass status'; st.textContent = 'Closed'; }
    });
  }

  /* ---------- consign form (prototype: nothing is sent) ---------- */
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('#vin').value.trim().toUpperCase(), msg = $('#vinmsg');
    if (/^[A-HJ-NPR-Z0-9]{17}$/.test(v)) msg.textContent = 'VIN accepted. In the live product, Golden Lion would contact you about a specialist visit. Prototype: nothing was sent.';
    else msg.textContent = 'A VIN has 17 letters and numbers, without I, O or Q. Classic chassis numbers are handled by a specialist.';
  });

  counts(); applyTab(); syncWatch(); tick();
  setInterval(tick, 1000);

  /* ---------- motion ---------- */
  var refresh = function () { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); };
  var revealAll = function () {
    if (!root.classList.contains('js-motion')) return;
    $$('.card:not([hidden])', cardsEl).forEach(function (c) {
      c.style.opacity = 1; c.style.transform = '';
      var p = $('[data-reveal]', c); if (p) p.style.clipPath = 'inset(0)';
    });
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

  // hero: the scene settles, the console slides into it, the strip follows
  var heroIn = function () {
    gsap.fromTo('#hero-img', { scale: 1.08 }, { scale: 1, duration: 2, ease: 'power3.out' });
    gsap.to('#console', { x: 0, opacity: 1, duration: 1.1, ease: EASE, delay: 0.3 });
    gsap.to('.strip', { y: 0, opacity: 1, duration: 0.9, ease: EASE, delay: 0.6, clearProps: 'transform' });
  };
  var hi = $('#hero-img');
  if (hi.complete) heroIn(); else hi.addEventListener('load', heroIn, { once: true });

  // cards rise in rows; the image inside unmasks
  ST.batch($$('#cards .card'), {
    start: 'top 92%', once: true,
    onEnter: function (els) {
      gsap.to(els, { y: 0, opacity: 1, duration: 1, ease: EASE, stagger: 0.1, clearProps: 'transform' });
      gsap.to(els.map(function (e) { return $('[data-reveal]', e); }), { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: EASE, stagger: 0.1 });
    }
  });

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', function () {
    gsap.to('#hero-img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.fromTo('.banner__img', { yPercent: -6, scale: 1.08 }, { yPercent: 6, scale: 1.08, ease: 'none', scrollTrigger: { trigger: '.banner', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo('.finale__img', { scale: 1.06 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom bottom', scrub: true } });
    // the record is laid onto the table as the dossier arrives
    gsap.fromTo('#record', { rotate: -5, y: 60 }, { rotate: -1.5, y: 0, ease: 'none', scrollTrigger: { trigger: '.dossier', start: 'top bottom', end: 'top 40%', scrub: 0.5 } });
    gsap.fromTo('.results', { y: 80 }, { y: 0, ease: 'none', scrollTrigger: { trigger: '.sold', start: 'top bottom', end: 'top 30%', scrub: 0.5 } });
  });

  gsap.set($$('.step, .promo, .panel'), { y: 24, opacity: 0 });
  ST.batch($$('.step, .promo, .panel'), {
    start: 'top 92%', once: true,
    onEnter: function (els) { gsap.to(els, { y: 0, opacity: 1, duration: 0.9, ease: EASE, stagger: 0.08, clearProps: 'transform' }); }
  });

  window.addEventListener('load', refresh);
})();
