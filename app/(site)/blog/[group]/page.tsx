import Link from "next/link";
import { notFound } from "next/navigation";
import SectionTitle from "@/components/SectionTitle";
import BlogArticleCard from "@/components/BlogArticleCard";
import { getPortfolioContent } from "@/lib/portfolio-db";

type PageProps = {
  params: Promise<{ group: string }>;
};

export default async function BlogGroupPage({ params }: PageProps) {
  const { group: groupSlug } = await params;
  const portfolio = await getPortfolioContent();

  const group = portfolio.articleGroups.find((item) => item.slug === groupSlug);
  if (!group) {
    notFound();
  }

  const articles = portfolio.articles.filter((article) => article.groupSlug === groupSlug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/blog"
        className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300"
      >
        Back to blog groups
      </Link>

      <div className="mt-6">
        <SectionTitle eyebrow="Blog Group" title={group.name} description={group.description} />
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {articles.map((article) => (
          <BlogArticleCard key={article.slug} article={article} />
        ))}
      </section>

      {articles.length === 0 ? (
        <p className="mt-8 text-sm text-slate-500 dark:text-slate-400">No posts in this group yet.</p>
      ) : null}
    </main>
  );
}
