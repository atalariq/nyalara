# Nyalara API

This package contains the Hono backend API for Nyalara. It supports calculations, persistence, summaries, and insight generation for the mobile experience.

## Quick Start

From the repository root:

```bash
pnpm install
pnpm --filter api dev
```

The development server runs on `http://localhost:3000` by default.

## Local Requirements

- `apps/api/.env` based on `apps/api/.env.example`
- Firebase Admin credentials through Application Default Credentials
- Seeded electricity emission factors for end-to-end energy flows

Seed emission factors when needed:

```bash
pnpm --filter api seed:emission-factors
```

See [../../SETUP.md](../../SETUP.md) for the full local setup and [../../docs/firebase-setup.md](../../docs/firebase-setup.md) for Firebase and Admin SDK details.

## API Documentation

In non-production environments, generated docs are available at:

- `GET /v1/doc`
- `GET /v1/ui`

## Quick Reference

### Base Behavior

- Base path: `/v1`
- Protected routes expect `Authorization: Bearer <Firebase ID token>`
- Success responses use:

```json
{
  "success": true,
  "data": {}
}
```

- Error responses use:

```json
{
  "success": false,
  "error": {
    "code": "some_error_code",
    "message": "Human-readable message",
    "details": []
  }
}
```

### Session Policy

- Public:
  - `GET /v1/health`
  - `GET /v1/emission-factors`
  - `GET /v1/doc` and `GET /v1/ui` in non-production
- Guest and full-account sessions:
  - devices
  - calculations
  - electricity usages
  - monthly summaries
- Full-account only:
  - `POST /v1/generate-energy-insight`

### Platform

- `GET /v1/health`

Returns service health.

### Emission Factors

- `GET /v1/emission-factors`

Returns active electricity emission factors (public endpoint, no auth).

Current seed strategy:

- Indonesia is a special case with multiple active regional factors plus one active national fallback.
- Other countries are seeded with national or grid-representative factors from official publications.

Current backend selection behavior for calculations and usage writes:

- Prefer active factor `country=ID` and `region=national` when available.
- If that is unavailable, fallback uses deterministic ID ordering on active factors.

Verification references are documented in:

- `docs/emission-factors-sources.md`

### Devices

- `GET /v1/devices`
- `POST /v1/devices`
- `PATCH /v1/devices/{deviceId}`
- `DELETE /v1/devices/{deviceId}`

Device writes use fields such as:

- `name`
- `category`
- `deviceType`
- `location` optional:
  - `bedroom`
  - `bathroom`
  - `living_room`
  - `kitchen`
  - `dining_room`
  - `other`
- `watt`
- `defaultDurationMinutes`

Device responses include `location`.

Compatibility behavior:

- If `location` is not provided on create, backend defaults it to `other`.
- Legacy device records without stored location are returned as `location: "other"`.
- `PATCH /v1/devices/{deviceId}` only updates `location` when that field is sent.

### Calculations

- `POST /v1/calculate-electricity`

Supported `inputType` values:

- `kwh`
- `meter_reading`

This verifies an electricity calculation without creating a persisted usage record.

### Electricity Usages

- `POST /v1/electricity-usages`
- `PATCH /v1/electricity-usages/{usageId}`
- `DELETE /v1/electricity-usages/{usageId}`
- `GET /v1/electricity-usages?month=YYYY-MM`

Supported create `inputType` values:

- `kwh`
- `meter_reading`
- `device_breakdown`

Create requests require:

- `clientGeneratedId`
- `inputType`
- `input`
- `period`
- `source`
- `timestamps`

Mutation responses include:

- `usageId`
- `usage`
- `monthlySummary`
- `currentStreak`

### Monthly Summary

- `GET /v1/monthly-summary?month=YYYY-MM`
- `POST /v1/recalculate-monthly-summary`

These routes return:

- `monthlySummary`
- `currentStreak`

### Energy Insights

- `POST /v1/generate-energy-insight`

Request fields:

- `month`
- `force` optional, defaults to `false`

Response fields include:

- `insightId`
- `title`
- `summary`
- `isStale`
- `suggestions`

There is no separate `GET /v1/energy-insight` route at the moment.

## Related Docs

- [../../README.md](../../README.md)
- [../../docs/PRD.md](../../docs/PRD.md)
- [../../docs/adr/0002-backend-owned-devices-and-usage-log-centric-tracking.md](../../docs/adr/0002-backend-owned-devices-and-usage-log-centric-tracking.md)
