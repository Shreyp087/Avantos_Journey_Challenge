# Phase 1 Notes: API Client and Types

Phase 1 establishes the data-loading layer for the Journey Builder challenge.

## What This Phase Adds

- Shared TypeScript contracts for blueprint graphs, nodes, edges, forms, and form fields.
- A small API client for the mock server's graph endpoint.
- Runtime validation that confirms the response has `nodes`, `edges`, and `forms` arrays.
- Loading, success, and error states in the app shell.
- A reusable test fixture based on the mock server graph.
- Unit tests for URL building, fetch success, fetch failure, invalid response handling, and graph summarization.

## Execution Status

Completed and verified.

Verification commands:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 2 passed
Tests: 8 passed
Build: passed
Lint: passed
```

## Important Files

```txt
src/types/blueprint.ts
src/api/blueprintClient.ts
src/api/blueprintClient.test.ts
src/test/fixtures.ts
src/App.tsx
src/App.test.tsx
.env.example
```

## Endpoint Defaults

The app defaults to the mock server route:

```txt
http://localhost:3000/api/v1/1/actions/blueprints/bp_01jk766tckfwx84xjcxazggzyc/graph
```

These values can be overridden with Vite environment variables:

```txt
VITE_BLUEPRINT_API_BASE_URL=http://localhost:3000
VITE_BLUEPRINT_TENANT_ID=1
VITE_BLUEPRINT_ID=bp_01jk766tckfwx84xjcxazggzyc
```

## Mock vs Official API Shape

The mock server returns root-level fields like:

```txt
id
name
tenant_id
nodes
edges
forms
```

The official OpenAPI docs also reference variants like:

```txt
blueprint_id
blueprint_name
```

The type model and summary helper support both naming variants so the app remains compatible with the mock server now and closer to the official API later.

## Runtime Validation Scope

This phase performs lightweight validation only:

- `tenant_id` must be a string.
- `nodes` must be an array.
- `edges` must be an array.
- `forms` must be an array.

Deeper validation is intentionally deferred. Phase 2 will normalize and traverse the graph, which is the right place to handle missing node IDs, broken edges, and node-to-form mismatches.

## Why The API Client Is Separate

The client is intentionally isolated from React:

```txt
App.tsx -> fetchBlueprintGraph -> typed graph response
```

This keeps network concerns out of components and lets later phases reuse the same client in tests, hooks, or alternative UI flows.

## Phase 2 Handoff

Phase 2 should build on this by adding pure graph-domain utilities:

- `buildGraphIndex`
- `getDirectPrerequisites`
- `getAncestorNodes`
- `detectCycle` or cycle-safe traversal
- node-to-form resolution

The `mockBlueprintGraph` fixture already includes the sample DAG structure needed for those tests.
