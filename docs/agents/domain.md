# Domain Docs

How engineering skills should consume this repo's domain documentation.

## Layout: multi-context monorepo

This repository has multiple contexts:

- `apps/mobile` (Expo mobile client)
- `apps/api` (Hono backend service)
- `packages/shared` (shared contracts/utilities)

For backend work, treat `apps/api` as the primary context.

## Before exploring, read these

- `docs/PRD.md` for current product scope and acceptance criteria
- `CONTEXT-MAP.md` at the repo root, when present
- Context `CONTEXT.md` for the area being changed (`apps/api/CONTEXT.md` first for backend work, when present)
- Shared ADRs in `docs/adr/`, when present
- Context ADRs in `<context>/docs/adr/` (for backend: `apps/api/docs/adr/`), when present

If any files are missing, proceed silently.

## Backend-first consumer rules

For tasks under `apps/api`:

1. Prefer backend requirements and API contracts from `docs/PRD.md` (notably sections on API requirements, security/privacy, and testing strategy).
2. Keep scope limited to electricity-tracking MVP unless the issue explicitly expands scope.
3. Treat client-side values as estimates and backend calculations as the authority for verified values.
4. Keep Gemini integration backend-only.

## Use glossary terms

When naming domain concepts in issues, plans, or tests, use terms defined in the relevant context docs. If a term is missing, note the gap instead of inventing competing vocabulary.

## Flag ADR conflicts

If a proposed change conflicts with an ADR, call it out explicitly instead of silently overriding it.
