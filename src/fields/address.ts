import type { Field, FieldHook } from 'payload'

const formatCepHook: FieldHook = ({ value }) => {
  if (!value) return value
  return value.replace(/\D/g, '')
}

const uppercaseHook: FieldHook = ({ value }) => {
  if (!value) return value
  return value.trim().toUpperCase()
}

interface AddressFieldOptions {
  required?: boolean
  name?: string
}

export const addressFields = (options: AddressFieldOptions = {}): Field => ({
  name: options.name || 'address',
  type: 'group',
  label: 'Endereço',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'cep',
          type: 'text',
          label: 'CEP',
          required: options.required ?? true,
          admin: {
            placeholder: '00000-000',
            width: '30%',
          },
          minLength: 8,
          maxLength: 8,
          hooks: {
            beforeChange: [formatCepHook],
          },
          validate: (value: string | null | undefined) => {
            if (!value) return true
            const digits = value.replace(/\D/g, '')
            if (digits.length !== 8) {
              return 'CEP deve ter 8 dígitos'
            }
            return true
          },
        },
        {
          name: 'street',
          type: 'text',
          label: 'Logradouro',
          required: options.required ?? true,
          admin: {
            placeholder: 'Rua, Avenida, etc.',
            width: '70%',
          },
          maxLength: 200,
          hooks: {
            beforeChange: [uppercaseHook],
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'number',
          type: 'text',
          label: 'Número',
          required: options.required ?? true,
          admin: {
            placeholder: '123',
            width: '20%',
          },
          maxLength: 10,
        },
        {
          name: 'complement',
          type: 'text',
          label: 'Complemento',
          required: false,
          admin: {
            placeholder: 'Apto, Sala, etc.',
            width: '30%',
          },
          maxLength: 100,
          hooks: {
            beforeChange: [uppercaseHook],
          },
        },
        {
          name: 'neighborhood',
          type: 'text',
          label: 'Bairro',
          required: options.required ?? true,
          admin: {
            placeholder: 'Bairro',
            width: '50%',
          },
          maxLength: 100,
          hooks: {
            beforeChange: [uppercaseHook],
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'city',
          type: 'text',
          label: 'Cidade',
          required: options.required ?? true,
          admin: {
            placeholder: 'Cidade',
            width: '50%',
          },
          maxLength: 100,
          hooks: {
            beforeChange: [uppercaseHook],
          },
        },
        {
          name: 'state',
          type: 'select',
          label: 'Estado',
          required: options.required ?? true,
          admin: {
            width: '50%',
          },
          options: [
            { label: 'Acre', value: 'AC' },
            { label: 'Alagoas', value: 'AL' },
            { label: 'Amapá', value: 'AP' },
            { label: 'Amazonas', value: 'AM' },
            { label: 'Bahia', value: 'BA' },
            { label: 'Ceará', value: 'CE' },
            { label: 'Distrito Federal', value: 'DF' },
            { label: 'Espírito Santo', value: 'ES' },
            { label: 'Goiás', value: 'GO' },
            { label: 'Maranhão', value: 'MA' },
            { label: 'Mato Grosso', value: 'MT' },
            { label: 'Mato Grosso do Sul', value: 'MS' },
            { label: 'Minas Gerais', value: 'MG' },
            { label: 'Pará', value: 'PA' },
            { label: 'Paraíba', value: 'PB' },
            { label: 'Paraná', value: 'PR' },
            { label: 'Pernambuco', value: 'PE' },
            { label: 'Piauí', value: 'PI' },
            { label: 'Rio de Janeiro', value: 'RJ' },
            { label: 'Rio Grande do Norte', value: 'RN' },
            { label: 'Rio Grande do Sul', value: 'RS' },
            { label: 'Rondônia', value: 'RO' },
            { label: 'Roraima', value: 'RR' },
            { label: 'Santa Catarina', value: 'SC' },
            { label: 'São Paulo', value: 'SP' },
            { label: 'Sergipe', value: 'SE' },
            { label: 'Tocantins', value: 'TO' },
          ],
          defaultValue: 'SC',
        },
      ],
    },
  ],
})
