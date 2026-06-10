const netlifyCheckout = require("../netlify/functions/create-checkout-session.js");

module.exports = async function handler(req, res) {
  const event = {
    httpMethod: req.method,
    body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {})
  };

  const result = await netlifyCheckout.handler(event);

  Object.entries(result.headers || {}).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.status(result.statusCode || 200).send(result.body || "");
};
