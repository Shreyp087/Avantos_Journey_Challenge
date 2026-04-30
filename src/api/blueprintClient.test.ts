import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildBlueprintGraphUrl,
  fetchBlueprintGraph,
  getBlueprintErrorMessage,
  summarizeBlueprintGraph,
} from './blueprintClient'
import { mockBlueprintGraph } from '../test/fixtures'

describe('blueprintClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the mock server graph URL', () => {
    expect(
      buildBlueprintGraphUrl({
        baseUrl: 'http://localhost:3000/',
        tenantId: 'tenant 1',
        blueprintId: 'bp/example',
      }),
    ).toBe(
      'http://localhost:3000/api/v1/tenant%201/actions/blueprints/bp%2Fexample/graph',
    )
  })

  it('fetches and validates graph data', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    await expect(fetchBlueprintGraph()).resolves.toEqual(mockBlueprintGraph)
  })

  it('throws a helpful error for non-OK responses', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse({}, 500)))

    await expect(fetchBlueprintGraph()).rejects.toEqual({
      name: 'BlueprintClientError',
      message: 'Graph request failed with status 500.',
      status: 500,
    })
  })

  it('throws a helpful error for invalid graph shapes', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse({ nodes: [] })))

    await expect(fetchBlueprintGraph()).rejects.toMatchObject({
      name: 'BlueprintClientError',
      message: /missing required nodes, edges, or forms arrays/i,
    })
  })

  it('summarizes mock and official blueprint naming variants', () => {
    expect(summarizeBlueprintGraph(mockBlueprintGraph)).toEqual({
      id: 'bp_01jk766tckfwx84xjcxazggzyc',
      name: 'Onboard Customer 0',
      tenantId: '1',
      nodeCount: 6,
      edgeCount: 6,
      formCount: 3,
    })

    expect(
      summarizeBlueprintGraph({
        ...mockBlueprintGraph,
        id: undefined,
        name: undefined,
        blueprint_id: 'bp_official',
        blueprint_name: 'Official Name',
      }),
    ).toMatchObject({
      id: 'bp_official',
      name: 'Official Name',
    })
  })

  it('normalizes unknown errors for the UI', () => {
    expect(getBlueprintErrorMessage('boom')).toBe(
      'Something went wrong while loading the blueprint graph.',
    )
  })
})

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}
