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
          window.NPUK_CONFIG_ADDON = { name: 'Bacteriostatic Water', dose: '10ml vial', price: 9.99 };
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

// Product shot first, then the certificate as the immediate next swipe. Any
// supporting product image follows it. Report scans use "contain" so the
// document is never cropped.
function mediaThumbs(product) {
  const images = [{ src: product.image, alt: product.name, fit: 'cover' }];
  if (product.coa && product.coa.images[0]) {
    const report = product.coa.images[0];
    images.push({
      src: report.src,
      alt: `${product.coa.compound} independent laboratory report - ${report.label}`,
      fit: 'contain'
    });
  }
  if (product.secondaryImage) {
    images.push({ src: product.secondaryImage, alt: `${product.name} research kit`, fit: 'cover' });
  }
  if (images.length < 2) return '';
  const swipeHint = product.coa
    ? (product.coaScope === 'component'
      ? `Swipe once for the ${product.coa.compound} component report`
      : 'Swipe once for the lab report')
    : 'Swipe image or tap a thumbnail';
  return `        <div class="media-gallery-bar">
          <button type="button" class="media-gallery-button" onclick="stepProductImage(-1)" aria-label="Previous image">&larr;</button>
          <div class="media-gallery-copy">
            <strong id="media-gallery-caption">${escapeHtml(images[0].alt)}</strong>
            <small>${escapeHtml(swipeHint)}</small>
          </div>
          <span class="media-gallery-count" id="media-gallery-count">1 / ${images.length}</span>
          <button type="button" class="media-gallery-button" onclick="stepProductImage(1)" aria-label="Next image">&rarr;</button>
        </div>
        <div class="media-thumbs" aria-label="Product and laboratory report images">
${images.map((img, i) => `          <button type="button" class="media-thumb${i === 0 ? ' active' : ''}${img.fit === 'contain' ? ' is-doc' : ''}" data-index="${i}" data-src="/${escapeHtml(img.src)}" data-fit="${img.fit}" data-alt="${escapeHtml(img.alt)}" onclick="showProductImage(this)" title="${escapeHtml(img.alt)}" aria-label="Show ${escapeHtml(img.alt)}"${i === 0 ? ' aria-current="true"' : ''}>
             <img src="/${escapeHtml(img.src)}" alt="${escapeHtml(img.alt)}" loading="lazy">
          </button>`).join('\n')}
        </div>
        <script>
          function productGalleryButtons() {
            return Array.prototype.slice.call(document.querySelectorAll('.media-thumb'));
          }
          function showProductImage(button) {
            var main = document.getElementById('product-image');
            if (!main || !button) return;
            main.src = button.dataset.src;
            main.alt = button.dataset.alt;
            main.classList.toggle('is-document', button.dataset.fit === 'contain');
            var buttons = productGalleryButtons();
            buttons.forEach(function (t) {
              t.classList.remove('active');
              t.removeAttribute('aria-current');
            });
            button.classList.add('active');
            button.setAttribute('aria-current', 'true');
            var index = buttons.indexOf(button);
            var caption = document.getElementById('media-gallery-caption');
            var count = document.getElementById('media-gallery-count');
            if (caption) caption.textContent = button.dataset.alt;
            if (count) count.textContent = String(index + 1) + ' / ' + String(buttons.length);
            if (button.parentElement) {
              button.parentElement.scrollTo({
                left: button.offsetLeft - (button.parentElement.clientWidth - button.offsetWidth) / 2,
                behavior: 'smooth'
              });
            }
          }
          function stepProductImage(direction) {
            var buttons = productGalleryButtons();
            if (!buttons.length) return;
            var current = buttons.findIndex(function (button) { return button.classList.contains('active'); });
            if (current < 0) current = 0;
            var next = (current + direction + buttons.length) % buttons.length;
            showProductImage(buttons[next]);
          }
          (function initProductImageSwipe() {
            var main = document.getElementById('product-image');
            if (!main || productGalleryButtons().length < 2) return;
            var startX = 0;
            var startY = 0;
            main.addEventListener('touchstart', function (event) {
              var touch = event.changedTouches[0];
              startX = touch.clientX;
              startY = touch.clientY;
            }, { passive: true });
            main.addEventListener('touchend', function (event) {
              var touch = event.changedTouches[0];
              var dx = touch.clientX - startX;
              var dy = touch.clientY - startY;
              if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
                stepProductImage(dx < 0 ? 1 : -1);
              }
            }, { passive: true });
          }());
        </script>`;
}

function coaHeroBadge(product) {
  const coa = product.coa;
  if (!coa) return '';
  const isComponent = product.coaScope === 'component';
  const headline = isComponent
    ? `${coa.compound} component: ${coa.purity} HPLC result`
    : `${coa.purity} purity by independent HPLC`;
  const detail = isComponent
    ? `${coa.compound} was tested standalone, not as the finished blend.`
    : `Report ${coa.orderNumber} is published with the original scan.`;
  return `        <a class="coa-hero-badge" href="${escapeHtml(coa.page)}" target="_blank" rel="noopener noreferrer">
          <span class="coa-hero-mark">Lab report</span>
          <span class="coa-hero-copy">
            <strong>${escapeHtml(headline)}</strong>
            ${escapeHtml(detail)} View report.
          </span>
        </a>`;
}

// Independent laboratory report, where one exists for this product. The report
// images double as the product page's secondary imagery.
function coaBlock(product) {
  const coa = product.coa;
  if (!coa) return '';
  const isComponent = product.coaScope === 'component';
  return `
        <section class="section-block coa-block">
          <h2>Independent laboratory report</h2>
          <p class="coa-lede">A sample of this material was submitted to <a href="${escapeHtml(coa.labUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(coa.lab)}</a>, an independent analytical laboratory in ${escapeHtml(coa.labLocation)}. We did not carry out this analysis ourselves.</p>
${isComponent ? `          <p class="coa-scope">${escapeHtml(product.coaScopeNote)}</p>` : ''}
          <table class="spec-table">
            <tr><th>Purity result</th><td class="coa-result">${escapeHtml(coa.purity)}</td></tr>
            <tr><th>Measured content</th><td>${escapeHtml(coa.content)} (label claim ${escapeHtml(coa.labelClaim)}, error ${escapeHtml(coa.measurementError)})</td></tr>
            <tr><th>Method</th><td>${escapeHtml(coa.method)}</td></tr>
            <tr><th>Laboratory</th><td>${escapeHtml(coa.lab)}, ${escapeHtml(coa.labLocation)}</td></tr>
            <tr><th>Report number</th><td>${escapeHtml(coa.orderNumber)}</td></tr>
            <tr><th>Analysis dates</th><td>${escapeHtml(coa.testStartDate)} to ${escapeHtml(coa.testEndDate)}</td></tr>
          </table>
          <div class="coa-pages">
${coa.images.map(img => `            <a class="coa-page" href="/${escapeHtml(img.src)}" target="_blank" rel="noopener noreferrer">
              <img src="/${escapeHtml(img.src)}" alt="${escapeHtml(coa.compound)} independent laboratory report - ${escapeHtml(img.label)}" loading="lazy">
              <span class="coa-page-cap">${escapeHtml(img.label)}</span>
            </a>`).join('\n')}
          </div>
          <p><a class="coa-link" href="${escapeHtml(coa.page)}" target="_blank" rel="noopener noreferrer">Open full-size report -&gt;</a></p>
          <!--compliance:ignore-start-->
          <p class="coa-caveat">This report describes the sample submitted to the laboratory. It covers identity, purity and content only, and is not a statement of safety, efficacy or suitability for use in humans or animals.</p>
          <!--compliance:ignore-end-->
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
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/np.css">
  <style>${PRODUCT_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>
  <nav class="nav">
    <a href="/" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <div data-site-search></div>
    <div class="nav-links">
      <a href="/#products">Products</a>
      <a href="/lab-reports.html">Lab Reports</a>
      <a href="/blog/index.html">Guides</a>
      <button class="basket-nav" type="button" onclick="showBasket()">Basket <span id="basket-count"></span></button>
    </div>
  </nav>

  <main>
    <section class="product-hero">
      <div class="media-card" aria-label="Product image gallery">
        <img id="product-image" src="/${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="eager" draggable="false">
${mediaThumbs(product)}
      </div>
      <div class="buy-card">
        <a class="back-link" href="/#products">Back to products</a>
        <p class="eyebrow">${escapeHtml(category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(displaySummary)}</p>
${coaHeroBadge(product)}
${hasConfigurator ? '' : `        <div class="price-line">${escapeHtml(priceLabel(product))}</div>`}
${buyInterface(slug, product)}
        <div class="np-trust-strip buy-trust" aria-label="Order assurances">
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>UK stocked</span>
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Tracked delivery</span>
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Research use only</span>
        </div>
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
        ${coaBlock(product)}
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
    /* ==================================================================
       PRODUCT PAGE — North Clinical. Builds on /css/np.css tokens.
       ================================================================== */
    html, body { margin: 0; max-width: 100%; overflow-x: hidden; }
    body { background: var(--frost); }

    /* --- nav: np.css supplies the shell; keep the basket visible on phones --- */
    .nav-links { display: flex; }
    .basket-nav { position: relative; display: inline-flex; align-items: center; gap: 8px; padding: 9px 16px; border-radius: var(--r-pill); background: var(--ink); color: #fff; border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; white-space: nowrap; transition: background 0.18s var(--ease), border-color 0.18s var(--ease); }
    .basket-nav:hover { background: var(--action); border-color: var(--action); }
    #basket-count { display: none; align-items: center; justify-content: center; min-width: 18px; height: 18px; padding: 0 5px; border-radius: var(--r-pill); background: #fff; color: var(--action-deep); font-size: 0.58rem; font-weight: 700; }

    /* --- hero: sticky gallery left, buy column right --- */
    .product-hero { max-width: var(--wrap); margin: 0 auto; padding: 34px 40px 20px; display: grid; grid-template-columns: minmax(300px, 0.88fr) minmax(340px, 1.12fr); gap: 32px; align-items: start; }
    .media-card { position: sticky; top: calc(var(--npbar-h, 36px) + 78px); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-1); }
    #product-image { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: var(--frost-2); }
    #product-image.is-document { object-fit: contain; background: #fff; }
    .media-gallery-bar { display: flex; align-items: center; gap: 10px; min-height: 54px; padding: 9px 12px; border-top: 1px solid var(--line-soft); background: var(--paper); }
    .media-gallery-button { width: 34px; height: 34px; flex-shrink: 0; border: 1px solid var(--line); border-radius: 50%; background: var(--paper); color: var(--ink); cursor: pointer; font-size: 0.85rem; transition: border-color 0.15s, color 0.15s, background 0.15s; }
    .media-gallery-button:hover, .media-gallery-button:focus-visible { border-color: var(--action); color: var(--action); background: var(--action-tint); }
    .media-gallery-copy { flex: 1; min-width: 0; }
    .media-gallery-copy strong { display: block; overflow: hidden; color: var(--ink); font-size: 0.72rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
    .media-gallery-copy small { display: block; margin-top: 2px; color: var(--faint); font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .media-gallery-count { flex-shrink: 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.05em; }
    .media-thumbs { display: flex; gap: 8px; overflow-x: auto; padding: 0 12px 12px; background: var(--paper); scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
    .media-thumb { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; border: 1px solid var(--line); flex-shrink: 0; background: var(--frost-2); cursor: pointer; padding: 0; transition: border-color 0.15s, box-shadow 0.15s; }
    .media-thumb.active { border-color: var(--action); box-shadow: 0 0 0 1px var(--action); }
    .media-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .media-thumb.is-doc img { object-fit: contain; background: #fff; }

    /* --- buy column --- */
    .buy-card { min-width: 0; }
    .back-link { display: inline-block; margin-bottom: 18px; color: var(--muted); font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; transition: color 0.15s; }
    .back-link::before { content: '\\2190\\00a0\\00a0'; }
    .back-link:hover { color: var(--action); }
    .eyebrow { margin: 0 0 12px; color: var(--action); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
    h1 { margin: 0 0 12px; font-family: var(--font-display); font-weight: 600; font-size: clamp(1.9rem, 3.6vw, 2.6rem); line-height: 1.08; letter-spacing: -0.02em; color: var(--ink); }
    h2 { margin: 0 0 14px; font-family: var(--font-display); font-weight: 600; font-size: 1.3rem; line-height: 1.2; letter-spacing: -0.015em; color: var(--ink); }
    p { color: var(--body); line-height: 1.7; }
    .summary { margin: 0 0 18px; font-size: 0.98rem; color: var(--muted); max-width: 56ch; }

    /* verification summary card — green is reserved for exactly this */
    .coa-hero-badge { display: flex; align-items: flex-start; gap: 12px; margin: 0 0 18px; padding: 13px 15px; border: 1px solid rgba(14,159,110,0.32); border-radius: var(--r-ctl); background: var(--verify-tint); text-decoration: none; transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .coa-hero-badge:hover, .coa-hero-badge:focus-visible { border-color: var(--verify); box-shadow: var(--shadow-1); }
    .coa-hero-mark { flex-shrink: 0; margin-top: 2px; padding: 5px 9px; border-radius: 6px; background: var(--verify); color: #fff; font-family: var(--font-mono); font-size: 0.54rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
    .coa-hero-copy { color: var(--body); font-size: 0.78rem; line-height: 1.55; }
    .coa-hero-copy strong { display: block; margin-bottom: 2px; color: var(--ink); font-family: var(--font-display); font-weight: 600; font-size: 0.88rem; }

    .price-line { margin: 0 0 16px; font-family: var(--font-mono); font-size: 1.5rem; font-weight: 500; letter-spacing: 0.02em; color: var(--ink); }

    /* simple variant rows (supplies, single-format products) */
    .variant-list { display: grid; gap: 10px; }
    .variant-row { width: 100%; min-height: 64px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--paper); color: var(--ink); display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 16px; text-align: left; cursor: pointer; box-shadow: var(--shadow-1); transition: border-color 0.18s var(--ease), box-shadow 0.2s var(--ease), transform 0.18s var(--ease); }
    .variant-row:hover { border-color: var(--action); box-shadow: var(--shadow-2); transform: translateY(-1px); }
    .variant-row strong { display: block; font-family: var(--font-display); font-size: 0.95rem; font-weight: 600; }
    .variant-row small { display: block; margin-top: 3px; color: var(--muted); font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em; text-transform: uppercase; }
    .variant-action { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .variant-price { font-family: var(--font-mono); font-size: 0.95rem; font-weight: 500; color: var(--ink); }
    .variant-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 36px; padding: 0 14px; border-radius: 8px; background: var(--action); color: #fff; font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; white-space: nowrap; transition: background 0.18s var(--ease); }
    .variant-row:hover .variant-cta { background: var(--action-deep); }

    /* --- order builder card --- */
    .config-box { display: grid; gap: 16px; border: 1px solid var(--line); border-radius: var(--r-card); background: var(--paper); padding: 20px; box-shadow: var(--shadow-1); }
    .config-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line-soft); padding-bottom: 14px; }
    .config-kicker { color: var(--action); font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; }
    .config-head strong { color: var(--ink); font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; line-height: 1.2; text-align: right; }
    .config-control { display: grid; gap: 8px; }
    .config-control label, .config-label-row label { margin: 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
    .config-label-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
    .config-label-row span { color: var(--ink); font-family: var(--font-mono); font-size: 0.72rem; }
    .config-size-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 8px; }
    .config-control[hidden], .config-pen-kit[hidden] { display: none; }
    .config-size-btn, .config-format-btn, .config-toggle { min-height: 50px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--paper); color: var(--ink); cursor: pointer; transition: border-color 0.15s var(--ease), background 0.15s var(--ease), box-shadow 0.15s var(--ease); }
    .config-size-btn:hover, .config-format-btn:hover, .config-toggle:hover { border-color: var(--action); }
    .config-size-btn, .config-format-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 11px 13px; text-align: left; }
    .config-format-btn { align-items: flex-start; flex-direction: column; gap: 3px; }
    .config-size-btn span, .config-format-btn span { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; }
    .config-size-btn small, .config-format-btn small { color: var(--muted); font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.02em; }
    .config-size-btn.active, .config-format-btn.active, .config-toggle.active { border-color: var(--action); background: var(--action-tint); box-shadow: inset 0 0 0 1px var(--action); }
    .config-size-btn.active span, .config-format-btn.active span { color: var(--action-deep); }
    .config-size-btn.active small, .config-format-btn.active small { color: var(--action-deep); }
    .config-toggle-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .config-toggle { padding: 0 12px; font-family: var(--font-body); font-size: 0.86rem; font-weight: 600; }
    .config-toggle.active { color: var(--action-deep); }
    .config-pen-kit { display: grid; gap: 7px; border: 1px solid var(--line-soft); border-radius: var(--r-ctl); background: var(--frost); padding: 13px 15px; }
    .config-pen-kit-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .config-pen-kit-head span { color: var(--action); font-family: var(--font-mono); font-size: 0.58rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
    .config-pen-kit-head strong { color: var(--ink); font-family: var(--font-display); font-size: 0.84rem; font-weight: 600; text-align: right; }
    .config-pen-kit-list { display: flex; flex-wrap: wrap; gap: 5px 16px; }
    .config-pen-kit-list span { position: relative; color: var(--body); padding-left: 16px; font-size: 0.72rem; font-weight: 500; line-height: 1.4; }
    .config-pen-kit-list span::before { position: absolute; left: 0; color: var(--action); content: '\\2713'; font-weight: 600; }
    .config-pen-kit p { margin: 0; color: var(--muted); font-size: 0.72rem; line-height: 1.5; }
    .config-total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--line-soft); padding-top: 14px; }
    .config-total-row small { display: block; margin-bottom: 3px; color: var(--muted); font-family: var(--font-mono); font-size: 0.6rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
    .config-total-row strong { display: block; color: var(--ink); font-family: var(--font-mono); font-size: 1.55rem; font-weight: 500; line-height: 1.1; letter-spacing: 0.01em; }
    .config-total-row em { color: var(--muted); font-size: 0.78rem; font-style: normal; text-align: right; line-height: 1.5; }
    .config-add-btn { width: 100%; min-height: 52px; border: 1px solid var(--action); border-radius: var(--r-ctl); background: var(--action); color: #fff; cursor: pointer; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; transition: background 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .config-add-btn:hover { background: var(--action-deep); border-color: var(--action-deep); transform: translateY(-1px); box-shadow: var(--shadow-2); }
    .config-sticky-bar { display: none; }

    .buy-trust { margin: 16px 2px 0; gap: 8px 24px; }
    .format-alt { margin: 14px 2px 0; color: var(--muted); font-size: 0.82rem; }
    .format-alt a { color: var(--action); font-weight: 600; text-decoration: none; }
    .format-alt a:hover { color: var(--action-deep); text-decoration: underline; }
    .research-note { margin-top: 18px; border: 1px solid var(--line-soft); border-radius: var(--r-ctl); padding: 14px 16px; background: var(--frost-2); color: var(--muted); font-size: 0.8rem; line-height: 1.65; }
    .research-note strong { color: var(--ink); }

    /* --- lower content: clean white cards --- */
    .content-grid { max-width: var(--wrap); margin: 0 auto; padding: 26px 40px 96px; display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 28px; align-items: start; }
    .section-block { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--shadow-1); padding: 30px 32px; margin-top: 22px; }
    .section-block:first-child { margin-top: 0; }
    .section-block p { margin: 0 0 14px; font-size: 0.95rem; }
    .section-block p:last-child { margin-bottom: 0; }
    .plain-list { margin: 0; padding-left: 20px; color: var(--body); line-height: 1.75; font-size: 0.95rem; }
    .plain-list li { margin-bottom: 8px; }
    .plain-list li::marker { color: var(--action); }
    /* INDEPENDENT LAB REPORT */
    .coa-block .coa-lede { font-size: 0.95rem; line-height: 1.75; margin-bottom: 14px; }
    .coa-block .coa-lede a { color: var(--action); font-weight: 600; }
    .coa-scope { font-size: 0.84rem; color: var(--amber); background: var(--amber-tint); border: 1px solid rgba(180,83,9,0.3); border-radius: var(--r-ctl); padding: 12px 14px; line-height: 1.7; margin-bottom: 14px; }
    .coa-result { font-weight: 500; color: var(--verify); }
    .coa-pages { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-top: 18px; }
    .coa-page { display: block; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #fff; text-decoration: none; transition: border-color 0.2s var(--ease), box-shadow 0.25s var(--ease), transform 0.25s var(--ease); }
    .coa-page:hover { border-color: #BFD3E6; box-shadow: var(--shadow-2); transform: translateY(-2px); }
    .coa-page img { width: 100%; display: block; background: #fff; }
    .coa-page-cap { display: block; padding: 10px 12px; border-top: 1px solid var(--line-soft); font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
    .coa-link { display: inline-block; margin-top: 14px; color: var(--action); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
    .coa-link:hover { color: var(--action-deep); }
    .coa-caveat { margin-top: 14px; font-size: 0.78rem; color: var(--faint); line-height: 1.7; }

    .spec-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .spec-table th, .spec-table td { padding: 12px 14px; border-bottom: 1px solid var(--line-soft); vertical-align: top; text-align: left; }
    .spec-table tr:last-child th, .spec-table tr:last-child td { border-bottom: none; }
    .spec-table th { width: 34%; color: var(--muted); font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
    .spec-table td { color: var(--ink); font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.01em; }
    .faq-item { border-top: 1px solid var(--line-soft); padding: 14px 0; }
    .faq-item:last-child { padding-bottom: 0; }
    .faq-item summary { cursor: pointer; font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; color: var(--ink); }
    .faq-item summary::marker { color: var(--action); }
    .faq-item p { margin: 10px 0 0; font-size: 0.9rem; }
    .side-card { position: sticky; top: calc(var(--npbar-h, 36px) + 78px); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--shadow-1); padding: 26px; }
    .side-card h2 { font-size: 1.15rem; margin-bottom: 10px; }
    .side-card p { margin: 0 0 16px; font-size: 0.88rem; color: var(--muted); }
    .side-card a { display: inline-block; color: var(--action); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; }
    .side-card a:hover { color: var(--action-deep); }

    /* --- basket drawer: np.css styles the suite; page-local pieces only --- */
    .basket-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 20px 24px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
    .basket-head .eyebrow { margin: 0 0 4px; font-size: 0.58rem; }
    .basket-head h2 { margin: 0; font-size: 1.15rem; }
    .basket-close { color: var(--muted); font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1; padding: 9px 13px; border: 1px solid var(--line); border-radius: var(--r-pill); transition: color 0.15s, border-color 0.15s, background 0.15s; }
    .basket-close:hover { color: var(--ink); border-color: var(--muted); background: var(--frost-2); }
    .basket-total-row span { font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
    .basket-total-row strong { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 500; color: var(--ink); }
    .checkout-button { width: 100%; margin-top: 8px; padding: 16px; background: var(--action); border: 1px solid var(--action); color: #fff; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-radius: var(--r-ctl); cursor: pointer; transition: background 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .checkout-button:hover { background: var(--action-deep); border-color: var(--action-deep); transform: translateY(-1px); box-shadow: var(--shadow-2); }

    /* --- footer: ink band from np.css; compact single-row layout --- */
    .footer { display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; padding: 34px 40px; }
    .footer .logo { color: #fff; }
    .footer .logo span { color: var(--sky); }
    .footer p { margin: 0; color: #8FA3BC; font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.05em; line-height: 1.7; }

    @media (max-width: 900px) {
      .product-hero { grid-template-columns: 1fr; padding: 22px 20px 12px; gap: 20px; }
      .media-card { position: static; }
      /* Shorter hero on phones: the square crop pushed the whole builder below
         the first screen. 3:2 contain keeps the full product image visible. */
      #product-image { aspect-ratio: 3 / 2; object-fit: contain; background: #fff; }
      .content-grid { grid-template-columns: 1fr; padding: 8px 20px 84px; }
      .section-block { padding: 24px 20px; }
      .side-card { position: static; }
      body:has(.config-sticky-bar) { padding-bottom: 92px; }
      .config-sticky-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 120; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); background: var(--paper); border-top: 1px solid var(--line); box-shadow: 0 -12px 30px rgba(14,31,56,0.1); }
      .config-sticky-bar small { display: block; color: var(--muted); font-family: var(--font-mono); font-size: 0.56rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
      .config-sticky-bar strong { display: block; color: var(--ink); font-family: var(--font-mono); font-size: 1.2rem; font-weight: 500; line-height: 1.15; }
      .config-sticky-bar button { flex: 1; max-width: 230px; min-height: 46px; border: 0; border-radius: var(--r-ctl); background: var(--action); color: #fff; cursor: pointer; font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; }
      .variant-row { align-items: stretch; flex-direction: column; }
      .variant-action { width: 100%; justify-content: space-between; }
      .variant-cta { min-width: 132px; }
      .config-box { padding: 16px; }
      .config-head { align-items: flex-start; flex-direction: column; gap: 4px; }
      .config-head strong { text-align: left; }
      .config-size-grid, .config-toggle-row { grid-template-columns: 1fr 1fr; }
      .config-pen-kit-head { align-items: flex-start; flex-direction: column; }
      .config-pen-kit-head strong { text-align: left; }
      .config-total-row { align-items: flex-start; flex-direction: column; gap: 6px; }
      .config-total-row em { text-align: left; }
      .footer { flex-direction: column; align-items: flex-start; padding: 28px 20px; }
    }
    @media (max-width: 540px) {
      .logo { font-size: 0.84rem; letter-spacing: 0.05em; }
      .basket-nav { padding: 8px 12px; font-size: 0.6rem; }
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
