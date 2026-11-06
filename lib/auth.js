// Shared helpers for the admin login (Vercel serverless functions in /api).
// Secrets live only in Vercel environment variables — never in the repo.
const crypto = require("crypto");

const env = (k) => (process.env[k] || "").trim();
const REQUIRED = ["ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "ADMIN_TOTP_SECRET", "SESSION_SECRET", "GITHUB_TOKEN", "GITHUB_REPO"];
const missing = () => REQUIRED.filter((k) => !env(k));

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64url = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");

function safeEqual(a, b) {
  const A = Buffer.from(String(a));
  const B = Buffer.from(String(b));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

// Password hash format: pbkdf2$<iterations>$<salt base64>$<hash base64> (PBKDF2-SHA256, 32 bytes)
function verifyPassword(password, stored) {
  const [alg, iter, salt, hash] = String(stored).split("$");
  if (alg !== "pbkdf2" || !Number(iter) || !salt || !hash) return false;
  const out = crypto.pbkdf2Sync(String(password), Buffer.from(salt, "base64"), Number(iter), 32, "sha256");
  return safeEqual(out.toString("base64"), hash);
}

// ---- TOTP (RFC 6238): 6 digits, 30 s steps, SHA-1 — what authenticator apps use ----
function base32Decode(s) {
  const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = 0, val = 0;
  const out = [];
  for (const c of String(s).toUpperCase().replace(/[^A-Z2-7]/g, "")) {
    val = (val << 5) | A.indexOf(c);
    bits += 5;
    if (bits >= 8) {
      out.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}
function totp(secret, counter) {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac("sha1", base32Decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1e6).padStart(6, "0");
}
function verifyTotp(code, secret, now = Date.now()) {
  code = String(code || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return false;
  const c = Math.floor(now / 30000);
  // allow one step either side for clock drift
  return [-1, 0, 1].map((d) => safeEqual(totp(secret, c + d), code)).some(Boolean);
}

// ---- Session cookie: signed with SESSION_SECRET, 12 hours ----
const COOKIE = "__Host-adm";
const TTL = 12 * 3600;
// changing the password or 2FA secret logs out every existing session
const sessionVersion = () =>
  crypto.createHash("sha256").update(env("ADMIN_PASSWORD_HASH") + "|" + env("ADMIN_TOTP_SECRET")).digest("hex").slice(0, 10);
const mac = (body) => b64url(crypto.createHmac("sha256", env("SESSION_SECRET")).update(body).digest());

function setSession(res) {
  const body = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + TTL, v: sessionVersion() }));
  res.setHeader("Set-Cookie", `${COOKIE}=${body}.${mac(body)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL}`);
}
function clearSession(res) {
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
}
function readSession(req) {
  const raw = String(req.headers.cookie || "")
    .split(/;\s*/)
    .find((c) => c.startsWith(COOKIE + "="));
  if (!raw) return null;
  const [body, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!body || !sig || !safeEqual(sig, mac(body))) return null;
  try {
    const p = JSON.parse(fromB64url(body).toString());
    if (!p.exp || p.exp < Date.now() / 1000 || p.v !== sessionVersion()) return null;
    return p;
  } catch {
    return null;
  }
}

// ---- small HTTP helpers ----
function send(res, status, obj) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");
  res.end(JSON.stringify(obj));
}
async function readJson(req) {
  try {
    if (req.body && typeof req.body === "object") return req.body;
    if (typeof req.body === "string") return JSON.parse(req.body);
  } catch {
    return {};
  }
  let data = "";
  for await (const chunk of req) {
    data += chunk;
    if (data.length > 20000) break;
  }
  try {
    return JSON.parse(data || "{}");
  } catch {
    return {};
  }
}
const clientIp = (req) => String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";

// Best-effort rate limit (per warm function instance): 8 failed logins per 15 minutes per IP
const fails = new Map();
const WINDOW = 15 * 60 * 1000;
function tooMany(ip) {
  const now = Date.now();
  const list = (fails.get(ip) || []).filter((t) => now - t < WINDOW);
  fails.set(ip, list);
  return list.length >= 8;
}
const recordFail = (ip) => fails.set(ip, [...(fails.get(ip) || []), Date.now()]);

module.exports = {
  env, missing, safeEqual, verifyPassword, verifyTotp, totp, base32Decode,
  setSession, clearSession, readSession, send, readJson, clientIp, tooMany, recordFail,
};
