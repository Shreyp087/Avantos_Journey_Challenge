# Phase 3 Notes: Basic UI Shell and Node Selection

Phase 3 turns the loaded graph data into an interactive form selection workspace. This is still intentionally before the prefill editor: the goal is to prove that the app can render form nodes, track selected node state, and resolve a selected node back to its reusable form schema.

## What This Phase Adds

- A form node list rendered from API graph data.
- A selectable card for each form node.
- Local selected-node state inside the loaded graph workspace.
- An empty state when no form has been selected.
- A selected form summary panel.
- Direct prerequisite display for the selected form.
- Component tests for the loaded node list and click-selection behavior.

## Important Files

```txt
src/App.tsx
src/App.css
src/components/FormNodeList.tsx
src/components/FormNodeCard.tsx
src/components/SelectedFormSummary.tsx
src/App.test.tsx
docs/PHASE_3_NODE_SELECTION.md
```

## Component Responsibilities

### `GraphWorkspace`

Defined in `src/App.tsx`.

Responsibilities:

- Builds a `GraphIndex` from the loaded graph.
- Filters graph nodes down to form nodes.
- Owns `selectedNodeId`.
- Passes selected state to the list and summary components.

### `FormNodeList`

Responsibilities:

- Renders all form nodes.
- Handles the no-form-nodes empty state.
- Delegates individual card rendering to `FormNodeCard`.

### `FormNodeCard`

Responsibilities:

- Displays node name.
- Displays field count from the resolved form schema.
- Displays direct prerequisite count.
- Shows selected state with `aria-pressed`.
- Warns if the node references a missing form schema.

### `SelectedFormSummary`

Responsibilities:

- Shows an initial "No form selected yet" empty state.
- Shows selected form name after selection.
- Shows selected node ID.
- Shows resolved reusable form schema name.
- Shows field count.
- Shows direct prerequisite names.

## Data Flow

```txt
BlueprintGraphResponse
  -> buildGraphIndex
  -> formNodes
  -> FormNodeList
  -> FormNodeCard
  -> selectedNodeId
  -> SelectedFormSummary
```

The UI does not compute graph relationships directly. It asks the domain layer:

```ts
getFormForNode(graphIndex, node.id)
getDirectPrerequisites(graphIndex, node.id)
getNodeById(graphIndex, selectedNodeId)
```

This keeps Phase 4 ready to consume the same selected node and form schema for prefill field rows.

## Selection Behavior

Initial state:

```txt
No form selected yet
```

After clicking Form D:

```txt
Selected: Form D
Direct prerequisites: Form B
Fields: 8
```

The selected card has:

```txt
aria-pressed="true"
```

This gives tests and assistive technology a clear selected-state signal.

## Testing Added

Phase 3 updates `src/App.test.tsx` to verify:

- All six form nodes render after graph load.
- The selected form panel starts in an empty state.
- Clicking Form D marks its card as selected.
- Clicking Form D updates the selected summary.
- The selected summary displays Form D's direct prerequisite, Form B.

`@testing-library/user-event` was added for realistic click interaction tests.

## Verification

Commands run:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 3 passed
Tests: 18 passed
Build: passed
Lint: passed
```

## Phase 4 Handoff

Phase 4 should build the prefill panel on top of the selected form summary.

Recommended next components:

```txt
PrefillPanel
PrefillFieldRow
```

Useful Phase 3 state for Phase 4:

```ts
selectedNodeId
selectedNode
selectedForm
graphIndex
```

Expected Phase 4 behavior:

- Extract target fields from `selectedForm.field_schema.properties`.
- Display existing mappings from `selectedNode.data.input_mapping`.
- Show empty mapping rows for unmapped fields.
- Keep unsupported mapping expressions safe and non-crashing.

