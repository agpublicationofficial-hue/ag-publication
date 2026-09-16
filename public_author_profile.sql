-- =========================================================
-- A&G PUBLICATION
-- PUBLIC AUTHOR USERNAME + PUBLIC PROFILE ACCESS
-- =========================================================

-- Username column (safe to run even if it already exists)
alter table if exists public.author_profiles
  add column if not exists username text;

-- Username should be unique, case-insensitively.
create unique index if not exists author_profiles_username_lower_idx
  on public.author_profiles (lower(username))
  where username is not null;

-- ---------------------------------------------------------
-- PUBLIC PROFILE READ
-- ---------------------------------------------------------
-- These policies expose only the author-facing profile tables.
-- Bank details and notification settings are NOT touched.

alter table if exists public.author_profiles enable row level security;
alter table if exists public.author_social_links enable row level security;
alter table if exists public.author_custom_links enable row level security;
alter table if exists public.author_external_books enable row level security;
alter table if exists public.author_services enable row level security;

drop policy if exists "Public can view author profiles"
  on public.author_profiles;

create policy "Public can view author profiles"
on public.author_profiles
for select
to anon, authenticated
using (true);

drop policy if exists "Public can view author social links"
  on public.author_social_links;

create policy "Public can view author social links"
on public.author_social_links
for select
to anon, authenticated
using (true);

drop policy if exists "Public can view author custom links"
  on public.author_custom_links;

create policy "Public can view author custom links"
on public.author_custom_links
for select
to anon, authenticated
using (true);

drop policy if exists "Public can view author external books"
  on public.author_external_books;

create policy "Public can view author external books"
on public.author_external_books
for select
to anon, authenticated
using (true);

drop policy if exists "Public can view author services"
  on public.author_services;

create policy "Public can view author services"
on public.author_services
for select
to anon, authenticated
using (true);
