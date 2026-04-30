# Journey Builder React Coding Challenge PRD

## 1. Product Summary

### Product Name

Journey Builder Prefill Mapping UI

### Objective

Build a React application that consumes an Avantos action blueprint graph from a mock API, understands the graph as a directed acyclic graph (DAG), and allows users to inspect and configure prefill mappings for form fields using data from upstream forms and future extensible data sources.

### Challenge Context

Avantos workflows are modeled as directed acyclic graphs of action components. In this challenge, the graph contains form nodes. When a downstream form is submitted, its fields can be prefilled with values produced by upstream forms.

For example:

- Form A can provide values to Form B and Form C.
- Form B can provide values to Form D.
- Form A can also provide values to Form D transitively through Form B.

The product must make this upstream data available to users when configuring prefill mappings.

### Primary Outcome

A reviewer should be able to run the app locally, fetch the mock graph, select a form node, view its fields, and configure mappings from valid upstream data elements.

## 2. Source Links

- DAG reference: https://en.wikipedia.org/wiki/Directed_acyclic_graph
- Avantos docs: https://admin-ui.dev-sandbox.workload.avantos-ai.net/docs#/operations/action-blueprint-graph-get
- Avantos OpenAPI spec: https://admin-ui.dev-sandbox.workload.avantos-ai.net/openapi.yaml
- Mock server: https://github.com/mosaic-avantos/frontendchallengeserver

## 3. Problem Statement

Users configuring journey forms need a clear way to map a target form field to available source data. Available source data is not flat. It depends on where the selected form sits inside a DAG.

The application must therefore:

- Fetch the action blueprint graph.
- Identify forms and their schemas.
- Traverse upstream dependencies.
- Present available source fields grouped by source.
- Allow users to create, update, and clear field mappings.
- Be structured so future data source types can be added without rewriting core UI logic.

## 4. Goals

### Product Goals

- Show the graph's form components in a readable UI.
- Let users select a form node and inspect that form's fields.
- Show existing prefill mappings for the selected form.
- Allow users to map a selected form field to an available data element.
- Include direct and transitive upstream form fields as mapping options.
- Support global data source categories such as Action Properties and Client Organisation Properties through an extensible provider architecture.

### Engineering Goals

- Keep graph traversal logic separate from React rendering.
- Keep API response types, normalized domain models, and UI state distinct.
- Use TypeScript for strong contracts and clearer reviewer confidence.
- Provide unit tests for DAG traversal and source eligibility.
- Provide component tests for core mapping interactions.
- Document how to run, test, and extend the app.

### Evaluation Alignment

This implementation should directly address the stated evaluation criteria:

- Code organization through domain-level modules and separated concerns.
- Extensibility through reusable data source providers and mapping adapters.
- Documentation through a clear README and architecture notes.
- Code quality through readable TypeScript, descriptive names, and tests.

## 5. Non-Goals

- Persisting mappings back to a real Avantos backend.
- Creating a full production-grade graph editor.
- Supporting graph mutation, drag-and-drop graph editing, or node creation.
- Implementing authentication.
- Rendering every possible Avantos component type beyond forms for the MVP.
- Building real Action Properties or Client Organisation Properties integrations beyond placeholder/provider structure unless time permits.

## 6. Users and Personas

### Primary User: Workflow Builder

A user configuring journey forms who needs to decide which upstream data should prefill downstream fields.

Needs:

- Understand which form is selected.
- See the selected form's fields.
- Know what upstream data is valid for mapping.
- Quickly search and select a source field.
- Clear incorrect mappings.

### Secondary User: Reviewer or Engineer

An Avantos engineer reviewing the coding challenge.

Needs:

- Run the project locally.
- See thoughtful component hierarchy.
- Inspect clear tests around DAG traversal.
- Understand how to add future data sources.
- Trust that the app is not hardcoded to the sample graph.

## 7. Assumptions

- The mock server is run separately on `http://localhost:3000`.
- The mock server accepts arbitrary tenant and blueprint path IDs for the graph route.
- The graph response includes `nodes`, `edges`, and `forms`.
- Form nodes reference form schemas through `node.data.component_id`.
- Form fields are found in `form.field_schema.properties`.
- Existing mappings are available in `node.data.input_mapping`.
- Since the mock server only supports `GET`, mapping edits are client-side only.
- The graph is expected to be a DAG, but the app should detect and handle cycles defensively.

## 8. API Contract

### Mock Endpoint

```txt
GET http://localhost:3000/api/v1/{tenant_id}/actions/blueprints/{action_blueprint_id}/graph
```

The mock server route differs slightly from the current OpenAPI operation. It does not require `blueprint_version_id`.

### Official Docs Endpoint

```txt
GET /api/v1/{tenant_id}/actions/blueprints/{action_blueprint_id}/{blueprint_version_id}/graph
```

### Expected Response Shape

```ts
type BlueprintGraphResponse = {
  nodes: BlueprintNode[];
  edges: BlueprintEdge[];
  forms: ActionForm[];
  branches?: unknown[];
  triggers?: unknown[];
};

type BlueprintEdge = {
  source: string;
  target: string;
};

type BlueprintNode = {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    id: string;
    component_key: string;
    component_type: string;
    component_id: string;
    name: string;
    prerequisites: string[];
    input_mapping: Record<string, unknown>;
  };
};

type ActionForm = {
  id: string;
  name: string;
  description?: string;
  field_schema: {
    type: string;
    properties: Record<string, FormFieldSchema>;
    required?: string[];
  };
  ui_schema?: unknown;
  dynamic_field_config?: Record<string, unknown>;
};
```

## 9. Core Product Requirements

### Requirement 1: Load Blueprint Graph

The application must fetch the blueprint graph from the mock server and render loading, success, and error states.

Acceptance criteria:

- App shows a loading state while fetching.
- App shows a helpful error if the API request fails.
- App renders form nodes after a successful response.
- App does not crash if optional fields are missing.

### Requirement 2: Display Form Nodes

The application must show all form nodes in the graph.

Acceptance criteria:

- Each node displays a human-readable name such as `Form A`.
- The selected node is visually distinguishable.
- Nodes can be shown as cards/list items for MVP.
- A graph canvas is optional polish, not required for MVP.

### Requirement 3: Select a Form

Users must be able to select a form and view its prefill configuration.

Acceptance criteria:

- Selecting a form updates the prefill panel.
- The prefill panel shows the selected form name.
- The prefill panel lists fields from that form's `field_schema.properties`.
- The panel indicates which fields are required when available from schema.

### Requirement 4: Show Existing Mappings

The application must show existing mappings from `node.data.input_mapping` when present.

Acceptance criteria:

- Existing mappings are parsed into internal mapping state.
- Mappings are displayed in a readable form.
- Unknown or unsupported mapping expressions are shown safely as unsupported rather than crashing.

### Requirement 5: Compute Available Upstream Form Fields

The application must determine which form fields can be mapped into the selected form.

Acceptance criteria:

- Direct upstream forms are included.
- Transitive upstream forms are included.
- The selected form itself is excluded.
- Downstream forms are excluded.
- Duplicate source forms are not shown twice.
- Source groups are ordered in a stable and understandable way.

Example:

```txt
Selected Form D
Available sources:
- Form B
- Form A
```

```txt
Selected Form F
Available sources:
- Form D
- Form E
- Form B
- Form C
- Form A
```

### Requirement 6: Configure Field Mapping

Users must be able to map a selected form field to an available data element.

Acceptance criteria:

- Each field row has a configure action.
- Configure opens a modal or drawer.
- The modal shows grouped data sources.
- The user can search data elements.
- The user can select one data element.
- The select action is disabled until an element is chosen.
- Confirming the selection updates the field mapping.

### Requirement 7: Clear Field Mapping

Users must be able to remove an existing mapping.

Acceptance criteria:

- Mapped fields display a clear/remove button.
- Clicking clear removes only that field's mapping.
- Other mappings for the same form are preserved.

### Requirement 8: Extensible Data Source System

The application must support adding new mapping source categories without changing the prefill panel or modal internals.

Acceptance criteria:

- Data source providers implement a shared interface.
- Form field sources are one provider.
- Action Properties and Client Organisation Properties are represented as separate providers, even if initially stubbed.
- The modal consumes provider output generically.
- Adding a new provider requires registering it in one place.

Suggested provider interface:

```ts
type DataSourceProvider = {
  id: string;
  label: string;
  getGroups(context: DataSourceContext): DataSourceGroup[];
};
```

### Requirement 9: Client-Side Mapping State

Because the mock server does not persist changes, the app must manage mapping state in memory.

Acceptance criteria:

- Mapping state is keyed by selected node ID and target field key.
- Users can set and clear mappings during the session.
- Optional local storage persistence may be added if time permits.
- A debug JSON view may be added if time permits.

### Requirement 10: Documentation

The project must include clear documentation.

Acceptance criteria:

- README explains setup.
- README explains how to run the mock server.
- README explains how to run the frontend.
- README explains how to run tests.
- README explains how to add a new data source provider.
- README lists assumptions and known limitations.

## 10. UX Requirements

### Main Screen

The main app should include:

- Header with app title and API status.
- Left section for form nodes.
- Right section for the selected form's prefill configuration.
- Optional debug/details section for graph metadata.

### Node Card

Each node card should show:

- Form name.
- Form type.
- Count of fields.
- Count of direct prerequisites.
- Selected state.

### Prefill Panel

The prefill panel should show:

- Selected form name.
- Prefill enabled toggle, if included.
- Field rows.
- Mapping pill or empty state per field.
- Configure and clear actions.

### Data Element Modal

The modal should show:

- Title: `Select data element to map`.
- Search field.
- Data source groups.
- Nested field list.
- Cancel button.
- Select button.

### Empty States

The UI should handle:

- No selected form.
- Selected form has no fields.
- Selected form has no upstream sources.
- API error.
- Unsupported mapping expression.

## 11. Technical Architecture

### Recommended Stack

- React
- TypeScript
- Vite
- Vitest
- React Testing Library
- Optional: `@xyflow/react` for graph visualization

### Suggested Folder Structure

```txt
src/
  api/
    blueprintClient.ts
  components/
    AppShell.tsx
    FormNodeList.tsx
    FormNodeCard.tsx
    PrefillPanel.tsx
    PrefillFieldRow.tsx
    DataElementModal.tsx
    DataSourceTree.tsx
    LoadingState.tsx
    ErrorState.tsx
  domain/
    graph.ts
    forms.ts
    mappings.ts
    dataSources.ts
  providers/
    formFieldProvider.ts
    actionPropertiesProvider.ts
    clientOrganisationProvider.ts
  state/
    mappingReducer.ts
  types/
    blueprint.ts
  test/
    fixtures.ts
```

### Data Flow

```txt
API response
  -> blueprintClient
  -> typed graph response
  -> graph normalization
  -> selected node state
  -> data source providers
  -> modal options
  -> mapping reducer
  -> prefill panel display
```

### Separation of Concerns

- `api`: HTTP and response handling only.
- `domain`: Pure functions for graph, form, and mapping behavior.
- `providers`: Data source strategy implementations.
- `components`: UI rendering and user interactions.
- `state`: Reducer and mapping state transitions.

## 12. Domain Model

### Normalized Graph Index

```ts
type GraphIndex = {
  nodesById: Map<string, BlueprintNode>;
  formsById: Map<string, ActionForm>;
  incomingByTarget: Map<string, BlueprintEdge[]>;
  outgoingBySource: Map<string, BlueprintEdge[]>;
  nodeToForm: Map<string, ActionForm>;
};
```

### Data Source Model

```ts
type DataSourceKind =
  | 'form_field'
  | 'action_property'
  | 'client_organisation_property';

type DataElement = {
  id: string;
  label: string;
  kind: DataSourceKind;
  valueType?: string;
  sourceNodeId?: string;
  sourceNodeName?: string;
  sourceFormId?: string;
  fieldKey?: string;
};

type DataSourceGroup = {
  id: string;
  label: string;
  children: DataElement[];
};
```

### Mapping Model

```ts
type FieldMapping = {
  targetNodeId: string;
  targetFieldKey: string;
  source: DataElement;
};

type MappingState = Record<string, Record<string, FieldMapping>>;
```

## 13. Graph Traversal Rules

### Direct Upstream Dependency

A direct upstream node is any edge source where the selected node is the edge target.

```txt
A -> B
```

For selected `B`, `A` is direct upstream.

### Transitive Upstream Dependency

A transitive upstream node is any ancestor reachable by recursively following incoming edges.

```txt
A -> B -> D
```

For selected `D`, both `B` and `A` are upstream.

### Cycle Safety

Although the graph should be acyclic, traversal functions must track visited nodes to avoid infinite loops if invalid data is received.

### Ordering

Recommended source ordering:

1. Direct upstream forms.
2. Transitive upstream forms by distance from the selected node.
3. Alphabetical by form name as a tie-breaker.
4. Global data source groups before or after form groups, but consistently.

## 14. Testing Strategy

### Unit Tests

Graph tests:

- `buildGraphIndex` builds node and edge indexes.
- `getDirectPrerequisites` returns direct parents.
- `getAncestorNodes` returns all upstream nodes.
- `getAncestorNodes` avoids duplicates.
- `getAncestorNodes` handles missing nodes.
- `detectCycle` catches invalid cyclic graphs.

Data source tests:

- Form field provider returns fields from upstream forms.
- Selected form fields are excluded as sources.
- Downstream forms are excluded.
- Empty upstream state returns an empty group or helpful fallback.

Mapping tests:

- Reducer sets a mapping.
- Reducer clears one mapping.
- Reducer preserves unrelated mappings.
- Adapter handles unsupported expressions safely.

### Component Tests

- App renders loading state.
- App renders error state.
- Form node list renders fetched nodes.
- Selecting a node updates prefill panel.
- Configure button opens modal.
- Selecting a data element updates mapping display.
- Clear button removes mapping display.

### Manual QA

Verify:

- Mock server running on port `3000`.
- App fetches data successfully.
- Form A has no upstream form field sources.
- Form D shows Form B and Form A.
- Form F shows Form D, Form E, Form B, Form C, and Form A.
- Mapping a field updates UI immediately.
- Clearing a field does not clear other fields.
- Search filters modal options.
- Page is usable at desktop and narrow widths.

## 15. Phased Execution Plan

## Phase 0: Discovery and Project Setup

### Goal

Create the project foundation and verify the mock server contract.

### Tasks

- Initialize React + TypeScript project with Vite.
- Install testing dependencies.
- Clone or document the mock server setup.
- Verify the graph endpoint manually.
- Add base project scripts.
- Add initial README setup instructions.

### Deliverables

- Running React app.
- Working test command.
- Confirmed mock API URL.
- Initial README.

### Acceptance Criteria

- `npm install` completes.
- `npm run dev` starts the frontend.
- `npm test` runs successfully.
- Mock server returns graph JSON from `localhost:3000`.

## Phase 1: API Client and Types

### Goal

Create typed API access and shared domain types.

### Tasks

- Define TypeScript types for graph response, nodes, edges, and forms.
- Implement `fetchBlueprintGraph`.
- Add loading, success, and error handling.
- Add mock graph fixture for tests.
- Add basic API error normalization.

### Deliverables

- `src/api/blueprintClient.ts`
- `src/types/blueprint.ts`
- Test fixture graph.

### Acceptance Criteria

- API client returns typed graph data.
- UI can show loading and error states.
- No component depends directly on untyped `any` API data.

## Phase 2: Graph Domain Layer

### Goal

Implement reusable DAG traversal utilities.

### Tasks

- Build graph normalization function.
- Implement direct upstream lookup.
- Implement transitive ancestor traversal.
- Implement cycle detection or cycle-safe traversal.
- Implement node-to-form resolution.
- Add unit tests for graph behavior.

### Deliverables

- `src/domain/graph.ts`
- Unit tests for graph traversal.

### Acceptance Criteria

- Selected Form D resolves Form B and Form A as upstream sources.
- Selected Form F resolves all valid ancestors.
- Traversal functions do not depend on React.
- Tests cover direct, transitive, empty, and invalid graph scenarios.

## Phase 3: Basic UI Shell and Node Selection

### Goal

Render the graph forms and allow selecting a form.

### Tasks

- Build app shell layout.
- Build form node list.
- Build form node card.
- Add selected node state.
- Render selected form details.
- Handle no-selection state.

### Deliverables

- `AppShell`
- `FormNodeList`
- `FormNodeCard`
- Selected form panel scaffold.

### Acceptance Criteria

- All form nodes are visible.
- Clicking a node selects it.
- Selected node is visually distinct.
- Selected form name appears in the details panel.

## Phase 4: Prefill Panel

### Goal

Show target fields for the selected form and their mapping state.

### Tasks

- Resolve selected node to its form schema.
- Extract field list from `field_schema.properties`.
- Build prefill panel.
- Build field row component.
- Parse initial `input_mapping` where possible.
- Add empty and unsupported mapping states.

### Deliverables

- `PrefillPanel`
- `PrefillFieldRow`
- Mapping display helper.

### Acceptance Criteria

- Selected form fields are listed.
- Required fields are visually marked.
- Existing mappings are displayed if present.
- Unsupported mappings do not crash the UI.

## Phase 5: Data Source Provider System

### Goal

Create an extensible mechanism for mapping source options.

### Tasks

- Define `DataSourceProvider` interface.
- Implement form field provider.
- Implement placeholder Action Properties provider.
- Implement placeholder Client Organisation Properties provider.
- Add provider registry.
- Add unit tests for provider output.

### Deliverables

- `src/domain/dataSources.ts`
- `src/providers/formFieldProvider.ts`
- `src/providers/actionPropertiesProvider.ts`
- `src/providers/clientOrganisationProvider.ts`

### Acceptance Criteria

- Providers are consumed through one generic interface.
- Form field provider uses graph traversal to return only upstream fields.
- Adding a new provider requires registering it, not rewriting the modal.

## Phase 6: Mapping Modal

### Goal

Let users select an available source data element for a target field.

### Tasks

- Build modal or drawer component.
- Show provider groups.
- Add expandable/collapsible group UI if useful.
- Add search input.
- Add selected data element state.
- Disable select button until an option is selected.
- On confirm, update mapping state.

### Deliverables

- `DataElementModal`
- `DataSourceTree`
- Search/filter helper.

### Acceptance Criteria

- Configure opens modal for the correct field.
- Modal lists valid upstream sources.
- Search filters by group and field label.
- Selecting an element enables confirmation.
- Confirming updates the prefill panel.

## Phase 7: Mapping State and Clear Behavior

### Goal

Complete client-side mapping management.

### Tasks

- Implement mapping reducer.
- Add set mapping action.
- Add clear mapping action.
- Ensure mappings are keyed by node and field.
- Add tests for mapping reducer.
- Optional: add local storage persistence.

### Deliverables

- `src/state/mappingReducer.ts`
- Reducer tests.
- Clear mapping button in field rows.

### Acceptance Criteria

- Mapping one field does not affect other fields.
- Clearing one field does not affect other mappings.
- Switching selected forms preserves mappings during the session.

## Phase 8: Polish, Accessibility, and Responsiveness

### Goal

Make the app pleasant, readable, and robust enough for review.

### Tasks

- Improve visual hierarchy.
- Add responsive layout.
- Add keyboard-friendly modal interactions.
- Add accessible labels for buttons and inputs.
- Add empty states and helper copy.
- Add debug JSON panel if time permits.

### Deliverables

- Polished UI.
- Accessible modal basics.
- Responsive behavior.

### Acceptance Criteria

- App is usable on desktop and narrow screens.
- Buttons and inputs have accessible labels.
- Empty states are helpful.
- The UI feels intentional without overbuilding.

## Phase 9: Test Coverage and Final Documentation

### Goal

Prepare the project for submission.

### Tasks

- Add missing unit tests.
- Add component tests for core interactions.
- Finalize README.
- Add architecture section.
- Add data source extension guide.
- Run tests.
- Run lint/typecheck if configured.
- Do final review against challenge criteria.

### Deliverables

- Passing test suite.
- Complete README.
- Submission-ready repository.

### Acceptance Criteria

- README explains local setup clearly.
- README explains how to add a new data source.
- Tests cover graph traversal and mapping behavior.
- App runs locally without special hidden setup.

## 16. Recommended MVP Scope

The MVP should include:

- React + TypeScript app.
- Fetch mock graph.
- Display form node list.
- Select form.
- Show target fields.
- Compute upstream form fields.
- Configure mapping through modal.
- Clear mapping.
- Unit tests for graph traversal.
- README with setup and extension guide.

The MVP can defer:

- Full graph canvas.
- Persisting to backend.
- Advanced styling.
- Real global data source API calls.
- Full JSON Forms rendering.

## 17. Stretch Goals

If time remains, add:

- React Flow graph canvas.
- Minimap or graph overview.
- Local storage persistence.
- Mapping JSON export panel.
- More expressive field type icons.
- Type compatibility warnings between source and target fields.
- Better handling of dynamic fields.
- Keyboard navigation in source tree.

## 18. Risks and Mitigations

### Risk: Overbuilding The Graph Visualization

Mitigation:

Prioritize mapping logic first. Use a list/card UI for MVP. Add graph canvas only after core functionality and tests are complete.

### Risk: Hardcoding Sample Forms

Mitigation:

All form and field options must come from the API response and graph traversal utilities.

### Risk: Mapping Expression Format Ambiguity

Mitigation:

Use an internal mapping model and isolate API expression conversion in adapter functions.

### Risk: Transitive Dependency Bugs

Mitigation:

Write pure unit tests against the sample DAG and edge cases before building the modal.

### Risk: Extensibility Claims Without Implementation

Mitigation:

Implement the provider interface and at least three providers: form fields, Action Properties placeholder, and Client Organisation Properties placeholder.

## 19. Open Questions

- Should mapping changes be persisted to local storage for reviewer convenience?
- Should Action Properties and Client Organisation Properties show placeholder fields or remain disabled until real schemas exist?
- Should source fields be type-filtered against target field types?
- Should dynamic fields receive special treatment in the UI?
- Should the UI display direct and transitive dependencies in separate sections?

## 20. Final Definition of Done

The challenge is successful when:

- A reviewer can run the frontend and mock server locally.
- The app fetches and renders the blueprint graph.
- The user can select a form node.
- The app shows the selected form's fields.
- The app computes valid upstream mapping sources from the DAG.
- The user can create, update, and clear prefill mappings.
- The data source provider architecture is clear and extensible.
- Tests verify the most important graph and mapping behavior.
- Documentation explains setup, architecture, and extension points.

