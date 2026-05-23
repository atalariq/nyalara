# Collaboration & Contribution Guidelines

## 1. Purpose

Dokumen ini mendefinisikan aturan kolaborasi untuk project **Carbon Footprint Tracker Mobile App** yang menggunakan struktur monorepo:

```txt
carbon-tracker/
├─ apps/
│  ├─ mobile/    # Expo app
│  └─ api/       # Hono backend
├─ packages/
│  └─ shared/    # shared types, schemas, constants, API contracts
└─ docs/
```

Guideline ini dibuat agar workflow tim lebih rapi, dan mudah direview.

---

## 2. Core Collaboration Principles

- Keep changes small, focused, and reviewable.
- Prefer one Pull Request for one logical change.
- Use shared types/contracts from `packages/shared` instead of duplicating types across FE and BE.
- Do not commit secrets, `.env`, Firebase credentials, private keys, or service account files.
- Discuss large architectural changes before implementation.
- Use Draft PRs for work-in-progress.
- Keep `main` stable and always runnable.
- Prefer clear communication over assumptions.

---

## 3. Branch Strategy

This project uses two primary branches:

```txt
main  # stable branch / release-ready branch
dev   # integration branch for active development
```

### Branch Responsibilities

| Branch | Purpose | Who can merge |
|---|---|---|
| `main` | Stable/release-ready code | Maintainer only |
| `dev` | Integration branch for completed features | Team members via PR |
| feature/fix branches | Individual work branches | Contributor |

### Rules

- Never push directly to `main`.
- Prefer not to push directly to `dev`; use Pull Requests instead.
- Feature/fix branches should target `dev`.
- `dev` is merged into `main` only when the team decides to release or submit a stable milestone.
- Delete feature branches after merge.

---

## 4. Branch Naming Convention

Use this format:

```txt
<username>/<type>/<short-description>
```

Examples:

```txt
riq/feat/firebase-auth
riq/fix/api-token-validation
raha/feat/onboarding-screen
raha/refactor/activity-service
sarah/docs/setup-guide
```

### Allowed Branch Types

| Type | Usage |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `chore` | Tooling, dependency, config, maintenance |
| `refactor` | Code restructuring without behavior change |
| `test` | Test-related changes |
| `style` | Formatting or non-functional style changes |
| `perf` | Performance improvement |
| `hotfix` | Urgent fix for `main` |

### Role-Based Examples

#### Mobile / Frontend

```txt
raha/feat/login-screen
raha/fix/activity-form-validation
raha/refactor/api-client
```

#### Backend

```txt
riq/feat/auth-middleware
riq/feat/activity-api
riq/fix/firebase-token-verification
```

#### Shared Package

```txt
riq/feat/shared-api-response
raha/refactor/shared-carbon-types
```

#### Documentation / PM

```txt
sarah/docs/prd-update
sarah/docs/api-contract
```

---

## 5. Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for all commit messages.

Format:

```txt
<type>(<scope>): <short description>
```

Examples:

```txt
feat(auth): add Firebase login flow
fix(api): handle missing bearer token
docs(readme): update local setup guide
chore(workspace): configure pnpm monorepo
refactor(shared): extract carbon activity types
test(api): add activity route tests
```

### Allowed Commit Types

| Type | Meaning |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `chore` | Maintenance, tooling, dependency, config |
| `refactor` | Code change that does not add feature or fix bug |
| `test` | Adding or updating tests |
| `style` | Formatting only, no logic change |
| `perf` | Performance improvement |
| `ci` | CI/CD workflow changes |
| `build` | Build system or dependency changes |
| `revert` | Revert previous commit |

### Recommended Scopes

Use scopes based on the monorepo area:

| Scope | Usage |
|---|---|
| `mobile` | Expo app changes |
| `api` | Hono backend changes |
| `shared` | `packages/shared` changes |
| `auth` | Authentication-related changes |
| `activity` | Carbon activity feature |
| `carbon` | Carbon calculation logic |
| `workspace` | pnpm/workspace/monorepo config |
| `docs` | Documentation |
| `ci` | GitHub Actions / automation |
| `deps` | Dependency updates |

Examples:

```txt
feat(mobile): add activity creation screen
feat(api): add create activity endpoint
feat(shared): add CarbonActivity type
fix(auth): reject expired Firebase token
docs(api): document activity endpoints
chore(deps): update Expo dependencies
```

### Commit Message Rules

- Use lowercase type and scope.
- Use imperative mood when possible.
- Keep the subject concise.
- Avoid vague messages like `fix`, `update`, `wip`, `final`, or `changes`.
- Temporary commits are okay locally, but clean them before merge if needed.

Bad:

```txt
fix
update stuff
WIP
final final
```

Good:

```txt
fix(api): validate missing activity category
feat(mobile): add Google sign-in button
refactor(shared): move API response types to shared package
```

---

## 6. Pull Request Rules

### Target Branch

All normal feature/fix PRs must target:

```txt
dev
```

Only release PRs should target:

```txt
main
```

### PR Title Format

Use Conventional Commit style for PR titles:

```txt
feat(auth): integrate Firebase Auth
fix(api): handle invalid bearer token
docs(readme): add monorepo setup guide
```

### PR Size

Prefer small PRs.

Recommended size:

```txt
Small:   1–5 files changed
Medium:  6–15 files changed
Large:   16+ files changed, should be split if possible
```

Large PRs are allowed for initial setup or migration, but future feature work should be smaller.

### PR Description Template

Use this template:

```md
## Summary

Briefly explain what this PR changes.

## Changes

-
-
-

## Affected Areas

- [ ] Mobile (`apps/mobile`)
- [ ] API (`apps/api`)
- [ ] Shared (`packages/shared`)
- [ ] Docs
- [ ] CI/CD

## How to Test

```sh
pnpm install
pnpm typecheck
pnpm dev:api
pnpm dev:mobile
```

## Screenshots / Demo

Add screenshots, screen recordings, curl results, or API response examples if relevant.

## Notes for Reviewer

Mention risky changes, known limitations, or areas needing extra attention.

## Checklist

- [ ] Code follows project structure
- [ ] No secrets or `.env` files committed
- [ ] Typecheck passes
- [ ] Relevant docs updated
- [ ] Shared types/contracts updated if needed
- [ ] Tested locally
```

### When to Use Draft PRs

Use Draft PR when:

- The feature is not finished.
- You want early feedback.
- You are unsure about architecture.
- You want the team or AI Agent to review direction before finalizing.

Convert to Ready for Review only when:

- The PR is locally tested.
- The description is filled.
- The code is ready for review.

---

## 7. Code Review Guidelines

### Review Goals

Code review should check:

- Correctness
- Readability
- Maintainability
- Security
- Type safety
- API contract consistency
- Project structure consistency
- Testing and documentation impact

### Reviewer Responsibilities

Reviewers should:

- Read the PR description first.
- Pull and test locally if the change is risky.
- Comment on code behavior, not the person.
- Ask questions instead of assuming mistakes.
- Suggest concrete improvements.
- Approve only when the PR is safe to merge.

### Author Responsibilities

Authors should:

- Keep PRs focused.
- Explain context clearly.
- Respond to review comments respectfully.
- Resolve conversations after addressing them.
- Avoid force-pushing during active review unless necessary.
- Notify reviewer after major changes.

### Review Comment Examples

Good review comments:

```txt
Could we move this type to packages/shared so mobile and api use the same contract?
```

```txt
This function handles valid tokens, but what should happen when Firebase returns an expired token error?
```

```txt
Can we rename this variable to make the unit clearer? Is this value in kgCO2 or grams?
```

Avoid comments like:

```txt
This is bad.
Wrong.
Why did you do this?
```

### Review Labels

Use lightweight labels in comments if helpful:

```txt
[blocking] Must be fixed before merge.
[suggestion] Optional improvement.
[question] Need clarification.
[nit] Minor style/readability issue.
```

Examples:

```txt
[blocking] This commits `.env`. Please remove it before merge.
```

```txt
[suggestion] This API response type could be moved to packages/shared.
```

```txt
[nit] Consider renaming `data` to `activity` for readability.
```

---

## 8. Required Checks Before Merge

Before merging a PR, run:

```sh
pnpm install
pnpm typecheck
```

If relevant, also run:

```sh
pnpm lint
pnpm test
pnpm dev:api
pnpm dev:mobile
```

Minimum merge requirements:

- No secrets committed.
- App still installs from root.
- TypeScript check passes, or failure is explained.
- PR has at least one reviewer approval.
- PR targets the correct branch.
- API/shared contract changes are reflected in both FE and BE if needed.

---

## 9. Push/Pull Workflow

### Step 1 — Sync Local `dev`

```sh
git switch dev
git pull origin dev
```

If `dev` does not exist locally yet:

```sh
git fetch origin
git switch -c dev origin/dev
```

### Step 2 — Create a Work Branch

```sh
git switch -c <username>/<type>/<short-description>
```

Example:

```sh
git switch -c riq/feat/auth-middleware
```

### Step 3 — Work and Commit

```sh
git status
git add .
git commit -m "feat(api): add auth middleware"
```

### Step 4 — Sync with Latest `dev`

Before pushing or opening PR:

```sh
git fetch origin
git rebase origin/dev
```

If conflict happens:

```sh
git status
# resolve conflicted files
git add .
git rebase --continue
```

If you need to abort rebase:

```sh
git rebase --abort
```

### Step 5 — Push Branch

```sh
git push -u origin <branch-name>
```

Example:

```sh
git push -u origin riq/feat/auth-middleware
```

If you rebased after already pushing, use:

```sh
git push --force-with-lease
```

Do not use plain `--force` unless the team explicitly agrees.

### Step 6 — Open PR to `dev`

- Target branch: `dev`
- Fill PR template.
- Request reviewer.
- Use Draft PR if not ready.

### Step 7 — Address Review

After changes:

```sh
git add .
git commit -m "fix(api): handle missing bearer token"
git push
```

If you need to clean commits:

```sh
git rebase -i origin/dev
git push --force-with-lease
```

### Step 8 — Merge

Use one of these merge strategies:

- **Squash merge** for small/medium feature PRs.
- **Merge commit** for large integration PRs where preserving branch history is useful.
- **Rebase merge** only if the team agrees and understands the workflow.

Recommended default:

```txt
Squash merge into dev
```

---

## 10. Release Workflow

When `dev` is stable and ready for milestone/release:

1. Create PR from `dev` to `main`.
2. Review release changes.
3. Run validation commands.
4. Merge into `main`.
5. Tag release if needed.

```sh
git switch main
git pull origin main
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

Use semantic versioning if possible:

```txt
v0.1.0  # initial milestone
v0.2.0  # new feature milestone
v0.2.1  # bug fix
v1.0.0  # stable release
```

---

## 11. Monorepo Contribution Rules

### Mobile Changes

Mobile code belongs in:

```txt
apps/mobile
```

Examples:

```txt
apps/mobile/src/components
apps/mobile/src/features
apps/mobile/src/services
apps/mobile/src/lib
```

Mobile contributors should not modify backend code unless the feature requires full-stack changes.

### API Changes

Backend code belongs in:

```txt
apps/api
```

Examples:

```txt
apps/api/src/routes
apps/api/src/middleware
apps/api/src/services
apps/api/src/repositories
apps/api/src/validators
```

Backend contributors should keep API responses consistent with shared contracts.

### Shared Package Changes

Shared code belongs in:

```txt
packages/shared
```

Put these in shared:

- API response types
- Auth user types
- Carbon activity types
- Request/response DTOs
- Validation schemas if used by both FE and BE
- Constants used by both FE and BE

Do not put these in shared:

- React components
- Expo-specific code
- Hono-specific middleware
- Firebase Admin setup
- UI state management
- Server-only secrets/config

---

## 12. Shared Contract Rules

If backend response changes, update shared types.

Example:

```ts
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };
```

If mobile depends on an API response, that response shape should be defined or exported from `packages/shared`.

Avoid duplicating this:

```ts
// apps/mobile/src/types/activity.ts
export type CarbonActivity = { ... };

// apps/api/src/types/activity.ts
export type CarbonActivity = { ... };
```

Prefer:

```ts
// packages/shared/src/carbon.ts
export type CarbonActivity = { ... };
```

Then import it:

```ts
import type { CarbonActivity } from "@carbon/shared";
```

---

## 13. Environment Variable Rules

Never commit:

```txt
.env
.env.local
.env.production
serviceAccountKey.json
firebase-adminsdk*.json
*.pem
*.key
```

Always document required variables in:

```txt
apps/mobile/.env.example
apps/api/.env.example
```

Mobile env example:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

API env example:

```env
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Rules:

- Variables exposed to Expo client must use `EXPO_PUBLIC_`.
- Server secrets must stay in `apps/api` runtime environment.
- Never expose Firebase Admin credentials to mobile.
- Update `.env.example` whenever a new env variable is introduced.

---

## 14. Issue Guidelines

Use issues to track tasks, bugs, and decisions.

### Issue Title Format

```txt
feat: add activity creation screen
fix: API rejects valid Firebase token
docs: add local development setup
```

### Issue Template

```md
## Description

Explain the task or problem.

## Acceptance Criteria

- [ ]
- [ ]
- [ ]

## Affected Areas

- [ ] Mobile
- [ ] API
- [ ] Shared
- [ ] Docs

## Notes

Add technical notes, links, screenshots, or references.
```

---

## 15. Recommended Labels

Use simple labels:

```txt
type: feat
type: fix
type: docs
type: chore
area: mobile
area: api
area: shared
area: auth
area: carbon
priority: high
priority: medium
priority: low
status: blocked
status: ready
status: needs-review
```

Examples:

```txt
type: feat
area: api
area: auth
priority: high
```

---

## 16. AI Agent Contribution Rules

AI Agent may be used to help implement, refactor, test, or document the project.

### AI Agent Must Follow These Rules

- Work within the requested scope only.
- Do not modify unrelated files.
- Do not create or commit secrets.
- Do not overwrite existing implementation without explaining why.
- Prefer small, reviewable changes.
- Use existing project conventions.
- Add or update documentation when changing setup or env variables.
- Run or mention validation commands.
- Keep shared types in `packages/shared` when used by both FE and BE.

### Recommended AI Prompt Format

```txt
You are working in a pnpm monorepo for Carbon Footprint Tracker.

Structure:
- apps/mobile: Expo app
- apps/api: Hono backend
- packages/shared: shared types and contracts

Task:
<describe the task>

Scope:
- Allowed to modify: <list folders/files>
- Do not modify: <list folders/files>

Requirements:
1.
2.
3.

Validation:
- pnpm typecheck
- pnpm dev:api
- pnpm dev:mobile
```

### Example AI Prompt

```txt
Implement authenticated API fetch for the Expo app.

Allowed files:
- apps/mobile/src/services/api.ts
- apps/mobile/src/services/auth.ts
- packages/shared/src/api.ts

Do not modify:
- apps/api except if required for type compatibility
- package manager config
- environment secrets

Requirements:
1. Create a reusable apiFetch wrapper.
2. Attach Firebase ID token as Bearer token.
3. Use ApiResponse from @carbon/shared.
4. Use EXPO_PUBLIC_API_BASE_URL.
5. Add error handling for network failures.

Validation:
- pnpm typecheck
```

---

## 17. Definition of Done

A task is considered done when:

- The requested behavior works locally.
- Code is committed with clear Conventional Commit messages.
- PR description explains the change.
- TypeScript check passes.
- Relevant docs or `.env.example` are updated.
- No secrets are committed.
- Reviewer has approved the PR.
- Branch is merged into the correct target branch.

For full-stack features, also ensure:

- Backend API contract is reflected in `packages/shared`.
- Mobile uses the shared contract.
- API errors are handled properly in mobile.
- Protected routes handle unauthenticated requests.

---

## 18. Common Workflows

### Add a Mobile Feature

```sh
git switch dev
git pull origin dev
git switch -c raha/feat/activity-form

# work on apps/mobile

git add .
git commit -m "feat(mobile): add activity form"
git fetch origin
git rebase origin/dev
git push -u origin raha/feat/activity-form
```

Open PR to `dev`.

### Add a Backend Feature

```sh
git switch dev
git pull origin dev
git switch -c riq/feat/activity-api

# work on apps/api and packages/shared if needed

git add .
git commit -m "feat(api): add activity creation endpoint"
git push -u origin riq/feat/activity-api
```

Open PR to `dev`.

### Add a Full-Stack Feature

```sh
git switch dev
git pull origin dev
git switch -c riq/feat/auth-integration

# work on apps/mobile, apps/api, and packages/shared

git add .
git commit -m "feat(shared): add auth user type"
git commit -m "feat(api): add Firebase auth middleware"
git commit -m "feat(mobile): attach ID token to API requests"
git push -u origin riq/feat/auth-integration
```

Open PR to `dev` with clear testing steps.

### Fix a Bug

```sh
git switch dev
git pull origin dev
git switch -c riq/fix/api-token-validation

# fix bug

git add .
git commit -m "fix(api): reject malformed bearer token"
git push -u origin riq/fix/api-token-validation
```

Open PR to `dev`.

---

## 19. Conflict Resolution Workflow

When your branch conflicts with `dev`:

```sh
git fetch origin
git rebase origin/dev
```

If conflicts occur:

```sh
git status
```

Open conflicted files and resolve manually.

Then:

```sh
git add <resolved-files>
git rebase --continue
```

After rebase is done:

```sh
git push --force-with-lease
```

If unsure, ask the team before resolving conflicts in files owned by another contributor.

---

## 20. Ownership Guidelines

Ownership is flexible, but these defaults help reduce conflicts:

| Area | Primary Owner | Notes |
|---|---|---|
| `apps/mobile` | Mobile/FE contributor | Screens, UI, client state, API fetch |
| `apps/api` | Backend contributor | Routes, middleware, services, repositories |
| `packages/shared` | Shared responsibility | Must be discussed if changing public contracts |
| `docs` | Everyone | Keep docs updated with implementation |
| root config | Maintainer / discussed changes | Workspace, CI, package manager, lint config |

Before changing another person’s main area, leave a note in issue/PR or discuss first.

---

## 21. Recommended GitHub Repository Settings

Recommended settings for this private repository:

### Branch Protection for `main`

Enable:

- Require Pull Request before merging.
- Require at least 1 approval.
- Require status checks to pass if CI exists.
- Block force pushes.
- Block deletions.

### Branch Protection for `dev`

Enable if possible:

- Require Pull Request before merging.
- Require at least 1 approval.
- Allow maintainers to bypass only when necessary.

### Merge Options

Recommended:

- Enable squash merge.
- Enable merge commit only if needed.
- Disable rebase merge if the team wants simpler history.

### Auto Delete Branches

Enable:

```txt
Automatically delete head branches after merge
```

---

## 22. Minimal Local Setup Command

New contributors should be able to run:

```sh
git clone git@github.com:atalariq/carbon-tracker.git
cd carbon-tracker
pnpm install
pnpm dev:api
pnpm dev:mobile
```

If this does not work, update README or setup docs.

---

## 23. Summary

Default workflow:

```txt
feature branch → PR to dev → review → merge to dev → release PR to main
```

Default branch naming:

```txt
<username>/<type>/<short-description>
```

Default commit format:

```txt
<type>(<scope>): <description>
```

Default PR target:

```txt
dev
```

Default merge method:

```txt
Squash merge
```

Main collaboration rule:

```txt
Keep changes small, typed, documented, and reviewable.
```
