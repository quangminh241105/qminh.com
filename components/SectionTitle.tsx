type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <div className="mb-3 inline-flex items-center gap-2">
          <span className="h-2 w-2 bg-red-500 border border-black dark:border-red-400" />
          <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] bg-[#ffe600] text-black px-2 py-0.5 border border-black dark:bg-[#ffe600] dark:border-black">
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
        <span className="h-1 w-8 bg-black dark:bg-blue-400" />
        <span className="h-1 w-2 bg-green-500 dark:bg-green-400" />
        <span className="h-1 w-1 bg-black dark:bg-blue-400" />
      </div>
    </div>
  );
}
