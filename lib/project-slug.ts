import type { Project } from "@/lib/portfolio";

export function slugifyProjectTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getProjectSlug(project: Pick<Project, "title">): string {
  return slugifyProjectTitle(project.title);
}
