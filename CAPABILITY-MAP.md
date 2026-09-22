# Capability Map: Accounts and Progression

| Module id | Responsibility | Depends on |
|---|---|---|
| `identity-profile` | Anonymous sign-in, unique username, session, and profile data | Supabase |
| `xp-progression` | Award validated win XP, prevent duplicate awards, and derive level and progress | `identity-profile`, existing game |
| `leaderboard` | Rank players by level, then total XP | `xp-progression` |
| `app-navigation` | Accessible hash navigation and an auth-aware Profile/login item | `identity-profile`, `leaderboard` |

Build order: `identity-profile` → `xp-progression` → `leaderboard` → `app-navigation`.

## Initiative Constraints

- Supabase Anonymous Auth supplies the device-bound session.
- Existing gameplay rules remain unchanged.
- Level is derived from total XP rather than stored separately.
- Only completed wins create XP records, once per round.
- Leaderboards are publicly readable; profile details require the owning session.
- Account recovery, cross-device login, and strong anti-cheat are out of scope.
