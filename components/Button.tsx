import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: ButtonVariant;
  className?: string;
};

function getVariantClasses(variant: ButtonVariant): string {
  if (variant === "secondary") {
    return "bg-white text-slate-800 border border-slate-300 hover:bg-slate-100";
  }

  return "bg-brand-600 text-white hover:bg-brand-500";
}

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const baseClassName = `inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors ${getVariantClasses(variant)} ${className}`;

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return <button className={baseClassName}>{children}</button>;
}
