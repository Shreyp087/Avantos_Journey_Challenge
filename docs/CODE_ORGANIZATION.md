# Code Organization

This document highlights how the project is structured for review, maintenance, and future extension.

## Organization Goals

- Keep API access isolated from UI state.
- Keep DAG traversal as pure, testable domain logic.
- Keep data-source discovery provider-based so new source categories can be added without rewriting the modal.
- Keep mapping state centralized so map and clear behavior remains predictable.
- Keep React components focused on rendering and user interaction.

## Source Layout

```txt
src/
  api/
    blueprintClient.ts
  components/
    AvailableDataSourcesPanel.tsx
    DataElementModal.tsx
    DataSourceTree.tsx
    FormNodeCard.tsx
    FormNodeList.tsx
    JourneyGraph.tsx
    PrefillFieldRow.tsx
    PrefillPanel.tsx
    SelectedFormSummary.tsx
  domain/
    dataSources.ts
    forms.ts
    graph.ts
    mappings.ts
  providers/
    actionPropertiesProvider.ts
    clientOrganisationProvider.ts
    formFieldProvider.ts
    index.ts
  state/
    mappingReducer.ts
  test/
    fixtures.ts
    setup.ts
  types/
    blueprint.ts
```

## Layer Responsibilities

| Layer | Responsibility | Reviewer benefit |
|---|---|---|
| `src/api` | Fetch and validate the graph response. | API behavior can be changed without touching graph traversal or UI components. |
| `src/types` | Capture the graph, form, edge, and mapping contracts. | TypeScript keeps endpoint assumptions visible and searchable. |
| `src/domain` | Handle graph traversal, form field extraction, mapping labels, and provider contracts. | Business logic is testable without rendering React. |
| `src/providers` | Adapt concrete data sources into generic source groups. | New data sources can be added by implementing one contract and registering the provider. |
| `src/state` | Manage client-side mapping overrides. | Mapping behavior stays consistent across components and selected forms. |
| `src/components` | Compose the user experience. | UI components remain small enough to review independently. |

## Data Flow

```txt
Mock server graph
  -> API client
  -> typed graph response
  -> graph index
  -> selected form node
  -> source provider groups
  -> mapping modal selection
  -> mapping reducer override
  -> prefill field display
```

## DAG Logic

The DAG-specific behavior is concentrated in `src/domain/graph.ts`.

Key capabilities:

- Build lookup maps for nodes, edges, forms, parents, and children.
- Resolve direct prerequisites for the selected form.
- Traverse all transitive upstream ancestors.
- Prevent duplicate ancestors when branches converge.
- Guard against invalid cyclic data even though the challenge graph is intended to be acyclic.

This separation makes it easier to reuse the traversal logic in a larger journey builder or to swap the UI graph implementation without changing source eligibility rules.

## Provider-Based Source Discovery

All selectable mapping sources use the same `DataSourceProvider` contract.

Current providers:

- `actionPropertiesProvider`
- `clientOrganisationProvider`
- `formFieldProvider`

The form field provider uses the graph index to expose only fields from upstream forms. For example, selecting `Form D` exposes direct fields from `Form B` and transitive fields from `Form A`.

To add a new source category:

1. Create a provider in `src/providers`.
2. Return one or more `DataSourceGroup` objects.
3. Register the provider in `src/providers/index.ts`.
4. Add provider and mapping-display tests.

No modal rewrite is required because the modal consumes generic source groups.

## Mapping State

`src/state/mappingReducer.ts` stores mapping overrides by selected node ID and target field key.

Supported actions:

- `setMapping`
- `clearMapping`

Cleared fields are stored explicitly. This prevents an API-provided initial mapping from reappearing after a user clears it during the same session.

## Component Composition

The main UI is composed through `src/App.tsx`.

Primary component responsibilities:

- `JourneyGraph`: renders the dynamic DAG visualization and selection affordances.
- `FormNodeList`: renders the list of form nodes from the API graph.
- `SelectedFormSummary`: displays selected form metadata, prerequisites, prefill fields, and available sources.
- `PrefillPanel`: renders target fields and their mapping state.
- `DataElementModal`: handles source search, source selection, and confirmation.
- `DataSourceTree`: renders grouped provider output.

## Test Coverage By Concern

| Concern | Test files |
|---|---|
| API URL building, validation, and errors | `src/api/blueprintClient.test.ts` |
| DAG indexing and traversal | `src/domain/graph.test.ts` |
| Form field extraction | `src/domain/forms.test.ts` |
| Provider composition and upstream source eligibility | `src/domain/dataSources.test.ts` |
| Mapping labels and unsupported mapping safety | `src/domain/mappings.test.ts` |
| Reducer map and clear behavior | `src/state/mappingReducer.test.ts` |
| Loading, selection, modal search, mapping, clearing, and persistence | `src/App.test.tsx` |

## Extension Points

The most important extension points are:

- Add a source provider through `src/providers`.
- Persist mapping changes by adding a save API around the reducer output.
- Add field compatibility warnings by comparing target field schema metadata with `DataElement.valueType`.
- Replace the custom SVG/HTML graph with a graph library while preserving `src/domain/graph.ts`.
- Add async provider support if future source schemas need to be fetched from external endpoints.

## Review Notes

The challenge asks for clear separation of concerns, thoughtful component hierarchy, reusable components, documentation, good tests, and modern React practices. The project structure is designed around those criteria:

- Domain behavior is separated from presentation.
- Components are composed around workflow steps rather than endpoint shapes.
- Providers make the mapping modal reusable across source categories.
- Tests cover the risky parts of the implementation directly.
- Documentation explains setup, architecture, extension, and known limitations.
