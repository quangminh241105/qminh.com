"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-brand-600 after:transition-transform hover:text-brand-600 hover:after:scale-x-100 dark:hover:text-brand-400 dark:after:bg-brand-400",
        isActive ? "text-brand-700 after:scale-x-100 dark:text-brand-300" : "text-slate-700 dark:text-slate-300",
      )}
    >
      {children}
    </Link>
  );
}
