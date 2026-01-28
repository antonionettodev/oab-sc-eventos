import type { FieldHook } from 'payload'

/**
 * Hook que transforma o valor em uppercase e remove espaços em branco
 */
export const uppercaseTrimHook: FieldHook = ({ value }) => {
  if (typeof value === 'string') {
    return value.trim().toUpperCase()
  }
  return value
}
