const CATALOG = {
  "Retatrutide|10mg": 45,
  "Retatrutide|15mg": 65,
  "Retatrutide|20mg": 85,
  "Retatrutide|2x 10mg": 82,
  "Retatrutide|2x 15mg": 118,
  "Retatrutide|2x 20mg": 154,
  "Retatrutide|3x 10mg": 109,
  "Retatrutide|3x 15mg": 157,
  "Retatrutide|3x 20mg": 206,
  "Tirzepatide|15mg": 65,
  "Tirzepatide|30mg": 120,
  "Tirzepatide|2x 15mg": 118,
  "Tirzepatide|2x 30mg": 218,
  "Tirzepatide|3x 15mg": 157,
  "Tirzepatide|3x 30mg": 291,
  "BPC-157|10mg": 23.99,
  "BPC-157|2x 10mg": 44,
  "BPC-157|3x 10mg": 59,
  "TB-500|10mg": 49,
  "TB-500|2x 10mg": 89,
  "TB-500|3x 10mg": 119,
  "GHK-Cu|50mg": 27,
  "GHK-Cu|2x 50mg": 50,
  "GHK-Cu|3x 50mg": 68,
  "KPV|10mg": 30,
  "KPV|2x 10mg": 56,
  "KPV|3x 10mg": 75,
  "KLOW Stack|80mg": 60,
  "KLOW Stack|2x 80mg": 109,
  "KLOW Stack|3x 80mg": 145,
  "Ipamorelin|5mg": 24.99,
  "Ipamorelin|2x 5mg": 46,
  "Ipamorelin|3x 5mg": 62,
  "CJC-1295 (No DAC)|5mg": 32,
  "CJC-1295 (No DAC)|2x 5mg": 58,
  "CJC-1295 (No DAC)|3x 5mg": 77,
  "CJC-1295 No DAC|5mg": 32,
  "CJC-1295 No DAC|2x 5mg": 58,
  "CJC-1295 No DAC|3x 5mg": 77,
  "Bacteriostatic Water|10ml vial": 6.99,
  "Bacteriostatic Water|Accessory": 6.99,
  // Cached product pages and saved baskets may still send this older dose string.
  "Bacteriostatic Water|10ml vial add-on": 6.99,
  "Insulin Needle Pack|10 pack, 1ml insulin needles": 6.99,
  "Insulin Needle Pack|Accessory": 6.99,
  "Alcohol Wipes|10 pack": 2.99,
  "Pen-Style Research Kit|3ml cartridge + BAC water + x5 pen tips": 24.99,
  "Sterile Disposable Pen Tips|6mm x5": 3.99,
  "Sterile Disposable Pen Tips|6mm x10": 6.99,
  "Thermal Cooled Packaging|Insulated foil pouch + gel packs": 4.99,
  "Retatrutide|50mg": 179.99,
  "NAD+|1000mg": 84.99,
  "SS-31|10mg": 24.99,
  "Semax|30mg": 20.99,
  "Selank|30mg": 20.99,
  "Epitalon|10mg": 13.99,
  "Pinealon|20mg": 29.99,
  "Intranasal Research Kit|Kit add-on": 4.99,
  "Intranasal Research Kit|10ml nasal spray + sterile saline + transfer syringe + adaptor + wipes + label": 6.99,
  "Intranasal Research Kit|10ml nasal spray + saline + syringe + adaptor + wipes + label": 6.99,
  "Disposable Research Pen Kit|Kit add-on": 9.99,
  "Retatrutide Pen Vial|10mg": 60,
  "Retatrutide Pen Vial|20mg": 100,
  "Retatrutide Pen Vial|50mg": 194.99,
  "Tirzepatide Pen Vial|15mg / 3ml": 80,
  "Tirzepatide Pen Vial|30mg / 3ml": 144,
  "BPC-157 Pen Vial|10mg / 3ml": 38.99,
  "BPC-157 Pen Vial|20mg / 3ml": 62.98,
  "TB-500 Pen Vial|10mg / 3ml": 64,
  "GHK-Cu Pen Vial|50mg / 3ml": 42,
  "KPV Pen Vial|10mg / 3ml": 45,
  "KLOW Stack Pen Vial|80mg / 3ml": 75,
  "Ipamorelin Pen Vial|5mg / 3ml": 39.99,
  "CJC-1295 Pen Vial|5mg / 3ml": 47,
  "NAD+ Pen Vial|1000mg / 3ml": 102,
  "SS-31 Pen Vial|10mg / 3ml": 39.99,
  "Epitalon Pen Vial|10mg / 3ml": 28.99,
  "Pinealon Pen Vial|20mg / 3ml": 44.99
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
  AJ20: 0.20
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
  standard: { label: "Royal Mail Tracked 24", price: 3.99 },
  express: { label: "Royal Mail Special Delivery", price: 9.99 }
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
    validatedItems.push({ name, dose, qty, unitPrice, lineTotal: unitPrice * qty });
  }

  return {
    items: validatedItems,
    productSubtotal: validatedItems.reduce((sum, item) => sum + item.lineTotal, 0)
  };
}

function calculateDelivery(deliveryMethod, discountCode, productSubtotal) {
  const method = deliveryMethod === "express" ? "express" : "standard";
  const delivery = DELIVERY[method];
  const code = String(discountCode || "").trim().toUpperCase();
  const freeStandard = method === "standard" && (FREE_DELIVERY_CODES.has(code) || productSubtotal >= 100);
  const charge = method === "express" ? delivery.price : (freeStandard ? 0 : delivery.price);
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
