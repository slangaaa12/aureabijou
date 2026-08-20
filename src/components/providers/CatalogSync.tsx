"use client";

import { useEffect } from "react";
import { useCatalogStore } from "@/store/catalog";

const SEED_UPDATED_AT = new Date(0).toISOString();

/**
 * Carrega o catálogo partilhado (Vercel Blob) em todos os dispositivos.
 * A fonte de verdade é /api/catalog — o localStorage é só cache.
 */
export function CatalogSync() {
  const replaceCatalog = useCatalogStore((s) => s.replaceCatalog);
  const setHydrated = useCatalogStore((s) => s.setHydrated);
  const setSyncStatus = useCatalogStore((s) => s.setSyncStatus);
  const syncToRemote = useCatalogStore((s) => s.syncToRemote);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setSyncStatus("loading");
      try {
        const res = await fetch("/api/catalog", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao carregar catálogo");
        const data = await res.json();
        if (cancelled) return;

        const isSeedFallback =
          !data.updatedAt || data.updatedAt === SEED_UPDATED_AT;

        if (isSeedFallback) {
          // Ainda não há catálogo partilhado: mantém o cache local.
          // Se estiver no admin, publica o cache para todos os dispositivos.
          setSyncStatus("ready");
          setHydrated(true);
          if (window.location.pathname.startsWith("/admin")) {
            void syncToRemote();
          }
          return;
        }

        replaceCatalog(data);
        setSyncStatus("ready");
        setHydrated(true);
      } catch {
        if (!cancelled) {
          setSyncStatus("error");
          setHydrated(true);
        }
      }
    };

    const start = () => {
      void load();
    };

    if (useCatalogStore.persist.hasHydrated()) {
      start();
      return () => {
        cancelled = true;
      };
    }

    const unsub = useCatalogStore.persist.onFinishHydration(() => {
      start();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [replaceCatalog, setHydrated, setSyncStatus, syncToRemote]);

  return null;
}
