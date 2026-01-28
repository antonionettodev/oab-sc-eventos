import type { Field, FieldHook } from 'payload'

const formatPhoneHook: FieldHook = ({ value }) => {
  if (!value) return value
  return value.replace(/\D/g, '')
}

interface PhoneFieldOptions {
  name?: string
  label?: string
  required?: boolean
  width?: string
}

export const phoneField = (options: PhoneFieldOptions = {}): Field => ({
  name: options.name || 'phone',
  type: 'text',
  label: options.label || 'Telefone',
  required: options.required ?? true,
  admin: {
    placeholder: '(00) 00000-0000',
    width: options.width || '50%',
    description: 'Digite o telefone com DDD',
  },
  minLength: 10,
  maxLength: 11,
  hooks: {
    beforeChange: [formatPhoneHook],
  },
  validate: (value: string | null | undefined) => {
    if (!value) return true
    const digits = value.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) {
      return 'Telefone deve ter 10 ou 11 dígitos'
    }
    return true
  },
})
