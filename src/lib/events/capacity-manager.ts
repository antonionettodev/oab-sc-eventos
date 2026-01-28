import type { Payload } from 'payload'

interface ScheduleItem {
  id?: string
  room: string | { id: string; capacity?: number }
  date: string
  startTime: string
  endTime: string
  title: string
  maxCapacity?: number
}

interface EventData {
  id: string
  title: string
  maxRegistrations: number
  currentRegistrations: number
  schedule?: ScheduleItem[]
  registrationStartDate?: string
  registrationEndDate?: string
  status: string
}

interface SelectedScheduleItem {
  scheduleItemId: string
  roomId: string
}

interface CapacityCheckResult {
  available: boolean
  errors: string[]
  eventCapacity?: {
    total: number
    used: number
    remaining: number
  }
  roomCapacities?: Array<{
    roomId: string
    roomTitle: string
    activityTitle: string
    total: number
    used: number
    remaining: number
  }>
}

function getRoomId(room: string | { id: string }): string {
  return typeof room === 'string' ? room : room.id
}

export async function checkEventCapacity(
  payload: Payload,
  eventId: string,
  ticketCount: number
): Promise<CapacityCheckResult> {
  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  }) as unknown as EventData

  if (!event) {
    return {
      available: false,
      errors: ['Evento não encontrado.'],
    }
  }

  if (event.status !== 'published') {
    return {
      available: false,
      errors: ['Este evento não está disponível para inscrições.'],
    }
  }

  const now = new Date()

  if (event.registrationStartDate && new Date(event.registrationStartDate) > now) {
    return {
      available: false,
      errors: ['As inscrições para este evento ainda não foram abertas.'],
    }
  }

  if (event.registrationEndDate && new Date(event.registrationEndDate) < now) {
    return {
      available: false,
      errors: ['O período de inscrições para este evento já encerrou.'],
    }
  }

  const remainingCapacity = event.maxRegistrations - (event.currentRegistrations || 0)

  if (ticketCount > remainingCapacity) {
    return {
      available: false,
      errors: [
        `Capacidade insuficiente. Restam apenas ${remainingCapacity} vagas disponíveis.`
      ],
      eventCapacity: {
        total: event.maxRegistrations,
        used: event.currentRegistrations || 0,
        remaining: remainingCapacity,
      },
    }
  }

  return {
    available: true,
    errors: [],
    eventCapacity: {
      total: event.maxRegistrations,
      used: event.currentRegistrations || 0,
      remaining: remainingCapacity,
    },
  }
}

export async function checkRoomCapacity(
  payload: Payload,
  eventId: string,
  selectedSchedule: SelectedScheduleItem[]
): Promise<CapacityCheckResult> {
  if (selectedSchedule.length === 0) {
    return { available: true, errors: [] }
  }

  const event = await payload.findByID({
    collection: 'events',
    id: eventId,
  }) as unknown as EventData

  if (!event || !event.schedule) {
    return { available: true, errors: [] }
  }

  const paidRegistrations = await payload.find({
    collection: 'registrations',
    where: {
      and: [
        { event: { equals: eventId } },
        { paymentStatus: { equals: 'paid' } },
      ],
    },
    limit: 10000,
  })

  const scheduleOccupancy: Record<string, number> = {}

  for (const registration of paidRegistrations.docs) {
    const tickets = (registration as Record<string, unknown>).tickets as Array<{
      selectedSchedule?: SelectedScheduleItem[]
    }> | undefined

    if (!tickets) continue

    for (const ticket of tickets) {
      if (!ticket.selectedSchedule) continue

      for (const schedItem of ticket.selectedSchedule) {
        const key = schedItem.scheduleItemId
        scheduleOccupancy[key] = (scheduleOccupancy[key] || 0) + 1
      }
    }
  }

  const errors: string[] = []
  const roomCapacities: CapacityCheckResult['roomCapacities'] = []

  for (const selected of selectedSchedule) {
    const scheduleItem = event.schedule.find(
      (s) => s.id === selected.scheduleItemId
    )

    if (!scheduleItem) continue

    const roomId = getRoomId(scheduleItem.room)
    let roomCapacity = scheduleItem.maxCapacity

    if (!roomCapacity && typeof scheduleItem.room === 'object') {
      roomCapacity = scheduleItem.room.capacity
    }

    if (!roomCapacity) {
      const room = await payload.findByID({
        collection: 'rooms',
        id: roomId,
      })
      roomCapacity = (room as { capacity?: number })?.capacity
    }

    if (roomCapacity) {
      const currentOccupancy = scheduleOccupancy[selected.scheduleItemId] || 0
      const remaining = roomCapacity - currentOccupancy

      roomCapacities.push({
        roomId,
        roomTitle: typeof scheduleItem.room === 'object' ?
          (scheduleItem.room as { title?: string }).title || 'Sala' :
          'Sala',
        activityTitle: scheduleItem.title,
        total: roomCapacity,
        used: currentOccupancy,
        remaining,
      })

      if (remaining <= 0) {
        errors.push(
          `A atividade "${scheduleItem.title}" está com lotação esgotada.`
        )
      }
    }
  }

  return {
    available: errors.length === 0,
    errors,
    roomCapacities,
  }
}

export async function checkTicketScheduleConflicts(
  selectedSchedule: SelectedScheduleItem[],
  eventSchedule: ScheduleItem[]
): Promise<string[]> {
  const errors: string[] = []
  const selectedItems: ScheduleItem[] = []

  for (const selected of selectedSchedule) {
    const item = eventSchedule.find(s => s.id === selected.scheduleItemId)
    if (item) {
      selectedItems.push(item)
    }
  }

  for (let i = 0; i < selectedItems.length; i++) {
    for (let j = i + 1; j < selectedItems.length; j++) {
      const item1 = selectedItems[i]
      const item2 = selectedItems[j]

      const date1 = new Date(item1.date).toISOString().split('T')[0]
      const date2 = new Date(item2.date).toISOString().split('T')[0]

      if (date1 !== date2) continue

      const start1 = timeToMinutes(item1.startTime)
      const end1 = timeToMinutes(item1.endTime)
      const start2 = timeToMinutes(item2.startTime)
      const end2 = timeToMinutes(item2.endTime)

      if (start1 < end2 && start2 < end1) {
        errors.push(
          `Conflito de horário: "${item1.title}" (${item1.startTime}-${item1.endTime}) ` +
          `sobrepõe "${item2.title}" (${item2.startTime}-${item2.endTime}).`
        )
      }
    }
  }

  return errors
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export interface DiscountGroup {
  minQuantity: number
  maxQuantity: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

export function calculateDiscount(
  totalAmount: number,
  ticketCount: number,
  discountGroups: DiscountGroup[]
): { discountAmount: number; appliedGroup: DiscountGroup | null } {
  const applicableGroup = discountGroups.find(
    group => ticketCount >= group.minQuantity && ticketCount <= group.maxQuantity
  )

  if (!applicableGroup) {
    return { discountAmount: 0, appliedGroup: null }
  }

  let discountAmount: number

  if (applicableGroup.discountType === 'percentage') {
    discountAmount = (totalAmount * applicableGroup.discountValue) / 100
  } else {
    discountAmount = applicableGroup.discountValue
  }

  discountAmount = Math.min(discountAmount, totalAmount)

  return { discountAmount, appliedGroup: applicableGroup }
}

export async function canRequestRefund(
  payload: Payload,
  registrationId: string
): Promise<{ canRefund: boolean; reason?: string }> {
  const registration = await payload.findByID({
    collection: 'registrations',
    id: registrationId,
    depth: 1,
  })

  if (!registration) {
    return { canRefund: false, reason: 'Inscrição não encontrada.' }
  }

  if (registration.paymentStatus !== 'paid') {
    return { canRefund: false, reason: 'Apenas inscrições pagas podem ser reembolsadas.' }
  }

  if (registration.refundRequested) {
    return { canRefund: false, reason: 'Já existe uma solicitação de reembolso para esta inscrição.' }
  }

  const checkIns = await payload.find({
    collection: 'check-ins',
    where: {
      registration: { equals: registrationId },
    },
    limit: 1,
  })

  if (checkIns.docs.length > 0) {
    return { canRefund: false, reason: 'Não é possível solicitar reembolso após realizar check-in.' }
  }

  const certificates = await payload.find({
    collection: 'certificates',
    where: {
      registration: { equals: registrationId },
    },
    limit: 1,
  })

  if (certificates.docs.length > 0) {
    return { canRefund: false, reason: 'Não é possível solicitar reembolso após emissão do certificado.' }
  }

  const event = typeof registration.event === 'string'
    ? await payload.findByID({ collection: 'events', id: registration.event })
    : registration.event

  if (!event) {
    return { canRefund: false, reason: 'Evento não encontrado.' }
  }

  const eventData = event as unknown as EventData
  const refundDays = (eventData as { refundDays?: number }).refundDays || 7
  const eventStartDate = new Date((eventData as { startDate?: string }).startDate || '')
  const now = new Date()
  const daysUntilEvent = Math.ceil((eventStartDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilEvent < refundDays) {
    return {
      canRefund: false,
      reason: `O prazo para solicitação de reembolso (${refundDays} dias antes do evento) já expirou.`,
    }
  }

  return { canRefund: true }
}
