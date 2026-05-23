# Context Map

This monorepo has multiple product/engineering contexts. Use this file to route work to the correct `CONTEXT.md`.

## Contexts

| Context | Path | Purpose |
| --- | --- | --- |
| Mobile App | `apps/mobile` | Expo client for authentication, logging usage, dashboard/history, and offline UX |
| Backend API | `apps/api` | Hono service for verified calculation, summaries, and Gemini-powered insights |
| Shared Package | `packages/shared` | Shared types/contracts used by mobile and backend |

## Entry rule for agents

1. Start in the context that matches the requested change.
2. If a change spans contexts, read each involved `CONTEXT.md`.
3. For backend tasks, prioritize `apps/api/CONTEXT.md`.

## Current context docs

- Backend API: `apps/api/CONTEXT.md`
- Mobile App: `apps/mobile/CONTEXT.md`
- Shared Package: `packages/shared/CONTEXT.md`
