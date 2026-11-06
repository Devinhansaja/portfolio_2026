// POST /api/login  { email, password, code } -> sets the admin session cookie
const A = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return A.send(res, 405, { error: "Use POST." });
  const miss = A.missing();
  if (miss.length) return A.send(res, 503, { error: "Admin login is not set up yet.", setup: true, missing: miss });

  const ip = A.clientIp(req);
  if (A.tooMany(ip)) return A.send(res, 429, { error: "Too many wrong attempts. Try again in 15 minutes." });

  const { email, password, code } = await A.readJson(req);
  // check all three every time so the response time doesn't reveal which one was wrong
  const okEmail = A.safeEqual(String(email || "").trim().toLowerCase(), A.env("ADMIN_EMAIL").toLowerCase());
  const okPass = A.verifyPassword(password || "", A.env("ADMIN_PASSWORD_HASH"));
  const okCode = A.verifyTotp(code, A.env("ADMIN_TOTP_SECRET"));

  if (!(okEmail && okPass && okCode)) {
    A.recordFail(ip);
    await new Promise((r) => setTimeout(r, 700));
    return A.send(res, 401, { error: "Email, password or code is wrong." });
  }
  A.setSession(res);
  return A.send(res, 200, { ok: true });
};
