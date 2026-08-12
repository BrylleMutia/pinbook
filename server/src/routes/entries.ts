import { Hono } from "hono";
import { asc, eq, max } from "drizzle-orm";
import { db } from "../db.js";
import { entries, pages } from "../schema.js";
import { cleanEmoji, cleanOptionalText, cleanText, cleanUrl, isUuid } from "../validation.js";

export const entriesRoute = new Hono();

entriesRoute.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const pageId = body?.pageId;
  if (!isUuid(pageId)) return c.json({ error: "Invalid page id" }, 400);
  const title = cleanText(body?.title, 120);
  const url = cleanUrl(body?.url);
  if (!title) return c.json({ error: "Title is required (max 120 characters)" }, 400);
  if (!url) return c.json({ error: "A valid http(s) URL is required" }, 400);

  const [page] = await db.select({ id: pages.id }).from(pages).where(eq(pages.id, pageId));
  if (!page) return c.json({ error: "Page not found" }, 404);

  const [{ next }] = await db
    .select({ next: max(entries.sortOrder) })
    .from(entries)
    .where(eq(entries.pageId, pageId));

  const [entry] = await db
    .insert(entries)
    .values({
      pageId,
      title,
      url,
      description: cleanOptionalText(body?.description, 500),
      iconEmoji: cleanEmoji(body?.iconEmoji, "🔗"),
      sortOrder: (next ?? -1) + 1,
    })
    .returning();
  return c.json(entry, 201);
});

entriesRoute.put("/:id", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid entry id" }, 400);

  const body = await c.req.json().catch(() => null);
  const title = cleanText(body?.title, 120);
  const url = cleanUrl(body?.url);
  if (!title) return c.json({ error: "Title is required (max 120 characters)" }, 400);
  if (!url) return c.json({ error: "A valid http(s) URL is required" }, 400);

  const [entry] = await db
    .update(entries)
    .set({
      title,
      url,
      description: cleanOptionalText(body?.description, 500),
      iconEmoji: cleanEmoji(body?.iconEmoji, "🔗"),
      updatedAt: new Date(),
    })
    .where(eq(entries.id, id))
    .returning();
  if (!entry) return c.json({ error: "Entry not found" }, 404);
  return c.json(entry);
});

entriesRoute.delete("/:id", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid entry id" }, 400);

  const [entry] = await db.delete(entries).where(eq(entries.id, id)).returning({ id: entries.id });
  if (!entry) return c.json({ error: "Entry not found" }, 404);
  return c.json({ ok: true });
});

entriesRoute.put("/:id/reorder", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid entry id" }, 400);

  const body = await c.req.json().catch(() => null);
  const direction = body?.direction === "up" || body?.direction === "down" ? body.direction : null;
  if (!direction) return c.json({ error: "direction must be 'up' or 'down'" }, 400);

  const [item] = await db
    .select({ id: entries.id, pageId: entries.pageId })
    .from(entries)
    .where(eq(entries.id, id));
  if (!item) return c.json({ error: "Entry not found" }, 404);

  const list = await db
    .select({ id: entries.id, sortOrder: entries.sortOrder })
    .from(entries)
    .where(eq(entries.pageId, item.pageId))
    .orderBy(asc(entries.sortOrder), asc(entries.createdAt));

  const index = list.findIndex((e) => e.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return c.json({ ok: true });

  await db.transaction(async (tx) => {
    await tx.update(entries).set({ sortOrder: list[target].sortOrder }).where(eq(entries.id, id));
    await tx.update(entries).set({ sortOrder: list[index].sortOrder }).where(eq(entries.id, list[target].id));
  });
  return c.json({ ok: true });
});
