// Daily job (see "crons" in vercel.json): emails "How was your order?" to each
// customer whose order was dispatched three working days ago. Vercel calls it
// with "Authorization: Bearer <CRON_SECRET>"; ADMIN_KEY also works, for a manual run.

const { openOrderStore } = require("../server/order-store.js");
const { authorize } = require("../server/admin-auth.js");
const { sendDueReviewRequests, resendEmail } = require("../server/review-requests.js");

function send(res, status, body) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).send(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") return send(res, 405, { ok: false, error: "Method not allowed." });

  const access = authorize(req, ["CRON_SECRET", "ADMIN_KEY"]);
  if (access === "unconfigured") {
    console.error("[review-requests] skipped: CRON_SECRET is not set (16+ characters)");
    return send(res, 503, { ok: false, error: "Set CRON_SECRET in Vercel to switch on review emails." });
  }
  if (access !== "ok") return send(res, 401, { ok: false, error: "Unauthorised." });

  if (!process.env.RESEND_API_KEY) return send(res, 503, { ok: false, error: "Email service is not configured." });

  let store;
  try {
    store = openOrderStore();
  } catch (err) {
    console.error(`[review-requests] skipped: ${err.message}`);
    return send(res, 503, { ok: false, error: err.message });
  }

  try {
    const summary = await sendDueReviewRequests({ store, sendEmail: resendEmail });
    for (const result of summary.results) {
      const log = result.status === "failed" ? console.error : console.log;
      log(`[review-requests] ${result.ref}: ${result.status}${result.reason ? ` (${result.reason})` : ""}`);
    }
    console.log(`[review-requests] ${summary.results.length} processed, ${summary.due} were due`);
    return send(res, 200, { ok: true, ...summary });
  } catch (err) {
    console.error(`[review-requests] run failed: ${err.message}`);
    return send(res, 500, { ok: false, error: "Review email run failed." });
  }
};
