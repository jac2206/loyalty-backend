---
name: loyalty-openapi-zod
description: >
  Update Loyalty Backend HTTP validation and OpenAPI contracts with Zod and registerRoute; use for routes, schemas and Swagger.
metadata:
  version: "1.1.0"
---

# Loyalty OpenAPI Zod

## Purpose
Keep HTTP validation and OpenAPI contracts aligned with implemented behavior.

## When to use
Use when adding or changing routes, Zod schemas, HTTP responses or Swagger. For broader implementation or isolated tests, use the relevant local skill.

## Inputs and outputs
Use the relevant spec, route, schemas and tests; produce aligned schemas, route registration, documentation and relevant tests.

## Workflow
1. Read `.agents/AGENTS.md`, the relevant spec and `.agents/instructions/api.instructions.md`. Inspect the route, middleware and tests.
2. Define applicable request, params, query and response schemas in `src/infraestructure/schemas/`; prefer `z.enum` for closed sets and explicit constraints.
3. Apply `validate` to received inputs and register the route with `registerRoute`, using the same schemas for documentation.
4. Document applicable errors and confirm the documented success status matches the actual response. Avoid duplicating types manually between Zod and Swagger.
5. Update meaningful tests and, when a server is available or starting one is appropriate, inspect `/docs`.

## Quality criteria
- [ ] Inputs are validated and documented using consistent schemas.
- [ ] Documented success and error responses reflect actual behavior.

## Validation
Compare the implementation, tests, spec and generated OpenAPI. Run appropriate existing checks and report results; state if visual verification was not performed.

See the bilingual [usage guide](examples/usage.md).
