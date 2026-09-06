function calculateDelivery(deliveryMethod, discountCode, productSubtotal) {
  // "express" is the legacy value from cached checkout pages (Special Delivery,
  // now retired) — mapped to Tracked 24 so a stale tab is never overcharged.
  const method = deliveryMethod === "dhl" ? "dhl"
    : (deliveryMethod === "tracked24" || deliveryMethod === "express") ? "tracked24"
    : "standard";
  const delivery = DELIVERY[method];
  const code = String(discountCode || "").trim().toUpperCase();
  const freeStandard = method === "standard" && (FREE_DELIVERY_CODES.has(code) || productSubtotal >= 100);
  const charge = freeStandard ? 0 : delivery.price;
  return { method, label: delivery.label, charge };
}const CATALOG = {
  "Retatrutide|10mg": 50,
  "Retatrutide|15mg": 70,
  "Retatrutide|20mg": 90,
  "Tirzepatide|15mg": 70,
  "Tirzepatide|30mg": 120,
  "BPC-157|10mg": 25,
  "TB-500|10mg": 50,
  "GHK-Cu|50mg": 30,
  "KPV|10mg": 30,
  "KLOW Stack|80mg": 60,
  "Ipamorelin|5mg": 25,
  "CJC-1295 (No DAC)|5mg": 35,
  "CJC-1295 No DAC|5mg": 35,
  "Bacteriostatic Water|10ml vial": 10,
  "Bacteriostatic Water|3ml vial": 4,
  // Legacy product.html add-on button sends the 3ml vial as "Accessory".
  "Bacteriostatic Water|Accessory": 4,
  // Cached product pages and saved baskets may still send this older dose string.
  "Bacteriostatic Water|10ml vial add-on": 10,
  "Insulin Needle Pack|10 pack, 1ml insulin needles": 7,
  "Insulin Needle Pack|Accessory": 7,
  "Alcohol Wipes|10 pack": 3,
  "Pen-Style Research Kit|3ml cartridge + BAC water + x5 pen tips": 25,
  "Sterile Disposable Pen Tips|6mm x5": 3.99,
  "Sterile Disposable Pen Tips|6mm x10": 4.99,
  "Thermal Cooled Packaging|Insulated foil pouch + gel packs": 5,
  "Retatrutide|50mg": 180,
  "NAD+|1000mg": 90,
  "SS-31|10mg": 25,
  "Semax|30mg": 25,
  "Selank|30mg": 25,
  "Epitalon|10mg": 15,
  "Pinealon|20mg": 30,
  "Intranasal Research Kit|Kit add-on": 5,
  "Intranasal Research Kit|10ml nasal spray + sterile saline + transfer syringe + adaptor + wipes + label": 7,
  "Intranasal Research Kit|10ml nasal spray + saline + syringe + adaptor + wipes + label": 7,
  "Disposable Research Pen Kit|Kit add-on": 10,
  "Retatrutide Pen Vial|10mg": 70,
  "Retatrutide Pen Vial|20mg": 110,
  "Retatrutide Pen Vial|50mg": 200,
  "Tirzepatide Pen Vial|15mg / 3ml": 90,
  "Tirzepatide Pen Vial|30mg / 3ml": 140,
  "BPC-157 Pen Vial|10mg / 3ml": 40,
  "BPC-157 Pen Vial|20mg / 3ml": 70,
  "TB-500 Pen Vial|10mg / 3ml": 70,
  "GHK-Cu Pen Vial|50mg / 3ml": 45,
  "KPV Pen Vial|10mg / 3ml": 45,
  "KLOW Stack Pen Vial|80mg / 3ml": 80,
  "Ipamorelin Pen Vial|5mg / 3ml": 40,
  "CJC-1295 Pen Vial|5mg / 3ml": 50,
  "NAD+ Pen Vial|1000mg / 3ml": 110,
  "SS-31 Pen Vial|10mg / 3ml": 40,
  "Epitalon Pen Vial|10mg / 3ml": 30,
  "Pinealon Pen Vial|20mg / 3ml": 45
};

function normaliseKey(value) {
  return String(value || "").replace(/\s+/g, " ").replace(/\s*\/\s*/g, "/").trim();
}

const CATALOG_NORMALISED = {};
for (const [key, value] of Object.entries(CATALOG)) {
  CATALOG_NORMALISED[normaliseKey(key)] = value;
}

const PUBLIC_DISCOUNT_CODES = {
  WELCOME10: 0.10,
  AJ: 0.10,
  AJ20: 0.20,
  MO25: 0.25,
  SAHAR25: 0.25,
  CHRIS25: 0.25,
  KURT25: 0.25,
  JAN25: 0.25
};

function loadPrivateDiscountCodes() {
  const raw = process.env.DISCOUNT_CODES_JSON;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const cleaned = {};
    for (const [code, pct] of Object.entries(parsed)) {
      const key = String(code).trim().toUpperCase();
      const num = Number(pct);
      if (key && Number.isFinite(num) && num > 0 && num < 1) cleaned[key] = num;
    }
    return cleaned;
  } catch {
    return {};
  }
}

const DISCOUNT_CODES = { ...PUBLIC_DISCOUNT_CODES, ...loadPrivateDiscountCodes() };
const FREE_DELIVERY_CODES = new Set(["SUMMERSHIP", "AJ"]);

const DELIVERY = {
  standard: { label: "Royal Mail Tracked 48", price: 3.99 },
  tracked24: { label: "Royal Mail Tracked 24", price: 6.99 },
  dhl: { label: "DHL Express", price: 11.99 }
};

const SITE_URL = "https://northpeptidesuk.com";
const ALLOWED_ORIGINS = new Set([
  SITE_URL,
  "https://www.northpeptidesuk.com",
  "https://northpeptidesuk.vercel.app"
]);

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(String(origin || "").replace(/\/$/, ""));
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin) ? String(origin).replace(/\/$/, "") : SITE_URL,
    Vary: "Origin",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

function compactText(value, maxLength = 480) {
  return String(value || "").trim().slice(0, maxLength);
}

function resolveCatalogPrice(_item, name, dose) {
  const directPrice = CATALOG[`${name}|${dose}`];
  if (directPrice != null) return directPrice;

  const normalisedPrice = CATALOG_NORMALISED[normaliseKey(`${name}|${dose}`)];
  return normalisedPrice != null ? normalisedPrice : null;
}

function validateOrderItems(items, discountPct = 0) {
  if (!Array.isArray(items) || !items.length) {
    return { error: "Your basket is empty." };
  }

  const validatedItems = [];
  for (const item of items) {
    const name = compactText(item?.name, 80);
    const dose = compactText(item?.dose, 80);
    const price = resolveCatalogPrice(item, name, dose);
    const qty = Math.max(1, Math.min(Number.parseInt(item?.qty, 10) || 1, 12));

    if (price == null) return { error: `Unavailable item: ${name} ${dose}` };

    const unitPrice = price * (1 - discountPct);
    validatedItems.push({
      name,
      dose,
      qty,
      listPrice: price,
      listTotal: price * qty,
      unitPrice,
      lineTotal: unitPrice * qty
    });
  }

  return {
    items: validatedItems,
    // Discounted product total — what the customer actually pays for the items.
    productSubtotal: validatedItems.reduce((sum, item) => sum + item.lineTotal, 0),
    // Undiscounted (list-price) product total. The free-delivery threshold is
    // judged on this figure so a percentage code never costs a customer the
    // free delivery their basket earned (WELCOME10 on an exact £100 basket).
    grossSubtotal: validatedItems.reduce((sum, item) => sum + item.listTotal, 0)
  };
}

// productSubtotal must be the PRE-DISCOUNT product subtotal (grossSubtotal from
// validateOrderItems); free-delivery codes still force free standard delivery.
function calculateDelivery(deliveryMethod, discountCode, productSubtotal) {
  const method = deliveryMethod === "dhl" ? "dhl" : (deliveryMethod === "tracked24" || deliveryMethod === "express") ? "tracked24" : "standard";
  const delivery = DELIVERY[method];
  const code = String(discountCode || "").trim().toUpperCase();
  const freeStandard = method === "standard" && (FREE_DELIVERY_CODES.has(code) || productSubtotal >= 100);
  const charge = freeStandard ? 0 : delivery.price;
  return { method, label: delivery.label, charge };
}

module.exports = {
  CATALOG,
  CATALOG_NORMALISED,
  PUBLIC_DISCOUNT_CODES,
  DISCOUNT_CODES,
  FREE_DELIVERY_CODES,
  DELIVERY,
  normaliseKey,
  resolveCatalogPrice,
  validateOrderItems,
  calculateDelivery,
  compactText,
  corsHeaders,
  isAllowedOrigin
};
