"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "../actions";
import { Card } from "@/components/ui/card";
import { Input, Textarea, Label } from "@/components/ui/input";
import { UiButton } from "@/components/ui/button";
import type { PortfolioContent } from "@/lib/portfolio-db";

export function ProfileTab({ portfolio }: { portfolio: PortfolioContent }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: portfolio.name,
    profession: portfolio.profession,
    tagline: portfolio.tagline,
    location: portfolio.location,
    quickSummary: portfolio.quickSummary.join("\n"),
    intro: portfolio.about.intro,
    background: portfolio.about.background,
    interests: portfolio.about.interests.join("\n"),
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateProfileAction({
        name: form.name,
        profession: form.profession,
        tagline: form.tagline,
        location: form.location,
        navItems: portfolio.navItems,
        socialLinks: portfolio.socialLinks,
        quickSummary: form.quickSummary.split("\n").map((s) => s.trim()).filter(Boolean),
        about: {
          intro: form.intro,
          background: form.background,
          interests: form.interests.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">About &amp; Profile</h3>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="profession">Profession</Label>
            <Input
              id="profession"
              value={form.profession}
              onChange={(e) => setForm((f) => ({ ...f, profession: e.target.value }))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="quickSummary">Quick summary (one per line)</Label>
          <Textarea
            id="quickSummary"
            rows={3}
            value={form.quickSummary}
            onChange={(e) => setForm((f) => ({ ...f, quickSummary: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="intro">About intro</Label>
          <Textarea id="intro" rows={3} value={form.intro} onChange={(e) => setForm((f) => ({ ...f, intro: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="background">About background</Label>
          <Textarea
            id="background"
            rows={3}
            value={form.background}
            onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="interests">Interests (one per line)</Label>
          <Textarea
            id="interests"
            rows={3}
            value={form.interests}
            onChange={(e) => setForm((f) => ({ ...f, interests: e.target.value }))}
          />
        </div>
        <UiButton type="submit" isLoading={isSaving} className="justify-self-start">
          Save profile
        </UiButton>
      </form>
    </Card>
  );
}
