// GET /api/session -> who is logged in + the GitHub details the admin panel needs to publish.
// The GitHub token is only ever sent to a logged-in admin.
const A = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "GET") return A.send(res, 405, { error: "Use GET." });
  const miss = A.missing();
  if (miss.length) return A.send(res, 503, { error: "Admin login is not set up yet.", setup: true, missing: miss });
  if (!A.readSession(req)) return A.send(res, 401, { error: "Not logged in." });

  const [owner, repo] = A.env("GITHUB_REPO").split("/");
  return A.send(res, 200, {
    ok: true,
    email: A.env("ADMIN_EMAIL"),
    owner,
    repo,
    branch: A.env("GITHUB_BRANCH") || "main",
    dir: A.env("GITHUB_DIR") || "",
    token: A.env("GITHUB_TOKEN"),
  });
};
