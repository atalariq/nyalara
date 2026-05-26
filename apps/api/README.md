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
- A seeded electricity emission factor for end-to-end energy flows

Seed the emission factor when needed:

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

Returns the active electricity emission factors used by the backend.

### Devices

- `GET /v1/devices`
- `POST /v1/devices`
- `PATCH /v1/devices/{deviceId}`
- `DELETE /v1/devices/{deviceId}`

Device writes use fields such as:

- `name`
- `category`
- `deviceType`
- `watt`
- `defaultDurationMinutes`

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
