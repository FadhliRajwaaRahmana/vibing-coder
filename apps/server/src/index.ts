import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "dotenv/config";

import { auth } from "./auth.js";
import coursesRoutes from "./routes/courses.js";
import discussionsRoutes from "./routes/discussions.js";
import quizzesRoutes from "./routes/quizzes.js";
import certificatesRoutes from "./routes/certificates.js";
import dashboardRoutes from "./routes/dashboard.js";
import swaggerRoutes from "./routes/swagger.js";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api/courses", coursesRoutes);
app.route("/api/discussions", discussionsRoutes);
app.route("/api/quizzes", quizzesRoutes);
app.route("/api/certificates", certificatesRoutes);
app.route("/api/dashboard", dashboardRoutes);
app.route("/api/docs", swaggerRoutes);

app.get("/api/health", (c) => c.json({ status: "ok" }));

export default app;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT) || 3000;
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
