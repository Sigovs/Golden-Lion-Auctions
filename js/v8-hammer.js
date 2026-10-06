/* Golden Lion Auctions — HOME v8, "How the hammer falls".
   One simulated close of a sample lot, told against the PROPOSED anti-sniping rule. Bids, bidders and the result are
   SAMPLE data; the quiet two minutes are time-compressed and say so.

   The v7 structure, with the counter rebuilt on Alex's note (6 Oct 2026):
   - MM:SS always (00:09, 02:00, 01:37), in fixed-width slots, so the readout never changes width.
   - One script is the source of truth for the clock and the step text (Alex, 6 Oct 2026); every number in the
     active step is the number on the clock. Every second exists: pin progress maps to time one second at a time.
       p 0   – .03   01  02:00, holding                       "The last two minutes" · Bidding open
       p .03 – .23   01  02:00 → 00:31, every second
       p .23 – .35   02  00:30 → 00:07, every second           "A late bid" · Going once at 00:30, Going twice at 00:15
       p .36         02  the bid of $415,000 lands at 00:07 (its row appears)
       p .37         02  the window refills: 00:07 rolls back to 02:00, the gauge goes full, "Extended · back to 02:00"
       p .42 – .78   03  02:00 → 00:00, every second            "Two quiet minutes" · Going once, Going twice, red at 10 s
       p .78         04  00:00 — the gavel lands (js/v8-gavel.js); at .79 the clock turns over into SOLD, the result shows
       p .80 – 1     04  the hold: nothing moves. The pin then releases (Alex, 7 Oct 2026: movement → impact → silence →
                         release). The pin was lengthened (+=420% → +=480%) so every second keeps its old scroll distance.
   - The closing window is drawn: a thin gauge under the clock that drains with the time and refills on the bid.
   - The auctioneer's call follows the time left: Bidding open (> 30 s), Going once (≤ 30 s), Going twice (≤ 15 s), Sold.
   - The last ten seconds turn the digits a warm urgent red (AA on the ground); the extension turns them back.
   Everything is derived from the scroll position; the roll and the turnover are short tweens fired when a threshold is
   crossed and reversed when it is crossed back, so any resting frame is a whole state.
   Screen readers hear the call changes and the bid, never the seconds.
   Phones/tablets: no pin; each step carries its own still readout and gauge; step 04 turns over once on entry.
   Reduced motion / no JS: the static frame in the markup (bid landed, 02:00, window full), plus Step through on desktop.
   The gavel behind the copy (js/v8-gavel.js) is driven by this pin's progress (event `hammer:progress`). */
(function () {
  'use strict';
  var sec = document.getElementById('hammer');
  if (!sec) return;
  var $ = function (s, c) { return (c || sec).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || sec).querySelectorAll(s)); };

  var face = $('#demo-clock'), callEl = $('#hammer-call'), status = $('#demo-state'), late = $('.hammer__log .is-late');
  var gauge = $('#gauge'), gaugeS = $('#gauge-s'), result = $('#hammer-result');
  var steps = $$('.hammer__step'), copy = $('.hammer__copy'), room = $('.hammer__room'), through = $('#hammer-step');
  var mini = $('#hammer-mini');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* ---------- motion tokens (seconds) ---------- */
  var M = { roll: .48, rollStagger: .05, turn: .6, turnStagger: .07, turnLag: .12, row: .32, callOut: .12, callIn: .22, flash: 140 };
  /* ---------- the score ---------- */
  var P = { a0: .03, a1: .23, b1: .35, bid: .36, reset: .37, q0: .42, q1: .78, sold: .79 };   // .80 – 1: the hold
  var WINDOW = 120;
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmt = function (s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); };
  var callFor = function (s) { return s <= 0 ? 'Sold' : s <= 15 ? 'Going twice' : s <= 30 ? 'Going once' : 'Bidding open'; };
  var LABEL = { 1: 'Final two minutes', 2: 'Final seconds', ext: 'Extended · back to 02:00', 3: 'No new bid', 4: 'Closed' };
  var SAY = {
    bid: 'A late bid of $415,000 at 00:07, sample. Extended: the clock goes back to 02:00. Bidding open.',
    'Bidding open': 'Bidding open.',
    'Going once': 'Going once.',
    'Going twice': 'Going twice.',
    Sold: 'Sold for $415,000, sample, to Bidder 14. End of the simulation.'
  };

  /* ---------- a clock face: five clipped slots (MM:SS) + a SOLD layer ---------- */
  function Face(el) {
    this.el = el;
    this.slots = $$('.hammer__time .slot', el);
    this.timeR = $$('.hammer__time .r', el);
    this.soldR = $$('.hammer__sold .r', el);
    this.tweens = [];
    this.turn = null;
  }
  Face.prototype.settle = function () {
    this.tweens.forEach(function (t) { t.kill(); });
    this.tweens = [];
    this.slots.forEach(function (s) {
      var g = s.querySelectorAll('.g');
      for (var i = 0; i < g.length - 1; i++) g[i].parentNode.removeChild(g[i]);
      var keep = g[g.length - 1];
      keep.className = 'g';
      if (gsap) gsap.set(keep, { clearProps: 'transform' });
    });
  };
  Face.prototype.set = function (str) {
    this.settle();
    this.slots.forEach(function (s, i) { var g = s.querySelector('.g'); if (g.textContent !== str[i]) g.textContent = str[i]; });
  };
  Face.prototype.roll = function (str, dir) {        // dir 1: the new glyph drops in from above (the window refilling)
    this.settle();
    var self = this, n = this.slots.length;
    this.slots.forEach(function (s, i) {
      var old = s.querySelector('.g');
      if (old.textContent === str[i]) return;
      var inn = document.createElement('span');
      inn.className = 'g g--in';
      inn.textContent = str[i];
      old.parentNode.appendChild(inn);
      var d = (n - 1 - i) * M.rollStagger;
      self.tweens.push(gsap.fromTo(inn, { yPercent: -150 * dir }, { yPercent: 0, duration: M.roll, ease: 'power3.out', delay: d }));
      self.tweens.push(gsap.to(old, { yPercent: 150 * dir, duration: M.roll, ease: 'power3.out', delay: d, onComplete: function () {
        if (old.parentNode) old.parentNode.removeChild(old);
        inn.className = 'g';
      } }));
    });
  };
  Face.prototype.live = function () {
    if (this.turn) return;
    gsap.set(this.timeR, { yPercent: 0 });
    gsap.set(this.soldR, { yPercent: 150 });
    this.el.classList.remove('is-sold');
    this.el.classList.add('is-live');
    this.turn = gsap.timeline({ paused: true })
      .to(this.timeR, { yPercent: -150, duration: M.turn, ease: 'power3.in', stagger: M.turnStagger }, 0)
      .to(this.soldR, { yPercent: 0, duration: M.turn, ease: 'expo.out', stagger: M.turnStagger }, M.turnLag + M.turn * .35);
  };
  Face.prototype.unlive = function (sold) {
    this.settle();
    if (this.turn) { this.turn.kill(); this.turn = null; }
    if (gsap) gsap.set(this.timeR.concat(this.soldR), { clearProps: 'transform' });
    this.el.classList.remove('is-live');
    this.el.classList.toggle('is-sold', !!sold);
  };

  var big = new Face(face);
  var small = mini ? new Face(mini) : null;

  /* ---------- state writers ---------- */
  var curStep = 0, curCall = callEl.textContent, curLabel = gaugeS.textContent;
  function setStep(n) {
    if (n === curStep) return;
    curStep = n;
    steps.forEach(function (li) {
      if (+li.getAttribute('data-step') === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
  }
  function setCall(txt, animate) {
    if (txt === curCall) return false;
    curCall = txt;
    if (!animate || !gsap) { callEl.textContent = txt; if (gsap) gsap.set(callEl, { opacity: 1, y: 0 }); return true; }
    gsap.to(callEl, { opacity: 0, y: -6, duration: M.callOut, ease: 'power1.in', overwrite: true, onComplete: function () {
      callEl.textContent = curCall;
      gsap.fromTo(callEl, { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: M.callIn, ease: 'power2.out', overwrite: true });
    } });
    return true;
  }
  function setGauge(s, label, urgent) {
    gauge.style.setProperty('--g', (s / WINDOW).toFixed(4));
    gauge.classList.toggle('is-urgent', !!urgent);
    if (label !== curLabel) { curLabel = label; gaugeS.textContent = label; }
  }
  function staticFrame(n) {                            // whole frames: reduced motion, no pin, teardown
    var t = n === 1 ? 31 : n === 2 ? WINDOW : n === 3 ? 15 : 0;    // 1: the end of the last two minutes; 2: just extended
    big.unlive(n === 4);
    big.set(fmt(t));
    face.classList.remove('is-urgent');
    late.style.visibility = n === 1 ? 'hidden' : '';
    result.classList.toggle('is-on', n === 4);
    setGauge(t, n === 2 ? LABEL.ext : LABEL[n], false);
    setCall(callFor(t), false);
  }

  /* No GSAP: the markup is the page. */
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  /* ---------- reduced motion, desktop: Step through, whole frames ---------- */
  if (reduce) {
    var mmR = gsap.matchMedia();
    mmR.add('(min-width: 900px)', function () {
      var n = 2;
      through.hidden = false;
      setStep(2);
      var label = function () { through.textContent = 'Step through · ' + n + ' of 4'; };
      label();
      function onClick() {
        n = n % 4 + 1; staticFrame(n); setStep(n); label();
        status.textContent = n === 2 ? SAY.bid : n === 4 ? SAY.Sold : SAY[callFor(n === 1 ? 31 : 15)];
      }
      through.addEventListener('click', onClick);
      return function () { through.removeEventListener('click', onClick); through.hidden = true; staticFrame(2); setStep(0); };
    });
    return;
  }

  var mm = gsap.matchMedia();

  /* ---------- desktop: the pinned, scroll-driven close ---------- */
  mm.add('(min-width: 900px) and (min-height: 640px)', function () {
    var inner = $('.hammer__in');
    var topH = function () { var t = document.getElementById('top'); return t ? t.offsetHeight : 0; };
    if (inner.offsetHeight + topH() + 32 > window.innerHeight) return;    // does not fit one screen: keep the static frame

    sec.classList.add('is-scrub');
    status.textContent = '';
    big.live();
    var shown = '02:00', lateOn = true, soldOn = false, ready = false;
    var rowTw = gsap.fromTo(late, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: M.row, ease: 'power2.out', paused: true });

    function secondsAt(p) {
      if (p < P.a0) return WINDOW;
      if (p < P.a1) return Math.max(31, WINDOW - Math.floor((p - P.a0) / (P.a1 - P.a0) * 90));            // 120 … 31
      if (p < P.b1) return Math.max(7, 30 - Math.floor((p - P.a1) / (P.b1 - P.a1) * 24));               // 30 … 7
      if (p < P.reset) return 7;
      if (p < P.q0) return WINDOW;
      if (p < P.q1) return Math.max(0, WINDOW - Math.floor((p - P.q0) / (P.q1 - P.q0) * (WINDOW + 1)));  // 120 … 0
      return 0;
    }
    function update(p) {
      var step = p < P.a1 ? 1 : p < P.q0 ? 2 : p < P.q1 ? 3 : 4;
      var s = secondsAt(p), str = fmt(s);
      var sold = p >= P.sold;
      if (str !== shown) {
        if (ready && shown === '00:07' && str === '02:00') {
          big.roll(str, 1);
          face.classList.add('is-flash');
          setTimeout(function () { face.classList.remove('is-flash'); }, M.flash);
        } else if (ready && shown === '02:00' && str === '00:07') {
          big.roll(str, -1);
        } else big.set(str);
        shown = str;
      }
      face.classList.toggle('is-urgent', s <= 10 && s > 0 && !sold);
      setGauge(s, step === 2 && p >= P.reset ? LABEL.ext : LABEL[step], s <= 10 && step !== 4);
      result.classList.toggle('is-on', sold);
      var wantLate = p >= P.bid;
      if (wantLate !== lateOn) { lateOn = wantLate; if (ready) { if (wantLate) rowTw.play(); else rowTw.reverse(); } else rowTw.progress(wantLate ? 1 : 0); }
      if (sold !== soldOn) { soldOn = sold; if (ready) { if (sold) big.turn.play(); else big.turn.reverse(); } else big.turn.progress(sold ? 1 : 0); }
      setStep(step);
      var changed = setCall(callFor(s), ready);
      if (ready) {
        var crossedBid = (p >= P.reset) !== (update.lastP >= P.reset) && p >= P.reset;
        if (crossedBid && step === 2) status.textContent = SAY.bid;   // a long jump past the bid announces where it landed
        else if (changed) status.textContent = SAY[curCall];
      }
      update.lastP = p;
    }
    update.lastP = 0;

    // the gavel (js/v8-gavel.js) is published the same progress as the clock, so it lands on 00:00, not after it
    function emit(p) { sec.__hammerP = p; sec.dispatchEvent(new CustomEvent('hammer:progress', { detail: { p: p } })); }
    // the room light is the only scrubbed layer
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: function () { return 'top ' + topH(); }, end: '+=480%', pin: true, scrub: .35, invalidateOnRefresh: true,
        onUpdate: function (self) { update(self.progress); emit(self.progress); },
        onRefresh: function (self) { update(self.progress); emit(self.progress); }
      }
    });
    tl.fromTo(room, { opacity: .06, x: -16, y: 10, scale: 1 }, { x: 16, y: -10, scale: 1.04, duration: P.q1 }, 0)
      .to(room, { opacity: .11, duration: .03 }, P.reset)
      .to(room, { opacity: .07, duration: .04 }, P.reset + .03)
      .to(room, { opacity: .035, duration: P.q1 - P.q0 }, P.q0)
      .to(room, { opacity: .09, duration: .05 }, P.sold)
      .to({}, { duration: 1 - P.sold - .05 }, P.sold + .05);   // the hold: a dead zone to the end of the pin; nothing moves

    update(tl.scrollTrigger.progress);
    emit(tl.scrollTrigger.progress);
    ready = true;

    return function () {
      ready = false;
      rowTw.kill();
      gsap.set([late, copy, room, callEl], { clearProps: 'all' });
      result.classList.remove('is-on');
      face.classList.remove('is-flash');
      sec.classList.remove('is-scrub');
      staticFrame(2);
      setStep(0);
      status.textContent = SAY.bid;
      emit(null);                                      // no pin: the gavel falls back to its still frame
    };
  });

  /* ---------- phones and tablets: still readouts; step 04 turns over once ---------- */
  mm.add('(max-width: 899.98px)', function () {
    if (!small) return;
    small.live();
    var st = ST.create({
      trigger: mini, start: 'top 82%', once: true,
      onEnter: function () { gsap.delayedCall(.25, function () { small.turn.play(); }); }
    });
    return function () { st.kill(); small.unlive(true); };
  });
})();
