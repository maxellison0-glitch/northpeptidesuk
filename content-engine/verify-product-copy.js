'use strict';
/*
 * verify-product-copy.js — runs the North Peptides UK compliance gate against the
 * prose held in product-data.js.
 *
 * Why this exists: product.html is client-rendered — every product description is
 * injected from product-data.js into a <script> template at runtime. The static
 * compliance gate (compliance.js) strips <script> blocks, so it can never see the
 * per-product copy by scanning product.html. This harness reconstructs the text a
 * shopper actually reads for each product (summary + long description + research
 * areas + storage + spec values + FAQ) and appends the same research-use disclaimer
 * the product page renders, then lints the whole thing with the real gate.
 *
 * Usage:  node content-engine/verify-product-copy.js            (all products)
 *         node content-engine/verify-product-copy.js semax kpv  (named slugs)
 *
 * Exit 0 = every checked product passes. Exit 1 = one or more failed.
 */

const path = require('path');
const { lint, formatReport } = require('./compliance.js');
const PRODUCTS = require(path.join(__dirname, '..', 'product-data.js'));

// The fixed research-use disclaimer product.html renders for every product
// (the .research-box). Including it mirrors the real page and satisfies the
// gate's required-phrase checks, exactly as the live page does.
const PAGE_DISCLAIMER =
  'Research use only. Products are not medicines, are not for human or animal ' +
  'consumption, and are supplied strictly for laboratory research purposes.';

// Flatten one product's shopper-visible prose into a single string.
function renderedText(p) {
  const parts = [];
  if (p.name) parts.push(p.name);
  if (p.category) parts.push(p.category);
  if (p.summary) parts.push(p.summary);
  if (Array.isArray(p.details)) parts.push(p.details.join('. '));
  if (Array.isArray(p.longDescription)) parts.push(p.longDescription.join(' '));
  if (Array.isArray(p.researchAreas)) parts.push(p.researchAreas.join('. '));
  if (Array.isArray(p.storage)) parts.push(p.storage.join(' '));
  else if (typeof p.storage === 'string') parts.push(p.storage);
  if (Array.isArray(p.specs)) parts.push(p.specs.map(([k, v]) => `${k}: ${v}`).join('. '));
  if (p.seo && Array.isArray(p.seo.faq)) {
    parts.push(p.seo.faq.map(f => `${f.q} ${f.a}`).join(' '));
  }
  if (p.seo && p.seo.metaDescription) parts.push(p.seo.metaDescription);
  parts.push(PAGE_DISCLAIMER);
  return parts.join('\n');
}

const requested = process.argv.slice(2);
const slugs = requested.length ? requested : Object.keys(PRODUCTS);

let failed = 0;
for (const slug of slugs) {
  const p = PRODUCTS[slug];
  if (!p) { console.log(`  SKIP  ${slug} (not in product-data.js)`); continue; }
  const res = lint(renderedText(p));
  if (!res.ok) failed++;
  console.log(formatReport(slug, res));
}
console.log(`\n${slugs.length - failed}/${slugs.length} product(s) passed.`);
process.exit(failed ? 1 : 0);
