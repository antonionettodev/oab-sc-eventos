import type { Validate } from 'payload'

/**
 * Valida se a data não está no passado
 */
export const validateNotInPast: Validate = (value) => {
  if (!value) return true

  const date = new Date(value as string)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  if (date < now) {
    return 'A data não pode estar no passado'
  }

  return true
}

/**
 * Valida se startDate <= endDate
 */
export const validateEventDates: Validate = (value, { data, siblingData }) => {
  const startDate = (siblingData?.startDate || data?.startDate) as string | undefined
  const endDate = (siblingData?.endDate || data?.endDate) as string | undefined

  if (!startDate || !endDate) return true

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > end) {
    return 'A data de início não pode ser maior que a data de encerramento'
  }

  return true
}

/**
 * Valida se o horário de encerramento é maior que o de início
 */
export const validateEventTimes: Validate = (value, { siblingData, data }) => {
  const startTime = (siblingData?.startTime || data?.startTime) as string | undefined
  const endTime = (siblingData?.endTime || data?.endTime) as string | undefined

  if (!startTime || !endTime) return true

  const start = new Date(startTime)
  const end = new Date(endTime)

  if (end <= start) {
    return 'O horário de encerramento deve ser maior que o horário de início'
  }

  return true
}

/**
 * Valida datas de inscrição
 */
export const validateRegistrationDates: Validate = (value, { siblingData, data }) => {
  const registrationStart = (siblingData?.registrationStart || data?.registrationStart) as string | undefined
  const registrationEnd = (siblingData?.registrationEnd || data?.registrationEnd) as string | undefined
  const eventStart = (siblingData?.startDate || data?.startDate) as string | undefined
  const eventStartTime = (siblingData?.startTime || data?.startTime) as string | undefined
  const eventEnd = (siblingData?.endDate || data?.endDate) as string | undefined
  const eventEndTime = (siblingData?.endTime || data?.endTime) as string | undefined

  if (!registrationStart || !registrationEnd) return true

  const regStart = new Date(registrationStart)
  const regEnd = new Date(registrationEnd)
  const now = new Date()

  // Não pode estar no passado
  if (regStart < now) {
    return 'A data de início das inscrições não pode estar no passado'
  }

  if (regEnd < now) {
    return 'A data de encerramento das inscrições não pode estar no passado'
  }

  // registrationStart < registrationEnd
  if (regStart >= regEnd) {
    return 'A data de início das inscrições deve ser menor que a data de encerramento'
  }

  // registrationStart < eventStart + eventStartTime
  if (eventStart && eventStartTime) {
    const eventStartDateTime = new Date(eventStart)
    const eventStartTimeDate = new Date(eventStartTime)
    eventStartDateTime.setHours(eventStartTimeDate.getHours(), eventStartTimeDate.getMinutes())

    if (regStart >= eventStartDateTime) {
      return 'A data de início das inscrições deve ser menor que a data e hora de início do evento'
    }
  }

  // registrationEnd < eventEnd + eventEndTime
  if (eventEnd && eventEndTime) {
    const eventEndDateTime = new Date(eventEnd)
    const eventEndTimeDate = new Date(eventEndTime)
    eventEndDateTime.setHours(eventEndTimeDate.getHours(), eventEndTimeDate.getMinutes())

    if (regEnd > eventEndDateTime) {
      return 'A data de encerramento das inscrições não pode ser maior que a data e hora de encerramento do evento'
    }
  }

  return true
}
