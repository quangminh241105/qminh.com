import { cache } from "react";
import { Collection, ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { portfolioStore, type NavItem, type SocialLink } from "@/lib/portfolio";
import { deleteUploadedFiles } from "@/lib/uploads";

export type AboutSection = {
  intro: string;
  background: string;
  interests: string[];
};

export type ProfileDoc = {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  navItems: NavItem[];
  socialLinks: SocialLink[];
  quickSummary: string[];
  about: AboutSection;
  updatedAt: Date;
};

export type SkillDoc = { name: string; category: string; level: number; order: number };

export type ProjectDoc = {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  order: number;
  images?: string[];
  videoUrl?: string;
  customVars?: Record<string, string>;
};

export type TestimonialDoc = { quote: string; author: string; role: string; order: number };

export type ArticleDoc = {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: string;
  order: number;
  body?: string;
  coverImage?: string;
  videoUrl?: string;
};

export type ResumeItemDoc = { period: string; title: string; details: string; order: number };

export type WithId<T> = T & { id: string };

export type PortfolioContent = {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  navItems: NavItem[];
  socialLinks: SocialLink[];
  quickSummary: string[];
  about: AboutSection;
  skills: WithId<SkillDoc>[];
  projects: WithId<ProjectDoc & { primaryTechnology: string }>[];
  featuredProjects: WithId<ProjectDoc & { primaryTechnology: string }>[];
  testimonials: WithId<TestimonialDoc>[];
  articles: WithId<ArticleDoc>[];
  resume: WithId<ResumeItemDoc>[];
  source: "db" | "fallback";
};

function withId<T extends { _id?: ObjectId }>(doc: T): WithId<Omit<T, "_id">> {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id!.toString() } as WithId<Omit<T, "_id">>;
}

async function collections() {
  const db = await getDb();
  return {
    profile: db.collection<ProfileDoc>("profile"),
    skills: db.collection<SkillDoc>("skills"),
    projects: db.collection<ProjectDoc>("projects"),
    testimonials: db.collection<TestimonialDoc>("testimonials"),
    articles: db.collection<ArticleDoc>("articles"),
    resumeItems: db.collection<ResumeItemDoc>("resumeItems"),
  };
}

let bootstrapPromise: Promise<void> | undefined;

async function seedIfEmpty<T extends object>(collection: Collection<T>, seed: T[]) {
  if (seed.length === 0) return;
  const count = await collection.estimatedDocumentCount();
  if (count === 0) {
    await collection.insertMany(seed as never[]);
  }
}

/** Creates missing collections/indexes and seeds from lib/portfolio.ts on first run. */
async function bootstrap(): Promise<void> {
  const cols = await collections();

  await Promise.all([
    cols.skills.createIndex({ order: 1 }),
    cols.projects.createIndex({ featured: 1, order: 1 }),
    cols.articles.createIndex({ slug: 1 }, { unique: true }),
    cols.articles.createIndex({ order: 1 }),
    cols.resumeItems.createIndex({ order: 1 }),
    cols.testimonials.createIndex({ order: 1 }),
  ]);

  const profileCount = await cols.profile.estimatedDocumentCount();
  if (profileCount === 0) {
    await cols.profile.insertOne({
      name: portfolioStore.name,
      profession: portfolioStore.profession,
      tagline: portfolioStore.tagline,
      location: portfolioStore.location,
      navItems: [...portfolioStore.navItems],
      socialLinks: [...portfolioStore.socialLinks],
      quickSummary: [...portfolioStore.quickSummary],
      about: { ...portfolioStore.about },
      updatedAt: new Date(),
    });
  }

  await Promise.all([
    seedIfEmpty(
      cols.skills,
      portfolioStore.skills.map((s, order) => ({ name: s.name, category: s.category, level: s.level, order })),
    ),
    seedIfEmpty(
      cols.projects,
      portfolioStore.projects.map((p, order) => ({
        title: p.title,
        summary: p.summary,
        technologies: [...p.technologies],
        repoUrl: p.repoUrl,
        demoUrl: p.demoUrl,
        featured: p.featured,
        order,
      })),
    ),
    seedIfEmpty(
      cols.testimonials,
      portfolioStore.testimonials.map((t, order) => ({ quote: t.quote, author: t.author, role: t.role, order })),
    ),
    seedIfEmpty(
      cols.articles,
      portfolioStore.articles.map((a, order) => ({
        title: a.title,
        excerpt: a.excerpt,
        slug: a.slug,
        publishedAt: a.publishedAt,
        order,
      })),
    ),
    seedIfEmpty(
      cols.resumeItems,
      portfolioStore.resume.map((r, order) => ({ period: r.period, title: r.title, details: r.details, order })),
    ),
  ]);
}

function ensureBootstrapped(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = bootstrap().catch((error) => {
      // Allow bootstrap to be retried on the next call instead of caching a failure forever.
      bootstrapPromise = undefined;
      throw error;
    });
  }
  return bootstrapPromise;
}

function fallbackContent(): PortfolioContent {
  const plainProjects = portfolioStore.projects.map((item, index) => ({
    ...item,
    id: `fallback-project-${index}`,
    technologies: [...item.technologies],
    order: index,
    primaryTechnology: item.primaryTechnology,
  }));

  return {
    name: portfolioStore.name,
    profession: portfolioStore.profession,
    tagline: portfolioStore.tagline,
    location: portfolioStore.location,
    navItems: [...portfolioStore.navItems],
    socialLinks: [...portfolioStore.socialLinks],
    quickSummary: [...portfolioStore.quickSummary],
    about: { ...portfolioStore.about },
    skills: portfolioStore.skills.map((item, index) => ({ ...item, id: `fallback-skill-${index}`, order: index })),
    projects: plainProjects,
    featuredProjects: plainProjects.filter((p) => p.featured),
    testimonials: portfolioStore.testimonials.map((item, index) => ({
      ...item,
      id: `fallback-testimonial-${index}`,
      order: index,
    })),
    articles: portfolioStore.articles.map((item, index) => ({ ...item, id: `fallback-article-${index}`, order: index })),
    resume: portfolioStore.resume.map((item, index) => ({ ...item, id: `fallback-resume-${index}`, order: index })),
    source: "fallback",
  };
}

export const getPortfolioContent = cache(async (): Promise<PortfolioContent> => {
  try {
    await ensureBootstrapped();
    const cols = await collections();

    const [profile, skills, projects, testimonials, articles, resumeItems] = await Promise.all([
      cols.profile.find().sort({ updatedAt: -1 }).limit(1).next(),
      cols.skills.find().sort({ order: 1 }).toArray(),
      cols.projects.find().sort({ order: 1 }).toArray(),
      cols.testimonials.find().sort({ order: 1 }).toArray(),
      cols.articles.find().sort({ order: 1 }).toArray(),
      cols.resumeItems.find().sort({ order: 1 }).toArray(),
    ]);

    if (!profile) {
      throw new Error("No profile document found after bootstrap");
    }

    const plainProjects = projects.map((doc) => {
      const mapped = withId(doc);
      return { ...mapped, primaryTechnology: mapped.technologies[0] ?? "General" };
    });

    return {
      name: profile.name,
      profession: profile.profession,
      tagline: profile.tagline,
      location: profile.location,
      navItems: profile.navItems,
      socialLinks: profile.socialLinks,
      quickSummary: profile.quickSummary,
      about: profile.about,
      skills: skills.map(withId),
      projects: plainProjects,
      featuredProjects: plainProjects.filter((p) => p.featured),
      testimonials: testimonials.map(withId),
      articles: articles.map(withId),
      resume: resumeItems.map(withId),
      source: "db",
    };
  } catch (error) {
    console.error("[portfolio-db] Falling back to static content:", error);
    return fallbackContent();
  }
});

// ---- Admin write helpers -------------------------------------------------
// Every write helper is called from app/admin/actions.ts, which re-verifies
// the admin session before invoking any of these.

export async function updateProfile(data: Omit<ProfileDoc, "updatedAt">): Promise<void> {
  const cols = await collections();
  await cols.profile.insertOne({ ...data, updatedAt: new Date() });
}

async function nextOrder<T extends { order: number }>(collection: Collection<T>): Promise<number> {
  const last = await collection.find().sort({ order: -1 }).limit(1).next();
  return (last?.order ?? -1) + 1;
}

/** Images present in `oldItems` but dropped from `newItems` (undefined newItems means "field wasn't touched"). */
function removedArrayItems(oldItems: string[] | undefined, newItems: string[] | undefined): string[] {
  if (!newItems) return [];
  return (oldItems ?? []).filter((item) => !newItems.includes(item));
}

/** The old single-file URL, if the update is replacing it with a different one. */
function replacedSingleFile(oldValue: string | undefined, newValue: string | undefined): string | undefined {
  if (newValue === undefined || !oldValue || oldValue === newValue) return undefined;
  return oldValue;
}

export async function upsertProject(data: Partial<ProjectDoc> & { id?: string }): Promise<void> {
  const cols = await collections();
  const { id, ...fields } = data;
  if (id) {
    const existing = await cols.projects.findOne({ _id: new ObjectId(id) });
    await cols.projects.updateOne({ _id: new ObjectId(id) }, { $set: fields });
    // Clean up files that this edit just removed or replaced, so disk usage
    // doesn't grow unbounded every time an image/video is swapped out.
    await deleteUploadedFiles([
      ...removedArrayItems(existing?.images, fields.images),
      replacedSingleFile(existing?.videoUrl, fields.videoUrl),
    ]);
  } else {
    const order = fields.order ?? (await nextOrder(cols.projects));
    await cols.projects.insertOne({
      title: fields.title ?? "Untitled Project",
      summary: fields.summary ?? "",
      technologies: fields.technologies ?? [],
      repoUrl: fields.repoUrl ?? "",
      demoUrl: fields.demoUrl ?? "",
      featured: fields.featured ?? false,
      order,
      ...(fields.images ? { images: fields.images } : {}),
      ...(fields.videoUrl ? { videoUrl: fields.videoUrl } : {}),
      ...(fields.customVars ? { customVars: fields.customVars } : {}),
    });
  }
}

export async function deleteProject(id: string): Promise<void> {
  const cols = await collections();
  const deleted = await cols.projects.findOneAndDelete({ _id: new ObjectId(id) });
  if (deleted) {
    await deleteUploadedFiles([...(deleted.images ?? []), deleted.videoUrl]);
  }
}

export async function upsertArticle(data: Partial<ArticleDoc> & { id?: string }): Promise<void> {
  const cols = await collections();
  const { id, ...fields } = data;
  if (id) {
    const existing = await cols.articles.findOne({ _id: new ObjectId(id) });
    await cols.articles.updateOne({ _id: new ObjectId(id) }, { $set: fields });
    await deleteUploadedFiles([
      replacedSingleFile(existing?.coverImage, fields.coverImage),
      replacedSingleFile(existing?.videoUrl, fields.videoUrl),
    ]);
  } else {
    const order = fields.order ?? (await nextOrder(cols.articles));
    await cols.articles.insertOne({
      title: fields.title ?? "Untitled Article",
      excerpt: fields.excerpt ?? "",
      slug: fields.slug ?? `article-${Date.now()}`,
      publishedAt: fields.publishedAt ?? new Date().toISOString().slice(0, 10),
      order,
      ...(fields.body ? { body: fields.body } : {}),
      ...(fields.coverImage ? { coverImage: fields.coverImage } : {}),
      ...(fields.videoUrl ? { videoUrl: fields.videoUrl } : {}),
    });
  }
}

export async function deleteArticle(id: string): Promise<void> {
  const cols = await collections();
  const deleted = await cols.articles.findOneAndDelete({ _id: new ObjectId(id) });
  if (deleted) {
    await deleteUploadedFiles([deleted.coverImage, deleted.videoUrl]);
  }
}

export async function upsertSkill(data: Partial<SkillDoc> & { id?: string }): Promise<void> {
  const cols = await collections();
  const { id, ...fields } = data;
  if (id) {
    await cols.skills.updateOne({ _id: new ObjectId(id) }, { $set: fields });
  } else {
    const order = fields.order ?? (await nextOrder(cols.skills));
    await cols.skills.insertOne({
      name: fields.name ?? "Untitled Skill",
      category: fields.category ?? "General",
      level: fields.level ?? 50,
      order,
    });
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const cols = await collections();
  await cols.skills.deleteOne({ _id: new ObjectId(id) });
}

export async function upsertResumeItem(data: Partial<ResumeItemDoc> & { id?: string }): Promise<void> {
  const cols = await collections();
  const { id, ...fields } = data;
  if (id) {
    await cols.resumeItems.updateOne({ _id: new ObjectId(id) }, { $set: fields });
  } else {
    const order = fields.order ?? (await nextOrder(cols.resumeItems));
    await cols.resumeItems.insertOne({
      period: fields.period ?? "",
      title: fields.title ?? "Untitled Entry",
      details: fields.details ?? "",
      order,
    });
  }
}

export async function deleteResumeItem(id: string): Promise<void> {
  const cols = await collections();
  await cols.resumeItems.deleteOne({ _id: new ObjectId(id) });
}

export async function pingDatabase(): Promise<{ ok: true; database: string } | { ok: false; error: string }> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return { ok: true, database: db.databaseName };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
