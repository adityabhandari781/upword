begin;

create extension if not exists pgtap with schema extensions;

select plan(9);

select has_table('public', 'xp_events', 'xp events table exists');
select ok(
  has_table_privilege('authenticated', 'public.xp_events', 'select') = false,
  'authenticated cannot read raw XP events'
);
select ok(
  has_table_privilege('authenticated', 'public.xp_events', 'insert') = false,
  'authenticated cannot insert raw XP events'
);
select ok(
  has_function_privilege(
    'authenticated',
    'public.award_xp(uuid, text, smallint)',
    'execute'
  ),
  'authenticated can call the XP award function'
);

insert into auth.users (id, aud, role, email)
values ('00000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated', 'xp-player@test.invalid')
on conflict (id) do nothing;

insert into public.profiles (user_id, username)
values ('00000000-0000-0000-0000-000000000011', 'xp_player')
on conflict (user_id) do nothing;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000011","role":"authenticated"}';

select results_eq(
  $$select awarded_xp, total_xp, level from public.award_xp(
    '00000000-0000-0000-0000-000000000101', 'bottom-up', 2
  )$$,
  $$values (60::integer, 60::bigint, 1::integer)$$,
  'a signed-in win receives XP based on direction and wrong guesses'
);
select results_eq(
  $$select awarded_xp, total_xp, level from public.award_xp(
    '00000000-0000-0000-0000-000000000101', 'bottom-up', 2
  )$$,
  $$values (0::integer, 60::bigint, 1::integer)$$,
  'repeating a round does not award XP twice'
);
select results_eq(
  $$select awarded_xp, total_xp, level from public.award_xp(
    '00000000-0000-0000-0000-000000000102', 'top-down', 0
  )$$,
  $$values (75::integer, 135::bigint, 1::integer)$$,
  'different rounds accumulate XP'
);
select throws_ok(
  $$select * from public.award_xp(
    '00000000-0000-0000-0000-000000000103', 'bottom-up', 4
  )$$,
  '22023',
  'Invalid XP award',
  'invalid wrong-guess counts are rejected'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000012","role":"authenticated"}';

select throws_ok(
  $$select * from public.award_xp(
    '00000000-0000-0000-0000-000000000104', 'bottom-up', 0
  )$$,
  '42501',
  'A signed-in profile is required',
  'a user without a profile cannot earn XP'
);

select * from finish();
rollback;
