import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getPortfolioContent, upsertProject } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json(content.projects, {
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
    if (!body.title || !body.summary) {
      return NextResponse.json({ error: "Title and summary are required" }, { status: 400 });
    }

    await upsertProject({
      title: body.title,
      summary: body.summary,
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      repoUrl: body.repoUrl || "",
      demoUrl: body.demoUrl || "",
      featured: Boolean(body.featured),
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail : undefined,
      pictures: Array.isArray(body.pictures) ? body.pictures : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      customVariables: body.customVariables || {},
      content: body.content || "",
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Project saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save project" }, { status: 500 });
  }
}
