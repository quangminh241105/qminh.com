import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPLOAD_ROOT = path.resolve(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogv": "video/ogg",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function resolveUploadPath(segments: string[]) {
  if (
    segments.length === 0 ||
    segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\") || segment.includes("\0"))
  ) {
    return null;
  }

  const candidate = path.resolve(UPLOAD_ROOT, ...segments);
  const rootPrefix = `${UPLOAD_ROOT}${path.sep}`;
  return candidate.startsWith(rootPrefix) ? candidate : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const filePath = resolveUploadPath(segments);

  if (!filePath) {
    return new Response("Invalid upload path", { status: 400 });
  }

  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) {
      return new Response("Not found", { status: 404 });
    }

    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();

    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Content-Length": String(file.byteLength),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return new Response("Not found", { status: 404 });
    }

    console.error("[uploads] Failed to serve file:", error);
    return new Response("Unable to read upload", { status: 500 });
  }
}

export async function HEAD(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const response = await GET(request, context);
  return new Response(null, {
    status: response.status,
    headers: response.headers,
  });
}
