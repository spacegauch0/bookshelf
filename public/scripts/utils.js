window.__books = window.__books || {};

window.__books.timeAgo = function (dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var seconds = Math.floor((new Date() - d) / 1000);
  var intervals = [
    { label: "year", v: 31536000 },
    { label: "month", v: 2592000 },
    { label: "week", v: 604800 },
    { label: "day", v: 86400 },
    { label: "hour", v: 3600 },
    { label: "minute", v: 60 },
  ];
  for (var i = 0; i < intervals.length; i++) {
    var n = Math.floor(seconds / intervals[i].v);
    if (n >= 1) return n + " " + intervals[i].label + (n > 1 ? "s" : "") + " ago";
  }
  return "just now";
};

window.__books.findAnnotations = function (book) {
  var map = window.__books.annotationsMap;
  if (!map) return null;
  var title = book.title.toLowerCase().trim();
  if (map[title]) return map[title];
  for (var key in map) {
    if (title.indexOf(key) !== -1 || key.indexOf(title) !== -1) return map[key];
  }
  return null;
};

window.__books.preloadImages = function (selector) {
  return new Promise(function (resolve) {
    var imgs = document.querySelectorAll(selector);
    var loaded = 0, total = imgs.length;
    if (total === 0) return resolve();
    imgs.forEach(function (el) {
      var bg = el.style.backgroundImage;
      var url = bg.replace(/url\(["']?(.*?)["']?\)/i, "$1");
      if (!url) { loaded++; if (loaded === total) resolve(); return; }
      var img = new Image();
      img.onload = img.onerror = function () { loaded++; if (loaded === total) resolve(); };
      img.src = url;
    });
  });
};
