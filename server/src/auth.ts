import { createHmac, timingSafeEqual } from "node:crypto";
import { Hono, type Context, type Next } from "hono";

const PIN = process.env.PIN ?? "";
const SECRET = process.env.SECRET ?? PIN;
const TOKEN_TTL_S = 30 * 24 * 60 * 60;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(payload: object): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode(input: string): Record<string, unknown> | null {
  try {
    return JSON.parse(Buffer.from(input, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export function issueToken(): { token: string; expiresAt: string } {
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_S;
  const payload = encode({ exp: expiresAt });
  return { token: `${payload}.${sign(payload)}`, expiresAt: new Date(expiresAt * 1000).toISOString() };
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expected);
  if (!timingSafeEqual(sigA, sigB)) return false;
  const data = decode(payload);
  if (!data || typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return false;
  return true;
}

function verifyPin(pin: string): boolean {
  if (!PIN) return false;
  const a = createHmac("sha256", SECRET).update(pin).digest();
  const b = createHmac("sha256", SECRET).update(PIN).digest();
  return a.length === b.length && timingSafeEqual(a, b);
}

export const authRoute = new Hono();

authRoute.post("/", async (c) => {
  if (!PIN) return c.json({ error: "PIN is not configured on the server" }, 500);
  const body = await c.req.json().catch(() => null);
  const pin = typeof body?.pin === "string" ? body.pin : "";
  if (!verifyPin(pin)) return c.json({ error: "Incorrect PIN" }, 401);
  const { token, expiresAt } = issueToken();
  return c.json({ token, expiresAt });
});

export async function requireAuth(c: Context, next: Next): Promise<Response | void> {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!verifyToken(token)) return c.json({ error: "Unauthorized" }, 401);
  await next();
}
