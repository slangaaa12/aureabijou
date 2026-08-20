import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "text-[13px] tracking-[0.32em]",
  md: "text-[17px] tracking-[0.34em]",
  lg: "text-[22px] tracking-[0.36em]",
  xl: "text-[28px] tracking-[0.38em]",
};

export function Logo({ className, size = "md" }: LogoProps) {
  return (
    <span
      className={cn(
        "font-display font-medium uppercase leading-none gold-text",
        sizes[size],
        className
      )}
      aria-label="AUREA"
    >
      AUREA
    </span>
  );
}
