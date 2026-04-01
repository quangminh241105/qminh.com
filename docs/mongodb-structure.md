# MongoDB Structure for Portfolio

This project uses MongoDB as the primary source of truth.
If MongoDB is unavailable, the app falls back to static content in `lib/portfolio.ts`.

## Database Name

- `MONGODB_DB` (default: `portfolio`)

## Collections

### 1) `profile`

Purpose: global profile and navigation data.

Single latest document (queried by `updatedAt` desc):

```json
{
  "name": "Quang Minh",
  "profession": "IT Student",
  "tagline": "Building reliable web apps with clean architecture and practical UX.",
  "location": "Ho Chi Minh City, Vietnam",
  "navItems": [
    { "label": "Home", "href": "/" },
    { "label": "About", "href": "/about" }
  ],
  "socialLinks": [
    { "label": "GitHub", "href": "https://github.com/" },
    { "label": "LinkedIn", "href": "https://www.linkedin.com/" }
  ],
  "quickSummary": [
    "Focused on scalable frontend architecture",
    "Hands-on with Next.js, TypeScript, and APIs"
  ],
  "about": {
    "intro": "...",
    "background": "...",
    "interests": ["Web Architecture", "Cloud & DevOps"]
  },
  "updatedAt": "2026-03-30T00:00:00.000Z"
}
```

### 2) `skills`

Purpose: technical skills shown in charts.

```json
{
  "name": "TypeScript",
  "category": "Language",
  "level": 90,
  "order": 0
}
```

### 3) `projects`

Purpose: project cards and featured projects.

```json
{
  "title": "Campus Event Hub",
  "summary": "A portal where students browse and register for events.",
  "technologies": ["Next.js", "TypeScript", "Tailwind"],
  "repoUrl": "https://github.com/",
  "demoUrl": "https://example.com",
  "featured": true,
  "order": 0
}
```

### 4) `testimonials`

Purpose: social proof cards.

```json
{
  "quote": "Writes clean and maintainable code.",
  "author": "Team Lead",
  "role": "Student Software Project",
  "order": 0
}
```

### 5) `articles`

Purpose: blog listing.

```json
{
  "title": "How I Structure Next.js App Router Projects",
  "excerpt": "A practical folder strategy for reusable components and routes.",
  "slug": "nextjs-structure",
  "publishedAt": "2026-03-15",
  "order": 0
}
```

### 6) `resumeItems`

Purpose: resume timeline section.

```json
{
  "period": "2024 - Present",
  "title": "BSc in Information Technology",
  "details": "Focused on software engineering and distributed systems.",
  "order": 0
}
```

## Indexes

Indexes are created automatically by `lib/portfolio-db.ts`:

- `skills`: `{ order: 1 }`
- `projects`: `{ featured: 1, order: 1 }`
- `articles`: `{ slug: 1 }` (unique)
- `articles`: `{ order: 1 }`
- `resumeItems`: `{ order: 1 }`
- `testimonials`: `{ order: 1 }`

## Bootstrap Behavior

The first successful MongoDB connection runs bootstrap logic:

1. Create missing collections.
2. Create indexes.
3. Seed all collections from `lib/portfolio.ts` only if each collection is empty.

This gives you a safe first-run migration with no manual import required.

## Runtime Data Flow

- Main source: MongoDB via `lib/portfolio-db.ts`.
- Fallback: static content from `lib/portfolio.ts` if MongoDB read fails.
- UI reads from `getPortfolioContent()` in server components.

## Secure Admin API Layer

Admin CRUD routes are implemented under `/api/admin/*` for:

- projects
- articles
- skills

Security model:

- Requires `ADMIN_API_KEY` for every admin request.
- Accepts either `Authorization: Bearer <token>` or `x-admin-key`.
- Uses constant-time token comparison to reduce timing-leak risk.
- Supports optional request origin allowlist via `ADMIN_ALLOWED_ORIGINS`.
- Returns `Cache-Control: no-store` on admin responses.

## Recommended Content Operations

- Update profile header/about text: edit the newest document in `profile`.
- Add project: insert new document in `projects` and set `order`.
- Add article: insert in `articles` with unique `slug`.
- Reorder sections: update `order` fields in each collection.

## Validation Suggestions (Atlas)

For production, add MongoDB JSON schema validation per collection:

- Ensure required fields exist.
- Restrict `level` to `0..100` for skills.
- Restrict `featured` to boolean.
- Require unique `slug` in articles.
