import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import TestimonialCard from "@/components/TestimonialCard";
import ProjectCard from "@/components/ProjectCard";
import { getPortfolioContent } from "@/lib/portfolio-db";
import Link from "next/link";
import { type Project } from "@/lib/portfolio";
import { CheckIcon, PlusIcon, ArrowRightIcon, TerminalIcon } from "@/components/icons";
import RetroIconLayer from "@/components/RetroIconLayer";

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
      {/* Hero Section (Zero Gradients, Pure Geometric Structure) */}
      <section className="relative border-b-2 border-black bg-zinc-50 bg-geo-grid py-16 sm:py-24 dark:border-blue-400 dark:bg-black">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-[#ffe600] px-3 py-1 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000]">
              <TerminalIcon className="h-3.5 w-3.5" />
              <span>{portfolio.profession}</span>
            </div>

            <h1 className="mt-6 text-4xl font-black uppercase tracking-tight text-black sm:text-6xl dark:text-white">
              Hi, I am <span className="underline decoration-blue-600 decoration-wavy decoration-4 dark:decoration-blue-400">{portfolio.name}</span>.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300 font-sans">
              {portfolio.tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/about" variant="primary">
                About Me
              </Button>
              <Button
                href="/contact"
                variant="secondary"
                className="dark:shadow-[3px_3px_0px_#ffffff] dark:hover:shadow-[5px_5px_0px_#ffffff]"
              >
                Contact Me
              </Button>
            </div>
          </div>

          {/* Quick Summary Spec Box */}
          <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[6px_6px_0px_#000000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
              <p className="font-mono text-xs font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
                Quick Summary
              </p>
              <span className="h-2 w-2 bg-green-500 border border-black" />
            </div>

            <ul className="mt-4 space-y-3">
              {portfolio.quickSummary.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 border border-black bg-zinc-50 p-3 font-mono text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border border-black bg-green-500 text-black">
                    <CheckIcon className="h-3 w-3 stroke-[3]" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack Skills Section */}
      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Skills"
          title="Tech Stack & Tools"
          description="Core technologies and frameworks I use to build robust, scalable applications."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <SkillsChart skills={portfolio.skills} />
        </div>
      </section>

      {/* Selected Work Section */}
      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Portfolio"
          title="Selected Projects"
          description="Featured web apps and software engineering projects with live demos and source code."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {displayProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}

          {/* View All Projects Card */}
          <Link
            href="/projects"
            className="group flex h-full min-h-[320px] flex-col items-center justify-center border-2 border-dashed border-black bg-zinc-50 p-6 transition-all hover:bg-blue-600 hover:text-white hover:border-solid hover:shadow-[6px_6px_0px_#000000] dark:border-blue-400 dark:bg-zinc-950 dark:hover:bg-blue-500 dark:hover:text-white dark:hover:shadow-[6px_6px_0px_#000000] cursor-pointer"
          >
            <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-black shadow-[3px_3px_0px_#000000] group-hover:rotate-12 transition-transform">
              <PlusIcon className="h-7 w-7" />
            </div>
            <p className="mt-5 font-mono text-xs font-black uppercase tracking-widest text-black dark:text-zinc-400 group-hover:text-white">
              Explore More
            </p>
            <h3 className="mt-2 text-center font-mono text-lg font-black uppercase text-black dark:text-white group-hover:text-white">
              View All Projects →
            </h3>
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="mx-auto mt-20 w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Feedback"
          title="What Others Say"
          description="Testimonials and feedback from mentors, team leads, and project collaborators."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {portfolio.testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.author} testimonial={testimonial} />
          ))}
        </div>
      </section>

      {/* Collaboration Callout */}
      <section className="mx-auto mt-20 w-full max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="collab-pixel-bg border-2 border-black">
          <RetroIconLayer />
          <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 border-2 border-black bg-green-400 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-black">
                <span className="h-2 w-2 border border-black bg-red-500" />
                <span>Open to collab</span>
              </div>
              <h2 className="mt-5 font-mono text-3xl font-black uppercase tracking-tight text-black dark:text-white sm:text-4xl">
                Ready to collaborate?
              </h2>
              <p className="mt-4 max-w-2xl font-mono text-sm font-medium leading-6 text-zinc-700 dark:text-blue-100 sm:text-base">
                I am open to software engineering internships, freelance projects, and tech collaborations.
              </p>
            </div>

            <div className="border-2 border-black bg-blue-600 p-4 md:min-w-[250px]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-blue-100">
                Next move
              </p>
              <Button href="/contact" variant="white" className="mt-3 w-full">
                <span>Start a Conversation</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
