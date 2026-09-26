import type { Metadata } from "next";
import SectionTitle from "@/components/SectionTitle";
import { ImageIcon } from "@/components/icons";
import { getPortfolioContent } from "@/lib/portfolio-db";

export const metadata: Metadata = {
  title: "Gallery | Quang Minh",
  description: "Grouped snapshots, experiments, and visual notes from Quang Minh.",
};

export default async function GalleryPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Gallery"
        title="Snapshots, experiments, and little wins"
        description="A visual archive grouped like a personal Instagram feed: each collection has its own story, captions, and rhythm."
        tone="neutral"
      />

      {portfolio.galleryGroups.length > 0 ? (
        <div className="mt-10 space-y-14">
          {portfolio.galleryGroups.map((group) => (
            <section key={group.slug} aria-labelledby={`gallery-${group.slug}`}>
              <div className="mb-5 flex flex-col gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-end sm:justify-between dark:border-zinc-700">
                <div>
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-blue-700 dark:text-blue-300">
                    /{group.slug}
                  </p>
                  <h2 id={`gallery-${group.slug}`} className="mt-1 font-mono text-2xl font-black uppercase text-black dark:text-white">
                    {group.title}
                  </h2>
                  {group.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">{group.description}</p>
                  ) : null}
                </div>
                <span className="inline-flex w-fit items-center gap-1.5 border-2 border-black bg-[#ffe600] px-2.5 py-1 font-mono text-[10px] font-black uppercase text-black shadow-[2px_2px_0px_#000000]">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {group.images.length} frame{group.images.length === 1 ? "" : "s"}
                </span>
              </div>

              {group.images.length > 0 ? (
                <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
                  {group.images.map((image, index) => (
                    <figure key={`${image.url}-${index}`} className="group relative mb-3 break-inside-avoid overflow-hidden border-2 border-black bg-zinc-200 shadow-[3px_3px_0px_#000000] dark:border-zinc-600 dark:bg-zinc-800 dark:shadow-[3px_3px_0px_#ffffff]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.alt || `${group.title} image ${index + 1}`}
                        className="block h-auto w-full grayscale-[15%] transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
                      />
                      {image.caption ? (
                        <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/85 px-3 py-2 font-mono text-[11px] leading-4 text-white transition-transform duration-200 group-hover:translate-y-0">
                          {image.caption}
                        </figcaption>
                      ) : null}
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-black p-8 text-center font-mono text-xs font-bold uppercase text-zinc-500 dark:border-zinc-700">
                  This collection is ready for its first image.
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="mt-10 border-2 border-dashed border-black p-12 text-center dark:border-zinc-700">
          <ImageIcon className="mx-auto h-10 w-10" />
          <p className="mt-4 font-mono text-sm font-black uppercase text-black dark:text-white">Gallery is waiting for uploads.</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Create your first image group from the admin dashboard.</p>
        </div>
      )}
    </main>
  );
}
