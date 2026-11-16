(function () {
  var cfg = window.HEISTLY_CONFIG || {};

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  document.querySelectorAll("[data-x-link]").forEach(function (el) {
    if (cfg.xUrl) el.href = cfg.xUrl;
  });

  var address = cfg.token && typeof cfg.token.contractAddress === "string"
    ? cfg.token.contractAddress.trim()
    : "";

  document.querySelectorAll("[data-contract]").forEach(function (el) {
    if (address) {
      el.textContent = address;
      el.classList.add("is-address");
    } else {
      el.textContent = "Coming soon";
      el.classList.remove("is-address");
    }
  });

  var copyBtn = document.querySelector("[data-copy-contract]");
  if (copyBtn && address) {
    copyBtn.hidden = false;
    copyBtn.addEventListener("click", function () {
      var done = function (label) {
        var previous = copyBtn.getAttribute("data-label") || "Copy contract";
        copyBtn.textContent = label;
        window.setTimeout(function () {
          copyBtn.textContent = previous;
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(function () {
          done("Copied");
        }).catch(function () {
          done("Copy blocked");
        });
      } else {
        done("Copy blocked");
      }
    });
  }

  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector("#mobile-nav");
  if (!toggle || !panel) return;

  var label = toggle.querySelector(".nav-toggle-label");

  function setNav(open) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    panel.hidden = !open;
    document.body.classList.toggle("nav-open", open);
    if (label) label.textContent = open ? "Close" : "Menu";
    if (open) {
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }
  }

  toggle.addEventListener("click", function () {
    var open = toggle.getAttribute("aria-expanded") === "true";
    setNav(!open);
    if (!open) return;
    toggle.focus();
  });

  panel.addEventListener("click", function (event) {
    if (event.target.closest("a")) setNav(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setNav(false);
      toggle.focus();
    }
  });
})();
