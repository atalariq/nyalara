# Canonical Schema v1 Hard Cutover

Backend v1 adopts the PRD-aligned canonical schema (`users/{userId}/...` plus `emission_factors/*`) with hard cutover, and does not preserve compatibility for legacy root collections (`devices`, `dailyUsage`, `userProfiles`). We chose hard cutover because this project is pre-production, clean contracts are higher value than temporary backward compatibility, and dual-schema support would add avoidable complexity across API, security rules, and tests.
