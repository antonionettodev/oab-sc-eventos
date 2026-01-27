import type { CollectionBeforeChangeHook } from 'payload'

interface ScheduleItem {
  id?: string
  room: string | { id: string }
  date: string
  startTime: string
  endTime: string
  speakers?: (string | { id: string })[]
}

/**
 * Validates that there are no conflicts in the event schedule:
 * 1. A room cannot be used in two activities at the same time on the same day
 * 2. A speaker cannot be in two rooms at the same time on the same day
 */
export const validateScheduleConflictsHook: CollectionBeforeChangeHook = async ({
  data,
  req,
  operation,
  originalDoc,
}) => {
  if (!data?.schedule || !Array.isArray(data.schedule) || data.schedule.length < 2) {
    return data
  }

  const schedule = data.schedule as ScheduleItem[]
  const errors: string[] = []

  // Helper to get time in minutes for comparison
  const getTimeInMinutes = (timeStr: string): number => {
    const date = new Date(timeStr)
    return date.getHours() * 60 + date.getMinutes()
  }

  // Helper to get date string for comparison
  const getDateString = (dateStr: string): string => {
    return new Date(dateStr).toISOString().split('T')[0]
  }

  // Helper to get ID from relationship
  const getId = (value: string | { id: string } | null | undefined): string | null => {
    if (!value) return null
    if (typeof value === 'string') return value
    return value.id
  }

  // Check for time overlap
  const hasTimeOverlap = (
    start1: number,
    end1: number,
    start2: number,
    end2: number,
  ): boolean => {
    return start1 < end2 && end1 > start2
  }

  // Check room conflicts
  for (let i = 0; i < schedule.length; i++) {
    const activity1 = schedule[i]
    const room1Id = getId(activity1.room)
    const date1 = getDateString(activity1.date)
    const start1 = getTimeInMinutes(activity1.startTime)
    const end1 = getTimeInMinutes(activity1.endTime)

    for (let j = i + 1; j < schedule.length; j++) {
      const activity2 = schedule[j]
      const room2Id = getId(activity2.room)
      const date2 = getDateString(activity2.date)
      const start2 = getTimeInMinutes(activity2.startTime)
      const end2 = getTimeInMinutes(activity2.endTime)

      // Check same room on same day with time overlap
      if (room1Id && room1Id === room2Id && date1 === date2) {
        if (hasTimeOverlap(start1, end1, start2, end2)) {
          errors.push(
            `Conflito de sala: A mesma sala está sendo usada em duas atividades no mesmo horário (atividades ${i + 1} e ${j + 1})`,
          )
        }
      }

      // Check speaker conflicts
      const speakers1 = activity1.speakers?.map(getId).filter(Boolean) || []
      const speakers2 = activity2.speakers?.map(getId).filter(Boolean) || []

      if (date1 === date2 && hasTimeOverlap(start1, end1, start2, end2)) {
        for (const speaker1 of speakers1) {
          if (speakers2.includes(speaker1!)) {
            errors.push(
              `Conflito de palestrante: O mesmo palestrante está em duas atividades no mesmo horário (atividades ${i + 1} e ${j + 1})`,
            )
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'))
  }

  return data
}
