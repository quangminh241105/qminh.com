"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { deleteResumeItemAction, updateResumeFileAction, upsertResumeItemAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import type { PortfolioContent } from "@/lib/portfolio-db";
import type { ResumeFile } from "@/lib/portfolio";
import { UploadField } from "./UploadField";

type ResumeItem = PortfolioContent["resume"][number];

const emptyForm = { id: undefined as string | undefined, period: "", title: "", details: "" };

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export function ResumeTab({ resume, resumeFile }: { resume: ResumeItem[]; resumeFile?: ResumeFile }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [fileMessage, setFileMessage] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await upsertResumeItemAction(form);
      setForm(emptyForm);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume entry?")) return;
    await deleteResumeItemAction(id);
    router.refresh();
  }

  async function handleResumeUploaded(
    url: string,
    metadata?: { name: string; size: number; format?: "doc" | "docx" | "pdf" },
  ) {
    if (!metadata?.format) return;
    setIsSavingFile(true);
    setFileMessage(null);
    setFileError(null);
    try {
      await updateResumeFileAction({
        url,
        name: metadata.name,
        size: metadata.size,
        format: metadata.format,
        updatedAt: new Date().toISOString(),
      });
      setFileMessage("CV updated. The public download link is live now.");
      router.refresh();
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Could not save the CV");
    } finally {
      setIsSavingFile(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="border-brand-200 bg-brand-50/50 dark:border-brand-900/70 dark:bg-brand-950/20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-400">Public CV</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Keep your downloadable CV current</h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Upload a new document and it replaces the current public version automatically. Only DOC, DOCX, and PDF files up to 10MB are accepted.
            </p>
          </div>
          {resumeFile ? (
            <a
              href={resumeFile.url}
              download={resumeFile.name}
              className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-300 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-slate-900 dark:text-brand-300 dark:hover:bg-brand-950/50"
            >
              Preview current CV
            </a>
          ) : null}
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-brand-300 bg-white/70 p-4 dark:border-brand-800 dark:bg-slate-950/40">
          {resumeFile ? (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold">{resumeFile.name}</span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold uppercase text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">{resumeFile.format}</span>
              <span className="text-slate-500 dark:text-slate-400">{formatBytes(resumeFile.size)} · Updated {formatDate(resumeFile.updatedAt)}</span>
            </div>
          ) : (
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">No custom CV uploaded yet. The public page currently uses the fallback text resume.</p>
          )}
          <UploadField
            label="Upload replacement CV"
            accept=".doc,.docx,.pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf"
            kind="resume"
            helperText={isSavingFile ? "Saving the new CV…" : "Accepted formats: .doc, .docx, .pdf · Maximum size: 10MB"}
            onUploaded={handleResumeUploaded}
          />
          {fileMessage ? <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">{fileMessage}</p> : null}
          {fileError ? <p className="mt-2 text-sm font-medium text-rose-600 dark:text-rose-400">{fileError}</p> : null}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {form.id ? "Edit entry" : "Add resume entry"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="r-period">Period</Label>
            <Input
              id="r-period"
              required
              placeholder="2024 - Present"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="r-title">Title</Label>
            <Input id="r-title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="r-details">Details</Label>
            <Textarea
              id="r-details"
              required
              rows={3}
              value={form.details}
              onChange={(e) => setForm((f) => ({ ...f, details: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <UiButton type="submit" isLoading={isSaving}>
              {form.id ? "Save changes" : "Add entry"}
            </UiButton>
            {form.id ? (
              <UiButton type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                Cancel
              </UiButton>
            ) : null}
          </div>
        </form>
      </Card>

      <div className="grid gap-3">
        {resume.map((item) => (
          <Card key={item.id} className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
                {item.period}
              </p>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">{item.title}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.details}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <UiButton
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setForm({ id: item.id, period: item.period, title: item.title, details: item.details })}
              >
                Edit
              </UiButton>
              <UiButton type="button" size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                Delete
              </UiButton>
            </div>
          </Card>
        ))}
      </div>
      </div>
    </div>
  );
}
