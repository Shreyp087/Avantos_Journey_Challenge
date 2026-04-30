import type {
  BlueprintGraphResponse,
  BlueprintGraphSummary,
} from '../types/blueprint'

export type BlueprintGraphRequest = {
  baseUrl?: string
  tenantId?: string
  blueprintId?: string
}

export type BlueprintClientError = {
  name: 'BlueprintClientError'
  message: string
  status?: number
}

export const DEFAULT_BLUEPRINT_REQUEST = {
  baseUrl: 'http://localhost:3000',
  tenantId: '1',
  blueprintId: 'bp_01jk766tckfwx84xjcxazggzyc',
} satisfies Required<BlueprintGraphRequest>

export function buildBlueprintGraphUrl({
  baseUrl = DEFAULT_BLUEPRINT_REQUEST.baseUrl,
  tenantId = DEFAULT_BLUEPRINT_REQUEST.tenantId,
  blueprintId = DEFAULT_BLUEPRINT_REQUEST.blueprintId,
}: BlueprintGraphRequest = {}) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '')
  const encodedTenantId = encodeURIComponent(tenantId)
  const encodedBlueprintId = encodeURIComponent(blueprintId)

  return `${normalizedBaseUrl}/api/v1/${encodedTenantId}/actions/blueprints/${encodedBlueprintId}/graph`
}

export async function fetchBlueprintGraph(
  request: BlueprintGraphRequest = {},
): Promise<BlueprintGraphResponse> {
  const url = buildBlueprintGraphUrl(request)
  const response = await fetch(url)

  if (!response.ok) {
    throw createBlueprintClientError(
      `Graph request failed with status ${response.status}.`,
      response.status,
    )
  }

  const data = (await response.json()) as unknown

  if (!isBlueprintGraphResponse(data)) {
    throw createBlueprintClientError(
      'Graph response was missing required nodes, edges, or forms arrays.',
    )
  }

  return data
}

export function summarizeBlueprintGraph(
  graph: BlueprintGraphResponse,
): BlueprintGraphSummary {
  return {
    id: graph.id ?? graph.blueprint_id ?? 'unknown-blueprint',
    name: graph.name ?? graph.blueprint_name ?? 'Untitled blueprint',
    tenantId: graph.tenant_id,
    nodeCount: graph.nodes.length,
    edgeCount: graph.edges.length,
    formCount: graph.forms.length,
  }
}

export function getBlueprintErrorMessage(error: unknown) {
  if (isBlueprintClientError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong while loading the blueprint graph.'
}

function isBlueprintGraphResponse(
  value: unknown,
): value is BlueprintGraphResponse {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<BlueprintGraphResponse>

  return (
    typeof candidate.tenant_id === 'string' &&
    Array.isArray(candidate.nodes) &&
    Array.isArray(candidate.edges) &&
    Array.isArray(candidate.forms)
  )
}

function createBlueprintClientError(
  message: string,
  status?: number,
): BlueprintClientError {
  return {
    name: 'BlueprintClientError',
    message,
    status,
  }
}

function isBlueprintClientError(error: unknown): error is BlueprintClientError {
  return (
    !!error &&
    typeof error === 'object' &&
    (error as BlueprintClientError).name === 'BlueprintClientError'
  )
}
