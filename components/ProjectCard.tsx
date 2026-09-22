"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/portfolio";
import { getProjectSlug } from "@/lib/project-slug";
import { ExternalLinkIcon, GitHubIcon, CodeIcon, StarIcon } from "@/components/icons";

type ProjectCardProps = {
  project: Project;
};

const MAX_VISIBLE_TECHNOLOGIES = 3;

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();
  const projectSlug = getProjectSlug(project);
  const visibleTechnologies = project.technologies.slice(0, MAX_VISIBLE_TECHNOLOGIES);
  const hiddenCount = project.technologies.length - visibleTechnologies.length;
  const firstPicture = project.pictures && project.pictures.length > 0 ? project.pictures[0] : null;

  function openProjectPage() {
    router.push(`/projects/${projectSlug}`);
  }

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={openProjectPage}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openProjectPage();
        }
      }}
      className="group flex h-full cursor-pointer flex-col border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff]"
    >
      {/* Visual Header: Thumbnail or Solid Geometric Block (Zero Gradient) */}
      <div className="relative h-40 shrink-0 border-2 border-black bg-blue-600 overflow-hidden flex items-center justify-center dark:border-blue-400">
        {firstPicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={firstPicture}
            alt={project.title}
            className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-geo-dots">
            <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]">
              <CodeIcon className="h-6 w-6" />
            </div>
          </div>
        )}

        {project.featured && (
          <div className="absolute top-2 right-2 flex items-center gap-1 border border-black bg-red-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
            <StarIcon className="h-3 w-3 fill-white" />
            <span>Featured</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
        <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 border border-black dark:border-zinc-700">
          {project.primaryTechnology ?? "General"}
        </span>
      </div>

      <h3 className="mt-3 overflow-hidden text-lg font-black uppercase text-black line-clamp-2 dark:text-white">
        {project.title}
      </h3>
      <p className="mt-2 overflow-hidden text-sm leading-6 text-zinc-600 line-clamp-3 dark:text-zinc-400">
        {project.summary}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {visibleTechnologies.map((tech) => (
          <span
            key={tech}
            className="border border-black bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {tech}
          </span>
        ))}
        {hiddenCount > 0 ? (
          <span className="border border-black bg-green-500 px-1.5 py-0.5 font-mono text-[11px] font-bold text-black">
            +{hiddenCount}
          </span>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between pt-5 font-mono text-xs font-bold uppercase tracking-wider">
        {project.demoUrl ? (
          <Link
            href={project.demoUrl}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className="relative z-10 inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <span>Live Demo</span>
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Link>
        ) : <span />}

        {project.repoUrl ? (
          <Link
            href={project.repoUrl}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
            className="relative z-10 inline-flex items-center gap-1 text-black hover:text-blue-700 dark:text-zinc-300 dark:hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon className="h-3.5 w-3.5" />
            <span>Code</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}
