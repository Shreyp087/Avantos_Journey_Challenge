import { getDataSourceGroups } from '../domain/dataSources'
import { getFormFields } from '../domain/forms'
import { getAncestorNodes, getFormForNode } from '../domain/graph'
import type {
  DataSourceContext,
  DataSourceGroup,
  DataSourceProvider,
} from '../domain/dataSources'

export const formFieldProvider: DataSourceProvider = {
  id: 'form-fields',
  label: 'Upstream form fields',
  getGroups: getUpstreamFormFieldGroups,
}

export function getUpstreamFormFieldGroups({
  graphIndex,
  selectedNodeId,
}: DataSourceContext): DataSourceGroup[] {
  return getAncestorNodes(graphIndex, selectedNodeId)
    .map((ancestor) => {
      const form = getFormForNode(graphIndex, ancestor.node.id)
      const fields = getFormFields(form)

      return {
        id: `form:${ancestor.node.id}`,
        label: ancestor.node.data.name,
        kind: 'form_field',
        description:
          ancestor.distance === 1
            ? 'Direct upstream form'
            : `${ancestor.distance} hops upstream`,
        distance: ancestor.distance,
        children: fields.map((field) => ({
          id: `form:${ancestor.node.id}:field:${field.key}`,
          label: field.label,
          kind: 'form_field',
          valueType: field.typeLabel,
          sourceNodeId: ancestor.node.id,
          sourceNodeName: ancestor.node.data.name,
          sourceFormId: form?.id,
          fieldKey: field.key,
          path: [ancestor.node.data.name, field.key],
          distance: ancestor.distance,
        })),
      } satisfies DataSourceGroup
    })
    .filter((group) => group.children.length > 0)
}

export function getFormFieldSourceGroups(context: DataSourceContext) {
  return getDataSourceGroups(context, [formFieldProvider])
}
