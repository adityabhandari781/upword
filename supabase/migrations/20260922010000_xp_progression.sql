create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  round_id uuid not null,
  reveal_direction text not null,
  wrong_guesses smallint not null,
  xp integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  constraint xp_events_round_unique unique (user_id, round_id),
  constraint xp_events_reveal_direction
    check (reveal_direction in ('bottom-up', 'top-down', 'ends-to-center')),
  constraint xp_events_wrong_guesses check (wrong_guesses between 0 and 3),
  constraint xp_events_xp check (xp >= 0)
);

create index xp_events_user_id_index on public.xp_events (user_id);

alter table public.xp_events enable row level security;

revoke all on table public.xp_events from anon, authenticated;

-- ponytail: this prevents duplicate round awards but cannot prove browser-side play;
-- issue and verify server round tokens before treating XP as valuable or competitive.
create function public.award_xp(
  p_round_id uuid,
  p_reveal_direction text,
  p_wrong_guesses smallint
)
returns table (awarded_xp integer, total_xp bigint, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_awarded_xp integer;
begin
  if v_user_id is null then
    raise exception 'A signed-in profile is required' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where user_id = v_user_id) then
    raise exception 'A signed-in profile is required' using errcode = '42501';
  end if;

  if p_reveal_direction is null
    or p_reveal_direction not in ('bottom-up', 'top-down', 'ends-to-center')
    or p_wrong_guesses is null
    or p_wrong_guesses not between 0 and 3 then
    raise exception 'Invalid XP award' using errcode = '22023';
  end if;

  v_awarded_xp := case p_reveal_direction
    when 'bottom-up' then 100
    when 'top-down' then 75
    else 50
  end - (20 * p_wrong_guesses);

  insert into public.xp_events (user_id, round_id, reveal_direction, wrong_guesses, xp)
  values (v_user_id, p_round_id, p_reveal_direction, p_wrong_guesses, greatest(0, v_awarded_xp))
  on conflict (user_id, round_id) do nothing
  returning xp into v_awarded_xp;

  return query
  select
    coalesce(v_awarded_xp, 0),
    coalesce(sum(xp_events.xp), 0),
    1 + (coalesce(sum(xp_events.xp), 0) / 500)::integer
  from public.xp_events
  where xp_events.user_id = v_user_id;
end;
$$;

revoke execute on function public.award_xp(uuid, text, smallint) from public, anon;
grant execute on function public.award_xp(uuid, text, smallint) to authenticated;
