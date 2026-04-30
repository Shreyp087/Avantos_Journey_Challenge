import { getDataSourceGroups } from '../domain/dataSources'
import type { GraphIndex } from '../domain/graph'
import { dataSourceProviders } from '../providers'

type AvailableDataSourcesPanelProps = {
  graphIndex: GraphIndex
  selectedNodeId: string
}

export function AvailableDataSourcesPanel({
  graphIndex,
  selectedNodeId,
}: AvailableDataSourcesPanelProps) {
  const groups = getDataSourceGroups(
    {
      graphIndex,
      selectedNodeId,
    },
    dataSourceProviders,
  )

  return (
    <section
      className="data-source-panel"
      aria-labelledby="available-data-sources-title"
    >
      <div className="prefill-heading">
        <div>
          <p className="panel-label">Available data</p>
          <h3 id="available-data-sources-title">Available data sources</h3>
        </div>
        <span className="prefill-count">{groups.length} groups</span>
      </div>

      {groups.length > 0 ? (
        <div className="data-source-group-list">
          {groups.map((group) => (
            <article className="data-source-group" key={group.id}>
              <div className="data-source-group-header">
                <div>
                  <h4>{group.label}</h4>
                  {group.description ? <p>{group.description}</p> : null}
                </div>
                <span className="source-count">{group.children.length}</span>
              </div>

              <ul className="data-element-list">
                {group.children.slice(0, 6).map((element) => (
                  <li key={element.id}>
                    <span>{element.label}</span>
                    <code>{element.fieldKey ?? element.path?.at(-1)}</code>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <p className="empty-state">
          No data sources are available for this selected form.
        </p>
      )}
    </section>
  )
}
