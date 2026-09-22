import Link from "next/link";
import { getPortfolioContent } from "@/lib/portfolio-db";
import { GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon, TerminalIcon } from "@/components/icons";
import { getSocialHoverClasses } from "@/components/social";
import RetroIconLayer from "@/components/RetroIconLayer";

export default async function Footer() {
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
    <footer className="collab-pixel-bg mt-20 border-t-2 border-black py-10 dark:border-blue-400">
      <RetroIconLayer />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 border-2 border-black bg-white p-4 sm:p-5 lg:p-6 dark:border-blue-400 dark:bg-black md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-blue-600 border border-black" />
            <p className="font-mono text-sm font-black uppercase tracking-wider text-black dark:text-blue-300">
              {portfolio.name}
            </p>
          </div>
          <p className="mt-1 font-mono text-xs text-zinc-700 dark:text-zinc-400">
            {portfolio.profession} • {portfolio.location}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {portfolio.socialLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:shadow-[2px_2px_0px_#000000] dark:hover:border-blue-400 dark:hover:shadow-[3px_3px_0px_#000000] ${getSocialHoverClasses(link.label)}`}
            >
              {getSocialIcon(link.label)}
              <span>{link.label}</span>
            </Link>
          ))}

        </div>
      </div>
    </footer>
  );
}
