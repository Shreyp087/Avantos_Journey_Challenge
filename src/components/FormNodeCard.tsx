import { getDirectPrerequisites, getFormForNode } from '../domain/graph'
import type { GraphIndex } from '../domain/graph'
import type { BlueprintNode } from '../types/blueprint'

type FormNodeCardProps = {
  graphIndex: GraphIndex
  node: BlueprintNode
  isSelected: boolean
  onSelect: (nodeId: string) => void
}

export function FormNodeCard({
  graphIndex,
  node,
  isSelected,
  onSelect,
}: FormNodeCardProps) {
  const form = getFormForNode(graphIndex, node.id)
  const fieldCount = Object.keys(form?.field_schema.properties ?? {}).length
  const prerequisiteCount = getDirectPrerequisites(graphIndex, node.id).length
  const nodeInitial = node.data.name.split(' ').at(-1)?.charAt(0) ?? 'F'

  return (
    <button
      type="button"
      className="form-node-card"
      aria-pressed={isSelected}
      onClick={() => onSelect(node.id)}
    >
      <span className="node-card-header">
        <span className="node-icon" aria-hidden="true">
          {nodeInitial}
        </span>
        <span>
          <span className="node-kicker">Form node</span>
          <strong>{node.data.name}</strong>
        </span>
      </span>

      <span className="node-card-meta">
        <span>{fieldCount} fields</span>
        <span>{prerequisiteCount} direct sources</span>
      </span>

      {!form ? (
        <span className="node-warning">Missing form schema</span>
      ) : null}
    </button>
  )
}
