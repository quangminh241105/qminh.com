"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertArticleAction, deleteArticleAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import { UploadField } from "./UploadField";
import type { PortfolioContent } from "@/lib/portfolio-db";

type ArticleItem = PortfolioContent["articles"][number];

const emptyForm = {
  id: undefined as string | undefined,
  title: "",
  excerpt: "",
  slug: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  body: "",
  coverImage: "",
  videoUrl: "",
};

export function ArticlesTab({ articles }: { articles: ArticleItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function startEdit(article: ArticleItem) {
    setForm({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      slug: article.slug,
      publishedAt: article.publishedAt,
      body: article.body ?? "",
      coverImage: article.coverImage ?? "",
      videoUrl: article.videoUrl ?? "",
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await upsertArticleAction({
        id: form.id,
        title: form.title,
        excerpt: form.excerpt,
        slug: form.slug,
        publishedAt: form.publishedAt,
        body: form.body || undefined,
        coverImage: form.coverImage || undefined,
        videoUrl: form.videoUrl || undefined,
      });
      setForm(emptyForm);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this article?")) return;
    await deleteArticleAction(id);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {form.id ? "Edit article" : "Add article"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="a-title">Title</Label>
            <Input id="a-title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="a-slug">Slug</Label>
            <Input id="a-slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="a-excerpt">Excerpt</Label>
            <Textarea
              id="a-excerpt"
              required
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="a-date">Published date</Label>
            <Input
              id="a-date"
              type="date"
              value={form.publishedAt}
              onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="a-body">Body (Markdown)</Label>
            <Textarea
              id="a-body"
              rows={8}
              value={form.body}
              onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              placeholder="## Heading&#10;&#10;Write the full article in Markdown."
            />
          </div>

          <UploadField label="Cover image" accept="image/*" onUploaded={(url) => setForm((f) => ({ ...f, coverImage: url }))} />
          {form.coverImage ? <p className="text-xs text-slate-500 dark:text-slate-400">{form.coverImage}</p> : null}

          <UploadField label="Video (optional)" accept="video/*" onUploaded={(url) => setForm((f) => ({ ...f, videoUrl: url }))} />
          {form.videoUrl ? <p className="text-xs text-slate-500 dark:text-slate-400">{form.videoUrl}</p> : null}

          <div className="flex gap-3">
            <UiButton type="submit" isLoading={isSaving}>
              {form.id ? "Save changes" : "Add article"}
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
        {articles.map((article) => (
          <Card key={article.id} className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">{article.title}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                /{article.slug} · {article.publishedAt}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <UiButton type="button" size="sm" variant="secondary" onClick={() => startEdit(article)}>
                Edit
              </UiButton>
              <UiButton type="button" size="sm" variant="danger" onClick={() => handleDelete(article.id)}>
                Delete
              </UiButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
