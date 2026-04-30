import type { DataSourceProvider } from '../domain/dataSources'

const actionPropertyElements = [
  {
    id: 'action:id',
    label: 'Action ID',
    kind: 'action_property',
    valueType: 'string',
    path: ['Action Properties', 'id'],
  },
  {
    id: 'action:created_at',
    label: 'Created at',
    kind: 'action_property',
    valueType: 'datetime',
    path: ['Action Properties', 'created_at'],
  },
  {
    id: 'action:completed_at',
    label: 'Completed at',
    kind: 'action_property',
    valueType: 'datetime',
    path: ['Action Properties', 'completed_at'],
  },
  {
    id: 'action:status',
    label: 'Status',
    kind: 'action_property',
    valueType: 'string',
    path: ['Action Properties', 'status'],
  },
] as const

export const actionPropertiesProvider: DataSourceProvider = {
  id: 'action-properties',
  label: 'Action Properties',
  getGroups: () => [
    {
      id: 'action-properties',
      label: 'Action Properties',
      kind: 'action_property',
      description: 'Global properties from the current action run.',
      children: actionPropertyElements.map((element) => ({ ...element })),
    },
  ],
}
