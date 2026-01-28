import type { FieldHook } from 'payload'

/**
 * Hook que remove todos os caracteres não numéricos e faz trim
 */
export const removeNonNumericHook: FieldHook = ({ value }) => {
  if (typeof value === 'string') {
    return value.replace(/\D/g, '').trim()
  }
  return value
}
