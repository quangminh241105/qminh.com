import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { deleteGalleryGroup, upsertGalleryGroup } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await request.json();
    await upsertGalleryGroup({
      originalSlug: decodeURIComponent(id),
      title: typeof body.title === "string" ? body.title : "",
      slug: typeof body.slug === "string" ? body.slug : decodeURIComponent(id),
      description: typeof body.description === "string" ? body.description : "",
      images: Array.isArray(body.images) ? body.images : [],
      order: body.order,
    });
    return NextResponse.json({ ok: true, message: "Gallery group updated" });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update gallery group" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  try {
    await deleteGalleryGroup(decodeURIComponent(id));
    return NextResponse.json({ ok: true, message: "Gallery group deleted" });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to delete gallery group" }, { status: 500 });
  }
}
