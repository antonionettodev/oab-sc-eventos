import type { Validate, Payload } from 'payload'

/**
 * Valida se a data da atividade está dentro do período do evento
 */
export const validateActivityDate: Validate = (value, { data, siblingData }) => {
  const activityDate = value as string | undefined
  const eventStartDate = (siblingData?.startDate || data?.startDate) as string | undefined
  const eventEndDate = (siblingData?.endDate || data?.endDate) as string | undefined

  if (!activityDate || !eventStartDate || !eventEndDate) return true

  const activity = new Date(activityDate)
  const eventStart = new Date(eventStartDate)
  const eventEnd = new Date(eventEndDate)

  activity.setHours(0, 0, 0, 0)
  eventStart.setHours(0, 0, 0, 0)
  eventEnd.setHours(0, 0, 0, 0)

  if (activity < eventStart || activity > eventEnd) {
    return 'A data da atividade deve estar entre a data de início e encerramento do evento'
  }

  return true
}

/**
 * Valida se os horários da atividade estão dentro dos horários do evento
 */
export const validateActivityTimes: Validate = (value, { data, siblingData }) => {
  const activityStartTime = (siblingData?.activityStartTime || data?.activityStartTime) as string | undefined
  const activityEndTime = (siblingData?.activityEndTime || data?.activityEndTime) as string | undefined
  const eventStartTime = (siblingData?.startTime || data?.startTime) as string | undefined
  const eventEndTime = (siblingData?.endTime || data?.endTime) as string | undefined

  if (!activityStartTime || !activityEndTime || !eventStartTime || !eventEndTime) return true

  const actStart = new Date(activityStartTime)
  const actEnd = new Date(activityEndTime)
  const evStart = new Date(eventStartTime)
  const evEnd = new Date(eventEndTime)

  // Extrai apenas horas e minutos
  const actStartMinutes = actStart.getHours() * 60 + actStart.getMinutes()
  const actEndMinutes = actEnd.getHours() * 60 + actEnd.getMinutes()
  const evStartMinutes = evStart.getHours() * 60 + evStart.getMinutes()
  const evEndMinutes = evEnd.getHours() * 60 + evEnd.getMinutes()

  if (actStartMinutes < evStartMinutes) {
    return 'O horário de início da atividade deve ser maior ou igual ao horário de início do evento'
  }

  if (actStartMinutes >= evEndMinutes) {
    return 'O horário de início da atividade deve ser menor que o horário de encerramento do evento'
  }

  if (actEndMinutes <= actStartMinutes) {
    return 'O horário de encerramento da atividade deve ser maior que o horário de início'
  }

  if (actEndMinutes > evEndMinutes) {
    return 'O horário de encerramento da atividade deve ser menor ou igual ao horário de encerramento do evento'
  }

  return true
}

/**
 * Verifica se dois intervalos de tempo se sobrepõem
 */
function timeIntervalsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date,
): boolean {
  return start1 < end2 && start2 < end1
}

/**
 * Valida conflito de horário de salas
 * Uma mesma sala não pode ter atividades com horários sobrepostos no mesmo dia
 */
export const validateRoomConflict = async (
  value: unknown,
  { data, siblingData, req }: { data?: any; siblingData?: any; req: { payload: Payload } },
): Promise<string | true> => {
  const roomId = value as string | undefined
  const activityDate = (siblingData?.activityDate || data?.activityDate) as string | undefined
  const activityStartTime = (siblingData?.activityStartTime || data?.activityStartTime) as string | undefined
  const activityEndTime = (siblingData?.activityEndTime || data?.activityEndTime) as string | undefined
  const currentEventId = data?.id as string | undefined
  const activities = data?.activities as any[] | undefined
  const currentActivityIndex = siblingData?._index

  if (!roomId || !activityDate || !activityStartTime || !activityEndTime) return true

  const actDate = new Date(activityDate)
  actDate.setHours(0, 0, 0, 0)

  const actStart = new Date(activityStartTime)
  const actEnd = new Date(activityEndTime)

  // Verifica conflito dentro do mesmo evento
  if (activities) {
    for (let i = 0; i < activities.length; i++) {
      if (i === currentActivityIndex) continue // Pula a própria atividade

      const otherActivity = activities[i]
      if (otherActivity.room !== roomId) continue

      const otherDate = new Date(otherActivity.activityDate)
      otherDate.setHours(0, 0, 0, 0)

      if (actDate.getTime() !== otherDate.getTime()) continue

      const otherStart = new Date(otherActivity.activityStartTime)
      const otherEnd = new Date(otherActivity.activityEndTime)

      if (timeIntervalsOverlap(actStart, actEnd, otherStart, otherEnd)) {
        return 'Conflito de horário: esta sala já possui outra atividade neste horário'
      }
    }
  }

  // Verifica conflito com outros eventos
  const { docs: events } = await req.payload.find({
    collection: 'events',
    where: {
      and: [
        { id: { not_equals: currentEventId } },
      ],
    },
  })

  for (const event of events) {
    if (!event.activities) continue

    for (const otherActivity of event.activities) {
      if (otherActivity.room !== roomId) continue

      const otherDate = new Date(otherActivity.activityDate)
      otherDate.setHours(0, 0, 0, 0)

      if (actDate.getTime() !== otherDate.getTime()) continue

      const otherStart = new Date(otherActivity.activityStartTime)
      const otherEnd = new Date(otherActivity.activityEndTime)

      if (timeIntervalsOverlap(actStart, actEnd, otherStart, otherEnd)) {
        return `Conflito de horário: esta sala já está reservada para o evento "${event.title}" neste horário`
      }
    }
  }

  return true
}

/**
 * Valida conflito de horário de palestrantes
 * Um mesmo palestrante não pode estar em atividades com horários sobrepostos no mesmo dia
 */
export const validateSpeakerConflict = async (
  value: unknown,
  { data, siblingData, req }: { data?: any; siblingData?: any; req: { payload: Payload } },
): Promise<string | true> => {
  const speakerIds = value as string[] | undefined
  const activityDate = (siblingData?.activityDate || data?.activityDate) as string | undefined
  const activityStartTime = (siblingData?.activityStartTime || data?.activityStartTime) as string | undefined
  const activityEndTime = (siblingData?.activityEndTime || data?.activityEndTime) as string | undefined
  const currentEventId = data?.id as string | undefined
  const activities = data?.activities as any[] | undefined
  const currentActivityIndex = siblingData?._index

  if (!speakerIds || speakerIds.length === 0 || !activityDate || !activityStartTime || !activityEndTime) {
    return true
  }

  const actDate = new Date(activityDate)
  actDate.setHours(0, 0, 0, 0)

  const actStart = new Date(activityStartTime)
  const actEnd = new Date(activityEndTime)

  // Verifica conflito dentro do mesmo evento
  if (activities) {
    for (let i = 0; i < activities.length; i++) {
      if (i === currentActivityIndex) continue

      const otherActivity = activities[i]
      if (!otherActivity.speakers || otherActivity.speakers.length === 0) continue

      const otherDate = new Date(otherActivity.activityDate)
      otherDate.setHours(0, 0, 0, 0)

      if (actDate.getTime() !== otherDate.getTime()) continue

      const otherStart = new Date(otherActivity.activityStartTime)
      const otherEnd = new Date(otherActivity.activityEndTime)

      if (!timeIntervalsOverlap(actStart, actEnd, otherStart, otherEnd)) continue

      // Verifica se há palestrantes em comum
      const commonSpeakers = speakerIds.filter((id) => otherActivity.speakers.includes(id))
      if (commonSpeakers.length > 0) {
        // Busca nome do palestrante para mensagem mais clara
        const speaker = await req.payload.findByID({
          collection: 'speakers',
          id: commonSpeakers[0],
        })
        return `Conflito de horário: o palestrante "${speaker.name}" já está em outra atividade neste horário`
      }
    }
  }

  // Verifica conflito com outros eventos
  const { docs: events } = await req.payload.find({
    collection: 'events',
    where: {
      and: [
        { id: { not_equals: currentEventId } },
      ],
    },
  })

  for (const event of events) {
    if (!event.activities) continue

    for (const otherActivity of event.activities) {
      if (!otherActivity.speakers || otherActivity.speakers.length === 0) continue

      const otherDate = new Date(otherActivity.activityDate)
      otherDate.setHours(0, 0, 0, 0)

      if (actDate.getTime() !== otherDate.getTime()) continue

      const otherStart = new Date(otherActivity.activityStartTime)
      const otherEnd = new Date(otherActivity.activityEndTime)

      if (!timeIntervalsOverlap(actStart, actEnd, otherStart, otherEnd)) continue

      const commonSpeakers = speakerIds.filter((id) => otherActivity.speakers.includes(id))
      if (commonSpeakers.length > 0) {
        const speaker = await req.payload.findByID({
          collection: 'speakers',
          id: commonSpeakers[0],
        })
        return `Conflito de horário: o palestrante "${speaker.name}" já está em outra atividade do evento "${event.title}" neste horário`
      }
    }
  }

  return true
}
