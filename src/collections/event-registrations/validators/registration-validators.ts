import type { Validate, Payload } from 'payload'

/**
 * Valida se o email já não está inscrito neste evento
 */
export const validateUniqueEmailPerEvent = async (
  value: unknown,
  { data, req, id }: { data?: any; req: { payload: Payload }; id?: string },
): Promise<string | true> => {
  const email = value as string | undefined
  const eventId = data?.event as string | undefined

  if (!email || !eventId) return true

  const { totalDocs } = await req.payload.count({
    collection: 'event-registrations',
    where: {
      and: [
        { participantEmail: { equals: email } },
        { event: { equals: eventId } },
        ...(id ? [{ id: { not_equals: id } }] : []),
      ],
    },
  })

  if (totalDocs > 0) {
    return 'Este email já está inscrito neste evento'
  }

  return true
}

/**
 * Valida se as inscrições do evento estão abertas
 */
export const validateRegistrationOpen = async (
  value: unknown,
  { req }: { req: { payload: Payload } },
): Promise<string | true> => {
  const eventId = value as string | undefined

  if (!eventId) return true

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventId,
  })

  // Se for inscrição externa, não validamos o período
  if (event.registrationType === 'external') {
    return 'Este evento utiliza inscrição externa. Acesse o link de inscrição do evento.'
  }

  const now = new Date()
  const registrationStart = new Date(event.registrationStart)
  const registrationEnd = new Date(event.registrationEnd)

  if (now < registrationStart) {
    return 'As inscrições para este evento ainda não foram abertas'
  }

  if (now > registrationEnd) {
    return 'As inscrições para este evento já foram encerradas'
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
 * Valida se há conflito de horário nas atividades selecionadas pelo participante
 */
export const validateParticipantScheduleConflict = async (
  value: unknown,
  { data, req }: { data?: any; req: { payload: Payload } },
): Promise<string | true> => {
  const selectedActivities = value as Array<{ activityId: string }> | undefined
  const eventId = data?.event as string | undefined

  if (!selectedActivities || selectedActivities.length === 0 || !eventId) {
    return true
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventId,
  })

  const activities = event.activities as any[] | undefined

  if (!activities || activities.length === 0) {
    return true
  }

  // Valida IDs duplicados
  const activityIds = selectedActivities.map((a) => a.activityId)
  const uniqueIds = new Set(activityIds)
  if (uniqueIds.size !== activityIds.length) {
    return 'Não é possível selecionar a mesma atividade mais de uma vez'
  }

  // Valida se todos os IDs existem no evento
  for (const { activityId } of selectedActivities) {
    const activityExists = activities.some((a: any) => a.id === activityId)
    if (!activityExists) {
      return `Atividade com ID "${activityId}" não encontrada neste evento`
    }
  }

  // Cria um mapa de atividades para facilitar a busca
  const activitiesMap = new Map(
    activities.map((a: any) => [a.id, a]),
  )

  // Verifica conflitos de horário
  for (let i = 0; i < selectedActivities.length; i++) {
    const activity1 = activitiesMap.get(selectedActivities[i].activityId)
    if (!activity1) continue

    const date1 = new Date(activity1.activityDate as string)
    date1.setHours(0, 0, 0, 0)
    const start1 = new Date(activity1.activityStartTime as string)
    const end1 = new Date(activity1.activityEndTime as string)

    for (let j = i + 1; j < selectedActivities.length; j++) {
      const activity2 = activitiesMap.get(selectedActivities[j].activityId)
      if (!activity2) continue

      const date2 = new Date(activity2.activityDate as string)
      date2.setHours(0, 0, 0, 0)

      // Se não são no mesmo dia, não há conflito
      if (date1.getTime() !== date2.getTime()) continue

      const start2 = new Date(activity2.activityStartTime as string)
      const end2 = new Date(activity2.activityEndTime as string)

      if (timeIntervalsOverlap(start1, end1, start2, end2)) {
        return `Conflito de horário: "${activity1.title as string}" e "${activity2.title as string}" acontecem no mesmo horário`
      }
    }
  }

  return true
}

/**
 * Valida se as atividades selecionadas não estão lotadas (capacidade da sala)
 */
export const validateActivityCapacity = async (
  value: unknown,
  { data, req }: { data?: any; req: { payload: Payload } },
): Promise<string | true> => {
  const selectedActivities = value as Array<{ activityId: string }> | undefined
  const eventId = data?.event as string | undefined

  if (!selectedActivities || selectedActivities.length === 0 || !eventId) {
    return true
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventId,
    depth: 2, // Para popular o relacionamento com a sala
  })

  const activities = event.activities as any[] | undefined

  if (!activities || activities.length === 0) {
    return true
  }

  // Para cada atividade selecionada, verifica a lotação
  for (const { activityId } of selectedActivities) {
    const activity = activities.find((a: any) => a.id === activityId)
    if (!activity) continue

    // Busca a sala para obter a capacidade
    const room = typeof activity.room === 'string'
      ? await req.payload.findByID({
          collection: 'event-rooms',
          id: activity.room,
        })
      : activity.room

    if (!room) continue

    // Conta quantas inscrições já existem para esta atividade
    const { docs: registrations } = await req.payload.find({
      collection: 'event-registrations',
      where: {
        event: { equals: eventId },
      },
      limit: 1000, // Limite alto para garantir que pegamos todas
    })

    let currentCount = 0
    for (const registration of registrations) {
      if (
        registration.selectedActivities &&
        registration.selectedActivities.some((sa: any) => sa.activityId === activityId)
      ) {
        currentCount++
      }
    }

    if (currentCount >= room.capacity) {
      return `A atividade "${activity.title}" já atingiu sua capacidade máxima (${room.capacity} pessoas)`
    }
  }

  return true
}
