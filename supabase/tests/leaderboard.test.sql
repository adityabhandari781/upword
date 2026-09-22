begin;

create extension if not exists pgtap with schema extensions;

select plan(4);

select ok(
  has_function_privilege('anon', 'public.get_leaderboard(integer)', 'execute'),
  'signed-out players can view the leaderboard'
);

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-0000-0000-000000000021', 'authenticated', 'authenticated', 'leader-one@test.invalid'),
  ('00000000-0000-0000-0000-000000000022', 'authenticated', 'authenticated', 'leader-two@test.invalid')
on conflict (id) do nothing;

insert into public.profiles (user_id, username)
values
  ('00000000-0000-0000-0000-000000000021', 'leader_one'),
  ('00000000-0000-0000-0000-000000000022', 'leader_two')
on conflict (user_id) do nothing;

insert into public.xp_events (user_id, round_id, reveal_direction, wrong_guesses, xp)
values
  ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000201', 'bottom-up', 0, 600),
  ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000202', 'bottom-up', 0, 499);

set local role anon;

select results_eq(
  $$select rank, username, total_xp, level from public.get_leaderboard(10)$$,
  $$values
    (1::bigint, 'leader_one'::text, 600::bigint, 2::integer),
    (2::bigint, 'leader_two'::text, 499::bigint, 1::integer)$$,
  'the leaderboard ranks level, then XP'
);
select results_eq(
  $$select rank, username, total_xp, level from public.get_leaderboard(1)$$,
  $$values (1::bigint, 'leader_one'::text, 600::bigint, 2::integer)$$,
  'the leaderboard respects its limit'
);
select throws_ok(
  $$select count(*) from public.xp_events$$,
  '42501',
  'permission denied for table xp_events',
  'signed-out players cannot read raw XP events'
);

select * from finish();
rollback;
