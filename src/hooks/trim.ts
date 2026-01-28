import type { FieldHook } from 'payload'

/**
 * Hook que remove espaços em branco do início e fim
 */
export const trimHook: FieldHook = ({ value }) => {
  if (typeof value === 'string') {
    return value.trim()
  }
  return value
}
