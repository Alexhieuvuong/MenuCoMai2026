# Sữa Chua Cô Mai — Menu (MenuCoMai2026)

Mobile-first menu website for **Sữa Chua Cô Mai**, featuring an animated,
scroll-driven **Mì Cay** banner in the Best Seller section. Plain HTML/CSS/JS
(no framework); images are served as WebP for fast loading.

## Run locally

```bash
npm start          # serves on http://localhost:8765 (python3 http.server)
```

Then open http://localhost:8765/index.html. Use a server (not `file://`) so all
images and assets resolve correctly.

## Edit the menu

The menu is **data-driven at build time**. Edit prices/items in `data/menu.json`,
then regenerate the static menu HTML:

```bash
npm run build-menu
```

This writes the cards into `index.html` between the `MENU:START` / `MENU:END`
markers (adding `loading="lazy"` + intrinsic image dimensions automatically) and
**fails the build if any price is empty or a bare `đ`**, so a broken price can't
ship. The `#best-seller` Mì Cay banner is hand-authored and is not generated.

## Project layout

| Path | Purpose |
|------|---------|
| `index.html` | The site — header, hero, sticky tab nav, all menu sections, modals. The Best Seller section embeds the Mì Cay banner. |
| `css/style.css` | Main site styles (layout, nav, menu grids, modals, responsive). |
| `css/micay-banner.css` | **Generated** — `Banner.css` scoped under `#best-seller` plus integration overrides (see below). |
| `js/main.js` | Site behavior: scroll-spy/active tab, price toggles, modals, auto-hide nav. |
| `js/micay-banner.js` | Page-synced controller for the embedded banner (assembly, dish reveal, fades). |
| `data/menu.json` | **Menu source of truth** — every section, card, item & price. Edit this, then `npm run build-menu`. |
| `build-menu.js` | Renders `data/menu.json` into `index.html` between the `MENU:START` / `MENU:END` markers. |
| `images/` | Menu/product photos and icons. Only `*.webp` (and SVGs) are tracked & served. |
| `uploads/` | Banner ingredient/dish art. Only `*.webp` tracked & served. |
| `design-source/` | **Design source only** — the original standalone banner (`Banner.html/.css/.js`) and the `image-slot.js` web component. Not loaded by the site. |
| `ideas/` | Saved design alternatives not currently shipped. |
| `backups/` | Snapshots of earlier `index.html`/CSS versions. |

## Banner CSS: source of truth

The banner's design source is `design-source/Banner.css`. The version the
site actually uses is `css/micay-banner.css`, which is that file **scoped under
`#best-seller`** (global resets / `html,body` / noise-grain stripped) with
full-bleed and behavior overrides appended. **`css/micay-banner.css` is the source
of truth for the live site** — edit it directly.

> Editing `design-source/Banner.css` does **not** reach the site. Treat
> `design-source/` as a read-only design reference and make live changes in
> `css/micay-banner.css` to avoid drift.

## Images

Source artwork is PNG; the site serves optimized **WebP** only. PNG originals are
kept on disk but git-ignored (`images/*.png`, `uploads/*.png`).

```bash
npm run convert-images   # regenerate WebP from PNG via sharp (convert_images.js)
```

## Deploy

Static site — deploy to any free host (Netlify recommended; Cloudflare Pages /
GitHub Pages also work). `netlify.toml` is included:

1. Create a Netlify site from the GitHub repo. Name it **`sua-chua-co-mai`** so the
   URL (`https://sua-chua-co-mai.netlify.app`) matches the share / JSON-LD tags in
   `index.html` — otherwise update those URLs to your domain.
2. Netlify runs `npm run build-menu` and serves the repo root (`publish = "."`).
3. Point the table QR code at the deployed URL.

After deploying, paste the URL into the
[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) (and send
it to yourself on Zalo) to confirm the share preview, and check the structured data
in the [Rich Results Test](https://search.google.com/test/rich-results).

## Notes / known follow-ups

- A real host (per `netlify.toml`) handles caching, so the manual `?v=NN` query
  strings on the CSS/JS links in `index.html` can eventually be dropped.
- Four **Kem** prices in `data/menu.json` are placeholders (`"Theo loại"`) pending
  real numbers from the owner; `npm run build-menu` flags them on every run.
- Opening hours are not yet in the `Restaurant` JSON-LD (add when known).
