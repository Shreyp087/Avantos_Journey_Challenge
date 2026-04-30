# Graph View Notes

The app now includes a dynamic graphical DAG view above the form list and selected-form details.

## What It Does

- Renders form nodes from the API response.
- Uses each node's `position.x` and `position.y` values to lay out the graph.
- Draws SVG connector paths from `graph.edges`.
- Lets users click graph cards to select a form.
- Reuses the same `selectedNodeId` state as the form list.
- Highlights the selected form and its upstream ancestor path.
- Keeps the graph horizontally scrollable on narrow screens.

## Why It Is Custom

The challenge listed React Flow as optional polish, but a custom SVG/HTML graph is enough for this workflow and keeps the project lightweight.

This approach avoids adding a large dependency while still proving:

- The graph is truly data-driven.
- Node selection works from both list and visual graph.
- Edges are rendered from the DAG, not hardcoded.
- The UI can dynamically explain upstream prefill sources per selected form.

## Important Files

```txt
src/components/JourneyGraph.tsx
src/App.tsx
src/App.css
src/App.test.tsx
```

## Selection Behavior

No selection:

```txt
All graph nodes are visible and clickable.
```

Selected Form D:

```txt
Selected: Form D
Upstream path: Form A -> Form B -> Form D
```

Selected Form F:

```txt
Selected: Form F
Upstream path:
- Form A -> Form B -> Form D -> Form F
- Form A -> Form C -> Form E -> Form F
```

## Verification

Commands run after adding the graph view:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 7 passed
Tests: 38 passed
Build: passed
Lint: passed
```
