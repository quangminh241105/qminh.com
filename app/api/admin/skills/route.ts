import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { getPortfolioContent, upsertSkill } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const content = await getPortfolioContent();
  return NextResponse.json(content.skills, {
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
    if (!body.name || typeof body.level !== "number") {
      return NextResponse.json({ error: "Name and numeric level are required" }, { status: 400 });
    }

    await upsertSkill({
      name: body.name,
      category: body.category || "General",
      level: Number(body.level),
      order: body.order,
    });

    return NextResponse.json({ ok: true, message: "Skill saved successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to save skill" }, { status: 500 });
  }
}
