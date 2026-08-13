import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";
import { ArrowUpRight, CalendarDays, Download, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume | Quang Minh",
  description: "Education, experience, and the latest downloadable CV for Quang Minh.",
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}

export default async function ResumePage() {
  const portfolio = await getPortfolioContent();
  const downloadHref = portfolio.resumeFile?.url ?? "/resume.txt";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <SectionTitle
          eyebrow="Resume"
          title="The path so far"
          description="A concise view of the education, experience, and projects shaping how I build software."
        />
        <a
          href={downloadHref}
          download={portfolio.resumeFile?.name}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-300"
        >
          <Download className="h-4 w-4" />
          {portfolio.resumeFile ? "Download latest CV" : "Download text resume"}
        </a>
      </div>

      {portfolio.resumeFile ? (
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand-200 bg-brand-50/70 px-5 py-4 text-sm text-brand-900 dark:border-brand-900 dark:bg-brand-950/30 dark:text-brand-100">
          <FileText className="h-5 w-5 text-brand-600 dark:text-brand-300" />
          <span className="font-semibold">{portfolio.resumeFile.name}</span>
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase text-brand-700 dark:bg-slate-900/70 dark:text-brand-300">{portfolio.resumeFile.format}</span>
          <span className="text-brand-700/70 dark:text-brand-200/70">Updated {formatDate(portfolio.resumeFile.updatedAt)}</span>
        </div>
      ) : null}

      <section className="mt-12 grid gap-12 lg:grid-cols-[1fr_0.34fr]">
        <div className="relative">
          <div className="absolute bottom-5 left-[0.45rem] top-5 w-px bg-slate-200 dark:bg-slate-800" aria-hidden />
          <div className="grid gap-8">
            {portfolio.resume.map((item, index) => (
              <article key={item.id} className="relative grid gap-5 pl-10 sm:grid-cols-[8rem_1fr] sm:gap-8">
                <span className="absolute left-0 top-1 flex h-5 w-5 items-center justify-center rounded-full border-4 border-background bg-brand-600 shadow-sm shadow-brand-600/30" aria-hidden />
                <p className="font-mono text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">{item.period}</p>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 dark:text-slate-500">0{index + 1}</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.title}</h2>
                  <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">{item.details}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <CalendarDays className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Looking ahead</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">I am looking for opportunities where I can keep learning, contribute to a real product, and grow with a thoughtful team.</p>
          <Button href="/contact" className="mt-6 w-full gap-2">Let&apos;s connect <ArrowUpRight className="h-4 w-4" /></Button>
        </aside>
      </section>
    </main>
  );
}
