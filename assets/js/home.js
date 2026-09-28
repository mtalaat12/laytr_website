/* =========================================================================
   The homepage's small motions. Loaded on / only.

   Progressive enhancement, strictly: the served HTML is complete and
   readable with this file blocked. It adds three things:

     1. Reveal on scroll, with a safety net: anything still hidden after
        2.5 s is shown, so no content can stay invisible.
     2. The When tile's rows can be picked, as in the app.
     3. The problem's four piles (bookmarks, saved posts, screenshots, open
        tabs) gather into one stack as the card scrolls through the
        viewport, driven by one CSS property, --q, from 0 to 1.

   It honours prefers-reduced-motion: the piles stay put and nothing fades.
   ========================================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduce =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 1. Reveal ---------------------------------------------------------- */
  var reveal = Array.prototype.slice.call(document.querySelectorAll(".rv"));
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("js");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    reveal.forEach(function (node) {
      io.observe(node);
    });
    setTimeout(function () {
      reveal.forEach(function (node) {
        node.classList.add("in");
      });
    }, 2500);
  }

  /* 2. The When rows ---------------------------------------------------- */
  var rows = document.getElementById("rows");
  if (rows) {
    var buttons = Array.prototype.slice.call(rows.querySelectorAll("button"));
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.setAttribute("aria-pressed", other === button ? "true" : "false");
        });
      });
    });
  }

  /* 3. The piles gather ------------------------------------------------- */
  var before = document.getElementById("before");
  if (!before || reduce) {
    return;
  }

  var ticking = false;

  function clamp(value) {
    return value < 0 ? 0 : value > 1 ? 1 : value;
  }

  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function tick() {
    ticking = false;
    var vh = window.innerHeight || root.clientHeight;
    var box = before.getBoundingClientRect();
    var top = box.top;
    before.style.setProperty("--hpc", (box.height / 100).toFixed(2) + "px");
    /* Starts once most of the card is on screen (its top at 65%), done at 15%. */
    var q = ease(clamp((vh * 0.65 - top) / (vh * 0.5)));
    before.style.setProperty("--q", q.toFixed(4));
    before.classList.toggle("gathered", q > 0.96);
  }

  function request() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(tick);
    }
  }

  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  tick();
})();
