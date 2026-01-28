/**
 * Valida se o valor é uma URL válida
 */
export const urlValidator = (value: unknown): string | true => {
  if (typeof value !== 'string') return true

  try {
    new URL(value)
    return true
  } catch {
    return 'URL inválida. Deve ser uma URL completa (ex: https://exemplo.com)'
  }
}
