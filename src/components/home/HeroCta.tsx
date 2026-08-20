import Link from "next/link";

interface HeroCtaProps {
  primaryHref: string;
  secondaryHref: string;
}

export function HeroCta({ primaryHref, secondaryHref }: HeroCtaProps) {
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-4 md:max-w-[480px] md:flex-row">
      <Link
        href={primaryHref}
        className="group pressable flex h-14 w-full items-center justify-center gap-2 bg-gradient-to-r from-[#b8876b] via-[#e2ccaa] to-[#d4b896] text-[10px] font-semibold tracking-[0.22em] text-black uppercase transition-all duration-300 hover:brightness-105 md:h-[60px] md:flex-1 md:text-[11px]"
      >
        COMPRAR AGORA
        <span className="text-sm leading-none transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </Link>

      <Link
        href={secondaryHref}
        className="group pressable flex h-14 w-full items-center justify-center gap-3 border border-[#d4bc96]/70 bg-transparent text-[10px] font-medium tracking-[0.22em] text-white uppercase transition-all duration-300 hover:border-[#e2ccaa] md:h-[60px] md:flex-1 md:text-[11px]"
      >
        VER COLEÇÃO
        <span
          className="h-px w-8 bg-white/75 transition-all duration-300 group-hover:w-10 group-hover:bg-[#e2ccaa]"
          aria-hidden
        />
      </Link>
    </div>
  );
}
