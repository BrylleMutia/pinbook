import { Hono } from "hono";
import { asc, count, eq, max } from "drizzle-orm";
import { db } from "../db.js";
import { entries, pages, type NewPage } from "../schema.js";
import { cleanEmoji, cleanText, isUuid } from "../validation.js";

export const pagesRoute = new Hono();

pagesRoute.get("/", async (c) => {
  const rows = await db
    .select({
      id: pages.id,
      title: pages.title,
      iconEmoji: pages.iconEmoji,
      sortOrder: pages.sortOrder,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
      entryCount: count(entries.id),
    })
    .from(pages)
    .leftJoin(entries, eq(entries.pageId, pages.id))
    .groupBy(pages.id)
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));
  return c.json(rows);
});

pagesRoute.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const title = cleanText(body?.title, 80);
  if (!title) return c.json({ error: "Title is required (max 80 characters)" }, 400);
  const iconEmoji = cleanEmoji(body?.iconEmoji, "📄");
  if (iconEmoji === null) return c.json({ error: "Icon must be a single emoji" }, 400);

  const [{ next }] = await db
    .select({ next: max(pages.sortOrder) })
    .from(pages);

  const [page] = await db
    .insert(pages)
    .values({
      title,
      iconEmoji,
      sortOrder: (next ?? -1) + 1,
    } satisfies NewPage)
    .returning();
  return c.json(page, 201);
});

pagesRoute.get("/:id", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid page id" }, 400);

  const [page] = await db.select().from(pages).where(eq(pages.id, id));
  if (!page) return c.json({ error: "Page not found" }, 404);

  const list = await db
    .select()
    .from(entries)
    .where(eq(entries.pageId, id))
    .orderBy(asc(entries.sortOrder), asc(entries.createdAt));
  return c.json({ ...page, entries: list });
});

pagesRoute.put("/:id", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid page id" }, 400);

  const body = await c.req.json().catch(() => null);
  const title = cleanText(body?.title, 80);
  if (!title) return c.json({ error: "Title is required (max 80 characters)" }, 400);
  const iconEmoji = cleanEmoji(body?.iconEmoji, "📄");
  if (iconEmoji === null) return c.json({ error: "Icon must be a single emoji" }, 400);

  const [page] = await db
    .update(pages)
    .set({ title, iconEmoji, updatedAt: new Date() })
    .where(eq(pages.id, id))
    .returning();
  if (!page) return c.json({ error: "Page not found" }, 404);
  return c.json(page);
});

pagesRoute.delete("/:id", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid page id" }, 400);

  const [page] = await db.delete(pages).where(eq(pages.id, id)).returning({ id: pages.id });
  if (!page) return c.json({ error: "Page not found" }, 404);
  return c.json({ ok: true });
});

pagesRoute.put("/:id/reorder", async (c) => {
  const { id } = c.req.param();
  if (!isUuid(id)) return c.json({ error: "Invalid page id" }, 400);

  const body = await c.req.json().catch(() => null);
  const direction = body?.direction === "up" || body?.direction === "down" ? body.direction : null;
  if (!direction) return c.json({ error: "direction must be 'up' or 'down'" }, 400);

  const list = await db
    .select({ id: pages.id, sortOrder: pages.sortOrder })
    .from(pages)
    .orderBy(asc(pages.sortOrder), asc(pages.createdAt));

  const index = list.findIndex((p) => p.id === id);
  if (index === -1) return c.json({ error: "Page not found" }, 404);
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= list.length) return c.json({ ok: true });

  await db.transaction(async (tx) => {
    await tx.update(pages).set({ sortOrder: list[target].sortOrder }).where(eq(pages.id, id));
    await tx.update(pages).set({ sortOrder: list[index].sortOrder }).where(eq(pages.id, list[target].id));
  });
  return c.json({ ok: true });
});
