const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checkout = read("checkout.html");
const basket = read("basket.js");
const serverCheckout = read(path.join("server", "stripe-checkout.js"));
const index = read("index.html");
const product = read("product.html");
const productData = read("product-data.js");
const webhook = read(path.join("api", "stripe-webhook.js"));
const apiCheckout = read(path.join("api", "create-checkout-session.js"));
const vercelConfig = fs.existsSync(path.join(root, "vercel.json")) ? read("vercel.json") : "";

const expectedAccessoryPrices = [
  ["Essentials Bundle", "Bac water + syringe kit + wipes", "14.99"],
  ["Bacteriostatic Water", "10ml vial", "6.99"],
  ["Syringe Kit", "10 pack, 1ml + larger gauge for reconstitution", "6.99"],
  ["Alcohol Wipes", "50 pack", "2.99"]
];

for (const [name, dose, price] of expectedAccessoryPrices) {
  assert(
    checkout.includes(`addCheckoutAddon(this,'${name}',${price},'${dose}')`),
    `${name} checkout add-on should use ${price}`
  );
  assert(
    serverCheckout.includes(`"${name}|${dose}": ${price}`),
    `${name} Stripe catalog should use ${price}`
  );
}

assert(
  index.includes(".acc-grid { grid-template-columns: 1fr; gap: 10px;"),
  "mobile product grid should use one tight column"
);
assert(
  index.includes(".shop-card { display: grid; grid-template-columns: 116px minmax(0, 1fr);"),
  "mobile product cards should use compact image/detail columns"
);
assert(
  index.includes(".shop-card-img { aspect-ratio: auto; min-height: 136px; height: 100%;"),
  "mobile product images should be compact thumbnails"
);
assert(
  index.includes(".shop-add-btn { min-height: 42px;"),
  "mobile add buttons should keep a reliable touch target"
);

assert(
  checkout.includes("function formatMoney(value)") &&
    checkout.includes("formatMoney(item.price * item.qty)") &&
    basket.includes("function formatMoney(value)") &&
    basket.includes("formatMoney(item.price * item.qty)"),
  "basket and checkout rows should format decimal prices consistently"
);

assert(
  serverCheckout.includes("const SITE_URL = \"https://northpeptidesuk.com\"") &&
    serverCheckout.includes("function isAllowedOrigin(origin)") &&
    !serverCheckout.includes("payload.origin ||"),
  "checkout session return URLs should not trust arbitrary browser origins"
);
assert(
  !serverCheckout.includes('"Access-Control-Allow-Origin": "*"') &&
    apiCheckout.includes("req.headers.origin") &&
    apiCheckout.includes('req.method !== "POST"'),
  "checkout API should restrict CORS and methods"
);
assert(
  webhook.includes("function escapeHtml(value)") &&
    webhook.includes("escapeHtml(metadata.notes)") &&
    !webhook.includes('"Access-Control-Allow-Origin": "*"'),
  "webhook emails should escape customer content and avoid wildcard CORS"
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
  index.includes("function productQty(qtyId)") &&
    index.includes("function adjustProductQty(qtyId, delta)") &&
    index.includes("addBundleToBasket('reta-sel','Retatrutide','reta-qty')"),
  "homepage product cards should have quantity adders wired to add-to-basket"
);
assert(
  product.includes("function selectedQuantity()") &&
    product.includes("function adjustDetailQty(delta)") &&
    product.includes("addItemToBasket(product.name, variant.price, variant.dose, selectedQuantity())"),
  "product detail page should add selected quantity"
);
