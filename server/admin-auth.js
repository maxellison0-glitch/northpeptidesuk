// Access checks for the owner-only endpoints (the dispatch page API and the
// daily review-email job). Secrets shorter than 16 characters count as unset.
//
// The dispatch page logs in once with ADMIN_KEY and then holds a signed,
// HttpOnly session cookie, so the key is never kept where page scripts (such
// as the analytics tags on the public pages) could read it.

const crypto = require("node:crypto");

const MIN_SECRET_LENGTH = 16;
const SESSION_COOKIE = "npuk_admin";
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const COOKIE_ATTRIBUTES = "Path=/api/orders/; HttpOnly; Secure; SameSite=Strict";

function usableSecrets(envNames) {
  return envNames
    .map(name => String(process.env[name] || ""))
    .filter(value => value.length >= MIN_SECRET_LENGTH);
}

function bearerToken(req) {
  const match = /^Bearer\s+(.+)$/i.exec(String((req.headers && req.headers.authorization) || ""));
  return match ? match[1].trim() : "";
}

// Compares fixed-length digests so neither the length nor the content of the
// secret leaks through timing.
function sameSecret(a, b) {
  const digest = value => crypto.createHash("sha256").update(String(value)).digest();
  return crypto.timingSafeEqual(digest(a), digest(b));
}

// "ok", "unconfigured" (none of the named secrets is set) or "denied".
function authorize(req, envNames) {
  const secrets = usableSecrets(envNames);
  if (!secrets.length) return "unconfigured";
  const token = bearerToken(req);
  return token && secrets.some(secret => sameSecret(token, secret)) ? "ok" : "denied";
}

function adminKey() {
  return usableSecrets(["ADMIN_KEY"])[0] || "";
}

function isAdminKey(candidate) {
  const secret = adminKey();
  return Boolean(secret && candidate && sameSecret(candidate, secret));
}

// Signed with ADMIN_KEY, so changing the key logs every device out.
function sessionSignature(secret, expires) {
  return crypto.createHmac("sha256", secret).update(`admin-session:${expires}`).digest("base64url");
}

function createSessionCookie(now = Date.now()) {
  const expires = Math.floor(now / 1000) + SESSION_SECONDS;
  return `${SESSION_COOKIE}=${expires}.${sessionSignature(adminKey(), expires)}; Max-Age=${SESSION_SECONDS}; ${COOKIE_ATTRIBUTES}`;
}

function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Max-Age=0; ${COOKIE_ATTRIBUTES}`;
}

function readCookie(req, name) {
  for (const part of String((req.headers && req.headers.cookie) || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

function hasValidSession(req, secret, now = Date.now()) {
  const [expires, signature] = readCookie(req, SESSION_COOKIE).split(".");
  if (!/^\d+$/.test(expires || "") || Number(expires) * 1000 <= now) return false;
  return sameSecret(signature || "", sessionSignature(secret, expires));
}

// Dispatch page API: the session cookie, or ADMIN_KEY as a bearer token for scripts.
function authorizeAdmin(req) {
  const secret = adminKey();
  if (!secret) return "unconfigured";
  const token = bearerToken(req);
  if (token && sameSecret(token, secret)) return "ok";
  return hasValidSession(req, secret) ? "ok" : "denied";
}

module.exports = {
  authorize,
  authorizeAdmin,
  isAdminKey,
  createSessionCookie,
  clearSessionCookie,
  usableSecrets,
  MIN_SECRET_LENGTH,
  SESSION_COOKIE
};
