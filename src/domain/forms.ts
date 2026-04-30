import type { ActionForm, FormFieldSchema } from '../types/blueprint'

export type FormField = {
  key: string
  label: string
  required: boolean
  schema: FormFieldSchema
  typeLabel: string
}

export function getFormFields(form: ActionForm | undefined): FormField[] {
  if (!form?.field_schema.properties) {
    return []
  }

  const requiredFields = new Set(form.field_schema.required ?? [])

  return Object.entries(form.field_schema.properties).map(([key, schema]) => ({
    key,
    label: schema.title ?? humanizeFieldKey(key),
    required: requiredFields.has(key),
    schema,
    typeLabel: getFieldTypeLabel(schema),
  }))
}

function getFieldTypeLabel(schema: FormFieldSchema) {
  if (schema.avantos_type) {
    return schema.avantos_type
  }

  if (schema.format) {
    return schema.format
  }

  return schema.type ?? 'unknown'
}

function humanizeFieldKey(key: string) {
  return key
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
