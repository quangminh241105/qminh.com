import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "crypto";
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

function safePathSegment(value: string, fallback: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

function safeUploadFolder(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return ["misc"];

  const segments = value
    .split(/[\\/]+/)
    .map((segment) => safePathSegment(segment, ""))
    .filter(Boolean)
    .slice(0, 5);

  return segments.length > 0 ? segments : ["misc"];
}

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

    const folderSegments = safeUploadFolder(formData.get("folder"));
    const originalExtension = path.extname(file.name).toLowerCase();
    const extension = originalExtension || `.${file.type.split("/")[1]}`;
    const baseName = safePathSegment(path.basename(file.name, originalExtension), "upload");
    const uniqueFilename = `${baseName}-${new Date().toISOString().replace(/[-:.TZ]/g, "")}-${randomUUID().slice(0, 8)}${extension}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", ...folderSegments);
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueFilename);
    await writeFile(filePath, buffer);

    const relativePath = [...folderSegments, uniqueFilename].join("/");
    const publicUrl = `/uploads/${relativePath}`;

    return NextResponse.json({
      ok: true,
      url: publicUrl,
      filename: uniqueFilename,
      folder: folderSegments.join("/"),
      size: file.size,
      type: file.type,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during upload" },
      { status: 500 }
    );
  }
}
