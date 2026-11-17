---
name: loyalty-vitest
description: >
  Write or update meaningful Vitest tests for Loyalty Backend use cases, ports, middleware and HTTP boundaries.
metadata:
  version: "1.1.0"
---

# Loyalty Vitest

## Purpose
Add and maintain meaningful tests for Loyalty Backend behavior with Vitest.

## When to use
Use when adding, changing or investigating tests for use cases, ports, middleware or HTTP behavior. Do not use for unrelated implementation alone.

## Inputs and outputs
Use the relevant behavior, spec, implementation and nearby tests; produce focused tests and verification results.

## Workflow
1. Read `.agents/AGENTS.md`, `.agents/instructions/testing.instructions.md`, `.agents/testing/strategy.md`, the relevant spec and nearby tests.
2. Use Arrange–Act–Assert and doubles for ports where appropriate. Cover business validations, missing resources, port interactions and DTO mapping when relevant.
3. For middleware, cover successful continuation and early rejection; check that `next()` is not called when rejected.
4. Run `npm run test:run`; run `npm run test:coverage` when changing covered logic and appropriate to the task.

## Constraints
Do not disable tests or lower thresholds to pass. Prefer checks of observable behavior over implementation-mirroring assertions.

## Quality criteria
- [ ] Tests cover relevant success and failure behavior without unrelated assertions.
- [ ] Verification results and any unavailable prerequisites are reported.

## Validation
Run relevant tests and review whether failures would reveal a meaningful regression. Report commands, outcomes and limitations.

See the bilingual [usage guide](examples/usage.md).
