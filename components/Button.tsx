import Link from "next/link";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono font-bold uppercase tracking-wider text-xs px-5 py-3 border-2 transition-all cursor-pointer active:translate-x-0.5 active:translate-y-0.5",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 text-white border-black shadow-[3px_3px_0px_#000000] hover:bg-blue-700 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] dark:border-blue-400 dark:shadow-[3px_3px_0px_#ffffff] dark:hover:shadow-[5px_5px_0px_#ffffff]",
        secondary:
          "bg-white text-black border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:shadow-[3px_3px_0px_#000000] dark:hover:shadow-[5px_5px_0px_#000000]",
        white:
          "bg-white text-black border-black shadow-[3px_3px_0px_#000000] hover:bg-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] dark:bg-white dark:text-black dark:border-black dark:shadow-[3px_3px_0px_#000000] dark:hover:bg-white dark:hover:shadow-[5px_5px_0px_#000000]",
        dark:
          "bg-black text-white border-black shadow-[3px_3px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000000] dark:bg-zinc-100 dark:text-black dark:border-zinc-100 dark:shadow-[3px_3px_0px_#000000] dark:hover:shadow-[5px_5px_0px_#000000]",
        outline:
          "bg-transparent text-current border-2 border-current shadow-[2px_2px_0px_currentColor] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_currentColor]",
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
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

export default function Button({ children, href, variant, className, onClick, type = "button", disabled }: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), disabled && "opacity-50 cursor-not-allowed", className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
