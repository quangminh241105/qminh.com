import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { marked } from "marked";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const portfolio = await getPortfolioContent();

  const article = portfolio.articles.find((item) => item.slug === slug);

  if (!article) {
    notFound();
  }

  const bodyHtml = marked.parse(article.body?.trim() || article.excerpt, { async: false }) as string;

  return (
    <main>
      <section className="hero-gradient border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-sm font-semibold text-brand-600 transition-colors hover:text-brand-500 dark:text-brand-400"
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
        {article.coverImage ? (
          <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 sm:h-96">
            <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
          </div>
        ) : null}

        {article.videoUrl ? (
          <video
            src={article.videoUrl}
            controls
            className="mb-8 w-full rounded-2xl border border-slate-200 dark:border-slate-800"
          />
        ) : null}

        <article
          className="prose prose-slate max-w-none dark:prose-invert prose-a:text-brand-600 dark:prose-a:text-brand-400"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </section>
    </main>
  );
}
