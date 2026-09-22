# --- deps: install dependencies only, cached separately from source changes ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- builder: build the standalone Next.js output ---
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: slim runtime image, no dev dependencies or source tree ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Not traced into the standalone output (nothing in the app imports them),
# but needed for the Jenkins "Seed Blog Content" stage to run inside this
# container: docker compose exec -T app node scripts/seed-articles.mjs
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/data ./data

EXPOSE 3000
CMD ["node", "server.js"]
