# Agentic Workflow

This document is the maintainer reference for running agentic work in this repo with:

- `PROMPTS.md` for reusable session prompts
- repo-local Matt Pocock style skills in `.agents/skills/`
- repo context docs such as `AGENTS.md`, `CONTEXT-MAP.md`, `apps/*/CONTEXT.md`, and ADRs

It is written for maintainers using Codex as the main tool, with Opencode as a fallback.

## Purpose

This workflow exists to prevent three common failures:

1. Starting implementation without shared constraints
2. Splitting work into horizontal tasks instead of thin vertical slices
3. Losing architectural decisions between sessions or between different agent tools

`PROMPTS.md` and the skill workflow solve those problems together:

- `PROMPTS.md` gives a stable session bootstrap and a locked decision snapshot
- skills provide structured execution modes such as slicing, grilling, TDD, and handoff
- context docs and ADRs keep domain language and durable decisions consistent

## Core Artifacts

Read these first when starting work:

- [AGENTS.md](/home/atalariq/Works/carbon-tracker/AGENTS.md)
- [PROMPTS.md](/home/atalariq/Works/carbon-tracker/PROMPTS.md)
- [CONTEXT-MAP.md](/home/atalariq/Works/carbon-tracker/CONTEXT-MAP.md)
- [docs/agents/domain.md](/home/atalariq/Works/carbon-tracker/docs/agents/domain.md)

Then read the context docs relevant to the task:

- [apps/api/CONTEXT.md](/home/atalariq/Works/carbon-tracker/apps/api/CONTEXT.md)
- [apps/mobile/CONTEXT.md](/home/atalariq/Works/carbon-tracker/apps/mobile/CONTEXT.md)
- [packages/shared/CONTEXT.md](/home/atalariq/Works/carbon-tracker/packages/shared/CONTEXT.md)

For backend work, also read:

- [docs/PRD.md](/home/atalariq/Works/carbon-tracker/docs/PRD.md)
- [apps/api/docs/adr/0001-zod-and-hono-zod-openapi.md](/home/atalariq/Works/carbon-tracker/apps/api/docs/adr/0001-zod-and-hono-zod-openapi.md)
- [apps/api/docs/adr/0002-backend-authoritative-writes.md](/home/atalariq/Works/carbon-tracker/apps/api/docs/adr/0002-backend-authoritative-writes.md)
- [apps/api/docs/adr/0003-guest-vs-full-account-policy.md](/home/atalariq/Works/carbon-tracker/apps/api/docs/adr/0003-guest-vs-full-account-policy.md)
- [apps/api/docs/adr/0004-canonical-schema-v1-hard-cutover.md](/home/atalariq/Works/carbon-tracker/apps/api/docs/adr/0004-canonical-schema-v1-hard-cutover.md)

## What `PROMPTS.md` Is For

[`PROMPTS.md`](/home/atalariq/Works/carbon-tracker/PROMPTS.md) is not a product spec and not a skills directory. It is an operator manual for starting or resuming agent work consistently.

Use it when:

- opening a new Codex or Opencode session
- switching from one model/tool to another
- handing implementation to another maintainer
- resuming after context loss

`PROMPTS.md` currently contains:

- a kickoff prompt for slice planning
- an implementation prompt for one-slice-at-a-time TDD work
- a failure/debug prompt
- a handoff prompt
- a fallback instruction when a skill is unavailable
- a locked decision snapshot for backend implementation

Treat the prompt text as reusable scaffolding. Do not treat it as the primary source of truth if it diverges from ADRs or context docs. If a durable decision changes, update ADRs/context docs first, then update `PROMPTS.md`.

## Installed Repo-Local Skills

This repo currently installs these local skills in `.agents/skills/`:

- `setup-matt-pocock-skills`
- `to-prd`
- `to-issues`
- `tdd`
- `grill-with-docs`
- `improve-codebase-architecture`
- `handoff`

These are the normal workflow building blocks.

## How To Invoke Skills

In agent sessions, ask explicitly for the skill by name in the prompt. Examples:

```txt
Use $to-issues on docs/PRD.md for backend-only vertical slices.
```

```txt
Use $tdd to implement the first approved slice.
```

```txt
Use $handoff backend implementation continuation.
```

The exact trigger syntax can vary by tool/client. The safe rule is:

- name the skill explicitly
- state the target artifact or scope
- state the expected outcome

If the client does not support repo-local skills directly, copy the corresponding prompt from `PROMPTS.md` and ask the agent to follow that workflow manually.

## Standard Workflow

This is the default maintainer flow for implementation work.

1. Align context
   Read `AGENTS.md`, `CONTEXT-MAP.md`, the relevant `CONTEXT.md`, and relevant ADRs.

2. Stress-test the plan if the shape is still fuzzy
   Use `grill-with-docs`.

3. Convert the plan into thin vertical slices
   Use `to-issues`.

4. Implement one slice at a time
   Use `tdd`.

5. If the architecture starts resisting change
   Use `improve-codebase-architecture`.

6. Before ending the session
   Use `handoff`.

The anti-pattern is:

- planning everything in bulk
- implementing multiple slices at once
- writing all tests first and all code second

The preferred pattern is:

- one vertical slice
- one public behavior at a time
- one clean handoff point at the end

## When To Use Each Skill

### `setup-matt-pocock-skills`

Use when repo-level agent configuration is missing or stale. It wires:

- issue tracker location
- triage label vocabulary
- domain doc layout

In this repo, it produced the `AGENTS.md` block and `docs/agents/*.md`.

### `grill-with-docs`

Use before implementation when the decision tree is not settled.

Good uses:

- choosing libraries or validation strategy
- deciding data ownership boundaries
- defining guest/full-account behavior
- deciding whether to write an ADR

What it does well:

- asks one question at a time
- checks the codebase when it can answer instead of asking
- updates `CONTEXT.md` and ADRs inline as decisions become real

### `to-issues`

Use after the plan is stable enough to slice.

Goal:

- break work into thin, end-to-end, independently grabbable slices

Important rule:

- slices are vertical, not horizontal

Bad slice examples:

- "create all schemas"
- "build all routes"
- "write all tests"

Good slice examples:

- "create verified electricity usage endpoint with auth, validation, persistence, and tests"

### `tdd`

Use for the implementation of one approved slice.

Core rule:

- one behavior
- one failing test
- minimal code to pass
- repeat

Do not use it as:

- "write all tests first"
- "draft a giant suite then implement later"

### `improve-codebase-architecture`

Use when the code works but the structure is getting in the way.

Typical signals:

- low-locality modules
- awkward seams
- tests that only pass with brittle internal coupling
- duplicated orchestration across features

This is not the first tool to reach for during straightforward implementation.

### `handoff`

Use near the end of a session or before switching tools/models.

It should summarize:

- what was completed
- what remains
- blockers
- test status
- suggested next skill(s)

Use it even when the code is in progress. It is cheaper than reconstructing state later.

## Backend Workflow In This Repo

For the current backend effort, the locked workflow is:

1. Start from `PROMPTS.md` Prompt 1
2. Use `to-issues` to create backend-only slices
3. Implement one slice with `tdd`
4. Use emulator-backed integration tests from day one
5. Keep all work aligned with backend ADRs and canonical schema v1
6. End with `handoff`

Current backend decisions already captured:

- Zod + `@hono/zod-openapi`
- `/v1` route prefix
- backend-authoritative writes
- guest session via Firebase anonymous auth
- AI insight only for full accounts
- canonical schema v1 hard cutover
- shared API contracts in `packages/shared`

If you are resuming backend work, use `PROMPTS.md` before writing new prompt text from scratch.

## Codex vs Opencode

Preferred setup:

- Codex is the main tool for implementation
- Opencode is the fallback when you want a different model or session surface

Operational rule:

- the repo files are the source of truth
- the prompts and skill names are portability glue

That means:

- if Codex and Opencode differ in syntax, preserve the workflow, not the exact invocation form
- if a skill is unavailable in one tool, run the equivalent process manually using `PROMPTS.md`

## Conversation Management

Maintainers using this workflow need to make three separate decisions:

1. continue the current conversation
2. start a fresh conversation
3. create or consume a handoff document

These are related, but they are not the same thing.

### When To Continue The Same Conversation

Continue the current conversation when all of these are still true:

- you are working on the same immediate objective
- the current agent still has enough context to act correctly
- the remaining work is a direct continuation, not a new workstream

Typical examples:

- implementing the next approved vertical slice
- answering follow-up questions about the current slice
- fixing a regression introduced in the same session
- reviewing a partial implementation that was just produced

Reason:

- the active conversation already contains recent intent, assumptions, and local decisions

### When To Start A Fresh Conversation

Start a fresh conversation when the old one has become a poor execution environment.

Common reasons:

- the objective changed materially
- the thread has become noisy with obsolete exploration
- you are switching tools or models and want a clean bootstrap
- you finished one workstream and are starting another
- the next task should be guided primarily by repo artifacts rather than chat history

Typical examples:

- moving from planning into implementation after a long design session
- switching from frontend work to backend work
- switching from one model to another and wanting deterministic restart instructions
- resuming work the next day after many unrelated turns

Reason:

- a fresh conversation reduces drift and makes the next agent read the repo artifacts as source of truth

### Rule Of Thumb

Use this simple rule:

- same problem, same slice, same momentum: continue
- new workstream, new tool, or too much stale context: start fresh

### Slice Cadence Recommendation

For slice-based implementation in this repo, do not default to either extreme:

- one fresh conversation for every slice
- one giant conversation for the whole sprint

The recommended cadence is:

- use one planning/slicing conversation for `grill-with-docs` and `to-issues`
- use one implementation conversation for roughly 1 to 3 consecutive slices
- start a fresh implementation conversation when the thread becomes noisy, stale, or tool-switched

This gives a better balance between momentum and context hygiene.

Practical default:

- continue the same conversation while the agent is still sharp and aligned
- reset after a few slices or whenever stale context starts steering decisions

### When To Use `handoff`

Use `handoff` when conversation context should not be trusted as the only memory.

You should strongly prefer `handoff` before:

- ending a session with unfinished work
- switching from Codex to Opencode or the reverse
- asking another maintainer to continue
- starting a fresh conversation after substantial exploration or implementation

You do not need `handoff` for every tiny task. It is most useful when reconstructing the session manually would be slow or error-prone.

### What `handoff` Is For

`handoff` creates a compact continuation brief for the next agent.

It should point the next session to:

- what was completed
- what remains
- current blockers
- test status
- important files/artifacts
- which skill(s) to use next

It should not duplicate large documents that already exist in the repo. Instead, it should reference:

- PRDs
- ADRs
- issue numbers
- changed files
- prompt files

### How To Use `handoff`

Invoke it near the end of the session with a short purpose statement. Example:

```txt
Use $handoff backend implementation continuation.
```

That purpose statement matters because it helps the handoff focus on the next likely workstream instead of summarizing everything equally.

### How To Use A Handoff Document

Treat the handoff document as a session bootstrap aid, not as the final source of truth.

In the next conversation:

1. read the handoff document
2. open the repo artifacts it references
3. re-anchor on `AGENTS.md`, `PROMPTS.md`, relevant `CONTEXT.md`, and ADRs
4. continue with the suggested skill or prompt

The handoff should help the next agent find the right files and decisions quickly. It should not replace reading those files.

### Handoff Priority Order

When continuing from a handoff, trust artifacts in this order:

1. current repo code
2. ADRs and context docs
3. `PROMPTS.md`
4. the handoff document
5. old conversation text

Reason:

- code and maintained docs are durable
- handoff is a summary
- old chat is the easiest place for stale assumptions to survive

### Practical Examples

Continue the same conversation:

- you just finished `GET /v1/health` and want to implement `GET /v1/emission-factors`
- you asked the agent to fix a failing test from the code it just wrote

Start a fresh conversation and use handoff:

- you spent an hour on architecture and now want clean implementation focus
- you are switching from Codex to Opencode for the next slice
- another maintainer will pick up the backend work tomorrow

Start a fresh conversation without handoff:

- the previous task was tiny and already complete
- all relevant state already lives in repo artifacts and nothing important is trapped in chat

## Maintenance Rules

Update `docs/AGENTIC-WORKFLOW.md` when:

- a new repo-local skill becomes part of the normal workflow
- a skill is removed or replaced
- maintainers adopt a different session bootstrap pattern

Update `PROMPTS.md` when:

- the preferred reusable prompts change
- implementation constraints change
- the locked decision snapshot becomes stale

Update context docs and ADRs before `PROMPTS.md` when the change is architectural or domain-level.

## Quick Start

For a fresh implementation session:

1. Read `AGENTS.md`, `PROMPTS.md`, and the relevant context docs.
2. If architecture is still fuzzy, use `grill-with-docs`.
3. Use `to-issues` to create or refine vertical slices.
4. Use `tdd` to implement one slice.
5. Use `handoff` before ending.

For a fresh maintainer who forgot the workflow:

- `PROMPTS.md` tells you what prompt to paste
- this document tells you why the workflow is shaped this way
- the skill files in `.agents/skills/` tell you the exact operating rules when needed
