const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = file => fs.readFileSync(file, 'utf8');

test('all storefront pages include the shared analytics script', () => {
  const pages = [
    'index.html',
    'checkout.html',
    'compliance.html',
    'why-us.html',
    'product.html',
    'lab-reports.html',
    'blog/how-to-reconstitute-peptides.html'
  ];
  for (const file of pages) {
    assert.match(read(file), /<script src="\/site-config\.js" defer><\/script>/, file);
    assert.match(read(file), /<script src="\/tiktok-analytics\.js" defer><\/script>/, file);
  }
});

test('basket emits AddToCart and InitiateCheckout', () => {
  const source = read('basket.js');
  assert.match(source, /NPUKAnalytics\.track\(eventName/);
  assert.match(source, /trackBasketEvent\('AddToCart'/);
  assert.match(source, /trackBasketEvent\('InitiateCheckout'/);
  assert.match(source, /contents:\s*items\.map\(item => \(\{[\s\S]*?content_id:[\s\S]*?content_name:[\s\S]*?content_type:\s*'product'[\s\S]*?quantity:[\s\S]*?price:/);
  assert.match(source, /trackBasketEvent\('InitiateCheckout',\s*basket,\s*getTotal\(\)\)/);
  assert.match(source, /currency:\s*'GBP'/);
});

test('checkout emits add-on and InitiateCheckout events', () => {
  const source = read('checkout.html');
  assert.match(source, /NPUKAnalytics\.track\('AddToCart'/);
  assert.match(source, /NPUKAnalytics\.track\('InitiateCheckout'/);
});

test('successful order clears basket on bank transfer success', () => {
  const source = read('checkout.html');
  assert.match(source, /function showBankTransferSuccess/);
  assert.match(source, /localStorage\.removeItem\('npuk_basket'\)/);
});

test('compliance page explains TikTok analytics and withdrawal', () => {
  const source = read('compliance.html');
  assert.match(source, /TikTok Pixel/);
  assert.match(source, /Cookie settings/);
  assert.match(source, /withdraw/i);
});

test('cookie policy link works from nested pages', () => {
  assert.match(read('tiktok-analytics.js'), /policyLink\.href = '\/cookies\.html'/);
});

test('base code loads exactly the configured TikTok Pixel ID', () => {
  const source = read('tiktok-analytics.js');
  assert.match(source, /ttq\.load\('D8RU9FBC77UATVQ6JIUG'\)/);
});
