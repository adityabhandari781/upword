# Spec: Identity and Profile

Module id: `identity-profile`

## Objective

Let a player opt into progression by claiming a unique username without
providing personal information. Claiming a username creates a Supabase
anonymous user and a profile tied to that user. Supabase persists the session
in the current browser; signing out, clearing browser data, or changing devices
permanently loses access to the profile.

This module provides the authenticated identity consumed by `xp-progression`
and the auth-aware state consumed by `app-navigation`. It does not award XP,
calculate levels, or expose leaderboard data.

### Acceptance criteria

1. A signed-out player can keep playing but sees a “Log in to level up” action.
2. Submitting an available username creates one anonymous Supabase user and
   one profile owned by that user.
3. Returning in the same browser restores the session and profile without
   asking for the username again.
4. Usernames are normalized to lowercase and must contain 3–20 ASCII letters,
   digits, or underscores. A database constraint enforces the same rule.
5. Duplicate usernames fail with a clear, non-destructive message.
6. Failed authentication or profile creation never prevents unsigned play.
7. A player can read only their own profile through the Data API.
8. No secret or service-role key reaches browser code or version control.

## Tech Stack

- Existing static HTML, CSS, and browser ES modules.
- Supabase Auth anonymous sign-ins.
- Supabase Postgres `profiles` table with Row Level Security.
- Supabase JavaScript v2 loaded from the official documented jsDelivr CDN
  route and pinned to the exact current v2 release during implementation.
- Supabase CLI as a development-only tool for migrations and database policy
  tests; no new application framework or bundler.

The Supabase project URL and publishable key are public client configuration.
They are kept together in a small configuration module. Secret and
service-role keys are never client configuration.

## Commands

```sh
# Existing unit suite
npm test

# Parse-check browser modules
node --check js/auth.js
node --check js/profile.js

# Start the existing local web server
uv run python -m http.server 8000

# When the Supabase CLI and local Docker stack are available
npx supabase start
npx supabase db reset
npx supabase test db
```

## Project Structure

```text
CAPABILITY-MAP.md                         # Approved initiative boundaries
SPEC-identity-profile.md                  # This module contract
index.html                                # Login/profile dialog markup
js/supabase.js                            # Client configuration and singleton
js/auth.js                                # Anonymous session operations
js/profile.js                             # Username validation and profile API
tests/profile.test.js                     # Pure username rule tests
supabase/migrations/*_identity_profile.sql # Table, grants, constraints, RLS
supabase/tests/profiles_rls.test.sql      # Owner/visitor policy checks
```

## Interface Contract

The module exposes small functions rather than a class or auth framework:

```js
export function normalizeUsername(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

export async function getCurrentProfile() {}
export async function claimUsername(rawUsername) {}
```

`getCurrentProfile()` returns `null` when there is no usable session or profile.
`claimUsername()` validates locally, creates an anonymous session only when
needed, inserts the caller-owned profile, and returns a stable result object:

```js
{ ok: true, profile: { username, createdAt } }
{ ok: false, reason: 'invalid' | 'taken' | 'unavailable' }
```

The `profiles` table owns these fields:

```text
user_id     uuid primary key references auth.users(id) on delete cascade
username    text not null unique
created_at  timestamptz not null default now()
```

Database constraints repeat the username length and character rules. RLS and
explicit grants allow authenticated users to select and insert only the row
whose `user_id` equals `auth.uid()`. There is no client update or delete grant
in this module because renaming and account deletion were not requested.

## Code Style

- Keep Supabase calls outside `app.js`; the page consumes module results.
- Normalize and validate at both the browser boundary and database boundary.
- Return predictable results for expected user errors; throw only unexpected
  programming errors.
- Keep the game usable when the network or Supabase is unavailable.

## Testing Strategy

- Node tests cover username normalization and every accepted/rejected boundary.
- pgTAP policy tests prove signed-out users cannot access profiles, one
  authenticated user cannot read or insert another user's profile, an owner
  can create/read their own profile, and duplicate usernames fail.
- A browser check covers first claim, refresh restoration, duplicate-name
  feedback, network failure fallback, keyboard operation, and status
  announcements.
- The complete existing game suite must continue to pass.

## Boundaries

- Always: enable RLS before exposing the table; revoke broad default grants;
  validate on both client and database; preserve unsigned gameplay; use only a
  publishable key in browser code; announce errors accessibly.
- Ask first: change username rules, add recovery or another login provider,
  allow renaming/deletion, add CAPTCHA, or add a bundler.
- Never: expose service-role/secret keys, identify accounts by IP address,
  silently create an account before the player submits a username, or treat an
  anonymous Supabase session without a profile as progression-enabled.

## Success Criteria

1. All acceptance criteria pass in a configured Supabase project.
2. `npm test` and JavaScript parse checks pass.
3. `npx supabase test db` passes the profile grant and RLS checks.
4. Existing signed-out gameplay is unchanged when Supabase is absent or down.
5. The downstream modules can consume a stable `{ username, createdAt }`
   profile without knowing Supabase auth details.

## Open Questions

None after approval. Approving this spec also approves the 3–20 character
lowercase username rule, a pinned Supabase JavaScript v2 CDN dependency, and
the development-only Supabase CLI workflow.

## Official References

- Anonymous sign-ins: https://supabase.com/docs/guides/auth/auth-anonymous
- JavaScript installation: https://supabase.com/docs/reference/javascript/installing
- Browser client initialization: https://supabase.com/docs/reference/javascript/initializing
- API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Data API security: https://supabase.com/docs/guides/database/secure-data
