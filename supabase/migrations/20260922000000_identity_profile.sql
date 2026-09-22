create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint profiles_username_unique unique (username),
  constraint profiles_username_format
    check (username ~ '^[a-z0-9_]{3,20}$')
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant insert (user_id, username) on table public.profiles to authenticated;

create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);
