# Phase 5 Notes: Data Source Provider System

Phase 5 adds the source side of the prefill mapping system. The app now has a generic provider contract, registered providers, upstream form-field source generation from the DAG, and a read-only preview of available source groups for the selected form.

The preview is intentionally read-only. Phase 6 will reuse the same provider output inside the mapping modal.

## What This Phase Adds

- Generic data source contracts.
- Provider registry.
- Upstream form field provider.
- Action Properties placeholder provider.
- Client Organisation Properties placeholder provider.
- Read-only available data source preview in the selected form panel.
- Unit tests for provider output.
- UI tests proving provider output is integrated.

## Important Files

```txt
src/domain/dataSources.ts
src/domain/dataSources.test.ts
src/providers/index.ts
src/providers/formFieldProvider.ts
src/providers/actionPropertiesProvider.ts
src/providers/clientOrganisationProvider.ts
src/components/AvailableDataSourcesPanel.tsx
src/components/SelectedFormSummary.tsx
src/App.test.tsx
docs/PHASE_5_DATA_SOURCE_PROVIDERS.md
```

## Provider Contract

```ts
type DataSourceProvider = {
  id: string
  label: string
  getGroups: (context: DataSourceContext) => DataSourceGroup[]
}
```

Context:

```ts
type DataSourceContext = {
  graphIndex: GraphIndex
  selectedNodeId: string
}
```

Group:

```ts
type DataSourceGroup = {
  id: string
  label: string
  kind: DataSourceKind
  description?: string
  distance?: number
  children: DataElement[]
}
```

Element:

```ts
type DataElement = {
  id: string
  label: string
  kind: DataSourceKind
  valueType?: string
  description?: string
  sourceNodeId?: string
  sourceNodeName?: string
  sourceFormId?: string
  fieldKey?: string
  path?: readonly string[]
  distance?: number
}
```

## Registered Providers

Providers are registered in one place:

```ts
export const dataSourceProviders: DataSourceProvider[] = [
  actionPropertiesProvider,
  clientOrganisationProvider,
  formFieldProvider,
]
```

To add a future data source, implement `DataSourceProvider` and add it to this array.

## Upstream Form Field Provider

The form field provider uses:

```ts
getAncestorNodes(graphIndex, selectedNodeId)
getFormForNode(graphIndex, ancestor.node.id)
getFormFields(form)
```

It returns one group per upstream form node.

For Form D:

```txt
Action Properties
Client Organisation Properties
Form B
Form A
```

For Form F:

```txt
Action Properties
Client Organisation Properties
Form D
Form E
Form B
Form C
Form A
```

Form A appears once for Form F even though it reaches Form F through two branches.

## Placeholder Global Providers

Action Properties currently provides:

```txt
Action ID
Created at
Completed at
Status
```

Client Organisation Properties currently provides:

```txt
Client organisation ID
Name
Email
```

These are placeholders that prove the architecture supports non-form data sources. They can be replaced with real schemas later without changing the consuming UI.

## UI Integration

`AvailableDataSourcesPanel` consumes the generic provider registry:

```ts
getDataSourceGroups(context, dataSourceProviders)
```

The component does not know which provider produced which group. This is important because Phase 6 can use the same pattern in the modal.

Current preview behavior:

- Shows group name.
- Shows group description.
- Shows count of available child elements.
- Shows up to six sample elements per group.
- Indicates when additional fields are available for the modal phase.

## Tests Added

Provider tests verify:

- Form D source groups include Form B and Form A.
- Form F source groups include Form D, Form E, Form B, Form C, and Form A.
- Shared ancestors are not duplicated.
- Registered providers combine global groups with form field groups.
- Root Form A only shows global providers because it has no upstream form fields.

UI tests verify:

- Selecting Form D renders the available data source preview.
- Action Properties appears.
- Client Organisation Properties appears.
- Form B and Form A appear.
- Form C does not appear for Form D because it is not upstream.

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
Tests: 30 passed
Build: passed
Lint: passed
```

## Phase 6 Handoff

Phase 6 should build the modal on top of this provider output.

Recommended flow:

```txt
Click Configure on a field
  -> open DataElementModal
  -> call getDataSourceGroups(context, dataSourceProviders)
  -> search/filter groups
  -> select DataElement
  -> confirm selection
```

The provider system is now ready for that modal without additional data-layer changes.

