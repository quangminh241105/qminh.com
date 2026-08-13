import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import TestimonialCard from "@/components/TestimonialCard";
import ProjectCard from "@/components/ProjectCard";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { ArrowDownRight, ArrowUpRight, Check, Download, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const portfolio = await getPortfolioContent();
  const displayProjects = (portfolio.featuredProjects.length > 0 ? portfolio.featuredProjects : portfolio.projects).slice(0, 3);
  const downloadHref = portfolio.resumeFile?.url ?? "/resume";

  return (
    <main>
      <section className="hero-gradient relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(37,99,235,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <div className="mx-auto grid w-full max-w-6xl gap-14 px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-brand-700 shadow-sm shadow-brand-900/5 backdrop-blur dark:border-brand-800 dark:bg-slate-900/70 dark:text-brand-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Open to internships &amp; collaborations
            </div>
            <p className="mt-7 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-400">{portfolio.profession}</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-bold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
              Building useful products with <span className="text-brand-600 dark:text-brand-400">clarity.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">{portfolio.tagline}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/projects" className="gap-2 bg-slate-950 hover:bg-brand-600 dark:bg-white dark:text-slate-950 dark:hover:bg-brand-300">
                View selected work
                <ArrowUpRight className="h-4 w-4" />
              </Button>
              <Button href="/contact" variant="secondary" className="gap-2">
                Start a conversation
                <ArrowDownRight className="h-4 w-4" />
              </Button>
              <Link
                href={downloadHref}
                download={portfolio.resumeFile?.name}
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-white/70 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-900/70 dark:hover:text-brand-300"
              >
                <Download className="h-4 w-4" />
                Download CV
              </Link>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-5 border-t border-slate-300/70 pt-5 dark:border-slate-700">
              <div>
                <p className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{String(portfolio.projects.length).padStart(2, "0")}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Projects shipped</p>
              </div>
              <div>
                <p className="font-mono text-2xl font-bold text-slate-950 dark:text-white">{String(portfolio.skills.length).padStart(2, "0")}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Core skills</p>
              </div>
              <div>
                <p className="flex items-center gap-1.5 font-mono text-2xl font-bold text-slate-950 dark:text-white"><MapPin className="h-4 w-4 text-brand-600" /> HCMC</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Based in Vietnam</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -inset-5 rounded-[2rem] bg-brand-400/20 blur-3xl dark:bg-brand-600/10" />
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-2xl shadow-brand-950/10 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 font-mono text-lg font-bold text-white dark:bg-white dark:text-slate-950">QM</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{portfolio.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{portfolio.profession}</p>
                  </div>
                </div>
                <Sparkles className="h-5 w-5 text-brand-500" />
              </div>
              <div className="py-6">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Currently focused on</p>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 dark:text-white">Reliable interfaces for real people.</h2>
                <ul className="mt-5 grid gap-3">
                  {portfolio.quickSummary.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300"><Check className="h-3 w-3" /></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-slate-950 p-4 text-white dark:bg-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-mono uppercase tracking-[0.18em]">Next milestone</span>
                  <span>Let&apos;s connect</span>
                </div>
                <Link href="/contact" className="mt-3 flex items-center justify-between font-semibold hover:text-brand-300">
                  Explore a project together <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Think in systems", "I care about the structure behind the interface so projects stay easy to extend."],
            ["02", "Design for people", "Clear hierarchy, useful feedback, and responsive details make software feel dependable."],
            ["03", "Ship with intent", "From first sketch to deployment, I turn ideas into working, maintainable products."],
          ].map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-mono text-xs font-semibold text-brand-600 dark:text-brand-400">{number}</p>
              <h2 className="mt-7 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Capabilities"
          title="Tools I use to turn ideas into working software"
          description="A practical toolkit for building fast, maintainable, and thoughtful web experiences."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-3xl bg-slate-950 p-7 text-white dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-300">What I bring</p>
            <h3 className="mt-5 text-3xl font-bold tracking-tight">Curiosity, ownership, and an eye for the details that matter.</h3>
            <p className="mt-5 text-sm leading-7 text-slate-300">{portfolio.about.intro}</p>
            <Link href="/about" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-white">
              More about my approach <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <SkillsChart skills={portfolio.skills} />
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionTitle
            eyebrow="Selected work"
            title="A few things I have built"
            description="Projects where product thinking, engineering, and interface design meet."
          />
          <Link href="/projects" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-500 dark:text-brand-300 dark:hover:text-brand-200">
            Browse all projects <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayProjects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Kind words"
          title="Built with people, not just code"
          description="The best work comes from communicating clearly, sharing ownership, and staying curious."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {portfolio.testimonials.map((testimonial) => <TestimonialCard key={testimonial.author} testimonial={testimonial} />)}
        </div>
      </section>

      <section className="mx-auto mt-24 w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-600 px-6 py-12 text-center text-white sm:px-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border-[36px] border-white/10" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full border-[28px] border-white/10" />
          <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-brand-100">Have a challenge in mind?</p>
          <h2 className="relative mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">Let&apos;s make something clear, useful, and worth shipping.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-100">I am open to internships, freelance opportunities, and student startup projects.</p>
          <div className="relative mt-7 flex justify-center">
            <Button href="/contact" className="bg-white text-brand-700 hover:bg-brand-50">Start a conversation <ArrowUpRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
