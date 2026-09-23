# volt-web

Customer-facing VOLT website (Next.js 14 App Router + TypeScript). Uses `volt-api` as the source of truth — no business logic is duplicated.

## Run locally

```bash
# from repo root (Windows-safe, Node 24)
npm run dev:web     # web on http://localhost:3001 (expects API on :3000)
npm run dev:all     # volt-api + Expo + volt-web together

# inside volt-web
npm install
npm run dev         # http://localhost:3001
npm test            # vitest unit tests
npm run typecheck
npm run build
npm run e2e         # Playwright (needs dev server + API running)
```

## Env

| Var | Purpose | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Public volt-api base URL | `http://localhost:3000` |
| `VOLT_API_URL` | Server-only override for proxies | falls back to `NEXT_PUBLIC_API_URL` |

Copy `.env.example` to `.env.local` for local overrides.

## Auth architecture

- Refresh token lives in a secure, HTTP-only, SameSite cookie (`volt_rt`).
- Short-lived access token in a second HTTP-only cookie (`volt_at`, 15 min).
- Browser never sees tokens: all `/v1/*` calls go through `/api/volt/[...path]`, which forwards with `Authorization: Bearer` server-side and retries once after a refresh on 401.
- Login/register/logout/refresh are same-origin POST proxies under `/api/auth/*` with Origin checks.
- `middleware.ts` redirects signed-out users from `/app/*` and `/onboarding/*` to `/login?next=…`.
- No tokens in `localStorage`. No raw Axios/network errors shown; see `src/lib/auth/messages.ts`.

## Routes

Public: `/`, `/features`, `/gym-access`, `/for-gyms`, `/safety`, `/privacy`, `/terms`, `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`.
Onboarding: `/onboarding/profile|goal|activities|gym|complete`.
App: `/app`, `/app/activities[/new|/[id]]`, `/app/discover[/[spotId]]`, `/app/community[/post/[id]]`, `/app/meetups[/new|/[id]]`, `/app/messages[/[id]]`, `/app/profile[/edit|/achievements]`, `/app/settings`, `/app/gym[/memberships|/locations/[id]|/access-history]`.

## Gym-access security

The browser never receives provider credentials and never calls a lock. Web can list memberships/locations/doors/history and mint a 60 s single-use QR (`POST /v1/access/qr-token`). Door `unlock` is intentionally not exposed in web UI; physical unlocking stays on the registered mobile app.

## Testing

- `npm test` — validation, error normalization, formatting, membership rendering, auth messages.
- `npm run e2e` — landing, login validation, auth redirect, mobile nav, API-down copy.
- Backend social coverage: `volt-api/tests/social.test.ts`.
