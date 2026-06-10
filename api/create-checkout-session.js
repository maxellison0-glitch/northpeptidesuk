const { createCheckoutSession } = require("../server/stripe-checkout.js");

module.exports = async function handler(req, res) {
  const result = await createCheckoutSession(req.body || {});

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(result.statusCode || 200).send(result.body || "");
};
