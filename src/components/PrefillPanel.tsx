import { PrefillFieldRow } from './PrefillFieldRow'
import { getFormFields } from '../domain/forms'
import {
  getDataElementMappingDisplay,
  getFieldMapping,
  getMappingDisplay,
} from '../domain/mappings'
import type { FormField } from '../domain/forms'
import type { FieldMappingOverride } from '../state/mappingReducer'
import type { ActionForm, BlueprintNode } from '../types/blueprint'

type PrefillPanelProps = {
  form: ActionForm | undefined
  node: BlueprintNode
  mappingOverrides: Record<string, FieldMappingOverride>
  onConfigureField: (field: FormField) => void
  onClearField: (field: FormField) => void
}

export function PrefillPanel({
  form,
  mappingOverrides,
  node,
  onClearField,
  onConfigureField,
}: PrefillPanelProps) {
  const fields = getFormFields(form)

  if (!form) {
    return (
      <section className="prefill-panel" aria-labelledby="prefill-panel-title">
        <div className="prefill-heading">
          <p className="panel-label">Prefill</p>
          <h3 id="prefill-panel-title">Form schema unavailable</h3>
        </div>
        <p className="empty-state">
          This node references a form schema that was not returned by the graph
          endpoint.
        </p>
      </section>
    )
  }

  return (
    <section className="prefill-panel" aria-labelledby="prefill-panel-title">
      <div className="prefill-heading">
        <div>
          <p className="panel-label">Prefill</p>
          <h3 id="prefill-panel-title">Prefill fields for this form</h3>
        </div>
        <span className="prefill-count">{fields.length} fields</span>
      </div>

      {fields.length > 0 ? (
        <ul className="prefill-field-list">
          {fields.map((field) => (
            <PrefillFieldRow
              field={field}
              key={field.key}
              mapping={
                getOverrideMappingDisplay(mappingOverrides[field.key]) ??
                getFieldMapping(node.data.input_mapping, field.key)
              }
              onClear={onClearField}
              onConfigure={onConfigureField}
            />
          ))}
        </ul>
      ) : (
        <p className="empty-state">
          This form schema does not define any fields yet.
        </p>
      )}
    </section>
  )
}

function getOverrideMappingDisplay(override: FieldMappingOverride | undefined) {
  if (!override) {
    return undefined
  }

  if (override.status === 'cleared') {
    return getMappingDisplay(undefined)
  }

  return getDataElementMappingDisplay(override.dataElement)
}
