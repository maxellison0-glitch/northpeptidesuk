const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const read = file => fs.readFileSync(file, 'utf8');

test('all storefront pages include the shared analytics script', () => {
  for (const file of ['index.html', 'checkout.html', 'compliance.html']) {
    assert.match(read(file), /<script src="tiktok-analytics\.js" defer><\/script>/, file);
  }
});

test('basket emits AddToCart and InitiateCheckout', () => {
  const source = read('basket.js');
  assert.match(source, /NPUKAnalytics\.track\('AddToCart'/);
  assert.match(source, /NPUKAnalytics\.track\('InitiateCheckout'/);
  assert.match(source, /currency:\s*'GBP'/);
});

test('checkout emits add-on and successful Stripe events', () => {
  const source = read('checkout.html');
  assert.match(source, /NPUKAnalytics\.track\('AddToCart'/);
  assert.match(source, /NPUKAnalytics\.track\('CompletePayment'/);
  assert.ok(
    source.indexOf("paymentStatus === 'success'") < source.indexOf("NPUKAnalytics.track('CompletePayment'"),
    'CompletePayment must be guarded by the successful Stripe return branch'
  );
});

test('successful payment restores basket before tracking and clearing it', () => {
  const source = read('checkout.html');
  const loadBasket = source.indexOf("sessionStorage.getItem('npuk_basket')");
  const completePayment = source.indexOf("NPUKAnalytics.track('CompletePayment'");
  const showSuccessCall = source.indexOf('showStripeSuccess();', completePayment);
  assert.ok(loadBasket >= 0 && loadBasket < completePayment);
  assert.ok(completePayment < showSuccessCall);
  assert.match(source, /function showStripeSuccess\(\)[\s\S]*?sessionStorage\.removeItem\('npuk_basket'\)/);
});

test('compliance page explains TikTok analytics and withdrawal', () => {
  const source = read('compliance.html');
  assert.match(source, /TikTok Pixel/);
  assert.match(source, /Cookie settings/);
  assert.match(source, /withdraw/i);
});
