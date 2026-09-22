import type { Testimonial } from "@/lib/portfolio";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="relative flex flex-col justify-between border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
      <div className="absolute top-3 right-3 font-mono font-black text-3xl text-zinc-300 dark:text-zinc-700 select-none">
        &ldquo;
      </div>
      <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <div className="mt-6 border-t-2 border-black pt-4 dark:border-zinc-700">
        <p className="font-mono text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
          {testimonial.author}
        </p>
        <p className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
          {testimonial.role}
        </p>
      </div>
    </article>
  );
}
