"use server";

import { cookies } from "next/headers";
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
  upsertSkill,
  deleteSkill,
  upsertResumeItem,
  deleteResumeItem,
} from "@/lib/portfolio-db";
import type { ResumeFile } from "@/lib/portfolio";

export async function loginAdminAction(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || !verifyAdminPassword(password)) {
    return { error: "Invalid Admin Key / Password" };
  }

  const token = await signSession({ role: "admin", loggedInAt: Date.now() });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
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
  quickSummary: string[];
  about: { intro: string; background: string; interests: string[] };
}) {
  await requireAuth();
  await updateProfile(data);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveProjectServerAction(data: {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  pictures: string[];
  videos: string[];
  customVariables: Record<string, string>;
  content: string;
  order?: number;
  originalTitle?: string;
}) {
  await requireAuth();
  await upsertProject(data);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteProjectServerAction(title: string) {
  await requireAuth();
  await deleteProject(title);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveArticleServerAction(data: {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug?: string;
  publishedAt: string;
  content: string;
  pictures: string[];
  videos: string[];
  order?: number;
  originalSlug?: string;
}) {
  await requireAuth();
  await upsertArticle(data);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteArticleServerAction(slug: string) {
  await requireAuth();
  await deleteArticle(slug);
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveSkillServerAction(data: {
  name: string;
  category: string;
  level: number;
  order?: number;
  originalName?: string;
}) {
  await requireAuth();
  await upsertSkill(data);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteSkillServerAction(name: string) {
  await requireAuth();
  await deleteSkill(name);
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin");
  return { ok: true };
}

export async function saveResumeItemServerAction(data: {
  period: string;
  title: string;
  details: string;
  order?: number;
  originalTitle?: string;
}) {
  await requireAuth();
  await upsertResumeItem(data);
  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteResumeItemServerAction(title: string) {
  await requireAuth();
  await deleteResumeItem(title);
  revalidatePath("/");
  revalidatePath("/resume");
  revalidatePath("/admin");
  return { ok: true };
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
  body?: string;
  coverImage?: string;
  videoUrl?: string;
}) {
  await requireAuth();
  await upsertArticle({
    title: data.title,
    excerpt: data.excerpt,
    slug: data.slug,
    groupSlug: data.groupSlug,
    publishedAt: data.publishedAt,
    content: data.body ?? "",
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

export async function upsertArticleGroupAction(_data: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: string;
}) {
  await requireAuth();
  revalidatePath("/", "layout");
}

export async function deleteArticleGroupAction(_id: string) {
  await requireAuth();
  revalidatePath("/", "layout");
  return { ok: true, message: undefined as string | undefined };
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
