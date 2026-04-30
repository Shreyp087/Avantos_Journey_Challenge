# UI Redesign Notes

This pass addresses the visual and layout feedback from the in-app browser review.

## Problems Found

- The app canvas was too narrow for the selected-form workflow.
- Prefill field rows used a three-column layout inside a cramped panel, causing actions to overflow.
- Every form node used the same `F` icon, which made the graph list feel generic.
- Hero copy referenced an implementation phase instead of the actual product workflow.
- The visual style leaned too heavily on soft generic cards without enough hierarchy or product character.

## Changes Made

- Widened the main app card from `980px` to `1220px`.
- Rebalanced the workspace grid so the selected form panel has more room.
- Collapsed field rows earlier at medium widths to prevent overflow.
- Added a more intentional editorial/operations visual system:
  - Fraunces headings.
  - Space Grotesk UI text.
  - warmer paper surface.
  - sharper teal/clay accents.
  - subtle blueprint grid background.
- Replaced generic node icons with the node letter from `Form A`, `Form B`, etc.
- Updated the intro copy to describe the user workflow instead of build progress.
- Made available data cards use a two-column layout when space allows.

## Verification

Commands run after the redesign:

```bash
npm test
npm run build
npm run lint
```

Current result:

```txt
Test files: 7 passed
Tests: 37 passed
Build: passed
Lint: passed
```
