import Link from "next/link";
import { notFound } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { getProjectSlug } from "@/lib/project-slug";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolioContent();

  const project = portfolio.projects.find((item) => getProjectSlug(item) === slug);

  if (!project) {
    notFound();
  }

  return (
    <main>
      <section className="hero-gradient border-b border-slate-200">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/projects"
            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500"
          >
            Back to projects
          </Link>

          <div className="mt-6 max-w-4xl">
            <SectionTitle
              eyebrow="Project Details"
              title={project.title}
              description={project.summary}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
            >
              Open Live Demo
            </Link>
            <Link
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              View Repository
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <article>
            <h2 className="text-2xl font-bold text-slate-900">What I built</h2>
            <p className="mt-4 text-base leading-8 text-slate-700">
              I designed and delivered this project from planning to deployment,
              with a focus on clean architecture, maintainability, and practical UX.
              The implementation includes reusable modules, responsive layouts,
              and production-style code organization.
            </p>
            <p className="mt-4 text-base leading-8 text-slate-700">
              This page is intentionally full-width so you can present real outcomes,
              design decisions, and technical trade-offs in depth instead of squeezing
              important information inside small cards.
            </p>
          </article>

          <aside>
            <h2 className="text-2xl font-bold text-slate-900">Tech Stack</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-600">
              Primary focus: {project.primaryTechnology}
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
