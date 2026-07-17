import Link from "next/link";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function BlogPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Blog"
        title="Notes, tutorials, and engineering thoughts"
        description="Optional section that can scale into full MDX articles later."
      />

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {portfolio.articles.map((article) => (
          <article
            key={article.slug}
            className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">{article.publishedAt}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-800 dark:text-slate-100">{article.title}</h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400">{article.excerpt}</p>
            <Link
              href={`/blog/${article.slug}`}
              className="mt-4 inline-flex text-sm font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400"
            >
              Read article
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
