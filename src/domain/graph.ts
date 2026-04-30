import type {
  ActionForm,
  BlueprintEdge,
  BlueprintGraphResponse,
  BlueprintNode,
} from '../types/blueprint'

export type GraphIndex = {
  graph: BlueprintGraphResponse
  nodesById: ReadonlyMap<string, BlueprintNode>
  formsById: ReadonlyMap<string, ActionForm>
  incomingByTarget: ReadonlyMap<string, BlueprintEdge[]>
  outgoingBySource: ReadonlyMap<string, BlueprintEdge[]>
  nodeToForm: ReadonlyMap<string, ActionForm>
  brokenEdges: BlueprintEdge[]
  nodesMissingForms: BlueprintNode[]
}

export type GraphAncestor = {
  node: BlueprintNode
  distance: number
}

export type CycleDetectionResult = {
  hasCycle: boolean
  cycleNodeIds: string[]
}

export function buildGraphIndex(graph: BlueprintGraphResponse): GraphIndex {
  const nodesById = new Map(graph.nodes.map((node) => [node.id, node]))
  const formsById = new Map(graph.forms.map((form) => [form.id, form]))
  const incomingByTarget = new Map<string, BlueprintEdge[]>()
  const outgoingBySource = new Map<string, BlueprintEdge[]>()
  const brokenEdges: BlueprintEdge[] = []

  for (const node of graph.nodes) {
    incomingByTarget.set(node.id, [])
    outgoingBySource.set(node.id, [])
  }

  for (const edge of graph.edges) {
    if (!nodesById.has(edge.source) || !nodesById.has(edge.target)) {
      brokenEdges.push(edge)
    }

    appendEdge(incomingByTarget, edge.target, edge)
    appendEdge(outgoingBySource, edge.source, edge)
  }

  const nodeToForm = new Map<string, ActionForm>()
  const nodesMissingForms: BlueprintNode[] = []

  for (const node of graph.nodes) {
    const form = formsById.get(node.data.component_id)

    if (form) {
      nodeToForm.set(node.id, form)
      continue
    }

    if (node.type === 'form') {
      nodesMissingForms.push(node)
    }
  }

  return {
    graph,
    nodesById,
    formsById,
    incomingByTarget,
    outgoingBySource,
    nodeToForm,
    brokenEdges,
    nodesMissingForms,
  }
}

export function getNodeById(
  graphIndex: GraphIndex,
  nodeId: string,
): BlueprintNode | undefined {
  return graphIndex.nodesById.get(nodeId)
}

export function getFormForNode(
  graphIndex: GraphIndex,
  nodeId: string,
): ActionForm | undefined {
  return graphIndex.nodeToForm.get(nodeId)
}

export function getDirectPrerequisites(
  graphIndex: GraphIndex,
  nodeId: string,
): BlueprintNode[] {
  return uniqueNodesById(
    (graphIndex.incomingByTarget.get(nodeId) ?? [])
      .map((edge) => graphIndex.nodesById.get(edge.source))
      .filter(isDefined),
  )
}

export function getDirectDependents(
  graphIndex: GraphIndex,
  nodeId: string,
): BlueprintNode[] {
  return uniqueNodesById(
    (graphIndex.outgoingBySource.get(nodeId) ?? [])
      .map((edge) => graphIndex.nodesById.get(edge.target))
      .filter(isDefined),
  )
}

export function getAncestorNodes(
  graphIndex: GraphIndex,
  nodeId: string,
): GraphAncestor[] {
  const queue = getDirectPrerequisites(graphIndex, nodeId).map((node) => ({
    node,
    distance: 1,
  }))
  const visited = new Set<string>([nodeId])
  const ancestors: GraphAncestor[] = []

  while (queue.length > 0) {
    const current = queue.shift()

    if (!current || visited.has(current.node.id)) {
      continue
    }

    visited.add(current.node.id)
    ancestors.push(current)

    for (const parent of getDirectPrerequisites(graphIndex, current.node.id)) {
      if (!visited.has(parent.id)) {
        queue.push({
          node: parent,
          distance: current.distance + 1,
        })
      }
    }
  }

  return ancestors
}

export function detectCycle(graphIndex: GraphIndex): CycleDetectionResult {
  const visiting = new Set<string>()
  const visited = new Set<string>()

  for (const node of graphIndex.graph.nodes) {
    const cycle = findCycleFromNode(graphIndex, node.id, visiting, visited, [])

    if (cycle.length > 0) {
      return {
        hasCycle: true,
        cycleNodeIds: cycle,
      }
    }
  }

  return {
    hasCycle: false,
    cycleNodeIds: [],
  }
}

function findCycleFromNode(
  graphIndex: GraphIndex,
  nodeId: string,
  visiting: Set<string>,
  visited: Set<string>,
  path: string[],
): string[] {
  if (visiting.has(nodeId)) {
    const cycleStartIndex = path.indexOf(nodeId)
    return path.slice(cycleStartIndex).concat(nodeId)
  }

  if (visited.has(nodeId)) {
    return []
  }

  visiting.add(nodeId)
  path.push(nodeId)

  for (const child of getDirectDependents(graphIndex, nodeId)) {
    const cycle = findCycleFromNode(
      graphIndex,
      child.id,
      visiting,
      visited,
      path,
    )

    if (cycle.length > 0) {
      return cycle
    }
  }

  visiting.delete(nodeId)
  visited.add(nodeId)
  path.pop()

  return []
}

function appendEdge(
  edgeMap: Map<string, BlueprintEdge[]>,
  key: string,
  edge: BlueprintEdge,
) {
  const existingEdges = edgeMap.get(key)

  if (existingEdges) {
    existingEdges.push(edge)
    return
  }

  edgeMap.set(key, [edge])
}

function uniqueNodesById(nodes: BlueprintNode[]) {
  return Array.from(
    nodes.reduce((nodesById, node) => nodesById.set(node.id, node), new Map()),
  ).map(([, node]) => node)
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
