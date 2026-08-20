-- AUREA schema for Supabase
-- Run in SQL editor or via supabase migration

create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text default '',
  image text not null,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  materials text,
  price numeric(12,2) not null,
  compare_at_price numeric(12,2),
  category_id uuid references public.categories(id) on delete set null,
  images text[] not null default '{}',
  video_url text,
  colors text[] default '{}',
  sizes text[] default '{}',
  availability text not null default 'disponivel' check (availability in ('disponivel','esgotado','sob_encomenda')),
  badges text[] default '{}',
  active boolean default true,
  rating numeric(3,2) default 5,
  review_count int default 0,
  views int default 0,
  orders int default 0,
  created_at timestamptz default now()
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image text not null,
  cta_label text,
  cta_href text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent','fixed')),
  value numeric(12,2) not null,
  active boolean default true,
  min_subtotal numeric(12,2),
  expires_at timestamptz
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  author text not null,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  approved boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.delivery_fees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee numeric(12,2) not null,
  active boolean default true
);

create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  whatsapp_number text not null default '258850847136',
  default_delivery_fee numeric(12,2) default 150,
  store_address text,
  promo_banner jsonb,
  whatsapp_orders int default 0
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  payload jsonb not null,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.banners enable row level security;
alter table public.coupons enable row level security;
alter table public.reviews enable row level security;
alter table public.delivery_fees enable row level security;
alter table public.site_settings enable row level security;
alter table public.order_events enable row level security;

create policy "Public read categories" on public.categories for select using (active = true);
create policy "Public read products" on public.products for select using (active = true);
create policy "Public read banners" on public.banners for select using (active = true);
create policy "Public read coupons" on public.coupons for select using (active = true);
create policy "Public read approved reviews" on public.reviews for select using (approved = true);
create policy "Public insert reviews" on public.reviews for insert with check (true);
create policy "Public read delivery fees" on public.delivery_fees for select using (active = true);
create policy "Public read settings" on public.site_settings for select using (true);

-- Admin writes should use service role key from server actions / API routes.
