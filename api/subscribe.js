// Newsletter / email-capture endpoint.
// Stores the address in a Resend Audience (a real mailing list you can send to later)
// when RESEND_AUDIENCE_ID is set. If no audience is configured it falls back to
// emailing the new subscriber straight to your orders@ inbox, so a signup is never
// lost. Wired to the homepage signup forms (see handleSignup in index.html).
const SITE_URL = "https://northpeptidesuk.com";

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", SITE_URL);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Content-Type", "application/json");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readJson(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function resend(path, method, body) {
  const response = await fetch(`https://api.resend.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Resend ${path} failed.`);
  return data;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send(JSON.stringify({ ok: false, error: "Method not allowed" }));

  let email = "";
  try {
    ({ email } = await readJson(req));
  } catch {
    return res.status(400).send(JSON.stringify({ ok: false, error: "Bad request" }));
  }
  email = String(email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 160) {
    return res.status(400).send(JSON.stringify({ ok: false, error: "Please enter a valid email." }));
  }

  // Nothing configured yet: accept the signup so the UI still succeeds, but flag it
  // as not stored (see EMAIL_SETUP.md to switch this on).
  if (!process.env.RESEND_API_KEY) {
    return res.status(200).send(JSON.stringify({ ok: true, stored: false }));
  }

  try {
    if (process.env.RESEND_AUDIENCE_ID) {
      await resend(`/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, "POST", {
        email,
        unsubscribed: false
      });
      return res.status(200).send(JSON.stringify({ ok: true, stored: true, method: "audience" }));
    }

    if (process.env.ORDER_NOTIFY_EMAIL) {
      await resend("/emails", "POST", {
        from: process.env.ORDER_FROM_EMAIL || "North Peptides UK <orders@northpeptidesuk.com>",
        to: [process.env.ORDER_NOTIFY_EMAIL],
        reply_to: email,
        subject: "New newsletter signup",
        html: `<p>New email-list signup:</p><p><strong>${email.replace(/</g, "&lt;")}</strong></p>`
      });
      return res.status(200).send(JSON.stringify({ ok: true, stored: true, method: "notify" }));
    }

    return res.status(200).send(JSON.stringify({ ok: true, stored: false }));
  } catch (err) {
    // A duplicate contact is a success from the visitor's point of view.
    if (/already exists|contact.*exist/i.test(err.message || "")) {
      return res.status(200).send(JSON.stringify({ ok: true, stored: true, method: "duplicate" }));
    }
    return res.status(502).send(JSON.stringify({ ok: false, error: "Could not save right now." }));
  }
};
