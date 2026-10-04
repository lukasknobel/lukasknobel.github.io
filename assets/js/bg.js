/* ==========================================================================
   Constellation background for the site.

   A slowly drifting field of small particles linked by faint lines.
   A left click on empty space opens a short-lived well that gathers
   nearby particles for about a second before fading out. Clicks on
   real controls (links, buttons, inputs) are ignored, and pressing on
   text keeps normal selection behaviour.

   The layer is a fixed full-viewport canvas sitting behind the content
   (the #bg element). It is decorative only (aria-hidden), follows the
   current theme ink colour, honours prefers-reduced-motion with a
   static frame, and pauses its loop while the tab is hidden.
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.getElementById("bg");
  if (!canvas || !canvas.getContext) { return; }

  var ctx = canvas.getContext("2d");
  if (!ctx) { return; }
  var motionQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var reduced = motionQuery ? motionQuery.matches : false;
  var hidden = document.hidden;

  var env = { W: 0, H: 0, t: 0, ink: null };

function readVar(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name);
    return v ? v.trim() : "";
  }

  function hexToRgb(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) { h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]; }
    var n = parseInt(h, 16);
    if (isNaN(n)) { n = 0x111111; }
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function makeInk(hex) {
    var rgb = hexToRgb(hex);
    return function (a) {
      return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
    };
  }

  function syncTheme() {
    env.ink = makeInk(readVar("--ink") || "#111111");
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    env.W = window.innerWidth;
    env.H = window.innerHeight;
    canvas.width = Math.round(env.W * dpr);
    canvas.height = Math.round(env.H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

// Clicks on real controls (links, buttons) are ignored by click effects
  function isControl(e) {
    return !!(e.target && e.target.closest && e.target.closest("a, button, summary, [role=button], input, textarea"));
  }

  // Left button only (touch counts as left)
  function isLeftClick(e) {
    return e.button === 0 && !isControl(e);
  }

// Track an event listener so an engine can remove it on teardown
  function track(target, type, fn, opts) {
    target.addEventListener(type, fn, opts);
    return function () { target.removeEventListener(type, fn, opts); };
  }

/* --- network: drifting constellation, click opens a gathering well -- */
  function network(track) {
    var off = [];
    var P = [];
    var wells = [];
    function build() {
      P = [];
      var count = env.W * env.H < 500000 ? 48 : 76;
      for (var i = 0; i < count; i++) {
        P.push({
          x: Math.random() * env.W,
          y: Math.random() * env.H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35
        });
      }
    }
    function onDown(e) {
      if (reduced || hidden || !isLeftClick(e)) { return; }
      wells.push({ x: e.clientX, y: e.clientY, t0: env.t });
      if (wells.length > 5) { wells.shift(); }
    }
    off.push(track(window, "pointerdown", onDown, { passive: true }));
    function frame() {
      ctx.clearRect(0, 0, env.W, env.H);
      var i, j, a, b;
      for (i = 0; i < P.length; i++) {
        a = P[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < -20) { a.x = env.W + 20; } else if (a.x > env.W + 20) { a.x = -20; }
        if (a.y < -20) { a.y = env.H + 20; } else if (a.y > env.H + 20) { a.y = -20; }
        for (var w = 0; w < wells.length; w++) {
          var well = wells[w];
          var wage = (env.t - well.t0) / 1200;
          if (wage > 1) { continue; }
          var dxw = well.x - a.x;
          var dyw = well.y - a.y;
          var dw = Math.sqrt(dxw * dxw + dyw * dyw);
          if (dw < 220 && dw > 0.01) {
            var fw = (1 - dw / 220) * 0.05 * (1 - wage);
            a.vx += (dxw / dw) * fw;
            a.vy += (dyw / dw) * fw;
          }
        }
        a.vx *= 0.995;
        a.vy *= 0.995;
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (sp > 0.9) { a.vx = a.vx / sp * 0.9; a.vy = a.vy / sp * 0.9; }
      }
      for (i = 0; i < P.length; i++) {
        a = P[i];
        for (j = i + 1; j < P.length; j++) {
          b = P[j];
          var dx = a.x - b.x;
          var dy = a.y - b.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            var dl = Math.sqrt(d2);
            ctx.strokeStyle = env.ink((1 - dl / 110) * 0.20);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        ctx.fillStyle = env.ink(0.45);
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.3, 0, 6.2832);
        ctx.fill();
      }
      for (var w2 = wells.length - 1; w2 >= 0; w2--) {
        var wll = wells[w2];
        var age = (env.t - wll.t0) / 1200;
        if (age >= 1) { wells.splice(w2, 1); continue; }
        var fade = 1 - age;
        ctx.lineWidth = 1;
        ctx.strokeStyle = env.ink(0.30 * fade);
        ctx.beginPath();
        ctx.arc(wll.x, wll.y, 14 + age * 40, 0, 6.2832);
        ctx.stroke();
        ctx.fillStyle = env.ink(0.5 * fade);
        ctx.beginPath();
        ctx.arc(wll.x, wll.y, 2, 0, 6.2832);
        ctx.fill();
        for (var q = 0; q < P.length; q++) {
          b = P[q];
          var ddx = wll.x - b.x;
          var ddy = wll.y - b.y;
          var dd = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dd < 170) {
            ctx.strokeStyle = env.ink((1 - dd / 170) * 0.30 * fade);
            ctx.beginPath();
            ctx.moveTo(b.x, b.y);
            ctx.lineTo(wll.x, wll.y);
            ctx.stroke();
          }
        }
      }
    }
    return {
      build: build,
      frame: frame,
      destroy: function () { for (var i = 0; i < off.length; i++) { off[i](); } }
    };
  }

  var engine = network(track);
  var rafId = null;

  function loop(t) {
    rafId = null;
    if (hidden || reduced) { return; }
    env.t = t;
    engine.frame(t);
    rafId = requestAnimationFrame(loop);
  }

  function updateLoop() {
    if (hidden || reduced) {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (!hidden) { engine.frame(env.t); }
    } else if (rafId === null) {
      rafId = requestAnimationFrame(loop);
    }
  }

  document.addEventListener("visibilitychange", function () {
    hidden = document.hidden;
    updateLoop();
  });
  if (motionQuery) {
    var onMotionChange = function () {
      reduced = motionQuery.matches;
      updateLoop();
    };
    if (motionQuery.addEventListener) { motionQuery.addEventListener("change", onMotionChange); }
    else if (motionQuery.addListener) { motionQuery.addListener(onMotionChange); }
  }
  window.addEventListener("resize", function () {
    resize();
    engine.build();
    if (reduced) {
      engine.frame(env.t);
    }
  });
  var mo = new MutationObserver(function () {
    syncTheme();
    if (reduced && !hidden) { engine.frame(env.t); }
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  syncTheme();
  resize();
  engine.build();
  updateLoop();
})();
