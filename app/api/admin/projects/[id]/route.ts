import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { upsertProject, deleteProject } from "@/lib/portfolio-db";

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
  const originalTitle = decodeURIComponent(id);

  try {
    const body = await req.json();
    await upsertProject({
      originalTitle,
      title: body.title || originalTitle,
      summary: body.summary || "",
      technologies: Array.isArray(body.technologies) ? body.technologies : [],
      repoUrl: body.repoUrl || "",
      demoUrl: body.demoUrl || "",
      featured: Boolean(body.featured),
      layout: body.layout,
      thumbnail: typeof body.thumbnail === "string" ? body.thumbnail : undefined,
      pictures: Array.isArray(body.pictures) ? body.pictures : [],
      videos: Array.isArray(body.videos) ? body.videos : [],
      customVariables: body.customVariables || {},
      content: body.content || "",
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Project updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const title = decodeURIComponent(id);

  try {
    await deleteProject(title);
    return NextResponse.json({ ok: true, message: "Project deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete project" }, { status: 500 });
  }
}
