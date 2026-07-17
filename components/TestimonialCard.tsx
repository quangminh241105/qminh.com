import type { Testimonial } from "@/lib/portfolio";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-slate-700 dark:text-slate-300">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="mt-4 font-semibold text-slate-800 dark:text-slate-100">{testimonial.author}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.role}</p>
    </article>
  );
}
