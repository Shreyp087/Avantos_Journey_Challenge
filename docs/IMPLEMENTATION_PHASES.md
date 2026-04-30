# Journey Builder Implementation Phases

This checklist converts the PRD into an execution sequence. Work through phases in order unless a later phase is explicitly marked optional.

## Phase 0: Discovery and Project Setup

### Objective

Create the app foundation and confirm the mock server contract.

### Tasks

- [x] Initialize React + TypeScript project with Vite.
- [x] Install base dependencies.
- [x] Install test dependencies.
- [x] Start the mock server locally.
- [x] Verify the mock graph endpoint returns JSON.
- [x] Add initial README setup instructions.

### Commands

```bash
npm create vite@latest avantos-journey-builder -- --template react-ts
cd avantos-journey-builder
npm install
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Mock server:

```bash
git clone https://github.com/mosaic-avantos/frontendchallengeserver.git
cd frontendchallengeserver
npm start
```

### Exit Criteria

- [x] Frontend starts locally.
- [x] Mock server starts on `http://localhost:3000`.
- [x] Test command runs.
- [x] README explains basic setup.

## Phase 1: API Client and Types

### Objective

Create typed API access for the blueprint graph.

### Tasks

- [x] Add `src/types/blueprint.ts`.
- [x] Define graph, node, edge, and form types.
- [x] Add `src/api/blueprintClient.ts`.
- [x] Implement `fetchBlueprintGraph`.
- [x] Add loading state.
- [x] Add error state.
- [x] Add graph fixture for tests.

### Exit Criteria

- [x] App fetches graph data from mock server.
- [x] API failures show a friendly message.
- [x] Response data is typed.

## Phase 2: Graph Domain Layer

### Objective

Implement DAG traversal outside React components.

### Tasks

- [x] Add `src/domain/graph.ts`.
- [x] Implement `buildGraphIndex`.
- [x] Implement `getDirectPrerequisites`.
- [x] Implement `getAncestorNodes`.
- [x] Implement safe traversal with visited-node tracking.
- [x] Implement node-to-form lookup.
- [x] Add graph unit tests.

### Required Tests

- [x] Form D ancestors include Form B and Form A.
- [x] Form F ancestors include Form D, Form E, Form B, Form C, and Form A.
- [x] Form A has no ancestors.
- [x] Traversal does not duplicate shared ancestors.
- [x] Traversal does not infinite-loop if invalid cyclic data appears.

### Exit Criteria

- [x] All graph utilities are pure functions.
- [x] All graph traversal tests pass.

## Phase 3: Basic UI Shell and Node Selection

### Objective

Render forms and allow users to select one.

### Tasks

- [x] Add main app shell layout.
- [x] Add `FormNodeList`.
- [x] Add `FormNodeCard`.
- [x] Add selected node state.
- [x] Display selected form name.
- [x] Add no-selection empty state.

### Exit Criteria

- [x] All form nodes are visible.
- [x] Clicking a form selects it.
- [x] Selected form is visually distinct.

## Phase 4: Prefill Panel

### Objective

Show target fields and existing mappings for selected form.

### Tasks

- [x] Add `PrefillPanel`.
- [x] Add `PrefillFieldRow`.
- [x] Extract fields from `field_schema.properties`.
- [x] Mark required fields when schema provides them.
- [x] Parse initial `input_mapping`.
- [x] Show unsupported mapping state safely.

### Exit Criteria

- [x] Selected form fields are listed.
- [x] Existing mappings display when present.
- [x] Empty mappings show clear call-to-action.

## Phase 5: Data Source Provider System

### Objective

Create extensible mapping source architecture.

### Tasks

- [x] Add `src/domain/dataSources.ts`.
- [x] Define `DataSourceProvider`.
- [x] Define `DataSourceGroup`.
- [x] Define `DataElement`.
- [x] Add form field provider.
- [x] Add Action Properties provider placeholder.
- [x] Add Client Organisation Properties provider placeholder.
- [x] Add provider registry.
- [x] Add provider tests.

### Exit Criteria

- [x] Form field provider returns only valid upstream form fields.
- [x] Providers are consumed generically.
- [x] Adding a new provider requires registration only.

## Phase 6: Mapping Modal

### Objective

Allow users to choose a source data element.

### Tasks

- [x] Add `DataElementModal`.
- [x] Add `DataSourceTree`.
- [x] Show provider groups.
- [x] Add search.
- [x] Add selected data element state.
- [x] Disable select button until an element is chosen.
- [x] Connect modal confirmation to mapping state.

### Exit Criteria

- [x] Configure opens modal for the correct target field.
- [x] Modal lists valid source options.
- [x] Search filters source options.
- [x] Selecting an option updates the prefill panel.

## Phase 7: Mapping State and Clear Behavior

### Objective

Complete client-side mapping management.

### Tasks

- [x] Add `src/state/mappingReducer.ts`.
- [x] Implement `setMapping`.
- [x] Implement `clearMapping`.
- [x] Key state by node ID and field key.
- [x] Add reducer tests.
- [x] Add clear button to mapped field rows.
- [ ] Optional: persist to local storage.

### Exit Criteria

- [x] Mapping one field does not alter other fields.
- [x] Clearing one mapping preserves other mappings.
- [x] Switching forms preserves in-session mappings.

## Phase 8: Polish, Accessibility, and Responsiveness

### Objective

Make the application feel complete and reviewer-friendly.

### Tasks

- [x] Improve layout spacing and visual hierarchy.
- [x] Add responsive behavior.
- [x] Add accessible button labels.
- [x] Add modal keyboard basics.
- [x] Add helpful empty states.
- [x] Add custom graphical DAG view.
- [ ] Optional: add JSON debug panel.
- [ ] Optional: add React Flow graph visualization.

### Exit Criteria

- [x] App is usable on desktop and mobile widths.
- [x] Important controls have accessible labels.
- [x] Empty states guide the user.

## Phase 9: Final Tests and Documentation

### Objective

Prepare for submission.

### Tasks

- [x] Add missing unit tests.
- [x] Add component tests for core mapping flow.
- [x] Finalize README.
- [x] Document architecture.
- [x] Document how to add a data source provider.
- [x] Run all tests.
- [x] Run lint/typecheck if configured.
- [x] Review against challenge criteria.

### Exit Criteria

- [x] Test suite passes.
- [x] README is complete.
- [x] App runs locally with documented steps.
- [x] Submission is ready to share.

## Recommended First Sprint

If starting immediately, complete this smaller sprint first:

- [x] Phase 0: Setup.
- [x] Phase 1: API client and types.
- [x] Phase 2: Graph traversal tests.
- [x] Phase 3: Basic node selection UI.

This creates the backbone. Once that is solid, the mapping UI becomes straightforward instead of tangled.
