const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { lint, formatReport } = require('../content-engine/compliance.js');

const ROOT = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(ROOT, file), 'utf8');

function htmlFiles(dir = ROOT, prefix = '') {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === '.superpowers' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    const rel = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(full, rel));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(rel.replace(/\\/g, '/'));
  }
  return files.sort();
}

test('all public HTML pages pass the research-use compliance gate', () => {
  const failures = [];
  for (const file of htmlFiles()) {
    const result = lint(read(file));
    if (!result.ok) failures.push(formatReport(file, result));
  }
  assert.equal(failures.join('\n\n'), '', 'compliance failures:\n' + failures.join('\n\n'));
});

test('homepage does not render placeholder or unsupported review proof', () => {
  const index = read('index.html');
  assert.doesNotMatch(index, /REPLACE_WITH_YOUR_TRUSTPILOT_BUSINESS_UNIT_ID/);
  assert.doesNotMatch(index, /Reviewed on\s*<strong>Trustpilot<\/strong>/);
  assert.doesNotMatch(index, /trustpilot/i);
  assert.doesNotMatch(index, /review collection in progress/i);
  assert.doesNotMatch(index, /Buyer review collection/i);
  assert.doesNotMatch(index, /tp-section/);
});

test('homepage bottom avoids redundant proof and comparison blocks', () => {
  const index = read('index.html');
  assert.doesNotMatch(index, /How We Compare/i);
  assert.doesNotMatch(index, /compare-section/);
  assert.doesNotMatch(index, /typical supplier/i);
  assert.doesNotMatch(index, /reviews-section/);
  assert.doesNotMatch(index, /Before Checkout/i);
  assert.doesNotMatch(index, /about-light-stats/);
  assert.match(index, /Reconstitution calculator/i);
  assert.match(index, /How to Order/i);
});

test('checkout and customer emails no longer reference Trustpilot', () => {
  const files = [
    'checkout.html',
    'api/stripe-webhook.js',
    'STRIPE_WEBHOOK_SETUP.md',
  ];
  for (const file of files) {
    assert.doesNotMatch(read(file), /trustpilot/i, `${file} should not mention Trustpilot`);
  }
});

test('reviews page is a real moderated collection route', () => {
  const file = path.join(ROOT, 'reviews', 'index.html');
  assert.ok(fs.existsSync(file), '/reviews/index.html should exist for QR and post-purchase links');
  const reviews = fs.readFileSync(file, 'utf8');
  assert.match(reviews, /Leave an Order Review/i);
  assert.match(reviews, /\/api\/submit-review/);
  assert.match(reviews, /dispatch, packaging, ordering and support/i);
  assert.match(reviews, /Moderated before publishing/i);
  assert.doesNotMatch(reviews, /trustpilot/i);
  assert.doesNotMatch(reviews, /\b\d(?:\.\d)?\/5\b|\b\d+\s+reviews\b/i);
});

test('reviews page previews four modest feedback summaries only on that route', () => {
  const reviews = read('reviews/index.html');
  const home = read('index.html');
  const cards = reviews.match(/data-feedback-card/g) || [];
  assert.equal(cards.length, 4);
  for (const theme of ['Delivery times', 'Goods quality', 'Packaging', 'Delivery and service']) {
    assert.match(reviews, new RegExp(theme, 'i'));
  }
  assert.doesNotMatch(home, /data-feedback-card/i);
  assert.doesNotMatch(home, /Previous feedback/i);
  assert.doesNotMatch(home, /Came quicker than I expected/i);
  assert.doesNotMatch(home, /Fast delivery and easy service/i);
  assert.match(reviews, /Recreated as short summaries/i);
  assert.match(reviews, /Leave your own review/i);
  assert.doesNotMatch(reviews, /customer name|verified buyer|\brated\b/i);
});

test('review submissions have validation and moderation guardrails', () => {
  const file = path.join(ROOT, 'api', 'submit-review.js');
  assert.ok(fs.existsSync(file), 'api/submit-review.js should receive review form submissions');
  const api = fs.readFileSync(file, 'utf8');
  assert.match(api, /RESEND_API_KEY/);
  assert.match(api, /ORDER_NOTIFY_EMAIL/);
  assert.match(api, /function escapeHtml/);
  assert.match(api, /PROHIBITED_REVIEW_TERMS/);
  assert.match(api, /consent/);
  for (const phrase of ['dosage', 'injection', 'weight loss', 'treatment', 'healing']) {
    assert.match(api, new RegExp(phrase, 'i'), `review API should block "${phrase}" claims`);
  }
});

test('review submission handler rejects prohibited review claims before delivery', async () => {
  const handler = require('../api/submit-review.js');
  const previousEnv = {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    ORDER_NOTIFY_EMAIL: process.env.ORDER_NOTIFY_EMAIL,
  };
  delete process.env.RESEND_API_KEY;
  delete process.env.ORDER_NOTIFY_EMAIL;

  try {
    const blocked = await invokeReviewHandler(handler, {
      rating: 5,
      displayName: 'Max',
      review: 'Great weight loss and injection result from this order.',
      consent: true,
    });
    assert.equal(blocked.statusCode, 400);
    assert.match(blocked.body.error, /ordering, dispatch, packaging or support/i);

    const unavailable = await invokeReviewHandler(handler, {
      rating: 5,
      displayName: 'Max',
      review: 'Great dispatch and careful packaging with clear support.',
      consent: true,
    });
    assert.equal(unavailable.statusCode, 503);
    assert.match(unavailable.body.error, /not available right now/i);
  } finally {
    if (previousEnv.RESEND_API_KEY === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousEnv.RESEND_API_KEY;
    if (previousEnv.ORDER_NOTIFY_EMAIL === undefined) delete process.env.ORDER_NOTIFY_EMAIL;
    else process.env.ORDER_NOTIFY_EMAIL = previousEnv.ORDER_NOTIFY_EMAIL;
  }
});

async function invokeReviewHandler(handler, body) {
  const req = {
    method: 'POST',
    headers: { origin: 'https://www.northpeptidesuk.com' },
    body,
  };
  const res = {
    headers: {},
    statusCode: 200,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    send(payload) { this.body = JSON.parse(payload); return this; },
    end() { this.ended = true; return this; },
  };
  await handler(req, res);
  return res;
}

test('public sources do not contain common mojibake sequences', () => {
  const exts = new Set(['.html', '.js', '.json', '.md', '.cjs']);
  const skipDirs = new Set(['.git', 'node_modules', 'tests']);
  const bad = /(?:\u00C3|\u00C2|\u00E2[\u0080-\u00BF]|\u00F0[\u0080-\u00BF])/;
  const matches = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile() || !exts.has(path.extname(entry.name))) continue;
      const file = path.join(dir, entry.name);
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const source = fs.readFileSync(file, 'utf8');
      if (bad.test(source)) matches.push(rel);
    }
  }

  walk(ROOT);
  assert.deepEqual(matches, []);
});

test('public sources decode cleanly as UTF-8', () => {
  const exts = new Set(['.html', '.js', '.json', '.md', '.cjs']);
  const skipDirs = new Set(['.git', 'node_modules', 'tests']);
  const matches = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!skipDirs.has(entry.name)) walk(path.join(dir, entry.name));
        continue;
      }
      if (!entry.isFile() || !exts.has(path.extname(entry.name))) continue;
      const file = path.join(dir, entry.name);
      const rel = path.relative(ROOT, file).replace(/\\/g, '/');
      const source = fs.readFileSync(file, 'utf8');
      if (source.includes('\uFFFD')) matches.push(rel);
    }
  }

  walk(ROOT);
  assert.deepEqual(matches, []);
});

test('public JavaScript assets parse cleanly', () => {
  const files = [
    'age-gate.js',
    'basket.js',
    'css/basket.js',
    'dispatch-bar.js',
    'product-data.js',
    'site-config.js',
    'tiktok-analytics.js',
  ];
  for (const file of files) {
    assert.doesNotThrow(
      () => new vm.Script(read(file), { filename: file }),
      `${file} should be valid JavaScript`
    );
  }
});

test('high-risk administration and unsupported review phrases are absent', () => {
  const files = [
    'index.html',
    'checkout.html',
    'product-data.js',
    'api/stripe-webhook.js',
    ...fs.readdirSync(path.join(ROOT, 'content-engine', 'articles'))
      .filter(file => file.endsWith('.js'))
      .map(file => `content-engine/articles/${file}`),
  ];
  const forbidden = [
    /draw and use/i,
    /auto-injector/i,
    /dosing dial/i,
    /one injection/i,
    /leave a trustpilot review/i,
    /rated by researchers on trustpilot/i,
    /anti-inflammatory/i,
    /certificate of analysis on request/i,
  ];
  const matches = [];
  for (const file of files) {
    const source = read(file);
    for (const pattern of forbidden) {
      const match = source.match(pattern);
      if (match) matches.push(`${file}: ${match[0]}`);
    }
  }
  assert.deepEqual(matches, []);
});

test('homepage includes mobile overflow guards for paid-traffic viewports', () => {
  const index = read('index.html');
  assert.match(index, /@media \(max-width: 768px\)/, 'homepage should have a mobile breakpoint');
  assert.match(index, /\.shop-nav \{ padding: 0 16px; \}/, 'homepage nav should fit narrow phones');
  assert.match(index, /#basket-btn-label \{ display: none !important; \}/, 'basket label should stay hidden on mobile after JS updates');
  assert.match(index, /\.about-light-grid \{ grid-template-columns: minmax\(0, 1fr\);/, 'about grid should shrink inside the mobile viewport');
});

test('unsupported verification claims are absent while independent COAs are pending', () => {
  const files = [
    'index.html',
    'why-us.html',
    'lab-reports.html',
    'product.html',
    'product-data.js',
    ...fs.readdirSync(path.join(ROOT, 'content-engine', 'articles'))
      .filter(file => file.endsWith('.js'))
      .map(file => `content-engine/articles/${file}`),
  ];
  const forbidden = [
    /\bverified to\s*(?:>=|≥|99)/i,
    /\bverified purity\b/i,
    /\bverified\.\s*stocked\.\s*dispatched/i,
    /\bEvery batch is verified\b/i,
    /\bCertificate of Analysis available on request\b/i,
    /\bCOA Filed on Arrival\b/i,
    /\bHPLC Results Recorded\b/i,
    /\bFull PDF COA documents are provided\b/i,
    /\bBatch COA\b/i,
  ];
  const matches = [];
  for (const file of files) {
    const source = read(file);
    for (const pattern of forbidden) {
      const match = source.match(pattern);
      if (match) matches.push(`${file}: ${match[0]}`);
    }
  }
  assert.deepEqual(matches, []);
});

test('machine-readable catalogue exists for search and AI retrieval', () => {
  const feedPath = path.join(ROOT, 'products.json');
  assert.ok(fs.existsSync(feedPath), 'products.json should exist at the site root');
  const feed = JSON.parse(fs.readFileSync(feedPath, 'utf8'));
  assert.equal(feed.site, 'North Peptides UK');
  assert.match(feed.generatedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(feed.products));
  assert.ok(feed.products.length >= 30);
  for (const product of feed.products) {
    assert.ok(product.slug, 'product slug is required');
    assert.ok(product.name, `${product.slug} name is required`);
    assert.ok(product.url.startsWith('https://www.northpeptidesuk.com/products/'));
    assert.ok(Array.isArray(product.variants) && product.variants.length >= 1, `${product.slug} variants are required`);
    assert.equal(product.researchUseOnly, true, `${product.slug} must be RUO-marked`);
    assert.doesNotMatch(JSON.stringify(product), /\bverified\b|\bHPLC\b|\bTrustpilot\b/i);
  }
});

test('secondary pages include mobile overflow guards', () => {
  for (const file of ['why-us.html', 'lab-reports.html']) {
    const source = read(file);
    assert.match(source, /@media \(max-width: 480px\)/, `${file} should have a narrow-phone media query`);
    assert.match(source, /\.nav-cta \{ padding: 8px 10px; font-size: 0\.6rem; \}/, `${file} should shrink the basket CTA on phones`);
    assert.match(source, /\.logo \{ font-size: 0\.84rem; letter-spacing: 0\.05em; \}/, `${file} should shrink the logo on phones`);
    assert.match(source, /\.page-title \{ font-size: 1\.72rem; \}/, `${file} should reduce long hero titles on phones`);
  }
});

test('generated blog index includes mobile nav overflow guards', () => {
  const source = read('blog/index.html');
  assert.match(source, /@media \(max-width: 480px\)/, 'blog index should have a narrow-phone media query');
  assert.match(source, /\.nav \{ padding: 0 12px; gap: 10px; \}/, 'blog index should tighten nav spacing on phones');
  assert.match(source, /\.logo \{ font-size: 0\.84rem; letter-spacing: 0\.05em; \}/, 'blog index should shrink the logo on phones');
  assert.match(source, /\.nav-basket \{ padding: 8px 10px; font-size: 0\.6rem; \}/, 'blog index should shrink the shop CTA on phones');
});
