# Architecture

This app is organized around a small set of boundaries: API access, graph/domain logic, provider-based data sources, reducer-backed mapping state, and React components.

## High-Level Flow

```txt
Mock graph API
  -> src/api/blueprintClient.ts
  -> src/types/blueprint.ts
  -> src/domain/graph.ts
  -> selected form node
  -> src/providers/*
  -> mapping modal
  -> src/state/mappingReducer.ts
  -> prefill field rows
```

## Module Boundaries

### API

```txt
src/api/blueprintClient.ts
```

Responsibilities:

- Build the graph endpoint URL.
- Fetch graph JSON from the mock server.
- Validate that the response has required arrays.
- Normalize errors into user-friendly messages.
- Summarize graph metadata for the UI.

The API layer does not know about React state, selected nodes, mapping reducers, or UI layout.

### Types

```txt
src/types/blueprint.ts
```

Responsibilities:

- Define the graph response shape.
- Define blueprint nodes and edges.
- Define form schemas and form field schema metadata.

These types model the API contract closely. More opinionated UI/domain shapes live in `src/domain`.

### Domain

```txt
src/domain/graph.ts
src/domain/forms.ts
src/domain/mappings.ts
src/domain/dataSources.ts
```

Responsibilities:

- Build reusable graph indexes.
- Traverse direct and transitive upstream dependencies safely.
- Resolve form schemas for graph nodes.
- Extract form fields from JSON schema-style form definitions.
- Convert mapping expressions and selected data elements into readable display labels.
- Define generic data source provider contracts.

The domain layer is mostly pure functions and is heavily tested. This keeps the DAG behavior reviewable without rendering React components.

### Providers

```txt
src/providers/actionPropertiesProvider.ts
src/providers/clientOrganisationProvider.ts
src/providers/formFieldProvider.ts
src/providers/index.ts
```

Responsibilities:

- Implement source-specific data element discovery.
- Return grouped `DataElement` records through a shared provider interface.
- Keep the modal and prefill panel independent from specific source types.

Current providers:

- Action Properties.
- Client Organisation Properties.
- Upstream form fields from the DAG.

### State

```txt
src/state/mappingReducer.ts
```

Responsibilities:

- Store client-side mapping overrides by node ID and field key.
- Set a mapping when a user selects a data element.
- Clear a mapping without affecting unrelated fields.
- Preserve in-session mappings when users switch between form nodes.

Cleared mappings are represented explicitly so clearing an API-provided initial mapping does not fall back to showing the original mapping.

### Components

```txt
src/components/FormNodeList.tsx
src/components/FormNodeCard.tsx
src/components/JourneyGraph.tsx
src/components/SelectedFormSummary.tsx
src/components/PrefillPanel.tsx
src/components/PrefillFieldRow.tsx
src/components/AvailableDataSourcesPanel.tsx
src/components/DataElementModal.tsx
src/components/DataSourceTree.tsx
```

Responsibilities:

- Render graph summaries, form cards, selected form details, field rows, and source groups.
- Render a data-driven SVG/HTML journey graph from node positions and edges.
- Keep component state focused on UI concerns such as selected form and active modal field.
- Delegate graph traversal, field extraction, source generation, and mapping display to domain helpers.

## Data Source Extension Point

The central extension point is the `DataSourceProvider` interface in `src/domain/dataSources.ts`.

```ts
type DataSourceProvider = {
  id: string
  label: string
  getGroups: (context: DataSourceContext) => DataSourceGroup[]
}
```

The UI calls `getDataSourceGroups(context, dataSourceProviders)` and receives all available groups. It does not need to know whether a group came from the graph, action metadata, organisation metadata, or a future API-backed provider.

## Mapping Display Resolution

The prefill panel resolves mapping display in this order:

```txt
1. User override from mapping reducer
2. Existing node.data.input_mapping from the API
3. Empty state
```

This makes user edits visible immediately while preserving initial backend mappings when no override exists.

## Cycle Safety

The challenge graph is expected to be a DAG, but `getAncestorNodes` tracks visited nodes during traversal. That defensive behavior prevents infinite loops if invalid cyclic data appears.

## Testing Strategy

Coverage is split by risk:

- API tests cover URL construction, response validation, graph summary variants, and error normalization.
- Graph tests cover direct ancestors, transitive ancestors, duplicate prevention, and cycle safety.
- Data source tests cover provider composition and upstream source eligibility.
- Mapping tests cover supported, unsupported, and provider-selected mapping display.
- Reducer tests cover set, clear, and unrelated mapping preservation.
- App tests cover loading, error, form selection, modal search, mapping, clearing, persistence across form switches, and keyboard basics.

## Known Limitations

- Mapping changes are client-side only because the mock server exposes only graph retrieval.
- The graph canvas is custom SVG/HTML rather than React Flow.
- No full modal focus trap is implemented; keyboard basics are present through autofocus and Escape close.
- Global Action Properties and Client Organisation Properties use local provider data rather than external schemas.
- Source and target field type compatibility warnings are not implemented yet.
