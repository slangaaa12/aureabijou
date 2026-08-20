# AUREA — Joias & Acessórios Premium

Website premium mobile-first para a marca **AUREA**, com catálogo, favoritos, carrinho e checkout multi-step que envia o pedido formatado para WhatsApp.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 4 + Framer Motion
- Zustand (carrinho, favoritos, catálogo, tema)
- Supabase (schema SQL pronto em `supabase/schema.sql`)
- Cloudinary / Unsplash para imagens
- Vercel-ready

## Arranque rápido

```bash
cd PROJECTS/aurea
cp .env.example .env.local
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Painel de administração

Acesso: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

Credenciais por omissão:

- Email: `kaylla.aurea@admin.com`
- Password: `aurea12`

Opcional no `.env.local` (sobrescreve as credenciais por omissão):

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET` — ≥32 caracteres em produção

### WhatsApp

Defina `NEXT_PUBLIC_WHATSAPP_NUMBER` no formato internacional sem `+`, ex: `25884XXXXXXX`.

## Funcionalidades

- Home com hero full-bleed, categorias, destaques
- Loja com filtros (preço, categoria, disponibilidade, ordenação)
- Página de produto com galeria, zoom, avaliações, relacionados
- Carrinho em bottom sheet + cupões
- Checkout em 5 ecrãs → mensagem WhatsApp automática
- Favoritos, pesquisa, modo claro/escuro
- Bottom navigation mobile + FAB WhatsApp
- Painel em `/admin` (login com email/password, sessão assinada, rate-limit)
- SEO: meta tags, Open Graph, Schema.org Product, sitemap.xml, robots.txt

## Supabase

1. Crie um projeto no Supabase
2. Execute `supabase/schema.sql`
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Sem Supabase, o site funciona com seed local + persistência no browser (admin).

## Deploy (Vercel)

```bash
npx vercel
```

Configure as variáveis de ambiente no painel da Vercel.
