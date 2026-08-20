export type ImageUploadKind = "banner" | "product" | "category";

export interface ImageSpec {
  kind: ImageUploadKind;
  label: string;
  width: number;
  height: number;
  aspectLabel: string;
  maxFileMb: number;
  tips: string[];
}

export const IMAGE_SPECS: Record<ImageUploadKind, ImageSpec> = {
  banner: {
    kind: "banner",
    label: "Banner / Hero",
    width: 1800,
    height: 900,
    aspectLabel: "2:1",
    maxFileMb: 4,
    tips: [
      "Desktop: 1800 × 900 px (recomendado)",
      "Mobile: também funciona bem em 900 × 1200 px",
      "Formato: JPG, PNG ou WebP · máx. 4 MB",
    ],
  },
  product: {
    kind: "product",
    label: "Produto",
    width: 1200,
    height: 1200,
    aspectLabel: "1:1",
    maxFileMb: 3,
    tips: [
      "Quadrado: 1200 × 1200 px (recomendado)",
      "Mínimo aceitável: 800 × 800 px",
      "Fundo limpo · Formato JPG, PNG ou WebP · máx. 3 MB",
    ],
  },
  category: {
    kind: "category",
    label: "Categoria",
    width: 800,
    height: 1000,
    aspectLabel: "4:5",
    maxFileMb: 2,
    tips: [
      "Retrato: 800 × 1000 px (recomendado)",
      "Alternativa: 800 × 800 px (quadrado)",
      "Formato: JPG, PNG ou WebP · máx. 2 MB",
    ],
  },
};

export function formatDimensions(width: number, height: number) {
  return `${width} × ${height} px`;
}
