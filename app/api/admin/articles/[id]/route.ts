import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { upsertArticle, deleteArticle } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const originalSlug = decodeURIComponent(id);

  try {
    const body = await req.json();
    await upsertArticle({
      originalSlug,
      title: body.title || "",
      excerpt: body.excerpt || "",
      slug: body.slug || originalSlug,
      groupSlug: body.groupSlug || "engineering-notes",
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      featured: Boolean(body.featured),
      layout: body.layout,
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail : undefined,
      content: body.content || "",
      pictures: Array.isArray(body.pictures) ? body.pictures : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Article updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update article" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const slug = decodeURIComponent(id);

  try {
    await deleteArticle(slug);
    return NextResponse.json({ ok: true, message: "Article deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete article" }, { status: 500 });
  }
}
