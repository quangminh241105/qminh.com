import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getPortfolioContent, upsertArticle } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json(content.articles, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.slug) {
      return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
    }

    await upsertArticle({
      title: body.title,
      excerpt: body.excerpt || "",
      slug: body.slug,
      groupSlug: body.groupSlug || "engineering-notes",
      publishedAt: body.publishedAt || new Date().toISOString().split("T")[0],
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail : undefined,
      content: body.content || "",
      pictures: Array.isArray(body.pictures) ? body.pictures : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Article saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save article" }, { status: 500 });
  }
}
