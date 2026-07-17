import { NextResponse } from "next/server";
import { pingDatabase } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await pingDatabase();

  if (result.ok) {
    return NextResponse.json(
      { ok: true, database: result.database, message: "MongoDB connection is healthy." },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { ok: false, message: result.error },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
