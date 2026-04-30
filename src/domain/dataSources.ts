import type { GraphIndex } from './graph'

export type DataSourceKind =
  | 'form_field'
  | 'action_property'
  | 'client_organisation_property'

export type DataElement = {
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

export type DataSourceGroup = {
  id: string
  label: string
  kind: DataSourceKind
  description?: string
  distance?: number
  children: DataElement[]
}

export type DataSourceContext = {
  graphIndex: GraphIndex
  selectedNodeId: string
}

export type DataSourceProvider = {
  id: string
  label: string
  getGroups: (context: DataSourceContext) => DataSourceGroup[]
}

export function getDataSourceGroups(
  context: DataSourceContext,
  providers: DataSourceProvider[],
) {
  return providers.flatMap((provider) =>
    provider.getGroups(context).filter((group) => group.children.length > 0),
  )
}
