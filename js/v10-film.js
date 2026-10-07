/* Golden Lion Auctions — v10 hero (Alex, 6 Oct 2026).
   One film loops underneath; three messages take turns over it (what the site is for: bid, verified, sell). Each
   message holds MSG_MS, then the next rises in line by line (the staircase in css). The ring around the pause button
   counts the current message down; "01 / 03" names it. Pause stops the film and the turn. Off screen, everything rests.
   Reduced motion: the film does not play, the first message stays, nothing turns on its own. */
(function () {
  'use strict';
  var root = document.getElementById('film');
  if (!root) return;
  var video = root.querySelector('.film__media');
  var msgs = [].slice.call(root.querySelectorAll('.film__msg'));
  var nEl = document.getElementById('film-n'), ring = document.getElementById('film-ring'), pauseBtn = document.getElementById('film-pause');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MSG_MS = 6000, cur = 0, paused = reduce, t0 = 0, left = MSG_MS, raf = 0;

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function setRing(f) { if (ring) ring.style.strokeDashoffset = String(1 - Math.max(0, Math.min(1, f))); }
  function show(n) {
    n = (n + msgs.length) % msgs.length;
    msgs.forEach(function (m, k) {
      // the outgoing message glides off left while the incoming one glides in from the right
      var was = m.classList.contains('is-cur');
      m.classList.toggle('is-cur', k === n);
      if (was && k !== n) { m.classList.add('is-out'); setTimeout(function () { m.classList.remove('is-out'); }, 900); }
      if (k === n) { m.classList.remove('is-out'); m.removeAttribute('aria-hidden'); } else m.setAttribute('aria-hidden', 'true');
    });
    cur = n; if (nEl) nEl.textContent = pad(n + 1);
    t0 = performance.now(); left = MSG_MS; setRing(0);
  }
  function tick(now) {
    raf = 0; if (paused) return;
    var rem = left - (now - t0);
    setRing(1 - rem / MSG_MS);
    if (rem <= 0) show(cur + 1);
    raf = requestAnimationFrame(tick);
  }
  function play() {
    paused = false; root.classList.remove('is-paused');
    pauseBtn.setAttribute('aria-pressed', 'false'); pauseBtn.setAttribute('aria-label', 'Pause');
    if (video) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
    t0 = performance.now(); if (!raf) raf = requestAnimationFrame(tick);
  }
  function pause() {
    if (!paused) left -= performance.now() - t0;
    paused = true; root.classList.add('is-paused');
    pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Play');
    if (video) video.pause();
  }
  pauseBtn.addEventListener('click', function () { if (paused) play(); else pause(); });

  if ('IntersectionObserver' in window) {
    var held = false;
    new IntersectionObserver(function (en) {
      var vis = en[en.length - 1].isIntersecting;
      if (!vis && !paused) { held = true; pause(); }
      else if (vis && held) { held = false; play(); }
    }, { threshold: .2 }).observe(root);
  }

  show(0);
  if (reduce) { pause(); setRing(0); } else play();
})();
