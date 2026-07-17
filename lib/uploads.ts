import { unlink } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Only ever matches filenames this app itself generates (see the upload
// route's randomUUID()-based naming) - anything else (external URLs, hand
// -typed paths) is left alone rather than risking deleting the wrong file.
const UPLOAD_URL_PATTERN = /^\/uploads\/([a-zA-Z0-9-]+\.[a-zA-Z0-9]+)$/;

export async function deleteUploadedFile(url: string | undefined | null): Promise<void> {
  if (!url) return;
  const match = url.match(UPLOAD_URL_PATTERN);
  if (!match) return;

  try {
    await unlink(path.join(UPLOAD_DIR, match[1]));
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
