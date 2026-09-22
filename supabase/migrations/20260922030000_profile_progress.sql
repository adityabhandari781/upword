create function public.get_my_progress()
returns table (username text, total_xp bigint, level integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null
    or not exists (select 1 from public.profiles where user_id = v_user_id) then
    raise exception 'A signed-in profile is required' using errcode = '42501';
  end if;

  return query
  select
    profiles.username,
    coalesce(sum(xp_events.xp), 0),
    1 + (coalesce(sum(xp_events.xp), 0) / 500)::integer
  from public.profiles
  left join public.xp_events on xp_events.user_id = profiles.user_id
  where profiles.user_id = v_user_id
  group by profiles.username;
end;
$$;

revoke execute on function public.get_my_progress() from public, anon;
grant execute on function public.get_my_progress() to authenticated;
