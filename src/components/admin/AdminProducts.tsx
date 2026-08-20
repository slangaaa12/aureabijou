"use client";

import { useState } from "react";
import type { Product, ProductAvailability, ProductBadge } from "@/lib/types";
import { formatMZN, slugify } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

const emptyForm = (): Partial<Product> => ({
  name: "",
  description: "",
  materials: "",
  price: 0,
  categorySlug: "aneis",
  images: [""],
  colors: [],
  sizes: [],
  availability: "disponivel",
  badges: [],
  active: true,
  rating: 5,
  reviewCount: 0,
  views: 0,
  orders: 0,
});

export function AdminProducts() {
  const products = useCatalogStore((s) => s.products);
  const categories = useCatalogStore((s) => s.categories);
  const upsertProduct = useCatalogStore((s) => s.upsertProduct);
  const deleteProduct = useCatalogStore((s) => s.deleteProduct);
  const [form, setForm] = useState<Partial<Product>>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = () => {
    if (!form.name || !form.price || !(form.images || []).filter(Boolean).length) return;
    const cat = categories.find((c) => c.slug === form.categorySlug);
    const product: Product = {
      id: editingId || `p-${Date.now()}`,
      slug: form.slug || slugify(form.name),
      name: form.name,
      description: form.description || "",
      materials: form.materials,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      categoryId: cat?.id || "cat-aneis",
      categorySlug: form.categorySlug || "aneis",
      images: (form.images || []).filter(Boolean),
      videoUrl: form.videoUrl,
      colors: form.colors,
      sizes: form.sizes,
      availability: (form.availability || "disponivel") as ProductAvailability,
      badges: (form.badges || []) as ProductBadge[],
      active: form.active !== false,
      rating: form.rating || 5,
      reviewCount: form.reviewCount || 0,
      views: form.views || 0,
      orders: form.orders || 0,
      createdAt: form.createdAt || new Date().toISOString(),
    };
    upsertProduct(product);
    setForm(emptyForm());
    setEditingId(null);
  };

  const edit = (p: Product) => {
    setEditingId(p.id);
    setForm(p);
  };

  const toggleBadge = (badge: ProductBadge) => {
    const current = form.badges || [];
    setForm({
      ...form,
      badges: current.includes(badge)
        ? current.filter((b) => b !== badge)
        : [...current, badge],
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">
        {editingId ? "Editar produto" : "Adicionar produto"}
      </h2>
      <div className="grid gap-3 border border-border bg-background p-4 md:grid-cols-2">
        <input
          className="admin-input"
          placeholder="Nome"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="admin-input"
          type="number"
          placeholder="Preço"
          value={form.price || ""}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <input
          className="admin-input"
          type="number"
          placeholder="Preço riscado (opcional)"
          value={form.compareAtPrice || ""}
          onChange={(e) =>
            setForm({
              ...form,
              compareAtPrice: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
        <select
          className="admin-input"
          value={form.categorySlug}
          onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea
          className="admin-input min-h-24 py-3 md:col-span-2"
          rows={3}
          placeholder="Descrição"
          value={form.description || ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="md:col-span-2">
          <ImageUploadField
            kind="product"
            value={form.images?.[0] || ""}
            onChange={(url) => setForm({ ...form, images: [url] })}
          />
        </div>
        <input
          className="admin-input md:col-span-2"
          placeholder="Materiais"
          value={form.materials || ""}
          onChange={(e) => setForm({ ...form, materials: e.target.value })}
        />
        <input
          className="admin-input"
          placeholder="Cores (vírgula)"
          value={(form.colors || []).join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              colors: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <input
          className="admin-input"
          placeholder="Tamanhos (vírgula)"
          value={(form.sizes || []).join(", ")}
          onChange={(e) =>
            setForm({
              ...form,
              sizes: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
        <select
          className="admin-input"
          value={form.availability}
          onChange={(e) =>
            setForm({
              ...form,
              availability: e.target.value as ProductAvailability,
            })
          }
        >
          <option value="disponivel">Disponível</option>
          <option value="sob_encomenda">Sob encomenda</option>
          <option value="esgotado">Esgotado</option>
        </select>
        <label className="flex min-h-12 items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Produto ativo
        </label>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          {(["novo", "promocao", "mais_vendido", "ultimas_unidades"] as ProductBadge[]).map(
            (b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBadge(b)}
                className={`min-h-10 border px-3 text-xs uppercase ${
                  form.badges?.includes(b)
                    ? "border-aurea-gold text-aurea-gold"
                    : "border-border"
                }`}
              >
                {b}
              </button>
            )
          )}
        </div>
        <div className="flex gap-2 md:col-span-2">
          <Button
            type="button"
            variant="gold"
            onClick={save}
            disabled={!(form.images || []).filter(Boolean).length}
          >
            Guardar
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm());
              }}
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="p-3">Produto</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border">
                <td className="p-3">
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted">{p.categorySlug}</p>
                </td>
                <td className="p-3">{formatMZN(p.price)}</td>
                <td className="p-3">
                  {p.active ? "Ativo" : "Inativo"} · {p.availability}
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-xs text-aurea-gold"
                      onClick={() => edit(p)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-xs text-muted"
                      onClick={() =>
                        upsertProduct({ ...p, active: !p.active })
                      }
                    >
                      {p.active ? "Desativar" : "Ativar"}
                    </button>
                    <button
                      type="button"
                      className="text-xs text-red-600"
                      onClick={() => deleteProduct(p.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
