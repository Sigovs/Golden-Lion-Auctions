/* Golden Lion Auctions — HOME v5 "Dossier" behaviour.
   Data: data/lots.js (window.GLA). Bids, clocks, counts, reserve states and results are SAMPLE.
   Titles are BaT-style headlines built ONLY from feed facts: "No Reserve:" when reserve is "no",
   "<n>-Mile" when mileage is known, then year · make · model; the feed's note prints beneath.
   Motion (GSAP + ScrollTrigger + Lenis, as v3): the cover lands on the desk and, on desktop,
   pins, holds, and its sheet lifts away (DNA95); lot pages are dealt onto the desk; the record
   and the realised sheet settle as they arrive. Under reduced motion nothing moves, every
   object is in place, and the clocks still tick as text. */
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
    set: function (k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage blocked: watch lasts this visit */ } }
  };
  var watched = new Set(store.get('gla-watch') || []);
  var byId = {};
  lots.forEach(function (l) { byId[l.feed_id] = l; });
  var left = function (l) { return Math.max(0, l.ends_in - (Date.now() - T0) / 1000); };

  /* ---------- headline titles: feed facts only ---------- */
  function headline(l) {
    var t = l.year + ' ' + l.make + ' ' + l.model;
    if (l.mileage) t = l.mileage.toLocaleString('en-US') + '-Mile ' + t;
    if (l.reserve === 'no') t = 'No Reserve: ' + t;
    return t;
  }
  var reserveWord = function (r) { return r === 'no' ? 'No reserve' : r === 'met' ? 'Reserve met' : 'Not yet met'; };
  var entryLine = function (l) {
    return [l.chassis, l.mileage ? l.mileage.toLocaleString('en-US') + ' miles' : null, l.location.replace(/ /g, ' ')].filter(Boolean).join(' · ');
  };
  var stagedCap = function (l) { return 'Staged · setting generated. ' + (l.feed_id === 41 ? 'Cars' : 'Car') + ' photographed at Patton Motors'; };
  var altOf = function (l) { return l.year + ' ' + l.make + ' ' + l.model + ' on a platform in a hall; staged, car photographed at Patton Motors, setting generated'; };

  /* ---------- clocks ---------- */
  function fmt(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0, x = s % 60 | 0;
    if (s >= 86400) return d + 'd ' + h + 'h ' + pad(m) + 'm';
    return pad(h) + ':' + pad(m) + ':' + pad(x);
  }
  function spoken(s) {
    if (s <= 0) return 'Closed';
    var d = s / 86400 | 0, h = (s % 86400) / 3600 | 0, m = (s % 3600) / 60 | 0;
    return (d ? d + ' days ' : '') + h + ' hours ' + m + ' minutes left';
  }

  /* ---------- cover ---------- */
  var lead = byId[73];
  (function () {
    var c = $('.cover');
    var f = function (k) { return $('[data-cover="' + k + '"]', c); };
    f('no').textContent = pad(lead.lot);
    f('title').textContent = headline(lead);
    f('entry').textContent = entryLine(lead);
    f('bid').textContent = money(lead.current_bid);
    f('bids').textContent = lead.bid_count;
    f('reserve').textContent = reserveWord(lead.reserve);
    f('watchers').textContent = lead.watchers;
  })();

  /* ---------- lots: sort, filter, render ---------- */
  var state = { sort: 'soonest', make: '', watchedOnly: false, q: '' };
  var tpl = $('#tpl-lot'), sheetsEl = $('#sheets'), spreadEl = $('#spread'), statusEl = $('#lots-status');

  // make filter
  var makes = {};
  lots.forEach(function (l) { makes[l.make] = (makes[l.make] || 0) + 1; });
  Object.keys(makes).sort().forEach(function (m) {
    var o = document.createElement('option'); o.value = m; o.textContent = m + ' (' + makes[m] + ')';
    $('#make').appendChild(o);
  });

  function listed() {
    var q = state.q.trim().toLowerCase();
    var out = lots.filter(function (l) {
      if (left(l) <= 0) return false;
      if (state.sort === 'noreserve' && l.reserve !== 'no') return false;
      if (state.make && l.make !== state.make) return false;
      if (state.watchedOnly && !watched.has(l.feed_id)) return false;
      if (q && (headline(l) + ' ' + l.chassis + ' lot ' + pad(l.lot)).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    // newly listed: the sample feed has no listing date, so the longest clock stands in for it
    out.sort(state.sort === 'newest' ? function (a, b) { return b.ends_in - a.ends_in; } : function (a, b) { return a.ends_in - b.ends_in; });
    return out;
  }

  function watchBtn(btn, l) {
    btn.dataset.watch = l.feed_id;
    btn.setAttribute('aria-label', 'Watch lot ' + pad(l.lot) + ', ' + l.year + ' ' + l.make + ' ' + l.model);
  }

  function buildSheet(l) {
    var n = tpl.content.firstElementChild.cloneNode(true);
    n.dataset.id = l.feed_id;
    $('.lotno b', n).textContent = pad(l.lot);
    var img = $('img', n);
    img.src = l.stage_image; img.alt = altOf(l);
    $('figcaption', n).textContent = stagedCap(l);
    var a = $('.lot__title a', n);
    a.textContent = headline(l); a.href = 'lot.html?id=' + l.feed_id;
    if (l.note) { var nt = $('.lot__note', n); nt.hidden = false; nt.textContent = l.note; }
    $('.entry', n).textContent = entryLine(l);
    $('[data-f="bid"]', n).textContent = money(l.current_bid);
    $('[data-f="bids"]', n).textContent = l.bid_count;
    $('[data-f="reserve"]', n).textContent = reserveWord(l.reserve);
    $('[data-f="clock"]', n).dataset.clock = l.feed_id;
    $('.lot__watchers', n).textContent = l.watchers + ' watching';
    $('.lot__view', n).href = 'lot.html?id=' + l.feed_id;
    $('.lot__view', n).setAttribute('aria-label', 'View lot ' + pad(l.lot));
    watchBtn($('.watch', n), l);
    return n;
  }

  function buildSpread(l, label) {
    var w = document.createElement('div');
    w.className = 'spread__inner';
    w.innerHTML =
      '<figure class="spread__page spread__page--l paper"><div class="plate"><img alt="" width="2528" height="1696"></div><figcaption></figcaption></figure>' +
      '<article class="spread__page spread__page--r paper lot-spread"><span class="ribbon" aria-hidden="true"></span>' +
        '<div class="spread__kicker"><p></p><p class="lot__stamp stamp stamp--red" hidden>Closing</p></div>' +
        '<p class="lotno" aria-hidden="true"><span>Lot</span><b></b></p>' +
        '<h3 class="spread__title"><a></a></h3><p class="lot__note" hidden></p><p class="entry"></p>' +
        '<dl class="bidline"><div><dt>Current bid · sample</dt><dd class="b"></dd></div><div><dt>Time left</dt><dd class="clock"></dd></div>' +
        '<div><dt>Bids</dt><dd class="n"></dd></div><div><dt>Reserve</dt><dd class="r"></dd></div></dl>' +
        '<div class="spread__cta"><a class="btn btn--ink">Place a bid<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg></a>' +
        '<button class="btn btn--line watch" type="button" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z"/></svg><span class="watch__txt">Watch</span></button>' +
        '<span class="lot__watchers"></span></div>' +
      '</article>';
    // the two pages sit directly in the .spread grid
    var frag = document.createDocumentFragment();
    var left_ = w.firstElementChild, right_ = w.lastElementChild;
    var img = $('img', left_); img.src = l.stage_image; img.alt = altOf(l);
    $('figcaption', left_).textContent = stagedCap(l);
    right_.dataset.id = l.feed_id;
    $('.spread__kicker p', right_).textContent = label;
    $('.lotno b', right_).textContent = pad(l.lot);
    var a = $('.spread__title a', right_); a.textContent = headline(l); a.href = 'lot.html?id=' + l.feed_id;
    if (l.note) { var nt = $('.lot__note', right_); nt.hidden = false; nt.textContent = l.note; }
    $('.entry', right_).textContent = entryLine(l);
    $('.b', right_).textContent = money(l.current_bid);
    $('.clock', right_).dataset.clock = l.feed_id;
    $('.n', right_).textContent = l.bid_count;
    $('.r', right_).textContent = reserveWord(l.reserve);
    $('.spread__cta .btn--ink', right_).href = 'lot.html?id=' + l.feed_id;
    $('.lot__watchers', right_).textContent = l.watchers + ' watching';
    watchBtn($('.watch', right_), l);
    frag.appendChild(left_); frag.appendChild(right_);
    return frag;
  }

  var firstRender = true;
  function render() {
    var list = listed();
    spreadEl.innerHTML = ''; sheetsEl.innerHTML = '';
    var sortWord = { soonest: 'ending soonest first', newest: 'newly listed first', noreserve: 'no-reserve lots, ending soonest first' }[state.sort];
    if (!list.length) {
      var e = document.createElement('div');
      e.className = 'empty paper';
      var why = state.q.trim() ? 'No lot in this catalogue matches “' + state.q.trim() + '”.' : state.watchedOnly ? 'You are not watching a lot yet. Mark one with the ribbon.' : 'No open lot matches these filters.';
      e.innerHTML = '<p></p><button class="btn btn--line" type="button" id="reset">Show every lot</button>';
      $('p', e).textContent = why;
      sheetsEl.appendChild(e);
      $('#reset').addEventListener('click', resetFilters);
      statusEl.textContent = 'No lots shown.';
    } else {
      var label = state.sort === 'newest' ? 'Newest listing' : state.sort === 'noreserve' ? 'No reserve · closing first' : 'Closing first';
      spreadEl.appendChild(buildSpread(list[0], label));
      list.slice(1).forEach(function (l) { sheetsEl.appendChild(buildSheet(l)); });
      statusEl.textContent = 'Showing ' + list.length + ' of ' + lots.length + ' lots · ' + sortWord + (state.make ? ' · ' + state.make : '') + (state.watchedOnly ? ' · watched only' : '') + (state.q.trim() ? ' · matching “' + state.q.trim() + '”' : '') + '.';
    }
    syncWatch(); tick();
    if (!firstRender) dealIn();
    firstRender = false;
    refresh();
  }
  function resetFilters() {
    state.make = ''; state.watchedOnly = false; state.q = ''; state.sort = 'soonest';
    $('#make').value = ''; $('#only-watched').checked = false; $('#q').value = '';
    $$('input[name="sort"]').forEach(function (r) { r.checked = r.value === 'soonest'; });
    syncHdrWatch(); render();
  }

  $$('input[name="sort"]').forEach(function (r) { r.addEventListener('change', function () { state.sort = r.value; render(); }); });
  $('#make').addEventListener('change', function () { state.make = this.value; render(); });
  $('#only-watched').addEventListener('change', function () { state.watchedOnly = this.checked; syncHdrWatch(); render(); });

  /* ---------- watch: the ribbon ---------- */
  function syncHdrWatch() {
    $('[data-watchcount]').textContent = watched.size;
    $('#hdr-watch').setAttribute('aria-pressed', String(state.watchedOnly));
  }
  function syncWatch() {
    $$('[data-watch]').forEach(function (b) {
      var on = watched.has(Number(b.dataset.watch));
      b.setAttribute('aria-pressed', String(on));
      var t = $('.watch__txt', b); if (t) t.textContent = on ? 'Watching' : 'Watch';
      var host = b.closest('.lot, .lot-spread'); if (host) host.classList.toggle('is-watched', on);
    });
    syncHdrWatch();
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-watch]');
    if (!b) return;
    var id = Number(b.dataset.watch);
    if (watched.has(id)) watched.delete(id); else watched.add(id);
    store.set('gla-watch', Array.from(watched));
    syncWatch();
    if (state.watchedOnly) render();
  });
  $('#hdr-watch').addEventListener('click', function () {
    state.watchedOnly = !state.watchedOnly;
    $('#only-watched').checked = state.watchedOnly;
    syncHdrWatch(); render(); goTo('#lots');
  });

  /* ---------- search ---------- */
  var hdr = $('#hdr'), q = $('#q'), sbtn = $('#search-btn');
  q.addEventListener('input', function () {
    state.q = q.value; render();
    var t = $('#lots').getBoundingClientRect().top;
    if (q.value.trim() && (t > window.innerHeight * .5 || t < -$('#lots').offsetHeight + 200)) goTo('#lots');
  });
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { q.value = ''; state.q = ''; render(); if (hdr.classList.contains('is-searching')) { hdr.classList.remove('is-searching'); sbtn.setAttribute('aria-expanded', 'false'); sbtn.focus(); } }
    if (e.key === 'Enter') goTo('#lots');
  });
  sbtn.addEventListener('click', function () {
    var on = !hdr.classList.contains('is-searching');
    hdr.classList.toggle('is-searching', on);
    sbtn.setAttribute('aria-expanded', String(on));
    if (on) q.focus();
  });

  /* ---------- the VIN, read and decoded (Lot 03) ---------- */
  var VIN = 'SCFSBGKV0RGZ10077';
  function checkDigit(v) {
    var map = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 };
    var w = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2], sum = 0;
    for (var i = 0; i < 17; i++) { var c = v[i]; sum += (/\d/.test(c) ? Number(c) : map[c]) * w[i]; }
    var r = sum % 11;
    return r === 10 ? 'X' : String(r);
  }
  var YEARS = 'ABCDEFGHJKLMNPRSTVWXY123456789';   // 1980 → 2009, then the cycle repeats from 2010
  function yearsFor(c) { var i = YEARS.indexOf(c); return i < 0 ? [] : [1980 + i, 2010 + i].filter(function (y) { return y <= 2039; }); }
  var cd = checkDigit(VIN);
  var GROUPS = [
    { from: 0, to: 3, tag: 'Maker', text: '<b>SCF</b>: world manufacturer identifier. Aston Martin.' },
    { from: 3, to: 8, tag: 'Descriptor', text: '<b>SBGKV</b>: vehicle descriptor. Model, body and engine codes, set by the maker.' },
    { from: 8, to: 9, tag: 'Check', text: '<b>0</b>: check digit. Computed from the other sixteen characters: ' + cd + '. <span class="ok">' + (cd === VIN[8] ? 'Valid.' : 'Does not match.') + '</span>' },
    { from: 9, to: 10, tag: 'Year', text: '<b>R</b>: model year 2024.' },
    { from: 10, to: 11, tag: 'Plant', text: '<b>G</b>: assembly plant code.' },
    { from: 11, to: 17, tag: 'Serial', text: '<b>Z10077</b>: serial. This car’s production sequence.' }
  ];
  var vinRow = $('.vin__row'), vinRead = $('#vin-read');
  var VIN_DEFAULT = 'Decoded by AI on intake: Aston Martin, model year 2024, check digit <span class="ok">' + (cd === VIN[8] ? 'valid' : 'invalid') + '</span>. Mileage at inspection: 225.';
  vinRead.innerHTML = VIN_DEFAULT;
  GROUPS.forEach(function (g, gi) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'vin__grp';
    var chars = VIN.slice(g.from, g.to);
    b.setAttribute('aria-label', g.tag + ': ' + chars.split('').join(' '));
    b.innerHTML = '<span class="vin__cells">' + chars.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('') + '</span><span class="vin__tag">' + g.tag + '</span>';
    var on = function () {
      $$('.vin__grp', vinRow).forEach(function (x) { x.classList.toggle('is-active', x === b); x.setAttribute('aria-pressed', String(x === b)); });
      vinRow.classList.add('has-active'); vinRead.innerHTML = g.text;
    };
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('mouseenter', on); b.addEventListener('focus', on); b.addEventListener('click', on);
    vinRow.appendChild(b);
  });
  $('#vin-diagram').addEventListener('mouseleave', function () {
    if (vinRow.contains(document.activeElement)) return;
    vinRow.classList.remove('has-active'); $$('.vin__grp', vinRow).forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
    vinRead.innerHTML = VIN_DEFAULT;
  });
  vinRow.addEventListener('focusout', function (e) {
    if (vinRow.contains(e.relatedTarget)) return;
    vinRow.classList.remove('has-active'); $$('.vin__grp', vinRow).forEach(function (x) { x.classList.remove('is-active'); x.setAttribute('aria-pressed', 'false'); });
    vinRead.innerHTML = VIN_DEFAULT;
  });

  /* ---------- prices realised ---------- */
  var realised = $('#realised'), rImg = $('#results-img'), rCap = $('#results-cap');
  var focusPos = function (box) { return ((box[0] + box[2]) / 2 * 100).toFixed(1) + '% ' + ((box[1] + box[3]) / 2 * 100).toFixed(1) + '%'; };
  function showSold(s, btn) {
    $$('.row', realised).forEach(function (r) { r.setAttribute('aria-pressed', String(r === btn)); });
    if (rImg.dataset.id === String(s.feed_id)) return;
    rImg.dataset.id = s.feed_id;
    var swap = function () {
      rImg.src = s.image; rImg.style.objectPosition = focusPos(s.car_box);
      rImg.alt = s.year + ' ' + s.make + ' ' + s.model + ', photographed at Patton Motors';
      rCap.textContent = s.year + ' ' + s.make + ' ' + s.model;
      rImg.classList.remove('is-swapping');
    };
    if (reduce) { swap(); return; }
    rImg.classList.add('is-swapping');
    setTimeout(swap, 220);
  }
  sold.forEach(function (s, i) {
    var li = document.createElement('li');
    li.innerHTML = '<button class="row" type="button" aria-pressed="false" aria-controls="results-plate"><span><span class="row__name"></span><span class="row__chassis"></span></span><span class="row__lead" aria-hidden="true"></span><span class="row__price"><small>Sold for · sample</small><b></b></span></button>';
    var b = $('.row', li);
    $('.row__name', li).textContent = s.year + ' ' + s.make + ' ' + s.model;
    $('.row__chassis', li).textContent = s.chassis;
    $('b', li).textContent = money(s.result);
    b.addEventListener('mouseenter', function () { showSold(s, b); });
    b.addEventListener('focus', function () { showSold(s, b); });
    b.addEventListener('click', function () { showSold(s, b); });
    realised.appendChild(li);
    if (!i) { rImg.dataset.id = s.feed_id; rImg.style.objectPosition = focusPos(s.car_box); rImg.alt = s.year + ' ' + s.make + ' ' + s.model + ', photographed at Patton Motors'; b.setAttribute('aria-pressed', 'true'); }
  });

  /* ---------- consign: VIN with a live check (prototype: nothing is sent) ---------- */
  var vin = $('#vin'), vinLive = $('#vin-live'), vinMsg = $('#vin-msg'), vinEmail = $('#vin-email');
  var VALID = /^[A-HJ-NPR-Z0-9]{17}$/;
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); };
  vin.addEventListener('input', function () {
    var v = vin.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (v !== vin.value) vin.value = v;
    vin.removeAttribute('aria-invalid');
    if (/[IOQ]/.test(v)) { vinLive.textContent = v.length + ' of 17 · a VIN never uses I, O or Q'; return; }
    if (v.length < 17) { vinLive.textContent = v.length + ' of 17'; return; }
    var c = checkDigit(v), ys = yearsFor(v[9]);
    vinLive.innerHTML = '17 of 17 · ' + (c === v[8] ? '<span class="ok">check digit ' + c + ', valid</span>' : 'check digit does not compute (common on European cars; a specialist confirms)') + (ys.length ? ' · model-year code ' + v[9] + ': ' + ys.join(' or ') : '');
  });
  $('#vinform').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = vin.value.trim().toUpperCase(), em = vinEmail.value.trim();
    vinMsg.classList.remove('is-error');
    if (!VALID.test(v)) {
      vin.setAttribute('aria-invalid', 'true'); vinMsg.classList.add('is-error');
      vinMsg.textContent = 'A VIN has 17 letters and numbers, without I, O or Q. Pre-1981 chassis numbers are handled by a specialist: add your email and say so.';
      vin.focus(); return;
    }
    if (em && !emailOk(em)) { vinEmail.setAttribute('aria-invalid', 'true'); vinMsg.classList.add('is-error'); vinMsg.textContent = 'That email address looks incomplete.'; vinEmail.focus(); return; }
    vinEmail.removeAttribute('aria-invalid');
    vinMsg.textContent = 'VIN accepted. In the live product a Golden Lion specialist would contact you to arrange the inspection. Prototype: nothing was sent.';
  });

  /* ---------- registration slip ---------- */
  $('#regform').addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true, first = null;
    var fail = function (input, errId, msg) {
      $('#' + errId).textContent = msg;
      if (msg) { input.setAttribute('aria-invalid', 'true'); ok = false; first = first || input; } else input.removeAttribute('aria-invalid');
    };
    var nm = $('#reg-name'), em = $('#reg-email'), tc = $('#reg-terms');
    fail(nm, 'reg-name-err', nm.value.trim().length < 2 ? 'Enter your full name.' : '');
    fail(em, 'reg-email-err', !emailOk(em.value.trim()) ? 'Enter an email address, like name@example.com.' : '');
    fail(tc, 'reg-terms-err', !tc.checked ? 'Tick to confirm you have read the draft conditions.' : '');
    var msg = $('#reg-msg');
    if (!ok) { msg.textContent = ''; first.focus(); return; }
    msg.textContent = 'Thank you, ' + nm.value.trim().split(' ')[0] + '. In the live product your account would now be verified. Prototype: nothing was sent.';
  });

  /* ---------- the dispatch ---------- */
  $('#dispatch').addEventListener('submit', function (e) {
    e.preventDefault();
    var em = $('#dispatch-email'), msg = $('#dispatch-msg');
    if (!emailOk(em.value.trim())) { em.setAttribute('aria-invalid', 'true'); msg.classList.add('is-error'); msg.textContent = 'Enter an email address, like name@example.com.'; em.focus(); return; }
    em.removeAttribute('aria-invalid'); msg.classList.remove('is-error');
    msg.textContent = 'You are on the list. Prototype: nothing was sent.';
  });

  /* ---------- how the hammer falls: a sample clock (proposed rule) ---------- */
  var hs = 160, hClock = $('#hammer-clock'), hLog = $('#hammer-log'), hBtn = $('#hammer-bid'), hDone = 0;
  var mmss = function (s) { return pad(s / 60) + ':' + pad(s % 60); };
  function hlog(t) {
    var li = document.createElement('li'); li.textContent = t;
    hLog.insertBefore(li, hLog.firstChild);
    while (hLog.children.length > 3) hLog.removeChild(hLog.lastChild);
  }
  function hammerTick() {
    if (hs > 0) {
      hs--;
      if (hs === 0) { hlog('Two minutes passed without a bid. The hammer falls to the last bidder.'); hBtn.disabled = true; hDone = 4; }
    } else if (hDone > 0 && --hDone === 0) { hs = 160; hLog.innerHTML = ''; hBtn.disabled = false; }
    hClock.textContent = mmss(hs);
    hClock.classList.toggle('is-urgent', hs > 0 && hs <= 120);
  }
  hBtn.addEventListener('click', function () {
    if (hs <= 0) return;
    if (hs <= 120) { hlog('Bid at ' + mmss(hs) + ' left. Inside the final two minutes: the clock resets to 02:00.'); hs = 120; }
    else hlog('Bid at ' + mmss(hs) + ' left. More than two minutes remain: the clock runs on.');
    hClock.textContent = mmss(hs);
  });

  /* ---------- the ticking: information, so it runs under reduced motion too ---------- */
  var soonest = function () { return lots.filter(function (l) { return left(l) > 0; }).sort(function (a, b) { return left(a) - left(b); })[0]; };
  function tick() {
    var live = lots.filter(function (l) { return left(l) > 0; }).length;
    $$('[data-livecount]').forEach(function (e) { e.textContent = live; });
    $$('[data-clock]').forEach(function (el) {
      var l = byId[el.dataset.clock]; if (!l) return;
      var s = left(l);
      el.textContent = fmt(s);
      el.setAttribute('aria-label', spoken(s));
      var host = el.closest('.lot, .lot-spread, .cover__sheet');
      if (!host) return;
      host.classList.toggle('is-urgent', s > 0 && s < 3600);
      var st = $('.lot__stamp', host); if (st) st.hidden = !(s > 0 && s < 3600);
    });
    var n = soonest(), slip = $('#closing-slip');
    if (n) {
      var s = left(n);
      $('[data-slip="name"]', slip).textContent = 'Lot ' + pad(n.lot) + ' · ' + n.year + ' ' + n.make + ' ' + n.model;
      var c = $('[data-slip="clock"]', slip); c.textContent = fmt(s); c.classList.toggle('is-urgent', s < 3600);
      slip.setAttribute('aria-label', 'Closing next: lot ' + pad(n.lot) + ', ' + n.year + ' ' + n.make + ' ' + n.model + ', ' + spoken(s) + '. Go to the lots.');
    }
  }

  /* ---------- the index: which divider is open ---------- */
  var tabs = $$('#index a');
  var secs = $$('[data-section]');
  function syncIndex() {
    var mid = window.innerHeight * .4, cur = null;
    secs.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) cur = s.dataset.section; });
    tabs.forEach(function (t) { if (t.dataset.tab === cur) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', syncIndex, { passive: true });
  window.addEventListener('resize', syncIndex);

  var lenis = null;
  function goTo(sel) {
    var el = $(sel); if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -($('#hdr').offsetHeight + 16) });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }

  render(); syncIndex();
  setInterval(function () { tick(); hammerTick(); }, 1000);

  /* ---------- motion ---------- */
  function refresh() { if (window.ScrollTrigger && !reduce) window.ScrollTrigger.refresh(); }
  function dealIn() {
    if (reduce || !window.gsap) return;
    window.gsap.fromTo($$('#spread > *, #sheets > *'), { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .55, ease: 'power3.out', stagger: .035, clearProps: 'transform,opacity,visibility' });
  }
  var hasGsap = window.gsap && window.ScrollTrigger;
  // the cover pins: a restored mid-page scroll would land inside the pin, so open at the cover
  if (hasGsap && !reduce && !location.hash && 'scrollRestoration' in history) { history.scrollRestoration = 'manual'; window.scrollTo(0, 0); }
  if (reduce || !hasGsap) { root.classList.remove('js-motion'); return; }

  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  if (window.Lenis) {
    lenis = new window.Lenis({ autoRaf: false, anchors: { offset: -($('#hdr').offsetHeight + 16) } });
    lenis.on('scroll', ST.update);
    lenis.on('scroll', syncIndex);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    // the index links and any in-page link go through Lenis
    $$('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var h = a.getAttribute('href'); if (h.length < 2 || !$(h)) return;
        e.preventDefault(); goTo(h);
        if (h === '#register') setTimeout(function () { $('#reg-name').focus({ preventScroll: true }); }, 900);
      });
    });
  }

  // the cover lands on the desk: plate first, then the sheet, the tag and the slip
  var land = gsap.timeline({ defaults: { ease: 'power3.out' } });
  land.from('#cover-plate', { y: 28, rotation: 1.8, autoAlpha: 0, duration: 1.1, clearProps: 'transform,opacity,visibility' })
      .from('#cover-sheet', { y: 36, x: -18, rotation: -2.2, autoAlpha: 0, duration: 1.1, clearProps: 'transform,opacity,visibility' }, .18)
      .from('.tag', { y: -26, rotation: 14, autoAlpha: 0, duration: .8, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility' }, .7)
      .from('#closing-slip', { y: 24, rotation: 5, autoAlpha: 0, duration: .8, clearProps: 'transform,opacity,visibility' }, .8);

  // lot pages are dealt onto the desk as they come into view (first render only)
  function dealOnScroll() {
    var nodes = $$('#spread > *, #sheets > .lot');
    nodes.forEach(function (n, i) { gsap.set(n, { y: 60, rotation: (i % 2 ? 1 : -1) * 1.6, autoAlpha: 0 }); });
    ST.batch(nodes, {
      start: 'top 90%', once: true,
      onEnter: function (els) { gsap.to(els, { y: 0, rotation: 0, autoAlpha: 1, duration: 1.05, ease: 'power3.out', stagger: .09, clearProps: 'transform,opacity,visibility' }); }
    });
  }
  dealOnScroll();

  var mm = gsap.matchMedia();
  mm.add('(min-width: 1024px) and (min-height: 700px)', function () {
    // DNA95: pin, hold, the sheet lifts away, release. The plate stays; it is the subject.
    // only when the whole cover stands inside one screen; otherwise it simply scrolls
    if ($('.cover__in').offsetHeight > window.innerHeight - $('#hdr').offsetHeight - 16) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: '.cover', start: 'top top+=' + $('#hdr').offsetHeight, end: '+=85%', pin: true, scrub: .35, anticipatePin: 1, invalidateOnRefresh: true } });
    // as the sheet lifts away, the plate is drawn to the centre of the desk: every stopped frame stays composed
    var toCentre = function () {
      var c = $('.cover__in').getBoundingClientRect(), p = $('#cover-plate').getBoundingClientRect();
      return (c.left + c.width / 2) - (p.left + p.width / 2);
    };
    tl.to({}, { duration: .5 })
      .to(['#cover-sheet', '#closing-slip'], { y: -80, autoAlpha: 0, ease: 'none', duration: .5 }, .5)
      .to('#cover-plate', { x: toCentre, rotation: -.5, ease: 'none', duration: .5 }, .5);
    // the record and the realised sheet settle as they arrive
    gsap.fromTo('#record-sheet', { rotation: -1.6, y: 50 }, { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#record', start: 'top bottom', end: 'top 35%', scrub: .5 } });
    gsap.fromTo('.realised', { rotation: 1.2, y: 60 }, { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#results', start: 'top bottom', end: 'top 35%', scrub: .5 } });
    gsap.fromTo('.conditions', { rotation: -1, y: 50 }, { rotation: 0, y: 0, ease: 'none', scrollTrigger: { trigger: '#conditions', start: 'top bottom', end: 'top 35%', scrub: .5 } });
  });

  window.addEventListener('load', refresh);
})();
