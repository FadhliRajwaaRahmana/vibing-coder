import app from "./apps/server/src/index";
import type { IncomingMessage, ServerResponse } from "http";

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse
) {
  try {
    const proto = (req.headers["x-forwarded-proto"] as string) || "https";
    const host = (req.headers["x-forwarded-host"] as string) || req.headers.host;
    const url = new URL(req.url || "/", `${proto}://${host}`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
      }
    }

    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body !== undefined && req.body !== null) {
        body =
          Buffer.isBuffer(req.body)
            ? req.body
            : typeof req.body === "string"
              ? req.body
              : JSON.stringify(req.body);
      } else {
        body = await readBody(req);
      }
    }

    const request = new Request(url.toString(), {
      method: req.method || "GET",
      headers,
      body,
    });

    const response = await app.fetch(request);

    const resHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });
    res.writeHead(response.status, resHeaders);

    if (response.body) {
      const reader = response.body.getReader();
      let chunk = await reader.read();
      while (!chunk.done) {
        res.write(chunk.value);
        chunk = await reader.read();
      }
    }
    res.end();
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e));
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Server error",
        message: err.message,
      })
    );
  }
}
