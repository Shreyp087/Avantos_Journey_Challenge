import { describe, expect, it } from 'vitest'
import { getDataSourceGroups } from './dataSources'
import { buildGraphIndex } from './graph'
import { dataSourceProviders } from '../providers'
import { getFormFieldSourceGroups } from '../providers/formFieldProvider'
import { formNodeIds, mockBlueprintGraph } from '../test/fixtures'

describe('data source providers', () => {
  it('returns direct and transitive upstream form fields for Form D', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)
    const groups = getFormFieldSourceGroups({
      graphIndex,
      selectedNodeId: formNodeIds.formD,
    })

    expect(groups.map((group) => [group.label, group.distance])).toEqual([
      ['Form B', 1],
      ['Form A', 2],
    ])
    expect(groups[0].children).toHaveLength(8)
    expect(groups[0].children[0]).toMatchObject({
      kind: 'form_field',
      sourceNodeName: 'Form B',
      fieldKey: 'button',
    })
  })

  it('returns all unique upstream form groups for Form F', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)
    const groups = getFormFieldSourceGroups({
      graphIndex,
      selectedNodeId: formNodeIds.formF,
    })

    expect(groups.map((group) => [group.label, group.distance])).toEqual([
      ['Form D', 1],
      ['Form E', 1],
      ['Form B', 2],
      ['Form C', 2],
      ['Form A', 3],
    ])
    expect(groups.filter((group) => group.label === 'Form A')).toHaveLength(1)
  })

  it('combines registered global and form-field providers generically', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)
    const groups = getDataSourceGroups(
      {
        graphIndex,
        selectedNodeId: formNodeIds.formD,
      },
      dataSourceProviders,
    )

    expect(groups.map((group) => group.label)).toEqual([
      'Action Properties',
      'Client Organisation Properties',
      'Form B',
      'Form A',
    ])
  })

  it('only returns global providers when the selected form has no upstream forms', () => {
    const graphIndex = buildGraphIndex(mockBlueprintGraph)
    const groups = getDataSourceGroups(
      {
        graphIndex,
        selectedNodeId: formNodeIds.formA,
      },
      dataSourceProviders,
    )

    expect(groups.map((group) => group.label)).toEqual([
      'Action Properties',
      'Client Organisation Properties',
    ])
  })
})
