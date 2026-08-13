import Link from "next/link";
import { getPortfolioContent } from "@/lib/portfolio-db";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import NavLink from "@/components/NavLink";
import { ArrowUpRight, FileText } from "lucide-react";

export default async function Navbar() {
  const portfolio = await getPortfolioContent();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 font-mono text-sm text-white shadow-sm transition-transform group-hover:-rotate-3 dark:bg-white dark:text-slate-950">
            QM
          </span>
          <span>{portfolio.name}</span>
        </Link>

        <ul className="hidden items-center gap-5 md:flex">
          {portfolio.navItems.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href}>{item.label}</NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={portfolio.resumeFile?.url ?? "/resume"}
            download={portfolio.resumeFile?.name}
            className="hidden items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 sm:inline-flex dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-brand-700 dark:hover:bg-brand-950/30 dark:hover:text-brand-300"
          >
            <FileText className="h-3.5 w-3.5" />
            CV
          </Link>
          <Link
            href="/contact"
            className="hidden items-center gap-1.5 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:inline-flex dark:bg-white dark:text-slate-950 dark:hover:bg-brand-300"
          >
            Let&apos;s talk
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <MobileMenu items={portfolio.navItems} />
        </div>
      </nav>
    </header>
  );
}
