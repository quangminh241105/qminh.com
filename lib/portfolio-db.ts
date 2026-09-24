import { cache } from "react";
import clientPromise from "@/lib/mongodb";
import {
  portfolioStore,
  Skill,
  Project,
  Testimonial,
  Article,
  ArticleGroup,
  ResumeItem,
  type NavItem,
  type ResumeFile,
  type SocialLink,
} from "@/lib/portfolio";
import type { Db } from "mongodb";

type AboutSection = {
  intro: string;
  background: string;
  interests: string[];
};

export type PortfolioContent = {
  name: string;
  profession: string;
  tagline: string;
  location: string;
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
  const client = await clientPromise;
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
          content: a.content,
          pictures: a.pictures,
          videos: a.videos,
          order: idx,
        }))
      );
    }
    await db.collection("articles").createIndex({ slug: 1 }, { unique: true });
    await db.collection("articles").createIndex({ order: 1 });

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

    const [profileDoc, dbSkills, dbProjects, dbTestimonials, dbArticleGroups, dbArticles, dbResume] = await Promise.all([
      db.collection("profile").findOne({}, { sort: { updatedAt: -1 } }),
      db.collection("skills").find().sort({ order: 1 }).toArray(),
      db.collection("projects").find().sort({ order: 1 }).toArray(),
      db.collection("testimonials").find().sort({ order: 1 }).toArray(),
      db.collection("articleGroups").find().sort({ order: 1 }).toArray(),
      db.collection("articles").find().sort({ order: 1 }).toArray(),
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

    const plainArticles = dbArticles.map((a: any) => ({
      id: a._id?.toString?.() ?? a.slug,
      title: a.title,
      excerpt: a.excerpt,
      slug: a.slug,
      groupSlug: a.groupSlug || "engineering-notes",
      publishedAt: a.publishedAt,
      content: a.content || "",
      pictures: Array.isArray(a.pictures) ? a.pictures : [],
      videos: Array.isArray(a.videos) ? a.videos : [],
      body: a.content || "",
      coverImage: Array.isArray(a.pictures) ? a.pictures[0] : undefined,
      videoUrl: Array.isArray(a.videos) ? a.videos[0] : undefined,
      order: a.order,
    }));

    const plainArticleGroups = dbArticleGroups.map((group: any) => ({
      id: group.slug,
      name: group.name,
      slug: group.slug,
      description: group.description || "",
      coverImage: group.coverImage || undefined,
      articleCount: plainArticles.filter((article) => article.groupSlug === group.slug).length,
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
      navItems: Array.isArray(profileDoc.navItems) ? profileDoc.navItems : [...portfolioStore.navItems],
      socialLinks: withCanonicalSocialLinks(
        Array.isArray(profileDoc.socialLinks) ? profileDoc.socialLinks : [...portfolioStore.socialLinks],
      ),
      quickSummary: withUpdatedQuickSummary(
        Array.isArray(profileDoc.quickSummary) ? profileDoc.quickSummary : [...portfolioStore.quickSummary],
      ),
      about: profileDoc.about || { ...portfolioStore.about },
      skills: plainSkills,
      projects: plainProjects,
      featuredProjects: plainProjects.filter((p) => p.featured),
      testimonials: plainTestimonials,
      articles: plainArticles,
      articleGroups: plainArticleGroups,
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

    return {
      name: portfolioStore.name,
      profession: portfolioStore.profession,
      tagline: portfolioStore.tagline,
      location: portfolioStore.location,
      navItems: [...portfolioStore.navItems],
      socialLinks: [...portfolioStore.socialLinks],
      quickSummary: [...portfolioStore.quickSummary],
      about: { ...portfolioStore.about },
      skills: plainSkills,
      projects: plainProjects,
      featuredProjects: plainProjects.filter((p) => p.featured),
      testimonials: plainTestimonials,
      articles: plainArticles,
      articleGroups: plainArticleGroups,
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

export async function upsertArticle(article: {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug?: string;
  publishedAt: string;
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
          content: article.content,
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
