"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "gold";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const variants = {
  primary: "bg-aurea-mocha text-aurea-cream hover:bg-aurea-mocha-deep",
  secondary:
    "bg-surface text-foreground border border-border hover:border-aurea-champagne-soft/60",
  ghost: "bg-transparent text-foreground hover:bg-surface",
  outline:
    "bg-transparent border border-aurea-mocha/25 text-foreground hover:border-aurea-rose-gold hover:text-aurea-rose-gold",
  gold: "bg-aurea-champagne-soft text-aurea-mocha-deep hover:bg-aurea-champagne",
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-sm",
  lg: "min-h-14 px-6 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  onClick,
  ...props
}: ButtonProps) {
  const classes = cn(
    "pressable inline-flex items-center justify-center gap-2 rounded-none font-medium tracking-wide transition-all disabled:opacity-50",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        onClick={onClick as unknown as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} onClick={onClick} {...props}>
      {children}
    </button>
  );
}
