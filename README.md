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
docker compose up mongodb -d
```

If you're running `npm run dev` directly on the host (not in Docker), add a personal `.env.local` with `MONGODB_URI` pointing at `localhost:27017` instead of `mongodb:27017` - see the comment in `.env.example`.

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

### Updating the public CV

From `/admin`, open the `Resume` tab and use the `Public CV` upload area. The upload is protected by the existing admin session and accepts only `.doc`, `.docx`, and `.pdf` files up to 10MB. The file signature, extension, and MIME type are checked before it is stored. Uploading a replacement updates the public download links and removes the previous managed CV file.

Uploaded CVs and other media are stored in `public/uploads` and served through the runtime upload route, so files created after the Docker build remain accessible. In deployment, keep `UPLOADS_HOST_PATH` pointed at persistent storage so uploads survive redeploys.

Admin uploads are validated by purpose: JPG/JPEG, PNG, WEBP, and GIF images are limited to 15MB; MP4, WEBM, OGV, and MOV videos are limited to 50MB; and DOC, DOCX, and PDF CV files are limited to 10MB. MIME type, extension, and file signature must agree. New files are renamed with a predictable timestamped name and grouped into folders such as `projects/<slug>/thumbnail`, `blogs/<group>/<slug>/content`, and `profile/avatar`.

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

Deployment is handled by the Jenkins pipeline (`Jenkinsfile`). On push, it rsyncs the source, injects the `qminh-env` credential into `.env`, builds a versioned Docker image, starts it on an alternate blue/green port, and verifies that the homepage responds successfully. Only after the candidate is serving does it switch port `3000` to the new app container. If the build or HTTP health check fails, the current app remains in place. The `/api/health/db` endpoint remains available for MongoDB diagnostics, but MongoDB is optional for deployment because the site serves static fallback content when the database is unavailable. The previous app container and superseded application image are removed only after a successful switch; MongoDB containers are not recreated by the deployment.

Uploaded media persists in a host directory outside the deploy path (`UPLOADS_HOST_PATH`, bind-mounted into the app container), so it survives redeploys.
