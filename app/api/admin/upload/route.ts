import { NextRequest, NextResponse } from "next/server";
import { isAuthenticatedAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { randomUUID } from "node:crypto";
import path from "path";

export const dynamic = "force-dynamic";

type UploadKind = "image" | "video" | "media" | "resume";

const ALLOWED_EXTENSIONS: Record<string, Set<string>> = {
  "image/jpeg": new Set([".jpg", ".jpeg"]),
  "image/png": new Set([".png"]),
  "image/webp": new Set([".webp"]),
  "image/gif": new Set([".gif"]),
  "video/mp4": new Set([".mp4"]),
  "video/webm": new Set([".webm"]),
  "video/ogg": new Set([".ogv", ".ogg"]),
  "video/quicktime": new Set([".mov"]),
  "application/pdf": new Set([".pdf"]),
  "application/msword": new Set([".doc"]),
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": new Set([".docx"]),
};

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/ogg", "video/quicktime"]);
const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MIME_TYPES_BY_KIND: Record<UploadKind, Set<string>> = {
  image: IMAGE_MIME_TYPES,
  video: VIDEO_MIME_TYPES,
  media: new Set([...IMAGE_MIME_TYPES, ...VIDEO_MIME_TYPES]),
  resume: RESUME_MIME_TYPES,
};

const MAX_FILE_SIZE_BY_KIND: Record<UploadKind, number> = {
  image: 15 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  media: 50 * 1024 * 1024,
  resume: 10 * 1024 * 1024,
};

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

function safeUploadFolder(value: FormDataEntryValue | null, fallback: string[]) {
  if (typeof value !== "string") return fallback;

  const segments = value
    .split(/[\\/]+/)
    .map((segment) => safePathSegment(segment, ""))
    .filter(Boolean)
    .slice(0, 5);

  return segments.length > 0 ? segments : fallback;
}

function getUploadKind(value: FormDataEntryValue | null): UploadKind | null {
  if (typeof value !== "string" || value === "") return "media";
  return value in MIME_TYPES_BY_KIND ? (value as UploadKind) : null;
}

function hasValidSignature(buffer: Buffer, mimeType: string) {
  const startsWith = (...bytes: number[]) => buffer.subarray(0, bytes.length).equals(Buffer.from(bytes));
  const asciiAt = (offset: number, value: string) => buffer.subarray(offset, offset + value.length).toString("ascii") === value;

  switch (mimeType) {
    case "image/jpeg":
      return startsWith(0xff, 0xd8, 0xff);
    case "image/png":
      return startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/webp":
      return asciiAt(0, "RIFF") && asciiAt(8, "WEBP");
    case "image/gif":
      return asciiAt(0, "GIF87a") || asciiAt(0, "GIF89a");
    case "video/mp4":
    case "video/quicktime":
      return asciiAt(4, "ftyp");
    case "video/webm":
      return startsWith(0x1a, 0x45, 0xdf, 0xa3);
    case "video/ogg":
      return asciiAt(0, "OggS");
    case "application/pdf":
      return asciiAt(0, "%PDF");
    case "application/msword":
      return startsWith(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return startsWith(0x50, 0x4b, 0x03, 0x04);
    default:
      return false;
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await isAuthenticatedAdmin();
  if (!isAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kind = getUploadKind(formData.get("kind"));

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!kind) {
      return NextResponse.json({ error: "Unsupported upload category." }, { status: 400 });
    }

    const allowedMimeTypes = MIME_TYPES_BY_KIND[kind];
    const allowedExtensions = ALLOWED_EXTENSIONS[file.type];
    const originalExtension = path.extname(file.name).toLowerCase();

    if (!allowedMimeTypes.has(file.type) || !allowedExtensions) {
      return NextResponse.json(
        { error: `Unsupported file type for ${kind} uploads (${file.type || "unknown"}).` },
        { status: 400 }
      );
    }

    if (originalExtension && !allowedExtensions.has(originalExtension)) {
      return NextResponse.json(
        { error: `The file extension does not match its detected type (${file.type}).` },
        { status: 400 }
      );
    }

    const maxFileSize = MAX_FILE_SIZE_BY_KIND[kind];
    if (file.size > maxFileSize) {
      return NextResponse.json(
        { error: `File size exceeds the ${Math.round(maxFileSize / (1024 * 1024))}MB limit for ${kind} uploads.` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!hasValidSignature(buffer, file.type)) {
      return NextResponse.json(
        { error: "The file contents do not match the selected file type." },
        { status: 400 }
      );
    }

    const folderSegments = safeUploadFolder(formData.get("folder"), kind === "resume" ? ["resume"] : ["misc"]);
    const extension = originalExtension || [...allowedExtensions][0];
    const requestedPrefix = folderSegments[folderSegments.length - 1] || kind;
    const filePrefix = safePathSegment(requestedPrefix === "screenshots" ? "screenshot" : requestedPrefix, kind);
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, "").replace("T", "-");
    const uniqueFilename = `${filePrefix}-${timestamp}-${randomUUID().slice(0, 8)}${extension}`;

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
      name: uniqueFilename,
      folder: folderSegments.join("/"),
      format: kind === "resume" ? extension.slice(1) : undefined,
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
