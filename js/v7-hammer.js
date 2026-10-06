/* Golden Lion Auctions — HOME v7, "How the hammer falls".
   One simulated close of a sample lot, told against the PROPOSED anti-sniping rule.
   Bids, bidders and the result are SAMPLE data; the quiet two minutes are time-compressed and say so.

   Desktop (>= 900px wide, >= 640px tall, motion allowed): the section pins for three screens. The clock
   stays put; scroll drives it and the steps on the right:
     p 0–.22   01  final seconds, 0:09 -> 0:04, one hard cut per second, the colon ticks
     p .22–.32 02  the late bid lands (.24) and the clock rolls back to 2:00 (.26)
     p .32–.74 03  the quiet: 2:00 -> 0:00 in compressed jumps (colon still), the room light dims
     p .74–1   04  at .76 the four characters of 0:00 turn over into SOLD; the copy leaves at the end
   Digits are derived from scroll position; the roll, the turnover and the bid row are short tweens fired
   when a threshold is crossed (and reversed when it is crossed back), so a stopped frame is never half-rolled.
   Phones/tablets: no pin; each step carries a still clock, and step 04 turns 0:00 into SOLD once on entry.
   Reduced motion / no JS: the static frame in the markup (late bid landed, 2:00, all steps), plus a
   Step-through button on desktop. Screen readers hear state changes only, never seconds. */
(function () {
  'use strict';
  var sec = document.getElementById('hammer');
  if (!sec) return;
  var $ = function (s, c) { return (c || sec).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || sec).querySelectorAll(s)); };

  var face = $('#demo-clock'), cap = $('#hammer-cap'), status = $('#demo-state'), late = $('.hammer__log .is-late');
  var steps = $$('.hammer__step'), copy = $('.hammer__copy'), room = $('.hammer__room'), through = $('#hammer-step');
  var mini = $('#hammer-mini');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;

  /* ---------- motion tokens (seconds) ---------- */
  var M = { roll: .48, rollStagger: .05, turn: .6, turnStagger: .07, turnLag: .12, capOut: .14, capIn: .24, row: .32, tick: .3, flash: 120 };
  /* ---------- the score: where each beat sits in pin progress ---------- */
  var P = { count0: .06, count1: .22, bid: .24, reset: .26, quiet0: .32, quiet1: .70, step4: .74, sold: .76, exit: .92 };
  var QUIET = ['2:00', '1:50', '1:40', '1:30', '1:20', '1:10', '1:00', '0:50', '0:40', '0:30', '0:20', '0:10', '0:05', '0:03', '0:02', '0:01', '0:00'];
  var REAL = { '0:03': 1, '0:02': 1, '0:01': 1, '0:00': 1 };

  var CAP = {
    1: '<span class="k">Sample lot · time left</span>',
    2: 'Late bid at 0:04 · the clock goes back to 2:00',
    3: '<span class="dot" aria-hidden="true"></span>Time compressed · two minutes, no new bid',
    4: '<span class="k">Sold for · sample</span><b>$415,000</b>'
  };
  var SAY = {
    1: 'Simulation, sample lot: nine seconds left, bidding still open.',
    2: 'A late bid of $415,000 at 0:04, sample. The clock goes back to 2:00.',
    3: 'Time compressed: two minutes pass with no new bid.',
    4: 'Sold for $415,000, sample. End of the simulation.'
  };

  /* ---------- a clock face: four clipped slots + a SOLD layer ---------- */
  function Face(el) {
    this.el = el;
    this.slots = $$('.hammer__time .slot', el);
    this.timeR = $$('.hammer__time .r', el);
    this.soldR = $$('.hammer__sold .r', el);
    this.tweens = [];
    this.turn = null;
  }
  Face.prototype.text = function () { return this.slots.map(function (s) { var g = s.querySelectorAll('.g'); return g[g.length - 1].textContent; }).join(''); };
  Face.prototype.settle = function () {               // finish any roll at once: one glyph per slot, at rest
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
  Face.prototype.roll = function (str, dir) {        // dir 1: new glyph drops in from above (time rewinding)
    this.settle();
    var self = this, n = this.slots.length;
    this.slots.forEach(function (s, i) {
      var old = s.querySelector('.g');
      if (old.textContent === str[i]) return;
      var inn = document.createElement('span');
      inn.className = 'g g--in';
      inn.textContent = str[i];
      old.parentNode.appendChild(inn);
      var d = (n - 1 - i) * M.rollStagger;           // right to left
      self.tweens.push(gsap.fromTo(inn, { yPercent: -150 * dir }, { yPercent: 0, duration: M.roll, ease: 'power3.out', delay: d }));
      self.tweens.push(gsap.to(old, { yPercent: 150 * dir, duration: M.roll, ease: 'power3.out', delay: d, onComplete: function () {
        if (old.parentNode) old.parentNode.removeChild(old);
        inn.className = 'g';
      } }));
    });
  };
  Face.prototype.live = function () {                 // hand the SOLD layer to GSAP
    if (this.turn) return;
    gsap.set(this.timeR, { yPercent: 0 });
    gsap.set(this.soldR, { yPercent: 150 });
    this.el.classList.remove('is-sold');
    this.el.classList.add('is-live');
    this.turn = gsap.timeline({ paused: true })
      .to(this.timeR, { yPercent: -150, duration: M.turn, ease: 'power3.in', stagger: M.turnStagger }, 0)
      .to(this.soldR, { yPercent: 0, duration: M.turn, ease: 'expo.out', stagger: M.turnStagger }, M.turnLag + M.turn * .35);
  };
  Face.prototype.unlive = function (sold) {           // back to the CSS-driven static face
    this.settle();
    if (this.turn) { this.turn.kill(); this.turn = null; }
    if (gsap) gsap.set(this.timeR.concat(this.soldR), { clearProps: 'transform' });
    this.el.classList.remove('is-live');
    this.el.classList.toggle('is-sold', !!sold);
  };

  var big = new Face(face);
  var small = mini ? new Face(mini) : null;

  /* ---------- shared state writers ---------- */
  var curStep = 0;
  function setStep(n, announce) {
    if (n === curStep) return;
    curStep = n;
    steps.forEach(function (li) {
      if (+li.getAttribute('data-step') === n) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
    });
    if (announce) status.textContent = SAY[n];
  }
  var capN = 0;
  function setCap(n, instant) {
    if (n === capN) return;
    capN = n;
    if (instant || !gsap) { cap.innerHTML = CAP[n]; if (gsap) gsap.set(cap, { opacity: 1 }); return; }
    gsap.to(cap, { opacity: 0, duration: M.capOut, ease: 'power1.in', overwrite: true, onComplete: function () {
      cap.innerHTML = CAP[capN];
      gsap.to(cap, { opacity: 1, duration: M.capIn, ease: 'power1.out', overwrite: true });
    } });
  }
  function staticFrame(n) {                            // instant cuts: reduced motion, no pin, teardown
    big.unlive(n === 4);
    big.set(n === 1 ? '0:09' : n === 2 ? '2:00' : '0:00');
    late.style.visibility = n === 1 ? 'hidden' : '';
    setCap(n, true);
  }

  /* No GSAP: the markup is the page. */
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  /* ---------- reduced motion, desktop: Step through, hard cuts ---------- */
  if (reduce) {
    var mmR = gsap.matchMedia();
    mmR.add('(min-width: 900px)', function () {
      var n = 2;
      through.hidden = false;
      setStep(2, false);
      var label = function () { through.textContent = 'Step through · ' + n + ' of 4'; };
      label();
      function onClick() { n = n % 4 + 1; staticFrame(n); setStep(n, true); label(); }
      through.addEventListener('click', onClick);
      return function () { through.removeEventListener('click', onClick); through.hidden = true; staticFrame(2); setStep(0, false); };
    });
    return;
  }

  var mm = gsap.matchMedia();

  /* ---------- desktop: the pinned, scroll-driven close ---------- */
  mm.add('(min-width: 900px) and (min-height: 640px)', function () {
    var inner = $('.hammer__in');
    var topH = function () { var t = document.getElementById('top'); return t ? t.offsetHeight : 0; };
    if (inner.offsetHeight + topH() + 32 > window.innerHeight) return;    // does not fit a screen: keep the static frame

    sec.classList.add('is-scrub');
    status.textContent = '';                       // the static frame's sentence is stale once scroll drives it; announce changes only
    big.live();
    var shown = big.text(), lateOn = true, soldOn = false;
    var rowTw = gsap.fromTo(late, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: M.row, ease: 'power2.out', paused: true });
    var ready = false;

    function clockAt(p) {
      if (p < P.count0) return '0:09';
      if (p < P.count1) return '0:0' + (9 - Math.min(5, Math.floor((p - P.count0) / ((P.count1 - P.count0) / 5))));
      if (p < P.reset) return '0:04';
      if (p < P.quiet0) return '2:00';
      if (p < P.quiet1) return QUIET[Math.min(QUIET.length - 1, Math.floor((p - P.quiet0) / ((P.quiet1 - P.quiet0) / (QUIET.length - 1))))];
      return '0:00';
    }
    function tickColon() {
      gsap.fromTo(big.slots[1], { opacity: .4 }, { opacity: 1, duration: M.tick, ease: 'power1.out', overwrite: true });
    }
    function update(p) {
      var step = p < P.count1 ? 1 : p < P.quiet0 ? 2 : p < P.step4 ? 3 : 4;
      var str = clockAt(p);
      if (str !== shown) {
        if (ready && shown === '0:04' && str === '2:00') {
          big.roll(str, 1);
          if (ready) {
            face.classList.add('is-flash');
            setTimeout(function () { face.classList.remove('is-flash'); }, M.flash);
          }
        } else if (ready && shown === '2:00' && str === '0:04') {
          big.roll(str, -1);
        } else {
          big.set(str);
          if (ready && (step === 1 || REAL[str])) tickColon();
        }
        shown = str;
      }
      var wantLate = p >= P.bid;
      if (wantLate !== lateOn) { lateOn = wantLate; if (ready) { if (wantLate) rowTw.play(); else rowTw.reverse(); } else rowTw.progress(wantLate ? 1 : 0); }
      var wantSold = p >= P.sold;
      if (wantSold !== soldOn) { soldOn = wantSold; if (ready) { if (wantSold) big.turn.play(); else big.turn.reverse(); } else big.turn.progress(wantSold ? 1 : 0); }
      setStep(step, ready);
      setCap(step, !ready);
    }

    // the room light and the copy's exit are the only scrubbed layers
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: function () { return 'top ' + topH(); }, end: '+=300%', pin: true, scrub: .35, invalidateOnRefresh: true,
        onUpdate: function (self) { update(self.progress); },
        onRefresh: function (self) { update(self.progress); }
      }
    });
    tl.fromTo(room, { opacity: .06, x: -16, y: 10, scale: 1 }, { x: 16, y: -10, scale: 1.04, duration: 1 }, 0)
      .to(room, { opacity: .11, duration: .04 }, P.bid)
      .to(room, { opacity: .07, duration: .04 }, P.bid + .04)
      .to(room, { opacity: .035, duration: P.quiet1 - P.quiet0 }, P.quiet0)
      .to(room, { opacity: .09, duration: .06 }, P.sold)
      .to(copy, { y: -80, opacity: 0, duration: 1 - P.exit }, P.exit);

    update(tl.scrollTrigger.progress);
    ready = true;

    return function () {
      ready = false;
      rowTw.kill();
      gsap.set([late, copy, room, big.slots[1]], { clearProps: 'all' });
      face.classList.remove('is-flash');
      sec.classList.remove('is-scrub');
      staticFrame(2);
      setStep(0, false);
      status.textContent = SAY[2];
    };
  });

  /* ---------- phones and tablets: still clocks; step 04 turns over once ---------- */
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
