const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

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

test('paired vial and pen products share one live order builder', () => {
  for (const [slug, product] of Object.entries(PRODUCTS)) {
    if (!product.sisterProduct) continue;

    const html = read(productPath(slug));
    assert.match(html, /Build your order/);
    assert.match(html, /aria-label="Choose product format"/);
    assert.match(html, new RegExp(`"slug":"${product.sisterProduct.slug}"`));
    assert.match(html, new RegExp(`"image":"${PRODUCTS[product.sisterProduct.slug].image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    assert.match(html, /Complete disposable pen kit/);
    assert.match(html, /Sterile disposable needle tips/);
    assert.match(html, /Alcohol wipes/);
    // Crawlable cross-link — the format toggle is a <button>, so this anchor
    // is the only internal link keeping the sister page out of orphan status.
    assert.match(html, new RegExp(`<a href="/products/${product.sisterProduct.slug}/">`),
      `${slug} should link to its sister product page`);
  }
});

test('homepage consolidates pen vials into their compound product pages', () => {
  const homepage = read('index.html');
  assert.doesNotMatch(homepage, /href="#cat-pen-vials"/);
  assert.doesNotMatch(homepage, /<div class="product-category" id="cat-pen-vials">/);
  // The dead legacy markup is gone for good — it was rendered nowhere but
  // still had to be price-maintained because tests scan raw HTML.
  assert.doesNotMatch(homepage, /<template id="legacy-pen-vial-cards">/);
  assert.match(homepage, />21 products</);
});

test('homepage surfaces the pen option with a crawlable link per paired compound', () => {
  const homepage = read('index.html');
  for (const [slug, product] of Object.entries(PRODUCTS)) {
    if (!/-pen$/.test(slug) || !product.sisterProduct) continue;
    assert.match(homepage,
      new RegExp(`<a class="card-pen-link" href="products/${slug}/"`),
      `homepage should link to products/${slug}/ from its compound card`);
  }
  assert.match(homepage, /at least &pound;15 over the equivalent standard vial/);
});

test('homepage makes the two new lab results unmistakable in the first journey', () => {
  const homepage = read('index.html');
  assert.match(homepage, /id="latest-lab-results"/);
  assert.match(homepage, /New lab results: Reta \+ GHK-Cu/);
  assert.match(homepage, /Reta \+ GHK-Cu: both 99% HPLC\./);
  assert.match(homepage, /Both 99% purity by independent HPLC/);
  assert.match(homepage, /class="latest-labs-track"[^>]*tabindex="0"/);
  assert.match(homepage, /coa-retatrutide-100016392-report\.png/);
  assert.match(homepage, /coa-ghk-cu-100016393-report\.png/);
  assert.match(homepage, /href="coa\/retatrutide-100016392\.html"/);
  assert.match(homepage, /href="coa\/ghk-cu-100016393\.html"/);
  assert.match(homepage, /scroll-snap-type:\s*x mandatory/);
  assert.doesNotMatch(homepage, /Lab report gallery controls/i);

  function card(id) {
    const start = homepage.indexOf(`id="${id}"`);
    assert.notEqual(start, -1, `${id} card should exist`);
    const next = homepage.indexOf('<div class="shop-card"', start + 1);
    return homepage.slice(start, next === -1 ? homepage.length : next);
  }

  const reta = card('product-retatrutide');
  const ghk = card('product-ghk-cu');
  for (const [name, source] of [['Retatrutide', reta], ['GHK-Cu', ghk]]) {
    assert.match(source, /99% HPLC tested/);
    assert.match(source, /class="card-lab-link"/);
    assert.doesNotMatch(source, /Verification pending/, `${name} card must not call a published report pending`);
  }
});

test('published report claims cannot drift onto products without report data', () => {
  for (const [slug, product] of Object.entries(PRODUCTS)) {
    const source = JSON.stringify(product);
    if (/99%|HPLC analysis returned|independently verified/i.test(source)) {
      assert.ok(product.coa, `${slug} makes a published-report claim but has no coa object`);
    }
    if (product.coa && product.coaScope !== 'component') {
      assert.doesNotMatch(source, /verification pending|supplier-stated purity/i,
        `${slug} must not contradict its published report with pending copy`);
    }
    if (product.coaScope === 'component') {
      assert.match(product.coaScopeNote, /standalone/i, `${slug} must say the component was tested standalone`);
      assert.match(product.coaScopeNote, /not as the finished blend/i, `${slug} must not imply the blend was tested`);
      const purity = (product.specs || []).find(([label]) => /purity/i.test(label));
      assert.ok(purity, `${slug} should retain a blend purity specification`);
      assert.match(purity[1], /supplier stated/i, `${slug} blend purity must remain supplier stated`);
    }
  }
});

test('products with reports put the certificate one swipe after the product photo', () => {
  for (const [slug, product] of Object.entries(PRODUCTS)) {
    if (!product.coa) continue;
    const html = read(productPath(slug));
    assert.match(html, /class="coa-hero-badge"/, `${slug} should surface its report beside the buy box`);
    assert.match(html, new RegExp(`href="${product.coa.page.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
    if (product.coaScope === 'component') {
      assert.match(html, /tested standalone, not as the finished blend/i);
      continue;
    }
    assert.match(html, /Swipe once for the lab report/);
    assert.match(html, /class="media-gallery-count" id="media-gallery-count">1 \/ 2<\/span>/,
      `${slug} should present one product image followed by one report image`);
    assert.match(html, /function stepProductImage/);
    assert.match(html, /addEventListener\('touchstart'/);
    assert.match(html, /#product-image\.is-document \{ object-fit: contain/);
    assert.match(html, /href="\/lab-reports\.html">Lab Reports<\/a>/);
    const galleryScript = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
      .map(match => match[1])
      .find(script => script.includes('function productGalleryButtons'));
    assert.ok(galleryScript, `${slug} should embed gallery behaviour`);
    assert.doesNotThrow(() => new vm.Script(galleryScript), `${slug} gallery script should parse`);
    const thumbBlock = html.match(/<div class="media-thumbs"[^>]*>([\s\S]*?)<\/div>/);
    assert.ok(thumbBlock, `${slug} should render image thumbnails`);
    const reportImage = product.coa.images[0].src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.match(thumbBlock[1], new RegExp(`data-index="1" data-src="/${reportImage}"`),
      `${slug} should make its report the immediate second image`);
    if (product.coa.images[1]) {
      assert.doesNotMatch(thumbBlock[1], new RegExp(product.coa.images[1].src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `${slug} should keep extra analytical pages in the full report block`);
    }
    for (const image of product.coa.images) {
      assert.match(html, new RegExp(image.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        `${slug} report block should show ${image.src}`);
    }
  }

  const dynamic = read('product.html');
  assert.match(dynamic, /Swipe once for the lab report/);
  assert.match(dynamic, /function stepProductImage/);
  assert.match(dynamic, /addEventListener\("touchstart"/);
});

test('pen-vial orders consistently state that the disposable kit is included', () => {
  const productData = read('product-data.js');
  const checkout = read('checkout.html');
  assert.doesNotMatch(productData, /Pen kit available as add-on/);
  assert.doesNotMatch(productData, /Do I need a pen separately\?", a: "Yes\./);
  assert.match(productData, /Each pen-vial order includes a pre-filled disposable research pen/);
  assert.match(checkout, /Disposable pen, sterile needle tips and alcohol wipes included/);
  assert.match(checkout, /your pen kit already includes sterile tips/);
  assert.match(checkout, /your pen kit already includes alcohol wipes/);

  for (const [slug, product] of Object.entries(PRODUCTS)) {
    if (!/-pen$/.test(slug)) continue;
    const html = read(productPath(slug));
    assert.match(html, /Complete disposable pen kit/);
    assert.match(html, /Pre-filled disposable research pen/);
    assert.match(html, /Sterile disposable needle tips/);
    assert.match(html, /Alcohol wipes/);
    assert.doesNotMatch(html, /pen-style research kit available as an add-on at checkout/i);
  }
});

test('retatrutide builder updates format, size, add-on price and basket lines', () => {
  const html = read(productPath('retatrutide'));
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match => match[1]);
  const dataScript = scripts.find(script => script.includes('window.NPUK_CONFIG_FORMATS ='));
  const behaviourScript = scripts.find(script => script.includes('function addConfiguredToBasket'));
  assert.ok(dataScript, 'product configuration data should be embedded');
  assert.ok(behaviourScript, 'product configuration behaviour should be embedded');

  const makeElement = dataset => {
    const classes = new Set();
    const attributes = {};
    return {
      dataset: dataset || {},
      hidden: false,
      textContent: '',
      attributes,
      classList: {
        contains: name => classes.has(name),
        toggle(name, enabled) {
          if (enabled) classes.add(name);
          else classes.delete(name);
        }
      },
      setAttribute(name, value) {
        attributes[name] = value;
      }
    };
  };

  let sizeButtons = [];
  const formatButtons = [makeElement({ formatIndex: '0' }), makeElement({ formatIndex: '1' })];
  const elements = {
    'config-selection-name': makeElement(),
    'config-total': makeElement(),
    'config-total-note': makeElement(),
    'config-size-grid': makeElement(),
    'config-bac-control': makeElement(),
    'config-pen-kit': makeElement(),
    'product-image': makeElement(),
    'bac-yes': makeElement(),
    'bac-no': makeElement()
  };
  let sizeMarkup = '';
  Object.defineProperty(elements['config-size-grid'], 'innerHTML', {
    get: () => sizeMarkup,
    set(value) {
      sizeMarkup = value;
      sizeButtons = [...value.matchAll(/data-config-index="(\d+)"/g)]
        .map(match => makeElement({ configIndex: match[1] }));
    }
  });

  const basket = [];
  let basketOpened = false;
  const context = {
    Intl,
    document: {
      getElementById: id => elements[id] || null,
      querySelectorAll: selector => selector === '[data-format-index]' ? formatButtons : sizeButtons
    },
    addToBasket: (name, price, dose) => basket.push({ name, price, dose }),
    showBasket: () => { basketOpened = true; }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(dataScript, context);
  vm.runInContext(behaviourScript, context);

  assert.equal(elements['config-selection-name'].textContent, 'Retatrutide 10mg');
  assert.equal(elements['config-total'].textContent, '£45');
  assert.equal(elements['config-total-note'].textContent, 'Standard vial');
  assert.equal(elements['config-pen-kit'].hidden, true);
  assert.equal(elements['product-image'].attributes.src, '/reta-50mg.png');
  assert.equal(elements['product-image'].attributes.alt, 'Retatrutide');

  context.setBacWater(true);
  assert.equal(elements['config-total'].textContent, '£51.99');
  assert.equal(elements['config-total-note'].textContent, 'Vial + BAC water');

  context.selectConfiguredFormat(1);
  assert.equal(elements['config-selection-name'].textContent, 'Retatrutide Pen Vial 10mg');
  assert.equal(elements['config-total'].textContent, '£60');
  // The premium is anchored against the same-strength vial (£60 pen vs £45 vial).
  assert.equal(elements['config-total-note'].textContent, 'Complete kit included · +£15 vs vial');
  assert.equal(elements['config-bac-control'].hidden, true);
  assert.equal(elements['config-pen-kit'].hidden, false);
  assert.equal(elements['product-image'].attributes.src, '/reta-pen-vial.png');
  assert.equal(elements['product-image'].attributes.alt, 'Retatrutide Pen Vial');
  assert.equal(sizeButtons.length, 3);

  context.selectConfiguredVariant(1);
  context.addConfiguredToBasket();
  assert.deepEqual(basket, [{ name: 'Retatrutide Pen Vial', price: 100, dose: '20mg' }]);
  assert.equal(basketOpened, true);

  basket.length = 0;
  context.selectConfiguredFormat(0);
  context.selectConfiguredVariant(2);
  context.setBacWater(true);
  context.addConfiguredToBasket();
  assert.deepEqual(basket, [
    { name: 'Retatrutide', price: 85, dose: '20mg' },
    // Must stay a key the server CATALOG resolves — "10ml vial add-on" shipped
    // once and 400'd every checkout that included the builder's BAC water.
    { name: 'Bacteriostatic Water', price: 6.99, dose: '10ml vial' }
  ]);
});
