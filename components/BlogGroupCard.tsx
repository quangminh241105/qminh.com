"use client";

import { useRouter } from "next/navigation";
import { FolderIcon, ArrowRightIcon } from "@/components/icons";
import type { PortfolioContent } from "@/lib/portfolio-db";

type BlogGroupCardProps = {
  group: PortfolioContent["articleGroups"][number];
};

export default function BlogGroupCard({ group }: BlogGroupCardProps) {
  const router = useRouter();

  function open() {
    router.push(`/blog/${group.slug}`);
  }

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
      className="group flex h-full cursor-pointer flex-col border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-zinc-500 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff]"
    >
      <div className="flex h-36 shrink-0 items-center justify-center border-2 border-black bg-stone-300 bg-geo-dots dark:border-zinc-500 dark:bg-zinc-700">
        <div className="flex h-14 w-14 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]">
          <FolderIcon className="h-7 w-7" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-zinc-300">
        <span className="border border-black bg-[#ffe600] px-2 py-0.5 text-black dark:border-yellow-400 dark:bg-yellow-500 dark:text-black">
          Category
        </span>
      </div>

      <h3 className="mt-3 font-mono text-lg font-black uppercase text-black dark:text-white">
        {group.name}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-green-700 dark:text-green-300">
        {group.description}
      </p>

      <div className="mt-auto pt-6 border-t-2 border-black dark:border-zinc-700">
        <span className="inline-flex items-center gap-1.5 font-mono text-xs font-black uppercase tracking-wider text-blue-700 group-hover:text-blue-900 dark:text-blue-300 dark:group-hover:text-white">
          <span>Browse posts</span>
          <ArrowRightIcon className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  );
}
