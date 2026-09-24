type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  tone?: "default" | "neutral";
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  tone = "default",
}: SectionTitleProps) {
  const neutral = tone === "neutral";

  return (
    <div className={neutral ? "max-w-5xl" : "max-w-2xl"}>
      {eyebrow ? (
        <div className="mb-3 inline-flex items-center gap-2">
          <span className={`h-2 w-2 border border-black ${neutral ? "bg-stone-400 dark:border-zinc-500 dark:bg-zinc-500" : "bg-red-500 dark:border-red-400"}`} />
          <span className={`border border-black px-2 py-0.5 font-mono text-xs font-bold uppercase tracking-[0.2em] ${neutral ? "bg-stone-100 text-stone-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100" : "bg-[#ffe600] text-black dark:bg-[#ffe600] dark:border-black"}`}>
            {eyebrow}
          </span>
        </div>
      ) : null}
      <h2 className="text-3xl font-black uppercase tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400 font-sans">{description}</p>
      ) : null}
      <div className="mt-4 flex items-center gap-1.5">
        <span className={`h-1 w-8 ${neutral ? "bg-stone-700 dark:bg-zinc-300" : "bg-black dark:bg-blue-400"}`} />
        <span className={`h-1 w-2 ${neutral ? "bg-stone-400 dark:bg-zinc-500" : "bg-green-500 dark:bg-green-400"}`} />
        <span className={`h-1 w-1 ${neutral ? "bg-stone-700 dark:bg-zinc-300" : "bg-black dark:bg-blue-400"}`} />
      </div>
    </div>
  );
}
