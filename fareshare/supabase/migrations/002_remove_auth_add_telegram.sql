-- Remove Supabase Auth dependency, add Telegram identity
-- Profiles become standalone with telegram_id as the user identifier

-- Drop the auth trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Remove the FK to auth.users by recreating the PK without the reference
-- First drop dependent FKs, then re-add them after altering profiles
alter table public.seats drop constraint if exists seats_passenger_id_fkey;
alter table public.rides drop constraint if exists rides_driver_id_fkey;
alter table public.requests drop constraint if exists requests_requester_id_fkey;

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles drop constraint profiles_pkey;
alter table public.profiles add primary key (id);
alter table public.profiles alter column id set default gen_random_uuid();

-- Add Telegram identity column
alter table public.profiles add column telegram_id text unique;

-- Make display_name nullable (auto-populated from Telegram first_name)
alter table public.profiles alter column display_name drop not null;

-- Re-add FKs to profiles (without the auth.users chain)
alter table public.rides
  add constraint rides_driver_id_fkey
  foreign key (driver_id) references public.profiles(id) on delete cascade;

alter table public.seats
  add constraint seats_passenger_id_fkey
  foreign key (passenger_id) references public.profiles(id) on delete cascade;

alter table public.requests
  add constraint requests_requester_id_fkey
  foreign key (requester_id) references public.profiles(id) on delete cascade;

-- Disable RLS on all tables
-- Agent uses service_role key which bypasses RLS anyway
alter table public.profiles disable row level security;
alter table public.rides disable row level security;
alter table public.seats disable row level security;
alter table public.requests disable row level security;
