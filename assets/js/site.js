/* Progressive enhancements; production content is rendered by Jekyll. */
(function () {
  "use strict";

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

  loadStars();
})();
