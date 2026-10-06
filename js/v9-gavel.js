/* Golden Lion Auctions — HOME v9, "How the hammer falls": the gavel.
   A procedural auction gavel (dark walnut, turned profile) floating between the clock and the copy. Three key frames
   from Alex's boards (8 Oct 2026) with our transitions, a slow suspended drift while the scroll rests, and the strike
   on SOLD (face to the viewer, handle leaning right, dead hold). Draggable: turn it freely, it stays as turned.
   - Scroll: v8-hammer.js owns the pin and publishes its progress as `hammer:progress`; this file only listens.
   - Frames are drawn only while the section is on screen and something moves (drift, lag, a throw, a drag).
   - Shown at >= 1200 x 640 only. Reduced motion: one still frame, no drift. No WebGL / CDN failure: nothing.
   Three.js is loaded from the CDN only when the section approaches. */
(function () {
  'use strict';
  var sec = document.getElementById('hammer');
  if (!sec || !('IntersectionObserver' in window)) return;
  var THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js';

  function hasWebGL() {
    try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { return false; }
  }
  if (!hasWebGL()) return;

  var io = new IntersectionObserver(function (en) {
    if (!en.some(function (e) { return e.isIntersecting; })) return;
    io.disconnect();
    import(THREE_URL).then(start).catch(function () { /* offline / blocked: the section stands without it */ });
  }, { rootMargin: '120% 0px 120% 0px' });
  io.observe(sec);

  /* ---------- the score (Alex, 8 Oct 2026: three key frames from his boards; the transitions are ours) ----------
     The gavel floats free in the space between the clock and the copy, the way a held object hangs in still air:
     F1 high by the clock, head up, handle falling to the right · F2 the late bid: it comes closer and larger over the
     clock · F3 the last scene: low by the steps, the handle rising to the right, the face turned toward us ·
     then it swings up over the clock and STRIKES on SOLD, landing in F3 (Alex's last frame), and holds dead still.
     Scroll sets a target; the gavel follows it with a soft lag (smooth, never a jump), and while the scroll rests it
     breathes: a slow drift and sway, like something suspended. The strike itself is not smoothed.
     hx, hy  head centre as a fraction of the clock+copy box (.hammer__in)
     ang     direction of the handle in the picture plane, degrees clockwise from straight up (180 = hanging down)
     yaw     spin about the handle (deg; 90 = the striking face toward us)        sc  scale (1 = base size)  */
  function P(hx, hy, ang, yaw, sc) { return { hx: hx, hy: hy, ang: ang, yaw: yaw, sc: sc }; }
  // F3 is the last scene (Alex's third frame): the strike lands there and holds. LIFT is F3 swung up about the knob
  // (the hand), head raised over the clock: the strike is that swing coming down.
  // F3 is the last scene, from Alex's frame (8 Oct 2026): the head big (about a third of the screen's height) and
  // upright between the two columns, its top face seen from a little above; the handle runs up and right toward the
  // title, going away from us. Its orientation is built from that description in start() (F3.basis).
  // LIFT is the same gavel swung up about the hand before it comes down.
  // sizes (Alex): the opening frames 30% larger than first drawn, the last frame larger still
  var F1 = P(.41, .14, 152, 8, 1.6), F2 = P(.41, .22, 128, 20, 2.0), F3 = P(.44, .52, 0, 0, 2.9),
      LIFT = P(.52, .24, 0, 0, 2.6), HIT = F3;
  F3.basis = 'end'; LIFT.basis = 'lift';
  function K(p, pose, e) { var o = { p: p, e: e }; for (var k in pose) o[k] = pose[k]; return o; }  // copies basis too
  var KEYS = [
    K(0, F1), K(.22, F1), K(.40, F2, 's'), K(.56, F2), K(.70, LIFT, 's'), K(.758, LIFT),
    K(.78, F3, 'in'), K(1, F3)
  ];
  var STRIKE0 = .758, STRIKE1 = .80;     // inside this window the gavel follows the scroll exactly (no lag, no drift)
  var STILL = .30;                        // reduced motion: one composed frame, no drift
  var EASE = { s: function (t) { return t * t * (3 - 2 * t); }, out: function (t) { return 1 - (1 - t) * (1 - t) * (1 - t); },
    in: function (t) { return t * t * t * t; } };
  var QT = null;
  function poseAt(p, out) {
    var i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    var a = KEYS[i], b = KEYS[i + 1], t = Math.min(1, Math.max(0, (p - a.p) / ((b.p - a.p) || 1)));
    t = EASE[b.e || 's'](t);
    out.hx = a.hx + (b.hx - a.hx) * t; out.hy = a.hy + (b.hy - a.hy) * t; out.sc = a.sc + (b.sc - a.sc) * t;
    out.q.copy(a.q).slerp(b.q, t);
    return out;
  }

  function start(THREE) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mqDesk = window.matchMedia('(min-width: 1200px) and (min-height: 640px)');

    /* ---------- renderer ---------- */
    var canvas = document.createElement('canvas');
    canvas.className = 'hammer__gavel';
    canvas.setAttribute('aria-hidden', 'true');
    var room = sec.querySelector('.hammer__room');
    sec.insertBefore(canvas, room ? room.nextSibling : sec.firstChild);
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'high-performance' }); }
    catch (e) { canvas.remove(); return; }
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    var scene = new THREE.Scene();
    // a long lens: the gavel is seen in side profile with almost no perspective distortion
    var camera = new THREE.PerspectiveCamera(15, 1, 1, 80);
    var CAM_Z = 30;
    camera.position.set(0, 0, CAM_Z);

    /* ---------- light: a dark room, neutral white only ----------
       Image-based: an overhead softbox (the long soft highlight on the turned forms), two narrow strips behind
       (they draw the silhouette's edge against the dark ground), a faint low fill. Plus one direct key for the grain. */
    var pmrem = new THREE.PMREMGenerator(renderer);
    var envScene = new THREE.Scene();
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(20, 24, 12), new THREE.MeshBasicMaterial({ color: 0x030304, side: THREE.BackSide })));
    function box(w, h, lum, tint, pos) {
      var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(tint).multiplyScalar(lum), side: THREE.DoubleSide }));
      m.position.set(pos[0], pos[1], pos[2]); m.lookAt(0, 0, 0); envScene.add(m);
    }
    box(10, 4, 1.8, 0xf3f0ea, [-2, 9, 3]);       // overhead softbox, a little forward
    box(3.5, 10, 1.5, 0xf3f0ea, [-7, 2, 7]);      // tall key softbox, front-left: the broad highlight down the barrel
    box(1.2, 10, 2.0, 0xe4e9f0, [-8, 2, -7]);     // edge strip, behind-left (cool white)
    box(.6, 10, 2.4, 0xf3f0ea, [8, 1, -7]);       // edge strip, behind-right: thin and bright — the rim that carves the silhouette
    box(10, 3, .06, 0xf3f0ea, [0, -6, 8]);        // a breath of low fill
    var env = pmrem.fromScene(envScene, .04).texture;   // .04: the blur PMREM can do without clipping its samples
    scene.environment = env;
    scene.environmentRotation.y = .35;
    pmrem.dispose();
    envScene.traverse(function (o) { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); });

    // the architectural light (chiaroscuro): a hard pool from ~55° above, front-left, aimed at the strike point and fixed
    // there. The gavel moves into it — in the dark while suspended, fully modelled at the strike; the light never moves.
    var pool = new THREE.SpotLight(0xf4f1ea, 7, 0, .32, .4, 0);
    scene.add(pool, pool.target);
    var fill = new THREE.DirectionalLight(0xf4f1ea, .12);   // the faintest constant key: the dark side stays dark
    fill.position.set(-3, 6, 5);
    scene.add(fill);

    /* ---------- material: dark walnut, hand-rubbed satin ----------
       A quiet figure in the colour only: no bump, no ribbing. Roughness varies a few hundredths with the figure. */
    function grainCanvas() {
      var c = document.createElement('canvas'); c.width = 1024; c.height = 256;
      var g = c.getContext('2d'), seed = 23;
      var rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
      g.fillStyle = '#a8a8a8'; g.fillRect(0, 0, 1024, 256);
      function vein(x, wid, col, amp, f, ph) {
        g.strokeStyle = col; g.lineWidth = wid;
        for (var w = -1024; w <= 1024; w += 1024) {        // drawn three times so the seam wraps
          g.beginPath();
          for (var y = -8; y <= 264; y += 8) { var xx = x + w + Math.sin(y * f + ph) * amp; if (y > -8) g.lineTo(xx, y); else g.moveTo(xx, y); }
          g.stroke();
        }
      }
      g.filter = 'blur(6px)';
      for (var i = 0; i < 18; i++) vein(rnd() * 1024, 30 + rnd() * 90, rnd() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)', 6 + rnd() * 20, .006 + rnd() * .01, rnd() * 6.28);
      g.filter = 'blur(1.2px)';
      for (i = 0; i < 90; i++) vein(rnd() * 1024, 1 + rnd() * 2, 'rgba(0,0,0,' + (.025 + rnd() * .04) + ')', 2 + rnd() * 8, .008 + rnd() * .012, rnd() * 6.28);
      g.filter = 'none';
      return c;
    }
    var gc = grainCanvas();
    var colorMap = new THREE.CanvasTexture(gc); colorMap.colorSpace = THREE.SRGBColorSpace;
    var roughMap = new THREE.CanvasTexture(gc);                 // data, not colour
    [colorMap, roughMap].forEach(function (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; });
    var wood = new THREE.MeshPhysicalMaterial({
      color: 0x322d2b,                // x the ~0.66 figure = walnut taken nearly to black; low chroma, never orange
      map: colorMap,
      roughness: .5, roughnessMap: roughMap,
      clearcoat: .1, clearcoatRoughness: .5,                    // a thin satin coat: soft, never plastic
      specularIntensity: .55,
      envMapIntensity: .5
    });

    /* ---------- geometry: turned profiles ----------
       Every corner of the profile becomes a short arc (a real bevel), sampled finely so the lathe's smoothed normals
       follow the curvature; radial segments are dense enough that the silhouette never facets. */
    function rounded(pts, r, n) {
      var out = [pts[0]];
      for (var i = 1; i < pts.length - 1; i++) {
        var A = pts[i - 1], P = pts[i], B = pts[i + 1];
        var la = Math.hypot(A[0] - P[0], A[1] - P[1]), lb = Math.hypot(B[0] - P[0], B[1] - P[1]);
        var d = Math.min(r, la / 2, lb / 2);
        var p1 = [P[0] + (A[0] - P[0]) / la * d, P[1] + (A[1] - P[1]) / la * d];
        var p2 = [P[0] + (B[0] - P[0]) / lb * d, P[1] + (B[1] - P[1]) / lb * d];
        for (var k = 0; k <= n; k++) {
          var t = k / n, u = 1 - t;
          out.push([u * u * p1[0] + 2 * u * t * P[0] + t * t * p2[0], u * u * p1[1] + 2 * u * t * P[1] + t * t * p2[1]]);
        }
      }
      out.push(pts[pts.length - 1]);
      return out.map(function (q) { return new THREE.Vector2(q[0], q[1]); });
    }
    // head: axis Y, 0.40 long. Slightly domed striking faces with a rounded rim, one bold bead and one fine ring at
    // each end, a waisted body and a broad central band where the handle enters: the turned silhouette of the references.
    var half = [[0, -.2], [.06, -.199], [.086, -.196], [.095, -.188], [.095, -.166], [.088, -.16], [.088, -.152], [.096, -.146],
      [.096, -.128], [.087, -.121], [.087, -.115], [.091, -.111], [.091, -.104], [.083, -.098], [.079, -.07], [.081, -.046],
      [.087, -.04], [.087, 0]];
    var headPts = half.concat(half.slice(0, -1).reverse().map(function (q) { return [q[0], -q[1]]; }));
    var headGeo = new THREE.LatheGeometry(rounded(headPts, .0055, 6), 128);
    // handle: along Y from inside the head to the butt (about 1.0); a ferrule bead, a slim neck with one ring, a long
    // swelling grip, a pair of rings and a ball end
    var handlePts = [[0, .05], [.024, .05], [.024, .08], [.03, .088], [.032, .098], [.032, .108], [.026, .118], [.021, .134], [.0205, .24],
      [.025, .248], [.025, .258], [.0205, .266], [.021, .31], [.024, .5], [.030, .7], [.0335, .8], [.0335, .838], [.030, .862],
      [.027, .868], [.031, .876], [.031, .888], [.025, .896], [.019, .906]];
    var kc = .938, kr = .03;
    for (var a = -1.15; a <= Math.PI / 2 + .001; a += .1) handlePts.push([Math.max(0, Math.cos(a) * kr), kc + Math.sin(a) * kr]);
    handlePts.push([0, kc + kr]);
    var handleGeo = new THREE.LatheGeometry(rounded(handlePts, .004, 5), 64);
    handleGeo.rotateZ(-Math.PI / 2);              // its Y axis becomes +X

    var head = new THREE.Mesh(headGeo, wood);
    var handle = new THREE.Mesh(handleGeo, wood);
    // the rig: root (head centre, scale, orientation) -> gavel, the handle along the root's +Y
    var gavel = new THREE.Group(); gavel.add(head, handle); gavel.rotation.z = Math.PI / 2;
    var root = new THREE.Group(); root.add(gavel);
    scene.add(root);

    /* ---------- layout ---------- */
    var inEl = sec.querySelector('.hammer__in');
    var W = 1, H = 1, B = null, L = 1;
    var DEG = Math.PI / 180, v3 = new THREE.Vector3();
    var AY = new THREE.Vector3(0, 1, 0), AZ = new THREE.Vector3(0, 0, 1), AXW = new THREE.Vector3(1, 0, 0);
    var qa = new THREE.Quaternion(), qb = new THREE.Quaternion();
    // the end pose from its description: the head's axis (root X) upright, tipped ~24 deg toward us so its top face
    // shows; the handle (root Y) perpendicular to it, running right and away from us, so it rises to the right on screen
    var qEnd = (function () {
      var ax = new THREE.Vector3(0, .91, .41).normalize();
      var hd = new THREE.Vector3(1, 0, -2); hd.addScaledVector(ax, -hd.dot(ax)).normalize();
      var z = new THREE.Vector3().crossVectors(ax, hd);
      return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(ax, hd, z));
    })();
    // the lift: the same gavel turned back about the hand's axis (root Z, across handle and head), head raised
    var qLift = qEnd.clone().multiply(new THREE.Quaternion().setFromAxisAngle(AZ, 50 * DEG));
    function orient(o) {
      if (o.basis === 'end') return qEnd.clone();
      if (o.basis === 'lift') return qLift.clone();
      qa.setFromAxisAngle(AZ, -o.ang * DEG); qb.setFromAxisAngle(AY, -o.yaw * DEG); return new THREE.Quaternion().copy(qa).multiply(qb);
    }
    KEYS.forEach(function (k) { k.q = orient(k); });
    QT = new THREE.Quaternion();
    var viewH = function () { return 2 * CAM_Z * Math.tan(camera.fov * Math.PI / 360); };
    function measure() {
      W = canvas.clientWidth || 1; H = canvas.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(W, H, false);
      camera.aspect = W / H; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      B = null;
      if (mqDesk.matches && inEl) {
        var c = canvas.getBoundingClientRect(), r = inEl.getBoundingClientRect();
        B = { x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height };
        L = Math.min(.15 * B.w, .2 * B.h);                // base head length, px
        // the light: fixed, above-front-left of the strike point
        toWorld(B.x + HIT.hx * B.w, B.y + HIT.hy * B.h, 0, pool.target.position);
        var d = 9 * L * viewH() / H;
        pool.position.copy(pool.target.position).add(v3.set(-.33 * d, .82 * d, .47 * d));
      }
      kick();
    }
    function toWorld(sx, sy, z, out) {
      var k = (CAM_Z - z) / CAM_Z, u = viewH() / H * k;
      return out.set((sx - W / 2) * u, (H / 2 - sy) * u, z);
    }

    /* ---------- drag: turn it freely (angle and tilt) about its middle; a short throw, then it stays as turned ---------- */
    var grab = document.createElement('div');
    grab.className = 'hammer__grab'; grab.setAttribute('aria-hidden', 'true');
    sec.insertBefore(grab, canvas.nextSibling);
    var qDrag = new THREE.Quaternion(), qStep = new THREE.Quaternion(), vel = { x: 0, y: 0 }, drag = null;
    var MID = new THREE.Vector3(0, .42, 0), vm = new THREE.Vector3(), vp = new THREE.Vector3();
    function turn(dx, dy) {
      qStep.setFromAxisAngle(AY, dx * .55 * DEG); qDrag.premultiply(qStep);
      qStep.setFromAxisAngle(AXW, dy * .55 * DEG); qDrag.premultiply(qStep);
    }
    grab.addEventListener('pointerdown', function (e) {
      if (e.button) return;
      drag = { x: e.clientX, y: e.clientY, t: performance.now() }; vel.x = vel.y = 0;
      try { grab.setPointerCapture(e.pointerId); } catch (err) {}
      grab.classList.add('is-drag'); kick();
    });
    grab.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var now = performance.now(), dt = Math.max(1, now - drag.t), dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      vel.x = dx / dt * 16; vel.y = dy / dt * 16; drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
      turn(dx, dy); kick();
    });
    function release() { if (!drag) return; drag = null; grab.classList.remove('is-drag'); if (reduce) vel.x = vel.y = 0; kick(); }
    grab.addEventListener('pointerup', release);
    grab.addEventListener('pointercancel', release);

    /* ---------- the loop: only while the section is on screen and something moves ---------- */
    var progress = null, onScreen = false, shown = false, raf = 0, last = 0, clock0 = performance.now();
    var tgt = { q: new THREE.Quaternion() }, cur = { q: new THREE.Quaternion(), hx: 0, hy: 0, sc: 1 }, init = false, drift = 0;
    var qf = new THREE.Quaternion(), knob = new THREE.Vector3(), hp = new THREE.Vector3(), sp = new THREE.Vector3();
    function kick() { if (!raf && onScreen) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function proj(w) { sp.copy(w).project(camera); return { x: (sp.x + 1) / 2 * W, y: (1 - sp.y) / 2 * H }; }
    function frame(now) {
      raf = 0;
      if (!onScreen) return;
      if (!B) { if (shown) { shown = false; canvas.classList.remove('is-on'); } grab.style.display = 'none'; return; }
      var dt = Math.min(.1, Math.max(0, (now - last) / 1000)); last = now;
      var p = (progress == null || reduce) ? STILL : progress;
      poseAt(p, tgt);
      var strike = p >= STRIKE0 && p <= STRIKE1, after = p > STRIKE1;
      // follow: a soft lag normally; exact through the strike so it lands hard
      var k = (!init || reduce || strike) ? 1 : 1 - Math.exp(-dt * 4.5);
      init = true;
      cur.hx += (tgt.hx - cur.hx) * k; cur.hy += (tgt.hy - cur.hy) * k; cur.sc += (tgt.sc - cur.sc) * k;
      cur.q.slerp(tgt.q, k);
      // the drift: a suspended object breathing; gone through the strike and the hold after it
      var want = (reduce || strike || after) ? 0 : 1;
      drift += (want - drift) * (strike ? 1 : 1 - Math.exp(-dt * 2));
      var tt = (now - clock0) / 1000;
      var dx = drift * (Math.sin(tt * .53) * .006 + Math.sin(tt * .21) * .004);
      var dy = drift * (Math.sin(tt * .71 + 1) * .010 + Math.sin(tt * .29) * .005);
      var sway = drift * (Math.sin(tt * .62) * 2.2 + Math.sin(tt * .27 + 2) * 1.2);
      var spin = drift * Math.sin(tt * .35 + .5) * 5;
      // the throw after a drag dies away
      if (!drag && (Math.abs(vel.x) + Math.abs(vel.y) > .3)) { var kk = Math.min(4, dt * 60); turn(vel.x * kk, vel.y * kk); var f = Math.pow(.9, kk); vel.x *= f; vel.y *= f; }
      else if (!drag) { vel.x = 0; vel.y = 0; }

      // pose -> scene (the drag turns it about its middle)
      var s = L * cur.sc * viewH() / H / .4;
      root.scale.setScalar(s);
      toWorld(B.x + (cur.hx + dx) * B.w, B.y + (cur.hy + dy) * B.h, 0, root.position);
      qa.setFromAxisAngle(AZ, -sway * DEG); qb.setFromAxisAngle(AY, -spin * DEG);
      qf.copy(qa).multiply(cur.q).multiply(qb);
      vp.copy(MID).multiplyScalar(s).applyQuaternion(qf).add(root.position);
      root.quaternion.copy(qDrag).multiply(qf);
      vm.copy(MID).multiplyScalar(s).applyQuaternion(root.quaternion);
      root.position.copy(vp).sub(vm);
      root.updateMatrixWorld(true);
      renderer.render(scene, camera);
      if (!shown) { shown = true; canvas.classList.add('is-on'); }

      // the grab zone follows the gavel (head to knob), unless it is held
      if (!drag) {
        head.getWorldPosition(hp); handle.localToWorld(knob.set(0, .95, 0));
        var a = proj(hp), b2 = proj(knob), pad = L * cur.sc * .45;
        var x0 = Math.min(a.x, b2.x) - pad, x1 = Math.max(a.x, b2.x) + pad, y0 = Math.min(a.y, b2.y) - pad, y1 = Math.max(a.y, b2.y) + pad;
        grab.style.display = 'block';
        grab.style.left = x0 + 'px'; grab.style.top = y0 + 'px'; grab.style.width = (x1 - x0) + 'px'; grab.style.height = (y1 - y0) + 'px';
      }
      // keep running only while something still moves: the drift, the lag, a throw, a drag
      var settling = Math.abs(tgt.hx - cur.hx) + Math.abs(tgt.hy - cur.hy) + Math.abs(tgt.sc - cur.sc) > 1e-4 || cur.q.angleTo(tgt.q) > 1e-4;
      if (drift > .001 || settling || vel.x || vel.y || drag) raf = requestAnimationFrame(frame);
    }

    var vis = new IntersectionObserver(function (en) { onScreen = en[en.length - 1].isIntersecting; if (onScreen) kick(); });
    vis.observe(sec);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(canvas);
    window.addEventListener('resize', measure);
    if (!reduce) {
      var read = function (p) { progress = p == null ? null : p; kick(); };
      sec.addEventListener('hammer:progress', function (e) { read(e.detail && e.detail.p); });
      read(sec.__hammerP);
    }
    canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); canvas.classList.remove('is-on'); shown = false; });
    canvas.addEventListener('webglcontextrestored', measure);
    if (/[?&]gavel-debug/.test(location.search)) window.__gavel = { KEYS: KEYS, wood: wood, pool: pool, redraw: measure };

    measure();
  }
})();
