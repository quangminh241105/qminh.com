# Portfolio Website (Next.js)

This is a portfolio website built with Next.js App Router, Tailwind CSS, and TypeScript.

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- MongoDB Node.js Driver

## Local Setup

MongoDB is self-hosted in Docker (see `docker-compose.yml`), not Atlas. Docker is optional for local dev - the site falls back to the static content in `lib/portfolio.ts` whenever MongoDB isn't reachable.

1. Install dependencies:

```bash
npm install
```

2. Create your environment file and fill in real secrets:

```bash
copy .env.example .env
```

3. (Optional) Start a local MongoDB:

```bash
docker compose up mongo -d
```

If you're running `npm run dev` directly on the host (not in Docker), add a personal `.env.local` with `MONGODB_URI` pointing at `localhost:27017` instead of `mongo:27017` - see the comment in `.env.example`.

4. Start the development server:

```bash
npm run dev
```

5. Open the app in your browser:

- http://localhost:3000

## MongoDB Connection Health Check

The project includes a health endpoint to verify your MongoDB URI works:

- http://localhost:3000/api/health/db

Expected success response:

```json
{
	"ok": true,
	"database": "portfolio",
	"message": "MongoDB connection is healthy."
}
```

## MongoDB Schema and Collection Design

For detailed collection structures, indexes, and seed/fallback behavior, see:

- `docs/mongodb-structure.md`

## Secure Admin CRUD API

Admin routes are available for managing portfolio content from your own UI.

Authentication:

- Header: `Authorization: Bearer <ADMIN_API_KEY>`
- Or header: `x-admin-key: <ADMIN_API_KEY>`

Routes:

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `PATCH /api/admin/projects/:id`
- `DELETE /api/admin/projects/:id`
- `GET /api/admin/articles`
- `POST /api/admin/articles`
- `PATCH /api/admin/articles/:id`
- `DELETE /api/admin/articles/:id`
- `GET /api/admin/skills`
- `POST /api/admin/skills`
- `PATCH /api/admin/skills/:id`
- `DELETE /api/admin/skills/:id`

Security hardening included:

- Constant-time token verification
- Optional allowed-origin validation via `ADMIN_ALLOWED_ORIGINS`
- Strict payload validation for create/update
- No-store response headers on admin responses

## Admin UI

A secure admin UI is available at `/admin`.

- Login creates an HttpOnly signed session cookie.
- The browser never stores `ADMIN_API_KEY` in local storage.
- Sign out removes the session cookie.

## Project Structure

- app: routes and pages
- components: reusable UI components
- lib: shared helpers and data layer (including Mongo connection helper)
- public: static assets

## Build

```bash
npm run build
```

## Deploy

Deployment is handled by the existing Jenkins pipeline (`Jenkinsfile`): on push, it rsyncs the repo to the host server, injects secrets from the `qminh-env` Jenkins credential into `.env`, then runs `docker compose up -d --build`, which builds and (re)starts both the `app` and `mongo` containers together (`docker-compose.yml`).

Uploaded media persists in a host directory outside the deploy path (`UPLOADS_HOST_PATH`, bind-mounted into the app container), so it survives redeploys.
