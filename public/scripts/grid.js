window.__books = window.__books || {};

window.__books.setupGrid = function () {
  var gsap = window.gsap;
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  var smoother = ScrollSmoother.create({
    smooth: 1,
    effects: true,
    normalizeScroll: true,
  });

  window.__books.smoother = smoother;

  var grid = document.querySelector(".grid");
  var baseLag = 0.3, lagFactor = 0.15;
  var currentColumnCount = null;

  function groupItemsByColumn() {
    var styles = window.getComputedStyle(grid);
    var raw = styles.getPropertyValue("grid-template-columns");
    var num = raw.split(" ").filter(Boolean).length;
    var cols = Array.from({ length: num }, function () { return []; });
    // Only group visible items
    grid.querySelectorAll(".grid__item").forEach(function (item, i) {
      if (item.style.display === "none") return;
      cols[i % num].push(item);
    });
    return { columns: cols, numColumns: num };
  }

  function buildGrid(columns, num) {
    var frag = document.createDocumentFragment();
    var mid = (num - 1) / 2;
    var maxDist = num % 2 === 1 ? Math.floor(num / 2) : num / 2;
    var containers = [];
    columns.forEach(function (col, i) {
      if (col.length === 0) return;
      var dist = Math.abs(i - mid);
      var lag = baseLag + (maxDist - dist + 1) * lagFactor;
      var wrap = document.createElement("div");
      wrap.className = "grid__column";
      col.forEach(function (item) { wrap.appendChild(item); });
      frag.appendChild(wrap);
      containers.push({ el: wrap, lag: lag });
    });
    grid.appendChild(frag);
    return containers;
  }

  function applyLag(containers) {
    containers.forEach(function (c) { smoother.effects(c.el, { speed: 1, lag: c.lag }); });
  }

  function clearGrid() {
    grid.querySelectorAll(".grid__column").forEach(function (c) { c.remove(); });
    // Move all items back to grid
    document.querySelectorAll(".grid__item").forEach(function (item) {
      if (item.parentElement !== grid) grid.appendChild(item);
    });
  }

  function rebuild() {
    clearGrid();
    var r = groupItemsByColumn();
    currentColumnCount = r.numColumns;
    if (r.columns.some(function (c) { return c.length > 0; })) {
      applyLag(buildGrid(r.columns, r.numColumns));
    }
  }

  window.addEventListener("resize", function () {
    var styles = window.getComputedStyle(grid);
    var num = styles.getPropertyValue("grid-template-columns").split(" ").filter(Boolean).length;
    if (num !== currentColumnCount) rebuild();
  });

  window.__books.rebuildGrid = rebuild;
  return rebuild;
};
