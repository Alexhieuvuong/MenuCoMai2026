# Idea: Best Seller page-2 — product cards peeking behind the final dish

Alternative for the banner's page 2 (instead of the price list). A few product
photos fan out *behind* the final mì cay dish, tilted, with feathered edges so
they melt into the dark backdrop (no frame/border) — like the `micayfinal` cutout.

How it works:
- Cards live on a layer at `z-index: 14`, just **below** `.real-dish` (z 16), so
  the dish overlaps and hides their lower halves (the "peek behind" effect).
- The layer fades in with the dish via `opacity: var(--realfade, 0)`.
- Each photo's edges are feathered with a radial `mask-image`, plus the same soft
  `drop-shadow` the dish uses, so it blends into the background instead of looking
  like a pasted card.
- Coordinates are tuned to the 430×932 stage, so they scale on small phones.

## HTML — goes inside `#stage` (replaces the price `.menu` content)

```html
<div class="menu" aria-hidden="true">
  <p class="m-kicker">Best Seller · Bán chạy</p>
</div>

<!-- Product cards peeking out from behind the final dish, slightly tilted -->
<div class="bs-stack" aria-hidden="true">
  <div class="bs-card c1"><img src="images/SuaChuaMit.webp" alt="Sữa Chua Mít" loading="lazy"></div>
  <div class="bs-card c2"><img src="images/CheCaramen.webp" alt="Chè Caramen" loading="lazy"></div>
  <div class="bs-card c3"><img src="images/TraChanh.webp" alt="Trà Chanh" loading="lazy"></div>
</div>
```

## CSS — append to `css/micay-banner.css`

```css
/* Best Seller page (page 2) — a few product cards peeking out from behind the
   final mì cay dish, tilted for some life. Sits below .real-dish (z 16) so the
   dish overlaps/hides their lower portion. */
#best-seller .bs-stack {
    position: absolute; inset: 0; z-index: 14;
    pointer-events: none;
    opacity: var(--realfade, 0);
}
#best-seller .bs-card {
    position: absolute;
    width: 150px; height: 150px;
    filter: drop-shadow(0 26px 44px rgba(0, 0, 0, .8));
}
#best-seller .bs-card img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    /* feather the edges so the photo melts into the dark backdrop */
    -webkit-mask-image: radial-gradient(120% 120% at 50% 45%, #000 52%, transparent 90%);
    mask-image: radial-gradient(120% 120% at 50% 45%, #000 52%, transparent 90%);
}
#best-seller .bs-card.c1 { left: 28px;  top: 452px; transform: rotate(-11deg); }
#best-seller .bs-card.c2 { left: 270px; top: 444px; transform: rotate(10deg); }
#best-seller .bs-card.c3 { left: 150px; top: 414px; width: 126px; height: 126px; transform: rotate(-3deg); }
```

Note: the source photos have their own backgrounds, so the blend is done by
fading the *edges* into black (works against the dark banner). For a truly clean
melt, use transparent-PNG cutouts of each product.
