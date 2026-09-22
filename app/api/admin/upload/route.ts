import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type (${file.type}). Allowed: images and videos.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename and create unique timestamped name
    const ext = path.extname(file.name) || `.${file.type.split("/")[1]}`;
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${ext}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      filename: uniqueFilename,
      size: file.size,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload" },
      { status: 500 }
    );
  }
}
