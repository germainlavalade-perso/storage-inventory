-- Auth migration — run this in Supabase SQL Editor
-- This adds per-user data isolation to the app

-- 1. Add user_id column to locations (auto-filled from auth session)
alter table locations
  add column if not exists user_id uuid references auth.users(id) on delete cascade default auth.uid();

-- 2. Re-enable Row Level Security on all tables
alter table locations enable row level security;
alter table photos enable row level security;
alter table items enable row level security;

-- 3. Drop old open-access policies
drop policy if exists "Allow all on locations" on locations;
drop policy if exists "Allow all on photos" on photos;
drop policy if exists "Allow all on items" on items;

-- 4. Locations: each user sees and manages only their own
create policy "locations_policy" on locations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Photos: accessible only if the parent location belongs to the user
create policy "photos_policy" on photos
  for all
  using (
    exists (
      select 1 from locations l
      where l.id = photos.location_id and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from locations l
      where l.id = photos.location_id and l.user_id = auth.uid()
    )
  );

-- 6. Items: accessible only if the parent location belongs to the user
create policy "items_policy" on items
  for all
  using (
    exists (
      select 1 from locations l
      where l.id = items.location_id and l.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from locations l
      where l.id = items.location_id and l.user_id = auth.uid()
    )
  );

-- 7. Storage bucket policies (Photos bucket)
drop policy if exists "Allow all storage operations" on storage.objects;

create policy "Authenticated users can upload" on storage.objects
  for insert
  with check (bucket_id = 'Photos' and auth.role() = 'authenticated');

create policy "Authenticated users can read" on storage.objects
  for select
  using (bucket_id = 'Photos' and auth.role() = 'authenticated');

create policy "Authenticated users can delete" on storage.objects
  for delete
  using (bucket_id = 'Photos' and auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────────
-- OPTIONAL: Claim existing data after you sign up
-- After signing up, go to Supabase → Authentication → Users, copy your user ID
-- then run this to assign your existing locations to your account:
--
--   update locations set user_id = 'YOUR-USER-UUID-HERE' where user_id is null;
-- ─────────────────────────────────────────────────────────────────────────────
