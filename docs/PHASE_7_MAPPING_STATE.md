# Phase 7 Notes: Mapping State and Clear Behavior

Phase 7 formalizes client-side mapping state. The app now stores mapping overrides in a reducer keyed by form node ID and field key, supports clearing mappings, and preserves mappings when users switch between form nodes.

## What This Phase Adds

- `mappingReducer`.
- `setMapping` action.
- `clearMapping` action.
- Node/field keyed mapping state.
- Clear buttons on mapped field rows.
- Reducer tests.
- UI tests for clearing mappings and preserving mappings across node switches.

## Important Files

```txt
src/state/mappingReducer.ts
src/state/mappingReducer.test.ts
src/components/SelectedFormSummary.tsx
src/components/PrefillPanel.tsx
src/components/PrefillFieldRow.tsx
src/App.test.tsx
docs/PHASE_7_MAPPING_STATE.md
```

## State Shape

```ts
type MappingState = Record<string, Record<string, FieldMappingOverride>>
```

The first key is the selected node ID. The second key is the target field key.

Example:

```ts
{
  "form-d": {
    "email": {
      status: "mapped",
      dataElement: {
        label: "Email",
        sourceNodeName: "Form B",
        fieldKey: "email"
      }
    }
  }
}
```

## Mapping Overrides

```ts
type FieldMappingOverride =
  | { status: 'mapped'; dataElement: DataElement }
  | { status: 'cleared' }
```

`mapped` means the user selected a source data element.

`cleared` means the user intentionally removed a mapping. This matters because fields can also have existing API mappings from `node.data.input_mapping`; clearing must hide that original mapping instead of falling back to it.

## Reducer Actions

Set mapping:

```ts
dispatch({
  type: 'setMapping',
  nodeId,
  fieldKey,
  dataElement,
})
```

Clear mapping:

```ts
dispatch({
  type: 'clearMapping',
  nodeId,
  fieldKey,
})
```

## Display Resolution Order

The prefill panel resolves mapping display in this order:

```txt
1. User override from reducer
2. Existing mapping from node.data.input_mapping
3. Empty state
```

For cleared fields:

```txt
cleared override -> Not mapped yet
```

This guarantees clear actions are visible and intentional.

## UI Behavior

Field rows now show:

- `Configure` for every field.
- `Clear` only when a field is mapped or unsupported.

After selecting a mapping:

```txt
Email -> Form B.email
```

After clearing:

```txt
Email -> Not mapped yet
```

## Tests Added

Reducer tests verify:

- Setting a mapping by node ID and field key.
- Clearing one mapping without deleting unrelated mappings.
- Returning empty override objects for nodes without state.

UI tests verify:

- Existing API mappings can be cleared.
- Newly selected modal mappings can be cleared.
- Mappings persist while switching from Form D to Form A and back to Form D.

## Verification

Commands run:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 7 passed
Tests: 35 passed
Build: passed
Lint: passed
```

## Phase 8 Handoff

Phase 8 should focus on polish and accessibility:

- Improve responsive behavior.
- Add modal keyboard escape behavior.
- Add basic focus management.
- Refine empty states.
- Consider reducing visual noise now that the workflow is complete.

