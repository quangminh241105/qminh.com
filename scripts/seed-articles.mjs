// Standalone seeder for blog groups + articles, run inside the running `app`
// container (see Jenkinsfile's "Seed Blog Content" stage). Uses the same
// MONGODB_URI/MONGODB_DB env vars as lib/mongodb.ts, but talks to Mongo
// directly since this runs outside the Next.js runtime.
//
// Usage: node scripts/seed-articles.mjs [path/to/seed.json ...]
// Defaults to every *.json file under data/seed/.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient } from "mongodb";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.join(__dirname, "..", "data", "seed");

async function resolveSeedFiles() {
  const argFiles = process.argv.slice(2);
  if (argFiles.length > 0) return argFiles;

  const entries = await readdir(SEED_DIR);
  return entries.filter((name) => name.endsWith(".json")).map((name) => path.join(SEED_DIR, name));
}

async function loadSeedFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function seedFile(db, filePath) {
  const { group, articles } = await loadSeedFile(filePath);

  const groupsCol = db.collection("articleGroups");
  const articlesCol = db.collection("articles");

  await groupsCol.updateOne(
    { slug: group.slug },
    {
      $set: {
        name: group.name,
        description: group.description,
        ...(group.coverImage ? { coverImage: group.coverImage } : {}),
      },
      $setOnInsert: { slug: group.slug, order: group.order ?? 0 },
    },
    { upsert: true },
  );

  let inserted = 0;
  let updated = 0;
  for (const article of articles ?? []) {
    const result = await articlesCol.updateOne(
      { slug: article.slug },
      {
        $set: {
          title: article.title,
          excerpt: article.excerpt,
          groupSlug: group.slug,
          publishedAt: article.publishedAt,
          ...(article.body ? { body: article.body } : {}),
          ...(article.coverImage ? { coverImage: article.coverImage } : {}),
          ...(article.videoUrl ? { videoUrl: article.videoUrl } : {}),
        },
        $setOnInsert: { slug: article.slug, order: article.order ?? 0 },
      },
      { upsert: true },
    );
    if (result.upsertedCount > 0) inserted += 1;
    else updated += 1;
  }

  console.log(
    `[seed-articles] ${path.basename(filePath)} -> group "${group.slug}": ${inserted} inserted, ${updated} updated`,
  );
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set");
  }
  const dbName = process.env.MONGODB_DB ?? "portfolio";

  const seedFiles = await resolveSeedFiles();
  if (seedFiles.length === 0) {
    console.log("[seed-articles] No seed files found, nothing to do.");
    return;
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(dbName);
    for (const filePath of seedFiles) {
      await seedFile(db, filePath);
    }
  } finally {
    await client.close();
  }
}

main()
  .then(() => {
    console.log("[seed-articles] Done.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("[seed-articles] Failed:", error);
    process.exit(1);
  });
