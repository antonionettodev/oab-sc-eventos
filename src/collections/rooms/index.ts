import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'

export const Rooms: CollectionConfig = {
  slug: 'rooms',
  labels: {
    singular: 'Sala',
    plural: 'Salas',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Eventos',
    defaultColumns: ['title', 'capacity', 'createdAt'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
      maxLength: 128,
      admin: {
        placeholder: 'Ex: Auditório Principal, Sala 1, etc.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrição',
      admin: {
        placeholder: 'Descreva a sala, localização, recursos disponíveis, etc.',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      label: 'Capacidade Máxima',
      required: true,
      min: 1,
      admin: {
        placeholder: 'Número máximo de pessoas',
        description: 'Capacidade máxima de participantes na sala',
      },
    },
    createdByField,
    editedByField,
  ],
}
