# Zod Contracts with `@hono/zod-openapi`

For backend v1, request/response validation and OpenAPI generation use Zod with `@hono/zod-openapi`. We chose this over TypeBox-first and manual JSON Schema flows because the repo already uses Zod on mobile, this path is directly supported in Hono examples, and it gives the fastest contract iteration while still producing route-level OpenAPI docs.
