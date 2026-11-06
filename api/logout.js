// POST /api/logout -> clears the admin session cookie
const A = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return A.send(res, 405, { error: "Use POST." });
  A.clearSession(res);
  return A.send(res, 200, { ok: true });
};
