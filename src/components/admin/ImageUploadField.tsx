"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import {
  IMAGE_SPECS,
  formatDimensions,
  type ImageUploadKind,
} from "@/lib/image-specs";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  kind: ImageUploadKind;
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler a imagem"));
    };
    img.src = url;
  });
}

export function ImageUploadField({
  kind,
  value,
  onChange,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const spec = IMAGE_SPECS[kind];
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualSize, setActualSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Selecione um ficheiro de imagem.");
      return;
    }

    const maxBytes = spec.maxFileMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Ficheiro demasiado grande (máx. ${spec.maxFileMb} MB).`);
      return;
    }

    try {
      const size = await readImageSize(file);
      setActualSize(size);
    } catch {
      setActualSize(null);
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("image", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Falha no upload");
      }
      onChange(data.url as string);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void upload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void upload(file);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="rounded-sm border border-aurea-champagne-soft/40 bg-aurea-cream-soft/60 px-3 py-3 dark:bg-aurea-mocha/40">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-aurea-mocha uppercase dark:text-aurea-champagne">
          Dimensões — {spec.label}
        </p>
        <p className="mt-1.5 text-sm text-foreground">
          Recomendado:{" "}
          <span className="font-semibold tabular-nums">
            {formatDimensions(spec.width, spec.height)}
          </span>{" "}
          <span className="text-muted">({spec.aspectLabel})</span>
        </p>
        <ul className="mt-2 space-y-0.5 text-xs text-muted">
          {spec.tips.map((tip) => (
            <li key={tip}>· {tip}</li>
          ))}
        </ul>
        {actualSize && (
          <p className="mt-2 text-xs text-foreground">
            Imagem selecionada:{" "}
            <span className="font-medium tabular-nums">
              {formatDimensions(actualSize.width, actualSize.height)}
            </span>
            {actualSize.width !== spec.width ||
            actualSize.height !== spec.height ? (
              <span className="text-amber-700 dark:text-amber-400">
                {" "}
                — diferente do recomendado
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-400">
                {" "}
                — ideal
              </span>
            )}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFileChange}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          "relative flex min-h-44 flex-col items-center justify-center gap-3 border border-dashed px-4 py-6 text-center transition-colors",
          dragOver
            ? "border-aurea-champagne bg-aurea-champagne/10"
            : "border-border bg-background",
          uploading && "opacity-70"
        )}
      >
        {value ? (
          <>
            <div className="relative h-36 w-full max-w-sm overflow-hidden bg-surface">
              <Image
                src={value}
                alt="Pré-visualização"
                fill
                unoptimized={
                  value.startsWith("data:") ||
                  value.startsWith("/api/uploads/") ||
                  value.includes("blob.vercel-storage.com")
                }
                className="object-contain"
                sizes="400px"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="pressable inline-flex min-h-10 items-center gap-2 border border-border px-3 text-xs tracking-wide uppercase"
              >
                <Upload size={14} />
                Trocar imagem
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  onChange("");
                  setActualSize(null);
                  setError(null);
                }}
                className="pressable inline-flex min-h-10 items-center gap-2 border border-border px-3 text-xs tracking-wide text-red-600 uppercase"
              >
                <Trash2 size={14} />
                Remover
              </button>
            </div>
          </>
        ) : (
          <>
            <ImagePlus className="text-muted" size={28} />
            <p className="text-sm text-foreground">
              Arraste uma imagem ou escolha do dispositivo
            </p>
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="pressable inline-flex min-h-11 items-center gap-2 bg-aurea-mocha px-4 text-xs tracking-[0.18em] text-aurea-cream uppercase"
            >
              {uploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />A enviar…
                </>
              ) : (
                <>
                  <Upload size={14} />
                  Carregar do dispositivo
                </>
              )}
            </button>
          </>
        )}

        {uploading && value && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="animate-spin text-aurea-rose-gold" size={28} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
