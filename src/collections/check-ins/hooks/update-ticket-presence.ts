import type { CollectionAfterChangeHook } from 'payload'

/**
 * Updates the ticket presence data after a check-in is created
 */
export const updateTicketPresenceHook: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
  context,
}) => {
  // Only process new check-ins
  if (operation !== 'create') return doc

  // Prevent infinite loops
  if (context.skipPresenceUpdate) return doc

  const ticketId = typeof doc.ticket === 'string' ? doc.ticket : doc.ticket?.id

  if (!ticketId) return doc

  try {
    // Get the current ticket
    const ticket = await req.payload.findByID({
      collection: 'tickets',
      id: ticketId,
      req,
    })

    if (!ticket) return doc

    // Count total check-ins for this ticket
    const checkInCount = await req.payload.count({
      collection: 'check-ins',
      where: {
        ticket: { equals: ticketId },
      },
      req,
    })

    // Calculate attendance percentage
    // Get the event to check schedule items
    const eventId = typeof doc.event === 'string' ? doc.event : doc.event?.id
    let attendancePercentage = 0

    if (eventId) {
      const event = await req.payload.findByID({
        collection: 'events',
        id: eventId,
        req,
      })

      if (event?.schedule && Array.isArray(event.schedule)) {
        // Get unique days in the schedule
        const uniqueDays = new Set(
          event.schedule.map((item: { date: string }) =>
            new Date(item.date).toISOString().split('T')[0],
          ),
        )

        // Count unique check-in days
        const checkIns = await req.payload.find({
          collection: 'check-ins',
          where: {
            ticket: { equals: ticketId },
          },
          req,
        })

        const checkedInDays = new Set(
          checkIns.docs.map((checkIn) =>
            new Date(checkIn.date).toISOString().split('T')[0],
          ),
        )

        // Calculate percentage based on days
        if (uniqueDays.size > 0) {
          attendancePercentage = Math.round((checkedInDays.size / uniqueDays.size) * 100)
        }
      }
    }

    // Update ticket with presence data
    await req.payload.update({
      collection: 'tickets',
      id: ticketId,
      data: {
        hasCheckedIn: true,
        checkInCount: checkInCount.totalDocs,
        attendancePercentage,
      },
      req,
      context: { skipPresenceUpdate: true },
    })
  } catch (error) {
    req.payload.logger.error({
      msg: 'Error updating ticket presence',
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}
