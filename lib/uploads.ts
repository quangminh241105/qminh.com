import { unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function resolveUploadedFile(url: string) {
  try {
    const pathname = new URL(url, "http://local-upload-host").pathname;
    if (!pathname.startsWith("/uploads/")) return null;

    const segments = pathname
      .slice("/uploads/".length)
      .split("/")
      .map((segment) => decodeURIComponent(segment));
    if (
      segments.length === 0 ||
      segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\") || segment.includes("\0"))
    ) {
      return null;
    }

    const root = path.resolve(UPLOAD_DIR);
    const candidate = path.resolve(root, ...segments);
    return candidate.startsWith(`${root}${path.sep}`) ? candidate : null;
  } catch {
    return null;
  }
}

export async function deleteUploadedFile(url: string | undefined | null): Promise<void> {
  if (!url) return;
  const filePath = resolveUploadedFile(url);
  if (!filePath) return;

  try {
    await unlink(filePath);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.error("[uploads] Failed to delete file:", url, error);
    }
  }
}

export async function deleteUploadedFiles(urls: Array<string | undefined | null>): Promise<void> {
  await Promise.all(urls.map((url) => deleteUploadedFile(url)));
}
