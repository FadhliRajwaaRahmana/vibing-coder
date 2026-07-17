import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const pool = new pg.Pool({
  host: process.env.DB_HOST || "kelas-fullstack-rustmail-52be.k.aivencloud.com",
  port: Number(process.env.DB_PORT) || 13615,
  database: process.env.DB_NAME || "defaultdb",
  user: process.env.DB_USER || "avnadmin",
  password: process.env.DB_PASSWORD || "",
  ssl: { rejectUnauthorized: false },
});

export const db = drizzle(pool, { schema });
export type Database = typeof db;
