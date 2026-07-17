"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createSessionToken, verifyAdminKey, verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
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
  type ProfileDoc,
  type ProjectDoc,
  type ArticleDoc,
  type SkillDoc,
  type ResumeItemDoc,
} from "@/lib/portfolio-db";

async function requireSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) {
    throw new Error("Unauthorized");
  }
}

function revalidateAll(): void {
  // Root layout wraps every route, so this refreshes all public pages
  // (including dynamic /projects/[slug] and /blog/[slug]) in one call.
  revalidatePath("/", "layout");
}

export async function loginAction(password: string): Promise<{ ok: boolean; message?: string }> {
  if (!verifyAdminKey(password)) {
    return { ok: false, message: "Invalid credentials" };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function updateProfileAction(data: Omit<ProfileDoc, "updatedAt">): Promise<void> {
  await requireSession();
  await updateProfile(data);
  revalidateAll();
}

export async function upsertProjectAction(data: Partial<ProjectDoc> & { id?: string }): Promise<void> {
  await requireSession();
  await upsertProject(data);
  revalidateAll();
}

export async function deleteProjectAction(id: string): Promise<void> {
  await requireSession();
  await deleteProject(id);
  revalidateAll();
}

export async function upsertArticleAction(data: Partial<ArticleDoc> & { id?: string }): Promise<void> {
  await requireSession();
  await upsertArticle(data);
  revalidateAll();
}

export async function deleteArticleAction(id: string): Promise<void> {
  await requireSession();
  await deleteArticle(id);
  revalidateAll();
}

export async function upsertSkillAction(data: Partial<SkillDoc> & { id?: string }): Promise<void> {
  await requireSession();
  await upsertSkill(data);
  revalidateAll();
}

export async function deleteSkillAction(id: string): Promise<void> {
  await requireSession();
  await deleteSkill(id);
  revalidateAll();
}

export async function upsertResumeItemAction(data: Partial<ResumeItemDoc> & { id?: string }): Promise<void> {
  await requireSession();
  await upsertResumeItem(data);
  revalidateAll();
}

export async function deleteResumeItemAction(id: string): Promise<void> {
  await requireSession();
  await deleteResumeItem(id);
  revalidateAll();
}
