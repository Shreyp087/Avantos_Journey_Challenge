# Data Source Provider Guide

This guide explains how to add a new mapping source without changing the prefill panel or modal internals.

## Provider Contract

Providers implement `DataSourceProvider` from `src/domain/dataSources.ts`.

```ts
type DataSourceProvider = {
  id: string
  label: string
  getGroups: (context: DataSourceContext) => DataSourceGroup[]
}
```

The provider receives:

```ts
type DataSourceContext = {
  graphIndex: GraphIndex
  selectedNodeId: string
}
```

It returns one or more groups:

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

Each group contains selectable elements:

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

## Add A Provider

Create a file in `src/providers`.

Example:

```ts
import type { DataSourceProvider } from '../domain/dataSources'

export const journeyMetadataProvider: DataSourceProvider = {
  id: 'journey-metadata',
  label: 'Journey Metadata',
  getGroups: () => [
    {
      id: 'journey-metadata',
      label: 'Journey Metadata',
      kind: 'action_property',
      description: 'Metadata from the current journey run.',
      children: [
        {
          id: 'journey-metadata:started_at',
          label: 'Started at',
          kind: 'action_property',
          valueType: 'datetime',
          path: ['Journey Metadata', 'started_at'],
        },
      ],
    },
  ],
}
```

## Register The Provider

Add the provider to `src/providers/index.ts`.

```ts
import { journeyMetadataProvider } from './journeyMetadataProvider'

export const dataSourceProviders: DataSourceProvider[] = [
  actionPropertiesProvider,
  clientOrganisationProvider,
  formFieldProvider,
  journeyMetadataProvider,
]
```

After registration, the new group automatically appears in:

- `AvailableDataSourcesPanel`.
- `DataElementModal`.
- Search/filter behavior.
- Mapping confirmation flow.

## Add A New Kind If Needed

If a provider introduces a source category that does not fit the existing kinds, update `DataSourceKind`.

```ts
export type DataSourceKind =
  | 'form_field'
  | 'action_property'
  | 'client_organisation_property'
  | 'journey_metadata'
```

Then update `getDataElementMappingDisplay` in `src/domain/mappings.ts` so selected elements produce readable mapping labels.

```ts
if (dataElement.kind === 'journey_metadata') {
  return createMappedLabel(
    `Journey Metadata.${dataElement.path?.at(-1) ?? dataElement.label}`,
  )
}
```

## Add Tests

Provider tests should verify:

- The provider returns stable group IDs and labels.
- Empty children are filtered out by `getDataSourceGroups`.
- The provider only returns sources valid for the selected node.
- Any new source kind renders a readable mapping label.

Good places for tests:

```txt
src/domain/dataSources.test.ts
src/domain/mappings.test.ts
```

## Provider Design Tips

- Keep provider output deterministic so reviewers see stable ordering.
- Prefer human-readable labels for groups and elements.
- Include `path` for display and search.
- Include `valueType` when it helps users understand compatibility.
- Keep API calls outside the modal when possible; fetch and normalize before returning provider groups if the source becomes asynchronous in the future.

## Current Providers

```txt
Action Properties
Client Organisation Properties
Upstream form fields
```

The upstream form field provider uses graph traversal to include direct and transitive ancestors while excluding the selected form and downstream forms.
