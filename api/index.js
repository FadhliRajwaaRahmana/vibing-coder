const handler = require("./_server.cjs");
module.exports = typeof handler.default === "function" ? handler.default : handler;
