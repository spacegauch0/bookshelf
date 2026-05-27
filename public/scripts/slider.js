window.__books = window.__books || {};

window.__books.initSlider = function () {
  var track = document.getElementById("hl-track");
  var prev = document.getElementById("hl-prev");
  var next = document.getElementById("hl-next");
  var counter = document.getElementById("hl-counter");
  var dots = document.getElementById("hl-dots");
  if (!track || !prev || !next) return;

  var stage = track.parentElement;
  var cards = track.querySelectorAll(".hl-card");
  var total = cards.length;
  var idx = 0;
  var MAX_DOTS = 5;

  function buildTrack() {
    var w = stage.offsetWidth;
    track.style.width = total * w + "px";
    cards.forEach(function (c) { c.style.width = w + "px"; });
  }

  function slideTo(i) {
    idx = i;
    track.style.transform = "translateX(" + -idx * stage.offsetWidth + "px)";
    stage.style.height = cards[idx].offsetHeight + "px";
    if (counter) counter.textContent = idx + 1 + "/" + total;
    prev.disabled = idx === 0;
    next.disabled = idx >= total - 1;
    if (dots) renderDots();
  }

  function renderDots() {
    dots.innerHTML = "";
    var start, count;
    if (total <= MAX_DOTS) { start = 0; count = total; }
    else { start = Math.max(0, Math.min(idx - 2, total - MAX_DOTS)); count = MAX_DOTS; }
    for (var j = 0; j < count; j++) {
      var dot = document.createElement("span");
      if (start + j === idx) dot.classList.add("on");
      dots.appendChild(dot);
    }
  }

  buildTrack();
  slideTo(0);

  prev.onclick = function () { if (idx > 0) slideTo(idx - 1); };
  next.onclick = function () { if (idx < total - 1) slideTo(idx + 1); };

  document.addEventListener("keydown", function _hl(e) {
    if (!window.__books.transitioning) { document.removeEventListener("keydown", _hl); return; }
    if (e.key === "ArrowLeft" && idx > 0 && !e.target.closest("input")) { e.preventDefault(); slideTo(idx - 1); }
    if (e.key === "ArrowRight" && idx < total - 1 && !e.target.closest("input")) { e.preventDefault(); slideTo(idx + 1); }
  });

  var ts = 0;
  track.addEventListener("touchstart", function (e) { ts = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", function (e) {
    var diff = ts - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0 && idx < total - 1) slideTo(idx + 1);
      else if (diff < 0 && idx > 0) slideTo(idx - 1);
    }
  }, { passive: true });

  window.addEventListener("resize", function () {
    if (!track.offsetParent) return;
    buildTrack();
    slideTo(idx);
  });
};
