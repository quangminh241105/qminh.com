import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { marked } from "marked";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ group: string; slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await getPortfolioContent();
  const article = portfolio.articles.find((item) => item.slug === slug);

  return article
    ? { title: `${article.title} | Quang Minh`, description: article.excerpt }
    : { title: "Article not found | Quang Minh" };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { group: groupSlug, slug } = await params;
  const portfolio = await getPortfolioContent();

  const article = portfolio.articles.find((item) => item.slug === slug && item.groupSlug === groupSlug);

  if (!article) {
    notFound();
  }

  const bodyHtml = marked.parse(article.content?.trim() || article.excerpt, { async: false }) as string;

  return (
    <main>
      <section className="hero-gradient border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href={`/blog/${groupSlug}`}
            className="text-sm font-semibold text-blue-700 transition-colors hover:text-blue-900 dark:text-blue-300"
          >
            Back to blog
          </Link>

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">{article.publishedAt}</p>
            <SectionTitle title={article.title} description={article.excerpt} />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {article.pictures.length > 0 ? (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 sm:h-96">
            <Image src={article.pictures[0]} alt={article.title} fill className="object-cover" />
          </div>
        ) : null}

        {article.videos.length > 0 ? (
          <div className="mb-8 space-y-4">
            {article.videos.map((videoUrl) => (
              <video
                key={videoUrl}
                src={videoUrl}
                controls
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800"
              />
            ))}
          </div>
        ) : null}

        <article
          className="prose prose-slate max-w-none dark:prose-invert prose-a:text-blue-700 dark:prose-a:text-blue-300"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </section>
    </main>
  );
}
