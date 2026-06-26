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
  "Insulin Needle Pack|10 pack, 1ml insulin needles": 6.99,
  "Insulin Needle Pack|Accessory": 6.99,
  "Alcohol Wipes|10 pack": 2.99,
  "Pen-Style Research Kit|3ml cartridge + BAC water + x5 pen tips": 24.99,
  "Sterile Disposable Pen Tips|6mm x5": 3.99,
  "Sterile Disposable Pen Tips|6mm x10": 6.99,
  "Thermal Cooled Packaging|Insulated foil pouch + gel packs": 3,
  // Compounds previously missing from the catalogue (were 400ing at checkout):
  "Retatrutide|50mg": 179.99,
  "NAD+|1000mg": 84.99,
  "SS-31|10mg": 24.99,
  "Semax|30mg": 20.99,
  "Selank|30mg": 20.99,
  "Epitalon|10mg": 13.99,
  "Pinealon|20mg": 29.99,
  // Intranasal kit — keyed for the homepage card, the product-page variant and
  // the discounted "+kit" add-on button (all three dose strings the UI sends):
  "Intranasal Research Kit|Kit add-on": 4.99,
  "Intranasal Research Kit|10ml nasal spray + sterile saline + transfer syringe + adaptor + wipes + label": 6.99,
  "Intranasal Research Kit|10ml nasal spray + saline + syringe + adaptor + wipes + label": 6.99
};

const PEN_STYLE_KIT_PRICES = new Set([24.99, 19.99, 14.99]);

const DISCOUNT_CODES = {
  "WELCOME10":    0.10,
  "AJ":           0.10,
  "AJ20":         0.20
};

const DELIVERY = {
  standard: { label: "Royal Mail Tracked 24", price: 3 },
  express: { label: "Royal Mail Special Delivery", price: 7.95 }
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
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
}

function json(statusCode, body, origin) {
  return {
    statusCode,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function compactText(value, maxLength = 480) {
  return String(value || "").trim().slice(0, maxLength);
}

function resolveCatalogPrice(item, name, dose) {
  const directPrice = CATALOG[`${name}|${dose}`];
  if (directPrice) return directPrice;

  if (name === "Pen-Style Research Kit" && item?._kitFor) {
    const browserPrice = Number(item.price);
    const volume = Number(item._kitVolume);
    if (PEN_STYLE_KIT_PRICES.has(browserPrice) && [1, 2, 3].includes(volume)) {
      return browserPrice;
    }
  }

  return null;
}

async function createCheckoutSession(payload = {}, requestOrigin) {
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: "Stripe is not configured yet." }, requestOrigin);

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) return json(400, { error: "Your basket is empty." }, requestOrigin);
  const discountCode = String(payload.discountCode || "").trim().toUpperCase();
  const discountPct = DISCOUNT_CODES[discountCode] || 0;
  const hasDiscount = discountPct > 0;

  const lineItems = [];
  for (const item of items) {
    const name = compactText(item.name, 80);
    const dose = compactText(item.dose, 80);
    const key = `${name}|${dose}`;
    const price = resolveCatalogPrice(item, name, dose);
    const quantity = Math.max(1, Math.min(Number.parseInt(item.qty, 10) || 1, 12));

    if (!price) return json(400, { error: `Unavailable item: ${name} ${dose}` }, requestOrigin);

    const discountedPrice = hasDiscount ? price * (1 - discountPct) : price;
    lineItems.push({
      "price_data][currency": "gbp",
      "price_data][product_data][name": `${name} ${dose}`,
      "price_data][product_data][description": "Research use only. Not for human or animal consumption.",
      "price_data][unit_amount": Math.round(discountedPrice * 100),
      quantity
    });
  }

  const delivery = DELIVERY[payload.deliveryMethod] || DELIVERY.standard;
  const productSubtotal = lineItems.reduce((sum, li) => sum + (li["price_data][unit_amount"] / 100) * li.quantity, 0);
  const isExpress = payload.deliveryMethod === 'express';
  const freeStandard = !isExpress && (discountCode === 'AJ' || discountCode === 'SUMMERSHIP' || productSubtotal >= 30);
  const deliveryCharge = isExpress ? delivery.price : (freeStandard ? 0 : 3);
  if (deliveryCharge > 0) {
    lineItems.push({
      "price_data][currency": "gbp",
      "price_data][product_data][name": delivery.label,
      "price_data][unit_amount": Math.round(deliveryCharge * 100),
      quantity: 1
    });
  }

  const siteUrl = SITE_URL;
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${siteUrl}/checkout.html?payment=success&session_id={CHECKOUT_SESSION_ID}`);
  params.append("cancel_url", `${siteUrl}/checkout.html?payment=cancelled`);
  params.append("payment_method_types[]", "card");
  params.append("billing_address_collection", "required");
  params.append("phone_number_collection[enabled]", "true");
  const customerEmail = compactText(payload.customer?.email, 160);
  if (customerEmail) params.append("customer_email", customerEmail);
  params.append("metadata[name]", compactText(payload.customer?.name, 120));
  params.append("metadata[email]", compactText(payload.customer?.email, 160));
  params.append("metadata[address]", compactText(payload.customer?.address, 480));
  params.append("metadata[notes]", compactText(payload.customer?.notes, 480));
  params.append("metadata[delivery]", delivery.label);
  if (hasDiscount) params.append("metadata[discount]", discountCode);
  params.append("custom_text[submit][message]", "Products are supplied strictly for laboratory research use only and are not for human or animal consumption.");

  lineItems.forEach((lineItem, index) => {
    Object.entries(lineItem).forEach(([key, value]) => {
      params.append(`line_items[${index}][${key}]`, String(value));
    });
  });

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params
    });
    const data = await response.json();
    if (!response.ok) return json(response.status, { error: data.error?.message || "Stripe checkout failed." }, requestOrigin);
    return json(200, { url: data.url }, requestOrigin);
  } catch {
    return json(500, { error: "Could not connect to Stripe." }, requestOrigin);
  }
}

module.exports = {
  corsHeaders,
  isAllowedOrigin,
  createCheckoutSession
};
