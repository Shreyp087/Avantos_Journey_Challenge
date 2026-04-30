import type { BlueprintGraphResponse } from '../types/blueprint'

export const formNodeIds = {
  formA: 'form-47c61d17-62b0-4c42-8ca2-0eff641c9d88',
  formB: 'form-a4750667-d774-40fb-9b0a-44f8539ff6c4',
  formC: 'form-7c26f280-7bff-40e3-b9a5-0533136f52c3',
  formD: 'form-0f58384c-4966-4ce6-9ec2-40b96d61f745',
  formE: 'form-e15d42df-c7c0-4819-9391-53730e6d47b3',
  formF: 'form-bad163fd-09bd-4710-ad80-245f31b797d5',
} as const

const formIds = {
  reusableFormOne: 'f_01jk7ap2r3ewf9gx6a9r09gzjv',
  reusableFormTwo: 'f_01jk7awbhqewgbkbgk8rjm7bv7',
  reusableFormThree: 'f_01jk7aygnqewh8gt8549beb1yc',
} as const

export const mockBlueprintGraph = {
  $schema: 'http://localhost:9000/schemas/ActionBlueprintGraphDescription.json',
  id: 'bp_01jk766tckfwx84xjcxazggzyc',
  tenant_id: '1',
  name: 'Onboard Customer 0',
  description: 'Automated test action',
  category: 'Category 4',
  nodes: [
    createFormNode({
      id: formNodeIds.formF,
      name: 'Form F',
      componentId: formIds.reusableFormOne,
      x: 1437,
      y: 264,
      prerequisites: [formNodeIds.formD, formNodeIds.formE],
    }),
    createFormNode({
      id: formNodeIds.formD,
      name: 'Form D',
      componentId: formIds.reusableFormOne,
      x: 1093,
      y: 155,
      prerequisites: [formNodeIds.formB],
    }),
    createFormNode({
      id: formNodeIds.formA,
      name: 'Form A',
      componentId: formIds.reusableFormOne,
      x: 494,
      y: 269,
      prerequisites: [],
    }),
    createFormNode({
      id: formNodeIds.formC,
      name: 'Form C',
      componentId: formIds.reusableFormThree,
      x: 779,
      y: 362,
      prerequisites: [formNodeIds.formA],
    }),
    createFormNode({
      id: formNodeIds.formB,
      name: 'Form B',
      componentId: formIds.reusableFormTwo,
      x: 781,
      y: 155,
      prerequisites: [formNodeIds.formA],
    }),
    createFormNode({
      id: formNodeIds.formE,
      name: 'Form E',
      componentId: formIds.reusableFormOne,
      x: 1092,
      y: 364,
      prerequisites: [formNodeIds.formC],
    }),
  ],
  edges: [
    { source: formNodeIds.formD, target: formNodeIds.formF },
    { source: formNodeIds.formE, target: formNodeIds.formF },
    { source: formNodeIds.formB, target: formNodeIds.formD },
    { source: formNodeIds.formA, target: formNodeIds.formC },
    { source: formNodeIds.formA, target: formNodeIds.formB },
    { source: formNodeIds.formC, target: formNodeIds.formE },
  ],
  forms: [
    createForm(formIds.reusableFormOne),
    createForm(formIds.reusableFormTwo),
    createForm(formIds.reusableFormThree),
  ],
  branches: [],
  triggers: [],
} satisfies BlueprintGraphResponse

function createFormNode({
  id,
  name,
  componentId,
  x,
  y,
  prerequisites,
}: {
  id: string
  name: string
  componentId: string
  x: number
  y: number
  prerequisites: string[]
}) {
  return {
    id,
    type: 'form',
    position: { x, y },
    data: {
      id: `component-${id}`,
      component_key: id,
      component_type: 'form',
      component_id: componentId,
      name,
      prerequisites,
      permitted_roles: [],
      input_mapping: {},
      approval_required: false,
      approval_roles: [],
    },
  }
}

function createForm(id: string) {
  return {
    id,
    name: 'test form',
    description: 'Reusable test form schema',
    field_schema: {
      type: 'object',
      required: ['email', 'name'],
      properties: {
        button: {
          avantos_type: 'button',
          title: 'Button',
          type: 'object',
        },
        dynamic_checkbox_group: {
          avantos_type: 'checkbox-group',
          items: {
            enum: ['foo', 'bar', 'foobar'],
            type: 'string',
          },
          type: 'array',
          uniqueItems: true,
        },
        dynamic_object: {
          avantos_type: 'object-enum',
          enum: null,
          title: 'Dynamic Object',
          type: 'object',
        },
        email: {
          avantos_type: 'short-text',
          format: 'email',
          title: 'Email',
          type: 'string',
        },
        id: {
          avantos_type: 'short-text',
          title: 'ID',
          type: 'string',
        },
        multi_select: {
          avantos_type: 'multi-select',
          items: {
            enum: ['foo', 'bar', 'foobar'],
            type: 'string',
          },
          type: 'array',
          uniqueItems: true,
        },
        name: {
          avantos_type: 'short-text',
          title: 'Name',
          type: 'string',
        },
        notes: {
          avantos_type: 'multi-line-text',
          title: 'Notes',
          type: 'string',
        },
      },
    },
  }
}
