# Pinbook

A shared, mobile-first directory of documentation links for small teams (up to ~5 users). Pastel-pink accents, lightweight, fast.

- **Client**: React 19 + TypeScript + Vite + TailwindCSS v4
- **Server**: Hono (Node) — one Vercel serverless function
- **Database**: Postgres (Neon free tier) via Drizzle ORM
- **Auth**: shared PIN, stateless HMAC-signed tokens (no accounts)

## Project layout

```
├─ client/   # React SPA (Vite)
├─ server/   # Hono API + static serving (local dev)
└─ vercel.json
```

## Local development

Requirements: Node 20+, a Postgres database (or Neon free tier).

```bash
# 1. Install dependencies (npm workspaces)
npm install

# 2. Configure the server
cp server/.env.example server/.env
#   edit server/.env: DATABASE_URL, PIN (and optionally SECRET)

# 3. Create the schema
npm run db:migrate

# 4. Run client (http://localhost:5173) + server (http://localhost:3000)
npm run dev
```

The Vite dev server proxies `/api` to the Hono server, so the app works from `localhost:5173`.

### Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run client + server with hot reload |
| `npm run build` | Type-check server, build client |
| `npm run typecheck` | Type-check both workspaces |
| `npm run db:generate` | Create a new migration from schema changes |
| `npm run db:migrate` | Apply migrations to the database |

## Deploying to Vercel

1. Push the repo to GitHub and import it into Vercel (framework: Other).
   `vercel.json` serves the built SPA (`client/dist`) as static output, deploys
   the Hono app in `api/[[...route]].ts` as the `/api/*` serverless function,
   and rewrites all non-`/api` paths to `index.html` for client-side routing.
2. Add environment variables in the Vercel dashboard (or `vercel env add <NAME> production`):
   - `DATABASE_URL` — your Neon (or any Postgres) connection string
   - `PIN` — the shared login PIN (e.g. `1234`)
   - `SECRET` *(optional)* — token signing secret; defaults to `PIN`
3. Apply migrations to your production database (once):
   ```bash
   DATABASE_URL=postgres://... npx drizzle-kit migrate --config server/drizzle.config.ts
   ```
4. Deploy:
   ```bash
   vercel --prod
   ```

> Note: keep `typescript` at v6 (JS-based) in the workspaces — Vercel's
> function builder is not compatible with TypeScript 7 (native).

## API

All routes except `POST /api/auth` require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth` | `{ pin }` → `{ token }` |
| GET | `/api/pages` | List pages with entry counts |
| POST | `/api/pages` | Create page `{ title, iconEmoji }` |
| GET | `/api/pages/:id` | Page + ordered entries |
| PUT | `/api/pages/:id` | Update page |
| DELETE | `/api/pages/:id` | Delete page (cascades entries) |
| PUT | `/api/pages/:id/reorder` | `{ direction: "up" \| "down" }` |
| POST | `/api/entries` | `{ pageId, title, url, description?, iconEmoji? }` |
| PUT | `/api/entries/:id` | Update entry |
| DELETE | `/api/entries/:id` | Delete entry |
| PUT | `/api/entries/:id/reorder` | `{ direction: "up" \| "down" }` |

## Notes

- Auth tokens last 30 days; changing `PIN`/`SECRET` on the server invalidates
  them on the next restart.
- Sessions are stateless (serverless-friendly) — no session table.
- Emojis are stored as UTF-8 text in Postgres; keep the database encoding UTF-8.
