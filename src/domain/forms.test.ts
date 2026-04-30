import { describe, expect, it } from 'vitest'
import { getFormFields } from './forms'
import { mockBlueprintGraph } from '../test/fixtures'

describe('form domain utilities', () => {
  it('extracts fields from a form schema and marks required fields', () => {
    const fields = getFormFields(mockBlueprintGraph.forms[0])

    expect(fields).toHaveLength(8)
    expect(fields.find((field) => field.key === 'email')).toMatchObject({
      label: 'Email',
      required: true,
      typeLabel: 'short-text',
    })
    expect(fields.find((field) => field.key === 'notes')).toMatchObject({
      label: 'Notes',
      required: false,
      typeLabel: 'multi-line-text',
    })
  })

  it('returns an empty list when a form schema is unavailable', () => {
    expect(getFormFields(undefined)).toEqual([])
  })
})
