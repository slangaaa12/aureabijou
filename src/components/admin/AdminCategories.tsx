"use client";

import { useState } from "react";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useCatalogStore } from "@/store/catalog";
import { Button } from "@/components/ui/Button";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

export function AdminCategories() {
  const categories = useCatalogStore((s) => s.categories);
  const upsertCategory = useCatalogStore((s) => s.upsertCategory);
  const deleteCategory = useCatalogStore((s) => s.deleteCategory);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);

  const save = () => {
    if (!name.trim() || !image.trim()) return;
    upsertCategory({
      id: editing?.id || `cat-${Date.now()}`,
      slug: editing?.slug || slugify(name),
      name,
      description,
      image,
      order: editing?.order || categories.length + 1,
      active: true,
    });
    setName("");
    setDescription("");
    setImage("");
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl">Categorias</h2>
      <div className="grid gap-3 border border-border bg-background p-4">
        <input className="admin-input" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="admin-input" placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
        <ImageUploadField kind="category" value={image} onChange={setImage} />
        <Button variant="gold" onClick={save} disabled={!image}>
          {editing ? "Atualizar" : "Adicionar"}
        </Button>
      </div>
      <ul className="divide-y divide-border border border-border bg-background">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted">{c.slug}</p>
            </div>
            <div className="flex gap-3">
              <button type="button" className="text-aurea-gold" onClick={() => { setEditing(c); setName(c.name); setDescription(c.description); setImage(c.image); }}>Editar</button>
              <button type="button" className="text-red-600" onClick={() => deleteCategory(c.id)}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
