module.exports = function handler(req, res) {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    node: process.version,
    env: {
      DB_HOST: !!process.env.DB_HOST,
      DB_NAME: process.env.DB_NAME || "(not set)",
      BETTER_AUTH_SECRET: !!process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "(not set)",
      FRONTEND_URL: process.env.FRONTEND_URL || "(not set)",
      VERCEL: process.env.VERCEL || "(not set)",
    },
  });
};
