/* ============================================================================
   Shared renderer for the data-driven preview pages.

   Used by:  variants/minisite/*.html
             variants/darksite/*.html

   All content is read from window.SITE_DATA (loaded via
   _includes/variants-site-data.js) — edit _data/site_content.yml.
   Keep this file Liquid-safe (no double-brace sequences).
   ========================================================================== */
(function () {
  "use strict";

  var DATA = window.SITE_DATA || {};
  var MY_NAME = (DATA.profile || {}).name || "";
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var LINK_ORDER = ["PDF", "Code", "Project"];

  function fill(html, data) {
    return html.replace(/__([A-Z0-9_]+)__/g, function (match, key) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        return data[key];
      }
      return match;
    });
  }

  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function prettyDate(iso) {
    var parts = String(iso).split("-");
    return parseInt(parts[2], 10) + " " + MONTHS[parseInt(parts[1], 10) - 1] + " " + parts[0];
  }

  function linkCoauthors(text) {
    var list = DATA.coauthors || [];
    for (var i = 0; i < list.length; i++) {
      var ca = list[i];
      if (!ca.name) {
        continue;
      }
      var esc = ca.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var re = new RegExp("\\b" + esc + "\\b", "g");
      text = text.replace(re, '<a class="ca" href="' + ca.url + '">' + ca.name + "</a>");
    }
    return text;
  }

  function buildLinks(paper) {
    var links = paper.links || {};
    var norm = {};
    for (var key in links) {
      if (Object.prototype.hasOwnProperty.call(links, key)) {
        norm[key.toUpperCase()] = links[key];
      }
    }
    var out = [];
    for (var i = 0; i < LINK_ORDER.length; i++) {
      var label = LINK_ORDER[i];
      if (norm[label.toUpperCase()]) {
        out.push('<a href="' + norm[label.toUpperCase()] + '">' + label + "</a>");
      }
    }
    return out.join("");
  }

  function sourceFor(kind) {
    if (kind === "pubs") { return DATA.papers || []; }
    if (kind === "news") { return DATA.news || []; }
    if (kind === "socials") { return DATA.socials || []; }
    if (kind === "repos") { return DATA.repos || []; }
    if (kind === "cv-education") { return (DATA.cv || {}).education || []; }
    if (kind === "cv-experience") { return (DATA.cv || {}).experience || []; }
    return null;
  }

  function renderLists() {
    var containers = document.querySelectorAll("[data-list]");
    for (var c = 0; c < containers.length; c++) {
      var container = containers[c];
      var kind = container.getAttribute("data-list");
      var items = sourceFor(kind);
      if (!items) {
        continue;
      }
      if (kind === "pubs" && container.getAttribute("data-selected") === "true") {
        items = items.filter(function (p) { return p.selected === true; });
      }
      var limit = parseInt(container.getAttribute("data-limit") || "0", 10);
      if (limit > 0) {
        items = items.slice(0, limit);
      }
      var tpl = container.querySelector("template[data-item]");
      if (!tpl) {
        continue;
      }
      var tplHtml = tpl.innerHTML;
      var out = "";
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var data = {};
        for (var key in item) {
          if (Object.prototype.hasOwnProperty.call(item, key)) {
            data[key.toUpperCase()] = item[key];
          }
        }
        data.NUM = pad2(i + 1);
        data.INDEX = i;
        if (kind === "pubs") {
          data.LINKS = buildLinks(item);
          if (data.AUTHORS) {
            data.AUTHORS = String(data.AUTHORS);
            data.AUTHORS = linkCoauthors(data.AUTHORS);
            if (MY_NAME) {
              data.AUTHORS = data.AUTHORS.replace(MY_NAME, "<em>" + MY_NAME + "</em>");
            }
          }
        }
        if (kind === "news") {
          data.DATE = prettyDate(item.date);
          data.YEAR = String(item.date).slice(0, 4);
          data.MONTH = String(item.date).slice(5, 7);
        }
        if (kind === "repos") {
          data.SLUG = String(item.url || "").replace(/^https:\/\/github\.com\//, "");
        }
        out += fill(tplHtml, data);
      }
      container.innerHTML = out;
    }
  }

  function insertSeparators(cell, selector, glyph) {
    var items = cell.querySelectorAll(selector);
    for (var i = 1; i < items.length; i++) {
      var sep = document.createElement("span");
      sep.className = "sep";
      sep.textContent = glyph;
      cell.insertBefore(sep, items[i]);
    }
  }

  function setupSeparators() {
    var cells = document.querySelectorAll(".pub .l");
    for (var i = 0; i < cells.length; i++) {
      insertSeparators(cells[i], "a, .abs", " | ");
    }
    var socials = document.querySelectorAll("[data-list='socials']");
    for (var s = 0; s < socials.length; s++) {
      insertSeparators(socials[s], "a", " \u00b7 ");
    }
  }

  function setupAbstractToggles() {
    function toggle(btn) {
      var row = btn.closest ? btn.closest(".pub") : null;
      var abs = row ? row.nextElementSibling : null;
      if (!abs || !abs.classList.contains("pub-abs")) {
        return;
      }
      abs.classList.toggle("open");
      btn.setAttribute("aria-expanded", abs.classList.contains("open") ? "true" : "false");
    }
    document.addEventListener("click", function (ev) {
      var btn = ev.target.closest ? ev.target.closest(".abs") : null;
      if (btn) {
        toggle(btn);
      }
    });
    document.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") {
        return;
      }
      var btn = ev.target.closest ? ev.target.closest(".abs") : null;
      if (btn) {
        ev.preventDefault();
        toggle(btn);
      }
    });
  }

  function loadStars() {
    var boxes = document.querySelectorAll(".repo[data-repo]");
    for (var i = 0; i < boxes.length; i++) {
      (function (box) {
        var slug = box.getAttribute("data-repo");
        var el = box.querySelector(".rstats");
        if (!slug || !el) {
          return;
        }
        fetch("https://api.github.com/repos/" + slug)
          .then(function (res) {
            if (!res.ok) {
              throw new Error("HTTP " + res.status);
            }
            return res.json();
          })
          .then(function (info) {
            el.textContent = "\u2605 " + info.stargazers_count;
            el.classList.add("show");
          })
          .catch(function () {});
      })(boxes[i]);
    }
  }

  function fillSlots() {
    var profile = DATA.profile || {};
    var slots = document.querySelectorAll("[data-slot]");
    for (var i = 0; i < slots.length; i++) {
      var name = slots[i].getAttribute("data-slot");
      if (Object.prototype.hasOwnProperty.call(profile, name)) {
        slots[i].innerHTML = profile[name];
      }
    }
  }

  fillSlots();
  renderLists();
  setupSeparators();
  setupAbstractToggles();
  loadStars();
})();
