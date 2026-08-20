"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCatalogStore } from "@/store/catalog";
import { isPrivatePanelPath } from "@/lib/admin-path";

export function WhatsAppFab() {
  const pathname = usePathname();
  const phone = useCatalogStore((s) => s.settings.whatsappNumber);

  if (isPrivatePanelPath(pathname) || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent("Olá AUREA! Gostaria de saber mais sobre as joias.")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="pressable fixed bottom-24 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg md:bottom-8"
    >
      <MessageCircle size={24} />
    </a>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isPrivatePanelPath(pathname) || !visible) return null;

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="pressable fixed bottom-24 left-4 z-40 flex h-12 w-12 items-center justify-center border border-border bg-background/95 text-foreground shadow-md backdrop-blur md:bottom-8"
    >
      <ArrowUp size={18} />
    </button>
  );
}
