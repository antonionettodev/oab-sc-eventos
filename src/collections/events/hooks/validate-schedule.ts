import type { CollectionBeforeChangeHook, Payload } from 'payload'

interface ScheduleItem {
  id?: string
  room: string | { id: string }
  date: string
  startTime: string
  endTime: string
  title: string
  speakers?: Array<string | { id: string }>
}

interface EventData {
  id?: string
  title?: string
  schedule?: ScheduleItem[]
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const start1Min = timeToMinutes(start1)
  const end1Min = timeToMinutes(end1)
  const start2Min = timeToMinutes(start2)
  const end2Min = timeToMinutes(end2)

  return start1Min < end2Min && start2Min < end1Min
}

function getRoomId(room: string | { id: string }): string {
  return typeof room === 'string' ? room : room.id
}

function getSpeakerIds(speakers?: Array<string | { id: string }>): string[] {
  if (!speakers) return []
  return speakers.map(s => typeof s === 'string' ? s : s.id)
}

async function checkRoomConflictsWithOtherEvents(
  payload: Payload,
  eventId: string | undefined,
  schedule: ScheduleItem[]
): Promise<string[]> {
  const errors: string[] = []

  for (const item of schedule) {
    const roomId = getRoomId(item.room)
    const itemDate = new Date(item.date).toISOString().split('T')[0]

    const otherEvents = await payload.find({
      collection: 'events',
      where: {
        and: [
          { id: { not_equals: eventId || '' } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
      limit: 100,
    })

    for (const otherEvent of otherEvents.docs) {
      const otherSchedule = (otherEvent as unknown as EventData).schedule || []

      for (const otherItem of otherSchedule) {
        const otherRoomId = getRoomId(otherItem.room)
        const otherDate = new Date(otherItem.date).toISOString().split('T')[0]

        if (
          otherRoomId === roomId &&
          otherDate === itemDate &&
          timesOverlap(item.startTime, item.endTime, otherItem.startTime, otherItem.endTime)
        ) {
          errors.push(
            `A sala está ocupada: "${item.title}" conflita com "${otherItem.title}" ` +
            `do evento "${otherEvent.title}" no dia ${itemDate} das ${otherItem.startTime} às ${otherItem.endTime}.`
          )
        }
      }
    }
  }

  return errors
}

async function checkSpeakerConflictsWithOtherEvents(
  payload: Payload,
  eventId: string | undefined,
  schedule: ScheduleItem[]
): Promise<string[]> {
  const errors: string[] = []

  for (const item of schedule) {
    const speakerIds = getSpeakerIds(item.speakers)
    if (speakerIds.length === 0) continue

    const itemDate = new Date(item.date).toISOString().split('T')[0]

    const otherEvents = await payload.find({
      collection: 'events',
      where: {
        and: [
          { id: { not_equals: eventId || '' } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
      limit: 100,
    })

    for (const otherEvent of otherEvents.docs) {
      const otherSchedule = (otherEvent as unknown as EventData).schedule || []

      for (const otherItem of otherSchedule) {
        const otherSpeakerIds = getSpeakerIds(otherItem.speakers)
        const otherDate = new Date(otherItem.date).toISOString().split('T')[0]

        if (otherDate !== itemDate) continue

        const conflictingSpeakers = speakerIds.filter(id => otherSpeakerIds.includes(id))

        if (
          conflictingSpeakers.length > 0 &&
          timesOverlap(item.startTime, item.endTime, otherItem.startTime, otherItem.endTime)
        ) {
          const speakersInfo = await payload.find({
            collection: 'speakers',
            where: { id: { in: conflictingSpeakers } },
            limit: conflictingSpeakers.length,
          })

          const speakerNames = speakersInfo.docs.map(s => s.name).join(', ')

          errors.push(
            `Conflito de palestrante: ${speakerNames} já está(ão) alocado(s) na atividade ` +
            `"${otherItem.title}" do evento "${otherEvent.title}" no mesmo horário.`
          )
        }
      }
    }
  }

  return errors
}

function checkInternalScheduleConflicts(schedule: ScheduleItem[]): string[] {
  const errors: string[] = []

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const item1 = schedule[i]
      const item2 = schedule[j]

      const date1 = new Date(item1.date).toISOString().split('T')[0]
      const date2 = new Date(item2.date).toISOString().split('T')[0]

      if (date1 !== date2) continue

      if (!timesOverlap(item1.startTime, item1.endTime, item2.startTime, item2.endTime)) continue

      const room1Id = getRoomId(item1.room)
      const room2Id = getRoomId(item2.room)

      if (room1Id === room2Id) {
        errors.push(
          `Conflito interno: A mesma sala está alocada para "${item1.title}" e "${item2.title}" ` +
          `no mesmo horário (${date1} ${item1.startTime}-${item1.endTime}).`
        )
      }

      const speakers1 = getSpeakerIds(item1.speakers)
      const speakers2 = getSpeakerIds(item2.speakers)
      const conflictingSpeakers = speakers1.filter(id => speakers2.includes(id))

      if (conflictingSpeakers.length > 0) {
        errors.push(
          `Conflito interno: Palestrante(s) alocado(s) em "${item1.title}" e "${item2.title}" ` +
          `no mesmo horário (${date1} ${item1.startTime}-${item1.endTime}).`
        )
      }
    }
  }

  return errors
}

export const validateScheduleHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
}) => {
  const schedule = data.schedule as ScheduleItem[] | undefined
  if (!schedule || schedule.length === 0) return data

  const errors: string[] = []

  const internalErrors = checkInternalScheduleConflicts(schedule)
  errors.push(...internalErrors)

  const eventId = originalDoc?.id as string | undefined

  const roomErrors = await checkRoomConflictsWithOtherEvents(req.payload, eventId, schedule)
  errors.push(...roomErrors)

  const speakerErrors = await checkSpeakerConflictsWithOtherEvents(req.payload, eventId, schedule)
  errors.push(...speakerErrors)

  if (errors.length > 0) {
    throw new Error(`Conflitos de programação encontrados:\n\n${errors.join('\n\n')}`)
  }

  return data
}
