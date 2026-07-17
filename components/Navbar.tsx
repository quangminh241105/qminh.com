import Link from "next/link";
import { getPortfolioContent } from "@/lib/portfolio-db";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";

export default async function Navbar() {
  const portfolio = await getPortfolioContent();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {portfolio.name}
        </Link>

        <ul className="hidden items-center gap-5 md:flex">
          {portfolio.navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-sm font-medium text-slate-700 transition-colors hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contact"
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
          >
            Hire Me
          </Link>
          <MobileMenu items={portfolio.navItems} />
        </div>
      </nav>
    </header>
  );
}
