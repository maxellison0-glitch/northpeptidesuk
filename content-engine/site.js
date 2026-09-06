'use strict';
/*
 * site.js — single source of truth for site-wide constants and catalogue access
 * used by the content engine (template.js, product-page-template.js, build.js).
 */

const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const PRODUCTS = require(path.join(ROOT, 'product-data.js'));

// Canonical host is the www apex — non-www 308-redirects to it on Vercel.
const SITE = {
  base: 'https://www.northpeptidesuk.com',
  name: 'North Peptides UK',
  telegram: '@NORTHPEPTIDESUK',
  telegramUrl: 'https://t.me/NORTHPEPTIDESUK',
  email: 'orders@northpeptidesuk.com',
};

// Delivery facts shown on product pages. Prices come from the trusted server
// price map so the storefront can never drift from what checkout charges.
const DELIVERY = (() => {
  try {
    const core = require(path.join(ROOT, 'server', 'commerce-core.js'));
    if (core && core.DELIVERY && core.DELIVERY.standard && core.DELIVERY.tracked24 && core.DELIVERY.dhl) {
      return {
        standard: { label: core.DELIVERY.standard.label, price: Number(core.DELIVERY.standard.price) },
        tracked24: { label: core.DELIVERY.tracked24.label, price: Number(core.DELIVERY.tracked24.price) },
        dhl: { label: core.DELIVERY.dhl.label, price: Number(core.DELIVERY.dhl.price) },
        freeFrom: 100,
      };
    }
  } catch { /* fall through to the documented defaults */ }
  return {
    standard: { label: 'Royal Mail Tracked 48', price: 3.99 },
    tracked24: { label: 'Royal Mail Tracked 24', price: 6.99 },
    dhl: { label: 'DHL Express', price: 11.99 },
    freeFrom: 100,
  };
})();

// Static pages that belong in the sitemap (paths relative to base).
const STATIC_PAGES = [
  { path: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/products/',        changefreq: 'weekly',  priority: '0.9' },
  { path: '/why-us.html',      changefreq: 'monthly', priority: '0.7' },
  { path: '/lab-reports.html', changefreq: 'monthly', priority: '0.7' },
  { path: '/compliance.html',  changefreq: 'monthly', priority: '0.4' },
  { path: '/reviews/',         changefreq: 'monthly', priority: '0.5' },
  { path: '/blog/index.html',  changefreq: 'weekly',  priority: '0.6' },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatGBP(n) {
  return Number.isInteger(n) ? `£${n}` : `£${n.toFixed(2)}`;
}

// ---- Optimised image set --------------------------------------------------
// Every product photo has three web derivatives in the repo root:
//   <base>.webp       1200x1200 (hero / og / toggle swap)
//   <base>-600.webp    600x600  (cards, thumbs, search)
//   <base>-og.jpg     1200x1200 progressive JPEG (share previews)
// <base> is the image name with its extension and any trailing "-1200" removed.
// Older product-data entries may still name a multi-MB original; the alias
// table maps those to the derivative base so no page ever references one.
const IMAGE_ALIASES = {
  'hf_20260523_171709_476460c3-db51-4ebf-b0ce-dce6b2f29382.jpeg': 'retatrutide-vial',
  'hf_20260523_170534_235f0034-3e32-4b11-98c3-5b357b41672b.png': 'retatrutide-20mg-vial',
  'hf_20260523_171735_79bb55e1-312b-40bf-93f2-59afdd43de09.jpeg': 'tirzepatide-vial',
  'hf_20260523_171828_c517069f-2388-4215-bec5-f0516a7554b1.jpeg': 'bpc-157-vial',
  'hf_20260523_171838_139029e0-0fb2-4778-9db6-5f0470e836ae.jpeg': 'tb-500-vial',
  'hf_20260523_171852_e8a239be-4a76-4958-930e-b68b87cbc701.png': 'kpv-vial',
  'hf_20260523_171904_baaf1708-79ff-4396-8a78-76018f3acdc4.jpeg': 'ipamorelin-vial',
  'hf_20260523_171921_abfd9afd-aa38-48a9-bba3-538df7508dd2.jpeg': 'cjc-1295-vial',
  'logo.png': 'logo',
};

function imageBase(image) {
  const name = String(image || '').replace(/^\/+/, '');
  if (IMAGE_ALIASES[name]) return IMAGE_ALIASES[name];
  return name.replace(/\.(png|jpe?g|webp)$/i, '').replace(/-1200$/i, '');
}

function exists(file) {
  try { return fs.existsSync(path.join(ROOT, file)); } catch { return false; }
}

// Returns { full, thumb, og } file names (no leading slash). A derivative that
// is missing on disk falls back to the next best file that does exist so the
// build never emits a dead image path.
function imageSet(image) {
  const original = String(image || '').replace(/^\/+/, '');
  const base = imageBase(original);
  const isWebp = /\.webp$/i.test(original);
  const fullCandidates = [isWebp ? original : null, `${base}.webp`, `${base}-1200.webp`, original].filter(Boolean);
  const full = fullCandidates.find(exists) || fullCandidates[0];
  const thumbCandidates = [`${base}-600.webp`, full];
  const thumb = thumbCandidates.find(exists) || thumbCandidates[0];
  const ogCandidates = [`${base}-og.jpg`, full];
  const og = ogCandidates.find(exists) || ogCandidates[0];
  return { full, thumb, og, base };
}

function product(slug) {
  const p = PRODUCTS[slug];
  if (!p) throw new Error(`Unknown product slug "${slug}" — not in product-data.js`);
  return p;
}

function productPath(slug) {
  product(slug);
  return `/products/${slug}/`;
}

function productUrl(slug) {
  return `${SITE.base}${productPath(slug)}`;
}

function priceFrom(slug) {
  const prices = product(slug).variants.map(v => v.price);
  return Math.min(...prices);
}

// Price of one named variant (exact dose string) or null when it is not sold.
function variantPrice(slug, dose) {
  const p = PRODUCTS[slug];
  if (!p || !Array.isArray(p.variants)) return null;
  const v = p.variants.find(variant => String(variant.dose) === String(dose));
  return v ? Number(v.price) : null;
}

// Resolve a list of slugs to display-ready cards; throws on any unknown slug so
// articles can never link to a product that does not exist.
function resolveProducts(slugs) {
  return slugs.map(slug => {
    const p = product(slug);
    const min = priceFrom(slug);
    const multi = p.variants.length > 1;
    return {
      slug,
      name: p.name,
      category: p.category,
      url: productUrl(slug),
      priceLabel: (multi ? 'from ' : '') + formatGBP(min),
      thumb: imageSet(p.image).thumb,
    };
  });
}

// Sitemap priority for a product slug, derived from its catalogue category.
function productPriority(slug) {
  const cat = (product(slug).category || '').toLowerCase();
  if (slug === 'retatrutide' || slug === 'tirzepatide') return '0.9';
  if (cat.includes('supplies')) return '0.5';
  return '0.8';
}

module.exports = {
  SITE, STATIC_PAGES, PRODUCTS, DELIVERY, IMAGE_ALIASES,
  escapeHtml, formatGBP,
  product, productUrl, priceFrom, variantPrice, resolveProducts, productPriority,
  productPath, imageBase, imageSet,
};
