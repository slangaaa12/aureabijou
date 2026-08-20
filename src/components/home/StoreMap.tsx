"use client";

import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function StoreMap() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <p className="text-[11px] tracking-[0.25em] text-aurea-champagne-soft uppercase">
          Visite-nos
        </p>
        <h2 className="font-display text-3xl">Loja física</h2>

        <div className="mt-6 border border-aurea-champagne/25 bg-surface p-8 text-center md:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border border-aurea-champagne/30 bg-aurea-cream">
            <MapPin className="text-aurea-rose-gold" size={24} />
          </div>
          <p className="mt-5 font-display text-2xl text-aurea-mocha md:text-3xl">
            Em mudança
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Estamos preparando um novo espaço para receber você com toda a
            elegância AUREA. Enquanto isso, faça o seu pedido online — entregamos
            em Moçambique ou combine retirada pelo WhatsApp.
          </p>
          <Button href="/loja" variant="gold" className="mt-6">
            Comprar online
          </Button>
        </div>
      </div>
    </section>
  );
}
