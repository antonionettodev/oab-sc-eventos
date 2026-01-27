import type { CollectionAfterChangeHook } from 'payload'

/**
 * Checks and updates certificate eligibility when ticket data changes
 */
export const checkCertificateEligibilityHook: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Prevent infinite loops
  if (context.skipEligibilityCheck) return doc

  // Check if relevant fields changed
  const relevantFieldsChanged =
    doc.attendancePercentage !== previousDoc?.attendancePercentage ||
    doc.surveyCompleted !== previousDoc?.surveyCompleted

  if (!relevantFieldsChanged) return doc

  // Get the event to check certificate config
  const eventId = typeof doc.event === 'string' ? doc.event : doc.event?.id

  if (!eventId) return doc

  try {
    const event = await req.payload.findByID({
      collection: 'events',
      id: eventId,
      req,
    })

    if (!event || !event.hasCertificate) return doc

    const config = event.certificateConfig as {
      minimumAttendancePercentage?: number
      requiresSurvey?: boolean
    } | null

    // Check eligibility
    let isEligible = true

    // Check attendance percentage
    if (config?.minimumAttendancePercentage) {
      if ((doc.attendancePercentage || 0) < config.minimumAttendancePercentage) {
        isEligible = false
      }
    }

    // Check survey requirement
    if (config?.requiresSurvey && !doc.surveyCompleted) {
      isEligible = false
    }

    // Update eligibility if changed
    if (doc.certificateEligible !== isEligible) {
      await req.payload.update({
        collection: 'tickets',
        id: doc.id,
        data: {
          certificateEligible: isEligible,
        },
        req,
        context: { skipEligibilityCheck: true },
      })
    }
  } catch (error) {
    req.payload.logger.error({
      msg: 'Error checking certificate eligibility',
      error: error instanceof Error ? error.message : String(error),
    })
  }

  return doc
}
