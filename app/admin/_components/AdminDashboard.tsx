"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { logoutAction } from "../actions";
import { UiButton } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";
import { OverviewTab } from "./OverviewTab";
import { ProfileTab } from "./ProfileTab";
import { ProjectsTab } from "./ProjectsTab";
import { ArticlesTab } from "./ArticlesTab";
import { ResumeTab } from "./ResumeTab";
import { SkillsTab } from "./SkillsTab";
import type { PortfolioContent } from "@/lib/portfolio-db";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "profile", label: "About & Profile" },
  { key: "projects", label: "Projects" },
  { key: "articles", label: "Blog" },
  { key: "resume", label: "Resume" },
  { key: "skills", label: "Skills" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function AdminDashboard({ portfolio }: { portfolio: PortfolioContent }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  async function handleLogout() {
    await logoutAction();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
              Admin
            </p>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">{portfolio.name}&apos;s workspace</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UiButton type="button" variant="secondary" size="sm" onClick={handleLogout}>
              Sign out
            </UiButton>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className="relative shrink-0 px-4 py-3 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <span className={activeTab === tab.key ? "text-brand-600 dark:text-brand-400" : ""}>{tab.label}</span>
              {activeTab === tab.key ? (
                <motion.div
                  layoutId="admin-tab-underline"
                  className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600"
                />
              ) : null}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {activeTab === "overview" ? <OverviewTab portfolio={portfolio} /> : null}
        {activeTab === "profile" ? <ProfileTab portfolio={portfolio} /> : null}
        {activeTab === "projects" ? <ProjectsTab projects={portfolio.projects} /> : null}
        {activeTab === "articles" ? <ArticlesTab articles={portfolio.articles} /> : null}
        {activeTab === "resume" ? <ResumeTab resume={portfolio.resume} /> : null}
        {activeTab === "skills" ? <SkillsTab skills={portfolio.skills} /> : null}
      </main>
    </div>
  );
}
