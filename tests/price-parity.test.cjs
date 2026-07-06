'use strict';
/*
 * Regression guard for the commerce-coherence bugs fixed on 2026-06-26.
 * The storefront has three price surfaces that must agree, or customers get
 * charged something other than what they were shown (or items 400 at checkout):
 *   1. homepage product cards (index.html)
 *   2. the product catalogue (product-data.js)
 *   3. the server price map that Stripe actually charges (server/stripe-checkout.js CATALOG)
 *
 * Run: npm test   (or: node --test tests/price-parity.test.cjs)
 */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS = require(path.join(ROOT, 'product-data.js'));
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const serverSrc = fs.readFileSync(path.join(ROOT, 'server', 'stripe-checkout.js'), 'utf8');

function parseCatalog(src) {
  const start = src.indexOf('const CATALOG = {');
  const block = src.slice(start, src.indexOf('};', start));
  const cat = {};
  for (const m of block.matchAll(/"([^"]+)":\s*([\d.]+)/g)) cat[m[1]] = Number(m[2]);
  return cat;
}
const CATALOG = parseCatalog(serverSrc);

// Default price shown on each homepage card === product-data default (first variant).
const CARD_TO_SLUG = {
  'reta-p': 'retatrutide', 'tirz-p': 'tirzepatide', 'bpc-p': 'bpc-157', 'tb-p': 'tb-500',
  'ghk-p': 'ghk-cu', 'kpv-p': 'kpv', 'klow-p': 'klow-stack', 'ipa-p': 'ipamorelin',
  'cjc-p': 'cjc-1295', 'nad-p': 'nad-plus', 'ss31-p': 'ss-31', 'semax-p': 'semax',
  'selank-p': 'selank', 'epitalon-p': 'epitalon', 'pinealon-p': 'pinealon',
  'bac-p': 'bacteriostatic-water'
};

test('homepage card prices match the product-data default price', () => {
  for (const [id, slug] of Object.entries(CARD_TO_SLUG)) {
    const p = PRODUCTS[slug];
    assert.ok(p, `product-data.js is missing "${slug}"`);
    const m = indexHtml.match(new RegExp(`id="${id}">[^\\d]*([\\d.]+)<`));
    assert.ok(m, `homepage card span #${id} not found in index.html`);
    assert.strictEqual(Number(m[1]), p.variants[0].price,
      `Homepage card ${slug} shows £${m[1]} but product-data default is £${p.variants[0].price}`);
  }
});

test('every sellable variant resolves in the server CATALOG at its shown price', () => {
  for (const [slug, p] of Object.entries(PRODUCTS)) {
    for (const v of p.variants) {
      const key = `${p.name}|${v.dose}`;
      assert.ok(key in CATALOG, `CATALOG is missing "${key}" — it would 400 at checkout [${slug}]`);
      assert.strictEqual(CATALOG[key], v.price,
        `CATALOG "${key}" charges £${CATALOG[key]} but the product shows £${v.price} [${slug}]`);
    }
  }
});

// Mirror of server resolveCatalogPrice()'s whitespace-normalised fallback: the
// homepage sends doses without spaces ("10mg/3ml") while the catalogue stores them
// spaced ("10mg / 3ml"). Both must resolve to the same price.
const normaliseKey = (s) => String(s || '').replace(/\s+/g, ' ').replace(/\s*\/\s*/g, '/').trim();
const CATALOG_NORM = {};
for (const [k, v] of Object.entries(CATALOG)) CATALOG_NORM[normaliseKey(k)] = v;
const resolvePrice = (name, dose) => {
  const key = `${name}|${dose}`;
  if (key in CATALOG) return CATALOG[key];
  const n = normaliseKey(key);
  return n in CATALOG_NORM ? CATALOG_NORM[n] : null;
};

test('every homepage buy-widget option resolves in the CATALOG at its shown price', () => {
  const nameBySel = {};
  for (const m of indexHtml.matchAll(/add(?:Bundle|Featured)ToBasket\('([^']+)','([^']+)'\)/g)) nameBySel[m[1]] = m[2];
  let checked = 0;
  for (const m of indexHtml.matchAll(/<select[^>]*id="([^"]+)"[\s\S]*?<\/select>/g)) {
    const name = nameBySel[m[1]];
    if (!name) continue; // not an add-to-basket widget
    for (const o of m[0].matchAll(/value="([\d.]+)\|([^"]+)"/g)) {
      const shown = Number(o[1]), dose = o[2];
      const price = resolvePrice(name, dose);
      assert.ok(price !== null, `Homepage "${name}|${dose}" would 400 at checkout — not in CATALOG [#${m[1]}]`);
      assert.strictEqual(price, shown, `Homepage "${name}|${dose}" shows £${shown} but CATALOG charges £${price} [#${m[1]}]`);
      checked++;
    }
  }
  assert.ok(checked > 30, `expected to check the full homepage grid, only saw ${checked} options`);
});

test('every homepage literal Add button resolves at its shown price', () => {
  for (const m of indexHtml.matchAll(/addToBasket\('([^']+)',\s*([\d.]+),\s*'([^']+)'\)/g)) {
    const name = m[1], shown = Number(m[2]), dose = m[3];
    const price = resolvePrice(name, dose);
    assert.ok(price !== null, `Homepage button "${name}|${dose}" would 400 at checkout — not in CATALOG`);
    assert.strictEqual(price, shown, `Homepage button "${name}|${dose}" shows £${shown} but CATALOG charges £${price}`);
  }
});

test('every checkout/product add-on button resolves at its shown price', () => {
  // Hardcoded add-on emits in product.html (accessory/intranasal/pen) and checkout.html (thermal).
  const addons = [
    ['Bacteriostatic Water', 6.99, 'Accessory'],
    ['Insulin Needle Pack', 6.99, 'Accessory'],
    ['Intranasal Research Kit', 4.99, 'Kit add-on'],
    ['Disposable Research Pen Kit', 9.99, 'Kit add-on'],
    ['Thermal Cooled Packaging', 4.99, 'Insulated foil pouch + gel packs'],
  ];
  for (const [name, shown, dose] of addons) {
    const price = resolvePrice(name, dose);
    assert.ok(price !== null, `Add-on "${name}|${dose}" would 400 at checkout — not in CATALOG`);
    assert.strictEqual(price, shown, `Add-on "${name}|${dose}" shows £${shown} but CATALOG charges £${price}`);
  }
});

test('the intranasal +kit add-on resolves at its button price', () => {
  assert.strictEqual(CATALOG['Intranasal Research Kit|Kit add-on'], 4.99,
    'product.html adds the intranasal add-on at £4.99 — CATALOG must match');
});

test('no removed "Essentials Bundle" remnants remain', () => {
  assert.ok(!/Essentials Bundle/.test(indexHtml), 'index.html still references the removed Essentials Bundle');
  assert.ok(!/Essentials Bundle/.test(serverSrc), 'server CATALOG still has the removed Essentials Bundle');
});
