(function () {
  var roots = document.querySelectorAll("[data-safehouse]");
  if (!roots.length) return;

  var reduce = document.documentElement.classList.contains("reduce-motion");

  roots.forEach(function (root) {
    var items = Array.prototype.slice.call(root.querySelectorAll(".feed-item"));
    var log = root.querySelector(".feed-log");
    var btn = root.querySelector("[data-feed-pause]");
    var note = root.querySelector("[data-motion-note]");
    if (!items.length || !log) return;

    if (reduce) {
      items.forEach(function (el) { el.classList.add("is-shown"); });
      if (btn) {
        btn.disabled = true;
        btn.setAttribute("aria-pressed", "true");
        btn.textContent = "Paused";
      }
      if (note) note.hidden = false;
      return;
    }

    var index = 0;
    var timer = 0;
    var paused = false;

    function step() {
      if (paused) return;
      if (index >= items.length) {
        items.forEach(function (el) { el.classList.remove("is-shown"); });
        index = 0;
        log.scrollTop = 0;
      }
      var el = items[index];
      el.classList.add("is-shown");
      var top = el.offsetTop;
      log.scrollTo({ top: Math.max(0, top - 12), behavior: "smooth" });
      index += 1;
      timer = window.setTimeout(step, index >= items.length ? 2800 : 2400);
    }

    if (btn) {
      btn.addEventListener("click", function () {
        paused = !paused;
        btn.setAttribute("aria-pressed", paused ? "true" : "false");
        btn.textContent = paused ? "Play" : "Pause";
        if (paused) {
          window.clearTimeout(timer);
        } else {
          step();
        }
      });
    }

    step();
  });
})();
