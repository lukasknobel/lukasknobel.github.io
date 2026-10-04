/* Shared theme toggle.
   Labels: Light -> Dark -> System (follows prefers-color-scheme).
   The choice persists in localStorage under "type-theme".
   Keep this file Liquid-safe (no double-brace sequences). */
(function () {
  "use strict";
  var KEY = "type-theme";
  var ORDER = ["light", "dark", "auto"];
  var LABELS = { light: "Light", dark: "Dark", auto: "System" };
  var root = document.documentElement;

  function readMode() {
    try {
      var stored = localStorage.getItem(KEY);
      if (ORDER.indexOf(stored) !== -1) { return stored; }
    } catch (e) {}
    var current = root.getAttribute("data-theme");
    return ORDER.indexOf(current) !== -1 ? current : "auto";
  }

  function apply(mode) {
    root.setAttribute("data-theme", mode);
    var btn = document.querySelector(".theme-toggle");
    if (!btn) { return; }
    btn.textContent = LABELS[mode];
    var next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    btn.setAttribute("aria-label", "Theme is " + LABELS[mode] + ". Switch to " + LABELS[next] + ".");
    btn.title = "Theme: " + LABELS[mode] + " (next: " + LABELS[next] + ")";
  }

  function init() {
    apply(readMode());
    if (!window.matchMedia) { return; }
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () {
      if (readMode() === "auto") { apply("auto"); }
    };
    if (mq.addEventListener) { mq.addEventListener("change", onChange); }
    else if (mq.addListener) { mq.addListener(onChange); }
  }

  // This script also runs in the head, before CSS and the button are available.
  root.setAttribute("data-theme", readMode());

  document.addEventListener("click", function (ev) {
    var btn = ev.target.closest ? ev.target.closest(".theme-toggle") : null;
    if (!btn) { return; }
    var next = ORDER[(ORDER.indexOf(readMode()) + 1) % ORDER.length];
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
