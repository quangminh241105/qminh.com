import ProjectCard from "@/components/ProjectCard";
import QminhFlowCard from "@/components/QminhFlowCard";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Quang Minh",
  description: "Selected web projects by Quang Minh, with a focus on clean architecture and practical UX.",
};

export default async function ProjectsPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Projects"
        title="Selected Engineering Work"
        description="Full-stack web applications, tools, and systems architectures with repository and live demo links."
      />

      <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <QminhFlowCard />
        {portfolio.projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </section>
    </main>
  );
}
