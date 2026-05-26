# Contributing To Nyalara

This document combines the collaboration rules that matter for the current team workflow with a smaller set of durable engineering practices that should continue to hold after the current release cycle.

## Working Style

- Keep changes small, focused, and reviewable.
- Prefer one pull request for one logical change.
- Reuse shared contracts from `packages/shared` instead of duplicating types.
- Do not commit secrets, `.env` files, Firebase credentials, or service account files.
- Discuss large architectural changes before implementation.
- Prefer clear communication over assumptions.

## Branch Strategy

The repository currently uses two long-lived branches:

- `main` - stable and release-ready
- `dev` - integration branch for active team work

Rules:

- Do not push directly to `main`.
- Prefer pull requests instead of pushing directly to `dev`.
- Feature and fix branches should target `dev`.
- Merge `dev` into `main` only when the team agrees the milestone is stable.

## Branch Naming

Use:

```txt
<username>/<type>/<short-description>
```

Examples:

```txt
riq/feat/google-auth
riq/fix/device-history-sync
raha/docs/readme-refresh
```

Recommended branch types:

- `feat`
- `fix`
- `docs`
- `chore`
- `refactor`
- `test`
- `style`
- `perf`
- `hotfix`

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```txt
<type>(<scope>): <short description>
```

Examples:

```txt
feat(mobile): add device onboarding flow
fix(api): validate missing bearer token
docs(readme): refresh product narrative
refactor(shared): simplify device dto exports
```

Useful scopes in this repository:

- `mobile`
- `api`
- `shared`
- `auth`
- `devices`
- `energy`
- `profile`
- `docs`
- `workspace`
- `deps`

## Pull Requests

Normal feature and fix PRs should target `dev`. Release-oriented PRs should target `main`.

Preferred PR title format:

```txt
feat(mobile): improve dashboard onboarding
fix(api): reject invalid electricity payload
docs(prd): rewrite product direction
```

Keep PRs reviewable. If a change becomes too broad, split it by behavior or by document area.

Use a draft PR when:

- the implementation is incomplete
- you want feedback on direction
- there is still architectural uncertainty

Convert to ready for review only when:

- the core behavior works locally
- the risk areas are described clearly
- related documentation is updated

## Suggested PR Description

```md
## Summary

Describe what changed and why.

## Verification

- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] Relevant manual checks completed

## Notes For Reviewers

Call out risks, known limitations, or follow-up work.
```

## Durable Engineering Practices

- Prefer vertical changes that keep mobile, API, and shared contracts aligned.
- Keep the public product narrative device-centric and electricity-only unless scope changes intentionally.
- Treat backend verification, summaries, and insights as platform concerns rather than marketing claims unless they are fully surfaced in the user experience.
- Update documentation when product language, developer workflow, or core contracts change.
- Favor explicit terminology over overloaded words such as "activity" when "device usage" or "electricity usage" is clearer.
