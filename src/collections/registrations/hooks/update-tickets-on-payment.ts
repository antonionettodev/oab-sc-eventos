import type { CollectionAfterChangeHook } from 'payload'

type TicketStatus = 'pending' | 'active' | 'used' | 'cancelled' | 'refunded'
type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded'

/**
 * Updates ticket statuses when registration payment status changes
 */
export const updateTicketsOnPaymentHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Prevent infinite loops
  if (context.skipTicketUpdate) return doc

  // Check if payment status changed
  const previousPaymentStatus = previousDoc?.paymentStatus
  const currentPaymentStatus = doc.paymentStatus

  if (previousPaymentStatus === currentPaymentStatus) return doc

  // Determine the new ticket status based on payment status
  let newTicketStatus: TicketStatus | null = null

  switch (currentPaymentStatus) {
    case 'paid':
      newTicketStatus = 'active'
      break
    case 'cancelled':
    case 'failed':
      newTicketStatus = 'cancelled'
      break
    case 'refunded':
      newTicketStatus = 'refunded'
      break
    default:
      return doc
  }

  // Update all tickets associated with this registration
  try {
    await req.payload.update({
      collection: 'tickets',
      where: {
        registration: { equals: doc.id },
      },
      data: {
        status: newTicketStatus,
      },
      req,
      context: { skipTicketUpdate: true },
    })

    // Also update registration status
    let newRegistrationStatus: RegistrationStatus | null = null
    if (currentPaymentStatus === 'paid') {
      newRegistrationStatus = 'confirmed'
    } else if (currentPaymentStatus === 'cancelled' || currentPaymentStatus === 'failed') {
      newRegistrationStatus = 'cancelled'
    } else if (currentPaymentStatus === 'refunded') {
      newRegistrationStatus = 'refunded'
    }

    if (newRegistrationStatus && doc.status !== newRegistrationStatus) {
      await req.payload.update({
        collection: 'registrations',
        id: doc.id,
        data: {
          status: newRegistrationStatus,
          paidAt: currentPaymentStatus === 'paid' ? new Date().toISOString() : doc.paidAt,
        },
        req,
        context: { skipTicketUpdate: true },
      })
    }
  } catch (error) {
    req.payload.logger.error({
      msg: 'Error updating tickets after payment status change',
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}
