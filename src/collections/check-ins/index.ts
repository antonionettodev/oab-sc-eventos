import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'

export const CheckIns: CollectionConfig = {
  slug: 'check-ins',
  labels: {
    singular: 'Check-in',
    plural: 'Check-ins',
  },
  admin: {
    useAsTitle: 'ticketCode',
    group: 'Eventos',
    defaultColumns: ['ticketCode', 'event', 'participantName', 'checkInType', 'createdAt'],
    description: 'Registros de presença e check-in nos eventos',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return false
    },
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      label: 'Evento',
      required: true,
      admin: {
        description: 'Evento relacionado ao check-in',
      },
    },
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'registrations',
      label: 'Inscrição',
      required: true,
      admin: {
        description: 'Inscrição/pedido relacionado',
      },
    },
    {
      name: 'ticketCode',
      type: 'text',
      label: 'Código do Ingresso',
      required: true,
      index: true,
      admin: {
        description: 'Código do ingresso que fez check-in',
      },
    },
    {
      name: 'participantName',
      type: 'text',
      label: 'Nome do Participante',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'participantEmail',
      type: 'email',
      label: 'E-mail do Participante',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'checkInType',
      type: 'select',
      label: 'Tipo de Check-in',
      required: true,
      options: [
        { label: 'Evento (geral)', value: 'event' },
        { label: 'Dia específico', value: 'day' },
        { label: 'Sala/Atividade', value: 'room' },
      ],
      admin: {
        description: 'Tipo do check-in realizado',
      },
    },
    {
      name: 'checkInDate',
      type: 'date',
      label: 'Data do Check-in',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
        description: 'Data em que o check-in foi realizado',
      },
    },
    {
      name: 'scheduleItemId',
      type: 'text',
      label: 'ID da Atividade',
      required: false,
      admin: {
        description: 'ID da atividade (para check-in por sala)',
        condition: (data) => data?.checkInType === 'room',
      },
    },
    {
      name: 'roomId',
      type: 'text',
      label: 'ID da Sala',
      required: false,
      admin: {
        description: 'ID da sala (para check-in por sala)',
        condition: (data) => data?.checkInType === 'room',
      },
    },
    {
      name: 'roomTitle',
      type: 'text',
      label: 'Sala',
      required: false,
      admin: {
        readOnly: true,
        condition: (data) => data?.checkInType === 'room',
      },
    },
    {
      name: 'activityTitle',
      type: 'text',
      label: 'Atividade',
      required: false,
      admin: {
        readOnly: true,
        condition: (data) => data?.checkInType === 'room',
      },
    },
    {
      name: 'method',
      type: 'select',
      label: 'Método',
      required: true,
      options: [
        { label: 'QR Code (pelo participante)', value: 'qr_self' },
        { label: 'QR Code (por funcionário)', value: 'qr_staff' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: {
        description: 'Como o check-in foi realizado',
      },
    },
    {
      name: 'deviceInfo',
      type: 'text',
      label: 'Informações do Dispositivo',
      required: false,
      admin: {
        readOnly: true,
        description: 'User agent do dispositivo usado',
      },
    },
    {
      name: 'ipAddress',
      type: 'text',
      label: 'Endereço IP',
      required: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Observações',
      required: false,
      admin: {
        description: 'Anotações sobre o check-in',
      },
    },
    createdByField,
  ],
  hooks: {
    afterChange: [
      async ({ doc, req, operation }) => {
        if (operation === 'create') {
          // Atualizar status do ingresso para checked-in
          try {
            const registration = await req.payload.findByID({
              collection: 'registrations',
              id: typeof doc.registration === 'string' ? doc.registration : doc.registration.id,
              req,
            })

            if (registration && registration.tickets) {
              const updatedTickets = registration.tickets.map((ticket: Record<string, unknown>) => {
                if (ticket.ticketCode === doc.ticketCode) {
                  return {
                    ...ticket,
                    ticketStatus: 'checked-in',
                  }
                }
                return ticket
              })

              await req.payload.update({
                collection: 'registrations',
                id: registration.id,
                data: {
                  tickets: updatedTickets,
                },
                req,
              })
            }
          } catch (error) {
            console.error('Error updating ticket status after check-in:', error)
          }
        }
        return doc
      },
    ],
  },
}
