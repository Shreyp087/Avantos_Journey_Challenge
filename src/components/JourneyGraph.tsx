import { useMemo } from 'react'
import {
  getAncestorNodes,
  getDirectDependents,
  getDirectPrerequisites,
  getFormForNode,
} from '../domain/graph'
import type { GraphIndex } from '../domain/graph'
import type { BlueprintEdge, BlueprintNode } from '../types/blueprint'

type JourneyGraphProps = {
  graphIndex: GraphIndex
  nodes: BlueprintNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string) => void
}

type PositionedNode = {
  node: BlueprintNode
  x: number
  y: number
}

const CANVAS_WIDTH = 1040
const CANVAS_HEIGHT = 390
const NODE_WIDTH = 230
const NODE_HEIGHT = 92
const CANVAS_PADDING = 34

export function JourneyGraph({
  graphIndex,
  nodes,
  selectedNodeId,
  onSelectNode,
}: JourneyGraphProps) {
  const layout = useMemo(() => createGraphLayout(nodes), [nodes])
  const positionedNodesById = useMemo(
    () => new Map(layout.nodes.map((item) => [item.node.id, item])),
    [layout.nodes],
  )
  const formNodeIds = useMemo(
    () => new Set(nodes.map((node) => node.id)),
    [nodes],
  )
  const graphEdges = graphIndex.graph.edges.filter(
    (edge) => formNodeIds.has(edge.source) && formNodeIds.has(edge.target),
  )

  const upstreamIds = useMemo(
    () =>
      new Set(
        selectedNodeId
          ? getAncestorNodes(graphIndex, selectedNodeId).map(
              (ancestor) => ancestor.node.id,
            )
          : [],
      ),
    [graphIndex, selectedNodeId],
  )
  const downstreamIds = useMemo(
    () =>
      new Set(
        selectedNodeId
          ? getDirectDependents(graphIndex, selectedNodeId).map((node) => node.id)
          : [],
      ),
    [graphIndex, selectedNodeId],
  )
  const activePathNodeIds = useMemo(
    () => new Set([...(selectedNodeId ? [selectedNodeId] : []), ...upstreamIds]),
    [selectedNodeId, upstreamIds],
  )
  const activeEdgeIds = useMemo(
    () =>
      new Set(
        graphEdges
          .filter(
            (edge) =>
              activePathNodeIds.has(edge.source) &&
              activePathNodeIds.has(edge.target),
          )
          .map(getEdgeId),
      ),
    [activePathNodeIds, graphEdges],
  )

  const selectedNode = selectedNodeId
    ? graphIndex.nodesById.get(selectedNodeId)
    : undefined

  if (layout.nodes.length === 0) {
    return (
      <section className="journey-graph-panel" aria-labelledby="journey-graph-title">
        <p className="panel-label">Journey graph</p>
        <h2 id="journey-graph-title">No form graph available</h2>
        <p className="empty-state">This blueprint did not return form nodes.</p>
      </section>
    )
  }

  return (
    <section className="journey-graph-panel" aria-labelledby="journey-graph-title">
      <div className="journey-graph-header">
        <div>
          <p className="panel-label">Journey graph</p>
          <h2 id="journey-graph-title">Visual form flow</h2>
          <p className="helper-text">
            {selectedNode
              ? `Highlighting upstream prefill sources for ${selectedNode.data.name}.`
              : 'Click any form card to inspect its fields and available prefill sources.'}
          </p>
        </div>

        <div className="journey-graph-legend" aria-label="Graph legend">
          <span>
            <i className="legend-dot legend-dot--selected" /> Selected
          </span>
          <span>
            <i className="legend-dot legend-dot--upstream" /> Upstream
          </span>
        </div>
      </div>

      <div className="journey-graph-scroll">
        <div
          className="journey-graph-canvas"
          style={{
            height: `${CANVAS_HEIGHT}px`,
            minWidth: `${CANVAS_WIDTH}px`,
          }}
        >
          <svg
            className="journey-graph-edges"
            viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
            aria-hidden="true"
          >
            {graphEdges.map((edge) => {
              const source = positionedNodesById.get(edge.source)
              const target = positionedNodesById.get(edge.target)

              if (!source || !target) {
                return null
              }

              const isActive = activeEdgeIds.has(getEdgeId(edge))

              return (
                <g key={getEdgeId(edge)}>
                  <path
                    className={
                      isActive
                        ? 'journey-graph-edge journey-graph-edge--active'
                        : 'journey-graph-edge'
                    }
                    d={getEdgePath(source, target)}
                  />
                  <circle
                    className={
                      isActive
                        ? 'journey-graph-handle journey-graph-handle--active'
                        : 'journey-graph-handle'
                    }
                    cx={source.x + NODE_WIDTH - 2}
                    cy={source.y + NODE_HEIGHT / 2}
                    r="5"
                  />
                  <circle
                    className={
                      isActive
                        ? 'journey-graph-handle journey-graph-handle--active'
                        : 'journey-graph-handle'
                    }
                    cx={target.x + 2}
                    cy={target.y + NODE_HEIGHT / 2}
                    r="5"
                  />
                </g>
              )
            })}
          </svg>

          {layout.nodes.map(({ node, x, y }) => {
            const form = getFormForNode(graphIndex, node.id)
            const fieldCount = Object.keys(form?.field_schema.properties ?? {})
              .length
            const directSourceCount = getDirectPrerequisites(
              graphIndex,
              node.id,
            ).length
            const state = getNodeState({
              nodeId: node.id,
              selectedNodeId,
              upstreamIds,
              downstreamIds,
            })

            return (
              <button
                type="button"
                aria-label={`Select ${node.data.name.replace(/^Form\s+/i, '')} in journey graph`}
                aria-pressed={selectedNodeId === node.id}
                className={`journey-graph-node journey-graph-node--${state}`}
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                style={{
                  height: `${NODE_HEIGHT}px`,
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${NODE_WIDTH}px`,
                }}
              >
                <span className="journey-graph-node-icon" aria-hidden="true">
                  {node.data.name.split(' ').at(-1)?.charAt(0) ?? 'F'}
                </span>
                <span>
                  <span className="journey-graph-node-kicker">Form</span>
                  <strong>{node.data.name}</strong>
                  <small>
                    {fieldCount} fields · {directSourceCount} sources
                  </small>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function createGraphLayout(nodes: BlueprintNode[]) {
  const visibleNodes = nodes.filter((node) => !node.hidden)
  const xValues = visibleNodes.map((node) => node.position.x)
  const yValues = visibleNodes.map((node) => node.position.y)
  const minX = Math.min(...xValues)
  const maxX = Math.max(...xValues)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const xRange = Math.max(1, maxX - minX)
  const yRange = Math.max(1, maxY - minY)
  const drawableWidth = CANVAS_WIDTH - NODE_WIDTH - CANVAS_PADDING * 2
  const drawableHeight = CANVAS_HEIGHT - NODE_HEIGHT - CANVAS_PADDING * 2

  return {
    nodes: visibleNodes.map((node) => ({
      node,
      x: CANVAS_PADDING + ((node.position.x - minX) / xRange) * drawableWidth,
      y: CANVAS_PADDING + ((node.position.y - minY) / yRange) * drawableHeight,
    })),
  }
}

function getEdgePath(source: PositionedNode, target: PositionedNode) {
  const startX = source.x + NODE_WIDTH
  const startY = source.y + NODE_HEIGHT / 2
  const endX = target.x
  const endY = target.y + NODE_HEIGHT / 2
  const bend = Math.max(72, Math.abs(endX - startX) * 0.44)

  return `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`
}

function getEdgeId(edge: BlueprintEdge) {
  return `${edge.source}->${edge.target}`
}

function getNodeState({
  nodeId,
  selectedNodeId,
  upstreamIds,
  downstreamIds,
}: {
  nodeId: string
  selectedNodeId: string | null
  upstreamIds: ReadonlySet<string>
  downstreamIds: ReadonlySet<string>
}) {
  if (!selectedNodeId) {
    return 'idle'
  }

  if (nodeId === selectedNodeId) {
    return 'selected'
  }

  if (upstreamIds.has(nodeId)) {
    return 'upstream'
  }

  if (downstreamIds.has(nodeId)) {
    return 'downstream'
  }

  return 'neutral'
}
