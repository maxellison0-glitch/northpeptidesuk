const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checkout = read("checkout.html");
const basket = read("basket.js");
const cssBasket = read(path.join("css", "basket.js"));
const commerceCore = read(path.join("server", "commerce-core.js"));
const index = read("index.html");
const product = read("product.html");
const productData = read("product-data.js");
const apiOrder = read(path.join("api", "create-order.js"));
const vercelConfig = fs.existsSync(path.join(root, "vercel.json")) ? read("vercel.json") : "";
const whyUs = read("why-us.html");
const labReports = read("lab-reports.html");
const compliance = read("compliance.html");
const reviews = read(path.join("reviews", "index.html"));
const reviewApi = read(path.join("api", "submit-review.js"));
const sitemap = read("sitemap.xml");
const sitePages = [index, product, checkout, whyUs, labReports, compliance];

const expectedAccessoryPrices = [
  ["Bacteriostatic Water", "10ml vial", "10"],
  ["Insulin Needle Pack", "10 pack, 1ml insulin needles", "7"],
  ["Sterile Disposable Pen Tips", "6mm x5", "3.99"],
  ["Alcohol Wipes", "10 pack", "3"],
  ["Thermal Cooled Packaging", "Insulated foil pouch + gel packs", "5"]
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

for (const [name, dose, price] of expectedAccessoryPrices) {
  const buttonArg = name === "Thermal Cooled Packaging" ? "btn" : "this";
  const checkoutPattern = new RegExp(
    `addCheckoutAddon\\(${buttonArg},\\s*'${escapeRegex(name)}',\\s*${escapeRegex(price)},\\s*'${escapeRegex(dose)}'\\)`
  );
  assert(
    checkoutPattern.test(checkout),
    `${name} checkout add-on should use ${price}`
  );
  assert(
    commerceCore.includes(`"${name}|${dose}": ${price}`),
    `${name} trusted server catalog should use ${price}`
  );
}

assert(
  index.includes(".acc-grid { grid-template-columns: 1fr; gap: 10px;"),
  "mobile product grid should use one tight column"
);
assert(
  index.includes(".shop-card { display: grid; grid-template-columns: 118px minmax(0, 1fr);"),
  "mobile product cards should use compact image/detail columns"
);
assert(
  index.includes(".shop-card-img { aspect-ratio: 1 / 1; min-height: 148px; height: auto;"),
  "mobile product images should be compact thumbnails"
);
assert(
  index.includes(".shop-add-btn { min-height: 44px;"),
  "mobile add buttons should keep a reliable touch target"
);

assert(
  checkout.includes("function formatMoney(value)") &&
    checkout.includes("formatMoney(item.price * item.qty)") &&
    basket.includes("function fmt(v)") &&
    basket.includes("fmt(item.price * item.qty)"),
  "basket and checkout rows should format decimal prices consistently"
);
assert(
  basket.includes("const price = parseFloat(parts[0]);") &&
    cssBasket.includes("const price = parseFloat(parts[0]);") &&
    !basket.includes("const price = parseInt(parts[0]);") &&
    !cssBasket.includes("const price = parseInt(parts[0]);"),
  "legacy basket variant helper should preserve decimal prices"
);

assert(
  commerceCore.includes("const SITE_URL = \"https://northpeptidesuk.com\"") &&
    commerceCore.includes("function isAllowedOrigin(origin)") &&
    !commerceCore.includes("payload.origin ||"),
  "order API CORS should not trust arbitrary browser origins"
);
assert(
  !commerceCore.includes('"Access-Control-Allow-Origin": "*"') &&
    apiOrder.includes("req.headers.origin") &&
    apiOrder.includes('req.method !== "POST"'),
  "order API should restrict CORS and methods"
);
assert(
  apiOrder.includes("function escapeHtml(value)") &&
    apiOrder.includes("buildOwnerEmailHtml(order)") &&
    apiOrder.includes("buildCustomerEmailHtml(order)"),
  "order emails should escape customer content"
);
assert(
  vercelConfig.includes("Strict-Transport-Security") &&
    vercelConfig.includes("X-Content-Type-Options") &&
    vercelConfig.includes("Referrer-Policy") &&
    vercelConfig.includes("Permissions-Policy"),
  "Vercel should send baseline security headers"
);

for (const staleLabel of ["1x 10mg", "2x 10mg", "3x 10mg", "2x 15mg", "3x 15mg"]) {
  assert(!index.includes(`>${staleLabel} —`), `homepage dropdown should not show spaced/bundled label ${staleLabel}`);
}
for (const compactLabel of ["1x10mg", "1x15mg", "1x20mg", "1x30mg", "1x50mg", "1x80mg", "1x5mg"]) {
  assert(index.includes(`>${compactLabel} —`), `homepage dropdown should show compact single-size label ${compactLabel}`);
  assert(productData.includes(`label: "${compactLabel}"`), `product detail data should show compact label ${compactLabel}`);
}
assert(
  !index.includes("function productQty(qtyId)") &&
    !index.includes("function adjustProductQty(qtyId, delta)") &&
    index.includes("addBundleToBasket('reta-sel','Retatrutide')"),
  "homepage product cards should add one selected item at a time"
);
assert(
  product.includes("function selectedQuantity()") &&
    product.includes("function adjustDetailQty(delta)") &&
    product.includes("addItemToBasket(product.name, variant.price, variant.dose, selectedQuantity())"),
  "product detail page should add selected quantity"
);
assert(
  index.includes("Research Supplies") &&
    index.includes("Pen-Style Research Kit") &&
    index.includes("research-pen-kit-style-600.webp") &&
    index.includes("research-bac-water-600.webp") &&
    index.includes("research-insulin-needles-600.webp") &&
    index.includes("Sterile Disposable Pen Tips") &&
    index.includes("Bacteriostatic Water") &&
    index.includes("Insulin Needle Pack"),
  "homepage should expose research supplies as catalogue products"
);
assert(
  productData.includes('"pen-style-research-kit"') &&
    productData.includes('image: "research-pen-kit-style.webp"') &&
    productData.includes('"pen-tips"') &&
    productData.includes('"bacteriostatic-water"') &&
    productData.includes('"syringe-kit"'),
  "product detail data should include research supplies"
);
assert(
  commerceCore.includes('"Pen-Style Research Kit|3ml cartridge + BAC water + x5 pen tips": 25') &&
    commerceCore.includes('"Sterile Disposable Pen Tips|6mm x5": 3.99') &&
    commerceCore.includes("function resolveCatalogPrice(_item, name, dose)") &&
    checkout.includes("'Sterile Disposable Pen Tips'"),
  "checkout and trusted server catalog should accept pen-style research supplies"
);

if (false) {
assert(
  index.includes("Batch Tested.") &&
    index.includes("UK Stocked.") &&
    index.includes("Research Grade.") &&
    index.includes("verified to ≥99% purity, batch-tested and cold-chain protected") &&
    index.includes('href="why-us.html" class="hero-cta-secondary">Lab Standards →</a>'),
  "homepage hero should use authority messaging and Lab Standards CTA"
);
assert(
  index.includes("≥99% HPLC Verified") &&
    index.includes("Batch COA Available") &&
    index.includes("Cold-Chain Protected") &&
    index.includes("Lab Reports Available") &&
    !index.includes("<!-- TRUST STRIP (subtle, between hero and featured) -->"),
  "homepage trust strip should be the dark authority bar"
);
assert(
  index.includes("Quality Standards") &&
    index.includes("Verified Purity") &&
    index.includes("Cold-Chain Integrity") &&
    index.includes("Traceable UK Stock"),
  "homepage quality section should focus on quality standards"
);
assert(
  index.includes("Verified purity.<br>UK stocked.<br><em>Research standard.</em>") &&
    index.includes("≥99%</span><span class=\"about-light-stat-label\">Purity verified by HPLC") &&
    index.includes("COA</span><span class=\"about-light-stat-label\">Certificate of Analysis"),
  "homepage about section should use research standard messaging"
);
assert(
  index.includes("batch-tested and cold-chain protected") &&
    index.includes("COA available on every product") &&
    index.includes("Lab Reports &amp; COA") &&
    index.includes("Why North Peptides"),
  "homepage footer should include authority links and COA language"
);
assert(
  whyUs.includes("Why researchers choose") &&
    whyUs.includes("≥99% HPLC Purity") &&
    whyUs.includes(".stat-bar-inner { grid-template-columns: 1fr 1fr;"),
  "why-us page should be present and responsive"
);
assert(
  labReports.includes("Lab Reports &amp;") &&
    labReports.includes("reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));") &&
    labReports.includes("COA Available"),
  "lab reports page should be present with responsive COA grid"
);
}

assert(
  index.includes("Purity Stated.") &&
    index.includes("UK Stocked.") &&
    index.includes("Research Use Only.") &&
    index.includes('href="#latest-lab-results" class="hero-cta-secondary">View Lab Results'),
  "homepage hero should use the current research-use messaging and lab-results CTA"
);
assert(
  /'AJ20':\s*0\.20/.test(checkout) &&
    /AJ20:\s*0\.20/.test(commerceCore),
  "AJ20 should be enforced as a 20% discount by both checkout and the order API"
);
assert(
  !checkout.includes("SHELLEY") &&
    !checkout.includes("Shelley Ellison") &&
    !checkout.includes("ADMININVALID") &&
    !commerceCore.includes("SHELLEY") &&
    !commerceCore.includes("ADMININVALID"),
  "checkout should not expose test-only discount codes or personal data"
);
assert(
  !fs.existsSync(path.join(root, "holiday-mode.js")) &&
    !index.includes("holiday-mode.js") &&
    !checkout.includes("holiday-mode.js") &&
    !checkout.includes("SUMMER10") &&
    !commerceCore.includes("SUMMER10") &&
    !apiOrder.includes("holidayBreakActive") &&
    checkout.includes("Order before 12pm Mon–Fri and we aim to dispatch the next working day") &&
    read("dispatch-bar.js").includes("CUTOFF_HOUR = 12") &&
    !read("dispatch-bar.js").includes("SUMMER10"),
  "summer break mode should be retired and checkout should state the 12pm next-working-day dispatch policy"
);
assert(
  compliance.includes("Research Use &amp; Compliance") &&
    compliance.includes("Not for human or animal consumption") &&
    compliance.includes("not intended for any medical, therapeutic, diagnostic, or preventative purpose") &&
    !compliance.includes("Companies House") &&
    !compliance.includes("limited company"),
  "compliance page should give factual research-use guidance without unverified business details"
);
assert(
  index.includes('href="compliance.html">Research Use Policy</a>'),
  "homepage footer should link to the compliance page"
);
assert(
  index.includes("Reconstitution calculator.") &&
    !index.includes("What you need to<br><em>review your basket.</em>") &&
    !index.includes("How We Compare") &&
    !index.includes("Review collection in progress") &&
    !index.includes("Start simple.") &&
    !index.includes("Ask before you order.") &&
    !index.includes("What are the main stocked options?") &&
    !index.includes("Which product should I look at first?") &&
    !index.includes("Do I need the checkout basics?") &&
    !index.includes("How does payment and dispatch work?") &&
    !index.includes("Can I ask before ordering?"),
  "homepage should keep the calculator while removing redundant bottom proof and checkout filler copy"
);
assert(
  !index.includes("Northern England") &&
    !index.includes("🧬") &&
    !index.includes("🧊") &&
    !index.includes("📋") &&
    !index.includes("⚗") &&
    !index.includes("⚡"),
  "homepage should use UK-only wording and no decorative emojis"
);
assert(
  sitePages.every((page) => !page.includes("support@northpeptidesuk.com")) &&
    sitePages.every((page) => !page.includes("Northern England")) &&
    sitePages.some((page) => page.includes("orders@northpeptidesuk.com")),
  "site support links should use the new support address and UK-only wording"
);
assert(
  reviews.includes("Leave an Order Review") &&
    reviews.includes("/api/submit-review") &&
    reviews.includes("Moderated before publishing") &&
    (reviews.match(/data-feedback-card/g) || []).length === 4 &&
    reviews.includes("Recreated as short summaries") &&
    reviews.includes("Leave your own review") &&
    !/trustpilot/i.test(reviews),
  "reviews route should collect moderated first-party order reviews without Trustpilot"
);
assert(
  reviewApi.includes("PROHIBITED_REVIEW_TERMS") &&
    reviewApi.includes("ORDER_NOTIFY_EMAIL") &&
    reviewApi.includes("escapeHtml") &&
    reviewApi.includes("RESEND_API_KEY"),
  "review submission API should validate, notify, and escape review content"
);
assert(
  sitemap.includes("https://www.northpeptidesuk.com/reviews/"),
  "sitemap should include the reviews route"
);
for (const loc of sitemap.matchAll(/<loc>https:\/\/www\.northpeptidesuk\.com\/([^<]*)<\/loc>/g)) {
  let file = loc[1] || "index.html";
  if (file.endsWith("/")) file += "index.html";
  if (!file.endsWith(".html")) continue;
  if (!fs.existsSync(path.join(root, file))) continue;
  assert(
    !/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(read(file)),
    `sitemap page ${file} should not be noindex`
  );
}
assert(
  !index.includes("onclick=\"adjustProductQty(") &&
    index.includes("function addBundleToBasket(selId, name)") &&
    index.includes('shop-card-info-icon">View</div>'),
  "homepage product cards should add one item at a time and make images clearly open product details"
);
assert(
  index.includes('class="shop-card supply-card" id="product-pen-tips"') &&
    index.includes('class="shop-card supply-card" id="product-bacteriostatic-water"') &&
    index.includes("Disposable tips for compatible pen-style research kits") &&
    index.includes("10ml sealed vial") &&
    index.includes("insulin needles in a sealed pack") &&
    index.includes("10 single-use preparation wipes"),
  "research supplies should use practical, distinct card content"
);
assert(
  productData.includes('"pen-tips": {') &&
    productData.includes('["Pack", "5 Tips"]') &&
    productData.includes('"bacteriostatic-water": {') &&
    productData.includes('["Volume", "10ml"]') &&
    productData.includes('"syringe-kit": {') &&
    productData.includes('["Pack", "10 Needles"]') &&
    productData.includes('"alcohol-wipes": {') &&
    productData.includes('["Pack", "10 Wipes"]') &&
    !productData.includes('"pen-tips": {\n    name: "Sterile Disposable Pen Tips",\n    category: "Research supplies",\n    image: "research-pen-tips.jpg",\n    summary: "Universal-fit sterile disposable pen tips for pen-style research setups.",\n    details: [\n      "6mm universal-fit tips",\n      "Supplied sealed",\n      "Compatible with pen-style research kits",\n      "Research use only"\n    ],\n    variants:'),
  "supply detail pages should define practical information instead of peptide defaults"
);
