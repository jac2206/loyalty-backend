---
name: loyalty-express-ts
description: >
  Implement Loyalty Backend capabilities with Express, TypeScript, domain ports and dependency injection; use for functional backend changes.
metadata:
  version: "1.1.0"
---

# Loyalty Express TypeScript

## Purpose
Implement a functional backend capability following this repository's spec-driven and layered conventions.

## When to use
Use for new or changed backend behavior. For contract-only or test-only work, use the respective local skill.

## Inputs and outputs
Use the requested capability, its spec and applicable project instructions; produce scoped implementation, tests and contract updates.

## Workflow
1. Read `.agents/AGENTS.md`, the relevant spec, architecture and backend instructions, and representative production modules. Create or update the spec before functional changes.
2. Update domain interfaces, errors and entities as needed. Define DTOs and a use case using domain ports injected by constructor.
3. Implement repositories or adapters with explicit mapping and parameterized SQL. Register dependencies in `src/config/container.ts` with keys matching constructor parameters.
4. Implement a thin controller, Zod schemas and routes using `registerRoute`. Align validation, actual response statuses and OpenAPI; use `loyalty-openapi-zod` for detailed contract work.
5. Add meaningful tests by layer, using `loyalty-vitest` where appropriate. Run `npm run build` and `npm run test:run`.

## Constraints
Keep domain independent of infrastructure, Express and pg; use cases depend on ports. Do not expose secrets in DTOs, and keep domain errors stable.

## Quality criteria
- [ ] The spec, implementation, tests and contract agree.
- [ ] Layer boundaries, dependency injection and parameterized SQL are preserved.

## Validation
Review changed paths against the spec and project instructions. Report actual build and test results and any limitations.

See the bilingual [usage guide](examples/usage.md).
