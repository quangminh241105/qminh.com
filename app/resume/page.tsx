import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function ResumePage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Resume"
        title="Education and experience timeline"
        description="An interactive overview of my progression in IT and software development."
      />

      <section className="mt-8 grid gap-4">
        {portfolio.resume.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{item.period}</p>
            <h3 className="mt-1 text-xl font-semibold text-slate-800">{item.title}</h3>
            <p className="mt-3 text-slate-600">{item.details}</p>
          </article>
        ))}
      </section>

      <div className="mt-8">
        <Button href="/resume.txt" variant="secondary" className="border-brand-600 text-brand-600 hover:bg-brand-50">
          Download Resume (TXT)
        </Button>
      </div>
    </main>
  );
}
