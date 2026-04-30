import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { formNodeIds, mockBlueprintGraph } from './test/fixtures'
import type { BlueprintGraphResponse } from './types/blueprint'

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('loads and summarizes the blueprint graph', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    expect(screen.getByText(/loading blueprint graph/i)).toBeInTheDocument()
    expect(await screen.findByText('Onboard Customer 0')).toBeInTheDocument()
    expect(screen.getByLabelText(/blueprint graph summary/i)).toHaveTextContent(
      /nodes\s*6/i,
    )
    expect(screen.getByLabelText(/blueprint graph summary/i)).toHaveTextContent(
      /edges\s*6/i,
    )
    expect(screen.getByLabelText(/blueprint graph summary/i)).toHaveTextContent(
      /forms\s*3/i,
    )
  })

  it('renders form nodes and starts with an empty selection state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    expect(await screen.findByRole('button', { name: /form a/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /form b/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /form c/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /form d/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /form e/i })).toBeVisible()
    expect(screen.getByRole('button', { name: /form f/i })).toBeVisible()
    expect(
      screen.getByRole('heading', { name: /no form selected yet/i }),
    ).toBeInTheDocument()
  })

  it('selects a form node and displays its summary', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    const formDButton = await screen.findByRole('button', { name: /form d/i })
    await user.click(formDButton)

    expect(formDButton).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('heading', { name: /selected: form d/i }),
    ).toBeInTheDocument()

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })
    const selectedDetails = within(selectedPanel).getByLabelText(
      /selected form details/i,
    )

    expect(within(selectedDetails).getByText(/form b/i)).toBeInTheDocument()
    expect(within(selectedDetails).getByText('8')).toBeInTheDocument()
  })

  it('renders an interactive graphical form flow', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    expect(
      await screen.findByRole('heading', { name: /visual form flow/i }),
    ).toBeInTheDocument()

    const graphFormDButton = screen.getByRole('button', {
      name: /select d in journey graph/i,
    })

    await user.click(graphFormDButton)

    expect(graphFormDButton).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByText(/highlighting upstream prefill sources for form d/i),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: /selected: form d/i }),
    ).toBeInTheDocument()
  })

  it('shows prefill fields and empty mapping calls to action', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })

    expect(
      within(selectedPanel).getByRole('heading', {
        name: /prefill fields for this form/i,
      }),
    ).toBeInTheDocument()
    const prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })

    expect(within(prefillPanel).getByText('Email')).toBeInTheDocument()
    expect(within(prefillPanel).getAllByText('Required')).toHaveLength(2)
    expect(within(prefillPanel).getAllByText('Not mapped yet')).toHaveLength(8)
    expect(
      within(prefillPanel).getAllByRole('button', { name: /configure/i }),
    ).toHaveLength(8)
  })

  it('displays supported and unsupported existing mappings safely', async () => {
    const user = userEvent.setup()
    const graph = createGraphWithFormDMappings()

    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse(graph)))

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })

    expect(within(selectedPanel).getByText('Form data: email')).toBeInTheDocument()
    expect(within(selectedPanel).getByText('Unsupported mapping')).toBeInTheDocument()
    expect(
      within(selectedPanel).getByText(/needs adapter support/i),
    ).toBeInTheDocument()

    const prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })
    const emailRow = getFieldRow(prefillPanel, 'Email')

    await user.click(
      within(emailRow).getByRole('button', {
        name: /clear mapping for email/i,
      }),
    )

    expect(within(emailRow).getByText('Not mapped yet')).toBeInTheDocument()
    expect(within(emailRow).queryByText('Form data: email'))
      .not.toBeInTheDocument()
  })

  it('integrates available data source providers for the selected form', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })

    expect(
      within(selectedPanel).getByRole('heading', {
        name: /available data sources/i,
      }),
    ).toBeInTheDocument()
    expect(
      within(selectedPanel).getByRole('heading', { name: 'Action Properties' }),
    ).toBeInTheDocument()
    expect(
      within(selectedPanel).getByRole('heading', {
        name: 'Client Organisation Properties',
      }),
    ).toBeInTheDocument()
    expect(
      within(selectedPanel).getByRole('heading', { name: 'Form B' }),
    ).toBeInTheDocument()
    expect(
      within(selectedPanel).getByRole('heading', { name: 'Form A' }),
    ).toBeInTheDocument()
    expect(
      within(selectedPanel).queryByRole('heading', { name: 'Form C' }),
    ).not.toBeInTheDocument()
  })

  it('opens the mapping modal, filters sources, and maps a field', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })
    const prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })
    const fieldRows = within(prefillPanel).getAllByRole('listitem')
    const emailRow = fieldRows.find((row) =>
      within(row).queryByText('Email'),
    )

    expect(emailRow).toBeDefined()

    await user.click(
      within(emailRow as HTMLElement).getByRole('button', {
        name: /configure mapping for email/i,
      }),
    )

    const modal = await screen.findByRole('dialog', {
      name: /select data element to map/i,
    })

    expect(within(modal).getByRole('button', { name: 'Select' })).toBeDisabled()

    await user.type(
      within(modal).getByRole('searchbox', { name: /search available data/i }),
      'Form B email',
    )

    expect(within(modal).getByRole('heading', { name: 'Form B' }))
      .toBeInTheDocument()
    expect(within(modal).queryByRole('heading', { name: 'Form A' }))
      .not.toBeInTheDocument()

    await user.click(
      within(modal).getByRole('button', {
        name: /email form b\.email short-text/i,
      }),
    )
    await user.click(within(modal).getByRole('button', { name: 'Select' }))

    expect(
      screen.queryByRole('dialog', { name: /select data element to map/i }),
    ).not.toBeInTheDocument()
    expect(within(emailRow as HTMLElement).getByText('Form B.email'))
      .toBeInTheDocument()

    await user.click(
      within(emailRow as HTMLElement).getByRole('button', {
        name: /clear mapping for email/i,
      }),
    )

    expect(within(emailRow as HTMLElement).getByText('Not mapped yet'))
      .toBeInTheDocument()
    expect(within(emailRow as HTMLElement).queryByText('Form B.email'))
      .not.toBeInTheDocument()
  })

  it('preserves field mappings while switching between form nodes', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    let selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })
    let prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })
    let emailRow = getFieldRow(prefillPanel, 'Email')

    await user.click(
      within(emailRow).getByRole('button', {
        name: /configure mapping for email/i,
      }),
    )

    const modal = await screen.findByRole('dialog', {
      name: /select data element to map/i,
    })

    await user.type(
      within(modal).getByRole('searchbox', { name: /search available data/i }),
      'Form B email',
    )
    await user.click(
      within(modal).getByRole('button', {
        name: /email form b\.email short-text/i,
      }),
    )
    await user.click(within(modal).getByRole('button', { name: 'Select' }))

    await user.click(screen.getByRole('button', { name: /form a/i }))
    expect(
      screen.getByRole('heading', { name: /selected: form a/i }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /form d/i }))

    selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })
    prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })
    emailRow = getFieldRow(prefillPanel, 'Email')

    expect(within(emailRow).getByText('Form B.email')).toBeInTheDocument()
  })

  it('focuses the mapping modal search and closes with Escape', async () => {
    const user = userEvent.setup()

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => createJsonResponse(mockBlueprintGraph)),
    )

    render(<App />)

    await user.click(await screen.findByRole('button', { name: /form d/i }))

    const selectedPanel = screen.getByRole('region', {
      name: /selected: form d/i,
    })
    const prefillPanel = within(selectedPanel).getByRole('region', {
      name: /prefill fields for this form/i,
    })
    const emailRow = getFieldRow(prefillPanel, 'Email')

    await user.click(
      within(emailRow).getByRole('button', {
        name: /configure mapping for email/i,
      }),
    )

    const modal = await screen.findByRole('dialog', {
      name: /select data element to map/i,
    })
    const searchInput = within(modal).getByRole('searchbox', {
      name: /search available data/i,
    })

    expect(modal).toHaveAccessibleDescription(/target field: email/i)
    await waitFor(() => expect(searchInput).toHaveFocus())

    await user.keyboard('{Escape}')

    expect(
      screen.queryByRole('dialog', { name: /select data element to map/i }),
    ).not.toBeInTheDocument()
  })

  it('shows a helpful error when the graph cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => createJsonResponse({}, 500)))

    render(<App />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /graph request failed with status 500/i,
    )
    expect(screen.getByText(/start the mock server/i)).toBeInTheDocument()
  })
})

function createJsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response
}

function createGraphWithFormDMappings(): BlueprintGraphResponse {
  return {
    ...mockBlueprintGraph,
    nodes: mockBlueprintGraph.nodes.map((node) => {
      if (node.id !== formNodeIds.formD) {
        return node
      }

      return {
        ...node,
        data: {
          ...node.data,
          input_mapping: {
            email: {
              type: 'form_data',
              field_path: 'email',
            },
            notes: {
              type: 'future_expression',
              config: {
                id: 'unknown-expression',
              },
            },
          },
        },
      }
    }),
  }
}

function getFieldRow(prefillPanel: HTMLElement, fieldLabel: string) {
  const fieldRow = within(prefillPanel)
    .getAllByRole('listitem')
    .find((row) => within(row).queryByText(fieldLabel))

  if (!fieldRow) {
    throw new Error(`Could not find field row for ${fieldLabel}.`)
  }

  return fieldRow
}
