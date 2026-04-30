import type { FormField } from '../domain/forms'
import type { MappingDisplay } from '../domain/mappings'

type PrefillFieldRowProps = {
  field: FormField
  mapping: MappingDisplay
  onClear: (field: FormField) => void
  onConfigure: (field: FormField) => void
}

export function PrefillFieldRow({
  field,
  mapping,
  onClear,
  onConfigure,
}: PrefillFieldRowProps) {
  return (
    <li className="prefill-field-row">
      <div className="field-main">
        <span className="field-label-row">
          <strong>{field.label}</strong>
          {field.required ? <span className="required-pill">Required</span> : null}
        </span>
        <span className="field-meta">
          <code>{field.key}</code>
          <span>{field.typeLabel}</span>
        </span>
      </div>

      <div className="mapping-main">
        <span className={`mapping-pill mapping-pill--${mapping.status}`}>
          {mapping.label}
        </span>
        {mapping.status === 'unsupported' ? (
          <span className="mapping-note">
            This expression will be preserved for now, but needs adapter support.
          </span>
        ) : null}
      </div>

      <div className="field-actions">
        {mapping.status !== 'empty' ? (
          <button
            type="button"
            className="secondary-action"
            aria-label={`Clear mapping for ${field.label}`}
            onClick={() => onClear(field)}
          >
            Clear
          </button>
        ) : null}
        <button
          type="button"
          className="secondary-action"
          aria-label={`Configure mapping for ${field.label}`}
          onClick={() => onConfigure(field)}
        >
          Configure
        </button>
      </div>
    </li>
  )
}
