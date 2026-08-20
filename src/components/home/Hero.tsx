"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { HeroCta } from "@/components/home/HeroCta";
import { useCatalogStore } from "@/store/catalog";

const HERO_BG = "#3d2b24";

export function Hero() {
  const banners = useCatalogStore((s) => s.banners);
  const banner = useMemo(
    () => banners.filter((b) => b.active).sort((a, b) => a.order - b.order)[0],
    [banners]
  );

  if (!banner) return null;

  const primaryHref = banner.ctaHref || "/loja";

  return (
    <section
      className="relative min-h-[100dvh] bg-[#3d2b24]"
      style={{ backgroundColor: HERO_BG }}
      aria-label="AUREA — coleção premium"
    >
      {/* Mobile — composição vertical (referência 11_02_52) */}
      <div className="flex min-h-[100dvh] flex-col md:hidden">
        <div
          className="relative flex h-[40vh] min-h-[280px] shrink-0 items-center justify-center"
          style={{ backgroundColor: HERO_BG }}
        >
          <Image
            src="/images/hero-product-mobile.png"
            alt="AUREA — caixa de joias e acessórios em ouro rosa"
            fill
            priority
            sizes="100vw"
            className="object-contain object-center"
            quality={95}
          />
        </div>

        <div
          className="flex flex-1 flex-col items-center justify-center px-6 pb-28 pt-8 text-center"
          style={{ backgroundColor: HERO_BG }}
        >
          <p
            className="mb-7 text-[11px] tracking-[0.6em] text-[#d4bc96] uppercase"
            aria-hidden
          >
            AUREA
          </p>

          <h1 className="mb-5 max-w-[320px] font-display text-[2rem] font-light leading-[1.2] text-[#F7F4EF]">
            <span className="block">Elegância que</span>
            <span className="block">Brilha em</span>
            <span className="block">Cada Detalhe.</span>
          </h1>

          <p className="hero-subtitle mb-9 max-w-[300px] text-[13px] leading-relaxed text-white/75">
            Joias e acessórios premium para a mulher moçambicana.
          </p>

          <HeroCta primaryHref={primaryHref} secondaryHref="/loja" />
        </div>
      </div>

      {/* Desktop — grid 45% | 55% (referência 11_01_49) */}
      <div
        className="hidden min-h-[100dvh] md:grid md:grid-cols-[45%_55%]"
        style={{ backgroundColor: HERO_BG }}
      >
        <div
          className="relative flex items-center justify-center py-8 pl-4 lg:pl-8"
          style={{ backgroundColor: HERO_BG }}
        >
          <div className="relative h-full w-full min-h-[min(100dvh,900px)]">
            <Image
              src="/images/hero-product-desktop.png"
              alt="AUREA — caixa de joias e acessórios em ouro rosa"
              fill
              priority
              sizes="45vw"
              className="object-contain object-center"
              quality={95}
            />
          </div>
        </div>

        <div
          className="flex flex-col items-start justify-center px-10 py-16 lg:px-14 xl:px-20"
          style={{ backgroundColor: HERO_BG }}
        >
          <p
            className="mb-10 text-xs tracking-[0.55em] text-[#d4bc96] uppercase"
            aria-hidden
          >
            AUREA
          </p>

          <h1 className="mb-8 max-w-[520px] font-display text-[3.1rem] font-light leading-[1.15] text-[#F7F4EF] xl:text-[3.35rem]">
            Elegância que Brilha em
            <br />
            Cada Detalhe.
          </h1>

          <p className="hero-subtitle mb-12 max-w-md text-[15px] leading-relaxed text-white/75">
            Joias e acessórios premium para a mulher moçambicana.
          </p>

          <HeroCta primaryHref={primaryHref} secondaryHref="/loja" />
        </div>
      </div>
    </section>
  );
}

export function CategoryScroller() {
  const allCategories = useCatalogStore((s) => s.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => c.active).sort((a, b) => a.order - b.order),
    [allCategories]
  );

  return (
    <section className="py-8 md:py-12">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
              Explorar
            </p>
            <h2 className="font-display text-3xl">Categorias</h2>
          </div>
          <Link
            href="/loja"
            className="text-xs tracking-[0.18em] text-muted uppercase hover:text-aurea-gold"
          >
            Ver tudo
          </Link>
        </div>
      </div>
      <div className="hide-scrollbar flex gap-3 overflow-x-auto px-4 pb-2 md:mx-auto md:max-w-6xl md:px-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="pressable group relative h-36 w-28 shrink-0 overflow-hidden md:h-48 md:w-40"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <span className="absolute inset-x-2 bottom-3 text-center text-xs tracking-[0.14em] text-white uppercase">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid() {
  const allCategories = useCatalogStore((s) => s.categories);
  const categories = useMemo(
    () => allCategories.filter((c) => c.active).sort((a, b) => a.order - b.order),
    [allCategories]
  );

  return (
    <section className="bg-surface py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="mb-8 text-center">
          <p className="text-[11px] tracking-[0.25em] text-aurea-gold uppercase">
            Coleções
          </p>
          <h2 className="font-display text-3xl md:text-4xl">
            Encontre a sua peça
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className={cnCategory(i)}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width:768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/25" />
              <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                <h3 className="font-display text-xl text-white md:text-2xl">
                  {cat.name}
                </h3>
                <p className="mt-1 hidden text-xs text-white/75 md:block">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function cnCategory(i: number) {
  const tall = i === 0 || i === 5;
  return `group relative overflow-hidden ${tall ? "min-h-56 md:min-h-80" : "min-h-44 md:min-h-64"}`;
}
