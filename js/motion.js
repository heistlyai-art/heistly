(function () {
  var root = document.documentElement;
  var reduce = root.classList.contains("reduce-motion");

  function atmosphere() {
    if (reduce) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var layer = document.createElement("div");
    layer.className = "atmosphere";
    layer.setAttribute("aria-hidden", "true");
    layer.innerHTML =
      '<div class="atmosphere-grid"></div>' +
      '<i class="paper paper-a"></i>' +
      '<i class="paper paper-b"></i>' +
      '<i class="paper paper-c"></i>' +
      '<div class="atmosphere-scan"></div>' +
      '<div class="atmosphere-grain"></div>';
    document.body.prepend(layer);
    root.classList.add("has-atmosphere");
  }

  var typed = false;

  function typewriter() {
    if (typed) return;
    var heading = document.querySelector(".hero h1");
    if (!heading || reduce) return;
    typed = true;
    var lines = Array.prototype.slice.call(heading.querySelectorAll(".line"));
    if (!lines.length) return;
    var widths = lines.map(function (line) {
      var probe = line.cloneNode(true);
      probe.style.cssText = "position:absolute;visibility:hidden;max-width:none;width:max-content;white-space:nowrap;overflow:visible;border:0;";
      heading.appendChild(probe);
      var width = probe.getBoundingClientRect().width;
      probe.remove();
      return Math.ceil(width + 2);
    });
    var delay = 80;
    var timers = [];
    lines.forEach(function (line, index) {
      var chars = Math.max(1, line.textContent.replace(/\s+/g, " ").trim().length);
      var ms = Math.max(420, chars * 62);
      line.style.transition = "max-width " + ms + "ms steps(" + chars + ", end) " + delay + "ms";
      timers.push({ line: line, at: delay, ms: ms });
      delay += ms + 90;
    });
    window.requestAnimationFrame(function () {
      lines.forEach(function (line, index) {
        line.style.maxWidth = widths[index] + "px";
      });
    });
    timers.forEach(function (item, index) {
      window.setTimeout(function () {
        lines.forEach(function (line) { line.classList.remove("is-typing"); });
        item.line.classList.add("is-typing");
      }, item.at);
      window.setTimeout(function () {
        if (index === lines.length - 1) {
          var em = item.line.querySelector("em");
          if (em) em.classList.add("is-marked");
        }
      }, item.at + item.ms + 40);
    });
  }

  function formatCount(value, el) {
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var grouped = el.getAttribute("data-group") === "1";
    var n = decimals ? value.toFixed(decimals) : String(Math.round(value));
    if (grouped) {
      var parts = n.split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      n = parts.join(".");
    }
    return (el.getAttribute("data-prefix") || "") + n + (el.getAttribute("data-suffix") || "");
  }

  function setFinal(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (!isFinite(target)) return;
    el.textContent = formatCount(target, el);
  }

  function counters() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
    if (!nodes.length) return;
    if (reduce) {
      nodes.forEach(setFinal);
      return;
    }
    var seen = new WeakSet();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        runCount(entry.target);
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (el) { observer.observe(el); });
  }

  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (!isFinite(target)) return;
    var start = performance.now();
    var duration = 1100;
    function tick(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatCount(target * eased, el);
      if (t < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  function reveals() {
    if (reduce) return;
    var nodes = Array.prototype.slice.call(document.querySelectorAll(
      ".page-hero, .section-head, .step, .chain-card, .faq, .unlink, .token-figure, .plain-card, .asset-card, .spec > div, .callout, .stage, .cta-band .wrap, .not-found, .glossary div"
    ));
    var counts = new Map();
    nodes.forEach(function (el) {
      if (el.closest(".hero")) return;
      el.classList.add("reveal");
      var parent = el.parentElement;
      var n = counts.get(parent) || 0;
      counts.set(parent, n + 1);
      el.style.setProperty("--d", Math.min(n, 6) * 80 + "ms");
    });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".reveal").forEach(function (el) { observer.observe(el); });
  }

  function flows() {
    var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-flow]"));
    if (!blocks.length) return;
    blocks.forEach(function (block) {
      var steps = Array.prototype.slice.call(block.querySelectorAll("[data-step]"));
      if (!steps.length) return;
      var caption = block.querySelector("[data-flow-caption]");
      var bar = block.querySelector("[data-flow-bar]");
      var desk = block.closest(".desk");
      var notes = desk ? Array.prototype.slice.call(desk.querySelectorAll(".notes li")) : [];
      var index = 0;
      var timer = 0;
      function paint() {
        var current = steps[index];
        steps.forEach(function (step, i) {
          step.classList.toggle("is-on", !reduce && i === index);
        });
        if (caption) caption.textContent = current.getAttribute("data-caption") || "";
        if (bar) bar.style.width = (reduce ? 100 : ((index + 1) / steps.length * 100)) + "%";
        if (desk) desk.classList.toggle("is-delivered", !reduce && current.getAttribute("data-step") === "delivered");
        notes.forEach(function (note, i) {
          note.classList.toggle("is-hot", !reduce && notes.length && i === index % notes.length);
        });
      }
      function arm() {
        window.clearTimeout(timer);
        if (reduce || document.hidden) return;
        timer = window.setTimeout(function () {
          index = (index + 1) % steps.length;
          paint();
          arm();
        }, 2200);
      }
      paint();
      arm();
      document.addEventListener("visibilitychange", arm);
    });
  }

  atmosphere();
  counters();
  reveals();
  flows();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(typewriter);
    window.setTimeout(typewriter, 900);
  } else {
    typewriter();
  }
})();
