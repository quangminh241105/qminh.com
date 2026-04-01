"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/portfolio";
import { getProjectSlug } from "@/lib/project-slug";

type ProjectCardProps = {
	project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
	const router = useRouter();
	const projectSlug = getProjectSlug(project);

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
			className="group h-[24rem] cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md md:h-[25rem]"
		>

			<div className="mb-4 h-40 rounded-xl bg-gradient-to-br from-brand-100 via-white to-accent/40" aria-hidden />

			<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
				<span>{project.primaryTechnology ?? "General"}</span>
				{project.featured ? <span className="text-slate-400">Featured</span> : <span className="text-slate-300">•</span>}
			</div>

			<h3 className="mt-3 overflow-hidden text-lg font-semibold text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
				{project.title}
			</h3>
			<p className="mt-2 overflow-hidden text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">
				{project.summary}
			</p>

			<div className="mt-4 flex h-[3.25rem] flex-wrap gap-2 overflow-hidden">
				{project.technologies.map((tech) => (
					<span
						key={tech}
						className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
					>
						{tech}
					</span>
				))}
			</div>

			<div className="mt-5 flex items-center justify-between text-sm font-semibold text-brand-700">
				<Link
					href={project.demoUrl}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className="relative z-10 hover:text-brand-900"
				>
					Live Demo
				</Link>
				<Link
					href={project.repoUrl}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className="relative z-10 text-slate-700 transition-colors hover:text-slate-900"
					target="_blank"
					rel="noreferrer"
				>
					Repository
				</Link>
			</div>
		</article>
	);
}
