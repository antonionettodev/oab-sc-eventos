import type { CollectionConfig } from 'payload'

export const SatisfactionSurveys: CollectionConfig = {
  slug: 'satisfaction-surveys',
  labels: {
    singular: 'Pesquisa de Satisfação',
    plural: 'Pesquisas de Satisfação',
  },
  admin: {
    useAsTitle: 'ticketCode',
    group: 'Eventos',
    defaultColumns: ['ticketCode', 'event', 'participantName', 'overallRating', 'createdAt'],
    description: 'Respostas das pesquisas de satisfação dos participantes',
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
        description: 'Evento avaliado',
      },
    },
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'registrations',
      label: 'Inscrição',
      required: true,
      admin: {
        description: 'Inscrição relacionada',
      },
    },
    {
      name: 'ticketCode',
      type: 'text',
      label: 'Código do Ingresso',
      required: true,
      index: true,
      admin: {
        description: 'Código do ingresso do participante',
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
      type: 'group',
      name: 'ratings',
      label: 'Avaliações',
      fields: [
        {
          name: 'overallRating',
          type: 'select',
          label: 'Avaliação Geral',
          required: true,
          options: [
            { label: '1 - Muito Ruim', value: '1' },
            { label: '2 - Ruim', value: '2' },
            { label: '3 - Regular', value: '3' },
            { label: '4 - Bom', value: '4' },
            { label: '5 - Excelente', value: '5' },
          ],
          admin: {
            description: 'Avaliação geral do evento',
          },
        },
        {
          name: 'contentRating',
          type: 'select',
          label: 'Conteúdo',
          required: true,
          options: [
            { label: '1 - Muito Ruim', value: '1' },
            { label: '2 - Ruim', value: '2' },
            { label: '3 - Regular', value: '3' },
            { label: '4 - Bom', value: '4' },
            { label: '5 - Excelente', value: '5' },
          ],
          admin: {
            description: 'Qualidade do conteúdo apresentado',
          },
        },
        {
          name: 'speakersRating',
          type: 'select',
          label: 'Palestrantes',
          required: true,
          options: [
            { label: '1 - Muito Ruim', value: '1' },
            { label: '2 - Ruim', value: '2' },
            { label: '3 - Regular', value: '3' },
            { label: '4 - Bom', value: '4' },
            { label: '5 - Excelente', value: '5' },
          ],
          admin: {
            description: 'Qualidade dos palestrantes',
          },
        },
        {
          name: 'organizationRating',
          type: 'select',
          label: 'Organização',
          required: true,
          options: [
            { label: '1 - Muito Ruim', value: '1' },
            { label: '2 - Ruim', value: '2' },
            { label: '3 - Regular', value: '3' },
            { label: '4 - Bom', value: '4' },
            { label: '5 - Excelente', value: '5' },
          ],
          admin: {
            description: 'Organização do evento',
          },
        },
        {
          name: 'infrastructureRating',
          type: 'select',
          label: 'Infraestrutura',
          required: false,
          options: [
            { label: '1 - Muito Ruim', value: '1' },
            { label: '2 - Ruim', value: '2' },
            { label: '3 - Regular', value: '3' },
            { label: '4 - Bom', value: '4' },
            { label: '5 - Excelente', value: '5' },
          ],
          admin: {
            description: 'Infraestrutura do local (eventos presenciais)',
          },
        },
      ],
    },
    {
      name: 'wouldRecommend',
      type: 'checkbox',
      label: 'Recomendaria o Evento',
      defaultValue: false,
      admin: {
        description: 'O participante recomendaria este evento a outros',
      },
    },
    {
      name: 'wouldParticipateAgain',
      type: 'checkbox',
      label: 'Participaria Novamente',
      defaultValue: false,
      admin: {
        description: 'O participante participaria de eventos semelhantes',
      },
    },
    {
      name: 'highlights',
      type: 'textarea',
      label: 'Pontos Positivos',
      required: false,
      admin: {
        placeholder: 'O que você mais gostou no evento?',
        description: 'Comentários sobre aspectos positivos',
      },
      maxLength: 1000,
    },
    {
      name: 'improvements',
      type: 'textarea',
      label: 'Sugestões de Melhoria',
      required: false,
      admin: {
        placeholder: 'O que poderia ser melhorado?',
        description: 'Sugestões para eventos futuros',
      },
      maxLength: 1000,
    },
    {
      name: 'additionalComments',
      type: 'textarea',
      label: 'Comentários Adicionais',
      required: false,
      admin: {
        placeholder: 'Outros comentários...',
      },
      maxLength: 1000,
    },
    {
      name: 'interestedTopics',
      type: 'textarea',
      label: 'Temas de Interesse',
      required: false,
      admin: {
        placeholder: 'Quais temas você gostaria de ver em eventos futuros?',
        description: 'Sugestões de temas para próximos eventos',
      },
      maxLength: 500,
    },
  ],
}
