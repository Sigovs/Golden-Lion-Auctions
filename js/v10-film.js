/* Golden Lion Auctions — v10 hero slideshow (Alex, 6 Oct 2026).
   Slide 1 the lion film, slide 2 the Patton showroom film, slide 3 a still. A film slide advances when its film
   ends; the still holds 7 s. The progress bar of the current slide fills with the film's own time (or the still's
   timer). Transition: a soft, feathered right-to-left wipe; the incoming picture settles, its copy rises line by line.
   Controls: bars (go to), previous / next, pause. Reduced motion: nothing plays or advances on its own; slides
   switch instantly; films show their final frame where one is given. */
(function () {
  'use strict';
  var root = document.getElementById('film');
  if (!root) return;
  var slides = [].slice.call(root.querySelectorAll('.film__slide'));
  var bars = [].slice.call(root.querySelectorAll('.film__bar'));
  var nEl = document.getElementById('film-n'), pauseBtn = document.getElementById('film-pause');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STILL_MS = 7000, cur = 0, paused = reduce, stillT0 = 0, stillLeft = STILL_MS, raf = 0;

  function media(i) { return slides[i].querySelector('.film__media'); }
  function isVideo(i) { return slides[i].dataset.kind === 'video'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  if (reduce) slides.forEach(function (s, i) { var v = media(i); if (isVideo(i) && v.dataset.endPoster) v.poster = v.dataset.endPoster; });

  var ring = document.getElementById('film-ring'), leftEl = document.getElementById('film-left');
  // the current slide's progress drives its bar, the ring around the pause button (a preloader for the slide's
  // duration) and the seconds left
  function setBar(i, f, secsLeft) {
    f = Math.max(0, Math.min(1, f));
    if (bars[i]) bars[i].firstElementChild.style.transform = 'scaleX(' + f + ')';
    if (i === cur) {
      ring.style.strokeDashoffset = String(1 - f);
      if (secsLeft != null && leftEl) leftEl.textContent = '· 0:' + pad(Math.max(0, Math.ceil(secsLeft)));
    }
  }

  function tick() {
    raf = 0;
    if (isVideo(cur)) { var v = media(cur); if (v.duration) setBar(cur, v.currentTime / v.duration, v.duration - v.currentTime); }
    else if (!paused) {
      var left = stillLeft - (performance.now() - stillT0);
      setBar(cur, 1 - left / STILL_MS, left / 1000);
      if (left <= 0) { go(cur + 1); return; }
    }
    if (!paused) raf = requestAnimationFrame(tick);
  }
  function loop() { if (!raf && !paused) raf = requestAnimationFrame(tick); }

  function start(i) {
    if (isVideo(i)) {
      var v = media(i);
      v.preload = 'auto';
      if (reduce) return;
      try { v.currentTime = 0; } catch (e) {}
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    } else { stillT0 = performance.now(); stillLeft = STILL_MS; }
    loop();
  }
  function stop(i) { if (isVideo(i)) media(i).pause(); }

  function go(n) {
    n = (n + slides.length) % slides.length;
    if (n === cur) return;
    var prev = cur; cur = n;
    stop(prev);
    bars.forEach(function (b, k) { if (!b) return; if (k === n) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); setBar(k, k < n ? 1 : 0); });
    nEl.textContent = pad(n + 1);
    slides.forEach(function (s, k) {
      s.classList.toggle('is-on', k === n);
      s.classList.toggle('is-off', k === prev);
      if (k === n) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
      s.style.zIndex = k === n ? 2 : (k === prev ? 1 : 0);
    });
    // the previous slide stays under the wipe until it is covered, then rests
    setTimeout(function () { slides[prev].classList.remove('is-off'); }, reduce ? 0 : 1700);
    if (!paused) start(n);
  }

  slides.forEach(function (s, i) {
    if (!isVideo(i)) return;
    media(i).addEventListener('ended', function () { if (i === cur && !paused) go(cur + 1); else setBar(i, 1); });
  });
  bars.forEach(function (b, k) { b.addEventListener('click', function () { go(k); }); });
  root.querySelectorAll('[data-step]').forEach(function (b) { b.addEventListener('click', function () { go(cur + Number(b.dataset.step)); }); });

  function setPaused(p) {
    paused = p;
    pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
    pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
    root.classList.toggle('is-paused', p);
    if (isVideo(cur)) { if (p) media(cur).pause(); else { var pr = media(cur).play(); if (pr && pr.catch) pr.catch(function () {}); loop(); } }
    else if (p) { stillLeft -= performance.now() - stillT0; }
    else { stillT0 = performance.now(); loop(); }
  }
  pauseBtn.addEventListener('click', function () { setPaused(!paused); });
  if (reduce) { pauseBtn.setAttribute('aria-pressed', 'true'); pauseBtn.setAttribute('aria-label', 'Play slideshow'); root.classList.add('is-paused'); }

  // nothing runs while the hero is off screen
  if ('IntersectionObserver' in window) {
    var wasPlaying = false;
    new IntersectionObserver(function (en) {
      var vis = en[en.length - 1].isIntersecting;
      if (!vis && !paused) { wasPlaying = true; setPaused(true); }
      else if (vis && wasPlaying) { wasPlaying = false; setPaused(false); }
    }, { threshold: .2 }).observe(root);
  }

  slides[0].style.zIndex = 2;
  start(0);
})();
