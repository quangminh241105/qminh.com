import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import TestimonialCard from "@/components/TestimonialCard";
import ProjectCard from "@/components/ProjectCard";
import { getPortfolioContent } from "@/lib/portfolio-db";
import Link from "next/link";
import { type Project } from "@/lib/portfolio";

function getRandomProjects(projects: Project[]) {
  const shuffled = [...projects];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 2);
}

export default async function Home() {
  const portfolio = await getPortfolioContent();
  const displayProjects = getRandomProjects(portfolio.projects);

  return (
    <main>
      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
              {portfolio.profession}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
              Hi, I am {portfolio.name}.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              {portfolio.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/about">About Me</Button>
              <Button href="/contact" variant="secondary">
                Contact Me
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-100/60">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">
              Quick Summary
            </p>
            <ul className="mt-4 grid gap-4 text-sm text-slate-700">
              {portfolio.quickSummary.map((item) => (
                <li key={item} className="rounded-xl bg-card px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Skills"
          title="Tech Stack"
          description="Core technologies I currently use to build fast and maintainable web experiences."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <SkillsChart skills={portfolio.skills} />
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Projects"
          title="Selected Work"
          description="A few highlighted projects with repository and demo links."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
          <Link
            href="/projects"
            className="group h-[24rem] cursor-pointer md:h-[25rem] flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md hover:border-brand-300"
          >
            <div className="flex items-center justify-center rounded-full text-brand-600">
              <span className="text-4xl font-light">+</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              <span>Explore More</span>
            </div>
            <h3 className="mt-4 text-center text-lg font-semibold text-slate-800 transition-colors group-hover:text-brand-600">
              VIEW ALL PROJECTS
            </h3>
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Testimonials"
          title="What Others Say"
          description="Optional social proof section you can replace with real mentor and teammate feedback."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {portfolio.testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-sky-100 bg-white p-8 text-center shadow-lg shadow-sky-100/60">
          <h2 className="text-3xl font-bold text-slate-800">Ready to collaborate?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            I am open to internships, freelance opportunities, and student startup projects.
          </p>
          <div className="mt-6 flex justify-center">
            <Button href="/contact">Start a Conversation</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
