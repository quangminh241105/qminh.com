"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { Project } from "@/lib/portfolio";
import { getProjectSlug } from "@/lib/project-slug";

type ProjectCardProps = {
	project: Project;
};

const MAX_VISIBLE_TECHNOLOGIES = 3;

export default function ProjectCard({ project }: ProjectCardProps) {
	const router = useRouter();
	const projectSlug = getProjectSlug(project);
	const visibleTechnologies = project.technologies.slice(0, MAX_VISIBLE_TECHNOLOGIES);
	const hiddenCount = project.technologies.length - visibleTechnologies.length;

	function openProjectPage() {
		router.push(`/projects/${projectSlug}`);
	}

	return (
		<motion.article
			role="link"
			tabIndex={0}
			onClick={openProjectPage}
			onKeyDown={(event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openProjectPage();
				}
			}}
			whileHover={{ y: -4 }}
			transition={{ duration: 0.2 }}
			className="group flex h-full cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
		>
			<div
				className="h-40 shrink-0 rounded-xl bg-gradient-to-br from-brand-100 via-white to-accent/40 dark:from-brand-900/40 dark:via-slate-900 dark:to-accent/10"
				aria-hidden
			/>

			<div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
				<span>{project.primaryTechnology ?? "General"}</span>
				{project.featured ? (
					<span className="text-slate-400 dark:text-slate-500">Featured</span>
				) : (
					<span className="text-slate-300 dark:text-slate-600">•</span>
				)}
			</div>

			<h3 className="mt-3 overflow-hidden text-lg font-semibold text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-slate-100">
				{project.title}
			</h3>
			<p className="mt-2 overflow-hidden text-sm leading-6 text-slate-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] dark:text-slate-400">
				{project.summary}
			</p>

			<div className="mt-4 flex flex-wrap gap-2">
				{visibleTechnologies.map((tech) => (
					<span
						key={tech}
						className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
					>
						{tech}
					</span>
				))}
				{hiddenCount > 0 ? (
					<span
						title={project.technologies.slice(MAX_VISIBLE_TECHNOLOGIES).join(", ")}
						className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800/60 dark:text-slate-400"
					>
						+{hiddenCount}
					</span>
				) : null}
			</div>

			<div className="mt-auto flex items-center justify-between pt-5 text-sm font-semibold text-brand-700 dark:text-brand-400">
				<Link
					href={project.demoUrl}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className="relative z-10 hover:text-brand-900 dark:hover:text-brand-300"
				>
					Live Demo
				</Link>
				<Link
					href={project.repoUrl}
					onClick={(event) => event.stopPropagation()}
					onKeyDown={(event) => event.stopPropagation()}
					className="relative z-10 text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
					target="_blank"
					rel="noreferrer"
				>
					Repository
				</Link>
			</div>
		</motion.article>
	);
}
