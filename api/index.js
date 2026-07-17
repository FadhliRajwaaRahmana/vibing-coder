import { handle } from "hono/vercel";
import app from "../apps/server/src/index.js";

export default handle(app);
