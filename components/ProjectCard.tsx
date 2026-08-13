"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight, ExternalLink, GitBranch } from "lucide-react";
import type { Project } from "@/lib/portfolio";
import { getProjectSlug } from "@/lib/project-slug";

type ProjectCardProps = {
	project: Project;
};

const MAX_VISIBLE_TECHNOLOGIES = 3;

export default function ProjectCard({ project }: ProjectCardProps) {
	const projectSlug = getProjectSlug(project);
	const visibleTechnologies = project.technologies.slice(0, MAX_VISIBLE_TECHNOLOGIES);
	const hiddenCount = project.technologies.length - visibleTechnologies.length;

	return (
		<motion.article
			whileHover={{ y: -4 }}
			transition={{ duration: 0.2 }}
			className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-900/5 dark:border-slate-800 dark:bg-slate-900"
		>
			<Link href={`/projects/${projectSlug}`} className="relative block h-44 shrink-0 overflow-hidden bg-gradient-to-br from-brand-100 via-white to-accent/40 dark:from-brand-900/40 dark:via-slate-900 dark:to-accent/10" aria-label={`View ${project.title} details`}>
				{project.images?.[0] ? (
					<Image src={project.images[0]} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
				) : (
					<div className="absolute inset-0 p-5" aria-hidden>
						<div className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700/70 dark:text-brand-300/70">
							<span>Selected work</span>
							<span>0{projectSlug.length % 9 + 1}</span>
						</div>
						<div className="absolute bottom-5 left-5 right-5 h-px bg-brand-600/20 dark:bg-brand-300/20" />
						<div className="absolute bottom-7 left-5 font-mono text-4xl font-bold text-brand-700/20 dark:text-brand-300/20">{project.title.slice(0, 2).toUpperCase()}</div>
					</div>
				)}
				<span className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-slate-700 shadow-sm backdrop-blur transition-transform group-hover:rotate-45 dark:bg-slate-950/80 dark:text-slate-200">
					<ArrowUpRight className="h-4 w-4" />
				</span>
			</Link>

			<div className="flex flex-1 flex-col p-6">
			<div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-400">
				<span>{project.primaryTechnology ?? "General"}</span>
				{project.featured ? (
					<span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">Featured</span>
				) : (
					<span className="text-slate-300 dark:text-slate-600">•</span>
				)}
			</div>

			<h3 className="mt-3 overflow-hidden text-lg font-semibold text-slate-900 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] dark:text-slate-100">
				<Link href={`/projects/${projectSlug}`} className="transition-colors hover:text-brand-600 dark:hover:text-brand-400">{project.title}</Link>
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

			<div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-brand-700 dark:text-brand-400">
				<Link
					href={project.demoUrl}
					target="_blank"
					rel="noreferrer"
					className="inline-flex items-center gap-1.5 hover:text-brand-900 dark:hover:text-brand-300"
				>
					<ExternalLink className="h-3.5 w-3.5" />
					Live Demo
				</Link>
				<Link
					href={project.repoUrl}
					className="inline-flex items-center gap-1.5 text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
					target="_blank"
					rel="noreferrer"
				>
					<GitBranch className="h-3.5 w-3.5" />
					Repository
				</Link>
			</div>
			</div>
		</motion.article>
	);
}
