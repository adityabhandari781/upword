create function public.get_leaderboard(p_limit integer default 50)
returns table (rank bigint, username text, total_xp bigint, level integer)
language sql
security definer
set search_path = ''
as $$
  with totals as (
    select
      profiles.username,
      sum(xp_events.xp)::bigint as total_xp
    from public.profiles
    join public.xp_events on xp_events.user_id = profiles.user_id
    group by profiles.user_id, profiles.username
  )
  select
    row_number() over (order by total_xp / 500 desc, total_xp desc, username asc),
    username,
    total_xp,
    1 + (total_xp / 500)::integer
  from totals
  order by total_xp / 500 desc, total_xp desc, username asc
  limit greatest(1, least(coalesce(p_limit, 50), 100));
$$;

revoke execute on function public.get_leaderboard(integer) from public;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
