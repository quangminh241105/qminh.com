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
  upsertProject,
  deleteProject,
  upsertArticle,
  deleteArticle,
  upsertSkill,
  deleteSkill,
  upsertResumeItem,
  deleteResumeItem,
} from "@/lib/portfolio-db";

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
