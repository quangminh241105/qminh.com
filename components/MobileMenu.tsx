"use client";

import { useState } from "react";
import Link from "next/link";
import { type NavItem } from "@/lib/portfolio";

export default function MobileMenu({ items }: { items: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative md:hidden ml-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center border-2 border-black bg-white text-blue-600 shadow-[2px_2px_0px_#000000] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 dark:border-blue-400 dark:bg-zinc-900 dark:text-blue-400 dark:shadow-[2px_2px_0px_#000000] dark:hover:shadow-[3px_3px_0px_#000000]"
        aria-label="Toggle menu"
      >
        <svg
          className={`h-4 w-4 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="square" strokeLinejoin="miter" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 border-2 border-black bg-white p-2 shadow-[4px_4px_0px_#000000] z-50 origin-top-right dark:border-blue-400 dark:bg-zinc-900 dark:shadow-[4px_4px_0px_#000000]">
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-blue-600 hover:text-white dark:text-zinc-200 dark:hover:bg-blue-500 dark:hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
