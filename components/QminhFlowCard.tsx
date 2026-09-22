"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayersIcon, GitHubIcon, ExternalLinkIcon } from "@/components/icons";

const REPO_URL = "https://github.com/quangminh241105/qminh.com";
const TAGS = ["CI/CD", "Docker", "Jenkins"];

export default function QminhFlowCard() {
  const router = useRouter();

  function open() {
    router.push("/projects/qminh-flow");
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
      className="group flex h-full cursor-pointer flex-col border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000000] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#ffffff] dark:hover:shadow-[7px_7px_0px_#ffffff]"
    >
      <div className="flex h-40 shrink-0 items-center justify-center border-2 border-black bg-red-500 bg-geo-dots dark:border-blue-400">
        <div className="flex h-12 w-12 items-center justify-center border-2 border-black bg-white text-black shadow-[2px_2px_0px_#000000]">
          <LayersIcon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
        <span className="border border-black bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-200">
          Behind The Scenes
        </span>
      </div>

      <h3 className="mt-3 font-mono text-lg font-black uppercase text-black dark:text-white line-clamp-2">
        How qminh.com Ships Itself
      </h3>
      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400 line-clamp-3">
        An interactive walkthrough of the real CI/CD pipeline, tech stack, and infrastructure behind this website.
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TAGS.map((tag) => (
          <span
            key={tag}
            className="border border-black bg-white px-2 py-0.5 font-mono text-[11px] font-bold text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between pt-5 font-mono text-xs font-bold uppercase tracking-wider">
        <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-300">
          <span>Explore Pipeline</span>
          <ExternalLinkIcon className="h-3.5 w-3.5" />
        </span>
        <Link
          href={REPO_URL}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          className="relative z-10 inline-flex items-center gap-1 text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon className="h-3.5 w-3.5" />
          <span>Source</span>
        </Link>
      </div>
    </article>
  );
}
