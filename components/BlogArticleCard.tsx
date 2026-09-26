"use client";

import { useRouter } from "next/navigation";
import { BookOpenIcon, CalendarIcon, ArrowRightIcon } from "@/components/icons";
import type { ContentLayout, ContentSection } from "@/lib/portfolio";

export type BlogArticleCardData = {
  title: string;
  excerpt: string;
  slug: string;
  groupSlug: string;
  groupName?: string;
  publishedAt: string;
  content: string;
  thumbnail?: string;
  pictures: string[];
  featured?: boolean;
  layout?: ContentLayout;
  sections?: ContentSection[];
};

type BlogArticleCardProps = {
  article: BlogArticleCardData;
  featured?: boolean;
};

export default function BlogArticleCard({ article, featured = false }: BlogArticleCardProps) {
  const router = useRouter();
  const isFeatured = featured || article.featured === true;
  const layout = article.layout || "standard";

  function open() {
    router.push(`/blog/${article.groupSlug}/${article.slug}`);
  }

  const firstPic = article.thumbnail || (article.pictures && article.pictures.length > 0 ? article.pictures[0] : null);

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
      className={`group flex h-full cursor-pointer flex-col border-2 border-black shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-zinc-500 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff] ${
        isFeatured ? "md:col-span-2 xl:col-span-2" : ""
      } ${layout === "minimal" ? "bg-stone-50 p-4 dark:bg-zinc-950" : layout === "spotlight" ? "bg-white p-7 dark:bg-zinc-900" : "bg-white p-6 dark:bg-zinc-900"} ${
        layout === "spotlight" && !isFeatured ? "md:col-span-2 xl:col-span-2" : ""
      }`}
    >
      <div
        className={`relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-black bg-stone-300 bg-geo-dots dark:border-zinc-500 dark:bg-zinc-700 ${
          isFeatured || layout === "spotlight" ? "h-56 sm:h-72" : layout === "minimal" ? "h-24" : "h-36"
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
        <div className="flex flex-wrap items-center gap-2">
          <span className="border border-black bg-[#ffe600] px-2 py-0.5 text-black dark:border-yellow-400 dark:bg-yellow-500 dark:text-black">
            {article.groupName || article.groupSlug}
          </span>
          {article.featured ? (
            <span className="border border-red-700 bg-red-500 px-2 py-0.5 text-[10px] text-white">Pinned</span>
          ) : null}
        </div>
        <span className="inline-flex items-center gap-1 border border-red-700 bg-red-100 px-2 py-0.5 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          <CalendarIcon className="h-3 w-3" />
          <span>{article.publishedAt}</span>
        </span>
      </div>

      <h3
        className={`mt-3 font-mono font-black uppercase text-black dark:text-white line-clamp-2 ${
          isFeatured || layout === "spotlight" ? "text-2xl sm:text-3xl" : "text-lg"
        }`}
      >
        {article.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-green-700 dark:text-green-300">
        {article.excerpt}
      </p>

      <div className="mt-auto pt-6 border-t-2 border-black dark:border-zinc-700">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-blue-700 group-hover:text-blue-900 dark:text-blue-300 dark:group-hover:text-white">
          <span>Read article</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
