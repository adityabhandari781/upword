begin;

create extension if not exists pgtap with schema extensions;

select plan(3);

select ok(
  has_function_privilege('authenticated', 'public.get_my_progress()', 'execute'),
  'authenticated players can view their own progress'
);
select ok(
  has_function_privilege('anon', 'public.get_my_progress()', 'execute') = false,
  'signed-out players cannot view profile progress'
);

insert into auth.users (id, aud, role, email)
values ('00000000-0000-0000-0000-000000000031', 'authenticated', 'authenticated', 'progress-player@test.invalid')
on conflict (id) do nothing;

insert into public.profiles (user_id, username)
values ('00000000-0000-0000-0000-000000000031', 'progress_player')
on conflict (user_id) do nothing;

insert into public.xp_events (user_id, round_id, reveal_direction, wrong_guesses, xp)
values ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000301', 'bottom-up', 0, 500);

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000031","role":"authenticated"}';

select results_eq(
  $$select username, total_xp, level from public.get_my_progress()$$,
  $$values ('progress_player'::text, 500::bigint, 2::integer)$$,
  'a player can view their own total XP and level'
);

select * from finish();
rollback;
