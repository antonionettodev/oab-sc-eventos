import type { CollectionConfig } from 'payload'
import { uppercaseTrimHook } from '@/hooks/uppercase-trim'
import { trimHook } from '@/hooks/trim'

export const EventRooms: CollectionConfig = {
  slug: 'event-rooms',
  labels: {
    singular: 'Sala de Evento',
    plural: 'Salas de Evento',
  },
  admin: {
    group: 'Eventos',
    useAsTitle: 'title',
    defaultColumns: ['title', 'capacity', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título da Sala',
      required: true,
      minLength: 4,
      maxLength: 64,
      admin: {
        placeholder: 'Digite o título da sala...',
        description: 'Nome identificador da sala de evento',
      },
      hooks: {
        beforeChange: [uppercaseTrimHook],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrição da Sala',
      maxLength: 512,
      admin: {
        placeholder: 'Digite uma descrição opcional da sala...',
        description: 'Informações adicionais sobre a sala',
      },
      hooks: {
        beforeChange: [trimHook],
      },
    },
    {
      name: 'capacity',
      type: 'number',
      label: 'Capacidade da Sala',
      required: true,
      min: 1,
      admin: {
        placeholder: '0',
        description: 'Número máximo de pessoas que a sala comporta',
      },
      validate: (value) => {
        if (typeof value === 'number' && value <= 0) {
          return 'A capacidade deve ser maior que 0'
        }
        return true
      },
    },
  ],
  timestamps: true,
}
