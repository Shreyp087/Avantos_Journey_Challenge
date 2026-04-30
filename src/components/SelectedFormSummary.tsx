import { useReducer, useState } from 'react'
import { AvailableDataSourcesPanel } from './AvailableDataSourcesPanel'
import { DataElementModal } from './DataElementModal'
import { PrefillPanel } from './PrefillPanel'
import type { DataElement } from '../domain/dataSources'
import type { FormField } from '../domain/forms'
import { getDirectPrerequisites, getFormForNode } from '../domain/graph'
import type { GraphIndex } from '../domain/graph'
import {
  getNodeMappingOverrides,
  initialMappingState,
  mappingReducer,
} from '../state/mappingReducer'
import type { BlueprintNode } from '../types/blueprint'

type SelectedFormSummaryProps = {
  graphIndex: GraphIndex
  selectedNode: BlueprintNode | undefined
}

export function SelectedFormSummary({
  graphIndex,
  selectedNode,
}: SelectedFormSummaryProps) {
  const [activeField, setActiveField] = useState<FormField | null>(null)
  const [mappingState, dispatchMapping] = useReducer(
    mappingReducer,
    initialMappingState,
  )

  if (!selectedNode) {
    return (
      <section
        className="workspace-panel selected-panel"
        aria-labelledby="selected-form-summary-title"
      >
        <p className="panel-label">Selected form</p>
        <div className="empty-state">
          <h2 id="selected-form-summary-title">No form selected yet</h2>
          <p>
            Choose a form node from the list to inspect its schema and direct
            upstream dependencies.
          </p>
        </div>
      </section>
    )
  }

  const form = getFormForNode(graphIndex, selectedNode.id)
  const directPrerequisites = getDirectPrerequisites(graphIndex, selectedNode.id)
  const fieldCount = Object.keys(form?.field_schema.properties ?? {}).length
  const selectedNodeId = selectedNode.id
  const mappingOverrides = getNodeMappingOverrides(mappingState, selectedNodeId)

  function selectDataElement(fieldKey: string, dataElement: DataElement) {
    dispatchMapping({
      type: 'setMapping',
      nodeId: selectedNodeId,
      fieldKey,
      dataElement,
    })
    setActiveField(null)
  }

  function clearFieldMapping(field: FormField) {
    dispatchMapping({
      type: 'clearMapping',
      nodeId: selectedNodeId,
      fieldKey: field.key,
    })
  }

  return (
    <section
      className="workspace-panel selected-panel"
      aria-labelledby="selected-form-summary-title"
    >
      <p className="panel-label">Selected form</p>
      <h2 id="selected-form-summary-title">Selected: {selectedNode.data.name}</h2>

      <dl className="selected-details" aria-label="Selected form details">
        <div>
          <dt>Node ID</dt>
          <dd>{selectedNode.id}</dd>
        </div>
        <div>
          <dt>Reusable form schema</dt>
          <dd>{form?.name ?? 'Missing schema'}</dd>
        </div>
        <div>
          <dt>Fields</dt>
          <dd>{fieldCount}</dd>
        </div>
        <div>
          <dt>Direct prerequisites</dt>
          <dd>
            {directPrerequisites.length > 0
              ? directPrerequisites.map((node) => node.data.name).join(', ')
              : 'None'}
          </dd>
        </div>
      </dl>

      <PrefillPanel
        form={form}
        mappingOverrides={mappingOverrides}
        node={selectedNode}
        onClearField={clearFieldMapping}
        onConfigureField={setActiveField}
      />
      <AvailableDataSourcesPanel
        graphIndex={graphIndex}
        selectedNodeId={selectedNode.id}
      />

      {activeField ? (
        <DataElementModal
          graphIndex={graphIndex}
          selectedNodeId={selectedNode.id}
          targetField={activeField}
          onCancel={() => setActiveField(null)}
          onSelect={selectDataElement}
        />
      ) : null}
    </section>
  )
}
