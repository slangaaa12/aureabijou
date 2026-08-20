"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stars({
  rating,
  size = 14,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i + 1 <= Math.round(rating)
              ? "fill-aurea-champagne-soft text-aurea-rose-gold"
              : "text-border"
          )}
        />
      ))}
    </div>
  );
}
