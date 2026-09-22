import { NextResponse } from "next/server";
import { checkDbHealth } from "@/lib/portfolio-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkDbHealth();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
