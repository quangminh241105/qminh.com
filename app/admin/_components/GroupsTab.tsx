"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertArticleGroupAction, deleteArticleGroupAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import { UploadField } from "./UploadField";
import type { PortfolioContent } from "@/lib/portfolio-db";

type GroupItem = PortfolioContent["articleGroups"][number];

const emptyForm = {
  id: undefined as string | undefined,
  name: "",
  slug: "",
  description: "",
  coverImage: "",
};

export function GroupsTab({ groups }: { groups: GroupItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(group: GroupItem) {
    setForm({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      coverImage: group.coverImage ?? "",
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await upsertArticleGroupAction({
        id: form.id,
        name: form.name,
        slug: form.slug,
        description: form.description,
        coverImage: form.coverImage || undefined,
      });
      setForm(emptyForm);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this group?")) return;
    setError(null);
    const result = await deleteArticleGroupAction(id);
    if (!result.ok) {
      setError(result.message ?? "Failed to delete group");
      return;
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {form.id ? "Edit group" : "Add group"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="g-name">Name</Label>
            <Input id="g-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="g-slug">Slug</Label>
            <Input id="g-slug" required value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="g-description">Description</Label>
            <Textarea
              id="g-description"
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <UploadField label="Cover image (optional)" accept="image/*" onUploaded={(url) => setForm((f) => ({ ...f, coverImage: url }))} />
          {form.coverImage ? <p className="text-xs text-slate-500 dark:text-slate-400">{form.coverImage}</p> : null}

          <div className="flex gap-3">
            <UiButton type="submit" isLoading={isSaving}>
              {form.id ? "Save changes" : "Add group"}
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
        {error ? (
          <Card className="border-rose-300 dark:border-rose-800">
            <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
          </Card>
        ) : null}
        {groups.map((group) => (
          <Card key={group.id} className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</h4>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                /blog/{group.slug} · {group.articleCount} article{group.articleCount === 1 ? "" : "s"}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <UiButton type="button" size="sm" variant="secondary" onClick={() => startEdit(group)}>
                Edit
              </UiButton>
              <UiButton type="button" size="sm" variant="danger" onClick={() => handleDelete(group.id)}>
                Delete
              </UiButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
