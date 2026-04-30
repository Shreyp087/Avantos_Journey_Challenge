import { describe, expect, it } from 'vitest'
import {
  buildGraphIndex,
  detectCycle,
  getAncestorNodes,
  getDirectDependents,
  getDirectPrerequisites,
  getFormForNode,
  getNodeById,
} from './graph'
import { formNodeIds, mockBlueprintGraph } from '../test/fixtures'
import type { BlueprintGraphResponse } from '../types/blueprint'

describe('graph domain utilities', () => {
  it('indexes nodes, forms, edges, and node-to-form relationships', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)

    expect(graphIndex.nodesById.size).toBe(6)
    expect(graphIndex.formsById.size).toBe(3)
    expect(graphIndex.incomingByTarget.get(formNodeIds.formF)).toHaveLength(2)
    expect(graphIndex.outgoingBySource.get(formNodeIds.formA)).toHaveLength(2)
    expect(getNodeById(graphIndex, formNodeIds.formA)?.data.name).toBe('Form A')
    expect(getFormForNode(graphIndex, formNodeIds.formA)?.id).toBe(
      'f_01jk7ap2r3ewf9gx6a9r09gzjv',
    )
  })

  it('returns direct prerequisites from incoming edges', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)

    expect(getDirectPrerequisites(graphIndex, formNodeIds.formD)).toEqual([
      expect.objectContaining({ data: expect.objectContaining({ name: 'Form B' }) }),
    ])
    expect(getDirectPrerequisites(graphIndex, formNodeIds.formA)).toEqual([])
  })

  it('returns direct dependents from outgoing edges', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)

    expect(
      getDirectDependents(graphIndex, formNodeIds.formA).map(
        (node) => node.data.name,
      ),
    ).toEqual(['Form C', 'Form B'])
  })

  it('returns Form D ancestors as direct and transitive dependencies', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)

    expect(formatAncestors(getAncestorNodes(graphIndex, formNodeIds.formD))).toEqual(
      [
        ['Form B', 1],
        ['Form A', 2],
      ],
    )
  })

  it('returns Form F ancestors without duplicating shared ancestors', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)
    const ancestors = getAncestorNodes(graphIndex, formNodeIds.formF)

    expect(formatAncestors(ancestors)).toEqual([
      ['Form D', 1],
      ['Form E', 1],
      ['Form B', 2],
      ['Form C', 2],
      ['Form A', 3],
    ])
    expect(
      ancestors.filter((ancestor) => ancestor.node.id === formNodeIds.formA),
    ).toHaveLength(1)
  })

  it('keeps ancestor traversal safe if invalid cyclic data appears', () => {
    const graphIndex = buildGraphIndex({
      ...mockBlueprintGraph,
      edges: [
        ...mockBlueprintGraph.edges,
        { source: formNodeIds.formF, target: formNodeIds.formA },
      ],
    })

    const ancestors = getAncestorNodes(graphIndex, formNodeIds.formA)

    expect(ancestors.map((ancestor) => ancestor.node.id)).not.toContain(
      formNodeIds.formA,
    )
    expect(ancestors.length).toBeLessThanOrEqual(5)
  })

  it('detects cyclic graphs', () => {
    const acyclicIndex = buildGraphIndex(mockBlueprintGraph)
    const cyclicIndex = buildGraphIndex({
      ...mockBlueprintGraph,
      edges: [
        ...mockBlueprintGraph.edges,
        { source: formNodeIds.formF, target: formNodeIds.formA },
      ],
    })

    expect(detectCycle(acyclicIndex)).toEqual({
      hasCycle: false,
      cycleNodeIds: [],
    })
    expect(detectCycle(cyclicIndex).hasCycle).toBe(true)
    expect(detectCycle(cyclicIndex).cycleNodeIds).toContain(formNodeIds.formA)
  })

  it('records broken edges and missing form schemas without crashing', () => {
    const graphWithInvalidReferences: BlueprintGraphResponse = {
      ...mockBlueprintGraph,
      nodes: [
        ...mockBlueprintGraph.nodes,
        {
          id: 'form-with-missing-schema',
          type: 'form',
          position: { x: 0, y: 0 },
          data: {
            id: 'component-with-missing-schema',
            component_key: 'form-with-missing-schema',
            component_type: 'form',
            component_id: 'missing-form-id',
            name: 'Missing Schema Form',
            prerequisites: [],
            input_mapping: {},
          },
        },
      ],
      edges: [
        ...mockBlueprintGraph.edges,
        { source: 'missing-source', target: formNodeIds.formA },
      ],
    }

    const graphIndex = buildGraphIndex(graphWithInvalidReferences)

    expect(graphIndex.brokenEdges).toEqual([
      { source: 'missing-source', target: formNodeIds.formA },
    ])
    expect(graphIndex.nodesMissingForms).toEqual([
      expect.objectContaining({ id: 'form-with-missing-schema' }),
    ])
    expect(getDirectPrerequisites(graphIndex, formNodeIds.formA)).toEqual([])
  })
})

function formatAncestors(
  ancestors: ReturnType<typeof getAncestorNodes>,
): Array<[string, number]> {
  return ancestors.map((ancestor) => [ancestor.node.data.name, ancestor.distance])
}
