import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import SkillsChart from "@/components/SkillsChart";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { UserIcon, SparklesIcon } from "@/components/icons";

export const metadata = {
  title: "About Me | Quang Minh",
};

export default async function AboutPage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="About Me"
        title="Software Engineering & Practical Architecture"
        description={portfolio.about.intro}
      />

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {/* Background Box */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[5px_5px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[5px_5px_0px_#000000]">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
            <span className="flex h-7 w-7 items-center justify-center border border-black bg-blue-600 text-white">
              <UserIcon className="h-4 w-4" />
            </span>
            <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
              Background & Focus
            </h3>
          </div>
          <p className="mt-4 font-sans text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
            {portfolio.about.background}
          </p>
        </div>

        {/* Interests Box */}
        <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-[5px_5px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[5px_5px_0px_#000000]">
          <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
            <span className="flex h-7 w-7 items-center justify-center border border-black bg-green-500 text-black">
              <SparklesIcon className="h-4 w-4" />
            </span>
            <h3 className="font-mono text-base font-black uppercase text-black dark:text-white">
              Core Technical Interests
            </h3>
          </div>
          <ul className="mt-4 grid gap-2.5">
            {portfolio.about.interests.map((interest) => (
              <li
                key={interest}
                className="flex items-center gap-2 border border-black bg-zinc-50 px-3 py-2 font-mono text-xs font-bold uppercase text-black dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200"
              >
                <span className="h-2 w-2 bg-red-500 border border-black" />
                <span>{interest}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Skills Section */}
      <section className="mt-16">
        <SectionTitle
          eyebrow="Skills"
          title="Tech Stack & Tools"
          description="A visual overview of the technologies I use for production builds and coursework."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <SkillsChart skills={portfolio.skills} />
        </div>
      </section>

      <div className="mt-12 flex">
        <Button href="/resume" variant="primary">
          View Full Resume →
        </Button>
      </div>
    </main>
  );
}
