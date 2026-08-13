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

const RESUME_TYPES: Record<string, { format: "doc" | "docx" | "pdf"; maxBytes: number; mimeTypes: string[] }> = {
  doc: { format: "doc", maxBytes: 10 * 1024 * 1024, mimeTypes: ["application/msword", "application/octet-stream"] },
  docx: {
    format: "docx",
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"],
  },
  pdf: { format: "pdf", maxBytes: 10 * 1024 * 1024, mimeTypes: ["application/pdf", "application/octet-stream"] },
};

function hasExpectedSignature(format: "doc" | "docx" | "pdf", bytes: Buffer): boolean {
  if (format === "pdf") return bytes.subarray(0, 5).toString("ascii") === "%PDF-";
  if (format === "doc") return bytes.subarray(0, 8).equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]));
  return bytes.subarray(0, 4).equals(Buffer.from([0x50, 0x4b, 0x03, 0x04]));
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedRequest(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind") === "resume" ? "resume" : "media";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const resumeSpec = kind === "resume" ? RESUME_TYPES[extension] : undefined;
  const spec = kind === "media" ? ALLOWED_TYPES[file.type] : undefined;

  if (kind === "resume") {
    if (!resumeSpec || (file.type && !resumeSpec.mimeTypes.includes(file.type))) {
      return NextResponse.json(
        { ok: false, message: "CV must be a .doc, .docx, or .pdf file" },
        { status: 415, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (file.size > resumeSpec.maxBytes) {
      return NextResponse.json(
        { ok: false, message: "CV must be 10MB or smaller" },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }

    const resumeBytes = Buffer.from(await file.arrayBuffer());
    if (!hasExpectedSignature(resumeSpec.format, resumeBytes)) {
      return NextResponse.json(
        { ok: false, message: "The file contents do not match its .doc, .docx, or .pdf extension" },
        { status: 415, headers: { "Cache-Control": "no-store" } },
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.${resumeSpec.format}`;
    await writeFile(path.join(UPLOAD_DIR, filename), resumeBytes);

    return NextResponse.json(
      { ok: true, url: `/uploads/${filename}`, name: file.name, size: file.size, format: resumeSpec.format },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

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
