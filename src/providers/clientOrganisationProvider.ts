import type { DataSourceProvider } from '../domain/dataSources'

const clientOrganisationElements = [
  {
    id: 'client-organisation:id',
    label: 'Client organisation ID',
    kind: 'client_organisation_property',
    valueType: 'string',
    path: ['Client Organisation Properties', 'id'],
  },
  {
    id: 'client-organisation:name',
    label: 'Name',
    kind: 'client_organisation_property',
    valueType: 'string',
    path: ['Client Organisation Properties', 'name'],
  },
  {
    id: 'client-organisation:email',
    label: 'Email',
    kind: 'client_organisation_property',
    valueType: 'email',
    path: ['Client Organisation Properties', 'email'],
  },
] as const

export const clientOrganisationProvider: DataSourceProvider = {
  id: 'client-organisation-properties',
  label: 'Client Organisation Properties',
  getGroups: () => [
    {
      id: 'client-organisation-properties',
      label: 'Client Organisation Properties',
      kind: 'client_organisation_property',
      description: 'Global properties from the active client organisation.',
      children: clientOrganisationElements.map((element) => ({ ...element })),
    },
  ],
}
