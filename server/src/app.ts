import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoute, requireAuth } from "./auth.js";
import { pagesRoute } from "./routes/pages.js";
import { entriesRoute } from "./routes/entries.js";

export const app = new Hono();

app.use("*", logger());

app.route("/api/auth", authRoute);
app.use("/api/*", requireAuth);
app.route("/api/pages", pagesRoute);
app.route("/api/entries", entriesRoute);
