"use client";

import { useState } from "react";
import type { Banner } from "@/lib/types";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function AdminBanners() {
  const banners = useCatalogStore((s) => s.banners);
  const upsertBanner = useCatalogStore((s) => s.upsertBanner);
  const deleteBanner = useCatalogStore((s) => s.deleteBanner);
  const updateSettings = useCatalogStore((s) => s.updateSettings);
  const promo = useCatalogStore((s) => s.settings.promoBanner);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", ctaLabel: "Comprar Agora", ctaHref: "/loja" });

  const save = () => {
    if (!form.title || !form.image) return;
    const banner: Banner = {
      id: `b-${Date.now()}`,
      ...form,
      active: true,
      order: banners.length + 1,
    };
    upsertBanner(banner);
    setForm({ title: "", subtitle: "", image: "", ctaLabel: "Comprar Agora", ctaHref: "/loja" });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Banners</h2>
      <div className="grid gap-3 border border-border bg-background p-4">
        <input className="admin-input" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input className="admin-input" placeholder="Subtítulo" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <ImageUploadField
          kind="banner"
          value={form.image}
          onChange={(image) => setForm({ ...form, image })}
        />
        <Button variant="gold" onClick={save} disabled={!form.image}>
          Adicionar banner
        </Button>
      </div>
      <ul className="divide-y divide-border border border-border bg-background">
        {banners.map((b) => (
          <li key={b.id} className="flex justify-between gap-3 p-3 text-sm">
            <div>
              <p className="font-medium">{b.title}</p>
              <p className="text-xs text-muted">{b.active ? "Ativo" : "Inativo"}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-aurea-gold" onClick={() => upsertBanner({ ...b, active: !b.active })}>
                {b.active ? "Desativar" : "Ativar"}
              </button>
              <button type="button" className="text-red-600" onClick={() => deleteBanner(b.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="border border-border bg-background p-4">
        <h3 className="font-display text-xl">Banner promocional</h3>
        <input
          className="admin-input mt-3"
          value={promo?.text || ""}
          onChange={(e) =>
            updateSettings({
              promoBanner: {
                active: promo?.active ?? true,
                text: e.target.value,
                href: promo?.href || "/loja",
              },
            })
          }
        />
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={promo?.active ?? false}
            onChange={(e) =>
              updateSettings({
                promoBanner: {
                  active: e.target.checked,
                  text: promo?.text || "",
                  href: promo?.href,
                },
              })
            }
          />
          Ativo
        </label>
      </div>
    </div>
  );
}
