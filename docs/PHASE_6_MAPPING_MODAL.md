# Phase 6 Notes: Mapping Modal

Phase 6 connects the target-field UI from Phase 4 with the provider system from Phase 5. Users can now click `Configure`, search available data sources, choose a data element, and confirm a mapping that updates the field row immediately.

The mapping is currently stored as draft UI state. Phase 7 will formalize this with a reducer, clear actions, and stronger node/field keyed mapping management.

## What This Phase Adds

- `DataElementModal`.
- `DataSourceTree`.
- Search over provider groups and elements.
- Selected data element state.
- Disabled `Select` button until an element is selected.
- Enabled `Configure` buttons on prefill field rows.
- Draft field mapping display after confirmation.
- Tests for modal opening, search filtering, selection, and mapping confirmation.

## Important Files

```txt
src/components/DataElementModal.tsx
src/components/DataSourceTree.tsx
src/components/PrefillPanel.tsx
src/components/PrefillFieldRow.tsx
src/components/SelectedFormSummary.tsx
src/domain/mappings.ts
src/App.test.tsx
docs/PHASE_6_MAPPING_MODAL.md
```

## Flow

```txt
Click Configure on a target field
  -> open DataElementModal
  -> get provider groups from dataSourceProviders
  -> optionally search/filter data
  -> select a DataElement
  -> Select button becomes enabled
  -> confirm selection
  -> close modal
  -> update visible field mapping
```

## Search Behavior

Search matches:

- Group label.
- Element label.
- Field key.
- Path.
- Source node name.
- Value type.

Example:

```txt
Search: Form B email
Result: Form B -> Email
```

## Draft Mapping Display

Selected `DataElement`s are rendered as readable mapping labels.

Examples:

```txt
Form B.email
Action Properties.status
Client Organisation Properties.email
```

The app still preserves existing mapping display behavior for mappings that arrive from `node.data.input_mapping`.

## Accessibility Notes

- Modal uses `role="dialog"` and `aria-modal="true"`.
- Modal title is connected with `aria-labelledby`.
- Source options use explicit `aria-label`s so nested text does not collapse into ambiguous accessible names.
- Source option selected state uses `aria-pressed`.
- Select is disabled until a source is chosen.

## Current Limitations

- Modal does not trap focus yet.
- Escape-to-close is not implemented yet.
- Draft mappings are local UI state.
- There is no clear/remove action yet.
- Mapping state is not persisted across reloads.

These belong naturally to Phase 7 and Phase 8.

## Tests Added

The app test suite now verifies:

- Configure opens the modal.
- Select starts disabled.
- Searching `Form B email` filters out Form A and leaves Form B.
- Selecting Form B email enables confirmation.
- Confirming closes the modal.
- The Email row updates to `Form B.email`.

## Verification

Commands run:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 6 passed
Tests: 31 passed
Build: passed
Lint: passed
```

## Phase 7 Handoff

Phase 7 should formalize mapping state:

```txt
mappingReducer
setMapping
clearMapping
nodeId -> fieldKey -> mapping
```

Recommended next changes:

- Move draft mapping state out of `SelectedFormSummary`.
- Store mappings by selected node ID and field key.
- Add clear buttons.
- Add reducer tests.
- Preserve mappings while switching between form nodes.

