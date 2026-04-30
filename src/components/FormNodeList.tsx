import { FormNodeCard } from './FormNodeCard'
import type { GraphIndex } from '../domain/graph'
import type { BlueprintNode } from '../types/blueprint'

type FormNodeListProps = {
  graphIndex: GraphIndex
  nodes: BlueprintNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
}

export function FormNodeList({
  graphIndex,
  nodes,
  selectedNodeId,
  onSelectNode,
}: FormNodeListProps) {
  if (nodes.length === 0) {
    return (
      <section className="workspace-panel">
        <p className="panel-label">Form nodes</p>
        <p className="empty-state">No form nodes were found in this graph.</p>
      </section>
    )
  }

  return (
    <section className="workspace-panel" aria-labelledby="form-node-list-title">
      <div className="panel-heading">
        <p className="panel-label">Form nodes</p>
        <h2 id="form-node-list-title">Select a form</h2>
      </div>

      <div className="form-node-list">
        {nodes.map((node) => (
          <FormNodeCard
            graphIndex={graphIndex}
            isSelected={selectedNodeId === node.id}
            key={node.id}
            node={node}
            onSelect={onSelectNode}
          />
        ))}
      </div>
    </section>
  )
}
