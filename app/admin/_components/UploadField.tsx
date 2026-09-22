"use client";

import { useState, type ChangeEvent } from "react";
import { Label } from "@/components/ui/input";

type UploadFieldProps = {
  label: string;
  accept: string;
  kind?: "media" | "resume";
  helperText?: string;
  onUploaded: (url: string, metadata?: { name: string; size: number; format?: "doc" | "docx" | "pdf" }) => void;
};

export function UploadField({ label, accept, kind = "media", helperText, onUploaded }: UploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Upload failed");
      }
      onUploaded(data.url as string, {
        name: (data.name as string) ?? file.name,
        size: (data.size as number) ?? file.size,
        format: data.format as "doc" | "docx" | "pdf" | undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={isUploading}
        className="block text-sm text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-500 dark:text-slate-300"
      />
      {helperText ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{helperText}</p> : null}
      {isUploading ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Uploading…</p> : null}
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
