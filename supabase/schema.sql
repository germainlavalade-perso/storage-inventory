-- Storage Inventory Database Schema
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard → SQL Editor)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Locations table
create table locations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamptz default now() not null
);

-- Photos table
create table photos (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz default now() not null
);

-- Items table
create table items (
  id uuid primary key default uuid_generate_v4(),
  location_id uuid not null references locations(id) on delete cascade,
  photo_id uuid references photos(id) on delete set null,
  name text not null,
  quantity integer not null default 1,
  category text,
  notes text,
  created_at timestamptz default now() not null
);

-- Indexes for common queries
create index items_location_id_idx on items(location_id);
create index items_name_idx on items using gin(to_tsvector('english', name));
create index photos_location_id_idx on photos(location_id);

-- Enable Row Level Security (open access — add auth later if needed)
alter table locations enable row level security;
alter table photos enable row level security;
alter table items enable row level security;

create policy "Allow all on locations" on locations for all using (true) with check (true);
create policy "Allow all on photos" on photos for all using (true) with check (true);
create policy "Allow all on items" on items for all using (true) with check (true);

-- Storage bucket for photos
-- Run this separately in the Supabase dashboard → Storage → New Bucket
-- Bucket name: "photos", Public: true

