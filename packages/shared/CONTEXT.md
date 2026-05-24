# Shared Context (`packages/shared`)

## Mission

Define and maintain cross-context contracts used by both mobile (`apps/mobile`) and backend (`apps/api`), so both sides speak the same data language.

## Scope boundaries

In scope:

- Shared TypeScript types for API responses and domain payloads
- Cross-context DTOs and primitive validation-friendly shapes
- Stable naming used by both client and server

Out of scope in this context:

- Feature logic specific to only one app
- Infrastructure/runtime code
- UI state modeling that does not cross process boundaries

## Current implementation reality

The package currently contains starter contracts (`ApiResponse`, `AuthUser`, `CarbonActivity`).
Some existing types still reflect broader carbon domains (for example transport/food/waste categories) that are ahead of current PRD scope.

For current MVP work, prefer electricity-first shared contracts and avoid widening domain scope unless requirements change.

## Ubiquitous language

- **Contract**: a shared type relied on by multiple contexts.
- **DTO**: serialized payload shape crossing network/storage boundaries.
- **Breaking change**: any type change that requires coordinated updates in mobile and backend.
- **Versioning point**: explicit path/model split when a backward-incompatible contract is unavoidable.
- **Canonical Contract v1**: PRD-aligned electricity API contracts used by current backend/mobile integration.
- **Mobile-facing API DTO**: a request or response contract for a backend route consumed by the mobile app; canonical route DTOs belong in this package rather than being duplicated in app-specific code.
- **API-contract-first migration**: the migration approach where frontend features are rewritten against shared backend route DTOs before any direct adoption of backend-owned persistence shapes.
- **Legacy Contract v0**: older payload conventions tied to pre-cutover mobile data flows.

## Invariants and rules

1. Shared contracts must be framework-agnostic (no Expo/Hono runtime imports).
2. Type names should match backend domain terms from PRD/context docs.
3. Avoid ambiguous unions that hide invalid states.
4. Any breaking contract change must be coordinated with both `apps/mobile` and `apps/api`.
5. Keep API response envelopes consistent across endpoints.

## Contract strategy for this repo

- Prefer modeling electricity usage, calculations, summaries, and insight payloads explicitly.
- Define the request and response DTO for every mobile-facing backend route in this package.
- Distinguish estimated vs verified calculation states in shared types.
- Keep date/month formats explicit (`YYYY-MM`, ISO timestamps) where relevant.

## Quality bar for changes

- Keep exports focused and intentional.
- Remove duplicate or conflicting type declarations.
- Add lightweight compile-time checks/examples when introducing non-trivial types.
- Document migrations in related PR/issue notes when contract changes are breaking.
