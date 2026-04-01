# Portfolio Website (Next.js)

This is a portfolio website built with Next.js App Router, Tailwind CSS, and TypeScript.

## Tech Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- TypeScript
- MongoDB Node.js Driver

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env.local
```

3. Add your MongoDB URI and database name in `.env.local`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=portfolio
ADMIN_API_KEY=replace-with-a-long-random-secret
ADMIN_SESSION_SECRET=replace-with-another-long-random-secret
ADMIN_ALLOWED_ORIGINS=http://localhost:3000
```

4. Start development server:

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

Deploy to Vercel and set the same environment variables in your project settings:

- MONGODB_URI
- MONGODB_DB
