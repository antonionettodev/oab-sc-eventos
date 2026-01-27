import type { CollectionBeforeChangeHook, Where } from 'payload'

/**
 * Validates check-in before creation:
 * 1. Ticket must be active (paid)
 * 2. Event must be ongoing
 * 3. Prevents duplicate check-ins for the same type/room/date
 */
export const validateCheckInHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  // Only validate on create
  if (operation !== 'create') return data

  const ticketId = typeof data?.ticket === 'string' ? data.ticket : data?.ticket?.id

  if (!ticketId) {
    throw new Error('Ingresso não informado')
  }

  // Get the ticket
  const ticket = await req.payload.findByID({
    collection: 'tickets',
    id: ticketId,
    req,
  })

  if (!ticket) {
    throw new Error('Ingresso não encontrado')
  }

  // Check if ticket is active
  if (ticket.status !== 'active') {
    const statusMessages: Record<string, string> = {
      pending: 'O ingresso ainda não foi pago',
      cancelled: 'O ingresso foi cancelado',
      refunded: 'O ingresso foi reembolsado',
      used: 'O ingresso já foi utilizado',
    }
    throw new Error(statusMessages[ticket.status] || 'Ingresso inválido para check-in')
  }

  // Get the event
  const eventId = typeof data?.event === 'string' ? data.event : data?.event?.id
  if (!eventId) {
    throw new Error('Evento não informado')
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventId,
    req,
  })

  if (!event) {
    throw new Error('Evento não encontrado')
  }

  // Check if event is active
  if (event.status !== 'published') {
    throw new Error('O evento não está ativo')
  }

  // For room check-ins, validate that the ticket has this activity selected
  if (data?.type === 'room' && data?.scheduleId) {
    const selectedSchedule = ticket.selectedSchedule as { scheduleId: string }[] | undefined
    const hasActivity = selectedSchedule?.some(
      (item) => item.scheduleId === data.scheduleId
    )

    if (!hasActivity) {
      throw new Error('O participante não está inscrito nesta atividade')
    }
  }

  // Check for duplicate check-ins
  const checkInQuery: Where = {
    and: [
      { ticket: { equals: ticketId } },
      { type: { equals: data?.type } },
      { date: { equals: data?.date } },
    ],
  }

  // For room type, also check the specific room
  if (data?.type === 'room' && data?.room) {
    const roomId = typeof data.room === 'string' ? data.room : data.room?.id
    ;(checkInQuery.and as Where[]).push({ room: { equals: roomId } })
  }

  const existingCheckIn = await req.payload.find({
    collection: 'check-ins',
    where: checkInQuery,
    limit: 1,
    req,
  })

  if (existingCheckIn.totalDocs > 0) {
    const typeMessages: Record<string, string> = {
      event: 'Check-in geral do evento já realizado',
      day: 'Check-in do dia já realizado',
      room: 'Check-in da sala já realizado',
    }
    throw new Error(typeMessages[data?.type as string] || 'Check-in já realizado')
  }

  return data
}
