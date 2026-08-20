"use client";

import { useEffect } from "react";
import { useThemeStore, useToastStore } from "@/store/ui";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return <>{children}</>;
}

export function Toast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-20 z-[80] -translate-x-1/2 px-4">
      <div className="rounded-sm border border-aurea-champagne/40 bg-aurea-mocha px-4 py-2.5 text-sm text-aurea-cream shadow-lg">
        {message}
      </div>
    </div>
  );
}
