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
    description: 'Salas disponíveis para realização de eventos e atividades',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título da Sala',
      required: true,
      admin: {
        placeholder: 'Ex: Auditório Principal',
        description: 'Nome de identificação da sala',
      },
      maxLength: 100,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrição',
      required: false,
      admin: {
        placeholder: 'Descreva as características da sala...',
        description: 'Informações adicionais sobre a sala',
      },
      maxLength: 500,
    },
    {
      name: 'capacity',
      type: 'number',
      label: 'Capacidade Máxima',
      required: true,
      min: 1,
      max: 10000,
      admin: {
        placeholder: '100',
        description: 'Número máximo de pessoas que a sala comporta',
        step: 1,
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Localização',
      required: false,
      admin: {
        placeholder: 'Ex: 2º Andar, Bloco A',
        description: 'Localização física da sala no prédio',
      },
      maxLength: 200,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Sala Ativa',
      defaultValue: true,
      admin: {
        description: 'Desmarque para desativar a sala',
        position: 'sidebar',
      },
    },
    createdByField,
    editedByField,
  ],
}
