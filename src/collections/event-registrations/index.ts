import type { CollectionConfig } from 'payload'
import { uppercaseTrimHook } from '@/hooks/uppercase-trim'
import { trimHook } from '@/hooks/trim'
import { removeNonNumericHook } from '@/hooks/remove-non-numeric'
import {
  validateUniqueEmailPerEvent,
  validateRegistrationOpen,
  validateParticipantScheduleConflict,
  validateActivityCapacity,
} from './validators/registration-validators'

export const EventRegistrations: CollectionConfig = {
  slug: 'event-registrations',
  labels: {
    singular: 'Inscrição de Evento',
    plural: 'Inscrições de Evento',
  },
  admin: {
    group: 'Eventos',
    useAsTitle: 'participantName',
    defaultColumns: ['participantName', 'participantEmail', 'event', 'createdAt'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'participantName',
          type: 'text',
          label: 'Nome do Participante',
          required: true,
          minLength: 2,
          maxLength: 128,
          admin: {
            placeholder: 'Digite o nome completo do participante...',
            description: 'Nome completo',
            width: '50%',
          },
          hooks: {
            beforeChange: [uppercaseTrimHook],
          },
        },
        {
          name: 'participantEmail',
          type: 'email',
          label: 'Email do Participante',
          required: true,
          admin: {
            placeholder: 'email@exemplo.com',
            description: 'Email para contato',
            width: '50%',
          },
          validate: validateUniqueEmailPerEvent,
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'participantPhone',
          type: 'text',
          label: 'Telefone do Participante',
          required: true,
          maxLength: 32,
          admin: {
            placeholder: '(00) 00000-0000',
            description: 'Telefone de contato',
            width: '50%',
          },
          hooks: {
            beforeChange: [removeNonNumericHook],
          },
        },
        {
          name: 'oabNumber',
          type: 'text',
          label: 'Número da OAB',
          maxLength: 16,
          admin: {
            placeholder: 'Ex: 12345',
            description: 'Número da OAB (opcional)',
            width: '50%',
          },
          hooks: {
            beforeChange: [trimHook],
          },
        },
      ],
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      label: 'Evento',
      required: true,
      admin: {
        description: 'Evento no qual o participante está se inscrevendo',
      },
      validate: validateRegistrationOpen,
    },
    {
      name: 'selectedActivities',
      type: 'array',
      label: 'Atividades Selecionadas',
      minRows: 1,
      required: true,
      admin: {
        description: 'Atividades que o participante deseja participar',
      },
      validate: [validateParticipantScheduleConflict, validateActivityCapacity],
      fields: [
        {
          name: 'activityId',
          type: 'text',
          label: 'ID da Atividade',
          required: true,
          admin: {
            placeholder: 'ID da atividade',
            description: 'ID da atividade do evento',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
