import { Hero, CategoryScroller, CategoryGrid } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { RecentProducts } from "@/components/home/RecentProducts";
import { StoreMap } from "@/components/home/StoreMap";
import { Logo } from "@/components/brand/Logo";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryScroller />
      <FeaturedProducts />
      <CategoryGrid />
      <RecentProducts />
      <StoreMap />
      <section className="border-t border-border py-14 text-center">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <h2 className="mx-auto mt-3 max-w-lg px-4 font-display text-3xl md:text-4xl">
          Luxo acessível, feito para brilhar consigo.
        </h2>
        <p className="mx-auto mt-3 max-w-md px-4 text-sm text-muted">
          Monte o seu pedido em minutos e finalize diretamente no WhatsApp da
          nossa equipa em Moçambique.
        </p>
      </section>
    </>
  );
}
