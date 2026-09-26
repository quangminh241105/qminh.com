"use client";

import type { ContentSection, ContentSectionLayout, ContentSectionPlacement } from "@/lib/portfolio";
import { ImageIcon, PlusIcon, TrashIcon } from "@/components/icons";

type AdminSectionBuilderProps = {
  sections: ContentSection[];
  onChange: (sections: ContentSection[]) => void;
  uploadImage: (file: File, folder: string) => Promise<string | null>;
  uploadFolder: string;
};

const layoutOptions: Array<{ value: ContentSectionLayout; label: string }> = [
  { value: "full", label: "Full width — text then image" },
  { value: "image-top", label: "Image top — image then text" },
  { value: "image-left", label: "Image left — two columns" },
  { value: "image-right", label: "Image right — two columns" },
  { value: "quote", label: "Quote — highlighted reading block" },
  { value: "callout", label: "Callout — yellow information panel" },
];

const placementOptions: Array<{ value: ContentSectionPlacement; label: string }> = [
  { value: "before-content", label: "Before main content" },
  { value: "after-content", label: "After main content" },
];

function createSection(): ContentSection {
  return {
    id: `section-${Date.now()}`,
    heading: "",
    body: "",
    image: "",
    imageAlt: "",
    layout: "full",
    placement: "before-content",
  };
}

export default function AdminSectionBuilder({ sections, onChange, uploadImage, uploadFolder }: AdminSectionBuilderProps) {
  const updateSection = (index: number, changes: Partial<ContentSection>) => {
    const next = [...sections];
    next[index] = { ...next[index], ...changes };
    onChange(next);
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <section className="md:col-span-2 border-2 border-black bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-3 dark:border-zinc-700">
        <div>
          <p className="font-mono text-xs font-black uppercase text-black dark:text-[#ffe600]">Custom Content Sections</p>
          <p className="mt-1 max-w-3xl font-mono text-[11px] leading-5 text-zinc-600 dark:text-zinc-400">
            Build the detail page piece by piece. Reorder sections, decide where they sit around the main Markdown, choose a visual layout, and attach a dedicated image.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...sections, createSection()])}
          className="inline-flex items-center gap-1 border-2 border-black bg-[#ffe600] px-3 py-1.5 font-mono text-[11px] font-black uppercase text-black shadow-[2px_2px_0px_#000000]"
        >
          <PlusIcon className="h-3.5 w-3.5" />
          Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="mt-4 border-2 border-dashed border-black p-6 text-center font-mono text-xs font-bold uppercase text-zinc-500 dark:border-zinc-700">
          No custom sections yet. The existing main content will still render normally.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {sections.map((section, index) => (
            <article key={section.id || index} className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000000] dark:border-zinc-700 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-3 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center border border-black bg-blue-600 font-mono text-[11px] font-black text-white">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs font-black uppercase text-black dark:text-white">Content Section</span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveSection(index, -1)} disabled={index === 0} className="border border-black px-2 py-1 font-mono text-[10px] font-bold uppercase disabled:opacity-30">↑</button>
                  <button type="button" onClick={() => moveSection(index, 1)} disabled={index === sections.length - 1} className="border border-black px-2 py-1 font-mono text-[10px] font-bold uppercase disabled:opacity-30">↓</button>
                  <button type="button" onClick={() => onChange(sections.filter((_, itemIndex) => itemIndex !== index))} className="ml-1 border border-black bg-red-100 p-1.5 text-red-700" aria-label={`Delete section ${index + 1}`}>
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="block font-mono text-[11px] font-bold uppercase text-black dark:text-zinc-300">Section Heading</label>
                  <input value={section.heading} onChange={(event) => updateSection(index, { heading: event.target.value })} placeholder="e.g. Why this architecture works" className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-black dark:text-zinc-300">Position around main content</label>
                  <select value={section.placement} onChange={(event) => updateSection(index, { placement: event.target.value as ContentSectionPlacement })} className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
                    {placementOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-mono text-[11px] font-bold uppercase text-black dark:text-zinc-300">Text and image format</label>
                  <select value={section.layout} onChange={(event) => updateSection(index, { layout: event.target.value as ContentSectionLayout })} className="mt-1 w-full border-2 border-black bg-white p-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-white">
                    {layoutOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block font-mono text-[11px] font-bold uppercase text-black dark:text-zinc-300">Section Markdown</label>
                  <textarea value={section.body} onChange={(event) => updateSection(index, { body: event.target.value })} rows={6} placeholder="Write paragraphs, lists, links, code, or headings in Markdown..." className="mt-1 w-full border-2 border-black bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-white" />
                </div>
                <div className="md:col-span-2 border border-black bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-1.5 font-mono text-[11px] font-black uppercase text-black dark:text-[#ffe600]">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Section Image
                    </label>
                    <label className="cursor-pointer border border-black bg-white px-2 py-1 font-mono text-[10px] font-bold uppercase hover:bg-[#ffe600]">
                      Upload Image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={async (event) => {
                          const file = event.target.files?.[0];
                          if (file) {
                            const url = await uploadImage(file, `${uploadFolder}/${section.id}`);
                            if (url) updateSection(index, { image: url, imageAlt: section.imageAlt || file.name });
                          }
                          event.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input value={section.image || ""} onChange={(event) => updateSection(index, { image: event.target.value })} placeholder="Paste an image URL or upload one" className="flex-1 border border-black bg-white p-1.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    {section.image ? <button type="button" onClick={() => updateSection(index, { image: "" })} className="border border-black bg-red-100 px-2 font-mono text-[10px] font-bold uppercase text-red-700">Remove</button> : null}
                  </div>
                  <div className="mt-2 grid gap-2 md:grid-cols-2">
                    <input value={section.imageAlt || ""} onChange={(event) => updateSection(index, { imageAlt: event.target.value })} placeholder="Image alt text" className="border border-black bg-white p-1.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-white" />
                    <p className="self-center font-mono text-[10px] leading-4 text-zinc-500">Use descriptive alt text for accessibility. The selected layout controls the image position.</p>
                  </div>
                  {section.image ? (
                    <div className="mt-3 w-fit border border-black bg-white p-1 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={section.image} alt={section.imageAlt || "Section preview"} className="h-24 w-40 object-cover" />
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
