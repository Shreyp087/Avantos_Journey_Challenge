import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_BLUEPRINT_REQUEST,
  fetchBlueprintGraph,
  getBlueprintErrorMessage,
  summarizeBlueprintGraph,
} from './api/blueprintClient'
import { FormNodeList } from './components/FormNodeList'
import { JourneyGraph } from './components/JourneyGraph'
import { SelectedFormSummary } from './components/SelectedFormSummary'
import { buildGraphIndex, getNodeById } from './domain/graph'
import type {
  BlueprintGraphResponse,
  BlueprintGraphSummary,
} from './types/blueprint'
import './App.css'

type GraphLoadState =
  | { status: 'loading' }
  | { status: 'success'; graph: BlueprintGraphResponse }
  | { status: 'error'; message: string }

const requestConfig = {
  baseUrl:
    import.meta.env.VITE_BLUEPRINT_API_BASE_URL ??
    DEFAULT_BLUEPRINT_REQUEST.baseUrl,
  tenantId:
    import.meta.env.VITE_BLUEPRINT_TENANT_ID ??
    DEFAULT_BLUEPRINT_REQUEST.tenantId,
  blueprintId:
    import.meta.env.VITE_BLUEPRINT_ID ?? DEFAULT_BLUEPRINT_REQUEST.blueprintId,
}

function App() {
  const [graphState, setGraphState] = useState<GraphLoadState>({
    status: 'loading',
  })

  useEffect(() => {
    let isMounted = true

    async function loadBlueprintGraph() {
      try {
        const graph = await fetchBlueprintGraph(requestConfig)

        if (isMounted) {
          setGraphState({ status: 'success', graph })
        }
      } catch (error) {
        if (isMounted) {
          setGraphState({
            status: 'error',
            message: getBlueprintErrorMessage(error),
          })
        }
      }
    }

    void loadBlueprintGraph()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="app-shell">
      <section className="hero-card" aria-labelledby="app-title">
        <p className="eyebrow">Avantos frontend challenge</p>
        <h1 id="app-title">Journey Builder Prefill Mapping UI</h1>
        <p className="intro">
          Inspect the journey DAG, choose a downstream form, and wire each field
          to the upstream data that can safely prefill it.
        </p>

        <GraphStatus state={graphState} />
      </section>
    </main>
  )
}

function GraphStatus({ state }: { state: GraphLoadState }) {
  if (state.status === 'loading') {
    return (
      <section className="graph-panel" aria-live="polite">
        <p className="panel-label">Graph status</p>
        <h2>Loading blueprint graph...</h2>
        <p>
          Requesting data from the mock server at{' '}
          <code>{requestConfig.baseUrl}</code>.
        </p>
      </section>
    )
  }

  if (state.status === 'error') {
    return (
      <section className="graph-panel graph-panel--error" role="alert">
        <p className="panel-label">Graph status</p>
        <h2>Could not load graph</h2>
        <p>{state.message}</p>
        <p className="helper-text">
          Start the mock server on port 3000, then refresh this page.
        </p>
      </section>
    )
  }

  return <GraphWorkspace graph={state.graph} />
}

function GraphWorkspace({ graph }: { graph: BlueprintGraphResponse }) {
  const graphIndex = useMemo(() => buildGraphIndex(graph), [graph])
  const summary = summarizeBlueprintGraph(graph)
  const formNodes = graph.nodes.filter((node) => node.type === 'form')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const selectedNode = selectedNodeId
    ? getNodeById(graphIndex, selectedNodeId)
    : undefined

  return (
    <>
      <GraphSummary summary={summary} />

      <JourneyGraph
        graphIndex={graphIndex}
        nodes={formNodes}
        onSelectNode={setSelectedNodeId}
        selectedNodeId={selectedNodeId}
      />

      <div className="workspace-grid">
        <FormNodeList
          graphIndex={graphIndex}
          nodes={formNodes}
          onSelectNode={setSelectedNodeId}
          selectedNodeId={selectedNodeId}
        />
        <SelectedFormSummary
          graphIndex={graphIndex}
          selectedNode={selectedNode}
        />
      </div>
    </>
  )
}

function GraphSummary({ summary }: { summary: BlueprintGraphSummary }) {
  const stats = [
    ['Tenant', summary.tenantId],
    ['Nodes', summary.nodeCount.toString()],
    ['Edges', summary.edgeCount.toString()],
    ['Forms', summary.formCount.toString()],
  ]

  return (
    <section className="graph-panel graph-panel--success" aria-live="polite">
      <p className="panel-label">Graph loaded</p>
      <h2>{summary.name}</h2>
      <p className="helper-text">
        Blueprint <code>{summary.id}</code> is ready for DAG traversal.
      </p>

      <dl className="stat-grid" aria-label="Blueprint graph summary">
        {stats.map(([label, value]) => (
          <div className="stat-card" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default App
