'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { createEventCheckout, getCheckoutPayLink } from '@/lib/events/pagbank'
import { getServerSideURL } from '@/lib/get-urls'
import type { Event, Registration } from '@/payload-types'

interface BuyerData {
  name: string
  email: string
  phone: string
  cpf: string
  cep: string
  street: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
}

interface ScheduleItemData {
  scheduleItemId: string
  roomId: string
  roomTitle: string
  activityTitle: string
  date: string
  startTime: string
  endTime: string
}

interface TicketData {
  participantName: string
  participantEmail: string
  participantPhone: string
  participantOab: string
  categoryId: string
  categoryTitle: string
  categoryPrice: number
  selectedScheduleItems: ScheduleItemData[]
  isBuyer: boolean
}

interface CreateRegistrationInput {
  eventId: string
  buyer: BuyerData
  tickets: TicketData[]
  totalAmount: number
  discountAmount: number
  finalAmount: number
}

interface CreateRegistrationResult {
  success: boolean
  checkoutUrl?: string
  error?: string
}

export async function createRegistration(
  input: CreateRegistrationInput
): Promise<CreateRegistrationResult> {
  try {
    const payload = await getPayload({ config })
    const baseUrl = getServerSideURL()

    const event = await payload.findByID({
      collection: 'events',
      id: Number(input.eventId),
    })

    if (!event) {
      return { success: false, error: 'Evento não encontrado' }
    }

    if (event.status !== 'published') {
      return { success: false, error: 'Evento não está disponível para inscrições' }
    }

    const availableSpots =
      (event.maxRegistrations as number) - ((event.currentRegistrations as number) || 0)

    if (input.tickets.length > availableSpots) {
      return {
        success: false,
        error: `Não há vagas suficientes. Disponíveis: ${availableSpots}`,
      }
    }

    const ticketsData = input.tickets.map((ticket) => ({
      ticketCode: '',
      participantName: ticket.participantName.toUpperCase(),
      participantEmail: ticket.participantEmail.toLowerCase(),
      participantPhone: ticket.participantPhone,
      participantOab: ticket.participantOab?.toUpperCase() || '',
      categoryId: ticket.categoryId,
      categoryTitle: ticket.categoryTitle,
      categoryPrice: ticket.categoryPrice,
      selectedSchedule: ticket.selectedScheduleItems,
      ticketStatus: 'pending' as const,
      isBuyer: ticket.isBuyer,
    }))

    const registrationData = {
      event: Number(input.eventId),
      buyerName: input.buyer.name.toUpperCase(),
      buyerEmail: input.buyer.email.toLowerCase(),
      buyerPhone: input.buyer.phone,
      buyerCpf: input.buyer.cpf,
      buyerAddress: {
        cep: input.buyer.cep,
        street: input.buyer.street.toUpperCase(),
        number: input.buyer.number,
        complement: input.buyer.complement?.toUpperCase() || '',
        neighborhood: input.buyer.neighborhood.toUpperCase(),
        city: input.buyer.city.toUpperCase(),
        state: input.buyer.state as Registration['buyerAddress']['state'],
      },
      tickets: ticketsData,
      totalAmount: input.totalAmount,
      discountAmount: input.discountAmount,
      finalAmount: input.finalAmount,
      paymentStatus: 'pending' as const,
    }

    const registration = await payload.create({
      collection: 'registrations',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: registrationData as any,
    })

    if (input.finalAmount === 0) {
      await payload.update({
        collection: 'registrations',
        id: registration.id,
        data: {
          paymentStatus: 'paid',
          paidAt: new Date().toISOString(),
          tickets: ticketsData.map((t) => ({
            ...t,
            ticketStatus: 'confirmed' as const,
          })),
        },
      })

      await payload.update({
        collection: 'events',
        id: Number(input.eventId),
        data: {
          currentRegistrations:
            ((event.currentRegistrations as number) || 0) + input.tickets.length,
        },
      })

      return {
        success: true,
        checkoutUrl: `${baseUrl}/eventos/confirmacao?order=${registration.orderCode}`,
      }
    }

    const checkoutResponse = await createEventCheckout({
      orderCode: registration.orderCode as string,
      buyerName: input.buyer.name,
      buyerEmail: input.buyer.email,
      buyerCpf: input.buyer.cpf,
      buyerPhone: input.buyer.phone,
      items: input.tickets.map((ticket) => ({
        ticketCode: '',
        categoryTitle: ticket.categoryTitle,
        participantName: ticket.participantName,
        price: ticket.categoryPrice,
      })),
      discountAmount: input.discountAmount > 0 ? input.discountAmount : undefined,
      redirectUrl: `${baseUrl}/eventos/confirmacao?order=${registration.orderCode}`,
      notificationUrl: `${baseUrl}/api/webhooks/pagbank`,
    })

    const checkoutUrl = getCheckoutPayLink(checkoutResponse)

    await payload.update({
      collection: 'registrations',
      id: registration.id,
      data: {
        checkoutId: checkoutResponse.id,
        checkoutUrl: checkoutUrl || undefined,
        paymentStatus: 'waiting',
      },
    })

    if (!checkoutUrl) {
      return { success: false, error: 'Erro ao gerar link de pagamento' }
    }

    return { success: true, checkoutUrl }
  } catch (error) {
    console.error('Error creating registration:', error)
    return {
      success: false,
      error: 'Erro ao processar inscrição. Tente novamente.',
    }
  }
}
