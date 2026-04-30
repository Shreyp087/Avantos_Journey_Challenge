export type BlueprintNodeType =
  | 'form'
  | 'branch'
  | 'trigger'
  | 'configuration'
  | 'forEach'
  | 'action'
  | 'statusGate'
  | 'calculator'
  | 'dynamicTask'
  | string

export type BlueprintPosition = {
  x: number
  y: number
}

export type BlueprintEdge = {
  source: string
  target: string
}

export type BlueprintNodeData = {
  id: string
  component_key: string
  component_type: string
  component_id: string
  name: string
  prerequisites: string[]
  permitted_roles?: string[]
  input_mapping: Record<string, unknown>
  approval_required?: boolean
  approval_roles?: string[]
  [key: string]: unknown
}

export type BlueprintNode = {
  id: string
  type: BlueprintNodeType
  position: BlueprintPosition
  data: BlueprintNodeData
  hidden?: boolean
}

export type FormFieldSchema = {
  title?: string
  type?: string
  format?: string
  avantos_type?: string
  enum?: unknown[] | null
  items?: FormFieldSchema
  uniqueItems?: boolean
  [key: string]: unknown
}

export type JsonFormSchema = {
  type?: string
  properties?: Record<string, FormFieldSchema>
  required?: string[]
  [key: string]: unknown
}

export type ActionForm = {
  id: string
  name: string
  description?: string
  field_schema: JsonFormSchema
  ui_schema?: unknown
  dynamic_field_config?: Record<string, unknown>
  default_input_mapping?: Record<string, unknown>
  default_output_mapping?: Record<string, unknown>
  [key: string]: unknown
}

export type BlueprintGraphResponse = {
  $schema?: string
  id?: string
  blueprint_id?: string
  tenant_id: string
  name?: string
  blueprint_name?: string
  description?: string
  category?: string
  nodes: BlueprintNode[]
  edges: BlueprintEdge[]
  forms: ActionForm[]
  branches?: unknown[] | null
  triggers?: unknown[] | null
  [key: string]: unknown
}

export type BlueprintGraphSummary = {
  id: string
  name: string
  tenantId: string
  nodeCount: number
  edgeCount: number
  formCount: number
}
