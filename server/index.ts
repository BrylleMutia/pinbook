import "dotenv/config";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "@hono/node-server";
import { app } from "./src/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../client/dist");

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".map": "application/json",
};

app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/api")) return next();

  const urlPath = c.req.path === "/" ? "/index.html" : c.req.path;
  const filePath = path.normalize(path.join(clientDist, urlPath));
  if (!filePath.startsWith(clientDist)) return c.text("Forbidden", 403);

  let target = filePath;
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = path.join(target, "index.html");
  } catch {
    target = path.join(clientDist, "index.html");
  }

  try {
    const content = await readFile(target);
    const type = MIME[path.extname(target).toLowerCase()] ?? "application/octet-stream";
    return c.body(content, 200, { "content-type": type });
  } catch {
    return c.text("Not found", 404);
  }
});

export default app;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
  });
}
