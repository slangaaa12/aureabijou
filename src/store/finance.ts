"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  emptyFinanceSnapshot,
  type FinanceSnapshot,
  type Sale,
  type SaleSource,
} from "@/lib/finance-snapshot";

type SyncStatus = "idle" | "loading" | "ready" | "error" | "saving";

interface FinanceState extends FinanceSnapshot {
  hydrated: boolean;
  syncStatus: SyncStatus;
  setHydrated: (v: boolean) => void;
  setSyncStatus: (v: SyncStatus) => void;
  replaceFinance: (snapshot: FinanceSnapshot) => void;
  syncToRemote: () => Promise<boolean>;
  setProductCost: (productId: string, cost: number) => void;
  removeProductCost: (productId: string) => void;
  addSale: (sale: Omit<Sale, "id" | "createdAt"> & { id?: string }) => void;
  deleteSale: (id: string) => void;
}

let syncTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleRemoteSync() {
  if (typeof window === "undefined") return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    void useFinanceStore.getState().syncToRemote();
  }, 400);
}

function buildSnapshot(state: FinanceState): FinanceSnapshot {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    productCosts: state.productCosts,
    sales: state.sales,
  };
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      ...emptyFinanceSnapshot(),
      hydrated: false,
      syncStatus: "idle",
      setHydrated: (v) => set({ hydrated: v }),
      setSyncStatus: (v) => set({ syncStatus: v }),
      replaceFinance: (snapshot) =>
        set((s) => ({
          version: 1,
          updatedAt: snapshot.updatedAt,
          productCosts: {
            ...s.productCosts,
            ...(snapshot.productCosts || {}),
          },
          sales: Array.isArray(snapshot.sales) ? snapshot.sales : s.sales,
        })),
      syncToRemote: async () => {
        set({ syncStatus: "saving" });
        try {
          const res = await fetch("/api/finance", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildSnapshot(get())),
          });
          if (!res.ok) {
            set({ syncStatus: "error" });
            return false;
          }
          const data = (await res.json().catch(() => ({}))) as {
            updatedAt?: string;
          };
          set({
            syncStatus: "ready",
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
          return true;
        } catch {
          set({ syncStatus: "error" });
          return false;
        }
      },
      setProductCost: (productId, cost) => {
        const value = Math.max(0, Number(cost) || 0);
        set((s) => ({
          productCosts: { ...s.productCosts, [productId]: value },
        }));
        if (syncTimer) clearTimeout(syncTimer);
        void get().syncToRemote();
      },
      removeProductCost: (productId) => {
        set((s) => {
          const next = { ...s.productCosts };
          delete next[productId];
          return { productCosts: next };
        });
        if (syncTimer) clearTimeout(syncTimer);
        void get().syncToRemote();
      },
      addSale: (input) => {
        const sale: Sale = {
          id: input.id || `sale-${Date.now()}`,
          createdAt: new Date().toISOString(),
          source: input.source,
          note: input.note,
          items: input.items,
        };
        set((s) => ({ sales: [sale, ...s.sales] }));
        scheduleRemoteSync();
      },
      deleteSale: (id) => {
        set((s) => ({ sales: s.sales.filter((sale) => sale.id !== id) }));
        scheduleRemoteSync();
      },
    }),
    {
      name: "aurea-finance",
      partialize: (state) => ({
        version: state.version,
        updatedAt: state.updatedAt,
        productCosts: state.productCosts,
        sales: state.sales,
      }),
    }
  )
);

export function saleSourceLabel(source: SaleSource) {
  return source === "site" ? "Site" : "Fora do site";
}
