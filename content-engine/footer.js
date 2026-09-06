'use strict';
/*
 * footer.js — the one shared site footer.
 *
 * renderFooter({ relative }) returns the three-column footer markup used by the
 * generated article/blog pages and pasted verbatim into the static pages
 * (why-us, lab-reports, reviews, compliance, legal, 404). Every link is
 * root-absolute by default; pass `relative: '../'` for a page that must stay
 * relative. FOOTER_CSS carries the few legibility overrides the footer needs on
 * top of the .np-footer recipe in /css/np.css (RUO line >= .7rem, #8FA3BC on ink).
 *
 * The research-use line is wrapped in compliance:ignore fences like the rest of
 * the template boilerplate; compliance.js still checks the REQUIRED phrases on
 * the full text, so removing it fails the gate.
 */

const SITE_NAME = 'North Peptides UK';
const EMAIL = 'orders@northpeptidesuk.com';
const INSTAGRAM_URL = 'https://www.instagram.com/northpeptidesuk/';
const TELEGRAM_URL = 'https://t.me/NORTHPEPTIDESUK';
const WHATSAPP_URL = 'https://wa.me/447380398347';

// All 15 research compounds, catalogue order. Slugs must exist in product-data.js.
const FOOTER_PRODUCTS = [
  ['retatrutide', 'Retatrutide'],
  ['tirzepatide', 'Tirzepatide'],
  ['bpc-157', 'BPC-157'],
  ['tb-500', 'TB-500'],
  ['ghk-cu', 'GHK-Cu'],
  ['kpv', 'KPV'],
  ['klow-stack', 'KLOW Stack'],
  ['ipamorelin', 'Ipamorelin'],
  ['cjc-1295', 'CJC-1295'],
  ['nad-plus', 'NAD+'],
  ['ss-31', 'SS-31'],
  ['semax', 'Semax'],
  ['selank', 'Selank'],
  ['epitalon', 'Epitalon'],
  ['pinealon', 'Pinealon'],
];

const FOOTER_GUIDES = [
  ['how-to-reconstitute-peptides', 'How to reconstitute peptides'],
  ['how-to-store-peptides', 'How to store peptides'],
  ['bacteriostatic-water-vs-sterile-water', 'Bacteriostatic vs sterile water'],
  ['buy-research-peptides-uk', 'Buying research peptides in the UK'],
  ['retatrutide-vs-tirzepatide', 'Retatrutide vs Tirzepatide'],
];

const RUO_LINE =
  'All products are supplied for laboratory research use only and are not for human or animal consumption. ' +
  'They are not medicines and nothing on this site is medical advice.';

function renderFooter(opts = {}) {
  const root = opts.relative || '/';
  const year = opts.year || 2026;
  const li = (href, label, extra = '') => `          <li><a href="${href}"${extra}>${label}</a></li>`;
  const ext = ' target="_blank" rel="noopener noreferrer"';

  const products = [
    li(`${root}products/`, 'All products'),
    ...FOOTER_PRODUCTS.map(([slug, name]) => li(`${root}products/${slug}/`, name)),
    li(`${root}products/#supplies`, 'Research supplies'),
  ].join('\n');

  const guides = [
    li(`${root}blog/index.html`, 'All research guides'),
    ...FOOTER_GUIDES.map(([slug, name]) => li(`${root}blog/${slug}.html`, name)),
  ].join('\n');

  const company = [
    li(`${root}why-us.html`, 'Why North Peptides'),
    li(`${root}lab-reports.html`, 'Lab Reports'),
    li(`${root}reviews/`, 'Order reviews'),
    li(`${root}compliance.html`, 'Research Use Policy'),
    li(`${root}terms.html`, 'Terms &amp; Conditions'),
    li(`${root}refunds.html`, 'Refunds &amp; Returns'),
    li(`${root}privacy.html`, 'Privacy Notice'),
    li(`${root}cookies.html`, 'Cookie Notice'),
    li(`mailto:${EMAIL}`, 'Email support'),
    li(INSTAGRAM_URL, 'Instagram', ext),
    li(TELEGRAM_URL, 'Telegram', ext),
    li(WHATSAPP_URL, 'WhatsApp', ext),
  ].join('\n');

  return `  <footer class="np-footer">
    <div class="np-footer-grid">
      <div class="np-footer-brand">
        <a href="${root}" class="np-footer-logo">NORTH<span>PEPTIDES</span>UK</a>
        <p>Research peptides with purity stated on every product. UK stocked, stored frozen until dispatch, with independent lab reports published where held.</p>
        <p class="np-footer-pay">Payment by UK bank transfer · Royal Mail tracked delivery</p>
      </div>
      <div class="np-footer-col">
        <h4>Products</h4>
        <ul>
${products}
        </ul>
      </div>
      <div class="np-footer-col">
        <h4>Guides</h4>
        <ul>
${guides}
        </ul>
      </div>
      <div class="np-footer-col">
        <h4>Company</h4>
        <ul>
${company}
        </ul>
      </div>
    </div>
    <div class="np-footer-bottom">
      <p>© ${year} ${SITE_NAME}. All rights reserved.</p>
      <p>Orders before 12pm Mon–Fri aimed at next-working-day dispatch</p>
    </div>
    <!--compliance:ignore-start-->
    <p class="np-footer-ruo">${RUO_LINE}</p>
    <!--compliance:ignore-end-->
  </footer>`;
}

// Legibility overrides layered on the .np-footer recipe in /css/np.css.
const FOOTER_CSS = `
    /* shared footer — legibility floor for the ink band */
    .np-footer-logo { font-family: var(--font-wordmark); font-weight: 800; font-size: 1rem; letter-spacing: .08em; color: #fff; text-decoration: none; }
    .np-footer-logo span { color: var(--sky); }
    .np-footer-brand p { color: #B9C7DA; }
    .np-footer-pay { font-family: var(--font-mono); font-size: .72rem; letter-spacing: .04em; color: #8FA3BC; }
    .np-footer-col h4 { color: #8FA3BC; font-size: .64rem; }
    .np-footer-col a { font-size: .86rem; }
    .np-footer-bottom { font-size: .7rem; color: #8FA3BC; }
    .np-footer-bottom p { margin: 0; color: inherit; font-size: inherit; }
    .np-footer-col li { margin-bottom: 10px; color: inherit; }
    .np-footer-ruo { font-size: .72rem; color: #8FA3BC; }
    @media (max-width: 600px) { .np-footer { padding: 48px 20px 32px; } }`;

module.exports = { renderFooter, FOOTER_CSS, FOOTER_PRODUCTS, FOOTER_GUIDES, RUO_LINE };
