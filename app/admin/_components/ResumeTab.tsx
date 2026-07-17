"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertResumeItemAction, deleteResumeItemAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import type { PortfolioContent } from "@/lib/portfolio-db";

type ResumeItem = PortfolioContent["resume"][number];

const emptyForm = { id: undefined as string | undefined, period: "", title: "", details: "" };

export function ResumeTab({ resume }: { resume: ResumeItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
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
  );
}
