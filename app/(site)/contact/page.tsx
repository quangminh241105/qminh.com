import ContactForm from "@/components/ContactForm";
import SectionTitle from "@/components/SectionTitle";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, TerminalIcon, ExternalLinkIcon } from "@/components/icons";
import { getSocialHoverClasses } from "@/components/social";

export const metadata = {
  title: "Contact | Quang Minh",
};

export default async function ContactPage() {
  const portfolio = await getPortfolioContent();

  const getSocialIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("git")) return <GitHubIcon className="h-4 w-4" />;
    if (l.includes("link")) return <LinkedInIcon className="h-4 w-4" />;
    if (l.includes("instagram")) return <InstagramIcon className="h-4 w-4" />;
    if (l.includes("mail") || l.includes("email")) return <MailIcon className="h-4 w-4" />;
    return <TerminalIcon className="h-4 w-4" />;
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionTitle
        eyebrow="Contact"
        title="Let us build something great"
        description="Reach out for internships, freelance engineering work, or open-source collaboration."
      />

      <section className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <ContactForm />

        <aside className="border-2 border-black bg-white p-6 sm:p-8 shadow-[4px_4px_0px_#000000] dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b-2 border-black pb-3 dark:border-zinc-700">
              <span className="h-2 w-2 bg-green-500 border border-black" />
              <h3 className="font-mono text-base font-black uppercase tracking-wider text-black dark:text-white">
                Direct Channels
              </h3>
            </div>

            <ul className="mt-6 space-y-3">
              {portfolio.socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-between border-2 border-black bg-zinc-50 p-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 ${getSocialHoverClasses(link.label)}`}
                  >
                    <span className="flex items-center gap-2">
                      {getSocialIcon(link.label)}
                      <span>{link.label}</span>
                    </span>
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 border-t-2 border-black pt-4 dark:border-zinc-700 font-mono text-xs text-zinc-600 dark:text-zinc-400">
            <p>⚡ Response time: usually within 24 hours.</p>
            <p className="mt-1">📍 Location: {portfolio.location}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
