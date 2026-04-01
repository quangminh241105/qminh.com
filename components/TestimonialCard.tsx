import type { Testimonial } from "@/lib/portfolio";

type TestimonialCardProps = {
  testimonial: Testimonial;
};

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-slate-700">&ldquo;{testimonial.quote}&rdquo;</p>
      <p className="mt-4 font-semibold text-slate-800">{testimonial.author}</p>
      <p className="text-sm text-slate-500">{testimonial.role}</p>
    </article>
  );
}
