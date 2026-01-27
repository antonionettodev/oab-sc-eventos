import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Validates refund requests:
 * 1. Payment must be completed
 * 2. Within refund deadline
 * 3. No check-ins registered for any ticket
 * 4. No certificates issued for any ticket
 */
export const validateRefundHook: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  // Only validate on update when refund is being requested
  if (operation !== 'update') return data
  if (!data?.refundRequested || originalDoc?.refundRequested) return data

  // Check if payment was completed
  if (originalDoc?.paymentStatus !== 'paid') {
    throw new Error('Apenas inscrições com pagamento confirmado podem solicitar reembolso')
  }

  // Get the event to check refund deadline
  const eventId = typeof originalDoc?.event === 'string'
    ? originalDoc.event
    : originalDoc?.event?.id

  if (!eventId) {
    throw new Error('Evento não encontrado na inscrição')
  }

  const event = await req.payload.findByID({
    collection: 'events',
    id: eventId,
    req,
  })

  if (!event) {
    throw new Error('Evento não encontrado')
  }

  // Check refund deadline
  if (event.refundDays && event.startDate) {
    const eventStart = new Date(event.startDate)
    const refundDeadline = new Date(eventStart)
    refundDeadline.setDate(refundDeadline.getDate() - event.refundDays)

    if (new Date() > refundDeadline) {
      throw new Error(
        `O prazo para solicitar reembolso expirou. O reembolso deveria ser solicitado até ${event.refundDays} dias antes do evento.`
      )
    }
  }

  // Get all tickets for this registration
  const tickets = await req.payload.find({
    collection: 'tickets',
    where: {
      registration: { equals: originalDoc.id },
    },
    req,
  })

  // Check for any check-ins
  for (const ticket of tickets.docs) {
    const checkIns = await req.payload.count({
      collection: 'check-ins',
      where: {
        ticket: { equals: ticket.id },
      },
      req,
    })

    if (checkIns.totalDocs > 0) {
      throw new Error(
        'Não é possível solicitar reembolso: um ou mais participantes já realizaram check-in no evento. Presença registrada é considerada serviço prestado.'
      )
    }
  }

  // Check for any certificates issued
  for (const ticket of tickets.docs) {
    const certificates = await req.payload.count({
      collection: 'certificates',
      where: {
        ticket: { equals: ticket.id },
      },
      req,
    })

    if (certificates.totalDocs > 0) {
      throw new Error(
        'Não é possível solicitar reembolso: um ou mais participantes já tiveram certificados emitidos.'
      )
    }
  }

  // Set refund request timestamp
  return {
    ...data,
    refundRequestedAt: new Date().toISOString(),
    refundStatus: 'requested',
  }
}
