'use strict';

const { SITE, PRODUCTS, escapeHtml, formatGBP, productUrl } = require('./site.js');

const DISCLAIMER =
  'Products are supplied strictly for laboratory and scientific research use only. ' +
  'They are not medicines, are not for human or animal consumption, and no therapeutic claims are made.';

function js(value) {
  return JSON.stringify(String(value));
}

function priceLabel(product) {
  const prices = product.variants.map(variant => Number(variant.price));
  const min = Math.min(...prices);
  return product.variants.length > 1 ? `From ${formatGBP(min)}` : formatGBP(min);
}

function supportsBacWaterAddon(product) {
  if (product.supply) return false;
  if (/pen vial/i.test(product.name)) return false;
  const specs = Array.isArray(product.specs) ? product.specs : [];
  return specs.some(([label, value]) =>
    /form/i.test(String(label)) && /lyophilised powder/i.test(String(value))
  );
}

function formatType(product) {
  return /pen vial/i.test(product.name) ? 'pen' : 'vial';
}

function formatLabel(type) {
  return type === 'pen' ? 'Pen vial' : 'Vial';
}

function formatMeta(type) {
  return type === 'pen' ? 'Complete pen kit included' : 'You reconstitute';
}

// The £ difference between a pen variant and the equivalent-strength standard
// vial, so the premium is anchored honestly per size (it is not flat across
// the catalogue). Returns null when there is no same-strength vial to compare.
function penPremium(formats, format, variant) {
  if (format.type !== 'pen') return null;
  const vial = formats.find(f => f.type === 'vial');
  if (!vial) return null;
  const mg = parseFloat(String(variant.dose));
  if (!Number.isFinite(mg)) return null;
  const match = vial.variants.find(v => parseFloat(String(v.dose)) === mg);
  if (!match) return null;
  const delta = Math.round((Number(variant.price) - Number(match.price)) * 100) / 100;
  return delta > 0 ? delta : null;
}

function totalNote(formats, format, variant, bacWater) {
  if (format.type === 'pen') {
    const premium = penPremium(formats, format, variant);
    return premium ? `Complete kit included · +${formatGBP(premium)} vs vial` : 'Complete kit included';
  }
  return bacWater ? 'Vial + BAC water' : 'Standard vial';
}

function configuredFormats(slug, product) {
  const formats = [{
    slug,
    type: formatType(product),
    productName: product.name,
    label: formatLabel(formatType(product)),
    meta: formatMeta(formatType(product)),
    image: String(product.image),
    bacWater: supportsBacWaterAddon(product),
    variants: product.variants.map(variant => ({
      label: String(variant.label || variant.dose),
      dose: String(variant.dose),
      price: Number(variant.price),
    })),
  }];

  if (product.sisterProduct && PRODUCTS[product.sisterProduct.slug]) {
    const sister = PRODUCTS[product.sisterProduct.slug];
    const sisterType = formatType(sister);
    formats.push({
      slug: product.sisterProduct.slug,
      type: sisterType,
      productName: sister.name,
      label: formatLabel(sisterType),
      meta: formatMeta(sisterType),
      image: String(sister.image),
      bacWater: supportsBacWaterAddon(sister),
      variants: sister.variants.map(variant => ({
        label: String(variant.label || variant.dose),
        dose: String(variant.dose),
        price: Number(variant.price),
      })),
    });
  }

  return formats.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'vial' ? -1 : 1;
  });
}

function variantButtons(product) {
  return product.variants.map(variant => {
    const aria = `Add ${product.name} ${variant.dose} to basket`;
    return `
          <button class="variant-row" type="button" aria-label="${escapeHtml(aria)}" onclick='addToBasket(${js(product.name)}, ${Number(variant.price)}, ${js(variant.dose)})'>
            <span>
              <strong>${escapeHtml(variant.label || variant.dose)}</strong>
              <small>${escapeHtml(variant.dose)}</small>
            </span>
            <span class="variant-action">
              <span class="variant-price">${escapeHtml(formatGBP(Number(variant.price)))}</span>
              <span class="variant-cta">Add to Basket</span>
            </span>
          </button>`;
  }).join('');
}

function configuredVariantButtons(variants) {
  return variants.map((variant, index) => {
    const selected = index === 0;
    return `
          <button class="config-size-btn${selected ? ' active' : ''}" type="button" data-config-index="${index}" aria-pressed="${selected ? 'true' : 'false'}" onclick="selectConfiguredVariant(${index})">
            <span>${escapeHtml(variant.label || variant.dose)}</span>
            <small>${escapeHtml(formatGBP(Number(variant.price)))}</small>
          </button>`;
  }).join('');
}

function configuredFormatButtons(formats, activeIndex) {
  if (formats.length < 2) return '';
  return `
          <div class="config-control">
            <label>Format</label>
            <div class="config-toggle-row" role="group" aria-label="Choose product format">
${formats.map((format, index) => `
              <button class="config-format-btn${index === activeIndex ? ' active' : ''}" type="button" data-format-index="${index}" aria-pressed="${index === activeIndex ? 'true' : 'false'}" onclick="selectConfiguredFormat(${index})">
                <span>${escapeHtml(format.label)}</span>
                <small>${escapeHtml(format.meta)}</small>
              </button>`).join('')}
            </div>
          </div>`;
}

function buyInterface(slug, product) {
  const formats = configuredFormats(slug, product);
  const hasConfigurator = formats.length > 1 || supportsBacWaterAddon(product);
  if (!hasConfigurator) {
    return `
        <div class="variant-list">
${variantButtons(product)}
        </div>`;
  }

  const activeFormatIndex = Math.max(0, formats.findIndex(format => format.slug === slug));
  const activeFormat = formats[activeFormatIndex];

  return `
        <section class="config-box" aria-label="${escapeHtml(product.name)} order builder">
          <div class="config-head">
            <span class="config-kicker">Build your order</span>
            <strong id="config-selection-name">${escapeHtml(activeFormat.productName)} ${escapeHtml(activeFormat.variants[0].dose)}</strong>
          </div>
${configuredFormatButtons(formats, activeFormatIndex)}
          <div class="config-control">
            <label>Size</label>
            <div class="config-size-grid" id="config-size-grid" role="group" aria-label="Choose size">
${configuredVariantButtons(activeFormat.variants)}
            </div>
          </div>
          <div class="config-pen-kit" id="config-pen-kit"${activeFormat.type === 'pen' ? '' : ' hidden'}>
            <div class="config-pen-kit-head">
              <span>Everything included</span>
              <strong>Complete disposable pen kit</strong>
            </div>
            <div class="config-pen-kit-list">
              <span>Pre-filled disposable research pen</span>
              <span>Sterile disposable needle tips</span>
              <span>Alcohol wipes</span>
            </div>
            <p>No reconstitution or separate pen hardware needed for laboratory handling.</p>
          </div>
          <div class="config-control" id="config-bac-control"${activeFormat.bacWater ? '' : ' hidden'}>
            <div class="config-label-row">
              <label>Bacteriostatic water</label>
              <span>+&pound;6.99</span>
            </div>
            <div class="config-toggle-row" role="group" aria-label="Add bacteriostatic water">
              <button class="config-toggle" id="bac-yes" type="button" aria-pressed="false" onclick="setBacWater(true)">Yes, include</button>
              <button class="config-toggle active" id="bac-no" type="button" aria-pressed="true" onclick="setBacWater(false)">No, I have it</button>
            </div>
          </div>
          <div class="config-total-row" aria-live="polite" aria-atomic="true">
            <span>
              <small>Order total</small>
              <strong id="config-total">${escapeHtml(formatGBP(Number(activeFormat.variants[0].price)))}</strong>
            </span>
            <em id="config-total-note">${escapeHtml(totalNote(formats, activeFormat, activeFormat.variants[0], false))}</em>
          </div>
          <button class="config-add-btn" type="button" onclick="addConfiguredToBasket()">Add to Basket</button>
        </section>
        <div class="config-sticky-bar">
          <span>
            <small>Order total</small>
            <strong id="config-total-bar">${escapeHtml(formatGBP(Number(activeFormat.variants[0].price)))}</strong>
          </span>
          <button type="button" onclick="addConfiguredToBasket()">Add to Basket</button>
        </div>
        <script>
          window.NPUK_CONFIG_FORMAT_INDEX = ${activeFormatIndex};
          window.NPUK_CONFIG_FORMATS = ${JSON.stringify(formats)};
          window.NPUK_CONFIG_ADDON = { name: 'Bacteriostatic Water', dose: '10ml vial', price: 6.99 };
        </script>`;
}

function listItems(items) {
  if (!Array.isArray(items) || !items.length) return '';
  return `
        <ul class="plain-list">
${items.map(item => `          <li>${escapeHtml(item)}</li>`).join('\n')}
        </ul>`;
}

function specsTable(product) {
  if (!Array.isArray(product.specs) || !product.specs.length) return '';
  return `
        <section class="section-block">
          <h2>Specification</h2>
          <table class="spec-table">
${product.specs.map(([label, value]) => `            <tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('\n')}
          </table>
        </section>`;
}

function faqBlock(product) {
  const faqs = product.seo && Array.isArray(product.seo.faq) ? product.seo.faq : [];
  if (!faqs.length) return '';
  return `
        <section class="section-block">
          <h2>Questions</h2>
${faqs.map(faq => `          <details class="faq-item">
            <summary>${escapeHtml(faq.q)}</summary>
            <p>${escapeHtml(faq.a)}</p>
          </details>`).join('\n')}
        </section>`;
}

function jsonLd(slug, product) {
  const url = productUrl(slug);
  const image = `${SITE.base}/${product.image}`;
  const offers = product.variants.map(variant => ({
    '@type': 'Offer',
    name: `${product.name} ${variant.dose}`,
    price: String(variant.price),
    priceCurrency: 'GBP',
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url,
  }));
  const graph = [
    {
      '@type': 'Product',
      name: product.name,
      description: Array.isArray(product.longDescription) && product.longDescription.length
        ? product.longDescription.join(' ')
        : product.summary,
      image,
      category: product.category,
      brand: { '@type': 'Brand', name: SITE.name },
      offers,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.base}/` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE.base}/#products` },
        { '@type': 'ListItem', position: 3, name: product.name, item: url },
      ],
    },
  ];
  const faqs = product.seo && Array.isArray(product.seo.faq) ? product.seo.faq : [];
  if (faqs.length) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    });
  }
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
}

function basketDrawer() {
  return `
  <div class="basket-overlay" id="basket-overlay" onclick="hideBasket()"></div>
  <div class="basket-drawer" id="basket-drawer">
    <div class="basket-head">
      <div>
        <span class="eyebrow">Basket</span>
        <h2>Your order</h2>
      </div>
      <button class="basket-close" type="button" onclick="hideBasket()">Close</button>
    </div>
    <div class="basket-items" id="basket-items"><p class="basket-empty">Your basket is empty.</p></div>
    <div class="basket-footer">
      <div class="basket-total-row"><span>Total</span><strong id="basket-total">&pound;0</strong></div>
      <button class="checkout-button" type="button" onclick="goToCheckout()">Checkout</button>
    </div>
  </div>`;
}

function renderProductPage(slug, product) {
  const url = productUrl(slug);
  const title = (product.seo && product.seo.title) || `${product.name} | ${SITE.name}`;
  const description = (product.seo && product.seo.metaDescription)
    || `${product.summary} UK stocked. Research use only.`;
  const displaySummary = formatType(product) === 'pen'
    ? 'Pre-filled disposable research pen with sterile needle tips and alcohol wipes included.'
    : product.summary;
  const lowerDescription = Array.isArray(product.longDescription) && product.longDescription.length
    ? product.longDescription
    : [product.summary];
  const category = product.category || (product.supply ? 'Research supplies' : 'Research compound');
  const formats = configuredFormats(slug, product);
  const hasConfigurator = formats.length > 1 || supportsBacWaterAddon(product);
  const configScript = hasConfigurator ? PRODUCT_CONFIG_SCRIPT : '';
  const imagePreloads = formats
    .filter(format => format.image !== product.image)
    .map(format => `  <link rel="preload" as="image" href="/${escapeHtml(format.image)}" fetchpriority="low">`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow">
  <meta property="og:type" content="product">
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE.base}/${escapeHtml(product.image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="/logo.png">
  <link rel="apple-touch-icon" href="/logo.png">
${imagePreloads}
  <script type="application/ld+json">
${jsonLd(slug, product)}
  </script>
  <script src="/site-config.js" defer></script>
  <script src="/tiktok-analytics.js" defer></script>
  <script src="/age-gate.js"></script>
  <script src="/dispatch-bar.js"></script>
  <script src="/basket.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet">
  <style>${PRODUCT_CSS}</style>
</head>
<body>
  <nav class="nav">
    <a href="/" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <div class="nav-links">
      <a href="/#products">Products</a>
      <a href="/blog/index.html">Guides</a>
      <button class="basket-nav" type="button" onclick="showBasket()">Basket <span id="basket-count"></span></button>
    </div>
  </nav>

  <main>
    <section class="product-hero">
      <div class="media-card">
        <img id="product-image" src="/${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="eager">
      </div>
      <div class="buy-card">
        <a class="back-link" href="/#products">Back to products</a>
        <p class="eyebrow">${escapeHtml(category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(displaySummary)}</p>
${hasConfigurator ? '' : `        <div class="price-line">${escapeHtml(priceLabel(product))}</div>`}
${buyInterface(slug, product)}
${product.sisterProduct && PRODUCTS[product.sisterProduct.slug] ? `        <p class="format-alt">${escapeHtml(product.sisterProduct.label || 'Also available as')}: <a href="/products/${escapeHtml(product.sisterProduct.slug)}/">${escapeHtml(product.sisterProduct.name)}</a></p>` : ''}
        <div class="research-note">
          <strong>Research use only.</strong> ${DISCLAIMER}
        </div>
      </div>
    </section>

    <section class="content-grid">
      <div>
        <section class="section-block">
          <h2>Overview</h2>
${lowerDescription.map(p => `          <p>${escapeHtml(p)}</p>`).join('\n')}
        </section>
        ${Array.isArray(product.researchAreas) && product.researchAreas.length ? `<section class="section-block">
          <h2>Research areas</h2>${listItems(product.researchAreas)}
        </section>` : ''}
        ${specsTable(product)}
        ${faqBlock(product)}
      </div>
      <aside class="side-card">
        <p class="eyebrow">Dispatch</p>
        <h2>UK stocked</h2>
        <p>Orders are packed from UK stock and handed to tracked delivery services on business days.</p>
        <a href="/compliance.html">Research-use policy</a>
      </aside>
    </section>
  </main>

  ${basketDrawer()}

${configScript}

  <footer class="footer">
    <a href="/" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <p>&copy; 2026 ${escapeHtml(SITE.name)}. Research use only. Not for human or animal consumption.</p>
  </footer>
</body>
</html>
`;
}

const PRODUCT_CSS = `
    * { box-sizing: border-box; }
    html, body { margin: 0; max-width: 100%; overflow-x: hidden; }
    body { font-family: 'DM Sans', sans-serif; background: #F5F9FC; color: #172033; }
    a { color: inherit; }
    .nav { min-height: 62px; padding: 0 40px; background: #fff; border-bottom: 1px solid #D8E5F2; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
    .logo { font-family: Syne, sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: 0.08em; text-decoration: none; color: #132A46; }
    .logo span { color: #1F6FEB; }
    .nav-links { display: flex; align-items: center; gap: 16px; font-family: 'DM Mono', monospace; font-size: 0.65rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .nav-links a { color: #4B5F75; text-decoration: none; }
    .basket-nav { border: 0; border-radius: 999px; background: #1F6FEB; color: #fff; padding: 9px 13px; font: inherit; cursor: pointer; }
    #basket-count { display: none; align-items: center; justify-content: center; min-width: 18px; height: 18px; margin-left: 5px; border-radius: 999px; background: #fff; color: #1F6FEB; }
    .product-hero { max-width: 1160px; margin: 0 auto; padding: 24px 40px 32px; display: grid; grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr); gap: 34px; align-items: start; }
    .media-card, .buy-card, .side-card { background: #fff; border: 1px solid #D8E5F2; border-radius: 10px; box-shadow: 0 10px 30px rgba(15,31,54,0.06); }
    .media-card { overflow: hidden; }
    .media-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #EDF4FA; }
    .buy-card { padding: 22px; }
    .back-link { display: inline-block; margin-bottom: 12px; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; }
    .eyebrow { margin: 0 0 10px; color: #1F6FEB; font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 600; }
    h1 { margin: 0 0 10px; font-family: Syne, sans-serif; font-size: clamp(2rem, 4vw, 2.8rem); line-height: 1; color: #10233F; }
    h2 { margin: 0 0 12px; font-family: Syne, sans-serif; font-size: 1.35rem; line-height: 1.15; color: #10233F; }
    p { color: #40566C; line-height: 1.75; }
    .summary { margin: 0 0 12px; font-size: 1rem; }
    .price-line { margin: 0 0 18px; font-family: Syne, sans-serif; font-size: 2rem; font-weight: 800; color: #10233F; }
    .variant-list { display: grid; gap: 10px; }
    .variant-row { width: 100%; min-height: 64px; border: 1px solid #CADAEA; border-radius: 8px; background: #FCFDFF; color: #172033; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 14px; text-align: left; cursor: pointer; transition: border-color 0.2s, background 0.2s, transform 0.15s; }
    .variant-row:hover { border-color: #1F6FEB; background: #F5FAFF; transform: translateY(-1px); }
    .variant-row strong { display: block; font-size: 0.92rem; }
    .variant-row small { display: block; margin-top: 2px; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.67rem; }
    .variant-action { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .variant-price { font-family: Syne, sans-serif; font-size: 1.05rem; font-weight: 800; color: #10233F; }
    .variant-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 0 12px; border-radius: 6px; background: #1F6FEB; color: #fff; font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap; }
    .config-box { display: grid; gap: 12px; border: 1px solid #D8E5F2; border-radius: 10px; background: #FCFDFF; padding: 14px; }
    .config-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; border-bottom: 1px solid #E7EFF7; padding-bottom: 10px; }
    .config-head strong { color: #10233F; font-family: Syne, sans-serif; font-size: 1.35rem; line-height: 1; text-align: right; }
    .config-kicker { color: #1F6FEB; font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.13em; text-transform: uppercase; }
    .config-control { display: grid; gap: 7px; }
    .config-control label, .config-label-row label { margin: 0; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
    .config-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .config-label-row span { color: #40566C; font-family: 'DM Mono', monospace; font-size: 0.72rem; }
    .config-size-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; }
    .config-control[hidden], .config-pen-kit[hidden] { display: none; }
    .config-size-btn, .config-format-btn, .config-toggle { min-height: 48px; border: 1px solid #CADAEA; border-radius: 8px; background: #fff; color: #172033; cursor: pointer; transition: border-color 0.2s, background 0.2s, color 0.2s; }
    .config-size-btn, .config-format-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; text-align: left; }
    .config-format-btn { align-items: flex-start; flex-direction: column; }
    .config-size-btn span, .config-format-btn span { font-weight: 800; }
    .config-size-btn small, .config-format-btn small { color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.67rem; }
    .config-size-btn.active, .config-format-btn.active, .config-toggle.active { border-color: #1F6FEB; background: #1F6FEB; color: #fff; }
    .config-size-btn.active small, .config-format-btn.active small { color: rgba(255,255,255,0.78); }
    .config-toggle-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .config-toggle { padding: 0 12px; font-family: 'DM Sans', sans-serif; font-size: 0.86rem; font-weight: 800; text-transform: none; letter-spacing: 0; }
    .config-pen-kit { display: grid; gap: 6px; border: 1px solid #A9DDBF; border-radius: 8px; background: #F0FAF4; padding: 10px 12px; }
    .config-pen-kit-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .config-pen-kit-head span { color: #177245; font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
    .config-pen-kit-head strong { color: #174A34; font-size: 0.82rem; text-align: right; }
    .config-pen-kit-list { display: flex; flex-wrap: wrap; gap: 4px 14px; }
    .config-pen-kit-list span { position: relative; color: #2D5944; padding-left: 15px; font-size: 0.68rem; font-weight: 700; line-height: 1.3; }
    .config-pen-kit-list span::before { position: absolute; left: 0; color: #16824F; content: '\\2713'; font-weight: 800; }
    .config-pen-kit p { margin: 0; color: #3D6854; font-size: 0.7rem; line-height: 1.45; }
    .config-total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid #D8E5F2; border-radius: 9px; background: #fff; padding: 12px; }
    .config-total-row small { display: block; margin-bottom: 4px; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.62rem; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
    .config-total-row strong { display: block; color: #10233F; font-family: Syne, sans-serif; font-size: 1.75rem; line-height: 1; }
    .config-total-row em { color: #40566C; font-size: 0.78rem; font-style: normal; text-align: right; }
    .config-add-btn { width: 100%; min-height: 50px; border: 0; border-radius: 8px; background: #1F6FEB; color: #fff; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 0.74rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; box-shadow: 0 10px 22px rgba(31,111,235,0.18); }
    .config-add-btn:hover { background: #185ABC; }
    .config-sticky-bar { display: none; }
    .format-alt { margin: 12px 0 0; color: #63758A; font-size: 0.8rem; }
    .format-alt a { color: #1F6FEB; font-weight: 700; text-decoration: none; }
    .format-alt a:hover { text-decoration: underline; }
    .research-note { margin-top: 18px; border: 1px solid #D8E5F2; border-radius: 8px; padding: 14px 15px; background: #F5F8FC; color: #4B5F75; font-size: 0.82rem; line-height: 1.65; }
    .research-note strong { color: #172033; }
    .content-grid { max-width: 1160px; margin: 0 auto; padding: 18px 40px 70px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 34px; align-items: start; }
    .section-block { margin-top: 24px; }
    .section-block:first-child { margin-top: 0; }
    .section-block p { margin: 0 0 14px; }
    .plain-list { margin: 0; padding-left: 20px; color: #40566C; line-height: 1.8; }
    .plain-list li { margin-bottom: 8px; }
    .spec-table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #D8E5F2; border-radius: 10px; overflow: hidden; background: #fff; }
    .spec-table th, .spec-table td { padding: 12px 14px; border-bottom: 1px solid #E7EFF7; vertical-align: top; }
    .spec-table tr:last-child th, .spec-table tr:last-child td { border-bottom: 0; }
    .spec-table th { width: 34%; background: #F5F9FC; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.66rem; letter-spacing: 0.06em; text-transform: uppercase; text-align: left; }
    .spec-table td { color: #172033; font-family: 'DM Mono', monospace; font-size: 0.78rem; }
    .faq-item { border-top: 1px solid #D8E5F2; padding: 14px 0; }
    .faq-item summary { cursor: pointer; font-weight: 700; color: #172033; }
    .faq-item p { margin: 8px 0 0; font-size: 0.9rem; }
    .side-card { position: sticky; top: 18px; padding: 22px; }
    .side-card p { margin: 0 0 14px; font-size: 0.9rem; }
    .side-card a { color: #1F6FEB; font-weight: 700; text-decoration: none; }
    .basket-overlay { position: fixed; inset: 0; background: rgba(15,31,54,0.48); z-index: 200; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
    .basket-overlay.active { opacity: 1; pointer-events: auto; }
    .basket-drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 100vw; height: 100vh; background: #fff; z-index: 201; display: flex; flex-direction: column; border-left: 1px solid #D8E5F2; transform: translateX(100%); transition: transform 0.24s ease; }
    .basket-drawer.active { transform: translateX(0); }
    .basket-head { padding: 22px; border-bottom: 1px solid #E7EFF7; display: flex; align-items: center; justify-content: space-between; gap: 14px; }
    .basket-head h2 { margin: 2px 0 0; }
    .basket-close { border: 1px solid #CADAEA; background: #fff; border-radius: 6px; padding: 8px 10px; cursor: pointer; color: #4B5F75; }
    .basket-items { flex: 1; overflow-y: auto; padding: 14px 22px; }
    .basket-empty { text-align: center; margin-top: 36px; color: #8DA0B5; font-family: 'DM Mono', monospace; font-size: 0.78rem; }
    .basket-item { display: flex; align-items: center; gap: 10px; padding: 12px 0; border-bottom: 1px solid #F0F5FA; }
    .basket-item-info { flex: 1; min-width: 0; }
    .basket-item-name { display: block; font-weight: 700; color: #172033; }
    .basket-item-dose { display: block; color: #1F6FEB; font-family: 'DM Mono', monospace; font-size: 0.66rem; }
    .basket-item-controls { display: flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; }
    .basket-item-controls button { width: 24px; height: 24px; border: 1px solid #D8E5F2; border-radius: 4px; background: #F5F9FC; cursor: pointer; }
    .basket-item-price { min-width: 42px; text-align: right; font-weight: 800; color: #172033; }
    .basket-item-remove { border: 0; background: transparent; color: #9CA3AF; cursor: pointer; }
    .basket-ship-note { margin: 12px 0 0; padding: 10px 12px; border-radius: 8px; background: #F5F9FC; border: 1px solid #D8E5F2; font-size: 0.78rem; color: #40566C; text-align: center; }
    .basket-ship-note.unlocked { background: #EAF4FF; border-color: #B9D7F8; color: #1F6FEB; font-weight: 700; }
    .basket-ship-bar { margin-top: 8px; height: 6px; border-radius: 999px; background: #D8E5F2; overflow: hidden; }
    .basket-ship-bar span { display: block; height: 100%; background: #1F6FEB; }
    .basket-footer { padding: 18px 22px 22px; border-top: 1px solid #E7EFF7; }
    .basket-total-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; font-family: 'DM Mono', monospace; }
    .basket-total-row strong { font-family: Syne, sans-serif; font-size: 1.25rem; }
    .checkout-button { width: 100%; min-height: 50px; border: 0; border-radius: 8px; background: #1F6FEB; color: #fff; font-family: 'DM Mono', monospace; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; }
    .footer { border-top: 1px solid #D8E5F2; padding: 26px 40px; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: #63758A; font-size: 0.82rem; }
    .footer p { margin: 0; color: #63758A; }
    @media (max-width: 820px) {
      .nav { padding: 0 16px; }
      .nav-links { gap: 10px; font-size: 0.6rem; }
      .product-hero, .content-grid { grid-template-columns: 1fr; padding-left: 16px; padding-right: 16px; }
      /* Shorter hero on phones: the square crop pushed the whole builder below
         the first screen. 3:2 contain keeps the full product image visible. */
      .media-card img { aspect-ratio: 3 / 2; object-fit: contain; }
      body:has(.config-sticky-bar) { padding-bottom: 84px; }
      .config-sticky-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 120; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); background: #fff; border-top: 1px solid #D8E5F2; box-shadow: 0 -10px 26px rgba(15,31,54,0.10); }
      .config-sticky-bar small { display: block; color: #63758A; font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
      .config-sticky-bar strong { display: block; color: #10233F; font-family: Syne, sans-serif; font-size: 1.3rem; line-height: 1.1; }
      .config-sticky-bar button { flex: 1; max-width: 220px; min-height: 46px; border: 0; border-radius: 8px; background: #1F6FEB; color: #fff; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 0.7rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
      .buy-card { padding: 22px; }
      .variant-row { align-items: stretch; flex-direction: column; }
      .variant-action { width: 100%; justify-content: space-between; }
      .variant-cta { min-width: 132px; }
      .config-box { padding: 14px; }
      .config-head { align-items: flex-start; flex-direction: column; }
      .config-head strong { text-align: left; font-size: 1.2rem; }
      .config-size-grid, .config-toggle-row { grid-template-columns: 1fr 1fr; }
      .config-pen-kit-head { align-items: flex-start; flex-direction: column; }
      .config-pen-kit-head strong { text-align: left; }
      .config-total-row { align-items: flex-start; flex-direction: column; }
      .config-total-row em { text-align: left; }
      .side-card { position: static; }
      .basket-drawer { width: 100vw; }
      .footer { flex-direction: column; align-items: flex-start; padding: 24px 16px; }
    }
    @media (max-width: 540px) {
      .logo { font-size: 0.72rem; }
      .nav-links { gap: 0; }
      .nav-links a { display: none; }
      .basket-nav { padding: 8px 10px; }
    }
`;

const PRODUCT_CONFIG_SCRIPT = `
  <script>
    let configuredFormatIndex = Number(window.NPUK_CONFIG_FORMAT_INDEX || 0);
    let configuredVariantIndex = 0;
    let configuredBacWater = false;

    function configMoney(value) {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2
      }).format(value);
    }

    function configuredFormat() {
      return window.NPUK_CONFIG_FORMATS[configuredFormatIndex];
    }

    function configuredVariant() {
      return configuredFormat().variants[configuredVariantIndex];
    }

    // Mirrors penPremium() in the build template: the £ gap between this pen
    // variant and the same-strength standard vial, or null when no equivalent
    // vial strength exists to compare against.
    function configPenPremium(format, variant) {
      if (format.type !== 'pen') return null;
      const vial = window.NPUK_CONFIG_FORMATS.find(f => f.type === 'vial');
      if (!vial) return null;
      const mg = parseFloat(String(variant.dose));
      if (!Number.isFinite(mg)) return null;
      const match = vial.variants.find(v => parseFloat(String(v.dose)) === mg);
      if (!match) return null;
      const delta = Math.round((variant.price - match.price) * 100) / 100;
      return delta > 0 ? delta : null;
    }

    function configTrack(eventName, payload) {
      if (window.NPUKAnalytics && typeof window.NPUKAnalytics.track === 'function') {
        window.NPUKAnalytics.track(eventName, payload);
      }
    }

    function configContents(format, variant) {
      return [{
        content_id: format.productName + ':' + variant.dose,
        content_name: format.productName,
        content_type: 'product',
        quantity: 1,
        price: Number(variant.price)
      }];
    }

    function sizeButtonMarkup(variant, index) {
      const active = index === configuredVariantIndex;
      return '<button class="config-size-btn' + (active ? ' active' : '') + '" type="button" data-config-index="' + index + '" aria-pressed="' + (active ? 'true' : 'false') + '" onclick="selectConfiguredVariant(' + index + ')">' +
        '<span>' + variant.label + '</span>' +
        '<small>' + configMoney(variant.price) + '</small>' +
        '</button>';
    }

    function refreshConfiguredOrder() {
      const format = configuredFormat();
      const variant = configuredVariant();
      const canAddBacWater = Boolean(format.bacWater);
      if (!canAddBacWater) configuredBacWater = false;
      const total = variant.price + (configuredBacWater ? window.NPUK_CONFIG_ADDON.price : 0);
      const name = document.getElementById('config-selection-name');
      const totalEl = document.getElementById('config-total');
      const note = document.getElementById('config-total-note');
      const sizeGrid = document.getElementById('config-size-grid');
      const bacControl = document.getElementById('config-bac-control');
      const penKit = document.getElementById('config-pen-kit');
      const productImage = document.getElementById('product-image');
      if (name) name.textContent = format.productName + ' ' + variant.dose;
      if (productImage) {
        productImage.setAttribute('src', '/' + format.image);
        productImage.setAttribute('alt', format.productName);
      }
      if (sizeGrid) {
        // Rebuilding the grid destroys the focused button; put keyboard focus
        // back on the active size so arrow/tab users don't fall out to <body>.
        const hadFocus = typeof sizeGrid.contains === 'function'
          && document.activeElement && sizeGrid.contains(document.activeElement);
        sizeGrid.innerHTML = format.variants.map(sizeButtonMarkup).join('');
        if (hadFocus && typeof sizeGrid.querySelector === 'function') {
          const activeSize = sizeGrid.querySelector('.config-size-btn.active');
          if (activeSize && typeof activeSize.focus === 'function') activeSize.focus();
        }
      }
      if (totalEl) totalEl.textContent = configMoney(total);
      const totalBar = document.getElementById('config-total-bar');
      if (totalBar) totalBar.textContent = configMoney(total);
      if (note) {
        if (format.type === 'pen') {
          const premium = configPenPremium(format, variant);
          note.textContent = premium
            ? 'Complete kit included \\u00B7 +' + configMoney(premium) + ' vs vial'
            : 'Complete kit included';
        } else {
          note.textContent = configuredBacWater ? 'Vial + BAC water' : 'Standard vial';
        }
      }
      if (bacControl) bacControl.hidden = !canAddBacWater;
      if (penKit) penKit.hidden = format.type !== 'pen';
      document.querySelectorAll('[data-format-index]').forEach(button => {
        const active = Number(button.dataset.formatIndex) === configuredFormatIndex;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      document.querySelectorAll('[data-config-index]').forEach(button => {
        const active = Number(button.dataset.configIndex) === configuredVariantIndex;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      const yes = document.getElementById('bac-yes');
      const no = document.getElementById('bac-no');
      if (yes && no) {
        yes.classList.toggle('active', configuredBacWater);
        no.classList.toggle('active', !configuredBacWater);
        yes.setAttribute('aria-pressed', configuredBacWater ? 'true' : 'false');
        no.setAttribute('aria-pressed', configuredBacWater ? 'false' : 'true');
      }
    }

    function selectConfiguredFormat(index) {
      configuredFormatIndex = index;
      configuredVariantIndex = 0;
      refreshConfiguredOrder();
      const format = configuredFormat();
      const variant = configuredVariant();
      configTrack('FormatSelected', {
        contents: configContents(format, variant),
        value: Number(variant.price),
        currency: 'GBP'
      });
    }

    function selectConfiguredVariant(index) {
      configuredVariantIndex = index;
      refreshConfiguredOrder();
      const format = configuredFormat();
      const variant = configuredVariant();
      configTrack('SizeSelected', {
        contents: configContents(format, variant),
        value: Number(variant.price),
        currency: 'GBP'
      });
    }

    function setBacWater(included) {
      configuredBacWater = Boolean(included);
      refreshConfiguredOrder();
      configTrack('BacWaterToggled', {
        contents: [{
          content_id: window.NPUK_CONFIG_ADDON.name + ':' + window.NPUK_CONFIG_ADDON.dose,
          content_name: window.NPUK_CONFIG_ADDON.name,
          content_type: 'product',
          quantity: 1,
          price: Number(window.NPUK_CONFIG_ADDON.price)
        }],
        value: configuredBacWater ? Number(window.NPUK_CONFIG_ADDON.price) : 0,
        currency: 'GBP'
      });
    }

    function addConfiguredToBasket() {
      const format = configuredFormat();
      const variant = configuredVariant();
      addToBasket(format.productName, variant.price, variant.dose);
      if (format.bacWater && configuredBacWater) {
        addToBasket(window.NPUK_CONFIG_ADDON.name, window.NPUK_CONFIG_ADDON.price, window.NPUK_CONFIG_ADDON.dose);
      }
      showBasket();
    }

    refreshConfiguredOrder();

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', function () {
        const format = configuredFormat();
        const variant = configuredVariant();
        configTrack('ViewContent', {
          contents: configContents(format, variant),
          value: Number(variant.price),
          currency: 'GBP'
        });
      });
    }
  </script>`;

module.exports = { renderProductPage };
