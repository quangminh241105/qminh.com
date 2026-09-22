import Link from "next/link";
import { getPortfolioContent } from "@/lib/portfolio-db";
import MobileMenu from "@/components/MobileMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { TerminalIcon } from "@/components/icons";

export default async function Navbar() {
  const portfolio = await getPortfolioContent();

  return (
    <header className="sticky top-0 z-40 border-b-2 border-black bg-white backdrop-blur dark:border-blue-400 dark:bg-black">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-base font-black uppercase tracking-wider text-black dark:text-blue-300"
        >
          <span className="flex h-7 w-7 items-center justify-center border-2 border-black bg-[#ffe600] text-black shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
            <TerminalIcon className="h-4 w-4" />
          </span>
          <span>{portfolio.name}</span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {portfolio.navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-blue-600 hover:text-white dark:text-zinc-200 dark:hover:bg-blue-500 dark:hover:text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 border-2 border-black bg-[#ffe600] px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 dark:shadow-[2px_2px_0px_#000000] dark:hover:shadow-[3px_3px_0px_#000000]"
          >
            Hire Me
          </Link>
          <MobileMenu items={portfolio.navItems} />
        </div>
      </nav>
    </header>
  );
}
