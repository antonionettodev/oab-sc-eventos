import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface PagBankWebhookPayload {
  id: string
  reference_id: string
  created_at: string
  charges?: Array<{
    id: string
    reference_id: string
    status: string
    paid_at?: string
    payment_method?: {
      type: string
    }
  }>
}

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body: PagBankWebhookPayload = await request.json()

    payload.logger.info('PagBank webhook received:', JSON.stringify(body, null, 2))

    const { reference_id, charges } = body

    if (!reference_id) {
      payload.logger.error('Missing reference_id in webhook')
      return NextResponse.json({ error: 'Missing reference_id' }, { status: 400 })
    }

    const registrations = await payload.find({
      collection: 'registrations',
      where: {
        orderCode: { equals: reference_id },
      },
      limit: 1,
    })

    if (registrations.docs.length === 0) {
      payload.logger.error(`Registration not found for order: ${reference_id}`)
      return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
    }

    const registration = registrations.docs[0]

    if (charges && charges.length > 0) {
      const charge = charges[0]
      const chargeStatus = charge.status?.toUpperCase()

      let paymentStatus: 'pending' | 'waiting' | 'paid' | 'failed' | 'cancelled' | 'refunded' = 'pending'

      switch (chargeStatus) {
        case 'PAID':
        case 'AVAILABLE':
          paymentStatus = 'paid'
          break
        case 'IN_ANALYSIS':
        case 'WAITING':
        case 'AUTHORIZED':
          paymentStatus = 'waiting'
          break
        case 'DECLINED':
        case 'CANCELED':
        case 'DENIED':
          paymentStatus = 'failed'
          break
        case 'REFUNDED':
          paymentStatus = 'refunded'
          break
        default:
          paymentStatus = 'pending'
      }

      const updateData: Record<string, unknown> = {
        paymentStatus,
        paymentId: charge.id,
      }

      if (paymentStatus === 'paid' && charge.paid_at) {
        updateData.paidAt = new Date(charge.paid_at).toISOString()

        if (registration.tickets && Array.isArray(registration.tickets)) {
          updateData.tickets = registration.tickets.map((ticket: Record<string, unknown>) => ({
            ...ticket,
            ticketStatus: 'confirmed',
          }))
        }
      }

      if (charge.payment_method?.type) {
        const methodMap: Record<string, string> = {
          CREDIT_CARD: 'credit_card',
          DEBIT_CARD: 'debit_card',
          BOLETO: 'boleto',
          PIX: 'pix',
        }
        updateData.paymentMethod = methodMap[charge.payment_method.type] || charge.payment_method.type
      }

      await payload.update({
        collection: 'registrations',
        id: registration.id,
        data: updateData,
      })

      payload.logger.info(`Updated registration ${registration.id} with payment status: ${paymentStatus}`)

      if (paymentStatus === 'paid') {
        try {
          const event = typeof registration.event === 'string'
            ? await payload.findByID({ collection: 'events', id: registration.event })
            : registration.event

          if (event) {
            const ticketCount = registration.tickets?.length || 0
            await payload.update({
              collection: 'events',
              id: typeof registration.event === 'string' ? registration.event : registration.event.id,
              data: {
                currentRegistrations: (event.currentRegistrations || 0) + ticketCount,
              },
            })
          }
        } catch (error) {
          payload.logger.error('Error updating event registration count:', error)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PagBank webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'PagBank webhook endpoint' })
}
