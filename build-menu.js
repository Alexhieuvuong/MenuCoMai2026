#!/usr/bin/env node
/*
 * build-menu.js — render the menu section of index.html from data/menu.json.
 *
 * The menu is data-driven at BUILD time (not in the browser): this writes plain
 * static HTML into index.html so the page paints instantly when scanned at the
 * table and works even if JS fails. Edit data/menu.json, then `npm run build-menu`.
 *
 * It injects between the <!-- MENU:START --> / <!-- MENU:END --> markers in
 * index.html. On the very first run (no markers yet) it migrates the legacy
 * hand-written Chè…Đặt Tiệc block into markers. The #best-seller Mì Cay banner is
 * hand-authored and never touched.
 *
 * Validation: the build FAILS if any price is empty or has no real digit/letter
 * (e.g. a bare "đ"), so the placeholder-price bug can never ship again.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ROOT = __dirname;
const DATA_FILE = path.join(ROOT, 'data', 'menu.json');
const HTML_FILE = path.join(ROOT, 'index.html');

const MARK_START = '                <!-- MENU:START — generated from data/menu.json by build-menu.js; do not edit this block by hand (edit the JSON, then `npm run build-menu`). -->';
const MARK_END = '                <!-- MENU:END -->';
// Matches the original hand-written block (first <!-- Chè --> … last </section>
// before the .menu-sections closing </div>) for the one-time migration.
const LEGACY_RE = /\n\n {16}<!-- Chè -->[\s\S]*?<\/section>\n\n {12}<\/div>/;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// A price is valid if it has a digit (25.000đ, +10.000đ, Từ 5.000đ) OR real
// letters once the currency mark "đ" and punctuation are removed (Liên Hệ, Hết
// món). A bare "đ" or blank strips to nothing → invalid.
function validPrice(p) {
  if (typeof p !== 'string') return false;
  const t = p.trim();
  if (!t) return false;
  if (/[0-9]/.test(t)) return true;
  return t.replace(/[đĐ]/g, '').replace(/[\s.,/+()\-–—:]/g, '').length > 0;
}

async function imgDims(rel) {
  try {
    const m = await sharp(path.join(ROOT, rel)).metadata();
    if (m.width && m.height) return ` width="${m.width}" height="${m.height}"`;
  } catch (e) {
    console.warn(`  ! could not read dimensions for ${rel}: ${e.message}`);
  }
  return '';
}

function renderItem(item, loc) {
  if (!validPrice(item.price)) {
    throw new Error(
      `Invalid price for "${item.name}" in ${loc}: ${JSON.stringify(item.price)} ` +
      `— a price must contain a number or a word label (e.g. "25.000đ", "Liên Hệ"), not a bare "đ".`
    );
  }
  const rec = item.recommended
    ? '<span class="recommended-icon"><img src="images/like-icon.svg" class="must-try-inline" alt="Top Pick"></span>'
    : '';
  return [
    '                                <div class="price-item">',
    `                                    <span class="dish-name">${esc(item.name)}${rec}</span>`,
    `                                    <span class="dish-price">${esc(item.price)}</span>`,
    '                                </div>',
  ].join('\n');
}

async function renderCard(card, loc) {
  const dims = await imgDims(card.image);
  const items = card.items.map((it) => renderItem(it, `${loc} › ${card.title}`)).join('\n');
  return [
    '                        <div class="menu-item">',
    '                            <div class="menu-item-image">',
    `                                <img src="${esc(card.image)}" alt="${esc(card.title)}"${dims} loading="lazy" decoding="async">`,
    '                            </div>',
    `                            <h3 class="menu-item-title">${esc(card.title)}</h3>`,
    '                            <button class="see-more-btn">Xem Món</button>',
    '                            <div class="price-list">',
    items,
    '                            </div>',
    '                        </div>',
  ].join('\n');
}

async function renderSection(section) {
  const cards = [];
  for (const card of section.cards) cards.push(await renderCard(card, section.title));
  return [
    `                <!-- ${section.title} -->`,
    `                <section id="${esc(section.id)}" class="menu-category">`,
    `                    <h2>${esc(section.title)}</h2>`,
    '                    <div class="menu-grid standard-grid">',
    cards.join('\n'),
    '                    </div>',
    '                </section>',
  ].join('\n');
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  const sections = [];
  for (const section of data.sections) sections.push(await renderSection(section));
  const generated = sections.join('\n\n');

  let html = fs.readFileSync(HTML_FILE, 'utf8');
  const s = html.indexOf(MARK_START);
  const e = html.indexOf(MARK_END);

  if (s !== -1 && e !== -1) {
    html = html.slice(0, s) + MARK_START + '\n\n' + generated + '\n\n' + MARK_END +
      html.slice(e + MARK_END.length);
  } else if (LEGACY_RE.test(html)) {
    console.log('  (first run) migrating legacy menu block into MENU markers…');
    html = html.replace(LEGACY_RE,
      '\n\n' + MARK_START + '\n\n' + generated + '\n\n' + MARK_END + '\n\n            </div>');
  } else {
    throw new Error('No MENU:START/END markers and no legacy menu block found in index.html — nothing to inject.');
  }

  fs.writeFileSync(HTML_FILE, html);

  const cardCount = data.sections.reduce((n, s2) => n + s2.cards.length, 0);
  const itemCount = data.sections.reduce((n, s2) => n + s2.cards.reduce((m, c) => m + c.items.length, 0), 0);
  const todos = [];
  data.sections.forEach((s2) => s2.cards.forEach((c) => c.items.forEach((it) => {
    if (it.todo) todos.push(`${c.title} › ${it.name}: ${it.todo}`);
  })));
  console.log(`✓ Rendered ${data.sections.length} sections, ${cardCount} cards, ${itemCount} items into index.html`);
  if (todos.length) {
    console.log(`\n⚠ ${todos.length} item(s) still need a real price from the owner:`);
    todos.forEach((t) => console.log(`   - ${t}`));
  }
}

main().catch((err) => {
  console.error('\n✗ build-menu failed:', err.message, '\n');
  process.exit(1);
});
