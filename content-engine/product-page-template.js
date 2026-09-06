'use strict';

const {
  SITE, PRODUCTS, DELIVERY, escapeHtml, formatGBP, productUrl, productPath, priceFrom, variantPrice, imageSet,
} = require('./site.js');
const { renderFooter, FOOTER_CSS } = require('./footer.js');

const DISCLAIMER =
  'Products are supplied strictly for laboratory and scientific research use only. ' +
  'They are not medicines, are not for human or animal consumption, and no therapeutic claims are made.';

// Dispatch policy, stated once and reused verbatim (en dash, not hyphen).
const DISPATCH_LINE = 'Order before 12pm Mon–Fri and we aim to dispatch the next working day.';
const FREE_FROM = Number(DELIVERY.freeFrom) || 100;

function js(value) {
  return JSON.stringify(String(value));
}

// ---------------------------------------------------------------------------
// Research supplies offered alongside a standard (lyophilised) vial.
// name|dose must be a server CATALOG key; the price is read from the supply's
// own product-data entry so the three price surfaces cannot drift apart.
// ---------------------------------------------------------------------------
const SUPPLY_DEFS = [
  {
    key: 'bac', slug: 'bacteriostatic-water', name: 'Bacteriostatic Water', dose: '3ml vial', fallback: 4,
    label: 'BAC water', short: 'bacteriostatic water',
    title: 'Bacteriostatic water · 3ml', sub: 'Sealed vial, 0.9% benzyl alcohol. Reconstitutes one vial.',
  },
  {
    key: 'needles', slug: 'syringe-kit', name: 'Insulin Needle Pack', dose: '10 pack, 1ml insulin needles', fallback: 7,
    label: 'needles', short: 'insulin needles',
    title: 'Insulin needle pack · 10', sub: '1ml, 31G, sealed. For reconstitution and transfer.',
  },
  {
    key: 'wipes', slug: 'alcohol-wipes', name: 'Alcohol Wipes', dose: '10 pack', fallback: 3,
    label: 'wipes', short: 'alcohol wipes',
    title: 'Alcohol wipes · 10', sub: 'Single-use, for vial stoppers and work surfaces.',
  },
  {
    key: 'intranasal', slug: 'intranasal-research-kit', name: 'Intranasal Research Kit',
    dose: '10ml nasal spray + saline + syringe + adaptor + wipes + label', fallback: 7,
    label: 'intranasal kit', short: 'an intranasal research kit',
    title: 'Intranasal research kit', sub: '10ml spray bottle, sterile saline, transfer syringe, adaptor, wipes and label.',
  },
];
const DEFAULT_SUPPLY_KEYS = ['bac', 'needles', 'wipes'];

function supplyPrice(def) {
  const price = variantPrice(def.slug, def.dose);
  return Number.isFinite(price) ? price : def.fallback;
}

function supplyImage(def) {
  const p = PRODUCTS[def.slug];
  return imageSet(p && p.image ? p.image : 'logo.png');
}

function supplyList(keys) {
  return keys
    .map(key => SUPPLY_DEFS.find(def => def.key === key))
    .filter(Boolean)
    .map(def => ({ ...def, price: supplyPrice(def), image: supplyImage(def) }));
}

function bacWaterAddon() {
  const def = SUPPLY_DEFS.find(d => d.key === 'bac');
  return { name: def.name, dose: def.dose, price: supplyPrice(def) };
}

function penTipsOffer() {
  const price = variantPrice('pen-tips', '6mm x10');
  return { name: 'Sterile Disposable Pen Tips', dose: '6mm x10', price: Number.isFinite(price) ? price : 4.99 };
}

function supportsBacWaterAddon(product) {
  if (product.supply) return false;
  if (/pen vial/i.test(product.name)) return false;
  const specs = Array.isArray(product.specs) ? product.specs : [];
  return specs.some(([label, value]) =>
    /form/i.test(String(label)) && /lyophilised powder/i.test(String(value))
  );
}

// Which supplies a product's builder offers. Data-driven via an optional
// `supplies: ['bac', 'intranasal']` array on the product; otherwise every
// lyophilised vial gets water, needles and wipes.
function supplyKeysFor(product) {
  if (!supportsBacWaterAddon(product)) return [];
  if (Array.isArray(product.supplies) && product.supplies.length) {
    const known = product.supplies.map(String).filter(key => SUPPLY_DEFS.some(def => def.key === key));
    if (known.length) return known;
  }
  return DEFAULT_SUPPLY_KEYS.slice();
}

function joinList(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function formatType(product) {
  return /pen vial/i.test(product.name) ? 'pen' : 'vial';
}

function formatLabel(type) {
  return type === 'pen' ? 'Pen vial' : 'Vial';
}

function formatMeta(type) {
  return type === 'pen' ? 'Pre-filled · pen, tips & wipes included' : 'Lyophilised · you reconstitute';
}

function doseMg(dose) {
  const m = String(dose).match(/^([\d.]+)\s*mg/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function numberWord(n) {
  return NUMBER_WORDS[n] || String(n);
}

// Per-mg price and "less than N x smaller" notes for multi-size products,
// computed from the dose strings so nothing is hand-maintained.
function annotateVariants(variants) {
  const mgs = variants.map(v => doseMg(v.dose));
  if (variants.length < 2 || mgs.some(mg => !mg)) {
    return variants.map(v => ({ ...v }));
  }
  let smallestIndex = 0;
  mgs.forEach((mg, i) => { if (mg < mgs[smallestIndex]) smallestIndex = i; });
  const smallest = variants[smallestIndex];
  const smallestMg = mgs[smallestIndex];
  return variants.map((v, i) => {
    const out = { ...v, unit: `£${(Number(v.price) / mgs[i]).toFixed(2)}/mg` };
    const multiple = mgs[i] / smallestMg;
    if (i !== smallestIndex && Number.isInteger(multiple) && multiple >= 2) {
      const equivalent = Number(smallest.price) * multiple;
      const saving = Math.round((equivalent - Number(v.price)) * 100) / 100;
      if (saving > 0) out.note = `${formatGBP(saving)} less than ${numberWord(multiple)} ${smallest.dose}`;
    }
    return out;
  });
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

function heroAlt(product) {
  if (product.supply) return `${product.name} — research supply, UK stocked`;
  if (formatType(product) === 'pen') return `${product.name} pre-filled disposable research pen vial kit`;
  const dose = product.variants && product.variants[0] ? ` ${product.variants[0].dose}` : '';
  return `${product.name}${dose} research peptide vial, UK stocked`;
}

function formatEntry(slug, product) {
  const type = formatType(product);
  const variants = annotateVariants(product.variants.map(variant => ({
    label: String(variant.label || variant.dose),
    dose: String(variant.dose),
    price: Number(variant.price),
  })));
  return {
    slug,
    type,
    productName: product.name,
    label: formatLabel(type),
    meta: formatMeta(type),
    image: imageSet(product.image).full,
    bacWater: supportsBacWaterAddon(product),
    supplies: supplyKeysFor(product),
    variants,
  };
}

function configuredFormats(slug, product) {
  const formats = [formatEntry(slug, product)];
  if (product.sisterProduct && PRODUCTS[product.sisterProduct.slug]) {
    formats.push(formatEntry(product.sisterProduct.slug, PRODUCTS[product.sisterProduct.slug]));
  }
  return formats.sort((a, b) => {
    if (a.type === b.type) return 0;
    return a.type === 'vial' ? -1 : 1;
  });
}

function fromPrice(format) {
  return Math.min(...format.variants.map(v => Number(v.price)));
}

// ---------------------------------------------------------------------------
// Simple variant rows (supplies and single-format products)
// ---------------------------------------------------------------------------
function packCount(dose) {
  const m = String(dose).match(/x\s*(\d+)\s*$/i) || String(dose).match(/^(\d+)\s*pack/i);
  const n = m ? Number(m[1]) : NaN;
  return Number.isFinite(n) && n >= 2 ? n : null;
}

function variantButtons(product) {
  const counts = product.variants.map(v => packCount(v.dose));
  const perUnit = product.variants.map((v, i) => (counts[i] ? Number(v.price) / counts[i] : null));
  const comparable = perUnit.filter(x => x !== null);
  const bestIndex = comparable.length >= 2
    ? perUnit.indexOf(Math.min(...comparable))
    : -1;
  const unitNoun = /tip/i.test(product.name) ? 'per tip' : (/needle/i.test(product.name) ? 'per needle' : 'each');
  return product.variants.map((variant, i) => {
    const aria = `Add ${product.name} ${variant.dose} to basket`;
    const unit = perUnit[i] !== null ? ` · ${formatGBP(Math.round(perUnit[i] * 100) / 100)} ${unitNoun}` : '';
    const chip = i === bestIndex ? '<span class="np-chip np-chip-action variant-chip">Best value</span>' : '';
    return `
          <button class="variant-row" type="button" aria-label="${escapeHtml(aria)}" onclick='addToBasket(${js(product.name)}, ${Number(variant.price)}, ${js(variant.dose)})'>
            <span>
              <strong>${escapeHtml(variant.label || variant.dose)}${chip}</strong>
              <small>${escapeHtml(variant.dose)}${escapeHtml(unit)}</small>
            </span>
            <span class="variant-action">
              <span class="variant-price">${escapeHtml(formatGBP(Number(variant.price)))}</span>
              <span class="variant-cta">Add to Basket</span>
            </span>
          </button>`;
  }).join('');
}

// ---------------------------------------------------------------------------
// Order builder (paired vial/pen products and any lyophilised vial)
// ---------------------------------------------------------------------------
function sizeExtras(variant) {
  return `${variant.unit ? `<em class="config-size-unit">${escapeHtml(variant.unit)}</em>` : ''}${variant.note ? `<em class="config-size-note">${escapeHtml(variant.note)}</em>` : ''}`;
}

function configuredVariantButtons(variants) {
  return variants.map((variant, index) => {
    const selected = index === 0;
    return `
          <button class="config-size-btn${selected ? ' active' : ''}" type="button" data-config-index="${index}" aria-pressed="${selected ? 'true' : 'false'}" onclick="selectConfiguredVariant(${index})">
            <span>${escapeHtml(variant.label || variant.dose)}</span>
            <small>${escapeHtml(formatGBP(Number(variant.price)))}</small>${sizeExtras(variant)}
          </button>`;
  }).join('');
}

function configuredFormatButtons(formats, activeIndex) {
  if (formats.length < 2) return '';
  return `
          <div class="config-control">
            <span class="config-label" id="format-label">Format</span>
            <div class="config-toggle-row config-format-row" role="group" aria-label="Choose product format">
${formats.map((format, index) => `
              <button class="config-format-btn${index === activeIndex ? ' active' : ''}" type="button" data-format-index="${index}" aria-pressed="${index === activeIndex ? 'true' : 'false'}" onclick="selectConfiguredFormat(${index})">
                <span>${escapeHtml(format.label)}</span>
                <small>${escapeHtml(format.meta)} · from ${escapeHtml(formatGBP(fromPrice(format)))}</small>
              </button>`).join('')}
            </div>
          </div>`;
}

function suppliesModule(supplies, hidden) {
  if (!supplies.length) return '';
  const intranasal = supplies.some(s => s.key === 'intranasal');
  const heading = intranasal ? 'Preparation supplies' : 'Reconstitution supplies';
  const shorts = supplies.map(s => s.short);
  const explain = `A standard vial arrives as lyophilised powder. ${joinList(shorts).replace(/^./, c => c.toUpperCase())} ${shorts.length > 1 ? 'are' : 'is'} needed to prepare it in the laboratory. Nothing is added unless you tick it.`;
  return `
          <div class="config-supplies" id="config-supplies" role="group" aria-labelledby="supplies-label"${hidden ? ' hidden' : ''}>
            <div class="config-supplies-head">
              <span class="config-kicker" id="supplies-label">${escapeHtml(heading)}</span>
              <strong>If you do not have these, you need them.</strong>
              <p><strong>Are you sure you have these? Select them.</strong> ${escapeHtml(explain)}</p>
            </div>
${supplies.map(s => `            <button class="supply-opt" type="button" id="supply-${s.key}" aria-pressed="false" onclick="toggleSupply('${s.key}')">
              <span class="supply-check" aria-hidden="true"></span>
              <img src="/${escapeHtml(s.image.thumb)}" alt="" width="52" height="52" loading="lazy" decoding="async">
              <span class="supply-copy"><strong>${escapeHtml(s.title)}</strong><small>${escapeHtml(s.sub)}</small></span>
              <span class="supply-price">+${escapeHtml(formatGBP(s.price))}</span>
            </button>`).join('\n')}
          </div>`;
}

function penKitPanel(hidden) {
  const bundle = supplyList(DEFAULT_SUPPLY_KEYS).reduce((sum, s) => sum + s.price, 0);
  return `
          <div class="config-pen-kit" id="config-pen-kit"${hidden ? '' : ' hidden'}>
            <div class="config-pen-kit-head">
              <span>Everything included</span>
              <strong>Complete disposable pen kit</strong>
            </div>
            <div class="config-pen-kit-list">
              <span>Pre-filled disposable research pen</span>
              <span>Sterile disposable needle tips (pen tips)</span>
              <span>Alcohol wipes</span>
            </div>
            <p>No reconstitution supplies needed. Bought separately for a standard vial, water, needles and wipes come to ${escapeHtml(formatGBP(Math.round(bundle * 100) / 100))}.</p>
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
  const vialFormat = formats.find(f => f.bacWater) || null;
  const supplies = vialFormat ? supplyList(vialFormat.supplies) : [];
  const addon = bacWaterAddon();
  const tips = penTipsOffer();
  const firstVariant = activeFormat.variants[0];

  return `
        <section class="config-box" aria-label="${escapeHtml(product.name)} order builder">
          <div class="config-head">
            <span class="config-kicker">Build your order</span>
            <strong id="config-selection-name">${escapeHtml(activeFormat.productName)} ${escapeHtml(firstVariant.dose)}</strong>
          </div>
${configuredFormatButtons(formats, activeFormatIndex)}
          <div class="config-control">
            <span class="config-label" id="size-label">Size</span>
            <div class="config-size-grid" id="config-size-grid" role="group" aria-labelledby="size-label">
${configuredVariantButtons(activeFormat.variants)}
            </div>
          </div>
${penKitPanel(activeFormat.type === 'pen')}
${suppliesModule(supplies, !activeFormat.bacWater)}
          <div class="config-total-row" aria-live="polite" aria-atomic="true">
            <span>
              <small>Order total</small>
              <strong id="config-total">${escapeHtml(formatGBP(Number(firstVariant.price)))}</strong>
            </span>
            <em id="config-total-note">${escapeHtml(totalNote(formats, activeFormat, firstVariant, false))}</em>
          </div>
          <p class="config-ship-line" id="config-ship-line" role="status" aria-live="polite">${Number(firstVariant.price) >= FREE_FROM ? 'Free UK delivery unlocked at this total' : `Add ${escapeHtml(formatGBP(Math.round((FREE_FROM - Number(firstVariant.price)) * 100) / 100))} more for free UK delivery · free from ${escapeHtml(formatGBP(FREE_FROM))}`}</p>
          <button class="config-add-btn" type="button" onclick="addConfiguredToBasket()">Add to Basket</button>
        </section>
        <div class="config-sticky-bar" id="config-sticky-bar" aria-hidden="true">
          <span>
            <small id="config-sticky-name">${escapeHtml(activeFormat.productName)} ${escapeHtml(firstVariant.dose)}</small>
            <strong id="config-total-bar">${escapeHtml(formatGBP(Number(firstVariant.price)))}</strong>
          </span>
          <button type="button" tabindex="-1" onclick="addConfiguredToBasket()">Add to Basket</button>
        </div>
        <script>
          window.NPUK_CONFIG_FORMAT_INDEX = ${activeFormatIndex};
          window.NPUK_CONFIG_FORMATS = ${JSON.stringify(formats)};
          window.NPUK_CONFIG_ADDON = { name: '${addon.name}', dose: '${addon.dose}', price: ${addon.price} };
          window.NPUK_CONFIG_SUPPLIES = ${JSON.stringify(supplies.map(({ key, name, dose, price, label }) => ({ key, name, dose, price, label })))};
          window.NPUK_PEN_TIPS_OFFER = { name: '${tips.name}', dose: '${tips.dose}', price: ${tips.price} };
          window.NPUK_FREE_DELIVERY_FROM = ${FREE_FROM};
        </script>`;
}

// Bottom sheet offered after a pen-vial add. Only rendered on pages that can
// sell a pen format; the behaviour script degrades to plain showBasket() when
// the element is absent.
function penTipsSheet(formats) {
  if (!formats.some(f => f.type === 'pen')) return '';
  const tips = penTipsOffer();
  const img = imageSet((PRODUCTS['pen-tips'] && PRODUCTS['pen-tips'].image) || 'research-pen-tips.png');
  const price = formatGBP(tips.price);
  return `
  <div class="np-sheet" id="np-pen-tips-sheet" role="dialog" aria-modal="true" aria-labelledby="np-sheet-title" hidden>
    <div class="np-sheet-backdrop" onclick="closePenTipsSheet(true)"></div>
    <div class="np-sheet-panel">
      <span class="config-kicker">Added to basket</span>
      <h2 id="np-sheet-title">Would you like to add 10 disposable pen tips for ${escapeHtml(price)}?</h2>
      <div class="np-sheet-row">
        <img src="/${escapeHtml(img.thumb)}" alt="" width="72" height="72" loading="lazy" decoding="async">
        <p>Your pen kit already includes sterile pen tips. This is a spare pack of 10 sterile disposable pen tips (6mm) that fit the disposable research pen supplied with your order — under 50p per tip.</p>
      </div>
      <button class="np-sheet-primary" type="button" onclick="acceptPenTips()">Add 10 tips · ${escapeHtml(price)}</button>
      <button class="np-sheet-secondary" type="button" onclick="closePenTipsSheet(true)">No thanks, continue</button>
    </div>
  </div>`;
}

// ---------------------------------------------------------------------------
// Lower content blocks
// ---------------------------------------------------------------------------
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

function detailsBlock(product) {
  if (!Array.isArray(product.details) || !product.details.length) return '';
  return `
        <section class="section-block">
          <h2>${product.supply ? 'What’s in the pack' : 'At a glance'}</h2>${listItems(product.details)}
        </section>`;
}

function storageBlock(product) {
  const storage = Array.isArray(product.storage) ? product.storage.join(' ') : product.storage;
  if (typeof storage !== 'string' || !storage.trim()) return '';
  return `
        <section class="section-block">
          <h2>Storage and handling</h2>
          <p>${escapeHtml(storage)}</p>
        </section>`;
}

function trustBlock(product) {
  const items = product.trust && Array.isArray(product.trust.items) ? product.trust.items : [];
  if (!items.length) return '';
  return `
        <section class="section-block">
          <h2>Details</h2>
          <table class="spec-table">
${items.map(([label, value]) => `            <tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('\n')}
          </table>
        </section>`;
}

function guidesBlock(guides) {
  if (!Array.isArray(guides) || !guides.length) return '';
  return `
        <section class="section-block">
          <h2>Research guides</h2>
          <ul class="guide-list">
${guides.slice(0, 4).map(g => `            <li><a href="/blog/${escapeHtml(g.slug)}.html">${escapeHtml(g.title)}</a><span>${escapeHtml([g.category, g.readingTime].filter(Boolean).join(' · '))}</span></li>`).join('\n')}
          </ul>
        </section>`;
}

function specValue(product, label) {
  const specs = Array.isArray(product.specs) ? product.specs : [];
  const row = specs.find(([key]) => new RegExp(`^${label}$`, 'i').test(String(key)));
  return row ? String(row[1]) : '';
}

// Pen pages: a real comparison instead of the vial's research-areas list,
// so the two pages of a pair stop being near-duplicates.
function penComparisonBlock(slug, product) {
  const sisterSlug = product.sisterProduct && product.sisterProduct.slug;
  const vial = sisterSlug ? PRODUCTS[sisterSlug] : null;
  if (!vial) return '';
  const formats = configuredFormats(slug, product);
  const penFormat = formats.find(f => f.type === 'pen');
  const vialFormat = formats.find(f => f.type === 'vial');
  const premium = penFormat && vialFormat ? penPremium(formats, penFormat, penFormat.variants[0]) : null;
  const penVolume = (String(product.variants[0].dose).match(/\/\s*([\d.]+\s*ml)/i) || [])[1] || '3ml';
  const rows = [
    ['Form', specValue(vial, 'Form') || 'Lyophilised powder', specValue(product, 'Form') || 'Pre-reconstituted liquid'],
    ['Volume', 'Powder; volume set at reconstitution', `${penVolume} pre-filled`],
    ['What’s included', 'Vial only', 'Disposable pen, sterile pen tips and alcohol wipes'],
    ['Preparation', 'Reconstitute with bacteriostatic water', 'No reconstitution required'],
    ['Storage', specValue(vial, 'Storage') || 'Frozen until dispatch', specValue(product, 'Storage') || '2–8°C once reconstituted'],
    ['Price', `from ${formatGBP(priceFrom(sisterSlug))}`, `from ${formatGBP(priceFrom(slug))}${premium ? ` (+${formatGBP(premium)} vs the same-strength vial)` : ''}`],
  ];
  return `
        <section class="section-block">
          <h2>Standard vial vs pen vial</h2>
          <p>For the compound background and research areas see the <a href="${productPath(sisterSlug)}">${escapeHtml(vial.name)} standard vial page</a>. The pen vial contains the same material, supplied pre-reconstituted as a complete kit.</p>
          <div class="table-scroll">
            <table class="spec-table compare-formats">
              <tr><th scope="col">Format</th><th scope="col">Standard vial</th><th scope="col">Pen vial</th></tr>
${rows.map(([label, a, b]) => `              <tr><th scope="row">${escapeHtml(label)}</th><td>${escapeHtml(a)}</td><td>${escapeHtml(b)}</td></tr>`).join('\n')}
            </table>
          </div>
        </section>`;
}

// Product shot first, then the certificate as the immediate next swipe. Any
// supporting product image follows it. Report scans use "contain" so the
// document is never cropped.
function mediaThumbs(product) {
  const hero = imageSet(product.image);
  const images = [{ src: hero.full, thumb: hero.thumb, alt: heroAlt(product), fit: 'cover' }];
  if (product.coa && product.coa.images[0]) {
    const report = product.coa.images[0];
    images.push({
      src: report.src,
      thumb: report.src,
      alt: `${product.coa.compound} independent laboratory report - ${report.label}`,
      fit: 'contain'
    });
  }
  if (product.secondaryImage) {
    const secondary = imageSet(product.secondaryImage);
    images.push({ src: secondary.full, thumb: secondary.thumb, alt: `${product.name} research kit`, fit: 'cover' });
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
             <img src="/${escapeHtml(img.thumb)}" alt="${escapeHtml(img.alt)}" width="56" height="56" loading="lazy" decoding="async">
          </button>`).join('\n')}
        </div>
        <script>
          function productGalleryButtons() {
            return Array.prototype.slice.call(document.querySelectorAll('.media-thumb'));
          }
          function showProductImage(button) {
            var main = document.getElementById('product-image');
            if (!main || !button) return;
            main.removeAttribute('srcset');
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

// Neutral documentation line for compounds without a published report, so the
// buy column keeps the same rhythm page to page. Never green: that colour is
// reserved for actual verification.
function documentationLine(product) {
  if (product.coa || product.supply) return '';
  return `        <p class="doc-line">Supplier documentation available on request. Independent reports are published where held &mdash; <a href="/lab-reports.html">see current lab reports</a>.</p>`;
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
              <img src="/${escapeHtml(img.src)}" alt="${escapeHtml(coa.compound)} independent laboratory report - ${escapeHtml(img.label)}" width="794" height="1122" loading="lazy" decoding="async">
              <span class="coa-page-cap">${escapeHtml(img.label)}</span>
            </a>`).join('\n')}
          </div>
          <p><a class="coa-link" href="${escapeHtml(coa.page)}" target="_blank" rel="noopener noreferrer">Open full-size report &rarr;</a></p>
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

// ---------------------------------------------------------------------------
// Structured data
// ---------------------------------------------------------------------------
function skuFor(slug, dose) {
  const suffix = String(dose).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `NPUK-${slug}-${suffix}`.toUpperCase();
}

function shippingDetails() {
  const region = { '@type': 'DefinedRegion', addressCountry: 'GB' };
  return [
    {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: String(DELIVERY.standard.price), currency: 'GBP' },
      shippingDestination: region,
      deliveryTime: {
        '@type': 'ShippingDeliveryTime',
        handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
        transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 3, unitCode: 'DAY' },
      },
    },
    {
      '@type': 'OfferShippingDetails',
      shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'GBP' },
      shippingDestination: region,
      description: `Free UK delivery on orders of £${FREE_FROM} or more`,
    },
  ];
}

function returnPolicy() {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'GB',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 14,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/ReturnShippingFees',
    merchantReturnLink: `${SITE.base}/refunds.html`,
  };
}

function jsonLd(slug, product) {
  const url = productUrl(slug);
  const img = imageSet(product.image);
  const images = [`${SITE.base}/${img.full}`];
  if (img.og !== img.full) images.push(`${SITE.base}/${img.og}`);
  const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;
  const seller = { '@id': `${SITE.base}/#org` };
  const shipping = shippingDetails();
  const returns = returnPolicy();
  const offerList = product.variants.map(variant => ({
    '@type': 'Offer',
    name: `${product.name} ${variant.dose}`,
    sku: skuFor(slug, variant.dose),
    price: String(variant.price),
    priceCurrency: 'GBP',
    priceValidUntil,
    availability: 'https://schema.org/InStock',
    itemCondition: 'https://schema.org/NewCondition',
    url: `${url}#${skuFor(slug, variant.dose)}`,
    seller,
    shippingDetails: shipping,
    hasMerchantReturnPolicy: returns,
  }));
  const prices = product.variants.map(v => Number(v.price));
  const offers = offerList.length > 1
    ? {
      '@type': 'AggregateOffer',
      lowPrice: String(Math.min(...prices)),
      highPrice: String(Math.max(...prices)),
      offerCount: offerList.length,
      priceCurrency: 'GBP',
      offers: offerList,
    }
    : offerList[0];

  const productNode = {
    '@type': 'Product',
    '@id': `${url}#product`,
    name: product.name,
    sku: skuFor(slug, product.variants[0].dose),
    description: Array.isArray(product.longDescription) && product.longDescription.length
      ? product.longDescription.join(' ')
      : product.summary,
    image: images,
    url,
    category: product.category,
    brand: { '@type': 'Brand', name: SITE.name },
    offers,
  };
  const cas = specValue(product, 'CAS number');
  if (cas) {
    productNode.additionalProperty = [{ '@type': 'PropertyValue', name: 'CAS number', value: cas }];
  }

  const graph = [productNode];

  const sisterSlug = product.sisterProduct && PRODUCTS[product.sisterProduct.slug] ? product.sisterProduct.slug : null;
  if (sisterSlug) {
    const vialSlug = formatType(product) === 'vial' ? slug : sisterSlug;
    const penSlug = vialSlug === slug ? sisterSlug : slug;
    const groupId = `${productUrl(vialSlug)}#group`;
    productNode.isVariantOf = { '@id': groupId };
    graph.push({
      '@type': 'ProductGroup',
      '@id': groupId,
      name: PRODUCTS[vialSlug].name,
      productGroupID: vialSlug,
      url: productUrl(vialSlug),
      brand: { '@type': 'Brand', name: SITE.name },
      variesBy: 'format',
      hasVariant: [
        { '@id': `${productUrl(vialSlug)}#product` },
        { '@id': `${productUrl(penSlug)}#product` },
      ],
    });
  }

  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.base}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE.base}/products/` },
      { '@type': 'ListItem', position: 3, name: product.name, item: url },
    ],
  });

  const faqs = product.seo && Array.isArray(product.seo.faq) ? product.seo.faq : [];
  if (faqs.length && formatType(product) !== 'pen') {
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

// ---------------------------------------------------------------------------
// Shared chrome
// ---------------------------------------------------------------------------
function basketDrawer() {
  return `
  <div class="basket-overlay" id="basket-overlay" onclick="hideBasket()"></div>
  <div class="basket-drawer" id="basket-drawer" role="dialog" aria-modal="true" aria-labelledby="basket-title">
    <div class="basket-head">
      <div>
        <span class="eyebrow">Basket</span>
        <h2 id="basket-title">Your order</h2>
      </div>
      <button class="basket-close" type="button" aria-label="Close basket" onclick="hideBasket()">Close</button>
    </div>
    <div class="basket-items" id="basket-items"><p class="basket-empty">Your basket is empty.</p></div>
    <div class="basket-footer" aria-live="polite" aria-atomic="true">
      <div class="basket-total-row"><span>Total</span><strong id="basket-total">&pound;0</strong></div>
      <button class="checkout-button" type="button" onclick="goToCheckout()">Checkout</button>
    </div>
  </div>`;
}

function siteNav(active) {
  const link = (href, label, key) => `      <a href="${href}"${active === key ? ' class="active" aria-current="page"' : ''}>${label}</a>`;
  return `  <nav class="nav" aria-label="Primary navigation">
    <a href="/" class="logo">NORTH<span>PEPTIDES</span>UK</a>
    <div data-site-search></div>
    <div class="nav-links">
${link('/products/', 'Products', 'products')}
${link('/lab-reports.html', 'Lab Reports', 'lab')}
${link('/why-us.html', 'Why Us', 'why')}
${link('/blog/index.html', 'Guides', 'guides')}
      <button class="basket-nav" type="button" onclick="showBasket()">Basket <span id="basket-count"></span></button>
    </div>
  </nav>`;
}

function headCommon() {
  return `  <link rel="icon" type="image/png" href="/logo.png">
  <link rel="apple-touch-icon" href="/logo.png">
  <script src="/site-config.js" defer></script>
  <script src="/tiktok-analytics.js" defer></script>
  <script src="/age-gate.js"></script>
  <script src="/dispatch-bar.js"></script>
  <script src="/basket.js" defer></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&family=Syne:wght@800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/np.css">`;
}

function sideCard(slug, product) {
  const compound = !product.supply;
  const lyophilised = supportsBacWaterAddon(product);
  const keys = supplyKeysFor(product);
  const setup = [];
  if (compound) {
    const link = (target, label, price) => `            <li><a href="${productPath(target)}">${escapeHtml(label)}</a><span>${escapeHtml(price)}</span></li>`;
    const from = target => `${PRODUCTS[target].variants.length > 1 ? 'from ' : ''}${formatGBP(priceFrom(target))}`;
    const isPen = formatType(product) === 'pen';
    if (isPen && PRODUCTS['pen-tips']) setup.push(link('pen-tips', 'Spare pen tips', from('pen-tips')));
    if (PRODUCTS['bacteriostatic-water']) setup.push(link('bacteriostatic-water', 'Bacteriostatic water', from('bacteriostatic-water')));
    if (keys.includes('intranasal') && PRODUCTS['intranasal-research-kit']) setup.push(link('intranasal-research-kit', 'Intranasal research kit', from('intranasal-research-kit')));
    if (PRODUCTS['syringe-kit']) setup.push(link('syringe-kit', 'Insulin needle pack', from('syringe-kit')));
    if (PRODUCTS['alcohol-wipes']) setup.push(link('alcohol-wipes', 'Alcohol wipes', from('alcohol-wipes')));
    if (!isPen && PRODUCTS['pen-tips']) setup.push(link('pen-tips', 'Spare pen tips', from('pen-tips')));
  }
  const guides = [];
  if (compound && lyophilised) guides.push('            <li><a href="/blog/how-to-reconstitute-peptides.html">How to reconstitute peptides</a></li>');
  if (compound) guides.push('            <li><a href="/blog/how-to-store-peptides.html">How to store peptides</a></li>');
  return `      <aside class="side-card">
        <p class="eyebrow">Delivery</p>
        <h2>Dispatch &amp; delivery</h2>
        <p>${escapeHtml(DISPATCH_LINE)} Packed from UK stock and handed to Royal Mail or DHL on business days.</p>
        <table class="spec-table side-table">
          <tr><th>Tracked 48</th><td>${escapeHtml(formatGBP(DELIVERY.standard.price))} &middot; free over ${escapeHtml(formatGBP(FREE_FROM))}</td></tr>
          <tr><th>Tracked 24</th><td>${escapeHtml(formatGBP(DELIVERY.tracked24.price))} &middot; ${escapeHtml(formatGBP(DELIVERY.tracked24.freeOrderPrice))} on £100+ orders</td></tr>
          <tr><th>DHL Express</th><td>${escapeHtml(formatGBP(DELIVERY.dhl.price))} &middot; next working day</td></tr>
          <tr><th>Dispatch</th><td>Order by 12pm Mon&ndash;Fri for next working day</td></tr>
          <tr><th>Packed</th><td>Sealed, discreet, from UK stock</td></tr>
        </table>
${setup.length ? `        <p class="eyebrow side-eyebrow">Complete your setup</p>
        <ul class="side-links">
${setup.join('\n')}
        </ul>
` : ''}${guides.length ? `        <p class="eyebrow side-eyebrow">Handling guides</p>
        <ul class="side-links side-guides">
${guides.join('\n')}
        </ul>
` : ''}        <a class="side-policy" href="/compliance.html">Research-use policy</a>
      </aside>`;
}

function fitsLine(slug) {
  if (slug !== 'pen-tips') return '';
  const pens = Object.entries(PRODUCTS).filter(([, p]) => !p.supply && formatType(p) === 'pen').slice(0, 2);
  if (!pens.length) return '';
  const links = pens.map(([penSlug, p]) => `<a href="${productPath(penSlug)}">${escapeHtml(p.name)}</a>`).join(', ');
  return `        <p class="format-alt">Fits the disposable pen supplied with every pen vial: ${links} and all other pen vials.</p>`;
}

// ---------------------------------------------------------------------------
// Product page
// ---------------------------------------------------------------------------
function renderProductPage(slug, product, opts = {}) {
  const url = productUrl(slug);
  const title = (product.seo && product.seo.title) || `${product.name} | ${SITE.name}`;
  const description = (product.seo && product.seo.metaDescription)
    || `${product.summary} UK stocked. Research use only.`;
  const displaySummary = product.summary;
  const lowerDescription = Array.isArray(product.longDescription) && product.longDescription.length
    ? product.longDescription
    : [product.summary];
  const category = product.category || (product.supply ? 'Research supplies' : 'Research compound');
  const formats = configuredFormats(slug, product);
  const hasConfigurator = formats.length > 1 || supportsBacWaterAddon(product);
  const configScript = hasConfigurator ? PRODUCT_CONFIG_SCRIPT : '';
  const hero = imageSet(product.image);
  const isPen = formatType(product) === 'pen';
  const guides = Array.isArray(opts.guides) ? opts.guides : [];
  const sisterPrefetch = formats
    .filter(format => format.slug !== slug && format.image !== hero.full)
    .map(format => `  <link rel="prefetch" as="image" href="/${escapeHtml(format.image)}">`)
    .join('\n');
  const alt = heroAlt(product);

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0E1F38">
  <meta property="og:type" content="product">
  <meta property="og:locale" content="en_GB">
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE.base}/${escapeHtml(hero.og)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1200">
  <meta property="og:image:alt" content="${escapeHtml(alt)}">
  <meta property="product:price:amount" content="${escapeHtml(String(priceFrom(slug)))}">
  <meta property="product:price:currency" content="GBP">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE.base}/${escapeHtml(hero.og)}">
  <meta name="twitter:image:alt" content="${escapeHtml(alt)}">
${sisterPrefetch ? `${sisterPrefetch}\n` : ''}  <script type="application/ld+json">
${jsonLd(slug, product)}
  </script>
${headCommon()}
  <style>${PRODUCT_CSS}${FOOTER_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${siteNav('products')}

  <main id="main">
    <section class="product-hero">
      <div class="media-card" aria-label="Product image gallery">
        <img id="product-image" src="/${escapeHtml(hero.full)}" srcset="/${escapeHtml(hero.thumb)} 600w, /${escapeHtml(hero.full)} 1200w" sizes="(max-width: 900px) 100vw, 520px" width="1200" height="1200" alt="${escapeHtml(alt)}" loading="eager" fetchpriority="high" decoding="async" draggable="false">
${mediaThumbs(product)}
      </div>
      <div class="buy-card">
        <nav class="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><a href="/">Home</a></li>
            <li><a href="/products/">Products</a></li>
            <li aria-current="page">${escapeHtml(product.name)}</li>
          </ol>
        </nav>
        <p class="eyebrow">${escapeHtml(category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p class="summary">${escapeHtml(displaySummary)}</p>
${coaHeroBadge(product)}${documentationLine(product)}
${hasConfigurator ? '' : `        <div class="price-line">${escapeHtml(product.variants.length > 1 ? `From ${formatGBP(priceFrom(slug))}` : formatGBP(priceFrom(slug)))}</div>`}
${buyInterface(slug, product)}
        <div class="np-trust-strip buy-trust" aria-label="Order assurances">
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Free UK delivery over ${escapeHtml(formatGBP(FREE_FROM))}</span>
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>${escapeHtml(DELIVERY.standard.label)} ${escapeHtml(formatGBP(DELIVERY.standard.price))} &middot; DHL Express ${escapeHtml(formatGBP(DELIVERY.dhl.price))}</span>
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Order by 12pm Mon&ndash;Fri for next-working-day dispatch</span>
          <span class="np-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>Research use only</span>
        </div>
${product.sisterProduct && PRODUCTS[product.sisterProduct.slug] ? `        <p class="format-alt">${escapeHtml(product.sisterProduct.label || 'Also available as')}: <a href="/products/${escapeHtml(product.sisterProduct.slug)}/">${escapeHtml(product.sisterProduct.name)}</a></p>` : ''}
${fitsLine(slug)}
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
        ${guidesBlock(guides)}
        ${isPen ? penComparisonBlock(slug, product) : (Array.isArray(product.researchAreas) && product.researchAreas.length ? `<section class="section-block">
          <h2>Research areas</h2>${listItems(product.researchAreas)}
        </section>` : '')}
        ${detailsBlock(product)}
        ${storageBlock(product)}
        ${trustBlock(product)}
        ${coaBlock(product)}
        ${specsTable(product)}
        ${faqBlock(product)}
      </div>
${sideCard(slug, product)}
    </section>
  </main>

  ${basketDrawer()}
${penTipsSheet(formats)}

${configScript}

${renderFooter()}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// /products/ hub page
// ---------------------------------------------------------------------------
const HUB_ORDER = [
  'retatrutide', 'ghk-cu', 'tirzepatide', 'bpc-157', 'klow-stack', 'tb-500', 'nad-plus', 'kpv',
  'ipamorelin', 'cjc-1295', 'ss-31', 'semax', 'selank', 'epitalon', 'pinealon',
];

function hubCard(slug, product) {
  const img = imageSet(product.image);
  const multi = product.variants.length > 1;
  const chip = product.coa && product.coaScope !== 'component'
    ? `<span class="np-chip np-chip-verify">Lab tested · ${escapeHtml(product.coa.purity)} HPLC</span>`
    : '';
  const sister = product.sisterProduct && PRODUCTS[product.sisterProduct.slug] && formatType(PRODUCTS[product.sisterProduct.slug]) === 'pen'
    ? product.sisterProduct.slug
    : null;
  return `        <article class="hub-card">
          <a class="hub-card-media" href="${productPath(slug)}" aria-label="View ${escapeHtml(product.name)}">
            <img src="/${escapeHtml(img.thumb)}" width="600" height="600" loading="lazy" decoding="async" alt="${escapeHtml(heroAlt(product))}">
          </a>
          <div class="hub-card-body">
            <span class="hub-card-eyebrow">${escapeHtml(product.category || (product.supply ? 'Research supplies' : 'Research compound'))}</span>
            <h3><a href="${productPath(slug)}">${escapeHtml(product.name)}</a></h3>
            <p>${escapeHtml(product.summary)}</p>
            <div class="hub-card-foot">
              <span class="hub-card-price">${multi ? 'From ' : ''}${escapeHtml(formatGBP(priceFrom(slug)))}</span>
              ${chip}
            </div>
${sister ? `            <a class="hub-pen-link" href="${productPath(sister)}">Pen vial from ${escapeHtml(formatGBP(priceFrom(sister)))} &middot; complete kit included</a>
` : ''}          </div>
        </article>`;
}

function renderProductIndex(products = PRODUCTS) {
  const url = `${SITE.base}/products/`;
  const title = `Research Peptides UK Catalogue | Vials, Pen Vials & Supplies | ${SITE.name}`;
  const description = 'Browse every UK-stocked research peptide from North Peptides UK: standard lyophilised vials, pre-filled pen vials and research supplies. Independent lab reports published where held. Research use only — not for human or animal consumption.';
  const compoundSlugs = [
    ...HUB_ORDER.filter(slug => products[slug] && !products[slug].supply),
    ...Object.keys(products).filter(slug => !HUB_ORDER.includes(slug) && !products[slug].supply && formatType(products[slug]) !== 'pen'),
  ];
  const supplySlugs = Object.keys(products).filter(slug => products[slug].supply);
  const listed = [...compoundSlugs, ...supplySlugs];
  const itemList = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#page`,
        name: 'Research peptide catalogue',
        url,
        inLanguage: 'en-GB',
        isPartOf: { '@id': `${SITE.base}/#website` },
        mainEntity: { '@id': `${url}#list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#list`,
        name: 'North Peptides UK catalogue',
        numberOfItems: listed.length,
        itemListElement: listed.map((slug, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: products[slug].name,
          url: productUrl(slug),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.base}/` },
          { '@type': 'ListItem', position: 2, name: 'Products', item: url },
        ],
      },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#0E1F38">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_GB">
  <meta property="og:site_name" content="${escapeHtml(SITE.name)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${SITE.base}/og-default.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(SITE.name)} research peptide catalogue">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${SITE.base}/og-default.jpg">
  <script type="application/ld+json">
${JSON.stringify(itemList, null, 2)}
  </script>
${headCommon()}
  <style>${NAV_CSS}${HUB_CSS}${FOOTER_CSS}</style>
  <link rel="stylesheet" href="/site-search.css">
  <script src="/site-search.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
${siteNav('products')}

  <main id="main">
    <header class="hub-hero">
      <nav class="crumbs" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li aria-current="page">Products</li>
        </ol>
      </nav>
      <p class="eyebrow">Catalogue</p>
      <h1>Research peptide catalogue</h1>
      <p class="hub-lede">Every compound is UK stocked and stored frozen until dispatch. Standard vials are lyophilised powder you reconstitute; pen vials arrive pre-filled as a complete kit with disposable pen, sterile pen tips and alcohol wipes. Independent lab reports are published where held.</p>
      <p class="hub-note">Payment by UK bank transfer &middot; ${escapeHtml(DELIVERY.standard.label)} ${escapeHtml(formatGBP(DELIVERY.standard.price))}, free over ${escapeHtml(formatGBP(FREE_FROM))} &middot; ${escapeHtml(DISPATCH_LINE)}</p>
    </header>

    <section class="hub-section" id="compounds" aria-labelledby="compounds-title">
      <div class="hub-section-head">
        <h2 id="compounds-title">Standard vials &amp; pen vials</h2>
        <p>${compoundSlugs.length} compounds. Choose the format on each product page.</p>
      </div>
      <div class="hub-grid">
${compoundSlugs.map(slug => hubCard(slug, products[slug])).join('\n')}
      </div>
    </section>

    <section class="hub-section" id="supplies" aria-labelledby="supplies-title">
      <div class="hub-section-head">
        <h2 id="supplies-title">Research supplies</h2>
        <p>Bacteriostatic water, insulin needles, alcohol wipes, pen tips and kits for laboratory preparation.</p>
      </div>
      <div class="hub-grid">
${supplySlugs.map(slug => hubCard(slug, products[slug])).join('\n')}
      </div>
    </section>

    <div class="research-note hub-research-note">
      <strong>Research use only.</strong> ${DISCLAIMER}
    </div>
  </main>

  ${basketDrawer()}

${renderFooter()}
</body>
</html>
`;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const NAV_CSS = `
    /* --- nav: np.css supplies the shell; keep the basket visible on phones --- */
    .nav-links { display: flex; }
    .nav-links a.active { color: var(--ink); }
    .basket-nav { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 9px 16px; border-radius: var(--r-pill); background: var(--ink); color: #fff; border: 1px solid var(--ink); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; cursor: pointer; white-space: nowrap; transition: background 0.18s var(--ease), border-color 0.18s var(--ease); }
    .basket-nav:hover { background: var(--action); border-color: var(--action); }
    #basket-count { display: none; align-items: center; justify-content: center; min-width: 20px; height: 20px; padding: 0 6px; border-radius: var(--r-pill); background: #fff; color: var(--action-deep); font-size: 0.66rem; font-weight: 700; }
    .crumbs { margin: 0 0 18px; }
    .crumbs ol { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 8px; margin: 0; padding: 0; list-style: none; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
    .crumbs li { display: inline-flex; align-items: center; gap: 8px; }
    .crumbs li + li::before { content: '\\203A'; color: var(--faint); }
    .crumbs a { display: inline-flex; align-items: center; min-height: 28px; color: var(--muted); text-decoration: none; transition: color 0.15s; }
    .crumbs a:hover { color: var(--action); }
    .crumbs [aria-current="page"] { color: var(--ink); }
    @media (max-width: 768px) {
      .nav-links a:not(.nav-basket) { display: none; }
    }
    @media (max-width: 540px) {
      .nav { padding: 0 12px; gap: 10px; }
      .logo { font-size: 0.84rem; letter-spacing: 0.05em; }
      .basket-nav { padding: 8px 12px; font-size: 0.64rem; }
    }`;

const PRODUCT_CSS = `
    /* ==================================================================
       PRODUCT PAGE — North Clinical. Builds on /css/np.css tokens.
       ================================================================== */
    html, body { margin: 0; max-width: 100%; overflow-x: hidden; }
    body { background: var(--frost); }
${NAV_CSS}

    /* --- hero: sticky gallery left, buy column right --- */
    .product-hero { max-width: var(--wrap); margin: 0 auto; padding: 34px 40px 20px; display: grid; grid-template-columns: minmax(300px, 0.88fr) minmax(340px, 1.12fr); gap: 32px; align-items: start; }
    .media-card { position: sticky; top: calc(var(--npbar-h, 36px) + 78px); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-1); }
    #product-image { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; display: block; background: var(--frost-2); }
    #product-image.is-document { object-fit: contain; background: #fff; }
    .media-gallery-bar { display: flex; align-items: center; gap: 10px; min-height: 54px; padding: 9px 12px; border-top: 1px solid var(--line-soft); background: var(--paper); }
    .media-gallery-button { width: 40px; height: 40px; flex-shrink: 0; border: 1px solid var(--line); border-radius: 50%; background: var(--paper); color: var(--ink); cursor: pointer; font-size: 0.9rem; transition: border-color 0.15s, color 0.15s, background 0.15s; }
    .media-gallery-button:hover, .media-gallery-button:focus-visible { border-color: var(--action); color: var(--action); background: var(--action-tint); }
    .media-gallery-copy { flex: 1; min-width: 0; }
    .media-gallery-copy strong { display: block; overflow: hidden; color: var(--ink); font-size: 0.76rem; font-weight: 600; line-height: 1.3; text-overflow: ellipsis; white-space: nowrap; }
    .media-gallery-copy small { display: block; margin-top: 2px; color: var(--muted); font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; text-transform: uppercase; }
    .media-gallery-count { flex-shrink: 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.05em; }
    .media-thumbs { display: flex; gap: 8px; overflow-x: auto; padding: 0 12px 12px; background: var(--paper); scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
    .media-thumb { width: 56px; height: 56px; border-radius: 10px; overflow: hidden; border: 1px solid var(--line); flex-shrink: 0; background: var(--frost-2); cursor: pointer; padding: 0; transition: border-color 0.15s, box-shadow 0.15s; }
    .media-thumb.active { border-color: var(--action); box-shadow: 0 0 0 1px var(--action); }
    .media-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .media-thumb.is-doc img { object-fit: contain; background: #fff; }

    /* --- buy column --- */
    .buy-card { min-width: 0; }
    .eyebrow { margin: 0 0 12px; color: var(--action-deep); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
    h1 { margin: 0 0 12px; font-family: var(--font-display); font-weight: 600; font-size: clamp(1.9rem, 3.6vw, 2.6rem); line-height: 1.08; letter-spacing: -0.02em; color: var(--ink); }
    h2 { margin: 0 0 14px; font-family: var(--font-display); font-weight: 600; font-size: 1.3rem; line-height: 1.2; letter-spacing: -0.015em; color: var(--ink); }
    p { color: var(--body); line-height: 1.7; }
    .summary { margin: 0 0 18px; font-size: 0.98rem; color: var(--muted); max-width: 56ch; }

    /* verification summary card — green is reserved for exactly this */
    .coa-hero-badge { display: flex; align-items: flex-start; gap: 12px; margin: 0 0 18px; padding: 13px 15px; border: 1px solid rgba(14,159,110,0.32); border-radius: var(--r-ctl); background: var(--verify-tint); text-decoration: none; transition: border-color 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .coa-hero-badge:hover, .coa-hero-badge:focus-visible { border-color: var(--verify); box-shadow: var(--shadow-1); }
    .coa-hero-mark { flex-shrink: 0; margin-top: 2px; padding: 5px 9px; border-radius: 6px; background: var(--verify); color: #fff; font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap; }
    .coa-hero-copy { color: var(--body); font-size: 0.8rem; line-height: 1.55; }
    .coa-hero-copy strong { display: block; margin-bottom: 2px; color: var(--ink); font-family: var(--font-display); font-weight: 600; font-size: 0.9rem; }
    .doc-line { margin: 0 0 18px; padding: 11px 14px; border: 1px solid var(--line-soft); border-radius: var(--r-ctl); background: var(--frost-2); color: var(--muted); font-size: 0.8rem; line-height: 1.55; }
    .doc-line a { color: var(--action); font-weight: 600; text-decoration: none; }
    .doc-line a:hover { color: var(--action-deep); text-decoration: underline; }

    .price-line { margin: 0 0 16px; font-family: var(--font-mono); font-size: 1.5rem; font-weight: 500; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; color: var(--ink); }

    /* simple variant rows (supplies, single-format products) */
    .variant-list { display: grid; gap: 10px; }
    .variant-row { width: 100%; min-height: 64px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--paper); color: var(--ink); display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 13px 16px; text-align: left; cursor: pointer; box-shadow: var(--shadow-1); transition: border-color 0.18s var(--ease), box-shadow 0.2s var(--ease), transform 0.18s var(--ease); }
    .variant-row:hover { border-color: var(--action); box-shadow: var(--shadow-2); transform: translateY(-1px); }
    .variant-row strong { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; font-family: var(--font-display); font-size: 0.95rem; font-weight: 600; }
    .variant-chip { font-size: 0.6rem; padding: 3px 8px; }
    .variant-row small { display: block; margin-top: 3px; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.04em; text-transform: uppercase; }
    .variant-action { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .variant-price { font-family: var(--font-mono); font-size: 0.95rem; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--ink); }
    .variant-cta { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 14px; border-radius: 8px; background: var(--action); color: #fff; font-family: var(--font-mono); font-size: 0.74rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; white-space: nowrap; transition: background 0.18s var(--ease); }
    .variant-row:hover .variant-cta { background: var(--action-deep); }

    /* --- order builder card --- */
    .config-box { display: grid; gap: 16px; border: 1px solid var(--line); border-radius: var(--r-card); background: var(--paper); padding: 20px; box-shadow: var(--shadow-1); }
    .config-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line-soft); padding-bottom: 14px; }
    .config-kicker { color: var(--action-deep); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.16em; text-transform: uppercase; }
    .config-head strong { color: var(--ink); font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; line-height: 1.2; text-align: right; }
    .config-control { display: grid; gap: 8px; }
    .config-control label, .config-label { display: block; margin: 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
    .config-size-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(112px, 1fr)); gap: 8px; }
    .config-control[hidden], .config-pen-kit[hidden], .config-supplies[hidden] { display: none; }
    .config-size-btn, .config-format-btn { min-height: 50px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--paper); color: var(--ink); cursor: pointer; transition: border-color 0.15s var(--ease), background 0.15s var(--ease), box-shadow 0.15s var(--ease); }
    .config-size-btn:hover, .config-format-btn:hover { border-color: var(--action); }
    .config-size-btn, .config-format-btn { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 8px; padding: 11px 13px; text-align: left; }
    .config-format-btn { display: flex; align-items: flex-start; flex-direction: column; gap: 3px; }
    .config-size-btn span, .config-format-btn span { font-family: var(--font-display); font-size: 0.9rem; font-weight: 600; }
    .config-size-btn small, .config-format-btn small { color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.02em; font-variant-numeric: tabular-nums; line-height: 1.35; }
    .config-size-unit, .config-size-note { grid-column: 1 / -1; display: block; margin-top: 2px; color: var(--muted); font-family: var(--font-mono); font-size: 0.64rem; font-style: normal; letter-spacing: 0.03em; font-variant-numeric: tabular-nums; }
    .config-size-note { color: var(--verify-text); }
    .config-size-btn.active, .config-format-btn.active { border-color: var(--action); background: var(--action-tint); box-shadow: inset 0 0 0 1px var(--action); }
    .config-size-btn.active span, .config-format-btn.active span { color: var(--action-deep); }
    .config-size-btn.active small, .config-format-btn.active small { color: var(--action-deep); }
    .config-toggle-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
    .config-pen-kit { display: grid; gap: 7px; border: 1px solid var(--line-soft); border-radius: var(--r-ctl); background: var(--frost); padding: 13px 15px; }
    .config-pen-kit-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
    .config-pen-kit-head span { color: var(--action-deep); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; }
    .config-pen-kit-head strong { color: var(--ink); font-family: var(--font-display); font-size: 0.86rem; font-weight: 600; text-align: right; }
    .config-pen-kit-list { display: flex; flex-wrap: wrap; gap: 5px 16px; }
    .config-pen-kit-list span { position: relative; color: var(--body); padding-left: 16px; font-size: 0.76rem; font-weight: 500; line-height: 1.4; }
    .config-pen-kit-list span::before { position: absolute; left: 0; color: var(--action); content: '\\2713'; font-weight: 600; }
    .config-pen-kit p { margin: 0; color: var(--muted); font-size: 0.76rem; line-height: 1.5; }

    /* supplies checklist — opt-in, nothing pre-ticked */
    .config-supplies { display: grid; gap: 8px; }
    .config-supplies-head { display: grid; gap: 4px; margin-bottom: 4px; }
    .config-supplies-head strong { color: var(--ink); font-family: var(--font-display); font-size: 1rem; font-weight: 600; line-height: 1.3; }
    .config-supplies-head p { margin: 0; color: var(--body); font-size: 0.8rem; line-height: 1.55; }
    .config-supplies-head p strong { display: inline; font-family: var(--font-body); font-size: 0.8rem; }
    .supply-opt { display: grid; grid-template-columns: 22px 52px 1fr auto; align-items: center; gap: 12px; min-height: 68px; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--r-ctl); background: var(--paper); color: var(--ink); text-align: left; cursor: pointer; transition: border-color .15s var(--ease), background .15s var(--ease), box-shadow .15s var(--ease); }
    .supply-opt:hover { border-color: var(--action); }
    .supply-opt.active { border-color: var(--action); background: var(--action-tint); box-shadow: inset 0 0 0 1px var(--action); }
    .supply-check { width: 20px; height: 20px; border: 1.5px solid var(--line-strong); border-radius: 6px; background: #fff; display: grid; place-items: center; }
    .supply-opt.active .supply-check { background: var(--action); border-color: var(--action); }
    .supply-opt.active .supply-check::after { content: ''; width: 6px; height: 10px; border: solid #fff; border-width: 0 2px 2px 0; transform: translateY(-1px) rotate(45deg); }
    .supply-opt img { width: 52px; height: 52px; border-radius: 10px; border: 1px solid var(--line-soft); object-fit: cover; background: var(--frost-2); }
    .supply-copy { min-width: 0; }
    .supply-copy strong { display: block; color: var(--ink); font-family: var(--font-display); font-size: 0.88rem; font-weight: 600; }
    .supply-copy small { display: block; margin-top: 2px; color: var(--muted); font-size: 0.74rem; line-height: 1.4; }
    .supply-price { color: var(--ink); font-family: var(--font-mono); font-size: 0.84rem; font-weight: 500; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .supply-opt.active .supply-price { color: var(--action-deep); }

    .config-total-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--line-soft); padding-top: 14px; }
    .config-total-row small { display: block; margin-bottom: 3px; color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
    .config-total-row strong { display: block; color: var(--ink); font-family: var(--font-mono); font-size: 1.55rem; font-weight: 500; line-height: 1.1; letter-spacing: 0.01em; font-variant-numeric: tabular-nums; }
    .config-total-row em { color: var(--muted); font-size: 0.8rem; font-style: normal; text-align: right; line-height: 1.5; }
    .config-ship-line { margin: -6px 0 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.03em; line-height: 1.5; font-variant-numeric: tabular-nums; }
    .config-add-btn { width: 100%; min-height: 52px; border: 1px solid var(--action); border-radius: var(--r-ctl); background: var(--action); color: #fff; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; transition: background 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .config-add-btn:hover { background: var(--action-deep); border-color: var(--action-deep); transform: translateY(-1px); box-shadow: var(--shadow-2); }
    .config-sticky-bar { display: none; }

    .buy-trust { margin: 16px 2px 0; gap: 8px 20px; }
    .buy-trust .np-trust-item { letter-spacing: 0.08em; }
    .format-alt { margin: 14px 2px 0; color: var(--muted); font-size: 0.84rem; }
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
    .section-block p a { color: var(--action); font-weight: 600; }
    .plain-list { margin: 0; padding-left: 20px; color: var(--body); line-height: 1.75; font-size: 0.95rem; }
    .plain-list li { margin-bottom: 8px; }
    .plain-list li::marker { color: var(--action); }
    .guide-list { list-style: none; margin: 0; padding: 0; }
    .guide-list li { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 4px 14px; padding: 11px 0; border-bottom: 1px solid var(--line-soft); }
    .guide-list li:last-child { border-bottom: 0; padding-bottom: 0; }
    .guide-list a { color: var(--ink); font-family: var(--font-display); font-size: 0.95rem; font-weight: 600; text-decoration: none; }
    .guide-list a:hover { color: var(--action); }
    .guide-list span { color: var(--muted); font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; }
    .table-scroll { overflow-x: auto; }
    .compare-formats th[scope="col"] { width: auto; color: var(--ink); }
    .compare-formats th[scope="row"] { width: 22%; }
    /* INDEPENDENT LAB REPORT */
    .coa-block .coa-lede { font-size: 0.95rem; line-height: 1.75; margin-bottom: 14px; }
    .coa-block .coa-lede a { color: var(--action); font-weight: 600; }
    .coa-scope { font-size: 0.84rem; color: var(--amber); background: var(--amber-tint); border: 1px solid rgba(180,83,9,0.3); border-radius: var(--r-ctl); padding: 12px 14px; line-height: 1.7; margin-bottom: 14px; }
    .coa-result { font-weight: 500; color: var(--verify-text); }
    .coa-pages { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 14px; margin-top: 18px; }
    .coa-page { display: block; border: 1px solid var(--line); border-radius: 12px; overflow: hidden; background: #fff; text-decoration: none; transition: border-color 0.2s var(--ease), box-shadow 0.25s var(--ease), transform 0.25s var(--ease); }
    .coa-page:hover { border-color: #BFD3E6; box-shadow: var(--shadow-2); transform: translateY(-2px); }
    .coa-page img { width: 100%; height: auto; display: block; background: #fff; }
    .coa-page-cap { display: block; padding: 10px 12px; border-top: 1px solid var(--line-soft); font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
    .coa-link { display: inline-block; margin-top: 14px; color: var(--action); font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; }
    .coa-link:hover { color: var(--action-deep); }
    .coa-caveat { margin-top: 14px; font-size: 0.78rem; color: var(--muted); line-height: 1.7; }

    .spec-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    .spec-table th, .spec-table td { padding: 12px 14px; border-bottom: 1px solid var(--line-soft); vertical-align: top; text-align: left; }
    .spec-table tr:last-child th, .spec-table tr:last-child td { border-bottom: none; }
    .spec-table th { width: 34%; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
    .spec-table td { color: var(--ink); font-family: var(--font-mono); font-size: 0.8rem; letter-spacing: 0.01em; font-variant-numeric: tabular-nums; }
    .faq-item { border-top: 1px solid var(--line-soft); padding: 14px 0; }
    .faq-item:last-child { padding-bottom: 0; }
    .faq-item summary { cursor: pointer; font-family: var(--font-display); font-weight: 600; font-size: 0.95rem; color: var(--ink); }
    .faq-item summary::marker { color: var(--action); }
    .faq-item p { margin: 10px 0 0; font-size: 0.9rem; }
    .side-card { position: sticky; top: calc(var(--npbar-h, 36px) + 78px); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); box-shadow: var(--shadow-1); padding: 26px; }
    .side-card h2 { font-size: 1.15rem; margin-bottom: 10px; }
    .side-card p { margin: 0 0 16px; font-size: 0.88rem; color: var(--muted); }
    .side-card .eyebrow { margin-bottom: 8px; }
    .side-eyebrow { margin-top: 22px; }
    .side-table { margin-bottom: 4px; }
    .side-table th { width: 42%; padding: 9px 0; font-size: 0.62rem; }
    .side-table td { padding: 9px 0 9px 10px; font-size: 0.76rem; }
    .side-links { list-style: none; margin: 0 0 6px; padding: 0; }
    .side-links li { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--line-soft); font-size: 0.86rem; }
    .side-links li:last-child { border-bottom: 0; }
    .side-links a { color: var(--ink); font-family: var(--font-body); font-weight: 600; font-size: 0.86rem; letter-spacing: 0; text-transform: none; text-decoration: none; transition: color 0.15s; }
    .side-links a:hover { color: var(--action); }
    .side-links span { color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .side-policy { display: inline-block; margin-top: 18px; color: var(--action); font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; }
    .side-policy:hover { color: var(--action-deep); }

    /* --- basket drawer: np.css styles the suite; page-local pieces only --- */
    .basket-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 20px 24px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
    .basket-head .eyebrow { margin: 0 0 4px; font-size: 0.62rem; }
    .basket-head h2 { margin: 0; font-size: 1.15rem; }
    .basket-close { min-height: 40px; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1; padding: 9px 13px; border: 1px solid var(--line); border-radius: var(--r-pill); transition: color 0.15s, border-color 0.15s, background 0.15s; }
    .basket-close:hover { color: var(--ink); border-color: var(--muted); background: var(--frost-2); }
    .basket-total-row span { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
    .basket-total-row strong { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--ink); }
    .checkout-button { width: 100%; margin-top: 8px; padding: 16px; background: var(--action); border: 1px solid var(--action); color: #fff; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-radius: var(--r-ctl); cursor: pointer; transition: background 0.18s var(--ease), transform 0.18s var(--ease), box-shadow 0.18s var(--ease); }
    .checkout-button:hover { background: var(--action-deep); border-color: var(--action-deep); transform: translateY(-1px); box-shadow: var(--shadow-2); }

    /* --- pen-tips offer sheet (sits above the basket drawer) --- */
    .np-sheet { position: fixed; inset: 0; z-index: 450; display: grid; place-items: end center; }
    .np-sheet[hidden] { display: none; }
    .np-sheet-backdrop { position: absolute; inset: 0; background: rgba(14,31,56,.44); -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px); }
    .np-sheet-panel { position: relative; width: 100%; max-width: 480px; display: grid; gap: 14px; padding: 22px 20px calc(22px + env(safe-area-inset-bottom, 0px)); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card) var(--r-card) 0 0; box-shadow: var(--shadow-lift); }
    .np-sheet h2 { margin: 0; font-size: 1.15rem; line-height: 1.3; }
    .np-sheet-row { display: flex; align-items: center; gap: 14px; }
    .np-sheet-row img { width: 72px; height: 72px; flex-shrink: 0; border-radius: 12px; border: 1px solid var(--line); object-fit: cover; }
    .np-sheet-row p { margin: 0; color: var(--body); font-size: 0.86rem; line-height: 1.55; }
    .np-sheet-primary { min-height: 52px; border: 1px solid var(--action); border-radius: var(--r-ctl); background: var(--action); color: #fff; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; }
    .np-sheet-primary:hover { background: var(--action-deep); border-color: var(--action-deep); }
    .np-sheet-secondary { min-height: 44px; border: 0; background: transparent; color: var(--muted); cursor: pointer; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; }
    .np-sheet-secondary:hover { color: var(--ink); }
    @media (min-width: 700px) { .np-sheet { place-items: center; padding: 20px; } .np-sheet-panel { border-radius: var(--r-card); } }

    @media (max-width: 900px) {
      .product-hero { grid-template-columns: 1fr; padding: 22px 20px 12px; gap: 20px; }
      .media-card { position: static; }
      .media-gallery-button { width: 44px; height: 44px; }
      /* Shorter hero on phones: the square crop pushed the whole builder below
         the first screen. 3:2 contain keeps the full product image visible. */
      #product-image { aspect-ratio: 3 / 2; object-fit: contain; background: #fff; }
      .content-grid { grid-template-columns: 1fr; padding: 8px 20px 84px; }
      .section-block { padding: 24px 20px; }
      .side-card { position: static; }
      body.has-sticky-bar { padding-bottom: 92px; }
      .config-sticky-bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 360; display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px)); background: var(--paper); border-top: 1px solid var(--line); box-shadow: 0 -12px 30px rgba(14,31,56,0.1); transform: translateY(110%); transition: transform .22s var(--ease); }
      .config-sticky-bar.is-visible { transform: none; }
      .config-sticky-bar > span { min-width: 0; }
      .config-sticky-bar small { display: block; overflow: hidden; color: var(--muted); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; text-overflow: ellipsis; white-space: nowrap; }
      .config-sticky-bar strong { display: block; color: var(--ink); font-family: var(--font-mono); font-size: 1.2rem; font-weight: 500; line-height: 1.15; font-variant-numeric: tabular-nums; }
      .config-sticky-bar button { flex: 1; max-width: 230px; min-height: 46px; border: 0; border-radius: var(--r-ctl); background: var(--action); color: #fff; cursor: pointer; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.09em; text-transform: uppercase; }
      .variant-row { align-items: stretch; flex-direction: column; }
      .variant-action { width: 100%; justify-content: space-between; }
      .variant-cta { min-width: 132px; min-height: 44px; }
      .config-box { padding: 16px; }
      .config-head { align-items: flex-start; flex-direction: column; gap: 4px; }
      .config-head strong { text-align: left; }
      .config-size-grid, .config-toggle-row { grid-template-columns: 1fr 1fr; }
      .config-pen-kit-head { align-items: flex-start; flex-direction: column; }
      .config-pen-kit-head strong { text-align: left; }
      .config-total-row { align-items: flex-start; flex-direction: column; gap: 6px; }
      .config-total-row em { text-align: left; }
    }
    @media (max-width: 540px) {
      .buy-trust { display: grid; grid-template-columns: 1fr; gap: 6px; }
      .config-format-row { grid-template-columns: 1fr; }
      .supply-opt { grid-template-columns: 22px 44px 1fr auto; gap: 10px; }
      .supply-opt img { width: 44px; height: 44px; }
    }
`;

const HUB_CSS = `
    /* ==================================================================
       PRODUCTS HUB — North Clinical. Builds on /css/np.css tokens.
       ================================================================== */
    html, body { margin: 0; max-width: 100%; overflow-x: hidden; }
    body { background: var(--frost); }
    .hub-hero { max-width: var(--wrap); margin: 0 auto; padding: 34px 40px 10px; }
    .eyebrow { margin: 0 0 12px; color: var(--action-deep); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; }
    h1 { margin: 0 0 12px; font-family: var(--font-display); font-weight: 600; font-size: clamp(1.9rem, 3.6vw, 2.6rem); line-height: 1.08; letter-spacing: -0.02em; color: var(--ink); }
    .hub-lede { margin: 0; max-width: 68ch; color: var(--body); font-size: 1rem; line-height: 1.7; }
    .hub-note { margin: 14px 0 0; color: var(--muted); font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; line-height: 1.6; }
    .hub-section { max-width: var(--wrap); margin: 0 auto; padding: 26px 40px 10px; }
    .hub-section-head { display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 6px 18px; margin-bottom: 16px; }
    .hub-section-head h2 { margin: 0; font-family: var(--font-display); font-weight: 600; font-size: 1.4rem; letter-spacing: -0.015em; color: var(--ink); }
    .hub-section-head p { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .hub-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 18px; }
    .hub-card { display: flex; flex-direction: column; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-card); overflow: hidden; box-shadow: var(--shadow-1); transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), border-color 0.2s; }
    .hub-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-2); border-color: #C3D4E4; }
    .hub-card-media { display: block; aspect-ratio: 1; background: var(--frost-2); border-bottom: 1px solid var(--line-soft); }
    .hub-card-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .hub-card-body { display: flex; flex-direction: column; flex: 1; gap: 6px; padding: 16px 18px 18px; }
    .hub-card-eyebrow { color: var(--action-deep); font-family: var(--font-mono); font-size: 0.64rem; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; }
    .hub-card h3 { margin: 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; letter-spacing: -0.01em; }
    .hub-card h3 a { color: var(--ink); text-decoration: none; }
    .hub-card h3 a:hover { color: var(--action); }
    .hub-card p { margin: 0; flex: 1; color: var(--muted); font-size: 0.86rem; line-height: 1.6; }
    .hub-card-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .hub-card-price { color: var(--ink); font-family: var(--font-mono); font-size: 1rem; font-weight: 500; font-variant-numeric: tabular-nums; }
    .hub-pen-link { display: inline-block; margin-top: 4px; color: var(--action); font-family: var(--font-mono); font-size: 0.68rem; font-weight: 500; letter-spacing: 0.05em; text-decoration: none; }
    .hub-pen-link:hover { color: var(--action-deep); text-decoration: underline; }
    .hub-research-note { max-width: var(--wrap); margin: 30px auto 60px; padding: 14px 16px; border: 1px solid var(--line-soft); border-radius: var(--r-ctl); background: var(--frost-2); color: var(--muted); font-size: 0.8rem; line-height: 1.65; }
    .hub-research-note strong { color: var(--ink); }
    .basket-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 20px 24px; border-bottom: 1px solid var(--line-soft); flex-shrink: 0; }
    .basket-head .eyebrow { margin: 0 0 4px; font-size: 0.62rem; }
    .basket-head h2 { margin: 0; font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; color: var(--ink); }
    .basket-close { min-height: 40px; color: var(--muted); font-family: var(--font-mono); font-size: 0.66rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; line-height: 1; padding: 9px 13px; border: 1px solid var(--line); border-radius: var(--r-pill); }
    .basket-total-row span { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted); }
    .basket-total-row strong { font-family: var(--font-mono); font-size: 1.15rem; font-weight: 500; font-variant-numeric: tabular-nums; color: var(--ink); }
    .checkout-button { width: 100%; margin-top: 8px; padding: 16px; background: var(--action); border: 1px solid var(--action); color: #fff; font-family: var(--font-mono); font-size: 0.8rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; border-radius: var(--r-ctl); cursor: pointer; }
    @media (max-width: 900px) {
      .hub-hero, .hub-section { padding-left: 20px; padding-right: 20px; }
      .hub-research-note { margin: 24px 20px 48px; }
    }
    @media (max-width: 540px) {
      .hub-grid { grid-template-columns: 1fr; }
    }
`;

const PRODUCT_CONFIG_SCRIPT = `
  <script>
    let configuredFormatIndex = Number(window.NPUK_CONFIG_FORMAT_INDEX || 0);
    let configuredVariantIndex = 0;
    let configuredBacWater = false;
    let configuredSupplies = {};

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

    function configSupplyList() {
      return Array.isArray(window.NPUK_CONFIG_SUPPLIES) ? window.NPUK_CONFIG_SUPPLIES : [];
    }

    function selectedSupplies() {
      return configSupplyList().filter(function (s) { return Boolean(configuredSupplies[s.key]); });
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
        (variant.unit ? '<em class="config-size-unit">' + variant.unit + '</em>' : '') +
        (variant.note ? '<em class="config-size-note">' + variant.note + '</em>' : '') +
        '</button>';
    }

    // basket.js exposes getTotal() once it has loaded (it is deferred); before
    // that, and in test harnesses, the projection assumes an empty basket.
    function configBasketTotal() {
      try {
        if (typeof getTotal === 'function') return Number(getTotal()) || 0;
      } catch (e) {}
      return 0;
    }

    function refreshConfiguredOrder() {
      const format = configuredFormat();
      const variant = configuredVariant();
      const canAddSupplies = Boolean(format.bacWater);
      if (!canAddSupplies) configuredSupplies = {};
      configuredBacWater = Boolean(configuredSupplies.bac);
      const suppliesTotal = selectedSupplies().reduce(function (sum, s) { return sum + Number(s.price); }, 0);
      const total = Math.round((Number(variant.price) + suppliesTotal) * 100) / 100;
      const name = document.getElementById('config-selection-name');
      const totalEl = document.getElementById('config-total');
      const note = document.getElementById('config-total-note');
      const sizeGrid = document.getElementById('config-size-grid');
      const suppliesEl = document.getElementById('config-supplies');
      const penKit = document.getElementById('config-pen-kit');
      const productImage = document.getElementById('product-image');
      const stickyName = document.getElementById('config-sticky-name');
      if (name) name.textContent = format.productName + ' ' + variant.dose;
      if (stickyName) stickyName.textContent = format.productName + ' ' + variant.dose;
      if (productImage) {
        if (typeof productImage.removeAttribute === 'function') productImage.removeAttribute('srcset');
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
          const parts = selectedSupplies().map(function (s) { return s.label || s.name; });
          note.textContent = parts.length ? 'Vial + ' + parts.join(' + ') : 'Standard vial';
        }
      }
      const shipLine = document.getElementById('config-ship-line');
      if (shipLine) {
        const threshold = Number(window.NPUK_FREE_DELIVERY_FROM || 100);
        const inBasket = configBasketTotal();
        const projected = Math.round((inBasket + total) * 100) / 100;
        const gap = Math.round((threshold - projected) * 100) / 100;
        if (inBasket > 0) {
          shipLine.textContent = 'Basket + this order ' + configMoney(projected) + ' \\u00B7 ' +
            (gap <= 0 ? 'Free UK delivery unlocked' : 'Add ' + configMoney(gap) + ' more for free UK delivery');
        } else {
          shipLine.textContent = gap <= 0
            ? 'Free UK delivery unlocked at this total'
            : 'Add ' + configMoney(gap) + ' more for free UK delivery \\u00B7 free from ' + configMoney(threshold);
        }
      }
      if (suppliesEl) suppliesEl.hidden = !canAddSupplies;
      // Legacy hook kept for older cached markup that still carries the
      // single BAC toggle wrapper; harmless when the element is absent.
      const bacControl = document.getElementById('config-bac-control');
      if (bacControl) bacControl.hidden = !canAddSupplies;
      configSupplyList().forEach(function (s) {
        const el = document.getElementById('supply-' + s.key);
        if (!el) return;
        const on = Boolean(configuredSupplies[s.key]);
        el.classList.toggle('active', on);
        el.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
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
      configuredSupplies.bac = Boolean(included);
      configuredBacWater = configuredSupplies.bac;
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

    function toggleSupply(key) {
      if (key === 'bac') return setBacWater(!configuredSupplies.bac);
      configuredSupplies[key] = !configuredSupplies[key];
      refreshConfiguredOrder();
      const supply = configSupplyList().find(function (s) { return s.key === key; });
      if (supply) {
        configTrack('SupplyToggled', {
          contents: [{
            content_id: supply.name + ':' + supply.dose,
            content_name: supply.name,
            content_type: 'product',
            quantity: 1,
            price: Number(supply.price)
          }],
          value: configuredSupplies[key] ? Number(supply.price) : 0,
          currency: 'GBP'
        });
      }
    }

    // Pen-tips offer sheet. Shown once per session after a pen-vial add, never
    // again once declined, never when tips are already in the basket. Degrades
    // to a plain showBasket() when the sheet markup is absent.
    function openPenTipsSheet(format) {
      if (!format || format.type !== 'pen') return false;
      const sheet = document.getElementById('np-pen-tips-sheet');
      const offer = window.NPUK_PEN_TIPS_OFFER;
      if (!sheet || !offer) return false;
      try { if (sessionStorage.getItem('npuk_pen_tips_declined') === '1') return false; } catch (e) {}
      const lines = (typeof basket !== 'undefined' && Array.isArray(basket)) ? basket : [];
      if (lines.some(function (item) { return item && item.name === offer.name; })) return false;
      sheet.hidden = false;
      if (typeof sheet.querySelector === 'function') {
        const primary = sheet.querySelector('.np-sheet-primary');
        if (primary && typeof primary.focus === 'function') primary.focus();
      }
      configTrack('PenTipsOffered', {
        contents: [{ content_id: offer.name + ':' + offer.dose, content_name: offer.name, content_type: 'product', quantity: 1, price: Number(offer.price) }],
        value: Number(offer.price),
        currency: 'GBP'
      });
      return true;
    }

    function acceptPenTips() {
      const offer = window.NPUK_PEN_TIPS_OFFER;
      if (offer) addToBasket(offer.name, offer.price, offer.dose);
      closePenTipsSheet(false);
    }

    function closePenTipsSheet(declined) {
      const sheet = document.getElementById('np-pen-tips-sheet');
      if (sheet) sheet.hidden = true;
      if (declined) { try { sessionStorage.setItem('npuk_pen_tips_declined', '1'); } catch (e) {} }
      showBasket();
    }

    function addConfiguredToBasket() {
      const format = configuredFormat();
      const variant = configuredVariant();
      addToBasket(format.productName, variant.price, variant.dose);
      if (format.bacWater) {
        selectedSupplies().forEach(function (s) { addToBasket(s.name, s.price, s.dose); });
      }
      if (!openPenTipsSheet(format)) showBasket();
    }

    refreshConfiguredOrder();

    if (typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', function () {
        // basket.js has loaded by now: re-run so the free-delivery projection
        // includes what is already in the basket.
        refreshConfiguredOrder();
        const format = configuredFormat();
        const variant = configuredVariant();
        configTrack('ViewContent', {
          contents: configContents(format, variant),
          value: Number(variant.price),
          currency: 'GBP'
        });

        // Mobile sticky add bar: only while the in-card button is off screen.
        const bar = document.getElementById('config-sticky-bar');
        const cta = typeof document.querySelector === 'function' ? document.querySelector('.config-add-btn') : null;
        if (bar && cta && 'IntersectionObserver' in window) {
          const observer = new IntersectionObserver(function (entries) {
            const entry = entries[0];
            const show = Boolean(entry) && !entry.isIntersecting;
            bar.classList.toggle('is-visible', show);
            if (document.body) document.body.classList.toggle('has-sticky-bar', show);
          }, { threshold: 0.35 });
          observer.observe(cta);
        }
      });
      document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        const sheet = document.getElementById('np-pen-tips-sheet');
        if (sheet && !sheet.hidden) closePenTipsSheet(true);
      });
    }
  </script>`;

module.exports = { renderProductPage, renderProductIndex, imageSet, SUPPLY_DEFS };
