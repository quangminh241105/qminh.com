import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function AboutPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="About Me"
        title="A curious IT student focused on practical engineering"
        description={portfolio.about.intro}
      />

      <section className="mt-10 grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Background</h3>
          <p className="mt-3 text-slate-600 dark:text-slate-400">{portfolio.about.background}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Interests</h3>
          <ul className="mt-3 grid gap-2 text-slate-600 dark:text-slate-400">
            {portfolio.about.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-lg bg-card px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle
          eyebrow="Skills"
          title="Tech stack and tools"
          description="A visual overview of the technologies I use for coursework and personal projects."
        />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <SkillsChart skills={portfolio.skills} />
        </div>
      </section>

      <div className="mt-10">
        <Button href="/resume">View Full Resume</Button>
      </div>
    </main>
  );
}
