import type { Field, FieldHook } from 'payload'

const formatCpfHook: FieldHook = ({ value }) => {
  if (!value) return value
  const digits = value.replace(/\D/g, '')
  return digits
}

const validateCpf = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

interface CpfFieldOptions {
  name?: string
  label?: string
  required?: boolean
  width?: string
}

export const cpfField = (options: CpfFieldOptions = {}): Field => ({
  name: options.name || 'cpf',
  type: 'text',
  label: options.label || 'CPF',
  required: options.required ?? true,
  admin: {
    placeholder: '000.000.000-00',
    width: options.width || '50%',
    description: 'Digite apenas os números do CPF',
  },
  hooks: {
    beforeChange: [formatCpfHook],
  },
  validate: (value) => {
    if (!value) return true
    if (!validateCpf(value)) {
      return 'CPF inválido'
    }
    return true
  },
})
