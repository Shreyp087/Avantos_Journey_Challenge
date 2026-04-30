# Phase 2 Notes: Graph Domain Layer

Phase 2 adds pure graph utilities for the Journey Builder DAG. This layer is deliberately independent from React so the traversal rules can be tested, reused, and trusted before UI work begins.

## What This Phase Adds

- `buildGraphIndex` to normalize nodes, forms, and edges into lookup maps.
- `getDirectPrerequisites` to read direct upstream dependencies from incoming edges.
- `getDirectDependents` to read downstream dependencies from outgoing edges.
- `getAncestorNodes` to walk all direct and transitive upstream dependencies.
- `getFormForNode` to resolve a form node to its reusable form schema.
- `getNodeById` for safe node lookup.
- `detectCycle` for defensive cycle detection.
- Tracking for broken edges and form nodes with missing form schemas.
- Unit tests for the challenge DAG and invalid graph edge cases.

## Important Files

```txt
src/domain/graph.ts
src/domain/graph.test.ts
src/test/fixtures.ts
docs/PHASE_2_GRAPH_DOMAIN.md
```

## Graph Index Shape

```ts
type GraphIndex = {
  graph: BlueprintGraphResponse
  nodesById: ReadonlyMap<string, BlueprintNode>
  formsById: ReadonlyMap<string, ActionForm>
  incomingByTarget: ReadonlyMap<string, BlueprintEdge[]>
  outgoingBySource: ReadonlyMap<string, BlueprintEdge[]>
  nodeToForm: ReadonlyMap<string, ActionForm>
  brokenEdges: BlueprintEdge[]
  nodesMissingForms: BlueprintNode[]
}
```

The index gives later phases fast lookups without recomputing graph relationships inside React components.

## Source Of Truth

Traversal uses `edges`, not `node.data.prerequisites`.

Reason:

- The challenge describes the UI as a DAG.
- The official graph endpoint returns explicit edges.
- Edges are the clearest source of directionality for graph traversal.
- `prerequisites` can still be useful metadata, but it should not be the primary traversal mechanism.

## Direct Prerequisites

For an edge:

```txt
A -> B
```

`getDirectPrerequisites(index, B)` returns `A`.

In the sample graph:

```txt
getDirectPrerequisites(Form D) -> [Form B]
getDirectPrerequisites(Form F) -> [Form D, Form E]
getDirectPrerequisites(Form A) -> []
```

## Ancestor Traversal

`getAncestorNodes` returns all upstream nodes with distance metadata.

For Form D:

```txt
Form B, distance 1
Form A, distance 2
```

For Form F:

```txt
Form D, distance 1
Form E, distance 1
Form B, distance 2
Form C, distance 2
Form A, distance 3
```

Distance is useful for the mapping modal because direct dependencies can be displayed before transitive dependencies.

## Duplicate Handling

The traversal tracks visited node IDs.

This matters for shared ancestors. In the sample graph, Form A reaches Form F through both branches:

```txt
A -> B -> D -> F
A -> C -> E -> F
```

`getAncestorNodes(Form F)` returns Form A once, not twice.

## Cycle Safety

The challenge graph should be acyclic, but invalid data should not freeze the app.

`getAncestorNodes` initializes its visited set with the selected node ID. If invalid cyclic data points back to the selected node, traversal skips it instead of recursing forever.

`detectCycle` provides explicit cycle detection for diagnostics:

```ts
detectCycle(index)
```

Returns:

```ts
{
  hasCycle: boolean
  cycleNodeIds: string[]
}
```

## Broken References

`buildGraphIndex` records, but does not throw for:

- Edges where source or target node IDs are missing.
- Form nodes whose `component_id` does not match a returned form schema.

This keeps the UI resilient. Later phases can surface those warnings as non-blocking empty states or diagnostics.

## Tests Added

Current graph tests verify:

- Node, form, edge, and node-to-form indexing.
- Direct prerequisite lookup.
- Direct dependent lookup.
- Form D ancestors include Form B and Form A.
- Form F ancestors include Form D, Form E, Form B, Form C, and Form A.
- Form A has no ancestors.
- Shared ancestors are not duplicated.
- Invalid cyclic data does not infinite-loop traversal.
- Cycle detection reports cyclic graphs.
- Broken edges and missing schemas are recorded safely.

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
Tests: 16 passed
Build: passed
Lint: passed
```

## Phase 3 Handoff

Phase 3 can now build UI selection on top of stable graph utilities.

Recommended next components:

```txt
FormNodeList
FormNodeCard
SelectedFormSummary
```

Useful Phase 2 functions for Phase 3:

```ts
const graphIndex = buildGraphIndex(graph)
const selectedNode = getNodeById(graphIndex, selectedNodeId)
const selectedForm = getFormForNode(graphIndex, selectedNodeId)
const directPrerequisites = getDirectPrerequisites(graphIndex, selectedNodeId)
```

