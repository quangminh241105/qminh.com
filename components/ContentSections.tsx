import { marked } from "marked";
import type { ContentSection } from "@/lib/portfolio";

type ContentSectionsProps = {
  sections: ContentSection[];
};

function SectionImage({ section }: { section: ContentSection }) {
  if (!section.image) return null;

  return (
    <div className="overflow-hidden border-2 border-black bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={section.image} alt={section.imageAlt || section.heading || "Section image"} className="h-auto max-h-[32rem] w-full object-cover" />
    </div>
  );
}

function SectionBody({ section }: { section: ContentSection }) {
  const bodyHtml = marked.parse(section.body?.trim() || "", { async: false }) as string;

  return bodyHtml ? (
    <div
      className="prose prose-slate max-w-none dark:prose-invert prose-headings:font-mono prose-headings:uppercase prose-a:text-blue-700 dark:prose-a:text-blue-300"
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  ) : null;
}

export default function ContentSections({ sections }: ContentSectionsProps) {
  const orderedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-8">
      {orderedSections.map((section, index) => {
        const hasImage = Boolean(section.image);
        const isQuote = section.layout === "quote";
        const isCallout = section.layout === "callout";
        const isTwoColumn = section.layout === "image-left" || section.layout === "image-right";

        return (
          <section
            key={section.id || index}
            id={`content-section-${section.id || index}`}
            className={`border-2 border-black p-6 shadow-[4px_4px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000] ${
              isQuote ? "bg-stone-100 dark:bg-zinc-950" : isCallout ? "border-l-8 bg-[#fffde6] dark:bg-zinc-950" : "bg-white"
            }`}
          >
            {section.heading ? (
              <h2 className="mb-5 font-mono text-xl font-black uppercase tracking-tight text-black dark:text-white">
                {section.heading}
              </h2>
            ) : null}

            {isQuote ? (
              <blockquote className="border-l-4 border-blue-600 pl-5 text-lg font-medium leading-8 text-zinc-700 dark:border-blue-400 dark:text-zinc-300">
                <SectionBody section={section} />
              </blockquote>
            ) : isTwoColumn && hasImage ? (
              <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
                {section.layout === "image-left" ? <SectionImage section={section} /> : null}
                <SectionBody section={section} />
                {section.layout === "image-right" ? <SectionImage section={section} /> : null}
              </div>
            ) : (
              <div className={section.layout === "image-top" ? "space-y-6" : "space-y-5"}>
                {section.layout === "image-top" ? <SectionImage section={section} /> : null}
                <SectionBody section={section} />
                {section.layout !== "image-top" ? <SectionImage section={section} /> : null}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
