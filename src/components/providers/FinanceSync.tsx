"use client";

import { useEffect } from "react";
import { useFinanceStore } from "@/store/finance";

const SEED_UPDATED_AT = new Date(0).toISOString();

export function FinanceSync() {
  const replaceFinance = useFinanceStore((s) => s.replaceFinance);
  const setHydrated = useFinanceStore((s) => s.setHydrated);
  const setSyncStatus = useFinanceStore((s) => s.setSyncStatus);
  const syncToRemote = useFinanceStore((s) => s.syncToRemote);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setSyncStatus("loading");
      try {
        const res = await fetch("/api/finance", { cache: "no-store" });
        if (!res.ok) throw new Error("Falha ao carregar finanças");
        const data = await res.json();
        if (cancelled) return;

        const isSeedFallback =
          !data.updatedAt || data.updatedAt === SEED_UPDATED_AT;

        if (isSeedFallback) {
          setSyncStatus("ready");
          setHydrated(true);
          void syncToRemote();
          return;
        }

        replaceFinance(data);
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

    if (useFinanceStore.persist.hasHydrated()) {
      start();
      return () => {
        cancelled = true;
      };
    }

    const unsub = useFinanceStore.persist.onFinishHydration(() => {
      start();
    });
    return () => {
      cancelled = true;
      unsub();
    };
  }, [replaceFinance, setHydrated, setSyncStatus, syncToRemote]);

  return null;
}
