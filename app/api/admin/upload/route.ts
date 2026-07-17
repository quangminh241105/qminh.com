import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthorizedRequest } from "@/lib/auth";
import { UPLOAD_DIR } from "@/lib/uploads";

const ALLOWED_TYPES: Record<string, { extension: string; maxBytes: number }> = {
  "image/jpeg": { extension: "jpg", maxBytes: 8 * 1024 * 1024 },
  "image/png": { extension: "png", maxBytes: 8 * 1024 * 1024 },
  "image/webp": { extension: "webp", maxBytes: 8 * 1024 * 1024 },
  "image/gif": { extension: "gif", maxBytes: 8 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", maxBytes: 100 * 1024 * 1024 },
  "video/webm": { extension: "webm", maxBytes: 100 * 1024 * 1024 },
};

export async function POST(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const spec = ALLOWED_TYPES[file.type];
  if (!spec) {
    return NextResponse.json(
      { ok: false, message: `Unsupported file type: ${file.type}` },
      { status: 415, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (file.size > spec.maxBytes) {
    return NextResponse.json(
      { ok: false, message: `File exceeds the ${Math.round(spec.maxBytes / (1024 * 1024))}MB limit` },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const filename = `${randomUUID()}.${spec.extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, filename), bytes);

  return NextResponse.json(
    { ok: true, url: `/uploads/${filename}` },
    { headers: { "Cache-Control": "no-store" } },
  );
}
