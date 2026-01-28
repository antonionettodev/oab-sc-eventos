import type { Field, FieldHook } from 'payload'

const formatOabHook: FieldHook = ({ value }) => {
  if (!value) return value
  return value.trim().toUpperCase()
}

interface OabNumberFieldOptions {
  name?: string
  label?: string
  required?: boolean
  width?: string
}

export const oabNumberField = (options: OabNumberFieldOptions = {}): Field => ({
  name: options.name || 'oabNumber',
  type: 'text',
  label: options.label || 'Número da OAB',
  required: options.required ?? false,
  admin: {
    placeholder: 'Ex: 12345/SC',
    width: options.width || '50%',
    description: 'Número de registro na OAB (opcional)',
  },
  maxLength: 20,
  hooks: {
    beforeChange: [formatOabHook],
  },
})
