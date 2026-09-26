"use client";

import { useState } from "react";
import BlogArticleCard, { type BlogArticleCardData } from "@/components/BlogArticleCard";
import ProjectCard from "@/components/ProjectCard";
import ContentSections from "@/components/ContentSections";
import type { ContentLayout, ContentSection, Project } from "@/lib/portfolio";

type PreviewMode = "card" | "detail";

export type ProjectPreviewDraft = {
  title: string;
  summary: string;
  technologies: string[];
  repoUrl: string;
  demoUrl: string;
  featured: boolean;
  thumbnail: string;
  pictures: string[];
  videos: string[];
  customVariables: Record<string, string>;
  content: string;
  layout: ContentLayout;
  sections: ContentSection[];
};

export type ArticlePreviewDraft = {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug: string;
  publishedAt: string;
  thumbnail: string;
  content: string;
  pictures: string[];
  featured: boolean;
  layout: ContentLayout;
  sections: ContentSection[];
};

type AdminLivePreviewProps =
  | { kind: "project"; draft: ProjectPreviewDraft }
  | { kind: "article"; draft: ArticlePreviewDraft };

function PreviewShell({ mode, setMode, children }: { mode: PreviewMode; setMode: (mode: PreviewMode) => void; children: React.ReactNode }) {
  return (
    <section className="border-2 border-black bg-zinc-100 p-4 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3 dark:border-zinc-700">
        <div>
          <p className="font-mono text-xs font-black uppercase tracking-wider text-black dark:text-[#ffe600]">
            Live site preview
          </p>
          <p className="mt-1 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
            Uses the same public card component and content fields.
          </p>
        </div>
        <div className="flex border-2 border-black bg-white dark:bg-zinc-900">
          {(["card", "detail"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`px-3 py-1.5 font-mono text-[10px] font-black uppercase ${mode === item ? "bg-[#ffe600] text-black" : "text-zinc-600 dark:text-zinc-300"}`}
            >
              {item === "card" ? "Public card" : "Detail snapshot"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function DetailPreview({ title, eyebrow, description, image, content, sections, meta }: { title: string; eyebrow: string; description: string; image?: string; content: string; sections: ContentSection[]; meta: string }) {
  return (
    <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff]">
      <p className="font-mono text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">{eyebrow}</p>
      <h3 className="mt-2 font-mono text-2xl font-black uppercase text-black dark:text-white">{title || "Untitled content"}</h3>
      <p className="mt-2 font-mono text-xs text-zinc-500">{meta}</p>
      <p className="mt-4 border-l-4 border-green-500 pl-3 text-sm leading-6 text-green-700 dark:text-green-300">{description || "Add a summary to see it here."}</p>
      {image ? (
        <div className="relative mt-5 overflow-hidden border-2 border-black bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="Preview thumbnail" className="h-44 w-full object-cover" />
        </div>
      ) : null}
      <div className="mt-5 max-h-44 overflow-hidden border-2 border-black bg-zinc-50 p-3 font-mono text-xs leading-6 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
        {content.trim() || "Your full content will appear here."}
      </div>
      {sections.length > 0 ? (
        <div className="mt-5 border-t-2 border-black pt-5 dark:border-zinc-700">
          <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-widest text-blue-700 dark:text-blue-300">
            {sections.length} custom section{sections.length === 1 ? "" : "s"} in the live detail
          </p>
          <ContentSections sections={sections} />
        </div>
      ) : null}
    </div>
  );
}

export default function AdminLivePreview(props: AdminLivePreviewProps) {
  const [mode, setMode] = useState<PreviewMode>("card");

  if (props.kind === "project") {
    const { draft } = props;
    const project = {
      id: "admin-preview-project",
      title: draft.title || "Untitled project",
      summary: draft.summary,
      technologies: draft.technologies,
      repoUrl: draft.repoUrl,
      demoUrl: draft.demoUrl,
      featured: draft.featured,
      thumbnail: draft.thumbnail || undefined,
      pictures: draft.pictures,
      videos: draft.videos,
      customVariables: draft.customVariables,
      customVars: draft.customVariables,
      content: draft.content,
      images: draft.pictures,
      videoUrl: draft.videos[0],
      layout: draft.layout,
      order: 0,
      primaryTechnology: draft.technologies[0] || "General",
    } as Project;

    return (
      <PreviewShell mode={mode} setMode={setMode}>
        {mode === "card" ? (
          <div className="pointer-events-none max-w-xl">
            <ProjectCard project={project} />
          </div>
        ) : (
          <DetailPreview
            title={draft.title}
            eyebrow="Projects / live detail"
            description={draft.summary}
            image={draft.thumbnail || draft.pictures[0]}
            content={draft.content}
            sections={draft.sections}
            meta={`${draft.featured ? "Pinned on home" : "Standard listing"} · ${draft.layout} layout`}
          />
        )}
      </PreviewShell>
    );
  }

  const { draft } = props;
  const article: BlogArticleCardData = {
    title: draft.title || "Untitled article",
    excerpt: draft.excerpt,
    slug: draft.slug || "preview",
    groupSlug: draft.groupSlug || "engineering-notes",
    groupName: draft.groupSlug || "Engineering Notes",
    publishedAt: draft.publishedAt,
    content: draft.content,
    thumbnail: draft.thumbnail || undefined,
    pictures: draft.pictures,
    featured: draft.featured,
    layout: draft.layout,
    sections: draft.sections,
  };

  return (
    <PreviewShell mode={mode} setMode={setMode}>
      {mode === "card" ? (
        <div className="pointer-events-none max-w-2xl">
          <BlogArticleCard article={article} featured={draft.featured} />
        </div>
      ) : (
        <DetailPreview
          title={draft.title}
          eyebrow={`${draft.groupSlug || "engineering-notes"} / live detail`}
          description={draft.excerpt}
          image={draft.thumbnail || draft.pictures[0]}
          content={draft.content}
          sections={draft.sections}
          meta={`${draft.featured ? "Pinned article" : "Standard article"} · ${draft.layout} layout · ${draft.publishedAt}`}
        />
      )}
    </PreviewShell>
  );
}
