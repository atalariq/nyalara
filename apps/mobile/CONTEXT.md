# Mobile Context (`apps/mobile`)

## Mission

Provide a reliable Expo client experience for electricity carbon tracking:

- authenticate users with Firebase Auth,
- capture electricity usage inputs,
- present estimates and sync/verification state,
- display dashboard/history/insight outputs from backend and Firestore.

## Scope boundaries

In scope:

- App navigation and screen flows (auth, onboarding, dashboard, energy, profile)
- Input validation and UX states
- Local estimated calculations for instant feedback
- Firestore read/write for user-owned data
- Offline-capable user flows

Out of scope in this context:

- Backend-only authority decisions (verified calculation, summary recomputation, insight generation)
- Non-electricity domains unless product scope is explicitly expanded

## Current implementation reality

The app currently includes device-centric flows (device setup, per-device estimates) and utility calculators.
The product PRD sets a near-term electricity-usage MVP centered on usage logs, monthly summaries, and backend-verified calculations.
Current auth/data flows include legacy patterns (for example anonymous-auth guest and root-level collections) that are treated as pre-cutover behavior.

When editing mobile code, prefer moves that converge toward the PRD contract and avoid introducing new off-scope domains.

## Ubiquitous language

- **Estimated value**: client-side provisional result shown instantly.
- **Verified value**: backend-authoritative calculation state after sync/verification.
- **Usage log**: user entry for a specific period/month.
- **Pending sync**: locally written data not yet confirmed in cloud/backend.
- **Monthly summary**: period aggregate shown in dashboard.
- **Insight**: backend-generated Gemini advice rendered to the user.
- **Guest session**: authenticated session using Firebase anonymous auth; supports offline usage with Firestore cache and cloud sync when online.
- **Full account session**: authenticated session using permanent identity (email/social); required for account-bound features such as AI insight generation.

## Invariants and rules

1. Client calculations are UX aids, not source-of-truth.
2. Never expose server secrets (Gemini key, Admin credentials) in mobile.
3. Keep Firestore paths user-scoped for private data.
4. Offline actions must surface clear status (`estimated`, `pending sync`, `verified`, or error).
5. Keep payload shapes aligned with backend/shared contracts.

## Integration expectations

- Auth: Firebase Auth with persisted session.
- Data store: Firestore client SDK (with offline support patterns).
- Backend integration: call API endpoints for verified calculation, summary recompute, and insight generation.
- Contract source: `packages/shared` types and backend API contracts.

## Quality bar for changes

- Validate forms and guard invalid writes.
- Preserve predictable loading/error/offline UI states.
- Avoid schema drift from backend expectations.
- Add/adjust tests where behavior is logic-heavy (validation, mapping, local calculation helpers).
