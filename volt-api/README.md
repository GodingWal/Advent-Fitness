# Volt API

Backend service for the Volt Expo app. The repo root stays the Expo mobile app; everything here lives under `volt-api/` and touches nothing outside it.

Stack: Node.js + TypeScript + Fastify + Zod + Prisma 5 (Postgres). No database server is required for local dev: when `DATABASE_URL` is unset the API runs on an in-memory store + seed data out of the box. `prisma/schema.prisma` (Postgres) is the source-of-truth schema for real deployments; checked-in SQL lives in `prisma/migrations/0001_init/migration.sql` (generated offline via `prisma migrate diff`, no DB needed) plus `prisma/migrations/0002_profile/migration.sql` (`Profile` model + `User.emailVerified`, generated the same way; `0001` untouched).

## Run

```bash
cd volt-api
npm install
npm run build
npm start        # serves http://localhost:3000
# dev (one line, watch): tsc --watch  (run `npm run dev`)
npm test         # vitest run, no external services
```

Seed (dev only, on boot): user `member@volt.test` / `Volt12345!`, gym `Snap Fitness`, location `Albert Lea, MN` (43.648, -93.368), doors `front-entrance` (MOCK `mock-front-door`, ONLINE) + `side-entrance` (MOCK `mock-front-door`, hours 06:00-22:00 daily), ACTIVE membership expiring in +1y. Credentials are logged to console in dev only.

## Env vars

| Var | Purpose | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `development` enables seed + credential log | `development` |
| `AUTH_JWT_SECRET` | HS256 secret for access tokens (15 min) | `dev-auth-secret-change-me` |
| `QR_SECRET` | HS256 secret for single-use QR tokens (60 s) | `dev-qr-secret-change-me` |
| `KISI_WEBHOOK_SECRET` | HMAC-SHA256 secret for `x-kisi-signature` | `dev-kisi-webhook-secret` |
| `KISI_API_BASE_URL` | Kisi API base URL (server-side only) | `` (unset = unconfigured) |
| `KISI_API_KEY` | Kisi API key (server-side only, never returned) | `` |
| `GOOGLE_PLACES_API_KEY` | Google Places key for `GET /places/nearby` (server-side only, never echoed) | `` (unset → `503 PLACES_UNCONFIGURED`) |
| `DATABASE_URL` | Postgres URL for real Prisma deployments | — (unset = in-memory store) |

Production secrets: if `NODE_ENV=production` and any of `AUTH_JWT_SECRET` / `QR_SECRET` / `KISI_WEBHOOK_SECRET` still equals its dev default, the process throws on boot instead of serving. Set real values in production.

## Places proxy (no `/v1` prefix)

- `GET /places/nearby?category=&latitude=&longitude=&radius=` (radius defaults to `5000`) → raw JSON array of `{id,category,name,address,rating,coordinate:{latitude,longitude},photo,open}` — the same shape as the mobile app's direct-Google mapping (`src/services/places.js`). The mobile app prefers this proxy so the Google key stays off-device.
- Query is validated with Zod (`category` string, numeric `latitude`/`longitude`, positive-int `radius`). Bad query → `400`.
- Key is read ONLY from server env `GOOGLE_PLACES_API_KEY`; unset → `503 {success:false,code:"PLACES_UNCONFIGURED",message}`. The key is sent to Google in the upstream query string but is never echoed in any response (returned `photo` URLs carry no key).

## Postgres (optional) — memory fallback by default

With no `DATABASE_URL` set, all routes run against the existing in-memory store (`src/db/memoryStore.ts`); no services needed and the full test suite passes offline. When `DATABASE_URL` is set, routes use the Prisma-backed store instead: `src/db/store.ts` exports `getStore()`, which returns the memory or Prisma (`src/db/prismaStore.ts`) implementation behind the same async method surface; routes call `getStore()` and never touch Maps directly. Ephemeral data (refresh tokens, email-verify / password-reset tokens, QR nonces, Kisi dedupe, rate limits) stays in process memory in both modes.

Local Postgres:

```bash
cd volt-api
docker compose up -d                                   # postgres:16, db volt / user volt / password volt, port 5432
DATABASE_URL=postgresql://volt:volt@localhost:5432/volt npx prisma migrate deploy
DATABASE_URL=postgresql://volt:volt@localhost:5432/volt npm start
```

`tests/prisma.integration.test.ts` runs only when `DATABASE_URL` is set (skipped otherwise) and exercises register → membership → unlock → history against the Prisma store.

## E2E smoke

`scripts/e2e.js` (plain node, global `fetch`, no deps) assumes the server is on `http://localhost:3000` (override with `E2E_BASE_URL`): login seed `member@volt.test` / `Volt12345!` → memberships → locations → doors → unlock front door (asserts `success:true`) → history (asserts newest `GRANTED`) → qr-token → qr-verify (`valid:true`); exits non-zero with a message on any failure.

```bash
cd volt-api
npm run build && npm start        # terminal 1
npm run e2e                       # terminal 2
```

Passwords: `node:crypto` scrypt. Refresh tokens: opaque 32-byte, stored as SHA-256, 30 d, rotated on use; reuse is rejected with 401.

## Contract (base `http://localhost:3000`, JSON)

Auth:

- `POST /auth/register {email,password,name,phone?}` → `201 {accessToken,refreshToken,user}` (`user` includes `emailVerified:false`; non-production also returns `devVerificationToken`, see below)
- `POST /auth/login {email,password}` → `200 {accessToken,refreshToken,user}` (login works whether or not the email is verified — verification is notice-only)
- `POST /auth/refresh {refreshToken}` → `200 {accessToken,refreshToken}` (rotate; reused → `401`)
- `POST /auth/logout {refreshToken}` → `200` (revoke)
- `GET /auth/me` (Bearer) → `200 {user}`
- Duplicate register → `409 {code:"EMAIL_TAKEN",message:"An account with this email already exists. Try logging in or reset your password."}`
- `POST /auth/verify-email {token}` → `200 {verified:true}`; unknown token → `404 {code:"INVALID_TOKEN"}`, expired token (24 h TTL) → `410 {code:"INVALID_TOKEN"}`
- `POST /auth/password-reset/request {email}` → always `200 {sent:true}` (unknown emails get the same response — no user enumeration); non-production also returns `devResetToken` for real accounts
- `POST /auth/password-reset/confirm {token,newPassword}` (`newPassword` min 8 via Zod, else `400`) → `200 {success:true}`; single-use tokens (1 h TTL, reuse/unknown → `404 {code:"INVALID_TOKEN"}`, expired → `410`); confirm revokes all of the user's refresh tokens

Dev tokens: register's `devVerificationToken` and reset-request's `devResetToken` are returned ONLY when `NODE_ENV != production` (never in prod) and are also `console.log`ged server-side in non-production. Tokens are random 32-byte hex; only their SHA-256 is stored. They are never logged or returned in production, and password hashes / stored token hashes never appear in any response.

Profile (all Bearer):

- `GET /v1/profile` → `200 {profile}` (auto-creates the default profile when missing)
- `PUT /v1/profile` (all fields optional, unknown fields stripped) → `200 {profile}`
- Shape: `{id,userId,weeklyTargetH (default 3),goal (default ""),activities (default []),homeGymId (default null),privacy (default {}),units (default "mi"),experience (default "beginner"),notifications (default {}),onboardingCompleted (default false),updatedAt}` — a default row is created on register in both memory and Prisma modes

Access (all Bearer):

- `GET /v1/memberships` → `{memberships:[{id,userId,gym:{id,name},locationIds,status,membershipType,startsAt,expiresAt,accessLevel}]}`
- `GET /v1/gyms/:gymId` → `{gym}`
- `GET /v1/gyms/:gymId/locations` → `{locations:[{id,gymId,name,address,latitude,longitude,timezone,status}]}`
- `GET /v1/locations/:locationId/doors` → `{doors:[{id,locationId,name,provider,enabled,requiresProximity,status,accessHours:{start,end,days[]}|null}]}` (`status` in `ONLINE|OFFLINE|UNKNOWN|DISABLED|MAINTENANCE`)
- `GET /v1/access/history` → `{events:[{id,doorId,doorName,result,reason,createdAt}]}` newest first, auth user only
- `POST /v1/access/doors/:doorId/unlock {latitude?,longitude?,accuracyMeters?}` → `200 {success:true,eventId,door:{id,name},unlockedAt}` or `200 {success:false,code,message}` or `429 {success:false,code:"RATE_LIMITED",message}` or `401`. Deny codes: `MEMBERSHIP_INACTIVE, MEMBERSHIP_EXPIRED, MEMBERSHIP_SUSPENDED, NO_MEMBERSHIP, DOOR_DISABLED, DOOR_OFFLINE, OUTSIDE_ACCESS_HOURS, OUTSIDE_PROXIMITY, PROVIDER_ERROR`. Every attempt writes an `AccessEvent`, including failures.
- `POST /v1/access/qr-token {membershipId}` → `200 {token,expiresAt}` (HS256 JWT, 60 s, single-use nonce); `GET /v1/access/qr-verify?token=` rejects replays with `{valid:false,code:"QR_REPLAY"}`
- `POST /v1/webhooks/kisi`: HMAC-SHA256 of the raw body vs `x-kisi-signature`; `401` on bad signature; dedupe by `body.event_id` (repeat → `200 {duplicate:true}`); maps provider door → Volt door and stores an `AccessEvent`

Places (no `/v1` prefix, no auth):

- `GET /places/nearby?category=&latitude=&longitude=&radius=` → raw JSON array (see above); `503 {success:false,code:"PLACES_UNCONFIGURED"}` when unconfigured

Authorization order in `authorizeDoorAccess(userId,doorId,ctx)`: user exists + active → door exists + enabled → gym/location active → membership for gym → status ACTIVE → not expired → location covered → access-hours/days → not suspended → rate limits (1/door/3 s per user, 10/min per user, 30 failed/hour per user → `RATE_LIMITED`) → proximity (server haversine vs location coords, default 150 m, per-door `radiusMeters`; client booleans never trusted) → provider unlock.

Providers (`src/access/providers/`): `MockProvider` scripted by `provider_door_id` (`mock-front-door` ok, `mock-offline-door` OFFLINE, `mock-reject-door` denied, `mock-timeout-door` timeout, `mock-ratelimit-door` rate-limit); `KisiProvider` uses `fetch` against `KISI_API_BASE_URL` with `KISI_API_KEY`, normalizes responses, throws `PROVIDER_UNCONFIGURED` when env is missing; `ProviderFactory.getAccessProvider(name)`.

Audit: every `AccessEvent` stores `userId,doorId,gymId,action,result,reason,provider,providerEventId,deviceId?,ip,lat/lon?,createdAt`. Secrets and tokens are never logged or returned.
