import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-500",
        secondary:
          "bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-800",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> & {
  children: ReactNode;
  href?: string;
  className?: string;
};

export default function Button({ children, href, variant, className }: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return <button className={classes}>{children}</button>;
}
