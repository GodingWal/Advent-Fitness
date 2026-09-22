# Advent Fitness API

Backend service for the Advent Fitness Expo app. The repo root stays the Expo mobile app; everything here lives under `advent-fitness-api/` and touches nothing outside it.

Stack: Node.js + TypeScript + Fastify + Zod. No database server is required for local dev: a repository layer with an in-memory store + seed data runs out of the box. `prisma/schema.prisma` (Postgres) is the source-of-truth schema for real deployments. Prisma is intentionally not installed (engines cannot download in this environment).

## Run

```bash
cd advent-fitness-api
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
| `DATABASE_URL` | Postgres URL for real Prisma deployments | — |

Passwords: `node:crypto` scrypt. Refresh tokens: opaque 32-byte, stored as SHA-256, 30 d, rotated on use; reuse is rejected with 401.

## Contract (base `http://localhost:3000`, JSON)

Auth:

- `POST /auth/register {email,password,name,phone?}` → `201 {accessToken,refreshToken,user}`
- `POST /auth/login {email,password}` → `200 {accessToken,refreshToken,user}`
- `POST /auth/refresh {refreshToken}` → `200 {accessToken,refreshToken}` (rotate; reused → `401`)
- `POST /auth/logout {refreshToken}` → `200` (revoke)
- `GET /auth/me` (Bearer) → `200 {user}`

Access (all Bearer):

- `GET /v1/memberships` → `{memberships:[{id,userId,gym:{id,name},locationIds,status,membershipType,startsAt,expiresAt,accessLevel}]}`
- `GET /v1/gyms/:gymId` → `{gym}`
- `GET /v1/gyms/:gymId/locations` → `{locations:[{id,gymId,name,address,latitude,longitude,timezone,status}]}`
- `GET /v1/locations/:locationId/doors` → `{doors:[{id,locationId,name,provider,enabled,requiresProximity,status,accessHours:{start,end,days[]}|null}]}` (`status` in `ONLINE|OFFLINE|UNKNOWN|DISABLED|MAINTENANCE`)
- `GET /v1/access/history` → `{events:[{id,doorId,doorName,result,reason,createdAt}]}` newest first, auth user only
- `POST /v1/access/doors/:doorId/unlock {latitude?,longitude?,accuracyMeters?}` → `200 {success:true,eventId,door:{id,name},unlockedAt}` or `200 {success:false,code,message}` or `429 {success:false,code:"RATE_LIMITED",message}` or `401`. Deny codes: `MEMBERSHIP_INACTIVE, MEMBERSHIP_EXPIRED, MEMBERSHIP_SUSPENDED, NO_MEMBERSHIP, DOOR_DISABLED, DOOR_OFFLINE, OUTSIDE_ACCESS_HOURS, OUTSIDE_PROXIMITY, PROVIDER_ERROR`. Every attempt writes an `AccessEvent`, including failures.
- `POST /v1/access/qr-token {membershipId}` → `200 {token,expiresAt}` (HS256 JWT, 60 s, single-use nonce); `GET /v1/access/qr-verify?token=` rejects replays with `{valid:false,code:"QR_REPLAY"}`
- `POST /v1/webhooks/kisi`: HMAC-SHA256 of the raw body vs `x-kisi-signature`; `401` on bad signature; dedupe by `body.event_id` (repeat → `200 {duplicate:true}`); maps provider door → Advent door and stores an `AccessEvent`

Authorization order in `authorizeDoorAccess(userId,doorId,ctx)`: user exists + active → door exists + enabled → gym/location active → membership for gym → status ACTIVE → not expired → location covered → access-hours/days → not suspended → rate limits (1/door/3 s per user, 10/min per user, 30 failed/hour per user → `RATE_LIMITED`) → proximity (server haversine vs location coords, default 150 m, per-door `radiusMeters`; client booleans never trusted) → provider unlock.

Providers (`src/providers/`, re-exported from `src/access/providers/`): `MockProvider` scripted by `provider_door_id` (`mock-front-door` ok, `mock-offline-door` OFFLINE, `mock-reject-door` denied, `mock-timeout-door` timeout, `mock-ratelimit-door` rate-limit); `KisiProvider` uses `fetch` against `KISI_API_BASE_URL` with `KISI_API_KEY`, normalizes responses, throws `PROVIDER_UNCONFIGURED` when env is missing; `ProviderFactory.getAccessProvider(name)`.

Audit: every `AccessEvent` stores `userId,doorId,gymId,action,result,reason,provider,providerEventId,deviceId?,ip,lat/lon?,createdAt`. Secrets and tokens are never logged or returned.
