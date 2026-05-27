window.__books = window.__books || {};

window.__books.openDetail = function (item, book) {
  var gsap = window.gsap;
  var books = window.__books.books;
  var bookMap = window.__books.bookMap;
  var annotationsMap = window.__books.annotationsMap;
  var smoother = window.__books.smoother;

  var lbOverlay = document.getElementById("lb-overlay");
  var lbClose = document.getElementById("lb-close");
  var lbDetail = document.getElementById("lb-detail");
  var lbDetailHeader = document.getElementById("lb-detail-header");
  var lbDetailBody = document.getElementById("lb-detail-body");
  var lbDetailAside = document.getElementById("lb-detail-aside");

  window.__books.transitioning = true;
  window.__books.selectedItem = item;

  lbDetail.style.setProperty("--cover-bg", "url(" + book.imageUrl + ")");
  lbDetail.classList.add("on");

  var isRead = book.shelves.indexOf("read") !== -1;
  var stars = book.userRating > 0
    ? Array(book.userRating + 1).join("★") + Array(6 - book.userRating).join("☆") : "";

  lbDetailAside.innerHTML = '<img src="' + book.imageUrl + '" alt="' + book.title + '" />';

  var h = [];
  h.push('<h2>' + book.title + '</h2>');
  h.push('<p class="lb-author">' + book.author + '</p>');
  if (book.published) h.push('<p class="lb-meta">Published ' + book.published + '</p>');
  if (book.numPages) h.push('<p class="lb-meta">' + book.numPages + ' pages</p>');
  if (stars || book.averageRating) {
    h.push('<div class="lb-ratings">');
    if (stars) h.push('<span class="lb-user-rating">' + stars + '</span>');
    if (book.averageRating) h.push('<span class="lb-avg-rating">Goodreads ' + Array(Math.round(book.averageRating) + 1).join("★") + ' ' + book.averageRating.toFixed(2) + '</span>');
    h.push('</div>');
  }
  h.push('<div class="lb-shelves">');
  book.shelves.forEach(function (s) { h.push('<span class="lb-badge ' + s.replace(/\s+/g, "-") + '">' + s + '</span>'); });
  if (isRead && book.userReadAt) h.push('<span style="font-size:11px;color:#555;margin-left:4px">' + window.__books.timeAgo(book.userReadAt) + '</span>');
  h.push('</div>');
  lbDetailHeader.innerHTML = h.join("");

  var b = [];
  var highlights = book.highlights || window.__books.findAnnotations(book);
  if (highlights && highlights.length > 0) {
    if (highlights.length === 1) {
      var hl = highlights[0];
      var text = typeof hl === "string" ? hl : hl.text;
      var pct = hl.locationPercentage || "";
      b.push('<div class="hl-slider">');
      b.push('<h3>Highlight</h3>');
      b.push('<div class="hl-stage"><div class="hl-card" style="width:100%"><p>' + text + '</p>' + (pct ? '<cite>' + pct + '</cite>' : '') + '</div></div>');
      b.push('</div>');
    } else {
      b.push('<div class="hl-slider" id="hl-slider">');
      b.push('<h3>Highlights &amp; Annotations <span class="hl-counter" id="hl-counter">1/' + highlights.length + '</span></h3>');
      b.push('<div class="hl-stage"><div class="hl-track" id="hl-track">');
      highlights.forEach(function (hl) {
        var text = typeof hl === "string" ? hl : hl.text;
        var pct = hl.locationPercentage || "";
        b.push('<div class="hl-card"><p>' + text + '</p>' + (pct ? '<cite>' + pct + '</cite>' : '') + '</div>');
      });
      b.push('</div></div>');
      b.push('<div class="hl-nav">');
      b.push('<button id="hl-prev" disabled><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3L5 7l4 4"/></svg></button>');
      b.push('<div class="hl-dots" id="hl-dots"></div>');
      b.push('<button id="hl-next"' + (highlights.length <= 1 ? ' disabled' : '') + '><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3l4 4-4 4"/></svg></button>');
      b.push('</div></div>');
    }
  }
  if (book.description) {
    var d = book.description;
    if (d.length > 1200) d = d.slice(0, 1200) + '...';
    b.push('<div class="lb-sec"><h3>About</h3><p>' + d + '</p></div>');
  }
  if (book.userReview) {
    b.push('<div class="lb-sec"><h3>Review</h3><p class="lb-review">' + book.userReview + '</p></div>');
  } else if (isRead && !highlights) {
    b.push('<div class="lb-sec"><h3>Review &amp; Highlights</h3><p class="lb-empty">No review or highlights yet.<br><a href="https://www.goodreads.com/book/show/' + book.id + '" target="_blank">Add on Goodreads →</a></p></div>');
  }
  b.push('<a class="lb-link" href="https://www.goodreads.com/book/show/' + book.id + '" target="_blank">View on Goodreads →</a>');
  lbDetailBody.innerHTML = b.join("");

  lbDetail.scrollTop = 0;
  lbDetail.classList.add("on");
  if (smoother) smoother.paused(true);

  var headerKids = lbDetailHeader.querySelectorAll("*");
  var bodyKids = lbDetailBody.querySelectorAll("*");
  gsap.set(headerKids, { opacity: 0, y: 20 });
  gsap.set(bodyKids, { opacity: 0 });

  var tl = gsap.timeline({ defaults: { duration: 0.55, ease: "power3.out" } });
  tl.call(function () { lbOverlay.classList.add("on"); }, null, 0);
  tl.call(function () { lbClose.classList.add("on"); }, null, 0.15);
  tl.to(headerKids, { opacity: 1, y: 0, duration: 0.35, stagger: 0.03 });
  tl.to(bodyKids, { opacity: 1, duration: 0.25, stagger: 0.02 }, "-=0.1");

  lbOverlay.onclick = window.__books.closeDetail;
  history.replaceState(null, "", "#" + book.id);
  if (window.__books.initSlider) window.__books.initSlider();
};

window.__books.closeDetail = function () {
  var lbOverlay = document.getElementById("lb-overlay");
  var lbClose = document.getElementById("lb-close");
  var lbDetail = document.getElementById("lb-detail");
  var smoother = window.__books.smoother;

  if (!window.__books.selectedItem) return;
  lbDetail.style.removeProperty("--cover-bg");
  lbOverlay.classList.remove("on");
  lbClose.classList.remove("on");
  lbDetail.classList.remove("on");
  lbOverlay.onclick = null;
  window.__books.transitioning = false;
  window.__books.selectedItem = null;
  if (smoother) smoother.paused(false);
  history.replaceState(null, "", window.location.pathname);
};
