"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { upsertSkillAction, deleteSkillAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import type { PortfolioContent } from "@/lib/portfolio-db";

type SkillItem = PortfolioContent["skills"][number];

const emptyForm = { id: undefined as string | undefined, name: "", category: "", level: 50 };

export function SkillsTab({ skills }: { skills: SkillItem[] }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await upsertSkillAction(form);
      setForm(emptyForm);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this skill?")) return;
    await deleteSkillAction(id);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
      <Card>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
          {form.id ? "Edit skill" : "Add skill"}
        </h3>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
          <div>
            <Label htmlFor="s-name">Name</Label>
            <Input id="s-name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="s-category">Category</Label>
            <Input
              id="s-category"
              required
              placeholder="Language, Frontend, Backend, DevOps..."
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="s-level">Level: {form.level}%</Label>
            <input
              id="s-level"
              type="range"
              min={0}
              max={100}
              value={form.level}
              onChange={(e) => setForm((f) => ({ ...f, level: Number(e.target.value) }))}
              className="w-full accent-brand-600"
            />
          </div>
          <div className="flex gap-3">
            <UiButton type="submit" isLoading={isSaving}>
              {form.id ? "Save changes" : "Add skill"}
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
        {skills.map((skill) => (
          <Card key={skill.id} className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-800 dark:text-slate-100">{skill.name}</span>
                <span className="text-slate-500 dark:text-slate-400">{skill.level}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-accent"
                  style={{ width: `${skill.level}%` }}
                />
              </div>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-500">{skill.category}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <UiButton
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setForm({ id: skill.id, name: skill.name, category: skill.category, level: skill.level })}
              >
                Edit
              </UiButton>
              <UiButton type="button" size="sm" variant="danger" onClick={() => handleDelete(skill.id)}>
                Delete
              </UiButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
