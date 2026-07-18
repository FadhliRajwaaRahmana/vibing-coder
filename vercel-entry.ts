import { getRequestListener } from "@hono/node-server";
import app from "./apps/server/src/index";

export default getRequestListener(app.fetch.bind(app));
