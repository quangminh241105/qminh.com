import Button from "@/components/Button";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { BriefcaseIcon, CalendarIcon } from "@/components/icons";

export const metadata = {
  title: "Resume & Experience | Quang Minh",
};

export default async function ResumePage() {
  const portfolio = await getPortfolioContent();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Resume"
        title="Education & Experience Timeline"
        description="A structured chronicle of my studies, technical internships, and software development milestones."
      />

      <section className="mt-10 space-y-4">
        {portfolio.resume.map((item, idx) => (
          <article
            key={item.title || idx}
            className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]"
          >
            <div className="flex-1">
              <span className="inline-flex items-center gap-1.5 border border-black bg-[#ffe600] px-2.5 py-0.5 font-mono text-xs font-black uppercase text-black">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>{item.period}</span>
              </span>

              <h3 className="mt-3 font-mono text-xl font-black uppercase tracking-tight text-black dark:text-white">
                {item.title}
              </h3>

              <p className="mt-2 text-base text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed">
                {item.details}
              </p>
            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-green-500 text-black dark:border-zinc-700 dark:bg-zinc-800 dark:text-green-300">
              <BriefcaseIcon className="h-5 w-5" />
            </div>
          </article>
        ))}
      </section>

      <div className="mt-10 flex">
        <Button
          href="/resume.txt"
          variant="secondary"
          className="dark:shadow-[3px_3px_0px_#ffffff] dark:hover:shadow-[5px_5px_0px_#ffffff]"
        >
          Download Resume (TXT)
        </Button>
      </div>
    </main>
  );
}
