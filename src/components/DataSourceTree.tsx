import type { DataElement, DataSourceGroup } from '../domain/dataSources'

type DataSourceTreeProps = {
  groups: DataSourceGroup[]
  selectedElementId: string | null
  onSelectElement: (element: DataElement) => void
}

export function DataSourceTree({
  groups,
  selectedElementId,
  onSelectElement,
}: DataSourceTreeProps) {
  if (groups.length === 0) {
    return (
      <p className="empty-state">
        No matching data elements are available for this field.
      </p>
    )
  }

  return (
    <div className="modal-source-tree">
      {groups.map((group) => (
        <section className="modal-source-group" key={group.id}>
          <div className="modal-source-group-header">
            <h3>{group.label}</h3>
            {group.description ? <p>{group.description}</p> : null}
          </div>

          <ul className="modal-source-list">
            {group.children.map((element) => (
              <li key={element.id}>
                <button
                  type="button"
                  className="modal-source-option"
                  aria-label={`${element.label} ${formatElementPath(element)} ${element.valueType ?? element.kind}`}
                  aria-pressed={selectedElementId === element.id}
                  onClick={() => onSelectElement(element)}
                >
                  <span>
                    <strong>{element.label}</strong>
                    <small>{formatElementPath(element)}</small>
                  </span>
                  <code>{element.valueType ?? element.kind}</code>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function formatElementPath(element: DataElement) {
  if (element.kind === 'form_field') {
    return `${element.sourceNodeName}.${element.fieldKey}`
  }

  return element.path?.join('.') ?? element.id
}
