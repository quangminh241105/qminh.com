"use client";

import { useRouter } from "next/navigation";
import { BookOpenIcon, CalendarIcon, ArrowRightIcon } from "@/components/icons";

export type BlogArticleCardData = {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug: string;
  groupName?: string;
  publishedAt: string;
  content: string;
  pictures: string[];
};

type BlogArticleCardProps = {
  article: BlogArticleCardData;
  featured?: boolean;
};

export default function BlogArticleCard({ article, featured = false }: BlogArticleCardProps) {
  const router = useRouter();

  function open() {
    router.push(`/blog/${article.groupSlug}/${article.slug}`);
  }

  const firstPic = article.pictures && article.pictures.length > 0 ? article.pictures[0] : null;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
      }}
      className={`group flex h-full cursor-pointer flex-col border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-zinc-500 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff] ${
        featured ? "md:col-span-2 xl:col-span-2" : ""
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-stone-300 bg-geo-dots dark:border-zinc-500 dark:bg-zinc-700 ${
          featured ? "h-56 sm:h-72" : "h-36"
        }`}
      >
        {firstPic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstPic} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]">
            <BookOpenIcon className="h-7 w-7" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
        <span className="border border-black bg-stone-200 px-2 py-0.5 text-stone-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-100">
          {article.groupName || article.groupSlug}
        </span>
        <span className="inline-flex items-center gap-1 border border-black bg-stone-100 px-2 py-0.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <CalendarIcon className="h-3 w-3" />
          <span>{article.publishedAt}</span>
        </span>
      </div>

      <h3
        className={`mt-3 font-mono font-black uppercase text-black dark:text-white line-clamp-2 ${
          featured ? "text-2xl sm:text-3xl" : "text-lg"
        }`}
      >
        {article.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 line-clamp-3">
        {article.excerpt}
      </p>

      <div className="mt-auto pt-6 border-t-2 border-black dark:border-zinc-700">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-stone-700 group-hover:text-black dark:text-zinc-300 dark:group-hover:text-white">
          <span>Read article</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
