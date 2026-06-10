const CATALOG = {
  "Retatrutide|10mg": 40,
  "Retatrutide|15mg": 58,
  "Retatrutide|20mg": 76,
  "Retatrutide|2x 10mg": 73,
  "Retatrutide|2x 15mg": 105,
  "Retatrutide|2x 20mg": 138,
  "Retatrutide|3x 10mg": 97,
  "Retatrutide|3x 15mg": 140,
  "Retatrutide|3x 20mg": 184,
  "Tirzepatide|15mg": 58,
  "Tirzepatide|30mg": 108,
  "Tirzepatide|2x 15mg": 105,
  "Tirzepatide|2x 30mg": 194,
  "Tirzepatide|3x 15mg": 140,
  "Tirzepatide|3x 30mg": 259,
  "BPC-157|10mg": 17,
  "BPC-157|2x 10mg": 31,
  "BPC-157|3x 10mg": 41,
  "TB-500|10mg": 44,
  "TB-500|2x 10mg": 79,
  "TB-500|3x 10mg": 106,
  "GHK-Cu|50mg": 15,
  "GHK-Cu|2x 50mg": 28,
  "GHK-Cu|3x 50mg": 37,
  "KPV|10mg": 20,
  "KPV|2x 10mg": 36,
  "KPV|3x 10mg": 48,
  "KLOW Stack|80mg": 54,
  "KLOW Stack|2x 80mg": 97,
  "KLOW Stack|3x 80mg": 130,
  "Ipamorelin|5mg": 17,
  "Ipamorelin|2x 5mg": 31,
  "Ipamorelin|3x 5mg": 41,
  "CJC-1295 (No DAC)|5mg": 29,
  "CJC-1295 (No DAC)|2x 5mg": 52,
  "CJC-1295 (No DAC)|3x 5mg": 69,
  "CJC-1295 No DAC|5mg": 29,
  "CJC-1295 No DAC|2x 5mg": 52,
  "CJC-1295 No DAC|3x 5mg": 69,
  "Essentials Bundle|Bac water + syringe kit + wipes": 18,
  "Bacteriostatic Water|10ml vial": 7,
  "Bacteriostatic Water|Accessory": 7,
  "Syringe Kit|10 pack, 1ml": 9,
  "Syringe Kit|Accessory": 9,
  "Alcohol Wipes|50 pack": 5
};

const DELIVERY = {
  standard: { label: "Royal Mail Tracked 24", price: 4.95 },
  express: { label: "Royal Mail Special Delivery", price: 9.95 }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  };
}

function compactText(value, maxLength = 480) {
  return String(value || "").trim().slice(0, maxLength);
}

async function createCheckoutSession(payload = {}) {
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: "Stripe is not configured yet." });

  const items = Array.isArray(payload.items) ? payload.items : [];
  if (!items.length) return json(400, { error: "Your basket is empty." });
  const discountCode = String(payload.discountCode || "").trim().toUpperCase();
  const hasWelcomeDiscount = discountCode === "WELCOME10";

  const lineItems = [];
  for (const item of items) {
    const name = compactText(item.name, 80);
    const dose = compactText(item.dose, 80);
    const key = `${name}|${dose}`;
    const price = CATALOG[key];
    const quantity = Math.max(1, Math.min(Number.parseInt(item.qty, 10) || 1, 12));

    if (!price) return json(400, { error: `Unavailable item: ${name} ${dose}` });

    const discountedPrice = hasWelcomeDiscount ? price * 0.9 : price;
    lineItems.push({
      "price_data][currency": "gbp",
      "price_data][product_data][name": `${name} ${dose}`,
      "price_data][product_data][description": "Research use only. Not for human or animal consumption.",
      "price_data][unit_amount": Math.round(discountedPrice * 100),
      quantity
    });
  }

  const delivery = DELIVERY[payload.deliveryMethod] || DELIVERY.standard;
  lineItems.push({
    "price_data][currency": "gbp",
    "price_data][product_data][name": delivery.label,
    "price_data][unit_amount": Math.round(delivery.price * 100),
    quantity: 1
  });

  const siteUrl = (process.env.URL || payload.origin || "https://northpeptidesuk.vercel.app").replace(/\/$/, "");
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
  if (hasWelcomeDiscount) params.append("metadata[discount]", "WELCOME10");
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
    if (!response.ok) return json(response.status, { error: data.error?.message || "Stripe checkout failed." });
    return json(200, { url: data.url });
  } catch {
    return json(500, { error: "Could not connect to Stripe." });
  }
}

module.exports = {
  corsHeaders,
  createCheckoutSession
};
