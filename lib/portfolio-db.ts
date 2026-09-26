import { cache } from "react";
import { getMongoClient } from "@/lib/mongodb";
import {
  portfolioStore,
  Skill,
  Project,
  Testimonial,
  Article,
  ArticleGroup,
  GalleryGroup,
  ResumeItem,
  type NavItem,
  type ResumeFile,
  type SocialLink,
  type ContentLayout,
  type GalleryImage,
} from "@/lib/portfolio";
import type { Db } from "mongodb";

type AboutSection = {
  intro: string;
  background: string;
  interests: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return [...fallback];
  const normalized = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  return normalized.length > 0 ? normalized : [...fallback];
}

function normalizeContentLayout(value: unknown): ContentLayout {
  return value === "spotlight" || value === "minimal" ? value : "standard";
}

function normalizeGalleryImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item, index) => {
    if (typeof item === "string" && item.trim()) {
      return [{ url: item.trim(), alt: "", caption: "", order: index }];
    }

    if (!isRecord(item) || typeof item.url !== "string" || !item.url.trim()) return [];

    return [{
      url: item.url.trim(),
      alt: typeof item.alt === "string" ? item.alt.trim() : "",
      caption: typeof item.caption === "string" ? item.caption.trim() : "",
      order: typeof item.order === "number" ? item.order : index,
    }];
  });
}

function isDuplicateKeyError(error: unknown): boolean {
  return isRecord(error) && error.code === 11000;
}

function normalizeNavItems(value: unknown): NavItem[] {
  if (!Array.isArray(value)) return [...portfolioStore.navItems];
  const normalized = value.flatMap((item) => {
    if (!isRecord(item) || typeof item.label !== "string" || typeof item.href !== "string") return [];
    const isLegacyResume = item.label.trim().toLowerCase() === "resume" || item.href.trim() === "/resume";
    return [{
      label: isLegacyResume ? "Gallery" : item.label,
      href: isLegacyResume ? "/gallery" : item.href,
    }];
  });
  return normalized.length > 0 ? normalized : [...portfolioStore.navItems];
}

function normalizeSocialLinks(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [...portfolioStore.socialLinks];
  const normalized = value.flatMap((item) => {
    if (!isRecord(item) || typeof item.label !== "string" || typeof item.href !== "string") return [];
    return [{ label: item.label, href: item.href }];
  });
  return normalized.length > 0 ? normalized : [...portfolioStore.socialLinks];
}

function normalizeAbout(value: unknown): AboutSection {
  const about = isRecord(value) ? value : {};
  return {
    intro: normalizeString(about.intro, portfolioStore.about.intro),
    background: normalizeString(about.background, portfolioStore.about.background),
    interests: normalizeStringArray(about.interests, portfolioStore.about.interests),
  };
}

export type PortfolioContent = {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  avatar?: string;
  navItems: NavItem[];
  socialLinks: SocialLink[];
  quickSummary: string[];
  about: AboutSection;
  skills: Skill[];
  projects: Project[];
  featuredProjects: Project[];
  testimonials: Testimonial[];
  articles: Article[];
  articleGroups: ArticleGroup[];
  galleryGroups: GalleryGroup[];
  resume: ResumeItem[];
  resumeFile?: ResumeFile;
  source: "db" | "fallback";
};

let bootstrapped = false;

function withCanonicalSocialLinks(socialLinks: SocialLink[]): SocialLink[] {
  const defaultSocialLinks = portfolioStore.socialLinks;
  const normalizedLinks = socialLinks.map((link) => {
    const normalizedLabel = link.label.toLowerCase();
    const defaultLink = defaultSocialLinks.find((candidate) => {
      const candidateLabel = candidate.label.toLowerCase();
      return (
        (candidateLabel.includes("git") && normalizedLabel.includes("git")) ||
        (candidateLabel.includes("link") && normalizedLabel.includes("link")) ||
        (candidateLabel.includes("instagram") && normalizedLabel.includes("instagram")) ||
        (candidateLabel.includes("mail") && (normalizedLabel.includes("mail") || normalizedLabel.includes("email")))
      );
    });

    return defaultLink ? { ...link, href: defaultLink.href } : link;
  });

  if (!normalizedLinks.some((link) => link.label.toLowerCase().includes("instagram"))) {
    const instagramLink = defaultSocialLinks.find((link) => link.label.toLowerCase().includes("instagram"));
    if (instagramLink) normalizedLinks.push(instagramLink);
  }

  return normalizedLinks;
}

function withUpdatedQuickSummary(quickSummary: string[]): string[] {
  return quickSummary.map((item) =>
    item === "Interested in internships and project collaborations"
      ? "Interested in internships and collaborations"
      : item,
  );
}

async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(process.env.MONGODB_DB || "portfolio");
}

export async function checkDbHealth(): Promise<{ ok: boolean; database: string; message: string }> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return {
      ok: true,
      database: db.databaseName,
      message: "MongoDB connection is healthy.",
    };
  } catch (error: any) {
    return {
      ok: false,
      database: process.env.MONGODB_DB || "portfolio",
      message: error?.message || "Failed to connect to MongoDB",
    };
  }
}

async function ensureBootstrapped(db: Db) {
  if (bootstrapped) return;

  try {
    const collections = await db.listCollections().toArray();
    const names = new Set(collections.map((c) => c.name));

    // Profile
    if (!names.has("profile")) {
      await db.createCollection("profile");
    }
    const profileCount = await db.collection("profile").countDocuments();
    if (profileCount === 0) {
      await db.collection("profile").insertOne({
        name: portfolioStore.name,
        profession: portfolioStore.profession,
        tagline: portfolioStore.tagline,
        location: portfolioStore.location,
        avatar: portfolioStore.avatar,
        navItems: portfolioStore.navItems,
        socialLinks: portfolioStore.socialLinks,
        quickSummary: portfolioStore.quickSummary,
        about: portfolioStore.about,
        updatedAt: new Date(),
      });
    }

    // Skills
    if (!names.has("skills")) {
      await db.createCollection("skills");
    }
    const skillsCount = await db.collection("skills").countDocuments();
    if (skillsCount === 0) {
      await db.collection("skills").insertMany(
        portfolioStore.skills.map((s, idx) => ({
          name: s.name,
          category: s.category,
          level: s.level,
          order: idx,
        }))
      );
    }
    await db.collection("skills").createIndex({ order: 1 });
    await db.collection("skills").createIndex({ name: 1 }, { unique: true });

    // Projects
    if (!names.has("projects")) {
      await db.createCollection("projects");
    }
    const projectsCount = await db.collection("projects").countDocuments();
    if (projectsCount === 0) {
      await db.collection("projects").insertMany(
        portfolioStore.projects.map((p, idx) => ({
          title: p.title,
          summary: p.summary,
          technologies: p.technologies,
          repoUrl: p.repoUrl,
          demoUrl: p.demoUrl,
          featured: p.featured,
          layout: p.layout || "standard",
          thumbnail: p.thumbnail || p.pictures[0] || "",
          pictures: p.pictures,
          videos: p.videos,
          customVariables: p.customVariables,
          content: p.content,
          order: idx,
        }))
      );
    }
    await db.collection("projects").createIndex({ order: 1 });
    await db.collection("projects").createIndex({ title: 1 }, { unique: true });

    // Testimonials
    if (!names.has("testimonials")) {
      await db.createCollection("testimonials");
    }
    const testCount = await db.collection("testimonials").countDocuments();
    if (testCount === 0) {
      await db.collection("testimonials").insertMany(
        portfolioStore.testimonials.map((t, idx) => ({
          quote: t.quote,
          author: t.author,
          role: t.role,
          order: idx,
        }))
      );
    }

    // Articles
    // Article groups
    if (!names.has("articleGroups")) {
      await db.createCollection("articleGroups");
    }
    const articleGroupsCount = await db.collection("articleGroups").countDocuments();
    if (articleGroupsCount === 0) {
      await db.collection("articleGroups").insertMany(
        portfolioStore.articleGroups.map((group, idx) => ({
          name: group.name,
          slug: group.slug,
          description: group.description,
          coverImage: group.coverImage,
          order: idx,
        })),
      );
    }
    await db.collection("articleGroups").createIndex({ slug: 1 }, { unique: true });
    await db.collection("articleGroups").createIndex({ order: 1 });

    // Articles
    if (!names.has("articles")) {
      await db.createCollection("articles");
    }
    const articleCount = await db.collection("articles").countDocuments();
    if (articleCount === 0) {
      await db.collection("articles").insertMany(
        portfolioStore.articles.map((a, idx) => ({
          title: a.title,
          excerpt: a.excerpt,
          slug: a.slug,
          groupSlug: a.groupSlug,
          publishedAt: a.publishedAt,
          featured: a.featured,
          layout: a.layout,
          thumbnail: a.thumbnail || a.pictures[0] || "",
          content: a.content,
          pictures: a.pictures,
          videos: a.videos,
          order: idx,
        }))
      );
    }
    await db.collection("articles").createIndex({ slug: 1 }, { unique: true });
    await db.collection("articles").createIndex({ order: 1 });

    // Gallery
    if (!names.has("galleryGroups")) {
      await db.createCollection("galleryGroups");
    }
    await db.collection("galleryGroups").createIndex({ slug: 1 }, { unique: true });
    await db.collection("galleryGroups").createIndex({ order: 1 });

    // Resume
    if (!names.has("resumeItems")) {
      await db.createCollection("resumeItems");
    }
    const resumeCount = await db.collection("resumeItems").countDocuments();
    if (resumeCount === 0) {
      await db.collection("resumeItems").insertMany(
        portfolioStore.resume.map((r, idx) => ({
          period: r.period,
          title: r.title,
          details: r.details,
          order: idx,
        }))
      );
    }
    await db.collection("resumeItems").createIndex({ order: 1 });

    bootstrapped = true;
  } catch (err) {
    console.warn("MongoDB auto-bootstrap error (will proceed with fallback):", err);
  }
}

export const getPortfolioContent = cache(async (): Promise<PortfolioContent> => {
  try {
    const db = await getDb();
    await ensureBootstrapped(db);

    const [profileDoc, dbSkills, dbProjects, dbTestimonials, dbArticleGroups, dbArticles, dbGalleryGroups, dbResume] = await Promise.all([
      db.collection("profile").findOne({}, { sort: { updatedAt: -1 } }),
      db.collection("skills").find().sort({ order: 1 }).toArray(),
      db.collection("projects").find().sort({ order: 1 }).toArray(),
      db.collection("testimonials").find().sort({ order: 1 }).toArray(),
      db.collection("articleGroups").find().sort({ order: 1 }).toArray(),
      db.collection("articles").find().sort({ order: 1 }).toArray(),
      db.collection("galleryGroups").find().sort({ order: 1 }).toArray(),
      db.collection("resumeItems").find().sort({ order: 1 }).toArray(),
    ]);

    if (!profileDoc) {
      throw new Error("No profile document found in MongoDB");
    }

    const plainSkills = dbSkills.map((s: any) => ({
      id: s._id?.toString?.() ?? s.name,
      name: s.name,
      category: s.category,
      level: s.level,
      order: s.order,
    }));

    const plainProjects = dbProjects.map((p: any) => {
      const technologies = Array.isArray(p.technologies) ? p.technologies : [];
      const pictures = Array.isArray(p.pictures) ? p.pictures : [];
      const videos = Array.isArray(p.videos) ? p.videos : [];
      const thumbnail = typeof p.thumbnail === "string" && p.thumbnail.trim() ? p.thumbnail : pictures[0];
      const customVariables =
        typeof p.customVariables === "object" && p.customVariables !== null ? p.customVariables : {};
      return {
        id: p._id?.toString?.() ?? p.title,
        title: p.title,
        summary: p.summary,
        technologies,
        repoUrl: p.repoUrl || "",
        demoUrl: p.demoUrl || "",
        featured: Boolean(p.featured),
        layout: normalizeContentLayout(p.layout),
        thumbnail,
        pictures,
        videos,
        customVariables,
        content: p.content || "",
        images: pictures,
        videoUrl: videos[0],
        customVars: customVariables,
        order: p.order,
        primaryTechnology: technologies[0] ?? "General",
      };
    });

    const plainTestimonials = dbTestimonials.map((t: any) => ({
      quote: t.quote,
      author: t.author,
      role: t.role,
      order: t.order,
    }));

    const plainArticles = dbArticles.map((a: any) => {
      const pictures = Array.isArray(a.pictures) ? a.pictures : [];
      const legacyCoverImage = typeof a.coverImage === "string" && a.coverImage.trim() ? a.coverImage : undefined;
      const thumbnail = typeof a.thumbnail === "string" && a.thumbnail.trim()
        ? a.thumbnail
        : legacyCoverImage || pictures[0];
      const content = a.content || a.body || "";

      return {
        id: a._id?.toString?.() ?? a.slug,
        title: a.title,
        excerpt: a.excerpt,
        slug: a.slug,
        groupSlug: a.groupSlug || "engineering-notes",
        publishedAt: a.publishedAt,
        featured: Boolean(a.featured),
        layout: normalizeContentLayout(a.layout),
        content,
        pictures,
        videos: Array.isArray(a.videos) ? a.videos : [],
        thumbnail,
        body: content,
        coverImage: thumbnail,
        videoUrl: Array.isArray(a.videos) ? a.videos[0] : a.videoUrl,
        order: a.order,
      };
    });

    const plainArticleGroups = dbArticleGroups.map((group: any) => ({
      id: group.slug,
      name: group.name,
      slug: group.slug,
      description: group.description || "",
      coverImage: group.coverImage || undefined,
      articleCount: plainArticles.filter((article) => article.groupSlug === group.slug).length,
      order: group.order,
    }));

    const plainGalleryGroups = dbGalleryGroups.map((group: any) => ({
      id: group._id?.toString?.() ?? group.slug,
      title: normalizeString(group.title, "Untitled gallery"),
      slug: normalizeString(group.slug, "untitled-gallery"),
      description: typeof group.description === "string" ? group.description : "",
      images: normalizeGalleryImages(group.images),
      order: group.order,
    }));

    const knownGroupSlugs = new Set(plainArticleGroups.map((group) => group.slug));
    for (const article of plainArticles) {
      if (!knownGroupSlugs.has(article.groupSlug)) {
        plainArticleGroups.push({
          id: article.groupSlug,
          name: article.groupSlug,
          slug: article.groupSlug,
          description: "Articles without a configured group description.",
          coverImage: undefined,
          articleCount: plainArticles.filter((item) => item.groupSlug === article.groupSlug).length,
          order: plainArticleGroups.length,
        });
        knownGroupSlugs.add(article.groupSlug);
      }
    }

    const plainResume = dbResume.map((r: any) => ({
      id: r._id?.toString?.() ?? r.title,
      period: r.period,
      title: r.title,
      details: r.details,
      order: r.order,
    }));

    return {
      name: profileDoc.name || portfolioStore.name,
      profession: profileDoc.profession || portfolioStore.profession,
      tagline: profileDoc.tagline || portfolioStore.tagline,
      location: profileDoc.location || portfolioStore.location,
      avatar: typeof profileDoc.avatar === "string" && profileDoc.avatar.trim() ? profileDoc.avatar : portfolioStore.avatar,
      navItems: normalizeNavItems(profileDoc.navItems),
      socialLinks: withCanonicalSocialLinks(normalizeSocialLinks(profileDoc.socialLinks)),
      quickSummary: withUpdatedQuickSummary(normalizeStringArray(profileDoc.quickSummary, portfolioStore.quickSummary)),
      about: normalizeAbout(profileDoc.about),
      skills: plainSkills,
      projects: plainProjects,
      featuredProjects: plainProjects.filter((p) => p.featured),
      testimonials: plainTestimonials,
      articles: plainArticles,
      articleGroups: plainArticleGroups,
      galleryGroups: plainGalleryGroups,
      resume: plainResume,
      source: "db",
    };
  } catch (error) {
    console.warn("MongoDB fetch failed, serving static fallback:", error);
    const plainSkills = portfolioStore.skills.map((item) => ({ ...item }));
    const plainProjects = portfolioStore.projects.map((item) => ({ ...item, primaryTechnology: item.technologies[0] ?? "General" }));
    const plainTestimonials = portfolioStore.testimonials.map((item) => ({ ...item }));
    const plainArticles = portfolioStore.articles.map((item) => ({ ...item }));
    const plainResume = portfolioStore.resume.map((item) => ({ ...item }));
    const plainArticleGroups = portfolioStore.articleGroups.map((group) => ({
      ...group,
      articleCount: plainArticles.filter((article) => article.groupSlug === group.slug).length,
    }));
    const plainGalleryGroups = portfolioStore.galleryGroups.map((group) => ({ ...group }));

    return {
      name: portfolioStore.name,
      profession: portfolioStore.profession,
      tagline: portfolioStore.tagline,
      location: portfolioStore.location,
      avatar: portfolioStore.avatar,
      navItems: [...portfolioStore.navItems],
      socialLinks: withCanonicalSocialLinks([...portfolioStore.socialLinks]),
      quickSummary: [...portfolioStore.quickSummary],
      about: normalizeAbout(portfolioStore.about),
      skills: plainSkills,
      projects: plainProjects,
      featuredProjects: plainProjects.filter((p) => p.featured),
      testimonials: plainTestimonials,
      articles: plainArticles,
      articleGroups: plainArticleGroups,
      galleryGroups: plainGalleryGroups,
      resume: plainResume,
      source: "fallback",
    };
  }
});

// Admin DB Mutators
export async function updateProfile(data: {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  avatar?: string;
  navItems?: NavItem[];
  socialLinks?: SocialLink[];
  quickSummary: string[];
  about: { intro: string; background: string; interests: string[] };
  resumeFile?: ResumeFile;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("profile").updateOne(
    {},
    {
      $set: {
        ...data,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function updateResumeFile(file: ResumeFile): Promise<void> {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("profile").updateOne(
    {},
    { $set: { resumeFile: { ...file, updatedAt: new Date().toISOString() }, updatedAt: new Date() } },
    { upsert: true },
  );
}

export async function upsertProject(project: {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  layout?: ContentLayout;
  thumbnail?: string;
  pictures?: string[];
  videos?: string[];
  customVariables?: Record<string, string>;
  content?: string;
  order?: number;
  originalTitle?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const title = project.title.trim();
  const summary = project.summary.trim();
  if (!title || !summary) throw new Error("Project title and summary are required.");
  const searchKey = project.originalTitle?.trim() || title;
  const count = await db.collection("projects").countDocuments();

  try {
    await db.collection("projects").updateOne(
      { title: searchKey },
      {
        $set: {
          title,
          summary,
          technologies: project.technologies,
          repoUrl: project.repoUrl,
          demoUrl: project.demoUrl,
          featured: project.featured,
          layout: normalizeContentLayout(project.layout),
          thumbnail: project.thumbnail?.trim() || project.pictures?.[0] || "",
          pictures: project.pictures || [],
          videos: project.videos || [],
          customVariables: project.customVariables || {},
          content: project.content || "",
          order: typeof project.order === "number" ? project.order : count,
        },
      },
      { upsert: true },
    );
  } catch (error: any) {
    if (error?.code === 11000) throw new Error(`A project titled "${title}" already exists.`);
    throw error;
  }
}

export async function deleteProject(title: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("projects").deleteOne({ title });
}

export async function upsertArticleGroup(group: {
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
  order?: number;
  originalSlug?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const name = group.name.trim();
  const slug = group.slug.trim().toLowerCase();
  const description = group.description.trim();
  if (!name || !slug || !description) throw new Error("Group name, slug, and description are required.");

  const searchKey = group.originalSlug?.trim().toLowerCase() || slug;
  const count = await db.collection("articleGroups").countDocuments();

  try {
    await db.collection("articleGroups").updateOne(
      { slug: searchKey },
      {
        $set: {
          name,
          slug,
          description,
          coverImage: group.coverImage || "",
          order: typeof group.order === "number" ? group.order : count,
        },
      },
      { upsert: true },
    );

    if (searchKey !== slug) {
      await db.collection("articles").updateMany({ groupSlug: searchKey }, { $set: { groupSlug: slug } });
    }
  } catch (error: any) {
    if (error?.code === 11000) throw new Error(`A blog group with the slug "${slug}" already exists.`);
    throw error;
  }
}

export async function deleteArticleGroup(slug: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const articleCount = await db.collection("articles").countDocuments({ groupSlug: slug });
  if (articleCount > 0) {
    throw new Error(`Move or delete the ${articleCount} article${articleCount === 1 ? "" : "s"} in this group first.`);
  }
  await db.collection("articleGroups").deleteOne({ slug });
}

export async function upsertGalleryGroup(group: {
  title: string;
  slug: string;
  description?: string;
  images?: GalleryImage[];
  order?: number;
  originalSlug?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const title = group.title.trim();
  const slug = group.slug.trim().toLowerCase();
  if (!title || !slug) throw new Error("Gallery title and slug are required.");
  const searchKey = group.originalSlug?.trim().toLowerCase() || slug;
  const count = await db.collection("galleryGroups").countDocuments();
  const images = normalizeGalleryImages(group.images).map((image, index) => ({ ...image, order: index }));

  try {
    await db.collection("galleryGroups").updateOne(
      { slug: searchKey },
      {
        $set: {
          title,
          slug,
          description: group.description?.trim() || "",
          images,
          order: typeof group.order === "number" ? group.order : count,
        },
      },
      { upsert: true },
    );
  } catch (error: unknown) {
    if (isDuplicateKeyError(error)) throw new Error(`A gallery group with the slug "${slug}" already exists.`);
    throw error;
  }
}

export async function deleteGalleryGroup(slug: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("galleryGroups").deleteOne({ slug });
}

export async function upsertArticle(article: {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug?: string;
  publishedAt: string;
  featured?: boolean;
  layout?: ContentLayout;
  thumbnail?: string;
  content: string;
  pictures?: string[];
  videos?: string[];
  order?: number;
  originalSlug?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const title = article.title.trim();
  const slug = article.slug.trim().toLowerCase();
  if (!title || !slug) throw new Error("Article title and slug are required.");
  const searchKey = article.originalSlug?.trim().toLowerCase() || slug;
  const count = await db.collection("articles").countDocuments();

  try {
    await db.collection("articles").updateOne(
      { slug: searchKey },
      {
        $set: {
          title,
          excerpt: article.excerpt,
          slug,
          groupSlug: article.groupSlug || "engineering-notes",
          publishedAt: article.publishedAt,
          featured: Boolean(article.featured),
          layout: normalizeContentLayout(article.layout),
          content: article.content,
          thumbnail: article.thumbnail?.trim() || article.pictures?.[0] || "",
          pictures: article.pictures || [],
          videos: article.videos || [],
          order: typeof article.order === "number" ? article.order : count,
        },
      },
      { upsert: true },
    );
  } catch (error: any) {
    if (error?.code === 11000) throw new Error(`An article with the slug "${slug}" already exists.`);
    throw error;
  }
}

export async function deleteArticle(slug: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("articles").deleteOne({ slug });
}

export async function upsertSkill(skill: {
  name: string;
  category: string;
  level: number;
  order?: number;
  originalName?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const searchKey = skill.originalName || skill.name;
  const count = await db.collection("skills").countDocuments();

  await db.collection("skills").updateOne(
    { name: searchKey },
    {
      $set: {
        name: skill.name,
        category: skill.category,
        level: skill.level,
        order: typeof skill.order === "number" ? skill.order : count,
      },
    },
    { upsert: true }
  );
}

export async function deleteSkill(name: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("skills").deleteOne({ name });
}

export async function upsertResumeItem(item: {
  period: string;
  title: string;
  details: string;
  order?: number;
  originalTitle?: string;
}) {
  const db = await getDb();
  await ensureBootstrapped(db);
  const searchKey = item.originalTitle || item.title;
  const count = await db.collection("resumeItems").countDocuments();

  await db.collection("resumeItems").updateOne(
    { title: searchKey },
    {
      $set: {
        period: item.period,
        title: item.title,
        details: item.details,
        order: typeof item.order === "number" ? item.order : count,
      },
    },
    { upsert: true }
  );
}

export async function deleteResumeItem(title: string) {
  const db = await getDb();
  await ensureBootstrapped(db);
  await db.collection("resumeItems").deleteOne({ title });
}
