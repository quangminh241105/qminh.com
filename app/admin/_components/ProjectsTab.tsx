"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertProjectAction, deleteProjectAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UploadField } from "./UploadField";
import type { PortfolioContent } from "@/lib/portfolio-db";

type ProjectItem = PortfolioContent["projects"][number];

const emptyForm = {
  id: undefined as string | undefined,
  title: "",
  summary: "",
  technologies: "",
  repoUrl: "",
  demoUrl: "",
  featured: false,
  images: [] as string[],
  videoUrl: "",
  customVarsText: "",
};

export function ProjectsTab({ projects }: { projects: ProjectItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(project: ProjectItem) {
    setForm({
      id: project.id,
      title: project.title,
      summary: project.summary,
      technologies: project.technologies.join(", "),
      repoUrl: project.repoUrl,
      demoUrl: project.demoUrl,
      featured: project.featured,
      images: project.images ?? [],
      videoUrl: project.videoUrl ?? "",
      customVarsText: Object.entries(project.customVars ?? {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const customVars: Record<string, string> = {};
      for (const line of form.customVarsText.split("\n")) {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) continue;
        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();
        if (key) customVars[key] = value;
      }

      await upsertProjectAction({
        id: form.id,
        title: form.title,
        summary: form.summary,
        technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
        repoUrl: form.repoUrl,
        demoUrl: form.demoUrl,
        featured: form.featured,
        images: form.images,
        videoUrl: form.videoUrl || undefined,
        customVars: Object.keys(customVars).length > 0 ? customVars : undefined,
      });
      setForm(emptyForm);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await deleteProjectAction(id);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {form.id ? "Edit project" : "Add project"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="p-summary">Summary</Label>
            <Textarea
              id="p-summary"
              required
              rows={3}
              value={form.summary}
              onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="p-tech">Technologies (comma separated)</Label>
            <Input
              id="p-tech"
              value={form.technologies}
              onChange={(e) => setForm((f) => ({ ...f, technologies: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-repo">Repository URL</Label>
              <Input id="p-repo" value={form.repoUrl} onChange={(e) => setForm((f) => ({ ...f, repoUrl: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="p-demo">Demo URL</Label>
              <Input id="p-demo" value={form.demoUrl} onChange={(e) => setForm((f) => ({ ...f, demoUrl: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
            />
            Featured
          </label>
          <div>
            <Label htmlFor="p-vars">Custom variables (one &quot;key: value&quot; per line)</Label>
            <Textarea
              id="p-vars"
              rows={3}
              value={form.customVarsText}
              onChange={(e) => setForm((f) => ({ ...f, customVarsText: e.target.value }))}
            />
          </div>

          <UploadField
            label="Add image"
            accept="image/*"
            onUploaded={(url) => setForm((f) => ({ ...f, images: [...f.images, url] }))}
          />
          {form.images.length > 0 ? (
            <ul className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
              {form.images.map((src) => (
                <li key={src} className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                  {src.split("/").pop()}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, images: f.images.filter((i) => i !== src) }))}
                    className="text-rose-500"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <UploadField label="Video (optional)" accept="video/*" onUploaded={(url) => setForm((f) => ({ ...f, videoUrl: url }))} />
          {form.videoUrl ? <p className="text-xs text-slate-500 dark:text-slate-400">{form.videoUrl}</p> : null}

          <div className="flex gap-3">
            <UiButton type="submit" isLoading={isSaving}>
              {form.id ? "Save changes" : "Add project"}
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
        {projects.map((project) => (
          <Card key={project.id} className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100">{project.title}</h4>
                {project.featured ? <Badge variant="brand">Featured</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{project.summary}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <UiButton type="button" size="sm" variant="secondary" onClick={() => startEdit(project)}>
                Edit
              </UiButton>
              <UiButton type="button" size="sm" variant="danger" onClick={() => handleDelete(project.id)}>
                Delete
              </UiButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
