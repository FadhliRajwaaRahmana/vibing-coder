export const config = {
  supportsResponseStreaming: true,
};

export default function handler(req: Request) {
  const url = new URL(req.url);

  return new Response(
    JSON.stringify({
      status: "debug",
      path: url.pathname,
      node: process.version,
      envKeys: Object.keys(process.env)
        .filter(
          (k) =>
            k.startsWith("DB_") ||
            k.startsWith("BETTER_") ||
            k.startsWith("FRONTEND") ||
            k === "VERCEL" ||
            k === "NODE_ENV"
        )
        .sort(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
