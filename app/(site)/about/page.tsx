import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";
import { ArrowUpRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "About | Quang Minh",
  description: "Learn about Quang Minh's engineering interests, working style, and technical toolkit.",
};

export default async function AboutPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="About Me"
        title="A curious IT student focused on practical engineering"
        description={portfolio.about.intro}
      />

      <section className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">The short version</p>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">I like making complex things feel straightforward.</h3>
          <p className="mt-4 leading-7 text-slate-600 dark:text-slate-400">{portfolio.about.background}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
            <span className="rounded-full bg-card px-3 py-1.5">{portfolio.location}</span>
            <span className="rounded-full bg-card px-3 py-1.5">Open to opportunities</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">What I enjoy working on</h3>
          <ul className="mt-4 grid gap-3 text-slate-600 dark:text-slate-400">
            {portfolio.about.interests.map((interest) => (
              <li key={interest} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-800 dark:text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300"><Check className="h-3.5 w-3.5" /></span>
                <span>{interest}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-20">
        <SectionTitle
          eyebrow="Skills"
          title="Tech stack and tools"
          description="A visual overview of the technologies I use for coursework and personal projects."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SkillsChart skills={portfolio.skills} />
          <div className="rounded-2xl bg-slate-950 p-7 text-white dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-300">How I work</p>
            <div className="mt-6 grid gap-5">
              {["Start with the user and the outcome", "Make trade-offs visible", "Leave the codebase better than I found it"].map((item, index) => (
                <div key={item} className="flex gap-4">
                  <span className="font-mono text-sm text-brand-300">0{index + 1}</span>
                  <p className="text-sm leading-6 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Button href="/resume">View Full Resume <ArrowUpRight className="h-4 w-4" /></Button>
        <span className="text-sm text-slate-500 dark:text-slate-400">A little more context about my experience and education.</span>
      </div>
    </main>
  );
}
