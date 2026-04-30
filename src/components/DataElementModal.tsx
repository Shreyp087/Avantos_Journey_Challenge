import { useEffect, useMemo, useRef, useState } from 'react'
import { DataSourceTree } from './DataSourceTree'
import { getDataSourceGroups } from '../domain/dataSources'
import type { DataElement, DataSourceGroup } from '../domain/dataSources'
import type { FormField } from '../domain/forms'
import type { GraphIndex } from '../domain/graph'
import { dataSourceProviders } from '../providers'

type DataElementModalProps = {
  graphIndex: GraphIndex
  selectedNodeId: string
  targetField: FormField
  onCancel: () => void
  onSelect: (fieldKey: string, element: DataElement) => void
}

export function DataElementModal({
  graphIndex,
  selectedNodeId,
  targetField,
  onCancel,
  onSelect,
}: DataElementModalProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedElement, setSelectedElement] = useState<DataElement | null>(
    null,
  )
  const groups = useMemo(
    () =>
      getDataSourceGroups(
        {
          graphIndex,
          selectedNodeId,
        },
        dataSourceProviders,
      ),
    [graphIndex, selectedNodeId],
  )
  const filteredGroups = useMemo(
    () => filterGroups(groups, query),
    [groups, query],
  )

  useEffect(() => {
    searchInputRef.current?.focus()
  }, [])

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', closeOnEscape)

    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [onCancel])

  function confirmSelection() {
    if (selectedElement) {
      onSelect(targetField.key, selectedElement)
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel()
        }
      }}
    >
      <section
        aria-describedby="data-element-modal-description"
        aria-labelledby="data-element-modal-title"
        aria-modal="true"
        className="data-element-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="panel-label">Map field</p>
            <h2 id="data-element-modal-title">Select data element to map</h2>
            <p className="helper-text" id="data-element-modal-description">
              Target field: <strong>{targetField.label}</strong>
            </p>
          </div>
          <button
            type="button"
            className="icon-action"
            aria-label="Close data element modal"
            onClick={onCancel}
          >
            x
          </button>
        </div>

        <label className="search-label" htmlFor="data-element-search">
          Search available data
        </label>
        <input
          id="data-element-search"
          className="search-input"
          type="search"
          ref={searchInputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search fields, groups, or keys"
        />

        <DataSourceTree
          groups={filteredGroups}
          selectedElementId={selectedElement?.id ?? null}
          onSelectElement={setSelectedElement}
        />

        <div className="modal-actions">
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="primary-action"
            disabled={!selectedElement}
            onClick={confirmSelection}
          >
            Select
          </button>
        </div>
      </section>
    </div>
  )
}

function filterGroups(groups: DataSourceGroup[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return groups
  }

  return groups
    .map((group) => {
      const groupMatches = group.label.toLowerCase().includes(normalizedQuery)
      const children = group.children.filter((element) => {
        const searchText = [
          element.label,
          element.fieldKey,
          element.path?.join(' '),
          element.sourceNodeName,
          element.valueType,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return groupMatches || searchText.includes(normalizedQuery)
      })

      return {
        ...group,
        children,
      }
    })
    .filter((group) => group.children.length > 0)
}
