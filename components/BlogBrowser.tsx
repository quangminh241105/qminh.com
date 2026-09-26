"use client";

import { useMemo, useState } from "react";
import BlogArticleCard, { type BlogArticleCardData } from "@/components/BlogArticleCard";
import { BookOpenIcon, SlidersIcon } from "@/components/icons";

type BlogGroupOption = {
  name: string;
  slug: string;
};

type BlogBrowserProps = {
  articles: BlogArticleCardData[];
  groups: BlogGroupOption[];
  initialGroup?: string;
};

type SortMode = "newest" | "oldest" | "title-az" | "title-za";

export default function BlogBrowser({ articles, groups, initialGroup = "all" }: BlogBrowserProps) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(initialGroup);
  const [year, setYear] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");

  const years = useMemo(
    () => Array.from(new Set(articles.map((article) => article.publishedAt.slice(0, 4)))).filter(Boolean).sort().reverse(),
    [articles],
  );

  const visibleArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = articles.filter((article) => {
      const matchesQuery = !normalizedQuery || `${article.title} ${article.excerpt} ${article.content}`.toLowerCase().includes(normalizedQuery);
      const matchesGroup = group === "all" || article.groupSlug === group;
      const matchesYear = year === "all" || article.publishedAt.startsWith(year);
      return matchesQuery && matchesGroup && matchesYear;
    });

    return filtered.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (sort === "title-az") return a.title.localeCompare(b.title);
      if (sort === "title-za") return b.title.localeCompare(a.title);
      const aTime = new Date(a.publishedAt).getTime() || 0;
      const bTime = new Date(b.publishedAt).getTime() || 0;
      return sort === "oldest" ? aTime - bTime : bTime - aTime;
    });
  }, [articles, group, query, sort, year]);

  const hasPinnedArticles = visibleArticles.some((article) => article.featured);

  const resetFilters = () => {
    setQuery("");
    setGroup("all");
    setYear("all");
    setSort("newest");
  };

  return (
    <section className="mt-8">
      <div className="border-2 border-black bg-stone-100 p-4 shadow-[4px_4px_0px_#000000] dark:border-zinc-600 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3 dark:border-zinc-700">
          <div className="flex items-center gap-2 font-mono text-xs font-black uppercase text-black dark:text-white">
            <SlidersIcon className="h-4 w-4" />
            <span>Blog browser / {visibleArticles.length} result{visibleArticles.length === 1 ? "" : "s"}</span>
          </div>
          <button type="button" onClick={resetFilters} className="border-2 border-red-700 bg-red-100 px-3 py-1.5 font-mono text-[11px] font-black uppercase text-red-900 shadow-[2px_2px_0px_#000000] transition-transform hover:-translate-y-0.5 dark:border-red-500 dark:bg-red-950 dark:text-red-200">
            Reset filters
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <label className="lg:col-span-2">
            <span className="sr-only">Search blog</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title or excerpt..." className="w-full border-2 border-black bg-white p-2.5 font-mono text-xs text-black outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-stone-500" />
          </label>
          <label>
            <span className="sr-only">Filter by group</span>
            <select value={group} onChange={(event) => setGroup(event.target.value)} className="w-full border-2 border-black bg-white p-2.5 font-mono text-xs text-black outline-none">
              <option value="all">All blog groups</option>
              {groups.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort blog</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className="w-full border-2 border-black bg-white p-2.5 font-mono text-xs text-black outline-none">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-az">Title A-Z</option>
              <option value="title-za">Title Z-A</option>
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="font-mono text-[11px] font-bold uppercase text-black dark:text-zinc-300">
            Year
            <select value={year} onChange={(event) => setYear(event.target.value)} className="ml-2 border-2 border-black bg-white px-2 py-1.5 font-mono text-xs font-normal text-black">
              <option value="all">All years</option>
              {years.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <span className="font-mono text-[11px] font-bold uppercase text-stone-600 dark:text-zinc-400">Newest matching note gets the big card.</span>
        </div>
      </div>

      {visibleArticles.length > 0 ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleArticles.map((article, index) => (
            <BlogArticleCard
              key={article.slug}
              article={article}
              featured={hasPinnedArticles ? article.featured : index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 border-2 border-dashed border-black p-10 text-center dark:border-zinc-700">
          <BookOpenIcon className="mx-auto h-8 w-8" />
          <p className="mt-3 font-mono text-sm font-bold uppercase">No notes match those filters.</p>
          <button type="button" onClick={resetFilters} className="mt-4 font-mono text-xs font-bold uppercase underline">Show all notes</button>
        </div>
      )}
    </section>
  );
}
