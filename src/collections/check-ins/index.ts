import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { validateCheckInHook } from './hooks/validate-check-in'
import { updateTicketPresenceHook } from './hooks/update-ticket-presence'

export const CheckIns: CollectionConfig = {
  slug: 'check-ins',
  labels: {
    singular: 'Check-in',
    plural: 'Check-ins',
  },
  admin: {
    useAsTitle: 'id',
    group: 'Eventos',
    defaultColumns: ['ticket', 'event', 'type', 'room', 'createdAt'],
  },
  fields: [
    {
      name: 'ticket',
      type: 'relationship',
      label: 'Ingresso',
      relationTo: 'tickets',
      required: true,
      admin: {
        description: 'Ingresso do participante',
      },
    },
    {
      name: 'event',
      type: 'relationship',
      label: 'Evento',
      relationTo: 'events',
      required: true,
      admin: {
        description: 'Evento do check-in',
      },
    },
    {
      name: 'type',
      type: 'select',
      label: 'Tipo de Check-in',
      required: true,
      defaultValue: 'event',
      options: [
        { label: 'Evento (Geral)', value: 'event' },
        { label: 'Dia', value: 'day' },
        { label: 'Sala', value: 'room' },
      ],
      admin: {
        description: 'Tipo do check-in realizado',
      },
    },
    {
      name: 'room',
      type: 'relationship',
      label: 'Sala',
      relationTo: 'rooms',
      admin: {
        condition: (data) => data.type === 'room',
        description: 'Sala do check-in (se aplicável)',
      },
    },
    {
      name: 'scheduleId',
      type: 'text',
      label: 'ID da Atividade',
      admin: {
        condition: (data) => data.type === 'room',
        description: 'Identificador da atividade na programação',
      },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Data do Check-in',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'dd/MM/yyyy',
        },
      },
    },
    {
      name: 'checkedInAt',
      type: 'date',
      label: 'Data e Hora do Check-in',
      required: true,
      admin: {
        readOnly: true,
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm:ss',
        },
      },
    },
    {
      name: 'method',
      type: 'select',
      label: 'Método de Check-in',
      required: true,
      defaultValue: 'qr_code',
      options: [
        { label: 'QR Code', value: 'qr_code' },
        { label: 'Código Manual', value: 'manual_code' },
        { label: 'Busca Manual', value: 'manual_search' },
      ],
      admin: {
        description: 'Como o check-in foi realizado',
      },
    },
    {
      name: 'deviceInfo',
      type: 'text',
      label: 'Informações do Dispositivo',
      admin: {
        readOnly: true,
        description: 'Informações do dispositivo que realizou o check-in',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Observações',
      admin: {
        description: 'Notas adicionais sobre o check-in',
      },
    },
    createdByField,
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Set checkedInAt timestamp for new check-ins
        if (operation === 'create' && !data?.checkedInAt) {
          return {
            ...data,
            checkedInAt: new Date().toISOString(),
          }
        }
        return data
      },
    ],
    beforeChange: [validateCheckInHook],
    afterChange: [updateTicketPresenceHook],
  },
}
