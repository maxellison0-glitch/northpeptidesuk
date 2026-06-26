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
    const m = indexHtml.match(new RegExp(`id="${id}">£([\\d.]+)<`));
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

test('the intranasal +kit add-on resolves at its button price', () => {
  assert.strictEqual(CATALOG['Intranasal Research Kit|Kit add-on'], 4.99,
    'product.html adds the intranasal add-on at £4.99 — CATALOG must match');
});

test('no removed "Essentials Bundle" remnants remain', () => {
  assert.ok(!/Essentials Bundle/.test(indexHtml), 'index.html still references the removed Essentials Bundle');
  assert.ok(!/Essentials Bundle/.test(serverSrc), 'server CATALOG still has the removed Essentials Bundle');
});
