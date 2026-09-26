import Link from "next/link";
import { notFound } from "next/navigation";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { getProjectSlug } from "@/lib/project-slug";
import ContentSections from "@/components/ContentSections";
import { ArrowLeftIcon, ExternalLinkIcon, GitHubIcon, ImageIcon, VideoIcon, SlidersIcon } from "@/components/icons";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolioContent();
  const project = portfolio.projects.find((item) => getProjectSlug(item) === slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: `${project.title} | ${portfolio.name}'s Projects`,
    description: project.summary,
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolioContent();
  const project = portfolio.projects.find((item) => getProjectSlug(item) === slug);

  if (!project) {
    notFound();
  }

  const customVarEntries = Object.entries(project.customVariables ?? {});
  const beforeSections = project.sections.filter((section) => section.placement === "before-content");
  const afterSections = project.sections.filter((section) => section.placement === "after-content");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 border-2 border-black bg-white px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#ffe600] hover:shadow-[3px_3px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:text-zinc-200 dark:shadow-[2px_2px_0px_#000000] dark:hover:bg-[#ffe600] dark:hover:text-black dark:hover:shadow-[3px_3px_0px_#000000]"
      >
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        <span>Back to Projects</span>
      </Link>

      <section className="mt-8 border-2 border-black bg-white p-6 sm:p-10 shadow-[6px_6px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[6px_6px_0px_#000000]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-black bg-blue-600 px-2.5 py-0.5 font-mono text-xs font-black uppercase text-white">
            {project.primaryTechnology}
          </span>
          {project.featured && (
            <span className="border border-black bg-red-500 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-white">
              Featured Project
            </span>
          )}
        </div>

        <h1 className="mt-4 font-mono text-3xl sm:text-5xl font-black uppercase tracking-tight text-black dark:text-white">
          {project.title}
        </h1>

        <p className="mt-4 border-l-4 border-blue-600 pl-4 font-mono text-sm sm:text-base text-zinc-600 dark:border-blue-400 dark:text-zinc-400">
          {project.summary}
        </p>

        {project.thumbnail ? (
          <div className="mt-8 overflow-hidden border-2 border-black bg-zinc-100 dark:border-blue-400 dark:bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.thumbnail} alt={`${project.title} thumbnail`} className="max-h-[30rem] w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {project.demoUrl ? (
            <Link
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border-2 border-black bg-blue-600 px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-[5px_5px_0px_#000000] dark:border-blue-400 dark:shadow-[3px_3px_0px_#ffffff] dark:hover:shadow-[5px_5px_0px_#ffffff]"
            >
              <span>Live Demo</span>
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          ) : null}

          {project.repoUrl ? (
            <Link
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border-2 border-black bg-white px-5 py-3 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:shadow-[3px_3px_0px_#000000] dark:hover:shadow-[5px_5px_0px_#000000]"
            >
              <GitHubIcon className="h-4 w-4" />
              <span>Repository</span>
            </Link>
          ) : null}
        </div>
      </section>

      {beforeSections.length > 0 ? (
        <div className="mt-10">
          <ContentSections sections={beforeSections} />
        </div>
      ) : null}

      {/* Pictures Gallery */}
      {project.pictures && project.pictures.length > 0 && (
        <section className="mt-10 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
          <h2 className="font-mono text-sm font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-4">
            <ImageIcon className="h-4 w-4" />
            <span>Screenshots & Design Assets</span>
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {project.pictures.map((pic, idx) => (
              <div key={idx} className="border-2 border-black bg-zinc-100 p-1 dark:border-zinc-700 dark:bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pic} alt={`Screenshot ${idx + 1}`} className="w-full h-52 object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Videos */}
      {project.videos && project.videos.length > 0 && (
        <section className="mt-10 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
          <h2 className="font-mono text-sm font-black uppercase text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-4">
            <VideoIcon className="h-4 w-4" />
            <span>Video Demonstration</span>
          </h2>
          <div className="space-y-4">
            {project.videos.map((vid, idx) => {
              if (vid.includes("youtube.com") || vid.includes("youtu.be")) {
                const ytid = vid.includes("v=") ? vid.split("v=")[1]?.split("&")[0] : vid.split("/").pop();
                return (
                  <div key={idx} className="aspect-video w-full border-2 border-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytid}`}
                      title="Demo video"
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <video key={idx} controls className="w-full border-2 border-black">
                  <source src={vid} />
                  Your browser does not support video.
                </video>
              );
            })}
          </div>
        </section>
      )}

      {/* Architecture & Custom Specifications */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
          <h2 className="font-mono text-lg font-black uppercase text-black dark:text-white">
            Architecture & Highlights
          </h2>
          <p className="mt-4 font-sans text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {project.content ||
              "I designed and built this project focusing on clean code architecture, type safety, and practical UX with reusable modules and testable abstractions."}
          </p>
        </article>

        <aside className="space-y-6">
          {customVarEntries.length > 0 && (
            <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
              <h3 className="font-mono text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <SlidersIcon className="h-4 w-4" />
                <span>Project Specifications</span>
              </h3>
              <dl className="mt-4 space-y-2 font-mono text-xs">
                {customVarEntries.map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-zinc-200 py-1 dark:border-zinc-800">
                    <dt className="font-bold text-zinc-600 dark:text-zinc-400">{k}:</dt>
                    <dd className="font-bold text-black dark:text-white">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Technology Stack
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="border border-black bg-green-500 px-2.5 py-1 font-mono text-xs font-black uppercase text-black"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {afterSections.length > 0 ? (
        <div className="mt-10">
          <ContentSections sections={afterSections} />
        </div>
      ) : null}
    </main>
  );
}
