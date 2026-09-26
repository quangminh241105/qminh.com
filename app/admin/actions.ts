"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  SESSION_COOKIE_NAME,
  signSession,
  verifyAdminPassword,
  isAuthenticatedAdmin,
} from "@/lib/auth";
import {
  updateProfile,
  updateResumeFile,
  upsertProject,
  deleteProject,
  upsertArticle,
  deleteArticle,
  upsertArticleGroup,
  deleteArticleGroup,
  upsertGalleryGroup,
  deleteGalleryGroup,
  upsertSkill,
  deleteSkill,
  upsertResumeItem,
  deleteResumeItem,
} from "@/lib/portfolio-db";
import type { ContentLayout, ContentSection, GalleryImage, ResumeFile } from "@/lib/portfolio";

export async function loginAdminAction(_prevState: unknown, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || !verifyAdminPassword(password)) {
    return { error: "Invalid Admin Key / Password" };
  }

  const token = await signSession({ role: "admin", loggedInAt: Date.now() });
  const cookieStore = await cookies();
  const requestHeaders = await headers();
  const forwardedProtocol = requestHeaders.get("x-forwarded-proto")?.split(",")[0].trim().toLowerCase();
  const requestOrigin = requestHeaders.get("origin") || requestHeaders.get("referer") || "";
  const secureCookie = forwardedProtocol === "https" || requestOrigin.startsWith("https://");

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect("/admin");
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/admin/login");
}

async function requireAuth() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    throw new Error("Unauthorized");
  }
}

export async function updateProfileServerAction(data: {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  avatar?: string;
  quickSummary: string[];
  about: { intro: string; background: string; interests: string[] };
}) {
  try {
    await requireAuth();
    await updateProfile(data);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to update profile.");
  }
}

export async function saveProjectServerAction(data: {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  layout?: ContentLayout;
  sections?: ContentSection[];
  thumbnail?: string;
  pictures: string[];
  videos: string[];
  customVariables: Record<string, string>;
  content: string;
  order?: number;
  originalTitle?: string;
}) {
  try {
    await requireAuth();
    await upsertProject(data);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save project.");
  }
}

export async function deleteProjectServerAction(title: string) {
  try {
    await requireAuth();
    await deleteProject(title);
    revalidatePath("/");
    revalidatePath("/projects");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to delete project.");
  }
}

export async function saveArticleServerAction(data: {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug?: string;
  publishedAt: string;
  featured?: boolean;
  layout?: ContentLayout;
  sections?: ContentSection[];
  thumbnail?: string;
  content: string;
  pictures: string[];
  videos: string[];
  order?: number;
  originalSlug?: string;
}) {
  try {
    await requireAuth();
    await upsertArticle(data);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath(`/blog/${data.groupSlug || "engineering-notes"}/${data.slug}`);
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save article.");
  }
}

export async function deleteArticleServerAction(slug: string) {
  try {
    await requireAuth();
    await deleteArticle(slug);
    revalidatePath("/");
    revalidatePath("/blog");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to delete article.");
  }
}

export async function saveSkillServerAction(data: {
  name: string;
  category: string;
  level: number;
  order?: number;
  originalName?: string;
}) {
  try {
    await requireAuth();
    await upsertSkill(data);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save skill.");
  }
}

export async function deleteSkillServerAction(name: string) {
  try {
    await requireAuth();
    await deleteSkill(name);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to delete skill.");
  }
}

export async function saveResumeItemServerAction(data: {
  period: string;
  title: string;
  details: string;
  order?: number;
  originalTitle?: string;
}) {
  try {
    await requireAuth();
    await upsertResumeItem(data);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/resume");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save resume entry.");
  }
}

export async function deleteResumeItemServerAction(title: string) {
  try {
    await requireAuth();
    await deleteResumeItem(title);
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/resume");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to delete resume entry.");
  }
}

function actionFailure(error: unknown, fallback: string): { ok: false; error: string } {
  console.error(fallback, error);
  if (error instanceof Error && error.message === "Unauthorized") {
    return { ok: false, error: "Admin session expired. Sign in again." };
  }

  if (error instanceof Error && /mongodb|mongo server|server selection|econnrefused|enotfound|mongod[b]?_uri/i.test(error.message)) {
    return { ok: false, error: `Database unavailable. ${error.message}` };
  }

  return {
    ok: false,
    error: error instanceof Error ? error.message : fallback,
  };
}

// Compatibility actions used by the admin panels.
export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function updateProfileAction(data: {
  name: string;
  profession: string;
  tagline: string;
  location: string;
  avatar?: string;
  navItems?: unknown;
  socialLinks?: unknown;
  resumeFile?: unknown;
  quickSummary: string[];
  about: { intro: string; background: string; interests: string[] };
}) {
  await requireAuth();
  await updateProfile(data as Parameters<typeof updateProfile>[0]);
  revalidatePath("/", "layout");
}

export async function upsertProjectAction(data: {
  id?: string;
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  layout?: ContentLayout;
  sections?: ContentSection[];
  thumbnail?: string;
  images?: string[];
  videoUrl?: string;
  customVars?: Record<string, string>;
}) {
  await requireAuth();
  await upsertProject({
    title: data.title,
    summary: data.summary,
    technologies: data.technologies,
    repoUrl: data.repoUrl,
    demoUrl: data.demoUrl,
    featured: data.featured,
    layout: data.layout,
    sections: data.sections,
    thumbnail: data.thumbnail,
    pictures: data.images,
    videos: data.videoUrl ? [data.videoUrl] : [],
    customVariables: data.customVars,
  });
  revalidatePath("/", "layout");
}

export async function deleteProjectAction(id: string) {
  await requireAuth();
  await deleteProject(id);
  revalidatePath("/", "layout");
}

export async function upsertArticleAction(data: {
  id?: string;
  title: string;
  excerpt: string;
  slug: string;
  groupSlug?: string;
  publishedAt: string;
  featured?: boolean;
  layout?: ContentLayout;
  sections?: ContentSection[];
  body?: string;
  coverImage?: string;
  thumbnail?: string;
  videoUrl?: string;
}) {
  await requireAuth();
  await upsertArticle({
    title: data.title,
    excerpt: data.excerpt,
    slug: data.slug,
    groupSlug: data.groupSlug,
    publishedAt: data.publishedAt,
    featured: data.featured,
    layout: data.layout,
    sections: data.sections,
    content: data.body ?? "",
    thumbnail: data.thumbnail || data.coverImage,
    pictures: data.coverImage ? [data.coverImage] : [],
    videos: data.videoUrl ? [data.videoUrl] : [],
  });
  revalidatePath("/", "layout");
}

export async function deleteArticleAction(id: string) {
  await requireAuth();
  await deleteArticle(id);
  revalidatePath("/", "layout");
}

export async function upsertArticleGroupAction(data: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
}) {
  try {
    await requireAuth();
    await upsertArticleGroup({
      originalSlug: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      coverImage: data.coverImage,
    });
    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save blog group.");
  }
}

export async function deleteArticleGroupAction(id: string) {
  try {
    await requireAuth();
    await deleteArticleGroup(id);
    revalidatePath("/", "layout");
    revalidatePath("/blog");
    revalidatePath("/admin");
    return { ok: true, message: undefined as string | undefined };
  } catch (error) {
    const result = actionFailure(error, "Failed to delete blog group.");
    return { ok: false, message: result.error } as const;
  }
}

export async function saveGalleryGroupServerAction(data: {
  title: string;
  slug: string;
  description: string;
  images: GalleryImage[];
  order?: number;
  originalSlug?: string;
}) {
  try {
    await requireAuth();
    await upsertGalleryGroup(data);
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to save gallery group.");
  }
}

export async function deleteGalleryGroupServerAction(slug: string) {
  try {
    await requireAuth();
    await deleteGalleryGroup(slug);
    revalidatePath("/gallery");
    revalidatePath("/admin");
    return { ok: true } as const;
  } catch (error) {
    return actionFailure(error, "Failed to delete gallery group.");
  }
}

export async function upsertSkillAction(data: { id?: string; name: string; category: string; level: number }) {
  await requireAuth();
  await upsertSkill(data);
  revalidatePath("/", "layout");
}

export async function deleteSkillAction(id: string) {
  await requireAuth();
  await deleteSkill(id);
  revalidatePath("/", "layout");
}

export async function upsertResumeItemAction(data: { id?: string; period: string; title: string; details: string }) {
  await requireAuth();
  await upsertResumeItem(data);
  revalidatePath("/", "layout");
}

export async function deleteResumeItemAction(id: string) {
  await requireAuth();
  await deleteResumeItem(id);
  revalidatePath("/", "layout");
}

export async function updateResumeFileAction(file: ResumeFile) {
  await requireAuth();
  await updateResumeFile(file);
  revalidatePath("/", "layout");
}
