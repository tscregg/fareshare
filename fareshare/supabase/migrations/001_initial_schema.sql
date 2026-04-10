-- FareShare: Initial Schema
-- 4 tables: profiles, rides, seats, requests
-- RLS policies for authenticated access
-- Auto-create profile trigger on signup

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RIDES
create table public.rides (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references public.profiles(id) on delete cascade,
  origin text not null,
  destination text not null,
  departure_date date not null,
  departure_time text not null,
  total_seats integer not null check (total_seats between 1 and 8),
  suggested_donation numeric(6,2) not null default 0,
  note text,
  status text not null default 'open' check (status in ('open','full','cancelled','completed')),
  created_at timestamptz not null default now()
);

alter table public.rides enable row level security;

create policy "Rides are viewable by authenticated users"
  on public.rides for select
  to authenticated
  using (true);

create policy "Users can insert own rides"
  on public.rides for insert
  to authenticated
  with check (driver_id = auth.uid());

create policy "Users can update own rides"
  on public.rides for update
  to authenticated
  using (driver_id = auth.uid());

create policy "Users can delete own rides"
  on public.rides for delete
  to authenticated
  using (driver_id = auth.uid());

create index idx_rides_status on public.rides(status);
create index idx_rides_departure_date on public.rides(departure_date);
create index idx_rides_driver_id on public.rides(driver_id);

-- SEATS
create table public.seats (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references public.rides(id) on delete cascade,
  passenger_id uuid not null references public.profiles(id) on delete cascade,
  claimed_at timestamptz not null default now(),
  unique (ride_id, passenger_id)
);

alter table public.seats enable row level security;

create policy "Seats are viewable by authenticated users"
  on public.seats for select
  to authenticated
  using (true);

create policy "Users can claim seats for themselves"
  on public.seats for insert
  to authenticated
  with check (passenger_id = auth.uid());

create policy "Users can cancel own seats"
  on public.seats for delete
  to authenticated
  using (passenger_id = auth.uid());

create index idx_seats_ride_id on public.seats(ride_id);
create index idx_seats_passenger_id on public.seats(passenger_id);

-- REQUESTS
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  origin text not null,
  destination text not null,
  preferred_date text not null,
  preferred_time text,
  note text,
  status text not null default 'open' check (status in ('open','claimed','cancelled')),
  created_at timestamptz not null default now()
);

alter table public.requests enable row level security;

create policy "Requests are viewable by authenticated users"
  on public.requests for select
  to authenticated
  using (true);

create policy "Users can insert own requests"
  on public.requests for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "Users can update own requests"
  on public.requests for update
  to authenticated
  using (requester_id = auth.uid());

create policy "Users can delete own requests"
  on public.requests for delete
  to authenticated
  using (requester_id = auth.uid());

create index idx_requests_status on public.requests(status);
create index idx_requests_requester_id on public.requests(requester_id);
