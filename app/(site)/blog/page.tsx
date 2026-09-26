import SectionTitle from "@/components/SectionTitle";
import BlogBrowser from "@/components/BlogBrowser";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Quang Minh",
  description: "Notes and practical engineering thoughts from Quang Minh.",
};

type PageProps = {
  searchParams?: Promise<{ group?: string }>;
};

export default async function BlogPage({ searchParams }: PageProps) {
  const portfolio = await getPortfolioContent();
  const filters = searchParams ? await searchParams : {};
  const groupNames = new Map(portfolio.articleGroups.map((group) => [group.slug, group.name]));
  const articles = portfolio.articles.map((article) => ({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    groupSlug: article.groupSlug,
    groupName: groupNames.get(article.groupSlug),
    publishedAt: article.publishedAt,
    content: article.content,
    thumbnail: article.thumbnail,
    pictures: article.pictures,
    featured: article.featured,
    layout: article.layout,
  }));
  const groups = portfolio.articleGroups.map((group) => ({ name: group.name, slug: group.slug }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Blog"
        title="Notes, tutorials, and engineering thoughts"
        description="Browse every note in one place. Search, filter, and sort the archive to find your next read."
        tone="neutral"
      />
      <BlogBrowser articles={articles} groups={groups} initialGroup={filters.group || "all"} />
    </main>
  );
}
