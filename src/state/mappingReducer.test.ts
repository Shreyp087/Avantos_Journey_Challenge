import { describe, expect, it } from 'vitest'
import {
  getNodeMappingOverrides,
  initialMappingState,
  mappingReducer,
} from './mappingReducer'
import type { DataElement } from '../domain/dataSources'

const emailDataElement: DataElement = {
  id: 'form:form-b:field:email',
  label: 'Email',
  kind: 'form_field',
  valueType: 'short-text',
  sourceNodeId: 'form-b',
  sourceNodeName: 'Form B',
  fieldKey: 'email',
  path: ['Form B', 'email'],
}

const nameDataElement: DataElement = {
  ...emailDataElement,
  id: 'form:form-c:field:name',
  label: 'Name',
  sourceNodeId: 'form-c',
  sourceNodeName: 'Form C',
  fieldKey: 'name',
  path: ['Form C', 'name'],
}

describe('mappingReducer', () => {
  it('sets a mapping by node ID and field key', () => {
    const state = mappingReducer(initialMappingState, {
      type: 'setMapping',
      nodeId: 'form-d',
      fieldKey: 'email',
      dataElement: emailDataElement,
    })

    expect(getNodeMappingOverrides(state, 'form-d')).toEqual({
      email: {
        status: 'mapped',
        dataElement: emailDataElement,
      },
    })
  })

  it('clears a mapping without removing unrelated mappings', () => {
    const withEmail = mappingReducer(initialMappingState, {
      type: 'setMapping',
      nodeId: 'form-d',
      fieldKey: 'email',
      dataElement: emailDataElement,
    })
    const withOtherNodeMapping = mappingReducer(withEmail, {
      type: 'setMapping',
      nodeId: 'form-e',
      fieldKey: 'name',
      dataElement: nameDataElement,
    })
    const cleared = mappingReducer(withOtherNodeMapping, {
      type: 'clearMapping',
      nodeId: 'form-d',
      fieldKey: 'email',
    })

    expect(getNodeMappingOverrides(cleared, 'form-d')).toEqual({
      email: {
        status: 'cleared',
      },
    })
    expect(getNodeMappingOverrides(cleared, 'form-e')).toEqual({
      name: {
        status: 'mapped',
        dataElement: nameDataElement,
      },
    })
  })

  it('returns an empty object for nodes without overrides', () => {
    expect(getNodeMappingOverrides(initialMappingState, 'missing-node')).toEqual(
      {},
    )
  })
})
