import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { upsertSkill, deleteSkill } from "@/lib/portfolio-db";

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
  const originalName = decodeURIComponent(id);

  try {
    const body = await req.json();
    await upsertSkill({
      originalName,
      name: body.name || originalName,
      category: body.category || "General",
      level: Number(body.level || 80),
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Skill updated" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const name = decodeURIComponent(id);

  try {
    await deleteSkill(name);
    return NextResponse.json({ ok: true, message: "Skill deleted" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to delete skill" }, { status: 500 });
  }
}
