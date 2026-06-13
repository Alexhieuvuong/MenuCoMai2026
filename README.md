# Sữa Chua Cô Mai — Menu (MenuCoMai2026)

Mobile-first menu website for **Sữa Chua Cô Mai**, featuring an animated,
scroll-driven **Mì Cay** banner in the Best Seller section. Plain HTML/CSS/JS
(no framework); images are served as WebP for fast loading.

## Run locally

```bash
npm start          # serves on http://localhost:8765 (python3 http.server)
```

Then open http://localhost:8765/index.html. Use a server (not `file://`) so the
`<image-slot>` web component and `uploads/` images load correctly.

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | The site — header, hero, sticky tab nav, all menu sections, modals. The Best Seller section embeds the Mì Cay banner. |
| `css/style.css` | Main site styles (layout, nav, menu grids, modals, responsive). |
| `css/micay-banner.css` | **Generated** — `Banner.css` scoped under `#best-seller` plus integration overrides (see below). |
| `js/main.js` | Site behavior: scroll-spy/active tab, price toggles, modals, auto-hide nav. |
| `js/micay-banner.js` | Page-synced controller for the embedded banner (assembly, dish reveal, fades). |
| `image-slot.js` | `<image-slot>` web component used to render banner ingredient images. |
| `images/` | Menu/product photos and icons. Only `*.webp` (and SVGs) are tracked & served. |
| `uploads/` | Banner ingredient/dish art. Only `*.webp` tracked & served. |
| `Banner.html`, `Banner.css`, `Banner.js` | **Design source** — the original standalone 6-page banner. Not loaded by `index.html`. |
| `ideas/` | Saved design alternatives not currently shipped. |
| `backups/` | Snapshots of earlier `index.html`/CSS versions. |

## Banner CSS: source of truth

The banner styling lives in `Banner.css` (the standalone design). The version the
site actually uses is `css/micay-banner.css`, which is `Banner.css` **scoped under
`#best-seller`** (global resets / `html,body` / noise-grain stripped) with
full-bleed and behavior overrides appended.

> If you change `Banner.css`, the change does **not** automatically reach the site.
> Re-scope it into `css/micay-banner.css`, or edit `css/micay-banner.css` directly
> and treat it as the source. Pick one and stick with it to avoid drift.

## Images

Source artwork is PNG; the site serves optimized **WebP** only. PNG originals are
kept on disk but git-ignored (`images/*.png`, `uploads/*.png`).

```bash
npm run convert-images   # regenerate WebP from PNG via sharp (convert_images.js)
```

## Notes / known follow-ups

- Static asset cache-busting is done manually via `?v=NN` query strings on the
  CSS/JS links in `index.html`. A real host (Netlify/Vercel/GitHub Pages) makes
  this unnecessary.
- Menu price-toggle cards are click-only (not keyboard accessible) — a known a11y
  follow-up.
