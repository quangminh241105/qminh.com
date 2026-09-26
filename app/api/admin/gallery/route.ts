import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getPortfolioContent, upsertGalleryGroup } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json(content.galleryGroups, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    await upsertGalleryGroup({
      title: typeof body.title === "string" ? body.title : "",
      slug: typeof body.slug === "string" ? body.slug : "",
      description: typeof body.description === "string" ? body.description : "",
      images: Array.isArray(body.images) ? body.images : [],
      order: body.order,
    });
    return NextResponse.json({ ok: true, message: "Gallery group saved successfully" });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to save gallery group" }, { status: 500 });
  }
}
