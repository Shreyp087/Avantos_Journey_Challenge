import type { DataElement } from './dataSources'

export type MappingDisplay =
  | {
      status: 'empty'
      label: 'Not mapped yet'
    }
  | {
      status: 'mapped'
      label: string
    }
  | {
      status: 'unsupported'
      label: 'Unsupported mapping'
      raw: unknown
    }

type MappingExpression = Record<string, unknown>

export function getMappingDisplay(expression: unknown): MappingDisplay {
  if (expression === undefined || expression === null) {
    return {
      status: 'empty',
      label: 'Not mapped yet',
    }
  }

  if (typeof expression === 'string') {
    return {
      status: 'mapped',
      label: expression,
    }
  }

  if (!isMappingExpression(expression)) {
    return createUnsupportedMapping(expression)
  }

  const type = expression.type

  if (type === 'form_field' && 'value' in expression) {
    return createMappedLabel(`Form field: ${formatUnknown(expression.value)}`)
  }

  if (type === 'form_data' && typeof expression.field_path === 'string') {
    return createMappedLabel(`Form data: ${expression.field_path}`)
  }

  if (type === 'action_data' && typeof expression.output_key === 'string') {
    return createMappedLabel(`Action data: ${expression.output_key}`)
  }

  if (
    type === 'client_organisation' &&
    typeof expression.field === 'string'
  ) {
    const jsonPath = Array.isArray(expression.jsonPath)
      ? `.${expression.jsonPath.join('.')}`
      : ''

    return createMappedLabel(`Client organisation: ${expression.field}${jsonPath}`)
  }

  if (type === 'literal' && 'value' in expression) {
    return createMappedLabel(`Literal: ${formatUnknown(expression.value)}`)
  }

  return createUnsupportedMapping(expression)
}

export function getFieldMapping(
  inputMapping: Record<string, unknown> | undefined,
  fieldKey: string,
) {
  return getMappingDisplay(inputMapping?.[fieldKey])
}

export function getDataElementMappingDisplay(
  dataElement: DataElement | undefined,
): MappingDisplay | undefined {
  if (!dataElement) {
    return undefined
  }

  if (dataElement.kind === 'form_field') {
    return createMappedLabel(
      `${dataElement.sourceNodeName ?? 'Form'}.${dataElement.fieldKey ?? dataElement.label}`,
    )
  }

  if (dataElement.kind === 'action_property') {
    return createMappedLabel(
      `Action Properties.${dataElement.path?.at(-1) ?? dataElement.label}`,
    )
  }

  if (dataElement.kind === 'client_organisation_property') {
    return createMappedLabel(
      `Client Organisation Properties.${dataElement.path?.at(-1) ?? dataElement.label}`,
    )
  }

  return createMappedLabel(dataElement.label)
}

function createMappedLabel(label: string): MappingDisplay {
  return {
    status: 'mapped',
    label,
  }
}

function createUnsupportedMapping(raw: unknown): MappingDisplay {
  return {
    status: 'unsupported',
    label: 'Unsupported mapping',
    raw,
  }
}

function isMappingExpression(value: unknown): value is MappingExpression {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function formatUnknown(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString()
  }

  if (value === null) {
    return 'null'
  }

  return JSON.stringify(value)
}
