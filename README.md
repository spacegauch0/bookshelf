# Bookshelf

Your Goodreads library as an infinite scrollable canvas. Built with Astro and GSAP.

## Setup

```bash
npm install
npm run fetch   # pull latest book data from Goodreads
npm run dev     # start dev server at http://localhost:4321
npm run build   # static build to dist/
```

## Architecture

```
index.astro (358 lines)   — orchestrator: wires modules, loads data, handles routing
public/scripts/
  utils.js      (48 lines)  — timeAgo, annotation matching, image preloading
  slider.js     (72 lines)  — highlight carousel with dots, swipe, keyboard nav
  detail.js     (109 lines) — split-screen detail panel + GSAP entrance animation
  grid.js       (72 lines)  — CSS Grid column grouping + ScrollSmoother lag effects
```

- **Astro** SSR at build time — 2,838 book cards rendered as static HTML
- **GSAP ScrollSmoother** — smooth scrolling with column-based elastic lag effects
- **CSS Grid** — responsive column layout (2–12 columns depending on viewport)
- **Editorial detail page** — split-screen layout with cover, bold typography, staggered animations
- **Annotations** — pre-computed at build time (title-matched from Kindle highlights JSON), displayed in a swipeable slider

## Data

Books are fetched from Goodreads RSS feeds (`read`, `currently-reading`, `to-read` shelves) via `scripts/fetch-books.mjs`. Output goes to `src/data/books.json`.

To update your library, edit the `USER_ID` in the fetch script and run `npm run fetch`.

## Credits

Scroll elasticity pattern from [Codrops ElasticGridScroll](https://github.com/codrops/ElasticGridScroll).
