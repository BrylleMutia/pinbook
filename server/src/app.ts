import { Hono } from "hono";
import { logger } from "hono/logger";
import { authRoute, requireAuth } from "./auth";
import { pagesRoute } from "./routes/pages";
import { entriesRoute } from "./routes/entries";

export const app = new Hono();

app.use("*", logger());

app.route("/api/auth", authRoute);
app.use("/api/*", requireAuth);
app.route("/api/pages", pagesRoute);
app.route("/api/entries", entriesRoute);
