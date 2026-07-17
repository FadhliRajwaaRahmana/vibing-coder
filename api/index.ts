export const config = {
  supportsResponseStreaming: true,
};

let cachedHandler: ((req: Request) => Response | Promise<Response>) | null = null;
let initError: string | null = null;

async function getHandler() {
  if (cachedHandler) return cachedHandler;
  if (initError) return null;

  try {
    const { handle } = await import("hono/vercel");
    const mod = await import("../apps/server/src/index");
    cachedHandler = handle(mod.default);
    return cachedHandler;
  } catch (e: any) {
    initError = JSON.stringify({
      error: "Module initialization failed",
      message: e.message,
      stack: e.stack?.split("\n").slice(0, 10),
    });
    return null;
  }
}

export default async function handler(req: Request) {
  const h = await getHandler();
  if (!h) {
    return new Response(initError || '{"error":"unknown"}', {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    return await h(req);
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        error: "Handler execution failed",
        message: e.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
