let listener;

module.exports = async function handler(req, res) {
  if (!listener) {
    try {
      const { getRequestListener } = await import("@hono/node-server");
      const { default: app } = await import("../apps/server/src/index.js");
      listener = getRequestListener(app.fetch.bind(app));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Server initialization failed",
          message: e.message,
          stack: e.stack ? e.stack.split("\n").slice(0, 8) : [],
        })
      );
      return;
    }
  }
  return listener(req, res);
};
