begin;

create extension if not exists pgtap with schema extensions;

select plan(15);

select has_table('public', 'profiles', 'profiles table exists');
select col_is_pk('public', 'profiles', 'user_id', 'user_id is the primary key');
select policies_are(
  'public',
  'profiles',
  array[
    'Users can view their own profile',
    'Users can create their own profile'
  ],
  'profiles exposes only the two owner policies'
);
select ok(
  has_table_privilege('anon', 'public.profiles', 'select') = false,
  'anon cannot select profiles'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'select'),
  'authenticated can select profiles'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'insert'),
  'authenticated can insert profiles'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'update') = false,
  'authenticated cannot update profiles'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'delete') = false,
  'authenticated cannot delete profiles'
);
select ok(
  has_column_privilege('authenticated', 'public.profiles', 'created_at', 'insert') = false,
  'authenticated cannot choose a profile creation timestamp'
);

insert into auth.users (id, aud, role, email)
values
  ('00000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated', 'profile-one@test.invalid'),
  ('00000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated', 'profile-two@test.invalid')
on conflict (id) do nothing;

set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}';

select lives_ok(
  $$insert into public.profiles (user_id, username)
    values ('00000000-0000-0000-0000-000000000001', 'player_one')$$,
  'an owner can create a profile'
);
select results_eq(
  $$select username from public.profiles$$,
  $$values ('player_one'::text)$$,
  'an owner can read their profile'
);
select throws_ok(
  $$insert into public.profiles (user_id, username)
    values ('00000000-0000-0000-0000-000000000002', 'player_two')$$,
  '42501',
  'an owner cannot insert another user profile'
);
select throws_ok(
  $$insert into public.profiles (user_id, username)
    values ('00000000-0000-0000-0000-000000000001', 'Not_Allowed')$$,
  '23514',
  'uppercase usernames are rejected by the database'
);
select throws_ok(
  $$insert into public.profiles (user_id, username)
    values ('00000000-0000-0000-0000-000000000001', 'player_one')$$,
  '23505',
  'duplicate usernames are rejected by the database'
);

reset role;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}';

select is(
  (select count(*) from public.profiles),
  0::bigint,
  'another user cannot read an owner profile'
);

select * from finish();
rollback;
