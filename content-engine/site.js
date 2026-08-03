'use strict';
/*
 * site.js — single source of truth for site-wide constants and catalogue access
 * used by the content engine (template.js, build.js).
 */

const path = require('path');
const PRODUCTS = require(path.join(__dirname, '..', 'product-data.js'));

// Canonical host is the www apex — non-www 308-redirects to it on Vercel.
const SITE = {
  base: 'https://www.northpeptidesuk.com',
  name: 'North Peptides UK',
  telegram: '@NORTHPEPTIDESUK',
  telegramUrl: 'https://t.me/NORTHPEPTIDESUK',
  email: 'orders@northpeptidesuk.com',
};

// Static pages that belong in the sitemap (paths relative to base).
const STATIC_PAGES = [
  { path: '/',                 changefreq: 'weekly',  priority: '1.0' },
  { path: '/why-us.html',      changefreq: 'monthly', priority: '0.7' },
  { path: '/lab-reports.html', changefreq: 'monthly', priority: '0.7' },
  { path: '/coa/ghk-cu-100016393.html', changefreq: 'yearly', priority: '0.6' },
  { path: '/coa/retatrutide-100016392.html', changefreq: 'yearly', priority: '0.6' },
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
  SITE, STATIC_PAGES, PRODUCTS,
  escapeHtml, formatGBP,
  product, productUrl, priceFrom, resolveProducts, productPriority,
  productPath,
};
