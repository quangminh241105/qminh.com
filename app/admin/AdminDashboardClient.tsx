"use client";

import { useState } from "react";
import { type PortfolioContent } from "@/lib/portfolio-db";
import type { ContentLayout, GalleryImage } from "@/lib/portfolio";
import AdminLivePreview from "@/components/AdminLivePreview";
import {
  logoutAdminAction,
  updateProfileServerAction,
  saveProjectServerAction,
  deleteProjectServerAction,
  saveArticleServerAction,
  deleteArticleServerAction,
  upsertArticleGroupAction,
  deleteArticleGroupAction,
  saveGalleryGroupServerAction,
  deleteGalleryGroupServerAction,
  saveSkillServerAction,
  deleteSkillServerAction,
  saveResumeItemServerAction,
  deleteResumeItemServerAction,
} from "@/app/admin/actions";
import {
  BriefcaseIcon,
  BookOpenIcon,
  UserIcon,
  SlidersIcon,
  LayersIcon,
  UploadIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  LogOutIcon,
  ImageIcon,
  VideoIcon,
} from "@/components/icons";

type Props = {
  portfolio: PortfolioContent;
  dbHealth: { ok: boolean; database: string; message: string };
};

type Tab = "overview" | "profile" | "projects" | "blog" | "groups" | "gallery" | "resume" | "skills" | "media";

function getErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : "";
  if (/server action.*not found|failed to find server action/i.test(message)) {
    if (typeof window !== "undefined") {
      window.setTimeout(() => window.location.reload(), 250);
    }
    return "A newer dashboard version is active. Reloading...";
  }

  return message || fallback;
}

function uploadSlug(value: string, fallback = "untitled") {
  const normalized = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

export default function AdminDashboardClient({ portfolio, dbHealth }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // ----------------------------------------------------
  // Profile State
  // ----------------------------------------------------
  const [profileForm, setProfileForm] = useState({
    name: portfolio.name,
    profession: portfolio.profession,
    tagline: portfolio.tagline,
    location: portfolio.location,
    avatar: portfolio.avatar || "",
    quickSummary: portfolio.quickSummary.join("\n"),
    intro: portfolio.about.intro,
    background: portfolio.about.background,
    interests: portfolio.about.interests.join(", "),
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await updateProfileServerAction({
        name: profileForm.name,
        profession: profileForm.profession,
        tagline: profileForm.tagline,
        location: profileForm.location,
        avatar: profileForm.avatar,
        quickSummary: profileForm.quickSummary.split("\n").map((s) => s.trim()).filter(Boolean),
        about: {
          intro: profileForm.intro,
          background: profileForm.background,
          interests: profileForm.interests.split(",").map((s) => s.trim()).filter(Boolean),
        },
      });
      if (!result.ok) throw new Error(result.error);
      showStatus("Profile & About updated successfully!");
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to update profile"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Projects State & CRUD
  // ----------------------------------------------------
  const [projectsList, setProjectsList] = useState(portfolio.projects);
  const [editingProject, setEditingProject] = useState<{
    originalTitle?: string;
    title: string;
    summary: string;
    technologies: string;
    repoUrl: string;
    demoUrl: string;
    featured: boolean;
    layout: ContentLayout;
    thumbnail: string;
    pictures: string[];
    videos: string[];
    customVariables: { key: string; value: string }[];
    content: string;
  } | null>(null);

  const startNewProject = () => {
    setEditingProject({
      title: "",
      summary: "",
      technologies: "Next.js, TypeScript, Tailwind",
      repoUrl: "https://github.com/",
      demoUrl: "https://example.com",
      featured: false,
      layout: "standard",
      thumbnail: "",
      pictures: [],
      videos: [],
      customVariables: [{ key: "Role", value: "Developer" }],
      content: "",
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setIsSaving(true);
    try {
      const customVarsObj: Record<string, string> = {};
      editingProject.customVariables.forEach((cv) => {
        if (cv.key.trim()) customVarsObj[cv.key.trim()] = cv.value.trim();
      });

      const techArray = editingProject.technologies.split(",").map((t) => t.trim()).filter(Boolean);

      const result = await saveProjectServerAction({
        originalTitle: editingProject.originalTitle,
        title: editingProject.title,
        summary: editingProject.summary,
        technologies: techArray,
        repoUrl: editingProject.repoUrl,
        demoUrl: editingProject.demoUrl,
        featured: editingProject.featured,
        layout: editingProject.layout,
        thumbnail: editingProject.thumbnail,
        pictures: editingProject.pictures,
        videos: editingProject.videos,
        customVariables: customVarsObj,
        content: editingProject.content,
      });
      if (!result.ok) throw new Error(result.error);

      showStatus(`Project "${editingProject.title}" saved!`);
      setEditingProject(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save project"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (title: string) => {
    if (!confirm(`Are you sure you want to delete project "${title}"?`)) return;
    setIsSaving(true);
    try {
      const result = await deleteProjectServerAction(title);
      if (!result.ok) throw new Error(result.error);
      setProjectsList((prev) => prev.filter((p) => p.title !== title));
      showStatus(`Project "${title}" deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete project"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Blog Articles State & CRUD
  // ----------------------------------------------------
  const [articlesList, setArticlesList] = useState(portfolio.articles);
  const [editingArticle, setEditingArticle] = useState<{
    originalSlug?: string;
    title: string;
    slug: string;
    groupSlug: string;
    excerpt: string;
    publishedAt: string;
    featured: boolean;
    layout: ContentLayout;
    thumbnail: string;
    content: string;
    pictures: string[];
    videos: string[];
  } | null>(null);

  const startNewArticle = () => {
    setEditingArticle({
      title: "",
      slug: "",
      groupSlug: portfolio.articleGroups[0]?.slug ?? "",
      excerpt: "",
      publishedAt: new Date().toISOString().split("T")[0],
      featured: false,
      layout: "standard",
      thumbnail: "",
      content: "Write your blog post here...",
      pictures: [],
      videos: [],
    });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    setIsSaving(true);
    try {
      const result = await saveArticleServerAction({
        originalSlug: editingArticle.originalSlug,
        title: editingArticle.title,
        slug: editingArticle.slug,
        groupSlug: editingArticle.groupSlug,
        excerpt: editingArticle.excerpt,
        publishedAt: editingArticle.publishedAt,
        featured: editingArticle.featured,
        layout: editingArticle.layout,
        thumbnail: editingArticle.thumbnail,
        content: editingArticle.content,
        pictures: editingArticle.pictures,
        videos: editingArticle.videos,
      });
      if (!result.ok) throw new Error(result.error);

      showStatus(`Article "${editingArticle.title}" saved!`);
      setEditingArticle(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save article"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (slug: string) => {
    if (!confirm(`Delete article with slug "${slug}"?`)) return;
    setIsSaving(true);
    try {
      const result = await deleteArticleServerAction(slug);
      if (!result.ok) throw new Error(result.error);
      setArticlesList((prev) => prev.filter((a) => a.slug !== slug));
      showStatus(`Article deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete article"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Blog Groups CRUD
  // ----------------------------------------------------
  const [articleGroupsList, setArticleGroupsList] = useState(portfolio.articleGroups);
  const [editingGroup, setEditingGroup] = useState<{
    originalSlug?: string;
    name: string;
    slug: string;
    description: string;
    coverImage: string;
  } | null>(null);

  const startNewGroup = () => {
    setEditingGroup({ name: "", slug: "", description: "", coverImage: "" });
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    setIsSaving(true);
    try {
      const result = await upsertArticleGroupAction({
        id: editingGroup.originalSlug,
        name: editingGroup.name,
        slug: editingGroup.slug,
        description: editingGroup.description,
        coverImage: editingGroup.coverImage,
      });
      if (!result.ok) throw new Error(result.error);
      showStatus(`Blog group "${editingGroup.name}" saved!`);
      setEditingGroup(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save blog group"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (slug: string, name: string) => {
    if (!confirm(`Delete blog group "${name}"? Articles must be moved or deleted first.`)) return;
    setIsSaving(true);
    try {
      const result = await deleteArticleGroupAction(slug);
      if (!result.ok) throw new Error(result.message);
      setArticleGroupsList((prev) => prev.filter((group) => group.slug !== slug));
      showStatus(`Blog group "${name}" deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete blog group"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Gallery Groups CRUD
  // ----------------------------------------------------
  const [galleryGroupsList, setGalleryGroupsList] = useState(portfolio.galleryGroups);
  const [editingGalleryGroup, setEditingGalleryGroup] = useState<{
    originalSlug?: string;
    title: string;
    slug: string;
    description: string;
    images: GalleryImage[];
    imageUrl: string;
  } | null>(null);

  const startNewGalleryGroup = () => {
    setEditingGalleryGroup({ title: "", slug: "", description: "", images: [], imageUrl: "" });
  };

  const handleSaveGalleryGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGalleryGroup) return;
    setIsSaving(true);
    try {
      const result = await saveGalleryGroupServerAction({
        originalSlug: editingGalleryGroup.originalSlug,
        title: editingGalleryGroup.title,
        slug: editingGalleryGroup.slug,
        description: editingGalleryGroup.description,
        images: editingGalleryGroup.images.map((image, index) => ({ ...image, order: index })),
      });
      if (!result.ok) throw new Error(result.error);
      showStatus(`Gallery group "${editingGalleryGroup.title}" saved!`);
      setEditingGalleryGroup(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save gallery group"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryGroup = async (slug: string, title: string) => {
    if (!confirm(`Delete gallery group "${title}" and its image references?`)) return;
    setIsSaving(true);
    try {
      const result = await deleteGalleryGroupServerAction(slug);
      if (!result.ok) throw new Error(result.error);
      setGalleryGroupsList((prev) => prev.filter((group) => group.slug !== slug));
      showStatus(`Gallery group "${title}" deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete gallery group"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Skills CRUD
  // ----------------------------------------------------
  const [skillsList, setSkillsList] = useState(portfolio.skills);
  const [editingSkill, setEditingSkill] = useState<{
    originalName?: string;
    name: string;
    category: string;
    level: number;
  } | null>(null);

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;
    setIsSaving(true);
    try {
      const result = await saveSkillServerAction(editingSkill);
      if (!result.ok) throw new Error(result.error);
      showStatus(`Skill "${editingSkill.name}" saved!`);
      setEditingSkill(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save skill"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSkill = async (name: string) => {
    if (!confirm(`Delete skill "${name}"?`)) return;
    setIsSaving(true);
    try {
      const result = await deleteSkillServerAction(name);
      if (!result.ok) throw new Error(result.error);
      setSkillsList((prev) => prev.filter((s) => s.name !== name));
      showStatus(`Skill deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete skill"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // Resume Items CRUD
  // ----------------------------------------------------
  const [resumeList, setResumeList] = useState(portfolio.resume);
  const [editingResume, setEditingResume] = useState<{
    originalTitle?: string;
    period: string;
    title: string;
    details: string;
  } | null>(null);

  const handleSaveResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResume) return;
    setIsSaving(true);
    try {
      const result = await saveResumeItemServerAction(editingResume);
      if (!result.ok) throw new Error(result.error);
      showStatus(`Resume entry "${editingResume.title}" saved!`);
      setEditingResume(null);
      window.location.reload();
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to save resume entry"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteResume = async (title: string) => {
    if (!confirm(`Delete resume entry "${title}"?`)) return;
    setIsSaving(true);
    try {
      const result = await deleteResumeItemServerAction(title);
      if (!result.ok) throw new Error(result.error);
      setResumeList((prev) => prev.filter((r) => r.title !== title));
      showStatus(`Resume entry deleted`);
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "Failed to delete resume entry"), "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ----------------------------------------------------
  // File Upload Helper
  // ----------------------------------------------------
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const handleFileUpload = async (
    file: File,
    folder = "media",
    kind: "image" | "video" | "media" | "resume" = "media",
  ): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("kind", kind);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setUploadedUrl(data.url);
      showStatus(`Uploaded ${data.filename} successfully!`);
      return data.url;
    } catch (err: unknown) {
      showStatus(getErrorMessage(err, "File upload failed"), "error");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[5px_5px_0px_#000000] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[#ffe600] border border-black" />
            <h1 className="font-mono text-xl font-black uppercase tracking-wider text-black dark:text-[#ffe600]">
              Admin Control Center
            </h1>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            Database: <span className="font-bold text-black dark:text-white">{dbHealth.database}</span> • Status:{" "}
            <span className={`font-bold ${dbHealth.ok ? "text-green-600 dark:text-green-400" : "text-amber-600"}`}>
              {dbHealth.ok ? "CONNECTED (Docker MongoDB)" : "FALLBACK STATIC"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 border-2 border-black bg-white px-3.5 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-red-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-red-950 cursor-pointer"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>

      {/* Status Notification Toast */}
      {statusMessage && (
        <div
          className={`mt-4 border-2 p-3 font-mono text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_#000000] ${
            statusMessage.type === "success"
              ? "border-black bg-[#ffe600] text-black"
              : "border-red-600 bg-red-100 text-red-800"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {!dbHealth.ok && (
        <div className="mt-4 border-2 border-amber-600 bg-amber-50 p-4 font-mono text-xs text-amber-950 shadow-[3px_3px_0px_#000000] dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-black uppercase tracking-wider">Database unavailable — changes cannot be saved</p>
          <p className="mt-2 break-words leading-relaxed">
            The dashboard is showing static fallback content. Restore the MongoDB service or check the production
            <code className="mx-1 border border-amber-700/50 bg-amber-100 px-1 dark:bg-amber-900/50">MONGODB_URI</code>
            before using CRUD actions.
          </p>
          <p className="mt-2 break-words border-t border-amber-700/30 pt-2 text-[11px] opacity-80">{dbHealth.message}</p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="mt-6 flex flex-wrap gap-2 border-b-2 border-black pb-2 dark:border-zinc-700">
        {[
          { id: "overview", label: "Overview", icon: LayersIcon },
          { id: "projects", label: `Projects (${projectsList.length})`, icon: BriefcaseIcon },
          { id: "blog", label: `Blog (${articlesList.length})`, icon: BookOpenIcon },
          { id: "groups", label: `Blog Groups (${articleGroupsList.length})`, icon: LayersIcon },
          { id: "gallery", label: `Gallery (${galleryGroupsList.length})`, icon: ImageIcon },
          { id: "profile", label: "Profile & About", icon: UserIcon },
          { id: "resume", label: `About Timeline (${resumeList.length})`, icon: SlidersIcon },
          { id: "skills", label: `Skills (${skillsList.length})`, icon: SlidersIcon },
          { id: "media", label: "Media Upload", icon: UploadIcon },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as Tab);
                setEditingProject(null);
                setEditingArticle(null);
                setEditingGroup(null);
                setEditingGalleryGroup(null);
                setEditingSkill(null);
                setEditingResume(null);
              }}
              className={`inline-flex items-center gap-2 border-2 border-black px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? "bg-[#ffe600] text-black shadow-[3px_3px_0px_#000000] -translate-y-0.5"
                  : "bg-white text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">Total Projects</p>
            <p className="mt-2 font-mono text-3xl font-black text-black dark:text-[#ffe600]">{projectsList.length}</p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              {projectsList.filter((p) => p.featured).length} Featured on Home
            </p>
          </div>

          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">Blog Articles</p>
            <p className="mt-2 font-mono text-3xl font-black text-black dark:text-[#ffe600]">{articlesList.length}</p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">Markdown enabled</p>
          </div>

          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">Skills Tracked</p>
            <p className="mt-2 font-mono text-3xl font-black text-black dark:text-[#ffe600]">{skillsList.length}</p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">Visual progress charts</p>
          </div>

          <div className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
            <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">Database Engine</p>
            <p className="mt-2 font-mono text-lg font-black uppercase text-black dark:text-[#ffe600]">
              {dbHealth.ok ? "MongoDB 7.0" : "Offline / Fallback"}
            </p>
            <p className="mt-2 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
              Docker port 27017
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: PROJECTS CRUD */}
      {activeTab === "projects" && (
        <div className="mt-6 space-y-6">
          {!editingProject ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
                  Manage Projects
                </h2>
                <button
                  onClick={startNewProject}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add New Project</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {projectsList.map((project) => (
                  <div
                    key={project.title}
                    className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 flex flex-col justify-between"
                  >
                    <div>
                      {(project.thumbnail || project.pictures?.[0]) && (
                        <div className="mb-4 overflow-hidden border-2 border-black bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={project.thumbnail || project.pictures[0]}
                            alt={`${project.title} thumbnail`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="border border-black bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black dark:bg-zinc-800 dark:text-zinc-200">
                          {project.primaryTechnology}
                        </span>
                        {project.featured && (
                          <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-bold text-black">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 font-mono text-base font-black uppercase text-black dark:text-white">
                        {project.title}
                      </h3>
                      <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {project.summary}
                      </p>
                      {project.pictures && project.pictures.length > 0 && (
                        <p className="mt-2 font-mono text-[11px] text-zinc-500 flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          <span>{project.pictures.length} attached image(s)</span>
                        </p>
                      )}
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t-2 border-black pt-3 dark:border-zinc-700">
                      <button
                        onClick={() => {
                          const cvList = Object.entries(project.customVariables || {}).map(([k, v]) => ({
                            key: k,
                            value: v,
                          }));
                          setEditingProject({
                            originalTitle: project.title,
                            title: project.title,
                            summary: project.summary,
                            technologies: project.technologies.join(", "),
                            repoUrl: project.repoUrl,
                            demoUrl: project.demoUrl,
                            featured: project.featured,
                            layout: project.layout || "standard",
                            thumbnail: project.thumbnail || project.pictures?.[0] || "",
                            pictures: project.pictures || [],
                            videos: project.videos || [],
                            customVariables: cvList.length > 0 ? cvList : [{ key: "Role", value: "Developer" }],
                            content: project.content || "",
                          });
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] cursor-pointer"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteProject(project.title)}
                        className="inline-flex items-center justify-center p-2 border-2 border-black bg-red-100 text-red-700 shadow-[2px_2px_0px_#000000] hover:bg-red-200 cursor-pointer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PROJECT EDIT FORM */
            <form
              onSubmit={handleSaveProject}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
                <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
                  {editingProject.originalTitle ? `Edit: ${editingProject.originalTitle}` : "Create New Project"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="font-mono text-xs font-bold underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Project Title *
                  </label>
                  <input
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Technologies (comma separated) *
                  </label>
                  <input
                    required
                    value={editingProject.technologies}
                    onChange={(e) => setEditingProject({ ...editingProject, technologies: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Summary Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={editingProject.summary}
                    onChange={(e) => setEditingProject({ ...editingProject, summary: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Live Demo URL
                  </label>
                  <input
                    value={editingProject.demoUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    GitHub / Repo URL
                  </label>
                  <input
                    value={editingProject.repoUrl}
                    onChange={(e) => setEditingProject({ ...editingProject, repoUrl: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-mono text-xs font-bold uppercase">
                    <input
                      type="checkbox"
                      checked={editingProject.featured}
                      onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                      className="h-4 w-4 border-2 border-black accent-[#ffe600]"
                    />
                    <span>Featured on Home Page</span>
                  </label>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Public Card Layout
                  </label>
                  <select
                    value={editingProject.layout}
                    onChange={(e) => setEditingProject({ ...editingProject, layout: e.target.value as ContentLayout })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="standard">Standard — balanced card</option>
                    <option value="spotlight">Spotlight — larger visual</option>
                    <option value="minimal">Minimal — compact card</option>
                  </select>
                </div>

                {/* Project Thumbnail */}
                <div className="md:col-span-2 border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      <span>Project Thumbnail</span>
                    </label>
                    <label className="border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase cursor-pointer hover:bg-[#ffe600] shadow-[2px_2px_0px_#000000]">
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `projects/${uploadSlug(editingProject.title)}/thumbnail`,
                              "image",
                            );
                            if (url) setEditingProject({ ...editingProject, thumbnail: url });
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <p className="mb-2 font-mono text-[11px] text-zinc-500">
                    This image appears on project cards. Screenshots below remain available in the project gallery.
                  </p>
                  {editingProject.thumbnail && (
                    <div className="relative mb-2 w-fit border-2 border-black bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingProject.thumbnail} alt="Project thumbnail preview" className="h-28 w-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingProject({ ...editingProject, thumbnail: "" })}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                        aria-label="Remove project thumbnail"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    value={editingProject.thumbnail}
                    onChange={(e) => setEditingProject({ ...editingProject, thumbnail: e.target.value })}
                    placeholder="Paste thumbnail URL or /uploads/project-thumbnail.png"
                    className="w-full border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                  />
                </div>

                {/* Picture Uploads */}
                <div className="md:col-span-2 border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      <span>Pictures / Screenshots (URLs or Local Uploads)</span>
                    </label>
                    <label className="border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase cursor-pointer hover:bg-[#ffe600] shadow-[2px_2px_0px_#000000]">
                      <span>Upload Local Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `projects/${uploadSlug(editingProject.title)}/screenshots`,
                              "image",
                            );
                            if (url) {
                              setEditingProject({
                                ...editingProject,
                                pictures: [...editingProject.pictures, url],
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {editingProject.pictures.map((pic, idx) => (
                      <div key={idx} className="relative border-2 border-black p-1 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={pic} alt="preview" className="h-16 w-24 object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              pictures: editingProject.pictures.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <input
                      placeholder="Or paste external image URL and press Enter"
                      className="flex-1 border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val) {
                            setEditingProject({ ...editingProject, pictures: [...editingProject.pictures, val] });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Videos */}
                <div className="md:col-span-2 border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                  <label className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600] flex items-center gap-1.5 mb-2">
                    <VideoIcon className="h-4 w-4" />
                    <span>Video Links (YouTube, Vimeo, or /uploads/video.mp4)</span>
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingProject.videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center gap-2 border border-black bg-white px-2 py-1 font-mono text-xs">
                        <span>{vid}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProject({
                              ...editingProject,
                              videos: editingProject.videos.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-red-600 font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    placeholder="Paste video URL and press Enter"
                    className="w-full border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (val) {
                          setEditingProject({ ...editingProject, videos: [...editingProject.videos, val] });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>

                {/* Custom Variables */}
                <div className="md:col-span-2 border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600]">
                      Custom Variables (Key - Value Metadata)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingProject({
                          ...editingProject,
                          customVariables: [...editingProject.customVariables, { key: "", value: "" }],
                        })
                      }
                      className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-xs font-bold uppercase"
                    >
                      + Add Variable
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editingProject.customVariables.map((cv, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          placeholder="Key (e.g. Client, Architecture)"
                          value={cv.key}
                          onChange={(e) => {
                            const newCVs = [...editingProject.customVariables];
                            newCVs[idx].key = e.target.value;
                            setEditingProject({ ...editingProject, customVariables: newCVs });
                          }}
                          className="w-1/3 border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                        />
                        <input
                          placeholder="Value (e.g. Microservices, University)"
                          value={cv.value}
                          onChange={(e) => {
                            const newCVs = [...editingProject.customVariables];
                            newCVs[idx].value = e.target.value;
                            setEditingProject({ ...editingProject, customVariables: newCVs });
                          }}
                          className="flex-1 border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProject({
                              ...editingProject,
                              customVariables: editingProject.customVariables.filter((_, i) => i !== idx),
                            });
                          }}
                          className="text-red-600 font-bold px-2"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Markdown Content */}
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Full Project Markdown Content (Optional)
                  </label>
                  <textarea
                    rows={6}
                    value={editingProject.content}
                    onChange={(e) => setEditingProject({ ...editingProject, content: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                    placeholder="Write detailed background, trade-offs, architecture decisions..."
                  />
                </div>

                <div className="md:col-span-2">
                  <AdminLivePreview
                    kind="project"
                    draft={{
                      title: editingProject.title,
                      summary: editingProject.summary,
                      technologies: editingProject.technologies.split(",").map((item) => item.trim()).filter(Boolean),
                      repoUrl: editingProject.repoUrl,
                      demoUrl: editingProject.demoUrl,
                      featured: editingProject.featured,
                      layout: editingProject.layout,
                      thumbnail: editingProject.thumbnail,
                      pictures: editingProject.pictures,
                      videos: editingProject.videos,
                      customVariables: Object.fromEntries(
                        editingProject.customVariables.filter((item) => item.key.trim()).map((item) => [item.key, item.value]),
                      ),
                      content: editingProject.content,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t-2 border-black pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border-2 border-black bg-[#ffe600] px-6 py-2 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save Project"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: BLOG CRUD */}
      {activeTab === "blog" && (
        <div className="mt-6 space-y-6">
          {!editingArticle ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
                  Manage Blog Articles
                </h2>
                <button
                  onClick={startNewArticle}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Write New Article</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {articlesList.map((article) => (
                  <div
                    key={article.slug}
                    className="border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 flex flex-col justify-between"
                  >
                    <div>
                      {(article.thumbnail || article.pictures?.[0]) && (
                        <div className="mb-4 overflow-hidden border-2 border-black bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.thumbnail || article.pictures[0]}
                            alt={`${article.title} thumbnail`}
                            className="h-28 w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
                          {article.publishedAt}
                        </span>
                        {article.featured && (
                          <span className="border border-black bg-red-500 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-white">
                            Pinned
                          </span>
                        )}
                        <span className="font-mono text-[10px] uppercase text-zinc-500">{article.layout || "standard"}</span>
                      </div>
                      <h3 className="mt-2 font-mono text-base font-black uppercase text-black dark:text-white">
                        {article.title}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-zinc-500">Slug: /blog/{article.slug}</p>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2 border-t-2 border-black pt-3 dark:border-zinc-700">
                      <button
                        onClick={() => {
                          setEditingArticle({
                            originalSlug: article.slug,
                            title: article.title,
                            slug: article.slug,
                            groupSlug: article.groupSlug,
                            excerpt: article.excerpt,
                            publishedAt: article.publishedAt,
                            featured: article.featured,
                            layout: article.layout || "standard",
                            thumbnail: article.thumbnail || article.pictures?.[0] || "",
                            content: article.content || "",
                            pictures: article.pictures || [],
                            videos: article.videos || [],
                          });
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600] cursor-pointer"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleDeleteArticle(article.slug)}
                        className="inline-flex items-center justify-center p-2 border-2 border-black bg-red-100 text-red-700 shadow-[2px_2px_0px_#000000] hover:bg-red-200 cursor-pointer"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* ARTICLE EDIT FORM */
            <form
              onSubmit={handleSaveArticle}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
                <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
                  {editingArticle.originalSlug ? `Edit Article` : "Write New Article"}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="font-mono text-xs font-bold underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Article Title *
                  </label>
                  <input
                    required
                    value={editingArticle.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-");
                      setEditingArticle({
                        ...editingArticle,
                        title,
                        slug: editingArticle.originalSlug ? editingArticle.slug : slug,
                      });
                    }}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    URL Slug *
                  </label>
                  <input
                    required
                    value={editingArticle.slug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, slug: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Published Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingArticle.publishedAt}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publishedAt: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Blog Group *
                  </label>
                  <select
                    required
                    value={editingArticle.groupSlug}
                    onChange={(e) => setEditingArticle({ ...editingArticle, groupSlug: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  >
                    <option value="">Choose a group</option>
                    {articleGroupsList.map((group) => (
                      <option key={group.slug} value={group.slug}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Summary / Excerpt *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={editingArticle.excerpt}
                    onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-mono text-xs font-bold uppercase">
                    <input
                      type="checkbox"
                      checked={editingArticle.featured}
                      onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })}
                      className="h-4 w-4 border-2 border-black accent-[#ffe600]"
                    />
                    <span>Pin / Feature in Blog</span>
                  </label>
                </div>

                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Public Card Layout
                  </label>
                  <select
                    value={editingArticle.layout}
                    onChange={(e) => setEditingArticle({ ...editingArticle, layout: e.target.value as ContentLayout })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  >
                    <option value="standard">Standard — balanced card</option>
                    <option value="spotlight">Spotlight — larger visual</option>
                    <option value="minimal">Minimal — compact card</option>
                  </select>
                </div>

                {/* Article Thumbnail */}
                <div className="md:col-span-2 border-2 border-black p-4 bg-zinc-50 dark:bg-zinc-950 dark:border-zinc-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4" />
                      <span>Blog Thumbnail</span>
                    </label>
                    <label className="border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase cursor-pointer hover:bg-[#ffe600] shadow-[2px_2px_0px_#000000]">
                      <span>Upload Thumbnail</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `blogs/${uploadSlug(editingArticle.groupSlug, "uncategorized")}/${uploadSlug(editingArticle.slug || editingArticle.title)}/thumbnail`,
                              "image",
                            );
                            if (url) setEditingArticle({ ...editingArticle, thumbnail: url });
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <p className="mb-2 font-mono text-[11px] text-zinc-500">
                    This image becomes the cover shown in the blog archive and featured article cards.
                  </p>
                  {editingArticle.thumbnail && (
                    <div className="relative mb-2 w-fit border-2 border-black bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingArticle.thumbnail} alt="Blog thumbnail preview" className="h-28 w-48 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingArticle({ ...editingArticle, thumbnail: "" })}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                        aria-label="Remove blog thumbnail"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    value={editingArticle.thumbnail}
                    onChange={(e) => setEditingArticle({ ...editingArticle, thumbnail: e.target.value })}
                    placeholder="Paste thumbnail URL or /uploads/blog-thumbnail.png"
                    className="w-full border border-black p-1.5 font-mono text-xs dark:bg-zinc-900"
                  />
                </div>

                {/* Article Content (Markdown) */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                      Article Content (Markdown format supported) *
                    </label>
                    <label className="border border-black bg-white px-2 py-0.5 font-mono text-[10px] font-bold uppercase cursor-pointer hover:bg-[#ffe600]">
                      <span>Attach Image</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `blogs/${uploadSlug(editingArticle.groupSlug, "uncategorized")}/${uploadSlug(editingArticle.slug || editingArticle.title)}/content`,
                              "image",
                            );
                            if (url) {
                              setEditingArticle({
                                ...editingArticle,
                                content: editingArticle.content + `\n\n![${file.name}](${url})\n`,
                                pictures: editingArticle.pictures.includes(url)
                                  ? editingArticle.pictures
                                  : [...editingArticle.pictures, url],
                              });
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  <textarea
                    required
                    rows={12}
                    value={editingArticle.content}
                    onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                    className="w-full border-2 border-black bg-white p-3 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <AdminLivePreview
                    kind="article"
                    draft={{
                      title: editingArticle.title,
                      excerpt: editingArticle.excerpt,
                      slug: editingArticle.slug,
                      groupSlug: editingArticle.groupSlug,
                      publishedAt: editingArticle.publishedAt,
                      thumbnail: editingArticle.thumbnail,
                      content: editingArticle.content,
                      pictures: editingArticle.pictures,
                      featured: editingArticle.featured,
                      layout: editingArticle.layout,
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t-2 border-black pt-4">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border-2 border-black bg-[#ffe600] px-6 py-2 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#000000] cursor-pointer"
                >
                  {isSaving ? "Publishing..." : "Publish Article"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 4: BLOG GROUPS CRUD */}
      {activeTab === "groups" && (
        <div className="mt-6 space-y-6">
          {!editingGroup ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
                    Manage Blog Groups
                  </h2>
                  <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    Customize the labels and descriptions used to organize every article.
                  </p>
                </div>
                <button
                  onClick={startNewGroup}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Group</span>
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {articleGroupsList.map((group) => (
                  <div
                    key={group.slug}
                    className="flex flex-col justify-between border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900"
                  >
                    <div>
                      <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
                        {group.articleCount} article{group.articleCount === 1 ? "" : "s"}
                      </span>
                      <h3 className="mt-3 font-mono text-base font-black uppercase text-black dark:text-white">
                        {group.name}
                      </h3>
                      <p className="mt-1 font-mono text-xs text-zinc-500">/{group.slug}</p>
                      <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{group.description}</p>
                    </div>
                    <div className="mt-5 flex items-center gap-2 border-t-2 border-black pt-3 dark:border-zinc-700">
                      <button
                        onClick={() =>
                          setEditingGroup({
                            originalSlug: group.slug,
                            name: group.name,
                            slug: group.slug,
                            description: group.description,
                            coverImage: group.coverImage || "",
                          })
                        }
                        className="flex-1 inline-flex items-center justify-center gap-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600]"
                      >
                        <EditIcon className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.slug, group.name)}
                        className="inline-flex items-center justify-center border-2 border-black bg-red-100 p-2 text-red-700 shadow-[2px_2px_0px_#000000] hover:bg-red-200"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSaveGroup}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
                <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
                  {editingGroup.originalSlug ? "Edit Blog Group" : "Create Blog Group"}
                </h3>
                <button type="button" onClick={() => setEditingGroup(null)} className="font-mono text-xs font-bold underline">
                  Cancel
                </button>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">Group Name *</label>
                  <input
                    required
                    value={editingGroup.name}
                    onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">URL Slug *</label>
                  <input
                    required
                    value={editingGroup.slug}
                    onChange={(e) => setEditingGroup({ ...editingGroup, slug: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={editingGroup.description}
                    onChange={(e) => setEditingGroup({ ...editingGroup, description: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">Cover Image</label>
                    <label className="cursor-pointer border border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase hover:bg-[#ffe600]">
                      Upload Cover
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `blogs/groups/${uploadSlug(editingGroup.slug || editingGroup.name, "untitled")}/cover`,
                              "image",
                            );
                            if (url) setEditingGroup({ ...editingGroup, coverImage: url });
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  {editingGroup.coverImage && (
                    <div className="relative mt-2 w-fit border border-black bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingGroup.coverImage} alt="Blog group cover preview" className="h-20 w-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditingGroup({ ...editingGroup, coverImage: "" })}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                        aria-label="Remove blog group cover"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    value={editingGroup.coverImage}
                    onChange={(e) => setEditingGroup({ ...editingGroup, coverImage: e.target.value })}
                    placeholder="Paste cover URL or upload an image"
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3 border-t-2 border-black pt-4">
                <button type="button" onClick={() => setEditingGroup(null)} className="border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold uppercase">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="border-2 border-black bg-[#ffe600] px-6 py-2 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#000000]">
                  {isSaving ? "Saving..." : "Save Group"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 5: GALLERY CRUD */}
      {activeTab === "gallery" && (
        <div className="mt-6 space-y-6">
          {!editingGalleryGroup ? (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
                    Manage Gallery Groups
                  </h2>
                  <p className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                    Build Instagram-like collections with uploaded images, alt text, and captions.
                  </p>
                </div>
                <button
                  onClick={startNewGalleryGroup}
                  className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Add Gallery Group</span>
                </button>
              </div>

              {galleryGroupsList.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {galleryGroupsList.map((group) => (
                    <div
                      key={group.slug}
                      className="flex flex-col justify-between border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <div>
                        <div className="grid grid-cols-3 gap-1 overflow-hidden border-2 border-black bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950">
                          {group.images.slice(0, 6).map((image, index) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={`${image.url}-${index}`} src={image.url} alt={image.alt || group.title} className="aspect-square w-full object-cover" />
                          ))}
                          {group.images.length === 0 ? (
                            <div className="col-span-3 flex aspect-[3/1] items-center justify-center font-mono text-[10px] font-bold uppercase text-zinc-500">
                              No images yet
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-2">
                          <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">{group.title}</h3>
                          <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
                            {group.images.length} image{group.images.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="mt-1 font-mono text-xs text-zinc-500">/{group.slug}</p>
                        <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{group.description || "No description"}</p>
                      </div>
                      <div className="mt-5 flex items-center gap-2 border-t-2 border-black pt-3 dark:border-zinc-700">
                        <button
                          onClick={() =>
                            setEditingGalleryGroup({
                              originalSlug: group.slug,
                              title: group.title,
                              slug: group.slug,
                              description: group.description,
                              images: group.images.map((image) => ({ ...image })),
                              imageUrl: "",
                            })
                          }
                          className="inline-flex flex-1 items-center justify-center gap-1 border-2 border-black bg-white py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600]"
                        >
                          <EditIcon className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGalleryGroup(group.slug, group.title)}
                          className="inline-flex items-center justify-center border-2 border-black bg-red-100 p-2 text-red-700 shadow-[2px_2px_0px_#000000] hover:bg-red-200"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-12 text-center dark:border-zinc-700">
                  <ImageIcon className="mx-auto h-10 w-10" />
                  <p className="mt-3 font-mono text-sm font-black uppercase">No gallery groups yet.</p>
                </div>
              )}
            </div>
          ) : (
            <form
              onSubmit={handleSaveGalleryGroup}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between border-b-2 border-black pb-3 dark:border-zinc-700">
                <div>
                  <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
                    {editingGalleryGroup.originalSlug ? "Edit Gallery Group" : "Create Gallery Group"}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">Images are stored under /uploads/gallery/&lt;group&gt;.</p>
                </div>
                <button type="button" onClick={() => setEditingGalleryGroup(null)} className="font-mono text-xs font-bold underline">
                  Cancel
                </button>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">Group Title *</label>
                  <input
                    required
                    value={editingGalleryGroup.title}
                    onChange={(e) => setEditingGalleryGroup({ ...editingGalleryGroup, title: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">URL Slug *</label>
                  <input
                    required
                    value={editingGalleryGroup.slug}
                    onChange={(e) => setEditingGalleryGroup({ ...editingGalleryGroup, slug: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">Description</label>
                  <textarea
                    rows={2}
                    value={editingGalleryGroup.description}
                    onChange={(e) => setEditingGalleryGroup({ ...editingGalleryGroup, description: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2 border-2 border-black bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600]">Gallery Images</p>
                      <p className="mt-1 font-mono text-[11px] text-zinc-500">Use JPG, PNG, WEBP, or GIF. Captions appear on hover.</p>
                    </div>
                    <label className="cursor-pointer border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600]">
                      Upload Image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = await handleFileUpload(
                              file,
                              `gallery/${uploadSlug(editingGalleryGroup.slug || editingGalleryGroup.title, "untitled")}`,
                              "image",
                            );
                            if (url) {
                              setEditingGalleryGroup({
                                ...editingGalleryGroup,
                                images: [...editingGalleryGroup.images, { url, alt: file.name, caption: "" }],
                              });
                            }
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <input
                      value={editingGalleryGroup.imageUrl}
                      onChange={(e) => setEditingGalleryGroup({ ...editingGalleryGroup, imageUrl: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.preventDefault();
                      }}
                      placeholder="Paste an external image URL"
                      className="flex-1 border-2 border-black bg-white p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = editingGalleryGroup.imageUrl.trim();
                        if (!url) return;
                        setEditingGalleryGroup({
                          ...editingGalleryGroup,
                          imageUrl: "",
                          images: [...editingGalleryGroup.images, { url, alt: "", caption: "" }],
                        });
                      }}
                      className="border-2 border-black bg-[#ffe600] px-3 font-mono text-[11px] font-black uppercase"
                    >
                      Add URL
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {editingGalleryGroup.images.map((image, index) => (
                      <div key={`${image.url}-${index}`} className="relative border-2 border-black bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900">
                        <div className="relative overflow-hidden border border-black bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.url} alt={image.alt || "Gallery image preview"} className="aspect-square w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEditingGalleryGroup({ ...editingGalleryGroup, images: editingGalleryGroup.images.filter((_, itemIndex) => itemIndex !== index) })}
                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                            aria-label={`Remove gallery image ${index + 1}`}
                          >
                            ×
                          </button>
                        </div>
                        <input
                          value={image.alt}
                          onChange={(e) => {
                            const images = [...editingGalleryGroup.images];
                            images[index] = { ...images[index], alt: e.target.value };
                            setEditingGalleryGroup({ ...editingGalleryGroup, images });
                          }}
                          placeholder="Alt text"
                          className="mt-2 w-full border border-black p-1.5 font-mono text-[11px] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                        <input
                          value={image.caption}
                          onChange={(e) => {
                            const images = [...editingGalleryGroup.images];
                            images[index] = { ...images[index], caption: e.target.value };
                            setEditingGalleryGroup({ ...editingGalleryGroup, images });
                          }}
                          placeholder="Caption shown on hover"
                          className="mt-2 w-full border border-black p-1.5 font-mono text-[11px] dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t-2 border-black pt-4">
                <button type="button" onClick={() => setEditingGalleryGroup(null)} className="border-2 border-black bg-white px-5 py-2 font-mono text-xs font-bold uppercase">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="border-2 border-black bg-[#ffe600] px-6 py-2 font-mono text-xs font-black uppercase shadow-[3px_3px_0px_#000000]">
                  {isSaving ? "Saving..." : "Save Gallery"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 6: PROFILE & ABOUT */}
      {activeTab === "profile" && (
        <form
          onSubmit={handleProfileSubmit}
          className="mt-6 border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900"
        >
          <div className="border-b-2 border-black pb-3 dark:border-zinc-700">
            <h2 className="font-mono text-base font-black uppercase text-black dark:text-white">
              Edit Profile & About Page
            </h2>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
              Customize your hero text, location, bullet points, and about intro at ease.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Full Name
              </label>
              <input
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Profession / Title
              </label>
              <input
                required
                value={profileForm.profession}
                onChange={(e) => setProfileForm({ ...profileForm, profession: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Hero Tagline
              </label>
              <input
                required
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Location
              </label>
              <input
                required
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Interests (comma-separated)
              </label>
              <input
                value={profileForm.interests}
                onChange={(e) => setProfileForm({ ...profileForm, interests: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 border-2 border-black bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <label className="flex items-center gap-1.5 font-mono text-xs font-black uppercase text-black dark:text-[#ffe600]">
                    <UserIcon className="h-4 w-4" />
                    Profile Avatar
                  </label>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">
                    Shown on the public About page and stored separately from project/blog media.
                  </p>
                </div>
                <label className="cursor-pointer border-2 border-black bg-white px-2.5 py-1 font-mono text-[11px] font-bold uppercase shadow-[2px_2px_0px_#000000] hover:bg-[#ffe600]">
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = await handleFileUpload(file, "profile/avatar", "image");
                        if (url) setProfileForm({ ...profileForm, avatar: url });
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {profileForm.avatar && (
                <div className="relative mt-3 w-fit border-2 border-black bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profileForm.avatar} alt="Profile avatar preview" className="h-28 w-28 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProfileForm({ ...profileForm, avatar: "" })}
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                    aria-label="Remove profile avatar"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                value={profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                placeholder="Paste avatar URL or /uploads/avatar.png"
                className="mt-3 w-full border border-black bg-white p-1.5 font-mono text-xs dark:bg-zinc-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                Quick Summary Highlights (one per line)
              </label>
              <textarea
                rows={3}
                value={profileForm.quickSummary}
                onChange={(e) => setProfileForm({ ...profileForm, quickSummary: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                About: Intro Statement
              </label>
              <textarea
                rows={3}
                value={profileForm.intro}
                onChange={(e) => setProfileForm({ ...profileForm, intro: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                About: Background Story
              </label>
              <textarea
                rows={4}
                value={profileForm.background}
                onChange={(e) => setProfileForm({ ...profileForm, background: e.target.value })}
                className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end border-t-2 border-black pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="border-2 border-black bg-[#ffe600] px-6 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Profile & About"}
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: RESUME CRUD */}
      {activeTab === "resume" && (
        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
              About Timeline Items
            </h2>
            <button
              onClick={() =>
                setEditingResume({
                  period: "2026 - Present",
                  title: "Software Engineer",
                  details: "Describe experience or education details here.",
                })
              }
              className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Timeline Milestone</span>
            </button>
          </div>

          {editingResume && (
            <form
              onSubmit={handleSaveResume}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 mb-6"
            >
              <h3 className="font-mono text-sm font-black uppercase text-black dark:text-white mb-4">
                {editingResume.originalTitle ? "Edit Resume Milestone" : "Add Resume Milestone"}
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Period (e.g. 2024 - Present)
                  </label>
                  <input
                    required
                    value={editingResume.period}
                    onChange={(e) => setEditingResume({ ...editingResume, period: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Title / Role / Degree
                  </label>
                  <input
                    required
                    value={editingResume.title}
                    onChange={(e) => setEditingResume({ ...editingResume, title: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Details
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={editingResume.details}
                    onChange={(e) => setEditingResume({ ...editingResume, details: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingResume(null)}
                  className="border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border-2 border-black bg-[#ffe600] px-5 py-1.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {resumeList.map((item) => (
              <div
                key={item.title}
                className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 flex justify-between items-start"
              >
                <div>
                  <span className="border border-black bg-[#ffe600] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-black">
                    {item.period}
                  </span>
                  <h4 className="mt-2 font-mono text-base font-black uppercase text-black dark:text-white">
                    {item.title}
                  </h4>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">{item.details}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingResume({
                        originalTitle: item.title,
                        period: item.period,
                        title: item.title,
                        details: item.details,
                      })
                    }
                    className="p-1.5 border border-black bg-white hover:bg-[#ffe600] cursor-pointer"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteResume(item.title)}
                    className="p-1.5 border border-black bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: SKILLS CRUD */}
      {activeTab === "skills" && (
        <div className="mt-6 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
              Tech Stack Skills
            </h2>
            <button
              onClick={() =>
                setEditingSkill({
                  name: "",
                  category: "Frontend",
                  level: 85,
                })
              }
              className="inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform cursor-pointer"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add New Skill</span>
            </button>
          </div>

          {editingSkill && (
            <form
              onSubmit={handleSaveSkill}
              className="border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900 mb-6"
            >
              <h3 className="font-mono text-sm font-black uppercase text-black dark:text-white mb-4">
                {editingSkill.originalName ? "Edit Skill" : "Add Skill"}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Skill Name
                  </label>
                  <input
                    required
                    value={editingSkill.name}
                    onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Category
                  </label>
                  <input
                    required
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                    className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs font-bold uppercase text-black dark:text-zinc-300">
                    Proficiency: {editingSkill.level}%
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={editingSkill.level}
                    onChange={(e) => setEditingSkill({ ...editingSkill, level: Number(e.target.value) })}
                    className="mt-3 w-full accent-[#ffe600]"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSkill(null)}
                  className="border-2 border-black px-4 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="border-2 border-black bg-[#ffe600] px-5 py-1.5 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_#000000] cursor-pointer"
                >
                  Save Skill
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {skillsList.map((skill) => (
              <div
                key={skill.name}
                className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 flex justify-between items-center"
              >
                <div>
                  <span className="font-mono text-xs font-bold uppercase text-black dark:text-white">
                    {skill.name}
                  </span>
                  <p className="font-mono text-[10px] text-zinc-500">{skill.category} • {skill.level}%</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setEditingSkill({
                        originalName: skill.name,
                        name: skill.name,
                        category: skill.category,
                        level: skill.level,
                      })
                    }
                    className="p-1.5 border border-black bg-white hover:bg-[#ffe600] cursor-pointer"
                  >
                    <EditIcon className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSkill(skill.name)}
                    className="p-1.5 border border-black bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: MEDIA UPLOAD */}
      {activeTab === "media" && (
        <div className="mt-6 border-2 border-black bg-white p-6 shadow-[5px_5px_0px_#000000] dark:border-[#ffe600] dark:bg-zinc-900">
          <div className="border-b-2 border-black pb-3 dark:border-zinc-700">
            <h2 className="font-mono text-base font-black uppercase text-black dark:text-white">
              Direct Media Uploader
            </h2>
            <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">
              Upload pictures or videos to your local server storage (<code className="font-bold">/public/uploads/</code>).
            </p>
          </div>

          <div className="mt-6">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-black p-12 bg-zinc-50 hover:bg-[#fffde6] transition-colors cursor-pointer dark:bg-zinc-950 dark:border-zinc-700">
              <UploadIcon className="h-10 w-10 text-black dark:text-[#ffe600]" />
              <span className="mt-3 font-mono text-sm font-black uppercase tracking-wider text-black dark:text-white">
                {uploading ? "Uploading file..." : "Click or Drag File to Upload"}
              </span>
              <span className="mt-1 font-mono text-xs text-zinc-500">
                Supports JPG, PNG, WEBP, GIF, MP4, WEBM, OGV, MOV (max 15MB for images, 50MB for videos)
              </span>
              <input
                type="file"
                disabled={uploading}
                accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    await handleFileUpload(file, "media", file.type.startsWith("image/") ? "image" : "video");
                  }
                  e.target.value = "";
                }}
              />
            </label>

            {uploadedUrl && (
              <div className="mt-6 border-2 border-black bg-[#ffe600] p-4 text-black">
                <p className="font-mono text-xs font-black uppercase">File URL Generated:</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    readOnly
                    value={uploadedUrl}
                    className="flex-1 border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(uploadedUrl);
                      showStatus("Copied URL to clipboard!");
                    }}
                    className="border-2 border-black bg-black text-white px-3 py-1.5 font-mono text-xs font-bold uppercase cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
