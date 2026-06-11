const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const checkout = read("checkout.html");
const basket = read("basket.js");
const serverCheckout = read(path.join("server", "stripe-checkout.js"));
const index = read("index.html");

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
