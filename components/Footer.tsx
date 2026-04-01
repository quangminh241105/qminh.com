import Link from "next/link";
import { getPortfolioContent } from "@/lib/portfolio-db";

export default async function Footer() {
  const portfolio = await getPortfolioContent();

  return (
    <footer className="mt-20 border-t border-slate-200 bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{portfolio.name}</p>
          <p className="text-sm text-slate-600">{portfolio.profession} • {portfolio.location}</p>
        </div>

        <ul className="flex flex-wrap items-center gap-4">
          {portfolio.socialLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-brand-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
