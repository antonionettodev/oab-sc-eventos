import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import type { Registration, Event } from '@/payload-types'

interface CheckInRequest {
  ticketCode: string
  scheduleItemId?: string
}

export async function POST(request: Request) {
  try {
    const body: CheckInRequest = await request.json()
    const { ticketCode, scheduleItemId } = body

    if (!ticketCode) {
      return NextResponse.json(
        { success: false, message: 'Código do ingresso é obrigatório.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    const registrations = await payload.find({
      collection: 'registrations',
      where: {
        and: [
          { paymentStatus: { equals: 'paid' } },
          { 'tickets.ticketCode': { equals: ticketCode.toUpperCase() } },
        ],
      },
      depth: 2,
      limit: 1,
    })

    if (registrations.docs.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingresso não encontrado ou pagamento não confirmado.',
        },
        { status: 404 }
      )
    }

    const registration = registrations.docs[0] as Registration
    const tickets = registration.tickets || []

    const ticket = tickets.find((t) => t.ticketCode === ticketCode.toUpperCase())

    if (!ticket) {
      return NextResponse.json(
        { success: false, message: 'Ingresso não encontrado.' },
        { status: 404 }
      )
    }

    if (ticket.ticketStatus === 'cancelled') {
      return NextResponse.json(
        { success: false, message: 'Este ingresso foi cancelado.' },
        { status: 400 }
      )
    }

    const event = registration.event as Event
    const eventId = typeof registration.event === 'number' ? registration.event : event.id

    const existingCheckIns = await payload.find({
      collection: 'check-ins',
      where: {
        and: [
          { registration: { equals: registration.id } },
          { ticketCode: { equals: ticketCode.toUpperCase() } },
          ...(scheduleItemId ? [{ scheduleItemId: { equals: scheduleItemId } }] : []),
        ],
      },
      limit: 1,
    })

    if (existingCheckIns.docs.length > 0 && !event.checkInConfig?.allowMultipleCheckIns) {
      const existingCheckIn = existingCheckIns.docs[0]
      return NextResponse.json(
        {
          success: false,
          message: `Check-in já realizado em ${new Date(existingCheckIn.createdAt).toLocaleString('pt-BR')}.`,
        },
        { status: 400 }
      )
    }

    let activityTitle: string | undefined
    if (scheduleItemId && event.schedule) {
      const scheduleItem = event.schedule.find((s) => s.id === scheduleItemId)
      activityTitle = scheduleItem?.title
    }

    const checkIn = await payload.create({
      collection: 'check-ins',
      data: {
        registration: registration.id,
        event: eventId,
        ticketCode: ticketCode.toUpperCase(),
        participantName: ticket.participantName || '',
        participantEmail: ticket.participantEmail || '',
        checkInType: scheduleItemId ? 'room' : 'event',
        checkInDate: new Date().toISOString(),
        scheduleItemId: scheduleItemId || undefined,
        activityTitle: activityTitle || undefined,
        method: 'manual',
      },
    })

    const updatedTickets = tickets.map((t) => {
      if (t.ticketCode === ticketCode.toUpperCase()) {
        return { ...t, ticketStatus: 'checked-in' as const }
      }
      return t
    })

    await payload.update({
      collection: 'registrations',
      id: registration.id,
      data: {
        tickets: updatedTickets,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Check-in realizado com sucesso!',
      data: {
        participantName: ticket.participantName,
        eventTitle: event.title,
        activityTitle,
        checkInTime: new Date(checkIn.createdAt).toLocaleString('pt-BR'),
      },
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, message: 'Erro ao processar check-in. Tente novamente.' },
      { status: 500 }
    )
  }
}
