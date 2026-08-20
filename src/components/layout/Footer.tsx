"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { useCatalogStore } from "@/store/catalog";
import { isPrivatePanelPath } from "@/lib/admin-path";
import { formatMozWhatsApp } from "@/lib/utils";

const INSTAGRAM_HANDLE = "aureabijou.mz";
const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;
const FACEBOOK_NAME = "Aurea Bijou";
const FACEBOOK_URL = "https://www.facebook.com/profile.php?id=61593111536133";

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.25" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function Footer() {
  const pathname = usePathname();
  const phone = useCatalogStore((s) => s.settings.whatsappNumber);
  const phoneDisplay = formatMozWhatsApp(phone);
  const waLink = `https://wa.me/${phone.replace(/\D/g, "")}`;

  if (isPrivatePanelPath(pathname) || pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <footer className="mt-8 border-t border-aurea-champagne/15 bg-aurea-mocha text-aurea-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3 md:px-6">
        <div>
          <Logo size="lg" />
          <p className="mt-4 max-w-xs text-sm text-aurea-cream/75">
            Joias e acessórios femininos com elegância contemporânea. Pedidos em
            Moçambique via WhatsApp.
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-aurea-champagne uppercase">
            Explorar
          </p>
          <ul className="mt-3 space-y-2 text-sm text-aurea-cream/85">
            <li>
              <Link href="/loja" className="hover:text-aurea-champagne">
                Loja
              </Link>
            </li>
            <li>
              <Link href="/categoria/novidades" className="hover:text-aurea-champagne">
                Novidades
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.22em] text-aurea-champagne uppercase">
            Contacto
          </p>
          <p className="mt-3 text-sm text-aurea-cream/85">
            Loja física: <span className="text-aurea-champagne">Em mudança</span>
          </p>
          <p className="mt-2 text-sm text-aurea-cream/85">
            WhatsApp:{" "}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-aurea-champagne hover:underline"
            >
              {phoneDisplay}
            </a>
          </p>

          <p className="mt-5 text-xs tracking-[0.22em] text-aurea-champagne uppercase">
            Redes sociais
          </p>
          <div className="mt-3 flex flex-col gap-2.5">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-aurea-cream/85 transition-colors hover:text-aurea-champagne"
              aria-label={`Instagram @${INSTAGRAM_HANDLE}`}
            >
              <InstagramIcon size={18} />
              @{INSTAGRAM_HANDLE}
            </a>
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-aurea-cream/85 transition-colors hover:text-aurea-champagne"
              aria-label={`Facebook ${FACEBOOK_NAME}`}
            >
              <FacebookIcon size={18} />
              {FACEBOOK_NAME}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-aurea-champagne/10 py-4 text-center text-xs text-aurea-cream/55">
        © {new Date().getFullYear()} WISE CONNECT LDA. Todos os direitos reservados.
      </div>
    </footer>
  );
}
