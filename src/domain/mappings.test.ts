import { describe, expect, it } from 'vitest'
import {
  getDataElementMappingDisplay,
  getFieldMapping,
  getMappingDisplay,
} from './mappings'

describe('mapping display utilities', () => {
  it('returns an empty display for missing field mappings', () => {
    expect(getFieldMapping({}, 'email')).toEqual({
      status: 'empty',
      label: 'Not mapped yet',
    })
  })

  it('displays supported mapping expression types', () => {
    expect(
      getMappingDisplay({
        type: 'form_data',
        field_path: 'email',
      }),
    ).toMatchObject({
      status: 'mapped',
      label: 'Form data: email',
    })

    expect(
      getMappingDisplay({
        type: 'client_organisation',
        field: 'person',
        jsonPath: ['email'],
      }),
    ).toMatchObject({
      status: 'mapped',
      label: 'Client organisation: person.email',
    })
  })

  it('keeps unsupported mappings visible without crashing', () => {
    expect(
      getMappingDisplay({
        type: 'future_expression',
        config: { id: 'new-world' },
      }),
    ).toMatchObject({
      status: 'unsupported',
      label: 'Unsupported mapping',
    })
  })

  it('displays provider data elements with stable readable labels', () => {
    expect(
      getDataElementMappingDisplay({
        id: 'form-b-email',
        label: 'Email',
        kind: 'form_field',
        sourceNodeName: 'Form B',
        fieldKey: 'email',
      }),
    ).toMatchObject({
      status: 'mapped',
      label: 'Form B.email',
    })

    expect(
      getDataElementMappingDisplay({
        id: 'action-status',
        label: 'Status',
        kind: 'action_property',
        path: ['Action Properties', 'status'],
      }),
    ).toMatchObject({
      status: 'mapped',
      label: 'Action Properties.status',
    })

    expect(
      getDataElementMappingDisplay({
        id: 'client-email',
        label: 'Email',
        kind: 'client_organisation_property',
        path: ['Client Organisation Properties', 'email'],
      }),
    ).toMatchObject({
      status: 'mapped',
      label: 'Client Organisation Properties.email',
    })
  })
})
