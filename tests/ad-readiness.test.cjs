const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
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

test('homepage does not render placeholder or unsupported Trustpilot proof', () => {
  const index = read('index.html');
  assert.doesNotMatch(index, /REPLACE_WITH_YOUR_TRUSTPILOT_BUSINESS_UNIT_ID/);
  assert.doesNotMatch(index, /Reviewed on\s*<strong>Trustpilot<\/strong>/);
  assert.doesNotMatch(index, /trustpilot/i);
  assert.match(index, /review collection in progress/i);
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

test('public sources do not contain common mojibake sequences', () => {
  const exts = new Set(['.html', '.js', '.json', '.md', '.cjs']);
  const skipDirs = new Set(['.git', 'node_modules', 'tests']);
  const bad = /(?:â€|â€™|â€œ|â€�|â€“|â€”|â€¦|â†’|âœ|â‰|âˆ|Ã—|Â£|Â·|Â©|Ã‚|ðŸ)/;
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
    assert.ok(product.url.startsWith('https://www.northpeptidesuk.com/product.html?product='));
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
