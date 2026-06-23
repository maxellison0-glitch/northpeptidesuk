const { corsHeaders, createCheckoutSession } = require("../../server/stripe-checkout.js");

exports.handler = async (event) => {
  const headers = corsHeaders(event.headers.origin);

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    return await createCheckoutSession(JSON.parse(event.body || "{}"), event.headers.origin);
  } catch {
    return {
      statusCode: 400,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid request body." })
    };
  }
};
