const { corsHeaders, createCheckoutSession } = require("../server/stripe-checkout.js");

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;

  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    Object.entries({ ...corsHeaders(origin), "Content-Type": "application/json" }).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    return res.status(405).send(JSON.stringify({ error: "Method not allowed" }));
  }

  const result = await createCheckoutSession(req.body || {}, origin);

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(result.statusCode || 200).send(result.body || "");
};
