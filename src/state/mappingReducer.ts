import type { DataElement } from '../domain/dataSources'

export type FieldMappingOverride =
  | {
      status: 'mapped'
      dataElement: DataElement
    }
  | {
      status: 'cleared'
    }

export type MappingState = Record<string, Record<string, FieldMappingOverride>>

export type MappingAction =
  | {
      type: 'setMapping'
      nodeId: string
      fieldKey: string
      dataElement: DataElement
    }
  | {
      type: 'clearMapping'
      nodeId: string
      fieldKey: string
    }

export const initialMappingState: MappingState = {}

export function mappingReducer(
  state: MappingState,
  action: MappingAction,
): MappingState {
  switch (action.type) {
    case 'setMapping':
      return {
        ...state,
        [action.nodeId]: {
          ...state[action.nodeId],
          [action.fieldKey]: {
            status: 'mapped',
            dataElement: action.dataElement,
          },
        },
      }

    case 'clearMapping':
      return {
        ...state,
        [action.nodeId]: {
          ...state[action.nodeId],
          [action.fieldKey]: {
            status: 'cleared',
          },
        },
      }
  }
}

export function getNodeMappingOverrides(
  state: MappingState,
  nodeId: string,
) {
  return state[nodeId] ?? {}
}
