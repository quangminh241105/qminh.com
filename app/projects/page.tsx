import ProjectCard from "@/components/ProjectCard";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function ProjectsPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Projects"
        title="Selected work"
        description="These projects highlight my approach to architecture, UI, and maintainable code."
      />

      {/* Project cards are mapped from one store to keep content edits centralized. */}
      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {portfolio.projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>
    </main>
  );
}
