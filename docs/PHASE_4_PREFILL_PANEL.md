# Phase 4 Notes: Prefill Panel

Phase 4 adds the target-field side of the prefill mapping experience. The app now extracts fields from the selected form schema, displays one row per field, and safely shows empty, supported, or unsupported mapping states.

This phase does not implement the mapping selection modal. The `Configure` buttons are intentionally disabled placeholders until Phase 6.

## What This Phase Adds

- Form field extraction from `field_schema.properties`.
- Required-field detection from `field_schema.required`.
- Type labels from `avantos_type`, `format`, or JSON schema `type`.
- Mapping display helpers for known expression shapes.
- Safe fallback for unknown or future mapping expression shapes.
- `PrefillPanel` component.
- `PrefillFieldRow` component.
- Tests for field extraction, mapping display, and selected-form prefill UI.

## Important Files

```txt
src/domain/forms.ts
src/domain/forms.test.ts
src/domain/mappings.ts
src/domain/mappings.test.ts
src/components/PrefillPanel.tsx
src/components/PrefillFieldRow.tsx
src/components/SelectedFormSummary.tsx
src/App.test.tsx
docs/PHASE_4_PREFILL_PANEL.md
```

## Field Extraction Contract

`getFormFields(form)` returns normalized field rows:

```ts
type FormField = {
  key: string
  label: string
  required: boolean
  schema: FormFieldSchema
  typeLabel: string
}
```

Label priority:

```txt
schema.title -> humanized field key
```

Type label priority:

```txt
schema.avantos_type -> schema.format -> schema.type -> unknown
```

Required fields come from:

```txt
form.field_schema.required
```

## Mapping Display Contract

`getFieldMapping(inputMapping, fieldKey)` returns one of:

```ts
type MappingDisplay =
  | { status: 'empty'; label: 'Not mapped yet' }
  | { status: 'mapped'; label: string }
  | { status: 'unsupported'; label: 'Unsupported mapping'; raw: unknown }
```

Supported display expressions currently include:

```txt
form_field
form_data
action_data
client_organisation
literal
```

Unsupported expressions are still visible as `Unsupported mapping`. The raw expression is retained in the display object for future adapters.

## Why Unsupported Mappings Are Not Hidden

The real API may introduce additional expression types. Hiding unknown mappings would make a configured field look empty, which is risky. Showing `Unsupported mapping` is safer because:

- The user sees that something exists.
- The UI does not crash.
- Future phases can add adapter support without changing row rendering.

## Current UI Behavior

After selecting a form, the selected panel shows:

```txt
Selected form summary
Prefill fields for this form
```

Each field row shows:

- Field label.
- Required badge when applicable.
- Field key.
- Field type label.
- Mapping pill.
- Disabled `Configure` button.

The disabled configure button is deliberate. Phase 6 will connect this action to the data element modal.

## Tests Added

Phase 4 adds or updates tests for:

- Extracting 8 fields from the mock schema.
- Marking `email` and `name` as required.
- Returning empty field lists for missing schemas.
- Displaying empty mappings as `Not mapped yet`.
- Displaying supported mapping expressions.
- Displaying unsupported mapping expressions without crashing.
- Rendering all prefill rows after selecting Form D.
- Showing existing supported and unsupported mappings in the selected form panel.

## Verification

Commands run:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 5 passed
Tests: 25 passed
Build: passed
Lint: passed
```

## Phase 5 Handoff

Phase 5 should build the source side of the mapping system:

```txt
DataSourceProvider
DataSourceGroup
DataElement
formFieldProvider
actionPropertiesProvider
clientOrganisationProvider
```

The prefill panel currently shows target fields. Phase 5 should compute valid source options, especially upstream form fields from the DAG.

