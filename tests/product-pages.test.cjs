const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PRODUCTS = require(path.join(ROOT, 'product-data.js'));
const slugs = Object.keys(PRODUCTS);
const SITE = 'https://www.northpeptidesuk.com';

const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function productPath(slug) {
  return `products/${slug}/index.html`;
}

test('every catalogue item has a static product landing page', () => {
  assert.ok(slugs.length >= 30, 'catalogue should expose the full product range');

  for (const slug of slugs) {
    const file = productPath(slug);
    const htmlPath = path.join(ROOT, file);
    assert.ok(fs.existsSync(htmlPath), `${file} should be generated`);

    const html = fs.readFileSync(htmlPath, 'utf8');
    const product = PRODUCTS[slug];
    const cleanUrl = `${SITE}/products/${slug}/`;

    assert.match(html, new RegExp(`<link rel="canonical" href="${cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}">`));
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.match(html, /"@type":\s*"Product"/);
    assert.match(html, new RegExp(`<h1[^>]*>${product.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`));
    assert.match(html, /Research use only/i);
    assert.match(html, /not for human or animal consumption/i);
    assert.match(html, /\/site-config\.js/);
    assert.match(html, /\/tiktok-analytics\.js/);
    assert.match(html, /addToBasket\(/);
    assert.match(html, /Add to Basket/, `${file} should expose a clear buy action`);
  }
});

test('sitemap and product feed use clean product URLs', () => {
  const sitemap = read('sitemap.xml');
  const feed = JSON.parse(read('products.json'));

  assert.doesNotMatch(sitemap, /product\.html\?product=/);
  assert.equal(feed.products.length, slugs.length);

  for (const slug of slugs) {
    const cleanUrl = `${SITE}/products/${slug}/`;
    assert.match(sitemap, new RegExp(`<loc>${cleanUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</loc>`));

    const entry = feed.products.find(product => product.slug === slug);
    assert.ok(entry, `${slug} should be present in products.json`);
    assert.equal(entry.url, cleanUrl);
  }
});

test('homepage and generated blog pages link to clean product URLs', () => {
  const files = ['index.html'];
  const blogDir = path.join(ROOT, 'blog');
  for (const entry of fs.readdirSync(blogDir)) {
    if (entry.endsWith('.html')) files.push(`blog/${entry}`);
  }

  for (const file of files) {
    const html = read(file);
    assert.doesNotMatch(html, /product\.html\?product=/, `${file} should link to static product pages`);
  }
});
